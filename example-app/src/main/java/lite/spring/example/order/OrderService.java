package lite.spring.example.order;

import java.util.List;

public interface OrderService {
    Order createOrder(String product, int quantity);

    Order createOrderAndFail(String product, int quantity);

    void failForLab(String reason);

    Order getOrder(Long id);

    List<Order> listOrders();
}
