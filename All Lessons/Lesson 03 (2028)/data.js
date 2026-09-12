// =========================================================
// SINGLE SOURCE OF TRUTH for Lesson 03 episode data.
// Both this lesson's own script.js AND the site-wide Home.html
// search read from this ONE file.
//
// NOTE — YOUTUBE LINKS LIVE IN FIREBASE, NOT HERE:
// See lessonVideos/<lessonId>/<ep> in the Firebase Realtime
// Database (managed from admin.html).
// =========================================================
window.CURRENT_LESSON = {
  lessonId: "lesson03",
  lesson: "Lesson 03",
  unit: "UNIT 03 — NUMBER SYSTEM",
  episodes: [
    { ep:"01", unit:"UNIT 03 — Number System", title:"P1 | Number System ", tags:"binary · decimal · hexadecimal", duration:"14:20", thumb:"thumbnails/lesson03-thumbnail1.png" },
    { ep:"02", unit:"UNIT 03 — Number System", title:"P2 | Number System ", tags:"binary · decimal · hexadecimal", duration:"14:20", thumb:"thumbnails/lesson03-thumbnail2.png" }
  ]
};
