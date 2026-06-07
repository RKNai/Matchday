/**
 * MatchDay - FIFA World Cup 2026 Interactive Scripting
 * Handles:
 * 1. Mobile/Desktop Split-Screen Resizing (touch + mouse)
 * 2. World Cup Match Simulation Engine (Live updates)
 * 3. Team Alerts Subscription State (localStorage)
 * 4. Custom Sliding Toast & Native Notification Dispatchers
 * 5. PWA Installation & Service Worker Integration
 * 6. Dynamic Modal Overlays and UI Tabs/Filters
 */

// --- Global App State ---
const state = {
  subscribedTeams: new Set(JSON.parse(localStorage.getItem('matchday_subs')) || JSON.parse(localStorage.getItem('mundiapp_subs')) || []),
  isNativePushEnabled: Notification.permission === 'granted',
  activeTab: 'all',
  activeGroupStandings: 'Group A',
  activeNewsCategory: 'all',
  activeModalTab: 'timeline',
  activeModalMatchId: null,
  activeLineupTeam: 'home',
  lang: localStorage.getItem('matchday_lang') || 'en',
  matches: [
    {
      id: 1,
      stage: 'Group A • Match #1',
      home: 'Mexico',
      homeFlag: '🇲🇽',
      away: 'South Africa',
      awayFlag: '🇿🇦',
      homeScore: 1,
      awayScore: 0,
      status: 'live',
      minute: 32,
      events: [
        { minute: 24, team: 'Mexico', type: 'goal', desc: 'Santiago Giménez ⚽ (Spectacular volley, Assist: Edson Álvarez)' }
      ],
      stats: {
        possession: [55, 45],
        shots: [8, 4],
        fouls: [6, 7],
        corners: [3, 2]
      },
      lineups: {
        home: ["Ochoa", "Montes", "Vásquez", "Gallardo", "Sánchez", "Edson Álvarez", "Chávez", "Pineda", "Lozano", "Giménez", "Antuna"],
        away: ["Williams", "Mudau", "Mvala", "Kekana", "Modiba", "Mokoena", "Sithole", "Zwane", "Morena", "Tau", "Makgopa"]
      }
    },
    {
      id: 2,
      stage: 'Group A • Match #2',
      home: 'Korea Republic',
      homeFlag: '🇰🇷',
      away: 'Czechia',
      awayFlag: '🇨🇿',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      minute: 0,
      events: [],
      stats: { possession: [50, 50], shots: [0, 0], fouls: [0, 0], corners: [0, 0] },
      lineups: {
        home: ["Jo", "Kim Min-jae", "Jung", "Seol", "Lee Ki-je", "Hwang In-beom", "Park", "Lee Kang-in", "Son Heung-min", "Hwang Hee-chan", "Cho"],
        away: ["Stanek", "Holes", "Hranac", "Krejci", "Coufal", "Soucek", "Provod", "Doudera", "Barak", "Hlozek", "Schick"]
      }
    },
    {
      id: 3,
      stage: 'Group B • Match #3',
      home: 'Canada',
      homeFlag: '🇨🇦',
      away: 'Bosnia and Herzegovina',
      awayFlag: '🇧🇦',
      homeScore: 2,
      awayScore: 1,
      status: 'live',
      minute: 76,
      events: [
        { minute: 18, team: 'Canada', type: 'goal', desc: 'Jonathan David ⚽ (Assist: Alphonso Davies)' },
        { minute: 44, team: 'Bosnia and Herzegovina', type: 'goal', desc: 'Edin Džeko ⚽ (Header, Assist: Amar Dedić)' },
        { minute: 58, team: 'Canada', type: 'goal', desc: 'Tajon Buchanan ⚽ (Assist: Stephen Eustáquio)' }
      ],
      stats: {
        possession: [55, 45],
        shots: [8, 4],
        fouls: [6, 7],
        corners: [3, 2]
      },
      lineups: {
        home: ["Crepeau", "Johnston", "Miller", "Bombito", "Davies", "Eustaquio", "Kone", "Buchanan", "Jonathan David", "Larin", "Millar"],
        away: ["Džeko", "Demirović", "Kolašinac", "Krunić", "Pirić", "Hadžikadunić", "Ahmedhodžić", "Gazibegović", "Gigović", "Hajradinović", "Tabaković"]
      }
    },
    {
      id: 4,
      stage: 'Group D • Match #4',
      home: 'USA',
      homeFlag: '🇺🇸',
      away: 'Paraguay',
      awayFlag: '🇵🇾',
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      minute: 0,
      events: [],
      stats: {
        possession: [50, 50],
        shots: [0, 0],
        fouls: [0, 0],
        corners: [0, 0]
      },
      lineups: {
        home: ["Turner", "Dest", "Richards", "Ream", "Robinson", "McKennie", "Adams", "Musah", "Weah", "Balogun", "Pulisic"],
        away: ["Coronel", "Balbuena", "Alderete", "Espinoza", "Caceres", "Cubas", "Villasanti", "Diego Gomez", "Almiron", "Enciso", "Sanabria"]
      }
    }
  ],
  news: [
    // English
    {
      id: 1,
      category: 'injury',
      title: "Mbappé doubtful for opening match against Canada",
      snippet: "France's talisman suffered a mild calf strain during training. The medical team is working round the clock to assess his fitness, but reports indicate Deschamps will not risk him.",
      time: '10m ago',
      color: 'linear-gradient(135deg, #ef4444, #7f1d1d)',
      overlay: '🩺',
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop",
      source: "L'Équipe",
      lang: "en"
    },
    {
      id: 2,
      category: 'lineup',
      title: "Canada names starting XI to face France",
      snippet: "Coach Jesse Marsch confirms a bold 4-3-3 formation featuring Alphonso Davies in a highly advanced wing role, aiming to shock the French defense with absolute raw pace.",
      time: '1h ago',
      color: 'linear-gradient(135deg, #3b82f6, #1e3a8a)',
      overlay: '📋',
      image: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=500&auto=format&fit=crop",
      source: "CBC Sports",
      lang: "en"
    },
    {
      id: 3,
      category: 'tactics',
      title: "Tactical breakdown: How Japan plan to halt Messi",
      snippet: "Moriyasu's side is drilling a high-pressing mid-block scheme to restrict spaces between Japan's lines, suffocating Argentina's playmaker and initiating swift counter-attacks.",
      time: '3h ago',
      color: 'linear-gradient(135deg, #f59e0b, #78350f)',
      overlay: '⚽',
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop",
      source: "ESPN FC",
      lang: "en"
    },
    {
      id: 4,
      category: 'injury',
      title: "German midfielder Kroos fully fit after knock",
      snippet: "Great news for Nagelsmann as Toni Kroos completes full training session. The midfield mastermind is set to start against Mexico tonight in Vancouver.",
      time: '5h ago',
      color: 'linear-gradient(135deg, #ef4444, #7f1d1d)',
      overlay: '🩺',
      image: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=500&auto=format&fit=crop",
      source: "Sky Sports",
      lang: "en"
    },
    // Spanish
    {
      id: 5,
      category: 'injury',
      title: "Mbappé, seria duda para el partido de debut contra Canadá",
      snippet: "La estrella de la selección francesa sufrió una contractura en el gemelo durante la sesión de entrenamiento. Deschamps se muestra cauto sobre su participación.",
      time: '10m ago',
      color: 'linear-gradient(135deg, #ef4444, #7f1d1d)',
      overlay: '🩺',
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop",
      source: "L'Équipe",
      lang: "es"
    },
    {
      id: 6,
      category: 'lineup',
      title: "Canadá confirma su once inicial para enfrentarse a Francia",
      snippet: "El seleccionador Jesse Marsch apuesta por un ofensivo esquema 4-3-3 con Alphonso Davies actuando de extremo para buscar la velocidad al contragolpe.",
      time: '1h ago',
      color: 'linear-gradient(135deg, #3b82f6, #1e3a8a)',
      overlay: '📋',
      image: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=500&auto=format&fit=crop",
      source: "CBC Sports",
      lang: "es"
    },
    {
      id: 7,
      category: 'tactics',
      title: "Análisis táctico: Cómo planea Japón frenar a Messi",
      snippet: "El equipo de Moriyasu está ensayando un bloque medio de presión alta para restringir los espacios entre líneas y ahogar al creador de juego de Argentina.",
      time: '3h ago',
      color: 'linear-gradient(135deg, #f59e0b, #78350f)',
      overlay: '⚽',
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop",
      source: "ESPN FC",
      lang: "es"
    },
    {
      id: 8,
      category: 'injury',
      title: "El centrocampista alemán Kroos, totalmente recuperado",
      snippet: "Excelentes noticias para Nagelsmann, ya que Toni Kroos completó la sesión de entrenamiento. El cerebro del equipo será titular contra México en Vancouver.",
      time: '5h ago',
      color: 'linear-gradient(135deg, #ef4444, #7f1d1d)',
      overlay: '🩺',
      image: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=500&auto=format&fit=crop",
      source: "Sky Sports",
      lang: "es"
    },
    // Catalan
    {
      id: 9,
      category: 'injury',
      title: "Mbappé, seriosos dubtes de cara al debut contra el Canadà",
      snippet: "L'estrella francesa ha patit una contractura al bessó en l'entrenament d'aquest matí. Deschamps no voldrà arriscar la seva presència al primer partit.",
      time: '10m ago',
      color: 'linear-gradient(135deg, #ef4444, #7f1d1d)',
      overlay: '🩺',
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop",
      source: "L'Équipe",
      lang: "ca"
    },
    {
      id: 10,
      category: 'lineup',
      title: "El Canadà fa oficial l'onze inicial per jugar contra França",
      snippet: "El seleccionador Jesse Marsch confirma un dibuix molt atrevit (4-3-3) amb Alphonso Davies en posicions d'extrem per mirar de sorprendre els francesos.",
      time: '1h ago',
      color: 'linear-gradient(135deg, #3b82f6, #1e3a8a)',
      overlay: '📋',
      image: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=500&auto=format&fit=crop",
      source: "CBC Sports",
      lang: "ca"
    },
    {
      id: 11,
      category: 'tactics',
      title: "Anàlisi tàctica: Com planeja el Japó frenar Messi",
      snippet: "El conjunt de Moriyasu està assajant un bloc mitjà de pressió alta per restringir els espais entre línies i ofegar el creador de joc de l'Argentina.",
      time: '3h ago',
      color: 'linear-gradient(135deg, #f59e0b, #78350f)',
      overlay: '⚽',
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop",
      source: "ESPN FC",
      lang: "ca"
    },
    {
      id: 12,
      category: 'injury',
      title: "El migcampista alemany Kroos, recuperat per complet",
      snippet: "Bones notícies per a Nagelsmann, ja que Toni Kroos s'ha entrenat amb normalitat. El cervell de la selecció serà titular contra Mèxic a Vancouver.",
      time: '5h ago',
      color: 'linear-gradient(135deg, #ef4444, #7f1d1d)',
      overlay: '🩺',
      image: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=500&auto=format&fit=crop",
      source: "Sky Sports",
      lang: "ca"
    }
  ]
};

