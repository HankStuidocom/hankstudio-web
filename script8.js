
  // ── APP CARD HTML ──
  function appCardHTML(app, compact = false) {
    const iconHTML = app.iconDataUrl
      ? `<img src="${app.iconDataUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:${compact?'12px':'16px'};">`
      : `<div style="width:100%;height:100%;background:${app.iconBg||'#05cd74'};display:flex;align-items:center;justify-content:center;font-size:${compact?'1.4rem':'1.8rem'};border-radius:${compact?'12px':'16px'};">${app.emoji||'📦'}</div>`;
    return iconHTML;
  }

  // ── EMPTY STATE ──
  function emptyState(icon, title, msg, btnLabel, btnTab) {
    return `<div class="bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
      <i data-lucide="${icon}" class="w-14 h-14 text-slate-300 mx-auto mb-4"></i>
      <h3 class="text-base font-bold text-slate-800">${title}</h3>
      <p class="text-xs text-slate-500 max-w-xs mx-auto mt-2">${msg}</p>
      ${btnLabel ? `<button onclick="openDeveloperModal()" class="mt-6 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm">${btnLabel}</button>` : ''}
    </div>`;
  }

  // ── PROFILE PAGE ──
  function renderProfileHTML() {
    if (!currentUser) {
      return `<div class="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">My Profile</h1>
        <div class="bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-12 text-center">
          <i data-lucide="user-x" class="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto mb-4"></i>
          <h3 class="text-base font-bold text-slate-800 dark:text-white">Not Logged In</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">You must log in to view your profile.</p>
          <button onclick="openAuthModal('login')" class="mt-6 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm">Log In</button>
        </div>
      </div>`;
    }

    const myApps = APPS_DATA.filter(a => a.authorUid === currentUser.uid);

    const appsHtml = myApps.length ? `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${myApps.map(app => `
      <div class="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all" onclick="openAppModal('${app.id}')">
        <div class="w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden shadow-sm">${appCardHTML(app)}</div>
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate">${escapeHtml(app.title)}</h3>
          <p class="text-xs text-slate-500">${escapeHtml(app.category)}</p>
        </div>
      </div>
    `).join('')}</div>` : `<p class="text-sm text-slate-400">You haven't uploaded any apps yet.</p>`;

    return `<div class="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <!-- Profile Header -->
      <div class="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem]">
        <div class="w-24 h-24 bg-brand text-white text-4xl font-extrabold flex items-center justify-center rounded-full shadow-lg">
          ${currentUser.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">${escapeHtml(currentUser.name)}</h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium">${escapeHtml(currentUser.email)}</p>
          <div class="mt-3 flex gap-2">
            ${myApps.length > 0 
              ? `<span class="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Developer</span>`
              : `<span class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Member</span>`
            }
          </div>
        </div>
      </div>

      <!-- My Apps -->
      <div>
        <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <i data-lucide="grid" class="w-5 h-5 text-brand"></i> Apps You Created
        </h2>
        ${appsHtml}
      </div>
    </div>`;
  }

  // ── HOME PAGE ──
  function renderHomeHTML() {
    const topTabs = ['For you', 'Top charts', 'Premium', 'Categories'];
    const topTabsHTML = topTabs.map((tab, i) => `
      <div class="px-4 py-3 whitespace-nowrap cursor-pointer text-[13px] font-medium ${i===0 ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
        ${tab}
      </div>
    `).join('');

    const pills = ['app', 'game', 'tools', 'new release'];
    const pillsHTML = pills.map(p => `
      <div class="px-4 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-[11px] font-medium cursor-pointer whitespace-nowrap hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        ${p}
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

    return \`
      <div class="max-w-2xl mx-auto pb-6">
        <!-- Top Scrollable Tabs -->
        <div class="flex overflow-x-auto hide-scrollbar border-b border-slate-200 dark:border-slate-800/50 -mx-4 px-4 sm:mx-0 sm:px-0 sticky top-0 bg-slate-50 dark:bg-slate-900 z-30 pt-1">
          \${topTabsHTML}
        </div>
        
        <!-- Filter Pills -->
        <div class="flex overflow-x-auto gap-2.5 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 mt-4 mb-4">
          \${pillsHTML}
        </div>

        <!-- Featured Banner -->
        <section class="mt-2 -mx-4 sm:mx-0">
          \${bannerHTML || emptyState('image', 'No Apps', 'Upload an app to see the banner.')}
        </section>

        <!-- Suggested List -->
        <section class="mt-6 px-1">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-[13px] font-medium text-slate-900 dark:text-white flex items-center gap-2">
              Sponsored <span class="text-[8px] text-slate-400">•</span> Suggested for You
            </h2>
            <i data-lucide="more-vertical" class="w-4 h-4 text-slate-500 cursor-pointer"></i>
          </div>
          <div class="flex flex-col">
            \${suggestedHTML || emptyState('list', 'No Apps', 'Upload apps to see suggestions.')}
          </div>
        </section>

        <!-- Horizontal Scroller -->
        <section class="mt-4 pt-5 border-t border-slate-200 dark:border-slate-800/50 px-1">
          <div class="flex items-center justify-between mb-4 cursor-pointer group">
            <h2 class="text-[15px] font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Fantasy setting games</h2>
            <i data-lucide="arrow-right" class="w-5 h-5 text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"></i>
          </div>
          <div class="flex overflow-x-auto gap-3.5 hide-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            \${gamesHTML}
          </div>
        </section>
      </div>
    \`;
  }

  // ── APPS PAGE ──
  function renderAppsHTML(filterFn) {
    const apps = filterFn ? APPS_DATA.filter(filterFn) : APPS_DATA;
    const html = apps.length ? apps.map(app => `
      <div onclick="openAppModal(${app.id})" class="bg-white border border-slate-150 rounded-3xl p-6 hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-all flex flex-col justify-between h-[300px]">
        <div>
          <div class="w-14 h-14 rounded-xl overflow-hidden shadow-sm mb-4">${appCardHTML(app)}</div>
          <h3 class="font-bold text-slate-900 text-sm mb-1 truncate">${escapeHtml(app.title)}</h3>
          <p class="text-xs text-slate-400 mb-2 font-medium">${escapeHtml(app.category)}</p>
          <p class="text-xs text-slate-500 line-clamp-3 leading-relaxed">${escapeHtml(app.description)}</p>
        </div>
        <button class="mt-4 w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-brand text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-colors">
          <i data-lucide="download" class="w-3 h-3"></i> View & Download
        </button>
      </div>`).join('') :
      emptyState('layout-grid','Coming Soon','Check back later for new app releases!');

    return `<div class="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div><h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">All Applications</h1>
      <p class="text-slate-500 text-xs sm:text-sm mt-1">Browse and download community-uploaded software.</p></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">${html}</div>
    </div>`;
  }

  function renderGamesHTML() {
    const apps = APPS_DATA.filter(a => a.category === 'Games');
    if (!apps.length) return `<div class="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div><h1 class="text-2xl font-bold text-slate-900 tracking-tight">Games</h1></div>
      ${emptyState('gamepad-2','Coming Soon','Check back later for new game releases!')}
    </div>`;
    return renderAppsHTML(a => a.category === 'Games').replace('All Applications','Games');
  }

  function renderToolsHTML() {
    const apps = APPS_DATA.filter(a => a.category === 'Utilities' || a.category === 'Developer Tools');
    if (!apps.length) return `<div class="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div><h1 class="text-2xl font-bold text-slate-900 tracking-tight">Utility Tools</h1></div>
      ${emptyState('wrench','Coming Soon','Check back later for new tool releases!')}
    </div>`;
    return renderAppsHTML(a => a.category === 'Utilities' || a.category === 'Developer Tools').replace('All Applications','Utility Tools');
  }

  function renderTopChartsHTML() {
    const html = APPS_DATA.length ? APPS_DATA.map((app, i) => `
      <div onclick="openAppModal(${app.id})" class="flex items-center gap-4 bg-white border border-slate-150 p-4 rounded-3xl cursor-pointer hover:shadow-md transition-all">
        <span class="text-xl font-extrabold text-slate-300 w-8 text-center">${i+1}</span>
        <div class="w-14 h-14 rounded-xl overflow-hidden shadow-sm flex-shrink-0">${appCardHTML(app)}</div>
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-slate-900 truncate text-sm">${escapeHtml(app.title)}</h3>
          <p class="text-xs text-slate-400">${escapeHtml(app.category)}</p>
        </div>
        <button class="bg-brand-bg hover:bg-emerald-100 text-brand px-4 py-2 rounded-xl text-xs font-bold transition-colors">View</button>
      </div>`).join('') :
      emptyState('bar-chart-2','No apps yet','Apps will appear here once uploaded.');

    return `<div class="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div><h1 class="text-2xl font-bold text-slate-900 tracking-tight">Top Charts</h1></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">${html}</div>
    </div>`;
  }

  function renderNewReleasesHTML() {
    const apps = [...APPS_DATA].reverse();
    const html = apps.length ? apps.map(app => `
      <div onclick="openAppModal(${app.id})" class="flex items-center gap-4 bg-white border border-slate-150 p-4 rounded-3xl cursor-pointer hover:shadow-md transition-all">
        <div class="w-14 h-14 rounded-xl overflow-hidden shadow-sm flex-shrink-0">${appCardHTML(app)}</div>
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-slate-900 truncate text-sm">${escapeHtml(app.title)}</h3>
          <p class="text-xs text-slate-400">${escapeHtml(app.category)}</p>
          <p class="text-xs text-slate-500 line-clamp-1 mt-0.5">${escapeHtml(app.description)}</p>
        </div>
        <span class="text-[10px] font-bold bg-emerald-50 text-brand px-2 py-1 rounded-lg">NEW</span>
      </div>`).join('') :
      emptyState('clock','No releases yet','Check back after developers upload apps.');

    return `<div class="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div><h1 class="text-2xl font-bold text-slate-900 tracking-tight">New Releases</h1></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">${html}</div>
    </div>`;
  }
