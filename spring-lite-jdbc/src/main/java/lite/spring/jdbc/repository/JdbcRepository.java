package lite.spring.jdbc.repository;

import java.util.List;
import java.util.Optional;
import lite.spring.jdbc.JdbcTemplate;
import lite.spring.jdbc.RowMapper;

/**
 * Small query-oriented repository helper. Domain repositories keep their own write SQL.
 */
public class JdbcRepository<T, ID> {
    private final JdbcTemplate jdbcTemplate;
    private final RowMapper<T> rowMapper;
    private final String findByIdSql;
    private final String findAllSql;
    private final String deleteByIdSql;

    public JdbcRepository(JdbcTemplate jdbcTemplate, RowMapper<T> rowMapper, String findByIdSql, String findAllSql, String deleteByIdSql) {
        this.jdbcTemplate = jdbcTemplate;
        this.rowMapper = rowMapper;
        this.findByIdSql = findByIdSql;
        this.findAllSql = findAllSql;
        this.deleteByIdSql = deleteByIdSql;
    }

    public Optional<T> findById(ID id) {
        return Optional.ofNullable(jdbcTemplate.queryForObject(findByIdSql, rowMapper, id));
    }

    public List<T> findAll() {
        return jdbcTemplate.query(findAllSql, rowMapper);
    }

    public boolean deleteById(ID id) {
        return jdbcTemplate.update(deleteByIdSql, id) > 0;
    }
}
