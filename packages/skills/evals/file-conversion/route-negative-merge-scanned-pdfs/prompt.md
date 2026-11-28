---
name: route-negative-merge-scanned-pdfs
description: "Near miss: merging PDFs and dropping a page is PDF manipulation, which the skill excludes; no format changes."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I have three scanned contracts in ~/scans: lease-1.pdf, lease-2.pdf and addendum.pdf. merge them into one PDF in that order and drop the blank last page of lease-2. what do I run?
