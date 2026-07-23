package samples.comparison.tx.spring;

public interface OrderRepository {
    void save(String product, int quantity);
}
