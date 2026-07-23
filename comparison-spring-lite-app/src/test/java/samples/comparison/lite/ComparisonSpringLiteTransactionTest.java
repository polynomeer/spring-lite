package samples.comparison.lite;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import lite.spring.test.SpringLiteTest;
import org.junit.jupiter.api.Test;
import samples.comparison.lite.order.OrderRepository;
import samples.comparison.lite.order.OrderService;

@SpringLiteTest(classes = ComparisonSpringLiteApplication.class)
class ComparisonSpringLiteTransactionTest {
    @Test
    void rollsBackFailedTransactionalOperation(OrderService orderService, OrderRepository orderRepository) {
        long before = orderRepository.count();

        assertThatThrownBy(() -> orderService.createOrder("failed-book", 3, true))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("rollback requested");

        assertThat(orderRepository.count()).isEqualTo(before);
    }
}
