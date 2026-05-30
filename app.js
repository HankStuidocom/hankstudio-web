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
      renderContent();
    });
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
      <button onclick="setActiveTab('profile')" class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center border border-slate-250 dark:border-slate-800 shadow-sm hover:scale-105 transition-transform overflow-hidden" title="View Profile">
        ${avatarContent}
      </button>`;
  } else {
    area.innerHTML = `
      <button onclick="openAuthModal('login')" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-205 dark:border-slate-700 flex items-center justify-center shadow-sm hover:scale-105 transition-transform" title="Sign In">
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
  renderNavs();
  renderContent();
  renderBottomNav();
  const viewport = document.getElementById('main-content-viewport');
  if (viewport) viewport.scrollTo({ top: 0, behavior: 'smooth' });
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
  const navContainer = document.querySelector('nav.absolute.bottom-0');
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
  return `<div class="bg-slate-50 dark:bg-[#1e1e1f] border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-12 text-center">
    <i data-lucide="${icon}" class="w-14 h-14 text-slate-300 dark:text-slate-650 mx-auto mb-4"></i>
    <h3 class="text-base font-bold text-slate-800 dark:text-white">${title}</h3>
    <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">${msg}</p>
    ${btnLabel ? `<button onclick="openDeveloperModal()" class="mt-6 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm">${btnLabel}</button>` : ''}
  </div>`;
}

