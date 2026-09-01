package lite.spring.tx.annotation;

public enum Propagation {
    /** Join an existing transaction when one is active, otherwise start one. */
    REQUIRED,

    /** Suspend the current transaction and execute in an independent boundary. */
    REQUIRES_NEW
}
