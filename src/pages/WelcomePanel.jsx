// Left-hand welcome panel shared by the Sign In and Sign Up pages.
export default function WelcomePanel() {
  return (
    <div className="auth__welcome">
      <div className="auth__brand">
        <span className="auth__logo" aria-hidden="true">
          ✦
        </span>
        <div className="auth__brand-text">
          <strong>Technica</strong>
          <span>Inclusive Communities</span>
        </div>
      </div>

      <h1>Technica Summer Fellowship</h1>
      <p>
        Follow along with live lessons, learn through interactive activities, and work on projects throughout the summer.
      </p>

      <ul className="auth__points">
        <li>
          <span aria-hidden="true">📚</span> Guided lessons on computer science concepts
        </li>
        <li>
          <span aria-hidden="true">✏️</span> Quizzes and homework activities
        </li>
        <li>
          <span aria-hidden="true">🌟</span> Your progress, saved automatically
        </li>
      </ul>
    </div>
  );
}
