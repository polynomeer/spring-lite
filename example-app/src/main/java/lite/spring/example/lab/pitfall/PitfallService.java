package lite.spring.example.lab.pitfall;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.core.annotation.Service;
import lite.spring.core.exception.BeansException;
import lite.spring.core.trace.TraceEvent;
import lite.spring.core.trace.TraceLayer;
import lite.spring.core.trace.TraceRecorder;
import lite.spring.example.lab.LabTraceEventView;
import lite.spring.example.lab.sandbox.SandboxRunResponse;
import lite.spring.example.lab.sandbox.SandboxService;

/**
 * Runs the "broken" or "fixed" variant of each pitfall experiment against real framework behavior and
 * reports what happened, the observable facts, and the recorded events.
 */
@Service
public class PitfallService {
    private static final List<String> VARIANTS = List.of("broken", "fixed");

    private final PitfallRows rows;
    private final SelfInvocationOrders selfInvocationOrders;
    private final OrderWriter orderWriter;
    private final FinalMethodOrders finalMethodOrders;
    private final CheckedExceptionOrders checkedExceptionOrders;
    private final PrototypeClient prototypeClient;
    private final ThreadedOrders threadedOrders;
    private final SandboxService sandboxService;

    public PitfallService(
        PitfallRows rows,
        SelfInvocationOrders selfInvocationOrders,
        OrderWriter orderWriter,
        FinalMethodOrders finalMethodOrders,
        CheckedExceptionOrders checkedExceptionOrders,
        PrototypeClient prototypeClient,
        ThreadedOrders threadedOrders,
        SandboxService sandboxService
    ) {
        this.rows = rows;
        this.selfInvocationOrders = selfInvocationOrders;
        this.orderWriter = orderWriter;
        this.finalMethodOrders = finalMethodOrders;
        this.checkedExceptionOrders = checkedExceptionOrders;
        this.prototypeClient = prototypeClient;
        this.threadedOrders = threadedOrders;
        this.sandboxService = sandboxService;
    }

    public PitfallRunResponse run(String id, String variant) {
        if (!VARIANTS.contains(variant)) {
            throw new IllegalArgumentException("Unsupported pitfall variant: " + variant);
        }
        boolean broken = variant.equals("broken");
        return switch (id) {
            case "self-invocation" -> runTransactional(id, variant, broken
                ? runId -> selfInvocationOrders.placeAll(runId)
                : runId -> orderWriter.save(runId), List.of("orders"));
            case "final-method" -> runTransactional(id, variant, broken
                ? runId -> finalMethodOrders.saveFinal(runId)
                : runId -> finalMethodOrders.save(runId), List.of("orders"));
            case "checked-exception" -> runTransactional(id, variant, broken
                ? runId -> checkedExceptionOrders.save(runId)
                : runId -> checkedExceptionOrders.saveWithRule(runId), List.of("orders"));
            case "new-thread" -> runTransactional(id, variant, broken
                ? runId -> threadedOrders.placeWithThread(runId)
                : runId -> threadedOrders.placeInSameThread(runId), List.of("orders", "audit_log"));
            case "prototype-injection" -> runPrototype(id, variant, broken);
            case "circular-dependency" -> runCircular(id, variant, broken);
            case "rollback-only" -> runRollbackOnly(id, variant, broken);
            default -> throw new IllegalArgumentException("Unknown pitfall experiment: " + id);
        };
    }

    @FunctionalInterface
    private interface Action {
        void run(String runId) throws Exception;
    }

    private PitfallRunResponse runTransactional(String id, String variant, Action action, List<String> tables) {
        String runId = UUID.randomUUID().toString();
        String thrown = "없음";
        List<TraceEvent> events;
        try (TraceRecorder.Session session = TraceRecorder.start()) {
            try {
                action.run(runId);
            } catch (Exception exception) {
                thrown = exception.getClass().getSimpleName()
                    + (exception.getMessage() == null ? "" : ": " + exception.getMessage());
            }
            events = session.events();
        }
        long transactions = events.stream().filter(event -> event.layer() == TraceLayer.TX && event.kind().equals("begin")).count();
        String ending = events.stream()
            .filter(event -> event.layer() == TraceLayer.TX && (event.kind().equals("commit") || event.kind().equals("rollback")))
            .map(TraceEvent::kind)
            .reduce((first, second) -> second)
            .orElse("없음");

        Map<String, String> facts = new LinkedHashMap<>();
        facts.put("열린 트랜잭션", transactions + "개");
        facts.put("트랜잭션 결말", ending);
        facts.put("밖으로 나온 예외", thrown);
        for (String table : tables) {
            facts.put("남은 " + table + " 행", String.valueOf(rows.count(runId, table)));
        }
        String outcome = transactions == 0
            ? "트랜잭션이 열리지 않았다. 각 SQL은 자동 커밋으로 바로 저장된다."
            : "트랜잭션 " + transactions + "개가 열렸고 마지막 결말은 " + ending + "다.";
        return new PitfallRunResponse(id, variant, outcome, facts, views(events));
    }

