package lite.spring.example.config;

import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.Configuration;
import lite.spring.tx.support.TransactionManager;
import lite.spring.tx.support.TransactionalBeanPostProcessor;

@Configuration
public class AppConfig {
    @Bean
    public TransactionManager transactionManager() {
        return new TransactionManager(null);
    }

    @Bean
    public TransactionalBeanPostProcessor transactionalBeanPostProcessor(TransactionManager transactionManager) {
        return new TransactionalBeanPostProcessor(transactionManager);
    }
}