// --- Translation Dictionary & Localization System ---
const translations = {
  en: {
    live_ticker: 'Live Ticker',
    tracking_subs: 'Tracking Subscriptions',
    btn_install: 'Install App',
    match_center: 'Match Center',
    tab_all: 'All',
    tab_live: 'Live',
    tab_results: 'Results',
    tab_upcoming: 'Upcoming',
    tab_subscribed: 'Subscribed',
    tab_standings: 'Standings',
    standings_team: 'Team',
    btn_subscribe: 'Alerts',
    btn_subscribed: 'Subscribed',
    final_result: 'FINAL RESULT',
    upcoming_pred: 'Upcoming • Prediction open',
    empty_matches: 'No matches matching your selection.',
    feed_title: 'World Cup Feed',
    latest_stories: 'Latest World Cup Stories',
    empty_news: 'No news matches search parameters.',
    sidebar_title: 'Subscription Settings',
    sidebar_desc: 'Subscribe to your favorite teams to receive real-time push alerts for goals, half-times, and final results.',
    card_native_title: 'Enable Native Alerts',
    card_native_desc: 'Get instant updates in the background on your device.',
    card_native_btn: 'Enable',
    sidebar_subs_header: 'Active Subscriptions',
    sidebar_all_header: 'All Teams',
    sidebar_empty_state: 'No subscribed teams yet. Click the alerts button next to matches or subscribe below!',
    modal_timeline: 'Timeline',
    modal_stats: 'Stats',
    modal_lineups: 'Lineups',
    modal_empty_timeline_upcoming: "This match hasn't started yet. Timeline updates will populate live when kickoff begins.",
    modal_empty_timeline_live: 'Kickoff! No major actions yet.',
    modal_squad_title: 'Squad',
    modal_status_live: 'LIVE',
    modal_status_fulltime: 'FULL TIME RESULT',
    modal_status_upcoming: 'UPCOMING GAME',
    read_full_story: 'Read Full Story ↗',
    read_full_story_desc: 'Click "Read Full Story" to read this breaking news article directly on the source website.',
    source: 'Source',
    possession: 'Possession %',
    shots: 'Shots',
    fouls: 'Fouls Committed',
    corners: 'Corners',
    category_injury: 'Injury Report',
    category_lineup: 'Squads',
    category_transfer: 'Transfers',
    category_press: 'Press Talk',
    category_rules: 'Rules & VAR',
    category_tactics: 'Tactics',
    category_all: 'All News',
    category_injury_chip: 'Injuries',
    category_lineup_chip: 'Squads',
    category_transfer_chip: 'Transfers',
    category_press_chip: 'Press Talk',
    category_rules_chip: 'Rules & VAR',
    category_tactics_chip: 'Tactics',
    m_ago: 'm ago',
    h_ago: 'h ago',
    d_ago: 'd ago',
    just_now: 'Just now',
    recently: 'Recently',
    today: 'Today',
    group: 'Group',
    match: 'Match',
    jun: 'Jun',
    jul: 'Jul',
    group_stage: 'Group Stage',
    preferences_header: 'App Preferences',
    partner_header: 'Featured Partner',
    partner_desc: 'Explore unbiased analysis, deep-dive investigations, and independent opinions on sports and current affairs.',
    pref_light_mode: 'Light Mode',
    pref_light_mode_desc: 'Switch to a clean, light color scheme.',
    pref_show_matches: 'Show Match Center',
    pref_show_matches_desc: 'Display real-time results and timeline.',
    pref_show_news: 'Show News Feed',
    pref_show_news_desc: 'Display football news and reports.',
    win_probability: 'Win Probability',
    home_win: 'Home Win',
    draw: 'Draw',
    away_win: 'Away Win',
    tab_bracket: 'Bracket',
    bracket_title: 'Playoff Predictor',
    btn_reset_bracket: 'Reset Predictions',
    round_r16: 'Round of 16',
    round_qf: 'Quarter-finals',
    round_sf: 'Semi-finals',
    round_final: 'Final',
    round_champion: 'Champion',
    predicted_champion: 'PREDICTED CHAMPION',
    stat_overall: 'Overall',
    stat_age: 'Age',
    stat_height: 'Height',
    stat_club: 'Club',
    stat_caps: 'Caps',
    stat_goals: 'Goals',
    pos_forward: 'Forward',
    pos_midfielder: 'Midfielder',
    pos_defender: 'Defender',
    pos_goalkeeper: 'Goalkeeper',
    wc_stats: 'World Cup 2026 Stats',
    wc_goals: 'Goals',
    wc_assists: 'Assists',
    wc_cards: 'Cards',
    wc_rating: 'Avg Rating',
    player_profile: 'Player Profile',
    btn_close: 'Close'
  },
  es: {
    live_ticker: 'Marcador en vivo',
    tracking_subs: 'Siguiendo suscripciones',
    btn_install: 'Instalar App',
    match_center: 'Centro de Partidos',
    tab_all: 'Todos',
    tab_live: 'En Vivo',
    tab_results: 'Resultados',
    tab_upcoming: 'Próximos',
    tab_subscribed: 'Suscritos',
    tab_standings: 'Clasificación',
    standings_team: 'Equipo',
    btn_subscribe: 'Alertas',
    btn_subscribed: 'Suscrito',
    final_result: 'RESULTADO FINAL',
    upcoming_pred: 'Próximamente • Pronósticos abiertos',
    empty_matches: 'No hay partidos que coincidan con su selección.',
    feed_title: 'Noticias del Mundial',
    latest_stories: 'Últimas noticias del Mundial',
    empty_news: 'No hay noticias que coincidan con la búsqueda.',
    sidebar_title: 'Ajustes de Suscripción',
    sidebar_desc: 'Suscríbete a tus equipos favoritos para recibir alertas push en tiempo real de goles, entretiempos y resultados finales.',
    card_native_title: 'Activar Alertas Nativas',
    card_native_desc: 'Recibe actualizaciones al instante en segundo plano en tu dispositivo.',
    card_native_btn: 'Activar',
    sidebar_subs_header: 'Suscripciones Activas',
    sidebar_all_header: 'Todos los Equipos',
    sidebar_empty_state: 'Aún no sigues a ningún equipo. ¡Haz clic en el botón de alerta junto a los partidos o suscríbete abajo!',
    modal_timeline: 'Línea de tiempo',
    modal_stats: 'Estadísticas',
    modal_lineups: 'Alineaciones',
    modal_empty_timeline_upcoming: 'Este partido aún no ha comenzado. El minuto a minuto se actualizará en vivo tras el pitazo inicial.',
    modal_empty_timeline_live: '¡Comenzó el partido! Aún no se han producido eventos importantes.',
    modal_squad_title: 'Plantel',
    modal_status_live: 'EN VIVO',
    modal_status_fulltime: 'RESULTADO FINAL',
    modal_status_upcoming: 'PARTIDO PRÓXIMO',
    read_full_story: 'Leer Noticia Completa ↗',
    read_full_story_desc: 'Haz clic en "Leer Noticia Completa" para leer este artículo directamente en la web de origen.',
    source: 'Fuente',
    possession: 'Posesión %',
    shots: 'Remates',
    fouls: 'Faltas Cometidas',
    corners: 'Tiros de esquina',
    category_injury: 'Parte de Lesiones',
    category_lineup: 'Planteles',
    category_transfer: 'Fichajes',
    category_press: 'Ruedas de prensa',
    category_rules: 'Reglamento y VAR',
    category_tactics: 'Tácticas',
    category_all: 'Todas',
    category_injury_chip: 'Lesiones',
    category_lineup_chip: 'Planteles',
    category_transfer_chip: 'Fichajes',
    category_press_chip: 'Ruedas de prensa',
    category_rules_chip: 'Reglamento y VAR',
    category_tactics_chip: 'Tácticas',
    m_ago: 'm atrás',
    h_ago: 'h atrás',
    d_ago: 'd atrás',
    just_now: 'Ahora mismo',
    recently: 'Recientemente',
    today: 'Hoy',
    group: 'Grupo',
    match: 'Partido',
    jun: 'Jun',
    jul: 'Jul',
    group_stage: 'Fase de Grupos',
    preferences_header: 'Preferencias de la App',
    partner_header: 'Colaborador Destacado',
    partner_desc: 'Explora análisis imparciales, investigaciones profundas y opiniones independientes sobre deportes y actualidad.',
    pref_light_mode: 'Modo Claro',
    pref_light_mode_desc: 'Cambiar a un diseño claro y limpio.',
    pref_show_matches: 'Ver Centro de Partidos',
    pref_show_matches_desc: 'Mostrar resultados en vivo y minuto a minuto.',
    pref_show_news: 'Ver Feed de Noticias',
    pref_show_news_desc: 'Mostrar noticias y reportes de fútbol.',
    win_probability: 'Probabilidad de Victoria',
    home_win: 'Victoria Local',
    draw: 'Empate',
    away_win: 'Victoria Visitante',
    tab_bracket: 'Cuadro',
    bracket_title: 'Pronosticador de Playoffs',
    btn_reset_bracket: 'Restablecer Cuadro',
    round_r16: 'Octavos de Final',
    round_qf: 'Cuartos de Final',
    round_sf: 'Semifinales',
    round_final: 'Final',
    round_champion: 'Campeón',
    predicted_champion: 'CAMPEÓN PRONOSTICADO',
    stat_overall: 'General',
    stat_age: 'Edad',
    stat_height: 'Altura',
    stat_club: 'Club',
    stat_caps: 'Partidos',
    stat_goals: 'Goles',
    pos_forward: 'Delantero',
    pos_midfielder: 'Centrocampista',
    pos_defender: 'Defensa',
    pos_goalkeeper: 'Portero',
    wc_stats: 'Estadísticas del Mundial 2026',
    wc_goals: 'Goles',
    wc_assists: 'Asistencias',
    wc_cards: 'Tarjetas',
    wc_rating: 'Calificación Media',
    player_profile: 'Perfil del Jugador',
    btn_close: 'Cerrar'
  },
  ca: {
    live_ticker: 'Marcador en viu',
    tracking_subs: 'Seguint subscripcions',
    btn_install: 'Instal·lar App',
    match_center: 'Centre de Partits',
    tab_all: 'Tots',
    tab_live: 'En Viu',
    tab_results: 'Resultats',
    tab_upcoming: 'Pròxims',
    tab_subscribed: 'Subscrits',
    tab_standings: 'Classificació',
    standings_team: 'Equip',
    btn_subscribe: 'Alertes',
    btn_subscribed: 'Subscrit',
    final_result: 'RESULTAT FINAL',
    upcoming_pred: 'Pròximament • Pronòstics oberts',
    empty_matches: 'No hi ha partits que coincideixin amb la seva selecció.',
    feed_title: 'Notícies del Mundial',
    latest_stories: 'Últimes notícies del Mundial',
    empty_news: 'No hi ha notícies que coincideixin amb la cerca.',
    sidebar_title: 'Ajusts de Subscripció',
    sidebar_desc: 'Subscriu-te als teus equips preferits per rebre alertes push en temps real de gols, mitges parts i resultats finals.',
    card_native_title: 'Activar Alertes Natives',
    card_native_desc: 'Rep actualitzacions a l\'instant en segon pla al teu dispositiu.',
    card_native_btn: 'Activar',
    sidebar_subs_header: 'Subscripcions Actives',
    sidebar_all_header: 'Tots els Equips',
    sidebar_empty_state: 'Encara no segueixes cap equip. Fes clic al botó d\'alerta al costat dels partits o subscriu-te a sota!',
    modal_timeline: 'Línia de temps',
    modal_stats: 'Estadístiques',
    modal_lineups: 'Alineacions',
    modal_empty_timeline_upcoming: 'Aquest partit encara no ha començat. El minut a minut s\'actualitzarà en viu després del xiulet inicial.',
    modal_empty_timeline_live: 'Ha començat el partit! Encara no s\'han produït esdeveniments importants.',
    modal_squad_title: 'Plantilla',
    modal_status_live: 'EN VIU',
    modal_status_fulltime: 'RESULTAT FINAL',
    modal_status_upcoming: 'PARTIT PRÒXIM',
    read_full_story: 'Llegir Notícia Completa ↗',
    read_full_story_desc: 'Fes clic a "Llegir Notícia Completa" per llegir aquest article directament al web d\'origen.',
    source: 'Font',
    possession: 'Possessió %',
    shots: 'Remats',
    fouls: 'Faltes Comeses',
    corners: 'Còrners',
    category_injury: 'Part de Lesions',
    category_lineup: 'Plantilles',
    category_transfer: 'Fitxatges',
    category_press: 'Rodes de premsa',
    category_rules: 'Reglament i VAR',
    category_tactics: 'Tàctiques',
    category_all: 'Totes',
    category_injury_chip: 'Lesions',
    category_lineup_chip: 'Plantilles',
    category_transfer_chip: 'Fitxatges',
    category_press_chip: 'Rodes de premsa',
    category_rules_chip: 'Reglament i VAR',
    category_tactics_chip: 'Tàctiques',
    m_ago: 'm enrere',
    h_ago: 'h enrere',
    d_ago: 'd enrere',
    just_now: 'Ara mateix',
    recently: 'Recentment',
    today: 'Avui',
    group: 'Grup',
    match: 'Partit',
    jun: 'Jun',
    jul: 'Jul',
    group_stage: 'Fase de Grups',
    preferences_header: "Preferències de l'App",
    partner_header: 'Col·laborador Destacat',
    partner_desc: 'Explora anàlisis imparcials, investigacions profundes i opinions independents sobre esports i actualitat.',
    pref_light_mode: 'Modo Clar',
    pref_light_mode_desc: 'Canviar a un disseny clar i net.',
    pref_show_matches: 'Veure Centre de Partits',
    pref_show_matches_desc: 'Mostrar resultats en viu i minut a minut.',
    pref_show_news: 'Veure Feed de Notícies',
    pref_show_news_desc: 'Mostrar notícies i reportatges de futbol.',
    win_probability: 'Probabilitat de Victòria',
    home_win: 'Victòria Local',
    draw: 'Empat',
    away_win: 'Victòria Visitant',
    tab_bracket: 'Quadre',
    bracket_title: 'Pronosticador de Playoffs',
    btn_reset_bracket: 'Restablir Quadre',
    round_r16: 'Vuitens de Final',
    round_qf: 'Quarts de Final',
    round_sf: 'Semifinals',
    round_final: 'Final',
    round_champion: 'Campió',
    predicted_champion: 'CAMPIÓ PRONOSTICAT',
    stat_overall: 'General',
    stat_age: 'Edat',
    stat_height: 'Alçada',
    stat_club: 'Club',
    stat_caps: 'Partits',
    stat_goals: 'Gols',
    pos_forward: 'Davanter',
    pos_midfielder: 'Migcampista',
    pos_defender: 'Defensa',
    pos_goalkeeper: 'Porter',
    wc_stats: 'Estadístiques del Mundial 2026',
    wc_goals: 'Gols',
    wc_assists: 'Assistències',
    wc_cards: 'Targetes',
    wc_rating: 'Qualificació Mitjana',
    player_profile: 'Perfil del Jugador',
    btn_close: 'Tancar'
  }
};

function t(key, fallback = '') {
  const lang = state.lang;
  return (translations[lang] && translations[lang][key]) || fallback || key;
}

function applyTranslations() {
  const lang = state.lang;
  
  if (DOM.langSelect) {
    DOM.langSelect.value = lang;
  }
  
  const langFlags = {
    en: '🇬🇧',
    es: '🇪🇸',
    ca: `<svg class="flag-icon" viewBox="0 0 15 9" width="18" height="12" style="border-radius: 2px; vertical-align: middle; display: inline-block; box-shadow: 0 1px 3px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);"><rect width="15" height="9" fill="#ffcc00"/><rect y="1" width="15" height="1" fill="#e30013"/><rect y="3" width="15" height="1" fill="#e30013"/><rect y="5" width="15" height="1" fill="#e30013"/><rect y="7" width="15" height="1" fill="#e30013"/></svg>`
  };
  if (DOM.langFlag) {
    if (lang === 'ca') {
      DOM.langFlag.innerHTML = langFlags.ca;
    } else {
      DOM.langFlag.innerHTML = langFlags[lang] || '🇬🇧';
    }
  }
  
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  if (DOM.newsSearch) {
    DOM.newsSearch.placeholder = lang === 'en' ? 'Search team news, injuries...' : 
                                 lang === 'es' ? 'Buscar noticias de equipos, lesiones...' : 
                                               'Cercar notícies d\'equips, lesions...';
  }

  document.title = lang === 'en' ? 'MatchDay • World Cup 2026 Tracker' : 
                   lang === 'es' ? 'MatchDay • Rastreador del Mundial 2026' : 
                                  'MatchDay • Seguiment del Mundial 2026';
                                  
  // Set html element lang attribute for SEO
  document.documentElement.lang = lang;
                                  
  // Trigger re-renders
  renderMatchesList();
  renderNewsGrid();
  renderSubscriptionsUI();
  updateSyncStatus();
}

function translateStage(stageStr) {
  if (!stageStr) return '';
  return stageStr
    .replace('Group Stage', t('group_stage', 'Group Stage'))
    .replace('Group', t('group', 'Group'))
    .replace('Match', t('match', 'Match'));
}

function translateTime(timeStr) {
  if (!timeStr) return '';
  return timeStr
    .replace('m ago', ' ' + t('m_ago', 'm ago'))
    .replace('h ago', ' ' + t('h_ago', 'h ago'))
    .replace('d ago', ' ' + t('d_ago', 'd ago'))
    .replace('Just now', t('just_now', 'Just now'))
    .replace('Recently', t('recently', 'Recently'))
    .replace('Today', t('today', 'Today'))
    .trim();
}

function translateDate(dateStr) {
  if (!dateStr) return '';
  return dateStr
    .replace('Jun', t('jun', 'Jun'))
    .replace('Jul', t('jul', 'Jul'));
}

