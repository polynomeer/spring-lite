package samples.comparison.lite.order;

import java.util.List;

public interface OrderRepository {
    Order save(String product, int quantity, String status);
    List<Order> findAll();
    long count();
}
