package lite.spring.example;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.example.order.Order;
import lite.spring.example.order.OrderService;
import org.junit.jupiter.api.Test;

class ExampleApplicationTest {
    @Test
    void loadsExampleApplicationAndCreatesOrders() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ExampleApplication.class)) {
            OrderService orderService = context.getBean(OrderService.class);

            assertThat(orderService.listOrders()).hasSize(1);
            assertThat(orderService.createOrder("book", 2).status()).isEqualTo("CREATED");
        }
    }

    @Test
    void returnsSeededOrderAndAppendsNewOrders() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ExampleApplication.class)) {
            OrderService orderService = context.getBean(OrderService.class);

            Order seeded = orderService.getOrder(1L);
            Order created = orderService.createOrder("pen", 3);

            assertThat(seeded.product()).isEqualTo("starter-kit");
            assertThat(created.id()).isEqualTo(2L);
            assertThat(orderService.listOrders()).extracting(Order::product).containsExactly("starter-kit", "pen");
        }
    }

    @Test
    void throwsForUnknownOrderId() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ExampleApplication.class)) {
            OrderService orderService = context.getBean(OrderService.class);

            assertThatThrownBy(() -> orderService.getOrder(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Order not found");
        }
    }
}