// --- DOM References ---
const DOM = {
  appContainer: document.getElementById('appContainer'),
  matchesPanel: document.getElementById('matchesPanel'),
  newsPanel: document.getElementById('newsPanel'),
  dividerHandle: document.getElementById('dividerHandle'),
  matchesList: document.getElementById('matchesList'),
  newsGrid: document.getElementById('newsGrid'),
  newsSearch: document.getElementById('newsSearch'),
  installBtn: document.getElementById('installBtn'),
  syncStatus: document.getElementById('syncStatus'),
  notificationCenterBtn: document.getElementById('notificationCenterBtn'),
  subCountBadge: document.getElementById('subCountBadge'),
  langSelect: document.getElementById('langSelect'),
  langFlag: document.getElementById('langFlag'),
  
  // Notification Sidebar
  notificationSidebar: document.getElementById('notificationSidebar'),
  sidebarBackdrop: document.getElementById('sidebarBackdrop'),
  sidebarCloseBtn: document.getElementById('sidebarCloseBtn'),
  grantPushBtn: document.getElementById('grantPushBtn'),
  pushPermissionCard: document.getElementById('pushPermissionCard'),
  subscribedTeamsList: document.getElementById('subscribedTeamsList'),
  allTeamsGrid: document.getElementById('allTeamsGrid'),
  
  // Detailed Modal
  matchModal: document.getElementById('matchModal'),
  modalBackdrop: document.getElementById('modalBackdrop'),
  modalClose: document.getElementById('modalClose'),
  modalHeader: document.getElementById('modalHeader'),
  modalTabContent: document.getElementById('modalTabContent'),

  // Detailed News Modal
  newsModal: document.getElementById('newsModal'),
  newsModalBackdrop: document.getElementById('newsModalBackdrop'),
  newsModalClose: document.getElementById('newsModalClose'),
  newsModalHeader: document.getElementById('newsModalHeader'),
  newsModalBody: document.getElementById('newsModalBody'),
  
  // Toast container
  toastContainer: document.getElementById('toastContainer'),
  
  toggleThemeBtn: document.getElementById('toggleThemeBtn'),
  toggleMatchesBtn: document.getElementById('toggleMatchesBtn'),
  toggleNewsBtn: document.getElementById('toggleNewsBtn')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  // PWA setup
  registerServiceWorker();
  setupPwaInstallation();
  
  // Drag resizing setup
  setupSplitScreenResizing();
  
  // Subscriptions & Sidebar setup
  renderSubscriptionsUI();
  setupSidebarHandlers();
  setupCustomizationPreferences();
  
  // Filter systems setup
  setupFilterHandlers();
  
  // Simulated Match Engine
  startMatchSimulation();
  
  // Language switcher setup
  if (DOM.langSelect) {
    DOM.langSelect.addEventListener('change', (e) => {
      state.lang = e.target.value;
      localStorage.setItem('matchday_lang', state.lang);
      applyTranslations();
    });
  }
  
  // Apply initial translations & trigger initial renders
  applyTranslations();
  
  // Modals & Banner
  setupModalHandlers();
  setupPartnerBanner();

  // Async load scraped backend feeds
  loadScrapedData();
});

// --- PWA Installation & Service Worker ---
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => console.log('[PWA] Service Worker registered with scope:', reg.scope))
        .catch((err) => console.error('[PWA] Service Worker registration failed:', err));
    });

    // Automatically reload the page when a new Service Worker takes control (purges stale caches)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }
}

let deferredInstallPrompt = null;
function setupPwaInstallation() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    DOM.installBtn.style.display = 'flex';
  });

  DOM.installBtn.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    console.log(`[PWA] Install prompt outcome: ${outcome}`);
    deferredInstallPrompt = null;
    DOM.installBtn.style.display = 'none';
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] MatchDay installed successfully!');
    DOM.installBtn.style.display = 'none';
  });
}

// --- Split Screen Resizing Logic (Desktop & Mobile) ---
function setupSplitScreenResizing() {
  let isDragging = false;

  const onDragStart = () => {
    isDragging = true;
    DOM.dividerHandle.classList.add('dragging');
    document.body.style.userSelect = 'none';
  };

  const onDragMove = (e) => {
    if (!isDragging) return;
    
    // Support touch devices (multitouch safeguard)
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;

    // Check layout orientation
    const isDesktop = window.innerWidth > 768;
    
    if (isDesktop) {
      // Horizontal resize
      const containerWidth = DOM.appContainer.clientWidth;
      const leftWidth = clientX;
      
      // Keep boundaries (between 25% and 75%)
      const percentage = (leftWidth / containerWidth) * 100;
      if (percentage >= 25 && percentage <= 75) {
        document.documentElement.style.setProperty('--matches-width', `${percentage}fr`);
        document.documentElement.style.setProperty('--news-width', `${100 - percentage}fr`);
      }
    } else {
      // Vertical resize (Mobile)
      const containerHeight = DOM.appContainer.clientHeight;
      
      // Account for header offset dynamically (70px desktop, 56px mobile)
      const headerElement = document.querySelector('.app-header');
      const headerHeight = headerElement ? headerElement.clientHeight : 70;
      const topHeight = clientY - headerHeight;
      
      const percentage = (topHeight / containerHeight) * 100;
      // Keep boundaries (between 20% and 80%)
      if (percentage >= 20 && percentage <= 80) {
        document.documentElement.style.setProperty('--matches-height', `${percentage}fr`);
        document.documentElement.style.setProperty('--news-height', `${100 - percentage}fr`);
      }
    }
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    DOM.dividerHandle.classList.remove('dragging');
    document.body.style.userSelect = 'auto';
  };

  // Mouse Drag Events
  DOM.dividerHandle.addEventListener('mousedown', onDragStart);
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);

  // Touch Drag Events (PWA Mobile Performance)
  DOM.dividerHandle.addEventListener('touchstart', onDragStart, { passive: true });
  document.addEventListener('touchmove', onDragMove, { passive: false });
  document.addEventListener('touchend', onDragEnd);
  
  // Resize reset protection
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      document.documentElement.style.removeProperty('--matches-height');
      document.documentElement.style.removeProperty('--news-height');
    } else {
      document.documentElement.style.removeProperty('--matches-width');
      document.documentElement.style.removeProperty('--news-width');
    }
  });

  // Premium Snapping Shortcut (Double tap/click divider to cycle maximize states)
  let currentSnapState = 0; // 0 = Even, 1 = Matches Max, 2 = News Max
  
  DOM.dividerHandle.addEventListener('dblclick', () => {
    currentSnapState = (currentSnapState + 1) % 3;
    const isDesktop = window.innerWidth > 768;
    
    if (isDesktop) {
      if (currentSnapState === 0) {
        document.documentElement.style.setProperty('--matches-width', '1.2fr');
        document.documentElement.style.setProperty('--news-width', '1fr');
      } else if (currentSnapState === 1) {
        document.documentElement.style.setProperty('--matches-width', '2.5fr');
        document.documentElement.style.setProperty('--news-width', '1fr');
      } else {
        document.documentElement.style.setProperty('--matches-width', '1fr');
        document.documentElement.style.setProperty('--news-width', '2.5fr');
      }
    } else {
      if (currentSnapState === 0) {
        document.documentElement.style.setProperty('--matches-height', '1.2fr');
        document.documentElement.style.setProperty('--news-height', '1fr');
      } else if (currentSnapState === 1) {
        document.documentElement.style.setProperty('--matches-height', '2.5fr');
        document.documentElement.style.setProperty('--news-height', '1fr');
      } else {
        document.documentElement.style.setProperty('--matches-height', '1fr');
        document.documentElement.style.setProperty('--news-height', '2.5fr');
      }
    }
  });

  // Mobile Touch Double-Tap Gesture Hydrator
  let lastTap = 0;
  DOM.dividerHandle.addEventListener('touchstart', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
      DOM.dividerHandle.dispatchEvent(new Event('dblclick'));
    }
    lastTap = currentTime;
  }, { passive: true });
}

// --- Dynamic Notification System ---
function showToast(title, body) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-bell">🔔</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-body">${body}</div>
    </div>
    <button class="toast-close">&times;</button>
  `;

  DOM.toastContainer.appendChild(toast);
  
  // Trigger transition
  setTimeout(() => toast.classList.add('show'), 50);

  // Close event listener
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  });

  // Self-destruct after 5s
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }
  }, 5000);
}

async function triggerSystemNotification(title, body) {
  if (state.isNativePushEnabled) {
    try {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(title, {
        body: body,
        icon: './assets/icon-192.png',
        badge: './assets/icon-192.png',
        tag: 'worldcup-update',
        renotify: true
      });
    } catch (e) {
      // Fallback if service worker is not active/supported yet
      new Notification(title, { body, icon: './assets/icon-192.png' });
    }
  }
}

// --- Team Alert Subscription Managers ---
function isRealTeam(name) {
  if (!name) return false;
  const clean = name.trim();
  return !/^[0-9]/.test(clean) && clean !== 'TBD' && !clean.toLowerCase().includes('announced');
}

function toggleSubscription(teamName) {
  if (!isRealTeam(teamName)) return;
  if (state.subscribedTeams.has(teamName)) {
    state.subscribedTeams.delete(teamName);
    showToast('🔔 Alerts Removed', `Unsubscribed from ${teamName} updates.`);
  } else {
    state.subscribedTeams.add(teamName);
    showToast('🔔 Subscribed!', `You will now receive live alerts for ${teamName}.`);
    
    // Prompt native notification permission on subscription if not granted yet
    if (Notification.permission === 'default') {
      requestPushPermission();
    }
  }
  
  // Persist State
  localStorage.setItem('matchday_subs', JSON.stringify(Array.from(state.subscribedTeams)));
  
  // Sync all UIs
  renderMatchesList();
  renderSubscriptionsUI();
  updateSyncStatus();
}

async function requestPushPermission() {
  const permission = await Notification.requestPermission();
  state.isNativePushEnabled = permission === 'granted';
  
  if (state.isNativePushEnabled) {
    showToast('🔔 Native Alerts Active', 'World Cup live push notifications are enabled on this device!');
    DOM.pushPermissionCard.style.display = 'none';
  } else {
    showToast('⚠️ Native Alerts Denied', 'Notifications blocked. Check browser settings.');
  }
  renderSubscriptionsUI();
}

function setupSidebarHandlers() {
  const toggleSidebar = () => {
    DOM.notificationSidebar.classList.toggle('active');
    DOM.sidebarBackdrop.classList.toggle('active');
  };

  DOM.notificationCenterBtn.addEventListener('click', toggleSidebar);
  DOM.sidebarCloseBtn.addEventListener('click', toggleSidebar);
  DOM.sidebarBackdrop.addEventListener('click', toggleSidebar);
  DOM.grantPushBtn.addEventListener('click', requestPushPermission);
}

function setupCustomizationPreferences() {
  const savedTheme = localStorage.getItem('matchday_theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    if (DOM.toggleThemeBtn) DOM.toggleThemeBtn.checked = true;
  }

  const showMatches = localStorage.getItem('matchday_show_matches') !== 'false';
  const showNews = localStorage.getItem('matchday_show_news') !== 'false';

  if (!showMatches) {
    document.body.classList.add('hide-matches');
    if (DOM.toggleMatchesBtn) DOM.toggleMatchesBtn.checked = false;
  }
  if (!showNews) {
    document.body.classList.add('hide-news');
    if (DOM.toggleNewsBtn) DOM.toggleNewsBtn.checked = false;
  }

  if (DOM.toggleThemeBtn) {
    DOM.toggleThemeBtn.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.body.classList.add('light-theme');
        localStorage.setItem('matchday_theme', 'light');
      } else {
        document.body.classList.remove('light-theme');
        localStorage.setItem('matchday_theme', 'dark');
      }
    });
  }

  if (DOM.toggleMatchesBtn) {
    DOM.toggleMatchesBtn.addEventListener('change', (e) => {
      if (!e.target.checked && !DOM.toggleNewsBtn.checked) {
        e.target.checked = true;
        return;
      }

      if (e.target.checked) {
        document.body.classList.remove('hide-matches');
        localStorage.setItem('matchday_show_matches', 'true');
      } else {
        document.body.classList.add('hide-matches');
        localStorage.setItem('matchday_show_matches', 'false');
      }
      window.dispatchEvent(new Event('resize'));
    });
  }

  if (DOM.toggleNewsBtn) {
    DOM.toggleNewsBtn.addEventListener('change', (e) => {
      if (!e.target.checked && !DOM.toggleMatchesBtn.checked) {
        e.target.checked = true;
        return;
      }

      if (e.target.checked) {
        document.body.classList.remove('hide-news');
        localStorage.setItem('matchday_show_news', 'true');
      } else {
        document.body.classList.add('hide-news');
        localStorage.setItem('matchday_show_news', 'false');
      }
      window.dispatchEvent(new Event('resize'));
    });
  }
}

function renderSubscriptionsUI() {
  // Clean up any non-real teams from state.subscribedTeams (e.g. from historical data)
  let cleaned = false;
  for (const team of state.subscribedTeams) {
    if (!isRealTeam(team)) {
      state.subscribedTeams.delete(team);
      cleaned = true;
    }
  }
  if (cleaned) {
    localStorage.setItem('matchday_subs', JSON.stringify(Array.from(state.subscribedTeams)));
  }

  // Update badge in header
  const count = state.subscribedTeams.size;
  if (count > 0) {
    DOM.subCountBadge.textContent = count;
    DOM.subCountBadge.style.display = 'flex';
  } else {
    DOM.subCountBadge.style.display = 'none';
  }

  // Push Permission Card View State
  if (Notification.permission === 'granted') {
    DOM.pushPermissionCard.style.display = 'none';
  } else {
    DOM.pushPermissionCard.style.display = 'flex';
  }

  // Subscribed list
  DOM.subscribedTeamsList.innerHTML = '';
  if (count === 0) {
    DOM.subscribedTeamsList.innerHTML = `<p class="empty-state">${t('sidebar_empty_state', 'No active subscriptions. Tap "Alerts" next to matches.')}</p>`;
  } else {
    state.subscribedTeams.forEach((team) => {
      // Find matching flag
      let flag = '⚽';
      const match = state.matches.find(m => m.home === team || m.away === team);
      if (match) {
        flag = match.home === team ? match.homeFlag : match.awayFlag;
      }
      
      const row = document.createElement('div');
      row.className = 'subscribed-team-row';
      row.innerHTML = `
        <div class="sub-team-left">
          <span>${flag}</span>
          <span>${team}</span>
        </div>
        <button class="btn-unsubscribe-icon" data-team="${team}" title="Unsubscribe">&times;</button>
      `;
      row.querySelector('.btn-unsubscribe-icon').addEventListener('click', () => toggleSubscription(team));
      DOM.subscribedTeamsList.appendChild(row);
    });
  }

  // All Teams Selection Grid (Extract unique teams from matches database)
  const allTeams = new Map();
  state.matches.forEach((m) => {
    if (m.home && isRealTeam(m.home)) allTeams.set(m.home, m.homeFlag);
    if (m.away && isRealTeam(m.away)) allTeams.set(m.away, m.awayFlag);
  });

  const sortedTeams = Array.from(allTeams.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  DOM.allTeamsGrid.innerHTML = '';
  sortedTeams.forEach(([name, flag]) => {
    const isSubbed = state.subscribedTeams.has(name);
    const chip = document.createElement('div');
    chip.className = `team-chip-subscribe ${isSubbed ? 'active' : ''}`;
    chip.innerHTML = `
      <span class="flag">${flag}</span>
      <span class="name">${name}</span>
    `;
    chip.addEventListener('click', () => toggleSubscription(name));
    DOM.allTeamsGrid.appendChild(chip);
  });
}

function updateSyncStatus() {
  if (state.subscribedTeams.size > 0) {
    DOM.syncStatus.style.background = 'rgba(16, 185, 129, 0.15)';
    DOM.syncStatus.querySelector('.status-text').textContent = t('tracking_subs', 'Tracking Subscriptions');
  } else {
    DOM.syncStatus.style.background = '';
    DOM.syncStatus.querySelector('.status-text').textContent = t('live_ticker', 'Live Ticker');
  }
}

// --- Live Match Simulation Engine (WOW Feature) ---
function startMatchSimulation() {
  setInterval(() => {
    // Pick live matches
    const liveMatches = state.matches.filter(m => m.status === 'live');
    if (liveMatches.length === 0) return;

    // Pulse live ticker animation to show active tracking
    const dot = DOM.syncStatus.querySelector('.pulse-dot');
    dot.style.transform = 'scale(1.3)';
    setTimeout(() => dot.style.transform = '', 300);

    liveMatches.forEach((match) => {
      // 1. Advance Match Time
      match.minute += 1;
      if (match.minute >= 90) {
        match.status = 'finished';
        match.minute = 90;
        showToast('🏁 Match Finished', `${match.homeFlag} ${match.home} ${match.homeScore} - ${match.awayScore} ${match.away} ${match.awayFlag}`);
        // Notify subscribers of final whistle
        if (state.subscribedTeams.has(match.home) || state.subscribedTeams.has(match.away)) {
          const title = `FULL TIME: ${match.home} vs ${match.away}`;
          const body = `Final Score: ${match.home} ${match.homeScore} - ${match.awayScore} ${match.away}`;
          triggerSystemNotification(title, body);
        }
        renderMatchesList();
        if (state.activeModalMatchId === match.id) renderModalContent();
        return;
      }

      // 2. Chance of a Goal (Simulated 4% probability per tick)
      if (Math.random() < 0.04) {
        const isHomeScoring = Math.random() < 0.5;
        const scoringTeam = isHomeScoring ? match.home : match.away;
        const targetCard = document.querySelector(`.match-card[data-match-id="${match.id}"]`);
        
        if (isHomeScoring) {
          match.homeScore += 1;
        } else {
          match.awayScore += 1;
        }

        // Select random scorer from the playing team's lineup
        const squad = isHomeScoring ? match.lineups.home : match.lineups.away;
        const randomScorer = (squad && squad.length > 0)
          ? squad[Math.floor(Math.random() * squad.length)]
          : (isHomeScoring ? match.home : match.away) + " Player";
        const newGoal = {
          minute: match.minute,
          team: scoringTeam,
          type: 'goal',
          desc: `${randomScorer} ⚽ (Spectacular Strike!)`
        };
        match.events.push(newGoal);

        // Flash screen / UI trigger
        if (targetCard) {
          const scores = targetCard.querySelectorAll('.score-val');
          scores.forEach(s => {
            s.style.color = 'var(--secondary)';
            s.style.transform = 'scale(1.25)';
            setTimeout(() => {
              s.style.color = '';
              s.style.transform = '';
            }, 1200);
          });
        }

        // Notify if subscribed
        if (state.subscribedTeams.has(scoringTeam)) {
          const alertTitle = `⚽ GOAL! ${scoringTeam} Scored!`;
          const alertBody = `${match.home} ${match.homeScore} - ${match.awayScore} ${match.away} (${match.minute}')`;
          
          showToast(alertTitle, `${randomScorer} scores for ${scoringTeam}! App updates live.`);
          triggerSystemNotification(alertTitle, alertBody);
        }

        // Sync Modal
        if (state.activeModalMatchId === match.id) renderModalContent();
      }

      // 3. Chance of a Yellow Card (3% probability)
      if (Math.random() < 0.03) {
        const isHomeCard = Math.random() < 0.5;
        const cardTeam = isHomeCard ? match.home : match.away;
        const players = isHomeCard ? match.lineups.home : match.lineups.away;
        const player = players[Math.floor(Math.random() * players.length)];
        
        const cardEvent = {
          minute: match.minute,
          team: cardTeam,
          type: 'card',
          desc: `${player} 🟨 (Tactical Foul)`
        };
        match.events.push(cardEvent);

        if (state.subscribedTeams.has(cardTeam)) {
          showToast('🟨 Yellow Card Alert', `${player} (${cardTeam}) booked at ${match.minute}'.`);
        }
        
        if (state.activeModalMatchId === match.id) renderModalContent();
      }

      // Sync active matches cards UIs
      renderMatchesList();
    });
  }, 10000); // Check events every 10 seconds to keep live feed exciting!
}

