package lite.spring.core.trace;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

/**
 * Thread-bound collector for instructional runtime traces.
 *
 * <p>Framework code calls {@link #record} unconditionally. Without an open {@link Session} on the
 * current thread every call is a no-op, so tracing never changes runtime behavior.
 */
public final class TraceRecorder {
    private static final ThreadLocal<Session> CURRENT = new ThreadLocal<>();

    private TraceRecorder() {
    }

    /** Opens a session on the current thread. Closing it restores any enclosing session. */
    public static Session start() {
        Session session = new Session(CURRENT.get());
        CURRENT.set(session);
        return session;
    }

    public static boolean isActive() {
        return CURRENT.get() != null;
    }

    public static void record(TraceLayer layer, String kind, String marker, String detail) {
        record(layer, kind, marker, detail, Map.of());
    }

    public static void record(TraceLayer layer, String kind, String marker, String detail, Map<String, String> attributes) {
        Session session = CURRENT.get();
        if (session != null) {
            session.add(layer, kind, marker, detail, attributes);
        }
    }

    /** Pushes a call frame such as {@code OrderService.createOrder} onto the current session's stack. */
    public static void pushFrame(String frame) {
        Session session = CURRENT.get();
        if (session != null) {
            session.frames.push(frame);
        }
    }

    public static void popFrame() {
        Session session = CURRENT.get();
        if (session != null && !session.frames.isEmpty()) {
            session.frames.pop();
        }
    }

    /** Builds an attribute map that skips {@code null} values, keeping insertion order. */
    public static Map<String, String> attributes(Object... keyValues) {
        Map<String, String> attributes = new LinkedHashMap<>();
        for (int index = 0; index + 1 < keyValues.length; index += 2) {
            Object value = keyValues[index + 1];
            if (value != null) {
                attributes.put(String.valueOf(keyValues[index]), String.valueOf(value));
            }
        }
        return attributes;
    }

    public static final class Session implements AutoCloseable {
        private final Session enclosing;
        private final List<TraceEvent> events = new ArrayList<>();
        private final Deque<String> frames = new ArrayDeque<>();
        private Function<TraceEvent, Map<String, String>> snapshotProvider;
        private boolean capturing;
        private boolean closed;

        private Session(Session enclosing) {
            this.enclosing = enclosing;
        }

        public List<TraceEvent> events() {
            return List.copyOf(events);
        }

        /**
         * Asks {@code provider} for extra state right after each event is recorded. Events emitted while
         * the provider runs (for example by its own queries) are ignored so a snapshot never traces itself.
         */
        public Session snapshotWith(Function<TraceEvent, Map<String, String>> provider) {
            this.snapshotProvider = provider;
            return this;
        }

        private void add(TraceLayer layer, String kind, String marker, String detail, Map<String, String> attributes) {
            if (capturing) {
                return;
            }
            List<String> stack = new ArrayList<>(frames);
            Collections.reverse(stack);
            TraceEvent event = new TraceEvent(
                events.size() + 1,
                layer,
                kind,
                marker,
                detail,
                Thread.currentThread().getName(),
                stack,
                attributes,
                Map.of()
            );
            events.add(snapshot(event));
        }

        private TraceEvent snapshot(TraceEvent event) {
            if (snapshotProvider == null) {
                return event;
            }
            capturing = true;
            try {
                Map<String, String> captured = snapshotProvider.apply(event);
                return captured == null || captured.isEmpty() ? event : event.withSnapshot(captured);
            } finally {
                capturing = false;
            }
        }

        @Override
        public void close() {
            if (closed) {
                return;
            }
            closed = true;
            if (CURRENT.get() == this) {
                if (enclosing == null) {
                    CURRENT.remove();
                } else {
                    CURRENT.set(enclosing);
                }
            }
        }
    }
}
