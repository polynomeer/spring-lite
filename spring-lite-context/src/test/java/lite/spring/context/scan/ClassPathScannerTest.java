package lite.spring.context.scan;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.InputStream;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.jar.JarEntry;
import java.util.jar.JarOutputStream;
import org.junit.jupiter.api.Test;

class ClassPathScannerTest {
    @Test
    void scansClassesFromJarUrls() throws Exception {
        Path jarFile = Files.createTempFile("spring-lite-scan", ".jar");
        try (JarOutputStream jarOutputStream = new JarOutputStream(Files.newOutputStream(jarFile))) {
            jarOutputStream.putNextEntry(new JarEntry("lite/spring/context/jarfixture/JarScannedComponent.class"));
            try (InputStream inputStream = getClass().getClassLoader()
                .getResourceAsStream("lite/spring/context/jarfixture/JarScannedComponent.class")) {
                jarOutputStream.write(inputStream.readAllBytes());
            }
            jarOutputStream.closeEntry();
        }

        ClassLoader original = Thread.currentThread().getContextClassLoader();
        try (URLClassLoader classLoader = new URLClassLoader(new URL[]{jarFile.toUri().toURL()}, null)) {
            Thread.currentThread().setContextClassLoader(classLoader);

            List<Class<?>> classes = new ClassPathScanner().scan("lite.spring.context.jarfixture");

            assertThat(classes).extracting(Class::getName).containsExactly("lite.spring.context.jarfixture.JarScannedComponent");
        } finally {
            Thread.currentThread().setContextClassLoader(original);
            Files.deleteIfExists(jarFile);
        }
    }
}

