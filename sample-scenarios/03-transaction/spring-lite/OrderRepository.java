package samples.comparison.tx.springlite;

public interface OrderRepository {
    void save(String product, int quantity);
}
