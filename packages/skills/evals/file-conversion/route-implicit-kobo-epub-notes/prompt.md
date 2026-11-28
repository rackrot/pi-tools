---
name: route-implicit-kobo-epub-notes
description: "Routing, implicit. Markdown notes that must look right on a Kobo reader, which reads EPUB, route to file-conversion without a format-conversion request or a tool name."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I have my reading notes as a pile of markdown files in ~/notes/books. I just got a Kobo and want them to show up there and look right, with headings and a table of contents if possible.
