package samples.comparison.lite.config;

import javax.sql.DataSource;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.Configuration;
import lite.spring.core.annotation.Value;
import lite.spring.jdbc.JdbcTemplate;
import lite.spring.jdbc.datasource.DriverManagerDataSource;
import lite.spring.tx.support.TransactionManager;
import lite.spring.tx.support.TransactionalBeanPostProcessor;
import samples.comparison.lite.greeting.TimeFormatter;

@Configuration
public class ComparisonInfraConfig {
    @Bean
    public DataSource dataSource(
        @Value("${comparison.datasource.url:jdbc:h2:mem:comparison-lite;DB_CLOSE_DELAY=-1}") String url,
        @Value("${comparison.datasource.username:sa}") String username,
        @Value("${comparison.datasource.password:}") String password
    ) {
        return new DriverManagerDataSource(url, username, password);
    }

    @Bean
    public TransactionManager transactionManager(DataSource dataSource) {
        return new TransactionManager(dataSource);
    }

    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource, TransactionManager transactionManager) {
        return new JdbcTemplate(dataSource, transactionManager);
    }

    @Bean
    public TransactionalBeanPostProcessor transactionalBeanPostProcessor(TransactionManager transactionManager) {
        return new TransactionalBeanPostProcessor(transactionManager);
    }

    @Bean
    public TimeFormatter timeFormatter() {
        return new TimeFormatter("[spring-lite]");
    }
}
