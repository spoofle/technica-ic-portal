import "./ui.css";

// Labelled text input. Always renders a <label> tied to the input via id for
// accessibility. Use `as="textarea"` for multi-line fields.
export default function Input({
  id,
  label,
  hint,
  as = "input",
  className = "",
  ...props
}) {
  const Tag = as;
  const fieldClass = as === "textarea" ? "field__textarea" : "field__input";

  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <Tag id={id} className={`${fieldClass} ${className}`.trim()} {...props} />
      {hint && <span className="field__hint">{hint}</span>}
    </div>
  );
}