// --- Matches Filters & Search Renderers ---
function setupFilterHandlers() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      const activeTab = e.currentTarget;
      activeTab.classList.add('active');
      state.activeTab = activeTab.dataset.tab;
      renderMatchesList();
    });
  });
}

// --- Group Standings Calculations & Renderer ---
function calculateStandings() {
  const standings = {};

  state.matches.forEach((match) => {
    const matchStage = match.stage || '';
    const matchGroupMatch = matchStage.match(/Group\s([A-L])/i);
    if (!matchGroupMatch) return; // Skip non-group stages
    
    const groupName = `Group ${matchGroupMatch[1]}`;
    
    if (!standings[groupName]) {
      standings[groupName] = {};
    }
    
    const group = standings[groupName];
    
    if (!group[match.home]) {
      group[match.home] = { name: match.home, flag: match.homeFlag, gp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
    }
    if (!group[match.away]) {
      group[match.away] = { name: match.away, flag: match.awayFlag, gp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
    }
    
    if (match.status === 'live' || match.status === 'finished') {
      const homeScore = match.homeScore || 0;
      const awayScore = match.awayScore || 0;
      
      const home = group[match.home];
      const away = group[match.away];
      
      home.gp += 1;
      away.gp += 1;
      home.gf += homeScore;
      home.ga += awayScore;
      away.gf += awayScore;
      away.ga += homeScore;
      home.gd = home.gf - home.ga;
      away.gd = away.gf - away.ga;
      
      if (homeScore > awayScore) {
        home.w += 1;
        home.pts += 3;
        away.l += 1;
      } else if (homeScore < awayScore) {
        away.w += 1;
        away.pts += 3;
        home.l += 1;
      } else {
        home.d += 1;
        home.pts += 1;
        away.d += 1;
        away.pts += 1;
      }
    }
  });
  
  const sortedStandings = {};
  for (const groupName in standings) {
    const teamsArray = Object.values(standings[groupName]);
    teamsArray.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.name.localeCompare(b.name);
    });
    sortedStandings[groupName] = teamsArray;
  }
  
  return sortedStandings;
}

