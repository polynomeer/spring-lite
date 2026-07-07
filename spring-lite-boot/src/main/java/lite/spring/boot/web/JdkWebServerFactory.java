package lite.spring.boot.web;

import lite.spring.web.support.DispatcherServlet;

public final class JdkWebServerFactory implements WebServerFactory {
    @Override
    public WebServer create(DispatcherServlet dispatcherServlet, int port) {
        return new JdkWebServer(dispatcherServlet, port);
    }
}
