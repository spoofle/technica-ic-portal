import Input from "../ui/Input";
import Button from "../ui/Button";
import RichTextField from "./RichTextField";
import ImageField from "./ImageField";
import ContentSection from "../lesson/ContentSection";

// =========================================================================
// SectionForm — renders the editable subform for one lesson section, choosing
// the right fields based on section.type. Calls onChange(updatedSection) on
// every edit. Used by LessonEditor.
//
// Supported types: content | quiz | reflection | dragdrop | coding
// =========================================================================

// ---- Small reusable editors ----

// Edit an array of strings (e.g. content body paragraphs, coding tasks). When
// `rich` is set, each entry uses the formatting toolbar (RichTextField) so
// instructors don't have to type HTML tags by hand.
function StringList({ label, values = [], onChange, placeholder, rich = false }) {
  function update(i, v) {
    const next = [...values];
    next[i] = v;
    onChange(next);
  }
  function add() {
    onChange([...values, ""]);
  }
  function remove(i) {
    onChange(values.filter((_, idx) => idx !== i));
  }
  return (
    <div className="field">
      <span className="editor__small-label">{label}</span>
      {values.map((v, i) => (
        <div key={i} className="editor__list-row">
          {rich ? (
            <RichTextField
              id={`${label}-${i}`}
              rows={2}
              value={v}
              placeholder={placeholder}
              onChange={(val) => update(i, val)}
            />
          ) : (
            <Input
              as="textarea"
              id={`${label}-${i}`}
              rows={2}
              value={v}
              placeholder={placeholder}
              onChange={(e) => update(i, e.target.value)}
            />
          )}
          <Button
            type="button"
            variant="ghost"
            className="btn--tiny"
            onClick={() => remove(i)}
          >
            ✕
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" className="btn--tiny" onClick={add}>
        + Add
      </Button>
    </div>
  );
}

// ---- Content blocks ----
//
// A content section's body is an ordered array of blocks the instructor can mix
// freely: text, image, code, link, video. Older sections stored fixed fields;
// legacyToBlocks() converts those to blocks the first time they're edited.

const BLOCK_TYPES = [
  { id: "text", label: "Text" },
  { id: "image", label: "Image" },
  { id: "code", label: "Code" },
  { id: "link", label: "Link" },
  { id: "video", label: "Video" },
];

function blankBlock(type) {
  switch (type) {
    case "image":
      return { type: "image", src: "", alt: "" };
    case "code":
      return { type: "code", language: "html", content: "" };
    case "link":
      return { type: "link", text: "", url: "" };
    case "video":
      return { type: "video", embedId: "", title: "" };
    case "text":
    default:
      return { type: "text", html: "" };
  }
}

// Convert a legacy content section (fixed fields) into the block array, keeping
// the original render order (body, image, text-below, video, code, link).
function legacyToBlocks(section) {
  const blocks = [];
  (section.body || []).forEach((html) => blocks.push({ type: "text", html }));
  if (section.image)
    blocks.push({ type: "image", src: section.image.src || "", alt: section.image.alt || "" });
  (section.bodyBelow || []).forEach((html) => blocks.push({ type: "text", html }));
  if (section.media?.embedId)
    blocks.push({ type: "video", embedId: section.media.embedId, title: section.media.title || "" });
  if (section.code)
    blocks.push({ type: "code", language: section.code.language || "html", content: section.code.content || "" });
  if (section.link)
    blocks.push({ type: "link", text: section.link.text || "", url: section.link.url || "" });
  return blocks;
}

function blockHasContent(b) {
  switch (b?.type) {
    case "text":
      return !!b.html?.trim();
    case "image":
      return !!b.src;
    case "code":
      return !!b.content?.trim();
    case "link":
      return !!b.url?.trim();
    case "video":
      return !!b.embedId?.trim();
    default:
      return false;
  }
}

// The editable fields for one block, switched on its type.
function BlockBody({ block, onChange }) {
  switch (block.type) {
    case "text":
      return (
        <RichTextField
          id="block-text"
          value={block.html || ""}
          placeholder="Write a paragraph. Select text and click B / I / </> / 🔗 to format it."
          onChange={(html) => onChange({ html })}
        />
      );
    case "image":
      return (
        <ImageField
          image={{ src: block.src, alt: block.alt }}
          onChange={(img) => onChange({ src: img.src, alt: img.alt })}
        />
      );
    case "code":
      return (
        <>
          <Input
            id="block-code-lang"
            label="Language"
            value={block.language || ""}
            onChange={(e) => onChange({ language: e.target.value })}
          />
          <Input
            as="textarea"
            id="block-code-content"
            label="Code"
            rows={5}
            value={block.content || ""}
            onChange={(e) => onChange({ content: e.target.value })}
          />
        </>
      );
    case "link":
      return (
        <>
          <Input
            id="block-link-text"
            label="Link text"
            value={block.text || ""}
            onChange={(e) => onChange({ text: e.target.value })}
          />
          <Input
            id="block-link-url"
            label="URL"
            value={block.url || ""}
            onChange={(e) => onChange({ url: e.target.value })}
          />
        </>
      );
    case "video":
      return (
        <>
          <Input
            id="block-video-id"
            label="YouTube video ID"
            hint="The part after watch?v= — e.g. dQw4w9WgXcQ"
            value={block.embedId || ""}
            onChange={(e) => onChange({ embedId: e.target.value })}
          />
          <Input
            id="block-video-title"
            label="Title"
            value={block.title || ""}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </>
      );
    default:
      return null;
  }
}

// ---- Per-type forms ----

// Live preview of a content section, rendered with the SAME component students
// see — so "how it looks" in the editor matches the lesson page exactly.
function ContentPreview({ section }) {
  const blocks = Array.isArray(section.blocks) ? section.blocks : [];
  const hasContent = section.heading || blocks.some(blockHasContent);
  return (
    <div className="preview-box">
      <span className="preview-box__label">Preview — how students see it</span>
      {hasContent ? (
        <div className="preview-box__body">
          <ContentSection section={section} />
        </div>
      ) : (
        <p className="preview-box__empty">
          Add a block above and your formatted content appears here.
        </p>
      )}
    </div>
  );
}

function ContentForm({ section, set }) {
  // Work in block mode. Migrate a legacy section to blocks on first edit, and
  // drop the old fixed fields so there's a single source of truth.
  const blocks = Array.isArray(section.blocks)
    ? section.blocks
    : legacyToBlocks(section);

  function commit(nextBlocks) {
    set({
      blocks: nextBlocks,
      body: undefined,
      bodyBelow: undefined,
      image: undefined,
      code: undefined,
      link: undefined,
      media: undefined,
    });
  }
  const updateBlock = (i, patch) =>
    commit(blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  const addBlock = (type) => commit([...blocks, blankBlock(type)]);
  const removeBlock = (i) => commit(blocks.filter((_, idx) => idx !== i));
  function moveBlock(i, dir) {
    const j = dir === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  }

  return (
    <>
      <Input
        id="heading"
        label="Heading"
        value={section.heading || ""}
        onChange={(e) => set({ heading: e.target.value })}
      />

      <span className="editor__small-label">
        Content blocks — add text, images, code, links, or video in any order
      </span>

      {blocks.map((block, i) => (
        <div key={i} className="editor__section-card">
          <div className="editor__section-head">
            <span className="editor__section-type">
              {i + 1}. {block.type}
            </span>
            <div className="editor__section-actions">
              <Button
                type="button"
                variant="ghost"
                className="btn--tiny"
                onClick={() => moveBlock(i, "up")}
                disabled={i === 0}
              >
                ▲
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="btn--tiny"
                onClick={() => moveBlock(i, "down")}
                disabled={i === blocks.length - 1}
              >
                ▼
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="btn--tiny"
                onClick={() => removeBlock(i)}
              >
                Delete
              </Button>
            </div>
          </div>
          <BlockBody block={block} onChange={(patch) => updateBlock(i, patch)} />
        </div>
      ))}

      <div className="editor__add-bar">
        <span className="editor__small-label">Add block:</span>
        {BLOCK_TYPES.map((t) => (
          <Button
            key={t.id}
            type="button"
            variant="secondary"
            className="btn--tiny"
            onClick={() => addBlock(t.id)}
          >
            + {t.label}
          </Button>
        ))}
      </div>

      <ContentPreview section={{ ...section, blocks }} />
    </>
  );
}

function QuizForm({ section, set }) {
  const options = section.options || [];
  function setOption(i, patch) {
    const next = options.map((o, idx) => (idx === i ? { ...o, ...patch } : o));
    set({ options: next });
  }
  function addOption() {
    const id = String.fromCharCode(97 + options.length); // a, b, c…
    set({ options: [...options, { id, text: "" }] });
  }
  function removeOption(i) {
    set({ options: options.filter((_, idx) => idx !== i) });
  }
  return (
    <>
      <Input
        id="question"
        label="Question"
        value={section.question || ""}
        onChange={(e) => set({ question: e.target.value })}
      />
      <span className="editor__small-label">Answer options</span>
      {options.map((o, i) => (
        <div key={i} className="editor__list-row">
          <label className="editor__checkbox" title="Mark correct">
            <input
              type="radio"
              name="correct"
              checked={section.correctOptionId === o.id}
              onChange={() => set({ correctOptionId: o.id })}
            />
            ✓
          </label>
          <Input
            id={`opt-id-${i}`}
            value={o.id}
            placeholder="id"
            onChange={(e) => setOption(i, { id: e.target.value })}
            style={{ maxWidth: 70 }}
          />
          <Input
            id={`opt-text-${i}`}
            value={o.text}
            placeholder="Option text"
            onChange={(e) => setOption(i, { text: e.target.value })}
          />
          <Button type="button" variant="ghost" className="btn--tiny" onClick={() => removeOption(i)}>
            ✕
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" className="btn--tiny" onClick={addOption}>
        + Add option
      </Button>
      <Input
        as="textarea"
        id="explanation"
        label="Explanation (shown after answering)"
        rows={2}
        value={section.explanation || ""}
        onChange={(e) => set({ explanation: e.target.value })}
      />
    </>
  );
}

function ReflectionForm({ section, set }) {
  return (
    <>
      <Input
        as="textarea"
        id="prompt"
        label="Prompt"
        rows={2}
        value={section.prompt || ""}
        onChange={(e) => set({ prompt: e.target.value })}
      />
      <Input
        id="helper"
        label="Helper text"
        value={section.helper || ""}
        onChange={(e) => set({ helper: e.target.value })}
      />
    </>
  );
}

function DragDropForm({ section, set }) {
  const items = section.items || [];
  const categories = section.categories || [];

  function setItem(i, patch) {
    set({ items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  }
  function addItem() {
    set({ items: [...items, { id: `item${items.length + 1}`, text: "" }] });
  }
  function removeItem(i) {
    set({ items: items.filter((_, idx) => idx !== i) });
  }

  function setCategory(i, patch) {
    set({
      categories: categories.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    });
  }
  function addCategory() {
    set({
      categories: [
        ...categories,
        { id: `cat${categories.length + 1}`, title: "", correctItemIds: [] },
      ],
    });
  }
  function removeCategory(i) {
    set({ categories: categories.filter((_, idx) => idx !== i) });
  }
  function toggleItemInCategory(catIdx, itemId, checked) {
    const cat = categories[catIdx];
    const ids = new Set(cat.correctItemIds || []);
    if (checked) ids.add(itemId);
    else ids.delete(itemId);
    setCategory(catIdx, { correctItemIds: [...ids] });
  }

  return (
    <>
      <Input
        id="prompt"
        label="Prompt"
        value={section.prompt || ""}
        onChange={(e) => set({ prompt: e.target.value })}
      />

      <span className="editor__small-label">Draggable items</span>
      {items.map((it, i) => (
        <div key={i} className="editor__list-row">
          <Input
            id={`item-id-${i}`}
            value={it.id}
            placeholder="id"
            onChange={(e) => setItem(i, { id: e.target.value })}
            style={{ maxWidth: 90 }}
          />
          <Input
            id={`item-text-${i}`}
            value={it.text}
            placeholder="Item text"
            onChange={(e) => setItem(i, { text: e.target.value })}
          />
          <Button type="button" variant="ghost" className="btn--tiny" onClick={() => removeItem(i)}>
            ✕
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" className="btn--tiny" onClick={addItem}>
        + Add item
      </Button>

      <span className="editor__small-label">Categories (check the items that belong in each)</span>
      {categories.map((c, i) => (
        <div key={i} className="editor__section-card">
          <div className="editor__list-row">
            <Input
              id={`cat-id-${i}`}
              value={c.id}
              placeholder="id"
              onChange={(e) => setCategory(i, { id: e.target.value })}
              style={{ maxWidth: 90 }}
            />
            <Input
              id={`cat-title-${i}`}
              value={c.title}
              placeholder="Category title"
              onChange={(e) => setCategory(i, { title: e.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              className="btn--tiny"
              onClick={() => removeCategory(i)}
            >
              ✕
            </Button>
          </div>
          <div>
            {items.map((it) => (
              <label key={it.id} className="editor__checkbox">
                <input
                  type="checkbox"
                  checked={(c.correctItemIds || []).includes(it.id)}
                  onChange={(e) => toggleItemInCategory(i, it.id, e.target.checked)}
                />
                {it.text || it.id}
              </label>
            ))}
          </div>
        </div>
      ))}
      <Button type="button" variant="secondary" className="btn--tiny" onClick={addCategory}>
        + Add category
      </Button>
    </>
  );
}

function CodingForm({ section, set }) {
  return (
    <>
      <Input
        id="heading"
        label="Heading"
        value={section.heading || ""}
        onChange={(e) => set({ heading: e.target.value })}
      />
      <div className="editor__grid">
        <Input
          id="difficulty"
          label="Difficulty label"
          value={section.difficulty || ""}
          placeholder="Difficulty 1 · Easy"
          onChange={(e) => set({ difficulty: e.target.value })}
        />
        <Input
          id="difficultyTone"
          label="Tone (mint / sun / coral)"
          value={section.difficultyTone || ""}
          onChange={(e) => set({ difficultyTone: e.target.value })}
        />
      </div>
      <Input
        id="goal"
        label="Goal"
        value={section.goal || ""}
        onChange={(e) => set({ goal: e.target.value })}
      />
      <StringList
        label="Tasks (each is a checkbox for the student; use the toolbar to format)"
        values={section.tasks || []}
        onChange={(tasks) => set({ tasks })}
        rich
      />
      <Input
        as="textarea"
        id="stuckPrompt"
        label="“I'm stuck” AI prompt"
        rows={3}
        value={section.stuckPrompt || ""}
        onChange={(e) => set({ stuckPrompt: e.target.value })}
      />
    </>
  );
}

export default function SectionForm({ section, onChange }) {
  // Merge a partial patch into the section and bubble up.
  const set = (patch) => onChange({ ...section, ...patch });

  return (
    <div className="editor__form">
      <div className="editor__grid">
        <Input
          id="section-id"
          label="Section id (unique within the lesson)"
          value={section.id || ""}
          onChange={(e) => set({ id: e.target.value })}
        />
        <Input
          id="section-label"
          label="Tab label"
          value={section.label || ""}
          placeholder="Learn / Check-in / Activity…"
          onChange={(e) => set({ label: e.target.value })}
        />
      </div>

      {section.type === "content" && <ContentForm section={section} set={set} />}
      {section.type === "quiz" && <QuizForm section={section} set={set} />}
      {section.type === "reflection" && <ReflectionForm section={section} set={set} />}
      {section.type === "dragdrop" && <DragDropForm section={section} set={set} />}
      {section.type === "coding" && <CodingForm section={section} set={set} />}
    </div>
  );
}
