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

function loadJsonStorage(key, fallback) {
  const raw = safeStorage.getItem(key);
  if (!raw || raw === 'undefined' || raw === 'null') return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function saveJsonStorage(key, value) {
  try {
    safeStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage write blocked:', e);
  }
}

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
  description: 'AttendEase is a highly efficient, automated attendance attendance tracking and check-in mobile application designed for schools, universities, and corporate events. Featuring digital registers, detailed reports, and real-time synchronization, managing check-ins has never been easier or more reliable.',
  appInfo: 'Version: 1.0.0\nSize: 16 MB\nPackage: com.hankstudio.attendease\nFormat: Android APK\nDeveloper: HankStudio',
  size: '16 MB',
  iconDataUrl: 'downloads/attendease_logo.png',
  bannerDataUrl: 'downloads/attendease_banner.png',
  downloadLink: 'downloads/AttendEase.apk',
  screenshots: [
    'downloads/attendease_new_ss1.jpg',
    'downloads/attendease_new_ss2.jpg',
    'downloads/attendease_new_ss3.jpg',
    'downloads/attendease_new_ss4.jpg',
    'downloads/attendease_new_ss5.jpg'
  ],
  authorUid: 'hankstudio-developer',
  authorName: 'HankStudio',
  uploadedAt: '2026-05-30T00:00:00.000Z',
  isSponsored: true,
  isVerified: true,
  isSafeDownload: true,
  isUpdatedRecently: true,
  downloadCount: 0,
  rating: 0,
  reviewCount: 0,
  version: '1.0.0',
  changelog: [
    {
      version: '1.0.0',
      date: '2026-05-30',
      notes: 'Initial AttendEase APK release with attendance tracking and check-in workflows.'
    }
  ]
};

// ── APP DATA (Cloud Firebase state) ──
let APPS_DATA = [ATTENDEASE_APP];

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
let pendingDeveloperAccess = false;
let developerAccessResolved = false;
let currentGuideText = '';
let geminiApiKey = safeStorage.getItem('gemini_api_key') || '';
let uploadIconData = null;
let activeReviewsRequestId = 0;
let installButtonBusy = false;
let installButtonResetTimer = null;
let installButtonRestoreTimer = null;
let REVIEW_FEEDBACK_CACHE = loadJsonStorage('hankstudio_review_feedback', {});
let FAVORITES_CACHE = loadJsonStorage('hankstudio_favorites', []);
let REVIEW_REPORT_CACHE = loadJsonStorage('hankstudio_review_reports', {});
let NOTIFICATIONS_CACHE = loadJsonStorage('hankstudio_notifications', [
  { id: 'verified-downloads', title: 'Safe downloads enabled', message: 'Downloads now show a trust check before opening.', read: false, time: 'Today' },
  { id: 'saved-apps', title: 'Favorites added', message: 'Save apps and find them later from your profile.', read: false, time: 'Today' },
  { id: 'review-tools', title: 'Review moderation ready', message: 'Reviews can now be reported for moderation.', read: false, time: 'Today' }
]);
let searchFilterState = { category: 'all', sort: 'newest', verifiedOnly: false };
let isAppDataLoading = true;
let isOfflineMode = false;
let pendingTrustedDownload = null;
let modalTouchStartY = 0;
let modalTouchStartScrollY = 0;

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
  const isDark = !document.documentElement.classList.contains('dark');
  if (isDark) {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    safeStorage.setItem('hankstudio_dark_mode', 'true');
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    safeStorage.setItem('hankstudio_dark_mode', 'false');
  }
}

window.toggleDarkModeAndReRender = function() {
  toggleDarkMode();
  renderContent();
};


// ── INIT FUNCTION ──
async function refreshDeveloperAccess(user) {
  if (!user) {
    isDeveloperAuthenticated = false;
    developerAccessResolved = true;
    return false;
  }

  let allowed = false;
  try {
    const firebaseUser = auth && auth.currentUser;
    if (firebaseUser && typeof firebaseUser.getIdTokenResult === 'function') {
      const token = await firebaseUser.getIdTokenResult(true);
      const claims = token.claims || {};
      const role = String(claims.role || '').toLowerCase();
      allowed = claims.developer === true || claims.admin === true || claims.owner === true || ['developer', 'admin', 'owner'].includes(role);
    }
  } catch (e) {
    console.warn('Developer custom-claim lookup failed:', e);
  }

  if (db) {
    try {
      if (!allowed) {
        const accessDoc = await db.collection('developerAccess').doc(user.uid).get();
        if (accessDoc.exists) {
          const data = accessDoc.data() || {};
          const role = String(data.role || '').toLowerCase();
          allowed = data.enabled === true && ['developer', 'admin', 'owner'].includes(role);
        }
      }
    } catch (e) {
      console.warn('Developer access lookup failed:', e);
    }
  }

  isDeveloperAuthenticated = allowed;
  developerAccessResolved = true;
  return allowed;
}

function showToast(title, message, tone = 'info') {
  if (!document || !document.body) return;
  let stack = document.getElementById('toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'toast-stack';
    document.body.appendChild(stack);
  }

  const toast = document.createElement('div');
  toast.className = `app-toast app-toast-${tone}`;
  toast.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="mt-0.5 h-2.5 w-2.5 rounded-full ${tone === 'danger' ? 'bg-red-500' : tone === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}"></div>
      <div class="min-w-0">
        <p class="text-xs font-bold text-slate-900 dark:text-white">${escapeHtml(title)}</p>
        <p class="text-[11px] leading-snug text-slate-500 dark:text-slate-300 mt-0.5">${escapeHtml(message)}</p>
      </div>
      <button class="ml-auto text-slate-400 hover:text-slate-700 dark:hover:text-white" aria-label="Dismiss toast">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>`;

  const close = () => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 180);
  };

  toast.querySelector('button').addEventListener('click', close);
  stack.appendChild(toast);
  if (window.lucide) lucide.createIcons();
  setTimeout(close, 2600);
}

function initializePlatform() {
  // Dark mode init (default true)
  if (safeStorage.getItem('hankstudio_dark_mode') !== 'false') {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }

  ['desktop-logo-container','mobile-logo-container','header-logo-container'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = LOGO_SVG;
  });
  refreshDeveloperAccess(currentUser);
  renderNavs();
  renderContent();
  renderBottomNav();
  updateHeaderAuth();
  updateNotificationBadge();
  

  // Firebase Auth Listener (Defensively Guarded)
  if (auth) {
    auth.onAuthStateChanged(async (user) => {
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
      await refreshDeveloperAccess(currentUser);
      updateHeaderAuth();
      if (currentUser && pendingDeveloperAccess) {
        pendingDeveloperAccess = false;
        if (isDeveloperAuthenticated) {
          closeDeveloperModal();
          setActiveTab('developer');
        } else {
          closeDeveloperModal();
          showToast('Developer access required', 'This account is signed in, but it is not on the developer allowlist.', 'danger');
        }
      }
      if (activeTab === 'profile') renderContent(); 
    });
  }

  // Firebase Firestore Listener (Defensively Guarded)
  if (db) {
    db.collection("apps").orderBy("uploadedAt", "desc").onSnapshot((snapshot) => {
      isAppDataLoading = false;
      isOfflineMode = false;
      APPS_DATA = [];
      snapshot.forEach((doc) => {
        let data = doc.data();
        if (doc.id === 'attendease-app') {
          // Merge cloud data (like ratings) into the static AttendEase app object
          data = Object.assign({}, ATTENDEASE_APP, data);
        }
        APPS_DATA.push({ id: doc.id, ...data });
      });
      
      // Ensure AttendEase is always seeded in APPS_DATA if it wasn't in the cloud at all
      if (!APPS_DATA.some(a => a.id === 'attendease-app')) {
        APPS_DATA.unshift(ATTENDEASE_APP);
      }
      renderContent();
    }, (error) => {
      console.warn("Firestore snapshot error, loading fallback:", error);
      isAppDataLoading = false;
      isOfflineMode = true;
      APPS_DATA = [ATTENDEASE_APP];
      renderContent();
    });
  } else {
    // Offline local seeding
    isAppDataLoading = false;
    isOfflineMode = true;
    APPS_DATA = [ATTENDEASE_APP];
    renderContent();
  }

  attachModalSwipeHandlers();

  // Hide page loader after the branded opening animation has time to breathe.
  setTimeout(() => {
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.style.display = 'none', 400);
    }
  }, 900);
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
  if (!auth) {
    showToast('Sign-in unavailable', 'Firebase auth is not available right now.', 'danger');
    return;
  }
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
  if (!auth) {
    showToast('Sign-in unavailable', 'Firebase auth is not available right now.', 'danger');
    return;
  }
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
  if (!auth) {
    showToast('Sign-up unavailable', 'Firebase auth is not available right now.', 'danger');
    return;
  }
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
    isDeveloperAuthenticated = false;
    pendingDeveloperAccess = false;
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
    const avatarUrl = safeImageUrl(currentUser.photoURL);
    const avatarContent = avatarUrl
      ? `<img src="${escapeHtml(avatarUrl)}" class="w-full h-full object-cover rounded-full">`
      : `<span class="text-xs font-bold text-white uppercase">${escapeHtml(displayName.charAt(0))}</span>`;
    
    area.innerHTML = `
      <button onclick="setActiveTab('profile')" class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm hover:scale-105 active:scale-[0.93] transition-all duration-200 overflow-hidden animate-fade-in" title="View Profile">
        ${avatarContent}
      </button>`;
  } else {
    area.innerHTML = `
      <button onclick="openAuthModal('login')" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm hover:scale-105 active:scale-[0.93] transition-all duration-200 animate-fade-in" title="Sign In">
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
  if (currentUser && developerAccessResolved) {
    showToast('Developer access required', 'This account is signed in, but it is not on the developer allowlist.', 'danger');
    return;
  }
  const overlay = document.getElementById('dev-auth-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
  }
};

