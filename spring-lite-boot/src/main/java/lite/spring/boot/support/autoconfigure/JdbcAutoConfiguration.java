package lite.spring.boot.support.autoconfigure;

import javax.sql.DataSource;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.ConditionalOnBean;
import lite.spring.core.annotation.ConditionalOnMissingBean;
import lite.spring.core.annotation.Configuration;
import lite.spring.jdbc.JdbcTemplate;
import lite.spring.tx.support.TransactionManager;

@Configuration
public class JdbcAutoConfiguration {
    @Bean
    @ConditionalOnBean(DataSource.class)
    @ConditionalOnMissingBean(JdbcTemplate.class)
    JdbcTemplate jdbcTemplate(DataSource dataSource, TransactionManager transactionManager) {
        return new JdbcTemplate(dataSource, transactionManager);
    }
}
