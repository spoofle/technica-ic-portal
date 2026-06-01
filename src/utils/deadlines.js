// =========================================================================
// Deadline helpers — turn a due-date string into human-friendly status.
// -------------------------------------------------------------------------
// Due dates are plain ISO strings ("2026-06-07") in lessons.js. These helpers
// compute how soon something is due and what tone to show it in.
// =========================================================================

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Parse an ISO date ("2026-06-07") as a LOCAL date at end of day, so a due
// date counts the whole day as still "on time".
function parseDue(dueDate) {
  const [y, m, d] = dueDate.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59);
}

// Whole days from now until the due date (negative = past).
export function daysUntil(dueDate) {
  const now = new Date();
  const due = parseDue(dueDate);
  return Math.ceil((due - now) / MS_PER_DAY);
}

// Pretty date like "Sat, Jun 7".
export function formatDueDate(dueDate) {
  const due = parseDue(dueDate);
  return due.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Returns { status, tone, label } describing the deadline.
//   status: "done" | "overdue" | "due-today" | "due-soon" | "upcoming"
//   tone:   maps to a badge color class
// Pass isComplete=true to show a "Completed" state instead of a countdown.
export function getDeadlineStatus(dueDate, isComplete = false) {
  if (isComplete) {
    return { status: "done", tone: "success", label: "Completed" };
  }
  if (!dueDate) {
    return { status: "none", tone: "neutral", label: "No due date" };
  }

  const days = daysUntil(dueDate);
  const when = formatDueDate(dueDate);

  if (days < 0) {
    const ago = Math.abs(days);
    return {
      status: "overdue",
      tone: "error",
      label: `Overdue by ${ago} day${ago === 1 ? "" : "s"}`,
    };
  }
  if (days === 0) {
    return { status: "due-today", tone: "error", label: "Due today" };
  }
  if (days <= 3) {
    return {
      status: "due-soon",
      tone: "warn",
      label: `Due in ${days} day${days === 1 ? "" : "s"} · ${when}`,
    };
  }
  return { status: "upcoming", tone: "neutral", label: `Due ${when}` };
}
