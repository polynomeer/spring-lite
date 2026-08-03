# Build Your Own Spring Lite

## 서문

이 책은 Spring을 "쓰는 법"보다 Spring이 "왜 그런 구조인지"를 이해하는 데 목적이 있다. 많은 개발자는 `@RestController`, `@Service`, `@Transactional`을 매일 사용한다. 하지만 장애를 디버깅하거나, 자동 설정 충돌을 해석하거나, 프록시 기반 동작을 설명해야 하는 순간이 오면 사용 경험만으로는 부족하다는 사실을 곧 마주한다.

Spring은 단순한 애너테이션 모음이 아니다. 객체 생성, 의존성 조립, 런타임 확장, 프록시 기반 공통 관심사, HTTP 요청 처리, 데이터 접근, 트랜잭션 경계, 애플리케이션 부트스트랩을 하나의 일관된 런타임으로 묶는 프레임워크다. 따라서 Spring을 이해한다는 말은 "애너테이션 이름을 안다"가 아니라 "그 애너테이션이 기대는 내부 계약과 호출 순서를 설명할 수 있다"는 뜻에 가깝다.

이 책은 그 구조를 직접 만들어가며 이해한다. 완전한 Spring을 복제하지는 않는다. 대신 `spring-lite`라는 학습용 경량 프레임워크를 통해 Spring의 핵심 원리를 드러낸다. 독자는 컨테이너를 만들고, 빈 라이프사이클을 다루고, 프록시를 조합하고, 트랜잭션과 MVC를 구현하고, 마지막에는 실행 가능한 애플리케이션으로 연결한다. 이 과정을 거치고 나면 실제 Spring의 복잡성도 한층 공정하게 보이기 시작한다. 그것이 과잉 설계의 결과라기보다, 더 큰 문제를 풀기 위해 확장된 구조라는 점이 자연스럽게 드러난다.

이 책은 두 가지 방식으로 읽을 수 있다.

1. 구현 중심 독서: 각 장의 구조를 직접 구현하고 테스트를 통과시키며 읽는다.
2. 구조 이해 중심 독서: 이미 완성된 `spring-lite` 코드를 읽으며 런타임 흐름을 해부한다.

어느 방식을 택하든 중요한 것은 개념, 코드, 테스트, 실제 Spring 비교를 왕복하는 것이다. 이 책의 각 장은 다음 흐름을 유지한다.

1. 이 장이 해결하려는 문제
2. 먼저 이해해야 할 Spring 개념
3. `spring-lite`에서 구현한 구조
4. 테스트와 실패 사례
5. 실제 Spring은 여기서 어떻게 더 확장되는가
6. 실무에서 이 원리를 어떻게 활용할 수 있는가

이제 프레임워크를 사용하는 사람에서, 프레임워크를 설명할 수 있는 사람으로 넘어가 보자.

이 책이 지향하는 이해 방식은 단순히 내부 구현을 많이 아는 상태와도 조금 다르다. 클래스 이름을 많이 외운다고 해서 곧바로 구조가 보이는 것은 아니다. 오히려 중요한 것은 어떤 계층이 어떤 책임을 가지며, 문제가 생겼을 때 어디서부터 확인해야 하는지에 대한 감각이다. 컨테이너 문제인지, 후처리기 문제인지, 프록시 문제인지, 웹 디스패치 문제인지 구분할 수 있어야 실제 지식이 된다. 따라서 독자는 책을 읽는 동안 세부 API보다도 책임 분리와 호출 순서에 더 주의를 기울이는 편이 좋다.

또한 이 원고는 학습과 실무를 분리하지 않는다. 학습용 구현이라고 해서 현실과 동떨어진 장난감으로 다루지 않는다. 오히려 작은 구현을 통해 실제 실무 문제를 더 선명하게 읽는 훈련을 하려는 것이다. 트랜잭션이 왜 실패하는지, 설정이 왜 엇갈리는지, 자동화가 왜 때로는 편리하고 때로는 위험한지 같은 질문은 모두 축소판 구현 안에서 먼저 구조적으로 드러난다. 그런 다음 실제 Spring으로 돌아가면, 더 큰 코드베이스와 더 복잡한 기능도 훨씬 덜 막막하게 읽을 수 있다.

이 책의 설명 전략은 여러 계보를 함께 따른다. IoC와 DI를 설명할 때는 Martin Fowler가 정리한 "구성과 사용의 분리"라는 오래된 문제의식을 기준선으로 삼는다. Spring의 컨테이너, MVC, 트랜잭션, AOP를 설명할 때는 Spring Framework 공식 레퍼런스가 제시하는 모듈 경계와 런타임 용어를 기준으로 삼는다. 여기에 Craig Walls의 *Spring in Action*이 보여주는 "실행 가능한 애플리케이션으로 연결되는 서사", Laurentiu Spilca의 *Spring Start Here*가 보여주는 "핵심 기능을 작은 개념 단위로 분해하는 교육적 리듬", 그리고 김영한의 강의가 강조하는 "객체지향 설계 원칙과 스프링 내부 구조를 함께 보는 학습 흐름"을 결합한다. 따라서 이 원고는 특정 한 권의 책이나 한 편의 문서를 요약하는 대신, 널리 검증된 설명 축들을 `spring-lite` 코드 위에서 다시 통합하는 것을 목표로 한다.

이 접근이 중요한 이유는 Spring 학습이 보통 두 방향으로 찢어지기 쉽기 때문이다. 한쪽은 기능 사용법에 치우친다. 이 경우 빠르게 개발은 가능하지만, 내부 구조에 대한 언어가 부족해진다. 다른 한쪽은 지나치게 프레임워크 소스 자체만 파고들어, 왜 그 복잡성이 생겼는지에 대한 교육적 다리를 놓지 못한다. 이 책은 그 사이를 연결하려 한다. 공식 문서의 정확성과 실무서의 서사, 강의식 점진적 구축 방식, 고전적인 아키텍처 글의 문제의식을 함께 가져와 "왜 이 구조가 필요한가"를 더 오래 남는 방식으로 설명하고자 한다.

## 이 책을 읽는 법

이 책을 가장 잘 활용하는 방법은 각 장을 단순 설명으로 읽지 않고, 같은 장면을 네 번 다른 관점에서 반복해서 보는 것이다.

1. 문제 관점: 이 장이 해결하려는 설계 문제는 무엇인가
2. 구현 관점: `spring-lite`는 그 문제를 어떤 최소 구조로 해결하는가
3. 실패 관점: 어디서 실패할 수 있고, 그 실패는 왜 구조적으로 자연스러운가
4. 확장 관점: 실제 Spring은 왜 더 많은 추상화와 전략이 필요했는가

이 네 관점을 유지하면 코드 블록의 의미도 달라진다. 책에 나오는 코드는 단순 예제가 아니라, 어떤 설계 판단이 가장 작은 형태로 응결된 결과물이다. 따라서 코드 블록을 읽을 때는 먼저 "이 코드는 어떤 불편을 제거하기 위해 등장했는가"를 질문하는 편이 좋다. 예를 들어 `BeanDefinition`은 단순 DTO가 아니라 객체 생성 책임을 메타데이터로 분리하기 위한 장치이고, `BeanPostProcessor`는 컨테이너가 생성 이후 개입 지점을 노출하기 위해 만든 확장 계약이며, `DispatcherServlet`은 요청 처리 파이프라인을 전략 객체로 쪼개기 위한 허브다.

독서 순서도 목적에 따라 다르게 잡을 수 있다. 처음 읽는 독자라면 본문 순서를 그대로 따르는 것이 좋다. 이미 Spring 실무 경험이 충분하고 특정 주제만 보강하고 싶은 독자라면 Part 2, Part 4, Part 5, Part 7 순서로 건너뛰어 읽어도 된다. 이 경우에도 각 Part 정리와 부록의 디버깅 가이드는 함께 보는 편이 좋다. 설명을 읽고 나서 바로 저장소 코드와 테스트를 열어 보아야, 문장으로 설명된 구조가 실제 동작 계약으로 굳어진다.

이 책 전체를 관통하는 또 하나의 핵심 습관은 "기능 이름"보다 "실행 단계"로 생각하는 것이다. 빈이 없으면 등록 단계 문제일 가능성이 높고, 주입이 꼬이면 의존성 해석 규칙을 봐야 하며, 트랜잭션이 먹지 않으면 프록시 경계를 먼저 의심해야 하고, 400과 500은 서로 다른 웹 계층에서 실패한 결과다. 이 실행 단계 감각이 자리 잡으면 실제 Spring 애플리케이션의 로그와 스택 트레이스도 훨씬 더 구조적으로 읽힌다.

---

## Part 1. 왜 Spring을 직접 만들어봐야 하는가

### Chapter 1. 프레임워크를 사용하는 사람에서 이해하는 사람으로

대부분의 Spring 사용자는 생산성을 먼저 체감한다. 컨트롤러를 만들고, 서비스에 의존성을 주입하고, 저장소 계층에 `JdbcTemplate`이나 JPA를 붙이고, `@Transactional`을 선언하면 빠르게 기능을 만들 수 있다. 문제는 여기서 끝나지 않는다는 점이다. 규모가 커지고 런타임 문제가 생기기 시작하면, "왜 그렇게 동작하는지"를 모르는 상태에서는 생산성이 곧 불안으로 바뀐다.

예를 들어 다음 질문들은 Spring 실무에서 반복적으로 등장한다.

- 왜 어떤 빈은 잘 생성되는데 어떤 빈은 순환 참조로 실패하는가
- 왜 `@Bean`과 `@Component`는 비슷해 보여도 내부 모델이 다른가
- 왜 `@Transactional`은 자기 호출(self-invocation)에서 기대대로 동작하지 않는가
- 왜 웹 요청은 컨트롤러에 바로 가지 않고 `DispatcherServlet`을 중심으로 움직이는가
- 왜 설정 파일 한 줄이 애플리케이션 전체 조립 결과를 바꿀 수 있는가

이 질문은 모두 "사용법"이 아니라 "구조"의 질문이다. Spring은 API 표면이 아니라 런타임 아키텍처로 이해해야 한다. 객체를 누가 만드는지, 어떤 메타데이터를 읽는지, 어느 시점에 후처리기가 개입하는지, 메서드 호출 경계에 프록시가 어떻게 끼어드는지를 설명할 수 있어야 한다.

그래서 이 책은 문서만 읽거나 소스 코드만 보는 방식을 넘어, 핵심 구조를 직접 구현해보는 방식을 택한다. 직접 만들어보면 추상 개념이 알고리즘으로 바뀐다. "마법"처럼 보이던 기능이 호출 순서로 바뀐다. 실제 Spring의 복잡성도 훨씬 더 설득력 있게 이해된다.

이 책에서 만들 `spring-lite`는 학습용 경량 프레임워크다. 운영용 대체품이 아니라, Spring이 해결하는 핵심 문제를 가장 작은 형태로 드러내는 구조 모델이다. 현재 저장소는 다음 모듈로 구성되어 있다.

- `spring-lite-core`: 애너테이션, 리플렉션 유틸리티, 프로퍼티/검증/변환 공통 기능
- `spring-lite-context`: IoC 컨테이너, 스캐닝, 라이프사이클, 이벤트
- `spring-lite-aop`: 프록시, 인터셉터, `@Aspect`, `@Order` 기반 체인
- `spring-lite-web`: MVC 디스패치, 인자 바인딩, 예외 처리, JSON 응답
- `spring-lite-jdbc`: `JdbcTemplate`, `RowMapper`, 커넥션 유틸리티
- `spring-lite-tx`: `@Transactional`, 전파, 롤백 정책
- `spring-lite-boot`: 애플리케이션 시작점, 자동 설정, 내장 서버
- `spring-lite-test`: `@SpringLiteTest`, `MockMvc`, transactional test support
- `example-app`: 주문 예제 애플리케이션

여기서 중요한 것은 우리는 기능 목록을 따로따로 배우지 않는다는 점이다. 컨테이너, 라이프사이클, 프록시, MVC, JDBC, 트랜잭션, 부트스트랩을 한 요청 흐름과 한 실행 흐름 안에서 끝까지 연결한다. 이것이야말로 Spring을 "설정 묶음"이 아니라 "런타임 구조"로 이해하는 길이다.

실무에서 이 차이는 생각보다 훨씬 직접적이다. 구조를 이해하지 못한 상태에서는 빈 생성 오류가 나도 로그를 증상 중심으로만 읽게 된다. "왜 이런 예외가 났지?"라는 질문은 하지만, "이 문제는 스캔 단계인가, 정의 등록 단계인가, 생성자 해석 단계인가, 후처리기 개입 단계인가?"라는 식으로 실행 단계를 기준으로 좁혀 들어가지는 못한다. 반대로 구조를 이해하고 나면 로그 한 줄의 의미가 달라진다. 어느 계층에서 실패가 발생했는지 감이 생기고, 디버깅 순서도 생긴다.

기술 선택의 깊이도 달라진다. 예를 들어 선언형 트랜잭션은 대부분의 서비스 로직에 유용하지만, 모든 경우에 정답은 아니다. 프록시 기반이라는 사실을 이해하면 비동기 경계, 자기 호출, 장시간 외부 연동 같은 상황에서 별도 설계가 필요하다는 점을 더 빨리 떠올리게 된다. MVC 자동 바인딩도 마찬가지다. 단순히 편하다고만 생각하면 입력 검증과 오류 응답 정책이 흩어지기 쉽지만, 요청 해석 파이프라인을 이해하면 어떤 책임을 프레임워크에 맡기고 어떤 책임을 도메인 계층에 남길지 더 선명하게 나눌 수 있다.

이 책은 그래서 사용법 안내서가 아니라 해석 도구를 제공하려 한다. 독자가 책을 덮은 뒤 얻어야 할 것은 "애너테이션을 많이 안다"는 감각이 아니라, 실제 Spring 애플리케이션에서 문제가 발생했을 때 이를 구조적으로 설명할 수 있는 언어다. 객체 생성, 메타데이터 등록, 후처리, 프록시 합성, 웹 디스패치, 트랜잭션 전파 같은 단어들이 각자 따로 떠다니지 않고 하나의 런타임 이야기로 연결되어야 한다.

이 장의 문제의식은 Spring을 단순 프레임워크가 아니라 애플리케이션 조립기(application assembler)로 보는 관점과도 맞닿아 있다. Martin Fowler가 오래전에 정리했듯이 핵심은 제어 역전이라는 말 자체보다, "구성(configuration)과 사용(use)을 분리한다"는 설계 원칙이다. Spring을 깊이 이해한다는 말은 곧 이 분리 원칙이 실제 코드베이스에서 어떤 런타임 구조로 구현되는지 이해한다는 뜻이다. 컨테이너는 단지 객체를 대신 만드는 편의 장치가 아니라, 애플리케이션의 조립 책임을 전담하는 별도 계층이다. 이 사실을 선명하게 이해하면, 왜 설정 클래스와 컴포넌트 스캔, 자동 설정, 외부 설정 주입이 모두 같은 이야기의 다른 면인지도 자연스럽게 보이기 시작한다.

```mermaid
flowchart LR
    A["User Code"] --> B["IoC Container"]
    B --> C["Bean Lifecycle"]
    C --> D["Proxy / AOP"]
    D --> E["Web MVC"]
    D --> F["Transaction"]
    F --> G["JDBC"]
    B --> H["Bootstrapping"]
    H --> E
```

### Chapter 2. Spring의 큰 그림: IoC, Lifecycle, AOP, MVC, Transaction

큰 그림 없이 세부 기능부터 배우면 지식은 금방 조각난다. `@Component`를 따로 배우고, `@Bean`을 따로 배우고, `@Transactional`을 따로 배우면 각각의 사용법은 기억에 남을 수 있다. 하지만 장애가 생기면 결국 기능이 아니라 흐름을 봐야 한다. 트랜잭션이 안 걸렸다면 데이터베이스가 아니라 프록시 경로를 봐야 하고, 컨트롤러 주입이 실패했다면 웹이 아니라 컨테이너 등록/생성 단계를 봐야 한다.

애플리케이션은 대략 다음 순서로 올라온다.

1. 설정 클래스와 스캔 기준을 찾는다.
2. 빈 정의를 등록한다.
3. 의존성을 해석하며 빈을 생성한다.
4. 라이프사이클 훅과 후처리기를 적용한다.
5. 필요한 빈은 프록시로 감싼다.
6. 웹 인프라와 서버를 조립한다.
7. 요청이 들어오면 디스패처가 이를 메서드 호출로 바꾼다.
8. 서비스 호출 경계에서 트랜잭션이 열리고, JDBC가 그 문맥을 따라간다.

이 구조를 가장 단순한 요청으로 그려보면 다음과 같다.

```mermaid
sequenceDiagram
    participant Client as Client
    participant Server as Embedded Server
    participant DS as DispatcherServlet
    participant Ctrl as Controller Bean
    participant Svc as Service Proxy
    participant Tx as Transaction Interceptor
    participant Repo as Repository
    participant DB as Database

    Client->>Server: HTTP Request
    Server->>DS: dispatch
    DS->>Ctrl: invoke handler
    Ctrl->>Svc: call service
    Svc->>Tx: intercept
    Tx->>Repo: proceed within tx
    Repo->>DB: execute SQL
    DB-->>Repo: result
    Repo-->>Tx: return
    Tx-->>Svc: commit/rollback
    Svc-->>Ctrl: model
    Ctrl-->>DS: return value
    DS-->>Client: HTTP Response
```

이 그림이 이후 책 전체의 기준선이다. 컨트롤러도 빈이고, 서비스도 빈이며, 트랜잭션은 서비스 호출 경계에서 개입하고, 저장소는 그 문맥 안에서 커넥션을 재사용한다. 부트스트랩 계층은 이 모든 조각을 사용자가 직접 조립하지 않아도 되도록 한 줄의 시작점으로 묶는다. Spring Boot의 생산성은 바로 여기서 나온다.

이 큰 그림을 먼저 잡아두면 이후 장에서 세부 메커니즘을 배울 때도 위치 감각을 잃지 않는다. 예를 들어 `BeanPostProcessor`를 배울 때는 "왜 이런 확장 포인트가 필요한가?"라는 질문에 곧바로 답할 수 있다. 빈이 완성된 뒤 프록시를 씌워야 AOP와 트랜잭션이 가능하기 때문이다. `DispatcherServlet`을 배울 때도 "왜 웹 계층에 전략 객체가 이렇게 많이 필요한가?"를 이해할 수 있다. 요청을 메서드 호출로 바꾸는 과정이 단순 라우팅이 아니라 매핑, 바인딩, 검증, 응답 처리, 예외 해석의 연속이기 때문이다.

독자는 이 장을 일종의 지도처럼 활용하는 편이 좋다. 이후에 어떤 기능을 배우든, 먼저 이 기능이 어디에 끼어드는지 질문해보자. 시작 시점에 개입하는가, 빈 생성 시점에 개입하는가, 메서드 호출 경계에 개입하는가, HTTP 요청과 응답 사이에 개입하는가, 데이터 접근 문맥에 개입하는가. 이 질문만 유지해도 Spring의 방대한 개념을 훨씬 덜 파편적으로 받아들일 수 있다.

공식 Spring 레퍼런스가 지금도 가치 있는 이유도 바로 이 큰 그림을 모듈별로 일관되게 유지하기 때문이다. IoC 문서는 컨테이너와 빈 메타데이터를 중심으로, AOP 문서는 프록시와 advice를 중심으로, 트랜잭션 문서는 추상화와 정책을 중심으로, MVC 문서는 `DispatcherServlet`과 전략 컴포넌트를 중심으로 설명한다. 즉, Spring은 기능 설명도 결국 런타임 경계를 기준으로 정리한다. 이 책이 모듈별 구현을 따라가더라도 계속해서 "이 기능은 어느 경계의 책임인가"를 묻는 이유가 여기에 있다.

Part 2부터는 이 큰 그림의 바닥인 IoC 컨테이너부터 직접 구현한다.

### Part 1 정리

이번 Part에서 독자는 다음을 먼저 고정했다.

- Spring을 기능 목록이 아니라 런타임 구조로 보는 관점
- IoC, Lifecycle, AOP, MVC, Transaction, Boot가 한 실행 흐름으로 연결된다는 큰 그림
- 이 책을 읽을 때 문제, 구현, 실패, 확장 관점을 반복해서 적용하는 독서 방식

디버깅 체크 질문:

- 지금 보고 있는 문제는 어떤 실행 단계에 속하는가
- 이 기능은 빈 등록, 빈 생성, 프록시 개입, 웹 디스패치, 트랜잭션 경계 중 어디에서 설명되는가
- 증상을 기능 이름으로 이해하고 있는가, 아니면 호출 순서로 이해하고 있는가

실제 Spring에서 이어서 읽기 좋은 클래스와 문서 축:

- `org.springframework.context.ApplicationContext`
- `org.springframework.context.support.AbstractApplicationContext`
- Spring Framework Reference의 Core Container, AOP, MVC, Transaction Overview

독자 연습 과제:

1. 현재 실무 프로젝트 하나를 떠올리고, 그 프로젝트에서 Spring이 개입하는 실행 단계를 그림으로 다시 그려보라.
2. 최근 겪은 장애 하나를 선택해, 컨테이너 문제인지 프록시 문제인지 웹 파이프라인 문제인지 분류해보라.
3. `spring-lite` 모듈 중 아직 읽지 않은 모듈 하나를 열어 보고, 그것이 전체 런타임의 어느 위치에 놓이는지 짧게 설명해보라.

---

## Part 2. IoC 컨테이너를 직접 만든다

### Chapter 3. 첫 번째 컨테이너: BeanDefinition과 Bean Registry

컨테이너가 실제로 먼저 관리하는 것은 객체가 아니다. 객체를 어떻게 만들 것인가에 대한 설명이다. 어떤 클래스를 대상으로 하는지, 이름은 무엇인지, 생성 전략은 생성자인지 팩토리 메서드인지, 싱글톤인지 프로토타입인지 같은 메타데이터가 먼저 있어야 한다. Spring이 객체보다 `BeanDefinition`을 먼저 다루는 이유가 여기에 있다.

`spring-lite`에서도 같은 철학을 따른다. 클래스패스를 스캔하거나 설정 클래스를 읽더라도 곧바로 `new`를 호출하지는 않는다. 먼저 `BeanDefinition`을 등록하고, 이후 refresh 또는 `getBean()` 단계에서 실제 인스턴스를 만든다. 이 설계 덕분에 컨테이너는 스캔된 컴포넌트와 `@Bean` 메서드 결과물을 같은 생성 파이프라인으로 다룰 수 있다.

이 단계에서 중요한 분리는 두 가지다.

- 빈 정의 등록소: 아직 만들어지지 않은 빈의 생성 계획
- 싱글톤 캐시: 이미 생성된 빈 인스턴스

이 둘이 섞이면 생성 실패 시 상태 관리가 복잡해지고, 아직 만들어지지 않은 빈을 대상으로 타입 조회나 조건 판단을 하기가 어려워진다. 반대로 둘이 분리되면 빈 정의를 모두 수집한 뒤 생성 순서를 통제할 수 있고, 조건부 등록이나 후처리기 초기화도 훨씬 쉬워진다.

실제 Spring의 `DefaultListableBeanFactory`와 `BeanDefinitionRegistry` 분리도 결국 같은 문제를 푼다. 학습용 구현에서는 이 개념을 더 작게 축소했지만, 메타데이터와 인스턴스를 분리하는 발상 자체는 그대로다.

이 분리는 단순 구현상의 편의가 아니라 프레임워크 해석의 출발점이기도 하다. 실무에서 "왜 이 빈이 생겼는가"를 추적할 때도, 바로 인스턴스에서 출발하기보다 어떤 `BeanDefinition`이 먼저 등록되었는지부터 봐야 하는 경우가 많다. 스캔으로 등록되었는지, `@Bean` 메서드에서 나왔는지, 자동 설정이 추가했는지, 조건부 등록이 통과되었는지가 모두 메타데이터 단계에서 결정되기 때문이다. 인스턴스는 그 결과일 뿐이다.

또한 등록소와 캐시를 구분하면 실패 전략도 더 깔끔해진다. 생성 도중 예외가 나더라도 메타데이터는 남아 있으므로 원인을 추적하기 쉽고, 반쯤 만들어진 객체를 정상 빈처럼 다루는 사고도 피할 수 있다. 학습용 컨테이너에서는 이런 명료성이 특히 중요하다. 작은 설계 선택 하나가 이후 라이프사이클, 후처리, 프록시 적용 전략까지 연쇄적으로 영향을 주기 때문이다.

