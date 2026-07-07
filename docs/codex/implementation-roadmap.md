# Implementation Roadmap

## Phase 0. Skeleton

- 멀티모듈 Gradle 구조 확정
- 문서, ADR, 백로그 작성
- 예제 앱 도메인 선정

상태: 완료

## Phase 1. Core Container

목표는 Bean 등록과 생성자 DI가 동작하는 최소 컨테이너를 완성하는 것이다.

### 산출물

- `BeanDefinition`
- `BeanFactory`
- `SingletonBeanRegistry`
- `ClassPathScanner`
- `AnnotationConfigApplicationContext`
- `@Component`, `@Service`, `@Repository`, `@Controller`, `@Autowired`

### 완료 기준

- 지정 패키지 스캔이 가능하다.
- 생성자 주입으로 Bean 인스턴스화가 가능하다.
- 타입 기반 `getBean()` 조회가 가능하다.

상태: 완료

## Phase 2. Configuration And Lifecycle

### 산출물

- `@Configuration`
- `@Bean`
- `BeanPostProcessor`
- `@PostConstruct`, `@PreDestroy`
- `Environment` / property 해석의 최소 버전

### 완료 기준

- 팩토리 메서드 기반 Bean 등록이 가능하다.
- Bean 초기화 후처리가 가능하다.

상태: 완료

## Phase 3. Web MVC

### 산출물

- `DispatcherServlet`
- `HandlerMapping`
- `HandlerAdapter`
- `HandlerMethod`
- `ArgumentResolver`
- `ReturnValueHandler`

### 완료 기준

- `@RestController`와 `@GetMapping`이 동작한다.
- 경로 변수, 쿼리 파라미터, JSON 응답이 가능하다.

상태: MVP 완료

## Phase 4. AOP

### 산출물

- `Advice`, `Advisor`, `Pointcut`
- `ProxyFactory`
- `MethodInvocation`
- `AopBeanPostProcessor`

### 완료 기준

- 인터페이스 기반 Bean에 `@Around` 스타일 인터셉션을 적용할 수 있다.

상태: MVP 완료

## Phase 5. JDBC And Transaction

### 산출물

- `JdbcTemplate`
- `RowMapper`
- `TransactionManager`
- `TransactionInterceptor`
- `@Transactional`

### 완료 기준

- 단일 데이터소스에서 선언적 트랜잭션이 동작한다.

상태: MVP 완료

## Phase 6. Boot

### 산출물

- `@MiniSpringBootApplication`
- `MiniSpringApplication`
- 자동 설정 레지스트리
- 내장 서버 추상화

### 완료 기준

- 예제 앱이 `main()` 한 줄로 실행된다.

상태: MVP 완료
