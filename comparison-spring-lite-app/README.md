# comparison-spring-lite-app

실행 가능한 `spring-lite` 비교 앱이다. DI, MVC, 트랜잭션 비교 시나리오를 하나의 애플리케이션으로 묶는다.

실행:

```bash
./gradlew :comparison-spring-lite-app:run
```

테스트:

```bash
./gradlew :comparison-spring-lite-app:test
```

## 실행 경로 비교 이벤트

`GET /lab/compare/events/{tx-commit|tx-rollback}`은 `OrderService.createOrder`를 `TraceRecorder` 세션 안에서 실행하고, 기록된 이벤트를 `comparison-spring-boot-app`과 같은 정규화 단계 이름(`call.enter`, `tx.begin`, `jdbc.insert`, `call.throw`, `tx.rollback` 등)으로 바꿔 돌려준다. Visual Lab의 런타임 비교 화면이 두 앱의 응답을 단계 이름으로 정렬한다.
