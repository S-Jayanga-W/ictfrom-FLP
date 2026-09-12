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
