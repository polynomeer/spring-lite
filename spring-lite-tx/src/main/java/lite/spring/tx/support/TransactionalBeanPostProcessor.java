package lite.spring.tx.support;

import java.lang.reflect.Method;
import java.util.List;
import lite.spring.aop.MethodInterceptor;
import lite.spring.aop.support.ProxyFactory;
import lite.spring.context.factory.BeanPostProcessor;
import lite.spring.core.Ordered;
import lite.spring.core.trace.TraceLayer;
import lite.spring.core.trace.TraceRecorder;
import lite.spring.tx.annotation.Transactional;

public class TransactionalBeanPostProcessor implements BeanPostProcessor {
    private final TransactionManager transactionManager;

    public TransactionalBeanPostProcessor(TransactionManager transactionManager) {
        this.transactionManager = transactionManager;
    }

    @Override
    public Object postProcessAfterInitialization(String beanName, Object bean) {
        if (!requiresTransactionProxy(bean)) {
            return bean;
        }
        return ProxyFactory.createProxy(bean, List.of(transactionInterceptor(bean)));
    }

    private boolean requiresTransactionProxy(Object bean) {
        Class<?> targetClass = ProxyFactory.getTargetClass(bean);
        if (targetClass.isAnnotationPresent(Transactional.class)) {
            return true;
        }
        for (Class<?> current = targetClass; current != null; current = current.getSuperclass()) {
            for (Method method : current.getDeclaredMethods()) {
                if (method.isAnnotationPresent(Transactional.class)) {
                    return true;
                }
            }
            if (hasTransactionalInterfaceMethod(current)) {
                return true;
            }
        }
        return false;
    }

    private boolean hasTransactionalInterfaceMethod(Class<?> targetClass) {
        for (Class<?> implementedInterface : targetClass.getInterfaces()) {
            for (Method method : implementedInterface.getMethods()) {
                if (method.isAnnotationPresent(Transactional.class)) {
                    return true;
                }
            }
        }
        return false;
    }

    private MethodInterceptor transactionInterceptor(Object bean) {
        return new TransactionInterceptor(ProxyFactory.getTargetClass(bean));
    }

    private Transactional resolveTransactionalMetadata(Class<?> beanType, Method targetMethod, Method invokedMethod) {
        Transactional methodAnnotation = targetMethod.getAnnotation(Transactional.class);
        if (methodAnnotation != null) {
            return methodAnnotation;
        }
        Transactional interfaceAnnotation = invokedMethod.getAnnotation(Transactional.class);
        return interfaceAnnotation != null ? interfaceAnnotation : beanType.getAnnotation(Transactional.class);
    }

    private boolean shouldRollback(Throwable throwable, Transactional transactional) {
        for (Class<? extends Throwable> noRollbackType : transactional.noRollbackFor()) {
            if (noRollbackType.isAssignableFrom(throwable.getClass())) {
                return false;
            }
        }
        for (Class<? extends Throwable> rollbackType : transactional.rollbackFor()) {
            if (rollbackType.isAssignableFrom(throwable.getClass())) {
                return true;
            }
        }
        return true;
    }

    private final class TransactionInterceptor implements MethodInterceptor, Ordered {
        private final Class<?> targetClass;

        private TransactionInterceptor(Class<?> targetClass) {
            this.targetClass = targetClass;
        }

        @Override
        public int getOrder() {
            return Ordered.LOWEST_PRECEDENCE;
        }

        @Override
        public Object invoke(lite.spring.aop.MethodInvocation invocation) throws Throwable {
            Method targetMethod = findTargetMethod(invocation.getMethod());
            Transactional transactional = resolveTransactionalMetadata(targetClass, targetMethod, invocation.getMethod());
            if (transactional == null) {
                return invocation.proceed();
            }
            String frame = targetClass.getSimpleName() + "." + targetMethod.getName();
            TraceRecorder.pushFrame(frame);
            TraceRecorder.record(TraceLayer.AOP, "proxy-enter", "proxy", "Transactional proxy intercepted " + frame + ".",
                TraceRecorder.attributes("propagation", transactional.propagation(), "readOnly", transactional.readOnly()));
            try {
                transactionManager.begin(transactional.propagation(), transactional.readOnly());
                try {
                    Object result = invocation.proceed();
                    TraceRecorder.record(TraceLayer.SERVICE, "return", "return", frame + " returned normally.");
                    transactionManager.commit();
                    return result;
                } catch (Throwable throwable) {
                    boolean rollback = shouldRollback(throwable, transactional);
                    TraceRecorder.record(TraceLayer.SERVICE, "throw", "throw", frame + " threw " + throwable.getClass().getSimpleName() + ".",
                        TraceRecorder.attributes("exception", throwable.getClass().getName(), "rollback", rollback));
                    if (rollback) {
                        transactionManager.rollback();
                    } else {
                        transactionManager.commit();
                    }
                    throw throwable;
                }
            } finally {
                TraceRecorder.popFrame();
            }
        }

        private Method findTargetMethod(Method invokedMethod) {
            for (Class<?> current = targetClass; current != null; current = current.getSuperclass()) {
                try {
                    Method method = current.getDeclaredMethod(invokedMethod.getName(), invokedMethod.getParameterTypes());
                    method.setAccessible(true);
                    return method;
                } catch (NoSuchMethodException ignored) {
                    // Continue to a superclass before using the proxy's interface method.
                }
            }
            return invokedMethod;
        }
    }
}
