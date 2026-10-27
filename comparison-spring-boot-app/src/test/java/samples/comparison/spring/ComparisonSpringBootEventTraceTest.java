package samples.comparison.spring;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
class ComparisonSpringBootEventTraceTest {
    private static final Pattern STEP = Pattern.compile("\"step\":\"([^\"]+)\"");

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Test
    void emitsNormalizedStepsForRollback() throws Exception {
        String body = run("tx-rollback");

        assertThat(steps(body)).containsExactly(
            "call.enter", "tx.begin", "tx.sync.register", "jdbc.insert", "jdbc.select", "call.throw",
            "tx.sync.before-completion", "tx.rollback", "tx.sync.after-completion", "tx.cleanup"
        );
        assertThat(body).contains("\"runtime\":\"spring\"", "\"outcome\":\"threw IllegalStateException\"");
    }

    @Test
    void emitsNormalizedStepsForCommit() throws Exception {
        String body = run("tx-commit");

        assertThat(steps(body)).containsExactly(
            "call.enter", "tx.begin", "tx.sync.register", "jdbc.insert", "jdbc.select", "call.return",
            "tx.sync.before-commit", "tx.sync.before-completion", "tx.commit", "tx.sync.after-commit",
            "tx.sync.after-completion", "tx.cleanup"
        );
        assertThat(body).contains("\"outcome\":\"returned\"");
    }

    private String run(String scenario) throws Exception {
        return MockMvcBuilders.webAppContextSetup(webApplicationContext).build()
            .perform(get("/lab/compare/events/" + scenario))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
    }

    private static List<String> steps(String body) {
        return STEP.matcher(body).results().map(match -> match.group(1)).toList();
    }
}
