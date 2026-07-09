package lite.spring.aop.support;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.List;
import lite.spring.aop.MethodInterceptor;
import lite.spring.core.util.OrderUtils;
import lite.spring.aop.MethodInvocation;
import net.bytebuddy.ByteBuddy;
import net.bytebuddy.dynamic.loading.ClassLoadingStrategy;
import net.bytebuddy.implementation.InvocationHandlerAdapter;
import net.bytebuddy.matcher.ElementMatchers;
import org.objenesis.ObjenesisStd;

public final class ProxyFactory {
    private static final String HANDLER_FIELD = "__springLiteHandler";

    private ProxyFactory() {
    }

    public static Object getTarget(Object candidate) {
        return unwrapProxy(candidate).target();
    }

    public static Class<?> getTargetClass(Object candidate) {
        return getTarget(candidate).getClass();
    }

    public static Object createProxy(Object target, List<MethodInterceptor> interceptors) {
        ProxyDescriptor descriptor = unwrapProxy(target);
        Object proxyTarget = descriptor.target();
        List<MethodInterceptor> mergedInterceptors = mergeInterceptors(descriptor.interceptors(), interceptors);
        Class<?>[] interfaces = proxyTarget.getClass().getInterfaces();
        if (interfaces.length == 0) {
            return createClassProxy(proxyTarget, mergedInterceptors);
        }
        SpringLiteInvocationHandler invocationHandler = new SpringLiteInvocationHandler(proxyTarget, mergedInterceptors);
        return Proxy.newProxyInstance(proxyTarget.getClass().getClassLoader(), interfaces, invocationHandler);
    }

    private static Object createClassProxy(Object target, List<MethodInterceptor> interceptors) {
        try {
            SpringLiteInvocationHandler invocationHandler = new SpringLiteInvocationHandler(target, interceptors);
            Class<?> proxyClass = new ByteBuddy()
                .subclass(target.getClass())
                .defineField(HANDLER_FIELD, InvocationHandler.class)
                .method(
                    ElementMatchers.not(ElementMatchers.isDeclaredBy(Object.class))
                        .and(ElementMatchers.not(ElementMatchers.isFinalizer()))
                        .and(ElementMatchers.not(ElementMatchers.isStatic()))
                        .and(ElementMatchers.not(ElementMatchers.isFinal()))
                )
                .intercept(InvocationHandlerAdapter.toField(HANDLER_FIELD))
                .make()
                .load(target.getClass().getClassLoader(), ClassLoadingStrategy.Default.INJECTION)
                .getLoaded();
            Object proxy = new ObjenesisStd().newInstance(proxyClass);
            Field handlerField = proxyClass.getDeclaredField(HANDLER_FIELD);
            handlerField.setAccessible(true);
            handlerField.set(proxy, invocationHandler);
            return proxy;
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to create class-based proxy for " + target.getClass().getName(), exception);
        }
    }

    private static ProxyDescriptor unwrapProxy(Object target) {
        if (Proxy.isProxyClass(target.getClass())) {
            InvocationHandler invocationHandler = Proxy.getInvocationHandler(target);
            if (invocationHandler instanceof SpringLiteInvocationHandler springLiteInvocationHandler) {
                return new ProxyDescriptor(springLiteInvocationHandler.target(), springLiteInvocationHandler.interceptors());
            }
        }
        try {
            Field handlerField = target.getClass().getDeclaredField(HANDLER_FIELD);
            handlerField.setAccessible(true);
            Object handler = handlerField.get(target);
            if (handler instanceof SpringLiteInvocationHandler springLiteInvocationHandler) {
                return new ProxyDescriptor(springLiteInvocationHandler.target(), springLiteInvocationHandler.interceptors());
            }
        } catch (NoSuchFieldException | IllegalAccessException ignored) {
        }
        return new ProxyDescriptor(target, List.of());
    }

    private static List<MethodInterceptor> mergeInterceptors(List<MethodInterceptor> existing, List<MethodInterceptor> additional) {
        List<MethodInterceptor> merged = new ArrayList<>(existing.size() + additional.size());
        merged.addAll(existing);
        merged.addAll(additional);
        merged.sort(OrderUtils.comparator());
        return merged;
    }

    private record ProxyDescriptor(Object target, List<MethodInterceptor> interceptors) {
    }

    private static final class SpringLiteInvocationHandler implements InvocationHandler {
        private final Object target;
        private final List<MethodInterceptor> interceptors;

        private SpringLiteInvocationHandler(Object target, List<MethodInterceptor> interceptors) {
            this.target = target;
            this.interceptors = List.copyOf(interceptors);
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            return new SimpleMethodInvocation(target, method, args == null ? new Object[0] : args, interceptors).proceed();
        }

        private Object target() {
            return target;
        }

        private List<MethodInterceptor> interceptors() {
            return interceptors;
        }
    }

    private static final class SimpleMethodInvocation implements MethodInvocation {
        private final Object target;
        private final Method method;
        private final Object[] arguments;
        private final List<MethodInterceptor> interceptors;
        private int index;

        private SimpleMethodInvocation(Object target, Method method, Object[] arguments, List<MethodInterceptor> interceptors) {
            this.target = target;
            this.method = method;
            this.arguments = arguments;
            this.interceptors = new ArrayList<>(interceptors);
        }

        @Override
        public Method getMethod() {
            return method;
        }

        @Override
        public Object[] getArguments() {
            return arguments;
        }

        @Override
        public Object getTarget() {
            return target;
        }

        @Override
        public Object proceed() throws Throwable {
            if (index < interceptors.size()) {
                return interceptors.get(index++).invoke(this);
            }
            try {
                method.setAccessible(true);
                return method.invoke(target, arguments);
            } catch (InvocationTargetException exception) {
                throw exception.getTargetException();
            }
        }
    }
}
