package samples.comparison.tx.springlite;

import lite.spring.core.annotation.Component;
import lite.spring.tx.annotation.Transactional;

@Component
public class OrderService {
    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional(rollbackFor = IllegalStateException.class)
    public void createOrder(String product, int quantity, boolean failAfterSave) {
        orderRepository.save(product, quantity);
        if (failAfterSave) {
            throw new IllegalStateException("rollback requested");
        }
    }
}
