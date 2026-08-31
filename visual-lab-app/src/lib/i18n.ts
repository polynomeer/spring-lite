import type { LabTrace } from "./types";

export type Locale = "en" | "ko";

export interface UiText {
  appEyebrow: string;
  heroTitle: string;
  heroText: string;
  quickRun: string;
  quickRunBody: string;
  questionGuide: string;
  questionGuideBody: string;
  howToUse: string;
  howToUseStep1: string;
  howToUseStep2: string;
  howToUseStep3: string;
  scenarioLibrary: string;
  resultWorkspace: string;
  resultWorkspaceBody: string;
  supportingContext: string;
  supportingContextBody: string;
  runtimeMode: string;
  staticSimulation: string;
  liveRuntime: string;
  staticModeNote: string;
  liveModeNote: string;
  liveEndpointPrefix: string;
  liveEndpointProxy: string;
  runSelectedTrace: string;
  refreshTrace: string;
  rerunLast: string;
  featureSurface: string;
  labModules: string;
  labFamilies: string;
  now: string;
  next: string;
  migrationPlan: string;
  scaffoldGoals: string;
  currentStatus: string;
  currentStatusBody: string;
  traceContract: string;
  providerPreview: string;
  staticProvider: string;
  liveProvider: string;
  allLabs: string;
  tracePreset: string;
  selectedRequest: string;
  lastExecuted: string;
  selectionChanged: string;
  selectionSynced: string;
  lastRun: string;
  liveSignal: string;
  staticReplay: string;
  localStaticProvider: string;
  tracePipelineActive: string;
  tracePipelinePending: string;
  tracePipelineReady: string;
  tracePipelineActiveDetail: (labId: string, scenario: string, mode: string) => string;
  tracePipelinePendingDetail: (selectedLabId: string, selectedScenario: string, selectedMode: string, executedLabId: string, executedScenario: string, executedMode: string) => string;
  tracePipelineReadyDetail: (labId: string, scenario: string, mode: string) => string;
  requestPayload: string;
  loadingTrace: string;
  resolvingTrace: string;
  traceLoadingFailed: string;
  runFocus: string;
  thisRunAnswers: string;
  recommendedReading: string;
  selectedQuestion: string;
  liveReady: string;
  staticOnly: string;
  difficultyBeginner: string;
  difficultyIntermediate: string;
  difficultyAdvanced: string;
  executionTarget: string;
  rerunHint: string;
  resultGuide: string;
  resultGuideBody: string;
  lastSuccessfulRun: string;
  projectLayout: string;
  frontendStructure: string;
  loadedTrace: string;
  featureAdapter: string;
  executionPath: string;
  activePath: string;
  alternatePath: string;
  stateTransition: string;
  primaryLifecycle: string;
  sideEffects: string;
  comparisonDiff: string;
  sharedCore: string;
  liteSide: string;
  springSide: string;
  overview: string;
  flowView: string;
  flowTimeline: string;
  replayControls: string;
  replayPlay: string;
  replayPause: string;
  replayPrevious: string;
  replayNext: string;
  replayAuto: string;
  replayManual: string;
  selectedStep: string;
  relatedLanes: string;
  deepLinks: string;
  steps: string;
  lanes: string;
  snapshot: string;
  references: string;
  relatedFiles: string;
  refs: string;
  watch: string;
  why: string;
  nextLabel: string;
  notRunYet: string;
}

