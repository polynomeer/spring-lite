package samples.comparison.lite.lab;

import java.util.Locale;
import java.util.Map;
import lite.spring.core.trace.TraceEvent;

/**
 * One framework step in the runtime-neutral schema shared with comparison-spring-boot-app.
 *
 * @param step normalized step name such as {@code tx.begin} or {@code jdbc.insert}; both runtimes use
 *     the same names so the Visual Lab can align their paths
 */
public record ComparisonTraceEvent(int seq, String step, String layer, String detail, Map<String, String> attributes) {
    public static ComparisonTraceEvent from(int seq, TraceEvent event) {
        return new ComparisonTraceEvent(seq, normalizedStep(event), event.layer().name().toLowerCase(Locale.ROOT), event.detail(), event.attributes());
    }

    static String normalizedStep(TraceEvent event) {
        return switch (event.layer()) {
            case AOP -> "proxy-enter".equals(event.kind()) ? "call.enter" : "aop." + event.kind();
            case SERVICE -> "call." + event.kind();
            case TX -> "tx." + event.kind();
            case JDBC -> "jdbc." + event.marker();
            default -> event.layer().name().toLowerCase(Locale.ROOT) + "." + event.kind();
        };
    }
}
