// =========================================================================
// time — date formatting that accepts Firestore Timestamps, ISO strings, or
// Date objects. (new Date()/Date.now() are fine here — this is browser code.)
// =========================================================================
function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  return null;
}

export function formatDate(value) {
  const d = toDate(value);
  if (!d || isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
