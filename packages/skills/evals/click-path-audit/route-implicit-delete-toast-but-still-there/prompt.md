---
name: route-implicit-delete-toast-but-still-there
description: "Routing, implicit. A control that reports success without the promised result, in a Svelte app, with no mention of audit, handler, click path or state."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

support keeps getting "I removed my card and got charged anyway". on the billing screen (SvelteKit) you press "Remove card", the green "Card removed" toast comes up and the card disappears from the list, but after a reload it is back. removeCard() itself is fine, the integration test for it passes against the real API. what is going on between the press and the toast?

```svelte
<script>
  import { cards, toast } from "$lib/stores";
  import { removeCard } from "$lib/billing";
  let confirming = null;

  function onRemove(card) {
    confirming = card;
  }
  function onConfirm() {
    if (!confirming) return;
    cards.update((list) => list.filter((c) => c.id !== confirming.id));
    toast.set("Card removed");
    confirming = null;
  }
</script>

{#each $cards as card}
  <button on:click={() => onRemove(card)}>Remove card</button>
{/each}
{#if confirming}
  <button on:click={onConfirm}>Yes, remove</button>
{/if}
```
