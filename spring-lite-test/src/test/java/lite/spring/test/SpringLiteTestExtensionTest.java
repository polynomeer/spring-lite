package lite.spring.test;

import static org.assertj.core.api.Assertions.assertThat;

import lite.spring.context.ApplicationContext;
import lite.spring.core.annotation.Autowired;
import lite.spring.core.annotation.Bean;
import lite.spring.core.annotation.Configuration;
import lite.spring.core.validation.Min;
import lite.spring.core.validation.NotNull;
import lite.spring.core.validation.Size;
import lite.spring.core.validation.Valid;
import lite.spring.test.web.MockHttpRequest;
import lite.spring.test.web.MockHttpResponse;
import lite.spring.test.web.MockMvc;
import lite.spring.web.annotation.GetMapping;
import lite.spring.web.annotation.PostMapping;
import lite.spring.web.annotation.RequestBody;
import lite.spring.web.annotation.RequestMapping;
import lite.spring.web.annotation.RequestParam;
import lite.spring.web.annotation.RestController;
import org.junit.jupiter.api.Test;

@SpringLiteTest(classes = SpringLiteTestExtensionTest.TestConfig.class)
class SpringLiteTestExtensionTest {
    @Autowired
    private GreetingController greetingController;

    @Test
    void injectsContextBeansAndMockMvc(ApplicationContext context, MockMvc mockMvc) {
        MockHttpResponse response = mockMvc.get("/greetings/hello?name=codex");

        assertThat(context.getBean(GreetingController.class)).isSameAs(greetingController);
        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).isEqualTo("{\"message\":\"hello codex\"}");
    }

    @Test
    void performsJsonPostAndReturnsValidationErrors(MockMvc mockMvc) {
        MockHttpResponse response = mockMvc.perform(
            MockHttpRequest.post("/greetings")
                .contentType("application/json")
                .body("{\"name\":\"x\",\"quantity\":0}")
                .build()
        );

        assertThat(response.statusCode()).isEqualTo(400);
        assertThat(response.body()).contains("\"error\":\"Validation failed\"");
        assertThat(response.body()).contains("\"path\":\"request.name\"");
    }

    @Configuration
    static class TestConfig {
        @Bean
        GreetingController greetingController() {
            return new GreetingController();
        }
    }

    @RestController
    @RequestMapping("/greetings")
    public static class GreetingController {
        @GetMapping("/hello")
        public GreetingResponse hello(@RequestParam("name") String name) {
            return new GreetingResponse("hello " + name);
        }

        @PostMapping
        public GreetingResponse create(@Valid @RequestBody GreetingRequest request) {
            return new GreetingResponse(request.name() + ":" + request.quantity());
        }
    }

    public record GreetingRequest(@NotNull @Size(min = 2, max = 20) String name, @Min(1) int quantity) {
    }

    public record GreetingResponse(String message) {
    }
}
