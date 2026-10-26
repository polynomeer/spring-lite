import { useEffect, useState } from "react";
import { App } from "./App";
import { ReplayView } from "../features/replay/ReplayView";
import { useLabTheme } from "../theme/theme";

type View = "replay" | "console";

const views: { id: View; label: string }[] = [
  { id: "replay", label: "리플레이" },
  { id: "console", label: "기존 랩 콘솔" }
];

function viewFromHash(): View {
  const id = window.location.hash.replace(/^#\/?/, "");
  return views.find((view) => view.id === id)?.id ?? views[0].id;
}

export function Shell() {
  const { theme, toggleTheme } = useLabTheme();
  const [view, setView] = useState<View>(viewFromHash);

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    document.body.dataset.view = view;
  }, [view]);

  return (
    <div className={`lab-shell${view === "console" ? " is-console" : ""}`}>
      <header className="lab-topbar">
        <a className="lab-brand" href="#/" style={{ color: "inherit", textDecoration: "none" }}>
          <span className="lab-brand-mark" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28">
              <path d="M8 18c3.5-1 6-4.5 7-10 1 4.5 3 7.5 5.5 8.5" fill="none" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </span>
          spring-lite <small>lab</small>
        </a>
        <nav className="lab-nav" aria-label="주요 메뉴">
          {views.map((item) => (
            <a key={item.id} href={`#/${item.id}`} aria-current={item.id === view ? "page" : undefined}>
              {item.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="lab-button icon"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "라이트 테마로 전환" : "다크 테마로 전환"}
          title={theme === "dark" ? "라이트 테마" : "다크 테마"}
        >
          {theme === "dark" ? (
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <circle cx="9" cy="9" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M3.7 14.3l1.4-1.4M12.9 5.1l1.4-1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path d="M14.5 11.2A6 6 0 0 1 6.8 3.5a6 6 0 1 0 7.7 7.7z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </header>
      {view === "replay" && <ReplayView />}
      {view === "console" && (
        <div className="lab-legacy-frame">
          <App />
        </div>
      )}
    </div>
  );
}