window.closeDeveloperModal = function(preserveAccess = false) {
  const overlay = document.getElementById('dev-auth-overlay');
  if (overlay) overlay.style.display = 'none';
  if (!preserveAccess) pendingDeveloperAccess = false;
};

window.checkDevPassword = function() {
  pendingDeveloperAccess = true;
  closeDeveloperModal(true);
  openAuthModal('login');
};

// ── NAVIGATION & TAB STATE ──
window.toggleMobileMenu = function(open) {
  isMobileMenuOpen = open;
  const drawer = document.getElementById('mobile-drawer');
  if (drawer) drawer.classList.toggle('hidden', !open);
};

window.setActiveTab = function(tabId) {
  if (tabId === 'developer') {
    if (!currentUser) {
      pendingDeveloperAccess = true;
      openDeveloperModal();
      return;
    }
    if (!developerAccessResolved) {
      showToast('Checking access', 'Please wait while we verify developer permissions.', 'info');
      return;
    }
    if (!isDeveloperAuthenticated) {
      showToast('Developer access required', 'This signed-in account is not on the developer allowlist.', 'danger');
      return;
    }
    activeTab = tabId;
    activeSubTab = 'for-you';
    renderNavs();
    renderContent();
    renderBottomNav();
    const viewport = document.getElementById('main-content-viewport');
    if (viewport) viewport.scrollTo({ top: 0, behavior: 'auto' });
    return;
  }
  activeTab = tabId;
  activeSubTab = 'for-you'; // Reset sub-tab selection on main tab shifts
  renderNavs();
  renderContent();
  renderBottomNav();
  const viewport = document.getElementById('main-content-viewport');
  if (viewport) viewport.scrollTo({ top: 0, behavior: 'auto' });
};

window.setActiveSubTab = function(subTabId) {
  activeSubTab = subTabId;
  renderContent();
  const viewport = document.getElementById('main-content-viewport');
  if (viewport) viewport.scrollTo({ top: 0, behavior: 'auto' });
};

window.searchCategory = function(catId) {
  searchFilterState.category = CATEGORIES.some(c => c.id === catId) ? catId : 'all';
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
      return `<button onclick="setActiveTab('${item.id}')"
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
    el.innerHTML = `<button onclick="openDeveloperModal()"
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
      <div class="bottom-nav-item flex flex-col items-center gap-0.5 cursor-pointer flex-1 py-1 ${active ? 'is-active' : ''}" onclick="setActiveTab('${item.id}')">
        <div class="bottom-nav-pill px-5 py-1 rounded-full transition-all duration-300 ${active ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400' : 'bg-transparent text-slate-500 dark:text-slate-400'}">
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
  requestAnimationFrame(() => {
    document.querySelectorAll('.app-card-reveal').forEach((card, index) => {
      card.style.animationDelay = `${Math.min(index * 45, 360)}ms`;
      card.classList.add('card-visible');
    });
  });
  if (window.lucide) lucide.createIcons();
}

// ── APP CARD HTML ──
function appCardHTML(app, compact = false) {
  const iconSrc = safeImageUrl(app.iconDataUrl, { allowData: true });
  const iconBg = safeCssColor(app.iconBg, '#05cd74');
  const iconEmoji = escapeHtml(app.emoji || '📦');
  const iconHTML = iconSrc
    ? `<img src="${escapeHtml(iconSrc)}" style="width:100%;height:100%;object-fit:cover;border-radius:${compact?'12px':'16px'};">`
    : `<div style="width:100%;height:100%;background:${iconBg};display:flex;align-items:center;justify-content:center;font-size:${compact?'1.4rem':'1.8rem'};border-radius:${compact?'12px':'16px'};">${iconEmoji}</div>`;
  return iconHTML;
}

// ── EMPTY STATE ──
function emptyState(icon, title, msg, btnLabel, btnTab) {
  return `<div class="bg-slate-50 dark:bg-[#1E1E1E] border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-12 text-center">
    <i data-lucide="${icon}" class="w-14 h-14 text-slate-300 dark:text-slate-500 mx-auto mb-4"></i>
    <h3 class="text-base font-bold text-slate-800 dark:text-white">${title}</h3>
    <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">${msg}</p>
    ${btnLabel ? `<button onclick="openDeveloperModal()" class="mt-6 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm">${btnLabel}</button>` : ''}
  </div>`;
}

function renderSkeletonCards(count = 4) {
  return Array.from({ length: count }).map(() => `
    <div class="skeleton-card bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex items-center gap-4">
      <div class="skeleton-block w-12 h-12 rounded-xl"></div>
      <div class="flex-1 space-y-2">
        <div class="skeleton-block h-3 w-2/3 rounded-full"></div>
        <div class="skeleton-block h-2.5 w-1/3 rounded-full"></div>
      </div>
      <div class="skeleton-block h-7 w-14 rounded-full"></div>
    </div>
  `).join('');
}

function renderOfflineNotice() {
  if (!isOfflineMode) return '';
  return `<div class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/25 text-amber-800 dark:text-amber-200 rounded-2xl p-3.5 flex gap-3 items-start">
    <i data-lucide="wifi-off" class="w-4 h-4 mt-0.5 shrink-0"></i>
    <div>
      <p class="text-xs font-bold">Offline fallback mode</p>
      <p class="text-[10px] leading-relaxed mt-0.5">Firebase is not reachable right now, so HankStudio is showing local seed content.</p>
    </div>
  </div>`;
}

function parseDateValue(value) {
  if (!value) return null;
  if (value && typeof value.toDate === 'function') return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value) {
  const date = parseDateValue(value);
  return date ? date.toLocaleDateString('en-GB') : 'Unknown';
}

function getAppRating(app) {
  const value = Number(app.rating || app.averageRating || 0);
  return Number.isFinite(value) ? value : 0;
}

function getAppReviewCount(app) {
  const value = Number(app.reviewCount || app.ratingsCount || 0);
  return Number.isFinite(value) ? value : 0;
}

function getAppDownloadCount(app) {
  const localDownloads = loadJsonStorage('hankstudio_download_counts', {});
  const value = Number(app.downloadCount || localDownloads[app.id] || 0);
  return Number.isFinite(value) ? value : 0;
}

function isRecentlyUpdated(app) {
  if (app.isUpdatedRecently === true) return true;
  const date = parseDateValue(app.updatedAt || app.uploadedAt);
  if (!date) return false;
  const daysOld = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  return daysOld <= 45;
}

function isAppVerified(app) {
  return app.isVerified === true || app.authorUid === 'hankstudio-developer' || app.title === 'AttendEase';
}

