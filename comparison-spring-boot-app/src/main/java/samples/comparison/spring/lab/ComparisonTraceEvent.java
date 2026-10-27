package samples.comparison.spring.lab;

import java.util.Map;

/**
 * One framework step in the runtime-neutral schema shared with comparison-spring-lite-app.
 *
 * @param step normalized step name such as {@code tx.begin} or {@code jdbc.insert}; both runtimes use
 *     the same names so the Visual Lab can align their paths
 */
public record ComparisonTraceEvent(int seq, String step, String layer, String detail, Map<String, String> attributes) {
}
