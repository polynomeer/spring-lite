package samples.comparison.tx.spring;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
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
