import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLessons } from "../../context/LessonsContext";
import { fetchLesson, saveLesson } from "../../firebase/lessonsApi";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import SectionForm from "../../components/instructor/SectionForm";
import "./instructor.css";

const SECTION_TYPES = ["content", "quiz", "reflection", "dragdrop", "coding"];

// A blank section of the given type, with sensible empty defaults.
function blankSection(type) {
  const id = `${type}-${Date.now().toString(36)}`;
  switch (type) {
    case "quiz":
      return { id, type, label: "Check-in", question: "", options: [], correctOptionId: "", explanation: "" };
    case "reflection":
      return { id, type, label: "Reflect", prompt: "", helper: "" };
    case "dragdrop":
      return { id, type, label: "Activity", prompt: "", items: [], categories: [] };
    case "coding":
      return { id, type, label: "Exercise", heading: "", goal: "", difficulty: "", difficultyTone: "mint", tasks: [], stuckPrompt: "" };
    case "content":
    default:
      return {
        id,
        type: "content",
        label: "Learn",
        heading: "",
        blocks: [{ type: "text", html: "" }],
      };
  }
}

function blankLesson() {
  return {
    id: "",
    title: "",
    summary: "",
    module: "",
    dueDate: "",
    required: false,
    order: 0,
    // New lessons start as drafts so nothing goes live before the instructor
    // is ready — publish it here or from the manager when it's ready.
    published: false,
    sections: [],
  };
}

