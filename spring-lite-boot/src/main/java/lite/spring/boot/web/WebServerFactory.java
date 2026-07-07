package lite.spring.boot.web;

import lite.spring.web.support.DispatcherServlet;

public interface WebServerFactory {
    WebServer create(DispatcherServlet dispatcherServlet, int port);
}
