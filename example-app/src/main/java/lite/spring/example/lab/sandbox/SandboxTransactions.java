package lite.spring.example.lab.sandbox;

import lite.spring.core.annotation.Component;
import lite.spring.tx.annotation.Propagation;
import lite.spring.tx.annotation.Transactional;

/** Real transactional boundaries the sandbox runs method bodies through, so every call goes via the tx proxy. */
@Component
public class SandboxTransactions {
    @Transactional
    public void required(Runnable body) {
        body.run();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void requiresNew(Runnable body) {
        body.run();
    }
}
