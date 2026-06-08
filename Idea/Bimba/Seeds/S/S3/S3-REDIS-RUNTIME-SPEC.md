# S3 Redis Runtime Residency Spec

Coordinate: [[S3]] / [[S3']]

This spec is the canonical Redis residency contract for the pre-Cycle-3 remediation tranche. [[Redis]] lives physically and operationally in `Body/S/S3/redis-context` and is exposed to the rest of the system through `Body/S/S3/gateway`. Other coordinates may own logical payload semantics, but they do not own Redis clients, Redis service code, Redis health/readiness, or Redis key construction.

## Ownership Law

| Coordinate | Owns | Must not own |
|---|---|---|
| [[S3]] / [[S3']] | Redis client lifecycle, key construction, TTL tiers, health/readiness, hydration, runtime persistence, RedisVL bridge path residency | Graph semantics, protected interpretation bodies, ontology authority |
| [[S0]] | CLI/server adapter, env/config discovery, RPC forwarding into S3-owned gateway surfaces | Direct Redis hydration, direct Redis writes, hand-built Redis temporal keys |
| [[S2]] | Graph semantics, embedding versions, retrieval payloads, namespace labels such as `s2:graph:semantic` | Redis clients, Redis service scripts, Redis readiness ownership |
| [[S4]] / [[Psyche]] | Continuity law, validation, handoff semantics, oversized-carry-forward rejection | Redis runtime persistence implementation |
| [[S5]] | Kbase/Gnosis payload governance, source provenance, retrieval package meaning | Redis runtime ownership or raw protected body storage by default |

## Runtime Tiers

| Tier | Prefix | TTL | Intended payloads |
|---|---:|---:|---|
| live | `cache:live` | 30s | Gateway/client/agent liveness, heartbeat, volatile presence |
| active | `cache:active` | 1800s | Active session lifecycle state, Psyche continuity handles |
| hot | `cache:hot` | 300s | Session NOW markdown refs, Kairos, agent orientation, short-lived temporal facts |
| warm | `cache:warm` | 3600s | Day context, recent source/task context, kbase refs, semantic retrieval refs |
| cold | `cache:cold` | 86400s | Coordinate lookup snapshots, source manifests, revision-bound cache boxes |

All live Redis keys include the tier prefix. Untiered logical keys may appear only as contract fragments or durable handle bodies, never as the actual Redis write target.

## Canonical Key Families

The S3 runtime key builders in `Body/S/S3/redis-context/src/redis_cache.rs` are the canonical API for runtime Redis keys. Current required families include:

| Payload | Canonical key form |
|---|---|
| Session NOW | `cache:hot:s3:gateway:temporal:session:{session_id}:now:md` |
| Session state | `cache:hot:s3:gateway:temporal:session:{session_id}:state` |
| Day context | `cache:warm:s3:gateway:temporal:day:{day_id}:context` |
| Day Kairos | `cache:hot:s3:gateway:temporal:day:{day_id}:kairos` |
| Session Kairos | `cache:hot:s3:gateway:temporal:session:{session_id}:kairos` |
| Agent orientation | `cache:hot:s3:gateway:temporal:agent:{agent_id}:session:{session_id}:orientation` |
| Psyche state | `cache:active:s3:gateway:psyche:session:{session_id}:state` |
| Kbase ref | `cache:warm:s5:kbase:ref:{handle_id}` |
| Source-pool ref | `cache:warm:s5:source-pool:ref:{source_hash}` |
| Coordinate lookup snapshot | `cache:cold:s2:coordinate:lookup:{graph_revision}:{coordinate}` |
| Semantic retrieval ref | `cache:warm:s2:graph:semantic:retrieval:{graph_revision}:{query_hash}` |

The older temporal logical key functions in `Body/S/S3/gateway-contract/src/lib.rs` remain useful contract fragments, but production Redis writes must use the S3 tiered runtime key builders so set/get cannot diverge.

## Preflight Gate

Cycle 3 work orders must not resume until the Redis residency cleanup passes:

- `rg "redis::|RedisCache|EPILOGOS_REDIS_URI" Body/S/S0/epi-cli/src` returns only explicit config/pass-through exceptions.
- S3 Redis tests assert exact key strings and prove tiered read/write paths use the same full key.
- S2 semantic-cache tests state that [[S2]] owns graph payload semantics while [[S3]] owns Redis runtime.
- Psyche/kbase/source/coordinate handle tests prove DAY/NOW/session/Psyche/kbase/source/coordinate context lands in the declared live/active/hot/warm/cold layers.
- No raw protected user content is stored in Redis unless explicitly hot-local, TTL-bound, and represented by protected references elsewhere.

