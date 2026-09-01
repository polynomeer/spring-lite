package lite.spring.context;

/**
 * Callback for beans that need the name assigned by the application context.
 */
public interface BeanNameAware {
    void setBeanName(String beanName);
}
