package samples.comparison.tx.springlite;

import lite.spring.core.annotation.Component;
import lite.spring.jdbc.JdbcTemplate;

@Component
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
