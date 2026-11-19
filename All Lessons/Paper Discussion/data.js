// Put this file at: All Lessons/Paper Discussion/data.js
//
// IMPORTANT: "ep" must be a 2-digit STRING ("01", "02", ...) exactly like
// Lesson 01's data.js. The admin panel saves permissions under this key,
// script.js reads them with the same key, and the Home search jump
// (#ep=01) looks for the card id "ep-01".

window.CURRENT_LESSON = {
  lessonId: "paper-discussion",   // unique id used for lock + student permissions
  lesson: "Paper Discussion",     // name shown in admin panel / search
  unit: "Lesson 1,2 Past Paper Tute Discussion (Pages 1-7)",
  episodes: [
    {
      ep: "PAGE 01-17",
      title: "Paper Discussion 01",
      unit: "Lesson 01 Past Paper Tute Discussion",
      duration: "00:00",          // video eke welawa danna (udaharanayata "45:30")
      tags: "paper discussion past paper tute lesson 01",
      thumb: "thumbnails/thumb1.png"         // file eka All Lessons/Paper Discussion/ folder eke thiyenna ona
    }
    // aluth video ekak ona nam, uda block eka copy karala ep: "02", "03" ... widihata add karanna
    // (block ekin passe comma ( , ) ekak danna amathaka karanna epa)
  ]
};
