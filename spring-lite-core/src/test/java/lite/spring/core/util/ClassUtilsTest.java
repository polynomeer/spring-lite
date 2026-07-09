package lite.spring.core.util;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ClassUtilsTest {
    @Test
    void decapitalizesValuesAcrossEdgeCases() {
        assertThat(ClassUtils.decapitalize(null)).isNull();
        assertThat(ClassUtils.decapitalize("")).isEmpty();
        assertThat(ClassUtils.decapitalize("A")).isEqualTo("a");
        assertThat(ClassUtils.decapitalize("SampleBean")).isEqualTo("sampleBean");
        assertThat(ClassUtils.decapitalize("alreadyLower")).isEqualTo("alreadyLower");
    }
}
