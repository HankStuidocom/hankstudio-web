
  // ── APP MODAL ──
  async function openAppModal(appId) {
    const app = APPS_DATA.find(a => a.id === appId);
    if (!app) return;
    selectedApp = app;

    document.getElementById('modal-app-title').textContent = app.title;
    document.getElementById('modal-app-meta').textContent = app.category;
    document.getElementById('modal-app-rating').textContent = '5.0';
    document.getElementById('modal-app-desc').textContent = app.description;
    document.getElementById('modal-app-info').textContent = app.appInfo || 'No additional info provided.';

    const iconEl = document.getElementById('modal-app-icon');
    iconEl.innerHTML = appCardHTML(app);

    const dlBtn = document.getElementById('modal-download-btn');
    
    if (app.downloadLink) {
      dlBtn.onclick = () => {
        window.open(app.downloadLink, '_blank');
      };
      dlBtn.textContent = `⬇ Download ${app.title}`;
      dlBtn.disabled = false;
      dlBtn.style.opacity = '1';
    } else {
      dlBtn.textContent = '⬇ Download Unavailable';
      dlBtn.disabled = true;
      dlBtn.style.opacity = '0.5';
    }

    const ssContainer = document.getElementById('modal-screenshots-container');
    const ssGallery = document.getElementById('modal-screenshots');
    if (app.screenshots && app.screenshots.length > 0) {
      ssContainer.classList.remove('hidden');
      ssGallery.innerHTML = app.screenshots.map(s => `<img src="${escapeHtml(s)}" class="h-32 md:h-48 rounded-xl object-cover shadow-sm snap-center flex-shrink-0 border border-slate-800" onerror="this.style.display='none'">`).join('');
    } else {
      ssContainer.classList.add('hidden');
      ssGallery.innerHTML = '';
    }

    fetchReviews(app.id);

    document.getElementById('app-detail-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    loadAIGuide(app);
  }

  function closeAppModal() {
    document.getElementById('app-detail-modal').classList.add('hidden');
    document.body.style.overflow = '';
    selectedApp = null;
  }

  function downloadSelectedApp() {}

  // ── REVIEWS LOGIC ──
  let currentReviewRating = 0;
  function setReviewRating(rating) {
    currentReviewRating = rating;
    const stars = document.getElementById('review-star-selector').children;
    for(let i=0; i<5; i++) {
      if(i < rating) {
        stars[i].classList.replace('text-slate-600', 'text-amber-400');
        stars[i].classList.replace('hover:text-amber-400', 'text-amber-400');
      } else {
        stars[i].classList.replace('text-amber-400', 'text-slate-600');
        stars[i].classList.replace('text-amber-400', 'hover:text-amber-400');
      }
    }
  }

  async function fetchReviews(appId) {
    const listEl = document.getElementById('modal-reviews-list');
    listEl.innerHTML = '<p class="text-xs text-slate-500">Loading reviews...</p>';
    document.getElementById('review-auth-msg').classList.toggle('hidden', !!currentUser);
    document.getElementById('review-text').disabled = !currentUser;
    document.getElementById('review-text').value = '';
    setReviewRating(0);

    try {
      const { collection, query, orderBy, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js");
      const q = query(collection(window.firebaseDb, \`apps/\${appId}/reviews\`), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      
      let sum = 0, count = 0;
      let html = '';
      snap.forEach(doc => {
        const r = doc.data();
        sum += r.rating;
        count++;
        html += \`<div class="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-bold text-slate-300">\${escapeHtml(r.userName)}</span>
            <div class="flex gap-0.5">\${'<i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i>'.repeat(r.rating)}</div>
          </div>
          <p class="text-[10px] sm:text-xs text-slate-400">\${escapeHtml(r.comment)}</p>
        </div>\`;
      });

      if (count > 0) {
        listEl.innerHTML = html;
        document.getElementById('modal-app-rating').textContent = (sum/count).toFixed(1);
      } else {
        listEl.innerHTML = '<p class="text-xs text-slate-500">No reviews yet. Be the first!</p>';
        document.getElementById('modal-app-rating').textContent = '5.0';
      }
      lucide.createIcons();
    } catch (err) {
      listEl.innerHTML = '<p class="text-xs text-red-500">Failed to load reviews.</p>';
      console.error(err);
    }
  }

  async function submitReview() {
    if (!selectedApp) return;
    if (!currentUser) return alert('You must log in to leave a review.');
    if (currentReviewRating === 0) return alert('Please select a star rating.');
    const text = document.getElementById('review-text').value.trim();
    if (!text) return alert('Please write a short review.');

    const btn = event.target;
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    try {
      const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js");
      await addDoc(collection(window.firebaseDb, \`apps/\${selectedApp.id}/reviews\`), {
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
  }

  async function loadAIGuide(app) {
    const box = document.getElementById('modal-guide-content');
    box.innerHTML = `<div class="flex items-center gap-2 text-slate-400 text-xs animate-pulse"><i data-lucide="loader" class="w-4 h-4 animate-spin text-brand"></i> Generating AI guide for ${escapeHtml(app.title)}...</div>`;
    lucide.createIcons();
    const prompt = `Write a quick-start guide for the app "${app.title}" (${app.category}). Include 3 key tips and what makes it useful. Description: ${app.description}`;
    try {
      const result = await callGemini(prompt, 'You are a helpful software assistant. Write short, practical quick-start guides.');
      currentGuideText = result;
      box.innerHTML = formatText(result);
    } catch(e) {
      box.innerHTML = `<p class="text-slate-400 text-xs">AI guide unavailable. Add a Gemini API key in the chat settings to enable AI features.</p>`;
    }
  }

  function regenerateGuide() { if (selectedApp) loadAIGuide(selectedApp); }

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
