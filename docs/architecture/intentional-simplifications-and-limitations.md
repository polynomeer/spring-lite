# Intentional Simplifications And Limitations

이 문서는 `spring-lite`가 의도적으로 단순화한 부분과 아직 확장 과제로 남겨 둔 부분을 구분하기 위한 문서다. 학습용 축소와 단순 미구현을 섞어 읽지 않도록 돕는 것이 목적이다.

## 1. 의도적인 단순화

### 컨테이너 책임 압축

- `AnnotationConfigApplicationContext` 하나에 실제 Spring의 여러 책임을 모아 둔다.
- 이유:
  - 독자가 등록, 생성, 초기화, 후처리를 한 곳에서 연속적으로 볼 수 있게 하기 위해서다.

### 엄격한 순환 참조 실패

- 조기 노출과 다단계 캐시 대신 fail-fast 성격을 택한다.
- 이유:
  - 구조 문제를 빠르게 드러내고 라이프사이클 원리를 선명하게 보여주기 위해서다.

### 단순한 포인트컷 모델

- 메서드명/애너테이션 위주의 최소 모델을 사용한다.
- 이유:
  - AOP의 본질이 "어디에 개입할 것인가"라는 선택 문제라는 점을 먼저 보여주기 위해서다.

### JSON 중심 MVC

- `HttpMessageConverter`, 뷰 렌더링, 콘텐츠 협상 전부를 일반화하지 않는다.
- 이유:
  - 요청 디스패치, 인자 해석, 예외 처리라는 핵심 런타임 흐름을 먼저 학습하기 위해서다.

### `REQUIRED` 중심 트랜잭션

- propagation, isolation, synchronization을 풍부하게 구현하지 않는다.
- 이유:
  - 선언형 트랜잭션의 본질이 프록시 + 인터셉터 + 상태 문맥이라는 점을 먼저 드러내기 위해서다.

## 2. 현재 미구현이지만 자연스러운 확장 영역

### 컨테이너

- `@Primary`
- 컬렉션/지연 주입
- request/session scope
- `BeanFactoryPostProcessor`, `ImportSelector`

### AOP / TX

- advisor abstraction
- 더 풍부한 pointcut 표현식
- propagation 추가
- isolation / timeout / read-only

### Web

- `HttpMessageConverter`
- 콘텐츠 협상
- 정적 리소스 서빙
- 뷰 렌더링

### Boot

- 더 풍부한 auto-configuration 조건
- 외부화 설정 바인딩 확장
- 관측성/운영 인프라

### Test

- 테스트 슬라이스
- fixture 전략
- richer `MockMvc` DSL

## 3. 해석 방법

- 의도적 단순화는 학습 순서를 위한 설계다.
- 미구현 확장은 후속 학습 과제다.
- 둘 다 "부족하다"는 말로 뭉개지지 않도록 분리해서 설명해야 한다.

## 4. 책과 코드에서의 사용법

- 책 본문에서 실제 Spring과 차이를 설명할 때 이 문서를 기준으로 "왜 생략했는가"를 설명한다.
- 구현 백로그를 만들 때는 이 문서의 확장 영역을 출발점으로 삼는다.
