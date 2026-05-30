// Firebase is loaded via compat CDN in index.html

const firebaseConfig = {
  apiKey: "AIzaSyDN95soIqy3L9dDyp8K82gWIyUnR95VAcQ",
  authDomain: "hankstudio-web.firebaseapp.com",
  projectId: "hankstudio-web",
  storageBucket: "hankstudio-web.firebasestorage.app",
  messagingSenderId: "45331467819",
  appId: "1:45331467819:web:7234241582696fa8aaa46e",
  measurementId: "G-L21CJ76K0V"
};

let firebaseApp = null, auth = null, db = null;
try {
  firebaseApp = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
} catch (e) {
  console.error("Firebase failed to initialize statically:", e);
}

// ── SAFE LOCAL STORAGE WRAPPERS ──
const safeStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage read blocked:", e);
      return null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write blocked:", e);
    }
  }
};

// ── LOGO SVG (Premium Overlapping Geometrical Ribbon Logo) ──
const LOGO_SVG = `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#05CD74" />
      <stop offset="100%" stop-color="#02A55B" />
    </linearGradient>
    <linearGradient id="logoAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#D1FAE5" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="30" fill="url(#brandGrad)" />
  <!-- Left Pillar -->
  <path d="M30 25C30 22.24 32.24 20 35 20H42C44.76 20 47 22.24 47 25V75C47 77.76 44.76 80 42 80H35C32.24 80 30 77.76 30 75V25Z" fill="url(#logoAccentGrad)" />
  <!-- Right Pillar -->
  <path d="M53 25C53 22.24 55.24 20 58 20H65C67.76 20 70 22.24 70 25V75C70 77.76 67.76 80 65 80H58C55.24 80 53 77.76 53 75V25Z" fill="url(#logoAccentGrad)" />
  <!-- Sleek tech overlapping crossbar -->
  <rect x="40" y="44" width="20" height="12" rx="4" fill="#027A43" />
  <rect x="42" y="46" width="16" height="8" rx="3" fill="#10B981" />
</svg>`;

// ── ATTENDEASE OFF-THE-SHELF SEED APP ──
const ATTENDEASE_APP = {
  id: 'attendease-app',
  title: 'AttendEase',
  category: 'Productivity',
  description: 'AttendEase is a highly efficient, automated attendance tracking and check-in mobile application designed for schools, universities, and corporate events. Featuring digital registers, detailed reports, and real-time synchronization, managing check-ins has never been easier or more reliable.',
  appInfo: 'Version: 1.0.0\nSize: 8.8 MB\nPackage: com.hankstudio.attendease\nFormat: Android APK\nDeveloper: HankStudio',
  size: '8.8 MB',
  iconDataUrl: 'downloads/attendease_logo.png',
  bannerDataUrl: 'downloads/attendease_banner.png',
  downloadLink: 'downloads/AttendEase.apk',
  screenshots: [],
  authorUid: 'hankstudio-developer',
  authorName: 'HankStudio Developer',
  uploadedAt: '2026-05-30T00:00:00.000Z',
  isSponsored: true
};

// ── APP DATA (Cloud Firebase state) ──
let APPS_DATA = [];

const NAV_ITEMS = [
  { id: 'apps',         icon: 'layout-grid', label: 'Apps' },
  { id: 'home',         icon: 'gamepad-2',   label: 'Games' },
  { id: 'search',       icon: 'search',      label: 'Search' },
  { id: 'tools',        icon: 'wrench',      label: 'Tools' },
  { id: 'profile',      icon: 'user',        label: 'You' },
  { id: 'top-charts',   icon: 'bar-chart-2', label: 'Top Charts' },
  { id: 'new-releases', icon: 'clock',       label: 'New Releases' },
];

const CATEGORIES = [
  { id: 'Developer Tools', icon: 'code-2',      label: 'Developer Tools', classes: 'text-indigo-600 bg-indigo-50' },
  { id: 'Productivity',    icon: 'folder',       label: 'Productivity',    classes: 'text-blue-500 bg-blue-50' },
  { id: 'Utilities',       icon: 'wrench',       label: 'Utilities',       classes: 'text-emerald-500 bg-emerald-50' },
  { id: 'Multimedia',      icon: 'monitor-play', label: 'Multimedia',      classes: 'text-orange-500 bg-orange-50' },
  { id: 'Security',        icon: 'shield',       label: 'Security',        classes: 'text-blue-600 bg-blue-50' },
  { id: 'Games',           icon: 'gamepad-2',    label: 'Games',           classes: 'text-pink-500 bg-pink-50' },
];

// ── STATE ──
let activeTab = 'apps'; 
let activeSubTab = 'for-you';
let selectedApp = null;
let isMobileMenuOpen = false;
let isDeveloperAuthenticated = false;
let currentGuideText = '';
let geminiApiKey = safeStorage.getItem('gemini_api_key') || '';
let uploadIconData = null;

// ── SAFE LOCAL STORAGE LOADING ──
let currentUser = null;
try {
  const storedUser = safeStorage.getItem('hankstudio_current_user');
  if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
    currentUser = JSON.parse(storedUser);
  }
} catch (e) {
  console.error("Error parsing current user during app load", e);
}

// ── DARK MODE PERSISTENCE ──
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  safeStorage.setItem('hankstudio_dark_mode', isDark);
}

window.toggleDarkModeAndReRender = function() {
  toggleDarkMode();
  renderContent();
};

// ── INIT FUNCTION ──
function initializePlatform() {
  // Dark mode init (default true)
  if (safeStorage.getItem('hankstudio_dark_mode') !== 'false') {
    document.documentElement.classList.add('dark');
  }

  ['desktop-logo-container','mobile-logo-container','header-logo-container'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = LOGO_SVG;
  });
  renderNavs();
  renderContent();
  renderBottomNav();
  updateHeaderAuth();

  // Firebase Auth Listener (Defensively Guarded)
  if (auth) {
    auth.onAuthStateChanged((user) => {
      if (user) {
        currentUser = { 
          name: user.displayName || (user.email ? user.email.split('@')[0] : 'User'), 
          email: user.email || '', 
          uid: user.uid, 
          photoURL: user.photoURL 
        };
      } else {
        currentUser = null;
      }
      safeStorage.setItem('hankstudio_current_user', JSON.stringify(currentUser));
      updateHeaderAuth();
      if (activeTab === 'profile') renderContent(); 
    });
  }

  // Firebase Firestore Listener (Defensively Guarded)
  if (db) {
    db.collection("apps").orderBy("uploadedAt", "desc").onSnapshot((snapshot) => {
      APPS_DATA = [];
      snapshot.forEach((doc) => {
        APPS_DATA.push({ id: doc.id, ...doc.data() });
      });
      
      // Ensure AttendEase is always seeded in APPS_DATA
      if (!APPS_DATA.some(a => a.id === 'attendease-app' || a.title === 'AttendEase')) {
        APPS_DATA.unshift(ATTENDEASE_APP);
      }
      renderContent();
    }, (error) => {
      console.warn("Firestore snapshot error, loading fallback:", error);
      APPS_DATA = [ATTENDEASE_APP];
      renderContent();
    });
  } else {
    // Offline local seeding
    APPS_DATA = [ATTENDEASE_APP];
    renderContent();
  }

  // Hide page loader unconditionally after a blazingly fast timeout (150ms)
  setTimeout(() => {
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.style.display = 'none', 400);
    }
  }, 150);
}

// ── ROBUST READYSTATE CHECK ──
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePlatform);
} else {
  initializePlatform();
}

// ── AUTH FUNCTIONS ──
window.openAuthModal = function(view) {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.add('open');
    switchAuthView(view);
  }
};

window.closeAuthModal = function() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('open');
};