// ── PROFILE PAGE ──
function renderProfileHTML() {
  if (!currentUser) {
    return `<div class="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">My Profile</h1>
      <div class="bg-slate-50 dark:bg-[#1e1e1f] border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-12 text-center">
        <i data-lucide="user-x" class="w-14 h-14 text-slate-300 dark:text-slate-750 mx-auto mb-4"></i>
        <h3 class="text-base font-bold text-slate-800 dark:text-white">Not Logged In</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">You must log in to view your profile.</p>
        <button onclick="openAuthModal('login')" class="mt-6 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm">Log In</button>
      </div>
    </div>`;
  }

  const myApps = APPS_DATA.filter(a => a.authorUid === currentUser.uid);

  const appsHtml = myApps.length ? `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${myApps.map(app => `
    <div class="bg-white dark:bg-[#1e1e1f] border border-slate-200 dark:border-slate-800 rounded-[1.5rem] p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all" onclick="openAppModal('${app.id}')">
      <div class="w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden shadow-sm">${appCardHTML(app)}</div>
      <div class="flex-1 min-w-0">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate">${escapeHtml(app.title)}</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">${escapeHtml(app.category)}</p>
      </div>
    </div>
  `).join('')}</div>` : `<p class="text-sm text-slate-400 dark:text-slate-500">You haven't uploaded any apps yet.</p>`;

  const isDarkModeActive = document.documentElement.classList.contains('dark');
  const displayName = currentUser.name || (currentUser.email ? currentUser.email.split('@')[0] : 'User');
  const initialLetter = displayName.charAt(0).toUpperCase();

  // Dynamic settings card for dark mode toggle button
  const toggleCardHtml = `
    <div class="bg-white dark:bg-[#1e1e1f] border border-slate-200 dark:border-slate-800 rounded-[1.5rem] p-5 mt-6 flex items-center justify-between shadow-sm">
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

  return `<div class="p-6 lg:p-10 max-w-5xl mx-auto space-y-6">
    <!-- Profile Header -->
    <div class="flex items-center gap-6 p-6 bg-slate-50 dark:bg-[#1e1e1f] border border-slate-200 dark:border-slate-800 rounded-[2rem]">
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
    ${toggleCardHtml}

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
      <div class="bg-slate-50 dark:bg-[#1e1e1f] border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-12 text-center">
        <i data-lucide="lock" class="w-14 h-14 text-slate-350 dark:text-slate-700 mx-auto mb-4"></i>
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
        <div class="bg-white dark:bg-[#1e1e1f] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-750 transition-all">
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
    <div class="bg-slate-50 dark:bg-[#1e1e1f] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
      <i data-lucide="layout-grid" class="w-10 h-10 text-slate-350 dark:text-slate-700 mx-auto mb-2"></i>
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
        <div class="lg:col-span-7 bg-white dark:bg-[#1e1e1f] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-5">
          <h2 class="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <i data-lucide="upload-cloud" class="w-4.5 h-4.5 text-brand"></i> Upload New Application
          </h2>

          <div id="upload-error" class="hidden bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-550/20 text-red-600 dark:text-red-400 p-3.5 rounded-2xl text-xs font-medium leading-relaxed"></div>
          <div id="upload-success" class="hidden bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-500/25 text-brand p-3.5 rounded-2xl text-xs font-medium leading-relaxed"></div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">App Name *</label>
              <input id="upload-name" type="text" placeholder="e.g. HankStudio Code Editor"
                class="w-full bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition-all"/>
            </div>

            <div>
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Category *</label>
              <select id="upload-category" 
                class="w-full bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition-all">
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
                class="w-full bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition-all"/>
            </div>

            <div>
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">App Size (optional)</label>
              <input id="upload-size" type="text" placeholder="e.g. 15.4 MB"
                class="w-full bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition-all"/>
            </div>
          </div>

          <div>
            <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Screenshots (optional, comma-separated image URLs)</label>
            <input id="upload-screenshots" type="text" placeholder="e.g. https://site.com/img1.png, https://site.com/img2.png"
              class="w-full bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition-all"/>
          </div>

          <!-- Icon upload and preview -->
          <div class="bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div class="relative shrink-0 w-16 h-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
              <img id="icon-preview" class="w-full h-full object-cover hidden"/>
              <i data-lucide="image" id="icon-placeholder-icon" class="w-6 h-6 text-slate-400"></i>
            </div>
            <div class="flex-1 w-full space-y-1 text-center sm:text-left">
              <p class="text-xs font-bold text-slate-900 dark:text-white">App Icon Image *</p>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 mb-2">Select a premium, high-res PNG/JPG icon.</p>
              <label class="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white px-3.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all shadow-xs">
                <i data-lucide="file-image" class="w-3.5 h-3.5"></i> Browse Icon...
                <input id="upload-icon" type="file" accept="image/*" class="hidden" onchange="handleIconSelect(this); document.getElementById('icon-placeholder-icon').classList.add('hidden')"/>
              </label>
            </div>
          </div>

          <div>
            <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Short Description *</label>
            <textarea id="upload-desc" rows="3" placeholder="Explain the main features, utility, and user value..."
              class="w-full bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition-all resize-none"></textarea>
          </div>

          <div>
            <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Detailed Tech Info & Requirements (optional)</label>
            <textarea id="upload-info" rows="2" placeholder="e.g. Requires Windows 10/11 x64, 4GB RAM minimum..."
              class="w-full bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-brand transition-all resize-none"></textarea>
          </div>

          <button onclick="handleAppUpload()"
            class="w-full py-3 bg-brand hover:bg-brand-hover text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5">
            <i data-lucide="upload" class="w-4 h-4"></i> Publish Application
          </button>
        </div>

        <!-- APP LIST & STATS (Right side) -->
        <div class="lg:col-span-5 space-y-6">
          <!-- Developer Info/Stats Card -->
          <div class="bg-white dark:bg-[#1e1e1f] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-4">
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
              <div class="bg-slate-50 dark:bg-[#131314] border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-3.5 text-center">
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Published</p>
                <p class="text-lg font-black text-slate-900 dark:text-white mt-0.5">${myApps.length}</p>
              </div>
              <div class="bg-slate-50 dark:bg-[#131314] border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-3.5 text-center">
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Points</p>
                <p class="text-lg font-black text-slate-900 dark:text-white mt-0.5">380</p>
              </div>
            </div>
          </div>

          <!-- Apps Management Card -->
          <div class="bg-white dark:bg-[#1e1e1f] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-4">
            <h2 class="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <i data-lucide="folder-git" class="w-4.5 h-4.5 text-brand"></i> Manage Applications
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
  const topTabs = ['For you', 'Top charts', 'Premium', 'Categories'];
  const topTabsHTML = topTabs.map((tab, i) => `
    <div class="px-4 py-3 whitespace-nowrap cursor-pointer text-[13px] font-medium ${i===0 ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
      ${tab}
    </div>
  `).join('');

  const featuredApp = APPS_DATA.find(a => a.category === 'Games') || APPS_DATA[0];
  let bannerHTML = '';
  if (featuredApp) {
    bannerHTML = `
      <div class="relative w-full h-[280px] sm:h-[340px] rounded-[1.5rem] overflow-hidden cursor-pointer group shadow-sm border border-slate-200 dark:border-slate-800" onclick="openAppModal('${featuredApp.id}')">
        <div class="absolute inset-0 bg-slate-900">
          ${featuredApp.iconDataUrl ? `<img src="${featuredApp.iconDataUrl}" class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700">` : ''}
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent flex flex-col justify-end p-5 sm:p-6">
          <span class="bg-white text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-full w-max mb-3 shadow-sm">Coming soon</span>
          <h2 class="text-white text-xl sm:text-2xl font-medium leading-tight mb-4 tracking-tight drop-shadow-sm">${featuredApp.title}</h2>
          
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.25rem] overflow-hidden shadow-md flex-shrink-0 bg-slate-800 border border-slate-700">
              ${appCardHTML(featuredApp)}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-white text-sm font-medium truncate">${escapeHtml(featuredApp.title)}</h3>
              <p class="text-slate-300 text-[11px] truncate">${escapeHtml(featuredApp.authorName)}</p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.5 rounded border border-slate-600 font-bold">12+</span>
                <span class="text-slate-400 text-[10px]">Rated for 12+</span>
              </div>
            </div>
            <button class="bg-blue-200 hover:bg-blue-300 text-blue-900 px-6 py-2 rounded-full font-medium text-[13px] shadow-sm transition-colors">Install</button>
          </div>
        </div>
      </div>
    `;
  }

  const suggestedApps = [...APPS_DATA].reverse().slice(0, 3);
  const suggestedHTML = suggestedApps.map(app => `
    <div class="flex items-center gap-4 py-2.5 cursor-pointer group" onclick="openAppModal('${app.id}')">
      <div class="w-[60px] h-[60px] rounded-[1.1rem] overflow-hidden shadow-sm flex-shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">${appCardHTML(app)}</div>
      <div class="flex-1 min-w-0">
        <h3 class="font-medium text-slate-900 dark:text-white text-[13px] truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${escapeHtml(app.title)}</h3>
        <p class="text-slate-500 dark:text-slate-400 text-[11px] truncate mt-0.5">${escapeHtml(app.category)} • Single player</p>
        <div class="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          <span class="flex items-center gap-0.5 text-slate-700 dark:text-slate-300">4.4 <i data-lucide="star" class="w-2.5 h-2.5 fill-slate-700 dark:fill-slate-300"></i></span>
          <span>•</span>
          <span>${app.size || '268 MB'}</span>
        </div>
      </div>
    </div>
  `).join('');

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
      <div class="flex overflow-x-auto hide-scrollbar border-b border-slate-200 dark:border-slate-800/50 -mx-4 px-4 sm:mx-0 sm:px-0 sticky top-0 bg-white dark:bg-[#131314] z-30 pt-1">
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
    <div onclick="openAppModal('${app.id}')" class="bg-white dark:bg-[#1e1e1f] border border-slate-150 dark:border-slate-800 rounded-3xl p-6 hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-all flex flex-col justify-between h-[300px]">
      <div>
        <div class="w-14 h-14 rounded-xl overflow-hidden shadow-sm mb-4">${appCardHTML(app)}</div>
        <h3 class="font-bold text-slate-900 dark:text-white text-sm mb-1 truncate">${escapeHtml(app.title)}</h3>
        <p class="text-xs text-slate-400 mb-2 font-medium">${escapeHtml(app.category)}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">${escapeHtml(app.description)}</p>
      </div>
      <button class="mt-4 w-full py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-brand text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-colors">
        <i data-lucide="download" class="w-3 h-3"></i> View & Download
      </button>
    </div>`).join('') :
    emptyState('layout-grid','Coming Soon','Check back later for new app releases!');

  return `<div class="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
    <div><h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">All Applications</h1>
    <p class="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">Browse and download community-uploaded software.</p></div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">${html}</div>
  </div>`;
}

