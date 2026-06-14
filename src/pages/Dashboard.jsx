import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useLessons } from "../context/LessonsContext";
import { useAuth } from "../context/AuthContext";
import { isLessonDone } from "../utils/progress";
import Card from "../components/ui/Card";
import DeadlineBadge from "../components/DeadlineBadge";
import "./Dashboard.css";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { modules, loading, error } = useLessons();
  const name =
    currentUser?.displayName || currentUser?.email?.split("@")[0] || "friend";

  // Load this student's progress so we can show "completed" badges.
  const uid = currentUser?.uid;
  const [progressById, setProgressById] = useState({});
  useEffect(() => {
    let active = true;
    if (!uid) return;
    getDocs(collection(db, "users", uid, "progress"))
      .then((snap) => {
        if (!active) return;
        const map = {};
        snap.forEach((d) => (map[d.id] = d.data()));
        setProgressById(map);
      })
      .catch((err) => console.warn("Couldn't load progress:", err));
    return () => {
      active = false;
    };
  }, [uid]);

  const lessonDone = (lesson) => isLessonDone(lesson, progressById[lesson.id]);

  return (
    <div className="dashboard">
      <section className="dashboard__hero">
        <span className="badge badge--purple">Welcome back</span>
        <h1>Hi {name}, ready to learn together? 🌱</h1>
        <p>
          Work through your modules below. Anything marked{" "}
          <strong>Required</strong> needs to be finished by its due date. Keep
          an eye on the deadline badges!
        </p>
      </section>

      {loading && <p className="dashboard__status">Loading your lessons…</p>}

      {!loading && error && (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && modules.length === 0 && (
        <p className="dashboard__status">
          No lessons are available yet. Check back soon! 🌼
        </p>
      )}

      {modules.map((mod) => {
        const moduleDone =
          mod.lessons.length > 0 && mod.lessons.every(lessonDone);
        return (
          <section key={mod.name} className="dashboard__module">
            <div className="dashboard__module-head">
              <h2 className="dashboard__heading">{mod.name}</h2>
              {moduleDone && (
                <span className="badge badge--done">🎉 Module complete</span>
              )}
            </div>
            <div className="dashboard__grid">
              {mod.lessons.map((lesson) => {
                const done = lessonDone(lesson);
                return (
                  <Card
                    key={lesson.id}
                    as={Link}
                    to={`/lessons/${lesson.id}`}
                    interactive
                    className="lesson-card"
                  >
                    <div className="lesson-card__top">
                      <h3 className="lesson-card__title">{lesson.title}</h3>
                    </div>
                    <p className="lesson-card__summary">{lesson.summary}</p>
                    {lesson.dueDate && (
                      <DeadlineBadge
                        dueDate={lesson.dueDate}
                        required={lesson.required}
                        isComplete={done}
                      />
                    )}
                    <span className="lesson-card__cta">
                      {done ? "Review →" : "Start →"}
                    </span>
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