window.switchAuthView = function(view) {
  ['login','signup','success'].forEach(v => {
    const el = document.getElementById(`auth-${v}-view`);
    if (el) el.style.display = 'none';
  });
  const target = document.getElementById(`auth-${view}-view`);
  if (target) target.style.display = 'block';
  
  const loginErr = document.getElementById('login-error');
  const signupErr = document.getElementById('signup-error');
  if (loginErr) loginErr.style.display = 'none';
  if (signupErr) signupErr.style.display = 'none';
};

window.handleLogin = async function() {
  const email = document.getElementById('login-email').value.trim();
  const pw = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  if (errEl) errEl.style.display = 'none';
  try {
    await auth.signInWithEmailAndPassword(email, pw);
    document.getElementById('auth-success-title').textContent = `Welcome back!`;
    document.getElementById('auth-success-msg').textContent = 'You are now logged in.';
    switchAuthView('success');
  } catch (err) {
    if (errEl) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
    }
  }
};

window.handleGoogleLogin = async function() {
  const errEl = document.getElementById('login-error');
  if (errEl) errEl.style.display = 'none';
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    document.getElementById('auth-success-title').textContent = `Welcome, ${result.user.displayName || 'Developer'}!`;
    document.getElementById('auth-success-msg').textContent = 'You are now logged in.';
    switchAuthView('success');
  } catch (err) {
    if (errEl) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
    }
  }
};

window.handleSignup = async function() {
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const pw = document.getElementById('signup-password').value;
  const errEl = document.getElementById('signup-error');
  if (errEl) errEl.style.display = 'none';
  if (!name || !email || !pw) {
    if (errEl) { errEl.textContent = 'Please fill all fields.'; errEl.style.display = 'block'; }
    return;
  }
  if (pw.length < 6) {
    if (errEl) { errEl.textContent = 'Password must be at least 6 characters.'; errEl.style.display = 'block'; }
    return;
  }
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, pw);
    await userCredential.user.updateProfile({ displayName: name });
    document.getElementById('auth-success-title').textContent = `Welcome, ${name}!`;
    document.getElementById('auth-success-msg').textContent = 'Your account has been created.';
    switchAuthView('success');
  } catch (err) {
    if (errEl) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
    }
  }
};

window.logOut = async function() {
  try {
    await auth.signOut();
    currentUser = null;
    safeStorage.setItem('hankstudio_current_user', 'null');
    updateHeaderAuth();
    setActiveTab('apps');
  } catch (err) {}
};

function updateHeaderAuth() {
  const area = document.getElementById('header-auth-area');
  if (!area) return;
  if (currentUser) {
    const displayName = currentUser.name || (currentUser.email ? currentUser.email.split('@')[0] : 'User');
    const avatarContent = currentUser.photoURL 
      ? `<img src="${currentUser.photoURL}" class="w-full h-full object-cover rounded-full">`
      : `<span class="text-xs font-bold text-white uppercase">${escapeHtml(displayName.charAt(0))}</span>`;
    
    area.innerHTML = `
      <button onclick="setActiveTab('profile')" class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center border border-slate-250 dark:border-slate-800 shadow-sm hover:scale-105 active:scale-[0.93] transition-all duration-200 overflow-hidden animate-fade-in" title="View Profile">
        ${avatarContent}
      </button>`;
  } else {
    area.innerHTML = `
      <button onclick="openAuthModal('login')" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-205 dark:border-slate-700 flex items-center justify-center shadow-sm hover:scale-105 active:scale-[0.93] transition-all duration-200 animate-fade-in" title="Sign In">
        <i data-lucide="user" class="w-4 h-4"></i>
      </button>`;
  }
  if (window.lucide) lucide.createIcons();
}

// ── DEVELOPER AUTH ──
window.openDeveloperModal = function() {
  if (isDeveloperAuthenticated) {
    setActiveTab('developer');
    return;
  }
  const overlay = document.getElementById('dev-auth-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    document.getElementById('dev-password-input').value = '';
    document.getElementById('dev-pw-error').style.display = 'none';
    setTimeout(() => document.getElementById('dev-password-input').focus(), 100);
  }
};

window.closeDeveloperModal = function() {
  const overlay = document.getElementById('dev-auth-overlay');
  if (overlay) overlay.style.display = 'none';
};

window.checkDevPassword = function() {
  const pw = document.getElementById('dev-password-input').value;
  if (pw === 'Hank@9564') {
    isDeveloperAuthenticated = true;
    closeDeveloperModal();
    setActiveTab('developer');
  } else {
    document.getElementById('dev-pw-error').style.display = 'block';
    document.getElementById('dev-password-input').value = '';
    document.getElementById('dev-password-input').focus();
  }
};

// ── NAVIGATION & TAB STATE ──
window.toggleMobileMenu = function(open) {
  isMobileMenuOpen = open;
  const drawer = document.getElementById('mobile-drawer');
  if (drawer) drawer.classList.toggle('hidden', !open);
};

window.setActiveTab = function(tabId) {
  if (tabId === 'developer' && !isDeveloperAuthenticated) {
    openDeveloperModal();
    return;
  }
  activeTab = tabId;
  activeSubTab = 'for-you'; // Reset sub-tab selection on main tab shifts
  renderNavs();
  renderContent();
  renderBottomNav();
  const viewport = document.getElementById('main-content-viewport');
  if (viewport) viewport.scrollTo({ top: 0, behavior: 'instant' }); // Snap instantly for smoother responsive app feel
};

window.setActiveSubTab = function(subTabId) {
  activeSubTab = subTabId;
  renderContent();
  const viewport = document.getElementById('main-content-viewport');
  if (viewport) viewport.scrollTo({ top: 0, behavior: 'instant' });
};

window.searchCategory = function(catId) {
  setActiveTab('search');
  setTimeout(() => {
    const input = document.getElementById('global-search-input');
    if (input) {
      input.value = catId;
      handleSearchOnPage(catId);
    }
  }, 100);
};

function renderNavs() {
  const renderList = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = NAV_ITEMS.map(item => {
      const active = activeTab === item.id;
      return `<button onclick="setActiveTab('${item.id}'); toggleMobileMenu(false)"
        class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left w-full nav-transition ${active ? 'bg-brand-bg text-brand font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}">
        <i data-lucide="${item.icon}" class="w-5 h-5 ${active ? 'text-brand' : 'text-slate-400'}"></i>
        <span class="text-sm font-semibold">${item.label}</span>
      </button>`;
    }).join('');
  };

  const renderBottom = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const active = activeTab === 'developer';
    el.innerHTML = `<button onclick="openDeveloperModal(); toggleMobileMenu(false)"
      class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left w-full nav-transition ${active ? 'bg-brand-bg text-brand font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}">
      <i data-lucide="code-2" class="w-5 h-5 ${active ? 'text-brand' : 'text-slate-400'}"></i>
      <span class="text-sm font-semibold">Developer</span>
      <span class="ml-auto text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">🔒</span>
    </button>`;
  };

  renderList('desktop-nav'); renderList('mobile-nav');
  renderBottom('desktop-nav-bottom'); renderBottom('mobile-nav-bottom');
  if (window.lucide) lucide.createIcons();
}

