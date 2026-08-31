import type { TraceLaneKind } from "../../lib/types";

export interface FlowCodeFocus {
  noteKo: string;
  noteEn: string;
  classFocus: string;
  methodFocus: string;
  docFocus: string;
  testFocus: string;
  testMethodFocus: string;
  assertionFocusKo: string;
  assertionFocusEn: string;
  checklistKo: string[];
  checklistEn: string[];
}

interface FlowCodeRule {
  match: (reference: string, marker: string, kinds: TraceLaneKind[]) => boolean;
  focus: FlowCodeFocus;
}

const flowCodeRules: FlowCodeRule[] = [
  {
    match: (reference, marker, kinds) => reference.includes("OrderController") && (kinds.includes("web") || marker.includes("dispatch") || marker.includes("bind") || marker.includes("json")),
    focus: {
      noteKo: "HTTP 진입, 요청 바인딩, 컨트롤러 진입 경로",
      noteEn: "HTTP entry, request binding, and controller entry path",
      classFocus: "OrderController",
      methodFocus: "createOrder(...) / getOrder(...)",
      docFocus: "docs/book/complete-manuscript.md#chapter-17-dispatcherservlet과-front-controller-패턴",
      testFocus: "ExampleApplicationWebTest / DispatcherServletTest",
      testMethodFocus: "returnsValidationErrorsForInvalidOrderRequest(...) / dispatchesPostRequestsWithRecordBodyBinding(...)",
      assertionFocusKo: "상태 코드, 요청 바인딩 성공, JSON 응답 본문 또는 검증 오류 본문을 먼저 확인한다.",
      assertionFocusEn: "Start with status code, successful request binding, and the JSON response body or validation error body.",
      checklistKo: [
        "요청이 200 또는 400으로 끝나는지 확인한다.",
        "JSON 바인딩 결과나 validation 오류 path가 본문에 포함되는지 본다.",
        "컨트롤러 진입 전후 흐름이 step marker와 맞는지 대조한다."
      ],
      checklistEn: [
        "Confirm the request ends with 200 or 400.",
        "Check that JSON binding results or validation error paths appear in the body.",
        "Compare the pre/post controller flow with the current step marker."
      ]
    }
  },
  {
    match: (reference, marker, kinds) => reference.includes("DefaultOrderService") && (kinds.includes("service") || marker.includes("getorder") || marker.includes("throw") || marker.includes("proxy")),
    focus: {
      noteKo: "비즈니스 분기, 예외 발생, 서비스 위임 경로",
      noteEn: "Business branching, exception origin, and service delegation path",
      classFocus: "DefaultOrderService",
      methodFocus: "createOrder(...) / createOrderAndFail(...) / getOrder(...) / failForLab(...)",
      docFocus: "docs/book/build-along-implementation-guide.md",
      testFocus: "ExampleApplicationTest",
      testMethodFocus: "loadsExampleApplicationAndCreatesOrders() / throwsForUnknownOrderId()",
      assertionFocusKo: "생성된 주문 상태, unknown id 예외 메시지, 서비스 분기별 결과를 확인한다.",
      assertionFocusEn: "Check created order status, unknown-id exception messages, and scenario-specific service outcomes.",
      checklistKo: [
        "서비스 호출 뒤 생성된 주문 상태가 기대값과 같은지 본다.",
        "unknown id 경로라면 IllegalArgumentException 메시지를 확인한다.",
        "현재 step이 성공 분기인지 예외 분기인지 테스트 메서드와 대조한다."
      ],
      checklistEn: [
        "Verify the created order status after the service call.",
        "For unknown-id paths, confirm the IllegalArgumentException message.",
        "Match the current step against the success or exception branch in the test."
      ]
    }
  },
  {
    match: (reference, marker, kinds) => reference.includes("JdbcOrderRepository") && (kinds.includes("jdbc") || marker.includes("insert") || marker.includes("select") || marker.includes("verify")),
    focus: {
      noteKo: "영속화, row 조회, rollback 전후 가시성 경로",
      noteEn: "Persistence, row lookup, and before/after rollback visibility path",
      classFocus: "JdbcOrderRepository",
      methodFocus: "save(...) / findById(...) / findAll(...)",
      docFocus: "docs/testing/detailed-test-guide.md",
      testFocus: "ExampleApplicationTest",
      testMethodFocus: "returnsSeededOrderAndAppendsNewOrders() / usesJdbcBackedRepository()",
      assertionFocusKo: "seed row 보존, 생성 후 목록 변화, rollback 이후 visible row count를 확인한다.",
      assertionFocusEn: "Check seeded row preservation, post-create list growth, and visible row counts after rollback.",
      checklistKo: [
        "seed 데이터가 유지되는지 먼저 확인한다.",
        "생성 후 목록 크기나 product 목록이 기대대로 늘어나는지 본다.",
        "rollback 계열이면 before/after row count가 유지되는지 대조한다."
      ],
      checklistEn: [
        "Confirm the seeded data is preserved first.",
        "Check that list size or product names grow as expected after creation.",
        "For rollback paths, compare before/after row counts."
      ]
    }
  },
  {
    match: (reference, marker, kinds) => (reference.includes("TransactionalBeanPostProcessor") || reference.includes("TransactionInterceptor")) && (kinds.includes("tx") || marker.includes("begin") || marker.includes("commit") || marker.includes("rollback") || marker.includes("proxy")),
    focus: {
      noteKo: "트랜잭션 프록시 생성과 begin/commit/rollback 결정 경로",
      noteEn: "Transaction proxy creation and begin/commit/rollback decision path",
      classFocus: "TransactionalBeanPostProcessor",
      methodFocus: "postProcessAfterInitialization(...) / TransactionInterceptor.invoke(...)",
      docFocus: "docs/book/complete-manuscript.md",
      testFocus: "TransactionManagerTest / ExampleApplicationWebTest",
      testMethodFocus: "commitsPhysicalTransactionOnlyAtOutermostBoundary() / returnsLiveLabTraceForRollbackScenario(...)",
      assertionFocusKo: "outermost commit, rollback-only 전파, rollback branch의 결과 메트릭을 확인한다.",
      assertionFocusEn: "Check outermost commit behavior, rollback-only propagation, and rollback-branch result metrics.",
      checklistKo: [
        "중첩 경계에서 마지막 commit만 물리 commit을 수행하는지 확인한다.",
        "rollback 분기라면 commit 대신 rollback 결과가 남는지 본다.",
        "live trace 메트릭의 Tx Outcome과 테스트 의도를 같이 대조한다."
      ],
      checklistEn: [
        "Confirm that only the last commit performs the physical commit in nested boundaries.",
        "For rollback paths, verify rollback happens instead of commit.",
        "Compare the live trace Tx Outcome metric with the test intent."
      ]
    }
  }
];

