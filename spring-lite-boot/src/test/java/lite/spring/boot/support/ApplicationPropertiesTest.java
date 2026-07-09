package lite.spring.boot.support;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ApplicationPropertiesTest {
    @Test
    void loadsValuesFromApplicationYamlAndUsesDefaults() {
        ApplicationProperties properties = ApplicationProperties.load();

        assertThat(properties.get("test.feature.enabled", "false")).isEqualTo("true");
        assertThat(properties.get("missing.key", "fallback")).isEqualTo("fallback");
    }
}
