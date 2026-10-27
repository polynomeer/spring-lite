package lite.spring.example.lab.whatif;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.core.annotation.Service;
import lite.spring.core.trace.TraceEvent;
import lite.spring.core.trace.TraceRecorder;
import lite.spring.core.whatif.WhatIf;
import lite.spring.example.lab.LabTraceEventView;
import lite.spring.example.lab.pitfall.PitfallRows;
import lite.spring.example.lab.sandbox.SandboxRunResponse;
import lite.spring.example.lab.sandbox.SandboxService;

/**
 * Runs each what-if experiment twice over: with its switch off, the framework behaves normally; with it
 * on, one safeguard is disabled for this thread only, so concurrent requests are unaffected.
 */
@Service
public class WhatIfService {
    private static final int MAX_EVENTS = 40;

    private final SandboxService sandboxService;
    private final AuditedOrders auditedOrders;
    private final PitfallRows rows;

    public WhatIfService(SandboxService sandboxService, AuditedOrders auditedOrders, PitfallRows rows) {
        this.sandboxService = sandboxService;
        this.auditedOrders = auditedOrders;
        this.rows = rows;
    }

    public WhatIfRunResponse run(String id, String mode) {
        boolean on = switch (mode) {
            case "on" -> true;
            case "off" -> false;
            default -> throw new IllegalArgumentException("Unsupported what-if mode: " + mode);
        };
        WhatIf.Flag flag = switch (id) {
            case "rollback-only" -> WhatIf.Flag.TX_IGNORE_ROLLBACK_ONLY;
            case "interceptor-order" -> WhatIf.Flag.AOP_REVERSE_INTERCEPTOR_ORDER;
            case "class-proxy" -> WhatIf.Flag.AOP_FORCE_CLASS_PROXY;
            case "cycle-detection" -> WhatIf.Flag.CONTEXT_DISABLE_CYCLE_DETECTION;
            default -> throw new IllegalArgumentException("Unknown what-if experiment: " + id);
        };
        Set<WhatIf.Flag> flags = on ? Set.of(flag) : Set.of();
        return WhatIf.with(flags, () -> switch (id) {
            case "rollback-only" -> runRollbackOnly(id, mode);
            case "interceptor-order" -> runInterceptorOrder(id, mode);
            case "class-proxy" -> runClassProxy(id, mode);
            default -> runCycleDetection(id, mode);
        });
    }

    private WhatIfRunResponse runRollbackOnly(String id, String mode) {
        Map<String, Object> inner = Map.of(
            "name", "AuditService.log",
            "propagation", "REQUIRED",
            "steps", List.of(Map.of("type", "insert", "target", "audit_log"), Map.of("type", "throw"))
        );
        Map<String, Object> root = Map.of(
            "name", "OrderService.placeOrder",
            "propagation", "REQUIRED",
            "steps", List.of(Map.of("type", "insert", "target", "orders"), Map.of("type", "call", "catch", true, "call", inner))
        );
        SandboxRunResponse response = sandboxService.run(Map.of("root", root));
        Map<String, String> facts = new LinkedHashMap<>();
        facts.put("rollback-only 표시", response.events().stream().anyMatch(event -> event.kind().equals("mark-rollback-only")) ? "있음" : "없음");
        facts.put("바깥 트랜잭션 결말", response.events().stream()
            .filter(event -> event.kind().equals("commit") || event.kind().equals("rollback"))
            .map(LabTraceEventView::kind).reduce((first, second) -> second).orElse("없음"));
        response.rows().forEach((table, count) -> facts.put("남은 " + table + " 행", String.valueOf(count)));
        boolean committedFailure = response.rows().getOrDefault("audit_log", 0L) > 0;
        String outcome = committedFailure
            ? "실패한 안쪽 작업의 audit_log 행까지 커밋됐다. 예외로 끝난 작업이 절반만 저장된 셈이다."
            : "안쪽 실패가 트랜잭션 전체를 rollback-only로 만들어 주문까지 함께 롤백됐다.";
        return new WhatIfRunResponse(id, mode, outcome, facts, response.events(), response.events().size());
    }

