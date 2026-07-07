package lite.spring.web.support;

import java.lang.reflect.Method;
import java.util.regex.Pattern;
import lite.spring.web.http.HttpMethod;

public record HandlerMethod(
    Object bean,
    Method method,
    String pathPattern,
    Pattern regex,
    HttpMethod httpMethod
) {
}

