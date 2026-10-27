package lite.spring.example.lab.sandbox;

/**
 * One statement inside a sandbox method body.
 *
 * @param type {@code insert}, {@code call}, or {@code throw}
 * @param target table for {@code insert}: {@code orders} or {@code audit_log}
 * @param catchFailure for {@code call}: whether the caller catches the callee's exception
 * @param call for {@code call}: the method being called
 */
public record SandboxStep(String type, String target, boolean catchFailure, SandboxNode call) {
}
