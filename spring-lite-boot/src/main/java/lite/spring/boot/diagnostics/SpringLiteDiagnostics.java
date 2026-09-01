package lite.spring.boot.diagnostics;

import java.util.Arrays;
import lite.spring.boot.SpringLiteApplication;
import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.web.json.JsonMapper;

/**
 * Usage: {@code SpringLiteDiagnostics <application-class> [--property=value]}.
 * It creates the Boot context but deliberately does not bind a server port.
 */
public final class SpringLiteDiagnostics {
    private SpringLiteDiagnostics() {
    }

    public static void main(String[] args) throws ClassNotFoundException {
        if (args.length == 0) {
            throw new IllegalArgumentException("Usage: SpringLiteDiagnostics <application-class> [--property=value]");
        }
        Class<?> applicationClass = Class.forName(args[0]);
        try (AnnotationConfigApplicationContext context = SpringLiteApplication.bootstrap(
            applicationClass, Arrays.copyOfRange(args, 1, args.length)
        )) {
            System.out.println(context.getBean(JsonMapper.class).write(ApplicationDiagnostics.report(context)));
        }
    }
}
