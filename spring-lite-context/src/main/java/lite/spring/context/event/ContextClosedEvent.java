package lite.spring.context.event;

public class ContextClosedEvent extends ApplicationEvent {
    public ContextClosedEvent(Object source) {
        super(source);
    }
}
