import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLessons } from "../../context/LessonsContext";
import { lessons as seedData } from "../../data/lessons";
import {
  deleteLesson,
  saveLesson,
  seedLessons,
  setLessonPublished,
  setLessonsPublished,
  publishLessons,
} from "../../firebase/lessonsApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { formatDate } from "../../utils/time";
import "./instructor.css";

// A lesson is visible to students only when published === true.
const isPublished = (lesson) => lesson.published === true;

// Instructor view to list, create, delete, reorder, and seed lessons. Lessons
// are grouped by module (like the student dashboard) but each row exposes edit
// / delete / move controls. Reordering swaps the `order` field of two lessons.
export default function LessonManager() {
  const { lessons, modules, loading, error, reload } = useLessons();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  async function withBusy(fn) {
    setActionError("");
    setBusy(true);
    try {
      await fn();
      await reload();
    } catch (err) {
      console.error(err);
      setActionError(
        "That action failed. Check that your account is an instructor and rules are deployed."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(lesson) {
    if (
      !window.confirm(
        `Delete "${lesson.title}"? This removes the lesson for all students. Student progress on it is not deleted.`
      )
    )
      return;
    withBusy(() => deleteLesson(lesson.id));
  }

  // Swap order with the adjacent lesson in the FULL sorted list.
  async function handleMove(lesson, direction) {
    const idx = lessons.findIndex((l) => l.id === lesson.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= lessons.length) return;
    const other = lessons[swapIdx];
    const a = { ...lesson, order: other.order ?? swapIdx };
    const b = { ...other, order: lesson.order ?? idx };
    withBusy(async () => {
      await saveLesson(a);
      await saveLesson(b);
    });
  }

  async function handleSeed() {
    if (
      lessons.length > 0 &&
      !window.confirm(
        "Re-seeding overwrites lessons that share an id with the starter content. Continue?"
      )
    )
      return;
    withBusy(() => seedLessons(seedData));
  }

  // Show/hide a whole module (all lessons that share its name) at once.
  function handleToggleModule(mod, publish) {
    const ids = mod.lessons.map((l) => l.id);
    const verb = publish ? "Publish" : "Hide";
    if (
      !window.confirm(
        `${verb} all ${ids.length} lesson(s) in "${mod.name}"?` +
          (publish
            ? " Students will see them."
            : " Students won't see them or be able to open them.")
      )
    )
      return;
    withBusy(() => setLessonsPublished(ids, publish));
  }

  function handleToggleLesson(lesson) {
    withBusy(() => setLessonPublished(lesson.id, !isPublished(lesson)));
  }

  // Lessons created before publishing existed have no `published` field.
  // Treat those as "needs backfill" so we can offer a one-click fix.
  const legacy = lessons.filter((l) => l.published === undefined);
  function handleBackfill() {
    withBusy(() => publishLessons(legacy.map((l) => l.id)));
  }

  return (
    <div className="instructor">
      <header className="instructor__header">
        <h1>Manage lessons</h1>
        <p className="instructor__subtitle">
          Create, edit, reorder, and set deadlines. Changes are live for
          students after they reload.
        </p>
      </header>

      <div className="manager__toolbar">
        <Button onClick={() => navigate("/manage/lessons/new")} disabled={busy}>
          + New lesson
        </Button>
        <Button variant="secondary" onClick={handleSeed} disabled={busy}>
          {lessons.length === 0 ? "Seed starter lessons" : "Re-seed starter content"}
        </Button>
      </div>

      {legacy.length > 0 && (
        <div className="manager__banner" role="status">
          <span>
            {legacy.length} lesson{legacy.length === 1 ? "" : "s"} from before
            publishing was added {legacy.length === 1 ? "is" : "are"} currently
            hidden from students. Publish them to restore visibility.
          </span>
          <Button className="btn--tiny" onClick={handleBackfill} disabled={busy}>
            Publish existing lessons
          </Button>
        </div>
      )}

      {actionError && (
        <div className="alert alert--error" role="alert">
          {actionError}
        </div>
      )}
      {error && (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      )}

      {loading && <p className="instructor__empty">Loading lessons…</p>}

      {!loading && lessons.length === 0 && (
        <p className="instructor__empty">
          No lessons yet. Create one or seed the starter content above.
        </p>
      )}

      {modules.map((mod) => {
        const anyHidden = mod.lessons.some((l) => !isPublished(l));
        const anyVisible = mod.lessons.some((l) => isPublished(l));
        return (
        <section key={mod.name}>
          <div className="manager__module-bar">
            <h2 className="manager__module-heading">
              {mod.name}
              {!anyVisible && (
                <span className="status-pill status-pill--none">Hidden</span>
              )}
              {anyVisible && anyHidden && (
                <span className="status-pill status-pill--progress">
                  Partly hidden
                </span>
              )}
            </h2>
            <div className="manager__module-actions">
              {anyHidden && (
                <Button
                  variant="secondary"
                  className="btn--tiny"
                  onClick={() => handleToggleModule(mod, true)}
                  disabled={busy}
                >
                  Publish module
                </Button>
              )}
              {anyVisible && (
                <Button
                  variant="ghost"
                  className="btn--tiny"
                  onClick={() => handleToggleModule(mod, false)}
                  disabled={busy}
                >
                  Hide module
                </Button>
              )}
            </div>
          </div>
          <Card className="instructor__table-card">
            {mod.lessons.map((lesson) => {
              const fullIdx = lessons.findIndex((l) => l.id === lesson.id);
              return (
                <div key={lesson.id} className="manager__row">
                  <div className="manager__reorder">
                    <button
                      className="btn btn--ghost btn--tiny"
                      onClick={() => handleMove(lesson, "up")}
                      disabled={busy || fullIdx === 0}
                      aria-label={`Move ${lesson.title} up`}
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      className="btn btn--ghost btn--tiny"
                      onClick={() => handleMove(lesson, "down")}
                      disabled={busy || fullIdx === lessons.length - 1}
                      aria-label={`Move ${lesson.title} down`}
                      title="Move down"
                    >
                      ▼
                    </button>
                  </div>
                  <div className="manager__row-main">
                    <div className="manager__row-title">
                      {lesson.title}
                      {!isPublished(lesson) && (
                        <span className="status-pill status-pill--none">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="manager__row-sub">
                      {(lesson.sections?.length || 0)} section
                      {lesson.sections?.length === 1 ? "" : "s"}
                      {lesson.dueDate ? ` · due ${lesson.dueDate}` : ""}
                      {lesson.required ? " · Required" : ""}
                    </div>
                    {lesson.lastEditedBy && (
                      <div className="manager__row-edited">
                        Last edited by {lesson.lastEditedBy}
                        {formatDate(lesson.updatedAt)
                          ? ` · ${formatDate(lesson.updatedAt)}`
                          : ""}
                      </div>
                    )}
                  </div>
                  <div className="manager__row-actions">
                    <Button
                      variant="ghost"
                      className="btn--tiny"
                      onClick={() => handleToggleLesson(lesson)}
                      disabled={busy}
                      title={
                        isPublished(lesson)
                          ? "Hide this lesson from students"
                          : "Make this lesson visible to students"
                      }
                    >
                      {isPublished(lesson) ? "Hide" : "Publish"}
                    </Button>
                    <Link
                      className="btn btn--ghost btn--tiny"
                      to={`/lessons/${lesson.id}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Open the student view in a new tab"
                    >
                      Preview
                    </Link>
                    <Link
                      className="btn btn--secondary btn--tiny"
                      to={`/manage/lessons/${lesson.id}`}
                    >
                      Edit
                    </Link>
                    <Button
                      variant="ghost"
                      className="btn--tiny"
                      onClick={() => handleDelete(lesson)}
                      disabled={busy}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </Card>
        </section>
        );
      })}
    </div>
  );
}
