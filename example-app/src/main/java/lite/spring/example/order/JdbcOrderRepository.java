package lite.spring.example.order;

import java.util.List;
import java.util.Optional;
import lite.spring.core.annotation.PostConstruct;
import lite.spring.core.annotation.Repository;
import lite.spring.core.annotation.Value;
import lite.spring.jdbc.JdbcTemplate;

@Repository
public class JdbcOrderRepository implements OrderRepository {
    private final JdbcTemplate jdbcTemplate;
    private final String seedProduct;
    private final int seedQuantity;

    public JdbcOrderRepository(
        JdbcTemplate jdbcTemplate,
        @Value("${example.order.seed-product:starter-kit}") String seedProduct,
        @Value("${example.order.seed-quantity:1}") int seedQuantity
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.seedProduct = seedProduct;
        this.seedQuantity = seedQuantity;
    }

    @PostConstruct
    void initialize() {
        jdbcTemplate.update(
            """
            create table if not exists orders (
                id bigint auto_increment primary key,
                product varchar(255) not null,
                quantity integer not null,
                status varchar(64) not null
            )
            """
        );
        jdbcTemplate.update("delete from orders");
        save(seedProduct, seedQuantity, "SEEDED");
    }

    @Override
    public Order save(String product, int quantity, String status) {
        jdbcTemplate.update("insert into orders(product, quantity, status) values (?, ?, ?)", product, quantity, status);
        return jdbcTemplate.queryForObject(
            "select id, product, quantity, status from orders order by id desc limit 1",
            this::mapOrder
        );
    }

    @Override
    public Optional<Order> findById(Long id) {
        return Optional.ofNullable(
            jdbcTemplate.queryForObject(
                "select id, product, quantity, status from orders where id = ?",
                this::mapOrder,
                id
            )
        );
    }

    @Override
    public List<Order> findAll() {
        return jdbcTemplate.query("select id, product, quantity, status from orders order by id", this::mapOrder);
    }

    private Order mapOrder(java.sql.ResultSet resultSet) throws java.sql.SQLException {
        return new Order(
            resultSet.getLong("id"),
            resultSet.getString("product"),
            resultSet.getInt("quantity"),
            resultSet.getString("status")
        );
    }
}
