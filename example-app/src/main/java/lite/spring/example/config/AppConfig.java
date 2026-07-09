package lite.spring.example.config;

import javax.sql.DataSource;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.Configuration;
import lite.spring.core.annotation.Value;
import lite.spring.jdbc.JdbcTemplate;
import lite.spring.jdbc.datasource.DriverManagerDataSource;
import lite.spring.tx.support.TransactionManager;
import lite.spring.tx.support.TransactionalBeanPostProcessor;

@Configuration
public class AppConfig {
    @Bean
    public DataSource dataSource(
        @Value("${example.datasource.url:jdbc:h2:mem:example-app;DB_CLOSE_DELAY=-1}") String url,
        @Value("${example.datasource.username:sa}") String username,
        @Value("${example.datasource.password:}") String password
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
}
