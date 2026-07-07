package lite.spring.boot.support;

import javax.sql.DataSource;
import lite.spring.context.ApplicationContext;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.ConditionalOnBean;
import lite.spring.core.annotation.ConditionalOnMissingBean;
import lite.spring.core.annotation.Configuration;
import lite.spring.jdbc.JdbcTemplate;
import lite.spring.tx.support.TransactionManager;
import lite.spring.tx.support.TransactionalBeanPostProcessor;
import lite.spring.web.json.JsonMapper;

@Configuration
public class BootInfrastructureConfiguration {
    @Bean
    @ConditionalOnMissingBean(TransactionManager.class)
    TransactionManager transactionManager(ApplicationContext context) {
        DataSource dataSource = context.containsBeanOfType(DataSource.class)
            ? context.getBean(DataSource.class)
            : null;
        return new TransactionManager(dataSource);
    }

    @Bean
    @ConditionalOnMissingBean(TransactionalBeanPostProcessor.class)
    TransactionalBeanPostProcessor transactionalBeanPostProcessor(TransactionManager transactionManager) {
        return new TransactionalBeanPostProcessor(transactionManager);
    }

    @Bean
    @ConditionalOnMissingBean(JsonMapper.class)
    JsonMapper jsonMapper() {
        return new JsonMapper();
    }

    @Bean
    @ConditionalOnBean(DataSource.class)
    @ConditionalOnMissingBean(JdbcTemplate.class)
    JdbcTemplate jdbcTemplate(DataSource dataSource, TransactionManager transactionManager) {
        return new JdbcTemplate(dataSource, transactionManager);
    }
}
