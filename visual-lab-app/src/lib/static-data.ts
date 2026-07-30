export const labCards = [
  {
    id: "playground",
    title: "Playground",
    stage: "ported",
    summary: "Small loop visualizations for AOP advice order, transaction boundaries, and MVC dispatch.",
    capabilities: ["scenario presets", "timeline", "lane view", "snapshot"],
    now: "Common trace UI now renders compact AOP and MVC playground scenarios.",
    next: "Add richer live interceptor event streams once the backend emits normalized playground traces."
  },
  {
    id: "container",
    title: "Container Lab",
    stage: "ported",
    summary: "Bootstrap and bean lifecycle exploration with more reusable state and rendering primitives.",
    capabilities: ["bootstrap phases", "bean lifecycle", "proxy exposure", "destroy hooks"],
    now: "Bootstrap and lifecycle traces are now available through the shared LabTrace renderer.",
    next: "Add finer-grained container controls and eventually connect runtime inspection endpoints."
  },
  {
    id: "example-flow",
    title: "Example Flow Lab",
    stage: "live connected",
    summary: "Best first live integration target because it already maps cleanly to HTTP, service, tx, and JDBC phases.",
    capabilities: ["request runner", "response metrics", "SQL lane", "error branches"],
    now: "Static and live traces both render through the same schema, including rollback and validation branches.",
    next: "Add request-form level editing and dual-run compare between static and live results."
  },
  {
    id: "comparison",
    title: "Comparison Dashboard",
    stage: "ported",
    summary: "Natural home for dual-target comparison once spring-lite and Spring Boot trace APIs share a common schema.",
    capabilities: ["dual target", "diff view", "concept bridge", "study guidance"],
    now: "DI, MVC, and transaction comparison scenarios are available as common trace views.",
    next: "Promote these static comparisons into a true dual-runtime dashboard with normalized live traces."
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
  { labId: "example-flow", scenario: "validation", label: "Example Flow / Validation Failure" },
  { labId: "example-flow", scenario: "not-found", label: "Example Flow / Missing Order" },
  { labId: "example-flow", scenario: "rollback", label: "Example Flow / Rollback After Insert" },
  { labId: "playground", scenario: "aop-success", label: "Playground / AOP Success" },
  { labId: "playground", scenario: "aop-rollback", label: "Playground / AOP Rollback" },
  { labId: "playground", scenario: "mvc-validation", label: "Playground / MVC Validation" },
  { labId: "container", scenario: "bootstrap-full", label: "Container / Bootstrap Full" },
  { labId: "container", scenario: "lifecycle-proxy", label: "Container / Lifecycle Proxy" },
  { labId: "comparison", scenario: "di", label: "Comparison / Dependency Injection" },
  { labId: "comparison", scenario: "mvc", label: "Comparison / MVC" },
  { labId: "comparison", scenario: "tx", label: "Comparison / Transactions" },
  { labId: "example-flow", scenario: "service-error", label: "Example Flow / Service Error" }
] as const;
