import "./ContentSection.css";

// Renders a "content" section: heading, paragraphs, image, embedded media,
// code block, and an external link. Shared by the student LessonPage and the
// instructor editor's live preview so both look identical.
//
// Body paragraphs may contain inline <code>/<strong>/<em>/<a> from the lesson
// data. That content is author-controlled (written by instructors in the
// editor), so rendering it as HTML is intentional here.
export default function ContentSection({ section }) {
  return (
    <article className="content-section">
      {section.heading && <h2>{section.heading}</h2>}

      {section.body?.map((para, i) => (
        <p key={i} dangerouslySetInnerHTML={{ __html: para }} />
      ))}

      {section.image && (
        <figure className="content-section__figure">
          <img src={section.image.src} alt={section.image.alt} loading="lazy" />
        </figure>
      )}

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
    </article>
  );
}
