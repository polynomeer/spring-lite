package lite.spring.aop.support;

import java.lang.reflect.Method;
import java.util.List;
import lite.spring.aop.MethodInterceptor;
import lite.spring.aop.annotation.Timed;
import lite.spring.context.factory.BeanPostProcessor;
import lite.spring.core.Ordered;
import lite.spring.core.metrics.MetricsRegistry;

public class TimedBeanPostProcessor implements BeanPostProcessor {
    private final MetricsRegistry metrics;

    public TimedBeanPostProcessor(MetricsRegistry metrics) {
        this.metrics = metrics;
    }

    @Override
    public Object postProcessAfterInitialization(String beanName, Object bean) {
        Class<?> target = ProxyFactory.getTargetClass(bean);
        boolean timed = target.isAnnotationPresent(Timed.class)
            || java.util.Arrays.stream(target.getDeclaredMethods()).anyMatch(method -> method.isAnnotationPresent(Timed.class));
        return timed ? ProxyFactory.createProxy(bean, List.of(new TimingInterceptor(target, beanName))) : bean;
    }

    private final class TimingInterceptor implements MethodInterceptor, Ordered {
        private final Class<?> target;
        private final String beanName;

        private TimingInterceptor(Class<?> target, String beanName) {
            this.target = target;
            this.beanName = beanName;
        }

        @Override
        public int getOrder() {
            return Ordered.LOWEST_PRECEDENCE - 10;
        }

        @Override
        public Object invoke(lite.spring.aop.MethodInvocation invocation) throws Throwable {
            Method method = findTargetMethod(invocation.getMethod());
            Timed timed = method.getAnnotation(Timed.class);
            Timed typeTimed = target.getAnnotation(Timed.class);
            if (timed == null && typeTimed == null) {
                return invocation.proceed();
            }
            String name = timed != null && !timed.value().isBlank()
                ? timed.value()
                : typeTimed != null && !typeTimed.value().isBlank()
                    ? typeTimed.value()
                    : beanName + "." + method.getName();
            long started = System.nanoTime();
            try {
                return invocation.proceed();
            } finally {
                metrics.recordNanos(name, System.nanoTime() - started);
            }
        }

        private Method findTargetMethod(Method invokedMethod) {
            Class<?> current = target;
            while (current != null) {
                try {
                    Method method = current.getDeclaredMethod(invokedMethod.getName(), invokedMethod.getParameterTypes());
                    method.setAccessible(true);
                    return method;
                } catch (NoSuchMethodException ignored) {
                    current = current.getSuperclass();
                }
            }
            return invokedMethod;
        }
    }
}
