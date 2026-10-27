package lite.spring.aop.support;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import lite.spring.aop.MethodInterceptor;
import lite.spring.aop.MethodInvocation;
import lite.spring.core.Ordered;
import lite.spring.core.whatif.WhatIf;
import org.junit.jupiter.api.Test;

class ProxyFactoryWhatIfTest {
    @Test
    void reversesTheInterceptorChainOnlyWhileTheFlagIsOn() {
        List<String> calls = new ArrayList<>();
        Greeter proxy = (Greeter) ProxyFactory.createProxy(new EnglishGreeter(), List.of(
            new RecordingInterceptor("outer", 1, calls),
            new RecordingInterceptor("inner", 2, calls)
        ));

        proxy.greet();
        WhatIf.with(Set.of(WhatIf.Flag.AOP_REVERSE_INTERCEPTOR_ORDER), proxy::greet);

        assertThat(calls).containsExactly("outer", "inner", "inner", "outer");
    }

    @Test
    void forcesSubclassProxyForInterfaceTargets() {
        Object normal = ProxyFactory.createProxy(new EnglishGreeter(), List.of());
        Object forced = WhatIf.with(Set.of(WhatIf.Flag.AOP_FORCE_CLASS_PROXY),
            () -> ProxyFactory.createProxy(new EnglishGreeter(), List.of()));

        assertThat(Proxy.isProxyClass(normal.getClass())).isTrue();
        assertThat(normal).isNotInstanceOf(EnglishGreeter.class);
        assertThat(forced).isInstanceOf(EnglishGreeter.class);
        assertThat(((EnglishGreeter) forced).greet()).isEqualTo("hello");
    }

    interface Greeter {
        String greet();
    }

    public static class EnglishGreeter implements Greeter {
        @Override
        public String greet() {
            return "hello";
        }
    }

    private record RecordingInterceptor(String name, int order, List<String> calls) implements MethodInterceptor, Ordered {
        @Override
        public Object invoke(MethodInvocation invocation) throws Throwable {
            calls.add(name);
            return invocation.proceed();
        }

        @Override
        public int getOrder() {
            return order;
        }
    }
}
