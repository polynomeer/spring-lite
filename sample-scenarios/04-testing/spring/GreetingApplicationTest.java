package samples.comparison.test.spring;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class GreetingApplicationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void createsOrderAndRollsBack() throws Exception {
        mockMvc.perform(
                post("/orders")
                    .contentType(APPLICATION_JSON)
                    .content("{\"product\":\"book\",\"quantity\":2}")
            )
            .andExpect(status().isOk());
    }
}
