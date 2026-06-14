// =========================================================================
// LessonsContext — loads the shared curriculum from Firestore once and shares
// it across the authenticated app.
// -------------------------------------------------------------------------
// Replaces the old static imports from src/data/lessons.js. Exposes the same
// shapes the UI already used:
//   - lessons          : flat array, sorted by `order`
//   - modules          : [{ name, lessons }] (from groupModules)
//   - getLesson(id)    : single lesson lookup
//   - getModules()     : memoized modules
//   - loading / error  : async state
//   - reload()         : re-fetch after instructor edits / seeding
// =========================================================================
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { fetchLessons, groupModules, findLesson } from "../firebase/lessonsApi";
import { useAuth } from "./AuthContext";

const LessonsContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useLessons() {
  return useContext(LessonsContext);
}

export function LessonsProvider({ children }) {
  const { currentUser, isInstructor } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Instructors see every lesson (including drafts/hidden modules); students
  // only get published ones — both for the dashboard AND enforced by rules.
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchLessons({ includeUnpublished: isInstructor });
      setLessons(list);
    } catch (err) {
      console.error("Failed to load lessons:", err);
      setError(friendlyError(err));
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [isInstructor]);

  // Load lessons once we have a signed-in user (reads require auth). In preview
  // mode (no user) we still attempt a load; rules may deny it, which surfaces
  // as an error rather than a crash.
  useEffect(() => {
    // load() flips loading state then fetches; that's the intended sync here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, currentUser]);

  const modules = useMemo(() => groupModules(lessons), [lessons]);

  const getLesson = useCallback(
    (lessonId) => findLesson(lessons, lessonId),
    [lessons]
  );
  const getModules = useCallback(() => modules, [modules]);

  const value = {
    lessons,
    modules,
    getLesson,
    getModules,
    loading,
    error,
    reload: load,
  };

  return (
    <LessonsContext.Provider value={value}>{children}</LessonsContext.Provider>
  );
}

function friendlyError(err) {
  const code = err?.code || "";
  if (code === "permission-denied") {
    return "Couldn't load lessons — blocked by Firestore security rules. Make sure you're signed in and rules are deployed.";
  }
  if (code === "unavailable" || code === "failed-precondition") {
    return "Couldn't reach the database. You may be offline, or Firestore isn't set up yet.";
  }
  return `Couldn't load lessons (${code || "unknown error"}).`;
}
