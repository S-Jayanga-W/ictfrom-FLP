// =========================================================
// SINGLE SOURCE OF TRUTH for Lesson 02 episode data.
// Both this lesson's own script.js AND the site-wide Home.html
// search read from this ONE file. Edit episodes ONLY here —
// never re-type them anywhere else.
//
// NOTE — YOUTUBE LINKS LIVE IN FIREBASE, NOT HERE:
// See lessonVideos/<lessonId>/<ep> in the Firebase Realtime
// Database (managed from admin.html). A student only receives
// the real link once an admin unlocks it for them.
// =========================================================
window.CURRENT_LESSON = {
  lessonId: "lesson02",
  lesson: "Lesson 02",
  unit: "UNIT 02 — EVOLUTION OF COMPUTING",
  episodes: [
    { ep:"01", unit:"UNIT 02 — Evolution Of Computing", title:"P1 | Evolution Of Computing ", tags:"Data VS Information", duration:"14:20", thumb:"thumbnails/lesson02-thumbnail1.png" },
    { ep:"02", unit:"UNIT 02 — Evolution Of Computing", title:"P2 | Evolution Of Computing ", tags:"Data VS Information", duration:"14:20", thumb:"thumbnails/lesson02-thumbnail1.png" },
    { ep:"03", unit:"UNIT 02 — Evolution Of Computing", title:"P3 | Evolution Of Computing ", tags:"Data VS Information", duration:"14:20", thumb:"thumbnails/lesson02-thumbnail1.png" }
  ]
};
