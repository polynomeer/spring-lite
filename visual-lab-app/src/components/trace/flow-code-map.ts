import type { TraceLaneKind } from "../../lib/types";

export interface FlowCodeFocus {
  noteKo: string;
  noteEn: string;
  classFocus: string;
  methodFocus: string;
  docFocus: string;
  testFocus: string;
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
      testFocus: "ExampleApplicationWebTest / DispatcherServletTest"
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
      testFocus: "ExampleApplicationTest"
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
      testFocus: "ExampleApplicationTest"
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
      testFocus: "TransactionManagerTest / ExampleApplicationWebTest"
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
    testFocus: locale === "ko" ? "관련 테스트 추적" : "trace the related test"
  };
}
