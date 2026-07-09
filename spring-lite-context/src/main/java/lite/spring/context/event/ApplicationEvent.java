package lite.spring.context.event;

import java.time.Instant;

public abstract class ApplicationEvent {
    private final Object source;
    private final Instant timestamp;

    protected ApplicationEvent(Object source) {
        this.source = source;
        this.timestamp = Instant.now();
    }

    public Object source() {
        return source;
    }

    public Instant timestamp() {
        return timestamp;
    }
}
