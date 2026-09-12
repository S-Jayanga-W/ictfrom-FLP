// NOTE ON THUMBNAIL PATHS:
// Browsers block loading images directly from a local drive path like
// "D:\folder\image.png" for security reasons. Put your thumbnail images in a
// folder called "thumbnails" right next to this index.html file, and
// reference them with a RELATIVE path like "thumbnails/lesson01.png".
//
// NOTE ON LOCK/UNLOCK:
// This file no longer stores YouTube links itself. Whether an episode
// plays or shows a lock icon depends on window.FLP.getLessonAccess()
// (see assets/access-control.js), which checks the Firebase Database
// for what this logged-in student has been unlocked for by an admin.
//
// NOTE ON EPISODE DATA:
// The episode list itself lives in "data.js" (loaded before this file
// in index.html) as the single source of truth — Home.html's site-wide
// search reads the SAME data.js file, so editing an episode here means
// editing it ONLY in data.js. Never re-add episodes below.
const LESSON = window.CURRENT_LESSON;
const episodes = LESSON.episodes;
const LESSON_ID = LESSON.lessonId;

const playIcon = `<svg viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>`;
const lockIcon = `<svg viewBox="0 0 24 24" fill="white"><path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-9h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM8.9 6a3.1 3.1 0 0 1 6.2 0v2H8.9V6z"/></svg>`;

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

async function init(){
  // Ask the shared access-control module whether THIS logged-in
  // student has this lesson unlocked (fully, or episode-by-episode).
  const access = await window.FLP.getLessonAccess(LESSON_ID);

  episodes.forEach((e, i) => {
    const unlocked = access.full || !!access.episodes[e.ep];

    const card = document.createElement('div');
    card.className = 'card' + (unlocked ? '' : ' locked');
    card.id = 'ep-' + e.ep; // lets Home page search jump straight to this episode via #ep=01 etc.
    card.style.animationDelay = (i * 0.08) + 's';

    card.innerHTML = `
      <div class="ep-tag">EP ${e.ep}</div>
      <div class="thumb" data-idx="${i}">
        <button class="play-btn" title="${unlocked ? 'Watch on YouTube' : 'Locked — contact admin'}">${unlocked ? playIcon : lockIcon}</button>
        <span class="duration">${e.duration}</span>
        ${unlocked ? '' : '<div class="lock-badge">🔒 Locked</div>'}
      </div>
      <div class="body">
        <div class="unit">${e.unit}</div>
        <div class="title">${e.title}</div>
        <div class="tags">${e.tags}</div>
      </div>
    `;
    grid.appendChild(card);

    const thumb = card.querySelector('.thumb');
    const btn = card.querySelector('.play-btn');

    // Try to load the thumbnail image. If it fails (missing file), fall back
    // to the diagonal-stripe placeholder pattern instead of a broken image.
    if (e.thumb) {
      const probe = new Image();
      probe.onload = () => { thumb.style.backgroundImage = `url('${e.thumb}')`; };
      probe.onerror = () => { thumb.classList.add('no-thumb'); };
      probe.src = e.thumb;
    } else {
      thumb.classList.add('no-thumb');
    }

    // Click anywhere on the thumbnail (or the play button):
    //  - if unlocked, fetch the real link from Firebase and open it
    //  - if locked, tell the student instead of opening anything
    async function goToYouTube(){
      if (!unlocked) {
        alert('🔒 මෙම විඩියෝව තවම Lock වී ඇත.\nUnlock කරගැනීමට admin ව සම්බන්ධ කරගන්න.');
        return;
      }
      const link = await window.FLP.getVideoUrl(LESSON_ID, e.ep);
      const videoId = extractYouTubeId(link);
      const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : link;
      if (!watchUrl) {
        alert('No valid YouTube link set for this episode yet.');
        return;
      }
      window.open(watchUrl, '_blank', 'noopener');
    }

    thumb.addEventListener('click', goToYouTube);
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      goToYouTube();
    });
  });

  jumpToEpisodeFromHash();
}

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

init();
