---
name: value-repo-tokens-off-scale
description: Value case. Designer numbers for a card plus the project's token file, pasted into the prompt (scaffold.sh also writes it to the workspace when --scaffold is on). Most values sit on the scale, two do not.
tags: [value]
runs: 3
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

we're handing the notification card to the dev team tomorrow, can you write up the spec for them? numbers from the designer's file:

- card padding 16, corner radius 6, background #F5F7FA
- title 18px semibold, body 14px, 8px between them
- avatar on the left, then title and body
- two actions under the body: "Mark as read" as a link in #1F6FEB, and "Mute thread"; the gap between the two actions is 10px
- on mobile, swiping the card to the left dismisses it

our tokens are in src/styles/tokens.css, pasting it so you don't have to look:

```css
:root {
  --space-s: 8px;
  --space-m: 16px;
  --space-l: 24px;

  --radius-s: 4px;
  --radius-m: 8px;

  --color-surface-sunken: #f5f7fa;
  --color-surface-raised: #ffffff;
  --color-text-primary: #101828;
  --color-text-muted: #667085;
  --color-action: #1f6feb;
  --color-action-hover: #1858bd;
  --color-border-subtle: #eaecf0;

  --text-title-size: 18px;
  --text-title-weight: 600;
  --text-body-size: 14px;
  --text-body-weight: 400;
}
```