function renderGroupStandings() {
  DOM.matchesList.innerHTML = '';
  const standingsData = calculateStandings();
  const availableGroups = Object.keys(standingsData).sort();
  
  if (availableGroups.length === 0) {
    DOM.matchesList.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
        <p>${t('empty_matches', 'No matches matching your selection.')}</p>
      </div>
    `;
    return;
  }
  
  if (!state.activeGroupStandings || !availableGroups.includes(state.activeGroupStandings)) {
    state.activeGroupStandings = availableGroups[0];
  }
  
  // 1. Render Group Selector Chips
  const selectorContainer = document.createElement('div');
  selectorContainer.className = 'group-selector-scroll';
  availableGroups.forEach((groupName) => {
    const chip = document.createElement('button');
    chip.className = `group-chip ${state.activeGroupStandings === groupName ? 'active' : ''}`;
    chip.dataset.group = groupName;
    chip.textContent = translateStage(groupName);
    chip.addEventListener('click', (e) => {
      document.querySelectorAll('.group-chip').forEach(c => c.classList.remove('active'));
      e.currentTarget.classList.add('active');
      state.activeGroupStandings = e.currentTarget.dataset.group;
      renderGroupStandings(); // Re-render chips + table
    });
    selectorContainer.appendChild(chip);
  });
  DOM.matchesList.appendChild(selectorContainer);
  
  // 2. Render Standings Table
  const tableContainer = document.createElement('div');
  tableContainer.className = 'standings-table-container';
  
  const activeTeams = standingsData[state.activeGroupStandings] || [];
  
  let tableHtml = `
    <table class="standings-table">
      <thead>
        <tr>
          <th class="col-pos">#</th>
          <th class="col-team">${t('standings_team', 'Team')}</th>
          <th class="col-stat" title="Played">GP</th>
          <th class="col-stat" title="Won">W</th>
          <th class="col-stat" title="Drawn">D</th>
          <th class="col-stat" title="Lost">L</th>
          <th class="col-stat" title="Goal Difference">GD</th>
          <th class="col-pts" title="Points">PTS</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  activeTeams.forEach((team, index) => {
    const isDirect = index < 2; // Top 2 qualify directly
    const isPlayoff = index === 2; // 3rd place wildcard
    const rowClass = isDirect ? 'qualify-direct' : isPlayoff ? 'qualify-playoff' : '';
    
    tableHtml += `
      <tr class="standings-row ${rowClass}">
        <td class="col-pos">${index + 1}</td>
        <td class="col-team">
          <span class="team-flag">${team.flag}</span>
          <span class="team-name">${team.name}</span>
        </td>
        <td class="col-stat">${team.gp}</td>
        <td class="col-stat">${team.w}</td>
        <td class="col-stat">${team.d}</td>
        <td class="col-stat">${team.l}</td>
        <td class="col-stat">${team.gd > 0 ? '+' + team.gd : team.gd}</td>
        <td class="col-pts">${team.pts}</td>
      </tr>
    `;
  });
  
  tableHtml += `
      </tbody>
    </table>
  `;
  
  tableContainer.innerHTML = tableHtml;
  DOM.matchesList.appendChild(tableContainer);
}

// --- Playoff Bracket Prediction Visualizer ---
const defaultSeeds = [
  { id: 89, home: "Spain", homeFlag: "🇪🇸", away: "Croatia", awayFlag: "🇭🇷" },
  { id: 90, home: "Germany", homeFlag: "🇩🇪", away: "Denmark", awayFlag: "🇩🇰" },
  { id: 91, home: "Argentina", homeFlag: "🇦🇷", away: "Australia", awayFlag: "🇦🇺" },
  { id: 92, home: "Netherlands", homeFlag: "🇳🇱", away: "United States", awayFlag: "🇺🇸" },
  { id: 93, home: "England", homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", away: "Senegal", awayFlag: "🇸🇳" },
  { id: 94, home: "France", homeFlag: "🇫🇷", away: "Poland", awayFlag: "🇵🇱" },
  { id: 95, home: "Portugal", homeFlag: "🇵🇹", away: "Switzerland", awayFlag: "🇨🇭" },
  { id: 96, home: "Brazil", homeFlag: "🇧🇷", away: "Uruguay", awayFlag: "🇺🇾" }
];

const nodeMatches = [
  { id: 89, type: 'r16', name: 'Round of 16' }, // 0
  { id: 90, type: 'r16', name: 'Round of 16' }, // 1
  { id: 91, type: 'r16', name: 'Round of 16' }, // 2
  { id: 92, type: 'r16', name: 'Round of 16' }, // 3
  { id: 93, type: 'r16', name: 'Round of 16' }, // 4
  { id: 94, type: 'r16', name: 'Round of 16' }, // 5
  { id: 95, type: 'r16', name: 'Round of 16' }, // 6
  { id: 96, type: 'r16', name: 'Round of 16' }, // 7
  { id: 97, type: 'qf', name: 'Quarter-finals', sourceHome: 0, sourceAway: 1 }, // 8
  { id: 98, type: 'qf', name: 'Quarter-finals', sourceHome: 2, sourceAway: 3 }, // 9
  { id: 99, type: 'qf', name: 'Quarter-finals', sourceHome: 4, sourceAway: 5 }, // 10
  { id: 100, type: 'qf', name: 'Quarter-finals', sourceHome: 6, sourceAway: 7 }, // 11
  { id: 101, type: 'sf', name: 'Semi-finals', sourceHome: 8, sourceAway: 9 }, // 12
  { id: 102, type: 'sf', name: 'Semi-finals', sourceHome: 10, sourceAway: 11 }, // 13
  { id: 104, type: 'final', name: 'Final', sourceHome: 12, sourceAway: 13 } // 14
];

function getTeamFlag(teamName) {
  if (!teamName || teamName === 'TBD' || teamName === 'To be announced') return '⚽';
  const m = state.matches.find(match => match.home === teamName || match.away === teamName);
  if (m) return m.home === teamName ? m.homeFlag : m.awayFlag;
  const seed = defaultSeeds.find(s => s.home === teamName || s.away === teamName);
  if (seed) return seed.home === teamName ? seed.homeFlag : seed.awayFlag;
  return '⚽';
}

function renderPlayoffBracket() {
  DOM.matchesList.innerHTML = '';
  
  const preds = JSON.parse(localStorage.getItem('matchday_bracket_preds') || '{}');
  const nodes = [];
  let predsChanged = false;

  for (let i = 0; i < 15; i++) {
    const meta = nodeMatches[i];
    const realMatch = state.matches.find(m => m.id === meta.id);
    const isFinished = realMatch && realMatch.status === 'finished';
    
    let actualWinner = null;
    if (isFinished) {
      if (realMatch.homeScore > realMatch.awayScore) actualWinner = realMatch.home;
      else if (realMatch.awayScore > realMatch.homeScore) actualWinner = realMatch.away;
      else actualWinner = realMatch.home;
    }

    let home = "TBD";
    let homeFlag = "⚽";
    let away = "TBD";
    let awayFlag = "⚽";

    if (meta.type === 'r16') {
      const seed = defaultSeeds[i];
      const hasRealHome = realMatch && realMatch.home && realMatch.home !== "To be announced" && realMatch.home !== "TBD";
      const hasRealAway = realMatch && realMatch.away && realMatch.away !== "To be announced" && realMatch.away !== "TBD";
      
      home = hasRealHome ? realMatch.home : seed.home;
      homeFlag = hasRealHome ? realMatch.homeFlag : seed.homeFlag;
      
      away = hasRealAway ? realMatch.away : seed.away;
      awayFlag = hasRealAway ? realMatch.awayFlag : seed.awayFlag;
    } else {
      const sHomeNode = nodes[meta.sourceHome];
      if (sHomeNode && sHomeNode.winner && sHomeNode.winner !== "TBD") {
        home = sHomeNode.winner;
        homeFlag = getTeamFlag(home);
      } else {
        const hasRealHome = realMatch && realMatch.home && realMatch.home !== "To be announced" && realMatch.home !== "TBD";
        if (hasRealHome) {
          home = realMatch.home;
          homeFlag = realMatch.homeFlag;
        }
      }

      const sAwayNode = nodes[meta.sourceAway];
      if (sAwayNode && sAwayNode.winner && sAwayNode.winner !== "TBD") {
        away = sAwayNode.winner;
        awayFlag = getTeamFlag(away);
      } else {
        const hasRealAway = realMatch && realMatch.away && realMatch.away !== "To be announced" && realMatch.away !== "TBD";
        if (hasRealAway) {
          away = realMatch.away;
          awayFlag = realMatch.awayFlag;
        }
      }
    }

    let predictedWinner = preds[i] || null;
    if (predictedWinner && predictedWinner !== home && predictedWinner !== away) {
      predictedWinner = null;
      delete preds[i];
      predsChanged = true;
    }

    let winner = null;
    if (isFinished) {
      winner = actualWinner;
    } else if (predictedWinner) {
      winner = predictedWinner;
    }

    nodes.push({
      index: i,
      id: meta.id,
      type: meta.type,
      name: meta.name,
      home,
      homeFlag,
      away,
      awayFlag,
      predictedWinner,
      actualWinner,
      winner,
      isFinished,
      realMatch
    });
  }

  if (predsChanged) {
    localStorage.setItem('matchday_bracket_preds', JSON.stringify(preds));
  }

  const finalNode = nodes[14];
  let champion = null;
  let championFlag = "⚽";
  if (finalNode && finalNode.winner && finalNode.winner !== "TBD") {
    champion = finalNode.winner;
    championFlag = getTeamFlag(champion);
  }

  const bracketContainer = document.createElement('div');
  bracketContainer.className = 'bracket-container';

  const headerDiv = document.createElement('div');
  headerDiv.className = 'bracket-header';
  headerDiv.innerHTML = `
    <h3 class="bracket-title">${t('bracket_title', 'Playoff Predictor')}</h3>
    <button class="btn-reset-bracket" id="resetBracketBtn">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
      <span>${t('btn_reset_bracket', 'Reset Predictions')}</span>
    </button>
  `;
  bracketContainer.appendChild(headerDiv);

  const scrollWrapper = document.createElement('div');
  scrollWrapper.className = 'bracket-scroll-wrapper';

  const canvas = document.createElement('div');
  canvas.className = 'bracket-canvas';

  const rounds = [
    { type: 'r16', name: t('round_r16', 'Round of 16'), indices: [0, 1, 2, 3, 4, 5, 6, 7] },
    { type: 'qf', name: t('round_qf', 'Quarter-finals'), indices: [8, 9, 10, 11] },
    { type: 'sf', name: t('round_sf', 'Semi-finals'), indices: [12, 13] },
    { type: 'final', name: t('round_final', 'Final'), indices: [14] }
  ];

  rounds.forEach(round => {
    const roundDiv = document.createElement('div');
    roundDiv.className = 'bracket-round';
    roundDiv.setAttribute('data-round', round.type);

    const titleDiv = document.createElement('div');
    titleDiv.className = 'bracket-round-title';
    titleDiv.textContent = round.name;
    roundDiv.appendChild(titleDiv);

    const matchesDiv = document.createElement('div');
    matchesDiv.className = 'bracket-round-matches';

    round.indices.forEach((nodeIdx) => {
      const node = nodes[nodeIdx];
      const card = document.createElement('div');
      card.className = 'bracket-match-card';
      card.setAttribute('data-node-index', nodeIdx);

      const meta = document.createElement('div');
      meta.className = 'bracket-match-meta';
      meta.textContent = `${t('match', 'Match')} #${node.id}`;
      card.appendChild(meta);

      const makeTeamRow = (teamType, name, flag) => {
        const row = document.createElement('div');
        row.className = 'bracket-team-row';
        row.setAttribute('data-team', name);

        const isTbd = !name || name === 'TBD' || name === 'To be announced';
        if (isTbd) row.classList.add('disabled');

        const isSelected = node.winner === name && !isTbd;
        const isCorrect = node.isFinished && node.actualWinner === name && node.predictedWinner === name;
        const isIncorrect = node.isFinished && node.predictedWinner === name && node.actualWinner !== name;

        if (isSelected) row.classList.add('selected');
        if (isCorrect) row.classList.add('correct');
        if (isIncorrect) row.classList.add('incorrect');

        row.innerHTML = `
          <span class="bracket-flag">${flag || '⚽'}</span>
          <span class="bracket-team-name">${name}</span>
          ${node.isFinished && node.actualWinner === name ? '<span class="winner-badge">✓</span>' : ''}
        `;

        if (!isTbd && !node.isFinished) {
          row.addEventListener('click', (e) => {
            e.stopPropagation();
            preds[nodeIdx] = name;
            localStorage.setItem('matchday_bracket_preds', JSON.stringify(preds));
            renderPlayoffBracket();
          });
        }
        return row;
      };

      card.appendChild(makeTeamRow('home', node.home, node.homeFlag));
      card.appendChild(makeTeamRow('away', node.away, node.awayFlag));
      matchesDiv.appendChild(card);
    });

    roundDiv.appendChild(matchesDiv);
    canvas.appendChild(roundDiv);
  });

  const champRound = document.createElement('div');
  champRound.className = 'bracket-round';
  champRound.setAttribute('data-round', 'champion');

  const champTitle = document.createElement('div');
  champTitle.className = 'bracket-round-title';
  champTitle.textContent = t('round_champion', 'Champion');
  champRound.appendChild(champTitle);

  const champContainer = document.createElement('div');
  champContainer.className = 'bracket-round-champion-container';

  const champCard = document.createElement('div');
  champCard.className = `bracket-champion-card ${champion ? 'has-champion' : ''}`;
  champCard.innerHTML = `
    <div class="champion-label">${t('predicted_champion', 'PREDICTED CHAMPION')}</div>
    <div class="champion-trophy">🏆</div>
    <div class="champion-team-name">${champion || 'TBD'}</div>
    <div class="champion-flag">${championFlag}</div>
  `;
  champContainer.appendChild(champCard);
  champRound.appendChild(champContainer);
  canvas.appendChild(champRound);

  scrollWrapper.appendChild(canvas);
  bracketContainer.appendChild(scrollWrapper);
  DOM.matchesList.appendChild(bracketContainer);

  const resetBtn = bracketContainer.querySelector('#resetBracketBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem('matchday_bracket_preds');
      renderPlayoffBracket();
    });
  }
}

function renderMatchesList() {
  DOM.matchesList.innerHTML = '';
  
  if (state.activeTab === 'standings') {
    renderGroupStandings();
    return;
  }
  if (state.activeTab === 'bracket') {
    renderPlayoffBracket();
    return;
  }
  
  let filteredMatches = [];
  if (state.activeTab === 'live') {
    filteredMatches = state.matches.filter(m => m.status === 'live');
  } else if (state.activeTab === 'results') {
    filteredMatches = state.matches.filter(m => m.status === 'finished');
  } else if (state.activeTab === 'upcoming') {
    filteredMatches = state.matches.filter(m => m.status === 'upcoming');
  } else if (state.activeTab === 'favorites') {
    filteredMatches = state.matches.filter(m => state.subscribedTeams.has(m.home) || state.subscribedTeams.has(m.away));
  } else {
    filteredMatches = [...state.matches];
  }

  // Sort matches: 'live' matches at the very top, then 'upcoming', then 'finished' (results) last.
  // Within the same status, sort chronologically by match number (id).
  filteredMatches.sort((a, b) => {
    const statusOrder = { 'live': 0, 'upcoming': 1, 'finished': 2 };
    const orderA = statusOrder[a.status] !== undefined ? statusOrder[a.status] : 99;
    const orderB = statusOrder[b.status] !== undefined ? statusOrder[b.status] : 99;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.id - b.id;
  });

  if (filteredMatches.length === 0) {
    DOM.matchesList.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
        <p>${t('empty_matches', 'No matches matching your selection.')}</p>
      </div>
    `;
    return;
  }

  filteredMatches.forEach((match, index) => {
    const isLive = match.status === 'live';
    const isFinished = match.status === 'finished';
    const isHomeSubbed = state.subscribedTeams.has(match.home);
    const isAwaySubbed = state.subscribedTeams.has(match.away);
    const hasAnySub = isHomeSubbed || isAwaySubbed;

    const card = document.createElement('div');
    card.className = `match-card ${isLive ? 'live-match' : ''}`;
    card.setAttribute('data-match-id', match.id);
    card.style.setProperty('--card-index', index);
    
    // Status HTML formatter
    let statusHtml = '';
    if (isLive) {
      statusHtml = `<span class="match-status pulse-text"><span class="match-live-dot"></span>${t('modal_status_live', 'LIVE')} • ${match.minute}'</span>`;
    } else if (isFinished) {
      statusHtml = `<span class="match-status">${t('final_result', 'FINAL RESULT')}</span>`;
    } else {
      const label = match.date ? `${translateDate(match.date)}` : t('upcoming_pred', 'Upcoming • Prediction open');
      statusHtml = `<span class="match-status">${label}</span>`;
    }

    // Goal scorers snippet
    let scorersHtml = '';
    const goals = match.events.filter(e => e.type === 'goal');
    if (goals.length > 0) {
      scorersHtml = `<div class="match-highlights">`;
      goals.forEach((g) => {
        scorersHtml += `<span class="scorer">${g.minute}' ⚽ ${g.desc.split(' (')[0]}</span>`;
      });
      scorersHtml += `</div>`;
    }

    const showAlertBtn = isRealTeam(match.home) && isRealTeam(match.away);

    card.innerHTML = `
      <div class="match-meta">
        <span class="match-stage">${translateStage(match.stage)}</span>
        ${statusHtml}
      </div>
      <div class="match-teams-row">
        <div class="team-info">
          <span class="team-flag">${match.homeFlag}</span>
          <span class="team-name">${match.home}</span>
        </div>
        <div class="match-score ${!isLive && !isFinished ? 'score-upcoming' : ''}">
          ${!isLive && !isFinished ? '<span class="time-label">VS</span>' : `
            <span class="score-val">${match.homeScore}</span>
            <span class="score-divider">-</span>
            <span class="score-val">${match.awayScore}</span>
          `}
        </div>
        <div class="team-info team-away">
          <span class="team-name">${match.away}</span>
          <span class="team-flag">${match.awayFlag}</span>
        </div>
      </div>
      ${scorersHtml}
      ${showAlertBtn ? `
      <button class="btn-subscribe ${hasAnySub ? 'active' : ''}" data-team="${match.home}" title="Toggle Alerts">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="${hasAnySub ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span>${hasAnySub ? t('btn_subscribed', 'Subscribed') : t('btn_subscribe', 'Alerts')}</span>
      </button>
      ` : ''}
    `;

    // Stop propagation on button to allow card click
    if (showAlertBtn) {
      card.querySelector('.btn-subscribe').addEventListener('click', (e) => {
        e.stopPropagation();
        // Default to subscribing/unsubscribing home team as representative
        toggleSubscription(match.home);
      });
    }

    card.addEventListener('click', () => openMatchDetails(match.id));

    DOM.matchesList.appendChild(card);
  });
}

// --- News Feed Handlers & Search Engine ---
DOM.newsSearch.addEventListener('input', (e) => {
  renderNewsGrid();
});

const newsChips = document.querySelectorAll('.news-categories .chip');
newsChips.forEach((chip) => {
  chip.addEventListener('click', (e) => {
    newsChips.forEach(c => c.classList.remove('active'));
    e.currentTarget.classList.add('active');
    state.activeNewsCategory = e.currentTarget.dataset.category;
    renderNewsGrid();
  });
});

