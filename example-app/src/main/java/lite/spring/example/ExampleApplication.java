package lite.spring.example;

import lite.spring.boot.SpringLiteApplication;
import lite.spring.boot.annotation.SpringLiteBootApplication;

@SpringLiteBootApplication
public class ExampleApplication {
    public static void main(String[] args) {
        SpringLiteApplication.run(ExampleApplication.class, args);
    }
}
