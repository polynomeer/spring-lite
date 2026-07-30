package lite.spring.example.order;

import java.util.List;
import lite.spring.core.annotation.Service;
import lite.spring.core.annotation.Value;
import lite.spring.tx.annotation.Transactional;

@Service
public class DefaultOrderService implements OrderService {
    private final OrderRepository orderRepository;
    private final String defaultStatus;

    public DefaultOrderService(
        OrderRepository orderRepository,
        @Value("${example.order.default-status:CREATED}") String defaultStatus
    ) {
        this.orderRepository = orderRepository;
        this.defaultStatus = defaultStatus;
    }

    @Override
    @Transactional
    public Order createOrder(String product, int quantity) {
        return orderRepository.save(product, quantity, defaultStatus);
    }

    @Override
    @Transactional
    public Order createOrderAndFail(String product, int quantity) {
        Order created = orderRepository.save(product, quantity, defaultStatus);
        throw new IllegalStateException("Lab rollback after order " + created.id());
    }

    @Override
    @Transactional
    public void failForLab(String reason) {
        throw new IllegalStateException(reason);
    }

    @Override
    public Order getOrder(Long id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
    }

    @Override
    public List<Order> listOrders() {
        return orderRepository.findAll();
    }
}
