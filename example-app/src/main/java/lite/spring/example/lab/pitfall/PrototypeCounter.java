package lite.spring.example.lab.pitfall;

import java.util.concurrent.atomic.AtomicInteger;
import lite.spring.core.annotation.Component;
import lite.spring.core.annotation.Scope;

/** A prototype bean that numbers each instance the container creates. */
@Component
@Scope("prototype")
public class PrototypeCounter {
    private static final AtomicInteger INSTANCES = new AtomicInteger();

    private final int instanceId = INSTANCES.incrementAndGet();

    public int instanceId() {
        return instanceId;
    }
}
