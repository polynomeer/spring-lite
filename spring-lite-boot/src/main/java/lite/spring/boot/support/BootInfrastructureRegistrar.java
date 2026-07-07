package lite.spring.boot.support;

import javax.sql.DataSource;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.jdbc.JdbcTemplate;
import lite.spring.tx.support.TransactionManager;
import lite.spring.tx.support.TransactionalBeanPostProcessor;
import lite.spring.web.json.JsonMapper;

public final class BootInfrastructureRegistrar {
    private BootInfrastructureRegistrar() {
    }

    public static void registerDefaults(AnnotationConfigApplicationContext context) {
        if (!context.containsBeanOfType(TransactionManager.class)) {
            DataSource dataSource = context.containsBeanOfType(DataSource.class) ? context.getBean(DataSource.class) : null;
            context.registerSingleton("transactionManager", new TransactionManager(dataSource));
        }
        if (!context.containsBeanOfType(TransactionalBeanPostProcessor.class)) {
            context.registerSingleton(
                "transactionalBeanPostProcessor",
                new TransactionalBeanPostProcessor(context.getBean(TransactionManager.class))
            );
        }
        if (!context.containsBeanOfType(JsonMapper.class)) {
            context.registerSingleton("jsonMapper", new JsonMapper());
        }
        if (context.containsBeanOfType(DataSource.class) && !context.containsBeanOfType(JdbcTemplate.class)) {
            context.registerSingleton(
                "jdbcTemplate",
                new JdbcTemplate(context.getBean(DataSource.class), context.getBean(TransactionManager.class))
            );
        }
    }
}

