---
name: value-description-only-critique
description: "Value case. A mid-fidelity mockup that exists only as a written description. Measures the output contract of the skill (findings table with the Critical/Moderate/Minor scale, a section on what works, ranked priority recommendations) and that the critique says it rests on a description, not on the design itself. Haiku says the last part without the skill too, so that grader has the same weight as the others and the case discriminates on the contract. Replaces value-unreadable-figma-link, which Haiku passed 1.00 with and without the skill."
tags: [value]
runs: 3
max_turns: 5
allowed_tools: [Read, Glob, Grep, Skill]
---

mid-fi mockup of the "book a table" screen for our restaurant app, going to design review on Wednesday. what would you change? the phone frame, top to bottom:

- header photo of the restaurant, about a third of the screen, with the restaurant name in white text over it
- a row of three dropdowns side by side: Date, Time, Guests
- under them a grid of available time slots as small pills (17:00, 17:15, 17:30 ... 21:45), 4 per row, 20 pills in all; unavailable ones are the same pill in a lighter grey
- a "Special requests" text area, 5 lines tall
- a checkbox "Send me offers from this restaurant", checked by default
- two buttons next to each other at the bottom: "Cancel" on the left and "Book" on the right, both filled, same green
- the deposit ("a £10 per person deposit is charged at booking") is in small text under the buttons
