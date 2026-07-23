package samples.comparison.spring;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import samples.comparison.spring.order.OrderRepository;
import samples.comparison.spring.order.OrderService;

@SpringBootTest
class ComparisonSpringBootTransactionTest {
    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Test
    void rollsBackFailedTransactionalOperation() {
        long before = orderRepository.count();

        assertThatThrownBy(() -> orderService.createOrder("failed-book", 3, true))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("rollback requested");

        assertThat(orderRepository.count()).isEqualTo(before);
    }
}
