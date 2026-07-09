package lite.spring.tx.support;

import java.lang.reflect.Method;
import java.util.List;
import lite.spring.aop.MethodInterceptor;
import lite.spring.aop.support.ProxyFactory;
import lite.spring.context.factory.BeanPostProcessor;
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
        if (bean.getClass().isAnnotationPresent(Transactional.class)) {
            return true;
        }
        for (Method method : bean.getClass().getMethods()) {
            if (method.isAnnotationPresent(Transactional.class)) {
                return true;
            }
        }
        return false;
    }

    private MethodInterceptor transactionInterceptor(Object bean) {
        return invocation -> {
            Method targetMethod = bean.getClass().getMethod(invocation.getMethod().getName(), invocation.getMethod().getParameterTypes());
            Transactional transactional = resolveTransactionalMetadata(bean.getClass(), targetMethod);
            if (transactional == null) {
                return invocation.proceed();
            }
            transactionManager.begin();
            try {
                Object result = invocation.proceed();
                transactionManager.commit();
                return result;
            } catch (Throwable throwable) {
                if (shouldRollback(throwable, transactional)) {
                    transactionManager.rollback();
                } else {
                    transactionManager.commit();
                }
                throw throwable;
            }
        };
    }

    private Transactional resolveTransactionalMetadata(Class<?> beanType, Method targetMethod) {
        Transactional methodAnnotation = targetMethod.getAnnotation(Transactional.class);
        return methodAnnotation != null ? methodAnnotation : beanType.getAnnotation(Transactional.class);
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
}
