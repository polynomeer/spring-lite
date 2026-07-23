package samples.comparison.spring.order;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final String defaultStatus;

    public OrderService(
        OrderRepository orderRepository,
        @Value("${comparison.order.default-status:PENDING}") String defaultStatus
    ) {
        this.orderRepository = orderRepository;
        this.defaultStatus = defaultStatus;
    }

    @Transactional(rollbackFor = IllegalStateException.class)
    public Order createOrder(String product, int quantity, boolean failAfterSave) {
        Order saved = orderRepository.save(product, quantity, defaultStatus);
        if (failAfterSave) {
            throw new IllegalStateException("rollback requested");
        }
        return saved;
    }

    public List<Order> listOrders() {
        return orderRepository.findAll();
    }
}
