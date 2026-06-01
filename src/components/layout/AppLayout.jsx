import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getModules } from "../../data/lessons";
import { useAuth } from "../../context/AuthContext";
import "./AppLayout.css";

// Main authenticated layout: sidebar (lesson nav) + top bar + page content.
export default function AppLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/signin");
  }

  const displayName =
    currentUser?.displayName || currentUser?.email?.split("@")[0] || "friend";
  const initial = displayName.charAt(0).toUpperCase();

  const modules = getModules();

  return (
    <div className="layout">
      <a href="#main-content" className="skip-link">
        Skip to lesson content
      </a>

      {/* ---------- Sidebar ---------- */}
      <aside
        className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}
        aria-label="Lesson navigation"
      >
        <div className="sidebar__brand">
          <span className="sidebar__logo" aria-hidden="true">
            ✦
          </span>
          <div>
            <strong className="sidebar__brand-name">Technica</strong>
            <span className="sidebar__brand-sub">Inclusive Communities</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {modules.map((mod) => (
            <div key={mod.name} className="sidebar__group">
              <p className="sidebar__heading">{mod.name}</p>
              <ul>
                {mod.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <NavLink
                      to={`/lessons/${lesson.id}`}
                      className={({ isActive }) =>
                        `sidebar__link ${
                          isActive ? "sidebar__link--active" : ""
                        }`
                      }
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sidebar__link-text">{lesson.title}</span>
                      {lesson.required && (
                        <span
                          className="sidebar__link-flag"
                          title="Required"
                          aria-label="Required"
                        >
                          ★
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Dark overlay behind the sidebar on mobile */}
      {sidebarOpen && (
        <div
          className="layout__overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ---------- Main column ---------- */}
      <div className="layout__main">
        <header className="topbar">
          <button
            className="topbar__menu-btn"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle lesson menu"
            aria-expanded={sidebarOpen}
          >
            ☰
          </button>

          <NavLink to="/" className="topbar__home">
            Home
          </NavLink>

          <div className="topbar__spacer" />

          <div className="topbar__user">
            <span className="topbar__avatar" aria-hidden="true">
              {initial}
            </span>
            <span className="topbar__name">Hi, {displayName}!</span>
            <button className="topbar__logout" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </header>

        <main id="main-content" className="layout__content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
