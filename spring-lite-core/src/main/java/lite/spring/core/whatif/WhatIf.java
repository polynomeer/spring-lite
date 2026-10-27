package lite.spring.core.whatif;

import java.util.EnumSet;
import java.util.Set;
import java.util.function.Supplier;

/**
 * Experiment switches that turn off one framework safeguard at a time so learners can see what it
 * prevents. Every flag is off by default, so the framework always behaves normally unless a flag is
 * enabled through a {@code spring.lite.whatif.<key>=true} system property or, for a single run, through
 * {@link #with(Set, Supplier)} on the current thread.
 */
public final class WhatIf {
    private static final ThreadLocal<Set<Flag>> SCOPED = new ThreadLocal<>();

    private WhatIf() {
    }

    public enum Flag {
        /** Commit a transaction even after a participant marked it rollback-only. */
        TX_IGNORE_ROLLBACK_ONLY("tx.ignore-rollback-only"),
        /** Run a proxy's interceptor chain in reverse order. */
        AOP_REVERSE_INTERCEPTOR_ORDER("aop.reverse-interceptor-order"),
        /** Create subclass proxies even when the target implements interfaces. */
        AOP_FORCE_CLASS_PROXY("aop.force-class-proxy"),
        /** Skip the in-creation check that reports constructor cycles. */
        CONTEXT_DISABLE_CYCLE_DETECTION("context.disable-cycle-detection");

        private final String key;

        Flag(String key) {
            this.key = key;
        }

        public String key() {
            return key;
        }

        public String systemProperty() {
            return "spring.lite.whatif." + key;
        }
    }

    public static boolean isEnabled(Flag flag) {
        Set<Flag> scoped = SCOPED.get();
        return (scoped != null && scoped.contains(flag)) || Boolean.getBoolean(flag.systemProperty());
    }

    /** Runs the action with the given flags enabled on this thread only, restoring the previous flags afterwards. */
    public static <T> T with(Set<Flag> flags, Supplier<T> action) {
        Set<Flag> previous = SCOPED.get();
        Set<Flag> enabled = previous == null ? EnumSet.noneOf(Flag.class) : EnumSet.copyOf(previous);
        enabled.addAll(flags);
        SCOPED.set(enabled);
        try {
            return action.get();
        } finally {
            if (previous == null) {
                SCOPED.remove();
            } else {
                SCOPED.set(previous);
            }
        }
    }
}
