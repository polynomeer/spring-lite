package lite.spring.example.order;

public record Order(Long id, String product, int quantity, String status) {
}

