package samples.comparison.test.springlite;

import lite.spring.test.SpringLiteTest;
import lite.spring.test.web.MockMvc;
import lite.spring.tx.annotation.Transactional;
import org.junit.jupiter.api.Test;

@SpringLiteTest(classes = TestApplication.class)
@Transactional
class OrderControllerTest {

    @Test
    void createsOrderAndRollsBack(MockMvc mockMvc) throws Exception {
        mockMvc.post("/orders")
            .contentType("application/json")
            .body("{\"product\":\"book\",\"quantity\":2}")
            .exchange()
            .expectStatus(200);
    }
}