function renderGamesHTML() {
  const apps = APPS_DATA.filter(a => a.category === 'Games');
  if (!apps.length) return `<div class="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
    <div><h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Games</h1></div>
    ${emptyState('gamepad-2','Coming Soon','Check back later for new game releases!')}
  </div>`;
  return renderAppsHTML(a => a.category === 'Games').replace('All Applications','Games');
}

function renderToolsHTML() {
  const apps = APPS_DATA.filter(a => a.category === 'Utilities' || a.category === 'Developer Tools');
  if (!apps.length) return `<div class="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
    <div><h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Utility Tools</h1></div>
    ${emptyState('wrench','Coming Soon','Check back later for new tool releases!')}
  </div>`;
  return renderAppsHTML(a => a.category === 'Utilities' || a.category === 'Developer Tools').replace('All Applications','Utility Tools');
}

function renderTopChartsHTML() {
  const html = APPS_DATA.length ? APPS_DATA.map((app, i) => `
    <div onclick="openAppModal('${app.id}')" class="flex items-center gap-4 bg-white dark:bg-[#1e1e1f] border border-slate-150 dark:border-slate-800 p-4 rounded-3xl cursor-pointer hover:shadow-md transition-all">
      <span class="text-xl font-extrabold text-slate-300 dark:text-slate-700 w-8 text-center">${i+1}</span>
      <div class="w-14 h-14 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-100 dark:bg-slate-800">${appCardHTML(app)}</div>
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-slate-900 dark:text-white truncate text-sm">${escapeHtml(app.title)}</h3>
        <p class="text-xs text-slate-400">${escapeHtml(app.category)}</p>
      </div>
      <button class="bg-brand-bg dark:bg-brand-dark hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-brand px-4 py-2 rounded-xl text-xs font-bold transition-colors">View</button>
    </div>`).join('') :
    emptyState('bar-chart-2','No apps yet','Apps will appear here once uploaded.');

  return `<div class="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
    <div><h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Top Charts</h1></div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">${html}</div>
  </div>`;
}