function renderVerificationBadges(app, compact = false) {
  const badges = [];
  if (isAppVerified(app)) badges.push({ icon: 'badge-check', text: compact ? 'Verified' : 'Verified Developer', cls: 'bg-emerald-50 dark:bg-emerald-950/35 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-500/25' });
  if (safeDownloadUrl(app.downloadLink) && (app.isSafeDownload !== false)) badges.push({ icon: 'shield-check', text: compact ? 'Safe' : 'Safe Download', cls: 'bg-blue-50 dark:bg-blue-950/35 text-blue-700 dark:text-blue-300 border-blue-200/70 dark:border-blue-500/25' });
  if (isRecentlyUpdated(app)) badges.push({ icon: 'clock', text: compact ? 'Recent' : 'Updated Recently', cls: 'bg-violet-50 dark:bg-violet-950/35 text-violet-700 dark:text-violet-300 border-violet-200/70 dark:border-violet-500/25' });
  return badges.map(badge => `
    <span class="verification-badge ${badge.cls}">
      <i data-lucide="${badge.icon}" class="${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'}"></i>${badge.text}
    </span>
  `).join('');
}

function renderAppListItem(app, index = null) {
  const rating = getAppRating(app).toFixed(1);
  const countPrefix = index !== null ? `<span class="text-xl font-extrabold text-slate-300 dark:text-slate-700 w-8 text-center">${index + 1}</span>` : '';
  return `
    <div onclick="openAppModal('${app.id}')" class="app-card-reveal bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4">
      ${countPrefix}
      <div class="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-200 dark:bg-slate-800">${appCardHTML(app, true)}</div>
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-slate-900 dark:text-white text-xs truncate">${escapeHtml(app.title)}</h3>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">${escapeHtml(app.category)} &middot; ${rating} rating &middot; ${escapeHtml(app.size || 'Unknown')}</p>
        <div class="flex flex-wrap gap-1 mt-1">${renderVerificationBadges(app, true)}</div>
      </div>
      <button class="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-bold">View</button>
    </div>`;
}

function isFavorite(appId) {
  return Array.isArray(FAVORITES_CACHE) && FAVORITES_CACHE.includes(appId);
}

function persistFavorites() {
  saveJsonStorage('hankstudio_favorites', FAVORITES_CACHE);
}

window.toggleFavorite = function(appId, event) {
  if (event) event.stopPropagation();
  if (!appId) return;
  if (!Array.isArray(FAVORITES_CACHE)) FAVORITES_CACHE = [];
  if (isFavorite(appId)) {
    FAVORITES_CACHE = FAVORITES_CACHE.filter(id => id !== appId);
    showToast('Removed', 'App removed from saved apps.', 'info');
  } else {
    FAVORITES_CACHE.push(appId);
    showToast('Saved', 'App added to your profile favorites.', 'success');
  }
  persistFavorites();
  updateModalFavoriteButton(appId);
  if (activeTab === 'profile') renderContent();
};

function getSourceDomain(url) {
  const safe = safeDownloadUrl(url);
  if (!safe) return 'Blocked';
  if (/^(\/|\.\/|\.\.\/|[a-zA-Z]:[\\/]|downloads[\\/])/i.test(safe)) return 'HankStudio local asset';
  try {
    return new URL(safe).hostname.replace(/^www\./, '');
  } catch (e) {
    return 'Trusted source';
  }
}

function getFileNameFromUrl(url) {
  const safe = safeDownloadUrl(url);
  if (!safe) return 'download';
  try {
    const parsed = safe.startsWith('http') ? new URL(safe).pathname : safe;
    return decodeURIComponent(parsed.split(/[\\/]/).pop() || 'download');
  } catch (e) {
    return 'download';
  }
}

function updateModalFavoriteButton(appId) {
  const btn = document.getElementById('modal-favorite-btn');
  if (!btn) return;
  const saved = isFavorite(appId);
  btn.classList.toggle('text-rose-500', saved);
  btn.classList.toggle('dark:text-rose-400', saved);
  btn.innerHTML = `<i data-lucide="heart" class="w-5 h-5 ${saved ? 'fill-current' : ''}"></i>`;
  btn.title = saved ? 'Remove from saved apps' : 'Save app';
  if (window.lucide) lucide.createIcons();
}

function getUnreadNotificationCount() {
  return NOTIFICATIONS_CACHE.filter(n => !n.read).length;
}

function updateNotificationBadge() {
  const badge = document.getElementById('notification-count-badge');
  if (!badge) return;
  const unread = getUnreadNotificationCount();
  badge.textContent = unread;
  badge.classList.toggle('hidden', unread === 0);
}

window.openNotificationCenter = function() {
  closeNotificationCenter();
  const panel = document.createElement('div');
  panel.id = 'notification-center';
  panel.className = 'notification-center';
  const unread = getUnreadNotificationCount();
  panel.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <div>
        <p class="text-sm font-extrabold text-slate-900 dark:text-white">Notifications</p>
        <p class="text-[10px] text-slate-500 dark:text-slate-400">${unread} unread updates</p>
      </div>
      <button onclick="closeNotificationCenter()" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"><i data-lucide="x" class="w-4 h-4"></i></button>
    </div>
    <div class="space-y-2">
      ${NOTIFICATIONS_CACHE.map(item => `
        <div class="notification-item ${item.read ? 'opacity-70' : ''}">
          <div class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
            <i data-lucide="${item.read ? 'bell' : 'bell-dot'}" class="w-4 h-4"></i>
          </div>
          <div class="min-w-0">
            <p class="text-xs font-bold text-slate-900 dark:text-white">${escapeHtml(item.title)}</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">${escapeHtml(item.message)}</p>
            <p class="text-[9px] text-slate-400 dark:text-slate-500 mt-1">${escapeHtml(item.time || 'Recent')}</p>
          </div>
        </div>
      `).join('')}
    </div>
    <button onclick="markNotificationsRead()" class="mt-4 w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Mark all as read</button>
  `;
  document.body.appendChild(panel);
  if (window.lucide) lucide.createIcons();
};

window.closeNotificationCenter = function() {
  const panel = document.getElementById('notification-center');
  if (panel) panel.remove();
};

window.markNotificationsRead = function() {
  NOTIFICATIONS_CACHE = NOTIFICATIONS_CACHE.map(n => ({ ...n, read: true }));
  saveJsonStorage('hankstudio_notifications', NOTIFICATIONS_CACHE);
  updateNotificationBadge();
  openNotificationCenter();
};

function trackDownload(appId) {
  const counts = loadJsonStorage('hankstudio_download_counts', {});
  counts[appId] = (counts[appId] || 0) + 1;
  saveJsonStorage('hankstudio_download_counts', counts);
}

function attachModalSwipeHandlers() {
  // Swipe-to-close has been completely disabled per user request
  // to prevent accidental modal closures while scrolling.
}

// ── PROFILE PAGE ──
function renderProfileHTML() {
  const isDarkModeActive = document.documentElement.classList.contains('dark');
  
  // Dynamic settings card for dark mode toggle button
  const toggleCardHtml = `
    <div class="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
          <i data-lucide="${isDarkModeActive ? 'sun' : 'moon'}" class="w-5 h-5"></i>
        </div>
        <div>
          <p class="text-xs font-bold text-slate-900 dark:text-white">Dark Theme Mode</p>
          <p class="text-[10px] text-slate-500 dark:text-slate-400">Toggle dark or light color styles</p>
        </div>
      </div>
      <button onclick="toggleDarkModeAndReRender()" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-extrabold rounded-full transition-all border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer">
        ${isDarkModeActive ? 'Switch to Light' : 'Switch to Dark'}
      </button>
    </div>
  `;

  if (!currentUser) {
    return `<div class="p-6 lg:p-10 max-w-4xl mx-auto space-y-6">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">My Profile</h1>
      <div class="bg-slate-50 dark:bg-[#1E1E1E] border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-12 text-center shadow-sm">
        <i data-lucide="user-x" class="w-14 h-14 text-slate-400 dark:text-slate-700 mx-auto mb-4 animate-pulse"></i>
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
  const savedApps = APPS_DATA.filter(a => isFavorite(a.id));

  const appsHtml = myApps.length ? `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${myApps.map(app => `
    <div class="app-card-reveal bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-[1.5rem] p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all" onclick="openAppModal('${app.id}')">
      <div class="w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden shadow-sm">${appCardHTML(app)}</div>
      <div class="flex-1 min-w-0">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate">${escapeHtml(app.title)}</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">${escapeHtml(app.category)}</p>
        <div class="flex flex-wrap gap-1 mt-1">${renderVerificationBadges(app, true)}</div>
      </div>
    </div>
  `).join('')}</div>` : `<p class="text-sm text-slate-400 dark:text-slate-500">You haven't uploaded any apps yet.</p>`;

  const savedHtml = savedApps.length ? `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${savedApps.map(app => `
    <div class="app-card-reveal bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-[1.5rem] p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all" onclick="openAppModal('${app.id}')">
      <div class="w-14 h-14 rounded-2xl flex-shrink-0 overflow-hidden shadow-sm">${appCardHTML(app, true)}</div>
      <div class="flex-1 min-w-0">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate">${escapeHtml(app.title)}</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">${escapeHtml(app.category)}</p>
      </div>
      <button type="button" onclick="toggleFavorite('${app.id}', event)" class="p-2 rounded-full text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30">
        <i data-lucide="heart" class="w-4 h-4 fill-current"></i>
      </button>
    </div>
  `).join('')}</div>` : `<p class="text-sm text-slate-400 dark:text-slate-500">Save apps with the heart button to build your personal shelf.</p>`;

  const displayName = currentUser.name || (currentUser.email ? currentUser.email.split('@')[0] : 'User');
  const initialLetter = displayName.charAt(0).toUpperCase();
  const profilePhotoUrl = safeImageUrl(currentUser.photoURL);

  return `<div class="p-6 lg:p-10 max-w-5xl mx-auto space-y-6">
    <!-- Profile Header -->
    <div class="flex items-center gap-6 p-6 bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-[2rem]">
      <div class="w-24 h-24 bg-brand text-white text-4xl font-extrabold flex items-center justify-center rounded-full shadow-lg overflow-hidden border border-brand/20">
        ${profilePhotoUrl
          ? `<img src="${escapeHtml(profilePhotoUrl)}" class="w-full h-full object-cover">`
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
    <div class="pt-4">
      <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <i data-lucide="heart" class="w-5 h-5 text-rose-500"></i> Saved Apps
      </h2>
      ${savedHtml}
    </div>
  </div>`;
}

