package lite.spring.core.util;

import java.lang.reflect.AnnotatedElement;
import java.util.Comparator;
import lite.spring.core.Ordered;
import lite.spring.core.annotation.Order;

public final class OrderUtils {
    private OrderUtils() {
    }

    public static int getOrder(Object candidate) {
        if (candidate instanceof Ordered ordered) {
            return ordered.getOrder();
        }
        return getOrder(candidate.getClass(), Ordered.LOWEST_PRECEDENCE);
    }

    public static int getOrder(AnnotatedElement element, int defaultOrder) {
        Order order = element.getAnnotation(Order.class);
        return order == null ? defaultOrder : order.value();
    }

    public static <T> Comparator<T> comparator() {
        return Comparator.comparingInt(OrderUtils::getOrder);
    }
}
