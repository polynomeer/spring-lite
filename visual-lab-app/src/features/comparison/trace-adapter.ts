import type { TraceAdapter, TraceDiagramBranchOption, TraceDiagramNode } from "../types";

function coreNode(
  id: string,
  label: string,
  detail: string,
  lane: string,
  tone: "success" | "info" | "warning" | "error"
): TraceDiagramNode {
  return { id, label, detail, lane, tone, status: "active" };
}

function sideItem(
  id: string,
  label: string,
  detail: string,
  tone: "success" | "info" | "warning" | "error",
  status: "taken" | "idle" = "taken"
): TraceDiagramBranchOption {
  return { id, label, detail, tone, status };
}

function buildComparisonDiff(scenario: string, locale: "ko" | "en") {
  const ko = locale === "ko";

  if (scenario === "di") {
    return {
      title: ko ? "DI 비교 다이어그램" : "DI Comparison Diagram",
      subtitle: ko ? "두 런타임 모두 객체 그래프를 만들지만, 무엇을 드러내고 무엇을 일반화하는지 다르다." : "Both runtimes build object graphs, but they differ in what stays explicit versus generalized.",
      sharedCore: [
        coreNode("di-meta", ko ? "메타데이터 수집" : "Collect metadata", ko ? "스캔 또는 등록을 통해 빈 메타데이터를 모은다." : "Collect bean metadata through scanning or registration.", "Shared Core", "success"),
        coreNode("di-resolve", ko ? "의존성 해결" : "Resolve dependencies", ko ? "생성 순서와 주입 대상을 계산한다." : "Compute creation order and injection targets.", "Shared Core", "success"),
        coreNode("di-create", ko ? "객체 생성" : "Create objects", ko ? "관리 객체 그래프를 만든다." : "Construct the managed object graph.", "Shared Core", "success")
      ],
      liteSide: [
        sideItem("di-lite-1", ko ? "작은 BeanFactory 경로" : "Compact BeanFactory path", ko ? "등록과 생성 알고리즘이 짧아서 독자가 한 번에 따라가기 쉽다." : "The registration and creation algorithm stays small enough to read in one sitting.", "info"),
        sideItem("di-lite-2", ko ? "적은 확장 레이어" : "Fewer extension layers", ko ? "전략 객체 수가 적어 핵심 개념이 직접 보인다." : "Fewer strategy objects keep the core concept visible.", "info")
      ],
      springSide: [
        sideItem("di-spring-1", ko ? "많은 후처리기 계층" : "Many post-processor layers", ko ? "동일한 개념이 더 많은 후처리기와 SPI 위에 일반화된다." : "The same idea is generalized through many post-processors and SPIs.", "warning"),
        sideItem("di-spring-2", ko ? "넓은 확장 표면" : "Broader extension surface", ko ? "실무 유연성은 커지지만 초행 독자에게는 더 넓은 추적 범위를 요구한다." : "Production flexibility grows, but first-time readers must trace a wider surface.", "warning")
      ]
    };
  }

  if (scenario === "mvc") {
    return {
      title: ko ? "MVC 비교 다이어그램" : "MVC Comparison Diagram",
      subtitle: ko ? "front controller 개념은 같지만, 전략 체인의 폭과 세분화 정도가 다르다." : "The front-controller concept is shared, while the breadth of the strategy chain differs.",
      sharedCore: [
        coreNode("mvc-dispatch", ko ? "요청 디스패치" : "Dispatch request", ko ? "중앙 디스패처가 요청 오케스트레이션을 맡는다." : "A central dispatcher owns request orchestration.", "Shared Core", "success"),
        coreNode("mvc-handler", ko ? "핸들러 선택" : "Select handler", ko ? "경로와 메서드에 따라 핸들러를 찾는다." : "Choose a handler from path and method metadata.", "Shared Core", "success"),
        coreNode("mvc-response", ko ? "응답 작성" : "Write response", ko ? "반환값을 HTTP 응답으로 바꾼다." : "Convert the return value into an HTTP response.", "Shared Core", "success")
      ],
      liteSide: [
        sideItem("mvc-lite-1", ko ? "작은 resolver 체인" : "Small resolver chain", ko ? "argument resolution과 JSON 처리 흐름이 짧다." : "Argument resolution and JSON handling stay compact.", "info"),
        sideItem("mvc-lite-2", ko ? "직접 추적 가능한 dispatch" : "Directly traceable dispatch", ko ? "매핑, 검증, 렌더링 순서를 바로 읽을 수 있다." : "Mapping, validation, and rendering order are directly visible.", "info")
      ],
      springSide: [
        sideItem("mvc-spring-1", ko ? "넓은 message conversion" : "Broader message conversion", ko ? "message converters와 binding 전략이 대폭 확장된다." : "Message converters and binding strategies expand significantly.", "warning"),
        sideItem("mvc-spring-2", ko ? "다양한 advice 통합" : "Richer advice integration", ko ? "controller advice, return handling, binding hooks가 더 풍부하다." : "Controller advice, return handling, and binding hooks are richer.", "warning")
      ]
    };
  }

  return {
    title: ko ? "트랜잭션 비교 다이어그램" : "Transaction Comparison Diagram",
    subtitle: ko ? "프록시 경계라는 핵심은 같지만, 정책 엔진과 통합 계층의 폭이 크게 다르다." : "The proxy boundary is shared, but the policy engine and integration surface are much broader in Spring.",
    sharedCore: [
      coreNode("tx-proxy", ko ? "프록시 경계 진입" : "Enter proxy boundary", ko ? "@Transactional이 비즈니스 메서드 진입을 감싼다." : "@Transactional wraps business method entry.", "Shared Core", "success"),
      coreNode("tx-unit", ko ? "작업 단위 제어" : "Control unit of work", ko ? "begin, exit, rollback 정책을 적용한다." : "Apply begin, exit, and rollback policy.", "Shared Core", "success"),
      coreNode("tx-outcome", ko ? "최종 결과 결정" : "Determine final outcome", ko ? "commit 또는 rollback으로 경계를 닫는다." : "Close the boundary with commit or rollback.", "Shared Core", "success")
    ],
    liteSide: [
      sideItem("tx-lite-1", ko ? "REQUIRED 중심 모델" : "REQUIRED-centered model", ko ? "전파와 rollback-only가 비교적 직접적으로 드러난다." : "Propagation and rollback-only remain comparatively explicit.", "info"),
      sideItem("tx-lite-2", ko ? "단일 데이터소스 집중" : "Single data source focus", ko ? "학습용으로 작은 정책 엔진을 유지한다." : "Keeps a small policy engine focused on learning.", "info")
    ],
    springSide: [
      sideItem("tx-spring-1", ko ? "더 넓은 propagation/attribute" : "Broader propagation and attributes", ko ? "더 많은 전파 정책과 속성 조합을 다룬다." : "Supports a much broader set of propagation rules and attributes.", "warning"),
      sideItem("tx-spring-2", ko ? "풍부한 통합 지점" : "Richer integration points", ko ? "동기화, 자원 전략, 데이터 접근 통합이 더 넓다." : "Synchronization, resource strategies, and data access integration are broader.", "warning")
    ]
  };
}

