# Runtime Sequence Diagrams

이 문서는 `spring-lite`의 핵심 런타임 메서드를 시퀀스 다이어그램으로 정리한 문서다. 책 본문과 코드를 함께 읽을 때 호출 순서를 빠르게 붙잡는 데 목적이 있다.

## 1. `AnnotationConfigApplicationContext.refresh()`

```mermaid
sequenceDiagram
    participant User
    participant Ctx as AnnotationConfigApplicationContext
    participant BPP as BeanPostProcessors
    participant Config as Configuration Beans
    participant Beans as Remaining Singletons

    User->>Ctx: refresh()
    Ctx->>Ctx: instantiateBeanPostProcessors()
    Ctx->>BPP: register/sort
    Ctx->>Ctx: instantiateConfigurationBeans()
    Ctx->>Config: createBean(...)
    Ctx->>Ctx: instantiateBeanPostProcessors()
    Ctx->>Ctx: instantiateRemainingSingletons()
    Ctx->>Beans: createBean(...)
    Ctx->>Ctx: publishEvent(ContextRefreshedEvent)
```

## 2. `AnnotationConfigApplicationContext.createBean()`

```mermaid
sequenceDiagram
    participant Ctx as ApplicationContext
    participant Def as BeanDefinition
    participant Target as Bean Instance
    participant BPP as BeanPostProcessors

    Ctx->>Ctx: check singleton cache
    Ctx->>Ctx: mark beansInCreation
    alt factory method bean
        Ctx->>Ctx: invokeFactoryMethod(...)
    else component/config bean
        Ctx->>Ctx: instantiateWithConstructor(...)
    end
    Ctx->>Ctx: initializeBean(...)
    Ctx->>BPP: postProcessBeforeInitialization(...)
    Ctx->>Target: @PostConstruct / init callbacks
    Ctx->>BPP: postProcessAfterInitialization(...)
    Ctx->>Ctx: cache singleton if needed
    Ctx->>Ctx: unmark beansInCreation
```

## 3. 프록시 합성과 호출 체인

```mermaid
sequenceDiagram
    participant Ctx as ApplicationContext
    participant Post as Aspect/Tx BPP
    participant Proxy as ProxyFactory
    participant Call as MethodInvocation
    participant Target as Target Bean

    Ctx->>Post: postProcessAfterInitialization(bean)
    Post->>Proxy: createProxy(bean, interceptors)
    Proxy-->>Ctx: proxied bean
    Note over Ctx,Proxy: 이후 호출은 프록시 경유
    Proxy->>Call: invoke()
    Call->>Call: interceptor 1
    Call->>Call: interceptor 2
    Call->>Target: actual method invocation
```

## 4. `TransactionInterceptor.invoke()`

```mermaid
sequenceDiagram
    participant Client
    participant Proxy
    participant TxInt as TransactionInterceptor
    participant TxMgr as TransactionManager
    participant Target

    Client->>Proxy: service method call
    Proxy->>TxInt: invoke(invocation)
    TxInt->>TxMgr: begin()
    TxInt->>Target: proceed()
    alt success
        TxInt->>TxMgr: commit()
    else failure
        TxInt->>TxMgr: rollback() or commit()
    end
    TxInt-->>Client: return / throw
```

## 5. `DispatcherServlet.handle()`

```mermaid
sequenceDiagram
    participant Client
    participant Servlet as DispatcherServlet
    participant Mapping as HandlerMapping
    participant Adapter as HandlerAdapter
    participant Resolver as ExceptionResolver
    participant Return as ReturnValueHandler
    participant Controller

    Client->>Servlet: HTTP request
    Servlet->>Mapping: getHandler(exchange)
    alt no handler
        Servlet->>Return: write 404 body
    else handler found
        Servlet->>Adapter: handle(match, exchange)
        Adapter->>Controller: invoke method
        Controller-->>Adapter: result
        Adapter-->>Servlet: result
        Servlet->>Return: write 200 body
    end
    opt exception
        Servlet->>Resolver: resolve(exception, handler)
        Resolver-->>Servlet: status + body
        Servlet->>Return: write error body
    end
```

## 6. `SpringLiteTestExtension`

```mermaid
sequenceDiagram
    participant JUnit
    participant Ext as SpringLiteTestExtension
    participant Ctx as ApplicationContext
    participant Tx as TransactionManager

    JUnit->>Ext: beforeAll()
    Ext->>Ctx: create or load context
    JUnit->>Ext: postProcessTestInstance()
    Ext->>Ctx: resolve beans for fields
    JUnit->>Ext: beforeEach()
    opt transactional test
        Ext->>Tx: begin()
    end
    JUnit->>Ext: resolveParameter()
    Ext->>Ctx: resolve bean / MockMvc
    JUnit->>Ext: afterEach()
    opt transactional test
        Ext->>Tx: rollback()
    end
```
