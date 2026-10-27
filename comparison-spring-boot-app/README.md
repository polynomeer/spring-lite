# comparison-spring-boot-app

실행 가능한 실제 Spring Boot 비교 앱이다. `comparison-spring-lite-app`과 동일한 요구사항을 Spring Boot 방식으로 구현한다.

실행:

```bash
./gradlew :comparison-spring-boot-app:run
```

테스트:

```bash
./gradlew :comparison-spring-boot-app:test
```

## 실행 경로 비교 이벤트

`GET /lab/compare/events/{tx-commit|tx-rollback}`은 `comparison-spring-lite-app`과 같은 스키마와 단계 이름으로 실제 Spring 인프라의 실행 경로를 돌려준다. Spring에는 `TraceRecorder`가 없으므로 `lab/trace` 패키지의 어댑터가 관찰한다.

- `TracingTransactionManager`: `JdbcTransactionManager`의 `doBegin`·`doCommit`·`doRollback`·`doCleanupAfterCompletion`을 기록하고, 새 트랜잭션마다 `TransactionSynchronization`을 등록해 콜백(`tx.sync.*`)을 기록한다.
- `TracingDataSource`: 커넥션과 Statement를 감싸 실행한 SQL을 `jdbc.<동사>`로 기록한다.
- 트랜잭션 어드바이저 순서를 100으로 고정하고, 그 바깥(99)에서 `call.enter`, 안쪽(101)에서 `call.return`/`call.throw`를 기록한다. spring-lite의 단일 인터셉터가 남기는 순서와 맞추기 위해서다.