export function resolveFlowCodeFocus(reference: string, marker: string | undefined, kinds: TraceLaneKind[], locale: "ko" | "en"): FlowCodeFocus {
  const normalizedMarker = (marker ?? "").toLowerCase();
  const rule = flowCodeRules.find((candidate) => candidate.match(reference, normalizedMarker, kinds));

  if (rule) {
    return {
      ...rule.focus,
      noteKo: rule.focus.noteKo,
      noteEn: rule.focus.noteEn
    };
  }

  return {
    noteKo: "이 시나리오의 보조 참고 코드 표면",
    noteEn: "Supporting reference surface for this scenario",
    classFocus: reference.split("/").pop()?.replace(/\.java$|\.md$/g, "") ?? reference,
    methodFocus: locale === "ko" ? "관련 진입 메서드 추적" : "trace the related entry method",
    docFocus: "docs/book/complete-manuscript.md",
    testFocus: locale === "ko" ? "관련 테스트 추적" : "trace the related test",
    testMethodFocus: locale === "ko" ? "우선 관련 테스트 메서드 확인" : "start with the nearest test method",
    assertionFocusKo: "현재 단계와 가장 가까운 상태 코드, 예외, row 변화 assertion을 확인한다.",
    assertionFocusEn: "Check the nearest status-code, exception, or row-visibility assertion for this step.",
    checklistKo: [
      "현재 step과 가장 가까운 테스트 메서드를 연다.",
      "상태 코드, 예외, row 변화 중 핵심 assertion 하나를 먼저 찾는다."
    ],
    checklistEn: [
      "Open the nearest test method for the current step.",
      "Start with the key status-code, exception, or row-visibility assertion."
    ]
  };
}
