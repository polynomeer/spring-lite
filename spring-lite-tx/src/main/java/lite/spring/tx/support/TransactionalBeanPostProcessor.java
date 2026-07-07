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
            boolean transactional = bean.getClass().isAnnotationPresent(Transactional.class)
                || targetMethod.isAnnotationPresent(Transactional.class);
            if (!transactional) {
                return invocation.proceed();
            }
            transactionManager.begin();
            try {
                Object result = invocation.proceed();
                transactionManager.commit();
                return result;
            } catch (Throwable throwable) {
                transactionManager.rollback();
                throw throwable;
            }
        };
    }
}