const uiTextByLocale: Record<Locale, UiText> = {
  en: {
    appEyebrow: "spring-lite / visual-lab-app",
    heroTitle: "Unified visual lab app for all spring-lite study modules",
    heroText: "Choose one Spring question, run a focused scenario, and read the result as a guided execution story instead of a raw trace dump.",
    quickRun: "Quick Run",
    quickRunBody: "Pick a question first, then adjust the scenario only if you need a different branch.",
    questionGuide: "Question Guide",
    questionGuideBody: "Start from the concept you want to verify, not from the module name.",
    howToUse: "How To Use",
    howToUseStep1: "Choose one question card.",
    howToUseStep2: "Adjust mode or scenario if needed, then run once.",
    howToUseStep3: "Read summary first, then flow, then references.",
    scenarioLibrary: "Scenario Library",
    resultWorkspace: "Result Workspace",
    resultWorkspaceBody: "The result pane explains what happened, where the branch changed, and what to inspect next.",
    supportingContext: "Supporting Context",
    supportingContextBody: "Open deeper module notes only when you need structure, roadmap, or file layout details.",
    runtimeMode: "Runtime Mode",
    staticSimulation: "Static Simulation",
    liveRuntime: "Live Runtime",
    staticModeNote: "Explore all four labs through normalized study traces with no backend dependency.",
    liveModeNote: "Run example-flow against the live example-app now, and extend the same contract to more labs later.",
    liveEndpointPrefix: "Configured API base URL:",
    liveEndpointProxy: "Using relative live endpoint",
    runSelectedTrace: "Run Selected Trace",
    refreshTrace: "Refresh Trace",
    rerunLast: "Re-run Last",
    featureSurface: "Feature Surface",
    labModules: "Lab Modules",
    labFamilies: "lab families",
    now: "Now",
    next: "Next",
    migrationPlan: "Migration Plan",
    scaffoldGoals: "Scaffold Goals",
    currentStatus: "Current status",
    currentStatusBody: "The shared LabTrace schema now covers playground, container, example-flow, and comparison scenarios in one app. Live runtime execution is already wired for example-flow, while the remaining labs have static parity through the same renderer and adapter structure.",
    traceContract: "Trace Contract",
    providerPreview: "Provider Preview",
    staticProvider: "static provider",
    liveProvider: "live provider",
    allLabs: "All Labs",
    tracePreset: "Trace preset",
    selectedRequest: "Selected Request",
    lastExecuted: "Last Executed",
    selectionChanged: "selection changed",
    selectionSynced: "selection synced",
    lastRun: "last run",
    liveSignal: "live signal",
    staticReplay: "static replay",
    localStaticProvider: "local static provider",
    tracePipelineActive: "Trace pipeline active",
    tracePipelinePending: "Trace run pending",
    tracePipelineReady: "Trace pipeline ready",
    tracePipelineActiveDetail: (labId, scenario, mode) => `Refreshing ${labId}:${scenario} through the ${mode} provider.`,
    tracePipelinePendingDetail: (selectedLabId, selectedScenario, selectedMode, executedLabId, executedScenario, executedMode) =>
      `Selected ${selectedLabId}:${selectedScenario} (${selectedMode}), but the result pane still shows the last run ${executedLabId}:${executedScenario} (${executedMode}). Run the selected trace to refresh it.`,
    tracePipelineReadyDetail: (labId, scenario, mode) => `Watching ${labId}:${scenario} from the ${mode} provider.`,
    requestPayload: "Request payload",
    loadingTrace: "Loading trace",
    resolvingTrace: "Resolving provider output for the last executed request.",
    traceLoadingFailed: "Trace loading failed",
    runFocus: "Run Focus",
    thisRunAnswers: "This run answers",
    recommendedReading: "Recommended reading order",
    selectedQuestion: "Selected Question",
    liveReady: "live ready",
    staticOnly: "static only",
    difficultyBeginner: "beginner",
    difficultyIntermediate: "intermediate",
    difficultyAdvanced: "advanced",
    executionTarget: "Execution Target",
    rerunHint: "Selection changed. Run again to refresh the result.",
    resultGuide: "Result Guide",
    resultGuideBody: "Start with the conclusion card, then inspect the flow panels only where the branch changes.",
    lastSuccessfulRun: "Last successful run",
    projectLayout: "Project Layout",
    frontendStructure: "Frontend Structure",
    loadedTrace: "Loaded Trace",
    featureAdapter: "Feature Adapter",
    executionPath: "Execution Path",
    activePath: "active path",
    alternatePath: "alternate path",
    stateTransition: "State Transition",
    primaryLifecycle: "primary lifecycle",
    sideEffects: "side effects",
    comparisonDiff: "Comparison Diff",
    sharedCore: "shared core",
    liteSide: "spring-lite view",
    springSide: "Spring view",
    overview: "Overview",
    flowView: "Flow",
    flowTimeline: "Flow Timeline",
    replayControls: "Replay Controls",
    replayPlay: "Play",
    replayPause: "Pause",
    replayPrevious: "Previous",
    replayNext: "Next",
    replayAuto: "auto replay",
    replayManual: "manual focus",
    selectedStep: "Selected step",
    relatedLanes: "Related lanes",
    deepLinks: "References",
    steps: "Steps",
    lanes: "Lanes",
    snapshot: "Snapshot",
    references: "References",
    relatedFiles: "Related Files",
    refs: "refs",
    watch: "Watch",
    why: "Why",
    nextLabel: "Next",
    notRunYet: "Not run yet"
  },
  ko: {
    appEyebrow: "spring-lite / visual-lab-app",
    heroTitle: "spring-lite 학습 모듈 전체를 위한 통합 비주얼 랩 앱",
    heroText: "Spring 질문 하나를 고르고, 그 질문에 맞는 시나리오를 실행한 뒤, raw trace 대신 해석 가능한 실행 이야기로 결과를 읽는다.",
    quickRun: "빠른 실행",
    quickRunBody: "먼저 질문을 고르고, 다른 분기가 필요할 때만 시나리오를 조정한 뒤 실행합니다.",
    questionGuide: "질문 가이드",
    questionGuideBody: "랩 이름보다 지금 검증하고 싶은 개념에서 시작합니다.",
    howToUse: "사용 순서",
    howToUseStep1: "질문 카드 하나를 고릅니다.",
    howToUseStep2: "필요하면 모드와 시나리오를 조정한 뒤 한 번 실행합니다.",
    howToUseStep3: "요약을 먼저 읽고, 그다음 흐름과 참고 자료를 봅니다.",
    scenarioLibrary: "시나리오 라이브러리",
    resultWorkspace: "결과 워크스페이스",
    resultWorkspaceBody: "결과 패널은 무엇이 일어났는지, 어디서 분기되었는지, 다음에 무엇을 봐야 하는지를 먼저 설명합니다.",
    supportingContext: "보조 컨텍스트",
    supportingContextBody: "구조, 로드맵, 파일 배치 같은 상세 정보는 필요할 때만 펼쳐 봅니다.",
    runtimeMode: "실행 모드",
    staticSimulation: "정적 시뮬레이션",
    liveRuntime: "라이브 런타임",
    staticModeNote: "백엔드 없이 네 개 랩 전체를 정규화된 학습 trace로 탐색합니다.",
    liveModeNote: "현재는 example-flow를 실제 example-app과 연결해 실행하고, 이후 같은 계약을 다른 랩으로 확장합니다.",
    liveEndpointPrefix: "설정된 API 기준 URL:",
    liveEndpointProxy: "상대 경로 live endpoint 사용 중",
    runSelectedTrace: "선택한 Trace 실행",
    refreshTrace: "Trace 새로고침",
    rerunLast: "마지막 요청 다시 실행",
    featureSurface: "기능 구성",
    labModules: "랩 모듈",
    labFamilies: "개 랩 계열",
    now: "현재",
    next: "다음",
    migrationPlan: "이행 계획",
    scaffoldGoals: "스캐폴드 목표",
    currentStatus: "현재 상태",
    currentStatusBody: "공통 LabTrace 스키마는 이제 playground, container, example-flow, comparison 시나리오를 모두 하나의 앱에서 다룹니다. 라이브 런타임 실행은 example-flow에 이미 연결되어 있고, 나머지 랩은 같은 렌더러와 adapter 구조 위에서 정적 parity를 갖춘 상태입니다.",
    traceContract: "Trace 계약",
    providerPreview: "Provider 미리보기",
    staticProvider: "정적 provider",
    liveProvider: "라이브 provider",
    allLabs: "전체 랩",
    tracePreset: "Trace 프리셋",
    selectedRequest: "선택한 요청",
    lastExecuted: "마지막 실행 요청",
    selectionChanged: "선택값 변경됨",
    selectionSynced: "선택값 동기화됨",
    lastRun: "마지막 실행",
    liveSignal: "라이브 신호",
    staticReplay: "정적 리플레이",
    localStaticProvider: "로컬 정적 provider",
    tracePipelineActive: "Trace 파이프라인 실행 중",
    tracePipelinePending: "선택 변경됨, 실행 대기 중",
    tracePipelineReady: "Trace 파이프라인 대기 중",
    tracePipelineActiveDetail: (labId, scenario, mode) => `${labId}:${scenario} 요청을 ${mode} provider로 새로 불러오는 중입니다.`,
    tracePipelinePendingDetail: (selectedLabId, selectedScenario, selectedMode, executedLabId, executedScenario, executedMode) =>
      `선택한 값은 ${selectedLabId}:${selectedScenario} (${selectedMode})이지만, 결과 영역은 아직 마지막 실행 ${executedLabId}:${executedScenario} (${executedMode})를 보여주고 있습니다. 선택한 trace를 실행해야 결과가 갱신됩니다.`,
    tracePipelineReadyDetail: (labId, scenario, mode) => `${labId}:${scenario} 요청을 ${mode} provider 기준으로 관찰 중입니다.`,
    requestPayload: "요청 payload",
    loadingTrace: "Trace 로딩 중",
    resolvingTrace: "마지막으로 실행한 요청에 대한 provider 결과를 불러오는 중입니다.",
    traceLoadingFailed: "Trace 로딩 실패",
    runFocus: "이번 실행의 초점",
    thisRunAnswers: "이 실행이 답하는 질문",
    recommendedReading: "권장 읽기 순서",
    selectedQuestion: "선택한 질문",
    liveReady: "live 지원",
    staticOnly: "static 전용",
    difficultyBeginner: "입문",
    difficultyIntermediate: "중급",
    difficultyAdvanced: "심화",
    executionTarget: "실행 대상",
    rerunHint: "선택이 바뀌었습니다. 결과를 갱신하려면 다시 실행하세요.",
    resultGuide: "결과 읽기 가이드",
    resultGuideBody: "결론 카드를 먼저 읽고, 분기가 바뀌는 지점만 흐름 패널에서 확인하세요.",
    lastSuccessfulRun: "마지막 성공 실행",
    projectLayout: "프로젝트 구조",
    frontendStructure: "프런트엔드 구조",
    loadedTrace: "로드된 Trace",
    featureAdapter: "Feature Adapter",
    executionPath: "실행 경로",
    activePath: "실제 실행 경로",
    alternatePath: "대체 분기",
    stateTransition: "상태 전이",
    primaryLifecycle: "주요 생명주기",
    sideEffects: "부가 효과",
    comparisonDiff: "비교 차이도",
    sharedCore: "공통 코어",
    liteSide: "spring-lite 관점",
    springSide: "Spring 관점",
    overview: "개요",
    flowView: "흐름",
    flowTimeline: "흐름 타임라인",
    replayControls: "재생 컨트롤",
    replayPlay: "재생",
    replayPause: "정지",
    replayPrevious: "이전",
    replayNext: "다음",
    replayAuto: "자동 재생",
    replayManual: "수동 탐색",
    selectedStep: "선택 단계",
    relatedLanes: "관련 레인",
    deepLinks: "참고",
    steps: "단계",
    lanes: "레인",
    snapshot: "스냅샷",
    references: "참고 자료",
    relatedFiles: "관련 파일",
    refs: "개 참고",
    watch: "관찰 포인트",
    why: "의미",
    nextLabel: "다음 학습",
    notRunYet: "아직 실행 안 함"
  }
};

