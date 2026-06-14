import { useState } from "react";
import Button from "../ui/Button";
import "./exercises.css";

// Multiple-choice quiz. Calls onComplete(isCorrect) once the student checks
// their answer. `savedValue` restores a previously chosen option id.
export default function MultipleChoice({ section, savedValue, onComplete }) {
  const [selected, setSelected] = useState(savedValue ?? null);
  const [checked, setChecked] = useState(Boolean(savedValue));

  const isCorrect = selected === section.correctOptionId;
  // Lock the options only once the RIGHT answer is in. A wrong answer stays
  // editable so the student can try again (they can't advance until correct).
  const locked = checked && isCorrect;

  function handleCheck() {
    if (selected == null) return;
    setChecked(true);
    onComplete?.({ selected, isCorrect });
  }

  function handleTryAgain() {
    setChecked(false);
    setSelected(null);
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
          } else if (locked && opt.id === section.correctOptionId) {
            // Only reveal the correct option once they've answered correctly,
            // so a wrong attempt doesn't give away the answer before retrying.
            stateClass = "choice--correct";
          }
          return (
            <label key={opt.id} className={`choice ${stateClass}`}>
              <input
                type="radio"
                name={section.id}
                value={opt.id}
                checked={isThis}
                disabled={locked}
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
        <>
          <div
            className={`exercise__feedback ${
              isCorrect ? "exercise__feedback--good" : "exercise__feedback--try"
            }`}
            role="status"
          >
            <strong>{isCorrect ? "Nice work! 🎉" : "Not quite — give it another go!"}</strong>
            {isCorrect && <p>{section.explanation}</p>}
          </div>
          {!isCorrect && (
            <Button onClick={handleTryAgain}>Try again</Button>
          )}
        </>
      )}
    </div>
  );
}
