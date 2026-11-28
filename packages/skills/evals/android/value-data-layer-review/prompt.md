---
name: value-data-layer-review
description: "Value case. A five-line review where three lines break defaults the skill states (a use case that only forwards to the repository, withContext around a suspend Room DAO call, a Channel for a one-shot UI event) and two are fine (mapping entities to domain types in the repository, WhileSubscribed(5_000)). The bare model keeps the first two."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Quick review before I merge this into our Android app (Hilt, Room 2.7, coroutines). `UserDao.byId` is declared `suspend fun byId(id: Long): UserEntity` and `UserDao.observeAll()` returns `Flow<List<UserEntity>>`. The repo is not checked out here, so the five labelled lines are all you get.

```kotlin
// L1  (domain/GetUserUseCase.kt)
class GetUserUseCase @Inject constructor(private val repo: UserRepository) { suspend operator fun invoke(id: Long): User = repo.user(id) }

// L2  (data/UserRepositoryImpl.kt)
override suspend fun user(id: Long): User = withContext(ioDispatcher) { dao.byId(id).toDomain() }

// L3  (data/UserRepositoryImpl.kt)
override fun users(): Flow<List<User>> = dao.observeAll().map { list -> list.map { it.toDomain() } }

// L4  (ui/UserListViewModel.kt)
val users = repo.users().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

// L5  (ui/UserListViewModel.kt)  carries the one-shot "User deleted" snackbar to the screen
private val _events = Channel<UserListEvent>(Channel.BUFFERED); val events: Flow<UserListEvent> = _events.receiveAsFlow()
```

For each line say KEEP if you would merge it as written or CHANGE if you would ask for a change, with one short reason. Finish with exactly these five lines, filled in, as the last lines of your answer:

L1: KEEP or CHANGE
L2: KEEP or CHANGE
L3: KEEP or CHANGE
L4: KEEP or CHANGE
L5: KEEP or CHANGE