const labelTranslationsKo: Record<string, string> = {
  "HTTP Status": "HTTP 상태",
  "Tx Outcome": "트랜잭션 결과",
  "DB Effect": "DB 영향",
  "Active Steps": "활성 단계 수",
  "Final Status": "최종 상태",
  "Tx Depth Peak": "최대 트랜잭션 깊이",
  "Route Match": "라우트 일치",
  "Body Status": "본문 상태",
  "Response": "응답",
  "Config Classes": "설정 클래스 수",
  "Bean Definitions": "빈 정의 수",
  "Infra Layers": "인프라 계층",
  "Bean Scope": "빈 스코프",
  "Proxy Mode": "프록시 모드",
  "Destroy Hook": "종료 훅",
  "Overlap": "개념 중첩도",
  "Lite View": "spring-lite 관점",
  "Spring View": "Spring 관점",
  "Provider Status": "Provider 상태"
};

const titleTranslationsKo: Record<string, string> = {
  "Example Flow Trace": "Example Flow Trace",
  "Playground AOP Trace": "Playground AOP Trace",
  "Playground MVC Trace": "Playground MVC Trace",
  "Container Bootstrap Trace": "Container Bootstrap Trace",
  "Container Lifecycle Trace": "Container Lifecycle Trace",
  "Spring Lite vs Spring Comparison": "Spring Lite vs Spring 비교",
  "Live trace placeholder": "라이브 Trace 플레이스홀더"
};

