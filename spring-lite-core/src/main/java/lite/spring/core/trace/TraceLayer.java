package lite.spring.core.trace;

/** Runtime layer that produced a {@link TraceEvent}. */
public enum TraceLayer {
    WEB,
    SERVICE,
    TX,
    JDBC,
    CONTAINER,
    AOP
}
