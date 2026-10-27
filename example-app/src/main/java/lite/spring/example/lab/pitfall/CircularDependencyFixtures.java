package lite.spring.example.lab.pitfall;

import lite.spring.core.annotation.Component;

/**
 * Beans for the circular-dependency experiment. They are nested classes, which component scanning skips,
 * so they only exist inside the throwaway contexts the experiment builds.
 */
final class CircularDependencyFixtures {
    private CircularDependencyFixtures() {
    }

    @Component
    static class OrderFacade {
        OrderFacade(PaymentFacade paymentFacade) {
        }
    }

    @Component
    static class PaymentFacade {
        PaymentFacade(OrderFacade orderFacade) {
        }
    }

    @Component
    static class FixedOrderFacade {
        FixedOrderFacade(SharedLedger sharedLedger) {
        }
    }

    @Component
    static class FixedPaymentFacade {
        FixedPaymentFacade(SharedLedger sharedLedger) {
        }
    }

    @Component
    static class SharedLedger {
    }
}
