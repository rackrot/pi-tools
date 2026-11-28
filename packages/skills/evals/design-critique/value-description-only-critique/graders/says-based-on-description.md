---
type: regex
pattern: '(?:based on|working (?:from|off)|going (?:from|off|by)|rel(?:y|ies|ying) on|drawn from|from) (?:your|the|this|a) (?:\w+ ){0,2}description|(?:have ?n.t|have not|did ?n.t|can.t|cannot|without) (?:actually )?(?:seen?|seeing|view(?:ed|ing)?|look(?:ed|ing) at) the (?:\w+ ){0,2}(?:mockup|design|screen|frame|image|file|visual)|description(?: only|, not)|not (?:the|an?|from) (?:\w+ ){0,2}(?:image|visual|mockup itself|frame|screenshot|pixels|file)'
flags: i
weight: 1
target: last_message
---