// ── DEVELOPER PORTAL PAGE ──
function renderDeveloperHTML() {
  if (!isDeveloperAuthenticated) {
    return `<div class="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Developer Portal</h1>
      <div class="bg-slate-50 dark:bg-[#1E1E1E] border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-12 text-center">
        <i data-lucide="lock" class="w-14 h-14 text-slate-400 dark:text-slate-700 mx-auto mb-4"></i>
        <h3 class="text-base font-bold text-slate-800 dark:text-white">Developer Access Required</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">Sign in with your account to access this portal and manage uploads.</p>
        <button onclick="openDeveloperModal()" class="mt-6 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm">Unlock Portal</button>
      </div>
    </div>`;
  }

  // Filter apps created by this developer
  const myApps = APPS_DATA.filter(a => a.authorUid === (currentUser ? currentUser.uid : 'anonymous'));
  const devTotalDownloads = myApps.reduce((sum, app) => sum + getAppDownloadCount(app), 0);
  const devTotalReviews = myApps.reduce((sum, app) => sum + getAppReviewCount(app), 0);
  const ratedApps = myApps.filter(app => getAppRating(app) > 0);
  const devAverageRating = ratedApps.length ? (ratedApps.reduce((sum, app) => sum + getAppRating(app), 0) / ratedApps.length).toFixed(1) : '0.0';
  const devLastUpdate = myApps.length ? formatDate(myApps.map(app => parseDateValue(app.updatedAt || app.uploadedAt)).filter(Boolean).sort((a, b) => b - a)[0]) : 'None';

  const appsHtml = myApps.length ? `
    <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
      ${myApps.map(app => `
        <div class="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
              ${appCardHTML(app, true)}
            </div>
            <div class="min-w-0">
              <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">${escapeHtml(app.title)}</h4>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">${escapeHtml(app.category)} &middot; ${getAppDownloadCount(app)} downloads</p>
            </div>
          </div>
          <button onclick="deleteApp('${app.id}')" class="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded-xl transition-colors border border-red-100/50 dark:border-red-500/20" title="Delete App">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `).join('')}
    </div>` : `
    <div class="bg-slate-50 dark:bg-[#1E1E1E] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
      <i data-lucide="layout-grid" class="w-10 h-10 text-slate-400 dark:text-slate-700 mx-auto mb-2"></i>
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
            <i data-lucide="upload-cloud" class="w-4 h-4 text-brand"></i> Upload New Application
          </h2>

          <div id="upload-error" class="hidden bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-3.5 rounded-2xl text-xs font-medium leading-relaxed"></div>
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
              <p class="text-[10px] text-slate-500 dark:text-slate-400 mb-2">Select a premium, high-res PNG/JPG icon.</p>
              <label class="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white px-3.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all shadow-sm">
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

          <button id="upload-submit-btn" onclick="handleAppUpload()"
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
                <p class="text-[10px] text-slate-500 dark:text-slate-400">HankStudio Registered Developer</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3 pt-2">
              <div class="bg-slate-50 dark:bg-[#121212] border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-3.5 text-center">
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Published</p>
                <p class="text-lg font-black text-slate-900 dark:text-white mt-0.5">${myApps.length}</p>
              </div>
              <div class="bg-slate-50 dark:bg-[#121212] border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-3.5 text-center">
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Downloads</p>
                <p class="text-lg font-black text-slate-900 dark:text-white mt-0.5">${devTotalDownloads}</p>
              </div>
              <div class="bg-slate-50 dark:bg-[#121212] border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-3.5 text-center">
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Rating</p>
                <p class="text-lg font-black text-slate-900 dark:text-white mt-0.5">${devAverageRating}</p>
              </div>
              <div class="bg-slate-50 dark:bg-[#121212] border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-3.5 text-center">
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Reviews</p>
                <p class="text-lg font-black text-slate-900 dark:text-white mt-0.5">${devTotalReviews}</p>
              </div>
            </div>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 pt-1">Last update: ${escapeHtml(devLastUpdate)}</p>
          </div>

          <!-- Apps Management Card -->
          <div class="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-4">
            <h2 class="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <i data-lucide="folder-git" class="w-4 h-4 text-brand"></i> Manage Applications
            </h2>
            ${appsHtml}
          </div>
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
      <div onclick="openAppModal('${app.id}')" class="flex items-center gap-4 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 p-4 rounded-3xl cursor-pointer hover:shadow-md transition-all">
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
      <div onclick="openAppModal('${app.id}')" class="flex items-center gap-4 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 p-4 rounded-3xl cursor-pointer hover:shadow-md transition-all">
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
        <div onclick="searchCategory('${cat.id}')" class="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between h-[120px] group">
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
    const bannerSrc = safeImageUrl(featuredApp.bannerDataUrl || featuredApp.iconDataUrl, { allowData: true });
    bannerHTML = `
      <div class="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-sm w-full group transition-all duration-300 hover:shadow-md">
        <!-- Card Banner Cover Image -->
        <div class="relative w-full h-[160px] sm:h-[200px] overflow-hidden cursor-pointer" onclick="openAppModal('${featuredApp.id}')">
          <span class="absolute top-3 left-3 bg-white/90 dark:bg-black/80 text-slate-900 dark:text-white text-[9px] font-bold px-2.5 py-1 rounded-md z-10 shadow-sm">Coming soon</span>
          ${bannerSrc
            ? `<img src="${escapeHtml(bannerSrc)}" class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700">`
            : `<div class="w-full h-full bg-slate-800 flex items-center justify-center"><i data-lucide="image" class="w-10 h-10 text-slate-400"></i></div>`
          }
        </div>
        <!-- Card App Info Row (Google Play Store Style Layout) -->
        <div class="p-4 flex items-center justify-between gap-3 bg-white dark:bg-[#1E1E1E] border-t border-slate-100 dark:border-slate-800/50">
          <div class="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1" onclick="openAppModal('${featuredApp.id}')">
            <div class="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
              ${appCardHTML(featuredApp, true)}
            </div>
            <div class="min-w-0">
              <h3 class="text-xs sm:text-sm font-bold text-slate-950 dark:text-white truncate">${escapeHtml(featuredApp.title)}</h3>
              <p class="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">${escapeHtml(featuredApp.authorName)}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">12+</span>
                <span class="text-[9px] text-slate-500 dark:text-slate-500">Rated for 12+</span>
              </div>
            </div>
          </div>
          <div class="flex flex-col items-center flex-shrink-0">
            <button onclick="openAppModal('${featuredApp.id}')" class="bg-[#c2e7ff] dark:bg-[#B8CCF6] hover:bg-[#b2e0ff] dark:hover:bg-[#a5bceb] text-[#001d35] dark:text-[#243B63] px-6 py-2.5 rounded-full font-extrabold text-[12px] shadow-sm transition-all flex items-center justify-center gap-1 hover:scale-105 active:scale-95 duration-200">
              Install
            </button>
            <span class="text-[8px] text-slate-500 dark:text-slate-500 mt-1 block">In-app purchases</span>
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
            <span class="flex items-center gap-0.5 text-slate-700 dark:text-slate-300">${app.rating !== undefined ? app.rating.toFixed(1) : (isAttendEase ? '0.0' : '4.4')} <i data-lucide="star" class="w-2.5 h-2.5 fill-slate-700 dark:fill-slate-300"></i></span>
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
  const html = isAppDataLoading ? renderSkeletonCards(5) : apps.length ? apps.map(app => renderAppListItem(app)).join('') :
    emptyState('layout-grid','Coming Soon','Check back later for new app releases!');

  return `<div class="max-w-2xl mx-auto p-4 space-y-6">
    <div><h1 class="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">All Applications</h1>
    <p class="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs mt-1">Browse and download community-uploaded software.</p></div>
    ${renderOfflineNotice()}
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
  const sorted = [...APPS_DATA].sort((a, b) => getAppRating(b) - getAppRating(a) || getAppDownloadCount(b) - getAppDownloadCount(a));
  const html = isAppDataLoading ? renderSkeletonCards(5) : sorted.length ? sorted.map((app, i) => renderAppListItem(app, i)).join('') :
    emptyState('bar-chart-2','No apps yet','Apps will appear here once uploaded.');

  return `<div class="max-w-2xl mx-auto p-4 space-y-6">
    <div><h1 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Top Charts</h1></div>
    ${renderOfflineNotice()}
    <div class="grid grid-cols-1 gap-4">${html}</div>
  </div>`;
}

function renderNewReleasesHTML() {
  const apps = [...APPS_DATA].sort((a, b) => (parseDateValue(b.uploadedAt || b.updatedAt)?.getTime() || 0) - (parseDateValue(a.uploadedAt || a.updatedAt)?.getTime() || 0));
  const html = isAppDataLoading ? renderSkeletonCards(5) : apps.length ? apps.map(app => renderAppListItem(app)).join('') :
    emptyState('clock','No releases yet','Check back after developers upload apps.');

  return `<div class="max-w-2xl mx-auto p-4 space-y-6">
    <div><h1 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">New Releases</h1></div>
    ${renderOfflineNotice()}
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
          class="w-full bg-slate-100 dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm rounded-full pl-9 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
      </div>
      <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        <button onclick="updateSearchFilter('category', 'all')" class="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${searchFilterState.category === 'all' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-[#1E1E1E] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#252525]'}">All</button>
        ${CATEGORIES.map(c => `
          <button onclick="updateSearchFilter('category', '${escapeHtml(c.id)}')" class="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${searchFilterState.category === c.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-[#1E1E1E] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#252525]'}">${escapeHtml(c.id)}</button>
        `).join('')}
      </div>
      <div class="grid grid-cols-2 gap-2 mt-2">
        <select id="search-sort-filter" onchange="updateSearchFilter('sort', this.value)" class="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-blue-500">
          <option value="newest" ${searchFilterState.sort === 'newest' ? 'selected' : ''}>Newest first</option>
          <option value="rating" ${searchFilterState.sort === 'rating' ? 'selected' : ''}>Top rating</option>
          <option value="size" ${searchFilterState.sort === 'size' ? 'selected' : ''}>Smallest size</option>
          <option value="title" ${searchFilterState.sort === 'title' ? 'selected' : ''}>A to Z</option>
        </select>
        <label class="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-3 py-2.5 flex items-center gap-2 cursor-pointer">
          <input id="search-verified-filter" type="checkbox" onchange="updateSearchFilter('verifiedOnly', this.checked)" ${searchFilterState.verifiedOnly ? 'checked' : ''} class="accent-blue-600">
          Verified only
        </label>
      </div>
      ${renderOfflineNotice()}

      <!-- Trending Searches -->
      <div id="search-suggestions-container" class="space-y-4">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Trending Searches</h2>
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

window.updateSearchFilter = function(key, value) {
  searchFilterState[key] = value;
  const input = document.getElementById('global-search-input');
  handleSearchOnPage(input ? input.value : '');
};

let searchDebounceTimer;
window.handleSearchOnPage = function(query) {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    const suggestions = document.getElementById('search-suggestions-container');
    const resultsArea = document.getElementById('search-results-area');
    const q = query.toLowerCase().trim();
    const hasActiveFilters = searchFilterState.category !== 'all' || searchFilterState.verifiedOnly || searchFilterState.sort !== 'newest';

  if (!q && !hasActiveFilters) {
    if (suggestions) suggestions.classList.remove('hidden');
    if (resultsArea) resultsArea.classList.add('hidden');
    return;
  }

  if (suggestions) suggestions.classList.add('hidden');
  if (resultsArea) {
    resultsArea.classList.remove('hidden');

    let filtered = APPS_DATA.filter(a => {
      const matchesText = !q ||
        String(a.title || '').toLowerCase().includes(q) ||
        String(a.description || '').toLowerCase().includes(q) ||
        String(a.category || '').toLowerCase().includes(q);
      const matchesCategory = searchFilterState.category === 'all' || a.category === searchFilterState.category;
      const matchesVerified = !searchFilterState.verifiedOnly || isAppVerified(a);
      return matchesText && matchesCategory && matchesVerified;
    });

    filtered = filtered.sort((a, b) => {
      if (searchFilterState.sort === 'rating') return getAppRating(b) - getAppRating(a);
      if (searchFilterState.sort === 'size') {
        const aSize = Number.parseFloat(a.size);
        const bSize = Number.parseFloat(b.size);
        return (Number.isFinite(aSize) ? aSize : Number.MAX_SAFE_INTEGER) - (Number.isFinite(bSize) ? bSize : Number.MAX_SAFE_INTEGER);
      }
      if (searchFilterState.sort === 'title') return String(a.title || '').localeCompare(String(b.title || ''));
      return (parseDateValue(b.uploadedAt || b.updatedAt)?.getTime() || 0) - (parseDateValue(a.uploadedAt || a.updatedAt)?.getTime() || 0);
    });

    if (filtered.length) {
      resultsArea.innerHTML = filtered.map(app => renderAppListItem(app)).join('');
    } else {
      resultsArea.innerHTML = `
        <div class="py-16 text-center text-slate-400">
          <i data-lucide="search-x" class="w-12 h-12 mx-auto mb-3 text-slate-400"></i>
          <h3 class="font-bold text-slate-500 dark:text-slate-400 text-xs">No results for "${escapeHtml(query)}"</h3>
        </div>`;
    }
  }
  requestAnimationFrame(() => {
    document.querySelectorAll('#search-results-area .app-card-reveal').forEach((card, index) => {
      card.style.animationDelay = `${Math.min(index * 45, 300)}ms`;
      card.classList.add('card-visible');
    });
  });
  if (window.lucide) lucide.createIcons();
  }, 300); // 300ms debounce
};

