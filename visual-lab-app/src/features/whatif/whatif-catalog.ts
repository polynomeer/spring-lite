export interface WhatIfSwitch {
  id: string;
  module: "tx" | "aop" | "context";
  title: string;
  flag: string;
  scenario: string;
  /** The framework line the switch bypasses, as a unified diff. */
  diff: string;
  file: string;
  why: string;
  spring: string;
}

export const whatIfSwitches: WhatIfSwitch[] = [
  {
    id: "rollback-only",
    module: "tx",
    title: "rollback-only 표시 무시",
    flag: "spring.lite.whatif.tx.ignore-rollback-only",
    scenario: "바깥 REQUIRED가 orders에 insert하고, 안쪽 REQUIRED가 audit_log에 insert한 뒤 예외를 던진다. 바깥은 그 예외를 catch한다.",
    diff: "  if (context.rollbackOnly()) {\n-     rollbackConnection(context, rollbackOnlyDetail);\n+     // what-if: 표시를 지우고 그대로 커밋\n+     context.clearRollbackOnly();\n  }",
    file: "spring-lite-tx/.../TransactionManager.java · commit()",
    why: "참여한 메서드가 실패하면 그 작업이 이미 같은 커넥션에 반쯤 쓰여 있다. rollback-only 표시는 바깥이 예외를 삼켜도 그 반쪽짜리 결과가 커밋되지 않게 막는다.",
    spring: "실제 Spring은 이 경우 조용히 롤백하지 않고 바깥 commit에서 UnexpectedRollbackException을 던져, 예외를 삼킨 코드가 결과를 오해하지 않게 한다."
  },
  {
    id: "interceptor-order",
    module: "aop",
    title: "인터셉터 순서 뒤집기",
    flag: "spring.lite.whatif.aop.reverse-interceptor-order",
    scenario: "@Order(1) 감사 어드바이스(@Before)와 @Transactional이 같은 메서드에 걸려 있다. 어드바이스는 실행되는 순간 열린 트랜잭션이 있는지 기록한다.",
    diff: "  List<MethodInterceptor> chain = interceptors;   // order 순으로 정렬됨\n+ if (whatIf) {\n+     Collections.reverse(chain);\n+ }\n  return new SimpleMethodInvocation(target, method, args, chain).proceed();",
    file: "spring-lite-aop/.../ProxyFactory.java · invoke()",
    why: "후처리기들이 붙인 인터셉터는 프록시 하나로 합쳐지고 order로 정렬된다. 이 순서가 \"어드바이스가 트랜잭션 안에서 도는가\"를 정한다. 감사 로그를 트랜잭션과 함께 롤백할지 같은 설계 결정이 여기에 달려 있다.",
    spring: "Spring도 Advisor의 Ordered/@Order로 순서를 정하고, 트랜잭션 어드바이저의 위치는 @EnableTransactionManagement(order = …)로 바꾼다. 비교 앱의 Boot 어댑터가 이 방식으로 순서를 맞췄다."
  },
  {
    id: "class-proxy",
    module: "aop",
    title: "인터페이스 프록시 → 클래스 프록시",
    flag: "spring.lite.whatif.aop.force-class-proxy",
    scenario: "PdfReceiptPrinter는 ReceiptPrinter 인터페이스를 구현하고 후처리기가 프록시로 감싼다. ReceiptDesk는 생성자에서 인터페이스가 아니라 구현 타입(PdfReceiptPrinter)을 요구한다.",
    diff: "- if (interfaces.length == 0) {\n+ if (interfaces.length == 0 || whatIf) {\n      return createClassProxy(proxyTarget, mergedInterceptors);\n  }\n  return Proxy.newProxyInstance(loader, interfaces, handler);",
    file: "spring-lite-aop/.../ProxyFactory.java · createProxy()",
    why: "JDK 동적 프록시는 인터페이스만 구현한 별개 클래스라 구현 타입 자리에 들어갈 수 없다. 대신 final 메서드나 생성자 부작용 같은 하위 클래스 프록시의 함정이 없다. 어떤 프록시를 고르느냐가 주입 가능한 타입을 바꾼다.",
    spring: "Spring Boot는 기본값이 proxyTargetClass=true(CGLIB)라 구현 타입 주입이 그냥 된다. 순수 Spring Framework에서 @EnableTransactionManagement 기본값은 인터페이스 프록시다."
  },
  {
    id: "cycle-detection",
    module: "context",
    title: "순환 참조 감지 끄기",
    flag: "spring.lite.whatif.context.disable-cycle-detection",
    scenario: "InventoryFacade와 ShippingFacade가 생성자로 서로를 요구한다. 임시 컨테이너를 refresh한다.",
    diff: "- if (!beansInCreation.add(beanName)) {\n+ if (!beansInCreation.add(beanName) && !whatIf) {\n      throw new BeansException(\"Circular dependency detected: \" + cycle);\n  }",
    file: "spring-lite-context/.../AnnotationConfigApplicationContext.java · createBean()",
    why: "생성 중인 빈 목록이 없으면 컨테이너는 같은 두 빈을 끝없이 다시 만들려 한다. 결국 StackOverflowError가 나지만 어느 빈이 원인인지는 알려 주지 않는다. 감지 장치는 실패를 막는 게 아니라 실패를 읽을 수 있게 만든다.",
    spring: "Spring은 생성자 순환에서 BeanCurrentlyInCreationException을 던진다. Spring Boot 2.6부터는 필드·세터 순환도 기본으로 금지한다."
  }
];
