export type PitfallLayer = "context" | "aop" | "tx" | "web";

export interface Pitfall {
  id: string;
  layers: PitfallLayer[];
  title: string;
  symptom: string;
  cause: string;
  fix: string;
  brokenLabel: string;
  fixedLabel: string;
  brokenCode: string;
  fixedCode: string;
  springNote?: string;
  kind: "run" | "http";
}

export const pitfallLayerLabels: Record<PitfallLayer, string> = {
  context: "context",
  aop: "aop",
  tx: "tx",
  web: "web"
};

export const pitfalls: Pitfall[] = [
  {
    id: "self-invocation",
    layers: ["aop", "tx"],
    title: "같은 클래스 안에서 부르면 @Transactional이 사라진다",
    symptom: "save()가 예외를 던졌는데도 insert한 행이 남아 있다.",
    cause: "트랜잭션은 프록시가 시작한다. this.save()는 프록시가 아니라 원본 객체를 곧장 부르므로 인터셉터가 끼어들 틈이 없다.",
    fix: "트랜잭션 메서드를 다른 빈으로 옮겨 그 빈의 프록시를 거쳐 부른다.",
    brokenLabel: "this.save() 호출",
    fixedLabel: "다른 빈의 save() 호출",
    brokenCode: "public void placeAll(String runId) {\n    this.save(runId);   // 프록시를 거치지 않음\n}\n\n@Transactional\npublic void save(String runId) { insert; throw; }",
    fixedCode: "public void placeAll(String runId) {\n    orderWriter.save(runId);   // OrderWriter 프록시\n}",
    kind: "run"
  },
  {
    id: "final-method",
    layers: ["aop"],
    title: "final 메서드는 클래스 프록시가 가로챌 수 없다",
    symptom: "트랜잭션이 열리지 않고, 주입한 필드가 null이라는 NullPointerException이 난다.",
    cause: "인터페이스가 없는 빈은 하위 클래스 프록시가 된다. final 메서드는 재정의할 수 없어서 프록시 인스턴스 자신에서 실행되는데, 그 인스턴스의 필드는 주입된 적이 없다.",
    fix: "트랜잭션 메서드를 final로 두지 않거나, 인터페이스를 두어 인터페이스 프록시를 쓴다.",
    brokenLabel: "final 메서드 호출",
    fixedLabel: "일반 메서드 호출",
    brokenCode: "@Transactional\npublic final void saveFinal(String runId) {\n    rows.insert(...);   // rows는 프록시에서 null\n}",
    fixedCode: "@Transactional\npublic void save(String runId) {\n    rows.insert(...);\n}",
    springNote: "실제 Spring의 CGLIB 프록시도 같은 이유로 final 메서드를 가로채지 못한다.",
    kind: "run"
  },
  {
    id: "checked-exception",
    layers: ["tx"],
    title: "checked 예외의 기본 롤백 규칙",
    symptom: "실제 Spring에서는 checked 예외가 나도 커밋되어 행이 남는다.",
    cause: "Spring의 기본 규칙은 RuntimeException과 Error에만 롤백한다. spring-lite는 규칙을 단순화해 모든 예외에 롤백한다.",
    fix: "checked 예외에도 롤백하려면 rollbackFor = Exception.class를 명시한다.",
    brokenLabel: "규칙 없이 checked 예외",
    fixedLabel: "rollbackFor = Exception.class",
    brokenCode: "@Transactional\npublic void save(String runId) throws Exception {\n    insert;\n    throw new Exception(\"checked\");\n}",
    fixedCode: "@Transactional(rollbackFor = Exception.class)\npublic void saveWithRule(String runId) throws Exception { ... }",
    springNote: "이 실험은 spring-lite에서 재현되지 않는다. 두 버전 모두 롤백되지만, 실제 Spring에서 망가진 버전은 커밋된다. 비교 화면에서 차이를 확인하라.",
    kind: "run"
  },
  {
    id: "new-thread",
    layers: ["tx"],
    title: "새 스레드에서는 같은 트랜잭션이 아니다",
    symptom: "트랜잭션이 롤백됐는데 다른 스레드가 쓴 audit_log 행만 남았다.",
    cause: "트랜잭션 커넥션은 현재 스레드에 묶여 있다. 다른 스레드는 그 커넥션을 볼 수 없어서 자기 커넥션으로 바로 커밋한다. 실행 기록(TraceRecorder)도 스레드별이라 그 스레드의 SQL은 기록에 나오지 않는다.",
    fix: "트랜잭션 안의 작업은 같은 스레드에서 끝내거나, 비동기 작업은 별도 트랜잭션으로 설계한다.",
    brokenLabel: "작업 스레드에서 insert",
    fixedLabel: "같은 스레드에서 insert",
    brokenCode: "@Transactional\npublic void placeWithThread(String runId) {\n    insert orders;\n    new Thread(() -> insert audit_log).start();\n    throw ...;\n}",
    fixedCode: "@Transactional\npublic void placeInSameThread(String runId) {\n    insert orders;\n    insert audit_log;\n    throw ...;\n}",
    kind: "run"
  },
  {
    id: "rollback-only",
    layers: ["tx"],
    title: "안쪽 REQUIRED 예외를 삼켜도 전체가 롤백된다",
    symptom: "바깥에서 예외를 catch했는데 주문까지 사라졌다.",
    cause: "REQUIRED는 바깥 트랜잭션에 참여한다. 참여한 메서드가 실패하면 트랜잭션 전체가 rollback-only로 표시되고, 바깥이 커밋하려 할 때 롤백으로 바뀐다.",
    fix: "독립적으로 실패해도 되는 작업은 REQUIRES_NEW로 따로 연다.",
    brokenLabel: "안쪽 REQUIRED",
    fixedLabel: "안쪽 REQUIRES_NEW",
    brokenCode: "placeOrder()            // REQUIRED\n  insert orders\n  try { audit.log() }   // REQUIRED, throw\n  catch (e) { }",
    fixedCode: "placeOrder()            // REQUIRED\n  insert orders\n  try { audit.log() }   // REQUIRES_NEW, throw\n  catch (e) { }",
    springNote: "실제 Spring은 이 경우 조용히 롤백하지 않고 바깥 commit에서 UnexpectedRollbackException을 던진다.",
    kind: "run"
  },
  {
    id: "prototype-injection",
    layers: ["context"],
    title: "singleton에 주입한 prototype은 한 번만 만들어진다",
    symptom: "prototype으로 선언했는데 매번 같은 인스턴스가 나온다.",
    cause: "생성자 주입은 singleton이 만들어질 때 딱 한 번 일어난다. 그때 받은 prototype 인스턴스를 계속 쓴다.",
    fix: "필요할 때마다 컨테이너에서 조회한다(Spring의 ObjectProvider와 같은 역할).",
    brokenLabel: "생성자로 주입받은 인스턴스",
    fixedLabel: "호출마다 getBean()",
    brokenCode: "PrototypeClient(PrototypeCounter injected) { ... }\ninjected.instanceId();   // 늘 같은 값",
    fixedCode: "applicationContext.getBean(PrototypeCounter.class)\n    .instanceId();       // 호출마다 새 인스턴스",
    kind: "run"
  },
  {
    id: "circular-dependency",
    layers: ["context"],
    title: "생성자 순환 참조로 기동이 멈춘다",
    symptom: "애플리케이션이 시작하지 못하고 Circular dependency 오류가 난다.",
    cause: "두 빈이 생성자로 서로를 요구하면 어느 쪽도 먼저 만들 수 없다. spring-lite는 생성 중인 빈 목록으로 순환을 찾아 경로와 함께 실패한다.",
    fix: "두 빈이 공통으로 필요로 하는 부분을 별도 빈으로 빼서 순환을 끊는다.",
    brokenLabel: "A ↔ B 순환",
    fixedLabel: "공통 의존 분리",
    brokenCode: "OrderFacade(PaymentFacade payment)\nPaymentFacade(OrderFacade order)",
    fixedCode: "FixedOrderFacade(SharedLedger ledger)\nFixedPaymentFacade(SharedLedger ledger)",
    kind: "run"
  },
  {
    id: "missing-valid",
    layers: ["web"],
    title: "@Valid를 빠뜨리면 검증이 일어나지 않는다",
    symptom: "product가 한 글자, quantity가 0인데 200으로 통과한다.",
    cause: "제약 애노테이션(@NotNull, @Size, @Min)은 요청 객체에 붙어 있어도, 인자에 @Valid가 없으면 인자 해석 단계에서 검사하지 않는다.",
    fix: "@RequestBody 인자에 @Valid를 붙인다.",
    brokenLabel: "@Valid 없음",
    fixedLabel: "@Valid 있음",
    brokenCode: "@PostMapping\ncreate(@RequestBody CreateOrderRequest request)",
    fixedCode: "@PostMapping\ncreate(@Valid @RequestBody CreateOrderRequest request)",
    kind: "http"
  }
];
