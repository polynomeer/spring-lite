package lite.spring.core.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class PropertyResolverTest {
    @Test
    void loadsNestedYamlKeysFromClasspath() {
        PropertyResolver resolver = PropertyResolver.loadFromClasspath("property-resolver.yml");

        assertThat(resolver.get("app.name")).isEqualTo("spring-lite");
        assertThat(resolver.get("app.feature.enabled")).isEqualTo("true");
        assertThat(resolver.contains("app.answer.count")).isTrue();
    }

    @Test
    void resolvesPlaceholdersWithDefaultFallbacks() {
        PropertyResolver resolver = PropertyResolver.loadFromClasspath("property-resolver.yml");

        assertThat(resolver.resolveRequiredPlaceholder("${app.name}")).isEqualTo("spring-lite");
        assertThat(resolver.resolveRequiredPlaceholder("${app.missing:fallback}")).isEqualTo("fallback");
    }

    @Test
    void throwsWhenRequiredPlaceholderIsMissing() {
        PropertyResolver resolver = PropertyResolver.empty();

        assertThatThrownBy(() -> resolver.resolveRequiredPlaceholder("${app.missing}"))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Missing required property");
    }

    @Test
    void returnsDefaultValueAndEmptyResolverForMissingResource() {
        PropertyResolver resolver = PropertyResolver.loadFromClasspath("missing-resource.yml");

        assertThat(resolver.get("missing.key", "default")).isEqualTo("default");
        assertThat(resolver.contains("missing.key")).isFalse();
    }

    @Test
    void mergesProfileSpecificApplicationProperties() {
        String previousProfiles = System.getProperty("spring.profiles.active");
        System.setProperty("spring.profiles.active", "local");
        try {
            PropertyResolver resolver = PropertyResolver.loadApplicationProperties();

            assertThat(resolver.get("app.name")).isEqualTo("spring-lite-local");
            assertThat(resolver.get("app.feature.enabled")).isEqualTo("false");
            assertThat(resolver.get("app.timeout")).isEqualTo("30");
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
