// =========================================================================
// lessonsApi — all Firestore reads/writes for the shared curriculum.
// -------------------------------------------------------------------------
// Lessons live in a top-level `lessons` collection, one document per lesson:
//   lessons/{lessonId} = {
//     id, title, summary, module, dueDate, required,
//     order,            // explicit ordering (replaces static array position)
//     sections: [...],  // nested array, same per-type shapes as data/lessons.js
//     updatedAt
//   }
//
// Anyone signed in may READ; only instructors may WRITE (see firestore.rules).
// The static src/data/lessons.js is kept as SEED data — seedLessons() copies
// it into Firestore so existing content isn't retyped.
// =========================================================================
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const lessonsCol = () => collection(db, "lessons");

// ---- Reads ----

// Load lessons, sorted by `order` (then title as a stable tiebreaker).
// Students pass includeUnpublished=false, which queries only published lessons
// (required — the rules reject an unfiltered student query). Instructors pass
// includeUnpublished=true to see drafts/hidden modules too.
export async function fetchLessons({ includeUnpublished = false } = {}) {
  const ref = includeUnpublished
    ? lessonsCol()
    : query(lessonsCol(), where("published", "==", true));
  const snap = await getDocs(ref);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return sortLessons(list);
}

export async function fetchLesson(lessonId) {
  const snap = await getDoc(doc(db, "lessons", lessonId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ---- Writes (instructor-only, enforced by rules) ----

// Create or replace a lesson document. Stamps updatedAt server-side.
export async function saveLesson(lesson) {
  const { id } = lesson;
  if (!id) throw new Error("saveLesson: lesson.id is required");
  await setDoc(doc(db, "lessons", id), {
    ...lesson,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteLesson(lessonId) {
  await deleteDoc(doc(db, "lessons", lessonId));
}

// Show/hide a single lesson from students. Only writes the `published` field.
export async function setLessonPublished(lessonId, published) {
  await updateDoc(doc(db, "lessons", lessonId), {
    published,
    updatedAt: serverTimestamp(),
  });
}

// Show/hide many lessons at once (e.g. a whole module) in a single batch.
export async function setLessonsPublished(lessonIds, published) {
  const batch = writeBatch(db);
  lessonIds.forEach((id) => {
    batch.update(doc(db, "lessons", id), {
      published,
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

// Backfill: mark the given lessons as published. Used to bring already-seeded
// content (created before publishing existed, so missing the field) into the
// new model so it stays visible to students.
export async function publishLessons(lessonIds) {
  await setLessonsPublished(lessonIds, true);
}

// One-time migration: copy the static seed array into Firestore. Each lesson's
// `order` is its index in the seed array (preserving the original ordering).
// Seeded lessons are published (they're existing live content). Uses
// setDoc-by-id so it's idempotent (re-seeding overwrites by id).
export async function seedLessons(seedArray) {
  const batch = writeBatch(db);
  seedArray.forEach((lesson, index) => {
    const ref = doc(db, "lessons", lesson.id);
    batch.set(ref, {
      ...lesson,
      order: lesson.order ?? index,
      published: lesson.published ?? true,
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

// ---- Pure helpers (operate on an already-loaded lessons array) ----

export function sortLessons(list) {
  return [...list].sort((a, b) => {
    const ao = a.order ?? 0;
    const bo = b.order ?? 0;
    if (ao !== bo) return ao - bo;
    return (a.title || "").localeCompare(b.title || "");
  });
}

export function findLesson(lessons, lessonId) {
  return lessons.find((l) => l.id === lessonId);
}

// Group lessons by their `module`, preserving order. Returns an array of
// { name, lessons } so the dashboard and sidebar can render sections. Mirrors
// the old static getModules() so consumers don't change shape.
export function groupModules(lessons) {
  const groups = [];
  const byName = new Map();
  for (const lesson of lessons) {
    const name = lesson.module || "Lessons";
    if (!byName.has(name)) {
      const group = { name, lessons: [] };
      byName.set(name, group);
      groups.push(group);
    }
    byName.get(name).lessons.push(lesson);
  }
  return groups;
}
