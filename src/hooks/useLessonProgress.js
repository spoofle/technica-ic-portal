// =========================================================================
// useLessonProgress — load & save a student's work for one lesson.
// -------------------------------------------------------------------------
// Each student gets their own allocation in Firestore:
//   users/{uid}/progress/{lessonId}
//   {
//     lessonId,
//     completedSections: { [sectionId]: true },
//     answers: { [sectionId]: <whatever the exercise returned> },
//     updatedAt
//   }
//
// How saving works:
//   - As a student answers, their work is held in local "draft" state via
//     updateDraft(). Nothing is written to the database yet.
//   - Calling save() writes the whole lesson's draft to Firestore in one go
//     (the "Save my progress" button).
//   - The lesson page also calls save() automatically when the student leaves
//     the page or logs out, so work isn't lost.
//   - saveStatus reflects what's happening so the UI can show it and surface
//     any errors (e.g. Firestore not set up) instead of failing silently.
// =========================================================================
import { useEffect, useState, useCallback, useRef } from "react";
import {
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

export function useLessonProgress(lessonId) {
  const { currentUser } = useAuth();
  const [completed, setCompleted] = useState({});
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // saveStatus: "idle" | "unsaved" | "saving" | "saved" | "error"
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveError, setSaveError] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const uid = currentUser?.uid || null;

  // Keep a live mirror of the latest state in a ref so the auto-save on
  // unmount/logout can read the newest values without stale closures.
  const latest = useRef({ completed: {}, answers: {} });
  useEffect(() => {
    latest.current = { completed, answers };
  }, [completed, answers]);

  function docRefFor(userId) {
    return userId ? doc(db, "users", userId, "progress", lessonId) : null;
  }

  // ---- Load saved progress when the lesson or user changes ----
  useEffect(() => {
    let active = true;
    async function load() {
      const docRef = docRefFor(uid);
      if (!docRef) {
        // No signed-in user (e.g. preview mode) — nothing to load.
        setCompleted({});
        setAnswers({});
        setSaveStatus("idle");
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError("");
      try {
        const snap = await getDoc(docRef);
        if (active && snap.exists()) {
          const data = snap.data();
          setCompleted(data.completedSections || {});
          setAnswers(data.answers || {});
        } else if (active) {
          setCompleted({});
          setAnswers({});
        }
        if (active) {
          setSaveStatus("idle");
          setSaveError("");
        }
      } catch (err) {
        // Surface load failures instead of hiding them — a failed read is
        // exactly why progress can look "lost".
        console.error("Failed to load progress:", err);
        if (active) setLoadError(friendlySaveError(err));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, uid]);

  // ---- Update a single section's answer in local draft state ----
  // Marks the section complete and flags that there are unsaved changes. We
  // stamp each answer with the time it was last changed (client clock) so the
  // journal can show a per-entry date. All exercise answers are objects, so the
  // stamp rides along without disturbing the existing answer shapes.
  const updateDraft = useCallback((sectionId, answer) => {
    const stamped =
      answer && typeof answer === "object"
        ? { ...answer, savedAt: new Date().toISOString() }
        : answer;
    setAnswers((prev) => ({ ...prev, [sectionId]: stamped }));
    setCompleted((prev) => ({ ...prev, [sectionId]: true }));
    setSaveStatus("unsaved");
  }, []);

  // ---- Persist the whole lesson to Firestore ----
  // Returns true on success, false on failure. Accepts optional overrides so
  // the unmount flush can pass the very latest ref values.
  const save = useCallback(
    async (override) => {
      if (!uid) {
        // Preview mode / signed out — can't save, but don't error loudly.
        setSaveStatus("idle");
        return false;
      }
      const docRef = doc(db, "users", uid, "progress", lessonId);
      const data = override || latest.current;
      setSaveStatus("saving");
      setSaveError("");
      try {
        await setDoc(
          docRef,
          {
            lessonId,
            completedSections: data.completed ?? data.completedSections ?? {},
            answers: data.answers ?? {},
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        // Verify the write actually reached the SERVER (not just the local
        // offline cache). Without this, Firestore can report a "success" that
        // only lives in memory — so it looks saved but vanishes on reload.
        // This is the core fix for "says saved but progress is lost".
        const verify = await getDocFromServer(docRef);
        if (!verify.exists()) {
          throw new Error("write-not-persisted");
        }

        setSaveStatus("saved");
        setLastSavedAt(new Date());
        return true;
      } catch (err) {
        console.error("Failed to save progress:", err);
        setSaveStatus("error");
        setSaveError(friendlySaveError(err));
        return false;
      }
    },
    [uid, lessonId]
  );

  // Expose a flush that reads the freshest ref state — used on page leave.
  const flush = useCallback(() => {
    const { completed: c, answers: a } = latest.current;
    // Only write if there's something to save.
    if (Object.keys(a).length === 0) return;
    save({ completed: c, answers: a });
  }, [save]);

  return {
    completed,
    answers,
    loading,
    loadError,
    saveStatus,
    saveError,
    lastSavedAt,
    updateDraft,
    save,
    flush,
  };
}

// Turn a Firestore error into a plain-language explanation.
function friendlySaveError(err) {
  const code = err?.code || "";
  if (code === "permission-denied") {
    return "Saving was blocked by Firestore security rules. Deploy firestore.rules (see README).";
  }
  if (code === "unavailable" || code === "failed-precondition") {
    return "Couldn't reach the database — you may be offline, or the Firestore database hasn't been created in your Firebase project yet.";
  }
  if (code === "not-found") {
    return "Firestore database not found. Create it in the Firebase console first.";
  }
  if (err?.message === "write-not-persisted") {
    return "Your changes didn't reach the server (you may be offline). They aren't saved yet — please try again when connected.";
  }
  return `Couldn't save (${code || "unknown error"}). Please try again.`;
}
