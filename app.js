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
    {
      id: 1,
      category: 'injury',
      title: "Mbappé doubtful for opening match against Canada",
      snippet: "France's talisman suffered a mild calf strain during training. The medical team is working round the clock to assess his fitness, but reports indicate Deschamps will not risk him.",
      time: '10m ago',
      color: 'linear-gradient(135deg, #ef4444, #7f1d1d)',
      overlay: '🩺',
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop",
      source: "L'Équipe"
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
      source: "CBC Sports"
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
      source: "ESPN FC"
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
      source: "Sky Sports"
    }
  ]
};

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
  
  // Initial renders
  renderMatchesList();
  renderNewsGrid();
  
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
    DOM.subscribedTeamsList.innerHTML = `<p class="empty-state">No active subscriptions. Tap "Alerts" next to matches.</p>`;
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
    DOM.syncStatus.querySelector('.status-text').textContent = 'Tracking Subscriptions';
  } else {
    DOM.syncStatus.style.background = '';
    DOM.syncStatus.querySelector('.status-text').textContent = 'Live Ticker';
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
        <p>No matches matching your selection.</p>
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
      statusHtml = `<span class="match-status pulse-text"><span class="match-live-dot"></span>LIVE • ${match.minute}'</span>`;
    } else if (isFinished) {
      statusHtml = `<span class="match-status">FINAL RESULT</span>`;
    } else {
      const label = match.date ? `${match.date}` : 'Upcoming • Prediction open';
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
        <span class="match-stage">${match.stage}</span>
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
        <span>${hasAnySub ? 'Subscribed' : 'Alerts'}</span>
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

  let filtered = [];
  
  // Category filter
  if (state.activeNewsCategory !== 'all') {
    filtered = state.news.filter(n => n.category === state.activeNewsCategory);
  } else {
    filtered = [...state.news];
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
        <p>No news matches search parameters.</p>
      </div>
    `;
    return;
  }

  // Prepend short header in the scroll list container itself
  const feedHeader = document.createElement('h3');
  feedHeader.className = 'feed-scroll-header';
  feedHeader.textContent = 'Latest World Cup Stories';
  DOM.newsGrid.appendChild(feedHeader);

  filtered.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'news-card';
    
    let tagLabel = 'Tactics';
    if (item.category === 'injury') tagLabel = 'Injury Report';
    if (item.category === 'lineup') tagLabel = 'Squads';
    if (item.category === 'transfer') tagLabel = 'Transfers';
    if (item.category === 'press') tagLabel = 'Press Talk';
    if (item.category === 'rules') tagLabel = 'Rules & VAR';
    if (item.category === 'tactics') tagLabel = 'Tactics';

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
          <span class="news-time">• ${item.time}</span>
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
        ${item.category === 'injury' ? 'Injury Report' : 
          item.category === 'lineup' ? 'Squads' : 
          item.category === 'transfer' ? 'Transfers' : 
          item.category === 'press' ? 'Press Talk' : 
          item.category === 'rules' ? 'Rules & VAR' : 'Tactics'}
      </span>
      <span class="news-time" style="font-size: 11px; color: var(--text-muted);">${item.time}</span>
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
      ${item.snippet || 'Click "Read Full Story" to read this breaking news article directly on the source website.'}
    </p>
    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px; border-top: 1px solid var(--border-color); padding-top: 12px; gap: 10px;">
      <span style="font-size: 11px; font-weight: 600; color: var(--primary);">Source: ${item.source}</span>
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
          Read Full Story ↗
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
    statusText = `LIVE • ${match.minute}'`;
  } else if (match.status === 'finished') {
    statusText = 'FULL TIME RESULT';
  } else {
    statusText = 'UPCOMING GAME';
  }

  DOM.modalHeader.innerHTML = `
    <span class="modal-stage">${match.stage}</span>
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
          <p>This match hasn't started yet. Timeline updates will populate live when kickoff begins.</p>
        </div>
      `;
    } else {
      if (match.events.length === 0) {
        DOM.modalTabContent.innerHTML = `
          <div class="empty-state">
            <span>⏱️</span>
            <p>Kickoff! No major actions yet.</p>
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
      { name: 'Possession %', values: match.stats.possession },
      { name: 'Shots', values: match.stats.shots },
      { name: 'Fouls Committed', values: match.stats.fouls },
      { name: 'Corners', values: match.stats.corners }
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
        <div class="lineup-title">${match.home} Squad</div>
        ${homePlayersHtml}
      </div>
      <div>
        <div class="lineup-title">${match.away} Squad</div>
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
