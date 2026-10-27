package lite.spring.example.lab.whatif;

import java.util.List;
import lite.spring.aop.support.ProxyFactory;
import lite.spring.context.factory.BeanPostProcessor;
import lite.spring.core.annotation.Component;

/**
 * Beans for the what-if experiments that need their own container. They are nested classes, which
 * component scanning skips, so they only exist inside the throwaway contexts the experiments build.
 */
final class WhatIfFixtures {
    private WhatIfFixtures() {
    }

    public interface ReceiptPrinter {
        String print();
    }

    @Component
    public static class PdfReceiptPrinter implements ReceiptPrinter {
        @Override
        public String print() {
            return "receipt.pdf";
        }
    }

    /** Asks for the implementation type, which only a subclass proxy can satisfy. */
    @Component
    public static class ReceiptDesk {
        private final PdfReceiptPrinter printer;

        public ReceiptDesk(PdfReceiptPrinter printer) {
            this.printer = printer;
        }

        public String printReceipt() {
            return printer.print();
        }
    }

    /** Wraps the printer in a pass-through proxy, the way a @Transactional or @Timed post-processor would. */
    @Component
    public static class PrinterProxyPostProcessor implements BeanPostProcessor {
        @Override
        public Object postProcessAfterInitialization(String beanName, Object bean) {
            return bean instanceof PdfReceiptPrinter ? ProxyFactory.createProxy(bean, List.of(invocation -> invocation.proceed())) : bean;
        }
    }

    @Component
    public static class InventoryFacade {
        public InventoryFacade(ShippingFacade shippingFacade) {
        }
    }

    @Component
    public static class ShippingFacade {
        public ShippingFacade(InventoryFacade inventoryFacade) {
        }
    }
}
