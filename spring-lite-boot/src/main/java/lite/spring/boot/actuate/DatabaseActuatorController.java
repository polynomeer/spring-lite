package lite.spring.boot.actuate;

import java.util.Map;
import javax.sql.DataSource;
import lite.spring.jdbc.datasource.DataSourceDiagnostics;
import lite.spring.core.annotation.ConditionalOnBean;
import lite.spring.web.annotation.GetMapping;
import lite.spring.web.annotation.RestController;

/** Exposes an explicit DataSource connectivity probe only when a DataSource exists. */
@RestController
@ConditionalOnBean(DataSource.class)
public class DatabaseActuatorController {
    private final DataSource dataSource;

    public DatabaseActuatorController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/actuator/database")
    public Map<String, Object> database() {
        return DataSourceDiagnostics.inspect(dataSource);
    }
}