// ── DEVELOPER UPLOAD HANDLERS ──
window.handleIconSelect = function(input) {
  const file = input.files[0];
  if (!file) return;
  if (!file.type || !file.type.startsWith('image/')) {
    showToast('Invalid icon', 'Please select a PNG, JPG, or WebP image.', 'danger');
    input.value = '';
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    showToast('Icon too large', 'Use an icon image under 2 MB.', 'danger');
    input.value = '';
    return;
  }
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
  if (!currentUser) {
    alert('Please sign in before publishing apps.');
    openAuthModal('login');
    return;
  }
  if (!isDeveloperAuthenticated) {
    showToast('Developer access required', 'This account is not approved to publish apps.', 'danger');
    return;
  }
  if (!db) {
    alert('Cloud database unavailable right now.');
    return;
  }
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
  if (name.length > 80) { if (errEl) { errEl.textContent = 'App name must be 80 characters or less.'; errEl.classList.remove('hidden'); } return; }
  if (!category) { if (errEl) { errEl.textContent = 'Please select a category.'; errEl.classList.remove('hidden'); } return; }
  if (!link) { if (errEl) { errEl.textContent = 'Please enter a download link.'; errEl.classList.remove('hidden'); } return; }
  if (!uploadIconData) { if (errEl) { errEl.textContent = 'Please upload an app icon image.'; errEl.classList.remove('hidden'); } return; }
  if (!desc) { if (errEl) { errEl.textContent = 'Please add a description.'; errEl.classList.remove('hidden'); } return; }
  if (desc.length > 4000) { if (errEl) { errEl.textContent = 'Description must be 4000 characters or less.'; errEl.classList.remove('hidden'); } return; }
  const safeLink = safeDownloadUrl(link);
  if (!safeLink) { if (errEl) { errEl.textContent = 'Please enter a valid http(s) or local download link.'; errEl.classList.remove('hidden'); } return; }
  const screenshots = screenshotsRaw ? screenshotsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
  const invalidScreenshot = screenshots.find(s => !safeImageUrl(s));
  if (invalidScreenshot) {
    if (errEl) {
      errEl.textContent = 'Screenshot URLs must be http(s), local image paths, or downloads paths.';
      errEl.classList.remove('hidden');
    }
    return;
  }
  const submitBtn = document.getElementById('upload-submit-btn');
  const originalSubmitLabel = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Saving...';
    if (window.lucide) lucide.createIcons();
  }

  if (successEl) {
    successEl.innerHTML = 'Saving your app to Firebase...';
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
      downloadLink: safeLink,
      screenshots,
      authorUid: currentUser ? currentUser.uid : 'anonymous',
      authorName: currentUser ? currentUser.name : 'Unknown Developer',
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isVerified: true,
      isSafeDownload: true,
      version: '1.0.0',
      changelog: [{ version: '1.0.0', date: new Date().toISOString().slice(0, 10), notes: 'Initial public release.' }],
      downloadCount: 0,
      rating: 0,
      reviewCount: 0
    });

    uploadIconData = null;

    if (successEl) successEl.innerHTML = `<strong>"${escapeHtml(name)}"</strong> has been published to the cloud.`;
    
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
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalSubmitLabel || '<i data-lucide="upload" class="w-4 h-4"></i> Publish Application';
      if (window.lucide) lucide.createIcons();
    }
  }
};