    private WhatIfRunResponse runInterceptorOrder(String id, String mode) {
        String runId = UUID.randomUUID().toString();
        List<TraceEvent> events;
        try (TraceRecorder.Session session = TraceRecorder.start()) {
            auditedOrders.place(runId);
            events = session.events();
        }
        String adviceTx = events.stream()
            .filter(event -> event.kind().equals("advice"))
            .map(event -> event.attributes().get("tx"))
            .findFirst()
            .orElse("기록 없음");
        List<String> order = events.stream()
            .filter(event -> event.kind().equals("advice") || event.kind().equals("begin"))
            .map(event -> event.kind().equals("advice") ? "@Before" : "begin()")
            .toList();
        Map<String, String> facts = new LinkedHashMap<>();
        facts.put("어드바이스가 본 트랜잭션", adviceTx.equals("none") ? "없음" : adviceTx);
        facts.put("실행 순서", String.join(" → ", order));
        facts.put("남은 orders 행", String.valueOf(rows.count(runId, "orders")));
        String outcome = adviceTx.equals("none")
            ? "@Order(1) 어드바이스가 트랜잭션 인터셉터보다 바깥에서, 트랜잭션이 열리기 전에 실행됐다."
            : "체인이 뒤집혀 트랜잭션 인터셉터가 바깥이 됐다. 어드바이스가 " + adviceTx + " 안에서 실행됐다.";
        return new WhatIfRunResponse(id, mode, outcome, facts, views(events), events.size());
    }

    private WhatIfRunResponse runClassProxy(String id, String mode) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(WhatIfFixtures.PdfReceiptPrinter.class, WhatIfFixtures.ReceiptDesk.class, WhatIfFixtures.PrinterProxyPostProcessor.class);
        String failure = null;
        String printed = "-";
        String proxyType = "-";
        try {
            context.refresh();
            printed = context.getBean(WhatIfFixtures.ReceiptDesk.class).printReceipt();
            proxyType = describeProxy(context.getBean("pdfReceiptPrinter"));
        } catch (RuntimeException exception) {
            failure = rootMessage(exception);
        } finally {
            context.close();
        }
        Map<String, String> facts = new LinkedHashMap<>();
        facts.put("기동 결과", failure == null ? "성공" : "실패");
        facts.put("오류", failure == null ? "없음" : failure);
        facts.put("printer 프록시", proxyType);
        facts.put("ReceiptDesk 호출 결과", printed);
        String outcome = failure == null
            ? "하위 클래스 프록시는 구현 타입이기도 해서 PdfReceiptPrinter로 주입됐다."
            : "인터페이스 프록시는 ReceiptPrinter만 구현하므로 구현 타입(PdfReceiptPrinter)을 요구하는 생성자에 넣을 수 없었다.";
        List<TraceEvent> events = context.getRefreshTrace();
        return new WhatIfRunResponse(id, mode, outcome, facts, views(events.stream().limit(MAX_EVENTS).toList()), events.size());
    }

    private WhatIfRunResponse runCycleDetection(String id, String mode) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(WhatIfFixtures.InventoryFacade.class, WhatIfFixtures.ShippingFacade.class);
        Throwable failure = null;
        try {
            context.refresh();
        } catch (RuntimeException | StackOverflowError error) {
            failure = error;
        } finally {
            context.close();
        }
        Throwable root = failure;
        while (root != null && root.getCause() != null && !(root instanceof StackOverflowError)) {
            root = root.getCause();
        }
        List<TraceEvent> events = context.getRefreshTrace();
        long creates = events.stream().filter(event -> event.kind().equals("create")).count();
        Map<String, String> facts = new LinkedHashMap<>();
        facts.put("오류 종류", root == null ? "없음" : root.getClass().getSimpleName());
        facts.put("오류 메시지", root == null || root.getMessage() == null ? "(메시지 없음)" : root.getMessage());
        facts.put("create 이벤트", creates + "개");
        String outcome = root instanceof StackOverflowError
            ? "같은 두 빈을 끝없이 다시 만들려다 스택이 넘쳤다. 오류에는 어떤 빈이 원인인지 나오지 않는다."
            : "생성 중인 빈을 다시 요청한 순간 멈추고, 순환 경로를 오류 메시지에 담았다.";
        return new WhatIfRunResponse(id, mode, outcome, facts, views(events.stream().limit(MAX_EVENTS).toList()), events.size());
    }

    private static String describeProxy(Object bean) {
        if (java.lang.reflect.Proxy.isProxyClass(bean.getClass())) {
            return "JDK 인터페이스 프록시";
        }
        return bean.getClass() == WhatIfFixtures.PdfReceiptPrinter.class ? "원본 객체" : "하위 클래스 프록시";
    }

    private static String rootMessage(Throwable throwable) {
        Throwable root = throwable;
        while (root.getCause() != null) {
            root = root.getCause();
        }
        String message = root.getMessage();
        return root.getClass().getSimpleName() + (message == null ? "" : ": " + message);
    }

    private static List<LabTraceEventView> views(List<TraceEvent> events) {
        return events.stream().map(LabTraceEventView::from).toList();
    }
}