    private PitfallRunResponse runPrototype(String id, String variant, boolean broken) {
        List<Integer> instances = new java.util.ArrayList<>();
        List<TraceEvent> events;
        try (TraceRecorder.Session session = TraceRecorder.start()) {
            for (int call = 0; call < 3; call++) {
                instances.add(broken ? prototypeClient.injectedInstance() : prototypeClient.lookedUpInstance());
            }
            events = session.events();
        }
        long distinct = instances.stream().distinct().count();
        Map<String, String> facts = new LinkedHashMap<>();
        facts.put("세 번 호출한 인스턴스 id", instances.toString());
        facts.put("서로 다른 인스턴스", distinct + "개");
        facts.put("호출 중 새로 만든 빈", events.stream().filter(event -> event.kind().equals("create")).count() + "개");
        String outcome = distinct == 1
            ? "세 번 모두 같은 인스턴스다. 생성자 주입은 singleton이 만들어질 때 한 번만 일어난다."
            : "호출마다 컨테이너가 새 prototype 인스턴스를 만들었다.";
        return new PitfallRunResponse(id, variant, outcome, facts, views(events));
    }

    private PitfallRunResponse runCircular(String id, String variant, boolean broken) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        if (broken) {
            context.register(CircularDependencyFixtures.OrderFacade.class, CircularDependencyFixtures.PaymentFacade.class);
        } else {
            context.register(
                CircularDependencyFixtures.FixedOrderFacade.class,
                CircularDependencyFixtures.FixedPaymentFacade.class,
                CircularDependencyFixtures.SharedLedger.class
            );
        }
        String failure = "없음";
        try {
            context.refresh();
        } catch (BeansException exception) {
            failure = exception.getMessage();
        } finally {
            context.close();
        }
        List<TraceEvent> events = context.getRefreshTrace();
        Map<String, String> facts = new LinkedHashMap<>();
        facts.put("기동 결과", failure.equals("없음") ? "성공" : "실패");
        facts.put("오류", failure);
        facts.put("만들어진 빈", events.stream().filter(event -> event.kind().equals("ready")).count() + "개");
        String outcome = failure.equals("없음")
            ? "공통 의존을 따로 빼자 두 빈이 문제없이 만들어졌다."
            : "생성자 주입끼리 서로를 요구해서 어느 쪽도 먼저 만들 수 없었다.";
        return new PitfallRunResponse(id, variant, outcome, facts, views(events));
    }

    private PitfallRunResponse runRollbackOnly(String id, String variant, boolean broken) {
        Map<String, Object> inner = Map.of(
            "name", "AuditService.log",
            "propagation", broken ? "REQUIRED" : "REQUIRES_NEW",
            "steps", List.of(Map.of("type", "insert", "target", "audit_log"), Map.of("type", "throw"))
        );
        Map<String, Object> root = Map.of(
            "name", "OrderService.placeOrder",
            "propagation", "REQUIRED",
            "steps", List.of(
                Map.of("type", "insert", "target", "orders"),
                Map.of("type", "call", "catch", true, "call", inner)
            )
        );
        SandboxRunResponse response = sandboxService.run(Map.of("root", root));
        Map<String, String> facts = new LinkedHashMap<>();
        facts.put("안쪽 전파", broken ? "REQUIRED" : "REQUIRES_NEW");
        facts.put("rollback-only 표시", response.events().stream().anyMatch(event -> event.kind().equals("mark-rollback-only")) ? "있음" : "없음");
        response.rows().forEach((table, count) -> facts.put("남은 " + table + " 행", String.valueOf(count)));
        String outcome = broken
            ? "예외를 삼켰는데도 바깥 트랜잭션 전체가 롤백됐다."
            : "안쪽만 따로 롤백되고 바깥 주문은 커밋됐다.";
        return new PitfallRunResponse(id, variant, outcome, facts, response.events());
    }

    private List<LabTraceEventView> views(List<TraceEvent> events) {
        return events.stream().map(LabTraceEventView::from).toList();
    }
}
