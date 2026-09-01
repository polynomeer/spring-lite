package lite.spring.context;

/**
 * Callback for beans that need access to the owning application context.
 */
public interface ApplicationContextAware {
    void setApplicationContext(ApplicationContext applicationContext);
}
