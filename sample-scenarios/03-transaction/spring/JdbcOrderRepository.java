package samples.comparison.tx.spring;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcOrderRepository implements OrderRepository {
    private final JdbcTemplate jdbcTemplate;

    public JdbcOrderRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void save(String product, int quantity) {
        jdbcTemplate.update("insert into orders(product, quantity) values (?, ?)", product, quantity);
    }
}
