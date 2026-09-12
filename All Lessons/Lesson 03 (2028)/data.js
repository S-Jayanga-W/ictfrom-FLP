// =========================================================
// SINGLE SOURCE OF TRUTH for Lesson 01's PUBLIC catalog data
// (title / tags / duration / thumbnail). Both this lesson's
// own script.js AND the site-wide Home.html search read from
// this ONE file. Edit episodes ONLY here — never re-type them
// anywhere else.
//
// IMPORTANT: There is NO "youtube" field here anymore on
// purpose. The real video links now live in Firebase under
// lessonsSecure/lesson01/episodes/{ep}/youtube, and Firebase
// Security Rules only allow reading that path for a student
// whose payments/{uid}/lesson01 is true. That is what actually
// enforces the paywall — putting the link back in this file
// would defeat it, since anyone can view-source a static file.
// See assets/flp-shared.js + firebase-rules.json.
// =========================================================
window.CURRENT_LESSON = {
  lesson: "Lesson 01",
  lessonId: "lesson01",
  unit: "UNIT 01 — BASIC CONCEPTS OF ICT",
  episodes: [
    { ep:"01", unit:"UNIT 01 — BASIC CONCEPTS OF ICT |26.03.03", title:"P1 | Basic Concepts of ICT ", tags:"| Data & Information | Data Processing | Classification Of Data & Information | Charcteristics Of Usefull Information | ", duration:"02:01:14", thumb:"thumbnails/lesson01-thumbnail1.png" },
    { ep:"02", unit:"UNIT 01 — BASIC CONCEPTS OF ICT |26.03.10", title:"P2 | Basic Concepts of ICT ", tags:"| Golden Rule Of Information | Big Data | Life Cycle Of Data | ", duration:"14:20", thumb:"thumbnails/lesson01-thumbnail2.png" },
  
  ]
};
