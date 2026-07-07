package lite.spring.example.order;

import java.util.List;
import lite.spring.core.annotation.Service;
import lite.spring.tx.annotation.Transactional;

@Service
public class DefaultOrderService implements OrderService {
    private final OrderRepository orderRepository;

    public DefaultOrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional
    public Order createOrder(String product, int quantity) {
        return orderRepository.save(product, quantity);
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

