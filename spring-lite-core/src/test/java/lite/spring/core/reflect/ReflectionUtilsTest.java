package lite.spring.core.reflect;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import org.junit.jupiter.api.Test;

class ReflectionUtilsTest {
    @Test
    void instantiatesAndInvokesAccessibleMembers() throws Exception {
        Constructor<Sample> constructor = Sample.class.getDeclaredConstructor(String.class);
        Sample sample = ReflectionUtils.instantiate(constructor, new Object[]{"codex"});

        Method method = Sample.class.getDeclaredMethod("message");

        assertThat(ReflectionUtils.invoke(method, sample, new Object[0])).isEqualTo("hello codex");
    }

    @Test
    void wrapsInvocationFailures() throws Exception {
        Method method = Sample.class.getDeclaredMethod("fail");

        assertThatThrownBy(() -> ReflectionUtils.invoke(method, new Sample("x"), new Object[0]))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Failed to invoke");
    }

    static class Sample {
        private final String value;

        private Sample(String value) {
            this.value = value;
        }

        private String message() {
            return "hello " + value;
        }

        private void fail() {
            throw new IllegalArgumentException("boom");
        }
    }
}
