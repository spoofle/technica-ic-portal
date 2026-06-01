# Technica · Inclusive Communities Portal

A warm, friendly educational web app for live lessons. Students sign in, follow
along with lesson content (text, images, embedded video, code examples), and
complete interactive activities — multiple-choice quizzes, reflection/journaling
prompts, and drag-and-drop sorting. Progress and answers are saved automatically.

Built with **React + Vite** and **Firebase** (Authentication + Firestore +
Hosting).

---

## ✨ Features

- **Sign up / Sign in** with email & password (Firebase Auth)
- **Lesson pages** with rich content, images, embedded YouTube, and code blocks
- **Interactive exercises:** multiple choice, journaling, drag-and-drop
- **Modules & deadlines:** lessons grouped into modules with due-date badges
- **Progress indicator** showing where you are in each lesson
- **Sidebar + top bar** navigation (responsive — collapses to a drawer on mobile)
- **Auto-saved progress** per student in Firestore
- **Accessible by design:** keyboard navigation, focus rings, skip link, ARIA
  labels, reduced-motion support, high-contrast text

---

## 🚀 Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

### 👀 Preview mode (browse without logging in)

Set `VITE_BYPASS_AUTH=true` in `.env` to skip the login screen while designing.
**Turn it off (`false`) before real students use it.** Note: progress won't save
in preview mode because there's no signed-in student to save it for.

---

## 🔥 Firebase setup (one time)

1. Go to the [Firebase Console](https://console.firebase.google.com) and click
   **Add project**. Name it (e.g. `technica-ic`) and finish the wizard.
2. **Authentication** → Get started → **Email/Password** → enable → Save.
3. **Firestore Database** → Create database → Start in **production mode** →
   pick a location → Enable.
4. **Project settings** (⚙️) → scroll to **Your apps** → click the web icon
   `</>` → register an app → copy the `firebaseConfig` values.
5. Copy `.env.example` to `.env` and paste in your values:
   ```bash
   cp .env.example .env
   ```
6. Restart the dev server (`npm run dev`). Sign-up should now work. 🎉

---

## 🔒 Deploying security rules

The included [`firestore.rules`](firestore.rules) ensure each student can only
read/write their **own** data.

```bash
npm install -g firebase-tools   # once
firebase login                  # interactive
firebase use --add              # pick your project
firebase deploy --only firestore:rules
```

---

## 🌐 Deploying the site (Firebase Hosting)

```bash
npm run build
firebase deploy --only hosting
```

---

## 🗂️ Project structure

```
src/
  components/
    ui/            Button, Card, Input + shared styles
    layout/        AppLayout (sidebar + top bar)
    exercises/     MultipleChoice, Reflection, DragAndDrop
    ProgressIndicator.jsx
    DeadlineBadge.jsx
    ProtectedRoute.jsx
  context/         AuthContext (sign up / in / out)
  hooks/           useLessonProgress (load/save to Firestore)
  pages/           Dashboard, LessonPage, SignIn, SignUp
  utils/           deadlines.js (due-date status helpers)
  data/lessons.js  Curriculum content (edit me!)
  firebase/config.js
  styles/          tokens.css (brand colors), global.css
```

---

## ✏️ Adding / editing lessons

Lessons are plain data in [`src/data/lessons.js`](src/data/lessons.js). Each
lesson has `sections`, and each section has a `type`: `content`, `quiz`,
`reflection`, or `dragdrop`. Add a new object to the `lessons` array and it
shows up in the sidebar and dashboard automatically.

### Modules & deadlines

Each lesson has these fields that drive the deadline system:

| Field      | Example                      | What it does                                  |
| ---------- | ---------------------------- | --------------------------------------------- |
| `module`   | `"Pre-Curriculum · Week 1"`  | Groups lessons under a heading in the nav     |
| `dueDate`  | `"2026-06-07"` (or `null`)   | When it's due — shows a deadline badge        |
| `required` | `true` / `false`             | Shows a "Required" marker + ★ in the sidebar  |

Deadline badges update automatically: a lesson shows **Due in N days**, then
**Due today**, then **Overdue by N days**, and **Completed ✓** once a student
finishes all its quizzes/activities. The colors (gray → yellow → red → green)
and thresholds live in `src/utils/deadlines.js`.

> ⚠️ The due dates currently in `lessons.js` are **placeholders**. Search for
> `← placeholder, edit me` and set your real deadlines.

### Adding content from Notion

Notion pages can't be imported automatically (they load content with
JavaScript, so a plain fetch only sees an empty shell). To move a Notion lesson
in:

1. Open the Notion page and copy each block of text.
2. In `lessons.js`, paste it into the matching section's `body` array (one
   string per paragraph).
3. For code examples, use a `code` field:
   ```js
   {
     id: "my-section",
     type: "content",
     label: "Learn",
     heading: "My heading",
     body: ["Some explanation."],
     code: { language: "html", content: "<h1>Hello</h1>" },
   }
   ```
4. Images: add `image: { src: "https://…", alt: "describe it" }`.
5. Videos: add `media: { type: "youtube", embedId: "VIDEO_ID", title: "…" }`.

The `html-basics` and `css-basics` lessons are already scaffolded with starter
content — replace their `body`/`code` with your exact Notion material.
