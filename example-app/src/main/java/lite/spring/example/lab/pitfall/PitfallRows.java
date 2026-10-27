package lite.spring.example.lab.pitfall;

import lite.spring.core.annotation.Component;
import lite.spring.core.annotation.PostConstruct;
import lite.spring.jdbc.JdbcTemplate;

/** Rows written by pitfall experiments, separated per run so runs never see each other's data. */
@Component
public class PitfallRows {
    private final JdbcTemplate jdbcTemplate;

    public PitfallRows(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    void initialize() {
        jdbcTemplate.update(
            """
            create table if not exists lab_sandbox_row (
                id bigint auto_increment primary key,
                run_id varchar(36) not null,
                target_table varchar(32) not null,
                label varchar(64) not null
            )
            """
        );
    }

    public void insert(String runId, String table, String label) {
        jdbcTemplate.update("insert into lab_sandbox_row(run_id, target_table, label) values (?, ?, ?)", runId, table, label);
    }

    public long count(String runId, String table) {
        return jdbcTemplate.queryForObject(
            "select count(*) from lab_sandbox_row where run_id = ? and target_table = ?",
            resultSet -> resultSet.getLong(1),
            runId,
            table
        );
    }
}
