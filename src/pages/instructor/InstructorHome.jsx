import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLessons } from "../../context/LessonsContext";
import { lessons as seedData } from "../../data/lessons";
import { seedLessons } from "../../firebase/lessonsApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import "./instructor.css";

// Instructor landing page: a quick overview with links into the roster and the
// lesson manager. If the lessons collection is empty, it offers a one-click
// "seed from starter content" action — this is the migration path that copies
// the static curriculum into Firestore.
export default function InstructorHome() {
  const { currentUser } = useAuth();
  const { lessons, loading, error, reload } = useLessons();
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState("");

  const name =
    currentUser?.displayName || currentUser?.email?.split("@")[0] || "there";

  async function handleSeed() {
    setSeedError("");
    setSeeding(true);
    try {
      await seedLessons(seedData);
      await reload();
    } catch (err) {
      console.error("Seeding failed:", err);
      setSeedError(
        "Couldn't seed lessons. Make sure your account is an instructor and the Firestore rules are deployed."
      );
    } finally {
      setSeeding(false);
    }
  }

  const isEmpty = !loading && !error && lessons.length === 0;

  return (
    <div className="instructor">
      <section className="instructor__hero">
        <span className="badge badge--purple">Instructor</span>
        <h1>Hi {name} 👋</h1>
        <p>
          Welcome to your teaching dashboard. Review how students are doing and
          manage the curriculum from here.
        </p>
      </section>

      {isEmpty && (
        <Card className="instructor__seed">
          <h2>No lessons in the database yet</h2>
          <p>
            Your curriculum currently lives in the app's starter content. Click
            below to copy it into Firestore — after that you can edit lessons,
            sections, and deadlines from the lesson manager.
          </p>
          {seedError && (
            <div className="alert alert--error" role="alert">
              {seedError}
            </div>
          )}
          <Button onClick={handleSeed} disabled={seeding}>
            {seeding ? "Seeding…" : `Seed ${seedData.length} starter lessons`}
          </Button>
        </Card>
      )}

      <div className="instructor__cards">
        <Card as={Link} to="/students" interactive className="instructor__tile">
          <h3>👥 Students</h3>
          <p>See who's enrolled and dig into each student's progress.</p>
          <span className="instructor__tile-cta">Open roster →</span>
        </Card>

        <Card as={Link} to="/manage" interactive className="instructor__tile">
          <h3>✏️ Manage lessons</h3>
          <p>
            {loading
              ? "Loading lessons…"
              : `${lessons.length} lesson${
                  lessons.length === 1 ? "" : "s"
                } — create, edit, reorder, or set deadlines.`}
          </p>
          <span className="instructor__tile-cta">Open manager →</span>
        </Card>
      </div>
    </div>
  );
}
