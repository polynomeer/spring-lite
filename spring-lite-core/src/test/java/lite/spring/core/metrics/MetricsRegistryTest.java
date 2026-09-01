package lite.spring.core.metrics;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class MetricsRegistryTest {
    @Test
    void recordsCountersAndTimerSnapshots() {
        MetricsRegistry registry = new MetricsRegistry();
        registry.increment("http.requests");
        registry.increment("http.requests");
        registry.recordNanos("service.call", 5);
        registry.recordNanos("service.call", -1);

        assertThat(registry.counters()).containsEntry("http.requests", 2L);
        assertThat(registry.timers().get("service.call")).isEqualTo(new MetricsRegistry.TimerSnapshot(2, 5));
    }
}
