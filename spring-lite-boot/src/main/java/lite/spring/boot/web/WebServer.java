package lite.spring.boot.web;

public interface WebServer extends AutoCloseable {
    void start();

    int port();

    @Override
    void close();
}
