# Lock/Unlock System — Setup Guide (සිංහල)

ඔයාගේ real system එක check කරලා බැලුවම, මම කලින් හිතුවේ **වැරදියි** — ඔයාගේ site එක **Firestore** නෙවෙයි, **Realtime Database** පාවිච්චි කරන්නේ, login එකත් **Google Sign-In**. ඒ නිසා files ටික ආයෙත් hරියටම match කරලා හැදුවා.

**වැදගත්ම දේ**: `index log.html` (ඔයාගේ existing register/login file එක) ට **කිසිම වෙනසක් කරන්නම ඕන නෑ**. Lock/unlock data ටික save වෙන්නේ **වෙනම place එකක** (`unlocked/{uid}/...`), ඒ නිසා ඔයාගේ existing register/login flow එකට කිසිම බලපෑමක් නෑ.

## Files:
- `lessons.html` — student ට තමන්ගේ lessons (locked/unlocked) පෙන්නන page එක
- `admin.html` — ඔයාට student ලා unlock කරන්න පුළුවන් admin panel එක
- `realtime-database-rules.txt` — Firebase Realtime Database Rules tab එකට paste කරන security rules

---

## STEP 1 — Realtime Database Rules දාන්න (වැදගත්ම step එක)

1. https://console.firebase.google.com → `ictfrom-free-learn-pack` project එකට යන්න
2. Left menu → **Realtime Database** (Firestore Database එක නෙවෙයි — ඒක use කරන්නේ නෑ)
3. උඩින් **Rules** tab එකට යන්න
4. දැනට තියෙන rules ටික මකලා, `realtime-database-rules.txt` එකේ content එක copy/paste කරන්න (admin UID එක දැනටමත් fill කරලා තියෙනවා)
5. **Publish** click කරන්න

## STEP 2 — Lesson list එක ඔයාගේ real lessons වලට Match කරන්න

`lessons.html` සහ `admin.html` දෙකේම `LESSONS` කියලා array එකක් තියෙනවා:

```js
const LESSONS = [
  { id: "lesson01", title: "Lesson 01 — Basic Concepts Of ICT", sub: "11 Videos",
    url: "All Lessons/Lesson 01 (2028)/index.html", free: true },
  { id: "lesson02", title: "Lesson 02 — Evolution Of Computing", sub: "05 Videos",
    url: "All Lessons/Lesson 02 (2028)/index.html", free: false }
];
```

- `id` — unique ID එකක් (admin.html එකෙත් **හරියටම එකම id** තියෙන්න ඕන)
- `url` — Home.html එකේ තියෙන එකම lesson folder paths (`All Lessons/Lesson XX (2028)/index.html`)
- `free: true` — Pay කරන්න ඕන නෑ, Lesson 01 වගේ free trial
- `free: false` — Pay කරලා admin unlock කරන්නම් access වෙන්නේ

**admin.html** එකේ `LESSONS` array එකේ id + label විතරයි ඕන (url ඕන නෑ, ඒක simple listing එකක් නිසා).

අලුත් lesson එකක් add කරද්දී, **දෙකෙන්ම** (`lessons.html` සහ `admin.html`) එකම `id` එකෙන් item එකක් add කරන්න ඕන.

## STEP 3 — GitHub Repo එකට Upload කරන්න

1. `ictfrom-FLP` repo එකට `lessons.html` සහ `admin.html` දෙකම root එකට upload කරන්න ("Add file" → "Upload files")
2. Commit කරන්න → GitHub Pages deploy වෙනකම් විනාඩි 2-3ක් ඉන්න

## STEP 4 — Redirect එක Match කරන්න

`index log.html` එකේ Google login/register සාර්ථක උනාට පස්සේ `dashboard.html` එකට redirect කරනවා (`REDIRECT_PAGE = 'dashboard.html'`). ඔයාට ඕන දෙකෙන් එකක් තෝරගන්න:

**A) Simple**: `dashboard.html` එකේ (ඔයාගේ existing dashboard) "My Lessons" කියලා button/link එකක් දාන්න, `lessons.html` ට point කරන්න.

**B) Direct**: `index log.html` එකේ `REDIRECT_PAGE = 'dashboard.html'` කියන line එක `REDIRECT_PAGE = 'lessons.html'` කියලා වෙනස් කරන්න — එතකොට login උනාට පස්සෙටම lessons page එකට යනවා.

(dashboard.html එකේ code එකත් share කළොත්, lock-check logic එක කෙලින්ම dashboard.html එකට integrate කරලා දෙන්නම්, වෙනම page එකක් නැතුවම.)

## STEP 5 — Test කරන්න

1. ඔයාගේ real site එකේ (`index log.html` → Google account එකකින්) student කෙනෙක් register/login කරන්න
2. `lessons.html` ට ගිහින් බලන්න — Lesson 01 unlocked (free), Lesson 02 locked ලෙස පේනවා
3. `admin.html` ට ගිහින්, admin email/password එකෙන් login වෙන්න (Firebase Console → Authentication → Users එකේ ඔයා හදපු admin account එක)
4. Student ගේ row එකේ "Lesson 02" badge එක click කරන්න → unlock වෙනවා
5. Student side (`lessons.html`) refresh නොකරම බලන්න — live update එකක් නිසා ඉබේම unlocked වෙනවා පේනවා

---

### වැදගත් සටහන්
- **Payment**: මේ system එකෙන් payment automatic කරන්නේ නෑ — ඔයා bank/cash හරහා payment එක manual check කරලා, admin.html එකෙන් unlock button එක click කරන්නම් ඕන
- **Firestore vs Realtime Database**: ඔයාගේ project එකේ Firestore Database එකකුත් තියෙනවා (ඒක default create වුනාට පස්සේ empty තියෙනවා) — **ඒක use කරන්නේ නෑ**, Realtime Database එකයි use කරන්නේ, ඒක confuse වෙන්න එපා
- Lesson folder එකට කෙලින්ම URL එකෙන් ගියොත් (search එකෙන් හෝ direct link share කළොත්) ඒක තාම open වෙනවා — `lessons.html` හරහා ආවොත් විතරයි lock check එක වැඩ කරන්නේ. සම්පූර්ණයෙන්ම protect කරන්න ඕන නම් (lesson folder එකේම access check එකක් දාන්න) කියලා මට කියන්න, ඒකටත් code එකක් දෙන්නම්