function renderNewsGrid() {
  DOM.newsGrid.innerHTML = '';
  const query = DOM.newsSearch.value.toLowerCase().trim();

  // Filter by selected language
  let filtered = state.news.filter(n => (n.lang || 'en') === state.lang);
  
  // Category filter
  if (state.activeNewsCategory !== 'all') {
    filtered = filtered.filter(n => n.category === state.activeNewsCategory);
  }

  // Search filter
  if (query) {
    filtered = filtered.filter(n => 
      n.title.toLowerCase().includes(query) || 
      n.snippet.toLowerCase().includes(query)
    );
  }

  // Sort news: latest news at the top (smaller ID represents newer articles in both mock and scraped datasets)
  filtered.sort((a, b) => a.id - b.id);

  if (filtered.length === 0) {
    DOM.newsGrid.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <p>${t('empty_news', 'No news matches search parameters.')}</p>
      </div>
    `;
    return;
  }

  // Prepend short header in the scroll list container itself
  const feedHeader = document.createElement('h3');
  feedHeader.className = 'feed-scroll-header';
  feedHeader.textContent = t('latest_stories', 'Latest World Cup Stories');
  DOM.newsGrid.appendChild(feedHeader);

  filtered.forEach((item, index) => {
    const article = document.createElement('article');
    article.className = 'news-card';
    article.style.setProperty('--card-index', index);
    
    let tagLabel = t('category_tactics', 'Tactics');
    if (item.category === 'injury') tagLabel = t('category_injury', 'Injury Report');
    if (item.category === 'lineup') tagLabel = t('category_lineup', 'Squads');
    if (item.category === 'transfer') tagLabel = t('category_transfer', 'Transfers');
    if (item.category === 'press') tagLabel = t('category_press', 'Press Talk');
    if (item.category === 'rules') tagLabel = t('category_rules', 'Rules & VAR');
    if (item.category === 'tactics') tagLabel = t('category_tactics', 'Tactics');

    const hasImage = item.image && item.image !== '';
    const newsSource = item.source || 'World Cup Feed';

    article.innerHTML = `
      <div class="news-img-container">
        ${hasImage ? `
          <img src="${item.image}" alt="${item.title}" class="news-thumbnail" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="news-img-fallback" style="background: ${item.color}; display: none; width: 100%; height: 100%; align-items: center; justify-content: center;">
            <div class="news-icon-overlay">${item.overlay}</div>
          </div>
        ` : `
          <div class="news-img-fallback" style="background: ${item.color}; display: flex; width: 100%; height: 100%; align-items: center; justify-content: center;">
            <div class="news-icon-overlay">${item.overlay}</div>
          </div>
        `}
      </div>
      <div class="news-content">
        <div class="news-meta">
          <span class="news-tag ${item.category}-tag">${tagLabel}</span>
          <span class="news-source">${newsSource}</span>
          <span class="news-time">• ${translateTime(item.time)}</span>
        </div>
        <h3 class="news-headline">${item.title}</h3>
        <p class="news-snippet">${item.snippet}</p>
      </div>
    `;

    article.addEventListener('click', () => {
      openNewsDetails(item.id);
    });

    DOM.newsGrid.appendChild(article);
  });
}

// --- Match Details Modal ---
function setupModalHandlers() {
  const closeModal = () => {
    DOM.matchModal.classList.remove('active');
    DOM.modalBackdrop.classList.remove('active');
    state.activeModalMatchId = null;
    const profileOverlay = document.getElementById('playerProfileOverlay');
    if (profileOverlay) profileOverlay.remove();
  };

  DOM.modalClose.addEventListener('click', closeModal);
  DOM.modalBackdrop.addEventListener('click', closeModal);

  const closeNewsModal = () => {
    DOM.newsModal.classList.remove('active');
    DOM.newsModalBackdrop.classList.remove('active');
  };

  DOM.newsModalClose.addEventListener('click', closeNewsModal);
  DOM.newsModalBackdrop.addEventListener('click', closeNewsModal);

  // Modal tabs click logic
  const modalTabs = document.querySelectorAll('.modal-tab-btn');
  modalTabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      modalTabs.forEach(t => t.classList.remove('active'));
      e.currentTarget.classList.add('active');
      state.activeModalTab = e.currentTarget.dataset.modalTab;
      renderModalContent();
    });
  });
}

function setupPartnerBanner() {
  const partnerBanner = document.getElementById('partnerBanner');
  const partnerBannerClose = document.getElementById('partnerBannerClose');
  if (partnerBanner && partnerBannerClose) {
    if (localStorage.getItem('matchday_partner_banner_dismissed') === 'true') {
      partnerBanner.classList.add('hidden');
    } else {
      partnerBanner.classList.remove('hidden');
    }
    partnerBannerClose.addEventListener('click', () => {
      partnerBanner.classList.add('hidden');
      localStorage.setItem('matchday_partner_banner_dismissed', 'true');
    });
  }
}

function openMatchDetails(matchId) {
  state.activeModalMatchId = matchId;
  state.activeModalTab = 'timeline'; // Reset to timeline tab
  state.activeLineupTeam = 'home'; // Reset to home team lineup
  
  // Set tab active state
  document.querySelectorAll('.modal-tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.modalTab === 'timeline') btn.classList.add('active');
  });

  // Render content
  renderModalContent();

  // Show overlay
  DOM.matchModal.classList.add('active');
  DOM.modalBackdrop.classList.add('active');
}

function openNewsDetails(newsId) {
  const item = state.news.find(n => n.id === newsId);
  if (!item) return;

  // Render modal header content
  DOM.newsModalHeader.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding-right: 24px;">
      <span class="news-tag ${item.category}-tag" style="padding: 3px 8px; font-size: 10px; font-weight: 700; border-radius: 4px; text-transform: uppercase;">
        ${item.category === 'injury' ? t('category_injury', 'Injury Report') : 
          item.category === 'lineup' ? t('category_lineup', 'Squads') : 
          item.category === 'transfer' ? t('category_transfer', 'Transfers') : 
          item.category === 'press' ? t('category_press', 'Press Talk') : 
          item.category === 'rules' ? t('category_rules', 'Rules & VAR') : t('category_tactics', 'Tactics')}
      </span>
      <span class="news-time" style="font-size: 11px; color: var(--text-muted);">${translateTime(item.time)}</span>
    </div>
  `;

  // Render modal body content
  DOM.newsModalBody.innerHTML = `
    ${item.image ? `
      <div style="width: 100%; height: 160px; border-radius: 10px; overflow: hidden; margin-bottom: 12px; border: 1px solid var(--border-color); flex-shrink: 0;">
        <img src="${item.image}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
    ` : ''}
    <h3 style="font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text-primary); line-height: 1.35;">
      ${item.title}
    </h3>
    <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-top: 8px;">
      ${item.snippet || t('read_full_story_desc', 'Click "Read Full Story" to read this breaking news article directly on the source website.')}
    </p>
    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px; border-top: 1px solid var(--border-color); padding-top: 12px; gap: 10px; flex-shrink: 0;">
      <span style="font-size: 11px; font-weight: 600; color: var(--primary);">${t('source', 'Source')}: ${item.source}</span>
      ${item.link ? `
        <a href="${item.link}" target="_blank" rel="noopener noreferrer" style="
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, var(--primary), #059669);
          color: #000;
          text-decoration: none;
          font-size: 11px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 6px;
          box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);
          transition: all 0.2s;
        " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 14px rgba(16, 185, 129, 0.4)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 10px rgba(16, 185, 129, 0.25)';">
          ${t('read_full_story', 'Read Full Story ↗')}
        </a>
      ` : ''}
    </div>
  `;

  // Show overlay
  DOM.newsModal.classList.add('active');
  DOM.newsModalBackdrop.classList.add('active');
}

// --- Visual Soccer Pitch Coordinates & Team Colors Configuration ---
const FORMATION_COORDINATES = [
  { left: 50, top: 85, pos: "GK" },  // Goalkeeper
  { left: 15, top: 65, pos: "LB" },  // Left Back
  { left: 38, top: 67, pos: "CB" },  // Center Back 1
  { left: 62, top: 67, pos: "CB" },  // Center Back 2
  { left: 85, top: 65, pos: "RB" },  // Right Back
  { left: 25, top: 45, pos: "LM" },  // Left Midfielder
  { left: 50, top: 48, pos: "CM" },  // Center Midfielder
  { left: 75, top: 45, pos: "RM" },  // Right Midfielder
  { left: 20, top: 22, pos: "LW" },  // Left Winger
  { left: 50, top: 18, pos: "ST" },  // Striker
  { left: 80, top: 22, pos: "RW" }   // Right Winger
];

const TEAM_COLORS = {
  "USA": { primary: "#0a3161", text: "#ffffff", border: "#ffffff" },
  "England": { primary: "#ffffff", text: "#000000", border: "#cf081b" },
  "Mexico": { primary: "#006847", text: "#ffffff", border: "#ffffff" },
  "Germany": { primary: "#ffffff", text: "#000000", border: "#000000" },
  "Canada": { primary: "#ff0000", text: "#ffffff", border: "#ffffff" },
  "Bosnia and Herzegovina": { primary: "#002F6C", text: "#FFCD00", border: "#FFCD00" },
  "Korea Republic": { primary: "#e4002b", text: "#ffffff", border: "#ffffff" },
  "South Korea": { primary: "#e4002b", text: "#ffffff", border: "#ffffff" },
  "Czechia": { primary: "#11457e", text: "#ffffff", border: "#d7141a" },
  "Brazil": { primary: "#fedf00", text: "#002776", border: "#009c3b" },
  "Argentina": { primary: "#75aadb", text: "#ffffff", border: "#ffffff" },
  "Spain": { primary: "#c60b1e", text: "#fec60b", border: "#fec60b" },
  "France": { primary: "#002395", text: "#ffffff", border: "#e1000f" },
  "Italy": { primary: "#0064aa", text: "#ffffff", border: "#ffffff" },
  "Netherlands": { primary: "#ff4f00", text: "#ffffff", border: "#ffffff" },
  "Portugal": { primary: "#ff0000", text: "#ffffff", border: "#118011" },
  "Sweden": { primary: "#006aa7", text: "#fecc00", border: "#fecc00" },
  "Japan": { primary: "#001871", text: "#ffffff", border: "#ffffff" },
  "South Africa": { primary: "#007a4d", text: "#ffffff", border: "#ffb81c" },
  "Morocco": { primary: "#c1272d", text: "#ffffff", border: "#006233" },
  "Belgium": { primary: "#e30613", text: "#ffffff", border: "#ffd900" },
  "Croatia": { primary: "#ff0000", text: "#ffffff", border: "#ffffff" },
  "Saudi Arabia": { primary: "#006c35", text: "#ffffff", border: "#ffffff" },
  "Uruguay": { primary: "#5cb6e4", text: "#ffffff", border: "#ffffff" },
  "Colombia": { primary: "#fcd116", text: "#003893", border: "#c8102e" },
  "Ecuador": { primary: "#ffdd00", text: "#001489", border: "#da291c" },
  "Australia": { primary: "#002b49", text: "#ffcd00", border: "#00843d" },
  "Senegal": { primary: "#00853f", text: "#ffffff", border: "#fdd116" }
};

// --- Live Win Probability Calculations ---
function getBaseProbability(match) {
  if (match.predictions) {
    return {
      home: match.predictions.home,
      draw: match.predictions.draw,
      away: match.predictions.away
    };
  }

  let hash = 0;
  const str = match.home + match.away + (match.id || '');
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const homeMod = (hash % 15) - 7.5; // -7.5 to +7.5
  const awayMod = ((hash >> 4) % 15) - 7.5;

  let home = 38 + homeMod;
  let away = 34 + awayMod;
  let draw = 100 - home - away;

  home = Math.round(home);
  away = Math.round(away);
  draw = 100 - home - away;

  return { home, draw, away };
}

function calculateWinProbability(match) {
  if (match.status === 'finished') {
    if (match.homeScore > match.awayScore) {
      return { home: 100, draw: 0, away: 0 };
    } else if (match.homeScore < match.awayScore) {
      return { home: 0, draw: 0, away: 100 };
    } else {
      return { home: 0, draw: 100, away: 0 };
    }
  }

  if (match.status === 'live') {
    const base = getBaseProbability(match);
    const scoreDiff = match.homeScore - match.awayScore;
    const minute = match.minute || 0;

    let home = base.home;
    let draw = base.draw;
    let away = base.away;

    if (scoreDiff > 0) {
      const factor = scoreDiff * 25;
      home += factor;
      away -= factor * 0.8;
      draw -= factor * 0.2;
    } else if (scoreDiff < 0) {
      const factor = Math.abs(scoreDiff) * 25;
      away += factor;
      home -= factor * 0.8;
      draw -= factor * 0.2;
    }

    const timeProgress = minute / 90;
    if (scoreDiff === 0) {
      draw = draw + (90 - draw) * timeProgress;
      const remaining = 100 - draw;
      const ratio = home + away > 0 ? home / (home + away) : 0.5;
      home = remaining * ratio;
      away = remaining * (1 - ratio);
    } else {
      if (scoreDiff > 0) {
        home = home + (100 - home) * timeProgress;
        draw = draw * (1 - timeProgress);
        away = 100 - home - draw;
      } else {
        away = away + (100 - away) * timeProgress;
        draw = draw * (1 - timeProgress);
        home = 100 - away - draw;
      }
    }

    home = Math.max(1, Math.min(98, home));
    away = Math.max(1, Math.min(98, away));
    draw = Math.max(1, Math.min(98, draw));

    const sum = home + draw + away;
    home = Math.round((home / sum) * 100);
    away = Math.round((away / sum) * 100);
    draw = 100 - home - away;

    return { home, draw, away };
  }

  return getBaseProbability(match);
}

