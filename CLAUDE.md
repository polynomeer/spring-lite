# spring-lite

Spring Framework 핵심 원리(IoC/DI, AOP, MVC, `@Transactional`, JDBC, Boot)를 직접 구현하는 **학습용** 경량 프레임워크. Spring과의 100% API 호환이나 운영 수준 완성도는 목표가 아니다. 문서와 커밋 메시지 본문은 한국어, 코드·식별자·커밋 제목은 영어로 쓴다.

## 명령어

```bash
./gradlew test                                   # 전체 테스트 (JDK 21 toolchain)
./gradlew :spring-lite-web:test                  # 모듈 단위 테스트
./gradlew :spring-lite-web:test --tests 'lite.spring.web.support.DispatcherServletTest'
./gradlew :example-app:run                       # 예제 앱, 기본 포트 8080 (--args="--server.port=9090")
./scripts/run_visual_lab_stack.sh                # example-app + 비교 앱 2개 + visual-lab-app 동시 기동
cd visual-lab-app && npm run build               # 프론트 타입 체크 + 빌드 (tsc -b && vite build)
```

- `comparison-spring-boot-app`은 실제 Spring Boot 4.x 의존성을 받으므로 첫 빌드에 네트워크가 필요하다.
- 별도 포매터/린터는 없다. 주변 코드 스타일(4칸 들여쓰기, `final` 유틸 클래스, AssertJ)을 따른다.

## 모듈 구조와 의존 방향

```
core ← context ← aop ← tx
          ↑              ↑
          web          jdbc (context + tx)
           ↖    boot (web, jdbc, tx)
                 ↑
                test  ←  example-app / comparison-spring-lite-app
```

| 모듈 | 책임 | 주요 진입점 |
| --- | --- | --- |
| `spring-lite-core` | 애노테이션(`@Component`, `@Bean`, `@Conditional*` 등), 리플렉션/변환/검증 유틸, `MetricsRegistry` | `ReflectionUtils`, `PropertyResolver`, `SimpleValidator` |
| `spring-lite-context` | BeanDefinition, 스캔, 생성자 주입, 라이프사이클, 이벤트, `FactoryBean` | `AnnotationConfigApplicationContext` |
| `spring-lite-aop` | JDK/ByteBuddy 프록시, `@Aspect` 체인, `@Timed` | `ProxyFactory`, `AspectBeanPostProcessor` |
| `spring-lite-tx` | `@Transactional`, `REQUIRED`/`REQUIRES_NEW`, rollback 규칙 | `TransactionManager`, `TransactionalBeanPostProcessor` |
| `spring-lite-jdbc` | `JdbcTemplate`, `RowMapper`, `DriverManagerDataSource` | `JdbcTemplate` |
| `spring-lite-web` | Dispatcher, 매핑/인자 해석/반환값 처리, 자체 JSON 매퍼, 예외 처리, 정적 리소스 | `DispatcherServlet` |
| `spring-lite-boot` | 자동 설정, JDK `HttpServer` 내장 서버, actuator, `/api-docs` | `SpringLiteApplication.run()`, `BootInfrastructureRegistrar` |
| `spring-lite-test` | `@SpringLiteTest` JUnit 확장, `MockMvc`, 테스트 트랜잭션 롤백 | `SpringLiteTestExtension` |

- 의존은 위 방향으로만 추가한다. 모듈 간 순환 의존 금지 ([ADR 0001](docs/adr/0001-multi-module-architecture.md)). 의존성은 루트 `build.gradle.kts`에서 모듈별로 선언한다(모듈별 빌드 파일 없음).
- 패키지 루트는 `lite.spring.<module>`. 공개 API는 모듈 루트·`annotation` 패키지, 내부 구현은 `support` 하위에 둔다.
- 외부 라이브러리는 의도적으로 최소화되어 있다: JSON(`lite.spring.web.json`)과 HTTP 서버는 자체 구현이고, 런타임 의존은 ByteBuddy/Objenesis(aop)뿐이다. 새 의존성 추가 전에 사용자에게 확인한다.
- 새 자동 설정은 `spring-lite-boot/.../support/autoconfigure`에 만들고 `BootInfrastructureRegistrar.registerDefaults`에 등록한다.

## 그 밖의 디렉터리

- `example-app`: H2 기반 주문 API(`/orders`)와 Visual Lab용 trace API(`/lab/run/trace`).
- `comparison-spring-lite-app` / `comparison-spring-boot-app`: 같은 시나리오를 spring-lite와 실제 Spring Boot로 구현한 쌍. 한쪽을 바꾸면 다른 쪽도 맞춘다. 패키지는 `samples.comparison.*`.
- `sample-scenarios`: DI/MVC/트랜잭션/테스트 비교 코드 조각. **Gradle 빌드에 포함되지 않는다.**
- `visual-lab/`: 의존성 없는 정적 HTML 랩. `visual-lab-app/`: React 18 + TS + Vite 앱(포트 4173, `/lab`·`/compare-lite`·`/compare-boot`를 백엔드로 프록시).
- `docs/`: 아키텍처 가이드, 책 원고(`docs/book`), 테스트 카탈로그, 백로그(`docs/codex`). 책 원고는 대용량이므로 필요한 부분만 읽는다.

## 작업 규칙

- 기능을 추가하면 보통 한 커밋에 **구현 + 테스트 + 해당 모듈 `README.md`의 역할 목록 갱신**을 함께 담는다(최근 `feat` 커밋 패턴).
- 새 애노테이션이나 확장 포인트는 `docs/codex/module-map.md`와 로드맵/백로그(`docs/codex/task-backlog.md`, `next-implementation-backlog.md`)도 갱신한다. 백로그 갱신은 별도 `docs:` 커밋으로 분리한다.
- 루트 `README.md`의 "구현된 기능"/"현재 상태"를 실제 구현과 일치시킨다.
- 테스트: JUnit 5 + AssertJ. 컨테이너는 단위 테스트, 웹·트랜잭션은 통합 테스트(H2 in-memory)로 고정한다. 테스트 픽스처는 테스트 클래스 안의 static nested class로 두는 것이 기본이다.
- 의도적으로 단순화한 부분은 [intentional-simplifications-and-limitations.md](docs/architecture/intentional-simplifications-and-limitations.md)를 확인하고, "실제 Spring처럼" 고치기 전에 의도인지 판단한다.

## 커밋

[Conventional Commits](docs/guides/commit-conventions.md): `<type>(<scope>): <subject>`, 제목은 영어 명령형·72자 이내·마침표 없음. scope는 모듈명(`core`, `context`, `aop`, `web`, `jdbc`, `tx`, `boot`, `test`, `example-app`, `visual-lab`, `comparison` 등). 하나의 커밋에는 하나의 의도만 담고, 커밋 전 관련 모듈 테스트를 돌린다.
