package lite.spring.example.order;

import java.util.List;
import java.util.Optional;

public interface OrderRepository {
    Order save(String product, int quantity);

    Optional<Order> findById(Long id);

    List<Order> findAll();
}

