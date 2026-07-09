package lite.spring.context.event;

public class ContextRefreshedEvent extends ApplicationEvent {
    public ContextRefreshedEvent(Object source) {
        super(source);
    }
}
