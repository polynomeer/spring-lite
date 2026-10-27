# spring-lite-tx

`spring-lite-tx`는 트랜잭션 경계와 선언형 트랜잭션 인터셉션을 담당한다. 후처리기, 프록시, 스레드 로컬 문맥이 결합되는 최소 트랜잭션 계층이다.

## 역할

- `@Transactional` 메타데이터 해석
- 트랜잭션 begin / commit / rollback 경계 제어
- `REQUIRED`, `REQUIRES_NEW`, `readOnly`, `rollbackFor`, `noRollbackFor` 지원
- 현재 스레드의 커넥션과 중첩 depth 및 suspend/resume stack 관리
- 트랜잭션 이름(`tx#N`) 부여와 begin/join/suspend/resume/commit/rollback 실행 이벤트 기록(`TraceRecorder`). commit/rollback 이벤트는 실제 반영 직후, 커넥션 정리 전에 남긴다

## 핵심 패키지

- `lite.spring.tx.annotation`
- `lite.spring.tx.support`

## 공개 API와 진입점

- `@Transactional`
- `Propagation`
- `TransactionManager`

## 내부 핵심 클래스

- `TransactionManager`
  - 현재 스레드의 트랜잭션 상태를 보관하며 `REQUIRES_NEW` 호출에서는 외부 경계를 잠시 중단한다.
- `TransactionalBeanPostProcessor`
  - 대상 빈을 트랜잭션 프록시로 감싼다.
- `ConnectionHolder`
  - 연결 문맥 표현에 사용된다.

## 호출 흐름

1. 후처리기가 `@Transactional` 메타데이터를 읽는다.
2. 대상 빈을 프록시로 감싼다.
3. 호출 시 인터셉터가 begin을 수행한다.
4. 정상/예외 흐름에 따라 commit 또는 rollback을 결정한다.
5. 최외곽 호출에서 커넥션을 정리한다.

## 테스트 포인트

- `TransactionManagerTest`
  - begin/commit/rollback, depth, rollback-only
- `TransactionalBeanPostProcessorTest`
  - 트랜잭션 프록시 생성
- `TransactionalAspectChainTest`
  - AOP 체인과 트랜잭션 인터셉터 결합

## 실제 Spring 대응

- `TransactionInterceptor`
- `PlatformTransactionManager`
- `TransactionSynchronizationManager`

## 현재 한계

- `REQUIRED`, `REQUIRES_NEW` 외 propagation 미지원
- isolation, timeout 미지원
- 다중 데이터소스/동기화 콜백 미지원