// --- Player Profile Cards Logic ---
const REAL_PLAYER_STATS = {
  "Lionel Messi": { overall: 90, club: "Inter Miami", caps: 180, goals: 106, stats: { PAC: 80, SHO: 87, PAS: 90, DRI: 94, DEF: 33, PHY: 64 }, age: 38, height: "170 cm", position: "Forward", posCode: "ST" },
  "Cristiano Ronaldo": { overall: 86, club: "Al Nassr", caps: 205, goals: 128, stats: { PAC: 77, SHO: 88, PAS: 75, DRI: 80, DEF: 34, PHY: 74 }, age: 41, height: "187 cm", position: "Forward", posCode: "ST" },
  "Kylian Mbappé": { overall: 91, club: "Real Madrid", caps: 77, goals: 46, stats: { PAC: 97, SHO: 90, PAS: 80, DRI: 92, DEF: 36, PHY: 78 }, age: 27, height: "178 cm", position: "Forward", posCode: "LW" },
  "Jude Bellingham": { overall: 90, club: "Real Madrid", caps: 29, goals: 3, stats: { PAC: 80, SHO: 82, PAS: 83, DRI: 88, DEF: 78, PHY: 82 }, age: 22, height: "186 cm", position: "Midfielder", posCode: "CM" },
  "Vinícius Jr.": { overall: 90, club: "Real Madrid", caps: 28, goals: 3, stats: { PAC: 95, SHO: 84, PAS: 81, DRI: 91, DEF: 29, PHY: 68 }, age: 25, height: "176 cm", position: "Forward", posCode: "LW" },
  "Erling Haaland": { overall: 91, club: "Manchester City", caps: 31, goals: 27, stats: { PAC: 89, SHO: 93, PAS: 66, DRI: 80, DEF: 45, PHY: 88 }, age: 25, height: "194 cm", position: "Forward", posCode: "ST" },
  "Kevin De Bruyne": { overall: 91, club: "Manchester City", caps: 101, goals: 28, stats: { PAC: 72, SHO: 88, PAS: 94, DRI: 87, DEF: 65, PHY: 78 }, age: 34, height: "181 cm", position: "Midfielder", posCode: "CM" },
  "Harry Kane": { overall: 90, club: "Bayern Munich", caps: 89, goals: 62, stats: { PAC: 69, SHO: 93, PAS: 84, DRI: 83, DEF: 49, PHY: 83 }, age: 32, height: "188 cm", position: "Forward", posCode: "ST" },
  "Robert Lewandowski": { overall: 88, club: "Barcelona", caps: 148, goals: 82, stats: { PAC: 75, SHO: 88, PAS: 72, DRI: 83, DEF: 44, PHY: 79 }, age: 37, height: "185 cm", position: "Forward", posCode: "ST" },
  "Mohamed Salah": { overall: 89, club: "Liverpool", caps: 96, goals: 54, stats: { PAC: 89, SHO: 87, PAS: 82, DRI: 88, DEF: 45, PHY: 75 }, age: 33, height: "175 cm", position: "Forward", posCode: "RW" },
  "Neymar Jr.": { overall: 89, club: "Al Hilal", caps: 128, goals: 79, stats: { PAC: 86, SHO: 83, PAS: 85, DRI: 93, DEF: 37, PHY: 61 }, age: 34, height: "175 cm", position: "Forward", posCode: "LW" },
  "Son Heung-min": { overall: 87, club: "Tottenham Hotspur", caps: 123, goals: 44, stats: { PAC: 87, SHO: 88, PAS: 80, DRI: 84, DEF: 42, PHY: 70 }, age: 33, height: "183 cm", position: "Forward", posCode: "LW" },
  "Jamal Musiala": { overall: 87, club: "Bayern Munich", caps: 27, goals: 2, stats: { PAC: 84, SHO: 82, PAS: 84, DRI: 90, DEF: 63, PHY: 64 }, age: 23, height: "184 cm", position: "Midfielder", posCode: "CAM" },
  "Florian Wirtz": { overall: 87, club: "Bayer Leverkusen", caps: 18, goals: 1, stats: { PAC: 81, SHO: 81, PAS: 87, DRI: 89, DEF: 61, PHY: 62 }, age: 23, height: "176 cm", position: "Midfielder", posCode: "CAM" },
  "Antoine Griezmann": { overall: 87, club: "Atletico Madrid", caps: 127, goals: 44, stats: { PAC: 76, SHO: 84, PAS: 87, DRI: 86, DEF: 58, PHY: 72 }, age: 35, height: "176 cm", position: "Forward", posCode: "ST" },
  "Luka Modrić": { overall: 86, club: "Real Madrid", caps: 174, goals: 24, stats: { PAC: 72, SHO: 76, PAS: 89, DRI: 86, DEF: 72, PHY: 66 }, age: 40, height: "172 cm", position: "Midfielder", posCode: "CM" },
  "Santiago Giménez": { overall: 80, club: "Feyenoord", caps: 25, goals: 4, stats: { PAC: 81, SHO: 81, PAS: 65, DRI: 78, DEF: 32, PHY: 74 }, age: 25, height: "182 cm", position: "Forward", posCode: "ST" },
  "Edson Álvarez": { overall: 81, club: "West Ham United", caps: 74, goals: 5, stats: { PAC: 68, SHO: 57, PAS: 71, DRI: 73, DEF: 82, PHY: 84 }, age: 28, height: "187 cm", position: "Midfielder", posCode: "CDM" },
  "Christian Pulisic": { overall: 83, club: "AC Milan", caps: 66, goals: 29, stats: { PAC: 87, SHO: 79, PAS: 76, DRI: 85, DEF: 37, PHY: 62 }, age: 27, height: "178 cm", position: "Forward", posCode: "LW" },
  "Alisson": { overall: 89, club: "Liverpool", caps: 63, goals: 0, stats: { PAC: 89, SHO: 86, PAS: 85, DRI: 89, DEF: 47, PHY: 90 }, age: 33, height: "193 cm", position: "Goalkeeper", posCode: "GK" },
  "Lunin": { overall: 81, club: "Real Madrid", caps: 11, goals: 0, stats: { PAC: 81, SHO: 79, PAS: 83, DRI: 80, DEF: 44, PHY: 82 }, age: 27, height: "191 cm", position: "Goalkeeper", posCode: "GK" },
  "Rodri": { overall: 91, club: "Manchester City", caps: 50, goals: 4, stats: { PAC: 58, SHO: 73, PAS: 86, DRI: 80, DEF: 89, PHY: 84 }, age: 30, height: "190 cm", position: "Midfielder", posCode: "CDM" },
  "Pedri": { overall: 86, club: "Barcelona", caps: 24, goals: 2, stats: { PAC: 78, SHO: 72, PAS: 87, DRI: 87, DEF: 68, PHY: 64 }, age: 23, height: "174 cm", position: "Midfielder", posCode: "CM" },
  "Lamine Yamal": { overall: 84, club: "Barcelona", caps: 14, goals: 3, stats: { PAC: 89, SHO: 79, PAS: 81, DRI: 88, DEF: 36, PHY: 60 }, age: 18, height: "178 cm", position: "Forward", posCode: "RW" },
  "Emiliano Martínez": { overall: 87, club: "Aston Villa", caps: 38, goals: 0, stats: { PAC: 85, SHO: 83, PAS: 80, DRI: 87, DEF: 45, PHY: 85 }, age: 33, height: "195 cm", position: "Goalkeeper", posCode: "GK" },
  "Lautaro Martínez": { overall: 87, club: "Inter Milan", caps: 56, goals: 22, stats: { PAC: 80, SHO: 88, PAS: 72, DRI: 84, DEF: 48, PHY: 83 }, age: 28, height: "174 cm", position: "Forward", posCode: "ST" },
  "Julián Álvarez": { overall: 83, club: "Atletico Madrid", caps: 31, goals: 7, stats: { PAC: 81, SHO: 82, PAS: 78, DRI: 83, DEF: 45, PHY: 76 }, age: 26, height: "170 cm", position: "Forward", posCode: "ST" },
  "Bukayo Saka": { overall: 87, club: "Arsenal", caps: 33, goals: 11, stats: { PAC: 86, SHO: 81, PAS: 82, DRI: 87, DEF: 45, PHY: 68 }, age: 24, height: "178 cm", position: "Forward", posCode: "RW" },
  "Phil Foden": { overall: 89, club: "Manchester City", caps: 34, goals: 4, stats: { PAC: 86, SHO: 85, PAS: 86, DRI: 89, DEF: 57, PHY: 66 }, age: 26, height: "171 cm", position: "Midfielder", posCode: "CAM" },
  "Declan Rice": { overall: 87, club: "Arsenal", caps: 51, goals: 3, stats: { PAC: 76, SHO: 69, PAS: 78, DRI: 80, DEF: 85, PHY: 83 }, age: 27, height: "185 cm", position: "Midfielder", posCode: "CDM" },
  "Virgil van Dijk": { overall: 89, club: "Liverpool", caps: 66, goals: 7, stats: { PAC: 78, SHO: 60, PAS: 71, DRI: 72, DEF: 89, PHY: 86 }, age: 34, height: "193 cm", position: "Defender", posCode: "CB" },
  "Bruno Fernandes": { overall: 87, club: "Manchester United", caps: 64, goals: 20, stats: { PAC: 72, SHO: 84, PAS: 88, DRI: 83, DEF: 69, PHY: 77 }, age: 31, height: "179 cm", position: "Midfielder", posCode: "CAM" },
  "Bernardo Silva": { overall: 88, club: "Manchester City", caps: 88, goals: 11, stats: { PAC: 69, SHO: 77, PAS: 86, DRI: 92, DEF: 69, PHY: 64 }, age: 31, height: "173 cm", position: "Midfielder", posCode: "CM" },
  "Alphonso Davies": { overall: 84, club: "Bayern Munich", caps: 47, goals: 15, stats: { PAC: 95, SHO: 68, PAS: 77, DRI: 84, DEF: 74, PHY: 77 }, age: 25, height: "183 cm", position: "Defender", posCode: "LB" }
};

function generatePlayerProfile(playerName, teamName, posCode) {
  let hash = 0;
  for (let i = 0; i < playerName.length; i++) {
    hash = playerName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);

  // Position label
  let position = 'Midfielder';
  if (posCode === 'GK') position = t('pos_goalkeeper', 'Goalkeeper');
  else if (posCode === 'DF' || posCode === 'CB' || posCode === 'LB' || posCode === 'RB') position = t('pos_defender', 'Defender');
  else if (posCode === 'MF' || posCode === 'CM' || posCode === 'LM' || posCode === 'RM') position = t('pos_midfielder', 'Midfielder');
  else if (posCode === 'FW' || posCode === 'ST' || posCode === 'LW' || posCode === 'RW') position = t('pos_forward', 'Forward');
  else {
    const positions = [t('pos_forward', 'Forward'), t('pos_midfielder', 'Midfielder'), t('pos_defender', 'Defender'), t('pos_goalkeeper', 'Goalkeeper')];
    position = positions[absHash % positions.length];
  }

  // Check real database first
  const realData = REAL_PLAYER_STATS[playerName];

  // Tournament stats
  const tourneyGoals = (position === t('pos_forward', 'Forward')) ? (absHash % 3) : (absHash % 8 === 0 ? 1 : 0);
  const tourneyAssists = (position === t('pos_midfielder', 'Midfielder')) ? (absHash % 3) : (absHash % 7 === 0 ? 1 : 0);
  const tourneyRating = (6.2 + (absHash % 23) / 10).toFixed(1);

  if (realData) {
    return {
      name: playerName,
      team: teamName,
      flag: getTeamFlag(teamName),
      position: realData.position,
      posCode: realData.posCode,
      overall: realData.overall,
      age: realData.age,
      height: realData.height,
      club: realData.club,
      caps: realData.caps,
      goals: realData.goals,
      stats: realData.stats,
      tournament: {
        goals: tourneyGoals,
        assists: tourneyAssists,
        yellowCards: absHash % 6 === 0 ? 1 : 0,
        redCards: absHash % 19 === 0 ? 1 : 0,
        rating: tourneyRating
      }
    };
  }

  // Stats ranges based on position to make it realistic
  let basePace = 55, baseSho = 45, basePas = 50, baseDri = 50, baseDef = 35, basePhy = 55;
  if (posCode === 'FW' || position === t('pos_forward', 'Forward')) {
    basePace = 75; baseSho = 70; basePas = 60; baseDri = 70; baseDef = 25; basePhy = 60;
  } else if (posCode === 'MF' || position === t('pos_midfielder', 'Midfielder')) {
    basePace = 65; baseSho = 60; basePas = 75; baseDri = 70; baseDef = 50; basePhy = 60;
  } else if (posCode === 'DF' || position === t('pos_defender', 'Defender')) {
    basePace = 60; baseSho = 40; basePas = 55; baseDri = 55; baseDef = 75; basePhy = 75;
  } else if (posCode === 'GK' || position === t('pos_goalkeeper', 'Goalkeeper')) {
    basePace = 50; baseSho = 20; basePas = 55; baseDri = 50; baseDef = 80; basePhy = 65;
  }

  const pace = basePace + (absHash % 21);
  const shooting = baseSho + ((absHash >> 1) % 21);
  const passing = basePas + ((absHash >> 2) % 21);
  const dribbling = baseDri + ((absHash >> 3) % 21);
  const defending = baseDef + ((absHash >> 4) % 16);
  const physical = basePhy + ((absHash >> 5) % 21);

  const overall = Math.round((pace + shooting + passing + dribbling + defending + physical) / 6) + 2;

  const age = 20 + (absHash % 16); // 20-35
  const height = 168 + (absHash % 28); // 168-195 cm
  const clubList = ["Real Madrid", "Barcelona", "Manchester City", "Arsenal", "Bayern Munich", "PSG", "Liverpool", "Juventus", "Inter Milan", "Chelsea", "Manchester United", "Atletico Madrid", "AC Milan", "Dortmund", "Porto", "Ajax"];
  const club = clubList[absHash % clubList.length];

  const caps = 5 + (absHash % 115); // 5-120
  const goals = Math.max(0, Math.floor(caps * (0.05 + (absHash % 30) / 100)));

  return {
    name: playerName,
    team: teamName,
    flag: getTeamFlag(teamName),
    position,
    posCode: posCode || (position === t('pos_goalkeeper', 'Goalkeeper') ? 'GK' : position === t('pos_defender', 'Defender') ? 'DF' : position === t('pos_midfielder', 'Midfielder') ? 'MF' : 'FW'),
    overall,
    age,
    height: `${height} cm`,
    club,
    caps,
    goals,
    stats: {
      PAC: pace,
      SHO: shooting,
      PAS: passing,
      DRI: dribbling,
      DEF: defending,
      PHY: physical
    },
    tournament: {
      goals: tourneyGoals,
      assists: tourneyAssists,
      yellowCards: absHash % 6 === 0 ? 1 : 0,
      redCards: absHash % 19 === 0 ? 1 : 0,
      rating: tourneyRating
    }
  };
}

