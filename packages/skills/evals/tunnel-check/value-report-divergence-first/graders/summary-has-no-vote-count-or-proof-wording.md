---
type: regex
pattern: '^[\s>*\-`]*SUMMARY\**\s*:(?![^\n]*(consensus|majorit|\bmost (of the )?(reads|answers|reviewers)|\b(four|4)\b[^\n]{0,15}\b(of|out of)\b|\b(four|4) (reads|answers|reviewers)\b|outvot|outnumber|\b(reads|answers|they|which|that|and|five|four) (all )?(back|backs|support|supports|confirm|confirms|validate|validates|verify|verifies|prove|proves|endorse|endorses)\b|(?<!\bnot )(?<!n.t )\b(is|are|stands|been) (well[- ])?(verified|proven|proved|confirmed|validated|settled|sound|justified)\b))[^\n]*\S'
flags: im
weight: 1
target: last_message
---
