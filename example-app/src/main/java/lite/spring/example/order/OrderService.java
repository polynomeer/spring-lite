package lite.spring.example.order;

import java.util.List;

public interface OrderService {
    Order createOrder(String product, int quantity);

    Order getOrder(Long id);

    List<Order> listOrders();
}

