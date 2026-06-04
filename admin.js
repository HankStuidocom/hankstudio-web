const ADMIN_EMAIL = 'lolxtvnews04@gmail.com';

// State
let iconFile = null;
let bannerFile = null;
let screenshotFiles = [];
let editAppId = null;

// Firebase Init
const app = firebase.app();
const auth = firebase.auth();
const db = firebase.firestore();

// Auth State Listener
auth.onAuthStateChanged(user => {
  if (user) {
    if (user.email === ADMIN_EMAIL) {
      document.getElementById('login-gate').classList.add('hidden');
      document.getElementById('admin-dashboard').classList.remove('hidden');
      document.getElementById('admin-email-display').textContent = user.email;
      initDashboard();
    } else {
      showToast('Access Denied', 'You are not authorized to access the admin panel.', 'error');
      auth.signOut();
    }
  } else {
    document.getElementById('login-gate').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
  }
});

// Auth Functions
function adminLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(error => {
    document.getElementById('login-error').textContent = error.message;
    document.getElementById('login-error').classList.remove('hidden');
  });
}

function adminLogout() {
  auth.signOut();
}

// Dashboard Init
function initDashboard() {
  loadStats();
  loadApps();
  setupDragAndDrop();
  initDarkMode();
}

// Stats
function loadStats() {
  db.collection('apps').onSnapshot(snapshot => {
    document.getElementById('stat-total-apps').textContent = snapshot.size;
    let totalReviews = 0;
    let totalStars = 0;
    let totalVotes = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.totalVotes && data.totalVotes > 0) {
        totalStars += data.totalStars || 0;
        totalVotes += data.totalVotes || 0;
      }
      totalReviews += data.reviewCount || 0;
    });

    document.getElementById('stat-total-reviews').textContent = totalReviews;
    const avg = totalVotes > 0 ? (totalStars / totalVotes).toFixed(1) : '0.0';
    document.getElementById('stat-avg-rating').textContent = avg;
  });
}

// Drag & Drop Setup
function setupDragAndDrop() {
  ['icon', 'banner', 'screenshots'].forEach(type => {
    const zone = document.getElementById(`${type}-drop-zone`);
    if (!zone) return;
    
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('border-brand', 'bg-brand/5');
    });
    
    zone.addEventListener('dragleave', e => {
      e.preventDefault();
      zone.classList.remove('border-brand', 'bg-brand/5');
    });
    
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('border-brand', 'bg-brand/5');
      if (e.dataTransfer.files.length) {
        if (type === 'icon') handleIconSelect({ target: { files: e.dataTransfer.files } });
        else if (type === 'banner') handleBannerSelect({ target: { files: e.dataTransfer.files } });
        else handleScreenshotsSelect({ target: { files: e.dataTransfer.files } });
      }
    });
  });
}

// File Handlers
async function handleIconSelect(e) {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  iconFile = file;
  const base64 = await compressImage(file, 256, 256, 0.8);
  iconFile.base64 = base64;
  
  const previewArea = document.getElementById('icon-preview-area');
  previewArea.innerHTML = `
    <div class="relative inline-block mt-2">
      <img src="${base64}" class="w-20 h-20 rounded-2xl object-cover shadow-md border border-slate-200 dark:border-slate-700">
      <button type="button" onclick="event.stopPropagation(); removeIcon()" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-sm">
        <i data-lucide="x" class="w-3 h-3"></i>
      </button>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
}

function removeIcon() {
  iconFile = null;
  document.getElementById('icon-file-input').value = '';
  document.getElementById('icon-preview-area').innerHTML = `
    <i data-lucide="image-plus" class="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2"></i>
    <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Drop icon here or click to browse</p>
    <p class="text-xs text-slate-400 dark:text-slate-600 mt-1">PNG, JPG up to 2 MB • Will be compressed to 256×256</p>
  `;
  if (window.lucide) lucide.createIcons();
}

async function handleBannerSelect(e) {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  bannerFile = file;
  const base64 = await compressImage(file, 1200, 600, 0.7);
  bannerFile.base64 = base64;
  
  const previewArea = document.getElementById('banner-preview-area');
  previewArea.innerHTML = `
    <div class="relative inline-block mt-2 w-full max-w-xs">
      <img src="${base64}" class="w-full h-32 rounded-xl object-cover shadow-md border border-slate-200 dark:border-slate-700">
      <button type="button" onclick="event.stopPropagation(); removeBanner()" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-sm">
        <i data-lucide="x" class="w-3 h-3"></i>
      </button>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
}

function removeBanner() {
  bannerFile = null;
  document.getElementById('banner-file-input').value = '';
  document.getElementById('banner-preview-area').innerHTML = `
    <i data-lucide="panorama" class="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2"></i>
    <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Drop banner here or click to browse</p>
    <p class="text-xs text-slate-400 dark:text-slate-600 mt-1">Recommended: 1200×600 • Will be compressed</p>
  `;
  if (window.lucide) lucide.createIcons();
}