실제 Spring 문서가 빈을 "객체"보다 먼저 "정의"로 설명하는 이유도 여기에 있다. 공식 문서의 Bean Overview는 이름, 생성 방식, 스코프, 런타임 타입, 팩토리 메서드 같은 메타데이터를 먼저 다룬다. 그 순서를 따라가다 보면 컨테이너가 단순 메모리 캐시가 아니라 메타데이터 해석기라는 사실이 드러난다. `spring-lite`에서 `BeanDefinition`을 일찍 도입한 이유도 그 관점을 독자에게 가장 먼저 체득시키기 위해서다. 일단 이 축이 잡히면 이후의 `@Configuration`, 조건부 등록, Boot 자동 설정도 모두 같은 언어로 설명할 수 있다.

이 장을 더 천천히 읽어 보면, 프레임워크 설계의 무게중심이 어디에 놓여야 하는지도 보이기 시작한다. 많은 초보 구현은 객체를 곧바로 생성하는 데서 출발한다. 하지만 그렇게 시작하면 나중에 설정 클래스, 조건부 등록, 지연 초기화, 후처리기 같은 개념이 들어올 자리가 없다. 반대로 메타데이터를 먼저 세우면 아직 생성되지 않은 객체에 대해서도 "무엇이 생길 예정인가"를 말할 수 있다. 프레임워크는 바로 그 선행 설명 능력을 바탕으로 확장된다.

따라서 `BeanDefinition`은 작은 클래스처럼 보여도, 사실상 이후 전체 구조를 받아내는 기초 좌표계다. 이름은 조회 기준이 되고, 타입은 의존성 해석 기준이 되며, kind는 생성 전략 분기점이 되고, singleton 여부는 캐시와 수명 정책으로 이어진다. 독자가 이 클래스의 필드 하나하나를 "왜 필요한가"까지 설명할 수 있다면, 컨테이너의 핵심 원리는 이미 상당 부분 손에 들어온 셈이다.

그림 3-1은 Spring Lite 컨테이너가 왜 객체보다 메타데이터를 먼저 다루는지를 시각적으로 요약한다.

![Container metadata and lifecycle](./figures/container-metadata-lifecycle.svg)

_그림 3-1. 빈 정의 수집에서 싱글톤 캐시 저장까지 이어지는 컨테이너 기본 흐름_

이후 Chapter 4에서 생성자 선택과 의존성 해석을 읽을 때도 다시 그림 3-1을 떠올리면 좋다. 지금 보는 분기들은 모두 이 큰 컨테이너 생성 흐름의 중간 단계에 놓여 있다.

```java
public final class BeanDefinition {
    public enum Kind {
        COMPONENT,
        CONFIGURATION,
        FACTORY_METHOD,
        INFRASTRUCTURE
    }

    private final String name;
    private final Class<?> beanType;
    private final Kind kind;
    private final Class<?> configurationClass;
    private final Method factoryMethod;
    private final boolean singleton;
    private final String qualifier;
}
```

```mermaid
flowchart TB
    A["Classpath Scan / @Configuration"] --> B["BeanDefinition Registry"]
    B --> C["Constructor / Factory Method Selection"]
    C --> D["Dependency Resolution"]
    D --> E["Bean Instance"]
    E --> F["Singleton Cache"]
```

```mermaid
flowchart LR
    A["BeanDefinition"] --> B["name"]
    A --> C["beanType"]
    A --> D["kind"]
    A --> E["singleton"]
    A --> F["qualifier"]
    B --> G["lookup key"]
    C --> H["dependency matching"]
    D --> I["constructor vs factory method"]
    E --> J["cache policy"]
    F --> K["candidate narrowing"]
```

이 장을 build-along 방식으로 따라간다면, 먼저 "정의가 인스턴스보다 먼저 등록된다"는 사실을 테스트로 고정하는 편이 좋다.

```java
@Test
void registersBeanDefinitionBeforeInstantiation() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
    context.register(TestConfig.class);

    assertThat(context.containsBeanDefinition("testConfig")).isTrue();
}
```

그 다음에는 최소 컨테이너 저장소를 만든다. 이 시점에는 아직 복잡한 생성 로직보다 `beanDefinitions`와 `singletons`를 분리해 두는 것이 더 중요하다.

```java
public class AnnotationConfigApplicationContext implements ConfigurableApplicationContext {
    private final Map<String, BeanDefinition> beanDefinitions = new LinkedHashMap<>();
    private final Map<String, Object> singletons = new LinkedHashMap<>();

    @Override
    public void registerBeanDefinition(BeanDefinition beanDefinition) {
        beanDefinitions.put(beanDefinition.name(), beanDefinition);
    }

    @Override
    public void registerSingleton(String beanName, Object singleton) {
        singletons.put(beanName, singleton);
    }
}
```

직접 구현하는 독자라면 여기서 멈추지 말고, 같은 장 안에서 `BeanDefinition.component(...)`, `BeanDefinition.factoryMethod(...)` 팩토리 메서드까지 함께 완성해 두는 편이 좋다. 그래야 다음 장에서 생성자 기반 빈과 설정 메서드 기반 빈을 같은 파이프라인 안에서 다룰 수 있다.

### Chapter 4. 생성자 주입과 의존성 해석

DI를 "외부에서 주입한다"는 문장으로만 이해하면 핵심을 놓친다. 컨테이너 입장에서 DI는 해석 알고리즘이다. 어떤 생성자를 선택할지, 각 파라미터에 대해 어떤 빈 후보를 찾을지, 후보가 없거나 여러 개면 어떤 예외를 낼지, `@Qualifier`가 있으면 어떤 규칙으로 선택을 좁힐지를 모두 결정해야 한다.

생성자 주입이 중요한 이유는 객체가 어떤 의존성을 반드시 요구하는지가 생성자 시그니처에 명시되기 때문이다. 컨테이너는 그 시그니처를 읽고, 파라미터 타입마다 후보 빈을 탐색한다. 후보가 없으면 즉시 실패해야 한다. 여러 후보가 있으면 모호성을 숨기지 말고 `NoUniqueBeanException`으로 실패해야 한다. 이것이 건강한 실패 전략이다.

생성자 주입은 순환 참조도 빨리 드러낸다. `A`를 만들려면 `B`가 필요하고, `B`를 만들려면 다시 `A`가 필요하면 어느 쪽도 완성될 수 없다. Spring은 역사적으로 이 문제를 더 복잡한 조기 노출 메커니즘으로 부분 해결해 왔지만, `spring-lite`는 오히려 이 실패를 그대로 드러내는 쪽을 택한다. 책의 목적이 구조를 설명하는 데 있기 때문이다. 생성자 순환 참조가 왜 구조적으로 어려운지 보이면, 이후 라이프사이클과 실패 전략 장이 훨씬 설득력 있게 이어진다.

이 장에서 독자가 꼭 익혀야 할 감각은 "DI는 문법이 아니라 탐색 규칙"이라는 점이다. 개발자 입장에서는 생성자 파라미터 하나를 선언하는 것처럼 보여도, 컨테이너 입장에서는 그 순간 여러 질문이 열린다. 어떤 생성자를 선택할 것인가, 각 파라미터 타입에 맞는 후보는 몇 개인가, qualifier가 있는가, 후보가 여러 개인데 우선순위를 정할 수 있는가, 지금 당장 생성 가능한 빈인가. 이 질문들에 대한 답이 모여야 비로소 하나의 객체가 안전하게 조립된다.

실제 코드를 읽을 때는 성공 경로보다 실패 경로를 더 중요하게 보는 편이 좋다. 후보가 없을 때 어떤 예외가 나가는지, 후보가 둘 이상일 때 왜 조용히 하나를 고르지 않는지, `@Autowired` 생성자가 둘 이상일 때 왜 즉시 실패하는지가 모두 프레임워크의 철학을 보여준다. 컨테이너는 모호함을 감추는 대신 표면화해야 한다. 그래야 애플리케이션 구조가 불안정한 상태로 실행까지 넘어가지 않는다.

실무에서도 생성자 주입이 널리 권장되는 이유는 테스트 편의성이나 불변성만이 아니다. 의존성을 계약으로 드러내고, 구조적 문제를 조기에 노출하며, 컨테이너의 판단 규칙을 더 분명하게 만든다는 점이 함께 중요하다. 책을 읽는 동안 독자는 생성자 주입을 단순 취향 문제가 아니라 프레임워크와 애플리케이션 사이의 명확한 합의로 이해하게 될 것이다.

생성자 주입을 해석 알고리즘으로 보는 시선은 이후 많은 논의를 단단하게 만든다. 예를 들어 `@Primary`, `ObjectProvider`, 컬렉션 주입, 지연 주입, optional 의존성 같은 확장은 모두 같은 질문에서 출발한다. "하나의 파라미터를 실제 런타임 객체로 바꾸기 위해 컨테이너는 어떤 규칙을 적용해야 하는가?" 지금은 최소 규칙만 다루지만, 실제 Spring이 거대한 이유는 이 질문의 변종이 매우 많기 때문이다.

```java
private Constructor<?> selectConstructor(Class<?> beanType) {
    Constructor<?>[] constructors = beanType.getDeclaredConstructors();
    List<Constructor<?>> autowiredConstructors = Arrays.stream(constructors)
        .filter(constructor -> constructor.isAnnotationPresent(Autowired.class))
        .toList();
    if (autowiredConstructors.size() > 1) {
        throw new BeansException("Multiple @Autowired constructors found in " + beanType.getName());
    }
    if (!autowiredConstructors.isEmpty()) {
        return autowiredConstructors.getFirst();
    }
    if (constructors.length == 1) {
        return constructors[0];
    }
    return Arrays.stream(constructors)
        .filter(constructor -> constructor.getParameterCount() == 0)
        .findFirst()
        .orElseThrow(() -> new BeansException("No suitable constructor found for " + beanType.getName()));
}

private Object resolveDependency(Parameter parameter) {
    Class<?> dependencyType = parameter.getType();
    Map<String, ?> candidates = getBeansOfType(dependencyType);
    if (candidates.isEmpty()) {
        throw new NoSuchBeanException("No bean of type " + dependencyType.getName());
    }
    Qualifier qualifier = parameter.getAnnotation(Qualifier.class);
    if (qualifier != null) {
        return resolveQualifiedDependency(dependencyType, qualifier.value(), candidates);
    }
    if (candidates.size() > 1) {
        throw new NoUniqueBeanException("Multiple beans of type " + dependencyType.getName() + ": " + candidates.keySet());
    }
    return candidates.values().iterator().next();
}
```

```mermaid
flowchart TD
    A["constructor parameter"] --> B["find beans by type"]
    B --> C{"candidate count"}
    C -- 0 --> D["NoSuchBeanException"]
    C -- 1 --> E["use the only candidate"]
    C -- many --> F{"@Qualifier present?"}
    F -- no --> G["NoUniqueBeanException"]
    F -- yes --> H["match qualifier"]
    H --> I{"matched exactly one?"}
    I -- yes --> J["inject matched bean"]
    I -- no --> G
```

이 장은 반드시 테스트 먼저 가는 편이 좋다. 가장 먼저 통과시킬 테스트는 보통 아래와 같이 작성할 수 있다.

```java
@Test
void resolvesConstructorDependencies() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(TestConfig.class);

    GreetingService greetingService = context.getBean(GreetingService.class);

    assertThat(greetingService.format()).isEqualTo("hello");
}
```

그 다음 실제 생성 루프를 연결한다. 책을 따라 손으로 구현할 때는 이 메서드를 거의 그대로 옮겨 적는 것이 좋다. 생성자 선택, 순환 참조 탐지, 팩토리 메서드 분기, 초기화, 싱글톤 캐시 저장이 한곳에 모여 있기 때문이다.

```java
private Object createBean(String beanName, BeanDefinition beanDefinition) {
    if (beanDefinition.singleton() && singletons.containsKey(beanName)) {
        return singletons.get(beanName);
    }
    if (!beansInCreation.add(beanName)) {
        throw new BeansException("Circular dependency detected while creating " + beanName);
    }
    try {
        Object created = switch (beanDefinition.kind()) {
            case FACTORY_METHOD -> invokeFactoryMethod(beanDefinition);
            default -> instantiateWithConstructor(beanDefinition.beanType());
        };
        Object initialized = initializeBean(beanName, created);
        if (beanDefinition.singleton()) {
            singletons.put(beanName, initialized);
        }
        return initialized;
    } finally {
        beansInCreation.remove(beanName);
    }
}
```

이 메서드가 동작하기 시작하면 비로소 컨테이너는 "정의 저장소"에서 "객체 조립 런타임"으로 넘어간다. 따라서 이 장의 끝에서는 성공 경로만이 아니라 `NoSuchBeanException`, `NoUniqueBeanException`, 순환 참조 실패도 함께 테스트로 잠가 두는 편이 좋다.

### Chapter 5. 컴포넌트 스캔과 메타 애너테이션

수동 등록만으로는 프로젝트가 커질수록 유지 비용이 급격히 올라간다. 그래서 Spring은 어떤 클래스를 관리 대상으로 볼 것인지를 애너테이션 메타데이터로 선언하게 하고, 클래스패스를 스캔해 이를 자동 등록한다. `@Component`, `@Service`, `@Repository`는 모두 이 전략의 일부다.

여기서 흥미로운 점은 스캔이 단순 텍스트 검색이 아니라는 것이다. 개발 환경에서는 클래스가 디렉터리에 있지만, 배포 환경에서는 JAR 안에 있을 수 있다. 따라서 스캐너는 파일 시스템과 JAR 양쪽을 이해해야 한다. 또한 `@Service`가 왜 `@Component`처럼 동작하는지를 설명하려면 메타 애너테이션 탐색도 구현해야 한다. 결국 스캔은 "어떤 타입을 빈 후보로 볼 것인가"를 결정하는 클래스패스 메타데이터 시스템이다.

빈 이름 생성 전략도 같이 중요해진다. 이름을 자동 생성하면 충돌이 생길 수 있고, 충돌이 생기면 예측 가능성이 깨진다. 그래서 클래스명 규칙, 메서드명 규칙, 명시적 이름 우선순위 같은 정책이 필요하다. 편의를 제공하는 만큼 규칙을 명확히 해야 한다는 점에서, 스캔은 프레임워크 설계의 성숙도를 보여주는 좋은 주제다.

특히 스캔은 "자동화는 언제나 규칙 위에 서야 한다"는 사실을 잘 보여준다. 개발자는 `@Service`를 붙이면 빈이 등록될 것이라고 기대하지만, 그 기대가 성립하려면 프레임워크가 패키지 경로를 어떻게 해석하는지, 어떤 애너테이션을 빈 후보로 보는지, 메타 애너테이션을 어디까지 따라가는지, 중복 클래스를 어떻게 처리하는지가 모두 정해져 있어야 한다. 자동화가 많아질수록 오히려 규칙 설명의 중요성이 커진다.

학습 관점에서도 이 장은 흥미롭다. 많은 사람이 애너테이션을 정적인 표식처럼 여기지만, 스캔을 구현해 보면 애너테이션은 런타임 메타데이터 해석의 입력값일 뿐이라는 점이 드러난다. `@Component` 계열의 스테레오타입은 결국 "이 타입을 빈 후보로 등록하라"는 의도를 표현하는 작은 DSL이다. 실제 Spring이 수많은 메타 애너테이션 조합을 지원하는 이유도, 바로 이 DSL을 풍부하게 확장해 왔기 때문이다.

실무에서 스캔 문제는 의외로 자주 발목을 잡는다. 패키지 기준이 어긋나 빈이 누락되거나, 의도치 않게 테스트 더블이 함께 스캔되거나, 이름 충돌로 등록이 실패하는 사례가 반복된다. 이런 상황에서 스캔을 "잘 모르지만 돌아가는 자동 기능"으로 보면 문제 해결이 어렵다. 반대로 스캔이 클래스패스 메타데이터 수집기라는 사실을 이해하면, 어디를 확인해야 할지가 훨씬 분명해진다.

또 하나 중요한 점은, 스캔이 "소스 코드 읽기"가 아니라 "컴파일된 클래스 메타데이터 읽기"라는 사실이다. 이것은 프레임워크가 개발자가 작성한 자바 문장을 직접 해석하는 것이 아니라, 런타임에서 관찰 가능한 클래스 구조와 애너테이션만을 바탕으로 판단한다는 뜻이다. 그래서 패키지 경계, 클래스 로더, JAR 구성, 메타 애너테이션 보존 정책이 모두 결과에 영향을 준다. 스캔은 생각보다 훨씬 런타임 친화적인 메커니즘이다.

```java
public List<Class<?>> scan(String basePackage) {
    String path = basePackage.replace('.', '/');
    Enumeration<URL> resources = Thread.currentThread().getContextClassLoader().getResources(path);
    Map<String, Class<?>> classes = new LinkedHashMap<>();
    while (resources.hasMoreElements()) {
        URL resource = resources.nextElement();
        if ("file".equals(resource.getProtocol())) {
            addClasses(classes, scanDirectory(basePackage, directory));
        } else if ("jar".equals(resource.getProtocol())) {
            addClasses(classes, scanJar(basePackage, path, resource));
        }
    }
    addClasses(classes, scanUrlsFromClassLoader(path));
    return new ArrayList<>(classes.values());
}
```

직접 구현하기 관점에서 이 장의 첫 테스트는 최대한 단순해야 한다.

```java
@Test
void scansComponentsFromBasePackage() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
    context.scan("lite.spring.context.fixture");
    context.refresh();

    assertThat(context.getBean("scannedGreetingService")).isNotNull();
}
```

그 다음 스캔 결과를 컨테이너 정의로 바꾸는 연결부를 붙인다.

```java
private void registerDiscoveredClass(Class<?> candidate) {
    if (candidate.isInterface() || candidate.isAnnotation() || candidate.isEnum()) {
        return;
    }
    if (!isManagedType(candidate)) {
        return;
    }
    BeanDefinition.Kind kind = AnnotationUtils.hasAnnotation(candidate, Configuration.class)
        ? Kind.CONFIGURATION
        : Kind.COMPONENT;
    BeanDefinition beanDefinition = BeanDefinition.component(
        BeanNameGenerator.generateBeanName(candidate),
        candidate,
        kind,
        isSingleton(candidate),
        extractQualifier(candidate)
    );
    registerBeanDefinition(beanDefinition);
    if (kind == Kind.CONFIGURATION) {
        registerBeanMethods(candidate);
    }
}
```

```mermaid
flowchart TD
    A["scan(basePackage)"] --> B["directory or jar entries"]
    B --> C["load candidate class"]
    C --> D{"managed type?"}
    D -- no --> E["skip"]
    D -- yes --> F["determine kind"]
    F --> G["generate bean name"]
    G --> H["extract scope/qualifier"]
    H --> I["register BeanDefinition"]
    I --> J{"configuration class?"}
    J -- yes --> K["register @Bean methods"]
    J -- no --> L["done"]
```

이 장에서 독자가 실제로 손으로 구현해 보면, `@Service`나 `@Repository` 같은 애너테이션이 별도 마법이 아니라 결국 "스캔 대상 후보"를 판별하는 메타데이터라는 사실을 가장 빨리 체감하게 된다.

### Chapter 6. `@Configuration`과 `@Bean`

컴포넌트 모델만으로는 외부 라이브러리 빈 등록이나 조립 로직 표현에 한계가 있다. 이때 필요한 것이 설정 클래스와 팩토리 메서드다. `@Configuration`과 `@Bean`은 "이 클래스 자체가 빈이다"라는 말보다 "이 메서드 호출 결과를 빈으로 등록하라"는 선언에 가깝다.

이 차이는 컨테이너 입장에서 매우 중요하다. 클래스 기반 빈은 생성자를 호출해 만들지만, 팩토리 메서드 빈은 설정 빈을 먼저 만들고 그 위에서 특정 메서드를 호출해야 한다. 따라서 `BeanDefinition`은 타입뿐 아니라 생성 전략도 함께 표현해야 한다. `spring-lite`에서 `FACTORY_METHOD` kind가 따로 존재하는 이유가 바로 여기에 있다.

실제 Spring은 여기서 한 걸음 더 나아가 `@Configuration` 클래스를 CGLIB로 강화해 `@Bean` 메서드 간 호출도 컨테이너의 동작 규칙을 따르도록 만든다. 학습용 구현은 그만큼 복잡하지 않지만, 왜 실제 Spring이 더 무거운 모델을 채택하는지는 충분히 설명된다.

이 장에서 핵심은 "모든 빈이 클래스 자체에서 직접 태어나는 것은 아니다"라는 관점을 받아들이는 일이다. 외부 라이브러리 객체, 복잡한 설정 조합이 필요한 객체, 여러 의존성을 계산해서 만들어야 하는 객체는 컴포넌트 스캔만으로는 다루기 어렵다. `@Bean` 메서드는 이 문제를 푸는 선언적 팩토리다. 개발자는 객체 생성 로직을 평범한 자바 코드로 표현하면서도, 결과물은 여전히 컨테이너의 생명주기와 조회 규칙 안에 놓이게 된다.

설정 클래스를 특별 취급해야 한다는 점도 중요하다. 일반 빈은 생성의 결과물이지만, 설정 클래스는 다른 빈 정의를 추가로 만들어 내는 메타 계층이기도 하다. 따라서 컨테이너는 설정 클래스를 읽는 시점과 그 결과를 등록하는 시점을 의식해야 한다. 이 작은 차이를 이해하면, 실제 Spring에서 왜 설정 처리기가 별도 인프라로 존재하고 왜 `@Import`, 조건부 등록, auto-configuration 같은 메커니즘이 메타데이터 단계에서 복잡하게 얽히는지 더 쉽게 이해하게 된다.

실무에서는 `@Configuration`과 `@Bean`이 외부 시스템 연결 지점을 깔끔하게 드러내는 장점도 있다. 데이터소스, HTTP 클라이언트, 메시지 프로듀서 같은 인프라 객체를 설정 계층에 모아두면 애플리케이션의 조립 구조가 더 명확해진다. 즉, 이 장은 단순 문법 차이를 넘어 애플리케이션의 구성 책임을 어디에 둘 것인가에 대한 설계 장이기도 하다.

이 장은 "선언형 조립과 명령형 조립의 타협점"으로 읽어도 좋다. `@Bean` 메서드 안에서는 평범한 자바 코드를 쓴다. if 문도 쓸 수 있고, 객체 생성 순서도 직접 표현할 수 있다. 하지만 그 결과는 다시 선언형 메타데이터로 환원되어 컨테이너의 규칙을 따른다. 즉, Spring은 조립 로직을 자바 코드로 열어 두면서도, 최종 결과물은 프레임워크의 생명주기와 확장 모델 안으로 끌어들인다.

```java
private void registerBeanMethods(Class<?> configurationClass) {
    for (Method method : configurationClass.getDeclaredMethods()) {
        Bean bean = method.getAnnotation(Bean.class);
        if (bean == null) {
            continue;
        }
        String beanName = bean.value().isBlank()
            ? BeanNameGenerator.generateBeanName(method.getName())
            : bean.value();
        BeanDefinition beanDefinition = BeanDefinition.factoryMethod(
            beanName,
            method.getReturnType(),
            configurationClass,
            method,
            isSingleton(method),
            extractQualifier(method)
        );
        registerBeanDefinition(beanDefinition);
    }
}

private Object invokeFactoryMethod(BeanDefinition beanDefinition) {
    Object configurationBean = getBean(BeanNameGenerator.generateBeanName(beanDefinition.configurationClass()));
    Method factoryMethod = beanDefinition.factoryMethod();
    Object[] arguments = resolveExecutableArguments(factoryMethod.getParameters());
    return ReflectionUtils.invoke(factoryMethod, configurationBean, arguments);
}
```

```mermaid
flowchart LR
    A["@Configuration class"] --> B["registerBeanMethods()"]
    B --> C["FACTORY_METHOD BeanDefinition"]
    C --> D["get configuration bean"]
    D --> E["resolve method arguments"]
    E --> F["invoke @Bean method"]
    F --> G["initialize returned object"]
    G --> H["singleton cache if needed"]
```

build-along 형식으로는 이 장의 첫 검증을 팩토리 메서드 빈 생성 테스트로 두는 편이 자연스럽다.

```java
@Test
void createsFactoryMethodBeansFromConfigurationClass() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(TestConfig.class);

    Formatter formatter = context.getBean(Formatter.class);

    assertThat(formatter.format("spring")).isEqualTo("[spring]");
}
```

이 테스트를 통과시키는 과정에서 독자는 두 가지를 분명히 배우게 된다. 첫째, 설정 클래스 자체도 빈이라는 점. 둘째, `@Bean` 메서드 결과도 결국 `BeanDefinition`을 거쳐야 한다는 점이다. 이 두 감각이 생기면 이후 Boot 자동 설정도 훨씬 더 쉽게 읽힌다.

### Chapter 7. `@Qualifier`, `@Value`, 설정 값 주입

