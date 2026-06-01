import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import "./exercises.css";

// Open-ended journaling prompt. Auto-tracks unsaved edits and calls
// onSave(text) when the student saves their entry.
export default function Reflection({ section, savedValue, onComplete }) {
  const [text, setText] = useState(savedValue ?? "");
  const [savedText, setSavedText] = useState(savedValue ?? "");

  const dirty = text.trim() !== savedText.trim();

  function handleSave() {
    setSavedText(text);
    onComplete?.({ text });
  }

  return (
    <div className="exercise">
      <span className="badge badge--coral">Reflection</span>
      <h3 className="exercise__title">{section.prompt}</h3>

      <Input
        as="textarea"
        id={`${section.id}-journal`}
        label="Your journal entry"
        hint={section.helper}
        placeholder="Start writing your thoughts here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="exercise__actions">
        <Button onClick={handleSave} disabled={!dirty || !text.trim()}>
          {savedText && !dirty ? "Saved ✓" : "Save entry"}
        </Button>
        {savedText && !dirty && (
          <span className="exercise__saved-note">Your entry is saved.</span>
        )}
      </div>
    </div>
  );
}
