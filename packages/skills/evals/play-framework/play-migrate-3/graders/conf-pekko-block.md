---
type: regex
pattern: '^pekko(\s*\{[\s\S]*|\.loggers\s*=.*)org\.apache\.pekko\.event\.slf4j'
flags: m
target:
  source: file
  path: conf/application.conf
---
