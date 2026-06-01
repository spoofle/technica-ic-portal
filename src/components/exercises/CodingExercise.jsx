import { useState } from "react";
import Input from "../ui/Input";
import "./exercises.css";

// A hands-on coding exercise (e.g. build an HTML page in CodVerter).
// Shows: a goal, a checklist of tasks, an optional "stuck?" AI-helper prompt,
// and a field to paste the project link to submit.
//
// savedValue shape: { link: string, checked: { [taskIndex]: true } }
export default function CodingExercise({ section, savedValue, onComplete }) {
  const [link, setLink] = useState(savedValue?.link ?? "");
  const [checked, setChecked] = useState(savedValue?.checked ?? {});
  const [showHint, setShowHint] = useState(false);

  function toggleTask(i) {
    const next = { ...checked, [i]: !checked[i] };
    setChecked(next);
    onComplete?.({ link, checked: next });
  }

  function handleLinkChange(e) {
    setLink(e.target.value);
    onComplete?.({ link: e.target.value, checked });
  }

  const allTasksDone = section.tasks.every((_, i) => checked[i]);

  return (
    <div className="exercise">
      <span className={`badge badge--${section.difficultyTone || "purple"}`}>
        {section.difficulty || "Coding exercise"}
      </span>
      <h3 className="exercise__title">{section.heading}</h3>
      {section.goal && (
        <p className="coding__goal">
          <strong>Goal:</strong> {section.goal}
        </p>
      )}

      {/* Task checklist */}
      <ul className="coding__tasks">
        {section.tasks.map((task, i) => (
          <li key={i} className="coding__task">
            <label className="coding__check">
              <input
                type="checkbox"
                checked={Boolean(checked[i])}
                onChange={() => toggleTask(i)}
              />
              <span className="coding__check-box" aria-hidden="true" />
              <span
                className="coding__task-text"
                // Tasks can include inline <code> tags from the lesson data.
                dangerouslySetInnerHTML={{ __html: task }}
              />
            </label>
          </li>
        ))}
      </ul>

      {/* Optional "stuck?" AI-helper prompt */}
      {section.stuckPrompt && (
        <div className="coding__hint">
          <button
            className="coding__hint-toggle"
            onClick={() => setShowHint((s) => !s)}
            aria-expanded={showHint}
          >
            {showHint ? "▾" : "▸"} Feeling stuck? Here's a helper prompt
          </button>
          {showHint && (
            <blockquote className="coding__hint-body">
              {section.stuckPrompt}
            </blockquote>
          )}
        </div>
      )}

      {/* Submission link */}
      <div className="coding__submit">
        <Input
          id={`${section.id}-link`}
          label="Your project link"
          type="url"
          placeholder="https://codverter.com/src/webeditor?query=…"
          hint="Paste the link to your CodVerter project to submit this exercise."
          value={link}
          onChange={handleLinkChange}
        />
        <div className="coding__status">
          {allTasksDone && link.trim() ? (
            <span className="exercise__saved-note">
              All tasks checked & link added — don't forget to Save your
              progress below! ✓
            </span>
          ) : (
            <span className="coding__status-hint">
              {section.tasks.length - Object.values(checked).filter(Boolean).length}{" "}
              task(s) left
              {!link.trim() && " · add your project link"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