async function handleScreenshotsSelect(e) {
  const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
  if (!files.length) return;
  
  const remainingSlots = 8 - screenshotFiles.length;
  const toProcess = files.slice(0, remainingSlots);
  
  if (files.length > remainingSlots) {
    showToast('Limit Exceeded', `Only added ${remainingSlots} screenshots (max 8).`, 'warning');
  }

  for (const file of toProcess) {
    const base64 = await compressImage(file, 720, 1280, 0.7);
    file.base64 = base64;
    screenshotFiles.push(file);
  }
  
  renderScreenshotPreviews();
}

function removeScreenshot(index) {
  screenshotFiles.splice(index, 1);
  renderScreenshotPreviews();
}

function renderScreenshotPreviews() {
  const previewArea = document.getElementById('screenshots-preview-area');
  if (screenshotFiles.length === 0) {
    previewArea.innerHTML = `
      <i data-lucide="images" class="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2"></i>
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Drop screenshots here or click to browse</p>
      <p class="text-xs text-slate-400 dark:text-slate-600 mt-1">PNG, JPG • Up to 8 images • Will be compressed</p>
    `;
  } else {
    previewArea.innerHTML = `
      <div class="flex gap-3 overflow-x-auto pb-2 px-2 snap-x w-full">
        ${screenshotFiles.map((file, i) => `
          <div class="relative flex-shrink-0 snap-center mt-2">
            <img src="${file.base64}" class="h-32 w-auto rounded-xl object-cover shadow-sm border border-slate-200 dark:border-slate-700">
            <button type="button" onclick="event.stopPropagation(); removeScreenshot(${i})" class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-sm">
              <i data-lucide="x" class="w-3 h-3"></i>
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }
  document.getElementById('screenshots-file-input').value = '';
  if (window.lucide) lucide.createIcons();
}

// Publish App
async function publishApp() {
  const name = document.getElementById('app-name').value.trim();
  const category = document.getElementById('app-category').value;
  const description = document.getElementById('app-description').value.trim();
  const version = document.getElementById('app-version').value.trim();
  const packageName = document.getElementById('app-package').value.trim();
  const size = document.getElementById('app-size').value.trim();
  const downloadLink = document.getElementById('app-download-link').value.trim();

  if (!name || !category || !description || !downloadLink) {
    showToast('Missing Fields', 'Please fill in all required fields.', 'error');
    return;
  }
  
  if (!downloadLink.startsWith('http')) {
    showToast('Invalid URL', 'Download link must start with http or https', 'error');
    return;
  }

  if (!iconFile && !editAppId) {
    showToast('Missing Icon', 'Please upload an app icon.', 'error');
    return;
  }

  const btn = document.getElementById('publish-btn');
  const originalHtml = btn.innerHTML;
  btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i><span>${editAppId ? 'Updating...' : 'Publishing...'}</span>`;
  btn.disabled = true;
  if (window.lucide) lucide.createIcons();

  try {
    const appId = editAppId || generateAppId(name);
    
    // Build App Info String
    let appInfoLines = [];
    if (version) appInfoLines.push(`Version: ${version}`);
    if (size) appInfoLines.push(`Size: ${size}`);
    if (packageName) appInfoLines.push(`Package: ${packageName}`);
    appInfoLines.push(`Format: Android APK`);
    appInfoLines.push(`Developer: HankStudio`);

    // Prepare Document
    const docData = {
      title: name,
      category: category,
      description: description,
      appInfo: appInfoLines.join('\n'),
      size: size || 'Unknown',
      downloadLink: downloadLink,
      authorUid: auth.currentUser.uid,
      authorName: 'HankStudio',
      isVerified: true,
      isSafeDownload: true,
      isUpdatedRecently: true
    };

    if (iconFile) docData.iconDataUrl = iconFile.base64;
    if (bannerFile) docData.bannerDataUrl = bannerFile.base64;
    
    if (screenshotFiles.length > 0) {
      docData.screenshots = screenshotFiles.map(f => f.base64);
    }

    if (!editAppId) {
      docData.uploadedAt = new Date().toISOString();
      docData.totalStars = 0;
      docData.totalVotes = 0;
      docData.rating = 0;
      docData.reviewCount = 0;
    } else {
      docData.updatedAt = new Date().toISOString();
    }

    await db.collection('apps').doc(appId).set(docData, { merge: true });
    
    showToast('Success!', `App successfully ${editAppId ? 'updated' : 'published'}.`, 'success');
    resetForm();
    loadApps();
  } catch (error) {
    console.error(error);
    showToast('Error', error.message, 'error');
  } finally {
    btn.innerHTML = originalHtml;
    btn.disabled = false;
    if (window.lucide) lucide.createIcons();
  }
}

function resetForm() {
  document.getElementById('app-upload-form').reset();
  removeIcon();
  removeBanner();
  screenshotFiles = [];
  renderScreenshotPreviews();
  editAppId = null;
  document.getElementById('form-title').textContent = 'Upload New App';
  document.getElementById('publish-btn').innerHTML = `<i data-lucide="rocket" class="w-5 h-5"></i><span>Publish App</span>`;
  if (window.lucide) lucide.createIcons();
}

// App Management
function loadApps() {
  const container = document.getElementById('apps-list');
  db.collection('apps').orderBy('uploadedAt', 'desc').onSnapshot(snapshot => {
    container.innerHTML = '';
    if (snapshot.empty) {
      container.innerHTML = '<p class="text-sm text-slate-500 text-center py-4">No apps published yet.</p>';
      return;
    }
    
    snapshot.forEach(doc => {
      const app = doc.data();
      const id = doc.id;
      
      const div = document.createElement('div');
      div.className = 'flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50';
      div.innerHTML = `
        <div class="flex items-center gap-4 overflow-hidden">
          <img src="${app.iconDataUrl || ''}" class="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-white dark:bg-[#1E1E1E]">
          <div class="overflow-hidden">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate">${escapeHtml(app.title)}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 truncate">${escapeHtml(app.category)} • ${formatDate(app.uploadedAt)}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0 ml-4">
          <button onclick="editApp('${id}')" class="p-2 rounded-lg text-slate-400 hover:text-brand hover:bg-brand/10 transition-colors">
            <i data-lucide="pencil" class="w-4 h-4"></i>
          </button>
          <button onclick="promptDeleteApp('${id}')" class="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;
      container.appendChild(div);
    });
    if (window.lucide) lucide.createIcons();
  });
}

