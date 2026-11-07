// =========================================================
// home-custom.js — Home.html ekata admin panel eken add karana
// lessons / EPs load karanawa. Home.html eke thiyena code ekata
// kisima wenaskamak karanna epa. Eka line ekak add karanna witharai.
// Place: assets/home-custom.js
// =========================================================
(function(){
  const FB = "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lockCache = new Map();

  async function flp(){
    while (!window.FLP) await new Promise(r => setTimeout(r, 50));
    return window.FLP;
  }

  async function isLocked(id){
    if (lockCache.has(id)) return lockCache.get(id);
    const F = await flp();
    const v = await F.isLessonLocked(id);
    lockCache.set(id, v);
    return v;
  }

  // Lock guard for admin-created lesson cards. Registered BEFORE the
  // original guard (classic scripts run before module scripts), so it
  // handles these cards and stops the event there.
  document.addEventListener('click', async (e) => {
    const a = e.target.closest('.video-grid > a[data-lesson-id]');
    if (!a) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const F = await flp();
    const { isAdmin } = await F.ready;
    if (!isAdmin && await isLocked(a.dataset.lessonId)){
      document.getElementById('lockModalOverlay').classList.add('show');
    } else {
      window.location.href = a.getAttribute('href');
    }
  }, true);

  // Search box: also filter the cards created by this script.
  const si = document.getElementById('siteSearch');
  if (si){
    si.addEventListener('input', () => {
      const q = si.value.trim().toLowerCase();
      document.querySelectorAll('.video-card').forEach(card => {
        const s = ((card.querySelector('.video-title')?.textContent || '') + ' ' +
                   (card.querySelector('.video-topic')?.textContent || '') + ' ' +
                   (card.getAttribute('data-tags') || '')).toLowerCase();
        const link = card.closest('a');
        if (link) link.style.display = (!q || s.includes(q)) ? '' : 'none';
      });
    });
  }

  async function init(){
    await window.episodeIndexReady;           // Home.html's own index build
    const F = await flp();
    const { user, isAdmin } = await F.ready;
    if (!user) return;

    const { ref, get } = await import(FB);
    const [lSnap, eSnap] = await Promise.all([
      get(ref(F.db, 'customLessons')),
      get(ref(F.db, 'customEpisodes'))
    ]);
    const customL = lSnap.exists() ? lSnap.val() : {};
    const customE = eSnap.exists() ? eSnap.val() : {};
    const grid = document.querySelector('.video-grid');

    // existing lessons (from data.js) ...
    const lessons = {};
    for (const [folder, id] of Object.entries(window.LESSON_ID_BY_FOLDER || {})){
      const eps = episodesIndex.filter(e => e.url.startsWith(folder));
      lessons[id] = {
        lesson: eps.length ? eps[0].lesson : id,
        unit: eps.length ? eps[0].unit : '',
        base: folder + 'index.html',
        eps: new Set(eps.map(e => Number(e.ep))),
        custom: false
      };
    }
    // ... plus lessons created in admin.html
    for (const [id, l] of Object.entries(customL)){
      if (!lessons[id]){
        lessons[id] = {
          lesson: l.lesson, unit: l.unit || '',
          base: 'lesson.html?id=' + encodeURIComponent(id),
          eps: new Set(), custom: true
        };
      }
    }

    for (const [id, L] of Object.entries(lessons)){
      // admin-added EPs -> search index + counts
      for (const [ep, v] of Object.entries(customE[id] || {})){
        if (L.eps.has(Number(ep))) continue;
        L.eps.add(Number(ep));
        episodesIndex.push({
          lesson: L.lesson, ep, title: v.title, unit: L.unit, tags: '', thumb: '',
          url: L.base + '#ep=' + ep
        });
      }
      const n = String(L.eps.size).padStart(2, '0');

      if (!L.custom){
        const a = [...grid.querySelectorAll(':scope > a')].find(x => x.getAttribute('href') === L.base);
        if (a){
          const d = a.querySelector('.duration'); if (d) d.textContent = n + ' VID';
          const t = a.querySelector('.video-topic'); if (t) t.textContent = `${L.lesson} | ${n} Videos`;
        }
        continue;
      }

      // new lesson card
      const a = document.createElement('a');
      a.href = L.base;
      a.dataset.lessonId = id;
      a.innerHTML = `
        <div class="video-card reveal in" data-tags="${esc(id + ' ' + L.lesson + ' ' + L.unit)}">
          <div class="thumb">
            <span class="ep-tag">${esc(L.lesson)}</span>
            <div class="play">▶</div>
            <span class="duration">${n} VID</span>
          </div>
          <div class="video-body">
            <span class="video-topic">${esc(L.lesson)} | ${n} Videos</span>
            <div class="video-title">${esc(L.unit || L.lesson)}</div>
            <div class="video-meta">© ictfromabc | Ravidu.Bandaranayake</div>
          </div>
        </div>`;
      grid.appendChild(a);

      // locked look (students only)
      if (!isAdmin && await isLocked(id)){
        const card = a.querySelector('.video-card');
        card.classList.add('is-locked');
        const badge = document.createElement('span');
        badge.className = 'locked-badge';
        badge.textContent = '🔒 LOCKED';
        card.querySelector('.thumb').appendChild(badge);
      }
    }
  }

  init().catch(err => console.warn('home-custom.js failed', err));
})();
