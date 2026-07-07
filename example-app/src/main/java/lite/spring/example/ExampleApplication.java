package lite.spring.example;

import lite.spring.boot.MiniSpringApplication;
import lite.spring.boot.annotation.MiniSpringBootApplication;

@MiniSpringBootApplication
public class ExampleApplication {
    public static void main(String[] args) {
        MiniSpringApplication.run(ExampleApplication.class, args);
    }
}

