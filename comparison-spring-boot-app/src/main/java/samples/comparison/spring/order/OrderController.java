package samples.comparison.spring.order;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<Order> listOrders() {
        return orderService.listOrders();
    }

    @PostMapping
    public Order createOrder(@jakarta.validation.Valid @RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request.product(), request.quantity(), false);
    }
}
