package lite.spring.core.convert;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class DefaultConversionServiceTest {
    private final DefaultConversionService conversionService = new DefaultConversionService();

    @Test
    void convertsCommonScalarAndEnumTypes() {
        assertThat(conversionService.convert("12", int.class)).isEqualTo(12);
        assertThat(conversionService.convert("3.5", long.class)).isEqualTo(3L);
        assertThat(conversionService.convert("true", boolean.class)).isEqualTo(true);
        assertThat(conversionService.convert("2.5", double.class)).isEqualTo(2.5d);
        assertThat(conversionService.convert("ADVANCED", Mode.class)).isEqualTo(Mode.ADVANCED);
        assertThat(conversionService.convert(null, Integer.class)).isNull();
    }

    @Test
    void failsForUnsupportedTargetTypes() {
        assertThatThrownBy(() -> conversionService.convert("value", UnsupportedType.class))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Unsupported conversion target type");
    }

    enum Mode {
        BASIC,
        ADVANCED
    }

    static class UnsupportedType {
    }
}
