```javascript
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
// =========================================================
// AUTO LOGOUT RULES
// =========================================================
//
// STUDENT PAGES:
//   10 seconds without activity
//              ↓
//          AUTO LOGOUT
//
// ADMIN PAGE:
//   admin.html
//              ↓
//       AUTO LOGOUT OFF
//              ↓
//       MANUAL LOGOUT ONLY
//
// =========================================================


import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from
  "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  get
} from
  "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";



// =========================================================
// FIREBASE CONFIG
// =========================================================

const firebaseConfig = {

  apiKey:
    "AIzaSyCagFTgiAReVNf8PxNppg01URkQRPoNw3A",

  authDomain:
    "ictfrom-free-learn-pack.firebaseapp.com",

  databaseURL:
    "https://ictfrom-free-learn-pack-default-rtdb.firebaseio.com",

  projectId:
    "ictfrom-free-learn-pack",

  storageBucket:
    "ictfrom-free-learn-pack.firebasestorage.app",

  messagingSenderId:
    "621015284854",

  appId:
    "1:621015284854:web:850148451720ff2529b357",

  measurementId:
    "G-7MPX23W72F"

};



// =========================================================
// FIREBASE INITIALIZE
// =========================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);



// =========================================================
// SITE ROOT
// =========================================================

const ROOT =
  typeof window.SITE_ROOT === "string"
    ? window.SITE_ROOT
    : "";



// =========================================================
// PAGE PATHS
// =========================================================

const SPLASH_PAGE =
  ROOT + "index.html";

const REAL_LOGIN_PAGE =
  ROOT + "index log.html";



// =========================================================
// CURRENT PAGE
// =========================================================

const CURRENT_PAGE =
  window.location.pathname
    .split("/")
    .pop()
    .toLowerCase();



// =========================================================
// ADMIN PAGE DETECTION
// =========================================================
//
// IMPORTANT:
//
// Your admin page must be:
//
//     admin.html
//
// Example:
//
//     https://your-site.com/admin.html
//
// =========================================================

const IS_ADMIN_PAGE =
  CURRENT_PAGE === "admin.html";



// =========================================================
// READY PROMISE
// =========================================================

let resolveReady;

const readyPromise =
  new Promise((resolve) => {

    resolveReady = resolve;

  });



// =========================================================
// STUDENT AUTO LOGOUT SETTINGS
// =========================================================
//
// 10 seconds = 10,000 milliseconds
//
// =========================================================

const IDLE_LIMIT_MS =
  10 * 1000;

let idleTimer = null;



// =========================================================
// CLEAR IDLE TIMER
// =========================================================

function clearIdleTimer() {

  if (idleTimer !== null) {

    clearTimeout(idleTimer);

    idleTimer = null;

  }

}



// =========================================================
// FORCE AUTO LOGOUT
// =========================================================
//
// This function is ONLY for student pages.
//
// admin.html will NEVER be automatically logged out.
//
// =========================================================

async function forceIdleLogout() {

  // =======================================================
  // SAFETY CHECK
  // =======================================================
  //
  // If this is admin.html, STOP immediately.
  //
  // =======================================================

  if (IS_ADMIN_PAGE) {

    clearIdleTimer();

    console.log(
      "FLP: Admin page detected - auto logout blocked."
    );

    return;

  }



  // =======================================================
  // STUDENT AUTO LOGOUT
  // =======================================================

  clearIdleTimer();



  try {

    await signOut(auth);

  } catch (error) {

    console.error(
      "FLP: Auto logout error:",
      error
    );

  }



  // =======================================================
  // REDIRECT TO LOGIN
  // =======================================================

  window.location.href =
    REAL_LOGIN_PAGE + "?expired=1";

}



// =========================================================
// RESET IDLE TIMER
// =========================================================
//
// STUDENT:
//   Restart 10 second timer.
//
// ADMIN:
//   Do NOTHING.
//
// =========================================================

function resetIdleTimer() {

  // =======================================================
  // ADMIN PAGE
  // =======================================================
  //
  // NEVER create an idle timer.
  //
  // =======================================================

  if (IS_ADMIN_PAGE) {

    clearIdleTimer();

    return;

  }



  // =======================================================
  // STUDENT PAGE
  // =======================================================

  clearIdleTimer();



  // No logged-in user = no timer

  if (!auth.currentUser) {

    return;

  }



  // =======================================================
  // START 10 SECOND TIMER
  // =======================================================

  idleTimer =
    setTimeout(
      forceIdleLogout,
      IDLE_LIMIT_MS
    );

}



// =========================================================
// USER ACTIVITY EVENTS
// =========================================================
//
// These events reset the student's timer.
//
// On admin.html they do nothing because
// resetIdleTimer() immediately returns.
//
// =========================================================

const activityEvents = [

  "mousemove",

  "mousedown",

  "keydown",

  "scroll",

  "touchstart",

  "click",

  "pointerdown"

];



activityEvents.forEach((eventName) => {

  window.addEventListener(
    eventName,
    resetIdleTimer,
    {
      passive: true
    }
  );

});



// =========================================================
// TAB VISIBILITY
// =========================================================

document.addEventListener(
  "visibilitychange",
  () => {

    // =====================================================
    // ADMIN PAGE
    // =====================================================
    //
    // Absolutely NO auto logout handling.
    //
    // =====================================================

    if (IS_ADMIN_PAGE) {

      clearIdleTimer();

      return;

    }



    // =====================================================
    // STUDENT PAGE
    // =====================================================

    if (
      document.visibilityState === "visible"
    ) {

      resetIdleTimer();

    }

  }
);



// =========================================================
// FIREBASE AUTH STATE
// =========================================================

onAuthStateChanged(
  auth,
  async (user) => {

    // =====================================================
    // USER NOT LOGGED IN
    // =====================================================

    if (!user) {

      clearIdleTimer();



      resolveReady({

        user: null,

        isAdmin: false

      });



      // Redirect only if necessary

      window.location.href =
        SPLASH_PAGE;



      return;

    }



    // =====================================================
    // CHECK ADMIN STATUS
    // =====================================================

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

    } catch (error) {

      console.error(
        "FLP: Admin check failed:",
        error
      );

      isAdmin = false;

    }



    // =====================================================
    // AUTO LOGOUT CONTROL
    // =====================================================
    //
    // admin.html
    //     ↓
    // NEVER start timer
    //
    // other pages
    //     ↓
    // start 10 second timer
    //
    // =====================================================

    if (IS_ADMIN_PAGE) {

      clearIdleTimer();



      console.log(
        "FLP: Admin page - auto logout DISABLED."
      );

    } else {

      resetIdleTimer();



      console.log(
        "FLP: Student page - 10 second auto logout ENABLED."
      );

    }



    // =====================================================
    // READY
    // =====================================================

    resolveReady({

      user: user,

      isAdmin: isAdmin

    });

  }
);



// =========================================================
// PUBLIC FLP API
// =========================================================

window.FLP = {

  // =======================================================
  // READY
  // =======================================================

  ready:
    readyPromise,



  // =======================================================
  // FIREBASE AUTH
  // =======================================================

  auth:
    auth,



  // =======================================================
  // FIREBASE DATABASE
  // =======================================================

  db:
    db,



  // =======================================================
  // ADMIN PAGE STATUS
  // =======================================================

  isAdminPage:
    IS_ADMIN_PAGE,



  // =======================================================
  // MANUAL LOGOUT
  // =======================================================
  //
  // This function is used by your Logout button.
  //
  // ADMIN:
  //   Manual logout works.
  //
  // STUDENT:
  //   Manual logout works.
  //
  // =======================================================

  logout:
    async () => {

      // Stop any idle timer

      clearIdleTimer();



      try {

        await signOut(auth);

      } catch (error) {

        console.error(
          "FLP: Manual logout error:",
          error
        );

      }



      // Go to splash page

      window.location.href =
        SPLASH_PAGE;

    },



  // =======================================================
  // GET LESSON ACCESS
  // =======================================================

  getLessonAccess:
    async (lessonId) => {

      const {
        user,
        isAdmin
      } =
        await readyPromise;



      // ===================================================
      // NO USER
      // ===================================================

      if (!user) {

        return {

          full: false,

          episodes: {},

          isAdmin: false

        };

      }



      // ===================================================
      // ADMIN
      // ===================================================
      //
      // Admin has full access.
      //
      // ===================================================

      if (isAdmin) {

        return {

          full: true,

          episodes: {},

          isAdmin: true

        };

      }



      // ===================================================
      // STUDENT
      // ===================================================

      try {

        const snap =
          await get(
            ref(
              db,
              `access/${user.uid}/${lessonId}`
            )
          );



        const value =
          snap.exists()
            ? snap.val()
            : {};



        return {

          full:
            !!value.full,

          episodes:
            value.episodes || {},

          isAdmin:
            false

        };

      } catch (error) {

        console.error(
          "FLP: Lesson access error:",
          error
        );



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

  getVideoUrl:
    async (lessonId, ep) => {

      const {
        user
      } =
        await readyPromise;



      // ===================================================
      // NO USER
      // ===================================================

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

      } catch (error) {

        console.error(
          "FLP: Video URL error:",
          error
        );



        return null;

      }

    }

};



// =========================================================
// DEBUG INFORMATION
// =========================================================
//
// Open browser Console (F12)
//
// On admin.html you should see:
//
//   Admin page: true
//   Auto logout: DISABLED
//
// On student pages:
//
//   Admin page: false
//   Auto logout: ENABLED (10 seconds)
//
// =========================================================

console.log(
  "=========================================="
);

console.log(
  "ictfrom | FLP Access Control Loaded"
);

console.log(
  "Current Page:",
  CURRENT_PAGE
);

console.log(
  "Admin Page:",
  IS_ADMIN_PAGE
);

console.log(
  "Auto Logout:",
  IS_ADMIN_PAGE
    ? "DISABLED"
    : "ENABLED - 10 seconds"
);

console.log(
  "=========================================="
);
```
