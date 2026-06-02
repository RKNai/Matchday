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
  activeNewsCategory: 'all',
  activeModalTab: 'timeline',
  activeModalMatchId: null,
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
    btn_subscribe: 'Alerts',
    btn_subscribed: 'Subscribed',
    final_result: 'FINAL RESULT',
    upcoming_pred: 'Upcoming • Prediction open',
    empty_matches: 'No matches matching your selection.',
    feed_title: 'World Cup Feed',
    latest_stories: 'Latest World Cup Stories',
    empty_news: 'No news matches search parameters.',
    ad_sponsored: 'Sponsored',
    ad_title: '🏆 Predict & Win World Cup Glory!',
    ad_desc: 'Join MatchDay Fantasy League. Play free, win real cash and official jerseys.',
    ad_cta: 'Play Now',
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
    group_stage: 'Group Stage'
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
    btn_subscribe: 'Alertas',
    btn_subscribed: 'Suscrito',
    final_result: 'RESULTADO FINAL',
    upcoming_pred: 'Próximamente • Pronósticos abiertos',
    empty_matches: 'No hay partidos que coincidan con su selección.',
    feed_title: 'Noticias del Mundial',
    latest_stories: 'Últimas noticias del Mundial',
    empty_news: 'No hay noticias que coincidan con la búsqueda.',
    ad_sponsored: 'Patrocinado',
    ad_title: '🏆 ¡Predice y Gana la Gloria del Mundial!',
    ad_desc: 'Únete a la Liga Fantasy de MatchDay. Juega gratis, gana dinero real y camisetas oficiales.',
    ad_cta: 'Jugar Ahora',
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
    group_stage: 'Fase de Grupos'
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
    btn_subscribe: 'Alertes',
    btn_subscribed: 'Subscrit',
    final_result: 'RESULTAT FINAL',
    upcoming_pred: 'Pròximament • Pronòstics oberts',
    empty_matches: 'No hi ha partits que coincideixin amb la seva selecció.',
    feed_title: 'Notícies del Mundial',
    latest_stories: 'Últimes notícies del Mundial',
    empty_news: 'No hi ha notícies que coincideixin amb la cerca.',
    ad_sponsored: 'Patrocinat',
    ad_title: '🏆 Prediu i Guanya la Glòria del Mundial!',
    ad_desc: 'Uneix-te a la Lliga Fantasy de MatchDay. Juga gratis, guanya diners reals i samarretes oficials.',
    ad_cta: 'Juga Ara',
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
    group_stage: 'Fase de Grups'
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
  
  // Ads banner
  adClose: document.getElementById('adClose'),
  adsBanner: document.querySelector('.ads-banner'),
  adCta: document.getElementById('adCta')
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
      showToast(
        state.lang === 'en' ? '🌐 Language Updated' :
        state.lang === 'es' ? '🌐 Idioma Actualizado' : '🌐 Idioma Actualitzat',
        state.lang === 'en' ? 'App text translated to English.' :
        state.lang === 'es' ? 'Texto de la aplicación traducido al Español.' :
                              'Text de l\'aplicació traduït al Català.'
      );
    });
  }
  
  // Apply initial translations & trigger initial renders
  applyTranslations();
  
  // Modals & Banner
  setupModalHandlers();
  setupAdsBanner();

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
    showToast('🏆 Installation Complete', 'MatchDay has been installed to your home screen!');
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
    showToast('📐 Snapping Active', 'Cycle panels snap layout preset.');
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
function toggleSubscription(teamName) {
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

function renderSubscriptionsUI() {
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
    allTeams.set(m.home, m.homeFlag);
    allTeams.set(m.away, m.awayFlag);
  });

  DOM.allTeamsGrid.innerHTML = '';
  allTeams.forEach((flag, name) => {
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

function renderMatchesList() {
  DOM.matchesList.innerHTML = '';
  
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

  filteredMatches.forEach((match) => {
    const isLive = match.status === 'live';
    const isFinished = match.status === 'finished';
    const isHomeSubbed = state.subscribedTeams.has(match.home);
    const isAwaySubbed = state.subscribedTeams.has(match.away);
    const hasAnySub = isHomeSubbed || isAwaySubbed;

    const card = document.createElement('div');
    card.className = `match-card ${isLive ? 'live-match' : ''}`;
    card.setAttribute('data-match-id', match.id);
    
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
      <button class="btn-subscribe ${hasAnySub ? 'active' : ''}" data-team="${match.home}" title="Toggle Alerts">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="${hasAnySub ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span>${hasAnySub ? t('btn_subscribed', 'Subscribed') : t('btn_subscribe', 'Alerts')}</span>
      </button>
    `;

    // Stop propagation on button to allow card click
    card.querySelector('.btn-subscribe').addEventListener('click', (e) => {
      e.stopPropagation();
      // Default to subscribing/unsubscribing home team as representative
      toggleSubscription(match.home);
    });

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

  filtered.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'news-card';
    
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

function openMatchDetails(matchId) {
  state.activeModalMatchId = matchId;
  state.activeModalTab = 'timeline'; // Reset to timeline tab
  
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
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 10px;">
      <span class="news-tag ${item.category}-tag" style="padding: 3px 8px; font-size: 10px; font-weight: 700; border-radius: 4px; text-transform: uppercase;">
        ${item.category === 'injury' ? t('category_injury', 'Injury Report') : 
          item.category === 'lineup' ? t('category_lineup', 'Squads') : 
          item.category === 'transfer' ? t('category_transfer', 'Transfers') : 
          item.category === 'press' ? t('category_press', 'Press Talk') : 
          item.category === 'rules' ? t('category_rules', 'Rules & VAR') : t('category_tactics', 'Tactics')}
      </span>
      <span class="news-time" style="font-size: 11px; color: var(--text-muted);">${translateTime(item.time)}</span>
    </div>
    ${item.image ? `
      <div style="width: 100%; height: 160px; border-radius: 10px; overflow: hidden; margin-bottom: 6px; border: 1px solid var(--border-color);">
        <img src="${item.image}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
    ` : ''}
  `;

  // Render modal body content
  DOM.newsModalBody.innerHTML = `
    <h3 style="font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text-primary); line-height: 1.35;">
      ${item.title}
    </h3>
    <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-top: 8px;">
      ${item.snippet || t('read_full_story_desc', 'Click "Read Full Story" to read this breaking news article directly on the source website.')}
    </p>
    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px; border-top: 1px solid var(--border-color); padding-top: 12px; gap: 10px;">
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
    // 3. Lineups Tab
    const lineupSection = document.createElement('div');
    lineupSection.className = 'lineups-lists';
    
    let homePlayersHtml = '';
    match.lineups.home.forEach((player, idx) => {
      homePlayersHtml += `
        <div class="player-row">
          <span class="player-number">${idx + 1}</span>
          <span class="player-name">${player}</span>
        </div>
      `;
    });

    let awayPlayersHtml = '';
    match.lineups.away.forEach((player, idx) => {
      awayPlayersHtml += `
        <div class="player-row">
          <span class="player-number">${idx + 1}</span>
          <span class="player-name">${player}</span>
        </div>
      `;
    });

    lineupSection.innerHTML = `
      <div>
        <div class="lineup-title">${t('modal_squad_title', 'Squad')} - ${match.home}</div>
        ${homePlayersHtml}
      </div>
      <div>
        <div class="lineup-title">${t('modal_squad_title', 'Squad')} - ${match.away}</div>
        ${awayPlayersHtml}
      </div>
    `;
    DOM.modalTabContent.appendChild(lineupSection);
  }
}

// --- Realistic Google Ads Controller ---
function setupAdsBanner() {
  DOM.adClose.addEventListener('click', (e) => {
    e.stopPropagation();
    DOM.adsBanner.classList.add('hidden');
    // Shrink app containers padding to utilize bottom screen space
    document.documentElement.style.setProperty('--ads-height', '0px');
    showToast('🏆 Ads Dismissed', 'Enjoy an ad-free experience for this session.');
  });

  DOM.adCta.addEventListener('click', () => {
    showToast('🏆 Fantasy Hub', 'Opening World Cup predictions league hub. Prepare to draft!');
  });
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
    
    showToast('⚽ Live Sync Complete', 'Match results and breaking news feeds synchronized successfully.');
  } catch (err) {
    console.error('[PWA] Error fetching scraped data files: ', err);
  }
}
