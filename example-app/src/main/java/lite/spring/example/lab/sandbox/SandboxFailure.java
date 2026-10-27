package lite.spring.example.lab.sandbox;

/** The exception a sandbox {@code throw} step raises. */
public class SandboxFailure extends RuntimeException {
    public SandboxFailure(String methodName) {
        super(methodName + " failed on purpose");
    }
}
