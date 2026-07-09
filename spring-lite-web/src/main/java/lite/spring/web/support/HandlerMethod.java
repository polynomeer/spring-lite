package lite.spring.web.support;

import java.lang.reflect.Method;
import java.util.List;
import java.util.regex.Pattern;
import lite.spring.web.http.HttpMethod;

public record HandlerMethod(
    Object bean,
    Method method,
    String pathPattern,
    Pattern regex,
    HttpMethod httpMethod,
    List<String> consumes,
    List<String> produces,
    List<String> headers,
    List<String> params
) {
}
