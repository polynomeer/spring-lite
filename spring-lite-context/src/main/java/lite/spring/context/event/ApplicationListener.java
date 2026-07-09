package lite.spring.context.event;

public interface ApplicationListener<E> {
    void onApplicationEvent(E event);
}
