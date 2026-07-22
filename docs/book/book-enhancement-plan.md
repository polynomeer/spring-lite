# Book Enhancement Plan

이 문서는 `Build Your Own Spring Lite` 원고를 출간 수준으로 끌어올리기 위한 보강 계획 문서다. 목표는 단순 분량 증가가 아니라, 독자가 실제로 구현하고 이해하고 실무에 연결할 수 있는 책으로 다듬는 것이다.

## 1. 현재 강점

- `spring-lite` 코드와 원고가 같은 저장소 안에서 직접 연결되어 있다.
- IoC, AOP, MVC, JDBC, Transaction, Boot, Test를 하나의 런타임 서사로 설명한다.
- build-along 문서와 완성 원고가 분리되어 있어 집필 전개가 명확하다.
- 공식 문서, 대표 서적, 강의, 기술 글의 관점을 원고에 반영하기 시작했다.

## 2. 현재 부족한 점

- 장마다 설명 밀도와 코드 밀도가 일정하지 않다.
- 일부 장은 코드 블록은 있으나 클래스/메서드 구조 해설이 상대적으로 얕다.
- 장 마무리 요약, 디버깅 포인트, 실제 Spring 확장 읽기 가이드가 충분히 통일돼 있지 않다.
- 독자 과제와 체크리스트가 약해 실습서 감각이 덜하다.
- 부록이 더 강한 참고서 역할을 하도록 확장될 여지가 있다.

## 3. 보강 우선순위

### 우선순위 1. 장별 형식 통일

모든 핵심 장이 가능하면 아래 형식을 갖도록 맞춘다.

1. 문제 제기
2. 먼저 실패하거나 기대를 고정하는 테스트
3. 단계별 구현
4. 클래스 구조 해설
5. 메서드 구조 해설
6. 실제 Spring 대응
7. 디버깅 포인트
8. 장 끝 체크리스트

### 우선순위 2. 핵심 클래스 코드 수록량 확대

다음 클래스들은 "핵심 메서드 일부"가 아니라 장에 따라 거의 전체 구현을 수록하는 방향을 검토한다.

- `AnnotationConfigApplicationContext`
- `BeanDefinition`
- `ClassPathScanner`
- `ProxyFactory`
- `AspectBeanPostProcessor`
- `TransactionalBeanPostProcessor`
- `TransactionManager`
- `DispatcherServlet`
- `RequestMappingHandlerMapping`
- `RequestMappingHandlerAdapter`
- `DefaultExceptionResolver`
- `JsonMapper`
- `JdbcTemplate`
- `SpringLiteApplication`
- `SpringLiteTestExtension`

### 우선순위 3. 실무 디버깅 시나리오 확대

각 Part 또는 각 장에 아래와 같은 장애/디버깅 박스를 넣는다.

- 빈 생성 실패
- 다중 후보 주입 충돌
- self-invocation과 트랜잭션 미적용
- 404 / 400 / 500 분기 추적
- rollback-only 전파
- 자동 설정 충돌과 수동 빈 오버라이드

### 우선순위 4. Part 마무리 프레임 강화

각 Part 끝에 아래를 넣는다.

- 이번 Part에서 만든 것
- 아직 의도적으로 생략한 것
- 실무 디버깅 체크 질문
- 실제 Spring에서 이어서 읽을 클래스
- 독자 연습 과제

### 우선순위 5. 부록 강화

추가 가능 항목:

- 용어집
- 애너테이션/추상화 대응표
- 모듈별 파일 인덱스
- 실제 Spring 소스 읽기 순서
- 챕터별 구현 체크리스트

## 4. 실행 순서

1. `complete-manuscript.md`에 Part 마무리 프레임 추가
2. `spring-lite-module-code-guide.md`에 클래스/메서드 구조 해설 보강
3. `build-along-implementation-guide.md`에 구조 해설 보강
4. `complete-manuscript.md`에 남은 장들의 구조 해설과 체크리스트 확장
5. 부록 및 용어집 계열 문서 확장

## 5. 완료 기준

아래 조건을 만족하면 출간본 초안 완성도는 크게 올라간다.

- Part 2~6 모든 핵심 장에 테스트와 구현 코드가 직접 포함된다.
- 주요 클래스의 책임 분해를 독자가 메서드 단위로 설명할 수 있다.
- 각 Part 끝에 요약, 연습, 실제 Spring 확장 읽기 가이드가 있다.
- 디버깅 시나리오가 기능별로 최소 하나 이상 포함된다.
- 완성 원고만 읽어도 설명서이자 구현서 역할을 함께 수행한다.