같은 인터페이스의 구현이 여러 개 생기면 타입만으로는 어떤 빈을 주입할지 결정할 수 없다. `@Qualifier`는 이 모호성을 줄이는 장치다. 이름 매칭처럼 보일 수 있지만, 실제로는 타입 기반 자동화 위에 개발자의 의도를 추가로 얹는 장치다. 같은 타입 후보가 여러 개일 때, 컨테이너는 `@Qualifier`와 빈 메타데이터를 함께 사용해 선택을 좁힌다.

`@Value`는 또 다른 차원의 확장을 보여준다. 설정 값 주입은 단순 편의 기능처럼 보이지만, 실제로는 프로퍼티 리졸버, 플레이스홀더 문법, 기본값, 타입 변환, 환경별 재정의 우선순위가 모두 필요한 문제다. `spring-lite`는 YAML 기반 `PropertyResolver`, 프로파일 대응 `application-{profile}.yml` 병합, 공통 `ConversionService`를 통해 이 문제를 최소 구현한다.

이 장은 컨테이너가 단순 생성기에서 정책 시스템으로 확장되는 과정을 보여준다. 타입 우선 규칙, qualifier 보조, 프로퍼티 로딩, 변환, 기본값, 프로파일 재정의가 쌓일수록 컨테이너는 더 많은 조립 결정을 대신하게 된다. 바로 이 지점에서 Spring Boot의 강력함과 복잡성이 함께 시작된다.

`@Qualifier`를 이해할 때는 이름 매칭 기법으로 축소하지 않는 것이 중요하다. 본질은 타입 기반 자동 조립을 유지하되, 모호한 경우 개발자가 의도를 더 좁혀 표현할 수 있게 한다는 점이다. 이 규칙이 없으면 컨테이너는 후보가 여러 개인 순간 곧바로 모호해지고, 반대로 너무 자유롭게 허용하면 잘못된 빈이 조용히 주입될 위험이 커진다. qualifier는 자동화와 명시성 사이의 균형 장치라고 볼 수 있다.

설정 값 주입은 더 넓은 주제로 이어진다. 애플리케이션은 더 이상 코드만으로 구성되지 않는다. 포트 번호, 데이터베이스 URL, 기본 상태 값, 실행 프로파일, 외부 시스템 엔드포인트처럼 환경에 따라 달라지는 요소가 모두 조립 과정에 참여한다. 따라서 프로퍼티 해석은 컨테이너 바깥의 부가 기능이 아니라, 빈 생성과 같은 수준의 핵심 런타임 기능이다. `spring-lite`에서 YAML 로딩, 기본값 처리, 타입 변환을 함께 다루는 이유도 여기에 있다.

독자는 이 장을 통해 Spring Boot의 핵심 감각 하나를 미리 배우게 된다. 좋은 프레임워크는 값을 단순히 읽는 데서 끝나지 않고, "어떤 설정이 어떤 우선순위로 적용되었는가"를 설명할 수 있어야 한다. 프로파일별 파일 병합, 런타임 오버라이드, 플레이스홀더 기본값은 모두 그 설명력을 높이는 장치다. 실무에서 환경별 버그가 생기는 이유도 대개 여기서 시작한다.

설정 주입을 설명할 때는 "값도 의존성이다"라는 말을 자주 떠올리면 좋다. 객체 의존성은 다른 빈을 찾으면 되지만, 값 의존성은 외부 환경이라는 더 넓은 입력 공간을 읽어야 한다. 그 때문에 프로퍼티 해석에는 키 이름, 기본값, 변환 규칙, 프로파일 병합, 런타임 오버라이드 같은 또 다른 해석 단계가 따라붙는다. 결국 `@Value`는 단순 문자열 치환이 아니라, 컨테이너가 외부 환경을 내부 객체 그래프로 번역하는 기능이다.

```java
public static PropertyResolver loadApplicationProperties() {
    PropertyResolver baseResolver = loadSingleResource("application.yml");
    Map<String, String> merged = new LinkedHashMap<>(baseResolver.values);
    String activeProfiles = resolveActiveProfiles(baseResolver);
    if (activeProfiles == null || activeProfiles.isBlank()) {
        return new PropertyResolver(merged);
    }
    for (String profile : activeProfiles.split(",")) {
        String trimmed = profile.trim();
        if (trimmed.isEmpty()) {
            continue;
        }
        PropertyResolver profileResolver = loadSingleResource("application-" + trimmed + ".yml");
        merged.putAll(profileResolver.values);
    }
    merged.putAll(RUNTIME_OVERRIDES.get());
    return new PropertyResolver(merged);
}

public String resolveRequiredPlaceholder(String expression) {
    Placeholder placeholder = parsePlaceholder(expression);
    String value = values.get(placeholder.key());
    if (value != null) {
        return value;
    }
    if (placeholder.defaultValue() != null) {
        return placeholder.defaultValue();
    }
    throw new IllegalStateException("Missing required property " + placeholder.key());
}
```

직접 구현하는 독자라면 이 장에서 두 종류의 테스트를 먼저 적는 편이 좋다. 하나는 `@Qualifier`, 다른 하나는 `@Value`다.

```java
@Test
void resolvesQualifiedDependencies() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(QualifierConfig.class);

    QualifiedFormatterClient client = context.getBean(QualifiedFormatterClient.class);

    assertThat(client.format()).isEqualTo("json");
}

@Test
void injectsValueFromPropertyResolver() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ValueConfig.class);

    ValueClient client = context.getBean(ValueClient.class);

    assertThat(client.port()).isEqualTo(8080);
}
```

그리고 `@Value`의 파라미터 처리와 필드 처리 모두를 본문에 함께 싣는 편이 좋다. 그래야 독자가 "설정 주입도 결국 의존성 해석의 또 다른 분기"라는 사실을 코드로 이해할 수 있다.

```java
private Object resolveValue(Parameter parameter) {
    Value value = parameter.getAnnotation(Value.class);
    if (value == null) {
        return resolveDependency(parameter);
    }
    String resolved = propertyResolver.resolveRequiredPlaceholder(value.value());
    return conversionService.convert(resolved, parameter.getType());
}
```

```java
private void injectFieldValues(Object bean) {
    for (Field field : bean.getClass().getDeclaredFields()) {
        Value value = field.getAnnotation(Value.class);
        if (value == null) {
            continue;
        }
        String resolved = propertyResolver.resolveRequiredPlaceholder(value.value());
        Object converted = conversionService.convert(resolved, field.getType());
        ReflectionUtils.makeAccessible(field);
        ReflectionUtils.setField(field, bean, converted);
    }
}
```

```mermaid
flowchart TD
    A["@Value expression"] --> B["parse placeholder"]
    B --> C["lookup merged properties"]
    C --> D{"value found?"}
    D -- yes --> E["convert to target type"]
    D -- no --> F{"default value exists?"}
    F -- yes --> E
    F -- no --> G["IllegalStateException"]
    E --> H["inject into parameter or field"]
```

### Chapter 8. Scope와 컨테이너 이벤트

컨테이너는 객체를 한 번 만들어주는 유틸리티가 아니다. 시작과 종료, 재사용과 파괴, 이벤트 발행을 가진 런타임이다. `singleton`은 한 번 만든 인스턴스를 재사용하고, `prototype`은 매번 새 인스턴스를 만든다. 차이는 단순 성능이 아니라 수명과 책임의 차이다. 싱글톤은 생성부터 종료까지 컨테이너가 관리하지만, 프로토타입은 생성 이후 관리 범위가 줄어든다.

컨텍스트 이벤트도 이 런타임 성격을 드러낸다. refresh와 close 시점에 `ApplicationListener`가 반응할 수 있으면, 프레임워크 내부에서 느슨한 연결을 만들 수 있다. 초기화 완료 후 특정 작업을 수행하거나, 종료 시 정리 로직을 묶는 식이다. `ContextRefreshedEvent`, `ContextClosedEvent`는 작아 보이지만, 수동 팩토리와 ApplicationContext를 구분하는 핵심 요소다.

Part 2를 마치면 독자는 이제 컨테이너의 기본 골격을 설명할 수 있어야 한다. 메타데이터를 등록하고, 의존성을 해석하고, 설정과 스캔을 통해 후보를 모으고, 스코프와 이벤트로 런타임 성격을 부여하는 시스템. 이것이 Spring의 바닥이다.

스코프를 단순 생성 횟수의 문제로만 이해하면 중요한 부분을 놓친다. 싱글톤은 단지 한 번만 만들어지는 객체가 아니라, 컨테이너가 생명주기 전체를 관리하는 객체다. 반대로 프로토타입은 매번 새로 만들어지지만, 생성 직후부터는 컨테이너의 관리가 약해진다. 이 차이는 파괴 콜백, 리소스 정리, 상태 보관 방식에 직접 영향을 준다. 실제 Spring에서 request, session 같은 웹 스코프를 이해할 때도 같은 관점이 필요하다. 핵심은 "몇 번 만들까"보다 "누가 언제까지 책임질까"다.

이벤트 모델 역시 컨테이너를 런타임으로 바라보게 만든다. 컨텍스트 refresh 이후에만 실행되어야 하는 작업이 있고, close 시점에 정리되어야 하는 작업이 있다면, 이를 직접 순서대로 호출하는 것보다 이벤트로 연결하는 편이 훨씬 유연하다. `ApplicationListener`는 느슨한 결합이라는 소프트웨어 설계 원칙을 컨테이너 내부 런타임에도 적용하는 예다. 프레임워크 안쪽에서도 컴포넌트 사이의 연결을 이벤트로 늦출 수 있다는 점이 중요하다.

Part 2 전체를 돌아보면, 우리는 사실 "객체를 만드는 법"보다 "객체를 조립하고 관리하는 규칙의 체계"를 만든 셈이다. `BeanDefinition`, 생성자 해석, 스캔, 설정 클래스, 값 주입, 스코프, 이벤트는 각자 다른 기능처럼 보이지만 모두 한 질문으로 연결된다. 애플리케이션 객체들을 누가 어떤 규칙으로 생성하고 연결하며, 그 수명과 확장을 누가 관리할 것인가. 이 질문에 대한 첫 번째 완성형 답이 바로 IoC 컨테이너다.

이 장을 끝내고 나면 독자는 Spring 컨테이너를 더 이상 "편리한 객체 공장"으로만 보지 않게 된다. 이제 컨테이너는 메타데이터 수집기이자, 의존성 해석기이자, 수명 관리자이자, 이벤트 발행기다. 바로 이 다층적 성격 때문에 Spring의 나머지 기능도 모두 컨테이너 위에 안전하게 올라갈 수 있다. 다음 Part에서 보게 될 라이프사이클 확장과 후처리기 모델도 결국 이 기반이 있기 때문에 가능하다.

```mermaid
sequenceDiagram
    participant App as Application
    participant Ctx as ApplicationContext
    participant Def as BeanDefinitions
    participant Bean as Bean Instance
    participant Listener as ApplicationListener

    App->>Ctx: register / scan
    Ctx->>Def: collect metadata
    Ctx->>Bean: instantiate singletons
    Ctx->>Bean: inject and initialize
    Ctx->>Listener: ContextRefreshedEvent
    App->>Ctx: close()
    Ctx->>Listener: ContextClosedEvent
```

직접 구현하기 관점에서 이 장의 완료 기준은 두 테스트가 통과하는 것이다. 하나는 프로토타입 빈이 매번 새 인스턴스를 반환하는지, 다른 하나는 refresh/close 이벤트가 순서대로 발행되는지다.

```java
@Test
void createsPrototypeBeansOnEveryLookup() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(PrototypeConfig.class);

    PrototypeBean first = context.getBean(PrototypeBean.class);
    PrototypeBean second = context.getBean(PrototypeBean.class);

    assertThat(first).isNotSameAs(second);
}

@Test
void publishesRefreshAndCloseEvents() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(EventConfig.class);
    EventCollectorListener listener = context.getBean(EventCollectorListener.class);

    context.close();

    assertThat(listener.events()).containsExactly("refreshed", "closed");
}
```

이 시점에 독자는 컨테이너의 최소 골격을 갖추게 된다. 따라서 Part 2 마지막에서는 구현을 잠시 멈추고, 이제부터는 "생성 이후 개입"이 가능한 구조로 확장해 나간다는 점을 명시해 주는 편이 좋다.

### Part 2 정리

이번 Part에서 독자는 다음을 직접 만들었다.

- `BeanDefinition` 기반 메타데이터 모델
- 생성자 주입과 타입 기반 의존성 해석
- 컴포넌트 스캔과 메타 애너테이션 판별
- `@Configuration` / `@Bean` 기반 팩토리 메서드 생성
- `@Qualifier`, `@Value`, 프로퍼티 해석
- 기본 스코프와 컨텍스트 이벤트

디버깅 체크 질문:

- 이 빈은 애초에 등록되었는가
- 등록되었다면 어떤 `BeanDefinition`으로 표현되었는가
- 생성자 후보 선택은 왜 그렇게 되었는가
- 다중 후보는 `@Qualifier`로 좁혀졌는가
- 값 주입은 어떤 프로퍼티 소스에서 왔는가

실제 Spring에서 이어서 읽기 좋은 클래스:

- `org.springframework.context.annotation.AnnotationConfigApplicationContext`
- `org.springframework.beans.factory.support.DefaultListableBeanFactory`
- `org.springframework.context.annotation.ClassPathBeanDefinitionScanner`

독자 연습 과제:

1. `@Primary`에 해당하는 최소 기능을 직접 추가해보라.
2. `List<T>` 타입 주입을 지원하도록 의존성 해석을 확장해보라.
3. `application-test.yml` 병합 테스트를 추가해보라.

---

## Part 3. Bean Lifecycle과 확장 포인트를 이해한다

### Chapter 9. Bean Lifecycle의 전체 흐름

객체가 생성되었다고 해서 곧바로 "준비 완료" 상태가 되는 것은 아니다. 프레임워크가 관리하는 빈은 인스턴스 생성 뒤에도 의존성 주입, 초기화 전 후처리, 초기화 콜백, 초기화 후 후처리, 종료 콜백 등록 같은 단계를 거친다. 이 순서를 이해하면 왜 어떤 기능은 생성 직후 작동하고, 어떤 기능은 후처리기 이후에만 적용되며, 어떤 문제는 "생성은 되었지만 아직 완전히 초기화되지 않은 상태"에서 발생하는지 설명할 수 있다.

`@PostConstruct`, `@PreDestroy`, `AutoCloseable` 지원은 이 흐름을 독자 눈앞에 드러낸다. 초기화와 파괴를 생성자 하나에 모두 넣지 않고, 컨테이너가 관리하는 생명주기 단계로 분리하는 이유가 명확해진다. 실제 Spring에서도 라이프사이클은 독립 주제로 다뤄질 만큼 중요하다. 프레임워크는 객체를 만드는 것뿐 아니라 "어떤 순서로 준비하고 정리할 것인가"를 관리하는 시스템이기 때문이다.

여기서 특히 중요한 점은, 라이프사이클이 단순 편의 기능이 아니라 "안전한 개입 순서"를 정의한다는 사실이다. 예를 들어 어떤 빈이 외부 리소스에 연결을 맺어야 하고, 또 다른 후처리기가 그 빈을 프록시로 감싸야 한다면, 둘은 아무 순서로나 실행될 수 없다. 생성 직후에 필드 값이 아직 준비되지 않은 상태에서 초기화 로직이 먼저 실행되면 잘못된 연결이 만들어질 수 있고, 반대로 프록시 적용 전에 원본 객체를 다른 인프라가 붙잡아 버리면 이후의 선언형 기능이 기대대로 작동하지 않을 수 있다. 라이프사이클은 바로 이런 순서 문제를 프레임워크 차원에서 고정하는 계약이다.

독자가 이 장에서 꼭 얻어야 할 감각은 "컨테이너가 빈을 소유한다"는 말의 구체적 의미다. 생성자를 호출하는 것만으로는 아직 소유가 완성되지 않는다. 의존성을 채우고, 후처리기를 통과시키고, 종료 시 정리 책임까지 예약해야 비로소 컨테이너 관리 객체라고 부를 수 있다. 실제 Spring에서 초기화 타이밍 문제, 프록시 적용 시점 문제, 종료 누락 문제를 디버깅할 때도 결국 이 소유권 모델을 다시 떠올리게 된다.

```java
private Object initializeBean(String beanName, Object bean) {
    injectFieldValues(bean);
    Object current = bean;
    for (BeanPostProcessor beanPostProcessor : beanPostProcessors) {
        current = beanPostProcessor.postProcessBeforeInitialization(beanName, current);
    }
    invokeLifecycleMethods(current, PostConstruct.class);
    for (BeanPostProcessor beanPostProcessor : beanPostProcessors) {
        current = beanPostProcessor.postProcessAfterInitialization(beanName, current);
    }
    registerDestroyCallback(beanName, bean, current);
    return current;
}
```

```mermaid
flowchart LR
    A["Instantiate"] --> B["Resolve Dependencies"]
    B --> C["postProcessBeforeInitialization"]
    C --> D["@PostConstruct"]
    D --> E["postProcessAfterInitialization"]
    E --> F["Register Destroy Callbacks"]
    F --> G["@PreDestroy / AutoCloseable"]
```

직접 구현하기 관점에서는 이 장도 라이프사이클 순서를 테스트로 먼저 고정하는 편이 좋다.

```java
@Test
void invokesLifecycleCallbacksInOrder() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(DestroyConfig.class);
    LifecycleBean bean = context.getBean(LifecycleBean.class);

    assertThat(bean.events()).containsExactly("postConstruct");

    context.close();

    assertThat(bean.events()).containsExactly("postConstruct", "preDestroy");
}
```

그리고 `initializeBean()` 하나만으로 끝내지 말고, 종료 콜백 등록까지 이어지는 구조를 함께 따라가게 하는 편이 좋다. 이 장에서 독자가 잡아야 할 핵심은 "생성 완료"와 "사용 가능"이 같지 않다는 사실이기 때문이다.

또한 종료 단계는 학습용 구현에서 종종 가볍게 넘어가지만, 실무 감각을 만들기 위해서는 오히려 강조할 필요가 있다. 애플리케이션은 시작보다 종료에서 더 쉽게 무질서해진다. 커넥션 풀, 파일 핸들, 스케줄러, 백그라운드 스레드가 적절히 정리되지 않으면 운영 환경에서는 메모리 누수와 자원 잠김으로 이어진다. `@PreDestroy`와 `AutoCloseable`을 같은 타임라인 위에 올려놓는 이유는, 프레임워크가 시작과 종료를 하나의 생명주기 이야기로 묶어 관리해야 함을 보여 주기 위해서다.

### Chapter 10. `BeanPostProcessor`

Spring이 강력한 이유를 하나만 꼽으라면, 많은 경우 답은 `BeanPostProcessor`다. 컨테이너가 객체를 만든 뒤 그 결과를 다시 변형할 수 있기 때문이다. 프록시를 감싸거나, 특정 애너테이션을 해석하거나, 인프라 빈과 애플리케이션 빈의 조합을 바꾸는 기능 대부분이 이 지점에 기대고 있다.

`spring-lite`에서도 후처리기는 초기화 전과 후 두 단계로 나뉜다. 초기화 전 훅은 메타데이터 준비나 값 주입 같은 작업에 적합하고, 초기화 후 훅은 프록시 생성처럼 완성된 빈을 다른 객체로 대체해야 하는 작업에 적합하다. 특히 트랜잭션과 AOP는 둘 다 이 단계에서 빈을 감싸는 방식으로 동작한다. 이 사실을 이해하면 Part 4의 프록시/AOP 장은 전혀 새로운 세계가 아니라, 지금 만든 컨테이너 위에 올라가는 자연스러운 확장처럼 보인다.

후처리기가 중요한 더 근본적인 이유는, 프레임워크가 "생성 알고리즘을 닫아 두지 않기" 때문이다. 컨테이너가 모든 빈을 완성한 뒤 아무 개입점도 주지 않는다면, 이후의 선언형 기능은 빈 생성 로직 자체를 뜯어고치지 않고서는 추가할 수 없다. 하지만 후처리기 훅이 있으면, 컨테이너의 기본 생성 알고리즘은 유지한 채 결과물에만 개입할 수 있다. 이것이 Spring이 오랫동안 확장에 강했던 이유다.

```java
public interface BeanPostProcessor {
    default Object postProcessBeforeInitialization(String beanName, Object bean) {
        return bean;
    }

    default Object postProcessAfterInitialization(String beanName, Object bean) {
        return bean;
    }
}
```

```mermaid
flowchart LR
    A["raw bean"] --> B["postProcessBeforeInitialization"]
    B --> C["@PostConstruct / init callbacks"]
    C --> D["postProcessAfterInitialization"]
    D --> E{"replace bean?"}
    E -- no --> F["return original bean"]
    E -- yes --> G["return proxy / wrapped bean"]
```

build-along 방식에서는 이 장에서 아주 작은 후처리기 하나를 테스트로 먼저 만드는 편이 자연스럽다.

```java
@Test
void replacesBeanAfterInitialization() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ProxyDestroyConfig.class);

    ProxiedService service = context.getBean(ProxiedService.class);

    assertThat(service.message()).isEqualTo("proxied");
}
```

그 다음 `refresh()` 내부에서 후처리기 빈을 먼저 수집하는 단계를 본문에 보여줘야 한다. 그래야 후처리기가 단순 콜백이 아니라 컨테이너 조립 순서의 일부라는 사실이 분명해진다.

```java
private void instantiateBeanPostProcessors() {
    List<String> postProcessorBeanNames = beanDefinitions.values().stream()
        .filter(definition -> BeanPostProcessor.class.isAssignableFrom(definition.beanType()))
        .map(BeanDefinition::name)
        .filter(this::isBeanEligible)
        .toList();
    for (String beanName : postProcessorBeanNames) {
        BeanPostProcessor beanPostProcessor = (BeanPostProcessor) getBean(beanName);
        if (!beanPostProcessors.contains(beanPostProcessor)) {
            beanPostProcessors.add(beanPostProcessor);
            sortBeanPostProcessors();
        }
    }
}
```

### Chapter 11. 순환 참조, 실패 전략, 설계 판단

프레임워크는 모든 문제를 해결해주는 시스템이 아니라, 어떤 문제를 어느 시점에 드러낼지까지 포함해 설계된 시스템이다. 생성자 순환 참조는 대표적인 예다. `spring-lite`는 이를 즉시 실패시킨다. 메시지가 좋을수록 학습용 프레임워크의 가치는 올라간다. 실패 원인과 의존성 경로가 빨리 드러날수록 독자는 구조 문제를 더 빨리 이해할 수 있기 때문이다.

실제 Spring은 조기 노출, 3단계 캐시, 다양한 주입 방식 등을 통해 이 문제를 더 유연하게 다룬다. 하지만 그 유연성은 복잡성의 대가를 치른 결과다. 이 장의 핵심은 "Spring은 왜 이렇게 복잡해졌는가"에 대한 공정한 설명이다. 그리고 실무적으로는 순환 참조를 컨테이너 문제가 아니라 설계 경계 문제로 보는 관점까지 가져가야 한다. 서비스가 서로를 직접 물고 있다면, 프레임워크 이전에 책임 분리가 잘못되었을 가능성이 높다.

순환 참조를 다룰 때 독자가 특히 조심해야 할 점은 "프레임워크가 해결해주니까 설계상 문제도 괜찮다"는 착시다. 실제로는 그 반대인 경우가 많다. 순환 참조를 허용하는 순간 객체의 생성 시점과 완전 초기화 시점을 분리해서 생각해야 하고, 프록시 조기 노출이나 세 단계 캐시처럼 컨테이너 내부 모델도 복잡해진다. 여기에 AOP와 트랜잭션 프록시까지 결합되면, 지금 내가 주입받은 객체가 실제 타깃인지, 조기 노출된 참조인지, 프록시인지까지 함께 고려해야 한다. 학습 목적의 프레임워크에서는 이런 복잡성을 감추기보다 드러내는 편이 훨씬 교육적이다.

`spring-lite`의 선택은 그래서 의도적으로 보수적이다. 생성자 기반 순환 참조를 우회하지 않고 즉시 실패시킴으로써, 컨테이너의 책임과 애플리케이션 설계 책임을 명확히 나눈다. 이런 실패 전략은 실무에서도 유용하다. 빈 생성을 어떻게든 통과시키는 것보다 설계 경계를 재검토하게 만들기 때문이다. 주문 서비스와 결제 서비스가 서로를 직접 참조한다면, 그 사이에 도메인 서비스나 조정자(orchestrator)를 도입하는 편이 대개 더 낫다.

