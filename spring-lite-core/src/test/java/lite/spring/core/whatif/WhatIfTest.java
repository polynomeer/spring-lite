package lite.spring.core.whatif;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;
import org.junit.jupiter.api.Test;

class WhatIfTest {
    @Test
    void flagsAreOffByDefault() {
        for (WhatIf.Flag flag : WhatIf.Flag.values()) {
            assertThat(WhatIf.isEnabled(flag)).isFalse();
        }
    }

    @Test
    void scopedFlagsApplyOnlyInsideTheRunAndNest() {
        boolean inner = WhatIf.with(Set.of(WhatIf.Flag.TX_IGNORE_ROLLBACK_ONLY), () ->
            WhatIf.with(Set.of(WhatIf.Flag.AOP_FORCE_CLASS_PROXY), () ->
                WhatIf.isEnabled(WhatIf.Flag.TX_IGNORE_ROLLBACK_ONLY) && WhatIf.isEnabled(WhatIf.Flag.AOP_FORCE_CLASS_PROXY)));
        boolean outerAfterNested = WhatIf.with(Set.of(WhatIf.Flag.TX_IGNORE_ROLLBACK_ONLY), () -> {
            WhatIf.with(Set.of(WhatIf.Flag.AOP_FORCE_CLASS_PROXY), () -> null);
            return !WhatIf.isEnabled(WhatIf.Flag.AOP_FORCE_CLASS_PROXY) && WhatIf.isEnabled(WhatIf.Flag.TX_IGNORE_ROLLBACK_ONLY);
        });

        assertThat(inner).isTrue();
        assertThat(outerAfterNested).isTrue();
        assertThat(WhatIf.isEnabled(WhatIf.Flag.TX_IGNORE_ROLLBACK_ONLY)).isFalse();
    }

    @Test
    void systemPropertyEnablesAFlagGlobally() {
        String property = WhatIf.Flag.CONTEXT_DISABLE_CYCLE_DETECTION.systemProperty();
        System.setProperty(property, "true");
        try {
            assertThat(property).isEqualTo("spring.lite.whatif.context.disable-cycle-detection");
            assertThat(WhatIf.isEnabled(WhatIf.Flag.CONTEXT_DISABLE_CYCLE_DETECTION)).isTrue();
        } finally {
            System.clearProperty(property);
        }
    }
}
