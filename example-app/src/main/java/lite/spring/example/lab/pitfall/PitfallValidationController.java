package lite.spring.example.lab.pitfall;

import java.util.Map;
import lite.spring.core.validation.Valid;
import lite.spring.example.order.CreateOrderRequest;
import lite.spring.web.annotation.PostMapping;
import lite.spring.web.annotation.RequestBody;
import lite.spring.web.annotation.RequestMapping;
import lite.spring.web.annotation.RestController;

/** The same request record with and without {@code @Valid}: only the annotated endpoint validates. */
@RestController
@RequestMapping("/lab/pitfall-endpoints/missing-valid")
public class PitfallValidationController {
    @PostMapping("/broken")
    public Map<String, Object> withoutValid(@RequestBody CreateOrderRequest request) {
        return Map.of("accepted", true, "product", String.valueOf(request.product()), "quantity", request.quantity());
    }

    @PostMapping("/fixed")
    public Map<String, Object> withValid(@Valid @RequestBody CreateOrderRequest request) {
        return Map.of("accepted", true, "product", String.valueOf(request.product()), "quantity", request.quantity());
    }
}
