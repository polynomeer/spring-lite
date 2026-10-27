package lite.spring.example.lab.pitfall;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import lite.spring.context.support.AnnotationConfigApplicationContext;
import lite.spring.example.ExampleApplication;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class PitfallServiceTest {
    private static AnnotationConfigApplicationContext context;
    private static PitfallService service;

    @BeforeAll
    static void startContext() {
        context = new AnnotationConfigApplicationContext(ExampleApplication.class);
        service = context.getBean(PitfallService.class);
    }

    @AfterAll
    static void closeContext() {
        context.close();
    }

    @Test
    void selfInvocationSkipsTheTransactionSoTheInsertSurvives() {
        PitfallRunResponse broken = service.run("self-invocation", "broken");
        PitfallRunResponse fixed = service.run("self-invocation", "fixed");

        assertThat(broken.facts()).containsEntry("열린 트랜잭션", "0개").containsEntry("남은 orders 행", "1");
        assertThat(fixed.facts()).containsEntry("열린 트랜잭션", "1개").containsEntry("트랜잭션 결말", "rollback")
            .containsEntry("남은 orders 행", "0");
    }

    @Test
    void finalMethodRunsOnTheUninjectedProxyInstance() {
        PitfallRunResponse broken = service.run("final-method", "broken");
        PitfallRunResponse fixed = service.run("final-method", "fixed");

        assertThat(broken.facts()).containsEntry("열린 트랜잭션", "0개");
        assertThat(broken.facts().get("밖으로 나온 예외")).startsWith("NullPointerException");
        assertThat(fixed.facts()).containsEntry("트랜잭션 결말", "rollback").containsEntry("남은 orders 행", "0");
    }

    @Test
    void checkedExceptionRollsBackInSpringLiteEvenWithoutARule() {
        assertThat(service.run("checked-exception", "broken").facts()).containsEntry("남은 orders 행", "0");
        assertThat(service.run("checked-exception", "fixed").facts()).containsEntry("남은 orders 행", "0");
    }

    @Test
    void workerThreadWritesOutsideTheTransaction() {
        PitfallRunResponse broken = service.run("new-thread", "broken");
        PitfallRunResponse fixed = service.run("new-thread", "fixed");

        assertThat(broken.facts()).containsEntry("남은 orders 행", "0").containsEntry("남은 audit_log 행", "1");
        assertThat(fixed.facts()).containsEntry("남은 orders 행", "0").containsEntry("남은 audit_log 행", "0");
    }

    @Test
    void prototypeInjectedIntoSingletonIsCreatedOnce() {
        assertThat(service.run("prototype-injection", "broken").facts()).containsEntry("서로 다른 인스턴스", "1개");
        assertThat(service.run("prototype-injection", "fixed").facts()).containsEntry("서로 다른 인스턴스", "3개");
    }

    @Test
    void constructorCycleStopsStartupUntilTheSharedPartIsExtracted() {
        PitfallRunResponse broken = service.run("circular-dependency", "broken");
        PitfallRunResponse fixed = service.run("circular-dependency", "fixed");

        assertThat(broken.facts()).containsEntry("기동 결과", "실패");
        assertThat(broken.events()).anyMatch(event -> event.kind().equals("cycle"));
        assertThat(fixed.facts()).containsEntry("기동 결과", "성공").containsEntry("만들어진 빈", "3개");
    }

    @Test
    void swallowedRequiredFailureRollsBackTheWholeTransaction() {
        assertThat(service.run("rollback-only", "broken").facts())
            .containsEntry("rollback-only 표시", "있음")
            .containsEntry("남은 orders 행", "0");
        assertThat(service.run("rollback-only", "fixed").facts())
            .containsEntry("남은 orders 행", "1")
            .containsEntry("남은 audit_log 행", "0");
    }

    @Test
    void rejectsUnknownExperimentsAndVariants() {
        assertThatThrownBy(() -> service.run("self-invocation", "other")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.run("nope", "broken")).isInstanceOf(IllegalArgumentException.class);
    }
}
