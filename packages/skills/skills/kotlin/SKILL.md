---
name: kotlin
description: 'Read before answering, writing, reviewing or converting any Kotlin (.kt) code outside @Composable functions, including a pasted snippet or a question with no project files. Symptoms: "Smart cast to String is impossible, because name is a mutable property", a non-exhaustive when, !! NullPointerException, events lost from a MutableSharedFlow, stateIn that never emits, a coroutine that outlives its owner, GlobalScope or runBlocking freezing the caller, swallowed CancellationException, a Java-to-Kotlin conversion. Covers null safety, sealed classes, scope functions, structured concurrency, Flow and Java interop. Not for Kotlin tests (kotlin-testing).'
---

# Kotlin

Follow the project's Kotlin style and toolchain; improve the code at hand without reformatting the file.

Not for: tests (`kotlin-testing`), Android lifecycle, ViewModel state policy and Room (`android`), `@Composable` code (`jetpack-compose`), build files (`gradle`, or `android-build` for AGP), plain `.java` files (`java`), Spring Boot configuration, Spring Data JPA and transactions (`spring-boot`).

## Orient

1. Read the build file for the Kotlin version, `kotlin { compilerOptions }`, `jvmToolchain` and compiler plugins (`plugin.jpa`, `plugin.spring`, `plugin.serialization`). Under AGP 9 Kotlin support is built in, so there may be no `kotlin-android` plugin line.
2. Check whether detekt or ktlint is configured. If so, run it on the touched files; if not, do not add it unasked.
3. Check the language version before using newer syntax: guard conditions in `when` (`is X if cond ->`) need Kotlin 2.2 or later.
4. Decide who owns each piece of async work and each piece of state before editing coroutine or Flow code.
5. Done when you know the language version, the style tools and where the code runs (JVM server, Android, multiplatform).

## Null safety and types

1. No `!!` without a stated invariant in a comment or `requireNotNull(x) { "why" }`. Prefer `?:` with `return`, `error(...)` or a default.
2. "Smart cast impossible" on a `var` property or an open or custom-getter property: copy it to a local `val` (`val name = name ?: return`), or make the property `val`.
3. Prefer `val`, read-only `List`/`Set`/`Map` in public types, and `copy()` over mutation.
4. Data class for values with several fields; `@JvmInline value class` for one domain-meaningful field; sealed interface or class for closed hierarchies. Read [references/api-design.md](references/api-design.md) before adding an extension, a value class or a public factory.
5. `when` over a sealed type, enum or Boolean is an expression with every case named and no `else`, so a new subtype breaks compilation. Give each data-bearing subtype its own `is` branch.
6. Preconditions: `require` for arguments, `check` for state, `error()` for unreachable states. Expected absence returns `null` or a sealed result; `Result` suits operations whose failure is an exception to hand on, and `runCatching` around suspend code needs the cancellation guard below.
7. Scope functions: one per expression and never nested; `let` for nullable transforms, `apply` for configuring an object, `also` for side effects. Use a plain `val` when it reads better.
8. Sequences (`asSequence()`) for long chains over large collections or when `first`/`take` can stop early; plain collection operators for short lists.
9. Done when the code compiles with no new warnings and no new `!!`, `as` or `else` on a closed `when`.

## Coroutines

1. Every `launch` has an owner scope that is cancelled when the work stops mattering (`viewModelScope`, a request scope, an injected `CoroutineScope` tied to a lifecycle). No `GlobalScope`.
2. Repositories, use cases and data sources expose `suspend` functions or `Flow`, not a stored `CoroutineScope` or a fire-and-forget `launch`.
3. `runBlocking` only in `main`, a required blocking framework bridge, and test edges. Blocking IO goes in `withContext(ioDispatcher)` with the dispatcher injected; `runInterruptible` makes a blocking JVM call cancellable.
4. Cancellation is cooperative: call `ensureActive()` in long loops, rethrow `CancellationException` from any broad `catch` or `runCatching`, and put cleanup that suspends in `withContext(NonCancellable)`.
5. Parallel work uses `coroutineScope { async { } }`; `supervisorScope` when a child's failure must not cancel its siblings.
6. Read [references/coroutines.md](references/coroutines.md) for scope ownership, launch-in-`init`, exception handling and refactoring order.
7. Done when you can point to the owner, the start, the cancellation path and where a failure surfaces.

## Flow

1. Cold `Flow` for a stream per collector; `StateFlow` for current state with a `.value`; `SharedFlow` or `Channel` for events. A `SharedFlow` with `replay = 0` drops an event emitted while nobody collects. A `Channel` delivers each event to one collector and buffers until it arrives.
2. State holders keep a private `MutableStateFlow`, expose `asStateFlow()`, and change it with `update { it.copy(...) }`, never `value = value.copy(...)`.
3. Derive state with `stateIn(scope, SharingStarted.WhileSubscribed(5_000), initial)`; use `Eagerly` when `.value` must be correct with no collector.
4. `flowOn` moves the upstream, not the collector. `catch` handles upstream errors only, so put it before `collect`/`launchIn` and rethrow cancellation. An exception thrown inside `collect { }` is not seen by `catch`; move the work into `onEach { }` and write `.onEach { }.catch { }.collect()`.
5. Read [references/flow.md](references/flow.md) for event delivery, `stateIn` pitfalls and operator choices.
6. Events that are lost, replayed or split, and the choice of event type (`SharedFlow`, `Channel` or consumed state), stay here, as do operator and cancellation semantics. Lifecycle-aware collection (`repeatOnLifecycle`, `collectAsStateWithLifecycle`) and `SavedStateHandle` restoration after process death go to `android`. If the question is why the event vanished or which type to use, it is this skill; if it is when the UI subscribes or what survives a killed process, it is `android`.
7. Done when you can state consumer count, behavior with no collector, replay and buffer.

## Other references

- [references/java-interop.md](references/java-interop.md): platform types, `@Jvm*` annotations, `@Throws`, SAM overloads, Kotlin called from Java. Read when Java and Kotlin call each other.
- [references/java-to-kotlin.md](references/java-to-kotlin.md): converting `.java` files, in dependency order, with framework annotation targets. Read for any conversion request.
- [references/spring-jpa.md](references/spring-jpa.md): only the Kotlin-specific parts of Spring and JPA (`plugin.spring` and `plugin.jpa`, regular classes instead of `data class` entities, the nullable id, equality and `hashCode`, `@field:` targets, `suspend` controllers, `data class` DTOs). Read when a Kotlin class carries `@Entity` or `@Service`. General JPA questions (N+1, fetching, transactions, locking) go to `spring-boot`.

## Gotchas

- `MutableSharedFlow<Event>()` with a UI collector that starts after the emit loses the event. Do not "fix" it with `replay = 1`, which replays a stale event to every new collector.
- A coroutine started in `init {}` runs before the subclass is initialised and cannot be tested in isolation. Start it from a named function.