독자는 이 장에서 프레임워크의 친절함과 구조적 건전성이 항상 같은 방향으로 가지 않는다는 사실도 배워야 한다. 사용성만 강조하면 프레임워크는 점점 더 많은 예외를 흡수하게 되고, 그 결과 내부 규칙은 더 복잡해진다. 반대로 학습용 구현은 엄격한 실패를 통해 핵심 원리를 더 선명하게 보여줄 수 있다. 실제 Spring 소스를 읽을 때도 이 관점을 갖고 보면, "왜 이렇게까지 했을까"라는 질문에 더 공정하게 답할 수 있다.

이 장은 기술 설명이면서 동시에 설계 훈련이기도 하다. 순환 참조는 종종 "컨테이너가 좀 더 똑똑하면 풀 수 있지 않을까?"라는 방향으로만 논의된다. 하지만 그 전에 물어야 할 질문은, 왜 두 서비스가 서로를 직접 필요로 하게 되었는가다. 조정 책임이 한쪽에 과도하게 몰린 것은 아닌지, 더 작은 도메인 서비스나 이벤트 협력으로 풀 수는 없는지, 읽기 모델과 쓰기 모델을 분리해야 하는 것은 아닌지 점검해야 한다. 컨테이너의 실패는 종종 설계의 냄새를 드러내는 진단 도구이기도 하다.

직접 구현하는 독자에게는 이 장 역시 실패를 테스트로 고정하게 하는 편이 좋다.

```java
@Test
void failsFastOnCircularConstructorDependency() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
    context.register(CircularConfig.class);

    assertThatThrownBy(context::refresh)
        .isInstanceOf(BeansException.class)
        .hasMessageContaining("Circular dependency");
}
```

그리고 핵심 구현은 가능한 한 짧고 단호해야 한다.

```java
if (!beansInCreation.add(beanName)) {
    throw new BeansException("Circular dependency detected while creating " + beanName);
}
```

```mermaid
flowchart TD
    A["create OrderService"] --> B["needs PaymentService"]
    B --> C["create PaymentService"]
    C --> D["needs OrderService"]
    D --> E["OrderService already in creation"]
    E --> F["circular dependency failure"]
```

이렇게 해야 다음 장들에서 프록시와 후처리기가 추가되더라도 독자는 "지금 이 실패는 컨테이너가 구조 문제를 조기에 드러낸 것"이라고 해석할 수 있다.

### Part 3 정리

이번 Part에서 독자는 다음 구조를 구현하거나 설명할 수 있어야 한다.

- 빈 초기화 전후 단계
- `@PostConstruct`, `@PreDestroy`, `AutoCloseable` 처리
- `BeanPostProcessor` 기반 확장 포인트
- 순환 참조 감지와 빠른 실패 전략

디버깅 체크 질문:

- 이 빈은 생성은 되었지만 아직 초기화 전 상태인가
- 후처리기는 before/after 어느 단계에서 개입하는가
- 종료 콜백은 실제로 등록되었는가
- 지금 문제는 컨테이너 기능 부족인가, 설계 경계 문제인가

실제 Spring에서 이어서 읽기 좋은 클래스:

- `org.springframework.beans.factory.config.BeanPostProcessor`
- `org.springframework.context.support.AbstractApplicationContext`
- `org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory`

독자 연습 과제:

1. 특정 애너테이션이 붙은 빈의 초기화 시간을 측정하는 후처리기를 만들어보라.
2. 종료 순서를 추적하는 테스트를 추가해보라.
3. 순환 참조 예외 메시지에 의존성 경로를 더 자세히 넣어보라.

---

## Part 4. 프록시, AOP, 트랜잭션을 직접 구현한다

### Chapter 12. 프록시의 본질

Spring이 객체 대신 프록시를 반환하는 이유는 단순한 우회가 아니라 "호출 경계에 개입할 수 있는 구조"를 만들기 위해서다. 클라이언트는 서비스를 호출한다고 생각하지만, 실제로는 그 앞에 놓인 프록시를 호출한다. 프록시는 메서드 진입 전후에 로직을 끼워 넣거나, 심지어 호출 자체를 다른 방식으로 바꿀 수 있다.

`spring-lite`는 JDK 동적 프록시와 클래스 기반 프록시를 모두 보여준다. 인터페이스가 있으면 표준 동적 프록시가 가능하고, 인터페이스가 없으면 ByteBuddy 기반 프록시를 생성한다. 여기서 독자가 얻어야 할 핵심은 프록시 전략이 곧 프레임워크의 제약과 확장성을 결정한다는 점이다. 또한 `MethodInvocation`이 왜 중요한지도 이 장에서 분명해진다. 호출 대상, 메서드, 인자, `proceed()`를 하나의 객체로 묶으면 호출 자체를 데이터처럼 다룰 수 있고, 인터셉터 체인은 이 호출 객체를 순차적으로 감싼다.

프록시를 이해할 때 가장 중요한 사고 전환은 "객체 호출"을 "호출 경계"로 다시 보는 일이다. 비즈니스 코드를 작성할 때는 `service.placeOrder()`처럼 평범한 메서드 호출로 보이지만, 프레임워크는 바로 그 경계에 관심을 가진다. 호출 직전에 무엇을 검사할지, 호출 도중 예외가 나면 무엇을 기록할지, 호출이 끝난 뒤 어떤 정리 작업을 할지를 결정하는 지점이기 때문이다. 프록시는 이 경계를 구조적으로 드러내는 도구다.

또한 프록시 전략의 선택은 단순 구현 디테일이 아니다. 인터페이스 기반 프록시는 가볍고 표준적이지만, 인터페이스가 없으면 적용할 수 없다. 클래스 기반 프록시는 더 넓게 적용되지만, final 메서드나 생성자 처리, 서브클래싱 제약 같은 별도 고려사항이 생긴다. 실제 Spring이 JDK 프록시와 CGLIB 기반 프록시를 모두 제공해 온 이유도 바로 이 현실적인 제약들 때문이다.

아래 코드는 프록시 생성 지점에서 독자가 꼭 봐야 하는 두 가지를 한 번에 보여 준다. 첫째, 인터페이스 유무에 따라 프록시 전략이 갈린다는 점이다. 둘째, 인터셉터 체인은 타깃 객체 바깥에서 조립된다는 점이다.

```java
public interface MethodInterceptor {
    Object invoke(MethodInvocation invocation) throws Throwable;
}

public static Object createProxy(Object target, List<MethodInterceptor> interceptors) {
    ProxyDescriptor descriptor = unwrapProxy(target);
    Object proxyTarget = descriptor.target();
    List<MethodInterceptor> mergedInterceptors = mergeInterceptors(descriptor.interceptors(), interceptors);
    Class<?>[] interfaces = proxyTarget.getClass().getInterfaces();
    if (interfaces.length == 0) {
        return createClassProxy(proxyTarget, mergedInterceptors);
    }
    SpringLiteInvocationHandler invocationHandler = new SpringLiteInvocationHandler(proxyTarget, mergedInterceptors);
    return Proxy.newProxyInstance(proxyTarget.getClass().getClassLoader(), interfaces, invocationHandler);
}
```

```mermaid
flowchart LR
    A["client"] --> B["proxy instance"]
    B --> C["interceptor chain"]
    C --> D["MethodInvocation.proceed()"]
    D --> E["target method"]
    E --> F["return value / exception"]
    F --> C
    C --> A
```

직접 구현하기 관점에서 이 장의 첫 테스트는 인터페이스 기반 프록시가 호출을 실제로 가로채는지를 검증하는 것이다.

이 테스트의 목적은 단순히 문자열이 바뀌는지 보는 것이 아니다. 클라이언트가 타깃 객체가 아니라 프록시를 통해 호출하고 있다는 사실을 가장 작은 증거로 고정하는 데 있다.

```java
@Test
void wrapsInterfaceBasedTargetWithJdkProxy() {
    GreetingContract target = new GreetingService();
    Object proxy = ProxyFactory.createProxy(target, List.of(invocation -> "[" + invocation.proceed() + "]"));

    assertThat(((GreetingContract) proxy).greet()).isEqualTo("[hello]");
}
```

그리고 본문에는 호출 체인의 핵심인 `proceed()` 구현도 함께 실어야 한다. 독자가 이 메서드를 손으로 구현해 보면 프록시 기반 AOP의 본질이 "메서드 호출을 객체로 다룬다"는 데 있다는 사실을 가장 빨리 이해하게 된다.

이 블록에서는 `proceed()`가 단순 재귀 호출이 아니라 "다음 인터셉터로 넘길지, 실제 타깃 메서드를 실행할지"를 결정하는 분기점이라는 점을 보아야 한다.

```java
private static final class SimpleMethodInvocation implements MethodInvocation {
    private final Object target;
    private final Method method;
    private final Object[] arguments;
    private final List<MethodInterceptor> interceptors;
    private int index;

    @Override
    public Object proceed() throws Throwable {
        if (index < interceptors.size()) {
            return interceptors.get(index++).invoke(this);
        }
        try {
            method.setAccessible(true);
            return method.invoke(target, arguments);
        } catch (InvocationTargetException exception) {
            throw exception.getTargetException();
        }
    }
}
```

### Chapter 13. 최소 AOP 인프라

AOP를 추상 문구로만 이해하면 실무에서 거의 도움이 되지 않는다. 공통 관심사 분리는 결국 구체적인 계약과 호출 순서로 구현되어야 한다. `MethodInterceptor`는 그 계약의 최소 형태다. 각 인터셉터는 `MethodInvocation`을 받아 전후 처리를 하거나, 호출을 조건부로 우회하거나, 반환값을 바꿀 수 있다.

이 책의 현재 구현은 `Advisor`라는 이름의 완전한 추상화 대신, `@Order` 기반 인터셉터 체인과 프록시 합성으로 같은 문제를 더 얇게 풀었다. 이미 프록시된 빈에 다른 인터셉터를 다시 합성할 수 있고, `@Order`를 통해 실행 순서를 예측 가능하게 만들었다. 즉, 트랜잭션 인터셉터와 AOP advice가 한 체인 안에서 함께 정렬된다. 이것이 바로 실제 Spring AOP가 더 많은 추상화와 규칙으로 확장되는 출발점이다.

이 구조가 중요한 이유는 공통 관심사가 서로 독립적으로 추가되더라도 하나의 호출 체인 안에서 협력할 수 있기 때문이다. 예를 들어 성능 측정 인터셉터, 보안 검사 인터셉터, 트랜잭션 인터셉터가 있다고 해 보자. 각각은 자신의 책임만 알면 되지만, 실제 실행 시에는 누가 먼저 들어가고 누가 나중에 빠질지를 프레임워크가 조정해야 한다. 인터셉터 체인과 정렬 규칙이 없으면 이런 조합은 금방 예측 불가능해진다.

이 지점에서 가장 중요한 학습 포인트는 "AOP는 결국 함수 합성의 객체지향 버전"이라는 사실이다. 인터셉터 체인은 목표 메서드를 중심에 두고, 그 바깥에 전처리와 후처리를 층층이 두는 구조다. 로깅, 성능 측정, 보안 검사, 트랜잭션 경계, 재시도 정책 모두 같은 틀 안에서 설명된다. 각각이 서로 다른 기능처럼 보이더라도, 호출 경계를 감싼다는 구조만 놓고 보면 완전히 동일한 문제다.

`spring-lite-aop` 코드를 읽을 때는 체인의 조립 시점과 실행 시점을 구분해서 봐야 한다. 조립 시점에는 어떤 빈에 어떤 인터셉터를 붙일지 결정한다. 실행 시점에는 이미 만들어진 체인을 따라 `proceed()`가 재귀적으로 호출된다. 이 둘을 구분하면, 왜 어떤 문제는 애플리케이션 시작 시점에 드러나고 어떤 문제는 실제 요청이 들어왔을 때만 드러나는지 이해하기 쉬워진다. 포인트컷 매칭 실패, 프록시 대상 선택 실패는 조립 시점 문제이고, 롤백 정책이나 before/after advice 순서는 실행 시점 문제다.

실무에서도 이 분리는 매우 유용하다. 로그가 찍히지 않거나 트랜잭션이 열리지 않으면 "인터셉터가 실행되지 않았다"는 결론만 내리면 부족하다. 먼저 프록시가 생성되었는지, 그 빈이 실제로 프록시를 통해 주입되었는지, 인터셉터 체인에 원하는 순서로 들어갔는지를 봐야 한다. 내부 구조를 모르면 현상만 보이지만, 구조를 알면 점검 순서가 생긴다.

Spring 공식 문서가 컨테이너 확장 지점을 별도 장으로 떼어 설명하는 것도 우연이 아니다. 후처리기는 스프링의 고급 기능이 "컨테이너 바깥의 마법"이 아니라 "컨테이너 안쪽의 합법적인 개입 지점"이라는 사실을 보여준다. `@Autowired`, `@Configuration` 처리, AOP 자동 프록시, 트랜잭션 프록시, 심지어 일부 테스트 지원까지도 결국 이 확장 지점을 전제로 한다. 따라서 후처리기를 이해하는 순간, 독자는 Spring을 더 이상 애너테이션의 묶음이 아니라 확장 가능한 런타임 플랫폼으로 보기 시작한다.

```mermaid
flowchart LR
    A["Client Call"] --> B["Proxy"]
    B --> C["Interceptor (@Order=-10)"]
    C --> D["Interceptor (@Order=10)"]
    D --> E["Transaction Interceptor"]
    E --> F["Target Method"]
```

```mermaid
sequenceDiagram
    participant Client as Client
    participant P as Proxy
    participant I1 as Interceptor 1
    participant I2 as Interceptor 2
    participant T as Target

    Client->>P: call()
    P->>I1: invoke()
    I1->>I2: proceed()
    I2->>T: proceed()
    T-->>I2: return
    I2-->>I1: return
    I1-->>P: return
    P-->>Client: return
```

build-along 방식으로는 이 장에서 먼저 수동 인터셉터 하나를 만드는 편이 좋다. 그래야 체인이 무엇을 감싸는지 감각이 생긴다.

이 짧은 예제에서 볼 포인트는 before/after라는 친숙한 표현 뒤에 사실상 `proceed()`를 중심으로 한 감싸기 구조가 숨어 있다는 점이다.

```java
MethodInterceptor logging = invocation -> {
    events.add("before");
    Object result = invocation.proceed();
    events.add("after");
    return result;
};
```

그 다음 정렬 가능한 체인을 위해 인터셉터 병합 코드를 붙인다.

이 코드는 구현량은 작지만 의미는 크다. 독립적으로 추가된 여러 공통 관심사를 하나의 실행 순서로 정렬하는 규칙이 여기서 결정되기 때문이다.

```java
private static List<MethodInterceptor> mergeInterceptors(List<MethodInterceptor> existing, List<MethodInterceptor> additional) {
    List<MethodInterceptor> merged = new ArrayList<>(existing.size() + additional.size());
    merged.addAll(existing);
    merged.addAll(additional);
    merged.sort(OrderUtils.comparator());
    return merged;
}
```

### Chapter 14. `@Aspect` 스타일 AOP

프록시와 인터셉터만 있으면 기능은 동작할 수 있지만, 사용성은 좋지 않다. 개발자는 매번 인터셉터 객체를 직접 등록하고 싶어하지 않는다. 대신 "이 클래스는 aspect이고, 이 메서드는 before advice이며, 저 메서드는 around advice다"처럼 선언하고 싶어한다. `@Aspect`, `@Before`, `@Around`, `@AfterReturning`은 그 선언 모델이다.

`spring-lite`의 `AspectBeanPostProcessor`는 이 선언을 읽어 내부적으로 순서가 있는 인터셉터를 만든다. 메서드명과 특정 애너테이션 기준의 최소 포인트컷 모델을 사용하지만, 핵심 구조는 충분히 드러난다. 선언형 AOP는 별도 마법이 아니라 "애너테이션을 읽어 인터셉터로 바꾸는 해석 계층"이다. 실제 Spring이 `@AspectJ`, 더 풍부한 포인트컷 표현식, advisor 추상화까지 발전한 이유도 같은 구조 위에서 더 많은 경우를 감당해야 했기 때문이다.

즉, 선언형 AOP는 실행 모델을 감추는 것이 아니라 실행 모델 위에 친숙한 표면 문법을 얹는 일이다. 개발자는 `@Before`나 `@Around`를 선언하지만, 프레임워크는 그것을 결국 `MethodInterceptor`와 유사한 실행 계약으로 바꿔야 한다. 이 번역 과정이 보이면 AOP는 더 이상 낯선 전용 마법이 아니라, 메타데이터 해석과 체인 조립의 조합으로 읽힌다.

이 장을 읽을 때는 선언 모델과 실행 모델을 계속 대응시켜 보는 것이 좋다. 예를 들어 `@Before`는 문법적으로는 간단한 애너테이션이지만, 런타임에서는 "타깃 메서드 호출 직전의 인터셉터"로 변환된다. `@Around`는 더 강력하다. 호출을 감쌀 뿐 아니라 `proceed()`를 언제 호출할지, 여러 번 호출할지, 아예 호출하지 않을지까지 결정할 수 있다. 다시 말해 선언형 문법은 친숙한 표면일 뿐이고, 실제 힘은 여전히 인터셉터 체인에 있다.

실제 Spring과 비교하면 `spring-lite`의 포인트컷 모델은 훨씬 제한적이다. 하지만 바로 그 단순함 덕분에 포인트컷의 본질이 잘 보인다. 포인트컷은 결국 "어떤 메서드 호출에 개입할 것인가"를 선택하는 규칙이다. 표현식이 복잡해질수록 강력해지지만, 동시에 추론 비용도 높아진다. 실무에서 포인트컷이 지나치게 넓거나 애매하면, 어느 호출이 advice 대상인지 추적하기가 매우 어려워진다. 축소판 구현으로 먼저 본질을 이해하면 실제 Spring의 풍부한 문법도 훨씬 덜 위협적으로 느껴진다.

책을 따라가며 이 장을 읽는 독자에게 권하고 싶은 연습은, 선언형 aspect 하나를 머릿속에서 명시적 인터셉터 클래스로 다시 풀어보는 일이다. 그 연습을 반복하면 AOP가 더 이상 별도 마법 체계가 아니라는 사실이 분명해진다. 결국은 컨테이너가 메타데이터를 읽고, 인터셉터를 만들고, 프록시 체인에 꽂아 넣는 구조일 뿐이다.

이 장을 실제로 구현한다면 다음 테스트부터 시작하는 편이 좋다.

이 테스트는 advice 문법을 검증하는 동시에, 선언형 메타데이터가 실제 실행 결과를 바꾼다는 점을 가장 작게 증명한다.

```java
@Test
void appliesBeforeAroundAndAfterReturningAdvice() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(AspectTestConfig.class);
    GreetingService service = context.getBean(GreetingService.class);

    assertThat(service.greet("spring")).isEqualTo("HELLO SPRING");
}
```

그리고 후처리기의 진입점은 가능한 한 빨리 본문에 보여주는 편이 좋다.

이 블록에서 독자가 봐야 하는 핵심은 의외로 단순하다. aspect 해석은 복잡해 보여도, 최종적으로는 "인터셉터가 없으면 원본 반환, 있으면 프록시 반환"이라는 후처리기 분기로 귀결된다.

```java
public class AspectBeanPostProcessor implements BeanPostProcessor {
    @Override
    public Object postProcessAfterInitialization(String beanName, Object bean) {
        List<MethodInterceptor> interceptors = resolveInterceptors(bean);
        if (interceptors.isEmpty()) {
            return bean;
        }
        return ProxyFactory.createProxy(bean, interceptors);
    }
}
```

```mermaid
flowchart TD
    A["@Aspect bean discovered"] --> B["inspect advice methods"]
    B --> C["build interceptor metadata"]
    C --> D["find matching target methods"]
    D --> E["sort by @Order"]
    E --> F["create proxy with interceptors"]
```

### Chapter 15. `@Transactional`

`@Transactional`은 Spring에서 가장 널리 쓰이는 애너테이션이지만, 가장 자주 오해되는 기능이기도 하다. 메서드 본문이 자동으로 바뀌는 것이 아니라, 프록시가 메서드 호출 경로를 감싸 트랜잭션 경계를 여는 방식으로 동작하기 때문이다. 후처리기는 트랜잭션 대상 빈을 찾아 프록시를 만들고, 인터셉터는 메서드 진입 시 `begin()`, 정상 종료 시 `commit()`, 예외 발생 시 롤백 정책에 따라 `rollback()` 또는 `commit()`을 수행한다.

이 구조를 이해하면 자기 호출(self-invocation) 문제가 왜 생기는지도 선명해진다. 같은 클래스 안에서 `this.someTransactionalMethod()`를 호출하면 프록시를 거치지 않는다. 트랜잭션이 기대대로 동작하지 않는 이유는 데이터베이스나 선언식 자체가 아니라, 호출 경로가 프록시를 우회했기 때문이다.

여기서 독자가 꼭 붙잡아야 할 질문은 "트랜잭션은 어디에 존재하는가"다. 메서드 선언에 존재하는 것처럼 보이지만, 실제로는 호출 경계와 실행 문맥에 존재한다. `@Transactional`은 그 문맥을 열어야 한다는 의도를 선언할 뿐이고, 진짜 일은 인터셉터와 트랜잭션 매니저가 한다. 이 구분을 이해하지 못하면, 선언만 붙이면 언제나 안전하다고 착각하기 쉽다. 하지만 프록시를 거치지 않는 내부 호출, 비동기 실행, 새로운 스레드 경계, 외부 리소스와의 조합에서는 언제나 세부 동작을 다시 확인해야 한다.

`spring-lite-tx`의 구현을 읽을 때는 세 가지 객체를 중심으로 보는 것이 좋다. 첫째, 메서드 메타데이터를 읽는 후처리기. 둘째, 실제 begin/commit/rollback을 수행하는 인터셉터. 셋째, 현재 스레드에 연결 상태를 보관하는 트랜잭션 매니저다. 실제 Spring의 `TransactionInterceptor`, `PlatformTransactionManager`, `TransactionSynchronizationManager`도 같은 관심사를 더 일반화한 구조라고 볼 수 있다. 이름은 달라져도 역할 분리는 놀랄 만큼 비슷하다.

실무 활용 관점에서도 이 장은 중요하다. 많은 장애가 SQL 문장 자체보다 트랜잭션 경계 설정에서 비롯된다. 읽기 전용 조회 서비스에 굳이 긴 쓰기 트랜잭션을 걸어 락 경합을 만들거나, 하나의 거대한 서비스 메서드에 너무 많은 작업을 몰아 넣어 롤백 범위를 불필요하게 키우는 일이 흔하다. 내부 구조를 이해하면 선언형 트랜잭션을 더 전략적으로 사용할 수 있다. 어디에 경계를 둘지, 어떤 예외에서 롤백할지, 분리 가능한 작업을 어디서 끊을지를 더 명확하게 판단하게 된다.

Spring 공식 트랜잭션 문서는 "애너테이션을 붙이면 된다"는 식으로 끝내지 않고, 선언형 트랜잭션이 실제로 AOP 프록시와 `TransactionInterceptor` 조합으로 성립한다는 점을 분명히 설명한다. 그 이유는 단순하다. 내부 원리를 모르면 self-invocation, 프록시 우회, 예외 타입별 롤백 규칙 같은 핵심 문제를 설명할 수 없기 때문이다. Spring 팀의 오래된 기술 블로그 역시 트랜잭션, 캐싱, Java configuration이 모두 프록시라는 동일한 기술 기반에 기대고 있음을 반복해서 강조해 왔다. 이 책이 `@Transactional`을 "편의 애너테이션"이 아니라 "호출 경계 재구성"으로 설명하는 이유도 정확히 같은 맥락이다.

이 장을 읽으며 독자는 선언형 트랜잭션의 장점과 한계를 동시에 잡아야 한다. 장점은 비즈니스 코드에서 기술 코드를 밀어내고 경계를 선언적으로 표현할 수 있다는 점이다. 한계는 그 선언이 결국 프록시 경유 호출에 의존한다는 점이다. 실무에서 Spring을 잘 활용하는 사람은 이 두 가지를 함께 기억한다. 편의만 보고 과신하지도 않고, 내부 구조를 안다고 해서 불필요하게 모든 것을 수동 트랜잭션으로 되돌리지도 않는다. 중요한 것은 어떤 경계에서는 선언형이 최적이고, 어떤 경계에서는 더 명시적인 제어가 낫다는 판단을 구조적으로 내릴 수 있는가다.

트랜잭션을 더 깊게 이해하려면 "무엇이 선언이고 무엇이 실행인가"를 구분해서 보아야 한다. `@Transactional`은 메서드 선언에 붙어 있지만, 그 자체로는 아무 일도 하지 않는다. 선언은 단지 메타데이터다. 실제 실행은 프록시가 호출을 가로채고, 인터셉터가 트랜잭션 매니저를 호출하며, 매니저가 현재 스레드의 연결 상태를 바꾸는 단계에서 일어난다. 이 구분이 명확해지면, 왜 같은 애너테이션이 붙어 있어도 호출 경로에 따라 결과가 달라질 수 있는지 자연스럽게 이해된다.

