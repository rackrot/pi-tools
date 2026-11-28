---
name: route-stateflow-loading-never-seen
description: Routing. A JVM ViewModel test that cannot observe an intermediate StateFlow value. Near the android-testing and kotlin boundaries, but it is a plain JVM test problem, so kotlin-testing owns it.
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

This test lives in app/src/test (plain JVM, no Robolectric, no emulator) and fails on the second assertion: it gets `Loaded` where I expect `Loading`.

```kotlin
class SearchViewModelTest {
    @get:Rule val main = MainDispatcherRule() // sets Dispatchers.Main to UnconfinedTestDispatcher()

    @Test
    fun `shows loading then results`() = runTest {
        val vm = SearchViewModel(FakeSearchRepository(listOf("a")))
        val seen = mutableListOf<SearchState>()
        backgroundScope.launch { vm.state.collect { seen += it } }
        runCurrent()

        vm.onQuery("a") // viewModelScope.launch { _state.value = Loading; _state.value = Loaded(repo.search(q)) }
        runCurrent()

        assertEquals(SearchState.Idle, seen[0])
        assertEquals(SearchState.Loading, seen[1])
    }
}
```

The ViewModel definitely sets Loading first. How do I change the test so it can see it?
