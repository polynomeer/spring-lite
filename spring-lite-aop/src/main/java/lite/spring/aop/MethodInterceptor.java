package lite.spring.aop;

public interface MethodInterceptor {
    Object invoke(MethodInvocation invocation) throws Throwable;
}