function editApp(appId) {
  db.collection('apps').doc(appId).get().then(doc => {
    if (!doc.exists) return;
    const app = doc.data();
    
    editAppId = appId;
    document.getElementById('form-title').textContent = 'Edit App';
    document.getElementById('publish-btn').innerHTML = `<i data-lucide="save" class="w-5 h-5"></i><span>Update App</span>`;
    
    document.getElementById('app-name').value = app.title || '';
    document.getElementById('app-category').value = app.category || 'Other';
    document.getElementById('app-description').value = app.description || '';
    document.getElementById('app-download-link').value = app.downloadLink || '';
    document.getElementById('app-size').value = app.size && app.size !== 'Unknown' ? app.size : '';
    
    // Parse appInfo
    if (app.appInfo) {
      const vMatch = app.appInfo.match(/Version:\s*(.+)/);
      if (vMatch) document.getElementById('app-version').value = vMatch[1];
      const pMatch = app.appInfo.match(/Package:\s*(.+)/);
      if (pMatch) document.getElementById('app-package').value = pMatch[1];
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) lucide.createIcons();
  });
}

let appToDelete = null;
function promptDeleteApp(appId) {
  appToDelete = appId;
  document.getElementById('delete-modal').classList.remove('hidden');
}

function closeDeleteModal() {
  appToDelete = null;
  document.getElementById('delete-modal').classList.add('hidden');
}

async function confirmDelete() {
  if (!appToDelete) return;
  const btn = document.getElementById('confirm-delete-btn');
  const original = btn.innerHTML;
  btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i>`;
  
  try {
    // Delete reviews subcollection first (basic cleanup, normally done by Cloud Functions)
    const revSnap = await db.collection(`apps/${appToDelete}/reviews`).get();
    const batch = db.batch();
    revSnap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(db.collection('apps').doc(appToDelete));
    await batch.commit();
    
    showToast('Deleted', 'App was successfully removed.', 'success');
  } catch (e) {
    showToast('Error', e.message, 'error');
  } finally {
    closeDeleteModal();
    btn.innerHTML = original;
  }
}

// Utils & Helpers
function compressImage(file, maxWidth, maxHeight, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height *= maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width *= maxHeight / height));
            height = maxHeight;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

function generateAppId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36);
}

function formatDate(iso) {
  if (!iso) return 'Unknown date';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Toasts
function showToast(title, message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  const colors = {
    success: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800',
    error: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800',
    info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800',
    warning: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800'
  };
  
  const icons = {
    success: 'check-circle', error: 'alert-circle', info: 'info', warning: 'alert-triangle'
  };
  
  toast.className = `flex items-start gap-3 p-4 rounded-2xl border shadow-lg transition-all duration-300 transform translate-x-full opacity-0 ${colors[type]} w-80 backdrop-blur-md`;
  toast.innerHTML = `
    <i data-lucide="${icons[type]}" class="w-5 h-5 flex-shrink-0 mt-0.5"></i>
    <div>
      <h4 class="text-sm font-bold">${escapeHtml(title)}</h4>
      <p class="text-xs opacity-90 mt-0.5">${escapeHtml(message)}</p>
    </div>
  `;
  
  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full', 'opacity-0');
  }, 10);
  
  // Animate out
  setTimeout(() => {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Dark Mode
function initDarkMode() {
  const isDark = localStorage.getItem('hankstudio_admin_theme') === 'dark' || 
    (!localStorage.getItem('hankstudio_admin_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}

function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('hankstudio_admin_theme', isDark ? 'dark' : 'light');
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
});
