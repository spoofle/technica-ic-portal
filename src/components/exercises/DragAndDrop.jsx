import { useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Button from "../ui/Button";
import "./exercises.css";

// ---- A single draggable chip ----
function DraggableItem({ id, text }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <button
      ref={setNodeRef}
      style={style}
      className={`dnd-chip ${isDragging ? "dnd-chip--dragging" : ""}`}
      {...listeners}
      {...attributes}
    >
      {text}
    </button>
  );
}

// ---- A droppable zone (the item pool or a category) ----
function DropZone({ id, title, children, tone = "" }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`dnd-zone ${tone} ${isOver ? "dnd-zone--over" : ""}`}
    >
      {title && <h4 className="dnd-zone__title">{title}</h4>}
      <div className="dnd-zone__items">{children}</div>
    </div>
  );
}

// Drag items into the correct categories. `savedValue` is a map of
// itemId -> zoneId. Calls onComplete with the placement + score on check.
export default function DragAndDrop({ section, savedValue, onComplete }) {
  // placement: { [itemId]: zoneId }, where zoneId === "pool" means unplaced.
  const initial =
    savedValue ||
    Object.fromEntries(section.items.map((it) => [it.id, "pool"]));
  const [placement, setPlacement] = useState(initial);
  const [checked, setChecked] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;
    setPlacement((prev) => ({ ...prev, [active.id]: over.id }));
    setChecked(false);
  }

  function itemsIn(zoneId) {
    return section.items.filter((it) => placement[it.id] === zoneId);
  }

  function scoreFor(category) {
    const placed = itemsIn(category.id);
    const correct = placed.filter((it) =>
      category.correctItemIds.includes(it.id)
    ).length;
    return { correct, total: category.correctItemIds.length };
  }

  const allPlaced = section.items.every((it) => placement[it.id] !== "pool");
  const totalCorrect = section.categories.reduce(
    (sum, c) => sum + scoreFor(c).correct,
    0
  );

  function handleCheck() {
    setChecked(true);
    onComplete?.({ placement, score: totalCorrect, total: section.items.length });
  }

  return (
    <div className="exercise">
      <span className="badge badge--sun">Drag &amp; Drop</span>
      <h3 className="exercise__title">{section.prompt}</h3>
      <p className="dnd-hint">
        Tip: click a chip and press space, then use arrow keys to move it — or
        drag with your mouse.
      </p>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <DropZone id="pool" title="Items to sort" tone="dnd-zone--pool">
          {itemsIn("pool").map((it) => (
            <DraggableItem key={it.id} id={it.id} text={it.text} />
          ))}
          {itemsIn("pool").length === 0 && (
            <span className="dnd-empty">All sorted! 🎉</span>
          )}
        </DropZone>

        <div className="dnd-categories">
          {section.categories.map((cat) => (
            <DropZone key={cat.id} id={cat.id} title={cat.title}>
              {itemsIn(cat.id).map((it) => {
                const correct = cat.correctItemIds.includes(it.id);
                return (
                  <div
                    key={it.id}
                    className={
                      checked
                        ? correct
                          ? "dnd-result dnd-result--ok"
                          : "dnd-result dnd-result--no"
                        : ""
                    }
                  >
                    <DraggableItem id={it.id} text={it.text} />
                  </div>
                );
              })}
            </DropZone>
          ))}
        </div>
      </DndContext>

      <div className="exercise__actions">
        <Button onClick={handleCheck} disabled={!allPlaced}>
          Check my answers
        </Button>
        {checked && (
          <div
            className={`exercise__feedback ${
              totalCorrect === section.items.length
                ? "exercise__feedback--good"
                : "exercise__feedback--try"
            }`}
            role="status"
          >
            <strong>
              You placed {totalCorrect} of {section.items.length} correctly
              {totalCorrect === section.items.length ? " — perfect! 🎉" : "."}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
}
