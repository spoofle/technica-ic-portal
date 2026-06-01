import { useState } from "react";
import Button from "../ui/Button";
import "./exercises.css";

// Multiple-choice quiz. Calls onComplete(isCorrect) once the student checks
// their answer. `savedValue` restores a previously chosen option id.
export default function MultipleChoice({ section, savedValue, onComplete }) {
  const [selected, setSelected] = useState(savedValue ?? null);
  const [checked, setChecked] = useState(Boolean(savedValue));

  const isCorrect = selected === section.correctOptionId;

  function handleCheck() {
    if (selected == null) return;
    setChecked(true);
    onComplete?.({ selected, isCorrect });
  }

  return (
    <div className="exercise">
      <span className="badge badge--purple">Quiz</span>
      <h3 className="exercise__title">{section.question}</h3>

      <fieldset className="choice-list">
        <legend className="sr-only">{section.question}</legend>
        {section.options.map((opt) => {
          const isThis = selected === opt.id;
          let stateClass = "";
          if (checked && isThis) {
            stateClass = isCorrect ? "choice--correct" : "choice--wrong";
          } else if (checked && opt.id === section.correctOptionId) {
            stateClass = "choice--correct";
          }
          return (
            <label key={opt.id} className={`choice ${stateClass}`}>
              <input
                type="radio"
                name={section.id}
                value={opt.id}
                checked={isThis}
                disabled={checked}
                onChange={() => setSelected(opt.id)}
              />
              <span className="choice__marker" aria-hidden="true" />
              <span className="choice__text">{opt.text}</span>
            </label>
          );
        })}
      </fieldset>

      {!checked ? (
        <Button onClick={handleCheck} disabled={selected == null}>
          Check my answer
        </Button>
      ) : (
        <div
          className={`exercise__feedback ${
            isCorrect ? "exercise__feedback--good" : "exercise__feedback--try"
          }`}
          role="status"
        >
          <strong>{isCorrect ? "Nice work! 🎉" : "Good try!"}</strong>
          <p>{section.explanation}</p>
        </div>
      )}
    </div>
  );
}
