package lite.spring.context.scan;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

public final class ClassPathScanner {
    public List<Class<?>> scan(String basePackage) {
        String path = basePackage.replace('.', '/');
        try {
            Enumeration<URL> resources = Thread.currentThread().getContextClassLoader().getResources(path);
            List<Class<?>> classes = new ArrayList<>();
            while (resources.hasMoreElements()) {
                URL resource = resources.nextElement();
                if (!"file".equals(resource.getProtocol())) {
                    continue;
                }
                File directory = new File(URLDecoder.decode(resource.getFile(), StandardCharsets.UTF_8));
                classes.addAll(scanDirectory(basePackage, directory));
            }
            return classes;
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
}

