package lite.spring.example.lab.whatif;

import static org.assertj.core.api.Assertions.assertThat;

import lite.spring.core.whatif.WhatIf;
import lite.spring.example.ExampleApplication;
import lite.spring.test.SpringLiteTest;
import org.junit.jupiter.api.Test;

/** Runs with the boot infrastructure, which registers the aspect post-processor the advice-order experiment needs. */
@SpringLiteTest(classes = ExampleApplication.class)
class WhatIfServiceTest {

    @Test
    void ignoringRollbackOnlyCommitsTheFailedInnerWork(WhatIfService service) {
        WhatIfRunResponse off = service.run("rollback-only", "off");
        WhatIfRunResponse on = service.run("rollback-only", "on");

        assertThat(off.facts()).containsEntry("바깥 트랜잭션 결말", "rollback")
            .containsEntry("남은 orders 행", "0").containsEntry("남은 audit_log 행", "0");
        assertThat(on.facts()).containsEntry("바깥 트랜잭션 결말", "commit")
            .containsEntry("남은 orders 행", "1").containsEntry("남은 audit_log 행", "1");
        assertThat(on.events()).anyMatch(event -> event.kind().equals("what-if"));
    }

    @Test
    void reversingTheChainMovesTheAdviceInsideTheTransaction(WhatIfService service) {
        WhatIfRunResponse off = service.run("interceptor-order", "off");
        WhatIfRunResponse on = service.run("interceptor-order", "on");

        assertThat(off.facts()).containsEntry("어드바이스가 본 트랜잭션", "없음").containsEntry("실행 순서", "@Before → begin()");
        assertThat(on.facts().get("어드바이스가 본 트랜잭션")).startsWith("tx#");
        assertThat(on.facts()).containsEntry("실행 순서", "begin() → @Before").containsEntry("남은 orders 행", "1");
    }

    @Test
    void classProxyLetsTheImplementationTypeBeInjected(WhatIfService service) {
        WhatIfRunResponse off = service.run("class-proxy", "off");
        WhatIfRunResponse on = service.run("class-proxy", "on");

        assertThat(off.facts()).containsEntry("기동 결과", "실패");
        assertThat(on.facts()).containsEntry("기동 결과", "성공").containsEntry("printer 프록시", "하위 클래스 프록시")
            .containsEntry("ReceiptDesk 호출 결과", "receipt.pdf");
    }

    @Test
    void disablingCycleDetectionEndsInStackOverflow(WhatIfService service) {
        WhatIfRunResponse off = service.run("cycle-detection", "off");
        WhatIfRunResponse on = service.run("cycle-detection", "on");

        assertThat(off.facts()).containsEntry("오류 종류", "BeansException");
        assertThat(off.facts().get("오류 메시지")).contains("Circular dependency");
        assertThat(on.facts()).containsEntry("오류 종류", "StackOverflowError");
        assertThat(on.events()).hasSizeLessThanOrEqualTo(40);
    }

    @Test
    void switchesNeverLeakPastTheRun(WhatIfService service) {
        service.run("rollback-only", "on");

        for (WhatIf.Flag flag : WhatIf.Flag.values()) {
            assertThat(WhatIf.isEnabled(flag)).isFalse();
        }
    }
}
