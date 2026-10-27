package lite.spring.example.lab.pitfall;

import lite.spring.context.ApplicationContext;
import lite.spring.core.annotation.Component;

/** A singleton that receives a prototype once through its constructor, and can also look one up per call. */
@Component
public class PrototypeClient {
    private final PrototypeCounter injected;
    private final ApplicationContext applicationContext;

    public PrototypeClient(PrototypeCounter injected, ApplicationContext applicationContext) {
        this.injected = injected;
        this.applicationContext = applicationContext;
    }

    public int injectedInstance() {
        return injected.instanceId();
    }

    public int lookedUpInstance() {
        return applicationContext.getBean(PrototypeCounter.class).instanceId();
    }
}
