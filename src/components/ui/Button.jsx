import "./ui.css";

// Reusable button with variants: primary | secondary | ghost.
// Pass `block` for full width, `size="lg"` for a larger button.
export default function Button({
  variant = "primary",
  size,
  block = false,
  className = "",
  children,
  ...props
}) {
  const classes = [
    "btn",
    `btn--${variant}`,
    size === "lg" ? "btn--lg" : "",
    block ? "btn--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
