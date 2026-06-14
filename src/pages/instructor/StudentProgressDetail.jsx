import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useLessons } from "../../context/LessonsContext";
import { completionRatio } from "../../utils/progress";
import Card from "../../components/ui/Card";
import "./instructor.css";

// Read-only view of one student's progress across every lesson. Loads the
// student's profile plus their per-lesson progress docs and shows how many
// graded sections each lesson is complete. Instructors cannot edit student work
// (the rules forbid it).
export default function StudentProgressDetail() {
  const { uid } = useParams();
  const { lessons, loading: lessonsLoading } = useLessons();

  const [profile, setProfile] = useState(null);
  const [progressByLesson, setProgressByLesson] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const profSnap = await getDoc(doc(db, "users", uid));
        if (active) setProfile(profSnap.exists() ? profSnap.data() : null);

        // Fetch each lesson's progress doc for this student in parallel.
        const entries = await Promise.all(
          lessons.map(async (lesson) => {
            const snap = await getDoc(
              doc(db, "users", uid, "progress", lesson.id)
            );
            return [lesson.id, snap.exists() ? snap.data() : null];
          })
        );
        if (active) setProgressByLesson(Object.fromEntries(entries));
      } catch (err) {
        console.error("Failed to load student progress:", err);
        if (active)
          setError(
            "Couldn't load this student's progress. Check that rules are deployed and your account is an instructor."
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    // Wait until lessons are available so we know which progress docs to fetch.
    if (!lessonsLoading) load();
    return () => {
      active = false;
    };
  }, [uid, lessons, lessonsLoading]);

  const studentName = profile?.displayName || profile?.email || "Student";

  // Build the student's actual responses (quiz answers, coding submissions,
  // reflections) from their saved progress, in curriculum order.
  const responses = [];
  if (!loading && !lessonsLoading) {
    for (const lesson of lessons) {
      const answers = progressByLesson[lesson.id]?.answers || {};
      for (const section of lesson.sections || []) {
        const saved = answers[section.id];
        if (!saved) continue;
        const base = {
          key: `${lesson.id}-${section.id}`,
          lessonTitle: lesson.title,
          module: lesson.module,
        };
        if (section.type === "reflection" && saved.text?.trim()) {
          responses.push({ ...base, kind: "reflection", prompt: section.prompt, text: saved.text });
        } else if (section.type === "quiz" && saved.selected != null) {
          const chosen = section.options?.find((o) => o.id === saved.selected);
          responses.push({
            ...base,
            kind: "quiz",
            question: section.question,
            answerText: chosen?.text || saved.selected,
            isCorrect: saved.isCorrect,
          });
        } else if (section.type === "coding" && saved.link?.trim()) {
          const total = section.tasks?.length || 0;
          const doneCount = saved.checked
            ? Object.values(saved.checked).filter(Boolean).length
            : 0;
          responses.push({
            ...base,
            kind: "coding",
            heading: section.heading,
            link: saved.link,
            done: doneCount,
            total,
          });
        }
      }
    }
  }

  return (
    <div className="instructor">
      <header className="instructor__header">
        <Link to="/students" className="instructor__back">
          ← Back to students
        </Link>
        <h1>{studentName}</h1>
        {profile?.email && (
          <p className="instructor__subtitle">{profile.email}</p>
        )}
      </header>

      {error && (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      )}

      {(loading || lessonsLoading) && (
        <p className="instructor__empty">Loading progress…</p>
      )}

      {!loading && !lessonsLoading && !error && (
        <Card className="instructor__table-card">
          <table className="roster">
            <thead>
              <tr>
                <th>Lesson</th>
                <th>Module</th>
                <th>Completed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => {
                const progress = progressByLesson[lesson.id];
                const completedMap = progress?.completedSections || {};
                const { done, total } = completionRatio(lesson, completedMap);
                const started = progress != null;
                const complete = total > 0 && done >= total;
                return (
                  <tr key={lesson.id}>
                    <td>{lesson.title}</td>
                    <td>{lesson.module}</td>
                    <td>
                      {total === 0 ? "—" : `${done} / ${total}`}
                    </td>
                    <td>
                      <span
                        className={`status-pill status-pill--${
                          complete ? "done" : started ? "progress" : "none"
                        }`}
                      >
                        {complete
                          ? "Complete"
                          : started
                          ? "In progress"
                          : "Not started"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {!loading && !lessonsLoading && !error && (
        <>
          <h2 className="manager__module-heading">Responses</h2>
          {responses.length === 0 ? (
            <p className="instructor__empty">
              This student hasn't submitted any quiz answers, code links, or
              reflections yet.
            </p>
          ) : (
            responses.map((r) => (
              <Card key={r.key} className="response">
                <div className="response__head">
                  <span className={`response__kind response__kind--${r.kind}`}>
                    {r.kind === "reflection"
                      ? "Reflection"
                      : r.kind === "quiz"
                      ? "Quiz"
                      : "Code"}
                  </span>
                  <span className="response__lesson">{r.lessonTitle}</span>
                </div>

                {r.kind === "reflection" && (
                  <>
                    <p className="response__prompt">{r.prompt}</p>
                    <p className="response__text">{r.text}</p>
                  </>
                )}

                {r.kind === "quiz" && (
                  <>
                    <p className="response__prompt">{r.question}</p>
                    <p>
                      <span
                        className={`response__answer ${
                          r.isCorrect ? "is-correct" : "is-wrong"
                        }`}
                      >
                        {r.isCorrect ? "✓" : "✗"} {r.answerText}
                      </span>
                    </p>
                  </>
                )}

                {r.kind === "coding" && (
                  <>
                    <p className="response__prompt">{r.heading}</p>
                    <p className="response__text">
                      {r.total > 0 && (
                        <span className="response__tasks">
                          {r.done}/{r.total} tasks checked ·{" "}
                        </span>
                      )}
                      <a href={r.link} target="_blank" rel="noreferrer">
                        {r.link}
                      </a>
                    </p>
                  </>
                )}
              </Card>
            ))
          )}
        </>
      )}
    </div>
  );
}
