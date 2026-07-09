package lite.spring.test;

import java.lang.reflect.Field;
import lite.spring.boot.annotation.SpringLiteBootApplication;
import lite.spring.boot.support.BootInfrastructureRegistrar;
import lite.spring.context.ApplicationContext;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.core.annotation.Autowired;
import lite.spring.core.reflect.ReflectionUtils;
import lite.spring.test.web.MockMvc;
import lite.spring.tx.annotation.Transactional;
import lite.spring.tx.support.TransactionManager;
import org.junit.jupiter.api.extension.AfterEachCallback;
import org.junit.jupiter.api.extension.BeforeEachCallback;
import org.junit.jupiter.api.extension.BeforeAllCallback;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.ParameterContext;
import org.junit.jupiter.api.extension.ParameterResolver;
import org.junit.jupiter.api.extension.TestInstancePostProcessor;

public class SpringLiteTestExtension implements BeforeAllCallback, BeforeEachCallback, AfterEachCallback, TestInstancePostProcessor, ParameterResolver {
    private static final ExtensionContext.Namespace NAMESPACE = ExtensionContext.Namespace.create(SpringLiteTestExtension.class);
    private static final String CONTEXT_KEY = "applicationContext";
    private static final String MOCK_MVC_KEY = "mockMvc";
    private static final String TRANSACTION_ACTIVE_KEY = "transactionActive";

    @Override
    public void beforeAll(ExtensionContext extensionContext) {
        getOrCreateContext(extensionContext);
    }

    @Override
    public void beforeEach(ExtensionContext extensionContext) {
        if (!isTransactionalTest(extensionContext)) {
            extensionContext.getStore(NAMESPACE).put(TRANSACTION_ACTIVE_KEY, false);
            return;
        }
        AnnotationConfigApplicationContext context = getOrCreateContext(extensionContext);
        if (!context.containsBeanOfType(TransactionManager.class)) {
            throw new IllegalStateException("@Transactional test requires a TransactionManager bean");
        }
        context.getBean(TransactionManager.class).begin();
        extensionContext.getStore(NAMESPACE).put(TRANSACTION_ACTIVE_KEY, true);
    }

    @Override
    public void afterEach(ExtensionContext extensionContext) {
        Boolean transactionActive = extensionContext.getStore(NAMESPACE).remove(TRANSACTION_ACTIVE_KEY, Boolean.class);
        if (!Boolean.TRUE.equals(transactionActive)) {
            return;
        }
        AnnotationConfigApplicationContext context = getOrCreateContext(extensionContext);
        context.getBean(TransactionManager.class).rollback();
    }

    @Override
    public void postProcessTestInstance(Object testInstance, ExtensionContext extensionContext) throws IllegalAccessException {
        AnnotationConfigApplicationContext context = getOrCreateContext(extensionContext);
        for (Field field : testInstance.getClass().getDeclaredFields()) {
            if (!field.isAnnotationPresent(Autowired.class)) {
                continue;
            }
            Object value = resolveType(field.getType(), context, extensionContext);
            ReflectionUtils.makeAccessible(field).set(testInstance, value);
        }
    }

    @Override
    public boolean supportsParameter(ParameterContext parameterContext, ExtensionContext extensionContext) {
        Class<?> parameterType = parameterContext.getParameter().getType();
        return ApplicationContext.class.isAssignableFrom(parameterType)
            || AnnotationConfigApplicationContext.class.isAssignableFrom(parameterType)
            || MockMvc.class.equals(parameterType)
            || getOrCreateContext(extensionContext).containsBeanOfType(parameterType);
    }

    @Override
    public Object resolveParameter(ParameterContext parameterContext, ExtensionContext extensionContext) {
        AnnotationConfigApplicationContext context = getOrCreateContext(extensionContext);
        return resolveType(parameterContext.getParameter().getType(), context, extensionContext);
    }

    private Object resolveType(Class<?> type, AnnotationConfigApplicationContext context, ExtensionContext extensionContext) {
        if (AnnotationConfigApplicationContext.class.isAssignableFrom(type) || ApplicationContext.class.isAssignableFrom(type)) {
            return context;
        }
        if (MockMvc.class.equals(type)) {
            return extensionContext.getStore(NAMESPACE).getOrComputeIfAbsent(MOCK_MVC_KEY, key -> MockMvc.from(context), MockMvc.class);
        }
        return context.getBean(type);
    }

    private AnnotationConfigApplicationContext getOrCreateContext(ExtensionContext extensionContext) {
        return extensionContext.getStore(NAMESPACE)
            .getOrComputeIfAbsent(CONTEXT_KEY, key -> createContext(extensionContext), ContextResource.class)
            .context();
    }

    private boolean isTransactionalTest(ExtensionContext extensionContext) {
        return extensionContext.getRequiredTestMethod().isAnnotationPresent(Transactional.class)
            || extensionContext.getRequiredTestClass().isAnnotationPresent(Transactional.class);
    }

    private ContextResource createContext(ExtensionContext extensionContext) {
        SpringLiteTest annotation = extensionContext.getRequiredTestClass().getAnnotation(SpringLiteTest.class);
        if (annotation == null || annotation.classes().length == 0) {
            throw new IllegalStateException("@SpringLiteTest requires at least one configuration class");
        }
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(annotation.classes());
        if (usesBootDefaults(annotation.classes())) {
            BootInfrastructureRegistrar.registerDefaults(context);
        }
        context.refresh();
        return new ContextResource(context);
    }

    private boolean usesBootDefaults(Class<?>[] configurationClasses) {
        for (Class<?> configurationClass : configurationClasses) {
            if (configurationClass.isAnnotationPresent(SpringLiteBootApplication.class)) {
                return true;
            }
        }
        return false;
    }

    private record ContextResource(AnnotationConfigApplicationContext context) implements ExtensionContext.Store.CloseableResource {
        @Override
        public void close() {
            context.close();
        }
    }
}
