package samples.comparison.lite;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.regex.Pattern;
import lite.spring.test.SpringLiteTest;
import lite.spring.test.web.MockHttpResponse;
import lite.spring.test.web.MockMvc;
import org.junit.jupiter.api.Test;

@SpringLiteTest(classes = ComparisonSpringLiteApplication.class)
class ComparisonSpringLiteEventTraceTest {
    private static final Pattern STEP = Pattern.compile("\"step\":\"([^\"]+)\"");

    @Test
    void emitsNormalizedStepsForRollback(MockMvc mockMvc) {
        MockHttpResponse response = mockMvc.get("/lab/compare/events/tx-rollback");

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(steps(response.body())).containsExactly(
            "call.enter", "tx.begin", "jdbc.insert", "jdbc.select", "call.throw", "tx.rollback"
        );
        assertThat(response.body()).contains("\"runtime\":\"spring-lite\"", "\"outcome\":\"threw IllegalStateException\"");
    }

    @Test
    void emitsNormalizedStepsForCommit(MockMvc mockMvc) {
        MockHttpResponse response = mockMvc.get("/lab/compare/events/tx-commit");

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(steps(response.body())).containsExactly(
            "call.enter", "tx.begin", "jdbc.insert", "jdbc.select", "call.return", "tx.commit"
        );
        assertThat(response.body()).contains("\"outcome\":\"returned\"");
    }

    private static List<String> steps(String body) {
        return STEP.matcher(body).results().map(match -> match.group(1)).toList();
    }
}
