import Button from "./ui/Button";
import "./SaveBar.css";

// A "Save my progress" button plus a live status message. Shows clear feedback
// (saving / saved / unsaved / error) so saving is never silent.
export default function SaveBar({ status, error, lastSavedAt, onSave }) {
  function statusText() {
    switch (status) {
      case "saving":
        return "Saving…";
      case "saved":
        return lastSavedAt
          ? `Saved at ${lastSavedAt.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })} ✓`
          : "Saved ✓";
      case "unsaved":
        return "You have unsaved changes";
      case "error":
        return error || "Couldn't save.";
      default:
        return "";
    }
  }

  return (
    <div className={`savebar savebar--${status}`} role="status" aria-live="polite">
      <span className="savebar__status">{statusText()}</span>
      <Button
        onClick={onSave}
        disabled={status === "saving" || status === "idle"}
        variant={status === "error" ? "primary" : "secondary"}
      >
        {status === "saving" ? "Saving…" : "Save my progress"}
      </Button>
    </div>
  );
}
