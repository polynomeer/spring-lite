package lite.spring.web.handler;

import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;

public interface ReturnValueHandler {
    void handleReturnValue(Object returnValue, HttpExchange exchange, int statusCode) throws IOException;
}

