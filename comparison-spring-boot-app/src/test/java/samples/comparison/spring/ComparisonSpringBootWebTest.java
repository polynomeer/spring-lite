package samples.comparison.spring;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
class ComparisonSpringBootWebTest {
    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc() {
        return MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void servesGreetingThroughMockMvc() throws Exception {
        mockMvc().perform(get("/greetings/spring").param("title", "Dr"))
            .andExpect(status().isOk())
            .andExpect(content().string(org.hamcrest.Matchers.containsString("Dr spring")))
            .andExpect(content().string(org.hamcrest.Matchers.containsString("\"source\":\"spring\"")));
    }

    @Test
    void createsOrderThroughMockMvc() throws Exception {
        mockMvc().perform(
                post("/orders")
                    .contentType(APPLICATION_JSON)
                    .content("{\"product\":\"book\",\"quantity\":2}")
            )
            .andExpect(status().isOk())
            .andExpect(content().string(org.hamcrest.Matchers.containsString("\"product\":\"book\"")));
    }

    @Test
    void exposesNormalizedLiveDependencyInjectionTrace() throws Exception {
        mockMvc().perform(get("/lab/compare/di"))
            .andExpect(status().isOk())
            .andExpect(content().string(org.hamcrest.Matchers.containsString("\"labId\":\"comparison\"")))
            .andExpect(content().string(org.hamcrest.Matchers.containsString("\"scenario\":\"di\"")))
            .andExpect(content().string(org.hamcrest.Matchers.containsString("\"value\":\"spring\"")))
            .andExpect(content().string(org.hamcrest.Matchers.containsString("[spring] Hello, Visual Lab")));
    }

    @Test
    void exposesNormalizedLiveMvcTrace() throws Exception {
        mockMvc().perform(get("/lab/compare/mvc"))
            .andExpect(status().isOk())
            .andExpect(content().string(org.hamcrest.Matchers.containsString("\"scenario\":\"mvc\"")))
            .andExpect(content().string(org.hamcrest.Matchers.containsString("[spring] Hello, Dr visual-lab")));
    }

    @Test
    void exposesNormalizedRollbackTrace() throws Exception {
        mockMvc().perform(get("/lab/compare/tx"))
            .andExpect(status().isOk())
            .andExpect(content().string(org.hamcrest.Matchers.containsString("\"scenario\":\"tx\"")))
            .andExpect(content().string(org.hamcrest.Matchers.containsString("\"value\":\"verified\"")));
    }
}
