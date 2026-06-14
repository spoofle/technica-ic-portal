import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLessons } from "../context/LessonsContext";
import { useLessonProgress } from "../hooks/useLessonProgress";
import ProgressIndicator from "../components/ProgressIndicator";
import DeadlineBadge from "../components/DeadlineBadge";
import SaveBar from "../components/SaveBar";
import Button from "../components/ui/Button";
import ContentSection from "../components/lesson/ContentSection";
import MultipleChoice from "../components/exercises/MultipleChoice";
import Reflection from "../components/exercises/Reflection";
import DragAndDrop from "../components/exercises/DragAndDrop";
import CodingExercise from "../components/exercises/CodingExercise";
import "./LessonPage.css";

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { getLesson, lessons, loading: lessonsLoading } = useLessons();
  const lesson = getLesson(lessonId);
  const {
    answers,
    completed,
    loading,
    loadError,
    saveStatus,
    saveError,
    lastSavedAt,
    updateDraft,
    save,
    flush,
  } = useLessonProgress(lessonId);
  const [stepIndex, setStepIndex] = useState(0);

  // Auto-save when leaving the lesson (navigating away or logging out), so a
  // student never loses work just by clicking elsewhere. `flush` reads the
  // freshest answers from a ref, so this stays correct without re-running.
  useEffect(() => {
    return () => flush();
  }, [flush]);

  // Also save if the browser tab is closed or refreshed mid-lesson.
  useEffect(() => {
    function handleBeforeUnload() {
      flush();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [flush]);

  // Reset to the first section whenever the lesson changes. Adjusting state
  // during render (instead of in an effect) avoids an extra render pass.
  const [prevLessonId, setPrevLessonId] = useState(lessonId);
  const lessonChanged = lessonId !== prevLessonId;
  if (lessonChanged) {
    setPrevLessonId(lessonId);
    setStepIndex(0);
  }

  // While lessons are still loading, don't flash "not found".
  if (lessonsLoading && !lesson) {
    return (
      <div className="lesson lesson--missing">
        <p className="lesson__loading">Loading lesson…</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson lesson--missing">
        <h1>Lesson not found</h1>
        <Link to="/">Back to home</Link>
      </div>
    );
  }

  const sections = lesson.sections;
  // When the lesson just changed, stepIndex still holds the PREVIOUS lesson's
  // value for this render (the reset above is queued, not applied yet). The new
  // lesson may have fewer sections, so clamp to avoid reading an undefined
  // section and crashing. Also guards any stray out-of-range index.
  const safeStep = lessonChanged
    ? 0
    : Math.min(Math.max(stepIndex, 0), sections.length - 1);
  const section = sections[safeStep];
  const steps = sections.map((s) => ({ id: s.id, label: s.label }));

  // A lesson counts as complete once every interactive section is done.
  // Pure "content" sections don't need an answer, so we ignore them.
  const gradedSections = sections.filter((s) => s.type !== "content");
  const lessonComplete =
    gradedSections.length > 0 &&
    gradedSections.every((s) => completed[s.id]);

  // ---- Gating: can the student move past the CURRENT section? ----
  // Content sections are always passable. Quizzes require the CORRECT answer.
  // Other graded sections (reflection, drag-drop, coding) require an answer.
  function canAdvanceFrom(sec) {
    const saved = answers[sec.id];
    switch (sec.type) {
      case "quiz":
        return saved?.selected === sec.correctOptionId;
      case "reflection":
        return Boolean(saved?.text && saved.text.trim().length > 0);
      case "dragdrop":
        // Must place every item AND get them all in the right category.
        if (!saved?.placement) return false;
        return sec.categories.every((cat) =>
          cat.correctItemIds.every(
            (itemId) => saved.placement[itemId] === cat.id
          )
        );
      case "coding": {
        // Must check off every task and submit a project link.
        if (!saved) return false;
        const allTasks = sec.tasks.every((_, i) => saved.checked?.[i]);
        return allTasks && Boolean(saved.link && saved.link.trim());
      }
      default:
        return true; // content
    }
  }

  const locked = !canAdvanceFrom(section);

  // A short message explaining why Next is disabled, by section type.
  function lockReason(sec) {
    switch (sec.type) {
      case "quiz":
        return "Choose the correct answer to continue.";
      case "reflection":
        return "Write and save your reflection to continue.";
      case "dragdrop":
        return "Sort every item into the correct group to continue.";
      case "coding":
        return "Check off each task and add your project link to continue.";
      default:
        return "";
    }
  }

  const isFirst = safeStep === 0;
  const isLast = safeStep === sections.length - 1;

  // Find the next lesson for the "finish" hand-off.
  const lessonIndex = lessons.findIndex((l) => l.id === lessonId);
  const nextLesson = lessons[lessonIndex + 1];

  function renderSection() {
    const saved = answers[section.id];
    // Exercises report answers into local draft state; nothing is written to
    // the database until the student (or auto-save) calls save().
    const onComplete = (value) => updateDraft(section.id, value);
    switch (section.type) {
      case "quiz":
        return (
          <MultipleChoice
            section={section}
            savedValue={saved?.selected}
            onComplete={onComplete}
          />
        );
      case "reflection":
        return (
          <Reflection
            section={section}
            savedValue={saved?.text}
            onComplete={onComplete}
          />
        );
      case "dragdrop":
        return (
          <DragAndDrop
            section={section}
            savedValue={saved?.placement}
            onComplete={onComplete}
          />
        );
      case "coding":
        return (
          <CodingExercise
            section={section}
            savedValue={saved}
            onComplete={onComplete}
          />
        );
      default:
        return <ContentSection section={section} />;
    }
  }

  return (
    <div className="lesson">
      <header className="lesson__header">
        <p className="lesson__eyebrow">{lesson.module}</p>
        <h1>{lesson.title}</h1>
        <p className="lesson__summary">{lesson.summary}</p>
        {lesson.dueDate && (
          <DeadlineBadge
            dueDate={lesson.dueDate}
            required={lesson.required}
            isComplete={lessonComplete}
          />
        )}
      </header>

      <ProgressIndicator steps={steps} currentIndex={safeStep} />

      {loadError && (
        <div className="alert alert--error" role="alert">
          {loadError}
        </div>
      )}

      <section className="lesson__card" key={section.id}>
        {loading ? (
          <p className="lesson__loading">Loading your progress…</p>
        ) : (
          renderSection()
        )}
      </section>

      <SaveBar
        status={saveStatus}
        error={saveError}
        lastSavedAt={lastSavedAt}
        onSave={() => save()}
      />

      {/* Gating hint: tells the student what to do to unlock "Next". */}
      {!loading && locked && (
        <p className="lesson__lock" role="status">
          🔒 {lockReason(section)}
        </p>
      )}

      <nav className="lesson__nav" aria-label="Lesson sections">
        <Button
          variant="secondary"
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={isFirst}
        >
          ← Back
        </Button>

        {!isLast ? (
          <Button
            onClick={() => setStepIndex((i) => i + 1)}
            disabled={locked}
            title={locked ? lockReason(section) : undefined}
          >
            Next →
          </Button>
        ) : nextLesson ? (
          <Button
            onClick={() => navigate(`/lessons/${nextLesson.id}`)}
            disabled={locked}
            title={locked ? lockReason(section) : undefined}
          >
            Next lesson: {nextLesson.title} →
          </Button>
        ) : (
          <Button
            onClick={() => navigate("/")}
            disabled={locked}
            title={locked ? lockReason(section) : undefined}
          >
            Finish 🎉
          </Button>
        )}
      </nav>
    </div>
  );
}
