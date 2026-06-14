import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import Card from "../../components/ui/Card";
import "./instructor.css";

// Lists everyone in the users collection. Students link through to their
// per-student progress detail. Progress is loaded lazily on the detail page
// (the rules don't permit a single cross-user collection-group query here).
export default function InstructorRoster() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const snap = await getDocs(collection(db, "users"));
        if (!active) return;
        const list = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
        // Show students first, then instructors; alpha within each.
        list.sort((a, b) => {
          const an = (a.displayName || a.email || "").toLowerCase();
          const bn = (b.displayName || b.email || "").toLowerCase();
          return an.localeCompare(bn);
        });
        setUsers(list);
      } catch (err) {
        console.error("Failed to load roster:", err);
        if (active)
          setError(
            "Couldn't load the roster. Make sure rules are deployed and your account is an instructor."
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const students = users.filter((u) => u.role !== "instructor");
  const instructors = users.filter((u) => u.role === "instructor");

  return (
    <div className="instructor">
      <header className="instructor__header">
        <h1>Students</h1>
        <p className="instructor__subtitle">
          {loading
            ? "Loading…"
            : `${students.length} student${students.length === 1 ? "" : "s"}`}
        </p>
      </header>

      {error && (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && students.length === 0 && (
        <p className="instructor__empty">No students have signed up yet.</p>
      )}

      {students.length > 0 && (
        <Card className="instructor__table-card">
          <table className="roster">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th aria-label="View" />
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.uid}>
                  <td>{s.displayName || "—"}</td>
                  <td>{s.email}</td>
                  <td className="roster__action">
                    <Link to={`/students/${s.uid}`}>View progress →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {instructors.length > 0 && (
        <p className="instructor__note">
          {instructors.length} instructor
          {instructors.length === 1 ? "" : "s"} also have access.
        </p>
      )}
    </div>
  );
}
