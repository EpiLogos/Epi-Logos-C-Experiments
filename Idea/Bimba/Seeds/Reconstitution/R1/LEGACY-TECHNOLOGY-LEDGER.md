---
coordinate: "M/M'/S/S'/legacy"
c_4_artifact_role: "reconstitution-technology-ledger"
c_1_ct_type: "CT1"
c_3_created_at: "2026-08-17"
c_0_source_coordinates:
  - "[[AUTHORITATIVE-SOURCE-MANIFEST]]"
  - "[[CYCLE3-M-MPRIME-CAPABILITY-MATRIX]]"
  - "[[S-SPRIME-TECHNICAL-CAPABILITY-MATRIX]]"
  - "[[BIMBA-CANONICAL-INVENTORY]]"
---

# RECON-R1 Legacy / Replaceable Technology Ledger

Pinned evidence snapshot: `EpiLogos/Epi-Logos-C-Experiments@8608648f33e697dd5a8c5f499492619a02259af5`.

This ledger is **not a project freeze**. It is a versioned reading of implementation bodies encountered while reconstructing the current M/M' domain map, S/S' technical map and Bimba authority map. Later integration work may change any implementation disposition when newer evidence warrants it.

Allowed provisional dispositions are the R1 ticket vocabulary:

- `retain as current dependency`
- `retain as provider/adapter`
- `extract durable domain logic`
- `superseded by O:I-era product substrate`
- `historical fixture/evidence only`
- `needs R2 ownership decision`

## Ledger