function renderBottomNav() {
  const navContainer = document.getElementById('bottom-nav-bar');
  if (!navContainer) return;

  const items = [
    { id: 'apps',    icon: 'layout-grid', label: 'Apps' },
    { id: 'home',    icon: 'gamepad-2',   label: 'Games' },
    { id: 'search',  icon: 'search',      label: 'Search' },
    { id: 'tools',   icon: 'wrench',      label: 'Tools' },
    { id: 'profile', icon: 'user',        label: 'You' }
  ];

  navContainer.innerHTML = items.map(item => {
    const active = activeTab === item.id;
    return `
      <div class="flex flex-col items-center gap-0.5 cursor-pointer flex-1 py-1" onclick="setActiveTab('${item.id}')">
        <div class="px-5 py-1 rounded-full transition-all duration-300 ${active ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400' : 'bg-transparent text-slate-500 dark:text-slate-400'}">
          <i data-lucide="${item.icon}" class="w-5 h-5 ${active ? 'fill-blue-600/10' : ''}"></i>
        </div>
        <span class="text-[10px] ${active ? 'font-bold text-blue-600 dark:text-blue-400' : 'font-medium text-slate-500 dark:text-slate-400'}">${item.label}</span>
      </div>`;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function renderContent() {
  const vp = document.getElementById('main-content-viewport');
  if (!vp) return;
  const map = {
    home: renderHomeHTML, apps: renderAppsHTML, games: renderGamesHTML,
    tools: renderToolsHTML, 'top-charts': renderTopChartsHTML,
    'new-releases': renderNewReleasesHTML, developer: renderDeveloperHTML,
    profile: renderProfileHTML, search: renderSearchHTML
  };
  vp.innerHTML = (map[activeTab] || renderAppsHTML)();
  if (window.lucide) lucide.createIcons();
}

// ── APP CARD HTML ──
function appCardHTML(app, compact = false) {
  const iconHTML = app.iconDataUrl
    ? `<img src="${app.iconDataUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:${compact?'12px':'16px'};">`
    : `<div style="width:100%;height:100%;background:${app.iconBg||'#05cd74'};display:flex;align-items:center;justify-content:center;font-size:${compact?'1.4rem':'1.8rem'};border-radius:${compact?'12px':'16px'};">${app.emoji||'📦'}</div>`;
  return iconHTML;
}

// ── EMPTY STATE ──
function emptyState(icon, title, msg, btnLabel, btnTab) {
  return `<div class="bg-slate-50 dark:bg-[#1E1E1E] border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-12 text-center">
    <i data-lucide="${icon}" class="w-14 h-14 text-slate-300 dark:text-slate-650 mx-auto mb-4"></i>
    <h3 class="text-base font-bold text-slate-800 dark:text-white">${title}</h3>
    <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">${msg}</p>
    ${btnLabel ? `<button onclick="openDeveloperModal()" class="mt-6 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm">${btnLabel}</button>` : ''}
  </div>`;
}

// ── PROFILE PAGE ──
function renderProfileHTML() {
  const isDarkModeActive = document.documentElement.classList.contains('dark');
  
  // Dynamic settings card for dark mode toggle button
  const toggleCardHtml = `
    <div class="bg-white dark:bg-[#1E1E1E] border border-slate-250 dark:border-slate-800 rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
          <i data-lucide="${isDarkModeActive ? 'sun' : 'moon'}" class="w-5 h-5"></i>
        </div>
        <div>
          <p class="text-xs font-bold text-slate-900 dark:text-white">Dark Theme Mode</p>
          <p class="text-[10px] text-slate-500 dark:text-slate-400">Toggle dark or light color styles</p>
        </div>
      </div>
      <button onclick="toggleDarkModeAndReRender()" class="px-4 py-2 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-750 dark:text-slate-200 text-xs font-extrabold rounded-full transition-all border border-slate-250 dark:border-slate-700 shadow-xs cursor-pointer">
        ${isDarkModeActive ? 'Switch to Light' : 'Switch to Dark'}
      </button>
    </div>
  `;

  if (!currentUser) {
    return `<div class="p-6 lg:p-10 max-w-4xl mx-auto space-y-6">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">My Profile</h1>
      <div class="bg-slate-50 dark:bg-[#1E1E1E] border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-12 text-center shadow-sm">
        <i data-lucide="user-x" class="w-14 h-14 text-slate-355 dark:text-slate-700 mx-auto mb-4 animate-pulse"></i>
        <h3 class="text-base font-bold text-slate-800 dark:text-white">Not Logged In</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">You must log in to view your profile and manage uploaded applications.</p>
        <button onclick="openAuthModal('login')" class="mt-6 bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-md">Log In</button>
      </div>
      <div class="pt-4">
        ${toggleCardHtml}
      </div>
    </div>`;
  }

  const myApps = APPS_DATA.filter(a => a.authorUid === currentUser.uid);

  const appsHtml = myApps.length ? `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${myApps.map(app => `
    <div class="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-[1.5rem] p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all" onclick="openAppModal('${app.id}')">
      <div class="w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden shadow-sm">${appCardHTML(app)}</div>
      <div class="flex-1 min-w-0">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate">${escapeHtml(app.title)}</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">${escapeHtml(app.category)}</p>
      </div>
    </div>
  `).join('')}</div>` : `<p class="text-sm text-slate-400 dark:text-slate-500">You haven't uploaded any apps yet.</p>`;

  const displayName = currentUser.name || (currentUser.email ? currentUser.email.split('@')[0] : 'User');
  const initialLetter = displayName.charAt(0).toUpperCase();

  return `<div class="p-6 lg:p-10 max-w-5xl mx-auto space-y-6">
    <!-- Profile Header -->
    <div class="flex items-center gap-6 p-6 bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-[2rem]">
      <div class="w-24 h-24 bg-brand text-white text-4xl font-extrabold flex items-center justify-center rounded-full shadow-lg overflow-hidden border border-brand/20">
        ${currentUser.photoURL 
          ? `<img src="${currentUser.photoURL}" class="w-full h-full object-cover">`
          : initialLetter}
      </div>
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">${escapeHtml(displayName)}</h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium">${escapeHtml(currentUser.email || 'No email')}</p>
        <div class="mt-3 flex gap-2 items-center">
          ${myApps.length > 0 
            ? `<span class="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Developer</span>`
            : `<span class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Member</span>`
          }
          <button onclick="logOut()" class="text-[10px] font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 px-3 py-1 rounded-full border border-red-200/50 dark:border-red-500/25 transition-all">
            Log Out
          </button>
        </div>
      </div>
    </div>

    <!-- Toggle Settings Card -->
    <div class="mt-4">
      ${toggleCardHtml}
    </div>

    <!-- My Apps -->
    <div class="pt-4">
      <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <i data-lucide="grid" class="w-5 h-5 text-brand"></i> Apps You Created
      </h2>
      ${appsHtml}
    </div>
  </div>`;
}

// ── DEVELOPER PORTAL PAGE ──
function renderDeveloperHTML() {
  if (!isDeveloperAuthenticated) {
    return `<div class="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Developer Portal</h1>
      <div class="bg-slate-50 dark:bg-[#1E1E1E] border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-12 text-center">
        <i data-lucide="lock" class="w-14 h-14 text-slate-355 dark:text-slate-700 mx-auto mb-4"></i>
        <h3 class="text-base font-bold text-slate-800 dark:text-white">Developer Access Required</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">Authenticate using your developer credentials to access this portal.</p>
        <button onclick="openDeveloperModal()" class="mt-6 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm">Unlock Portal</button>
      </div>
    </div>`;
  }

  // Filter apps created by this developer
  const myApps = APPS_DATA.filter(a => a.authorUid === (currentUser ? currentUser.uid : 'anonymous'));

  const appsHtml = myApps.length ? `
    <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
      ${myApps.map(app => `
        <div class="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-750 transition-all">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
              ${appCardHTML(app, true)}
            </div>
            <div class="min-w-0">
              <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">${escapeHtml(app.title)}</h4>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">${escapeHtml(app.category)}</p>
            </div>
          </div>
          <button onclick="deleteApp('${app.id}')" class="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded-xl transition-colors border border-red-100/50 dark:border-red-550/20" title="Delete App">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `).join('')}
    </div>` : `
    <div class="bg-slate-50 dark:bg-[#1E1E1E] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
      <i data-lucide="layout-grid" class="w-10 h-10 text-slate-355 dark:text-slate-700 mx-auto mb-2"></i>
      <p class="text-xs font-bold text-slate-700 dark:text-slate-300">No Apps Published</p>
      <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1 max-w-[180px] mx-auto">Upload your first app using the form on the left.</p>
    </div>`;

  return `
    <div class="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <i data-lucide="code-2" class="text-brand"></i> Developer Portal
          </h1>
          <p class="text-slate-500 dark:text-slate-400 text-xs mt-1">Publish premium new software or manage your existing cloud applications.</p>
        </div>
        <button onclick="setActiveTab('profile')" class="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand dark:hover:text-brand flex items-center gap-1.5 self-start">
          <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Profile
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- UPLOAD FORM (Left side) -->
        <div class="lg:col-span-7 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-5">
          <h2 class="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <i data-lucide="upload-cloud" class="w-4.5 h-4.5 text-brand"></i> Upload New Application
          </h2>

          <div id="upload-error" class="hidden bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-550/20 text-red-600 dark:text-red-400 p-3.5 rounded-2xl text-xs font-medium leading-relaxed"></div>
          <div id="upload-success" class="hidden bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-500/25 text-brand p-3.5 rounded-2xl text-xs font-medium leading-relaxed"></div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">App Name *</label>
              <input id="upload-name" type="text" placeholder="e.g. HankStudio Code Editor"
                class="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition-all"/>
            </div>

            <div>
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Category *</label>
              <select id="upload-category" 
                class="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition-all">
                <option value="" disabled selected>Select category...</option>
                <option value="Developer Tools">Developer Tools</option>
                <option value="Productivity">Productivity</option>
                <option value="Utilities">Utilities</option>
                <option value="Multimedia">Multimedia</option>
                <option value="Security">Security</option>
                <option value="Games">Games</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Download URL (Direct link) *</label>
              <input id="upload-link" type="url" placeholder="e.g. https://domain.com/app.exe"
                class="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition-all"/>
            </div>

            <div>
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">App Size (optional)</label>
              <input id="upload-size" type="text" placeholder="e.g. 15.4 MB"
                class="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition-all"/>
            </div>
          </div>

          <div>
            <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Screenshots (optional, comma-separated image URLs)</label>
            <input id="upload-screenshots" type="text" placeholder="e.g. https://site.com/img1.png, https://site.com/img2.png"
              class="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition-all"/>
          </div>

          <!-- Icon upload and preview -->
          <div class="bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div class="relative shrink-0 w-16 h-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
              <img id="icon-preview" class="w-full h-full object-cover hidden"/>
              <i data-lucide="image" id="icon-placeholder-icon" class="w-6 h-6 text-slate-400"></i>
            </div>
            <div class="flex-1 w-full space-y-1 text-center sm:text-left">
              <p class="text-xs font-bold text-slate-900 dark:text-white">App Icon Image *</p>
              <p class="text-[10px] text-slate-550 dark:text-slate-400 mb-2">Select a premium, high-res PNG/JPG icon.</p>
              <label class="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white px-3.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all shadow-xs">
                <i data-lucide="file-image" class="w-3.5 h-3.5"></i> Browse Icon...
                <input id="upload-icon" type="file" accept="image/*" class="hidden" onchange="handleIconSelect(this); document.getElementById('icon-placeholder-icon').classList.add('hidden')"/>
              </label>
            </div>
          </div>

          <div>
            <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Short Description *</label>
            <textarea id="upload-desc" rows="3" placeholder="Explain the main features, utility, and user value..."
              class="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition-all resize-none"></textarea>
          </div>

          <div>
            <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Detailed Tech Info & Requirements (optional)</label>
            <textarea id="upload-info" rows="2" placeholder="e.g. Requires Windows 10/11 x64, 4GB RAM minimum..."
              class="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition-all resize-none"></textarea>
          </div>

          <button onclick="handleAppUpload()"
            class="w-full py-3 bg-brand hover:bg-brand-hover text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5">
            <i data-lucide="upload" class="w-4 h-4"></i> Publish Application
          </button>
        </div>

        <!-- APP LIST & STATS (Right side) -->
        <div class="lg:col-span-5 space-y-6">
          <!-- Developer Info/Stats Card -->
          <div class="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-4">
            <h2 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i data-lucide="shield-check" class="w-5 h-5 text-brand"></i> Developer Status
            </h2>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-brand-bg dark:bg-brand-dark/20 text-brand flex items-center justify-center border border-brand/10">
                <i data-lucide="award" class="w-5 h-5"></i>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-900 dark:text-white">Verified Creator</p>
                <p class="text-[10px] text-slate-550 dark:text-slate-400">HankStudio Registered Developer</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3 pt-2">
              <div class="bg-slate-50 dark:bg-[#121212] border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-3.5 text-center">
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Published</p>
                <p class="text-lg font-black text-slate-900 dark:text-white mt-0.5">${myApps.length}</p>
              </div>
              <div class="bg-slate-50 dark:bg-[#121212] border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-3.5 text-center">
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Points</p>
                <p class="text-lg font-black text-slate-900 dark:text-white mt-0.5">380</p>
              </div>
            </div>
          </div>

          <!-- Apps Management Card -->
          <div class="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-4">
            <h2 class="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <i data-lucide="folder-git" class="w-4.5 h-4.5 text-brand"></i> Manage Applications
            </h2>
            ${appsHtml}
          </div>
        </div>
      </div>-4.5 h-4.5 text-brand"></i> Manage Applications
            </h2>
            ${appsHtml}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── HOME (GAMES) FEED PAGE ──
function renderHomeHTML() {
  const topTabs = [
    { id: 'for-you', label: 'For you' },
    { id: 'top-charts', label: 'Top charts' },
    { id: 'premium', label: 'Premium' },
    { id: 'categories', label: 'Categories' }
  ];
  const topTabsHTML = topTabs.map((tab) => {
    const active = activeSubTab === tab.id;
    return `
      <div onclick="setActiveSubTab('${tab.id}')" class="px-4 py-3 whitespace-nowrap cursor-pointer text-[13px] font-medium transition-all duration-300 ${active ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
        ${tab.label}
      </div>
    `;
  }).join('');

  if (activeSubTab === 'top-charts') {
    const games = APPS_DATA.filter(a => a.category === 'Games');
    const html = games.length ? games.map((app, i) => `
      <div onclick="openAppModal('${app.id}')" class="flex items-center gap-4 bg-white dark:bg-[#1E1E1E] border border-slate-150 dark:border-slate-800 p-4 rounded-3xl cursor-pointer hover:shadow-md transition-all">
        <span class="text-xl font-extrabold text-slate-300 dark:text-slate-700 w-8 text-center">${i+1}</span>
        <div class="w-14 h-14 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-100 dark:bg-slate-800">${appCardHTML(app)}</div>
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-slate-900 dark:text-white truncate text-sm">${escapeHtml(app.title)}</h3>
          <p class="text-xs text-slate-400">${escapeHtml(app.category)}</p>
        </div>
        <button class="bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-4 py-2 rounded-xl text-xs font-bold transition-colors">View</button>
      </div>`).join('') :
      emptyState('bar-chart-2','No games yet','Games will appear here once uploaded.');
    return `
      <div class="max-w-2xl mx-auto pb-6">
        <div class="flex overflow-x-auto hide-scrollbar border-b border-slate-200 dark:border-slate-800/50 -mx-4 px-4 sm:mx-0 sm:px-0 sticky top-0 bg-white dark:bg-[#121212] z-30 pt-1">
          ${topTabsHTML}
        </div>
        <div class="p-4 space-y-4">
          <h2 class="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Top Games</h2>
          <div class="flex flex-col gap-4">${html}</div>
        </div>
      </div>
    `;
  }

  if (activeSubTab === 'premium') {
    const games = APPS_DATA.filter(a => a.category === 'Games');
    const html = games.length ? games.map(app => `
      <div onclick="openAppModal('${app.id}')" class="flex items-center gap-4 bg-white dark:bg-[#1E1E1E] border border-slate-150 dark:border-slate-800 p-4 rounded-3xl cursor-pointer hover:shadow-md transition-all">
        <div class="w-14 h-14 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-100 dark:bg-slate-800">${appCardHTML(app)}</div>
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-slate-900 dark:text-white truncate text-sm">${escapeHtml(app.title)}</h3>
          <p class="text-xs text-slate-400">${escapeHtml(app.category)} • Premium</p>
          <div class="flex items-center gap-1 mt-0.5">
            <span class="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">🏆 Editor's Choice</span>
          </div>
        </div>
        <span class="text-[11px] font-extrabold bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full">$0.99</span>
      </div>`).join('') :
      emptyState('award','No premium games yet','Premium selections will appear here.');
    return `
      <div class="max-w-2xl mx-auto pb-6">
        <div class="flex overflow-x-auto hide-scrollbar border-b border-slate-200 dark:border-slate-800/50 -mx-4 px-4 sm:mx-0 sm:px-0 sticky top-0 bg-white dark:bg-[#121212] z-30 pt-1">
          ${topTabsHTML}
        </div>
        <div class="p-4 space-y-4">
          <h2 class="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Premium Curated Games</h2>
          <div class="flex flex-col gap-4">${html}</div>
        </div>
      </div>
    `;
  }

  if (activeSubTab === 'categories') {
    const html = CATEGORIES.map(cat => {
      const count = APPS_DATA.filter(a => a.category === cat.id).length;
      return `
        <div onclick="searchCategory('${cat.id}')" class="bg-white dark:bg-[#1E1E1E] border border-slate-150 dark:border-slate-800 rounded-3xl p-5 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between h-[120px] group">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center ${cat.classes ? cat.classes : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'}">
              <i data-lucide="${cat.icon}" class="w-5 h-5"></i>
            </div>
            <i data-lucide="arrow-right" class="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">${cat.label}</h3>
            <p class="text-[10px] text-slate-500 dark:text-slate-400">${count} ${count === 1 ? 'App' : 'Apps'}</p>
          </div>
        </div>`;
    }).join('');
    return `
      <div class="max-w-2xl mx-auto pb-6">
        <div class="flex overflow-x-auto hide-scrollbar border-b border-slate-200 dark:border-slate-800/50 -mx-4 px-4 sm:mx-0 sm:px-0 sticky top-0 bg-white dark:bg-[#121212] z-30 pt-1">
          ${topTabsHTML}
        </div>
        <div class="p-4 space-y-4">
          <h2 class="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Explore Categories</h2>
          <div class="grid grid-cols-2 gap-4">${html}</div>
        </div>
      </div>
    `;
  }

  const featuredApp = APPS_DATA.find(a => a.category === 'Games') || APPS_DATA[0];
  let bannerHTML = '';
  if (featuredApp) {
    const isAttendEase = featuredApp.title === 'AttendEase';
    bannerHTML = `
      <div class="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-sm w-full group transition-all duration-300 hover:shadow-md">
        <!-- Card Banner Cover Image -->
        <div class="relative w-full h-[160px] sm:h-[200px] overflow-hidden cursor-pointer" onclick="openAppModal('${featuredApp.id}')">
          <span class="absolute top-3 left-3 bg-white/90 dark:bg-black/80 text-slate-900 dark:text-white text-[9px] font-bold px-2.5 py-1 rounded-md z-10 shadow-sm">Coming soon</span>
          ${(featuredApp.bannerDataUrl || featuredApp.iconDataUrl) 
            ? `<img src="${featuredApp.bannerDataUrl || featuredApp.iconDataUrl}" class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700">`
            : `<div class="w-full h-full bg-slate-850 flex items-center justify-center"><i data-lucide="image" class="w-10 h-10 text-slate-650"></i></div>`
          }
        </div>
        <!-- Card App Info Row (Google Play Store Style Layout) -->
        <div class="p-4 flex items-center justify-between gap-3 bg-white dark:bg-[#1E1E1E] border-t border-slate-100 dark:border-slate-800/50">
          <div class="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1" onclick="openAppModal('${featuredApp.id}')">
            <div class="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden shadow-sm border border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-805">
              ${appCardHTML(featuredApp, true)}
            </div>
            <div class="min-w-0">
              <h3 class="text-xs sm:text-sm font-bold text-slate-950 dark:text-white truncate">${escapeHtml(featuredApp.title)}</h3>
              <p class="text-[10px] sm:text-xs text-slate-550 dark:text-slate-400 truncate mt-0.5">${escapeHtml(featuredApp.authorName)}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">12+</span>
                <span class="text-[9px] text-slate-450 dark:text-slate-500">Rated for 12+</span>
              </div>
            </div>
          </div>
          <div class="flex flex-col items-center flex-shrink-0">
            <button onclick="openAppModal('${featuredApp.id}')" class="bg-[#c2e7ff] dark:bg-[#B8CCF6] hover:bg-[#b2e0ff] dark:hover:bg-[#a5bceb] text-[#001d35] dark:text-[#243B63] px-6 py-2.5 rounded-full font-extrabold text-[12px] shadow-sm transition-all flex items-center justify-center gap-1 hover:scale-105 active:scale-95 duration-200">
              Install
            </button>
            <span class="text-[8px] text-slate-450 dark:text-slate-500 mt-1 block">In-app purchases</span>
          </div>
        </div>
      </div>
    `;
  }

  // Prioritize Sponsored Apps (AttendEase is first!)
  let sponsoredApps = APPS_DATA.filter(a => a.isSponsored || a.title === 'AttendEase');
  if (sponsoredApps.length === 0) {
    sponsoredApps = [...APPS_DATA].reverse().slice(0, 3);
  } else {
    // Fill up to 3 apps if needed
    const otherApps = APPS_DATA.filter(a => !sponsoredApps.some(s => s.id === a.id));
    sponsoredApps = [...sponsoredApps, ...otherApps].slice(0, 3);
  }

  const suggestedHTML = sponsoredApps.map(app => {
    const isAttendEase = app.title === 'AttendEase';
    return `
      <div class="flex items-center gap-4 py-2.5 cursor-pointer group" onclick="openAppModal('${app.id}')">
        <div class="w-[60px] h-[60px] rounded-[1.1rem] overflow-hidden shadow-sm flex-shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">${appCardHTML(app)}</div>
        <div class="flex-1 min-w-0">
          <h3 class="font-medium text-slate-900 dark:text-white text-[13px] truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${escapeHtml(app.title)}</h3>
          <p class="text-slate-500 dark:text-slate-400 text-[11px] truncate mt-0.5">${escapeHtml(app.category)} • ${isAttendEase ? 'Productivity Check-in' : 'Featured App'}</p>
          <div class="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span class="flex items-center gap-0.5 text-slate-700 dark:text-slate-300">${isAttendEase ? '4.9' : '4.4'} <i data-lucide="star" class="w-2.5 h-2.5 fill-slate-700 dark:fill-slate-300"></i></span>
            <span>•</span>
            <span>${app.size || '8.8 MB'}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const games = APPS_DATA.filter(a => a.category === 'Games');
  const gamesHTML = games.length ? games.map(app => `
    <div class="w-[104px] flex flex-col gap-2.5 cursor-pointer flex-shrink-0 group" onclick="openAppModal('${app.id}')">
      <div class="w-[104px] h-[104px] rounded-[1.25rem] overflow-hidden shadow-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">${appCardHTML(app)}</div>
      <div class="min-w-0">
        <h3 class="font-medium text-slate-900 dark:text-white text-[11px] leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${escapeHtml(app.title)}</h3>
        <div class="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
          <span>4.6</span><i data-lucide="star" class="w-2.5 h-2.5 fill-slate-500"></i>
        </div>
      </div>
    </div>
  `).join('') : '<p class="text-xs text-slate-500">No games yet.</p>';

  return `
    <div class="max-w-2xl mx-auto pb-6">
      <!-- Top Scrollable Tabs -->
      <div class="flex overflow-x-auto hide-scrollbar border-b border-slate-200 dark:border-slate-800/50 -mx-4 px-4 sm:mx-0 sm:px-0 sticky top-0 bg-white dark:bg-[#121212] z-30 pt-1">
        ${topTabsHTML}
      </div>

      <!-- Sponsored List (Suggested for You) - Now 1st at the Top! -->
      <section class="mt-6 px-1">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-[13px] font-medium text-slate-900 dark:text-white flex items-center gap-2">
            Sponsored <span class="text-[8px] text-slate-400">•</span> Suggested for You
          </h2>
          <i data-lucide="more-vertical" class="w-4 h-4 text-slate-500 cursor-pointer"></i>
        </div>
        <div class="flex flex-col">
          ${suggestedHTML || emptyState('list', 'No Apps', 'Upload apps to see suggestions.')}
        </div>
      </section>

      <!-- Featured Banner - Now 2nd! -->
      <section class="mt-6 -mx-4 sm:mx-0">
        ${bannerHTML || emptyState('image', 'No Apps', 'Upload an app to see the banner.')}
      </section>

      <!-- Horizontal Scroller -->
      <section class="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/50 px-1">
        <div class="flex items-center justify-between mb-4 cursor-pointer group">
          <h2 class="text-[15px] font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Fantasy setting games</h2>
          <i data-lucide="arrow-right" class="w-5 h-5 text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"></i>
        </div>
        <div class="flex overflow-x-auto gap-3.5 hide-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          ${gamesHTML}
        </div>
      </section>
    </div>
  `;
}

// ── APPS PAGE ──
function renderAppsHTML(filterFn) {
  const apps = filterFn ? APPS_DATA.filter(filterFn) : APPS_DATA;
  const html = apps.length ? apps.map(app => `
    <div onclick="openAppModal('${app.id}')" class="bg-white dark:bg-[#1E1E1E] border border-slate-150 dark:border-slate-800 rounded-3xl p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4">
      <div class="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-150 dark:bg-slate-800">${appCardHTML(app, true)}</div>
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-slate-900 dark:text-white text-xs truncate">${escapeHtml(app.title)}</h3>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">${escapeHtml(app.category)}</p>
      </div>
      <button class="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-bold">View</button>
    </div>`).join('') :
    emptyState('layout-grid','Coming Soon','Check back later for new app releases!');

  return `<div class="max-w-2xl mx-auto p-4 space-y-6">
    <div><h1 class="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">All Applications</h1>
    <p class="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs mt-1">Browse and download community-uploaded software.</p></div>
    <div class="grid grid-cols-1 gap-4">${html}</div>
  </div>`;
}

function renderGamesHTML() {
  const apps = APPS_DATA.filter(a => a.category === 'Games');
  if (!apps.length) return `<div class="max-w-2xl mx-auto p-4 space-y-6">
    <div><h1 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Games</h1></div>
    ${emptyState('gamepad-2','Coming Soon','Check back later for new game releases!')}
  </div>`;
  return renderAppsHTML(a => a.category === 'Games').replace('All Applications','Games');
}

function renderToolsHTML() {
  const apps = APPS_DATA.filter(a => a.category === 'Utilities' || a.category === 'Developer Tools');
  if (!apps.length) return `<div class="max-w-2xl mx-auto p-4 space-y-6">
    <div><h1 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Utility Tools</h1></div>
    ${emptyState('wrench','Coming Soon','Check back later for new tool releases!')}
  </div>`;
  return renderAppsHTML(a => a.category === 'Utilities' || a.category === 'Developer Tools').replace('All Applications','Utility Tools');
}

function renderTopChartsHTML() {
  const html = APPS_DATA.length ? APPS_DATA.map((app, i) => `
    <div onclick="openAppModal('${app.id}')" class="flex items-center gap-4 bg-white dark:bg-[#1E1E1E] border border-slate-150 dark:border-slate-800 p-4 rounded-3xl cursor-pointer hover:shadow-md transition-all">
      <span class="text-xl font-extrabold text-slate-300 dark:text-slate-700 w-8 text-center">${i+1}</span>
      <div class="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-150 dark:bg-slate-800">${appCardHTML(app, true)}</div>
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-slate-900 dark:text-white truncate text-xs">${escapeHtml(app.title)}</h3>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">${escapeHtml(app.category)}</p>
      </div>
      <button class="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-bold">View</button>
    </div>`).join('') :
    emptyState('bar-chart-2','No apps yet','Apps will appear here once uploaded.');

  return `<div class="max-w-2xl mx-auto p-4 space-y-6">
    <div><h1 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Top Charts</h1></div>
    <div class="grid grid-cols-1 gap-4">${html}</div>
  </div>`;
}

function renderNewReleasesHTML() {
  const apps = [...APPS_DATA].reverse();
  const html = apps.length ? apps.map(app => `
    <div onclick="openAppModal('${app.id}')" class="flex items-center gap-4 bg-white dark:bg-[#1E1E1E] border border-slate-150 dark:border-slate-800 p-4 rounded-3xl cursor-pointer hover:shadow-md transition-all">
      <div class="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-150 dark:bg-slate-800">${appCardHTML(app, true)}</div>
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-slate-900 dark:text-white truncate text-xs">${escapeHtml(app.title)}</h3>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">${escapeHtml(app.category)}</p>
      </div>
      <span class="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-brand px-2 py-1 rounded-lg">NEW</span>
    </div>`).join('') :
    emptyState('clock','No releases yet','Check back after developers upload apps.');

  return `<div class="max-w-2xl mx-auto p-4 space-y-6">
    <div><h1 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">New Releases</h1></div>
    <div class="grid grid-cols-1 gap-4">${html}</div>
  </div>`;
}

// ── SEARCH PAGE ──
function renderSearchHTML() {
  return `
    <div class="max-w-2xl mx-auto p-4 space-y-6">
      <!-- Search Input Bar -->
      <div class="relative">
        <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
        <input type="text" id="global-search-input" oninput="handleSearchOnPage(this.value)"
          placeholder="Search for apps, games, tools..."
          class="w-full bg-slate-100 dark:bg-[#1e1e1f] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm rounded-full pl-9 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
      </div>

      <!-- Trending Searches -->
      <div id="search-suggestions-container" class="space-y-4">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400 mb-3">Trending Searches</h2>
        <div class="space-y-3">
          <div class="flex items-center gap-3 cursor-pointer hover:text-blue-500 transition-colors py-1" onclick="triggerSearchText('Attendease')">
            <i data-lucide="trending-up" class="w-4 h-4 text-slate-400"></i>
            <span class="text-xs font-medium text-slate-800 dark:text-slate-200">Attendease App</span>
          </div>
          <div class="flex items-center gap-3 cursor-pointer hover:text-blue-500 transition-colors py-1" onclick="triggerSearchText('game')">
            <i data-lucide="trending-up" class="w-4 h-4 text-slate-400"></i>
            <span class="text-xs font-medium text-slate-800 dark:text-slate-200">Fantasy Games</span>
          </div>
          <div class="flex items-center gap-3 cursor-pointer hover:text-blue-500 transition-colors py-1" onclick="triggerSearchText('tools')">
            <i data-lucide="trending-up" class="w-4 h-4 text-slate-400"></i>
            <span class="text-xs font-medium text-slate-800 dark:text-slate-200">Developer Tools</span>
          </div>
        </div>
      </div>

      <!-- Search Results Area -->
      <div id="search-results-area" class="grid grid-cols-1 gap-4 hidden"></div>
    </div>
  `;
}

window.triggerSearchText = function(text) {
  const input = document.getElementById('global-search-input');
  if (input) {
    input.value = text;
    handleSearchOnPage(text);
  }
};

window.handleSearchOnPage = function(query) {
  const suggestions = document.getElementById('search-suggestions-container');
  const resultsArea = document.getElementById('search-results-area');
  const q = query.toLowerCase().trim();

  if (!q) {
    if (suggestions) suggestions.classList.remove('hidden');
    if (resultsArea) resultsArea.classList.add('hidden');
    return;
  }

  if (suggestions) suggestions.classList.add('hidden');
  if (resultsArea) {
    resultsArea.classList.remove('hidden');

    const filtered = APPS_DATA.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );

    if (filtered.length) {
      resultsArea.innerHTML = filtered.map(app => `
        <div onclick="openAppModal('${app.id}')" class="bg-white dark:bg-[#1e1e1f] border border-slate-150 dark:border-slate-800 rounded-3xl p-4 cursor-pointer hover:shadow-md transition-all flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-150 dark:bg-slate-800">${appCardHTML(app, true)}</div>
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-slate-900 dark:text-white text-xs truncate">${escapeHtml(app.title)}</h3>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">${escapeHtml(app.category)}</p>
          </div>
          <button class="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-bold">View</button>
        </div>`).join('');
    } else {
      resultsArea.innerHTML = `
        <div class="py-16 text-center text-slate-400">
          <i data-lucide="search-x" class="w-12 h-12 mx-auto mb-3 text-slate-355"></i>
          <h3 class="font-bold text-slate-500 dark:text-slate-400 text-xs">No results for "${escapeHtml(query)}"</h3>
        </div>`;
    }
  }
  if (window.lucide) lucide.createIcons();
};

// ── DEVELOPER UPLOAD HANDLERS ──
window.handleIconSelect = function(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadIconData = e.target.result;
    const preview = document.getElementById('icon-preview');
    if (preview) {
      preview.src = uploadIconData;
      preview.classList.add('show');
    }
  };
  reader.readAsDataURL(file);
};

window.handleAppUpload = async function() {
  const name = document.getElementById('upload-name').value.trim();
  const category = document.getElementById('upload-category').value;
  const link = document.getElementById('upload-link').value.trim();
  const desc = document.getElementById('upload-desc').value.trim();
  const info = document.getElementById('upload-info').value.trim();
  const size = document.getElementById('upload-size').value.trim();
  const screenshotsRaw = document.getElementById('upload-screenshots').value.trim();
  const errEl = document.getElementById('upload-error');
  const successEl = document.getElementById('upload-success');
  if (errEl) errEl.classList.add('hidden');
  if (successEl) successEl.classList.add('hidden');

  if (!name) { if (errEl) { errEl.textContent = 'Please enter an app name.'; errEl.classList.remove('hidden'); } return; }
  if (!category) { if (errEl) { errEl.textContent = 'Please select a category.'; errEl.classList.remove('hidden'); } return; }
  if (!link) { if (errEl) { errEl.textContent = 'Please enter a download link.'; errEl.classList.remove('hidden'); } return; }
  if (!uploadIconData) { if (errEl) { errEl.textContent = 'Please upload an app icon image.'; errEl.classList.remove('hidden'); } return; }
  if (!desc) { if (errEl) { errEl.textContent = 'Please add a description.'; errEl.classList.remove('hidden'); } return; }

  if (successEl) {
    successEl.innerHTML = '⏳ Saving your app to Firebase...';
    successEl.classList.remove('hidden');
  }

  try {
    await db.collection("apps").add({
      title: name,
      category,
      description: desc,
      appInfo: info,
      size: size || 'Unknown',
      iconDataUrl: uploadIconData,
      downloadLink: link,
      screenshots: screenshotsRaw ? screenshotsRaw.split(',').map(s=>s.trim()).filter(s=>s) : [],
      authorUid: currentUser ? currentUser.uid : 'anonymous',
      authorName: currentUser ? currentUser.name : 'Unknown Developer',
      uploadedAt: new Date().toISOString(),
    });

    uploadIconData = null;

    if (successEl) successEl.innerHTML = `✔ <strong>"${escapeHtml(name)}"</strong> has been published to the cloud!`;
    
    ['upload-name','upload-desc','upload-info','upload-size','upload-link','upload-screenshots'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const catSelect = document.getElementById('upload-category');
    if (catSelect) catSelect.value = '';
    const fileInput = document.getElementById('upload-icon');
    if (fileInput) fileInput.value = '';
    const preview = document.getElementById('icon-preview');
    if (preview) preview.classList.remove('show');
  } catch (err) {
    if (errEl) {
      errEl.textContent = 'Error saving app: ' + err.message;
      errEl.classList.remove('hidden');
    }
    if (successEl) successEl.classList.add('hidden');
  }
};

window.deleteApp = async function(id) {
  if (!confirm('Delete this app from the cloud? This cannot be undone.')) return;
  try {
    await db.collection("apps").doc(id).delete();
  } catch (err) {
    alert("Error deleting: " + err.message);
  }
};

// ── APP DETAIL MODAL & GUIDE GENERATOR ──
window.openAppModal = async function(appId) {
  const app = APPS_DATA.find(a => a.id === appId);
  if (!app) return;
  selectedApp = app;

  document.getElementById('modal-app-title').textContent = app.title;
  document.getElementById('modal-app-meta').textContent = app.authorName || 'HankStudio Developer';
  document.getElementById('modal-app-desc').textContent = app.description;
  document.getElementById('modal-stat-size').textContent = app.size || '8.8 MB';
  
  const categoryChip = document.getElementById('modal-category-chip');
  if (categoryChip) {
    categoryChip.textContent = app.category;
    categoryChip.onclick = () => { closeAppModal(); searchCategory(app.category); };
  }

  const iconEl = document.getElementById('modal-app-icon');
  if (iconEl) iconEl.innerHTML = appCardHTML(app);

  const dlBtn = document.getElementById('modal-download-btn');
  if (dlBtn) {
    if (app.downloadLink) {
      dlBtn.onclick = () => { downloadSelectedApp(); };
      dlBtn.textContent = `Install`;
      dlBtn.disabled = false;
      dlBtn.style.opacity = '1';
    } else {
      dlBtn.textContent = 'Install Unavailable';
      dlBtn.disabled = true;
      dlBtn.style.opacity = '0.5';
    }
  }

  const ssContainer = document.getElementById('modal-screenshots-container');
  const ssGallery = document.getElementById('modal-screenshots');
  if (app.screenshots && app.screenshots.length > 0) {
    if (ssContainer) ssContainer.classList.remove('hidden');
    if (ssGallery) ssGallery.innerHTML = app.screenshots.map(s => `<img src="${escapeHtml(s)}" class="h-32 md:h-48 rounded-xl object-cover shadow-sm snap-center flex-shrink-0 border border-slate-200 dark:border-slate-800" onerror="this.style.display='none'">`).join('');
  } else {
    if (ssContainer) ssContainer.classList.add('hidden');
    if (ssGallery) ssGallery.innerHTML = '';
  }

  fetchReviews(app.id);

  const appModal = document.getElementById('app-detail-modal');
  if (appModal) appModal.classList.remove('hidden');
  const viewport = document.getElementById('main-content-viewport');
  if (viewport) viewport.style.overflowY = 'hidden';
  document.body.style.overflow = 'hidden';
  
  // Reset modal scroll position
  const scrollContainer = document.getElementById('modal-content-scroll');
  if (scrollContainer) scrollContainer.scrollTop = 0;
};

window.closeAppModal = function() {
  const appModal = document.getElementById('app-detail-modal');
  if (appModal) appModal.classList.add('hidden');
  const viewport = document.getElementById('main-content-viewport');
  if (viewport) viewport.style.overflowY = 'auto';
  document.body.style.overflow = '';
  selectedApp = null;
};

// ── REVIEWS & GUIDE LOGIC ──
let currentReviewRating = 0;
window.setReviewRating = function(rating) {
  currentReviewRating = rating;
  const starSelector = document.getElementById('review-star-selector');
  if (starSelector) {
    const stars = starSelector.children;
    for (let i = 0; i < 5; i++) {
      if (i < rating) {
        stars[i].className = "w-5 h-5 cursor-pointer text-blue-600 dark:text-blue-400 transition-colors";
      } else {
        stars[i].className = "w-5 h-5 cursor-pointer text-slate-350 dark:text-slate-700 hover:text-blue-500 transition-colors";
      }
    }
  }
};

window.fetchReviews = async function(appId) {
  const listEl = document.getElementById('modal-reviews-list');
  if (!listEl) return;
  listEl.innerHTML = '<p class="text-xs text-slate-550">Loading reviews...</p>';
  
  const authMsg = document.getElementById('review-auth-msg');
  const reviewText = document.getElementById('review-text');
  if (authMsg) authMsg.classList.toggle('hidden', !!currentUser);
  if (reviewText) {
    reviewText.disabled = !currentUser;
    reviewText.value = '';
  }
  setReviewRating(0);

  try {
    let dbReviews = [];
    if (db) {
      const snap = await db.collection(`apps/${appId}/reviews`).orderBy('timestamp', 'desc').get();
      snap.forEach(doc => {
        dbReviews.push(doc.data());
      });
    }

    const reviews = dbReviews;

    let sum = 0, count = 0;
    let distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let html = '';
    
    reviews.forEach(r => {
      sum += r.rating;
      count++;
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }

      const initial = r.userName ? r.userName.charAt(0).toUpperCase() : 'U';
      const formattedDate = r.timestamp ? new Date(r.timestamp).toLocaleDateString('en-GB') : '08/04/23';
      const helpful = r.helpfulCount || Math.floor(Math.random() * 5) + 1;
      
      let replyHTML = '';
      if (r.reply) {
        replyHTML = `
          <div class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-3.5 mt-3 border border-slate-150 dark:border-slate-805 text-[10px] space-y-1 ml-4 shadow-xs">
            <div class="flex justify-between items-center text-slate-900 dark:text-white font-bold">
              <span>Developer Response</span>
              <span class="text-slate-400 dark:text-slate-500 font-normal">17/08/23</span>
            </div>
            <p class="text-slate-650 dark:text-slate-400 leading-relaxed mt-1">${escapeHtml(r.reply)}</p>
          </div>
        `;
      }

      html += `
        <div class="py-3 border-b border-slate-100 dark:border-slate-850/60 space-y-2">
          <!-- User Profile Row -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-355 flex items-center justify-center font-bold text-xs shadow-xs border border-slate-200/50 dark:border-slate-700/50">
                ${initial}
              </div>
              <span class="text-xs font-semibold text-slate-900 dark:text-white">${escapeHtml(r.userName)}</span>
            </div>
            <button class="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white active:scale-95 transition-transform">
              <i data-lucide="more-vertical" class="w-4 h-4"></i>
            </button>
          </div>
          <!-- Stars & Date Row -->
          <div class="flex items-center gap-2">
            <div class="flex gap-0.5">${`<i data-lucide="star" class="w-2.5 h-2.5 fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400"></i>`.repeat(r.rating) + `<i data-lucide="star" class="w-2.5 h-2.5 text-slate-200 dark:text-slate-750"></i>`.repeat(5 - r.rating)}</div>
            <span class="text-[9px] text-slate-450 dark:text-slate-500">${formattedDate}</span>
          </div>
          <!-- Review Comment -->
          <p class="text-[11px] sm:text-xs text-slate-650 dark:text-slate-350 leading-relaxed">${escapeHtml(r.comment)}</p>
          <!-- Helpful Buttons Row -->
          <div class="flex items-center justify-between mt-3 text-[10px] text-slate-450 dark:text-slate-500">
            <span>${helpful} ${helpful === 1 ? 'person' : 'people'} found this helpful</span>
            <div class="flex gap-2">
              <span class="text-[9px] font-bold text-slate-750 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-0.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-all select-none">Yes</span>
              <span class="text-[9px] font-bold text-slate-750 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-0.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-all select-none">No</span>
            </div>
          </div>
          <!-- Developer Reply -->
          ${replyHTML}
        </div>
      `;
    });

    let averageRating = '0.0';
    if (count > 0) {
      averageRating = (sum / count).toFixed(1);
      listEl.innerHTML = html;
      document.getElementById('modal-app-rating').textContent = averageRating;
      document.getElementById('modal-rating-huge').textContent = averageRating;
      document.getElementById('modal-review-count-total').textContent = count;
      document.getElementById('modal-stat-rating-count').textContent = `${count} reviews`;
    } else {
      listEl.innerHTML = '<p class="text-xs text-slate-550">No reviews yet. Be the first!</p>';
      document.getElementById('modal-app-rating').textContent = '0.0';
      document.getElementById('modal-rating-huge').textContent = '0.0';
      document.getElementById('modal-review-count-total').textContent = '0';
      document.getElementById('modal-stat-rating-count').textContent = `0 reviews`;
    }

    // Dynamic Stars Summary
    const starsSummary = document.getElementById('modal-reviews-stars-summary');
    if (starsSummary) {
      const roundedRating = Math.round(parseFloat(averageRating));
      starsSummary.innerHTML = `<i data-lucide="star" class="w-3.5 h-3.5 fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400"></i>`.repeat(roundedRating) +
                              `<i data-lucide="star" class="w-3.5 h-3.5 text-slate-200 dark:text-slate-750"></i>`.repeat(5 - roundedRating);
    }

    // Update progress bars
    for (let ratingVal = 1; ratingVal <= 5; ratingVal++) {
      const barEl = document.getElementById(`bar-${ratingVal}`);
      if (barEl) {
        const percent = count > 0 ? (distribution[ratingVal] / count) * 100 : 0;
        barEl.style.width = `${percent}%`;
      }
    }

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    listEl.innerHTML = '<p class="text-xs text-red-500">Failed to load reviews.</p>';
    console.error(err);
  }
};

window.submitReview = async function() {
  if (!selectedApp) return;
  if (!currentUser) return alert('You must log in to leave a review.');
  if (currentReviewRating === 0) return alert('Please select a star rating.');
  const text = document.getElementById('review-text').value.trim();
  if (!text) return alert('Please write a short review.');

  const btn = event.target;
  btn.textContent = 'Submitting...';
  btn.disabled = true;

  try {
    await db.collection(`apps/${selectedApp.id}/reviews`).add({
      userId: currentUser.uid,
      userName: currentUser.name,
      rating: currentReviewRating,
      comment: text,
      timestamp: new Date().toISOString()
    });
    fetchReviews(selectedApp.id);
  } catch (err) {
    alert("Error saving review: " + err.message);
  } finally {
    btn.textContent = 'Submit Review';
    btn.disabled = false;
  }
};



function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
