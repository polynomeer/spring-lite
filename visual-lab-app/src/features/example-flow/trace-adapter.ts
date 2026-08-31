import type { TraceAdapter, TraceAdapterResult, TraceDiagramBranchOption, TraceDiagramNode } from "../types";

function buildNode(id: string, label: string, detail: string, lane: string, tone: "success" | "info" | "warning" | "error", status: "active" | "inactive" = "active"): TraceDiagramNode {
  return { id, label, detail, lane, tone, status };
}

function buildBranch(id: string, label: string, detail: string, tone: "success" | "info" | "warning" | "error", status: "taken" | "idle"): TraceDiagramBranchOption {
  return { id, label, detail, tone, status };
}

function buildExecutionPath(scenario: string, locale: "ko" | "en") {
  const ko = locale === "ko";

  if (scenario === "create") {
    return {
      title: ko ? "실행 경로 다이어그램" : "Execution Path Diagram",
      subtitle: ko ? "정상 생성 경로가 서비스, 트랜잭션, JDBC까지 모두 이어진다." : "The happy path crosses service, transaction, and JDBC without deviation.",
      nodes: [
        buildNode("request", ko ? "요청 진입" : "Request entry", ko ? "DispatcherServlet이 POST 요청을 받는다." : "DispatcherServlet receives the POST request.", "Web", "info"),
        buildNode("binding", ko ? "본문 바인딩" : "Body binding", ko ? "JSON이 CreateOrderRequest로 역직렬화된다." : "JSON is deserialized into CreateOrderRequest.", "Web", "success"),
        buildNode("service", ko ? "서비스 호출" : "Service call", ko ? "컨트롤러가 서비스 프록시를 호출한다." : "The controller invokes the service proxy.", "Service", "success"),
        buildNode("tx", ko ? "트랜잭션 시작" : "Transaction begin", ko ? "트랜잭션 경계가 열리고 작업 단위가 시작된다." : "The transactional boundary opens the unit of work.", "Transaction", "success"),
        buildNode("jdbc", ko ? "JDBC 쓰기" : "JDBC write", ko ? "리포지토리가 insert SQL을 실행한다." : "The repository executes insert SQL.", "JDBC", "success"),
        buildNode("response", ko ? "응답 직렬화" : "Response write", ko ? "JSON 200 응답이 작성된다." : "A 200 JSON response is written.", "Web", "success")
      ],
      branches: [
        buildBranch("create-main", ko ? "commit 경로 선택" : "commit path taken", ko ? "검증과 서비스 실행이 모두 통과되어 commit으로 종료된다." : "Validation and service execution both pass, so the path exits through commit.", "success", "taken"),
        buildBranch("create-validation", ko ? "검증 실패 분기 미선택" : "validation branch not taken", ko ? "이번 실행에서는 @Valid 실패가 발생하지 않는다." : "This execution does not fail at @Valid.", "warning", "idle"),
        buildBranch("create-error", ko ? "서비스 오류 분기 미선택" : "service error branch not taken", ko ? "서비스 예외 및 rollback 경로는 이번 실행에 포함되지 않는다." : "Service exception and rollback are not part of this run.", "error", "idle")
      ]
    };
  }

  if (scenario === "validation") {
    return {
      title: ko ? "실행 경로 다이어그램" : "Execution Path Diagram",
      subtitle: ko ? "검증 단계에서 분기되어 서비스와 JDBC가 실행되지 않는다." : "The branch changes at validation, so service and JDBC never run.",
      nodes: [
        buildNode("request", ko ? "요청 진입" : "Request entry", ko ? "DispatcherServlet이 POST 요청을 받는다." : "DispatcherServlet receives the POST request.", "Web", "info"),
        buildNode("binding", ko ? "본문 바인딩" : "Body binding", ko ? "요청 본문은 정상적으로 매핑된다." : "The request body binds successfully.", "Web", "success"),
        buildNode("validation", ko ? "검증 실패" : "Validation failure", ko ? "제약 조건 위반으로 분기가 종료된다." : "Constraint violations terminate the branch here.", "Web", "error"),
        buildNode("service-skipped", ko ? "서비스 건너뜀" : "Service skipped", ko ? "서비스 프록시는 호출되지 않는다." : "The service proxy is never invoked.", "Service", "warning", "inactive"),
        buildNode("jdbc-skipped", ko ? "JDBC 건너뜀" : "JDBC skipped", ko ? "SQL 작업이 발생하지 않는다." : "No SQL work happens.", "JDBC", "warning", "inactive"),
        buildNode("error-response", ko ? "400 응답 작성" : "400 response write", ko ? "예외 해석기가 검증 오류 응답을 만든다." : "The resolver writes a validation error response.", "Web", "error")
      ],
      branches: [
        buildBranch("validation-main", ko ? "검증 오류 분기 선택" : "validation branch taken", ko ? "@Valid 단계에서 요청이 차단된다." : "The request is stopped at the @Valid stage.", "error", "taken"),
        buildBranch("validation-service", ko ? "서비스 진입 분기 미선택" : "service entry not taken", ko ? "트랜잭션과 서비스 메서드는 시작되지 않는다." : "The transaction and service method never start.", "warning", "idle"),
        buildBranch("validation-commit", ko ? "정상 commit 분기 미선택" : "happy commit not taken", ko ? "정상 생성 경로는 이번 실행과 무관하다." : "The successful create path is not part of this run.", "success", "idle")
      ]
    };
  }

  if (scenario === "rollback") {
    return {
      title: ko ? "실행 경로 다이어그램" : "Execution Path Diagram",
      subtitle: ko ? "쓰기 이후 예외가 발생해 rollback 경로가 선택된다." : "An error after the write switches the path into rollback.",
      nodes: [
        buildNode("request", ko ? "요청 진입" : "Request entry", ko ? "정상 생성과 같은 웹 진입점을 사용한다." : "The flow uses the same web entrypoint as the happy path.", "Web", "info"),
        buildNode("service", ko ? "서비스 호출" : "Service call", ko ? "서비스 프록시가 create-and-fail 경로를 실행한다." : "The service proxy enters the create-and-fail path.", "Service", "success"),
        buildNode("tx", ko ? "트랜잭션 시작" : "Transaction begin", ko ? "트랜잭션이 열린 상태에서 작업이 진행된다." : "Work proceeds inside an open transaction.", "Transaction", "success"),
        buildNode("jdbc", ko ? "insert 실행" : "insert executed", ko ? "row는 일단 기록되지만 아직 commit 전이다." : "The row is written before commit has happened.", "JDBC", "success"),
        buildNode("error", ko ? "서비스 예외 발생" : "Service throws", ko ? "서비스가 의도적으로 예외를 던진다." : "The service deliberately throws an exception.", "Service", "error"),
        buildNode("rollback", ko ? "rollback 수행" : "Rollback", ko ? "열린 연결이 rollback되고 쓰기 결과가 사라진다." : "The open connection rolls back and the write disappears.", "Transaction", "error")
      ],
      branches: [
        buildBranch("rollback-main", ko ? "rollback 분기 선택" : "rollback branch taken", ko ? "쓰기 이후 실패가 발생했기 때문에 rollback이 최종 결과가 된다." : "Failure after the write makes rollback the final outcome.", "error", "taken"),
        buildBranch("rollback-commit", ko ? "commit 분기 미선택" : "commit branch not taken", ko ? "정상 생성과 달리 commit에 도달하지 못한다." : "Unlike the happy path, this run never reaches commit.", "success", "idle"),
        buildBranch("rollback-validation", ko ? "검증 실패 분기 미선택" : "validation branch not taken", ko ? "실패 지점은 컨트롤러 이전이 아니라 서비스 내부다." : "The failure point is inside the service, not before controller work.", "warning", "idle")
      ]
    };
  }

  if (scenario === "service-error") {
    return {
      title: ko ? "실행 경로 다이어그램" : "Execution Path Diagram",
      subtitle: ko ? "트랜잭션은 열리지만 JDBC 쓰기 전에 예외가 발생한다." : "The transaction opens, but the error happens before JDBC mutation.",
      nodes: [
        buildNode("request", ko ? "요청 진입" : "Request entry", ko ? "요청은 정상적으로 서비스 경계까지 들어간다." : "The request reaches the service boundary normally.", "Web", "info"),
        buildNode("service", ko ? "서비스 진입" : "Service entry", ko ? "서비스 메서드가 호출된다." : "The service method is invoked.", "Service", "success"),
        buildNode("tx", ko ? "트랜잭션 시작" : "Transaction begin", ko ? "트랜잭션 인터셉터가 begin을 호출한다." : "The transaction interceptor begins the unit of work.", "Transaction", "success"),
        buildNode("error", ko ? "서비스 예외" : "Service exception", ko ? "JDBC 작업 전에 런타임 예외가 발생한다." : "A runtime exception occurs before JDBC work.", "Service", "error"),
        buildNode("jdbc-skipped", ko ? "JDBC 건너뜀" : "JDBC skipped", ko ? "리포지토리는 호출되지 않는다." : "The repository is never called.", "JDBC", "warning", "inactive"),
        buildNode("rollback", ko ? "rollback 수행" : "Rollback", ko ? "쓰기 없는 rollback으로 종료된다." : "The run exits through rollback without any write.", "Transaction", "error")
      ],
      branches: [
        buildBranch("service-error-main", ko ? "서비스 오류 분기 선택" : "service error branch taken", ko ? "예외가 JDBC 이전에 발생해 DB 영향은 없다." : "The exception occurs before JDBC, so there is no DB mutation.", "error", "taken"),
        buildBranch("service-error-write", ko ? "쓰기 이후 rollback 미선택" : "post-write rollback not taken", ko ? "rollback은 같아도 insert 후 실패와는 다르다." : "Rollback still happens, but not after an insert.", "warning", "idle"),
        buildBranch("service-error-commit", ko ? "commit 분기 미선택" : "commit branch not taken", ko ? "정상 응답 경로는 이번 실행에 포함되지 않는다." : "The successful response path is not part of this run.", "success", "idle")
      ]
    };
  }

  return {
    title: ko ? "실행 경로 다이어그램" : "Execution Path Diagram",
    subtitle: ko ? "이 시나리오는 요청 경계와 예외/응답 분기를 비교하기 위한 읽기 경로다." : "This scenario is best read as a request-to-exit branch path.",
    nodes: [],
    branches: []
  };
}

export const exampleFlowTraceAdapter: TraceAdapter = {
  labId: "example-flow",
  adapt(trace, locale) {
    const ko = locale === "ko";
    const executionPath = buildExecutionPath(trace.scenario, locale);
    return {
      accent: ko ? "요청 경로" : "request path",
      insight: {
        title: ko ? "Example Flow 포인트" : "Example Flow Focus",
        bullets: [
          ko
            ? `"${trace.scenario}" 분기에서 MVC 진입부터 JDBC 종료까지 요청이 어떻게 이동하는지 추적하세요.`
            : `Track the request from MVC entry to JDBC exit through the "${trace.scenario}" branch.`,
          ko
            ? "먼저 경로 다이어그램에서 실제로 밟은 분기를 확인하고, 그 다음 steps와 lanes에서 세부 순서를 읽는 것이 가장 빠릅니다."
            : "Start with the execution path diagram to see the taken branch, then use steps and lanes for exact ordering.",
          ko
            ? `관련 참고: ${trace.references.slice(0, 2).join(" / ")}`
            : `Related references: ${trace.references.slice(0, 2).join(" / ")}`
        ]
      },
      executionPath
    };
  }
};
