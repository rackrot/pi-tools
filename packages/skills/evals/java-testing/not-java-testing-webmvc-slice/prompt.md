---
name: not-java-testing-webmvc-slice
description: Near-miss negative. A @WebMvcTest slice whose Spring context fails to start belongs to spring-boot-testing, which java-testing names as out of scope.
tags: [negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

my controller test dies before a single test method runs:

```java
@WebMvcTest(OrderController.class)
class OrderControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void returnsOrder() throws Exception {
        mvc.perform(get("/orders/42")).andExpect(status().isOk());
    }
}
```

```
java.lang.IllegalStateException: Failed to load ApplicationContext
Caused by: org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'orderController'
Caused by: org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'com.acme.order.OrderService' available
```

OrderService is a normal @Service and the app itself starts fine (Spring Boot 3.5). what's missing in the test?
