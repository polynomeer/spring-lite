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

    @Test
    void returnsLiveLabTraceForExampleFlowCreate(MockMvc mockMvc) {
        MockHttpResponse response = mockMvc.perform(
            MockHttpRequest.post("/lab/run/trace")
                .contentType("application/json")
                .body("{\"labId\":\"example-flow\",\"scenario\":\"create\",\"mode\":\"live\"}")
                .build()
        );

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("\"labId\":\"example-flow\"");
        assertThat(response.body()).contains("\"scenario\":\"create\"");
        assertThat(response.body()).contains("\"mode\":\"live\"");
        assertThat(response.body()).contains("\"Created Order\"");
        assertThat(response.body()).contains("\"Created Status\"");
        assertThat(response.body()).contains("\"Net Change\"");
        assertThat(response.body()).contains("\"Duration (µs)\"");
        assertThat(response.body()).contains("\"created order id=");
        assertThat(response.body()).contains("\"title\":\"Example Flow Trace\"");
    }

    @Test
    void returnsLiveLabTraceForValidationScenario(MockMvc mockMvc) {
        MockHttpResponse response = mockMvc.perform(
            MockHttpRequest.post("/lab/run/trace")
                .contentType("application/json")
                .body("{\"labId\":\"example-flow\",\"scenario\":\"validation\",\"mode\":\"live\"}")
                .build()
        );

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("\"scenario\":\"validation\"");
        assertThat(response.body()).contains("\"Rejected Field\"");
        assertThat(response.body()).contains("\"Tx Outcome\",\"value\":\"not-started\"");
    }

    @Test
    void returnsLiveLabTraceForNotFoundScenario(MockMvc mockMvc) {
        MockHttpResponse response = mockMvc.perform(
            MockHttpRequest.post("/lab/run/trace")
                .contentType("application/json")
                .body("{\"labId\":\"example-flow\",\"scenario\":\"not-found\",\"mode\":\"live\"}")
                .build()
        );

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("\"scenario\":\"not-found\"");
        assertThat(response.body()).contains("\"Lookup Id\"");
        assertThat(response.body()).contains("\"IllegalArgumentException\"");
    }

    @Test
    void returnsLiveLabTraceForServiceErrorScenario(MockMvc mockMvc) {
        MockHttpResponse response = mockMvc.perform(
            MockHttpRequest.post("/lab/run/trace")
                .contentType("application/json")
                .body("{\"labId\":\"example-flow\",\"scenario\":\"service-error\",\"mode\":\"live\"}")
                .build()
        );

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("\"scenario\":\"service-error\"");
        assertThat(response.body()).contains("\"Failure Point\"");
        assertThat(response.body()).contains("\"rollback\"");
    }

    @Test
    void returnsLiveLabTraceForRollbackScenario(MockMvc mockMvc) {
        MockHttpResponse response = mockMvc.perform(
            MockHttpRequest.post("/lab/run/trace")
                .contentType("application/json")
                .body("{\"labId\":\"example-flow\",\"scenario\":\"rollback\",\"mode\":\"live\"}")
                .build()
        );

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("\"scenario\":\"rollback\"");
        assertThat(response.body()).contains("\"Orders Before\"");
        assertThat(response.body()).contains("\"Orders After\"");
        assertThat(response.body()).contains("\"Net Change\"");
        assertThat(response.body()).contains("\"Exception Message\"");
        assertThat(response.body()).contains("Lab rollback after order");
    }

    @Test
    void returnsLiveContainerRuntimeTrace(MockMvc mockMvc) {
        MockHttpResponse response = mockMvc.perform(
            MockHttpRequest.post("/lab/run/trace")
                .contentType("application/json")
                .body("{\"labId\":\"container\",\"scenario\":\"lifecycle-proxy\",\"mode\":\"live\"}")
                .build()
        );

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("\"labId\":\"container\"");
        assertThat(response.body()).contains("\"title\":\"Container Runtime Trace\"");
        assertThat(response.body()).contains("\"Managed Beans\"");
        assertThat(response.body()).contains("\"Container\"");
        assertThat(response.body()).contains("\"Proxy\"");
    }

    @Test
    void rejectsUnsupportedLiveLabScenario(MockMvc mockMvc) {
        MockHttpResponse response = mockMvc.perform(
            MockHttpRequest.post("/lab/run/trace")
                .contentType("application/json")
                .body("{\"labId\":\"example-flow\",\"scenario\":\"unknown\",\"mode\":\"live\"}")
                .build()
        );

        assertThat(response.statusCode()).isEqualTo(400);
        assertThat(response.body()).contains("\"error\":\"Unsupported example-flow scenario: unknown\"");
    }
}