window.deleteApp = async function(id) {
  const app = APPS_DATA.find(a => a.id === id);
  if (!currentUser) {
    alert('Please sign in before deleting apps.');
    openAuthModal('login');
    return;
  }
  if (app && app.authorUid !== currentUser.uid) {
    alert('You can only delete apps that were uploaded from your account.');
    return;
  }
  if (!db) {
    alert('Cloud database unavailable right now.');
    return;
  }
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
  clearTimeout(installButtonResetTimer);
  clearTimeout(installButtonRestoreTimer);
  installButtonBusy = false;
  pendingTrustedDownload = null;

  document.getElementById('modal-app-title').textContent = app.title;
  document.getElementById('modal-app-meta').textContent = app.authorName || 'HankStudio Developer';
  document.getElementById('modal-app-desc').textContent = app.description;
  document.getElementById('modal-stat-size').textContent = app.size || '8.8 MB';
  updateModalFavoriteButton(app.id);

  const trustScreen = document.getElementById('download-trust-screen');
  if (trustScreen) {
    trustScreen.classList.add('hidden');
    trustScreen.innerHTML = '';
  }

  const verificationBadges = document.getElementById('modal-verification-badges');
  if (verificationBadges) verificationBadges.innerHTML = renderVerificationBadges(app);

  const changelogSection = document.getElementById('modal-changelog-section');
  const changelog = Array.isArray(app.changelog) ? app.changelog : [];
  if (changelogSection) {
    if (changelog.length) {
      changelogSection.classList.remove('hidden');
      changelogSection.innerHTML = `
        <div class="flex justify-between items-center">
          <h4 class="text-xs sm:text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider">Version history</h4>
          <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400">v${escapeHtml(app.version || changelog[0].version || '1.0.0')}</span>
        </div>
        <div class="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
          ${changelog.slice(0, 3).map(item => `
            <div>
              <p class="text-xs font-bold text-slate-800 dark:text-white">Version ${escapeHtml(item.version || app.version || '1.0.0')}</p>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">${escapeHtml(item.date || formatDate(app.updatedAt || app.uploadedAt))}</p>
              <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-1">${escapeHtml(item.notes || 'Maintenance and polish update.')}</p>
            </div>
          `).join('')}
        </div>`;
    } else {
      changelogSection.classList.add('hidden');
      changelogSection.innerHTML = '';
    }
  }
  
  const categoryChip = document.getElementById('modal-category-chip');
  if (categoryChip) {
    categoryChip.textContent = app.category;
    categoryChip.onclick = () => { closeAppModal(); searchCategory(app.category); };
  }

  const iconEl = document.getElementById('modal-app-icon');
  if (iconEl) iconEl.innerHTML = appCardHTML(app);

  const dlBtn = document.getElementById('modal-download-btn');
  if (dlBtn) {
    const safeLink = safeDownloadUrl(app.downloadLink);
    if (safeLink) {
      dlBtn.onclick = () => { downloadSelectedApp(); };
      dlBtn.innerHTML = '<i data-lucide="download-cloud" class="w-5 h-5 text-emerald-50"></i><span>Install Now</span>';
      dlBtn.disabled = false;
      dlBtn.style.opacity = '1';
    } else {
      dlBtn.innerHTML = '<span>Install Unavailable</span>';
      dlBtn.disabled = true;
      dlBtn.style.opacity = '0.5';
    }
  }

  const ssContainer = document.getElementById('modal-screenshots-container');
  const ssGallery = document.getElementById('modal-screenshots');
  if (app.screenshots && app.screenshots.length > 0) {
    if (ssContainer) ssContainer.classList.remove('hidden');
    if (ssGallery) ssGallery.innerHTML = app.screenshots.map(s => {
      const shotUrl = safeImageUrl(s, { allowData: true });
      return shotUrl
        ? `<img src="${escapeHtml(shotUrl)}" class="h-[220px] sm:h-[300px] w-[110px] sm:w-[150px] rounded-[1.25rem] object-cover shadow-md snap-center flex-shrink-0 border border-slate-200 dark:border-slate-800" onerror="this.style.display='none'">`
        : '';
    }).filter(Boolean).join('');
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
  if (window.lucide) lucide.createIcons();
};

window.downloadSelectedApp = function() {
  if (!selectedApp || !selectedApp.downloadLink || installButtonBusy) return;
  const url = safeDownloadUrl(selectedApp.downloadLink);
  if (!url) {
    showToast('Install blocked', 'That download link is not allowed.', 'danger');
    return;
  }
  const btn = document.getElementById('modal-download-btn');
  const trustScreen = document.getElementById('download-trust-screen');
  if (btn) {
    installButtonBusy = true;
    btn.disabled = true;
    btn.classList.add('install-preparing');
    btn.innerHTML = '<span class="inline-flex items-center gap-2"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>Preparing...</span>';
    if (window.lucide) lucide.createIcons();
  }

  clearTimeout(installButtonResetTimer);
  installButtonResetTimer = setTimeout(() => {
    pendingTrustedDownload = { url, appId: selectedApp.id };
    if (trustScreen) {
      trustScreen.className = 'download-trust-card';
      trustScreen.innerHTML = `
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/35 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <i data-lucide="shield-check" class="w-5 h-5"></i>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-extrabold text-slate-900 dark:text-white">Download trust check</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Verified by HankStudio before opening the source.</p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
              <div class="trust-meta"><span>File</span><strong>${escapeHtml(getFileNameFromUrl(url))}</strong></div>
              <div class="trust-meta"><span>Size</span><strong>${escapeHtml(selectedApp.size || 'Unknown')}</strong></div>
              <div class="trust-meta"><span>Source</span><strong>${escapeHtml(getSourceDomain(url))}</strong></div>
            </div>
            <div class="flex gap-2 mt-3">
              <button onclick="confirmTrustedDownload()" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 text-xs font-bold transition-all">Continue Download</button>
              <button onclick="cancelTrustedDownload()" class="px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl py-2 text-xs font-bold transition-all">Cancel</button>
            </div>
          </div>
        </div>`;
    }
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('install-preparing');
      btn.innerHTML = '<i data-lucide="shield-check" class="w-5 h-5"></i><span>Trust Check Ready</span>';
    }
    installButtonBusy = false;
    if (window.lucide) lucide.createIcons();
  }, 450);
};