실무에서 선언형 트랜잭션이 흔히 오해되는 이유도 여기에 있다. 많은 개발자가 애너테이션을 "속성"으로 받아들이지만, 프레임워크는 그것을 "호출 경계에 적용할 정책"으로 읽는다. 따라서 경계가 달라지면 의미도 달라진다. 컨트롤러에서 서비스로 진입할 때는 잘 동작하던 트랜잭션이 같은 클래스 내부 메서드 호출에서는 사라지는 이유, 동기 호출에서는 안전하던 트랜잭션이 새 스레드나 비동기 작업으로 넘어가면 끊어지는 이유가 모두 이 경계 개념에서 나온다.

아래 그림은 책 전체에서 가장 자주 돌아가게 되는 트랜잭션 호출 흐름을 요약한다.

```mermaid
sequenceDiagram
    participant Caller as Caller
    participant Proxy as Transaction Proxy
    participant TI as TransactionInterceptor
    participant TM as TransactionManager
    participant Target as Target Service
    participant Repo as Repository
    participant DB as Database

    Caller->>Proxy: createOrder()
    Proxy->>TI: invoke()
    TI->>TM: begin()
    TI->>Target: proceed()
    Target->>Repo: save(...)
    Repo->>DB: execute SQL
    DB-->>Repo: result
    Repo-->>Target: saved entity
    Target-->>TI: return
    TI->>TM: commit() or rollback()
    TI-->>Caller: result or exception
```

이 도식의 핵심은 비즈니스 메서드가 트랜잭션을 직접 제어하지 않는다는 점이다. 타깃 서비스는 자신의 일만 하고, 경계 개시와 종료는 주변 인프라가 맡는다. 이것이 선언형 모델의 생산성이며, 동시에 호출 구조를 모르면 놓치기 쉬운 함정이기도 하다.

그림 15-1은 선언형 트랜잭션이 실제로는 프록시, 인터셉터, 트랜잭션 매니저의 협력 위에 서 있다는 점을 보여 준다.

![Transactional boundary](./figures/transaction-boundary.svg)

_그림 15-1. 프록시 기반 선언형 트랜잭션 경계와 호출 흐름_

특히 self-invocation 문제를 이해할 때는 그림 15-1에서 `Caller -> Proxy -> Interceptor`로 이어지는 앞단 경로가 왜 필수인지 다시 보는 편이 좋다. 이 경로가 끊기는 순간 선언형 트랜잭션도 함께 사라진다.

바로 아래 코드는 그 도식을 코드 수준으로 대응시킨다. 앞부분은 왜 이 빈이 프록시 대상인지 결정하고, 뒷부분은 실제 호출 경계에서 begin/commit/rollback을 수행한다.

```java
@Override
public Object postProcessAfterInitialization(String beanName, Object bean) {
    if (!requiresTransactionProxy(bean)) {
        return bean;
    }
    return ProxyFactory.createProxy(bean, List.of(transactionInterceptor(bean)));
}

@Override
public Object invoke(MethodInvocation invocation) throws Throwable {
    Method targetMethod = targetClass.getMethod(invocation.getMethod().getName(), invocation.getMethod().getParameterTypes());
    Transactional transactional = resolveTransactionalMetadata(targetClass, targetMethod);
    if (transactional == null) {
        return invocation.proceed();
    }
    transactionManager.begin();
    try {
        Object result = invocation.proceed();
        transactionManager.commit();
        return result;
    } catch (Throwable throwable) {
        if (shouldRollback(throwable, transactional)) {
            transactionManager.rollback();
        } else {
            transactionManager.commit();
        }
        throw throwable;
    }
}
```

build-along 책에서는 이 장의 첫 검증을 "트랜잭션 대상 빈이 실제로 프록시로 감싸지는가"로 두는 편이 좋다.

이 테스트는 데이터베이스 결과보다 더 앞선 층을 검증한다. 선언형 트랜잭션의 전제가 프록시 생성이라는 사실을 먼저 잠그는 것이다.

```java
@Test
void wrapsTransactionalBeanWithProxy() {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(SampleConfig.class);

    SampleService sampleService = context.getBean(SampleService.class);

    assertThat(Proxy.isProxyClass(sampleService.getClass()) || sampleService.getClass().getName().contains("ByteBuddy")).isTrue();
}
```

```mermaid
sequenceDiagram
    participant Caller as Caller
    participant Proxy as Transaction Proxy
    participant Target as Service Target
    participant TM as TransactionManager

    Caller->>Proxy: invoke()
    Proxy->>TM: begin()
    Proxy->>Target: proceed()
    Target-->>Proxy: result / exception
    Proxy->>TM: commit() / rollback()
    Proxy-->>Caller: return / throw
```

여기서 더 나아가 `TransactionManager` 자체도 별도 구현 대상으로 끌어올리는 편이 좋다. 직접 구현하는 독자에게는 스레드 로컬 문맥이 핵심이라는 점을 코드로 보여줘야 하기 때문이다.

이 블록에서는 트랜잭션 매니저가 거대한 추상화처럼 보이더라도 실제 핵심은 현재 스레드 문맥을 어떻게 열고 중첩 깊이를 어떻게 관리하느냐에 있다는 점을 읽어야 한다.

```java
public class TransactionManager {
    private final DataSource dataSource;
    private final ThreadLocal<TransactionContext> transactionContext = new ThreadLocal<>();

    public void begin() {
        TransactionContext context = transactionContext.get();
        if (context != null) {
            context.incrementDepth();
            return;
        }
        if (dataSource == null) {
            transactionContext.set(new TransactionContext(null));
            return;
        }
        try {
            Connection connection = dataSource.getConnection();
            connection.setAutoCommit(false);
            transactionContext.set(new TransactionContext(connection));
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to begin transaction", exception);
        }
    }
}
```

### Chapter 16. 전파와 롤백 정책

트랜잭션은 단순히 "열고 닫는다" 수준이 아니다. 서비스 메서드가 서로를 호출할 때 기존 트랜잭션에 참여할지, 예외 종류에 따라 롤백할지 커밋할지, 중첩 호출에서 rollback-only 상태를 어떻게 전달할지가 모두 정책 문제다. `spring-lite`는 `REQUIRED`, `rollbackFor`, `noRollbackFor`, rollback-only 상태를 구현해 이 복잡성을 최소 모델로 보여준다.

이 장의 핵심은 선언형 트랜잭션이 정책 엔진이라는 사실이다. 테스트를 보면 이 사실이 훨씬 명확해진다. 같은 호출 흐름이라도 예외 타입에 따라 DB 상태가 달라지고, 기존 트랜잭션이 있으면 새로 열지 않고 깊이만 증가시킨다. 실제 Spring은 propagation, isolation, read-only, transaction synchronization 등 훨씬 더 많은 동작 규칙을 제공하지만, 기본 구조는 같다.

전파(propagation)는 특히 서비스 계층 설계와 강하게 연결된다. 서비스 A가 서비스 B를 호출했을 때, B가 독립된 업무 단위인지 아니면 A의 일부인지에 따라 원하는 트랜잭션 의미가 달라진다. `REQUIRED`는 "가능하면 기존 문맥에 합류하라"는 기본 정책이다. 이 기본값이 널리 쓰이는 이유는 서비스 메서드 여러 개가 하나의 논리적 작업을 함께 수행하는 경우가 많기 때문이다. 하지만 바로 그 편리함 때문에, 의도하지 않게 거대한 트랜잭션 문맥이 만들어지기도 한다. 따라서 전파 속성은 단순 옵션이 아니라 설계 표현식으로 이해해야 한다.

롤백 규칙 역시 예외 처리 설계와 맞물린다. 모든 예외를 무조건 롤백할 것인지, 비즈니스적으로 허용 가능한 예외는 커밋할 것인지 판단해야 한다. 예를 들어 알림 발송 실패가 주문 저장 자체를 취소해야 하는지, 아니면 주문은 저장하고 후속 재시도 대상으로 남겨야 하는지는 비즈니스 규칙이다. `rollbackFor`와 `noRollbackFor`는 프레임워크 차원의 문법이지만, 그 선택은 어디까지나 업무 의미를 반영해야 한다. 이 지점을 이해하지 못하면 선언형 트랜잭션은 편리한 도구가 아니라 의도를 숨기는 장치가 된다.

`spring-lite` 테스트를 책과 함께 읽으면 이 정책 엔진 성격이 잘 드러난다. 정상 흐름, 체크 예외, 런타임 예외, 중첩 호출, rollback-only 전파를 각각 별도 시나리오로 분리해 보면, 트랜잭션은 더 이상 추상 개념이 아니라 상태 전이 모델로 보인다. 이 감각을 익혀 두면 실제 Spring의 복잡한 전파 옵션 문서도 훨씬 읽기 쉬워진다.

전파 정책을 이해하는 가장 좋은 방법은 "현재 트랜잭션 문맥이 있느냐 없느냐"를 먼저 묻는 것이다. 문맥이 없으면 새로 열어야 하고, 문맥이 있으면 참여할지 새로 분리할지 정책이 결정해야 한다. `spring-lite`는 우선 `REQUIRED`만 구현하지만, 바로 그 단순한 정책만으로도 서비스 계층의 호출 구조가 트랜잭션 의미를 어떻게 바꾸는지 충분히 보여 준다.

```mermaid
flowchart TD
    A["method invocation"] --> B{"transaction exists?"}
    B -- no --> C["begin new transaction"]
    B -- yes --> D["join existing transaction (REQUIRED)"]
    C --> E["invoke target"]
    D --> E
    E --> F{"exception?"}
    F -- no --> G["commit or defer to outer tx"]
    F -- yes --> H{"rollback rule matches?"}
    H -- yes --> I["rollback / mark rollback-only"]
    H -- no --> J["commit despite exception"]
```

### Part 4 정리

이번 Part에서 독자는 다음 구조를 손으로 재현했다.

- 프록시 생성 전략 JDK / 클래스 기반 분기
- `MethodInvocation` 기반 호출 체인
- `@Order` 기반 인터셉터 정렬
- `@Aspect` 선언을 인터셉터로 해석하는 계층
- `@Transactional` 후처리기와 트랜잭션 인터셉터
- 스레드 로컬 기반 트랜잭션 문맥

디버깅 체크 질문:

- 이 객체는 실제 타깃인가 프록시인가
- 어떤 인터셉터가 어떤 순서로 체인에 들어갔는가
- self-invocation 때문에 프록시를 우회하지 않았는가
- rollback-only 상태가 어디서 마킹되었는가

실제 Spring에서 이어서 읽기 좋은 클래스:

- `org.springframework.aop.framework.ProxyFactory`
- `org.springframework.aop.framework.ReflectiveMethodInvocation`
- `org.springframework.transaction.interceptor.TransactionInterceptor`

독자 연습 과제:

1. 성능 측정 인터셉터를 추가하고 `@Order` 순서를 바꿔 결과를 비교해보라.
2. 체크 예외와 런타임 예외의 롤백 차이를 테스트로 추가해보라.
3. self-invocation 문제를 재현하는 예제를 직접 만들어보라.

---

## Part 5. Web MVC를 직접 구현한다

### Chapter 17. `DispatcherServlet`과 Front Controller 패턴

웹 프레임워크에서 하나의 중심 진입점을 두는 이유는 공통 문제를 일관된 파이프라인으로 다루기 위해서다. 인증, 예외 처리, 핸들러 선택, 인자 바인딩, 응답 생성은 요청마다 반복되는 문제다. 이를 각 컨트롤러가 직접 처리하게 하면 구조가 곧바로 흩어진다. 그래서 Spring MVC는 `DispatcherServlet`을 Front Controller로 둔다.

`spring-lite`도 같은 구조를 따른다. 모든 요청은 먼저 디스패처로 들어오고, 디스패처는 핸들러 매핑으로 컨트롤러 메서드를 찾고, 핸들러 어댑터로 메서드를 실행하고, 리턴값 핸들러로 응답을 작성한다. 예외는 별도 resolver가 처리한다. 이 구조 덕분에 컨트롤러 메서드는 전체 요청 흐름의 한 가운데 있는 도메인 처리 지점으로만 남을 수 있다.

이 구조의 강점은 단순 재사용을 넘어서 관찰 가능성까지 제공한다는 점이다. 요청이 어디서 선택되고, 어디서 바인딩되고, 어디서 실패하고, 어디서 응답으로 바뀌는지 경계가 분명하다. 따라서 로깅, 인증, 공통 헤더 처리, 예외 표준화 같은 기능도 디스패처 주변의 일정한 지점에 배치할 수 있다. 컨트롤러가 직접 모든 것을 처리하는 구조였다면, 이런 공통 정책은 애플리케이션 전체에 흩어졌을 것이다.

실제 Spring MVC와 비교해 보면 `DispatcherServlet`은 수많은 전략 인터페이스를 조합하는 거대한 허브다. `spring-lite-web`은 이 허브를 작게 축소했지만, 핵심 아이디어는 그대로 유지한다. 요청을 곧바로 메서드에 연결하지 않고, 중간 전략 계층을 두어 확장 가능한 파이프라인으로 만든다. 이 설계 덕분에 새로운 인자 해석기, 새로운 반환값 처리기, 새로운 예외 해석기를 비교적 독립적으로 추가할 수 있다.

디버깅 관점에서도 Front Controller 패턴은 강력하다. 404가 났다면 핸들러 매핑을 의심하고, 400이 났다면 바인딩과 검증 계층을 먼저 보고, 500이 났다면 컨트롤러 본문이나 예외 처리 정책을 본다. 구조를 이해한 개발자는 문제가 생겼을 때 코드를 무작정 뒤지지 않는다. 먼저 어느 계층의 책임인지부터 좁혀 들어간다.

이 장에서 독자가 특히 얻어야 할 감각은 "웹 프레임워크도 컨테이너처럼 단계적 해석기"라는 사실이다. 요청 URL 하나가 컨트롤러 메서드로 곧바로 점프하는 것이 아니라, 여러 전략 객체가 차례로 책임을 나누어 가진다. 따라서 웹 계층을 설계하거나 디버깅할 때도 한 번에 모든 것을 보려 하지 말고, 핸들러 선택, 인자 구성, 메서드 실행, 반환값 처리, 예외 변환이라는 연쇄를 따라가는 편이 정확하다. 이것은 MVC를 단순 라우터로 오해하지 않게 해 주는 중요한 시야다.

Spring MVC 공식 문서가 `DispatcherServlet`을 가장 먼저 설명하는 이유도 똑같다. Spring MVC의 핵심은 컨트롤러 애너테이션 자체가 아니라, 중앙 서블릿이 공통 알고리즘을 소유하고 실제 작업을 여러 위임 컴포넌트에 분배한다는 구조다. 즉, `DispatcherServlet`은 단순 진입점이 아니라 "알고리즘은 공통으로 유지하고, 세부 전략은 바꿀 수 있게 한다"는 프레임워크 설계 원칙의 구현체다. `spring-lite-web`의 `HandlerMapping`, `HandlerAdapter`, argument resolver, return value handler 분해는 이 원칙을 가능한 한 작게 재현한 것이다.

이 장은 독자가 MVC를 단순 라우터로 오해하는 습관을 끊어 주는 장이기도 하다. URL 하나가 컨트롤러 메서드 하나로 매핑된다는 표면만 보면 웹 프레임워크는 매우 단순해 보인다. 하지만 실제로는 "어떤 핸들러를 선택할지", "인자를 어떻게 구성할지", "본문과 쿼리 파라미터를 어떤 타입으로 변환할지", "예외를 어떤 응답으로 바꿀지"라는 여러 작은 판단이 연쇄적으로 쌓여 있다. `DispatcherServlet`은 이 연쇄를 소유하는 알고리즘 허브다.

아래 흐름도를 보면 디스패처가 왜 Spring MVC의 중심인지 더 선명해진다.

```mermaid
flowchart LR
    A["HTTP Request"] --> B["DispatcherServlet"]
    B --> C["HandlerMapping"]
    C --> D["HandlerMethod"]
    D --> E["HandlerAdapter"]
    E --> F["Argument Resolvers"]
    F --> G["Controller Method"]
    G --> H["Return Value Handler"]
    H --> I["HTTP Response"]
    E --> J["Exception Resolver"]
    J --> I
```

이 구조를 머릿속에 두면 404, 400, 500의 의미도 더 정확해진다. 404는 대개 `HandlerMapping` 이전 또는 그 내부에서 핸들러를 찾지 못한 결과이고, 400은 인자 해석이나 검증 단계에서의 실패이며, 500은 컨트롤러 본문이나 예외 처리 정책에서 제어되지 않은 실패일 가능성이 높다. 즉, HTTP 상태 코드는 단순 숫자가 아니라 파이프라인 어느 계층에서 실패했는지 알려 주는 구조적 신호다.

그림 17-1은 `DispatcherServlet`이 단순 라우터가 아니라 다단계 파이프라인 허브라는 사실을 압축해서 보여 준다.

![Dispatcher pipeline](./figures/dispatcher-pipeline.svg)

_그림 17-1. 핸들러 선택, 인자 바인딩, 실행, 응답 렌더링으로 이어지는 MVC 파이프라인_

이후 Chapter 18에서 인자 해석기를, Chapter 19에서 예외 처리기를 읽을 때는 그림 17-1의 어느 단계에 해당하는지 계속 매칭해 보자. 그러면 웹 모듈의 각 클래스가 파이프라인의 어느 빈칸을 채우는지 더 빨리 보인다.

```java
public DispatcherServlet(ApplicationContext applicationContext, JsonMapper jsonMapper) {
    TypeConverter typeConverter = new TypeConverter();
    Validator validator = new SimpleValidator();
    this.handlerMapping = new RequestMappingHandlerMapping(applicationContext);
    this.handlerAdapter = new RequestMappingHandlerAdapter(
        List.of(
            new PathVariableArgumentResolver(typeConverter),
            new RequestParamArgumentResolver(typeConverter),
            new RequestBodyArgumentResolver(jsonMapper, typeConverter),
            new HttpExchangeArgumentResolver()
        ),
        validator
    );
    this.returnValueHandler = new JsonReturnValueHandler(jsonMapper);
    this.exceptionResolver = new DefaultExceptionResolver(applicationContext);
}
```

```mermaid
flowchart LR
    A["HTTP Request"] --> B["DispatcherServlet"]
    B --> C["HandlerMapping"]
    C --> D["HandlerAdapter"]
    D --> E["ArgumentResolvers"]
    E --> F["Controller Method"]
    F --> G["ReturnValueHandler"]
    B --> H["ExceptionResolver"]
    G --> I["HTTP Response"]
    H --> I
```

직접 구현하기 관점에서는 이 장 역시 테스트부터 여는 편이 좋다. 가장 먼저 고정할 테스트는 "요청이 실제 컨트롤러 메서드까지 디스패치되는가"다.

```java
@Test
void dispatchesRequestToControllerMethod() throws Exception {
    DispatcherServlet dispatcherServlet = new DispatcherServlet(context, new JsonMapper());
    StubHttpExchange exchange = StubHttpExchange.get("/greetings/world");

    dispatcherServlet.handle(exchange);

    assertThat(exchange.responseBody()).contains("world");
}
```

그리고 `DispatcherServlet`의 `handle()` 전체는 본문 안에 직접 실어 두는 편이 좋다. 이 메서드 하나가 핸들러 선택, 실행, 응답 렌더링, 예외 변환이라는 웹 모듈의 전체 알고리즘을 가장 압축해서 보여주기 때문이다.

```java
@Override
public void handle(HttpExchange exchange) throws IOException {
    HandlerMethodMatch handlerMethodMatch = null;
    try {
        handlerMethodMatch = handlerMapping.getHandler(exchange);
        if (handlerMethodMatch == null) {
            returnValueHandler.handleReturnValue(Map.of("error", "Not Found"), exchange, 404);
            return;
        }
        Object result = handlerAdapter.handle(handlerMethodMatch, exchange);
        returnValueHandler.handleReturnValue(result, exchange, 200);
    } catch (Exception exception) {
        ExceptionHandlingResult resolved = exceptionResolver.resolve(exception, handlerMethodMatch);
        returnValueHandler.handleReturnValue(resolved.body(), exchange, resolved.statusCode());
    } finally {
        exchange.close();
    }
}
```

### Chapter 18. 요청을 메서드 인자로 바꾸기

HTTP 요청을 자바 메서드 호출로 바꾸는 과정은 생각보다 많은 단계를 포함한다. 경로에서 path variable을 뽑아야 하고, 쿼리 파라미터를 읽어야 하며, JSON 본문을 역직렬화해야 하고, 최종적으로 메서드 파라미터 타입에 맞게 변환해야 한다. `spring-lite`는 `PathVariableArgumentResolver`, `RequestParamArgumentResolver`, `RequestBodyArgumentResolver`, `HttpExchangeArgumentResolver`를 통해 이 흐름을 분리한다.

여기서 공통 `ConversionService`가 등장한다. 웹 바인딩과 `@Value` 주입이 서로 다른 변환 규칙을 사용하면 설명도, 동작도 흔들린다. 그래서 숫자, 불리언, enum 변환을 동일한 서비스로 끌어올리면 프레임워크 설명이 훨씬 단단해진다. 실제 Spring도 결국 변환과 바인딩을 웹 밖의 더 일반적인 인프라로 연결한다.

인자 바인딩은 자칫 사소한 편의 기능처럼 보일 수 있지만, 실제로는 사용자 입력을 애플리케이션 내부 타입 체계로 진입시키는 첫 관문이다. 따라서 이 계층은 엄격해야 한다. 값이 없을 때 어떤 예외를 낼지, 빈 문자열을 어떻게 해석할지, enum 대소문자를 허용할지, 숫자 변환 실패를 어떤 HTTP 상태 코드로 바꿀지를 명확히 정해야 한다. 이런 규칙이 애매하면 컨트롤러 본문이 방어 코드로 오염되고, 프레임워크가 제공해야 할 일관성이 깨진다.

`spring-lite-web` 구현을 읽을 때는 각 argument resolver가 "무엇을 읽는가"뿐 아니라 "무엇을 읽지 않는가"도 함께 보아야 한다. `PathVariableArgumentResolver`는 경로 변수만 책임지고, `RequestParamArgumentResolver`는 쿼리 파라미터만 책임지며, 본문 역직렬화는 `RequestBodyArgumentResolver`가 맡는다. 책임을 이렇게 분리해야 예외 메시지도 선명해지고, 나중에 새 인자 모델을 추가하기도 쉽다. 실제 Spring MVC가 수많은 `HandlerMethodArgumentResolver` 구현을 가진 이유도 같은 맥락이다.

실무 감각으로 연결해 보면, 입력 해석 계층이 단단할수록 컨트롤러는 얇고 명확해진다. 반대로 바인딩이 부실하면 컨트롤러마다 null 체크, 문자열 파싱, 기본값 처리 로직이 퍼지기 시작한다. 그것은 곧 프레임워크 책임이 애플리케이션 코드로 새어 나왔다는 신호다.

이 원칙은 책 전체의 중요한 테마와도 연결된다. 좋은 프레임워크는 애플리케이션 코드에서 반복될 수밖에 없는 경계 처리 로직을 공통 인프라로 끌어올린다. 컨테이너가 객체 생성 책임을 끌어올렸다면, MVC는 입력 해석 책임을 끌어올린다. 이 시각으로 보면 `HandlerMethodArgumentResolver` 같은 전략 객체는 단지 구현 디테일이 아니라, 웹 경계의 반복 문제를 흡수하는 아키텍처 장치다.

인자 해석 계층을 따로 두면 프레임워크가 HTTP의 세부를 애플리케이션에 덜 새게 만들 수 있다는 장점도 생긴다. 컨트롤러 메서드는 `int quantity`, `CreateOrderRequest request`, `HttpExchange exchange`처럼 이미 해석된 입력을 받는다. 반대로 이 계층이 없다면 URL 디코딩, JSON 파싱, 숫자 변환, 누락 값 처리 같은 저수준 작업이 컨트롤러로 흘러 들어온다. 결국 resolver는 단순 편의 기능이 아니라, 웹 프로토콜과 애플리케이션 타입 시스템 사이의 완충 장치다.

아래 코드는 request parameter 해석기의 최소 형태다. 여기서 볼 포인트는 query string 파싱 자체보다, HTTP 입력을 자바 타입으로 끌어올리는 책임이 컨트롤러 밖에 있다는 사실이다.

