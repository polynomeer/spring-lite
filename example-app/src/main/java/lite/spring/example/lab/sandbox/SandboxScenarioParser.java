package lite.spring.example.lab.sandbox;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/** Converts the JSON call tree into {@link SandboxNode}s and rejects anything outside the sandbox's limits. */
final class SandboxScenarioParser {
    static final Set<String> TABLES = Set.of("orders", "audit_log");
    private static final Set<String> PROPAGATIONS = Set.of("REQUIRED", "REQUIRES_NEW", "NONE");
    private static final Pattern NAME = Pattern.compile("[A-Za-z][A-Za-z0-9_.]{0,47}");
    private static final int MAX_DEPTH = 4;
    private static final int MAX_STEPS = 8;
    private static final int MAX_NODES = 12;

    private int nodes;

    private SandboxScenarioParser() {
    }

    static SandboxNode parse(Map<?, ?> body) {
        Object root = body.get("root");
        if (!(root instanceof Map<?, ?> rootMap)) {
            throw new IllegalArgumentException("Sandbox request needs a root method");
        }
        return new SandboxScenarioParser().node(rootMap, 1);
    }

    private SandboxNode node(Map<?, ?> raw, int depth) {
        if (depth > MAX_DEPTH) {
            throw new IllegalArgumentException("Sandbox call tree is deeper than " + MAX_DEPTH);
        }
        if (++nodes > MAX_NODES) {
            throw new IllegalArgumentException("Sandbox call tree has more than " + MAX_NODES + " methods");
        }
        String name = String.valueOf(raw.get("name"));
        if (!NAME.matcher(name).matches()) {
            throw new IllegalArgumentException("Invalid sandbox method name: " + name);
        }
        String propagation = String.valueOf(raw.get("propagation"));
        if (!PROPAGATIONS.contains(propagation)) {
            throw new IllegalArgumentException("Unsupported sandbox propagation: " + propagation);
        }
        Object rawSteps = raw.get("steps");
        List<?> stepList = rawSteps instanceof List<?> list ? list : List.of();
        if (stepList.size() > MAX_STEPS) {
            throw new IllegalArgumentException(name + " has more than " + MAX_STEPS + " steps");
        }
        List<SandboxStep> steps = new ArrayList<>();
        for (Object rawStep : stepList) {
            if (!(rawStep instanceof Map<?, ?> stepMap)) {
                throw new IllegalArgumentException("Invalid sandbox step in " + name);
            }
            steps.add(step(stepMap, depth));
        }
        return new SandboxNode(name, propagation, List.copyOf(steps));
    }

    private SandboxStep step(Map<?, ?> raw, int depth) {
        String type = String.valueOf(raw.get("type"));
        return switch (type) {
            case "insert" -> {
                String target = String.valueOf(raw.get("target"));
                if (!TABLES.contains(target)) {
                    throw new IllegalArgumentException("Unsupported sandbox table: " + target);
                }
                yield new SandboxStep("insert", target, false, null);
            }
            case "throw" -> new SandboxStep("throw", null, false, null);
            case "call" -> {
                if (!(raw.get("call") instanceof Map<?, ?> callMap)) {
                    throw new IllegalArgumentException("Sandbox call step needs a method");
                }
                yield new SandboxStep("call", null, Boolean.TRUE.equals(raw.get("catch")), node(callMap, depth + 1));
            }
            default -> throw new IllegalArgumentException("Unsupported sandbox step type: " + type);
        };
    }
}
