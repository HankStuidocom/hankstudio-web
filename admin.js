const ADMIN_EMAIL = 'lolxtvnews04@gmail.com';

// State
let iconFile = null;
let bannerFile = null;
let screenshotFiles = [];
let editAppId = null;
let changelogEntries = [];

// Firebase Init
const firebaseConfig = {
  apiKey: "AIzaSyDN95soIqy3L9dDyp8K82gWIyUnR95VAcQ",
  authDomain: "hankstudio-web.firebaseapp.com",
  projectId: "hankstudio-web",
  storageBucket: "hankstudio-web.firebasestorage.app",
  messagingSenderId: "45331467819",
  appId: "1:45331467819:web:7234241582696fa8aaa46e",
  measurementId: "G-L21CJ76K0V"
};

let app, auth, db;
try {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
} catch (e) {
  console.error("Firebase failed to initialize:", e);
}

// Force dark mode always
document.documentElement.classList.add('dark');

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
      zone.classList.add('!border-brand/40', '!bg-brand/[0.06]');
    });
    
    zone.addEventListener('dragleave', e => {
      e.preventDefault();
      zone.classList.remove('!border-brand/40', '!bg-brand/[0.06]');
    });
    
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('!border-brand/40', '!bg-brand/[0.06]');
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
      <img src="${base64}" class="w-20 h-20 rounded-2xl object-cover shadow-md border border-white/[0.08]">
      <button type="button" onclick="event.stopPropagation(); removeIcon()" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-sm transition-colors">
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
    <i data-lucide="image-plus" class="w-8 h-8 text-slate-600 mb-2 group-hover:text-brand/60 transition-colors"></i>
    <p class="text-sm font-medium text-slate-500">Drop icon here or click to browse</p>
    <p class="text-xs text-slate-600 mt-1">PNG, JPG up to 2 MB • Will be compressed to 256×256</p>
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
      <img src="${base64}" class="w-full h-32 rounded-xl object-cover shadow-md border border-white/[0.08]">
      <button type="button" onclick="event.stopPropagation(); removeBanner()" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-sm transition-colors">
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
    <i data-lucide="panorama" class="w-8 h-8 text-slate-600 mb-2 group-hover:text-brand/60 transition-colors"></i>
    <p class="text-sm font-medium text-slate-500">Drop banner here or click to browse</p>
    <p class="text-xs text-slate-600 mt-1">Recommended: 1200×600 • Will be compressed</p>
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
      <i data-lucide="images" class="w-8 h-8 text-slate-600 mb-2 group-hover:text-brand/60 transition-colors"></i>
      <p class="text-sm font-medium text-slate-500">Drop screenshots here or click to browse</p>
      <p class="text-xs text-slate-600 mt-1">PNG, JPG • Up to 8 images • Will be compressed</p>
    `;
  } else {
    previewArea.innerHTML = `
      <div class="flex gap-3 overflow-x-auto pb-2 px-2 snap-x w-full">
        ${screenshotFiles.map((file, i) => `
          <div class="relative flex-shrink-0 snap-center mt-2">
            <img src="${file.base64}" class="h-32 w-auto rounded-xl object-cover shadow-sm border border-white/[0.08]">
            <button type="button" onclick="event.stopPropagation(); removeScreenshot(${i})" class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-sm transition-colors">
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

// ═══════════════════════════════════════════
// VERSION HISTORY / CHANGELOG
// ═══════════════════════════════════════════
function addChangelogEntry() {
  changelogEntries.unshift({
    version: document.getElementById('app-version').value.trim() || '1.0.0',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  renderChangelogEntries();
  // Focus the notes field of the newly added entry
  setTimeout(() => {
    const firstNotes = document.querySelector('#changelog-entries textarea');
    if (firstNotes) firstNotes.focus();
  }, 50);
}

function removeChangelogEntry(index) {
  changelogEntries.splice(index, 1);
  renderChangelogEntries();
}

function updateChangelogEntry(index, field, value) {
  if (changelogEntries[index]) {
    changelogEntries[index][field] = value;
  }
}

function renderChangelogEntries() {
  const container = document.getElementById('changelog-entries');
  if (!container) return;

  if (changelogEntries.length === 0) {
    container.innerHTML = `
      <div class="p-6 rounded-2xl bg-surface-input/30 border border-white/[0.03] border-dashed text-center">
        <div class="w-10 h-10 mx-auto rounded-full bg-brand/10 flex items-center justify-center mb-3">
          <i data-lucide="history" class="w-5 h-5 text-brand"></i>
        </div>
        <p class="text-xs text-slate-500">No updates listed yet. Click "Add Update" to add your bug fixes and features.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = changelogEntries.map((entry, i) => `
    <div class="group relative p-4 rounded-xl bg-surface-input/50 border border-white/[0.05] hover:border-white/[0.1] transition-all duration-200">
      <button type="button" onclick="removeChangelogEntry(${i})" class="absolute top-3 right-3 p-1 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all" title="Remove entry">
        <i data-lucide="x" class="w-3.5 h-3.5"></i>
      </button>
      <div class="grid grid-cols-2 gap-3 mb-2.5">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Version</label>
          <input type="text" value="${escapeHtml(entry.version)}" onchange="updateChangelogEntry(${i}, 'version', this.value)" class="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-white/[0.05] text-white text-xs font-medium focus:border-brand/40 focus:ring-1 focus:ring-brand/15 focus:outline-none transition-all" placeholder="e.g. 1.1.0">
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
          <input type="date" value="${escapeHtml(entry.date)}" onchange="updateChangelogEntry(${i}, 'date', this.value)" class="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-white/[0.05] text-white text-xs font-medium focus:border-brand/40 focus:ring-1 focus:ring-brand/15 focus:outline-none transition-all">
        </div>
      </div>
      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Latest Update Description</label>
        <textarea rows="2" onchange="updateChangelogEntry(${i}, 'notes', this.value)" class="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-white/[0.05] text-white text-xs font-medium focus:border-brand/40 focus:ring-1 focus:ring-brand/15 focus:outline-none transition-all resize-none" placeholder="- Fixed bug with login&#10;- Improved UI...">${escapeHtml(entry.notes)}</textarea>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

// ═══════════════════════════════════════════
// PUBLISH APP
// ═══════════════════════════════════════════
async function publishApp() {
  const name = document.getElementById('app-name').value.trim();
  const category = document.getElementById('app-category').value;
  const description = document.getElementById('app-description').value.trim();
  const version = document.getElementById('app-version').value.trim();
  const packageName = document.getElementById('app-package').value.trim();
  const size = document.getElementById('app-size').value.trim();
  const downloadLink = document.getElementById('app-download-link').value.trim();
  const authorNameInput = document.getElementById('app-author') ? document.getElementById('app-author').value.trim() : '';
  const isVerified = document.getElementById('app-verified') ? document.getElementById('app-verified').checked : true;
  const isSafeDownload = document.getElementById('app-safe') ? document.getElementById('app-safe').checked : true;

  if (!name || !category || !description || !downloadLink) {
    showToast('Missing Fields', 'Please fill in all required fields.', 'error');
    return;
  }
  
  if (!downloadLink.startsWith('http')) {
    showToast('Invalid URL', 'Download link must start with http or https', 'error');
    return;
  }
  const processedDownloadLink = processDownloadLink(downloadLink);
  if (!processedDownloadLink) {
    showToast('Invalid Download Link', 'Use a public share link, not a private Dropbox or Drive admin page.', 'error');
    updateLinkHelper(downloadLink);
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
    appInfoLines.push(`Developer: ${authorNameInput || 'HankStudio'}`);

    // Prepare Document
    const docData = {
      title: name,
      category: category,
      description: description,
      appInfo: appInfoLines.join('\n'),
      size: size || 'Unknown',
      version: version || '1.0.0',
      downloadLink: processedDownloadLink,
      authorUid: auth.currentUser.uid,
      authorName: authorNameInput || 'HankStudio',
      isVerified: isVerified,
      isSafeDownload: isSafeDownload,
      isUpdatedRecently: true
    };

    // Add changelog
    if (changelogEntries.length > 0) {
      docData.changelog = changelogEntries.filter(e => e.version && e.notes);
    }

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
  changelogEntries = [];
  renderScreenshotPreviews();
  renderChangelogEntries();
  editAppId = null;
  document.getElementById('form-title').textContent = 'Upload New App';
  document.getElementById('form-subtitle').textContent = 'Fill in the details and publish to your store';
  document.getElementById('publish-btn').innerHTML = `<i data-lucide="rocket" class="w-5 h-5"></i><span>Publish App</span>`;
  const helper = document.getElementById('download-link-helper');
  if (helper) {
    helper.classList.add('hidden');
    helper.innerHTML = '';
  }
  if (window.lucide) lucide.createIcons();
}

// ═══════════════════════════════════════════
// APP MANAGEMENT
// ═══════════════════════════════════════════
function loadApps() {
  const container = document.getElementById('apps-list');
  db.collection('apps').orderBy('uploadedAt', 'desc').onSnapshot(snapshot => {
    container.innerHTML = '';
    if (snapshot.empty) {
      container.innerHTML = `
        <div class="text-center py-12">
          <i data-lucide="inbox" class="w-12 h-12 text-slate-700 mx-auto mb-3"></i>
          <p class="text-sm text-slate-500 font-medium">No apps published yet</p>
          <p class="text-xs text-slate-600 mt-1">Use the form above to publish your first app</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    snapshot.forEach(doc => {
      const app = doc.data();
      const id = doc.id;
      const rating = app.totalVotes > 0 ? (app.totalStars / app.totalVotes).toFixed(1) : '—';
      const changelogCount = Array.isArray(app.changelog) ? app.changelog.length : 0;

      // Determine link type badge
      let linkBadge = '';
      const dl = app.downloadLink || '';
      if (dl.includes('dropbox')) linkBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/10">Dropbox</span>';
      else if (dl.includes('drive.google') || dl.includes('docs.google')) linkBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/10">Drive</span>';
      else if (dl.includes('firebasestorage')) linkBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/10">Firebase</span>';
      else if (dl.includes('github')) linkBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-500/10 text-slate-300 border border-slate-500/10">GitHub</span>';
      else if (dl.includes('mediafire')) linkBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/10">MediaFire</span>';

      const div = document.createElement('div');
      div.className = 'group flex items-center justify-between p-4 rounded-2xl bg-surface-input/40 border border-white/[0.04] hover:border-white/[0.08] hover:bg-surface-input/60 transition-all duration-200';
      div.innerHTML = `
        <div class="flex items-center gap-4 overflow-hidden flex-1 min-w-0">
          <img src="${app.iconDataUrl || ''}" class="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-surface-elevated ring-1 ring-white/[0.06]" onerror="this.style.display='none'">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-sm font-bold text-white truncate">${escapeHtml(app.title)}</h3>
              ${linkBadge}
            </div>
            <div class="flex items-center gap-3 mt-0.5">
              <span class="text-xs text-slate-500">${escapeHtml(app.category)}</span>
              <span class="text-[10px] text-slate-600">•</span>
              <span class="text-xs text-slate-500">v${escapeHtml(app.version || '1.0')}</span>
              <span class="text-[10px] text-slate-600">•</span>
              <span class="text-xs text-slate-500 flex items-center gap-0.5">
                <i data-lucide="star" class="w-3 h-3 text-amber-400"></i>${rating}
              </span>
              ${changelogCount > 0 ? `<span class="text-[10px] text-slate-600">•</span><span class="text-xs text-slate-500 flex items-center gap-0.5"><i data-lucide="clock" class="w-3 h-3"></i>${changelogCount} ver</span>` : ''}
            </div>
            <p class="text-[10px] text-slate-600 mt-0.5">${formatDate(app.uploadedAt)}</p>
          </div>
        </div>
        <div class="flex items-center gap-1 flex-shrink-0 ml-3 opacity-50 group-hover:opacity-100 transition-opacity">
          <button onclick="editApp('${id}')" class="p-2 rounded-lg text-slate-400 hover:text-brand hover:bg-brand/10 transition-colors" title="Edit app">
            <i data-lucide="pencil" class="w-4 h-4"></i>
          </button>
          <button onclick="promptDeleteApp('${id}')" class="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete app">
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
    document.getElementById('form-subtitle').textContent = `Editing: ${app.title}`;
    document.getElementById('publish-btn').innerHTML = `<i data-lucide="save" class="w-5 h-5"></i><span>Update App</span>`;
    
    document.getElementById('app-name').value = app.title || '';
    document.getElementById('app-category').value = app.category || 'Other';
    document.getElementById('app-description').value = app.description || '';
    document.getElementById('app-download-link').value = app.downloadLink || '';
    document.getElementById('app-version').value = app.version || '';
    document.getElementById('app-size').value = app.size && app.size !== 'Unknown' ? app.size : '';
    
    if (document.getElementById('app-author')) {
      document.getElementById('app-author').value = app.authorName || 'HankStudio';
    }
    if (document.getElementById('app-verified')) {
      document.getElementById('app-verified').checked = app.isVerified !== false;
    }
    if (document.getElementById('app-safe')) {
      document.getElementById('app-safe').checked = app.isSafeDownload !== false;
    }

    // Parse appInfo for package name
    if (app.appInfo) {
      const pMatch = app.appInfo.match(/Package:\s*(.+)/);
      if (pMatch) document.getElementById('app-package').value = pMatch[1];
    }
    
    // Load changelog
    changelogEntries = Array.isArray(app.changelog) ? JSON.parse(JSON.stringify(app.changelog)) : [];
    renderChangelogEntries();

    // Show download link helper badge
    updateLinkHelper(app.downloadLink || '');

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

// ═══════════════════════════════════════════
// UTILS & HELPERS
// ═══════════════════════════════════════════
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

// ═══════════════════════════════════════════
// TOASTS
// ═══════════════════════════════════════════
function showToast(title, message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  const colors = {
    success: 'bg-emerald-950/80 text-emerald-200 border-emerald-800/50',
    error: 'bg-red-950/80 text-red-200 border-red-800/50',
    info: 'bg-blue-950/80 text-blue-200 border-blue-800/50',
    warning: 'bg-amber-950/80 text-amber-200 border-amber-800/50'
  };
  
  const icons = {
    success: 'check-circle', error: 'alert-circle', info: 'info', warning: 'alert-triangle'
  };
  
  toast.className = `flex items-start gap-3 p-4 rounded-2xl border shadow-lg transition-all duration-300 transform translate-x-full opacity-0 ${colors[type]} w-80 backdrop-blur-xl pointer-events-auto`;
  toast.innerHTML = `
    <i data-lucide="${icons[type]}" class="w-5 h-5 flex-shrink-0 mt-0.5"></i>
    <div>
      <h4 class="text-sm font-bold">${escapeHtml(title)}</h4>
      <p class="text-xs opacity-80 mt-0.5">${escapeHtml(message)}</p>
    </div>
  `;
  
  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.classList.remove('translate-x-full', 'opacity-0');
  }, 10);
  
  setTimeout(() => {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ═══════════════════════════════════════════
// DIRECT DOWNLOAD LINK HELPERS
// ═══════════════════════════════════════════
function processDownloadLink(url) {
  if (!url) return '';
  const value = String(url).trim();
  if (!value || !/^https?:\/\//i.test(value)) return '';

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();

    if (host.endsWith('dropbox.com') || host === 'dl.dropboxusercontent.com') {
      if (parsed.pathname.startsWith('/home') || parsed.pathname === '/') return '';
      parsed.hostname = 'dl.dropboxusercontent.com';
      parsed.searchParams.delete('raw');
      parsed.searchParams.set('dl', '1');
      return parsed.toString();
    }

    if (host === 'drive.google.com' || host === 'docs.google.com') {
      const match = value.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || value.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://docs.google.com/uc?export=download&id=${match[1]}`;
      }
    }

    return parsed.toString();
  } catch (e) {
    return '';
  }
}

function updateLinkHelper(url) {
  const helper = document.getElementById('download-link-helper');
  if (!helper) return;

  const val = url.trim();
  if (!val) {
    helper.classList.add('hidden');
    helper.innerHTML = '';
    return;
  }

  helper.classList.remove('hidden');

  if (val.includes('dropbox.com') || val.includes('dl.dropboxusercontent.com')) {
    const directUrl = processDownloadLink(val);
    if (!directUrl) {
      helper.className = "mt-2 text-xs rounded-xl p-3 border transition-all duration-300 bg-red-950/20 text-red-300 border-red-800/30";
      helper.innerHTML = `
        <div class="flex items-start gap-2 text-left">
          <i data-lucide="alert-circle" class="w-4 h-4 text-red-400 shrink-0 mt-0.5"></i>
          <div>
            <strong class="block font-bold">Dropbox admin/private link detected</strong>
            <span class="block opacity-80 mt-0.5">Use Dropbox's Copy Link button on the file. The link should start with https://www.dropbox.com/s/... or https://www.dropbox.com/scl/fi/...</span>
          </div>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }
    helper.className = "mt-2 text-xs rounded-xl p-3 border transition-all duration-300 bg-emerald-950/20 text-emerald-300 border-emerald-800/30";
    helper.innerHTML = `
      <div class="flex items-start gap-2 text-left">
        <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
        <div>
          <strong class="block font-bold">Dropbox direct link detected!</strong>
          <span class="block opacity-80 mt-0.5">Auto-converted to direct download. Ensure sharing is set to "Anyone with the link".</span>
          <code class="block font-mono text-[10px] bg-emerald-950/40 p-1.5 rounded mt-1.5 overflow-x-auto select-all break-all">${escapeHtml(directUrl)}</code>
        </div>
      </div>
    `;
  } else if (val.includes('drive.google.com') || val.includes('docs.google.com/uc')) {
    const directUrl = processDownloadLink(val);
    helper.className = "mt-2 text-xs rounded-xl p-3 border transition-all duration-300 bg-blue-950/20 text-blue-300 border-blue-800/30";
    helper.innerHTML = `
      <div class="flex items-start gap-2 text-left">
        <i data-lucide="check-circle" class="w-4 h-4 text-blue-400 shrink-0 mt-0.5"></i>
        <div>
          <strong class="block font-bold">Google Drive link detected!</strong>
          <span class="block opacity-80 mt-0.5">Auto-converted to direct download link:</span>
          <code class="block font-mono text-[10px] bg-blue-950/40 p-1.5 rounded mt-1.5 overflow-x-auto select-all break-all">${escapeHtml(directUrl)}</code>
        </div>
      </div>
    `;
  } else if (val.includes('mediafire.com')) {
    helper.className = "mt-2 text-xs rounded-xl p-3 border transition-all duration-300 bg-amber-950/20 text-amber-300 border-amber-800/30";
    helper.innerHTML = `
      <div class="flex items-start gap-2 text-left">
        <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-400 shrink-0 mt-0.5"></i>
        <div>
          <strong class="block font-bold">MediaFire link (Indirect)</strong>
          <span class="block opacity-80 mt-0.5">MediaFire doesn't support direct downloads. Users will see MediaFire's page. Use Dropbox or Firebase Storage instead.</span>
        </div>
      </div>
    `;
  } else if (val.includes('firebasestorage.googleapis.com')) {
    helper.className = "mt-2 text-xs rounded-xl p-3 border transition-all duration-300 bg-emerald-950/20 text-emerald-300 border-emerald-800/30";
    helper.innerHTML = `
      <div class="flex items-start gap-2 text-left">
        <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
        <div>
          <strong class="block font-bold">Firebase Storage — Direct download!</strong>
          <span class="block opacity-80 mt-0.5">100% direct link hosted in your project's storage bucket.</span>
        </div>
      </div>
    `;
  } else if (val.includes('github.com')) {
    helper.className = "mt-2 text-xs rounded-xl p-3 border transition-all duration-300 bg-slate-800/30 text-slate-300 border-slate-700/30";
    helper.innerHTML = `
      <div class="flex items-start gap-2 text-left">
        <i data-lucide="github" class="w-4 h-4 text-white shrink-0 mt-0.5"></i>
        <div>
          <strong class="block font-bold">GitHub link detected</strong>
          <span class="block opacity-80 mt-0.5">Ensure this points directly to a release asset for direct download.</span>
        </div>
      </div>
    `;
  } else {
    helper.className = "mt-2 text-xs rounded-xl p-3 border transition-all duration-300 bg-slate-800/20 text-slate-400 border-slate-700/30";
    helper.innerHTML = `
      <div class="flex items-start gap-2 text-left">
        <i data-lucide="link" class="w-4 h-4 text-slate-500 shrink-0 mt-0.5"></i>
        <div>
          <strong class="block font-bold">Generic URL</strong>
          <span class="block opacity-80 mt-0.5">Ensure this URL points directly to the file to avoid landing page redirects.</span>
        </div>
      </div>
    `;
  }

  if (window.lucide) lucide.createIcons();
}

// ═══════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Force dark mode
  document.documentElement.classList.add('dark');

  if (window.lucide) lucide.createIcons();

  // Real-time link conversion helper
  const downloadLinkInput = document.getElementById('app-download-link');
  if (downloadLinkInput) {
    downloadLinkInput.addEventListener('input', (e) => {
      updateLinkHelper(e.target.value);
    });
  }

  // Render empty changelog
  renderChangelogEntries();
});
