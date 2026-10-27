package samples.comparison.spring.lab.trace;

import javax.sql.DataSource;
import org.aopalliance.intercept.MethodInterceptor;
import org.springframework.aop.Advisor;
import org.springframework.aop.support.DefaultPointcutAdvisor;
import org.springframework.aop.support.annotation.AnnotationMatchingPointcut;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Role;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.annotation.Transactional;

/**
 * Wires the Boot-side trace adapters. The transaction advisor gets an explicit order so the two
 * trace advisors can sit around it the way spring-lite's single interceptor records events: the
 * call is entered before the transaction begins, and the method outcome is known before commit or
 * rollback.
 */
@Configuration(proxyBeanMethods = false)
@EnableTransactionManagement(order = ComparisonTraceConfig.TRANSACTION_ORDER)
public class ComparisonTraceConfig {
    static final int TRANSACTION_ORDER = 100;

    @Bean
    PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new TracingTransactionManager(dataSource);
    }

    @Bean
    static BeanPostProcessor tracingDataSourcePostProcessor() {
        return new BeanPostProcessor() {
            @Override
            public Object postProcessAfterInitialization(Object bean, String beanName) {
                return bean instanceof DataSource dataSource && !(bean instanceof TracingDataSource)
                    ? new TracingDataSource(dataSource)
                    : bean;
            }
        };
    }

    @Bean
    @Role(BeanDefinition.ROLE_INFRASTRUCTURE)
    static Advisor callEnterTraceAdvisor() {
        MethodInterceptor interceptor = invocation -> {
            ComparisonTrace.record("call.enter", "aop", "Proxy intercepted " + frame(invocation) + ".");
            return invocation.proceed();
        };
        return advisor(interceptor, TRANSACTION_ORDER - 1);
    }

    @Bean
    @Role(BeanDefinition.ROLE_INFRASTRUCTURE)
    static Advisor callOutcomeTraceAdvisor() {
        MethodInterceptor interceptor = invocation -> {
            try {
                Object result = invocation.proceed();
                ComparisonTrace.record("call.return", "service", frame(invocation) + " returned normally.");
                return result;
            } catch (Throwable throwable) {
                ComparisonTrace.record("call.throw", "service", frame(invocation) + " threw " + throwable.getClass().getSimpleName() + ".",
                    "exception", throwable.getClass().getName());
                throw throwable;
            }
        };
        return advisor(interceptor, TRANSACTION_ORDER + 1);
    }

    private static Advisor advisor(MethodInterceptor interceptor, int order) {
        DefaultPointcutAdvisor advisor = new DefaultPointcutAdvisor(AnnotationMatchingPointcut.forMethodAnnotation(Transactional.class), interceptor);
        advisor.setOrder(order);
        return advisor;
    }

    private static String frame(org.aopalliance.intercept.MethodInvocation invocation) {
        return invocation.getMethod().getDeclaringClass().getSimpleName() + "." + invocation.getMethod().getName();
    }
}
