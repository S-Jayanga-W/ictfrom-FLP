// NOTE ON THUMBNAIL PATHS:
// Browsers block loading images directly from a local drive path like
// "D:\folder\image.png" for security reasons. Put your thumbnail images in a
// folder called "thumbnails" right next to this index.html file, and
// reference them with a RELATIVE path like "thumbnails/lesson01.png".
//
// NOTE ON EPISODE DATA:
// The episode CATALOG (title/tags/duration/thumb) lives in "data.js"
// (loaded before this file in index.html) as the single source of
// truth — Home.html's site-wide search reads the SAME data.js file.
// The REAL youtube link is NOT in data.js anymore — it is fetched
// from Firebase (only for students who have paid) by the inline
// <script type="module"> block in index.html, which then calls
// window.renderLessonGrid(episodes, paid) below.

const playIcon = `<svg viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>`;
const lockIcon = `<svg viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9h-1V6a5 5 0 00-10 0v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zm-7-2V6a3 3 0 016 0v2H9z"/></svg>`;

const grid = document.getElementById('grid');

// Pulls the 11-character video ID out of any common YouTube URL format,
// or just returns the string as-is if it's already a bare ID.
function extractYouTubeId(input){
  if (!input) return null;
  const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  if (match) return match[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(input.trim())) return input.trim();
  return null;
}

// Called by the module script in index.html once it knows (a) whether
// this student has paid for this lesson, and (b) if so, the real
// youtube links merged onto each episode object.
window.renderLessonGrid = function(episodes, lessonPaid){
  grid.innerHTML = '';

  episodes.forEach((e, i) => {
    const card = document.createElement('div');
    card.className = 'card' + (lessonPaid ? '' : ' locked');
    card.id = 'ep-' + e.ep; // lets Home page search jump straight to this episode via #ep=01 etc.
    card.style.animationDelay = (i * 0.08) + 's';

    const videoId = lessonPaid ? extractYouTubeId(e.youtube) : null;
    const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;

    card.innerHTML = `
      <div class="ep-tag">EP ${e.ep}</div>
      <div class="thumb" data-idx="${i}">
        <button class="play-btn" title="${lessonPaid ? 'Watch on YouTube' : 'Locked — pay to unlock'}">${lessonPaid ? playIcon : lockIcon}</button>
        ${lessonPaid ? `<span class="duration">${e.duration}</span>` : `<span class="duration">🔒 Locked</span>`}
      </div>
      <div class="body">
        <div class="unit">${e.unit}</div>
        <div class="title">${e.title}</div>
        <div class="tags">${lessonPaid ? e.tags : 'Meka balanna nam lesson eka pay karanna ඕන 🔒'}</div>
      </div>
    `;
    grid.appendChild(card);

    const thumb = card.querySelector('.thumb');
    const btn = card.querySelector('.play-btn');

    // Try to load the thumbnail image ONLY when paid — unpaid cards show the
    // grey placeholder instead, so the locked state is obvious at a glance.
    if (lessonPaid && e.thumb) {
      const probe = new Image();
      probe.onload = () => { thumb.style.backgroundImage = `url('${e.thumb}')`; };
      probe.onerror = () => { thumb.classList.add('no-thumb'); };
      probe.src = e.thumb;
    } else {
      thumb.classList.add('no-thumb');
    }

    // Click anywhere on the thumbnail (or the play button):
    //  - if unlocked, opens the video in a new YouTube tab.
    //  - if locked, explains why instead of doing nothing silently.
    function handleClick(){
      if (!lessonPaid) {
        alert('🔒 Mema lesson eka balanna nam class fee eka pay karanna ඕන.\nPay karapu passe, admin eka approve kalaama automatic ව unlock වෙනවා.');
        return;
      }
      if (!watchUrl) {
        alert('No valid YouTube link set for this episode yet.');
        return;
      }
      window.open(watchUrl, '_blank', 'noopener');
    }

    thumb.addEventListener('click', handleClick);
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      handleClick();
    });
  });

  jumpToEpisodeFromHash();
};

// =========================================================
// JUMP TO A SPECIFIC EPISODE WHEN OPENED FROM HOME PAGE SEARCH
// Home page search links here like:  index.html#ep=03
// This scrolls to that episode's card, adds a "🔎 Search Match"
// badge, and dims every OTHER card so the matched one clearly
// stands out from the rest of the grid.
// =========================================================
function jumpToEpisodeFromHash(){
  const match = window.location.hash.match(/ep=(\d+)/);
  if (!match) return;

  const epNum = match[1].padStart(2, '0');
  const targetCard = document.getElementById('ep-' + epNum);
  if (!targetCard) return;

  const allCards = Array.from(document.querySelectorAll('.card'));

  // Wait a moment so the cards' entrance animation has already run.
  setTimeout(() => {
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    targetCard.classList.add('highlight');

    // Dim every other card so the matched one pops out visually.
    allCards.forEach(c => {
      if (c !== targetCard) c.classList.add('dimmed');
    });

    // Add a small "found via search" badge on top of the matched card.
    const badge = document.createElement('div');
    badge.className = 'match-badge';
    badge.textContent = '🔎 Search Match';
    targetCard.appendChild(badge);

    // Let the user find it, then fade the whole effect back to normal.
    setTimeout(() => {
      targetCard.classList.remove('highlight');
      allCards.forEach(c => c.classList.remove('dimmed'));
      badge.classList.add('fade-out');
      setTimeout(() => badge.remove(), 500);
    }, 3800);
  }, 300);
}
