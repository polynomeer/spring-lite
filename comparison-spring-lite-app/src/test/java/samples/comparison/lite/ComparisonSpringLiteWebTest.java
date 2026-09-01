package samples.comparison.lite;

import static org.assertj.core.api.Assertions.assertThat;

import lite.spring.test.SpringLiteTest;
import lite.spring.test.web.MockHttpRequest;
import lite.spring.test.web.MockHttpResponse;
import lite.spring.test.web.MockMvc;
import org.junit.jupiter.api.Test;

@SpringLiteTest(classes = ComparisonSpringLiteApplication.class)
class ComparisonSpringLiteWebTest {
    @Test
    void servesGreetingThroughMockMvc(MockMvc mockMvc) {
        MockHttpResponse response = mockMvc.get("/greetings/spring?title=Dr");

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("Dr spring");
        assertThat(response.body()).contains("\"source\":\"spring-lite\"");
    }

    @Test
    void createsOrderThroughMockMvc(MockMvc mockMvc) {
        MockHttpResponse response = mockMvc.perform(
            MockHttpRequest.post("/orders")
                .contentType("application/json")
                .body("{\"product\":\"book\",\"quantity\":2}")
                .build()
        );

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("\"product\":\"book\"");
    }

    @Test
    void exposesNormalizedLiveDependencyInjectionTrace(MockMvc mockMvc) {
        MockHttpResponse response = mockMvc.get("/lab/compare/di");

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("\"labId\":\"comparison\"");
        assertThat(response.body()).contains("\"scenario\":\"di\"");
        assertThat(response.body()).contains("\"value\":\"spring-lite\"");
        assertThat(response.body()).contains("[spring-lite] Hello, Visual Lab");
    }
}
