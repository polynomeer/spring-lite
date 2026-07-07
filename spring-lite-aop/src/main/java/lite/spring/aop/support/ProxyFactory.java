package lite.spring.aop.support;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.List;
import lite.spring.aop.MethodInterceptor;
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

    public static Object createProxy(Object target, List<MethodInterceptor> interceptors) {
        Class<?>[] interfaces = target.getClass().getInterfaces();
        if (interfaces.length == 0) {
            return createClassProxy(target, interceptors);
        }
        InvocationHandler invocationHandler = (proxy, method, args) ->
            new SimpleMethodInvocation(target, method, args == null ? new Object[0] : args, interceptors).proceed();
        return Proxy.newProxyInstance(target.getClass().getClassLoader(), interfaces, invocationHandler);
    }

    private static Object createClassProxy(Object target, List<MethodInterceptor> interceptors) {
        try {
            InvocationHandler invocationHandler = (proxy, method, args) ->
                new SimpleMethodInvocation(target, method, args == null ? new Object[0] : args, interceptors).proceed();
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
