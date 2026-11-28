---
name: route-negative-webmvc-slice-test
description: "Near miss: a failing @WebMvcTest slice belongs to spring-boot-testing, not to spring-boot."
tags: [negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

my controller test stopped working after the upgrade. `src/test/java/com/acme/orders/OrderControllerTest.java`:

```java
@WebMvcTest(OrderController.class)
class OrderControllerTest {
  @Autowired MockMvc mvc;
  @MockBean OrderService orders;

  @Test
  void createsOrder() throws Exception {
    mvc.perform(post("/api/orders").contentType(APPLICATION_JSON).content("{\"sku\":\"A1\"}"))
        .andExpect(status().isCreated());
  }
}
```

It no longer compiles (`cannot find symbol: class MockBean`), and a colleague says that once it compiles the POST will come back 403 anyway. Fix the test class.
