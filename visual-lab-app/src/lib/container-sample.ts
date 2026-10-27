// Generated from GET /lab/container/graph against example-app; refresh by fetching it again.
import type { ContainerGraph } from "./types";

export const containerSample: ContainerGraph = {
  "beans": [
    {
      "name": "exampleApplication",
      "typeName": "lite.spring.example.ExampleApplication",
      "simpleType": "ExampleApplication",
      "definitionKind": "CONFIGURATION",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": []
    },
    {
      "name": "orderController",
      "typeName": "lite.spring.example.order.OrderController",
      "simpleType": "OrderController",
      "definitionKind": "COMPONENT",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": [
        "defaultOrderService"
      ]
    },
    {
      "name": "defaultOrderService",
      "typeName": "lite.spring.example.order.DefaultOrderService",
      "simpleType": "DefaultOrderService",
      "definitionKind": "COMPONENT",
      "scope": "singleton",
      "instantiated": true,
      "proxied": true,
      "dependencies": [
        "jdbcOrderRepository"
      ]
    },
    {
      "name": "jdbcOrderRepository",
      "typeName": "lite.spring.example.order.JdbcOrderRepository",
      "simpleType": "JdbcOrderRepository",
      "definitionKind": "COMPONENT",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": [
        "jdbcTemplate"
      ]
    },
    {
      "name": "appConfig",
      "typeName": "lite.spring.example.config.AppConfig",
      "simpleType": "AppConfig",
      "definitionKind": "CONFIGURATION",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": []
    },
    {
      "name": "jdbcTemplate",
      "typeName": "lite.spring.jdbc.JdbcTemplate",
      "simpleType": "JdbcTemplate",
      "definitionKind": "FACTORY_METHOD",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": [
        "dataSource",
        "transactionManager"
      ]
    },
    {
      "name": "dataSource",
      "typeName": "javax.sql.DataSource",
      "simpleType": "DataSource",
      "definitionKind": "FACTORY_METHOD",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": []
    },
    {
      "name": "transactionalBeanPostProcessor",
      "typeName": "lite.spring.tx.support.TransactionalBeanPostProcessor",
      "simpleType": "TransactionalBeanPostProcessor",
      "definitionKind": "FACTORY_METHOD",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": [
        "transactionManager"
      ]
    },
    {
      "name": "transactionManager",
      "typeName": "lite.spring.tx.support.TransactionManager",
      "simpleType": "TransactionManager",
      "definitionKind": "FACTORY_METHOD",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": [
        "dataSource"
      ]
    },
    {
      "name": "visualLabTraceService",
      "typeName": "lite.spring.example.lab.VisualLabTraceService",
      "simpleType": "VisualLabTraceService",
      "definitionKind": "COMPONENT",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": [
        "defaultOrderService",
        "labDbSnapshotProvider"
      ]
    },
    {
      "name": "labDbSnapshotProvider",
      "typeName": "lite.spring.example.lab.LabDbSnapshotProvider",
      "simpleType": "LabDbSnapshotProvider",
      "definitionKind": "COMPONENT",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": [
        "dataSource",
        "transactionManager"
      ]
    },
    {
      "name": "visualLabTraceController",
      "typeName": "lite.spring.example.lab.VisualLabTraceController",
      "simpleType": "VisualLabTraceController",
      "definitionKind": "COMPONENT",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": [
        "visualLabTraceService"
      ]
    },
    {
      "name": "containerGraphController",
      "typeName": "lite.spring.example.lab.ContainerGraphController",
      "simpleType": "ContainerGraphController",
      "definitionKind": "COMPONENT",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": []
    },
    {
      "name": "sandboxService",
      "typeName": "lite.spring.example.lab.sandbox.SandboxService",
      "simpleType": "SandboxService",
      "definitionKind": "COMPONENT",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": [
        "sandboxTransactions",
        "jdbcTemplate",
        "labDbSnapshotProvider"
      ]
    },
    {
      "name": "sandboxController",
      "typeName": "lite.spring.example.lab.sandbox.SandboxController",
      "simpleType": "SandboxController",
      "definitionKind": "COMPONENT",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": [
        "sandboxService"
      ]
    },
    {
      "name": "sandboxTransactions",
      "typeName": "lite.spring.example.lab.sandbox.SandboxTransactions",
      "simpleType": "SandboxTransactions",
      "definitionKind": "COMPONENT",
      "scope": "singleton",
      "instantiated": true,
      "proxied": true,
      "dependencies": []
    },
    {
      "name": "jsonAutoConfiguration",
      "typeName": "lite.spring.boot.support.autoconfigure.JsonAutoConfiguration",
      "simpleType": "JsonAutoConfiguration",
      "definitionKind": "CONFIGURATION",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": []
    },
    {
      "name": "jsonMapper",
      "typeName": "lite.spring.web.json.JsonMapper",
      "simpleType": "JsonMapper",
      "definitionKind": "FACTORY_METHOD",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": []
    },
    {
      "name": "actuatorAutoConfiguration",
      "typeName": "lite.spring.boot.support.autoconfigure.ActuatorAutoConfiguration",
      "simpleType": "ActuatorAutoConfiguration",
      "definitionKind": "CONFIGURATION",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": []
    },
    {
      "name": "actuatorController",
      "typeName": "lite.spring.boot.actuate.ActuatorController",
      "simpleType": "ActuatorController",
      "definitionKind": "FACTORY_METHOD",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": [
        "commandLineApplicationProperties",
        "metricsRegistry"
      ]
    },
    {
      "name": "apiDocumentationController",
      "typeName": "lite.spring.boot.actuate.ApiDocumentationController",
      "simpleType": "ApiDocumentationController",
      "definitionKind": "FACTORY_METHOD",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": []
    },
    {
      "name": "databaseActuatorController",
      "typeName": "lite.spring.boot.actuate.DatabaseActuatorController",
      "simpleType": "DatabaseActuatorController",
      "definitionKind": "FACTORY_METHOD",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": [
        "dataSource"
      ]
    },
    {
      "name": "aopAutoConfiguration",
      "typeName": "lite.spring.boot.support.autoconfigure.AopAutoConfiguration",
      "simpleType": "AopAutoConfiguration",
      "definitionKind": "CONFIGURATION",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": []
    },
    {
      "name": "metricsRegistry",
      "typeName": "lite.spring.core.metrics.MetricsRegistry",
      "simpleType": "MetricsRegistry",
      "definitionKind": "FACTORY_METHOD",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": []
    },
    {
      "name": "timedBeanPostProcessor",
      "typeName": "lite.spring.aop.support.TimedBeanPostProcessor",
      "simpleType": "TimedBeanPostProcessor",
      "definitionKind": "FACTORY_METHOD",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": [
        "metricsRegistry"
      ]
    },
    {
      "name": "aspectBeanPostProcessor",
      "typeName": "lite.spring.aop.support.AspectBeanPostProcessor",
      "simpleType": "AspectBeanPostProcessor",
      "definitionKind": "FACTORY_METHOD",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": []
    },
    {
      "name": "transactionAutoConfiguration",
      "typeName": "lite.spring.boot.support.autoconfigure.TransactionAutoConfiguration",
      "simpleType": "TransactionAutoConfiguration",
      "definitionKind": "CONFIGURATION",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": []
    },
    {
      "name": "jdbcAutoConfiguration",
      "typeName": "lite.spring.boot.support.autoconfigure.JdbcAutoConfiguration",
      "simpleType": "JdbcAutoConfiguration",
      "definitionKind": "CONFIGURATION",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": []
    },
    {
      "name": "webAutoConfiguration",
      "typeName": "lite.spring.boot.support.autoconfigure.WebAutoConfiguration",
      "simpleType": "WebAutoConfiguration",
      "definitionKind": "CONFIGURATION",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": []
    },
    {
      "name": "webServer",
      "typeName": "lite.spring.boot.web.WebServer",
      "simpleType": "WebServer",
      "definitionKind": "FACTORY_METHOD",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": [
        "dispatcherServlet",
        "webServerFactory",
        "commandLineApplicationProperties"
      ]
    },
    {
      "name": "dispatcherServlet",
      "typeName": "lite.spring.web.support.DispatcherServlet",
      "simpleType": "DispatcherServlet",
      "definitionKind": "FACTORY_METHOD",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": [
        "jsonMapper",
        "metricsRegistry"
      ]
    },
    {
      "name": "webServerFactory",
      "typeName": "lite.spring.boot.web.WebServerFactory",
      "simpleType": "WebServerFactory",
      "definitionKind": "FACTORY_METHOD",
      "scope": "singleton",
      "instantiated": true,
      "proxied": false,
      "dependencies": []
    }
  ],
  "refresh": [
    {
      "seq": 1,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating transactionalBeanPostProcessor.",
      "stack": [
        "transactionalBeanPostProcessor"
      ],
      "attributes": {
        "bean": "transactionalBeanPostProcessor",
        "type": "lite.spring.tx.support.TransactionalBeanPostProcessor",
        "definitionKind": "FACTORY_METHOD",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 2,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating appConfig.",
      "stack": [
        "transactionalBeanPostProcessor",
        "appConfig"
      ],
      "attributes": {
        "bean": "appConfig",
        "type": "lite.spring.example.config.AppConfig",
        "definitionKind": "CONFIGURATION",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 3,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the constructor of appConfig.",
      "stack": [
        "transactionalBeanPostProcessor",
        "appConfig"
      ],
      "attributes": {
        "bean": "appConfig",
        "dependencies": ""
      },
      "snapshot": {}
    },
    {
      "seq": 4,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original appConfig.",
      "stack": [
        "transactionalBeanPostProcessor",
        "appConfig"
      ],
      "attributes": {
        "bean": "appConfig",
        "processors": "",
        "exposedType": "lite.spring.example.config.AppConfig",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 5,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "appConfig is ready and exposed by the container.",
      "stack": [
        "transactionalBeanPostProcessor",
        "appConfig"
      ],
      "attributes": {
        "bean": "appConfig",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 6,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating transactionManager.",
      "stack": [
        "transactionalBeanPostProcessor",
        "transactionManager"
      ],
      "attributes": {
        "bean": "transactionManager",
        "type": "lite.spring.tx.support.TransactionManager",
        "definitionKind": "FACTORY_METHOD",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 7,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating dataSource.",
      "stack": [
        "transactionalBeanPostProcessor",
        "transactionManager",
        "dataSource"
      ],
      "attributes": {
        "bean": "dataSource",
        "type": "javax.sql.DataSource",
        "definitionKind": "FACTORY_METHOD",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 8,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the @Bean method for dataSource.",
      "stack": [
        "transactionalBeanPostProcessor",
        "transactionManager",
        "dataSource"
      ],
      "attributes": {
        "bean": "dataSource",
        "dependencies": ""
      },
      "snapshot": {}
    },
    {
      "seq": 9,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original dataSource.",
      "stack": [
        "transactionalBeanPostProcessor",
        "transactionManager",
        "dataSource"
      ],
      "attributes": {
        "bean": "dataSource",
        "processors": "",
        "exposedType": "lite.spring.jdbc.datasource.DriverManagerDataSource",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 10,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "dataSource is ready and exposed by the container.",
      "stack": [
        "transactionalBeanPostProcessor",
        "transactionManager",
        "dataSource"
      ],
      "attributes": {
        "bean": "dataSource",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 11,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the @Bean method for transactionManager with dataSource.",
      "stack": [
        "transactionalBeanPostProcessor",
        "transactionManager"
      ],
      "attributes": {
        "bean": "transactionManager",
        "dependencies": "dataSource"
      },
      "snapshot": {}
    },
    {
      "seq": 12,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original transactionManager.",
      "stack": [
        "transactionalBeanPostProcessor",
        "transactionManager"
      ],
      "attributes": {
        "bean": "transactionManager",
        "processors": "",
        "exposedType": "lite.spring.tx.support.TransactionManager",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 13,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "transactionManager is ready and exposed by the container.",
      "stack": [
        "transactionalBeanPostProcessor",
        "transactionManager"
      ],
      "attributes": {
        "bean": "transactionManager",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 14,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the @Bean method for transactionalBeanPostProcessor with transactionManager.",
      "stack": [
        "transactionalBeanPostProcessor"
      ],
      "attributes": {
        "bean": "transactionalBeanPostProcessor",
        "dependencies": "transactionManager"
      },
      "snapshot": {}
    },
    {
      "seq": 15,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original transactionalBeanPostProcessor.",
      "stack": [
        "transactionalBeanPostProcessor"
      ],
      "attributes": {
        "bean": "transactionalBeanPostProcessor",
        "processors": "",
        "exposedType": "lite.spring.tx.support.TransactionalBeanPostProcessor",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 16,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "transactionalBeanPostProcessor is ready and exposed by the container.",
      "stack": [
        "transactionalBeanPostProcessor"
      ],
      "attributes": {
        "bean": "transactionalBeanPostProcessor",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 17,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating timedBeanPostProcessor.",
      "stack": [
        "timedBeanPostProcessor"
      ],
      "attributes": {
        "bean": "timedBeanPostProcessor",
        "type": "lite.spring.aop.support.TimedBeanPostProcessor",
        "definitionKind": "FACTORY_METHOD",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 18,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating aopAutoConfiguration.",
      "stack": [
        "timedBeanPostProcessor",
        "aopAutoConfiguration"
      ],
      "attributes": {
        "bean": "aopAutoConfiguration",
        "type": "lite.spring.boot.support.autoconfigure.AopAutoConfiguration",
        "definitionKind": "CONFIGURATION",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 19,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the constructor of aopAutoConfiguration.",
      "stack": [
        "timedBeanPostProcessor",
        "aopAutoConfiguration"
      ],
      "attributes": {
        "bean": "aopAutoConfiguration",
        "dependencies": ""
      },
      "snapshot": {}
    },
    {
      "seq": 20,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original aopAutoConfiguration.",
      "stack": [
        "timedBeanPostProcessor",
        "aopAutoConfiguration"
      ],
      "attributes": {
        "bean": "aopAutoConfiguration",
        "processors": "TransactionalBeanPostProcessor:kept",
        "exposedType": "lite.spring.boot.support.autoconfigure.AopAutoConfiguration",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 21,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "aopAutoConfiguration is ready and exposed by the container.",
      "stack": [
        "timedBeanPostProcessor",
        "aopAutoConfiguration"
      ],
      "attributes": {
        "bean": "aopAutoConfiguration",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 22,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating metricsRegistry.",
      "stack": [
        "timedBeanPostProcessor",
        "metricsRegistry"
      ],
      "attributes": {
        "bean": "metricsRegistry",
        "type": "lite.spring.core.metrics.MetricsRegistry",
        "definitionKind": "FACTORY_METHOD",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 23,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the @Bean method for metricsRegistry.",
      "stack": [
        "timedBeanPostProcessor",
        "metricsRegistry"
      ],
      "attributes": {
        "bean": "metricsRegistry",
        "dependencies": ""
      },
      "snapshot": {}
    },
    {
      "seq": 24,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original metricsRegistry.",
      "stack": [
        "timedBeanPostProcessor",
        "metricsRegistry"
      ],
      "attributes": {
        "bean": "metricsRegistry",
        "processors": "TransactionalBeanPostProcessor:kept",
        "exposedType": "lite.spring.core.metrics.MetricsRegistry",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 25,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "metricsRegistry is ready and exposed by the container.",
      "stack": [
        "timedBeanPostProcessor",
        "metricsRegistry"
      ],
      "attributes": {
        "bean": "metricsRegistry",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 26,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the @Bean method for timedBeanPostProcessor with metricsRegistry.",
      "stack": [
        "timedBeanPostProcessor"
      ],
      "attributes": {
        "bean": "timedBeanPostProcessor",
        "dependencies": "metricsRegistry"
      },
      "snapshot": {}
    },
    {
      "seq": 27,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original timedBeanPostProcessor.",
      "stack": [
        "timedBeanPostProcessor"
      ],
      "attributes": {
        "bean": "timedBeanPostProcessor",
        "processors": "TransactionalBeanPostProcessor:kept",
        "exposedType": "lite.spring.aop.support.TimedBeanPostProcessor",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 28,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "timedBeanPostProcessor is ready and exposed by the container.",
      "stack": [
        "timedBeanPostProcessor"
      ],
      "attributes": {
        "bean": "timedBeanPostProcessor",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 29,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating aspectBeanPostProcessor.",
      "stack": [
        "aspectBeanPostProcessor"
      ],
      "attributes": {
        "bean": "aspectBeanPostProcessor",
        "type": "lite.spring.aop.support.AspectBeanPostProcessor",
        "definitionKind": "FACTORY_METHOD",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 30,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the @Bean method for aspectBeanPostProcessor.",
      "stack": [
        "aspectBeanPostProcessor"
      ],
      "attributes": {
        "bean": "aspectBeanPostProcessor",
        "dependencies": ""
      },
      "snapshot": {}
    },
    {
      "seq": 31,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original aspectBeanPostProcessor.",
      "stack": [
        "aspectBeanPostProcessor"
      ],
      "attributes": {
        "bean": "aspectBeanPostProcessor",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept",
        "exposedType": "lite.spring.aop.support.AspectBeanPostProcessor",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 32,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "aspectBeanPostProcessor is ready and exposed by the container.",
      "stack": [
        "aspectBeanPostProcessor"
      ],
      "attributes": {
        "bean": "aspectBeanPostProcessor",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 33,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating exampleApplication.",
      "stack": [
        "exampleApplication"
      ],
      "attributes": {
        "bean": "exampleApplication",
        "type": "lite.spring.example.ExampleApplication",
        "definitionKind": "CONFIGURATION",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 34,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the constructor of exampleApplication.",
      "stack": [
        "exampleApplication"
      ],
      "attributes": {
        "bean": "exampleApplication",
        "dependencies": ""
      },
      "snapshot": {}
    },
    {
      "seq": 35,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original exampleApplication.",
      "stack": [
        "exampleApplication"
      ],
      "attributes": {
        "bean": "exampleApplication",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.example.ExampleApplication",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 36,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "exampleApplication is ready and exposed by the container.",
      "stack": [
        "exampleApplication"
      ],
      "attributes": {
        "bean": "exampleApplication",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 37,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating jsonAutoConfiguration.",
      "stack": [
        "jsonAutoConfiguration"
      ],
      "attributes": {
        "bean": "jsonAutoConfiguration",
        "type": "lite.spring.boot.support.autoconfigure.JsonAutoConfiguration",
        "definitionKind": "CONFIGURATION",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 38,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the constructor of jsonAutoConfiguration.",
      "stack": [
        "jsonAutoConfiguration"
      ],
      "attributes": {
        "bean": "jsonAutoConfiguration",
        "dependencies": ""
      },
      "snapshot": {}
    },
    {
      "seq": 39,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original jsonAutoConfiguration.",
      "stack": [
        "jsonAutoConfiguration"
      ],
      "attributes": {
        "bean": "jsonAutoConfiguration",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.boot.support.autoconfigure.JsonAutoConfiguration",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 40,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "jsonAutoConfiguration is ready and exposed by the container.",
      "stack": [
        "jsonAutoConfiguration"
      ],
      "attributes": {
        "bean": "jsonAutoConfiguration",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 41,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating actuatorAutoConfiguration.",
      "stack": [
        "actuatorAutoConfiguration"
      ],
      "attributes": {
        "bean": "actuatorAutoConfiguration",
        "type": "lite.spring.boot.support.autoconfigure.ActuatorAutoConfiguration",
        "definitionKind": "CONFIGURATION",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 42,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the constructor of actuatorAutoConfiguration.",
      "stack": [
        "actuatorAutoConfiguration"
      ],
      "attributes": {
        "bean": "actuatorAutoConfiguration",
        "dependencies": ""
      },
      "snapshot": {}
    },
    {
      "seq": 43,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original actuatorAutoConfiguration.",
      "stack": [
        "actuatorAutoConfiguration"
      ],
      "attributes": {
        "bean": "actuatorAutoConfiguration",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.boot.support.autoconfigure.ActuatorAutoConfiguration",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 44,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "actuatorAutoConfiguration is ready and exposed by the container.",
      "stack": [
        "actuatorAutoConfiguration"
      ],
      "attributes": {
        "bean": "actuatorAutoConfiguration",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 45,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating transactionAutoConfiguration.",
      "stack": [
        "transactionAutoConfiguration"
      ],
      "attributes": {
        "bean": "transactionAutoConfiguration",
        "type": "lite.spring.boot.support.autoconfigure.TransactionAutoConfiguration",
        "definitionKind": "CONFIGURATION",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 46,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the constructor of transactionAutoConfiguration.",
      "stack": [
        "transactionAutoConfiguration"
      ],
      "attributes": {
        "bean": "transactionAutoConfiguration",
        "dependencies": ""
      },
      "snapshot": {}
    },
    {
      "seq": 47,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original transactionAutoConfiguration.",
      "stack": [
        "transactionAutoConfiguration"
      ],
      "attributes": {
        "bean": "transactionAutoConfiguration",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.boot.support.autoconfigure.TransactionAutoConfiguration",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 48,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "transactionAutoConfiguration is ready and exposed by the container.",
      "stack": [
        "transactionAutoConfiguration"
      ],
      "attributes": {
        "bean": "transactionAutoConfiguration",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 49,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating jdbcAutoConfiguration.",
      "stack": [
        "jdbcAutoConfiguration"
      ],
      "attributes": {
        "bean": "jdbcAutoConfiguration",
        "type": "lite.spring.boot.support.autoconfigure.JdbcAutoConfiguration",
        "definitionKind": "CONFIGURATION",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 50,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the constructor of jdbcAutoConfiguration.",
      "stack": [
        "jdbcAutoConfiguration"
      ],
      "attributes": {
        "bean": "jdbcAutoConfiguration",
        "dependencies": ""
      },
      "snapshot": {}
    },
    {
      "seq": 51,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original jdbcAutoConfiguration.",
      "stack": [
        "jdbcAutoConfiguration"
      ],
      "attributes": {
        "bean": "jdbcAutoConfiguration",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.boot.support.autoconfigure.JdbcAutoConfiguration",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 52,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "jdbcAutoConfiguration is ready and exposed by the container.",
      "stack": [
        "jdbcAutoConfiguration"
      ],
      "attributes": {
        "bean": "jdbcAutoConfiguration",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 53,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating webAutoConfiguration.",
      "stack": [
        "webAutoConfiguration"
      ],
      "attributes": {
        "bean": "webAutoConfiguration",
        "type": "lite.spring.boot.support.autoconfigure.WebAutoConfiguration",
        "definitionKind": "CONFIGURATION",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 54,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the constructor of webAutoConfiguration.",
      "stack": [
        "webAutoConfiguration"
      ],
      "attributes": {
        "bean": "webAutoConfiguration",
        "dependencies": ""
      },
      "snapshot": {}
    },
    {
      "seq": 55,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original webAutoConfiguration.",
      "stack": [
        "webAutoConfiguration"
      ],
      "attributes": {
        "bean": "webAutoConfiguration",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.boot.support.autoconfigure.WebAutoConfiguration",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 56,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "webAutoConfiguration is ready and exposed by the container.",
      "stack": [
        "webAutoConfiguration"
      ],
      "attributes": {
        "bean": "webAutoConfiguration",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 57,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating orderController.",
      "stack": [
        "orderController"
      ],
      "attributes": {
        "bean": "orderController",
        "type": "lite.spring.example.order.OrderController",
        "definitionKind": "COMPONENT",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 58,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating defaultOrderService.",
      "stack": [
        "orderController",
        "defaultOrderService"
      ],
      "attributes": {
        "bean": "defaultOrderService",
        "type": "lite.spring.example.order.DefaultOrderService",
        "definitionKind": "COMPONENT",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 59,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating jdbcOrderRepository.",
      "stack": [
        "orderController",
        "defaultOrderService",
        "jdbcOrderRepository"
      ],
      "attributes": {
        "bean": "jdbcOrderRepository",
        "type": "lite.spring.example.order.JdbcOrderRepository",
        "definitionKind": "COMPONENT",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 60,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating jdbcTemplate.",
      "stack": [
        "orderController",
        "defaultOrderService",
        "jdbcOrderRepository",
        "jdbcTemplate"
      ],
      "attributes": {
        "bean": "jdbcTemplate",
        "type": "lite.spring.jdbc.JdbcTemplate",
        "definitionKind": "FACTORY_METHOD",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 61,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the @Bean method for jdbcTemplate with dataSource, transactionManager.",
      "stack": [
        "orderController",
        "defaultOrderService",
        "jdbcOrderRepository",
        "jdbcTemplate"
      ],
      "attributes": {
        "bean": "jdbcTemplate",
        "dependencies": "dataSource,transactionManager"
      },
      "snapshot": {}
    },
    {
      "seq": 62,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original jdbcTemplate.",
      "stack": [
        "orderController",
        "defaultOrderService",
        "jdbcOrderRepository",
        "jdbcTemplate"
      ],
      "attributes": {
        "bean": "jdbcTemplate",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.jdbc.JdbcTemplate",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 63,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "jdbcTemplate is ready and exposed by the container.",
      "stack": [
        "orderController",
        "defaultOrderService",
        "jdbcOrderRepository",
        "jdbcTemplate"
      ],
      "attributes": {
        "bean": "jdbcTemplate",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 64,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the constructor of jdbcOrderRepository with jdbcTemplate.",
      "stack": [
        "orderController",
        "defaultOrderService",
        "jdbcOrderRepository"
      ],
      "attributes": {
        "bean": "jdbcOrderRepository",
        "dependencies": "jdbcTemplate"
      },
      "snapshot": {}
    },
    {
      "seq": 65,
      "layer": "container",
      "kind": "init",
      "marker": "@PostConstruct",
      "detail": "Ran @PostConstruct on jdbcOrderRepository.",
      "stack": [
        "orderController",
        "defaultOrderService",
        "jdbcOrderRepository"
      ],
      "attributes": {
        "bean": "jdbcOrderRepository"
      },
      "snapshot": {}
    },
    {
      "seq": 66,
      "layer": "jdbc",
      "kind": "update",
      "marker": "create",
      "detail": "Ran on its own connection: create table if not exists orders (\n    id bigint auto_increment primary key,\n    product varchar(255) not null,\n    quantity integer not null,\n    status varchar(64) not null\n)\n",
      "stack": [
        "orderController",
        "defaultOrderService",
        "jdbcOrderRepository"
      ],
      "attributes": {
        "sql": "create table if not exists orders (\n    id bigint auto_increment primary key,\n    product varchar(255) not null,\n    quantity integer not null,\n    status varchar(64) not null\n)\n",
        "rows": "0"
      },
      "snapshot": {}
    },
    {
      "seq": 67,
      "layer": "jdbc",
      "kind": "update",
      "marker": "delete",
      "detail": "Ran on its own connection: delete from orders",
      "stack": [
        "orderController",
        "defaultOrderService",
        "jdbcOrderRepository"
      ],
      "attributes": {
        "sql": "delete from orders",
        "rows": "0"
      },
      "snapshot": {}
    },
    {
      "seq": 68,
      "layer": "jdbc",
      "kind": "update",
      "marker": "insert",
      "detail": "Ran on its own connection: insert into orders(product, quantity, status) values (?, ?, ?)",
      "stack": [
        "orderController",
        "defaultOrderService",
        "jdbcOrderRepository"
      ],
      "attributes": {
        "sql": "insert into orders(product, quantity, status) values (?, ?, ?)",
        "rows": "1"
      },
      "snapshot": {}
    },
    {
      "seq": 69,
      "layer": "jdbc",
      "kind": "query",
      "marker": "select",
      "detail": "Ran on its own connection: select id, product, quantity, status from orders order by id desc limit 1",
      "stack": [
        "orderController",
        "defaultOrderService",
        "jdbcOrderRepository"
      ],
      "attributes": {
        "sql": "select id, product, quantity, status from orders order by id desc limit 1",
        "rows": "1"
      },
      "snapshot": {}
    },
    {
      "seq": 70,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original jdbcOrderRepository.",
      "stack": [
        "orderController",
        "defaultOrderService",
        "jdbcOrderRepository"
      ],
      "attributes": {
        "bean": "jdbcOrderRepository",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.example.order.JdbcOrderRepository",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 71,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "jdbcOrderRepository is ready and exposed by the container.",
      "stack": [
        "orderController",
        "defaultOrderService",
        "jdbcOrderRepository"
      ],
      "attributes": {
        "bean": "jdbcOrderRepository",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 72,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the constructor of defaultOrderService with jdbcOrderRepository.",
      "stack": [
        "orderController",
        "defaultOrderService"
      ],
      "attributes": {
        "bean": "defaultOrderService",
        "dependencies": "jdbcOrderRepository"
      },
      "snapshot": {}
    },
    {
      "seq": 73,
      "layer": "container",
      "kind": "post-process",
      "marker": "proxy",
      "detail": "A BeanPostProcessor replaced defaultOrderService with $Proxy19.",
      "stack": [
        "orderController",
        "defaultOrderService"
      ],
      "attributes": {
        "bean": "defaultOrderService",
        "processors": "TransactionalBeanPostProcessor:replaced,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "jdk.proxy2.$Proxy19",
        "proxied": "true"
      },
      "snapshot": {}
    },
    {
      "seq": 74,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "defaultOrderService is ready and exposed by the container.",
      "stack": [
        "orderController",
        "defaultOrderService"
      ],
      "attributes": {
        "bean": "defaultOrderService",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 75,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the constructor of orderController with defaultOrderService.",
      "stack": [
        "orderController"
      ],
      "attributes": {
        "bean": "orderController",
        "dependencies": "defaultOrderService"
      },
      "snapshot": {}
    },
    {
      "seq": 76,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original orderController.",
      "stack": [
        "orderController"
      ],
      "attributes": {
        "bean": "orderController",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.example.order.OrderController",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 77,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "orderController is ready and exposed by the container.",
      "stack": [
        "orderController"
      ],
      "attributes": {
        "bean": "orderController",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 78,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating visualLabTraceService.",
      "stack": [
        "visualLabTraceService"
      ],
      "attributes": {
        "bean": "visualLabTraceService",
        "type": "lite.spring.example.lab.VisualLabTraceService",
        "definitionKind": "COMPONENT",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 79,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating labDbSnapshotProvider.",
      "stack": [
        "visualLabTraceService",
        "labDbSnapshotProvider"
      ],
      "attributes": {
        "bean": "labDbSnapshotProvider",
        "type": "lite.spring.example.lab.LabDbSnapshotProvider",
        "definitionKind": "COMPONENT",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 80,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the constructor of labDbSnapshotProvider with dataSource, transactionManager.",
      "stack": [
        "visualLabTraceService",
        "labDbSnapshotProvider"
      ],
      "attributes": {
        "bean": "labDbSnapshotProvider",
        "dependencies": "dataSource,transactionManager"
      },
      "snapshot": {}
    },
    {
      "seq": 81,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original labDbSnapshotProvider.",
      "stack": [
        "visualLabTraceService",
        "labDbSnapshotProvider"
      ],
      "attributes": {
        "bean": "labDbSnapshotProvider",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.example.lab.LabDbSnapshotProvider",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 82,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "labDbSnapshotProvider is ready and exposed by the container.",
      "stack": [
        "visualLabTraceService",
        "labDbSnapshotProvider"
      ],
      "attributes": {
        "bean": "labDbSnapshotProvider",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 83,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the constructor of visualLabTraceService with defaultOrderService, labDbSnapshotProvider.",
      "stack": [
        "visualLabTraceService"
      ],
      "attributes": {
        "bean": "visualLabTraceService",
        "dependencies": "defaultOrderService,labDbSnapshotProvider"
      },
      "snapshot": {}
    },
    {
      "seq": 84,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original visualLabTraceService.",
      "stack": [
        "visualLabTraceService"
      ],
      "attributes": {
        "bean": "visualLabTraceService",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.example.lab.VisualLabTraceService",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 85,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "visualLabTraceService is ready and exposed by the container.",
      "stack": [
        "visualLabTraceService"
      ],
      "attributes": {
        "bean": "visualLabTraceService",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 86,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating visualLabTraceController.",
      "stack": [
        "visualLabTraceController"
      ],
      "attributes": {
        "bean": "visualLabTraceController",
        "type": "lite.spring.example.lab.VisualLabTraceController",
        "definitionKind": "COMPONENT",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 87,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the constructor of visualLabTraceController with visualLabTraceService.",
      "stack": [
        "visualLabTraceController"
      ],
      "attributes": {
        "bean": "visualLabTraceController",
        "dependencies": "visualLabTraceService"
      },
      "snapshot": {}
    },
    {
      "seq": 88,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original visualLabTraceController.",
      "stack": [
        "visualLabTraceController"
      ],
      "attributes": {
        "bean": "visualLabTraceController",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.example.lab.VisualLabTraceController",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 89,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "visualLabTraceController is ready and exposed by the container.",
      "stack": [
        "visualLabTraceController"
      ],
      "attributes": {
        "bean": "visualLabTraceController",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 90,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating containerGraphController.",
      "stack": [
        "containerGraphController"
      ],
      "attributes": {
        "bean": "containerGraphController",
        "type": "lite.spring.example.lab.ContainerGraphController",
        "definitionKind": "COMPONENT",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 91,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the constructor of containerGraphController.",
      "stack": [
        "containerGraphController"
      ],
      "attributes": {
        "bean": "containerGraphController",
        "dependencies": ""
      },
      "snapshot": {}
    },
    {
      "seq": 92,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original containerGraphController.",
      "stack": [
        "containerGraphController"
      ],
      "attributes": {
        "bean": "containerGraphController",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.example.lab.ContainerGraphController",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 93,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "containerGraphController is ready and exposed by the container.",
      "stack": [
        "containerGraphController"
      ],
      "attributes": {
        "bean": "containerGraphController",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 94,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating sandboxService.",
      "stack": [
        "sandboxService"
      ],
      "attributes": {
        "bean": "sandboxService",
        "type": "lite.spring.example.lab.sandbox.SandboxService",
        "definitionKind": "COMPONENT",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 95,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating sandboxTransactions.",
      "stack": [
        "sandboxService",
        "sandboxTransactions"
      ],
      "attributes": {
        "bean": "sandboxTransactions",
        "type": "lite.spring.example.lab.sandbox.SandboxTransactions",
        "definitionKind": "COMPONENT",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 96,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the constructor of sandboxTransactions.",
      "stack": [
        "sandboxService",
        "sandboxTransactions"
      ],
      "attributes": {
        "bean": "sandboxTransactions",
        "dependencies": ""
      },
      "snapshot": {}
    },
    {
      "seq": 97,
      "layer": "container",
      "kind": "post-process",
      "marker": "proxy",
      "detail": "A BeanPostProcessor replaced sandboxTransactions with SandboxTransactions$ByteBuddy$wRiZXsif.",
      "stack": [
        "sandboxService",
        "sandboxTransactions"
      ],
      "attributes": {
        "bean": "sandboxTransactions",
        "processors": "TransactionalBeanPostProcessor:replaced,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.example.lab.sandbox.SandboxTransactions$ByteBuddy$wRiZXsif",
        "proxied": "true"
      },
      "snapshot": {}
    },
    {
      "seq": 98,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "sandboxTransactions is ready and exposed by the container.",
      "stack": [
        "sandboxService",
        "sandboxTransactions"
      ],
      "attributes": {
        "bean": "sandboxTransactions",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 99,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the constructor of sandboxService with sandboxTransactions, jdbcTemplate, labDbSnapshotProvider.",
      "stack": [
        "sandboxService"
      ],
      "attributes": {
        "bean": "sandboxService",
        "dependencies": "sandboxTransactions,jdbcTemplate,labDbSnapshotProvider"
      },
      "snapshot": {}
    },
    {
      "seq": 100,
      "layer": "container",
      "kind": "init",
      "marker": "@PostConstruct",
      "detail": "Ran @PostConstruct on sandboxService.",
      "stack": [
        "sandboxService"
      ],
      "attributes": {
        "bean": "sandboxService"
      },
      "snapshot": {}
    },
    {
      "seq": 101,
      "layer": "jdbc",
      "kind": "update",
      "marker": "create",
      "detail": "Ran on its own connection: create table if not exists lab_sandbox_row (\n    id bigint auto_increment primary key,\n    run_id varchar(36) not null,\n    target_table varchar(32) not null,\n    label varchar(64) not null\n)\n",
      "stack": [
        "sandboxService"
      ],
      "attributes": {
        "sql": "create table if not exists lab_sandbox_row (\n    id bigint auto_increment primary key,\n    run_id varchar(36) not null,\n    target_table varchar(32) not null,\n    label varchar(64) not null\n)\n",
        "rows": "0"
      },
      "snapshot": {}
    },
    {
      "seq": 102,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original sandboxService.",
      "stack": [
        "sandboxService"
      ],
      "attributes": {
        "bean": "sandboxService",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.example.lab.sandbox.SandboxService",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 103,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "sandboxService is ready and exposed by the container.",
      "stack": [
        "sandboxService"
      ],
      "attributes": {
        "bean": "sandboxService",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 104,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating sandboxController.",
      "stack": [
        "sandboxController"
      ],
      "attributes": {
        "bean": "sandboxController",
        "type": "lite.spring.example.lab.sandbox.SandboxController",
        "definitionKind": "COMPONENT",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 105,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the constructor of sandboxController with sandboxService.",
      "stack": [
        "sandboxController"
      ],
      "attributes": {
        "bean": "sandboxController",
        "dependencies": "sandboxService"
      },
      "snapshot": {}
    },
    {
      "seq": 106,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original sandboxController.",
      "stack": [
        "sandboxController"
      ],
      "attributes": {
        "bean": "sandboxController",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.example.lab.sandbox.SandboxController",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 107,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "sandboxController is ready and exposed by the container.",
      "stack": [
        "sandboxController"
      ],
      "attributes": {
        "bean": "sandboxController",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 108,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating jsonMapper.",
      "stack": [
        "jsonMapper"
      ],
      "attributes": {
        "bean": "jsonMapper",
        "type": "lite.spring.web.json.JsonMapper",
        "definitionKind": "FACTORY_METHOD",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 109,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the @Bean method for jsonMapper.",
      "stack": [
        "jsonMapper"
      ],
      "attributes": {
        "bean": "jsonMapper",
        "dependencies": ""
      },
      "snapshot": {}
    },
    {
      "seq": 110,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original jsonMapper.",
      "stack": [
        "jsonMapper"
      ],
      "attributes": {
        "bean": "jsonMapper",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.web.json.JsonMapper",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 111,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "jsonMapper is ready and exposed by the container.",
      "stack": [
        "jsonMapper"
      ],
      "attributes": {
        "bean": "jsonMapper",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 112,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating actuatorController.",
      "stack": [
        "actuatorController"
      ],
      "attributes": {
        "bean": "actuatorController",
        "type": "lite.spring.boot.actuate.ActuatorController",
        "definitionKind": "FACTORY_METHOD",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 113,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the @Bean method for actuatorController with commandLineApplicationProperties, metricsRegistry.",
      "stack": [
        "actuatorController"
      ],
      "attributes": {
        "bean": "actuatorController",
        "dependencies": "commandLineApplicationProperties,metricsRegistry"
      },
      "snapshot": {}
    },
    {
      "seq": 114,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original actuatorController.",
      "stack": [
        "actuatorController"
      ],
      "attributes": {
        "bean": "actuatorController",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.boot.actuate.ActuatorController",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 115,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "actuatorController is ready and exposed by the container.",
      "stack": [
        "actuatorController"
      ],
      "attributes": {
        "bean": "actuatorController",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 116,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating apiDocumentationController.",
      "stack": [
        "apiDocumentationController"
      ],
      "attributes": {
        "bean": "apiDocumentationController",
        "type": "lite.spring.boot.actuate.ApiDocumentationController",
        "definitionKind": "FACTORY_METHOD",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 117,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the @Bean method for apiDocumentationController.",
      "stack": [
        "apiDocumentationController"
      ],
      "attributes": {
        "bean": "apiDocumentationController",
        "dependencies": ""
      },
      "snapshot": {}
    },
    {
      "seq": 118,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original apiDocumentationController.",
      "stack": [
        "apiDocumentationController"
      ],
      "attributes": {
        "bean": "apiDocumentationController",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.boot.actuate.ApiDocumentationController",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 119,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "apiDocumentationController is ready and exposed by the container.",
      "stack": [
        "apiDocumentationController"
      ],
      "attributes": {
        "bean": "apiDocumentationController",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 120,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating databaseActuatorController.",
      "stack": [
        "databaseActuatorController"
      ],
      "attributes": {
        "bean": "databaseActuatorController",
        "type": "lite.spring.boot.actuate.DatabaseActuatorController",
        "definitionKind": "FACTORY_METHOD",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 121,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the @Bean method for databaseActuatorController with dataSource.",
      "stack": [
        "databaseActuatorController"
      ],
      "attributes": {
        "bean": "databaseActuatorController",
        "dependencies": "dataSource"
      },
      "snapshot": {}
    },
    {
      "seq": 122,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original databaseActuatorController.",
      "stack": [
        "databaseActuatorController"
      ],
      "attributes": {
        "bean": "databaseActuatorController",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.boot.actuate.DatabaseActuatorController",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 123,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "databaseActuatorController is ready and exposed by the container.",
      "stack": [
        "databaseActuatorController"
      ],
      "attributes": {
        "bean": "databaseActuatorController",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 124,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating webServer.",
      "stack": [
        "webServer"
      ],
      "attributes": {
        "bean": "webServer",
        "type": "lite.spring.boot.web.WebServer",
        "definitionKind": "FACTORY_METHOD",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 125,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating dispatcherServlet.",
      "stack": [
        "webServer",
        "dispatcherServlet"
      ],
      "attributes": {
        "bean": "dispatcherServlet",
        "type": "lite.spring.web.support.DispatcherServlet",
        "definitionKind": "FACTORY_METHOD",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 126,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the @Bean method for dispatcherServlet with jsonMapper, metricsRegistry.",
      "stack": [
        "webServer",
        "dispatcherServlet"
      ],
      "attributes": {
        "bean": "dispatcherServlet",
        "dependencies": "jsonMapper,metricsRegistry"
      },
      "snapshot": {}
    },
    {
      "seq": 127,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original dispatcherServlet.",
      "stack": [
        "webServer",
        "dispatcherServlet"
      ],
      "attributes": {
        "bean": "dispatcherServlet",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.web.support.DispatcherServlet",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 128,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "dispatcherServlet is ready and exposed by the container.",
      "stack": [
        "webServer",
        "dispatcherServlet"
      ],
      "attributes": {
        "bean": "dispatcherServlet",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 129,
      "layer": "container",
      "kind": "create",
      "marker": "create",
      "detail": "Started creating webServerFactory.",
      "stack": [
        "webServer",
        "webServerFactory"
      ],
      "attributes": {
        "bean": "webServerFactory",
        "type": "lite.spring.boot.web.WebServerFactory",
        "definitionKind": "FACTORY_METHOD",
        "scope": "singleton"
      },
      "snapshot": {}
    },
    {
      "seq": 130,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the @Bean method for webServerFactory.",
      "stack": [
        "webServer",
        "webServerFactory"
      ],
      "attributes": {
        "bean": "webServerFactory",
        "dependencies": ""
      },
      "snapshot": {}
    },
    {
      "seq": 131,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original webServerFactory.",
      "stack": [
        "webServer",
        "webServerFactory"
      ],
      "attributes": {
        "bean": "webServerFactory",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.boot.web.JdkWebServerFactory",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 132,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "webServerFactory is ready and exposed by the container.",
      "stack": [
        "webServer",
        "webServerFactory"
      ],
      "attributes": {
        "bean": "webServerFactory",
        "destroyCallback": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 133,
      "layer": "container",
      "kind": "instantiate",
      "marker": "new",
      "detail": "Called the @Bean method for webServer with dispatcherServlet, webServerFactory, commandLineApplicationProperties.",
      "stack": [
        "webServer"
      ],
      "attributes": {
        "bean": "webServer",
        "dependencies": "dispatcherServlet,webServerFactory,commandLineApplicationProperties"
      },
      "snapshot": {}
    },
    {
      "seq": 134,
      "layer": "container",
      "kind": "post-process",
      "marker": "kept",
      "detail": "BeanPostProcessors kept the original webServer.",
      "stack": [
        "webServer"
      ],
      "attributes": {
        "bean": "webServer",
        "processors": "TransactionalBeanPostProcessor:kept,TimedBeanPostProcessor:kept,AspectBeanPostProcessor:kept",
        "exposedType": "lite.spring.boot.web.JdkWebServer",
        "proxied": "false"
      },
      "snapshot": {}
    },
    {
      "seq": 135,
      "layer": "container",
      "kind": "ready",
      "marker": "ready",
      "detail": "webServer is ready and exposed by the container.",
      "stack": [
        "webServer"
      ],
      "attributes": {
        "bean": "webServer",
        "destroyCallback": "true"
      },
      "snapshot": {}
    }
  ]
};
