package samples.comparison.spring.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateOrderRequest(
    @NotBlank @Size(min = 2, max = 50) String product,
    @Min(1) int quantity
) {
}
