import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { useLessons } from "../context/LessonsContext";
import Card from "../components/ui/Card";
import "./MyJournal.css";

// Format a per-entry save time. Accepts an ISO string (answer.savedAt) or a
// Firestore Timestamp (the lesson's updatedAt fallback).
function formatWhen(value) {
  if (!value) return null;
  let d;
  if (typeof value === "string") d = new Date(value);
  else if (typeof value.toDate === "function") d = value.toDate();
  else if (typeof value.seconds === "number") d = new Date(value.seconds * 1000);
  else return null;
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "reflection", label: "Reflections" },
  { id: "quiz", label: "Quiz answers" },
  { id: "coding", label: "Code submissions" },
];

// "My Journal" — one place for a student to revisit their work: written
// reflections, quiz answers, and coding-exercise submissions. Everything is
// read from the student's own progress docs.
export default function MyJournal() {
  const { currentUser } = useAuth();
  const { lessons, loading: lessonsLoading } = useLessons();
  const uid = currentUser?.uid;

  const [progressById, setProgressById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!uid) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const snap = await getDocs(collection(db, "users", uid, "progress"));
        if (!active) return;
        const map = {};
        snap.forEach((d) => (map[d.id] = d.data()));
        setProgressById(map);
      } catch (err) {
        console.error("Failed to load journal:", err);
        if (active) setError("Couldn't load your journal. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [uid]);

  // Build entries: for each lesson (in curriculum order), turn each answered
  // reflection / quiz / coding section into a journal entry.
  const entries = [];
  for (const lesson of lessons) {
    const prog = progressById[lesson.id];
    const answers = prog?.answers || {};
    const lessonWhen = prog?.updatedAt;
    for (const section of lesson.sections || []) {
      const saved = answers[section.id];
      if (!saved) continue;
      const when = saved.savedAt || lessonWhen;
      const base = {
        key: `${lesson.id}-${section.id}`,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        module: lesson.module,
        when,
      };

      if (section.type === "reflection" && saved.text?.trim()) {
        entries.push({ ...base, kind: "reflection", prompt: section.prompt, text: saved.text });
      } else if (section.type === "quiz" && saved.selected != null) {
        const chosen = section.options?.find((o) => o.id === saved.selected);
        entries.push({
          ...base,
          kind: "quiz",
          question: section.question,
          answerText: chosen?.text || saved.selected,
          isCorrect: saved.isCorrect,
        });
      } else if (section.type === "coding" && saved.link?.trim()) {
        const total = section.tasks?.length || 0;
        const done = saved.checked
          ? Object.values(saved.checked).filter(Boolean).length
          : 0;
        entries.push({
          ...base,
          kind: "coding",
          heading: section.heading,
          link: saved.link,
          done,
          total,
        });
      }
    }
  }

  const shown = filter === "all" ? entries : entries.filter((e) => e.kind === filter);
  const busy = loading || lessonsLoading;

  return (
    <div className="journal">
      <header className="journal__hero">
        <span className="badge badge--coral">Your journal</span>
        <h1>My Journal 📔</h1>
        <p>
          Your reflections, quiz answers, and project submissions across every
          lesson, gathered in one place and private to you.
        </p>
      </header>

      {error && (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      )}

      {!busy && entries.length > 0 && (
        <div className="journal__filters" role="tablist" aria-label="Filter entries">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              className={`journal__chip ${filter === f.id ? "journal__chip--active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {busy && <p className="journal__status">Gathering your entries…</p>}

      {!busy && !error && entries.length === 0 && (
        <p className="journal__status">
          You haven't saved any work yet. As you complete lessons, your
          reflections, quiz answers, and submissions appear here. 🌱
        </p>
      )}

      {!busy && entries.length > 0 && shown.length === 0 && (
        <p className="journal__status">No {filter} entries yet.</p>
      )}

      {!busy &&
        shown.map((entry) => {
          const when = formatWhen(entry.when);
          return (
            <Card key={entry.key} className="journal__entry">
              <div className="journal__entry-head">
                <span className={`journal__kind journal__kind--${entry.kind}`}>
                  {entry.kind === "reflection"
                    ? "Reflection"
                    : entry.kind === "quiz"
                    ? "Quiz"
                    : "Code"}
                </span>
                <Link to={`/lessons/${entry.lessonId}`} className="journal__entry-lesson">
                  {entry.lessonTitle} →
                </Link>
                {when && <span className="journal__date">{when}</span>}
              </div>

              {entry.kind === "reflection" && (
                <>
                  <p className="journal__prompt">{entry.prompt}</p>
                  <p className="journal__text">{entry.text}</p>
                </>
              )}

              {entry.kind === "quiz" && (
                <>
                  <p className="journal__prompt">{entry.question}</p>
                  <p className="journal__quiz">
                    <span
                      className={`journal__answer ${
                        entry.isCorrect ? "is-correct" : "is-wrong"
                      }`}
                    >
                      {entry.isCorrect ? "✓" : "✗"} {entry.answerText}
                    </span>
                  </p>
                </>
              )}

              {entry.kind === "coding" && (
                <>
                  <p className="journal__prompt">{entry.heading}</p>
                  <p className="journal__text">
                    {entry.total > 0 && (
                      <span className="journal__tasks">
                        {entry.done}/{entry.total} tasks checked ·{" "}
                      </span>
                    )}
                    <a href={entry.link} target="_blank" rel="noreferrer">
                      {entry.link}
                    </a>
                  </p>
                </>
              )}
            </Card>
          );
        })}
    </div>
  );
}
