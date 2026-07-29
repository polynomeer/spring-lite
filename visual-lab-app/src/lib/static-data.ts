export const labCards = [
  {
    title: "Playground",
    stage: "port first",
    summary: "Small loop visualizations for AOP advice order, transaction boundaries, and MVC dispatch.",
    capabilities: ["scenario presets", "timeline", "lane view", "snapshot"],
    now: "Currently implemented as static HTML with embedded scenario logic.",
    next: "Move scenario state into reusable React components and add provider abstraction for live traces."
  },
  {
    title: "Container Lab",
    stage: "port first",
    summary: "Bootstrap and bean lifecycle exploration with more reusable state and rendering primitives.",
    capabilities: ["bootstrap phases", "bean lifecycle", "proxy exposure", "destroy hooks"],
    now: "Static controls and renderer live in one HTML file.",
    next: "Split into bootstrap and lifecycle feature modules backed by shared cards and trace views."
  },
  {
    title: "Example Flow Lab",
    stage: "live target #1",
    summary: "Best first live integration target because it already maps cleanly to HTTP, service, tx, and JDBC phases.",
    capabilities: ["request runner", "response metrics", "SQL lane", "error branches"],
    now: "Static scenario branching approximates request outcomes.",
    next: "Bind request forms to lab APIs and render returned trace payloads in the same UI shell."
  },
  {
    title: "Comparison Dashboard",
    stage: "live target #2",
    summary: "Natural home for dual-target comparison once spring-lite and Spring Boot trace APIs share a common schema.",
    capabilities: ["dual target", "diff view", "concept bridge", "study guidance"],
    now: "Static educational comparison content.",
    next: "Normalize trace and metadata payloads so the UI can compare both runtimes side by side."
  }
] as const;

export const roadmapSteps = [
  {
    title: "1. Parity",
    description: "Recreate the current static pages in a reusable component model without changing the learning flow."
  },
  {
    title: "2. Providers",
    description: "Separate static scenario providers from live API clients so one UI can render both modes."
  },
  {
    title: "3. Live Example Flow",
    description: "Connect the example flow page to real request and trace endpoints as the first runtime-backed lab."
  },
  {
    title: "4. Trace Infrastructure",
    description: "Promote shared schemas, replay controls, and comparison utilities into common frontend libraries."
  }
] as const;

export const tracePresetOptions = [
  { labId: "example-flow", scenario: "create", label: "Example Flow / Create Order" },
  { labId: "playground", scenario: "aop-success", label: "Playground / AOP Success" }
] as const;
