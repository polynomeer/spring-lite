package lite.spring.context.scan;

import java.io.File;
import java.io.IOException;
import java.net.JarURLConnection;
import java.net.URL;
import java.net.URLClassLoader;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

public final class ClassPathScanner {
    public List<Class<?>> scan(String basePackage) {
        String path = basePackage.replace('.', '/');
        try {
            Enumeration<URL> resources = Thread.currentThread().getContextClassLoader().getResources(path);
            Map<String, Class<?>> classes = new LinkedHashMap<>();
            while (resources.hasMoreElements()) {
                URL resource = resources.nextElement();
                if ("file".equals(resource.getProtocol())) {
                    File directory = new File(URLDecoder.decode(resource.getFile(), StandardCharsets.UTF_8));
                    addClasses(classes, scanDirectory(basePackage, directory));
                } else if ("jar".equals(resource.getProtocol())) {
                    addClasses(classes, scanJar(basePackage, path, resource));
                }
            }
            addClasses(classes, scanUrlsFromClassLoader(path));
            return new ArrayList<>(classes.values());
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to scan package " + basePackage, exception);
        }
    }

    private List<Class<?>> scanDirectory(String basePackage, File directory) {
        List<Class<?>> classes = new ArrayList<>();
        File[] files = directory.listFiles();
        if (files == null) {
            return classes;
        }
        for (File file : files) {
            if (file.isDirectory()) {
                classes.addAll(scanDirectory(basePackage + "." + file.getName(), file));
                continue;
            }
            if (!file.getName().endsWith(".class") || file.getName().contains("$")) {
                continue;
            }
            String className = basePackage + "." + file.getName().replace(".class", "");
            try {
                classes.add(Class.forName(className));
            } catch (ClassNotFoundException exception) {
                throw new IllegalStateException("Failed to load class " + className, exception);
            }
        }
        return classes;
    }

    private List<Class<?>> scanJar(String basePackage, String path, URL resource) throws IOException {
        JarURLConnection connection = (JarURLConnection) resource.openConnection();
        try (JarFile jarFile = connection.getJarFile()) {
            List<Class<?>> classes = new ArrayList<>();
            Enumeration<JarEntry> entries = jarFile.entries();
            while (entries.hasMoreElements()) {
                JarEntry entry = entries.nextElement();
                String entryName = entry.getName();
                if (!entryName.startsWith(path)
                    || !entryName.endsWith(".class")
                    || entryName.contains("$")) {
                    continue;
                }
                String className = entryName.replace('/', '.').replace(".class", "");
                classes.add(loadClass(className));
            }
            return classes;
        }
    }

    private Class<?> loadClass(String className) {
        try {
            return Class.forName(className, false, Thread.currentThread().getContextClassLoader());
        } catch (ClassNotFoundException exception) {
            throw new IllegalStateException("Failed to load class " + className, exception);
        }
    }

    private List<Class<?>> scanUrlsFromClassLoader(String path) throws IOException {
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        if (!(classLoader instanceof URLClassLoader urlClassLoader)) {
            return List.of();
        }
        List<Class<?>> classes = new ArrayList<>();
        for (URL url : urlClassLoader.getURLs()) {
            if (!url.getPath().endsWith(".jar")) {
                continue;
            }
            URL jarUrl = new URL("jar:" + url.toExternalForm() + "!/");
            classes.addAll(scanJar("", path, jarUrl));
        }
        return classes;
    }

    private void addClasses(Map<String, Class<?>> classes, List<Class<?>> discovered) {
        for (Class<?> candidate : discovered) {
            classes.putIfAbsent(candidate.getName(), candidate);
        }
    }
}
