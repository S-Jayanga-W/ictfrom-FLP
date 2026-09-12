// =========================================================
// FLP STUDENT AUTO LOGOUT
// Admin pages are NEVER auto-logged out.
// =========================================================

import {
  getAuth,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const auth = getAuth();

// ---------------------------------------------------------
// ADMIN CHECK
// Admin page එකේ window.FLP_IS_ADMIN = true කරලා තියෙන්න ඕන.
// ---------------------------------------------------------
const IS_ADMIN = window.FLP_IS_ADMIN === true;

// Admin නම් කිසිම auto logout එකක් නැහැ
if (!IS_ADMIN) {

  const IDLE_LIMIT_MS = 10 * 1000; // 10 seconds
  let idleTimer = null;

  function clearIdleTimer() {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  }

  async function forceIdleLogout() {
    clearIdleTimer();

    try {
      await signOut(auth);
    } catch (e) {
      console.error("Auto logout error:", e);
    }

    window.location.href = "index log.html?expired=1";
  }

  function resetIdleTimer() {
    clearIdleTimer();

    if (auth.currentUser) {
      idleTimer = setTimeout(
        forceIdleLogout,
        IDLE_LIMIT_MS
      );
    }
  }

  // User activity
  const activityEvents = [
    "mousemove",
    "mousedown",
    "keydown",
    "scroll",
    "touchstart",
    "click"
  ];

  activityEvents.forEach(eventName => {
    window.addEventListener(
      eventName,
      resetIdleTimer,
      { passive: true }
    );
  });

  // Tab visible again
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      resetIdleTimer();
    }
  });

  // Firebase auth state
  onAuthStateChanged(auth, user => {
    if (user) {
      resetIdleTimer();
    } else {
      clearIdleTimer();
    }
  });
}
