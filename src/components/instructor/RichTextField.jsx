import { useRef } from "react";
import "./RichTextField.css";

// Escape angle brackets & ampersands so instructors can show LITERAL tags
// (e.g. typing <p> and hitting "Code" yields <code>&lt;p&gt;</code>, which
// renders as the visible text "<p>").
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// A textarea with a small formatting toolbar. Buttons wrap the current text
// selection in the inline HTML the lesson renderer understands, so instructors
// never have to type tags by hand. The stored value is HTML (matching the
// existing curriculum and the ContentSection renderer).
export default function RichTextField({
  id,
  label,
  value = "",
  onChange,
  placeholder,
  rows = 3,
}) {
  const ref = useRef(null);

  // Wrap the selected text with `before`/`after`. If nothing is selected,
  // insert the markers at the cursor so the instructor can type between them.
  function wrap(before, after, transform) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const inner = transform ? transform(selected) : selected;
    const next = value.slice(0, start) + before + inner + after + value.slice(end);
    onChange(next);

    // Restore focus and place the cursor just inside the inserted markers.
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + before.length + inner.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function addLink() {
    const url = window.prompt("Link URL (https://…)");
    if (!url) return;
    wrap(`<a href="${url}" target="_blank">`, "</a>");
  }

  return (
    <div className="field rich-field">
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="rich-field__toolbar" role="toolbar" aria-label="Text formatting">
        <button type="button" onClick={() => wrap("<strong>", "</strong>")} title="Bold">
          <strong>B</strong>
        </button>
        <button type="button" onClick={() => wrap("<em>", "</em>")} title="Italic">
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => wrap("<code>", "</code>", escapeHtml)}
          title="Code — also escapes < and > so you can show literal tags"
        >
          {"</>"}
        </button>
        <button type="button" onClick={addLink} title="Insert link">
          🔗
        </button>
      </div>
      <textarea
        id={id}
        ref={ref}
        className="field__textarea"
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
