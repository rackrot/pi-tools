---
type: regex
pattern: 'bug[^\n]{0,200}(overwrit|replac|would change|chang\w+ (the|its) (color|colour|description)|skip|keep|kept|leave|left|untouched|unchanged|as[ -]is)|(overwrit|replac|skip|keep|kept|leave|left)[^\n]{0,120}\bbug\b|(no|without|drop\w*|omit\w*)\s+`?--force|(not|n''t|never)\b[^\n]{0,40}--force|existing labels?[^\n]{0,80}(untouched|unchanged|alone|as[ -]is)'
flags: i
weight: 1
target: last_message
---
