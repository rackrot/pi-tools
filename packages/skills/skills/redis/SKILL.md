---
name: redis
description: "Redis and Valkey rules that are easy to get wrong from memory: cache TTLs with jitter, stampede control when cached entries expire together, eviction policy, SCAN over KEYS, fixed and sliding-window rate limits, token-checked locks (SET NX) and what they cannot guarantee, Streams vs Pub/Sub, connections. Use whenever a question or code touches Redis, Valkey, ElastiCache or a Redis client (ioredis, redis-py, go-redis): adding or reviewing a cache, rate limiter, lock, queue or sessions on Redis, or diagnosing latency spikes on cache expiry, memory growth or lost keys. Not for configuring an auth library's session store (better-auth) or for queues and locks kept in Postgres or MySQL."
---

# Redis

Not for relational stores (`mysql`) or an auth library's secondary-storage settings (`better-auth`).

Choose and review Redis usage from what the data is, how long it may be stale, and what loss it can survive. Redis is fast and simple, so its failure modes are quiet: unbounded memory, stale data, and locks or queues that fail under failover.

Check the facts of the target before designing. Redis and Valkey are compatible for the commands below, but versions differ. Confirm with `INFO server`, and check the command's "since" version in the docs (for example `EXPIRE ... NX` needs 7.0). Also confirm whether it is managed, clustered, replicated, and persisted (`RDB`, `AOF`, or neither). Ask what happens to the application when the instance is empty.

## Safety contract

- Against a live, shared, or managed instance (anything but a throwaway local one), run only read commands that are bounded: `INFO`, `TTL`, `TYPE`, `MEMORY USAGE`, `SCAN` with `COUNT`, `SLOWLOG GET`, `CONFIG GET`.
- Never run without the user's explicit yes naming the instance: `FLUSHALL`, `FLUSHDB`, `CONFIG SET`, `CONFIG REWRITE`, `DEBUG`, `SHUTDOWN`, `MONITOR`, `KEYS *` (or any `KEYS` pattern), and pattern deletes (`SCAN` piped into `DEL`). They destroy data, change the running server, or block it. `MONITOR` also streams every command with its keys and values, so never paste its output.
- Don't print values from keys that may hold sessions, tokens, or personal data.

## 1. Start from the data's source of truth

- A **cache** holds copies. The database stays the truth, and an empty Redis must only cost latency.
- A **queue, lock, or counter** may be the only copy. Decide loss tolerance, persistence, and the eviction policy explicitly (section 3).
- Don't mix them on one instance and one eviction policy. A cache that evicts and a queue that must never lose messages need different settings, so use separate instances (or at least a clear owner for the shared policy).

## 2. Structures and keys

| Use | Structure |
| --- | --- |
| Cached value | String (serialized value) |
| Session or object with fields | Hash |
| Counter or rate limit | String with `INCR` |
| Leaderboard, sliding window | Sorted set |
| Unique members | Set |
| Approximate distinct count | HyperLogLog |
| Durable work or event log | Stream |

- Name keys `namespace:resource:id`, and put the app or environment first on shared instances.
- **Always set a TTL on cache keys.** Keys without one accumulate until memory runs out. Pick the TTL from how stale the data may be, and add jitter so many keys don't expire together.
- Keep values small. Large blobs slow serialization and memory. Store a reference and fetch from object storage.
- Never use `KEYS` in application code. It is O(N) and blocks the server, and the docs say to reserve it for debugging. Iterate with `SCAN`, which can return a key more than once, so make the work idempotent.
- On Redis Cluster, a multi-key command, transaction, or script needs all keys in one hash slot. Use hash tags (`{user:42}:profile`) deliberately.

## 3. Eviction policy

Set `maxmemory` and a `maxmemory-policy` that match the data.

| Policy | Behavior | Fits |
| --- | --- | --- |
| `noeviction` | Writes fail when memory is full | Queues, locks, anything that must not vanish. Alert before it fills |
| `allkeys-lru` | Evicts least recently used keys | A pure cache |
| `volatile-lru` | Evicts only keys that have a TTL | A mix where keys without TTL must stay |
| `allkeys-lfu` | Evicts least frequently used keys | Skewed access patterns |
| `volatile-ttl` | Evicts keys closest to expiry | Preferring to keep long-lived keys |

A `volatile-*` policy with few TTL'd keys behaves like `noeviction`, so confirm that the keys you expect to evict carry a TTL. Redis 8.6 adds least-recently-modified policies (`allkeys-lrm`, `volatile-lrm`) that Valkey's config doesn't list, so check the eviction docs for the installed version.

## 4. Caching

- **Cache-aside.** Read the cache, on a miss read the database and write the cache with a TTL. This is the default. It tolerates staleness up to the TTL.
- **Write-through.** Write the database first, then update or delete the cache entry. Prefer deleting the entry on write, since a racing reader then repopulates it from the database, while two writers racing to set it can leave the older value.
- **Invalidation.** To drop a group of keys, keep a set of the group's keys (with its own TTL) and delete them together, or put a version number in the key and bump it. Don't `SCAN` and delete on a hot path.
- **Stampede.** When a popular key expires, every reader hits the database at once. Prevent it with a short lock around the refill so one caller rebuilds the value, serve a slightly stale value while one caller refreshes, or expire keys early at random. A lock held in one process's memory does nothing across processes. Use a shared lock (see the patterns reference).

## 5. Rate limits, locks, and queues

Read [references/patterns.md](references/patterns.md) for command-level recipes before writing any of these:

- fixed-window and sliding-window rate limits (and why re-setting the TTL on every `INCR` breaks a limiter)
- a single-instance lock with token-checked release, and what it can't guarantee
- Streams consumer groups with acknowledgement and recovery of stuck entries

Choose between the messaging options by delivery need. Pub/Sub is at-most-once. A message goes to current subscribers or is lost, and nothing is stored for late or crashed consumers. Use Streams when you need acknowledgement, consumer groups, or replay. Neither survives a total data loss unless persistence is configured.

## 6. Connections and failure

- Reuse connections through a pool or a single multiplexed client, sized to the workload and the server's `maxclients` across all application instances. Opening one per request wastes round trips.
- Set connect and command timeouts, and decide what the caller does when Redis is down (serve from the database, degrade, or fail). A cache outage must not take the application down unless that is the stated design.
- Don't run slow commands (large `SMEMBERS`, `HGETALL`, `SORT`, unbounded Lua) on a shared instance. One slow command blocks every other client. Use the slow log (`SLOWLOG GET`) to find them.
- Protect the instance. Require authentication and TLS where traffic crosses hosts, bind it to private interfaces, and never expose it to the internet.

## 7. Verify

Exercise the expiry, eviction, and failure paths, not only the hit path. Check that each key class has a TTL (`TTL`, or `MEMORY USAGE` on samples), that the eviction policy matches the data, and that behavior holds with Redis empty and unreachable.
