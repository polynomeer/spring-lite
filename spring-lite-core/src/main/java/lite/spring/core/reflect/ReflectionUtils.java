package lite.spring.core.reflect;

import java.lang.reflect.AccessibleObject;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public final class ReflectionUtils {
    private ReflectionUtils() {
    }

    public static <T extends AccessibleObject> T makeAccessible(T accessibleObject) {
        accessibleObject.setAccessible(true);
        return accessibleObject;
    }

    public static <T> T instantiate(Constructor<T> constructor, Object[] args) {
        try {
            makeAccessible(constructor);
            return constructor.newInstance(args);
        } catch (InstantiationException | IllegalAccessException | InvocationTargetException exception) {
            throw new IllegalStateException("Failed to instantiate " + constructor.getDeclaringClass().getName(), exception);
        }
    }

    public static Object invoke(Method method, Object target, Object[] args) {
        try {
            makeAccessible(method);
            return method.invoke(target, args);
        } catch (IllegalAccessException | InvocationTargetException exception) {
            throw new IllegalStateException("Failed to invoke " + method, exception);
        }
    }
}