| Technology / surface | Current evidence at pinned head | What survives semantically | R1 disposition | Why / later question |
|---|---|---|---|---|
| `Body/M/epi-theia` shell and Electron/Theia application | live tree `554fb6a9a12e1f9e1a449911b8ce13ec84981d9a`; current M' specs reference its extensions and acceptance tests as consumed-shell evidence | acceptance behaviours, intent/deep-link boundaries, privacy tests, bridge fan-out, control-room interaction cases | `historical fixture/evidence only` | Current programme explicitly rejects Theia as target shell. Preserve demonstrably durable behaviours/tests, not its application ontology. |
| Theia `kernel-bridge`, shared bridge fan-out and readiness tests | current S0/S3 specs record passing boundary suites; source under `Body/M/epi-theia/extensions` | single mediated capability/session bridge, typed readiness states, no renderer-owned domain clocks/authority | `extract durable domain logic` | The bridge architecture itself is replaceable; the mediation and negative-test contracts are durable. |
| Theia Agentic Control Room | `Body/M/epi-theia/extensions/agentic-control-room`; S4 spec records run-flow/evidence/human-gate tests | governed actor/capability selection, evidence envelope, human-required gate, S4→S5 review boundary | `extract durable domain logic` | The widget/UI is historical; governance semantics remain current. |
| Tauri port material | `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md` blob `e5be1969f3fbbdfc8d2ba84327e2eb425d2471f3`; current M specs still cite it as migration history | any durable application acceptance cases that are independently supported by current M' specs | `historical fixture/evidence only` | It is not future-shell authority in R1. |
| Old NATS-based subsystem/process topology | no live `Body/` implementation path found in the pinned tree/search; survives in older subsystem/planning lineage only | no technology requirement established by current M/M' or S/S' authorities | `historical fixture/evidence only` | If R2 finds a durable event/fan-out semantic, map that semantic to the current S3/event substrate rather than resurrecting NATS by default. |
| Old Flask/gateway sidecars | no generic Flask gateway is established as current owner; current gateway authority is Rust S3/S0-hosted dispatch; Graphiti has a temporary Python HTTP wrapper | gateway/session/routing semantics belong to S3/S3'; Graphiti temporal semantics belong to S3' | `historical fixture/evidence only` | Keep only where a current provider wrapper is still needed during migration. |
| S0-hosted `epi-cli/src/gate` dispatch | current live implementation mirror named throughout S3/S5 specs | actual gateway methods, session/routing/review/improvement behaviour | `extract durable domain logic` | Current specs say S3/S3' owns gateway/state law even where live dispatch still resides in S0. |
| Graphiti core/runtime | `Body/S/S3/graphiti-runtime`; current S3/S5 specs explicitly split runtime architecture from usage governance | temporal episodic architecture in S3'; search/invocation/arc/disclosure meaning in S5' | `retain as current dependency` | Provider/library is real; semantic ownership is not the temporary HTTP wrapper. |
| `epi-graphiti` FastAPI/HTTP wrapper | current S3/S5 specs call it compatibility/integration scaffolding | HTTP convenience only | `retain as provider/adapter` | May disappear when Rust/native library integration is sufficient; do not encode it as architecture. |
| Redis / RedisVL | `Body/S/S3/redis-context`; S2 consumes it for graph semantic cache; S3' owns live temporal/session context residency | live temporal/session/context substrate plus graph-cache provider use | `retain as current dependency` | Redis is not Bimba, not session semantic identity, and not graph canon. |
| Neo4j | `Body/S/S2/graph-schema`, `graph-services`, compose/runtime evidence; Bimba datasets import into it | current graph persistence/query body and S2 schema/index implementation | `retain as current dependency` | **Bimba ≠ Neo4j**. Future storage replacement must preserve coordinate/provenance/write contracts. |
| S2 Neo4j wrappers/services | `Body/S/S2/graph-services` now owns schema, coordinate, retrieval, import, sync and relation services | durable graph application/domain boundary around the material store | `extract durable domain logic` | Keep the S2 service contracts even if provider bodies later change. |
| `Body/S/S2/external/bimba-mcp` | tree `bfed27a5d4f2100ccb8ad212e6b6cee4bd77226b`; current tests/workflow; R3 ticket #5 | external Bimba/S2 query/sync protocol adapter | `retain as provider/adapter` | **Bimba ≠ MCP**. Modernise protocol with explicit legacy compatibility in R3. |
| older BPMCP / MCP relay topology outside current adapter | no separate current owner/path established by pinned live tree/search | at most compatibility evidence for callers/protocol behaviour | `historical fixture/evidence only` | R3 should preserve only proven client-visible compatibility, not old relay topology. |
| `hen-compiler` Python/vendor-derived body | `Body/S/S1/hen-compiler`; S1 spec names it vendor-adjacent compatibility/probe material | useful compiler seam/probes and source behaviour | `retain as provider/adapter` | `hen-compiler-core` Rust crate is current S1' law authority. |
| vendor Claude Agent SDK compiler executor | S1 spec explicitly marks it compatibility executor | optional provider execution path | `retain as provider/adapter` | Canonical S1' invocation is executor-neutral and targets bounded PI/agent execution. |
| Claude Code / Moltbot-bound S4 assumptions | S4 spec explicitly says older files over-bind the coordinate to particular harnesses | reusable agent definition, skill/tool, team and governance semantics | `historical fixture/evidence only` | S4 is now harness-agnostic; current PI/local providers are bodies. |
| PI agent runtime | `Body/S/S4/pi-agent`; current S4/S5 specs use managed PI embodiments | current agent execution body for Anima/Epii and managed sessions | `retain as current dependency` | Agent identity/agency semantics remain independent of PI as a provider. |
| SpaceTimeDB projection | `Body/S/S3/epi-spacetime-module`; S3 spec uses it for shared live-state projection | shared projection/presence/world-clock stream body | `retain as provider/adapter` | It is a projection substrate, not canonical DAY/NOW/Bimba identity. |
| Obsidian / `obsidian-cli` | current S1 material/vault body and CLI passthrough | local editable source/vault body | `retain as current dependency` | S1/S1' residency/content law is semantic authority; Obsidian is one human/material body. |
| Notion/dashboard-era S5 material | current S5 spec explicitly says S5 is not Notion | useful historical #5/dashboard intuition only | `historical fixture/evidence only` | Optional publication/display integration may return later as an external body. |
| `#` coordinate exports / `bimbaCoordinate` | checked-in map/export data and compatibility parser law | source/provenance compatibility for old coordinates | `retain as provider/adapter` | Canonical resolved subsystem/topology identity is M-family; `#` must not become a rival namespace. |
| old subsystem workers/orchestrators whose identity came from process topology | no current M/M' owner is defined by worker/process directory; current S4/S3 specs re-home orchestration/session semantics | durable dispatch/session/team/event semantics only where current specs/tests preserve them | `historical fixture/evidence only` | R2 maps surviving semantics to modern owners; process identity alone has no authority. |

## R1 rules carried into R2

1. A current provider may remain operationally necessary without being a semantic owner.
2. A historical UI/test fixture may contain acceptance evidence worth extracting even when the shell is discarded.
3. Absence of a live implementation at this pinned head is recorded as such; it is not evidence that the old technology must be rebuilt.
4. `superseded by O:I-era product substrate` is deliberately **not assigned speculatively here**. R2 must verify the actual current O:I/AIKit/Factory/Workcell/QL owners before making that disposition.
5. This ledger is a living mapping input. New evidence should create a new snapshot/revision rather than treating this file as an architectural prohibition list.