function showPlayerProfile(playerName, teamName, posCode) {
  const existing = document.getElementById('playerProfileOverlay');
  if (existing) existing.remove();

  const profile = generatePlayerProfile(playerName, teamName, posCode);
  
  let tierClass = 'tier-bronze';
  if (profile.overall >= 85) tierClass = 'tier-gold';
  else if (profile.overall >= 75) tierClass = 'tier-silver';

  const colors = TEAM_COLORS[teamName] || { primary: 'var(--primary)', text: '#ffffff', border: '#ffffff' };
  const initials = playerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const overlay = document.createElement('div');
  overlay.className = 'player-profile-overlay';
  overlay.id = 'playerProfileOverlay';

  const content = document.createElement('div');
  content.className = 'player-profile-card glassmorphism';
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  content.innerHTML = `
    <button class="player-profile-close" id="profileCloseBtn">&times;</button>
    
    <div class="profile-main-layout">
      <!-- Left side: FUT-style card -->
      <div class="fut-card-wrapper">
        <div class="fut-player-card ${tierClass}" style="--team-color: ${colors.primary}">
          <div class="fut-card-glow"></div>
          <div class="fut-card-inner">
            <div class="fut-top-row">
              <div class="fut-overall">${profile.overall}</div>
              <div class="fut-position">${profile.posCode}</div>
              <div class="fut-flag">${profile.flag}</div>
            </div>
            <div class="fut-avatar">${initials}</div>
            <div class="fut-name">${profile.name.split(' ').pop()}</div>
            <div class="fut-divider"></div>
            <div class="fut-stats-grid">
              <div>${profile.stats.PAC} PAC</div>
              <div>${profile.stats.DRI} DRI</div>
              <div>${profile.stats.SHO} SHO</div>
              <div>${profile.stats.DEF} DEF</div>
              <div>${profile.stats.PAS} PAS</div>
              <div>${profile.stats.PHY} PHY</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right side: Bio & scout data -->
      <div class="profile-details-wrapper">
        <h4 class="profile-player-name">${profile.name}</h4>
        <div class="profile-player-subtitle">${profile.flag} ${profile.team} • ${profile.position}</div>
        
        <div class="profile-bio-grid">
          <div class="bio-item">
            <span class="bio-label">${t('stat_age', 'Age')}</span>
            <span class="bio-value">${profile.age}</span>
          </div>
          <div class="bio-item">
            <span class="bio-label">${t('stat_height', 'Height')}</span>
            <span class="bio-value">${profile.height}</span>
          </div>
          <div class="bio-item">
            <span class="bio-label">${t('stat_club', 'Club')}</span>
            <span class="bio-value">${profile.club}</span>
          </div>
          <div class="bio-item">
            <span class="bio-label">${t('stat_caps', 'Caps')}</span>
            <span class="bio-value">${profile.caps}</span>
          </div>
          <div class="bio-item">
            <span class="bio-label">${t('stat_goals', 'Goals')}</span>
            <span class="bio-value">${profile.goals}</span>
          </div>
        </div>
        
        <div class="profile-section-title">${t('wc_stats', 'World Cup 2026 Stats')}</div>
        <div class="profile-wc-grid">
          <div class="wc-stat-box">
            <div class="wc-stat-num">${profile.tournament.goals}</div>
            <div class="wc-stat-label">${t('wc_goals', 'Goals')}</div>
          </div>
          <div class="wc-stat-box">
            <div class="wc-stat-num">${profile.tournament.assists}</div>
            <div class="wc-stat-label">${t('wc_assists', 'Assists')}</div>
          </div>
          <div class="wc-stat-box">
            <div class="wc-stat-num">${profile.tournament.yellowCards}Y / ${profile.tournament.redCards}R</div>
            <div class="wc-stat-label">${t('wc_cards', 'Cards')}</div>
          </div>
          <div class="wc-stat-box">
            <div class="wc-stat-num" style="color: var(--secondary)">${profile.tournament.rating}</div>
            <div class="wc-stat-label">${t('wc_rating', 'Avg Rating')}</div>
          </div>
        </div>

        <div class="profile-section-title">${t('modal_stats', 'Stats')}</div>
        <div class="scout-bars">
          ${Object.entries(profile.stats).map(([label, value]) => `
            <div class="scout-bar-row">
              <span class="scout-bar-label">${label}</span>
              <div class="scout-bar-bg">
                <div class="scout-bar-fill" data-value="${value}" style="width: 0%; --bar-color: ${colors.primary}"></div>
              </div>
              <span class="scout-bar-val">${value}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  overlay.appendChild(content);
  
  document.body.appendChild(overlay);
  
  const closeBtn = content.querySelector('#profileCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => overlay.remove());
  }

  setTimeout(() => {
    content.querySelectorAll('.scout-bar-fill').forEach(fill => {
      fill.style.width = fill.getAttribute('data-value') + '%';
    });
  }, 50);

  // Fetch player image from TheSportsDB dynamically
  const fetchPlayerPhoto = async () => {
    const avatarEl = content.querySelector('.fut-avatar');
    const setSilhouette = () => {
      if (avatarEl) {
        avatarEl.innerHTML = `<img src="https://cdn.sofifa.net/players/notfound_0_120.png" alt="${playerName}" style="opacity: 0.7; filter: brightness(0.85); width: 85%; height: 85%; object-fit: contain;">`;
        avatarEl.style.border = 'none';
        avatarEl.style.background = 'none';
      }
    };

    try {
      const url = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(playerName)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.player && data.player.length > 0) {
          const pData = data.player.find(p => p.strTeam === teamName || p.strNationality === teamName) || data.player[0];
          const imgUrl = pData.strCutout || pData.strThumb;
          if (imgUrl) {
            if (avatarEl) {
              avatarEl.innerHTML = `<img src="${imgUrl}" alt="${playerName}" style="opacity: 0; transition: opacity 0.3s ease; width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
              const img = avatarEl.querySelector('img');
              img.onload = () => {
                img.style.opacity = '1';
                avatarEl.style.border = 'none';
                avatarEl.style.background = 'none';
              };
              return; // successfully loaded real photo
            }
          }
        }
      }
    } catch (e) {
      console.warn("Failed to fetch player photo from TheSportsDB:", e);
    }
    // If we reach here, either fetch failed or player/image not found
    setSilhouette();
  };
  fetchPlayerPhoto();
}

function renderModalContent() {
  const match = state.matches.find(m => m.id === state.activeModalMatchId);
  if (!match) return;

  // Render header values
  let statusText = '';
  if (match.status === 'live') {
    statusText = `${t('modal_status_live', 'LIVE')} • ${match.minute}'`;
  } else if (match.status === 'finished') {
    statusText = t('modal_status_fulltime', 'FULL TIME RESULT');
  } else {
    statusText = t('modal_status_upcoming', 'UPCOMING GAME');
  }

  DOM.modalHeader.innerHTML = `
    <span class="modal-stage">${translateStage(match.stage)}</span>
    <div class="modal-teams-scores">
      <div class="modal-team">
        <span class="flag">${match.homeFlag}</span>
        <span class="name">${match.home}</span>
      </div>
      <div class="modal-score-box">
        ${match.status === 'upcoming' ? 'VS' : `${match.homeScore} : ${match.awayScore}`}
      </div>
      <div class="modal-team">
        <span class="flag">${match.awayFlag}</span>
        <span class="name">${match.away}</span>
      </div>
    </div>
    <span class="modal-status-text">${statusText}</span>
  `;

  // Render tab contents
  DOM.modalTabContent.innerHTML = '';
  if (state.activeModalTab === 'timeline') {
    // 1. Timeline Tab
    if (match.status === 'upcoming') {
      DOM.modalTabContent.innerHTML = `
        <div class="empty-state">
          <span>📅</span>
          <p>${t('modal_empty_timeline_upcoming', "This match hasn't started yet. Timeline updates will populate live when kickoff begins.")}</p>
        </div>
      `;
    } else {
      if (match.events.length === 0) {
        DOM.modalTabContent.innerHTML = `
          <div class="empty-state">
            <span>⏱️</span>
            <p>${t('modal_empty_timeline_live', 'Kickoff! No major actions yet.')}</p>
          </div>
        `;
      } else {
        // Sort events chronologically descending
        const sortedEvents = [...match.events].sort((a,b) => b.minute - a.minute);
        sortedEvents.forEach((ev) => {
          const row = document.createElement('div');
          row.className = 'timeline-event-row';
          row.innerHTML = `
            <span class="event-time">${ev.minute}'</span>
            <span class="event-desc"><strong>${ev.team}:</strong> ${ev.desc}</span>
          `;
          DOM.modalTabContent.appendChild(row);
        });
      }
    }
  } else if (state.activeModalTab === 'stats') {
    // 2. Stats Tab
    
    // Add dynamic Win Probability Gauge
    const prob = calculateWinProbability(match);
    const probRow = document.createElement('div');
    probRow.className = 'probability-gauge-container';
    probRow.innerHTML = `
      <div class="probability-gauge-title">${t('win_probability', 'Win Probability')}</div>
      <div class="probability-bar">
        <div class="prob-bar-home" style="width: ${prob.home}%" title="${match.home}: ${prob.home}%"></div>
        <div class="prob-bar-draw" style="width: ${prob.draw}%" title="${t('draw', 'Draw')}: ${prob.draw}%"></div>
        <div class="prob-bar-away" style="width: ${prob.away}%" title="${match.away}: ${prob.away}%"></div>
      </div>
      <div class="probability-labels">
        <div class="prob-label home-label">
          <span class="prob-team-flag">${match.homeFlag}</span>
          <span class="prob-team-name">${match.home}</span>
          <span class="prob-pct">${prob.home}%</span>
        </div>
        <div class="prob-label draw-label">
          <span class="prob-team-name">${t('draw', 'Draw')}</span>
          <span class="prob-pct">${prob.draw}%</span>
        </div>
        <div class="prob-label away-label">
          <span class="prob-pct">${prob.away}%</span>
          <span class="prob-team-name">${match.away}</span>
          <span class="prob-team-flag">${match.awayFlag}</span>
        </div>
      </div>
    `;
    DOM.modalTabContent.appendChild(probRow);

    const statsList = [
      { name: t('possession', 'Possession %'), values: match.stats.possession },
      { name: t('shots', 'Shots'), values: match.stats.shots },
      { name: t('fouls', 'Fouls Committed'), values: match.stats.fouls },
      { name: t('corners', 'Corners'), values: match.stats.corners }
    ];

    statsList.forEach((stat) => {
      const row = document.createElement('div');
      row.className = 'stat-row';
      const homeVal = stat.values[0];
      const awayVal = stat.values[1];
      const total = homeVal + awayVal || 1; // Safeguard div by zero
      const homePct = (homeVal / total) * 100;
      const awayPct = (awayVal / total) * 100;

      row.innerHTML = `
        <div class="stat-labels">
          <span>${homeVal}</span>
          <span class="stat-label-name">${stat.name}</span>
          <span>${awayVal}</span>
        </div>
        <div class="stat-bar-container">
          <div class="stat-bar-home" style="width: ${homePct}%"></div>
          <div class="stat-bar-away" style="width: ${awayPct}%"></div>
        </div>
      `;
      DOM.modalTabContent.appendChild(row);
    });
  } else if (state.activeModalTab === 'lineups') {
    // 3. Lineups Tab (Visual Soccer Pitch + Squad list)
    const lineupSection = document.createElement('div');
    lineupSection.className = 'lineups-container';

    // Verify active lineup team is either 'home' or 'away'
    const teamType = state.activeLineupTeam === 'away' ? 'away' : 'home';
    const opponentType = teamType === 'home' ? 'away' : 'home';
    const teamName = match[teamType];
    const opponentName = match[opponentType];
    const teamFlag = match[teamType === 'home' ? 'homeFlag' : 'awayFlag'];
    const squad = match.lineups[teamType];

    // Build the team selector segmented buttons
    const selectorHtml = `
      <div class="lineup-selectors">
        <button class="lineup-select-btn ${teamType === 'home' ? 'active' : ''}" data-team-type="home">
          ${match.homeFlag} ${match.home}
        </button>
        <button class="lineup-select-btn ${teamType === 'away' ? 'active' : ''}" data-team-type="away">
          ${match.awayFlag} ${match.away}
        </button>
      </div>
    `;

    // Build the pitch container and its markings
    let pitchMarkingsHtml = `
      <div class="soccer-pitch">
        <div class="pitch-marking pitch-outline"></div>
        <div class="pitch-marking pitch-center-line"></div>
        <div class="pitch-marking pitch-center-circle"></div>
        <div class="pitch-marking pitch-center-spot"></div>
        <div class="pitch-marking pitch-penalty-top"></div>
        <div class="pitch-marking pitch-penalty-bottom"></div>
        <div class="pitch-marking pitch-goal-top"></div>
        <div class="pitch-marking pitch-goal-bottom"></div>
    `;

    // Map each of the 11 starting players onto the pitch
    const colors = TEAM_COLORS[teamName] || { primary: 'var(--primary)', text: '#ffffff', border: '#ffffff' };
    const defaultPrimary = teamType === 'home' ? 'var(--primary)' : 'var(--secondary)';
    const defaultBorder = '#ffffff';
    const defaultText = teamType === 'home' ? '#ffffff' : '#000000';

    const jerseyBg = TEAM_COLORS[teamName] ? colors.primary : defaultPrimary;
    const jerseyColor = TEAM_COLORS[teamName] ? colors.text : defaultText;
    const jerseyBorder = TEAM_COLORS[teamName] ? colors.border : defaultBorder;

    squad.slice(0, 11).forEach((player, idx) => {
      const coord = FORMATION_COORDINATES[idx] || { left: 50, top: 50, pos: "SUB" };
      const displayName = player.split(' ').pop(); // Take last name for pitch display
      
      pitchMarkingsHtml += `
        <div class="player-node" style="left: ${coord.left}%; top: ${coord.top}%" title="${player} (${coord.pos})" data-player-name="${player}" data-position="${coord.pos}">
          <div class="player-jersey" style="background-color: ${jerseyBg}; color: ${jerseyColor}; border-color: ${jerseyBorder};">
            ${coord.pos}
          </div>
          <span class="player-node-name">${displayName}</span>
        </div>
      `;
    });

    pitchMarkingsHtml += `</div>`; // Close soccer-pitch

    // Build numerical squad list to display underneath the pitch
    let playersListHtml = '';
    squad.forEach((player, idx) => {
      const coord = FORMATION_COORDINATES[idx] || { pos: "SUB" };
      const positionLabel = idx < 11 ? coord.pos : 'SUB';
      
      playersListHtml += `
        <div class="player-row" data-player-name="${player}" data-position="${positionLabel}">
          <span class="player-number" style="width: 24px;">#${idx + 1}</span>
          <span class="player-name" style="flex: 1;">${player}</span>
          <span class="player-position" style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">${positionLabel}</span>
        </div>
      `;
    });

    const squadListHtml = `
      <div class="lineups-lists">
        <div class="lineup-title">${t('modal_squad_title', 'Squad')} - ${teamFlag} ${teamName}</div>
        <div class="lineup-players-grid">
          ${playersListHtml}
        </div>
      </div>
    `;

    lineupSection.innerHTML = selectorHtml + pitchMarkingsHtml + squadListHtml;
    DOM.modalTabContent.appendChild(lineupSection);

    // Attach click listeners for player profile cards
    lineupSection.querySelectorAll('.player-node, .player-row').forEach(el => {
      el.addEventListener('click', (e) => {
        const name = e.currentTarget.getAttribute('data-player-name');
        const pos = e.currentTarget.getAttribute('data-position');
        if (name && name !== 'To be announced' && !name.includes('announced') && name !== 'TBD') {
          showPlayerProfile(name, teamName, pos);
        }
      });
    });

    // Attach click listeners for selector buttons to reload content
    lineupSection.querySelectorAll('.lineup-select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        state.activeLineupTeam = e.currentTarget.getAttribute('data-team-type');
        renderModalContent();
      });
    });
  }
}

// --- Scraper Integration ---
async function loadScrapedData() {
  try {
    const [newsRes, matchesRes] = await Promise.all([
      fetch(`./data/news.json?t=${Date.now()}`),
      fetch(`./data/matches.json?t=${Date.now()}`)
    ]);

    if (!newsRes.ok || !matchesRes.ok) {
      console.warn('[PWA] Scraped JSON feed missing or server error. Retaining local fallback feeds.');
      return;
    }

    const newsData = await newsRes.json();
    const matchesData = await matchesRes.json();

    if (Array.isArray(newsData) && newsData.length > 0) {
      state.news = newsData;
    }

    if (Array.isArray(matchesData) && matchesData.length > 0) {
      state.matches = matchesData;
    }

    console.log('[PWA] Real-time scraped feeds loaded successfully!');
    
    // Rerender all active panels and components with live data
    renderMatchesList();
    renderNewsGrid();
    renderSubscriptionsUI();
    updateSyncStatus();
  } catch (err) {
    console.error('[PWA] Error fetching scraped data files: ', err);
  }
}