export const comparisonTraceAdapter: TraceAdapter = {
  labId: "comparison",
  adapt(trace, locale) {
    const ko = locale === "ko";
    return {
      accent: ko ? "개념 브리지" : "concept bridge",
      insight: {
        title: ko ? "Comparison 포인트" : "Comparison Focus",
        bullets: [
          ko
            ? `"${trace.scenario}" 시나리오는 구현 범위를 비교하기 전에 공통 아키텍처 개념을 먼저 매핑하기 위한 것입니다.`
            : `The "${trace.scenario}" scenario is for mapping shared architectural ideas before comparing implementation breadth.`,
          ko
            ? "가운데 shared core를 먼저 읽고, 그 다음 왼쪽의 학습용 단순화와 오른쪽의 실제 Spring 확장을 비교하는 순서가 가장 좋습니다."
            : "Read the shared core first, then compare the learning-oriented simplifications on the left with the real Spring expansions on the right.",
          ko
            ? "나중에 두 서버가 같은 스키마를 내리게 되면 이 trace들이 dual-runtime live 비교의 출발점이 됩니다."
            : "These traces are good staging points for later dual-runtime live comparison once both servers emit the same schema."
        ]
      },
      comparisonDiff: buildComparisonDiff(trace.scenario, locale)
    };
  }
};
