// =========================================================
// ictfrom | FLP — SHARED ACCESS CONTROL MODULE
// =========================================================
//
// Handles:
//   - Login guard
//   - Admin detection
//   - Lesson / episode access
//   - YouTube video URL access
//   - Student idle auto-logout
//
// IMPORTANT:
//   - STUDENT pages  -> auto logout after 10 seconds
//   - ADMIN page     -> NEVER auto logout
//                       (manual Logout only)
//
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


// =========================================================
// FIREBASE CONFIG
// =========================================================

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


// =========================================================
// FIREBASE INITIALIZE
// =========================================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);


// =========================================================
// PATH / ROOT
// =========================================================

const ROOT =
  (typeof window.SITE_ROOT === "string")
    ? window.SITE_ROOT
    : "";

const SPLASH_PAGE = ROOT + "index.html";

const REAL_LOGIN_PAGE =
  ROOT + "index log.html";


// =========================================================
// ADMIN PAGE DETECTION
// =========================================================
//
// Your admin file is:
//     admin.html
//
// So this detects the page automatically.
//
// Example:
//     https://your-site.com/ictfrom-FLP/admin.html
//
// will return TRUE.
//
// =========================================================

const IS_ADMIN_PAGE =
  window.location.pathname
    .toLowerCase()
    .endsWith("/admin.html");


// =========================================================
// READY PROMISE
// =========================================================

let resolveReady;

const readyPromise =
  new Promise((res) => {
    resolveReady = res;
  });


// =========================================================
// STUDENT AUTO-LOGOUT
// =========================================================
//
// Student:
//     10 seconds without activity
//             ↓
//          logout
//
// Admin:
//     NO timer
//     NO auto logout
//
// =========================================================

const IDLE_LIMIT_MS = 10 * 1000; // 10 seconds

let idleTimer = null;


// ---------------------------------------------------------
// Clear timer
// ---------------------------------------------------------

function clearIdleTimer() {

  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }

}


// ---------------------------------------------------------
// Force logout
// ---------------------------------------------------------

async function forceIdleLogout() {

  // SECURITY:
// Never auto logout admin.

  if (IS_ADMIN_PAGE) {
    clearIdleTimer();
    return;
  }

  clearIdleTimer();

  try {
    await signOut(auth);
  } catch (e) {
    // Ignore logout errors
  }

  window.location.href =
    REAL_LOGIN_PAGE + "?expired=1";
}


// ---------------------------------------------------------
// Reset idle timer
// ---------------------------------------------------------

function resetIdleTimer() {

  // ADMIN = no idle timer
  if (IS_ADMIN_PAGE) {
    clearIdleTimer();
    return;
  }

  clearIdleTimer();

  if (auth.currentUser) {

    idleTimer =
      setTimeout(
        forceIdleLogout,
        IDLE_LIMIT_MS
      );

  }

}


// =========================================================
// USER ACTIVITY EVENTS
// =========================================================
//
// These reset the student's 10-second timer.
//
// =========================================================

const activityEvents = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click"
];

activityEvents.forEach((evt) => {

  window.addEventListener(
    evt,
    resetIdleTimer,
    { passive: true }
  );

});


// =========================================================
// TAB VISIBILITY
// =========================================================

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.visibilityState === "visible"
    ) {

      resetIdleTimer();

    }

  }
);


// =========================================================
// LOGIN GUARD + ADMIN CHECK
// =========================================================

onAuthStateChanged(
  auth,
  async (user) => {

    // -----------------------------------------------------
    // NOT LOGGED IN
    // -----------------------------------------------------

    if (!user) {

      clearIdleTimer();

      resolveReady({
        user: null,
        isAdmin: false
      });

      window.location.href =
        SPLASH_PAGE;

      return;
    }


    // -----------------------------------------------------
    // CHECK ADMIN STATUS
    // -----------------------------------------------------

    let isAdmin = false;

    try {

      const adminSnap =
        await get(
          ref(
            db,
            "admins/" + user.uid
          )
        );

      isAdmin =
        adminSnap.exists() &&
        adminSnap.val() === true;

    } catch (e) {

      isAdmin = false;

    }


    // -----------------------------------------------------
    // AUTO-LOGOUT TIMER
    // -----------------------------------------------------
    //
    // IMPORTANT:
    // Admin page -> NEVER start timer
    // Student page -> start 10 sec timer
    //

    if (IS_ADMIN_PAGE) {

      clearIdleTimer();

    } else {

      resetIdleTimer();

    }


    // -----------------------------------------------------
    // READY
    // -----------------------------------------------------

    resolveReady({
      user,
      isAdmin
    });

  }
);


// =========================================================
// PUBLIC API
// =========================================================

window.FLP = {

  ready: readyPromise,

  auth,

  db,


  // =======================================================
  // MANUAL LOGOUT
  // =======================================================
  //
  // This works for BOTH admin and students.
  //
  // Admin can still click the Logout button manually.
  //
  // =======================================================

  logout: async () => {

    clearIdleTimer();

    try {

      await signOut(auth);

    } catch (e) {}

    window.location.href =
      SPLASH_PAGE;

  },


  // =======================================================
  // GET LESSON ACCESS
  // =======================================================

  getLessonAccess: async (lessonId) => {

    const {
      user,
      isAdmin
    } = await readyPromise;


    if (!user) {

      return {
        full: false,
        episodes: {},
        isAdmin: false
      };

    }


    // Admin sees everything

    if (isAdmin) {

      return {
        full: true,
        episodes: {},
        isAdmin: true
      };

    }


    try {

      const snap =
        await get(
          ref(
            db,
            `access/${user.uid}/${lessonId}`
          )
        );

      const val =
        snap.exists()
          ? snap.val()
          : {};


      return {

        full: !!val.full,

        episodes:
          val.episodes || {},

        isAdmin: false

      };

    } catch (e) {

      return {

        full: false,

        episodes: {},

        isAdmin: false

      };

    }

  },


  // =======================================================
  // GET VIDEO URL
  // =======================================================

  getVideoUrl: async (lessonId, ep) => {

    const {
      user
    } = await readyPromise;


    if (!user) {

      return null;

    }


    try {

      const snap =
        await get(
          ref(
            db,
            `lessonVideos/${lessonId}/${ep}`
          )
        );


      return snap.exists()
        ? snap.val()
        : null;

    } catch (e) {

      return null;

    }

  }

};