// Editor for creating or editing one lesson: metadata + an ordered list of
// section subforms (all five types). Saving writes the whole lesson doc.
export default function LessonEditor() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { getLesson, lessons, loading: lessonsLoading, reload } = useLessons();
  const isNew = !lessonId;

  const [draft, setDraft] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [addType, setAddType] = useState("content");

  // Load the lesson into draft (from context if present, else fetch directly).
  useEffect(() => {
    let active = true;
    async function load() {
      if (isNew) {
        setDraft(blankLesson());
        return;
      }
      const fromCtx = getLesson(lessonId);
      if (fromCtx) {
        setDraft(structuredClone(fromCtx));
        return;
      }
      // Not in context yet (e.g. deep link before lessons loaded) — fetch.
      if (lessonsLoading) return;
      try {
        const fetched = await fetchLesson(lessonId);
        if (!active) return;
        if (fetched) setDraft(structuredClone(fetched));
        else setLoadError("That lesson doesn't exist.");
      } catch (err) {
        console.error(err);
        if (active) setLoadError("Couldn't load that lesson.");
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [lessonId, isNew, getLesson, lessonsLoading]);

  if (loadError) {
    return (
      <div className="instructor">
        <div className="alert alert--error">{loadError}</div>
        <Button variant="secondary" onClick={() => navigate("/manage")}>
          ← Back to manager
        </Button>
      </div>
    );
  }
  if (!draft) {
    return (
      <div className="instructor">
        <p className="instructor__empty">Loading editor…</p>
      </div>
    );
  }

  // ---- metadata setters ----
  const setField = (patch) => setDraft((d) => ({ ...d, ...patch }));

  // ---- section operations ----
  function updateSection(index, next) {
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s, i) => (i === index ? next : s)),
    }));
  }
  function addSection() {
    setDraft((d) => ({ ...d, sections: [...d.sections, blankSection(addType)] }));
  }
  function removeSection(index) {
    setDraft((d) => ({ ...d, sections: d.sections.filter((_, i) => i !== index) }));
  }
  function duplicateSection(index) {
    setDraft((d) => {
      const copy = structuredClone(d.sections[index]);
      copy.id = `${copy.id}-copy-${Date.now().toString(36)}`;
      const next = [...d.sections];
      next.splice(index + 1, 0, copy);
      return { ...d, sections: next };
    });
  }
  function moveSection(index, dir) {
    const swap = dir === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= draft.sections.length) return;
    setDraft((d) => {
      const next = [...d.sections];
      [next[index], next[swap]] = [next[swap], next[index]];
      return { ...d, sections: next };
    });
  }

  // ---- validation + save ----
  function validate() {
    if (!draft.id.trim()) return "Lesson id is required (used in the URL).";
    if (!/^[a-z0-9-]+$/.test(draft.id.trim()))
      return "Lesson id may only contain lowercase letters, numbers, and hyphens.";
    if (isNew && lessons.some((l) => l.id === draft.id.trim()))
      return "That lesson id is already taken. Choose a different one.";
    if (!draft.title.trim()) return "Title is required.";
    const ids = draft.sections.map((s) => s.id);
    if (ids.some((id) => !id || !id.trim()))
      return "Every section needs an id.";
    if (new Set(ids).size !== ids.length)
      return "Section ids must be unique within the lesson.";
    return "";
  }

  async function handleSave() {
    const problem = validate();
    if (problem) {
      setSaveError(problem);
      return;
    }
    setSaveError("");
    setSaving(true);
    try {
      // Normalize: trim id, drop empty dueDate to null, ensure order is a number.
      const clean = {
        ...draft,
        id: draft.id.trim(),
        dueDate: draft.dueDate ? draft.dueDate : null,
        order: Number(draft.order) || 0,
        published: !!draft.published,
      };
      await saveLesson(clean);
      await reload();
      navigate("/manage");
    } catch (err) {
      console.error(err);
      setSaveError(
        "Couldn't save. Check that your account is an instructor and rules are deployed."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="instructor">
      <header className="instructor__header">
        <button className="instructor__back" onClick={() => navigate("/manage")}>
          ← Back to manager
        </button>
        <h1>{isNew ? "New lesson" : `Edit: ${draft.title || draft.id}`}</h1>
      </header>

      {saveError && (
        <div className="alert alert--error" role="alert">
          {saveError}
        </div>
      )}

      {/* ---- Metadata ---- */}
      <Card>
        <div className="editor__form">
          <div className="editor__grid">
            <Input
              id="lesson-id"
              label="Lesson id (URL slug)"
              hint={isNew ? "lowercase, e.g. html-basics" : "Changing this is not recommended"}
              value={draft.id}
              disabled={!isNew}
              onChange={(e) => setField({ id: e.target.value })}
            />
            <Input
              id="lesson-order"
              label="Order"
              type="number"
              value={draft.order}
              onChange={(e) => setField({ order: e.target.value })}
            />
          </div>
          <Input
            id="lesson-title"
            label="Title"
            value={draft.title}
            onChange={(e) => setField({ title: e.target.value })}
          />
          <Input
            id="lesson-summary"
            label="Summary"
            value={draft.summary}
            onChange={(e) => setField({ summary: e.target.value })}
          />
          <div className="editor__grid">
            <Input
              id="lesson-module"
              label="Module / group"
              hint="Lessons with the same module are grouped together"
              value={draft.module}
              onChange={(e) => setField({ module: e.target.value })}
            />
            <Input
              id="lesson-due"
              label="Due date"
              type="date"
              value={draft.dueDate || ""}
              onChange={(e) => setField({ dueDate: e.target.value })}
            />
          </div>
          <label className="editor__checkbox">
            <input
              type="checkbox"
              checked={!!draft.required}
              onChange={(e) => setField({ required: e.target.checked })}
            />
            Required (students must complete it by the due date)
          </label>
          <label className="editor__checkbox">
            <input
              type="checkbox"
              checked={!!draft.published}
              onChange={(e) => setField({ published: e.target.checked })}
            />
            Published (visible to students). Leave off to keep it a hidden draft.
          </label>
        </div>
      </Card>

      {/* ---- Sections ---- */}
      <h2 className="manager__module-heading">
        Sections ({draft.sections.length})
      </h2>

      {draft.sections.map((section, index) => (
        <div key={index} className="editor__section-card">
          <div className="editor__section-head">
            <span className="editor__section-type">
              {index + 1}. {section.type}
            </span>
            <div className="editor__section-actions">
              <Button
                type="button"
                variant="ghost"
                className="btn--tiny"
                onClick={() => moveSection(index, "up")}
                disabled={index === 0}
              >
                ▲
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="btn--tiny"
                onClick={() => moveSection(index, "down")}
                disabled={index === draft.sections.length - 1}
              >
                ▼
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="btn--tiny"
                onClick={() => duplicateSection(index)}
              >
                Duplicate
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="btn--tiny"
                onClick={() => removeSection(index)}
              >
                Delete
              </Button>
            </div>
          </div>
          <SectionForm
            section={section}
            onChange={(next) => updateSection(index, next)}
          />
        </div>
      ))}

      <div className="editor__add-bar">
        <span className="editor__small-label">Add a section:</span>
        <select
          className="field__input"
          value={addType}
          onChange={(e) => setAddType(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          {SECTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <Button type="button" variant="secondary" onClick={addSection}>
          + Add section
        </Button>
      </div>

      <div className="editor__sticky-actions">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save lesson"}
        </Button>
        {!isNew && (
          <a
            className="btn btn--ghost"
            href={`/lessons/${draft.id}`}
            target="_blank"
            rel="noreferrer"
            title="Opens the saved version in a new tab — save first to preview your latest edits"
          >
            Preview as student ↗
          </a>
        )}
        <Button variant="secondary" onClick={() => navigate("/manage")} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
