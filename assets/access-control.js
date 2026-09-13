// =========================================================
// ictfrom | FLP — SHARED ACCESS CONTROL MODULE
// =========================================================
// Include this on ANY page that needs to know:
//   - Is someone logged in? (if not, this sends them to the login page)
//   - Is this user an admin?
//   - Is a given lesson / episode unlocked for this user?
//
// HOW TO USE (put BOTH lines in <head> or right before </body>,
// this exact order, and set SITE_ROOT to the relative path back
// to the project root):
//
//   <script>window.SITE_ROOT = '../../';</script>
//   <script type="module" src="../../assets/access-control.js"></script>
//
// To disable the 10s idle auto-logout on a SPECIFIC page only
// (e.g. admin.html, where the admin may sit reading data without
// touching the mouse), set this BEFORE the access-control.js
// script tag:
//
//   <script>window.SITE_ROOT = ''; window.FLP_DISABLE_IDLE_LOGOUT = true;</script>
//   <script type="module" src="assets/access-control.js"></script>
//
// Then in your OWN script (must also be type="module" so it runs
// after this one), you can do:
//
//   const access = await window.FLP.getLessonAccess('lesson01');
//   // access.full        -> true if the whole lesson is unlocked
//   // access.episodes    -> { "01": true, "03": true, ... } per-episode unlocks
//   // access.isAdmin     -> true if this user is an admin (sees everything)
//
//   const url = await window.FLP.getVideoUrl('lesson01', '01');
//   // returns the YouTube URL string, or null if locked / not set.
//   // (Locked videos are NOT readable by a normal student — this is
//   // enforced by the Firebase Security Rules, not just hidden in the UI.)
// =========================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCagFTgiAReVNf8PxNppg01URkQRPoNw3A",
  authDomain: "ictfrom-free-learn-pack.firebaseapp.com",
  databaseURL: "https://ictfrom-free-learn-pack-default-rtdb.firebaseio.com",
  projectId: "ictfrom-free-learn-pack",
  storageBucket: "ictfrom-free-learn-pack.firebasestorage.app",
  messagingSenderId: "621015284854",
  appId: "1:621015284854:web:850148451720ff2529b357",
  measurementId: "G-7MPX23W72F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const ROOT = (typeof window.SITE_ROOT === 'string') ? window.SITE_ROOT : '';
const SPLASH_PAGE = ROOT + 'index.html';          // redirects further to the real login page
const REAL_LOGIN_PAGE = ROOT + 'index log.html';  // has a space in the filename, exactly as on disk

// Per-page opt-out for the idle auto-logout below.
// Set `window.FLP_DISABLE_IDLE_LOGOUT = true;` BEFORE this script
// loads (e.g. only inside admin.html) to keep this page's session
// alive without touching the behaviour of any other page.
const IDLE_LOGOUT_DISABLED = window.FLP_DISABLE_IDLE_LOGOUT === true;

let resolveReady;
const readyPromise = new Promise((res) => { resolveReady = res; });

// ---------------------------------------------------------
// 10-second idle auto-logout (same behaviour as the rest of the site)
// ---------------------------------------------------------
const IDLE_LIMIT_MS = 10 * 1000;
let idleTimer = null;

async function forceIdleLogout(){
  if (IDLE_LOGOUT_DISABLED) return;
  if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
  try { await signOut(auth); } catch (e) {}
  window.location.href = REAL_LOGIN_PAGE + '?expired=1';
}

function resetIdleTimer(){
  if (IDLE_LOGOUT_DISABLED) return;
  if (idleTimer) clearTimeout(idleTimer);
  if (auth.currentUser) {
    idleTimer = setTimeout(forceIdleLogout, IDLE_LIMIT_MS);
  }
}

if (!IDLE_LOGOUT_DISABLED) {
  ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'].forEach(evt => {
    window.addEventListener(evt, resetIdleTimer, { passive: true });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') resetIdleTimer();
  });
}

// ---------------------------------------------------------
// LOGIN GUARD — if nobody is signed in, leave immediately.
// ---------------------------------------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    resolveReady({ user: null, isAdmin: false });
    window.location.href = SPLASH_PAGE;
    return;
  }

  resetIdleTimer();

  let isAdmin = false;
  try {
    const adminSnap = await get(ref(db, 'admins/' + user.uid));
    isAdmin = adminSnap.exists() && adminSnap.val() === true;
  } catch (e) {
    isAdmin = false;
  }

  resolveReady({ user, isAdmin });
});

// ---------------------------------------------------------
// PUBLIC API
// ---------------------------------------------------------
window.FLP = {
  ready: readyPromise,
  auth,
  db,

  logout: async () => {
    try { await signOut(auth); } catch (e) {}
    window.location.href = SPLASH_PAGE;
  },

  // { full: bool, episodes: {ep: true, ...}, isAdmin: bool }
  getLessonAccess: async (lessonId) => {
    const { user, isAdmin } = await readyPromise;
    if (!user) return { full: false, episodes: {}, isAdmin: false };
    if (isAdmin) return { full: true, episodes: {}, isAdmin: true }; // admins preview everything
    try {
      const snap = await get(ref(db, `access/${user.uid}/${lessonId}`));
      const val = snap.exists() ? snap.val() : {};
      return { full: !!val.full, episodes: val.episodes || {}, isAdmin: false };
    } catch (e) {
      return { full: false, episodes: {}, isAdmin: false };
    }
  },

  // Returns the YouTube URL string, or null if locked / missing.
  // Locked videos are blocked at the Firebase Security Rules level,
  // so a student can't just "view source" to get the link.
  getVideoUrl: async (lessonId, ep) => {
    const { user } = await readyPromise;
    if (!user) return null;
    try {
      const snap = await get(ref(db, `lessonVideos/${lessonId}/${ep}`));
      return snap.exists() ? snap.val() : null;
    } catch (e) {
      return null;
    }
  }
};