```java
@Override
public Object resolveArgument(Parameter parameter, HandlerMethodMatch handlerMethodMatch, HttpExchange exchange) {
    String name = parameter.getAnnotation(RequestParam.class).value();
    String value = parseQuery(exchange.getRequestURI().getRawQuery()).get(name);
    return typeConverter.convert(value, parameter.getType());
}

private Map<String, String> parseQuery(String rawQuery) {
    Map<String, String> result = new LinkedHashMap<>();
    for (String pair : rawQuery.split("&")) {
        String[] parts = pair.split("=", 2);
        String key = URLDecoder.decode(parts[0], StandardCharsets.UTF_8);
        String value = parts.length > 1 ? URLDecoder.decode(parts[1], StandardCharsets.UTF_8) : "";
        result.put(key, value);
    }
    return result;
}
```

직접 구현하는 독자라면 이 장에서도 작은 테스트 세트를 먼저 통과시키는 편이 좋다. 예를 들어 `@RequestParam`, `@PathVariable`, `@RequestBody`를 각각 하나씩 검증하면 인자 해석기가 독립된 전략 객체라는 사실을 자연스럽게 이해하게 된다.

이 테스트는 `RequestParamArgumentResolver` 하나만 검증하지만, 실제로는 "각 인자 모델마다 별도 전략이 존재한다"는 더 큰 설계를 함께 고정한다.

```java
@Test
void resolvesRequestParamIntoTypedArgument() {
    RequestParamArgumentResolver resolver = new RequestParamArgumentResolver(new TypeConverter());
    HttpExchange exchange = TestHttpExchange.get("/orders?quantity=3");
    Parameter parameter = SampleController.class.getDeclaredMethod("find", int.class).getParameters()[0];

    Object resolved = resolver.resolveArgument(parameter, null, exchange);

    assertThat(resolved).isEqualTo(3);
}
```

그리고 책 본문에서는 전략 인터페이스 자체도 함께 보여주는 편이 좋다. 그래야 독자가 "왜 resolver 구현이 여러 개로 나뉘는가"를 더 쉽게 납득한다.

```java
public interface HandlerMethodArgumentResolver {
    boolean supportsParameter(Parameter parameter);
    Object resolveArgument(Parameter parameter, HandlerMethodMatch handlerMethodMatch, HttpExchange exchange);
}
```

```mermaid
flowchart LR
    A["Parameter list"] --> B["supportsParameter?"]
    B --> C["PathVariableResolver"]
    B --> D["RequestParamResolver"]
    B --> E["RequestBodyResolver"]
    B --> F["HttpExchangeResolver"]
    C --> G["resolved argument values"]
    D --> G
    E --> G
    F --> G
    G --> H["invoke controller method"]
```

### Chapter 19. JSON, 응답 모델, 예외 처리

컨트롤러 메서드가 값을 반환해도 요청 처리는 끝나지 않는다. 값을 JSON으로 직렬화해야 할 수도 있고, 상태 코드와 헤더를 함께 제어해야 할 수도 있으며, 예외가 발생했다면 이를 HTTP 응답으로 바꿔야 할 수도 있다. `JsonMapper`, `ResponseEntity`, `JsonReturnValueHandler`, `DefaultExceptionResolver`는 이 후반부 파이프라인을 담당한다.

예외 처리에서도 계층 구조가 중요하다. 컨트롤러 내부의 `@ExceptionHandler`는 해당 컨트롤러 범위에서 로컬 정책을 제공한다. 여기에 `@ControllerAdvice`를 추가하면 여러 컨트롤러에 공통된 에러 정책을 적용할 수 있다. 실제 Spring MVC를 설명할 때 빠지기 쉬운 부분이 바로 이 계층 차이다. 로컬 예외 처리와 전역 예외 처리의 우선순위, 그리고 예외가 응답 모델로 바뀌는 위치를 정확히 설명해야 한다.

응답 모델은 API 품질과도 직결된다. 같은 종류의 오류가 매번 다른 JSON 구조로 내려오면 클라이언트는 예외 처리 코드를 복잡하게 가져갈 수밖에 없다. 그래서 프레임워크 차원에서 오류 응답의 최소 일관성을 제공하는 것이 중요하다. `spring-lite`의 `DefaultExceptionResolver`는 매우 단순하지만, 검증 오류와 일반 서버 오류를 분리해 응답 형식을 어느 정도 안정화한다. 이 작은 차이만으로도 사용자 경험과 디버깅 경험이 눈에 띄게 개선된다.

실제 Spring MVC는 `HttpMessageConverter`, `ResponseEntityExceptionHandler`, `@RestControllerAdvice`, `ProblemDetail` 같은 더 풍부한 도구를 제공한다. 하지만 핵심은 동일하다. 값이나 예외를 HTTP 응답으로 번역하는 계층이 따로 있어야 하고, 그 규칙은 컨트롤러 본문에 흩어지지 않아야 한다. `spring-lite`의 간소한 설계를 이해하면, 실제 Spring의 풍부한 추상화도 결국 같은 책임을 더 일반적으로 푼 결과임을 알 수 있다.

이 장을 읽으며 독자는 "성공 응답"보다 "실패 응답" 설계가 종종 더 중요하다는 사실도 함께 배워야 한다. 실무 API는 항상 실패를 동반한다. 잘못된 입력, 제약 조건 위반, 비즈니스 충돌, 인프라 장애가 반드시 발생한다. 프레임워크를 설계하거나 활용하는 개발자라면, 실패를 예외적인 주변 현상이 아니라 응답 모델의 일부로 취급해야 한다.

실제 운영 환경에서는 이 차이가 클라이언트 경험과 장애 분석 품질을 크게 바꾼다. 오류 응답 형식이 일관되지 않으면 프런트엔드나 다른 서비스는 실패 케이스마다 별도 분기 처리를 추가해야 하고, 로그와 모니터링 시스템도 오류를 그룹화하기 어렵다. 반대로 예외가 구조화된 응답 모델로 변환되면, 애플리케이션 안팎에서 실패를 더 안정적으로 다룰 수 있다. 즉, 예외 처리 계층은 단순 마감 처리기가 아니라 시스템 간 계약을 정리하는 인터페이스다.

예외 처리 계층의 또 다른 가치는 "실패를 늦게 처리하되 한곳에서 처리한다"는 점이다. 컨트롤러나 서비스 안에서 예외를 즉시 HTTP 응답으로 바꾸기 시작하면, 도메인 로직과 전송 계층이 섞인다. 반면 예외를 한 번 던지고, 마지막에 resolver가 그것을 HTTP 의미로 번역하게 하면, 도메인 계층은 예외의 업무 의미만 표현하고 웹 계층은 그 의미를 응답 계약으로 정리할 수 있다. 이 분리는 코드를 더 깨끗하게 만들 뿐 아니라, 같은 예외를 다른 입구에서도 재사용하기 쉽게 만든다.

이 블록을 읽을 때는 세 단계로 나눠 보는 편이 좋다. 로컬 `@ExceptionHandler`를 먼저 찾는지, 전역 `@ControllerAdvice`로 넘어가는지, 끝내 아무 핸들러가 없으면 기본 오류 응답을 만드는지를 차례대로 보자.

```java
@Override
public ExceptionHandlingResult resolve(Exception exception, HandlerMethodMatch handlerMethodMatch) {
    if (handlerMethodMatch != null) {
        Method handler = findExceptionHandlerMethod(handlerMethodMatch.handlerMethod().bean().getClass(), exception);
        if (handler != null) {
            return invokeHandler(handlerMethodMatch.handlerMethod().bean(), handler, exception);
        }
    }
    for (Object adviceBean : applicationContext.getBeansWithAnnotation(ControllerAdvice.class).values()) {
        Method handler = findExceptionHandlerMethod(adviceBean.getClass(), exception);
        if (handler != null) {
            return invokeHandler(adviceBean, handler, exception);
        }
    }
    if (exception instanceof ValidationException validationException) {
        return new ExceptionHandlingResult(400, Map.of(
            "error", "Validation failed",
            "violations", toViolationPayload(validationException.violations())
        ));
    }
    return new ExceptionHandlingResult(500, Map.of("error", exception.getMessage()));
}
```

build-along 형식에서는 이 장에서 `JsonMapper`와 `DefaultExceptionResolver`를 함께 구현하는 편이 자연스럽다. 하나는 성공 결과를 직렬화하고, 다른 하나는 실패를 응답 모델로 바꾸기 때문이다. 독자는 이 두 클래스를 함께 구현하면서 "성공 경로와 실패 경로도 결국 같은 출력 파이프라인 위에서 정리된다"는 사실을 코드 수준에서 이해하게 된다.

```mermaid
flowchart TD
    A["controller return / exception"] --> B{"normal return?"}
    B -- yes --> C["ReturnValueHandler"]
    C --> D["JsonMapper / ResponseEntity"]
    D --> E["HTTP response"]
    B -- no --> F["ExceptionResolver"]
    F --> G["local @ExceptionHandler?"]
    G --> E
    F --> H["global @ControllerAdvice?"]
    H --> E
    F --> I["default error payload"]
    I --> E
```

### Chapter 20. 조건 매핑과 검증

실제 웹 프레임워크는 URL 경로만 보고 핸들러를 선택하지 않는다. `consumes`, `produces`, `headers`, `params` 같은 요청 조건을 함께 본다. 같은 경로라도 콘텐츠 타입이나 파라미터 값이 다르면 다른 의미가 될 수 있기 때문이다. 따라서 매핑은 단순 path lookup이 아니라 정책 평가에 가깝다.

검증도 같은 흐름 안에 있다. `@Valid`, `@NotNull`, `@Min`, `@Size`는 컨트롤러 본문 안에서 if문으로 검사하는 것이 아니라, 메서드 진입 직전에 수행되는 별도 계층이다. 검증 실패를 400 응답으로 바꾸는 것도 예외 처리와 매끄럽게 연결되어야 한다. 이 장에서 독자는 MVC가 단순 라우팅이 아니라 "입력 해석, 정책 평가, 오류 모델링"을 함께 다루는 구조라는 사실을 이해하게 된다.

조건 매핑은 생각보다 중요한 설계 도구다. 같은 URL이라도 `Content-Type`이나 특정 쿼리 파라미터 조합에 따라 완전히 다른 의미를 가질 수 있기 때문이다. 예를 들어 폼 제출과 JSON API를 같은 경로에 둘 수도 있고, 버전 파라미터나 커스텀 헤더에 따라 다른 핸들러를 연결할 수도 있다. 이런 분기 규칙이 명확하게 모델링되지 않으면, 컨트롤러 안쪽에서 if문으로 요청 의미를 다시 판별하는 일이 생긴다. 그 순간 매핑 계층이 제공해야 할 추상화가 무너진다.

검증은 더더욱 애플리케이션 경계에서 다뤄야 한다. 잘못된 입력이 도메인 서비스 안쪽까지 들어오게 두면, 서비스는 자신의 본래 책임 외에 방어적 프로그래밍까지 떠안게 된다. `spring-lite`의 검증 계층은 최소 기능만 제공하지만, 이 기본 방향은 실제 Spring과 완전히 같다. "입력은 경계에서 정리하고, 도메인 안쪽에는 더 정제된 데이터만 흘려보낸다"는 원칙이다.

독자가 실무에 바로 적용할 수 있는 포인트도 여기 있다. 검증 규칙이 컨트롤러마다 제각각이면 API 일관성이 무너진다. 반대로 프레임워크의 검증/예외 처리 파이프라인을 잘 활용하면, 입력 오류는 언제나 비슷한 방식으로 보고되고, 서비스 로직은 더 간결해진다. 프레임워크를 잘 쓴다는 것은 결국 이런 경계 책임을 제대로 위임하는 것이다.

조건 매핑과 검증을 함께 다루는 것이 중요한 이유도 여기에 있다. 하나는 "이 요청이 어떤 핸들러로 가야 하는가"를 정하고, 다른 하나는 "그 핸들러에 들어가기 전에 입력이 유효한가"를 정한다. 둘 다 컨트롤러 바깥에서 실행되어야 컨트롤러가 순수한 도메인 진입점으로 남을 수 있다. 요청을 받을 자격이 있는지와, 받은 입력이 유효한지는 서로 다른 질문이지만 둘 다 웹 경계의 책임이다.

| 단계 | 입력 | 책임 | 실패 시 결과 |
| --- | --- | --- | --- |
| 매핑 선택 | path, method, headers, params | 어떤 핸들러를 호출할지 결정 | 404 |
| 인자 바인딩 | query, path variable, body | 메서드 인자 구성 | 400 |
| 검증 | 바인딩된 인자 | 제약 조건 검사 | 400 |
| 예외 처리 | 실행 중 예외 | 로컬/전역 정책 적용 | 4xx/5xx |

직접 구현하는 독자에게는 여기서 `RequestMappingHandlerMapping.matchesConditions(...)`와 `RequestMappingHandlerAdapter`의 검증 호출 지점을 함께 보여주는 편이 좋다. 그래야 조건 매핑과 검증이 각각 어디서 일어나는지를 코드 경계로 정확히 기억할 수 있다.

첫 번째 코드는 "어떤 핸들러를 고를지"를 결정하고, 두 번째 코드는 "그 핸들러에 들어갈 자격이 있는 입력인지"를 결정한다. 둘의 책임이 다르다는 점을 코드로 분리해서 보는 것이 중요하다.

```java
private boolean matchesConditions(HandlerMethod handler, HttpExchange exchange) {
    return matchesConsumes(handler.consumes(), exchange)
        && matchesProduces(handler.produces(), exchange)
        && matchesHeaders(handler.headers(), exchange)
        && matchesParams(handler.params(), exchange);
}
```

```java
private void validateIfNecessary(Parameter parameter, Object argument) {
    if (!parameter.isAnnotationPresent(Valid.class) || argument == null) {
        return;
    }
    List<ConstraintViolation> violations = validator.validate(argument);
    if (!violations.isEmpty()) {
        throw new ValidationException(violations);
    }
}
```

이 두 코드를 함께 보면, 독자는 "핸들러를 고르는 규칙"과 "핸들러에 들어가기 전 입력을 정리하는 규칙"이 서로 다른 계층이라는 사실을 분명하게 기억하게 된다.

```mermaid
flowchart LR
    A["request path/method/headers/params"] --> B["mapping conditions"]
    B --> C{"matched handler?"}
    C -- no --> D["404"]
    C -- yes --> E["bind method arguments"]
    E --> F{"binding ok?"}
    F -- no --> G["400"]
    F -- yes --> H["validate @Valid arguments"]
    H --> I{"violations?"}
    I -- yes --> G
    I -- no --> J["invoke controller"]
```

### Part 5 정리

이번 Part에서 독자는 다음 웹 파이프라인을 직접 만들었다.

- `DispatcherServlet` 기반 Front Controller
- `HandlerMapping` / `HandlerAdapter` 분리
- `HandlerMethodArgumentResolver` 기반 인자 바인딩
- JSON 직렬화와 응답 모델
- 로컬 `@ExceptionHandler`와 전역 `@ControllerAdvice`
- 조건 매핑과 입력 검증

디버깅 체크 질문:

- 404는 매핑 문제인가, 조건 매핑 문제인가
- 400은 바인딩 실패인가, 검증 실패인가
- 500은 컨트롤러 본문 예외인가, 예외 처리기 구성 문제인가
- 요청 본문과 응답 직렬화는 어디서 변환되는가

실제 Spring에서 이어서 읽기 좋은 클래스:

- `org.springframework.web.servlet.DispatcherServlet`
- `org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter`
- `org.springframework.web.servlet.mvc.method.annotation.ExceptionHandlerExceptionResolver`

독자 연습 과제:

1. `PUT` 또는 `DELETE` 매핑을 추가해보라.
2. 공통 응답 헤더를 넣는 반환값 처리기를 직접 추가해보라.
3. `Content-Type`과 `Accept` 조건 충돌 테스트를 더 작성해보라.

---

## Part 6. JDBC, 예제 앱, Boot 계층으로 완성한다

### Chapter 21. `JdbcTemplate`

순수 JDBC는 강력하지만 반복이 많다. 커넥션 획득, statement 생성, 파라미터 바인딩, 예외 처리, 자원 정리 같은 주변 코드는 거의 항상 반복된다. `JdbcTemplate`은 이 반복 구조를 템플릿 패턴으로 추상화한다. 개발자는 SQL과 결과 매핑만 넘기고, 프레임워크는 나머지 흐름을 처리한다.

`RowMapper`가 중요한 이유는 프레임워크가 결과 집합의 이동은 책임지되, 그 결과를 도메인 객체로 해석하는 책임은 애플리케이션에 남기기 때문이다. 이렇게 불변 골격과 가변 전략을 나누는 방식은 Spring 전반에 반복되는 설계 패턴이다.

여기서 트랜잭션과의 연결도 중요하다. 같은 트랜잭션 문맥 안에서는 커넥션을 재사용해야 한다. `spring-lite`의 `TransactionManager`와 `SingleConnectionProxy`는 이 지점을 드러낸다. JDBC 추상화는 단순 편의 도구가 아니라, 트랜잭션 문맥을 데이터 접근 계층으로 전달하는 장치다.

JDBC 추상화의 가치를 제대로 이해하려면 "무엇을 숨기고 무엇을 남기는가"를 봐야 한다. `JdbcTemplate`은 커넥션 관리, statement 생성, 자원 반납, 공통 예외 래핑을 숨긴다. 하지만 SQL 자체와 결과 매핑 책임은 애플리케이션에 남긴다. 이 균형이 중요하다. 모든 것을 감추면 디버깅이 어려워지고, 너무 적게 감추면 반복 코드가 폭증한다. Spring JDBC가 오랫동안 유효했던 이유도 바로 이 절충점 덕분이다.

`spring-lite-jdbc`를 읽을 때는 정상 흐름보다 예외와 자원 정리 흐름을 더 주의 깊게 보는 편이 좋다. 데이터 접근 코드는 성공 시보다 실패 시에 더 많은 버그가 숨어 있기 때문이다. statement는 닫혔는지, 트랜잭션 참여 커넥션을 실수로 끊지 않는지, 예외 메시지는 SQL 문맥을 충분히 담는지 같은 부분이 중요하다. 이런 세부 구현을 직접 다뤄보면, 왜 프레임워크가 템플릿 추상화를 제공하는지 몸으로 이해하게 된다.

또한 이 장은 ORM과의 관계를 생각해보는 출발점이기도 하다. JPA나 MyBatis 같은 상위 추상화는 더 많은 편의를 제공하지만, 결국 그 아래에는 여전히 커넥션, SQL 실행, 트랜잭션 문맥이라는 현실이 있다. `JdbcTemplate` 수준을 이해해 두면 상위 추상화를 사용할 때도 병목과 실패 지점을 더 잘 예측할 수 있다.

이 점은 실무에서 매우 중요하다. 상위 추상화가 제공하는 생산성은 분명하지만, 장애가 발생하면 결국 더 아래 계층의 현실을 마주하게 된다. 커넥션이 언제 열리고 닫히는지, 같은 트랜잭션 안에서 어떤 리소스가 공유되는지, 예외가 어디서 래핑되는지를 모르면 문제를 정확히 좁히기 어렵다. `JdbcTemplate`을 직접 구현해 보는 경험은 추상화 아래의 바닥을 다시 확인하게 해 주며, 이는 어떤 데이터 접근 기술을 사용하더라도 오래 남는 자산이 된다.

템플릿 패턴의 교육적 가치도 여기서 드러난다. `JdbcTemplate`은 SQL을 대신 써 주지 않는다. 대신 SQL 실행을 둘러싼 불변 골격을 책임진다. 어떤 순서로 커넥션을 얻고, 파라미터를 바인딩하고, 실행 후 결과를 읽고, 예외를 공통 방식으로 감싸고, 자원을 정리할지를 프레임워크가 소유한다. 개발자는 그 골격 안에서 달라지는 부분만 공급한다. 이 분리는 Spring 전반에서 계속 반복되는 설계 철학이기도 하다.

아래 도식은 update 호출 하나가 실제로 어떤 골격을 통과하는지 요약한다.

```mermaid
flowchart TD
    A["JdbcTemplate.update(sql, args)"] --> B["obtainConnectionIfNeeded()"]
    B --> C{"tx currentConnection exists?"}
    C -- yes --> D["SingleConnectionProxy(current)"]
    C -- no --> E["dataSource.getConnection()"]
    D --> F["prepareStatement(sql)"]
    E --> F
    F --> G["bind(args)"]
    G --> H["executeUpdate()"]
    H --> I["wrap SQLException if needed"]
    I --> J["close statement / close connection if standalone"]
```

이 흐름에서 중요한 분기는 `currentConnection` 존재 여부다. 트랜잭션이 이미 열려 있다면 JDBC 계층은 새 커넥션을 열어서는 안 된다. 같은 논리 작업 안에서 다른 커넥션을 열어 버리면, 호출자는 하나의 트랜잭션이라고 생각하지만 실제 DB 입장에서는 서로 다른 문맥으로 실행될 수 있다. `SingleConnectionProxy`는 이 오해를 막기 위해 등장한다. 닫기 호출을 가로채면서도 현재 트랜잭션 커넥션을 계속 재사용하게 만드는 장치다.

그림 21-1은 `JdbcTemplate`이 SQL 자체보다 SQL 실행을 둘러싼 불변 골격을 책임진다는 점에 집중한다.

![JdbcTemplate skeleton](./figures/jdbc-template-skeleton.svg)

_그림 21-1. 트랜잭션 커넥션 참여를 포함한 `JdbcTemplate` 실행 골격_

이 그림은 Chapter 22의 예제 앱을 읽을 때도 다시 중요해진다. 주문 생성 요청이 저장소까지 내려가면 결국 어떤 커넥션을 쓰는지, 트랜잭션 문맥에 어떻게 참여하는지가 여기서 결정된다.

```java
public int update(String sql, Object... args) {
    try (
        Connection connection = obtainConnectionIfNeeded();
        PreparedStatement statement = connection.prepareStatement(sql)
    ) {
        bind(statement, args);
        int updated = statement.executeUpdate();
        if (transactionManager.currentConnection() != null) {
            statement.close();
        }
        return updated;
    } catch (SQLException exception) {
        throw new IllegalStateException("Failed to execute update: " + sql, exception);
    }
}

private Connection obtainConnectionIfNeeded() throws SQLException {
    Connection current = transactionManager.currentConnection();
    if (current != null) {
        return new SingleConnectionProxy(current);
    }
    return dataSource.getConnection();
}
```

build-along 방식에서는 이 장도 테스트부터 잠그는 편이 좋다. 특히 "현재 트랜잭션 커넥션을 재사용하는가"를 먼저 고정하면 `JdbcTemplate`이 단지 편의 API가 아니라 트랜잭션 문맥의 소비자라는 사실이 훨씬 선명해진다.

```java
@Test
void reusesCurrentTransactionConnection() {
    TestTransactionManager transactionManager = new TestTransactionManager(dataSource);
    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource, transactionManager);

    transactionManager.begin();
    jdbcTemplate.update("insert into accounts(name) values (?)", "spring");
    transactionManager.rollback();

    assertThat(transactionManager.wasRollbackCalled()).isTrue();
}
```

### Chapter 22. 예제 앱으로 연결하기

예제 앱은 책에서 매우 중요한 역할을 한다. 앞 장들의 구조가 각각 따로 이해되더라도, 하나의 비즈니스 시나리오 안에서 모두 연결되어 보이지 않으면 프레임워크가 완성된 느낌이 들지 않기 때문이다. 주문 생성 요청은 컨트롤러에서 시작해, 서비스로 전달되고, 트랜잭션 프록시를 거쳐, JDBC 저장소를 호출하고, 결과가 다시 JSON 응답으로 돌아온다.

이 흐름을 테스트로 함께 보면 설명은 더 강해진다. 검증 실패는 400으로 매핑되고, 저장소는 같은 트랜잭션 커넥션을 사용하며, 성공 시에는 seed 데이터 뒤에 새 주문이 추가된다. 예제 앱은 데모가 아니라 증거다. 프레임워크 설명이 실제 런타임에서 성립한다는 증거다.

특히 예제 앱은 각 모듈의 추상 개념을 하나의 서사로 엮어 준다. 컨테이너 장에서는 빈이 등록되고 생성되는 과정을 보았고, AOP 장에서는 프록시가 호출 경계에 끼어드는 방식을 보았으며, MVC 장에서는 요청이 메서드 호출로 번역되는 과정을 살폈다. 주문 생성 시나리오는 이 모든 것을 한 번에 통과한다. 따라서 예제 앱을 읽는 일은 단순 사용 예제를 보는 것이 아니라, 앞선 모든 장의 개념이 실제로 결합되는 방식을 확인하는 일이다.

