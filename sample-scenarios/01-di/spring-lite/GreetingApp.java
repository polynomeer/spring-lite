package samples.comparison.di.springlite;

import lite.spring.context.support.AnnotationConfigApplicationContext;

public final class GreetingApp {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(GreetingConfig.class);
        GreetingService service = context.getBean(GreetingService.class);
        System.out.println(service.greet("Spring Lite"));
        context.close();
    }
}
