package lite.spring.example.lab.whatif;

import lite.spring.aop.MethodInvocation;
import lite.spring.aop.annotation.Aspect;
import lite.spring.aop.annotation.Before;
import lite.spring.core.annotation.Component;
import lite.spring.core.annotation.Order;
import lite.spring.core.trace.TraceLayer;
import lite.spring.core.trace.TraceRecorder;
import lite.spring.tx.support.TransactionManager;

/**
 * Advice ordered ahead of the transaction interceptor. It records whether a transaction is already open
 * when it runs, which shows where it sits in the interceptor chain.
 */
@Aspect
@Component
@Order(1)
public class TransactionObservingAspect {
    private final TransactionManager transactionManager;

    public TransactionObservingAspect(TransactionManager transactionManager) {
        this.transactionManager = transactionManager;
    }

    @Before(annotation = AuditedOperation.class)
    public void observe(MethodInvocation invocation) {
        String transaction = transactionManager.currentTransactionName();
        TraceRecorder.record(TraceLayer.AOP, "advice", "@Before",
            "Audit advice ran " + (transaction == null ? "outside any transaction." : "inside " + transaction + "."),
            TraceRecorder.attributes("tx", transaction == null ? "none" : transaction));
    }
}
