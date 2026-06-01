import "./ui.css";

// Simple surface container. Set `interactive` for hover lift (e.g. clickable
// lesson cards). Renders as a <button> when an onClick is provided so it stays
// keyboard-accessible.
export default function Card({
  interactive = false,
  className = "",
  as,
  children,
  ...props
}) {
  const classes = [
    "card",
    interactive ? "card--interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const Tag = as || (props.onClick ? "button" : "div");

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}
