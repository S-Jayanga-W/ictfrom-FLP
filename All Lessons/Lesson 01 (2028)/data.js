// =========================================================
// SINGLE SOURCE OF TRUTH for Lesson 01 episode data.
// Both this lesson's own script.js AND the site-wide Home.html
// search read from this ONE file. Edit episodes ONLY here —
// never re-type them anywhere else.
//
// NOTE — YOUTUBE LINKS MOVED TO FIREBASE:
// The actual YouTube URL for each episode is NO LONGER stored
// here. It now lives in the Firebase Realtime Database under
//   lessonVideos/<lessonId>/<ep>
// and is only readable by a student once an admin unlocks that
// lesson/episode for them (see admin.html + firebase-rules.json).
// This "lessonId" below is the key used for that lookup — keep
// it unique per lesson and don't change it after students have
// been given access, or their unlocks will stop matching.
// =========================================================
window.CURRENT_LESSON = {
  lessonId: "lesson01",
  lesson: "Lesson 01",
  unit: "UNIT 01 — BASIC CONCEPTS OF ICT",
  episodes: [
    { ep:"01", unit:"UNIT 01 — BASIC CONCEPTS OF ICT |26.03.03", title:"P1 | Basic Concepts of ICT ", tags:"| Data & Information | Data Processing | Classification Of Data & Information | Charcteristics Of Usefull Information | ", duration:"02:01:14", thumb:"thumbnails/lesson01-thumbnail1.png" },
    { ep:"02", unit:"UNIT 01 — BASIC CONCEPTS OF ICT |26.03.10", title:"P2 | Basic Concepts of ICT ", tags:"| Golden Rule Of Information | Big Data | Life Cycle Of Data | ", duration:"14:20", thumb:"thumbnails/lesson01-thumbnail2.png" },
    { ep:"03", unit:"UNIT 01 — BASIC CONCEPTS OF ICT |26.03.17", title:"P3 | Basic Concepts of ICT ", tags:"out put", duration:"14:20", thumb:"thumbnails/lesson01-thumbnail3.png" },
    { ep:"04", unit:"UNIT 01 — BASIC CONCEPTS OF ICT |26.03.24", title:"P4 | Basic Concepts of ICT ", tags:"Hardware · Software · Basics", duration:"14:20", thumb:"thumbnails/lesson01-thumbnail4.png" },
    { ep:"05", unit:"UNIT 01 — BASIC CONCEPTS OF ICT |26.03.31", title:"P5 | Basic Concepts of ICT ", tags:"Hardware · Software · Basics", duration:"14:20", thumb:"thumbnails/lesson01-thumbnail5.png" },
    { ep:"06", unit:"UNIT 01 — BASIC CONCEPTS OF ICT |26.04.07", title:"P6 | Basic Concepts of ICT ", tags:"Hardware · Software · Basics", duration:"14:20", thumb:"thumbnails/lesson01-thumbnail6.png" },
    { ep:"07", unit:"UNIT 01 — BASIC CONCEPTS OF ICT |26.04.21", title:"P7 | Basic Concepts of ICT ", tags:"Hardware · Software · Basics", duration:"14:20", thumb:"thumbnails/lesson01-thumbnail7C.png" },
    { ep:"08", unit:"UNIT 01 — BASIC CONCEPTS OF ICT |26.04.28", title:"P8 | Basic Concepts of ICT ", tags:"Hardware · Software · Basics", duration:"14:20", thumb:"thumbnails/lesson01-thumbnail8.png" },
    { ep:"09", unit:"UNIT 01 — BASIC CONCEPTS OF ICT |26.05.05", title:"P9 | Basic Concepts of ICT ", tags:"Hardware · Software · Basics", duration:"14:20", thumb:"thumbnails/lesson01-thumbnail7C.png" },
    { ep:"10", unit:"UNIT 01 — BASIC CONCEPTS OF ICT |26.05.12", title:"P10 | Basic Concepts of ICT ", tags:"Hardware · Software · Basics", duration:"14:20", thumb:"thumbnails/lesson01-thumbnail7C.png" }
  ]
};