const summaryTranslationsKo: Record<string, string> = {
  "example-flow:create": "주문 생성의 정상 경로를 보여주는 정적 기준 trace입니다.",
  "example-flow:validation": "요청 바인딩 후 검증에서 실패하여 서비스 로직 전에 종료되는 분기를 보여줍니다.",
  "example-flow:not-found": "존재하지 않는 주문 조회 시 서비스와 저장소 읽기 경로가 어떻게 실패하는지 보여줍니다.",
  "example-flow:rollback": "insert 이후 예외가 발생해 트랜잭션이 rollback되는 쓰기 분기입니다.",
  "example-flow:service-error": "JDBC 쓰기 전에 서비스 계층에서 예외가 발생하는 분기입니다.",
  "playground:aop-success": "AOP advice 체인과 트랜잭션 완료 순서를 간단히 보여주는 정적 trace입니다.",
  "playground:aop-rollback": "겉으로는 정상처럼 보여도 트랜잭션 결과가 rollback으로 바뀌는 AOP 변형 분기입니다.",
  "playground:mvc-validation": "MVC 바인딩 후 검증 실패로 400 응답이 되는 흐름을 압축해서 보여줍니다.",
  "container:bootstrap-full": "정의 등록, 조건 평가, 인프라 추가, singleton 생성까지 bootstrap 전 과정을 보여줍니다.",
  "container:lifecycle-proxy": "생성, 주입, 초기화, 프록시 노출, destroy 등록까지 bean lifecycle을 보여줍니다.",
  "comparison:di": "DI 관점에서 spring-lite와 Spring이 어떤 공통 구조와 차이를 가지는지 비교합니다.",
  "comparison:mvc": "MVC front controller 구조는 비슷하지만 전략 계층의 폭이 어떻게 달라지는지 비교합니다.",
  "comparison:tx": "트랜잭션 프록시, rollback-only, 정책 계층을 기준으로 spring-lite와 Spring을 비교합니다."
};

