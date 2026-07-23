package samples.comparison.spring.order;

public record Order(Long id, String product, int quantity, String status) {
}
