import { getDeadlineStatus } from "../utils/deadlines";
import "./DeadlineBadge.css";

// Small pill showing a lesson's deadline status (overdue / due soon / etc).
// Pass `required` to show a "Required" marker alongside.
export default function DeadlineBadge({ dueDate, isComplete, required }) {
  const { status, tone, label } = getDeadlineStatus(dueDate, isComplete);

  const icon =
    status === "done"
      ? "✓"
      : status === "overdue" || status === "due-today"
      ? "⏰"
      : "📅";

  return (
    <span className="deadline">
      {required && status !== "done" && (
        <span className="deadline__required">Required</span>
      )}
      <span className={`deadline__badge deadline__badge--${tone}`}>
        <span aria-hidden="true">{icon}</span>
        {label}
      </span>
    </span>
  );
}