const labCardLocalizationKo: Record<string, { title: string; summary: string; now: string; next: string }> = {
  playground: {
    title: "플레이그라운드",
    summary: "AOP advice 순서, 트랜잭션 경계, MVC dispatch를 작은 루프로 시각화합니다.",
    now: "공통 trace UI에서 AOP와 MVC 기반 playground 시나리오를 렌더링합니다.",
    next: "백엔드가 정규화된 playground trace를 내리면 더 풍부한 live interceptor 이벤트를 연결합니다."
  },
  container: {
    title: "컨테이너 랩",
    summary: "bootstrap과 bean lifecycle을 재사용 가능한 trace 구조로 탐색합니다.",
    now: "bootstrap과 lifecycle trace를 공통 LabTrace 렌더러에서 볼 수 있습니다.",
    next: "더 세밀한 container 제어 UI와 런타임 inspection endpoint를 연결합니다."
  },
  "example-flow": {
    title: "예제 요청 흐름 랩",
    summary: "HTTP, service, transaction, JDBC 단계를 가장 자연스럽게 이어볼 수 있는 첫 live 대상입니다.",
    now: "정적 trace와 live trace가 rollback과 validation을 포함해 같은 스키마로 렌더링됩니다.",
    next: "요청 본문 편집과 static/live 결과 diff 비교를 추가합니다."
  },
  comparison: {
    title: "비교 대시보드",
    summary: "spring-lite와 실제 Spring을 같은 학습 시나리오 기준으로 비교하는 공간입니다.",
    now: "DI, MVC, 트랜잭션 비교 시나리오를 공통 trace 뷰로 볼 수 있습니다.",
    next: "정적 비교를 dual-runtime live 대시보드로 확장합니다."
  }
};

