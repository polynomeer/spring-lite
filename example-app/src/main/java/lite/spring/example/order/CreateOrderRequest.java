package lite.spring.example.order;

import lite.spring.core.validation.Min;
import lite.spring.core.validation.NotNull;
import lite.spring.core.validation.Size;

public record CreateOrderRequest(@NotNull @Size(min = 2, max = 50) String product, @Min(1) int quantity) {
}
