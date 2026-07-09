package lite.spring.boot.web;

import static org.assertj.core.api.Assertions.assertThat;

import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.web.json.JsonMapper;
import lite.spring.web.support.DispatcherServlet;
import org.junit.jupiter.api.Test;

class JdkWebServerFactoryTest {
    @Test
    void createsStartableServerInstances() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext()) {
            DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
            JdkWebServerFactory factory = new JdkWebServerFactory();

            WebServer server = factory.create(dispatcherServlet, 0);

            assertThat(server).isInstanceOf(JdkWebServer.class);
            assertThat(server.port()).isEqualTo(0);
            server.start();
            server.start();
            server.close();
            server.close();
        }
    }
}
