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
    </div>
  );
}
