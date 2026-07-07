package lite.spring.example.order;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;
import lite.spring.core.annotation.PostConstruct;
import lite.spring.core.annotation.Repository;

@Repository
public class InMemoryOrderRepository implements OrderRepository {
    private final AtomicLong sequence = new AtomicLong();
    private final Map<Long, Order> orders = new LinkedHashMap<>();

    @PostConstruct
    void seed() {
        save("starter-kit", 1);
    }

    @Override
    public Order save(String product, int quantity) {
        long id = sequence.incrementAndGet();
        Order order = new Order(id, product, quantity, "CREATED");
        orders.put(id, order);
        return order;
    }

    @Override
    public Optional<Order> findById(Long id) {
        return Optional.ofNullable(orders.get(id));
    }

    @Override
    public List<Order> findAll() {
        return new ArrayList<>(orders.values());
    }
}

