---
name: spring-boot-testing
description: 'Read before answering any question about a Spring Boot test that starts a Spring context, even when the fix looks obvious: Boot 3.4+ and 4 changed test APIs (@MockBean removed, slice packages and test starters moved). Use for a controller or slice test that fails to start ("No qualifying bean"), 403 on a mock POST or DELETE, @MockBean errors after an upgrade, a slow @SpringBootTest that rebuilds its context, and for writing @WebMvcTest, @DataJpaTest or @WebFluxTest slices, @MockitoBean, MockMvcTester, Testcontainers with @ServiceConnection and Spring Security tests (@WithMockUser, jwt(), csrf()). Not for plain JUnit or Mockito without Spring (java-testing) or application code (spring-boot).'
---

# Spring Boot testing

Pick the narrowest test that proves the behavior, then keep the application context cache warm. Match the Boot line first: read the parent or `org.springframework.boot` plugin version (3.5.x vs 4.x). Boot 4 changed packages, starters and a few test types; see [references/sb4-migration.md](references/sb4-migration.md).

Not for: plain JUnit or Mockito with no Spring context (`java-testing` or `kotlin-testing`), application code, configuration or wiring (`spring-boot`), or build files (`maven`, `gradle`).

## Choose the test

| Question | Test | Loads |
| --- | --- | --- |
| Pure logic, collaborators mockable by constructor | plain JUnit + Mockito, no annotation | nothing |
| Request mapping, validation, status, JSON body, security rules | `@WebMvcTest(Controller.class)` | MVC beans only |
| Reactive controller | `@WebFluxTest` + `WebTestClient` | WebFlux beans only |
| Custom JPA query, mapping, cascade | `@DataJpaTest` on a real database | JPA beans, DataSource |
| Outbound `RestClient`/`RestTemplate` calls | `@RestClientTest` + `MockRestServiceServer` | the client bean |
| Custom (de)serializer | `@JsonTest` | Jackson only |
| Wiring, filters plus database, full request flow | `@SpringBootTest`, listing `classes` where possible | everything requested |

Read [references/slices.md](references/slices.md) for what each slice includes and the "No qualifying bean" causes. Default to a slice. One slice per test class; do not mix `@WebMvcTest` and `@DataJpaTest`.

## Rules

- Replace beans with `@MockitoBean` and `@MockitoSpyBean` (`org.springframework.test.context.bean.override.mockito`). `@MockBean` and `@SpyBean` are deprecated on Boot 3.4+ and removed in Boot 4. Never write them.
- A `@WebMvcTest` slice does not load `@Service` or `@Repository` beans. Add a `@MockitoBean` for each constructor dependency of the controller, or the context fails with "No qualifying bean".
- Do not put `@MockitoBean` in a `@DataJpaTest`; the point of that slice is the real repository.
- Assert with AssertJ. For MVC use `MockMvcTester`, and read [references/mockmvc.md](references/mockmvc.md) for request, body and `convertTo` patterns. On Boot 4 an in-server client test uses `RestTestClient` (add `@AutoConfigureRestTestClient` and the `spring-boot-resttestclient` module or `spring-boot-starter-restclient-test`); on Boot 3 use `TestRestTemplate`.
- Use a real database through Testcontainers and `@ServiceConnection`, not H2, when SQL dialect matters. Read [references/testcontainers.md](references/testcontainers.md) for setup, reuse and the `@DynamicPropertySource` fallback.
- Share fixtures through `@TestConfiguration` classes (or `@Import`), not per-class mock variations.
- Cover the failure path too: a not-found service call, a validation error, a 401 and a 403. Name tests for the behavior.
- Run the narrowest command first (`./mvnw -q test -Dtest=OrderControllerTest` or `./gradlew test --tests OrderControllerTest`), then the module.

## Context caching

Spring caches a built context per configuration key: the slice and its classes, `@MockitoBean` set, `@ActiveProfiles`, `@TestPropertySource`, `@Import` and `@TestConfiguration`. Each distinct key builds a new context. A suite that "builds the context 40 times" has 40 keys.

- Remove `@DirtiesContext` unless the test truly changes bean definitions; clean data instead.
- Give every test class in a group the same `@MockitoBean` fields, profiles and properties. Move shared mocks to a base class or a `@TestConfiguration`.
- Enable `logging.level.org.springframework.test.context.cache=DEBUG` to count hits and misses.

Read [references/context-caching.md](references/context-caching.md) when the suite is slow or contexts rebuild.

## Security tests

`@WebMvcTest` loads the security filter chain. Test 200, 401 (302 under form login) and 403 for each secured route. `@WithMockUser(roles = "ADMIN")` adds the `ROLE_` prefix itself. A mock POST without `.with(csrf())` returns 403. `@PreAuthorize` only runs in a context that enables method security. Read [references/security-testing.md](references/security-testing.md) for `jwt()`, `@WithUserDetails`, OIDC login, custom `@WithSecurityContext` and the reactive `mockUser()`/`mockJwt()` variants.

## Dependencies

- Boot 3: `spring-boot-starter-test` covers JUnit, AssertJ, Mockito and Spring Test. Add `spring-security-test` for security and `spring-boot-testcontainers` plus `org.testcontainers:postgresql` (or the module you need) for containers.
- Boot 4: add the test starter for each technology under test (`spring-boot-starter-webmvc-test`, `-data-jpa-test`, `-restclient-test`, `-security-test`, `-webflux-test`). Testcontainers 2 module names are `testcontainers-postgresql` and so on.

<!-- Maintainer note: verified 2026-10-20 against docs.spring.io (Boot and Framework testing reference, Framework 7.0.9), the Boot 4.0 migration guide and Maven Central for Boot 4.1.1. -->

## References

- [references/slices.md](references/slices.md) when choosing a slice, writing a `@JsonTest` or `@RestClientTest`, or fixing a slice that fails to load.
- [references/mocking.md](references/mocking.md) when stubbing, verifying or spying beans with `@MockitoBean`, `@MockitoSpyBean` or `@TestBean`.
- [references/mockmvc.md](references/mockmvc.md) when testing a controller with `MockMvcTester` or `RestTestClient`.
- [references/testcontainers.md](references/testcontainers.md) when a test needs a real database or broker.
- [references/context-caching.md](references/context-caching.md) when the suite is slow.
- [references/security-testing.md](references/security-testing.md) when a test touches authentication, authorization, CSRF or WebFlux.
- [references/sb4-migration.md](references/sb4-migration.md) when upgrading tests from Boot 3 to 4.