window.cancelTrustedDownload = function() {
  pendingTrustedDownload = null;
  installButtonBusy = false;
  const trustScreen = document.getElementById('download-trust-screen');
  const btn = document.getElementById('modal-download-btn');
  if (trustScreen) {
    trustScreen.classList.add('hidden');
    trustScreen.innerHTML = '';
  }
  if (btn) {
    btn.disabled = false;
    btn.classList.remove('install-preparing', 'install-downloading', 'install-complete');
    btn.innerHTML = '<i data-lucide="download-cloud" class="w-5 h-5 text-emerald-50"></i><span>Install Now</span>';
  }
  if (window.lucide) lucide.createIcons();
};

window.confirmTrustedDownload = function() {
  if (!pendingTrustedDownload || !selectedApp) return;
  const { url, appId } = pendingTrustedDownload;
  const btn = document.getElementById('modal-download-btn');
  const trustScreen = document.getElementById('download-trust-screen');
  const isLocalAsset = /^(\/|\.\/|\.\.\/|[a-zA-Z]:[\\/]|downloads[\\/])/i.test(url);
  const link = document.createElement('a');
  link.href = url;
  link.rel = 'noopener noreferrer';
  if (isLocalAsset || url.startsWith('blob:') || url.startsWith('data:')) {
    link.download = getFileNameFromUrl(url);
  } else {
    link.target = '_blank';
  }

  installButtonBusy = true;
  if (btn) {
    btn.disabled = true;
    btn.classList.add('install-downloading');
    btn.innerHTML = '<span class="inline-flex items-center gap-2"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>Downloading...</span>';
  }
  if (trustScreen) trustScreen.classList.add('hidden');
  if (window.lucide) lucide.createIcons();

  clearTimeout(installButtonResetTimer);
  installButtonResetTimer = setTimeout(() => {
    document.body.appendChild(link);
    link.click();
    link.remove();
    trackDownload(appId);
    showToast('Download started', selectedApp.title ? `${selectedApp.title} is downloading.` : 'Your download has started.', 'success');
    if (btn) {
      btn.classList.remove('install-downloading');
      btn.classList.add('install-complete');
      btn.innerHTML = '<span class="inline-flex items-center gap-2"><i data-lucide="check" class="w-4 h-4"></i>Download Started</span>';
    }
    pendingTrustedDownload = null;
    clearTimeout(installButtonRestoreTimer);
    installButtonRestoreTimer = setTimeout(() => {
      installButtonBusy = false;
      if (btn) {
        btn.disabled = false;
        btn.classList.remove('install-complete');
        btn.innerHTML = '<i data-lucide="download-cloud" class="w-5 h-5 text-emerald-50"></i><span>Install Now</span>';
        if (window.lucide) lucide.createIcons();
      }
    }, 900);
  }, 650);
};

window.closeAppModal = function() {
  const appModal = document.getElementById('app-detail-modal');
  if (appModal) appModal.classList.add('hidden');
  clearTimeout(installButtonResetTimer);
  clearTimeout(installButtonRestoreTimer);
  installButtonBusy = false;
  pendingTrustedDownload = null;
  const trustScreen = document.getElementById('download-trust-screen');
  if (trustScreen) {
    trustScreen.classList.add('hidden');
    trustScreen.innerHTML = '';
  }
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
        stars[i].className = "w-5 h-5 cursor-pointer text-slate-300 dark:text-slate-700 hover:text-blue-500 transition-colors";
      }
    }
  }
};

// ── LOCAL REVIEWS STORAGE FALLBACKS ──
let GUEST_REVIEWS_CACHE = {};

function getReviewKey(review) {
  return [
    review.userId || '',
    review.userName || '',
    review.timestamp || '',
    review.comment || ''
  ].join('|');
}

function getHelpfulVoteState(appId, reviewKey) {
  const appVotes = REVIEW_FEEDBACK_CACHE[appId] || {};
  return appVotes[reviewKey] || { helpful: 0, notHelpful: 0, voted: false };
}

function persistHelpfulVoteState() {
  saveJsonStorage('hankstudio_review_feedback', REVIEW_FEEDBACK_CACHE);
}

window.toggleDataSafetyDetails = function() {
  const details = document.getElementById('data-safety-details');
  if (!details) return;
  details.classList.toggle('hidden');
};

window.handleReviewHelpful = function(appId, reviewKey, type) {
  try {
    reviewKey = decodeURIComponent(reviewKey);
  } catch (e) {}
  if (!REVIEW_FEEDBACK_CACHE[appId]) REVIEW_FEEDBACK_CACHE[appId] = {};
  const existing = REVIEW_FEEDBACK_CACHE[appId][reviewKey] || { helpful: 0, notHelpful: 0, voted: false };
  if (existing.voted) {
    showToast('Feedback saved', 'You already voted on this review.', 'info');
    return;
  }
  if (type === 'helpful') {
    existing.helpful += 1;
    showToast('Thanks', 'Marked as helpful.', 'success');
  } else {
    existing.notHelpful += 1;
    showToast('Thanks', 'Marked as not helpful.', 'info');
  }
  existing.voted = true;
  REVIEW_FEEDBACK_CACHE[appId][reviewKey] = existing;
  persistHelpfulVoteState();
  if (selectedApp && selectedApp.id === appId) fetchReviews(appId, activeReviewsRequestId);
};

window.reportReview = function(appId, reviewKeyToken) {
  let reviewKey = reviewKeyToken;
  try {
    reviewKey = decodeURIComponent(reviewKeyToken);
  } catch (e) {}
  if (!REVIEW_REPORT_CACHE[appId]) REVIEW_REPORT_CACHE[appId] = {};
  REVIEW_REPORT_CACHE[appId][reviewKey] = {
    reportedAt: new Date().toISOString(),
    reporterUid: currentUser ? currentUser.uid : 'guest'
  };
  saveJsonStorage('hankstudio_review_reports', REVIEW_REPORT_CACHE);
  showToast('Review reported', 'Thanks. This review is queued for moderation.', 'success');
  if (selectedApp && selectedApp.id === appId) fetchReviews(appId, activeReviewsRequestId);
};

function getLocalDefaultReviews(appId) {
  return [];
}

