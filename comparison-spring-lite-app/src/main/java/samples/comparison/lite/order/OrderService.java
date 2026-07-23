package samples.comparison.lite.order;

import java.util.List;
import lite.spring.core.annotation.Service;
import lite.spring.core.annotation.Value;
import lite.spring.tx.annotation.Transactional;

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
