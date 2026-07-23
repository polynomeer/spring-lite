package samples.comparison.lite.order;

import java.util.List;
import lite.spring.core.validation.Valid;
import lite.spring.web.annotation.GetMapping;
import lite.spring.web.annotation.PostMapping;
import lite.spring.web.annotation.RequestBody;
import lite.spring.web.annotation.RequestMapping;
import lite.spring.web.annotation.RestController;

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
    public Order createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request.product(), request.quantity(), false);
    }
}