이 장에서 독자에게 권하고 싶은 읽기 방법은 "한 요청을 끝까지 추적해보는 것"이다. HTTP POST `/orders`가 들어오면 어떤 매핑이 선택되는지, 요청 본문이 어떤 DTO로 바인딩되는지, 검증은 어디서 수행되는지, 서비스 빈이 왜 프록시인지, JDBC 저장 시 어떤 커넥션이 선택되는지, 응답 JSON은 어디서 만들어지는지를 차례대로 따라가 보자. 이 추적 경험이 쌓이면 실제 Spring 애플리케이션에서도 요청 흐름을 훨씬 덜 추상적으로 보게 된다.

실무에서도 작은 예제 앱은 단순 튜토리얼을 넘어 아키텍처 설명 도구가 될 수 있다. 신규 팀원 온보딩, 장애 재현, 프레임워크 업그레이드 검증에 모두 도움이 된다. 이 책에서 예제 앱을 유지하는 이유도 마찬가지다. 설명은 말로 끝나지 않고, 동작하는 사례로 닫혀야 한다.

예제 앱 장을 더 풍부하게 읽으려면, 각 계층을 "기능 구현"이 아니라 "앞 장의 구조가 실제로 만나는 접점"으로 보는 편이 좋다. 컨트롤러는 MVC 장의 산물이고, 서비스 프록시는 AOP/트랜잭션 장의 산물이며, 저장소는 JDBC 장의 산물이다. 예제 앱이 중요한 이유는 이 산물들이 하나의 요청 경로 안에서 충돌 없이 이어질 수 있음을 증명하기 때문이다. 설명만으로는 분리되어 있던 지식이, 주문 생성이라는 하나의 구체적 사건 안에서 비로소 런타임 이야기로 합쳐진다.

이 장이 책 전체에서 주는 교육적 효과는 매우 크다. 앞선 장들에서는 각 모듈을 "부분 문제의 해법"으로 배웠다. 하지만 독자는 종종 부분 해법을 배운 뒤에도 전체 그림을 머릿속에서 다시 조립하는 데 어려움을 겪는다. 예제 앱은 바로 그 마지막 조립을 대신 보여 준다. 요청 하나가 들어왔을 때 어떤 인프라가 어떤 순서로 개입하는지가 한 번의 서사로 합쳐지기 때문이다.

```mermaid
sequenceDiagram
    participant Client as Client
    participant DS as DispatcherServlet
    participant OC as OrderController
    participant SP as OrderService Proxy
    participant TX as TransactionInterceptor
    participant OS as OrderService Target
    participant OR as OrderRepository
    participant JT as JdbcTemplate
    participant DB as Database

    Client->>DS: POST /orders
    DS->>OC: createOrder(request)
    OC->>SP: createOrder(product, quantity)
    SP->>TX: invoke()
    TX->>OS: proceed()
    OS->>OR: save(...)
    OR->>JT: update/query
    JT->>DB: SQL
    DB-->>JT: rows
    JT-->>OR: persisted order
    OR-->>OS: Order
    OS-->>TX: return
    TX-->>OC: commit + result
    OC-->>DS: Order
    DS-->>Client: JSON response
```

이 코드 조각은 위 시퀀스 다이어그램에서 가장 중요한 접점만 남긴 것이다. 컨트롤러가 웹 경계 역할을 하고, 서비스가 트랜잭션 경계를 선언하며, 저장소가 실제 영속화 책임을 진다는 점에 집중해서 읽으면 된다.

```java
@RestController
@RequestMapping("/orders")
public class OrderController {
    private final OrderService orderService;

    @GetMapping
    public List<Order> listOrders() {
        return orderService.listOrders();
    }

    @PostMapping
    public Order createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request.product(), request.quantity());
    }
}

@Service
public class DefaultOrderService implements OrderService {
    @Override
    @Transactional
    public Order createOrder(String product, int quantity) {
        return orderRepository.save(product, quantity, defaultStatus);
    }
}
```

직접 구현하는 책에서는 이 장을 단순 사용 예제로 취급하면 안 된다. 컨트롤러, 서비스, 저장소를 모두 함께 싣고 "앞 장들의 결과가 여기서 한 번에 결합된다"는 점을 분명히 보여줘야 한다. 독자는 이 장에서 처음으로 컨테이너, 프록시, MVC, 트랜잭션, JDBC가 하나의 요청 흐름 안에서 모두 연결되는 것을 본다.

### Chapter 23. `SpringLiteApplication`

사용자는 컨테이너, 웹, JDBC, AOP를 하나씩 직접 조립하고 싶어하지 않는다. 보통은 `run()` 한 줄로 시작하고 싶어한다. 그래서 부트스트랩 계층이 필요하다. `SpringLiteApplication`은 설정 클래스 인식, 스캔 시작점 설정, 인프라 자동 등록, 웹 서버 시작을 하나의 진입점으로 묶는다.

여기서 프로파일 대응 프로퍼티 로딩이 등장하면 Boot 계층의 설명력이 크게 올라간다. `application.yml`과 `application-{profile}.yml`이 병합되고, `spring.profiles.active`가 실행 환경에 따라 다른 조립 결과를 만든다는 사실은 실제 Spring Boot의 핵심 개념과도 닿아 있다.

물론 실제 Spring Boot는 이보다 훨씬 더 크다. starter, 조건부 자동 설정, 방대한 환경 추상화, 내장 서버 생태계, 관측성, 운영 지원이 있다. 하지만 축소판이기 때문에 오히려 본질이 잘 보인다. 사용자가 한 줄로 애플리케이션을 시작한다는 사실 뒤에, 얼마나 많은 조립 논리가 숨어 있는지를 드러내는 것이 이 장의 목적이다.

이 장에서 독자가 특히 붙잡아야 할 질문은 "누가 무엇을 기본값으로 결정하는가"다. 컨테이너를 직접 만들던 단계에서는 사용자가 많은 것을 수동으로 등록했다. 하지만 Boot 계층으로 오면 프레임워크가 대신 결정을 내리기 시작한다. 어떤 인프라를 기본으로 켤지, 어떤 빈이 없을 때만 대체 빈을 넣을지, 어떤 프로퍼티 파일을 어떤 순서로 병합할지, 서버는 언제 띄울지를 모두 부트스트랩 계층이 정한다. 생산성은 이 자동 결정에서 나오지만, 동시에 혼란도 여기서 시작된다.

그래서 Boot 장은 편의 기능 소개가 아니라 "좋은 기본값의 구조"를 이해하는 장으로 읽어야 한다. 자동 설정은 마술이 아니라 조건 기반 조립 규칙이고, 프로파일은 환경에 따라 달라지는 입력값이며, `run()`은 그 규칙과 입력을 모아 한 번에 실행하는 진입점이다. 실제 Spring Boot가 방대한 이유도 결국 이 조립 규칙의 경우의 수가 매우 많기 때문이다.

```mermaid
flowchart TD
    A["SpringLiteApplication.run()"] --> B["create AnnotationConfigApplicationContext"]
    B --> C["load properties + active profiles"]
    C --> D["register application config"]
    D --> E["register boot infrastructure defaults"]
    E --> F["refresh context"]
    F --> G["discover DispatcherServlet / web beans"]
    G --> H["start embedded server"]
    H --> I["application ready"]
```

이 흐름도를 보면 Boot가 별도 마법 계층이 아니라, 기존에 만든 컨테이너와 웹 인프라를 "언제, 어떤 순서로, 어떤 기본값으로 조립할지"를 책임지는 오케스트레이션 계층이라는 점이 선명해진다. 즉, Boot의 핵심은 새 기능을 만드는 것이 아니라 기존 기능들의 시작 순서를 표준화하는 데 있다.

부트스트랩 계층을 이해하는 일은 프레임워크의 사용성과 내부 복잡성이 어디서 만나는지 이해하는 일이기도 하다. 개발자는 `main()`에서 몇 줄만 쓰고 싶어 하지만, 그 몇 줄 뒤에는 설정 클래스 판별, 프로퍼티 병합, 인프라 빈 등록, 컨텍스트 refresh, 웹 서버 시작 같은 단계가 줄지어 있다. 좋은 부트스트랩 API는 이 복잡성을 감추되, 필요할 때는 각 단계를 다시 꺼내 볼 수 있게 해야 한다. `spring-lite-boot`는 바로 그 균형점을 작은 규모에서 보여준다.

또한 Boot 계층은 "기본값의 철학"을 가장 잘 드러내는 곳이기도 하다. 어떤 인프라를 자동으로 등록할지, 어떤 설정을 사용자가 명시하지 않아도 켤지, 충돌 시 무엇을 우선할지 모두 부트스트랩 설계의 일부다. 실제 Spring Boot가 생산성을 극적으로 끌어올린 이유는 단순히 기능이 많아서가 아니라, 좋은 기본값과 일관된 오버라이드 모델을 제공했기 때문이다. `spring-lite`의 런타임 프로퍼티 오버라이드와 프로파일 병합도 그 감각을 축소해 보여준다.

실무자는 이 장을 통해 자동 설정을 "마법" 대신 "미리 짜인 조립 규칙"으로 보는 눈을 얻을 수 있다. 그러면 자동 설정 충돌이 났을 때도 덜 당황한다. 어떤 조건이 맞아서 빈이 등록되었는지, 사용자가 제공한 설정이 어디에서 우선했는지, 어떤 기본 인프라가 함께 올라왔는지 질문할 수 있기 때문이다.

결국 Boot 계층의 진짜 가치는 기능 수보다 진입 비용 절감에 있다. 수십 개의 인프라 빈과 정책을 매번 손으로 조립하지 않고도 일관된 애플리케이션 시작점을 얻을 수 있다는 점이 중요하다. 하지만 그 편의가 안전하려면, 자동으로 조립된 구조를 필요할 때 해부할 수 있어야 한다. 이 장은 바로 그 균형을 보여준다. `run()` 한 줄은 단순화된 표면이고, 그 뒤에는 여전히 해석 가능한 단계들이 존재한다.

Spring Boot 공식 문서가 auto-configuration을 설명할 때 반복해서 강조하는 것도 바로 "non-invasive"라는 성격이다. Boot는 사용자가 아무것도 모르게 모든 것을 숨기기 위해 존재하는 것이 아니라, 클래스패스와 사용자 정의 빈, 조건 애너테이션을 바탕으로 기본 구성을 제공하되 필요하면 언제든 사용자가 교체할 수 있게 하기 위해 존재한다. `spring-lite-boot`의 `BootInfrastructureRegistrar`와 `@ConditionalOnMissingBean`, `@ConditionalOnClass`, `@ConditionalOnProperty` 모델은 이 철학을 축소판으로 드러낸다. 학습용 구현이므로 기능 폭은 좁지만, "자동 설정은 미리 짜인 조립 규칙의 집합"이라는 본질은 충분히 전달한다.

이 관점을 익혀 두면 실제 Spring Boot의 자동 설정도 훨씬 덜 불투명해진다. 어떤 starter가 추가되었는지, 어떤 조건이 만족되었는지, 사용자 빈이 왜 기본 설정을 밀어냈는지 같은 질문이 가능해지기 때문이다. 자동 설정은 복잡하지만, 질문의 형태는 단순하다. "이 기본값은 왜 지금 적용되었는가?" Boot 장은 독자가 그 질문을 할 수 있게 만드는 장이다.

그림 23-1은 `run()` 한 줄 뒤에 숨은 부트스트랩 오케스트레이션을 요약한다.

![Boot orchestration](./figures/boot-orchestration.svg)

_그림 23-1. 설정 입력 수집부터 웹 서버 시작까지 이어지는 Boot 조립 순서_

앞서 배운 컨테이너, AOP, MVC, JDBC가 어떻게 한 줄 진입점 뒤에 접히는지를 보고 싶다면 그림 23-1을 예제 앱 장과 함께 왕복해 읽는 것이 가장 효과적이다. Boot는 새로운 런타임을 만드는 것이 아니라, 이미 만든 조각들의 시작 순서를 표준화한다.

아래 `run()` 코드는 Boot 장 전체의 축약판이라고 생각하면 좋다. 설정 입력을 모으고, 기본 인프라를 등록하고, 컨텍스트를 띄우고, 마지막에 웹 서버를 시작하는 순서가 한 메서드에 모여 있다.

```java
public static AnnotationConfigApplicationContext run(Class<?> applicationClass, String... args) {
    AnnotationConfigApplicationContext context = PropertyResolver.withOverrides(parseCommandLineArgs(args), () -> {
        AnnotationConfigApplicationContext createdContext = new AnnotationConfigApplicationContext();
        createdContext.register(applicationClass);
        createdContext.registerSingleton(
            "commandLineApplicationProperties",
            ApplicationProperties.from(PropertyResolver.loadApplicationProperties())
        );
        BootInfrastructureRegistrar.registerDefaults(createdContext);
        createdContext.refresh();
        return createdContext;
    });
    context.getBean(WebServer.class).start();
    return context;
}
```

그리고 바로 이어서 기본 자동 설정 등록 코드도 함께 보여주는 편이 좋다. 이 두 코드가 나란히 있어야 독자가 Boot를 거대한 별도 세계가 아니라 "기존 모듈을 한 줄 시작점으로 묶는 조립 계층"으로 이해하기 쉽다.

이 블록에서 볼 포인트는 auto-configuration이 추상 개념이 아니라 구체적인 설정 클래스 등록이라는 점이다. 복잡한 조건 모델도 결국은 "무엇을 기본으로 등록할 것인가"라는 질문에서 출발한다.

```java
public final class BootInfrastructureRegistrar {
    public static void registerDefaults(AnnotationConfigApplicationContext context) {
        context.register(
            JsonAutoConfiguration.class,
            AopAutoConfiguration.class,
            TransactionAutoConfiguration.class,
            JdbcAutoConfiguration.class,
            WebAutoConfiguration.class
        );
    }
}
```

```mermaid
flowchart TB
    A["SpringLiteApplication.run()"] --> B["Load application.yml / profiles"]
    B --> C["Register configuration classes"]
    C --> D["Apply auto-configurations"]
    D --> E["Refresh ApplicationContext"]
    E --> F["Create DispatcherServlet"]
    F --> G["Start JDK Web Server"]
    G --> H["Serve Requests"]
```

### Chapter 24. 테스트 지원과 검증 전략

프레임워크는 테스트 없이는 설명되기 어렵다. 애플리케이션 테스트가 기능을 검증한다면, 프레임워크 테스트는 계약과 경계를 검증한다. 컨테이너가 언제 실패해야 하는지, 프록시가 어떤 순서로 동작해야 하는지, MVC가 어떤 요청을 어떤 응답으로 바꿔야 하는지, 트랜잭션이 언제 rollback해야 하는지를 테스트가 문서처럼 보여준다.

`@SpringLiteTest`와 `MockMvc`는 이 테스트 문서화를 돕는 최소 도구다. 여기에 트랜잭션 테스트 지원까지 들어가면, 테스트 메서드가 트랜잭션 안에서 실행되고 종료 후 롤백된다는 Spring Test의 중요한 감각도 전달할 수 있다. 이 장을 통해 독자는 "테스트 지원도 프레임워크의 일부"라는 사실을 받아들이게 된다. 실제 Spring 생태계가 TestContext, MockMvc, 트랜잭션 테스트 지원을 오랫동안 중요한 축으로 유지해 온 이유도 바로 여기에 있다.

테스트 지원이 중요한 또 다른 이유는 프레임워크가 스스로를 증명하는 방식이기 때문이다. 애플리케이션은 프레임워크를 믿고 사용하지만, 프레임워크는 자신의 계약을 테스트로 계속 입증해야 한다. `spring-lite`에서 컨테이너, AOP, MVC, JDBC, 트랜잭션에 걸쳐 다양한 분기 케이스를 촘촘히 검증하는 이유가 여기에 있다. 정상 경로뿐 아니라 중복 빈, 순환 참조, 검증 실패, 예외 핸들러 우선순위, rollback-only 전파 같은 불편한 경우까지 테스트해야 비로소 구조가 단단해진다.

독자가 실무에서 얻을 수 있는 교훈도 분명하다. 테스트를 비즈니스 기능에만 집중하면 프레임워크 사용 계약이 깨질 때 늦게 발견하게 된다. 예를 들어 컨트롤러 테스트가 없다면 입력 바인딩 규칙이 바뀐 사실을 놓칠 수 있고, 트랜잭션 테스트가 없다면 롤백 경계가 흐트러진 사실을 늦게 알 수 있다. 결국 좋은 테스트는 구현을 보호할 뿐 아니라, 팀이 의존하는 프레임워크 규칙을 문서화한다.

이 책을 따라가는 독자라면 원고의 설명과 테스트 코드를 함께 읽는 습관을 들이는 것이 좋다. 설명은 의도를 말하고, 테스트는 그 의도가 실제로 어떤 형태로 고정되는지 보여준다. 특히 프레임워크 학습에서는 이 둘이 분리되면 이해가 반쪽이 되기 쉽다.

더 나아가 테스트는 프레임워크 설계의 윤리와도 연결된다. 프레임워크는 많은 개발자의 코드 아래에 깔리는 기반이므로, 사소해 보이는 회귀도 광범위한 영향을 낳는다. 그래서 분기 케이스와 실패 케이스를 세밀하게 잠그는 일이 중요하다. `spring-lite-test`를 별도 모듈로 둔 이유도 단순 편의가 아니다. 프레임워크를 배우는 사람에게 "좋은 프레임워크는 스스로를 검증하는 도구까지 제공한다"는 사실을 보여주기 위한 설계다.

대표적인 Spring 입문서와 실무서들이 공통으로 강조하는 부분도 테스트다. 프레임워크를 이해하는 가장 빠른 길 중 하나는 "이 기능이 언제 실패해야 하는가"를 테스트로 고정해 보는 것이기 때문이다. 김영한의 강의 시리즈가 핵심 원리를 설명할 때도 테스트를 통해 DI, 빈 조회, MVC 흐름을 검증하는 리듬을 반복하고, *Spring Start Here* 역시 개념 설명과 단위 통합 테스트를 촘촘히 왕복한다. 이 책이 테스트 장을 뒤쪽의 부록이 아니라 핵심 본문에 포함시키는 이유는, 테스트가 프레임워크 사용법 검증을 넘어 프레임워크 원리 이해 자체를 돕기 때문이다.

테스트 확장은 그 자체로도 일종의 부트스트랩 계층이다. 테스트 클래스가 시작되기 전에 컨텍스트를 만들고, 테스트 인스턴스에 의존성을 주입하고, 각 테스트 메서드 전후에 트랜잭션을 열고 닫는 과정은 작은 실행 프레임워크와 다르지 않다. 따라서 `SpringLiteTestExtension`을 읽는 일은 단순 편의 기능을 보는 것이 아니라, "프레임워크가 다른 프레임워크를 어떻게 지원하는가"를 보는 일이기도 하다.

그림 24-1은 테스트 지원 자체도 별도의 실행 프레임워크라는 점을 강조한다.

![Test extension lifecycle](./figures/test-extension-lifecycle.svg)

_그림 24-1. 컨텍스트 재사용, 테스트 주입, 트랜잭션 롤백을 포함한 테스트 확장 라이프사이클_

그림 24-1을 기준으로 보면 테스트 지원도 결국은 또 하나의 오케스트레이션 계층이라는 점이 분명해진다. Boot가 애플리케이션 시작을 감쌌다면, 테스트 확장은 테스트 실행을 감싼다.

아래 코드는 테스트 지원 장에서 가장 중요한 실행 경계를 보여 준다. 테스트 메서드 전에는 트랜잭션을 열고, 후에는 항상 롤백한다는 계약이 어디서 보장되는지 이 두 메서드가 드러낸다.

```java
@Override
public void beforeEach(ExtensionContext extensionContext) {
    if (!isTransactionalTest(extensionContext)) {
        extensionContext.getStore(NAMESPACE).put(TRANSACTION_ACTIVE_KEY, false);
        return;
    }
    AnnotationConfigApplicationContext context = getOrCreateContext(extensionContext);
    context.getBean(TransactionManager.class).begin();
    extensionContext.getStore(NAMESPACE).put(TRANSACTION_ACTIVE_KEY, true);
}

@Override
public void afterEach(ExtensionContext extensionContext) {
    Boolean transactionActive = extensionContext.getStore(NAMESPACE).remove(TRANSACTION_ACTIVE_KEY, Boolean.class);
    if (!Boolean.TRUE.equals(transactionActive)) {
        return;
    }
    AnnotationConfigApplicationContext context = getOrCreateContext(extensionContext);
    context.getBean(TransactionManager.class).rollback();
}
```

```mermaid
sequenceDiagram
    participant J as JUnit
    participant E as SpringLiteTestExtension
    participant C as ApplicationContext
    participant TM as TransactionManager
    participant T as Test Method

    J->>E: beforeAll / postProcessTestInstance
    E->>C: create or reuse context
    J->>E: beforeEach
    E->>TM: begin() if transactional
    J->>T: invoke test method
    J->>E: afterEach
    E->>TM: rollback() if transactional
```

직접 구현하는 책이라면 테스트 지원도 마지막에 실제로 만들어 보게 해야 한다. 그래서 이 장에서는 `SpringLiteTestExtension`의 `beforeAll`, `postProcessTestInstance`, `beforeEach`, `afterEach`, `resolveParameter`를 거의 빠짐없이 따라가게 하는 편이 좋다. 프레임워크를 만든다는 것은 실행 코드만이 아니라, 그 코드를 검증하는 진입점까지 함께 설계하는 일이라는 사실을 이 장에서 마무리할 수 있다.

### Part 6 정리

이번 Part에서 독자는 다음 조립 계층을 완성했다.

- `JdbcTemplate` 기반 JDBC 추상화
- 예제 애플리케이션을 통한 전체 통합
- `SpringLiteApplication`과 기본 auto-configuration
- `SpringLiteTestExtension`, `MockMvc`, 테스트 트랜잭션 지원

디버깅 체크 질문:

- 현재 SQL은 새 커넥션으로 실행되는가, 기존 트랜잭션 커넥션에 참여하는가
- Boot 시작점에서 어떤 기본 인프라가 자동 등록되었는가
- 테스트 컨텍스트는 재사용되는가, 매번 새로 만들어지는가
- 테스트 롤백은 어디서 시작되고 어디서 끝나는가

실제 Spring에서 이어서 읽기 좋은 클래스:

- `org.springframework.jdbc.core.JdbcTemplate`
- `org.springframework.boot.SpringApplication`
- `org.springframework.test.context.TestContextManager`

독자 연습 과제:

1. `JdbcTemplate.queryForObject(...)` 실패 케이스를 더 자세히 테스트해보라.
2. Boot 자동 설정 하나를 직접 더 추가해보라.
3. 테스트 확장에서 사용자 정의 fixture 빈을 주입하는 기능을 넣어보라.

---

## Part 7. 실제 Spring과 실무 활용으로 연결한다

### Chapter 25. 실제 Spring과의 구조 대응

이제 `spring-lite`를 실제 Spring과 정확히 대응시킬 차례다. 비교는 기능 목록의 나열이 아니라 구조의 대응이어야 한다. `AnnotationConfigApplicationContext`는 `ApplicationContext`/`BeanFactory` 계층의 축소판이고, `BeanDefinition`은 더 풍부한 Spring 빈 메타데이터의 축소판이다. `DispatcherServlet`, `TransactionalBeanPostProcessor`, `TransactionManager`, `JdbcTemplate`, `SpringLiteApplication`도 각각 실제 Spring MVC, Spring Transaction, Spring JDBC, Spring Boot의 핵심 개념과 맞닿아 있다.

중요한 것은 실제 Spring이 같은 문제를 더 큰 규모와 더 긴 역사 속에서 푼 결과물이라는 점이다. 그래서 추상화 계층이 많고, 설정 조합이 풍부하며, 하위 호환을 위한 장치도 많다. 학습용 구현이 없었다면 이 복잡성은 종종 과하게만 느껴졌을 것이다. 하지만 직접 축소판을 만들어본 뒤에는 "왜 이런 클래스가 존재하는가"를 더 쉽게 추론할 수 있다.

| 축 | Spring Framework / Boot | spring-lite |
| --- | --- | --- |
| 컨테이너 | `ApplicationContext` + `BeanFactory` + 다층 post-processor | `AnnotationConfigApplicationContext` 중심 |
| AOP | advisor, pointcut, auto-proxy creator, `@AspectJ` | `@Order` 기반 인터셉터 체인 + 최소 `@Aspect` |
| MVC | `DispatcherServlet` + 다수 전략 + 메시지 컨버터 | `DispatcherServlet` + mapping/adapter/resolver 최소 세트 |
| 트랜잭션 | `PlatformTransactionManager` + 풍부한 동작 규칙 | `TransactionManager` + `REQUIRED`/rollback rules |
| Boot | 대규모 auto-config와 환경 추상화 | 경량 auto-config + 프로파일 대응 프로퍼티 로딩 |

