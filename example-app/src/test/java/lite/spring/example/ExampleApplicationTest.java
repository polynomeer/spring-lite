package lite.spring.example;

import static org.assertj.core.api.Assertions.assertThat;

import lite.spring.context.support.AnnotationConfigApplicationContext;
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
}

