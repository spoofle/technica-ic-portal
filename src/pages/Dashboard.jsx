import { Link } from "react-router-dom";
import { getModules } from "../data/lessons";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import DeadlineBadge from "../components/DeadlineBadge";
import "./Dashboard.css";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const name =
    currentUser?.displayName || currentUser?.email?.split("@")[0] || "friend";

  const modules = getModules();

  return (
    <div className="dashboard">
      <section className="dashboard__hero">
        <span className="badge badge--purple">Welcome back</span>
        <h1>Hi {name}, ready to learn together? 🌱</h1>
        <p>
          Work through your modules below. Anything marked{" "}
          <strong>Required</strong> needs to be finished by its due date — keep
          an eye on the deadline badges.
        </p>
      </section>

      {modules.map((mod) => (
        <section key={mod.name} className="dashboard__module">
          <h2 className="dashboard__heading">{mod.name}</h2>
          <div className="dashboard__grid">
            {mod.lessons.map((lesson) => (
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
                  />
                )}
                <span className="lesson-card__cta">Start →</span>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