이 비교 표를 읽을 때는 기능의 많고 적음보다 "책임의 대응"을 보는 편이 중요하다. 예를 들어 실제 Spring의 `BeanFactoryPostProcessor`, `BeanPostProcessor`, `ImportSelector`, `DeferredImportSelector`, `Condition` 같은 풍부한 확장 포인트는, 결국 컨테이너 메타데이터를 등록하거나 수정하거나 해석하는 여러 시점을 세분화한 결과다. `spring-lite`에서는 그중 가장 핵심적인 흐름만 남겨 두었다. 축소는 생략이 아니라 강조다. 무엇을 남기고 무엇을 덜어냈는지가 곧 학습 설계다.

여기서 한 걸음 더 나아가면, 독자는 "클래스 이름 대응"이 아니라 "호출 순서 대응"까지 볼 수 있어야 한다. 같은 요청이나 같은 빈 생성 흐름을 두 프레임워크에 나란히 놓고 보면, 복잡성의 차이는 크지만 책임의 축은 상당히 유사하다.

```mermaid
flowchart TD
    A["spring-lite AnnotationConfigApplicationContext.refresh()"] --> B["instantiateBeanPostProcessors()"]
    B --> C["instantiateConfigurationBeans()"]
    C --> D["instantiateRemainingSingletons()"]
    D --> E["publish ContextRefreshedEvent"]

    F["Spring AbstractApplicationContext.refresh()"] --> G["invokeBeanFactoryPostProcessors()"]
    G --> H["registerBeanPostProcessors()"]
    H --> I["finishBeanFactoryInitialization()"]
    I --> J["finishRefresh()"]
```

이 그림은 실제 Spring이 더 많은 중간 단계를 갖고 있음에도, 큰 축에서는 `spring-lite`와 같은 질문을 푼다는 점을 보여 준다. 어떤 메타데이터를 먼저 준비할 것인가, 후처리기는 언제 등록할 것인가, 남은 싱글톤은 어느 시점에 일괄 생성할 것인가, 컨텍스트 완료 신호는 언제 발행할 것인가. 학습용 구현이 작다는 이유로 구조가 다른 것이 아니라, 같은 문제를 더 적은 단계로 압축해 둔 것이다.

이 장에서는 독자가 비교표를 "같다/다르다" 수준에서 소비하지 않도록 만드는 것이 중요하다. 더 좋은 읽기 방식은 다음과 같다. 먼저 `spring-lite`에서 하나의 핵심 메서드를 고른다. 예를 들어 `createBean(...)`, `initializeBean(...)`, `DispatcherServlet.handle(...)`, `TransactionInterceptor.invoke(...)` 같은 메서드다. 그다음 실제 Spring에서 대응되는 클래스와 메서드로 이동한다. 이름은 다를 수 있지만, 대개 "메타데이터 준비", "확장 포인트 등록", "호출 경계 개입", "응답 변환"이라는 책임 축은 그대로 남아 있다. 이 경험을 몇 번 반복하면 방대한 Spring 코드베이스도 더 이상 무정형의 숲처럼 느껴지지 않는다.

비교를 더 쉽게 하기 위해 아래처럼 책임 질문을 먼저 던지는 편이 좋다.

```mermaid
flowchart LR
    A["spring-lite code"] --> B["책임 질문으로 환원"]
    B --> C["실제 Spring 대응 클래스 찾기"]
    C --> D["더 세분화된 추상화 읽기"]
    D --> E["왜 복잡성이 늘었는지 해석"]
```

예를 들어 `spring-lite`의 `initializeBean(...)`을 본 뒤 실제 Spring의 초기화/후처리 단계를 보면, 처음에는 클래스 수가 많아 보여도 질문은 같다. "어느 시점에 후처리기가 끼어드는가", "프록시는 언제 원본을 대체하는가", "초기화 콜백은 전후 어디에 위치하는가" 같은 질문이다. 질문이 같다면 복잡성은 더 이상 무서운 덩어리가 아니라, 같은 문제를 더 일반화한 구조로 읽히기 시작한다.

### 클래스 대응 심화

#### `AnnotationConfigApplicationContext`와 Spring 컨테이너 축

`spring-lite`의 `AnnotationConfigApplicationContext`는 실제 Spring의 `ApplicationContext`, `DefaultListableBeanFactory`, `AbstractAutowireCapableBeanFactory`에 걸쳐 흩어진 책임을 하나로 모아 둔 형태다. 학습용 구현에서는 이것이 장점이다. 독자는 빈 정의 저장, 생성자 선택, 의존성 해석, 후처리기 적용, 이벤트 발행을 한 클래스 안에서 연속된 알고리즘으로 볼 수 있다.

실제 Spring은 이 책임을 훨씬 더 세분화한다. `DefaultListableBeanFactory`는 등록과 조회 축에 집중하고, `AbstractAutowireCapableBeanFactory`는 실제 생성과 자동 주입 축을 더 강하게 담당한다. `AbstractApplicationContext`는 `refresh()` 순서를 총괄한다. 이 분리는 코드 양을 늘리지만, 더 많은 확장 포인트와 더 정교한 테스트 가능성을 제공한다. 반대로 `spring-lite`는 구조를 압축해 독자가 "빈 생성 파이프라인"을 한 번에 이해하게 돕는다.

핵심 메서드 대응도 살펴볼 만하다.

| spring-lite | 실제 Spring에서 대응되는 축 | 읽을 때 볼 포인트 |
| --- | --- | --- |
| `registerDiscoveredClass(...)` | 스캐닝 후 빈 정의 등록 단계 | 어떤 메타데이터가 정의로 바뀌는가 |
| `registerBeanMethods(...)` | `@Bean` 메서드 해석, configuration processing | 메서드 정의가 왜 별도 빈 정의가 되는가 |
| `createBean(...)` | `doCreateBean(...)` 계열 | 생성, 초기화, 후처리, 캐시 저장의 경계 |
| `resolveDependency(...)` | `resolveDependency(...)` 계열 | 타입 후보, qualifier, 컬렉션/지연 조회 확장 |
| `initializeBean(...)` | init / post-process 단계 | 전후 훅과 프록시 치환 가능 지점 |

이 표를 기준으로 실제 Spring 소스를 보면 "메서드가 왜 이렇게 잘게 나뉘었는가"가 훨씬 덜 낯설다. `spring-lite`에서 하나의 메서드로 본 단계가 실제 Spring에서는 여러 전략과 보호 메서드로 갈라져 있을 뿐이다.

#### `ConfigurationClassPostProcessor`를 왜 알아야 하는가

`spring-lite`에서는 설정 클래스를 등록할 때 `registerBeanMethods(...)`가 곧바로 `@Bean` 메서드를 읽는다. 하지만 실제 Spring은 `ConfigurationClassPostProcessor`를 통해 더 큰 메타데이터 파이프라인을 돌린다. `@Configuration`, `@ComponentScan`, `@Import`, 조건부 등록, auto-configuration 진입점이 모두 이 계층과 맞물린다. 즉, `spring-lite`의 단순한 `@Bean` 메서드 등록은 실제 Spring에서 매우 큰 "메타데이터 확장 허브"로 자라난 결과의 최소판이다.

독자는 이 차이를 단순한 기능 수 차이로만 보아서는 안 된다. 설정 클래스가 다른 빈 정의를 추가로 생성할 수 있다는 사실 하나가, 프레임워크 전체를 메타프로그래밍 가능한 구조로 바꾼다. 그래서 실제 Spring은 이 구간에 별도 후처리기, 선택기, 조건 평가기를 두고, Boot는 그 위에 auto-configuration 체계를 쌓는다.

#### `DispatcherServlet`과 MVC 전략 계층

`spring-lite`의 `DispatcherServlet`은 생성자에서 전략 객체를 조립하고, `handle()`에서 매핑, 실행, 반환값 처리, 예외 변환을 직선적으로 수행한다. 실제 Spring MVC는 같은 축을 유지하되, 각 지점에 훨씬 더 많은 전략 인터페이스를 끼워 넣는다. `HandlerMapping`, `HandlerAdapter`, `HandlerMethodArgumentResolver`, `HandlerExceptionResolver`, `HttpMessageConverter`, `ViewResolver`가 그 예다.

```mermaid
flowchart LR
    A["HTTP Request"] --> B["DispatcherServlet"]
    B --> C["HandlerMapping"]
    C --> D["HandlerAdapter"]
    D --> E["Argument Resolvers"]
    E --> F["Controller Method"]
    F --> G["Return Value Handler"]
    G --> H["HTTP Response"]
    D --> X["ExceptionResolver"]
    X --> H
```

학습 포인트는 단순하다. `spring-lite`에서 `handle()` 메서드 하나에 보이는 분기들이 실제 Spring에서는 별도 전략과 합성 규칙으로 일반화되어 있다. 404, 400, 500의 성격이 서로 다른 이유도 이 파이프라인이 서로 다른 계층에서 실패하기 때문이다.

#### `TransactionManager`와 `TransactionInterceptor`

실제 Spring의 선언형 트랜잭션을 이해할 때 가장 헷갈리는 지점은 "무엇이 정책이고 무엇이 실행인가"다. `spring-lite`에서는 이 구분이 비교적 선명하다. `TransactionalBeanPostProcessor`가 메서드 메타데이터를 읽고, 내부 인터셉터가 begin/commit/rollback 경계를 제어하며, `TransactionManager`가 현재 스레드의 연결과 깊이를 관리한다. 실제 Spring은 여기에 `TransactionAttributeSource`, `TransactionAspectSupport`, `PlatformTransactionManager`, `TransactionSynchronizationManager` 같은 더 세밀한 추상화를 둔다.

하지만 본질은 바뀌지 않는다. 메타데이터를 읽는 계층, 호출을 감싸는 계층, 상태를 저장하는 계층이 분리되어야 선언형 트랜잭션이 설명 가능해진다. `spring-lite`를 먼저 이해한 독자라면 실제 Spring의 풍부한 전파 옵션과 동기화 콜백도 "이미 아는 구조의 확장판"으로 읽을 수 있다.

#### `RequestMappingHandlerAdapter`를 읽는 방법

실제 Spring MVC 소스에서 많은 독자가 가장 빨리 길을 잃는 클래스 중 하나가 `RequestMappingHandlerAdapter`다. 인자 해석, 바인딩, 검증, 반환값 처리, 모델 조립이 한데 모여 있기 때문이다. 그런데 `spring-lite`에서 이미 같은 책임을 더 작은 크기로 경험했다. 각 파라미터를 순회하며 resolver를 찾고, 값을 만들고, 필요하면 검증하고, 마지막에 메서드를 호출하는 흐름이다.

이 경험을 갖고 실제 Spring 코드를 보면 거대한 클래스도 더 이상 무정형으로 보이지 않는다. "이 줄은 인자 해석기 선택이다", "이 메서드는 검증 개입 지점이다", "이 부분은 컨트롤러 메서드 호출 후 반환값 처리다" 같은 식으로 책임을 분해해 읽을 수 있다. 큰 소스를 읽을 때 가장 중요한 능력은 모든 줄을 아는 것이 아니라, 책임 경계를 빠르게 식별하는 것이다.

또한 구조 대응은 소스 코드 읽기의 지도를 제공한다. 실제 Spring을 공부할 때 독자는 더 이상 거대한 패키지 트리를 무작정 헤매지 않아도 된다. 먼저 "이 기능은 컨테이너 등록 단계인가, 후처리기 단계인가, 프록시 생성 단계인가, 웹 디스패치 단계인가"를 물을 수 있다. 그런 다음 대응되는 Spring 모듈과 클래스를 찾아가면 된다. 작은 구현을 발판으로 큰 구현을 읽는 방식이다.

이 장은 결국 자신감을 회복시키는 장이기도 하다. 실제 Spring 소스는 분량과 역사 때문에 압도적으로 보일 수 있다. 하지만 핵심 책임을 축으로 분해하면, 복잡성은 더 이상 무정형의 덩어리가 아니다. 많은 계층과 클래스가 있어도, 그 상당수는 이 책에서 이미 본 구조를 더 일반화하고 더 안전하게 만든 결과라는 사실을 깨닫게 된다.

이 비교를 제대로 활용하려면 "같다/다르다" 수준에서 멈추지 말고 "왜 여기서 더 많은 추상화가 필요해졌는가"를 계속 물어야 한다. 실제 Spring은 학습용 프레임워크보다 더 많은 사용자, 더 많은 역사, 더 많은 하위 호환 요구를 감당한다. 그러므로 클래스 수가 많은 것은 단지 과설계의 결과가 아니라, 더 넓은 문제 공간을 수용하려는 장기적 선택의 흔적이기도 하다. 작은 구현으로 본질을 잡은 뒤 큰 구현으로 일반화를 읽는 태도가 중요하다.

대표적인 Spring 서적들이 서로 다른 깊이와 독자를 대상으로 하면서도 공통적으로 유지하는 축이 있다면, 바로 이 "본질에서 일반화로 가는 읽기 방식"이다. *Spring Start Here*는 비교적 작은 기능 묶음으로 시작해 핵심 개념을 분해한다. *Spring in Action*은 실제 애플리케이션을 끝까지 만들어 가며 여러 모듈이 결합되는 지점을 강조한다. Spring 공식 문서는 매우 세밀한 기능 표면을 제공하지만, 동시에 각 기능이 어느 런타임 계층에 속하는지도 명확히 보여 준다. 이 책이 `spring-lite`를 매개로 이 셋을 함께 묶으려는 이유는, 독자가 단순히 기능을 많이 아는 사람이 아니라 큰 코드베이스를 구조적으로 읽어내는 사람으로 성장하도록 돕기 위해서다.

### Chapter 26. 실무에서 원리를 쓰는 법

프레임워크 내부를 이해하면 실무에서 가장 먼저 달라지는 것은 문제를 바라보는 순서다. 트랜잭션이 걸리지 않은 것 같으면 DB보다 호출 경로를 먼저 본다. 빈 생성 실패가 나면 애너테이션을 다시 붙이기보다 등록 단계, 생성자 해석, 조건부 등록, 설정 재정의 경로를 먼저 본다. MVC 매핑이 이상하면 컨트롤러 코드보다 디스패처의 핸들러 선택 조건부터 떠올린다.

이 차이는 생산성으로 이어진다. 장애를 더 빨리 좁힐 수 있고, 자동 설정 충돌을 더 덜 두려워하게 되며, 설계 리뷰에서도 더 깊이 있는 판단을 할 수 있다. 예를 들어 순환 참조 위험을 빨리 감지하고, 선언형 트랜잭션이 적합하지 않은 경계를 더 잘 식별하고, 프로파일과 설정 조립 전략을 더 깔끔하게 설계할 수 있다.

Spring을 잘 쓴다는 말은 결국 내부 구조를 바탕으로 더 나은 판단을 할 수 있다는 뜻이다.

조금 더 구체적으로 말하면, 내부 원리를 아는 개발자는 문제를 "기능 이름"이 아니라 "실행 단계"로 분류한다. 빈이 안 보이면 스캔과 등록 단계 문제다. 주입은 되는데 동작이 이상하면 라이프사이클이나 프록시 개입 시점을 의심한다. 요청은 들어오지만 415나 400이 나온다면 메시지 변환과 바인딩 규칙을 본다. SQL은 정상인데 데이터 정합성이 깨진다면 트랜잭션 전파와 롤백 정책을 점검한다. 이런 사고 순서는 실무에서 매우 큰 차이를 만든다.

또한 프레임워크 원리를 이해한 사람은 "편한 기본값"과 "위험한 숨김"을 구분할 수 있다. 자동 설정은 강력하지만, 언제 꺼내서 명시적으로 제어해야 하는지도 알아야 한다. 선언형 트랜잭션은 편리하지만, 긴 배치 작업이나 외부 API 호출이 섞인 흐름에서는 더 세심한 경계 설계가 필요하다. MVC 자동 바인딩은 생산적이지만, 입력 경계에서 검증과 변환 규칙을 분명히 해야 한다. 즉, 원리 이해는 단순 지식이 아니라 절제된 사용법으로 이어진다.

팀 차원에서도 효과가 있다. 설계 리뷰에서 "그냥 Spring이 해준다"는 말 대신, 어떤 후처리기와 어떤 프록시 규칙에 기대는지 설명할 수 있다면 의사결정 품질이 달라진다. 장애 회고에서도 증상 중심이 아니라 구조 중심의 재발 방지책을 세울 수 있다. 결국 프레임워크를 깊이 이해하는 일은 개인 생산성뿐 아니라 팀의 기술적 대화 수준을 끌어올린다.

실무 활용 관점에서는 "어디까지 자동화에 기대고, 어디서부터 명시적으로 통제할 것인가"라는 질문도 중요하다. 내부 원리를 모르면 자동 설정이 실패했을 때 모든 것을 우회해 수동 설정으로 돌아가고 싶어진다. 반대로 원리를 이해하고 있으면 자동 설정을 완전히 버리지 않고도, 어떤 빈 정의가 왜 우선했는지, 어떤 조건이 등록을 막았는지, 어떤 후처리기가 프록시를 붙였는지 정확히 짚어낼 수 있다. 구조 이해는 과도한 수동화와 과도한 맹신을 모두 피하게 해 준다.

다음과 같은 체크리스트는 실무에서 특히 유용하다.

- 빈이 기대와 다르게 조립되면: 스캔, 조건부 등록, `@Bean` 팩토리 메서드, 후처리기 개입 순서를 본다.
- 트랜잭션이 기대와 다르게 동작하면: 프록시 통과 여부, self-invocation, 예외 타입, rollback-only 상태를 본다.
- 웹 응답이 이상하면: 매핑, 인자 바인딩, 검증, 반환값 직렬화, 예외 변환 순서를 분리해서 본다.
- Boot 기본값이 충돌하면: 어떤 auto-configuration이 활성화되었고, 어떤 사용자 정의 빈이 이를 대체했는지 본다.

이 체크리스트의 의도는 문제를 단순화하는 것이 아니라, 문제를 구조에 맞는 순서로 좁히는 것이다. Spring을 잘 쓰는 사람은 기능 이름을 많이 아는 사람이 아니라, 문제가 생겼을 때 어떤 계층부터 의심해야 하는지 아는 사람이다.

### Chapter 27. 다음 확장 과제

책의 끝은 학습의 끝이 아니라 확장의 시작이어야 한다. 현재 `spring-lite`는 핵심 원리를 충분히 드러내지만, 실제 Spring과의 거리를 더 탐색할 수 있는 주제도 남아 있다.

- 더 풍부한 `Advisor` / pointcut 모델
- `HttpMessageConverter` 추상화와 콘텐츠 협상
- 정적 리소스 서빙
- 더 풍부한 조건부 auto-configuration
- 이벤트 관측성, metrics, 운영 지원
- `FactoryBean` 유사 모델
- 더 다양한 트랜잭션 동작 규칙

이 목록은 단순 TODO가 아니다. 각 항목은 실제 Spring이 복잡해지는 이유를 다시 배우게 만드는 학습 과제다. 독자가 이 책을 덮은 뒤에도 `spring-lite`를 계속 확장하며 배울 수 있도록 남겨둔 의도된 여지다.

예를 들어 `HttpMessageConverter` 추상화를 도입하면, MVC가 JSON 한 가지 표현을 넘어 다양한 미디어 타입과 협상 규칙을 어떻게 다루는지 더 깊이 탐구할 수 있다. `FactoryBean` 유사 모델을 추가하면 "빈 정의가 곧 최종 인스턴스를 뜻하지 않는다"는 Spring의 중요한 관점을 배울 수 있다. 조건부 auto-configuration을 확장하면 Boot가 환경과 클래스패스 조건을 바탕으로 어떤 판단을 자동화하는지 더 정확히 재현할 수 있다. 즉, 다음 과제들은 단순 기능 추가가 아니라 각기 하나의 새로운 학습 축이다.

독자가 직접 확장을 시도할 때는 구현 자체보다 테스트 전략을 먼저 설계하는 편이 좋다. 새로운 포인트컷 모델을 넣는다면 어떤 호출이 매칭되어야 하고 어떤 호출은 제외되어야 하는지부터 정의해야 한다. 정적 리소스 서빙을 넣는다면 캐시 헤더, 경로 정규화, 존재하지 않는 파일 처리 같은 분기를 먼저 떠올려야 한다. 프레임워크 기능은 작아 보여도 분기와 정책이 많기 때문이다. 책을 마무리하는 시점에서 이런 태도를 갖추는 것이 중요하다.

궁극적으로 `spring-lite`의 확장 과제는 실제 Spring을 더 잘 읽기 위한 연습장이다. 직접 하나씩 구현해 보면 Spring의 더 큰 추상화가 왜 필요한지, 어디서 복잡성이 추가되는지, 무엇이 필수이고 무엇이 역사적 산물인지 구분하는 눈이 생긴다. 그때 비로소 "Spring을 안다"는 말이 조금 더 실질적인 의미를 갖게 된다.

책 관점에서도 이 확장 목록은 부록이 아니라 후속 학습 커리큘럼이다. 독자는 한 번에 모든 것을 구현할 필요는 없지만, 어떤 방향으로 확장할지 선택하는 순간 다시 동일한 학습 사이클을 밟게 된다. 문제를 정의하고, 실제 Spring의 대응 구조를 살피고, `spring-lite`에 맞는 축소판 모델을 설계하고, 테스트로 계약을 고정하는 과정이다. 즉, 이 프로젝트는 완결된 결과물이면서 동시에 계속 성장할 수 있는 실습 기반이다.

---

## 맺음말

우리는 이 책에서 Spring을 흉내 낸 것이 아니라, Spring의 핵심 원리를 드러내는 실행 가능한 축소판을 만들었다. 컨테이너가 어떻게 메타데이터를 등록하고, 의존성을 해석하며, 라이프사이클과 후처리기로 확장을 가능하게 하는지 살펴보았다. 프록시와 인터셉터가 어떻게 공통 관심사를 호출 경계에 끼워 넣는지도 확인했고, 웹 요청이 어떻게 메서드 호출과 응답 모델로 바뀌는지도 추적했다. JDBC와 트랜잭션, 부트스트랩과 테스트 지원까지 연결해 하나의 런타임으로 완성한 셈이다.

이제 Spring은 더 이상 마법이 아니다. 복잡하지만 설명 가능한 구조다. 그리고 구조를 이해한 개발자는 설정을 외우는 사람보다 훨씬 더 잘 디버깅하고, 더 잘 설계하고, 더 잘 판단할 수 있다. 그것이 이 책이 독자에게 남기고 싶은 가장 중요한 성과다.

이 원고를 완성된 끝점으로만 볼 필요는 없다. 오히려 더 큰 소스 코드와 더 복잡한 실무 문제로 나아가기 위한 해석 도구로 보는 편이 맞다. 앞으로 실제 Spring Framework와 Spring Boot의 코드를 읽게 되더라도, 독자는 빈 등록과 생성, 후처리, 프록시 개입, 요청 디스패치, 트랜잭션 경계라는 공통 축을 기준으로 구조를 따라갈 수 있다. 거대한 클래스 수와 다양한 확장 포인트에 압도되기보다, "이것은 내가 이미 알고 있는 문제의 더 일반화된 해법"이라고 인식하게 될 것이다.

프레임워크를 깊이 공부하는 일은 당장 기능 하나를 빨리 만드는 일과는 거리가 있어 보일 수 있다. 그러나 장기적으로 보면 그 반대다. 내부 원리를 이해하는 개발자는 예외 상황에서 덜 흔들리고, 추상화의 한계를 더 빨리 감지하며, 새로운 기술을 배울 때도 더 빠르게 핵심을 붙잡는다. Spring Lite를 직접 만들며 얻은 감각이 실제 실무에서 오래 남는 이유가 여기에 있다.

이 원고는 끝났지만, 독자의 Spring 학습은 여기서부터 오히려 더 좋아질 수 있다. 이제 공식 레퍼런스를 읽으면 문서가 덜 추상적으로 보일 것이다. 기술 블로그에서 프록시, 트랜잭션, 자동 설정 이야기를 만나도 그것이 어느 런타임 계층의 이야기인지 더 빨리 감이 잡힐 것이다. 널리 읽히는 Spring 서적과 강의가 왜 반복해서 IoC, 객체지향 설계, 프록시, MVC, 테스트를 강조하는지도 더 분명해질 것이다. 결국 깊이 있는 학습은 더 많은 기능을 외우는 데서 오지 않는다. 적은 수의 핵심 원리를 여러 맥락에서 다시 해석할 수 있게 되는 데서 온다. 이 책이 독자에게 남기고 싶은 마지막 감각도 바로 그것이다.
