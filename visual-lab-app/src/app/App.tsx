import { useState } from "react";
import { labCards, roadmapSteps } from "../lib/static-data";
import type { RuntimeMode } from "../lib/types";

export function App() {
  const [mode, setMode] = useState<RuntimeMode>("static");

  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">spring-lite / visual-lab-app</p>
          <h1>Separated frontend scaffold for the next visual lab phase</h1>
          <p className="hero-text">
            This app is the starting point for moving the current static learning pages into a reusable
            frontend that can support both static simulations and live runtime traces from spring-lite
            or Spring Boot servers.
          </p>
        </div>
        <div className="hero-panel">
          <strong>Runtime Mode</strong>
          <div className="toggle-row">
            <button
              className={mode === "static" ? "toggle active" : "toggle"}
              type="button"
              onClick={() => setMode("static")}
            >
              Static Simulation
            </button>
            <button
              className={mode === "live" ? "toggle active" : "toggle"}
              type="button"
              onClick={() => setMode("live")}
            >
              Live Runtime
            </button>
          </div>
          <p className="mode-note">
            {mode === "static"
              ? "Use local scenario providers and preserve the no-server learning path."
              : "Connect trace APIs, request runners, and comparison targets once backend contracts exist."}
          </p>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Feature Surface</p>
              <h2>Lab Modules</h2>
            </div>
            <span className="badge">{labCards.length} planned views</span>
          </div>
          <div className="card-grid">
            {labCards.map((card) => (
              <article className="card" key={card.title}>
                <div className="card-top">
                  <div>
                    <h3>{card.title}</h3>
                    <p>{card.summary}</p>
                  </div>
                  <span className="tag">{card.stage}</span>
                </div>
                <div className="chip-row">
                  {card.capabilities.map((capability) => (
                    <span className="chip" key={capability}>
                      {capability}
                    </span>
                  ))}
                </div>
                <div className="detail-list">
                  <div>
                    <span>Now</span>
                    <p>{card.now}</p>
                  </div>
                  <div>
                    <span>Next</span>
                    <p>{card.next}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel side-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Migration Plan</p>
              <h2>Scaffold Goals</h2>
            </div>
          </div>
          <ol className="roadmap-list">
            {roadmapSteps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
          <div className="info-box">
            <strong>Suggested next implementation</strong>
            <p>
              Add a shared <code>LabTrace</code> schema and wire the first live mode against
              <code>example-flow-lab</code> request traces.
            </p>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Project Layout</p>
              <h2>Initial Frontend Structure</h2>
            </div>
          </div>
          <pre className="code-block">{`visual-lab-app/
  src/
    app/
      App.tsx
    lib/
      static-data.ts
      types.ts
    styles.css
  index.html
  package.json
  tsconfig.app.json
  tsconfig.node.json
  vite.config.ts`}</pre>
        </section>
      </main>
    </div>
  );
}
