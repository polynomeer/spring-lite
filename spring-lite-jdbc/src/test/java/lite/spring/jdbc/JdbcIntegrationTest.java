package lite.spring.jdbc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import javax.sql.DataSource;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.Configuration;
import lite.spring.jdbc.datasource.DriverManagerDataSource;
import lite.spring.tx.annotation.Transactional;
import lite.spring.tx.support.TransactionManager;
import lite.spring.tx.support.TransactionalBeanPostProcessor;
import org.junit.jupiter.api.Test;

class JdbcIntegrationTest {
    @Test
    void commitsTransactionalInsertAgainstH2() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(JdbcIntegrationConfig.class)) {
            AccountService accountService = context.getBean(AccountService.class);
            JdbcTemplate jdbcTemplate = context.getBean(JdbcTemplate.class);

            accountService.createAccount("alice");

            List<String> names = jdbcTemplate.query("select name from accounts order by id", rs -> rs.getString(1));
            assertThat(names).containsExactly("alice");
        }
    }

    @Test
    void rollsBackTransactionalInsertAgainstH2() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(JdbcIntegrationConfig.class)) {
            AccountService accountService = context.getBean(AccountService.class);
            JdbcTemplate jdbcTemplate = context.getBean(JdbcTemplate.class);

            assertThatThrownBy(() -> accountService.createAndFail("bob"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("rollback");

            List<String> names = jdbcTemplate.query("select name from accounts order by id", rs -> rs.getString(1));
            assertThat(names).isEmpty();
        }
    }

    @Configuration
    static class JdbcIntegrationConfig {
        @Bean
        DataSource dataSource() {
            return new DriverManagerDataSource("jdbc:h2:mem:springlite;DB_CLOSE_DELAY=-1", "sa", "");
        }

        @Bean
        TransactionManager transactionManager(DataSource dataSource) {
            return new TransactionManager(dataSource);
        }

        @Bean
        JdbcTemplate jdbcTemplate(DataSource dataSource, TransactionManager transactionManager) {
            JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource, transactionManager);
            jdbcTemplate.update("create table if not exists accounts (id bigint auto_increment primary key, name varchar(255) not null)");
            jdbcTemplate.update("delete from accounts");
            return jdbcTemplate;
        }

        @Bean
        TransactionalBeanPostProcessor transactionalBeanPostProcessor(TransactionManager transactionManager) {
            return new TransactionalBeanPostProcessor(transactionManager);
        }

        @Bean
        AccountService accountService(JdbcTemplate jdbcTemplate) {
            return new AccountServiceImpl(jdbcTemplate);
        }
    }

    interface AccountService {
        void createAccount(String name);

        void createAndFail(String name);
    }

    static class AccountServiceImpl implements AccountService {
        private final JdbcTemplate jdbcTemplate;

        AccountServiceImpl(JdbcTemplate jdbcTemplate) {
            this.jdbcTemplate = jdbcTemplate;
        }

        @Override
        @Transactional
        public void createAccount(String name) {
            jdbcTemplate.update("insert into accounts(name) values (?)", name);
        }

        @Override
        @Transactional
        public void createAndFail(String name) {
            jdbcTemplate.update("insert into accounts(name) values (?)", name);
            throw new IllegalStateException("rollback");
        }
    }
}