const roadmapLocalizationKo: Record<string, { title: string; description: string }> = {
  "1. Parity": { title: "1. Parity", description: "기존 정적 페이지 흐름을 유지하면서 재사용 가능한 컴포넌트 모델로 옮깁니다." },
  "2. Providers": { title: "2. Providers", description: "정적 시나리오 provider와 live API client를 분리해 하나의 UI에서 함께 렌더링합니다." },
  "3. Live Example Flow": { title: "3. Live Example Flow", description: "예제 요청 흐름을 실제 request/trace endpoint에 연결합니다." },
  "4. Trace Infrastructure": { title: "4. Trace Infrastructure", description: "공통 스키마, replay 제어, 비교 유틸리티를 프런트 공통 라이브러리로 끌어올립니다." }
};

const presetLabelLocalizationKo: Record<string, string> = {
  "Example Flow / Create Order": "Example Flow / 주문 생성",
  "Example Flow / Validation Failure": "Example Flow / 검증 실패",
  "Example Flow / Missing Order": "Example Flow / 주문 없음",
  "Example Flow / Rollback After Insert": "Example Flow / Insert 후 롤백",
  "Example Flow / Service Error": "Example Flow / 서비스 오류",
  "Playground / AOP Success": "Playground / AOP 성공",
  "Playground / AOP Rollback": "Playground / AOP 롤백",
  "Playground / MVC Validation": "Playground / MVC 검증 실패",
  "Container / Bootstrap Full": "Container / 전체 Bootstrap",
  "Container / Lifecycle Proxy": "Container / Lifecycle Proxy",
  "Comparison / Dependency Injection": "Comparison / 의존성 주입",
  "Comparison / MVC": "Comparison / MVC",
  "Comparison / Transactions": "Comparison / 트랜잭션"
};

export function getUiText(locale: Locale): UiText {
  return uiTextByLocale[locale];
}

export function localizeLabCards<T extends { id: string; title: string; summary: string; now: string; next: string }>(cards: readonly T[], locale: Locale) {
  if (locale === "en") {
    return cards;
  }
  return cards.map((card) => {
    const localized = labCardLocalizationKo[card.id];
    return localized ? { ...card, ...localized } : card;
  });
}

export function localizeRoadmapSteps<T extends { title: string; description: string }>(steps: readonly T[], locale: Locale) {
  if (locale === "en") {
    return steps;
  }
  return steps.map((step) => {
    const localized = roadmapLocalizationKo[step.title];
    return localized ? { ...step, ...localized } : step;
  });
}

export function localizePresetLabel(label: string, locale: Locale): string {
  if (locale === "en") {
    return label;
  }
  return presetLabelLocalizationKo[label] ?? label;
}

export function localizeTrace(trace: LabTrace, locale: Locale): LabTrace {
  if (locale === "en") {
    return trace;
  }
  const key = `${trace.labId}:${trace.scenario}`;
  return {
    ...trace,
    title: titleTranslationsKo[trace.title] ?? trace.title,
    summary: summaryTranslationsKo[key] ?? trace.summary,
    metrics: trace.metrics.map((metric) => ({
      ...metric,
      label: labelTranslationsKo[metric.label] ?? metric.label
    }))
  };
}

export function formatRunTime(date: Date, locale: Locale): string {
  return date.toLocaleTimeString(locale === "ko" ? "ko-KR" : "en-US");
}

export function localizeModeLabel(mode: "static" | "live", locale: Locale): string {
  if (locale === "en") {
    return mode;
  }
  return mode === "live" ? "라이브" : "정적";
}

export function translateUiError(message: string | null, locale: Locale): string | null {
  if (!message || locale === "en") {
    return message;
  }
  if (message.includes("VITE_LAB_API_BASE_URL is not configured")) {
    return "VITE_LAB_API_BASE_URL이 설정되지 않았습니다.";
  }
  if (message.includes("Unknown trace loading error")) {
    return "알 수 없는 Trace 로딩 오류입니다.";
  }
  if (message.includes("Live trace request failed")) {
    return message.replace("Live trace request failed", "라이브 Trace 요청 실패");
  }
  return message;
}
