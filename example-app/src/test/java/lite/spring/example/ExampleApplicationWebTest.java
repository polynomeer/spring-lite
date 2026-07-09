package lite.spring.example;

import static org.assertj.core.api.Assertions.assertThat;

import lite.spring.test.SpringLiteTest;
import lite.spring.test.web.MockHttpRequest;
import lite.spring.test.web.MockHttpResponse;
import lite.spring.test.web.MockMvc;
import org.junit.jupiter.api.Test;

@SpringLiteTest(classes = ExampleApplication.class)
class ExampleApplicationWebTest {
    @Test
    void servesOrdersThroughMockMvc(MockMvc mockMvc) {
        MockHttpResponse response = mockMvc.get("/orders");

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("starter-kit");
    }

    @Test
    void returnsValidationErrorsForInvalidOrderRequest(MockMvc mockMvc) {
        MockHttpResponse response = mockMvc.perform(
            MockHttpRequest.post("/orders")
                .contentType("application/json")
                .body("{\"product\":\"x\",\"quantity\":0}")
                .build()
        );

        assertThat(response.statusCode()).isEqualTo(400);
        assertThat(response.body()).contains("\"error\":\"Validation failed\"");
        assertThat(response.body()).contains("\"path\":\"request.product\"");
    }
}
