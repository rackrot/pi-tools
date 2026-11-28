---
name: value-report-names-pattern-and-evidence
description: "Value case. Three broken controls and one clean one, code read only. The report should name each bug by its pattern (sequential undo, effect interference, missing transition) and mark findings that were not run as inferred. The bare model finds the same bugs but uses neither the pattern names nor the label."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

three bug reports on the inbox page since the store refactor: "New message", "Jump to thread" and "Save draft" don't do what they say. "Reply" seems fine. every store action has a passing unit test. I can't run the app today and you can't either, so this is from the code alone. write it up so I can paste it into the ticket: what is wrong with each, and how sure we are.

```ts
// inboxStore.ts (Zustand)
export const useInbox = create<Inbox>((set, get) => ({
  selected: null, composeMode: false, draft: "", filter: "all", page: 1, banner: null,

  setComposeMode: (on) => set({ composeMode: on }),
  selectThread: (t) => set({ selected: t, composeMode: false, draft: "" }),
  setDraft: (text) => set({ draft: text }),
  setFilter: (f) => set({ filter: f, page: 1 }),
  setPage: (n) => set({ page: n }),
  showBanner: (msg) => set({ banner: msg }),
  saveDraft: async () => { await api.saveDraft(get().selected?.id, get().draft); },
}));

// listeners run synchronously inside every set()
useInbox.subscribe((s, prev) => {
  if (s.page !== prev.page) useInbox.setState({ selected: null, composeMode: false, draft: "" });
});
```

```tsx
// InboxPage.tsx
<button onClick={() => { setComposeMode(true); selectThread(null); }}>New message</button>
<button onClick={() => { selectThread(thread); setComposeMode(true); }}>Reply</button>
<button onClick={() => { selectThread(hit.thread); setPage(hit.page); }}>Jump to thread</button>
<button onClick={() => { if (draft.trim().length > 0) showBanner("Draft saved"); }}>Save draft</button>
```
