// NOTE ON THUMBNAIL PATHS:
// Browsers block loading images directly from a local drive path like
// "D:\folder\image.png" for security reasons. Put your thumbnail images in a
// folder called "thumbnails" right next to this index.html file, and
// reference them with a RELATIVE path like "thumbnails/lesson01.png".
//
// NOTE ON "youtube" FIELD:
// Paste either the full YouTube URL or just the video ID. Both work:
//   youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
//   youtube: "https://youtu.be/dQw4w9WgXcQ"
//   youtube: "dQw4w9WgXcQ"
const episodes = [
  { ep:"01", unit:"UNIT 02 — Evolution Of Computing", title:"P1 | Evolution Of Computing ", tags:"· Data VS Information ", duration:"14:20", thumb:"thumbnails/lesson02-thumbnail1.png", youtube:"..............................................." },









];

const playIcon = `<svg viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>`;

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

episodes.forEach((e, i) => {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.animationDelay = (i * 0.08) + 's';

  const videoId = extractYouTubeId(e.youtube);
  const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;

  card.innerHTML = `
    <div class="ep-tag">EP ${e.ep}</div>
    <div class="thumb" data-idx="${i}">
      <button class="play-btn" title="Watch on YouTube">${playIcon}</button>
      <span class="duration">${e.duration}</span>
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

  // Click anywhere on the thumbnail (or the play button) opens the video
  // in a new YouTube tab -- no embedding, so no "Error 153" config issue.
  function goToYouTube(){
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
