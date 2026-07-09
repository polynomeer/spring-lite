package lite.spring.aop.support;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import lite.spring.aop.MethodInterceptor;
import lite.spring.aop.MethodInvocation;
import lite.spring.aop.annotation.AfterReturning;
import lite.spring.aop.annotation.Around;
import lite.spring.aop.annotation.Aspect;
import lite.spring.aop.annotation.Before;
import lite.spring.context.ApplicationContext;
import lite.spring.context.factory.BeanPostProcessor;
import lite.spring.core.Ordered;
import lite.spring.core.annotation.Configuration;
import lite.spring.core.util.OrderUtils;
import lite.spring.core.reflect.ReflectionUtils;
import lite.spring.context.support.AnnotationUtils;

public class AspectBeanPostProcessor implements BeanPostProcessor {
    private final ApplicationContext applicationContext;

    public AspectBeanPostProcessor(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @Override
    public Object postProcessAfterInitialization(String beanName, Object bean) {
        Class<?> targetClass = ProxyFactory.getTargetClass(bean);
        if (targetClass.isAnnotationPresent(Aspect.class) || AnnotationUtils.hasAnnotation(targetClass, Configuration.class)) {
            return bean;
        }
        List<MethodInterceptor> interceptors = createInterceptors(bean, targetClass);
        if (interceptors.isEmpty()) {
            return bean;
        }
        return ProxyFactory.createProxy(bean, interceptors);
    }

    private List<MethodInterceptor> createInterceptors(Object bean, Class<?> targetClass) {
        Map<String, Object> aspectBeans = applicationContext.getBeansWithAnnotation(Aspect.class);
        List<AdviceDescriptor> descriptors = new ArrayList<>();
        for (Object aspectBean : aspectBeans.values()) {
            if (aspectBean == bean) {
                continue;
            }
            int aspectOrder = OrderUtils.getOrder(aspectBean);
            for (Method adviceMethod : aspectBean.getClass().getDeclaredMethods()) {
                AdviceDescriptor descriptor = toDescriptor(aspectBean, adviceMethod, aspectOrder);
                if (descriptor != null && matchesTarget(targetClass, descriptor)) {
                    descriptors.add(descriptor);
                }
            }
        }
        descriptors.sort(Comparator
            .comparingInt(AdviceDescriptor::order)
            .thenComparingInt(descriptor -> descriptor.adviceType().order));
        return descriptors.stream()
            .map(this::toInterceptor)
            .toList();
    }

    private AdviceDescriptor toDescriptor(Object aspectBean, Method adviceMethod, int aspectOrder) {
        int adviceOrder = OrderUtils.getOrder(adviceMethod, aspectOrder);
        Around around = adviceMethod.getAnnotation(Around.class);
        if (around != null) {
            return new AdviceDescriptor(aspectBean, adviceMethod, AdviceType.AROUND, around.methodName(), around.annotation(), adviceOrder);
        }
        Before before = adviceMethod.getAnnotation(Before.class);
        if (before != null) {
            return new AdviceDescriptor(aspectBean, adviceMethod, AdviceType.BEFORE, before.methodName(), before.annotation(), adviceOrder);
        }
        AfterReturning afterReturning = adviceMethod.getAnnotation(AfterReturning.class);
        if (afterReturning != null) {
            return new AdviceDescriptor(
                aspectBean,
                adviceMethod,
                AdviceType.AFTER_RETURNING,
                afterReturning.methodName(),
                afterReturning.annotation(),
                adviceOrder
            );
        }
        return null;
    }

    private boolean matchesTarget(Class<?> beanType, AdviceDescriptor descriptor) {
        for (Method method : getCandidateMethods(beanType)) {
            if (method.getDeclaringClass().equals(Object.class)) {
                continue;
            }
            if (matchesMethod(method, descriptor.methodName(), descriptor.annotationType())) {
                return true;
            }
        }
        return false;
    }

    private boolean matchesMethod(Method method, String methodName, Class<? extends Annotation> annotationType) {
        boolean nameMatches = methodName.isBlank() || method.getName().equals(methodName);
        boolean annotationMatches = annotationType.equals(Annotation.class) || method.isAnnotationPresent(annotationType);
        return nameMatches && annotationMatches;
    }

    private MethodInterceptor toInterceptor(AdviceDescriptor descriptor) {
        return new OrderedAdviceInterceptor(descriptor);
    }

    private boolean matchesInvocation(MethodInvocation invocation, AdviceDescriptor descriptor) {
        Method targetMethod = resolveTargetMethod(invocation);
        return matchesMethod(targetMethod, descriptor.methodName(), descriptor.annotationType());
    }

    private Method resolveTargetMethod(MethodInvocation invocation) {
        Class<?> candidate = invocation.getTarget().getClass();
        while (candidate != null) {
            try {
                return candidate.getDeclaredMethod(invocation.getMethod().getName(), invocation.getMethod().getParameterTypes());
            } catch (NoSuchMethodException ignored) {
                candidate = candidate.getSuperclass();
            }
        }
        throw new IllegalStateException("Failed to resolve target method " + invocation.getMethod());
    }

    private List<Method> getCandidateMethods(Class<?> beanType) {
        List<Method> methods = new ArrayList<>();
        Class<?> candidate = beanType;
        while (candidate != null && !candidate.equals(Object.class)) {
            methods.addAll(List.of(candidate.getDeclaredMethods()));
            candidate = candidate.getSuperclass();
        }
        return methods;
    }

    private Object invokeAdvice(AdviceDescriptor descriptor, MethodInvocation invocation, Object returnValue) {
        Method method = descriptor.method();
        Object[] arguments = resolveAdviceArguments(method.getParameters(), invocation, returnValue);
        return ReflectionUtils.invoke(method, descriptor.aspectBean(), arguments);
    }

    private Object[] resolveAdviceArguments(Parameter[] parameters, MethodInvocation invocation, Object returnValue) {
        Object[] arguments = new Object[parameters.length];
        for (int index = 0; index < parameters.length; index++) {
            Class<?> parameterType = parameters[index].getType();
            if (MethodInvocation.class.isAssignableFrom(parameterType)) {
                arguments[index] = invocation;
            } else if (returnValue != null && parameterType.isAssignableFrom(returnValue.getClass())) {
                arguments[index] = returnValue;
            } else {
                throw new IllegalStateException("Unsupported advice parameter type " + parameterType.getName());
            }
        }
        return arguments;
    }

    private enum AdviceType {
        BEFORE(0),
        AROUND(1),
        AFTER_RETURNING(2);

        private final int order;

        AdviceType(int order) {
            this.order = order;
        }
    }

    private record AdviceDescriptor(
        Object aspectBean,
        Method method,
        AdviceType adviceType,
        String methodName,
        Class<? extends Annotation> annotationType,
        int order
    ) {
    }

    private final class OrderedAdviceInterceptor implements MethodInterceptor, Ordered {
        private final AdviceDescriptor descriptor;

        private OrderedAdviceInterceptor(AdviceDescriptor descriptor) {
            this.descriptor = descriptor;
        }

        @Override
        public int getOrder() {
            return descriptor.order();
        }

        @Override
        public Object invoke(MethodInvocation invocation) throws Throwable {
            return switch (descriptor.adviceType()) {
                case BEFORE -> {
                    if (!matchesInvocation(invocation, descriptor)) {
                        yield invocation.proceed();
                    }
                    invokeAdvice(descriptor, invocation, null);
                    yield invocation.proceed();
                }
                case AROUND -> matchesInvocation(invocation, descriptor)
                    ? invokeAdvice(descriptor, invocation, null)
                    : invocation.proceed();
                case AFTER_RETURNING -> {
                    Object result = invocation.proceed();
                    if (matchesInvocation(invocation, descriptor)) {
                        invokeAdvice(descriptor, invocation, result);
                    }
                    yield result;
                }
            };
        }
    }
}
