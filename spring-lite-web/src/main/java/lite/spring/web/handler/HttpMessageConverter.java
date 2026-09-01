package lite.spring.web.handler;

public interface HttpMessageConverter {
    boolean canWrite(Object body, String contentType);

    byte[] write(Object body);
}
