import "./ProgressIndicator.css";

// Shows where a student is within a lesson.
// `steps` = array of { id, label }; `currentIndex` = zero-based active step.
export default function ProgressIndicator({ steps, currentIndex }) {
  const total = steps.length;
  const percent = total > 1 ? (currentIndex / (total - 1)) * 100 : 0;

  return (
    <div
      className="progress"
      role="group"
      aria-label={`Lesson progress: step ${currentIndex + 1} of ${total}`}
    >
      <div className="progress__bar">
        <div className="progress__track" />
        <div className="progress__fill" style={{ width: `${percent}%` }} />
        <ol className="progress__steps">
          {steps.map((step, i) => {
            const state =
              i < currentIndex
                ? "done"
                : i === currentIndex
                ? "current"
                : "upcoming";
            return (
              <li
                key={step.id}
                className={`progress__step progress__step--${state}`}
                aria-current={state === "current" ? "step" : undefined}
              >
                <span className="progress__dot">
                  {state === "done" ? "✓" : i + 1}
                </span>
                <span className="progress__label">{step.label}</span>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="progress__count">
        Step {currentIndex + 1} of {total}
      </p>
    </div>
  );
}
