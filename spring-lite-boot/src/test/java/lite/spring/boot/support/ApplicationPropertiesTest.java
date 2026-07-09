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

    @Test
    void mergesActiveProfileProperties() {
        String previousProfiles = System.getProperty("spring.profiles.active");
        System.setProperty("spring.profiles.active", "local");
        try {
            ApplicationProperties properties = ApplicationProperties.load();

            assertThat(properties.get("test.feature.enabled", "true")).isEqualTo("false");
            assertThat(properties.get("test.feature.name", "missing")).isEqualTo("local-profile");
        } finally {
            restoreProperty("spring.profiles.active", previousProfiles);
        }
    }

    private void restoreProperty(String key, String value) {
        if (value == null) {
            System.clearProperty(key);
            return;
        }
        System.setProperty(key, value);
    }
}
