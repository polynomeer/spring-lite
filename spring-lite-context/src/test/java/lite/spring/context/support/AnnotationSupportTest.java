package lite.spring.context.support;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import lite.spring.core.annotation.Component;
import lite.spring.core.annotation.Configuration;
import org.junit.jupiter.api.Test;

class AnnotationSupportTest {
    @Test
    void detectsMetaAnnotationsAndFindsNestedAnnotations() {
        assertThat(AnnotationUtils.hasAnnotation(MetaAnnotatedComponent.class, Component.class)).isTrue();
        assertThat(AnnotationUtils.findAnnotation(MetaAnnotatedConfiguration.class, Configuration.class)).isNotNull();
    }

    @Test
    void generatesBeanNamesFromExplicitNameOrDecapitalizedClassName() {
        assertThat(BeanNameGenerator.generateBeanName(NamedComponent.class)).isEqualTo("namedBean");
        assertThat(BeanNameGenerator.generateBeanName(DefaultNamedComponent.class)).isEqualTo("defaultNamedComponent");
        assertThat(BeanNameGenerator.generateBeanName("beanMethod")).isEqualTo("beanMethod");
    }

    @Target(ElementType.TYPE)
    @Retention(RetentionPolicy.RUNTIME)
    @Component
    @interface MetaComponent {
    }

    @Target(ElementType.TYPE)
    @Retention(RetentionPolicy.RUNTIME)
    @Configuration
    @interface MetaConfiguration {
    }

    @MetaComponent
    static class MetaAnnotatedComponent {
    }

    @MetaConfiguration
    static class MetaAnnotatedConfiguration {
    }

    @Component("namedBean")
    static class NamedComponent {
    }

    @Component
    static class DefaultNamedComponent {
    }
}
