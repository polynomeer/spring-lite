# Reference Bibliography For The Spring Lite Book

이 문서는 `Build Your Own Spring Lite` 원고를 보강할 때 참고한 대표 자료를 정리한 참고문헌 문서다. 목적은 단순 링크 모음이 아니라, 각 자료가 책의 어떤 설명 축에 영향을 주었는지 드러내는 것이다.

## 1. 공식 문서

### Spring Framework Reference

1. [The IoC Container](https://docs.spring.io/spring-framework/reference/core/beans.html)
   - 컨테이너, 빈 정의, 의존성, 스코프, 확장 포인트를 설명하는 기본 기준선이다.
   - `spring-lite-context`와 비교할 때 용어와 계층 구조의 기준으로 삼았다.

2. [Container Overview](https://docs.spring.io/spring-framework/reference/core/beans/basics.html)
   - `ApplicationContext`가 구성 메타데이터를 읽고 객체를 조립한다는 큰 그림을 설명한다.
   - 책의 Part 1, Part 2 도입부에서 "객체보다 메타데이터가 먼저"라는 설명의 기준점이 되었다.

3. [Bean Overview](https://docs.spring.io/spring-framework/reference/core/beans/definition.html)
   - 빈 이름, 생성 방식, 팩토리 메서드, 런타임 타입 같은 개념을 정리한다.
   - `BeanDefinition`, `@Configuration`, `@Bean` 설명을 깊게 쓰는 데 반영했다.

4. [Aspect Oriented Programming with Spring](https://docs.spring.io/spring-framework/reference/core/aop.html)
   - Spring AOP의 역할, `@AspectJ` 스타일, 프록시 기반 구조를 설명한다.
   - `spring-lite-aop`와 `@Transactional`의 관계를 설명하는 장에 직접 반영했다.

5. [Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction.html)
   - Spring 트랜잭션 추상화의 전체 그림을 제공한다.
   - 트랜잭션 추상화, 자원 동기화, 선언형 트랜잭션 장의 기준 문서다.

6. [Declarative Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html)
   - 선언형 트랜잭션의 위치와 의도를 설명한다.
   - 책에서 `@Transactional`을 단순 사용법이 아니라 프록시 기반 경계로 설명하는 근거가 되었다.

7. [Understanding the Spring Framework’s Declarative Transaction Implementation](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
   - 트랜잭션 프록시, interceptor, metadata 기반 동작을 매우 직접적으로 설명한다.
   - self-invocation, 프록시 우회, rollback rule 설명을 깊게 쓰는 데 큰 영향을 주었다.

8. [Spring Web MVC](https://docs.spring.io/spring/reference/web/webmvc.html)
   - Spring MVC 전체 개요와 전략 컴포넌트 구조를 제공한다.
   - `spring-lite-web`의 장에서 MVC를 "라우터"가 아니라 "파이프라인"으로 설명하는 기준선이다.

9. [DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)
   - Front Controller 구조와 delegate component 모델을 설명한다.
   - `DispatcherServlet`, `HandlerMapping`, `HandlerAdapter`, `ExceptionResolver` 설명에 반영했다.

### Spring Boot Reference

1. [Auto-configuration](https://docs.spring.io/spring-boot/reference/using/auto-configuration.html)
   - Boot 자동 설정의 목적과 비침투성(non-invasive) 원칙을 설명한다.
   - `spring-lite-boot`를 "마법"이 아니라 "조립 규칙"으로 설명하는 데 기준이 되었다.

2. [Creating Your Own Auto-configuration](https://docs.spring.io/spring-boot/reference/features/developing-auto-configuration.html)
   - 조건부 등록, 사용자 정의 오버라이드, auto-configuration의 구조를 설명한다.
   - `BootInfrastructureRegistrar`와 `@ConditionalOn*` 계열 설명을 보강할 때 참고했다.

## 2. 대표 서적

1. [Spring in Action, Sixth Edition](https://www.manning.com/books/spring-in-action-sixth-edition?query=Sprin)
   - Craig Walls
   - 애플리케이션 전체를 끝까지 연결하는 실전적 서사와 예제 중심 흐름이 강점이다.
   - 이 책의 `example-app` 서술과 "모듈을 따로 배우지 않고 하나의 실행 흐름으로 연결한다"는 편집 방향에 영향을 주었다.

2. [Spring Start Here](https://www.manning.com/books/spring-start-here?query=Lauren%C8%9Biu+Spilc%C4%83)
   - Laurentiu Spilca
   - 핵심 기능을 작은 개념 단위로 나누고, 학습자 관점에서 순차적으로 설명하는 구성으로 유명하다.
   - `spring-lite` 원고에서 IoC, AOP, MVC, 트랜잭션을 비교적 짧은 개념 덩어리로 끊어 설명하는 방식에 영향을 주었다.

## 3. 강의

1. [스프링 핵심 원리 - 기본편](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-%ED%95%B5%EC%8B%AC-%EC%9B%90%EB%A6%AC-%EA%B8%B0%EB%B3%B8%ED%8E%B8?cid=325969)
   - 김영한
   - 객체지향 설계 원칙, DI, 스프링 컨테이너, 빈 생명주기, 테스트를 함께 묶어 설명하는 학습 경로로 널리 알려져 있다.
   - 책의 초반부에서 SOLID, DIP, "조립과 사용의 분리", 테스트 중심 설명을 함께 가져가는 편집 방향에 영향을 주었다.

## 4. 기술 글과 블로그

1. [Inversion of Control Containers and the Dependency Injection pattern](https://martinfowler.com/articles/injection.html)
   - Martin Fowler
   - IoC보다 더 구체적으로 DI를 설명하고, 구성과 사용의 분리를 강조하는 고전적인 글이다.
   - 책에서 Spring을 단지 편의 프레임워크가 아니라 "애플리케이션 조립기"로 설명하는 철학적 기준점이다.

2. [Transactions, Caching and AOP: understanding proxy usage in Spring](https://spring.io/blog/2012/05/23/transactions-caching-and-aop-understanding-proxy-usage-in-spring/)
   - Michael Isvy, Spring Blog
   - 트랜잭션, 캐싱, Java configuration이 모두 프록시에 기대고 있음을 시각적으로 잘 설명한다.
   - `@Transactional` 장과 프록시 장에서 "기능은 달라도 기반 기술은 같다"는 설명을 강화하는 데 참고했다.

3. [Testing auto-configurations with Spring Boot 2.0](https://spring.io/blog/2018/03/07/testing-auto-configurations-with-spring-boot-2-0/)
   - Madhura Bhave, Spring Blog
   - 자동 설정도 별도의 계약과 테스트 전략이 필요하다는 점을 보여준다.
   - `spring-lite-boot`와 `spring-lite-test`를 책에서 독립 장으로 다루는 정당성을 강화하는 참고 글이다.

4. [Manual Bean Definitions in Spring Boot](https://spring.io/blog/2019/01/21/manual-bean-definitions-in-spring-boot/)
   - Dave Syer, Spring Blog
   - 자동 설정과 수동 설정의 경계, 그리고 Boot 조립 모델의 유연성을 설명한다.
   - 이 책에서 Boot를 "완전 자동"이 아니라 "점진적으로 교체 가능한 조립 계층"으로 설명하는 데 참고했다.

## 5. 이 참고문헌을 책에 반영하는 방식

이 원고는 위 자료들을 다음처럼 역할별로 사용한다.

- 공식 문서: 용어, 구조, 계층 책임의 기준선
- 서적: 장 구성, 예제 서사, 설명 리듬에 대한 참고
- 강의: 학습 순서, 점진적 구현 흐름, 테스트 중심 설명 방식
- 기술 글: 특정 주제의 직관 강화, 특히 프록시와 자동 설정의 내부 동작 설명

즉, 이 문서는 외부 자료를 그대로 옮기기 위한 목록이 아니라, `spring-lite` 기반 원고가 어떤 설명 계보 위에 서 있는지 드러내는 메타 문서다.
