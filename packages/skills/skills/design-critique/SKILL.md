---
name: design-critique
description: "Critiques a UI design that is not built yet: a mockup, wireframe, comp, Figma frame, screenshot, or a screen the user describes in words. Covers usability, visual hierarchy, consistency and obvious accessibility problems, matched to the stage of the design. Use whenever someone shares or describes a screen and asks for feedback, what is wrong with it, why it \"feels off\", or what to fix before a design review, even when they never say \"critique\" and attach no file. Not for a built or rendered page; a developer spec for an approved design goes to design-handoff."
---

# Design critique

Give structured, actionable feedback on a design that exists as an image, export or description, at any stage from exploration to final polish.

## Scope

- Owns critique of static designs without running code: mockups, wireframes, exported frames, screenshots, sketches.
- A page that is built and can be rendered (a URL, a local HTML file, an app in this repo) is out of scope; this skill does not render or measure pages.
- A full WCAG audit goes to `accessibility-review`; this skill flags only obvious accessibility problems. Wording goes to `ux-copy`.
- Read image files the user references. If the design lives in a tool you can't read (a Figma link, a prototype), ask for an exported screenshot or frame. Don't critique a design you haven't seen; if all you have is a description, say the critique is based on it.

## What to establish

- **The design**: image, export or detailed description.
- **Context**: what it is, who it's for, what stage (exploration, refinement, final).
- **Focus** (optional): "focus on mobile", "just the onboarding flow".

Match the stage. This decides the shape of the answer, and it overrides the output template below: (a) Early exploration (sketch, gray-box wireframe, 'first pass', colours and type not chosen): do not fill in the template. Lead with at least three open questions about direction and structure (what the screen is for, grouping, order, what is missing), then up to three structural recommendations. Answer a polish question the user raises (spacing, alignment) in one sentence and defer it; it is never one of the top three points. Give no pixel values, colour values, contrast ratios or type sizes for things that are not decided yet, and skip the Consistency and Accessibility sections. (b) Refinement or final polish: use the full template; spacing, alignment and state details belong here.

## Critique framework

1. **First impression (2 seconds)**: what draws the eye first, and should it? Is the purpose immediately clear? What's the emotional read?
2. **Usability**: can the user reach their goal? Is navigation clear? Are interactive elements obviously interactive? Any unnecessary steps?
3. **Visual hierarchy**: clear reading order, the right elements emphasized, whitespace and typography doing the work.
4. **Consistency**: follows the product's design system if one is visible; spacing, color and type consistent; similar elements look and behave alike.
5. **Accessibility (quick pass)**: obvious contrast problems, small targets, small or low-contrast text, color as the only cue, missing visible labels.

## How to give feedback

- **Be specific**: "The CTA competes with the navigation", not "the layout is confusing".
- **Explain why**: tie each point to a design principle or a user need.
- **Suggest a fix**: propose an alternative for every problem.
- **Say what works**: good critique names strengths too.

## Output

```markdown
## Design Critique: [Design Name]

### Overall impression
[1-2 sentences: what works, what's the biggest opportunity]

### Usability
| Finding | Severity | Recommendation |
|---------|----------|----------------|
| [Issue] | Critical / Moderate / Minor | [Fix] |

### Visual hierarchy
- **What draws the eye first**: [Element] — [is this right?]
- **Reading flow**: [how the eye moves through the layout]
- **Emphasis**: [are the right things emphasized?]

### Consistency
| Element | Issue | Recommendation |
|---------|-------|----------------|
| [Typography/spacing/color] | [Inconsistency] | [Fix] |

### Accessibility (quick pass)
- **Color contrast**: [likely pass/fail for key text; estimates from an image are estimates]
- **Touch targets**: [adequate size?]
- **Text readability**: [size, line height, line length]
[If issues look serious, recommend a full `accessibility-review`.]

### What works well
- [Strength 1]
- [Strength 2]

### Priority recommendations
1. **[Most impactful change]** — [why and how]
2. **[Second priority]** — [why and how]
3. **[Third priority]** — [why and how]
```
