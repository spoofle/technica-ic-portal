// =========================================================================
// progress — shared helpers for computing lesson completion from a student's
// saved progress. Used by the instructor's student-detail view (and safe to
// reuse anywhere that needs the same definition of "complete").
//
// A student's progress doc has shape:
//   { completedSections: { [sectionId]: true }, answers: {...} }
// A lesson counts as complete once every INTERACTIVE section is done. Pure
// "content" sections don't need an answer, so they're ignored — this mirrors
// the gating logic in LessonPage.
// =========================================================================

// The sections that actually require an answer (everything except content).
export function gradedSections(lesson) {
  return (lesson?.sections || []).filter((s) => s.type !== "content");
}

// Is the whole lesson complete for the given completedSections map?
export function isLessonComplete(lesson, completedMap = {}) {
  const graded = gradedSections(lesson);
  return graded.length > 0 && graded.every((s) => completedMap[s.id]);
}

// Returns { done, total, ratio } over the graded sections (0..1).
export function completionRatio(lesson, completedMap = {}) {
  const graded = gradedSections(lesson);
  const total = graded.length;
  const done = graded.filter((s) => completedMap[s.id]).length;
  return { done, total, ratio: total === 0 ? 0 : done / total };
}
