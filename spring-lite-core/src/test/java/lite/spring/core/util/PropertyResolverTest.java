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
}
