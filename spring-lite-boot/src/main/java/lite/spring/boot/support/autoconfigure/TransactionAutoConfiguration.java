package lite.spring.boot.support.autoconfigure;

import javax.sql.DataSource;
import lite.spring.context.ApplicationContext;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.ConditionalOnMissingBean;
import lite.spring.core.annotation.Configuration;
import lite.spring.tx.support.TransactionManager;
import lite.spring.tx.support.TransactionalBeanPostProcessor;

@Configuration
public class TransactionAutoConfiguration {
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
}
