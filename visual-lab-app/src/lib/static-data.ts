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

export const questionCards = [
  {
    id: "tx-rollback",
    labId: "example-flow",
    scenario: "rollback",
    difficulty: "intermediate",
    supportsLive: true,
    questionEn: "Where does the transaction start and why does it roll back?",
    questionKo: "트랜잭션은 어디서 시작되고 왜 롤백되는가",
    goalEn: "Trace one request across controller, service, transaction, and JDBC boundaries.",
    goalKo: "하나의 요청이 컨트롤러, 서비스, 트랜잭션, JDBC 경계를 어떻게 지나는지 추적한다.",
    readPathEn: "Read summary -> flow -> references",
    readPathKo: "요약 -> 흐름 -> 참고 순서로 읽기",
    moduleLabelEn: "Example Flow Lab",
    moduleLabelKo: "Example Flow Lab"
  },
  {
    id: "mvc-error-branch",
    labId: "playground",
    scenario: "mvc-validation",
    difficulty: "beginner",
    supportsLive: false,
    questionEn: "At which stage does an HTTP request turn into 400 or 500?",
    questionKo: "HTTP 요청은 어느 단계에서 400 또는 500으로 갈리는가",
    goalEn: "See routing, binding, validation, controller, and response writing as one branch path.",
    goalKo: "라우팅, 바인딩, 검증, 컨트롤러, 응답 작성이 하나의 분기 경로로 어떻게 이어지는지 본다.",
    readPathEn: "Read branch summary -> steps -> lanes",
    readPathKo: "분기 요약 -> 단계 -> 레인 순서로 읽기",
    moduleLabelEn: "Playground",
    moduleLabelKo: "Playground"
  },
  {
    id: "container-proxy",
    labId: "container",
    scenario: "lifecycle-proxy",
    difficulty: "intermediate",
    supportsLive: false,
    questionEn: "When does a bean stay raw and when is it exposed as a proxy?",
    questionKo: "빈은 언제 원본으로 남고 언제 프록시로 노출되는가",
    goalEn: "Follow bean creation, post-processing, proxy wrapping, and destroy registration.",
    goalKo: "빈 생성, 후처리, 프록시 래핑, 종료 콜백 등록 순서를 따라간다.",
    readPathEn: "Read summary -> snapshot -> references",
    readPathKo: "요약 -> 스냅샷 -> 참고 순서로 읽기",
    moduleLabelEn: "Container Lab",
    moduleLabelKo: "Container Lab"
  },
  {
    id: "spring-compare",
    labId: "comparison",
    scenario: "tx",
    difficulty: "advanced",
    supportsLive: true,
    questionEn: "What matches real Spring and what is intentionally simplified?",
    questionKo: "실제 Spring과 무엇이 같고 무엇이 의도적으로 단순화되었는가",
    goalEn: "Map the same concept across Spring Lite and Spring with one comparison scenario.",
    goalKo: "하나의 비교 시나리오로 같은 개념을 Spring Lite와 Spring 양쪽에 대응시킨다.",
    readPathEn: "Read comparison summary -> differences -> references",
    readPathKo: "비교 요약 -> 차이점 -> 참고 순서로 읽기",
    moduleLabelEn: "Comparison Dashboard",
    moduleLabelKo: "Comparison Dashboard"
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
