import { useRef, useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import {
  processImageToDataUrl,
  imageFromClipboard,
  dataUrlBytes,
  IMAGE_WARN_BYTES,
} from "../../utils/image";
import "./ImageField.css";

// Image picker for the lesson editor. An instructor can paste (⌘/Ctrl+V),
// drag-and-drop, or choose a file — the image is downscaled in the browser and
// embedded inline (base64) in the lesson. A manual URL field remains for
// pasting a link instead. `image` is the { src, alt } object; onChange reports
// updates.
export default function ImageField({ image, onChange }) {
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const src = image?.src || "";
  const alt = image?.alt || "";
  const isEmbedded = src.startsWith("data:");

  async function addFile(file) {
    if (!file) return;
    setError("");
    setWarning("");
    setBusy(true);
    try {
      const dataUrl = await processImageToDataUrl(file);
      const bytes = dataUrlBytes(dataUrl);
      if (bytes > IMAGE_WARN_BYTES) {
        setWarning(
          `This image is ~${Math.round(bytes / 1024)} KB after shrinking. ` +
            "Lessons have a ~1 MB total limit, so avoid adding many large images."
        );
      }
      onChange({ ...image, src: dataUrl });
    } catch (err) {
      console.error("Image processing failed:", err);
      setError(err.message || "Couldn't process that image. Try another file.");
    } finally {
      setBusy(false);
    }
  }

  function handlePaste(e) {
    const file = imageFromClipboard(e);
    if (file) {
      e.preventDefault();
      addFile(file);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) addFile(file);
  }

  return (
    <div className="image-field">
      {src && (
        <figure className="image-field__preview">
          <img src={src} alt={alt} />
          <Button
            type="button"
            variant="ghost"
            className="btn--tiny"
            onClick={() => {
              setWarning("");
              onChange({ ...image, src: "" });
            }}
          >
            Remove image
          </Button>
        </figure>
      )}

      {!src && (
        <div
          className={`image-field__drop ${dragOver ? "image-field__drop--over" : ""}`}
          tabIndex={0}
          role="button"
          onPaste={handlePaste}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {busy ? (
            <span>Processing…</span>
          ) : (
            <>
              <strong>Paste an image here (⌘/Ctrl + V)</strong>
              <span>or click to choose a file · or drag one in</span>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => addFile(e.target.files?.[0])}
          />
        </div>
      )}

      {error && <div className="alert alert--error">{error}</div>}
      {warning && <div className="alert alert--warn">{warning}</div>}

      <Input
        id="image-alt"
        label="Alt text (describes the image for screen readers)"
        value={alt}
        onChange={(e) => onChange({ ...image, alt: e.target.value })}
      />

      {/* Manual URL entry — hidden for embedded images (the data URL is huge). */}
      {!isEmbedded && (
        <Input
          id="image-src"
          label="…or paste an image URL"
          value={src}
          placeholder="https://…"
          onChange={(e) => onChange({ ...image, src: e.target.value })}
        />
      )}
    </div>
  );
}
