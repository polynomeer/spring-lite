package lite.spring.example.lab.sandbox;

import java.util.List;

/**
 * One method in a sandbox call tree.
 *
 * @param name label shown in traces, such as {@code OrderService.placeOrder}
 * @param propagation {@code REQUIRED}, {@code REQUIRES_NEW}, or {@code NONE} for a plain method
 * @param steps what the method body does, in order
 */
public record SandboxNode(String name, String propagation, List<SandboxStep> steps) {
}
