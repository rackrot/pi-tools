---
name: route-implicit-backup-keeps-going
description: Implicit trigger. A pasted cron script that carries on after a failed pipeline stage routes to bash, without the prompt naming Bash, shell or ShellCheck.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

last night's backup job said it succeeded but the dump in the bucket is 20 bytes. pg_dump could not log in (the password had been rotated) and the job still went on and uploaded the empty file and pruned the old ones. how did it get past that, and can you fix it so it stops there next time? this is all of scripts/nightly-backup.sh:

```
#!/bin/bash
set -e
OUT=/var/backups/pg
STAMP=`date +%F`
cd $OUT
pg_dump -h db.internal -U backup appdb | gzip > appdb-$STAMP.sql.gz
aws s3 cp appdb-$STAMP.sql.gz s3://acme-backups/pg/
find . -name 'appdb-*.sql.gz' -mtime +14 | xargs rm
echo "backup ok"
```
