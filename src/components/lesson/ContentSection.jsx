import "./ContentSection.css";

// Renders a "content" section. Newer sections use an ordered `blocks` array so
// instructors can mix text, images, code, links, and video in any order. Older
// sections (seeded before blocks existed) use the fixed fields body/image/etc.,
// which we still render for backward compatibility.
//
// Text/code/link content is author-controlled (written by instructors in the
// editor), so rendering inline HTML in text blocks is intentional here.
export default function ContentSection({ section }) {
  const blocks = Array.isArray(section.blocks) ? section.blocks : null;

  return (
    <article className="content-section">
      {section.heading && <h2>{section.heading}</h2>}
      {blocks ? blocks.map(renderBlock) : renderLegacy(section)}
    </article>
  );
}

function renderBlock(block, i) {
  switch (block?.type) {
    case "text":
      return block.html ? (
        <p key={i} dangerouslySetInnerHTML={{ __html: block.html }} />
      ) : null;
    case "image":
      return block.src ? (
        <figure key={i} className="content-section__figure">
          <img src={block.src} alt={block.alt || ""} loading="lazy" />
        </figure>
      ) : null;
    case "code":
      return block.content ? (
        <pre key={i} className="content-section__code">
          <code>{block.content}</code>
        </pre>
      ) : null;
    case "link":
      return block.url ? (
        <p key={i} className="content-section__link">
          <a href={block.url} target="_blank" rel="noreferrer">
            {block.text || block.url} ↗
          </a>
        </p>
      ) : null;
    case "video":
      return block.embedId ? (
        <div key={i} className="content-section__media">
          <iframe
            src={`https://www.youtube.com/embed/${block.embedId}`}
            title={block.title || "Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null;
    default:
      return null;
  }
}

// Legacy fixed-order rendering for sections created before the block model.
function renderLegacy(section) {
  return (
    <>
      {section.body?.map((para, i) => (
        <p key={`b-${i}`} dangerouslySetInnerHTML={{ __html: para }} />
      ))}

      {section.image && (
        <figure className="content-section__figure">
          <img src={section.image.src} alt={section.image.alt} loading="lazy" />
        </figure>
      )}

      {section.bodyBelow?.map((para, i) => (
        <p key={`a-${i}`} dangerouslySetInnerHTML={{ __html: para }} />
      ))}

      {section.media?.type === "youtube" && (
        <div className="content-section__media">
          <iframe
            src={`https://www.youtube.com/embed/${section.media.embedId}`}
            title={section.media.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {section.code && (
        <pre className="content-section__code">
          <code>{section.code.content}</code>
        </pre>
      )}

      {section.link && (
        <p className="content-section__link">
          <a href={section.link.url} target="_blank" rel="noreferrer">
            {section.link.text} ↗
          </a>
        </p>
      )}
    </>
  );
}