function renderNewReleasesHTML() {
  const apps = [...APPS_DATA].reverse();
  const html = apps.length ? apps.map(app => `
    <div onclick="openAppModal('${app.id}')" class="flex items-center gap-4 bg-white dark:bg-[#1e1e1f] border border-slate-150 dark:border-slate-800 p-4 rounded-3xl cursor-pointer hover:shadow-md transition-all">
      <div class="w-14 h-14 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-100 dark:bg-slate-800">${appCardHTML(app)}</div>
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-slate-900 dark:text-white truncate text-sm">${escapeHtml(app.title)}</h3>
        <p class="text-xs text-slate-400">${escapeHtml(app.category)}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">${escapeHtml(app.description)}</p>
      </div>
      <span class="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-brand px-2 py-1 rounded-lg">NEW</span>
    </div>`).join('') :
    emptyState('clock','No releases yet','Check back after developers upload apps.');

  return `<div class="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
    <div><h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">New Releases</h1></div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">${html}</div>
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
  document.getElementById('modal-app-meta').textContent = app.category;
  document.getElementById('modal-app-rating').textContent = '5.0';
  document.getElementById('modal-app-desc').textContent = app.description;
  document.getElementById('modal-app-info').textContent = app.appInfo || 'No additional info provided.';

  const iconEl = document.getElementById('modal-app-icon');
  if (iconEl) iconEl.innerHTML = appCardHTML(app);

  const dlBtn = document.getElementById('modal-download-btn');
  if (dlBtn) {
    if (app.downloadLink) {
      dlBtn.onclick = () => { window.open(app.downloadLink, '_blank'); };
      dlBtn.textContent = `⬇ Download ${app.title}`;
      dlBtn.disabled = false;
      dlBtn.style.opacity = '1';
    } else {
      dlBtn.textContent = '⬇ Download Unavailable';
      dlBtn.disabled = true;
      dlBtn.style.opacity = '0.5';
    }
  }

  const ssContainer = document.getElementById('modal-screenshots-container');
  const ssGallery = document.getElementById('modal-screenshots');
  if (app.screenshots && app.screenshots.length > 0) {
    if (ssContainer) ssContainer.classList.remove('hidden');
    if (ssGallery) ssGallery.innerHTML = app.screenshots.map(s => `<img src="${escapeHtml(s)}" class="h-32 md:h-48 rounded-xl object-cover shadow-sm snap-center flex-shrink-0 border border-slate-800" onerror="this.style.display='none'">`).join('');
  } else {
    if (ssContainer) ssContainer.classList.add('hidden');
    if (ssGallery) ssGallery.innerHTML = '';
  }

  fetchReviews(app.id);

  const appModal = document.getElementById('app-detail-modal');
  if (appModal) appModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  loadAIGuide(app);
};

window.closeAppModal = function() {
  const appModal = document.getElementById('app-detail-modal');
  if (appModal) appModal.classList.add('hidden');
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
        stars[i].classList.replace('text-slate-650', 'text-amber-400');
        stars[i].classList.replace('hover:text-amber-400', 'text-amber-400');
      } else {
        stars[i].classList.replace('text-amber-400', 'text-slate-650');
        stars[i].classList.replace('text-amber-400', 'hover:text-amber-400');
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
    const snap = await db.collection(`apps/${appId}/reviews`).orderBy('timestamp', 'desc').get();
    
    let sum = 0, count = 0;
    let html = '';
    snap.forEach(doc => {
      const r = doc.data();
      sum += r.rating;
      count++;
      html += `<div class="bg-slate-900 border border-slate-800 rounded-xl p-3">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-bold text-slate-300">${escapeHtml(r.userName)}</span>
          <div class="flex gap-0.5">${'<i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i>'.repeat(r.rating)}</div>
        </div>
        <p class="text-[10px] sm:text-xs text-slate-400">${escapeHtml(r.comment)}</p>
      </div>`;
    });

    if (count > 0) {
      listEl.innerHTML = html;
      document.getElementById('modal-app-rating').textContent = (sum / count).toFixed(1);
    } else {
      listEl.innerHTML = '<p class="text-xs text-slate-500">No reviews yet. Be the first!</p>';
      document.getElementById('modal-app-rating').textContent = '5.0';
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

window.loadAIGuide = async function(app) {
  const box = document.getElementById('modal-guide-content');
  if (!box) return;
  box.innerHTML = `<div class="flex items-center gap-2 text-slate-400 text-xs animate-pulse"><i data-lucide="loader" class="w-4 h-4 animate-spin text-brand"></i> Generating AI guide for ${escapeHtml(app.title)}...</div>`;
  if (window.lucide) lucide.createIcons();
  const prompt = `Write a quick-start guide for the app "${app.title}" (${app.category}). Include 3 key tips and what makes it useful. Description: ${app.description}`;
  try {
    const result = await callGemini(prompt, 'You are a helpful software assistant. Write short, practical quick-start guides.');
    currentGuideText = result;
    box.innerHTML = formatText(result);
  } catch (e) {
    box.innerHTML = `<p class="text-slate-400 text-xs">AI guide unavailable. Add a Gemini API key in the chat settings to enable AI features.</p>`;
  }
};

window.regenerateGuide = function() {
  if (selectedApp) loadAIGuide(selectedApp);
};

function formatText(text) {
  return text.split('\n').map(line => {
    const t = line.trim();
    if (t.startsWith('###')) return `<h4 class="text-sm font-bold text-brand mt-3 mb-1">${t.replace('###','').trim()}</h4>`;
    if (t.startsWith('##')) return `<h3 class="text-sm font-bold text-white mt-4 mb-1.5 border-b border-slate-800 pb-1">${t.replace('##','').trim()}</h3>`;
    if (t.startsWith('#')) return `<h2 class="text-base font-bold text-white mt-5 mb-2">${t.replace('#','').trim()}</h2>`;
    if (t.startsWith('-') || t.startsWith('*')) return `<li class="ml-4 list-disc mb-1 text-slate-400 text-xs">${t.replace(/^[-*]\s*/,'').replace(/\*\*(.*?)\*\*/g,'<strong class="text-white">$1</strong>')}</li>`;
    return t ? `<p class="mb-1.5 text-slate-300 text-xs leading-relaxed">${t.replace(/\*\*(.*?)\*\*/g,'<strong class="text-white font-bold">$1</strong>')}</p>` : '';
  }).join('');
}

async function callGemini(prompt, systemInstruction = '') {
  if (!geminiApiKey) return mockResponse(prompt);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
  const body = { contents: [{ parts: [{ text: prompt }] }] };
  if (systemInstruction) body.system_instruction = { parts: [{ text: systemInstruction }] };
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`Gemini error ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
  } catch (err) {
    return mockResponse(prompt);
  }
}

function mockResponse(prompt) {
  return Promise.resolve(`**Mock Response**\n\nTo enable real AI responses, click the ⚙ settings icon above and paste your free Gemini API key from [aistudio.google.com](https://aistudio.google.com/app/apikey).\n\nYour question: *${prompt.slice(0, 60)}...*`);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
