package lite.spring.aop.support;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.List;
import lite.spring.aop.MethodInterceptor;
import lite.spring.aop.MethodInvocation;

public final class ProxyFactory {
    private ProxyFactory() {
    }

    public static Object createProxy(Object target, List<MethodInterceptor> interceptors) {
        Class<?>[] interfaces = target.getClass().getInterfaces();
        if (interfaces.length == 0) {
            return target;
        }
        InvocationHandler invocationHandler = (proxy, method, args) ->
            new SimpleMethodInvocation(target, method, args == null ? new Object[0] : args, interceptors).proceed();
        return Proxy.newProxyInstance(target.getClass().getClassLoader(), interfaces, invocationHandler);
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
            return method.invoke(target, arguments);
        }
    }
}

