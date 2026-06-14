// =========================================================================
// image — client-side image processing for the lesson editor.
// -------------------------------------------------------------------------
// Instructors paste/drop/choose an image; we downscale it in the browser and
// return a base64 data URL that gets stored inline in the lesson document.
// This avoids Firebase Storage (which needs the paid Blaze plan) entirely.
//
// Firestore documents are capped at ~1 MB total, and a lesson holds all its
// sections in one doc, so images are downscaled aggressively to stay small.
// =========================================================================

// Soft ceiling for a single embedded image. Above this we warn the instructor
// (several large images could otherwise blow the 1 MB lesson-doc limit).
export const IMAGE_WARN_BYTES = 450 * 1024;

// Load a File/Blob into an <img> element.
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read that image file."));
    };
    img.src = url;
  });
}

// Roughly how many bytes a base64 data URL represents.
export function dataUrlBytes(dataUrl) {
  const comma = dataUrl.indexOf(",");
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Math.floor((b64.length * 3) / 4);
}

// Downscale an image File to a base64 data URL, capped at maxDim on its longest
// side. Prefers WebP (smaller, keeps transparency) and falls back to JPEG with
// a white background. Returns the data URL string.
export async function processImageToDataUrl(
  file,
  { maxDim = 1000, quality = 0.82 } = {}
) {
  if (!file) throw new Error("No image provided.");
  if (!file.type?.startsWith("image/")) {
    throw new Error("That file isn't an image.");
  }

  const img = await loadImage(file);
  const { width, height } = img;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  // Does the browser actually encode WebP? (Safari historically didn't.)
  const supportsWebp = canvas
    .toDataURL("image/webp")
    .startsWith("data:image/webp");

  if (!supportsWebp) {
    // JPEG has no transparency — paint white so transparent areas don't go black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(img, 0, 0, w, h);

  const mime = supportsWebp ? "image/webp" : "image/jpeg";
  return canvas.toDataURL(mime, quality);
}

// Pull the first image File out of a paste event's clipboard, or null.
export function imageFromClipboard(e) {
  const items = e.clipboardData?.items || [];
  for (const item of items) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      return item.getAsFile();
    }
  }
  return null;
}
