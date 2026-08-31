import type { TraceAdapter, TraceDiagramBranchOption, TraceDiagramNode } from "../types";

function stateNode(
  id: string,
  label: string,
  detail: string,
  lane: string,
  tone: "success" | "info" | "warning" | "error",
  status: "active" | "inactive" = "active"
): TraceDiagramNode {
  return { id, label, detail, lane, tone, status };
}

function sideEffect(
  id: string,
  label: string,
  detail: string,
  tone: "success" | "info" | "warning" | "error",
  status: "taken" | "idle"
): TraceDiagramBranchOption {
  return { id, label, detail, tone, status };
}

function buildStateTransition(scenario: string, locale: "ko" | "en") {
  const ko = locale === "ko";

  if (scenario === "bootstrap-full") {
    return {
      title: ko ? "컨테이너 부트스트랩 상태 전이" : "Container Bootstrap State Transition",
      subtitle: ko ? "metadata가 registry를 거쳐 실제 singleton 준비 상태로 바뀌는 순서를 보여준다." : "Shows how metadata moves through the registry into ready singleton state.",
      states: [
        stateNode("register", ko ? "설정 등록" : "Register configs", ko ? "명시적 설정 클래스와 스캔 루트를 수집한다." : "Collect explicit config classes and scan roots.", "Registry", "info"),
        stateNode("definitions", ko ? "정의 생성" : "Create definitions", ko ? "구성 메서드와 컴포넌트가 BeanDefinition으로 바뀐다." : "Configuration methods and components become BeanDefinitions.", "Registry", "success"),
        stateNode("conditions", ko ? "조건 평가" : "Evaluate conditions", ko ? "조건부 빈 등록 여부를 결정한다." : "Decide whether optional beans should remain registered.", "Registry", "success"),
        stateNode("infra", ko ? "인프라 추가" : "Add infrastructure", ko ? "핵심 post-processor와 런타임 도우미를 등록한다." : "Register core post-processors and runtime helpers.", "Infrastructure", "success"),
        stateNode("singletons", ko ? "싱글턴 준비" : "Pre-instantiate singletons", ko ? "비지연 singleton을 의존 순서대로 생성한다." : "Create non-lazy singletons in dependency order.", "Singletons", "success"),
        stateNode("ready", ko ? "리프레시 완료" : "Refresh complete", ko ? "컨텍스트가 요청을 받을 준비를 마친다." : "The context is ready to serve requests.", "Runtime", "success")
      ],
      sideEffects: [
        sideEffect("conditional-prune", ko ? "조건부 정의 정리" : "Conditional pruning", ko ? "missing-bean 조건이 선택적 인프라를 남기거나 제거한다." : "Missing-bean checks keep or remove optional infrastructure.", "warning", "taken"),
        sideEffect("infra-chain", ko ? "post-processor 체인 형성" : "Post-processor chain formed", ko ? "주입, AOP, 트랜잭션 보조기가 이후 bean 생성 경로에 영향을 준다." : "Injection, AOP, and transaction helpers will influence later bean creation.", "success", "taken"),
        sideEffect("lazy-branch", ko ? "지연 빈 분기 미포함" : "Lazy branch not included", ko ? "이 시나리오는 lazy singleton 지연 생성까지는 다루지 않는다." : "This scenario does not include lazy singleton deferral.", "info", "idle")
      ]
    };
  }

  return {
    title: ko ? "빈 생명주기 상태 전이" : "Bean Lifecycle State Transition",
    subtitle: ko ? "raw instance가 exposed bean으로 바뀌고 종료 훅이 등록되는 지점을 강조한다." : "Highlights where the raw instance becomes the exposed bean and when destroy metadata is stored.",
    states: [
      stateNode("definition", ko ? "정의 선택" : "Definition selected", ko ? "대상 BeanDefinition과 생성 경로가 결정된다." : "Choose the target BeanDefinition and creation path.", "Definition", "info"),
      stateNode("construct", ko ? "생성자 주입" : "Constructor injection", ko ? "필수 의존성을 해결하고 인스턴스를 생성한다." : "Resolve required dependencies and construct the instance.", "Instance", "success"),
      stateNode("populate", ko ? "필드/값 주입" : "Populate fields and values", ko ? "@Value와 주입 대상 필드를 채운다." : "Apply @Value resolution and field injection.", "Instance", "success"),
      stateNode("init", ko ? "초기화 콜백" : "Initialization callback", ko ? "raw bean에서 @PostConstruct가 실행된다." : "Run @PostConstruct on the raw bean.", "Instance", "success"),
      stateNode("proxy", ko ? "프록시 노출" : "Proxy exposed", ko ? "post-processor가 감싼 객체를 최종 빈으로 노출한다." : "A post-processor exposes a wrapped object as the final bean.", "Post-Processors", "warning"),
      stateNode("destroy", ko ? "종료 훅 등록" : "Destroy hook stored", ko ? "close() 시 사용할 종료 메타데이터를 저장한다." : "Store shutdown metadata for close().", "Post-Processors", "info")
    ],
    sideEffects: [
      sideEffect("raw-vs-exposed", ko ? "raw instance와 exposed bean 분리" : "Raw instance differs from exposed bean", ko ? "초기화는 원본 인스턴스에서 일어나지만 주입되는 것은 프록시일 수 있다." : "Initialization happens on the raw instance while injection may see the proxy.", "warning", "taken"),
      sideEffect("singleton-cache", ko ? "singleton 캐시 등록" : "Singleton cache registration", ko ? "최종 노출 객체가 singleton 캐시에 들어간다." : "The exposed object is what enters the singleton cache.", "success", "taken"),
      sideEffect("prototype-skip", ko ? "prototype 종료 훅 미포함" : "Prototype cleanup not included", ko ? "이 시나리오는 prototype bean의 종료 누락 경로는 다루지 않는다." : "This scenario does not cover the missing destroy path for prototype beans.", "info", "idle")
      ]
  };
}

export const containerTraceAdapter: TraceAdapter = {
  labId: "container",
  adapt(trace, locale) {
    const ko = locale === "ko";
    return {
      accent: ko ? "컨테이너 내부" : "container internals",
      insight: {
        title: ko ? "Container Lab 포인트" : "Container Lab Focus",
        bullets: [
          ko
            ? `이 "${trace.scenario}" trace는 요청 처리보다 metadata가 runtime으로 바뀌는 전환 과정을 강조합니다.`
            : `This "${trace.scenario}" trace emphasizes metadata-to-runtime transitions rather than request handling.`,
          ko
            ? "상태 전이 다이어그램에서 먼저 현재 단계가 registry 문제인지, lifecycle 문제인지 구분해 보세요."
            : "Use the state transition diagram first to separate registry problems from lifecycle problems.",
          ko
            ? "bootstrap trace와 lifecycle trace를 함께 보면 주입되는 객체가 왜 raw instance와 다를 수 있는지 이해하기 쉽습니다."
            : "Pair bootstrap traces with lifecycle traces to understand why the injected object can differ from the raw created instance."
        ]
      },
      stateTransition: buildStateTransition(trace.scenario, locale)
    };
  }
};