window.fetchReviews = async function(appId, requestId = null) {
  const effectiveRequestId = requestId ?? ++activeReviewsRequestId;
  activeReviewsRequestId = effectiveRequestId;
  const listEl = document.getElementById('modal-reviews-list');
  if (!listEl) return;
  listEl.innerHTML = '<p class="text-xs text-slate-500">Loading reviews...</p>';
  
  const authMsg = document.getElementById('review-auth-msg');
  const reviewText = document.getElementById('review-text');
  const usernameInput = document.getElementById('review-username');
  if (usernameInput) {
    usernameInput.value = currentUser ? (currentUser.name || '') : '';
    usernameInput.placeholder = currentUser ? 'Logged in as ' + (currentUser.name || 'User') : 'Your name (optional for guests)...';
    usernameInput.disabled = !!currentUser;
  }
  if (reviewText) {
    reviewText.disabled = !currentUser;
    reviewText.value = '';
  }
  if (authMsg) {
    authMsg.classList.toggle('hidden', !!currentUser);
  }
  setReviewRating(0);

  try {
    let dbReviews = [];
    if (db) {
      try {
        const snap = await db.collection(`apps/${appId}/reviews`).orderBy('timestamp', 'desc').get();
        snap.forEach(doc => {
          dbReviews.push(doc.data());
        });
      } catch (firestoreError) {
        console.warn("Firestore reviews failed, loading local seed:", firestoreError);
      }
    }

    // Fallback if empty and appId is attendease-app
    if (dbReviews.length === 0 && appId === 'attendease-app') {
      dbReviews = getLocalDefaultReviews(appId);
    }

    // Merge with GUEST_REVIEWS_CACHE
    const cached = GUEST_REVIEWS_CACHE[appId] || [];
    const merged = [...cached];
    dbReviews.forEach(r => {
      if (!merged.some(m => m.comment === r.comment && m.userName === r.userName)) {
        merged.push(r);
      }
    });

    // Sort by date desc
    merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (effectiveRequestId !== activeReviewsRequestId || !selectedApp || selectedApp.id !== appId) {
      return;
    }

    const reviews = merged;

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
      const reviewKey = getReviewKey(r);
      const reviewKeyToken = encodeURIComponent(reviewKey);
      const helpfulState = getHelpfulVoteState(appId, reviewKey);
      const isReported = !!(REVIEW_REPORT_CACHE[appId] && REVIEW_REPORT_CACHE[appId][reviewKey]);
      const helpful = (r.helpfulCount || Math.floor(Math.random() * 5) + 1) + (helpfulState.helpful || 0);
      const helpfulDisabled = helpfulState.voted ? 'opacity-60 pointer-events-none' : '';
      
      let replyHTML = '';
      if (r.reply) {
        replyHTML = `
          <div class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 mt-3 border border-slate-200 dark:border-slate-800 text-[10px] space-y-1 ml-4 shadow-sm">
            <div class="flex justify-between items-center text-slate-900 dark:text-white font-bold">
              <span>Developer Response</span>
              <span class="text-slate-400 dark:text-slate-500 font-normal">17/08/23</span>
            </div>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed mt-1">${escapeHtml(r.reply)}</p>
          </div>
        `;
      }

      html += `
        <div class="py-3 border-b border-slate-100 dark:border-slate-800/60 space-y-2">
          <!-- User Profile Row -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                ${initial}
              </div>
              <span class="text-xs font-semibold text-slate-900 dark:text-white">${escapeHtml(r.userName)}</span>
            </div>
            <button type="button" onclick="reportReview('${appId}', '${reviewKeyToken}')" class="p-1 rounded-full ${isReported ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'} active:scale-95 transition-transform" title="Report review">
              <i data-lucide="${isReported ? 'flag' : 'flag-triangle-right'}" class="w-4 h-4"></i>
            </button>
          </div>
          <!-- Stars & Date Row -->
          <div class="flex items-center gap-2">
            <div class="flex gap-0.5">${`<i data-lucide="star" class="w-2.5 h-2.5 fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400"></i>`.repeat(r.rating) + `<i data-lucide="star" class="w-2.5 h-2.5 text-slate-200 dark:text-slate-700"></i>`.repeat(5 - r.rating)}</div>
            <span class="text-[9px] text-slate-500 dark:text-slate-400">${formattedDate}</span>
          </div>
          <!-- Review Comment -->
          <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">${escapeHtml(r.comment)}</p>
          <!-- Helpful Buttons Row -->
          <div class="flex items-center justify-between mt-3 text-[10px] text-slate-500 dark:text-slate-400">
            <span>${helpful} ${helpful === 1 ? 'person' : 'people'} found this helpful</span>
            <div class="flex gap-2">
              <button type="button" onclick="handleReviewHelpful('${appId}', '${reviewKeyToken}', 'helpful')" class="text-[9px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-0.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all select-none ${helpfulDisabled}">Yes</button>
              <button type="button" onclick="handleReviewHelpful('${appId}', '${reviewKeyToken}', 'not-helpful')" class="text-[9px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-0.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all select-none ${helpfulDisabled}">No</button>
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
      listEl.innerHTML = '<p class="text-xs text-slate-500">No reviews yet. Be the first!</p>';
      document.getElementById('modal-app-rating').textContent = '0.0';
      document.getElementById('modal-rating-huge').textContent = '0.0';
      document.getElementById('modal-review-count-total').textContent = '0';
      document.getElementById('modal-stat-rating-count').textContent = `0 reviews`;
    }
    
    // Update global app state so it reflects on the main page
    if (selectedApp) {
      selectedApp.rating = parseFloat(averageRating) || 0;
      selectedApp.reviewCount = count;
      const appIndex = APPS_DATA.findIndex(a => a.id === selectedApp.id);
      if (appIndex !== -1) {
        APPS_DATA[appIndex].rating = selectedApp.rating;
        APPS_DATA[appIndex].reviewCount = selectedApp.reviewCount;
        renderContent(); // Re-render the main page list behind the modal
      }
      
      // Persist the new rating to Firestore so it shows correctly on page load
      if (db) {
        db.collection('apps').doc(selectedApp.id).update({
          rating: selectedApp.rating,
          reviewCount: selectedApp.reviewCount
        }).catch(err => {
          // If the app doesn't exist yet (e.g. attendease-app), try set with merge
          db.collection('apps').doc(selectedApp.id).set({
            rating: selectedApp.rating,
            reviewCount: selectedApp.reviewCount
          }, { merge: true }).catch(console.warn);
        });
      }
    }

    // Dynamic Stars Summary
    const starsSummary = document.getElementById('modal-reviews-stars-summary');
    if (starsSummary) {
      const roundedRating = Math.round(parseFloat(averageRating));
      starsSummary.innerHTML = `<i data-lucide="star" class="w-3.5 h-3.5 fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400"></i>`.repeat(roundedRating) +
                              `<i data-lucide="star" class="w-3.5 h-3.5 text-slate-200 dark:text-slate-700"></i>`.repeat(5 - roundedRating);
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

window.submitReview = async function(buttonEl) {
  if (!selectedApp) return;
  if (!currentUser) {
    showToast('Sign in required', 'Please log in before leaving a review.', 'danger');
    openAuthModal('login');
    return;
  }
  if (currentReviewRating === 0) return alert('Please select a star rating.');
  const text = document.getElementById('review-text').value.trim();
  if (!text) return alert('Please write a short review.');
  if (!db) {
    showToast('Reviews unavailable', 'Cloud reviews are not connected right now.', 'danger');
    return;
  }

  const usernameInput = document.getElementById('review-username');
  const userId = currentUser.uid;
  const userName = currentUser.name || 'Anonymous';

  const newReview = {
    userId: userId,
    userName: userName,
    rating: currentReviewRating,
    comment: text,
    timestamp: new Date().toISOString(),
    helpfulCount: 0
  };

  const btn = buttonEl || document.activeElement;
  const originalLabel = btn ? btn.innerHTML : '';
  if (btn) {
    btn.innerHTML = '<span class="inline-flex items-center gap-2"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>Submitting...</span>';
    btn.disabled = true;
    if (window.lucide) lucide.createIcons();
  }

  try {
    if (db) {
      const reviewPayload = {
        userId: userId,
        userName: userName,
        rating: currentReviewRating,
        comment: text,
        timestamp: new Date().toISOString()
      };

      await db.collection(`apps/${selectedApp.id}/reviews`).add(reviewPayload);

      if (!GUEST_REVIEWS_CACHE[selectedApp.id]) {
        GUEST_REVIEWS_CACHE[selectedApp.id] = [];
      }
      GUEST_REVIEWS_CACHE[selectedApp.id].unshift(reviewPayload);
    }
    fetchReviews(selectedApp.id);
  } catch (err) {
    alert("Error saving review: " + err.message);
  } finally {
    if (btn) {
      btn.innerHTML = originalLabel || 'Submit Review';
      btn.disabled = false;
      if (window.lucide) lucide.createIcons();
    }
  }
};



function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function safeImageUrl(url, { allowData = false, allowBlob = false } = {}) {
  if (!url) return '';
  const value = String(url).trim();
  if (!value) return '';
  if (/^(https?:\/\/|\/|\.\/|\.\.\/|[a-zA-Z]:[\\/]|downloads[\\/])/i.test(value)) return value;
  if (allowBlob && value.startsWith('blob:')) return value;
  if (allowData && /^data:image\/[a-zA-Z0-9.+-]+;base64,[a-zA-Z0-9+/=\s]+$/.test(value)) return value;
  return '';
}

function safeCssColor(value, fallback = '#05cd74') {
  if (!value) return fallback;
  const trimmed = String(value).trim();
  if (/^(#[0-9a-f]{3,8}|rgb(a?)\([^)]*\)|hsl(a?)\([^)]*\)|var\(--[a-zA-Z0-9-_]+\))$/i.test(trimmed)) {
    return trimmed;
  }
  return fallback;
}

function safeDownloadUrl(url) {
  if (!url) return '';
  const value = String(url).trim();
  if (!value) return '';
  if (/^(https?:\/\/|\/|\.\/|\.\.\/|[a-zA-Z]:[\\/]|downloads[\\/])/i.test(value)) return value;
  if (value.startsWith('blob:')) return value;
  return '';
}
