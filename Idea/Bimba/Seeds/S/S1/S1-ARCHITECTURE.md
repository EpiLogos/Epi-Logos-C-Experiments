---
title: "S1 Architecture — Obsidian Vault / Hen Compiler / Wikilink Integrity, total shape"
coordinate: "S1 / S1'"
status: "canonical-architecture-spec"
created: 2026-06-03
authority_relation: "Domain authority for the S1 Obsidian-vault + Hen-compiler-core surface. [[S1-SPEC]] §A-D and [[S1'-SPEC]] are the prose seed authorities; this document is the substrate-grounded total-shape architecture. Where they disagree at the substrate level, this document is authoritative for what exists on disk; the SPECs remain authoritative for normative law."
depends_on:
  - "[[S1-SPEC]]"
  - "[[S1'-SPEC]]"
  - "[[S0-ARCHITECTURE]]"
  - "[[S2-ARCHITECTURE]]"
  - "[[M5-ARCHITECTURE]]"
  - "[[M1-ARCHITECTURE]]"
companion_decisions:
  - "DR-M1-4 (PROPOSED): Hen vault-instance contract for M1-1' Instance Manager"
  - "DR-M5-1 (RATIFIED): Pi single harness + Anima dispatcher + six Aletheia subagents + six ta-onta carriers"
related_tranches:
  - "Tranche 06.4 — canon-studio + backend-studio extensions (consume S1' surfaces)"
  - "Tranche 02.X — Hen carrier contract landing (new, DR-M1-4)"
  - "Tranche 10.x — kernel-bridge profile-bus closure (no S1 fields, but Hen-routed instance handle is the seam)"
  - "Tranche 15.x — UI foundations (s1'.vault.* + s1'.semantic.* power Canon Studio + provenance gutters)"
---

# S1 Architecture — Vault Ground and Hen Compiler Total Shape

## 0. Frame

**S1 is the material vault and Hen is its compiler law.** S1 in the C-stack is `Idea/` as a concrete Obsidian/Markdown filesystem; S1' (Hen) is the contract law that makes the vault *participate in the rest of the system* rather than be merely a folder tree. The landed canonical authority is the Rust crate at [`Body/S/S1/hen-compiler-core/`](Body/S/S1/hen-compiler-core/) — 2,702 LOC of source + 1,258 LOC of tests across seven modules. The Python vendor under `Body/S/S1/hen-compiler/` is compatibility/probe material and is no longer the spine.

S1's load-bearing role across the M-stack is invisibly large. **Every other coordinate eventually writes to or reads from the vault**: M0' (bimba canon), M1' (vault-as-instance per DR-M1-4), M4' (Day/NOW writes), M5' (Canon Studio, Logos Atelier Möbius write-back), the six Aletheia subagents (Anansi reads, Janus writes through Hen), and the integrated 1-2-3 plugin (read-only consumption of vault material). **No mutation is "direct-FS write" outside S0 bootstrap** — every canonical mutation routes through `s1'.vault.*` which delegates to `epi_s1_hen_compiler_core`.

This document gives the total shape:
- §1 verifies the six S1.{0-5}/S1.{0-5}' sub-coordinates against the actual layout
- §2 inventories the substrate by file/line/struct
- §3 maps which M' surfaces consume which sub-coordinates
- §4 catalogues the contract surface (what is exposed and what is missing)
- §5 carries the cleanup/modularisation pass — concrete refactor proposals against the 881-LOC `lib.rs` and the 614-LOC `smart_env.rs`
- §6-§7 trace boundary contracts and Theia integration
- §8 anti-greenfield audit
- §9 acceptance commands
- §10 cycle-3 ledger cross-cutting

---

## 1. The Six Sub-Coordinates (bimba ↔ prime)

The S1 sub-coordinate lattice is verified against the actual layout: `Body/S/S1/{hen-compiler-core, hen-compiler}` plus the vault material itself under `Idea/`. The six rows below are the canonical S1' assignment; cross-references to `S1.{n}-SPEC.md` shards and substrate files are the load-bearing claims.

| Coord | Surface | Substrate (file, lines) | Prime partner (S1.n') | Cross-stack consumer |
|---|---|---|---|---|
| **S1-0** | Vault filesystem ground; `Idea/` root, path-normalisation, `.obsidian/` state | [`Body/S/S0/epi-cli/src/vault/mod.rs`](Body/S/S0/epi-cli/src/vault/mod.rs); [`Body/S/S0/epi-cli/src/vault/paths.rs`](Body/S/S0/epi-cli/src/vault/paths.rs) | **S1-0'** vault-zone residency law: [`hen-compiler-core/src/lib.rs:269-316`](Body/S/S1/hen-compiler-core/src/lib.rs) `resolve_compiler_residency`; canonical Day-path = `Idea/Empty/Present/{DD-MM-YYYY}/` | M0', M4-1' (Day Container), M5-1 (Canon Studio FS provider) |
| **S1-1** | Frontmatter parsing — YAML mapping + coordinate keys + temporal keys | [`hen-compiler-core/src/artifact_evidence.rs:1-252`](Body/S/S1/hen-compiler-core/src/artifact_evidence.rs) — `collect_artifact_evidence`, `split_frontmatter`, `unknown_frontmatter`, `parse_headings`, sha256 hashing | **S1-1'** frontmatter law: [`lib.rs:399-825`](Body/S/S1/hen-compiler-core/src/lib.rs) — `is_valid_coordinate`, `validate_frontmatter`, `validate_compile_artifact_frontmatter`, `validate_identity`, `validate_keys`, `validate_temporal_requirements`, `validate_l_alignments` | M0' (coordinate read), M5-1 (Canon Studio decoration), all promotion |
| **S1-2** | Template / write operations — atomic write, rename, move | [`epi-cli/src/vault/templates.rs`](Body/S/S0/epi-cli/src/vault/templates.rs); [`Body/S/S0/epi-cli/src/gate/s1_hen.rs:89-222`](Body/S/S0/epi-cli/src/gate/s1_hen.rs) `read_file`, `write_file`, `rename_or_move_file` | **S1-2'** invocation contract: [`lib.rs:82-92`](Body/S/S1/hen-compiler-core/src/lib.rs) `CompilerInvocation`, [`lib.rs:841-873`](Body/S/S1/hen-compiler-core/src/lib.rs) `compiler_invocation()` builder | M5-5 (Logos Atelier Möbius write-back), M1-1' (Hen-routed instance writes per DR-M1-4) |
| **S1-3** | Compile / ledger / query / injection pipeline | Vendor: [`Body/S/S1/hen-compiler/scripts/*.py`](Body/S/S1/hen-compiler/scripts/) compatibility; Canon: [`lib.rs:142-250`](Body/S/S1/hen-compiler-core/src/lib.rs) `ENVELOPE_LEDGER_CHANNELS` (12), [`lib.rs:252-267`](Body/S/S1/hen-compiler-core/src/lib.rs) `ql_first_channels()`, [`lib.rs:318-397`](Body/S/S1/hen-compiler-core/src/lib.rs) `plan_compile` | **S1-3'** compiler ledger spine: typed `CompilePlanRequest` / `CompilePlanResponse` / `LedgerChannel`; non-dry-run remains BLOCKED until review/promotion law lands ([`lib.rs:319-321`](Body/S/S1/hen-compiler-core/src/lib.rs) refuses non-`PiAgent` and [`lib.rs:329-339`](Body/S/S1/hen-compiler-core/src/lib.rs) returns "not implemented") | M5-4 OmniPanel (review surface), M5-5 Logos Atelier (compile-plan dispatch) |
| **S1-4** | Day / NOW materialisation — context frames, day-path = `Idea/Empty/Present/{day_id}/` | [`epi-cli/src/vault/paths.rs`](Body/S/S0/epi-cli/src/vault/paths.rs); `HenTimestamp::canonical_day_id` at [`lib.rs:41-43`](Body/S/S1/hen-compiler-core/src/lib.rs) (DD-MM-YYYY) and `vendor_day_id` at [`lib.rs:45-47`](Body/S/S1/hen-compiler-core/src/lib.rs) (YYYY-MM-DD compatibility) | **S1-4'** context frame law: temporal requirements at [`lib.rs:604-622`](Body/S/S1/hen-compiler-core/src/lib.rs) (`artifact_role: now\|thought` requires `session_id` + `day_id`; `thought` adds `thought_type`) | M4-1' DayContainer (DR-M4-1 ratified), M4 Day/NOW orchestration |
| **S1-5** | Search, backlinks, link suggest, graph-sync intent, graduation | [`hen-compiler-core/src/wikilinks.rs:1-163`](Body/S/S1/hen-compiler-core/src/wikilinks.rs) parse_wikilinks; [`smart_env.rs:1-614`](Body/S/S1/hen-compiler-core/src/smart_env.rs) `suggest_link_candidates`; [`gate/s1_hen.rs:224-301`](Body/S/S0/epi-cli/src/gate/s1_hen.rs) `suggest_links` wrap | **S1-5'** return law: [`lib.rs:495-525`](Body/S/S1/hen-compiler-core/src/lib.rs) `graph_sync_intent` (still `touches_live_graph: false` — pure intent); [`graph_promotion.rs:51-152`](Body/S/S1/hen-compiler-core/src/graph_promotion.rs) `GraphPromotionIntent::from_artifact_evidence`; [`relation_inference.rs:204-251`](Body/S/S1/hen-compiler-core/src/relation_inference.rs) `build_relation_inference_request` | M5-5 (Möbius write-back), M5-4 OmniPanel (review evidence), M5-0' library (semantic neighbours) |

The six rows survive contact with the substrate. The prime partners are not separate folders — they are the *contract law* layered *on top of* the same code that does the material work. This is the structural pattern Hen exemplifies: one crate, two semantic registers (S1 = "what files do", S1' = "what files mean").

---

## 2. Substrate Map

### 2.1 The `hen-compiler-core` Rust crate

[`Body/S/S1/hen-compiler-core/Cargo.toml`](Body/S/S1/hen-compiler-core/Cargo.toml) declares:

```toml
name = "epi-s1-hen-compiler-core"
edition = "2021"
[dependencies]
serde, serde_json, serde_yaml, sha2
```

The library `epi_s1_hen_compiler_core` is consumed by:
- [`Body/S/S0/epi-cli/Cargo.toml:58`](Body/S/S0/epi-cli/Cargo.toml) — the `epi vault` CLI and the `s1_hen` gateway module
- [`Body/S/S2/graph-services/Cargo.toml:27`](Body/S/S2/graph-services/Cargo.toml) — graph-promotion intent consumers in S2 (Neo4j)
- [`Body/S/S5/epii-autoresearch-core/Cargo.toml:7`](Body/S/S5/epii-autoresearch-core/Cargo.toml) — the autoresearch spine consumes promotion intents

This is the load-bearing cross-stack consumption pattern: S1 is a **library**, not a service. Every S-coordinate that needs to write vault material links against `epi_s1_hen_compiler_core` and uses the typed contracts.

### 2.2 Module-by-module substrate

| Module | LOC | Owns | Key types & fns |
|---|---:|---|---|
| `lib.rs` | **881** | residency planning, compile-plan facade, coordinate validation, frontmatter validation, ledger-channel registry, compiler invocation, graph-sync intent | `HenTimestamp` (l.19-48), `ExecutorKind` (l.50-55), `TargetAgent` (l.57-61), `LedgerChannel` (l.63-69), `CompilerResidencyPlan` (l.71-80), `CompilerInvocation` (l.82-92), `CompilePlanRequest` (l.94-106), `CompilePlanResponse` (l.108-116), `GraphSyncMode` (l.118-122), `GraphSyncIntent` (l.124-134), `ValidationResult` (l.136-140), `ENVELOPE_LEDGER_CHANNELS` (l.177-250), `ql_first_channels` (l.252-267), `resolve_compiler_residency` (l.269-316), `plan_compile` (l.318-397), `is_valid_coordinate` (l.399-428), `validate_frontmatter` (l.430-448), `validate_compile_artifact_frontmatter` (l.450-493), `graph_sync_intent` (l.495-525), `compiler_invocation` (l.841-873) |
| `artifact_evidence.rs` | 252 | parse markdown into `ArtifactEvidence`: frontmatter Value, body wikilinks, headings, content/body hashes | `ArtifactKind` (l.8-13), `MarkdownHeading` (l.15-20), `ArtifactEvidence` (l.22-35), `collect_artifact_evidence` (l.37-62), `split_frontmatter` (l.64-93), `unknown_frontmatter` (l.144-168), `parse_headings` (l.170-206), fence-aware scanning (l.221-247) |
| `wikilinks.rs` | 163 | parse `[[X]]`, `[[X#H]]`, `[[X\|alias]]`; fence-aware (code blocks skipped); preserves line/column/context | `WikilinkTarget` (l.1-6), `Wikilink` (l.8-17), `parse_wikilinks` (l.19-36), `parse_target` (l.98-110), `update_fence_state` (l.136-152) |
| `smart_env.rs` | **614** | semantic link suggestion from `.smart-env/multi/*.ajson` (Obsidian Smart Connections vault index): explicit-outlink, semantic-source, semantic-block ranking; cosine similarity over BGE-micro embeddings | `LinkCandidateRequest/Response` (l.10-43), `LinkCandidateKind` (l.19-25), `LinkCandidate` (l.27-36), `SmartEnvIndex` (l.67-73, l.355-490), `suggest_link_candidates` (l.109-222), `cosine_similarity` (l.332-353), `resolve_wikilink_target` (l.435-489), `load_ajson_file` (l.492-564) |
| `relation_inference.rs` | 380 | typed contract for PI-agent relation inference + JSON validation + PI process spawn | `ALLOWED_RELATION_TYPES` (l.11-27, 15 types), `RelationLinkEvidence` (l.29-38), `RelationInferenceRequest` (l.40-50), `RelationInferenceCandidate` (l.52-65), `RelationInferenceProvider` trait (l.67-72), `PiAgentRelationInferenceProvider` (l.74-167), `build_relation_inference_request` (l.204-251), `validate_relation_candidates` (l.253-270), `extract_first_json_value` (l.341-380) |
| `property_intelligence.rs` | 131 | property-proposal contract: which graph properties a node should carry given coordinate-family hints | `PropertyIntelligenceRequest` (l.6-20), `PropertyFrontmatterEvidence` (l.22-27), `PropertyHeadingEvidence` (l.29-34), `build_property_intelligence_request` (l.36-79), `property_intelligence_system_instructions` (l.114-125) |
| `graph_promotion.rs` | 281 | turn validated `ArtifactEvidence` into `GraphPromotionIntent` for S2 (Neo4j); routes promotion class by vault path; preserves legacy `bimbaCoordinate` compatibility | `GraphPromotionIntent` (l.13-27), `GraphPromotionNode` (l.29-36), `FrontmatterEvidence` (l.38-43), `from_artifact_evidence` (l.57-151), `promotion_class_for_path` (l.154-179), `leading_property_families_for_path` (l.181-196), `legacy_coordinate_evidence` (l.262-275) |

**Total**: 2,702 LOC source / 1,258 LOC tests across 7 + 10 files.

### 2.3 The Python vendor compatibility surface

[`Body/S/S1/hen-compiler/scripts/`](Body/S/S1/hen-compiler/scripts/) contains:
- `compile.py` (7.6k), `query.py` (4.3k), `flush.py` (8.1k), `lint.py` (10k) — vendor pipeline
- `hen_compile_plan.py` (5.3k), `hen_residency.py` (3.2k) — partial port stubs
- `state.json`, `last-flush.json` — vendor operational state

**Status**: per [`S1'-SPEC.md:18-43`](Idea/Bimba/Seeds/S/S1/S1'/S1'-SPEC.md), this is *compatibility/probe material*. The canonical authority is the Rust crate. The Python scripts remain useful for vendor-adjacent Claude memory work but are NOT consumed by any canonical Rust caller.

The vendor `daily/{YYYY-MM-DD}.md` and `knowledge/concepts/{slug}.md` directories are compatibility aliases for canonical paths `Idea/Empty/Present/{DD-MM-YYYY}/daily-note.md` and `Idea/Pratibimba/Self/Thought/T/{Tn}/{slug}.md` — see [`lib.rs:285-305`](Body/S/S1/hen-compiler-core/src/lib.rs) `resolve_compiler_residency`.

### 2.4 The S0 gateway mirror — `s1_hen.rs`

[`Body/S/S0/epi-cli/src/gate/s1_hen.rs`](Body/S/S0/epi-cli/src/gate/s1_hen.rs) is 492 LOC of *gateway dispatch*. It is NOT S1 substrate — it is **S0 membrane code** that wraps `epi_s1_hen_compiler_core` and exposes:

| Function | Lines | Method-family | Action |
|---|---:|---|---|
| `read_file` | 89-105 | `s1'.vault.read_file` | public-safe read; refuses Protected without governed capability |
| `write_file` | 106-130 | `s1'.vault.write_file` | atomic write + post-write `parse_wikilinks` integrity reporting |
| `rename_or_move_file` | 138-222 | `s1'.vault.rename_file` / `move_file` | atomic rename + walk vault rewriting `[[from_title]]` → `[[to_title]]` across all `.md` files; returns `S1VaultRenameReceipt` |
| `suggest_links` | 224-301 | `s1'.semantic.suggest_links` | wraps `suggest_link_candidates`, attaches per-candidate privacy class, rolls up staleness; falls back gracefully on no-index |

This mirror is the **load-bearing read of the S0 membrane invariant** (S0 = membrane; S1 = service law): S0 does not invent vault behaviour; it provides the JSON-RPC dispatch surface that delegates to S1.

### 2.5 The Smart Env semantic-index dependency

[`smart_env.rs:357-365`](Body/S/S1/hen-compiler-core/src/smart_env.rs) requires `<vault_root>/.smart-env/multi/*.ajson`. This is the **Obsidian Smart Connections plugin** producing local BGE-micro-v2 embeddings of every SmartSource/SmartBlock. The Rust side parses the `.ajson` (pseudo-JSON with trailing comma) and does cosine similarity directly — **no embedding model is invoked at compile time, no external service is called**. This is the right discipline: S1 is a pure-read consumer of Obsidian's local index.

`s1_hen.rs:282-296` handles the "no index yet" case explicitly: returns a `NoIndex` response so kernel-bridge/M-extensions can surface a banner or fall back. **This is a load-bearing graceful-degradation invariant** — Theia cannot assume the Smart Connections index exists.

---

## 3. M' Dependency Map

Cross-references map S1 sub-coordinates onto the eight M' architecture documents in `Idea/Bimba/Seeds/M/M{0..5}'/M{n}-ARCHITECTURE.md`.

### 3.1 Surface-level M' consumers

| M' surface | S1 sub-coordinate consumed | Specific contract | Evidence |
|---|---|---|---|
| **M0' Bimba Map Inspector** | S1-1' (frontmatter parse), S1-5' (graph-sync intent) | reads coordinate + frontmatter for inspector tooltips; `graph_sync_intent` flows to M0' panels through S2 | [`M5-ARCHITECTURE.md:496`](Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md) "Möbius write-back deposits into M0's bimba node" |
| **M1-1' Instance Manager** (per DR-M1-4 PROPOSED) | S1-2', S1-5' | every instance write routes through Hen; wikilink integrity on rename; coordinate-residency invariant on move; `M1_Root.vault_anchor` populates `InstanceHandle.vault_anchor` | [`M1-ARCHITECTURE.md:121-141, 388-399, 721-725`](Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md) — the contract edge is DOC-AHEAD pending DR-M1-4 ratification |
| **M4-1' Day Container** | S1-0', S1-4' | DayContainer path `Idea/Empty/Present/{day_id}/` is the canonical day-now substrate; reconciles DR-M4-1 | day-id format = `HenTimestamp::canonical_day_id` = `DD-MM-YYYY` |
| **M5-0' Gnostic Library** | S1-5 (semantic) | `smart_env.rs::suggest_link_candidates` provides vault-semantic input for the library-surface | [`M5-ARCHITECTURE.md:62, 97`](Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md) |
| **M5-1' Canon Studio** | S1-1' (frontmatter decoration), S1-2 (write), S1-5 (semantic autocomplete) | markdown editor + QL/bimba coordinate decoration + Smart Connections wikilink autocomplete via `s1'.semantic.*`; writes via Hen `s1'.vault.*` | [`M5-ARCHITECTURE.md:63, 344-345`](Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md); [`11-theia-shell-surface-hosting.md:42`](Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-theia-shell-surface-hosting.md) |
| **M5-2' Backend Studio** | S1-3' (compile-plan inspection) | LSP-driven inspection of `hen-compiler-core` itself; coordinate-tagged source view | [`M5-ARCHITECTURE.md:64`](Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md) |
| **M5-4' OmniPanel** | S1-3' (review surface), S1-5' (graph promotion review) | promotion intents and compile-plan dry-runs flow into the Review tab; `humanRequired` items deposit through Anima | [`M5-ARCHITECTURE.md:449-454`](Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md) |
| **M5-5' Logos Atelier** | S1-2' (write contract), S1-5' (promotion intent) | scent-following → cognate → drift → psychoid → pros-hen → **Möbius write-back proposal** through `GraphPromotionIntent` and `s1'.vault.*` | [`M5-ARCHITECTURE.md:48, 195, 463`](Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md) |
| **Integrated-1-2-3 plugin** | none direct | reads kernel-profile only; no vault write | [`INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md) — pure visual composition |
| **Integrated-4-5-0 recognition** | S1-5' | recognition surfaces consume `GraphPromotionIntent` evidence | [`INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md) |

### 3.2 The agentic consumers

| Agent / Carrier | S1 surface used | Direction |
|---|---|---|
| **Pi (harness)** | None directly — Pi spawns processes only | — |
| **Anima (dispatcher)** | None directly — dispatches subagents who call S1 methods | — |
| **Anansi (research subagent)** | `s1'.vault.read_file`, `s1'.semantic.suggest_links` | read-only |
| **Janus (write subagent)** | `s1'.vault.write_file`, `s1'.vault.rename_file`, `s1'.vault.move_file` | write through Hen |
| **Aletheia (tool-guardian carrier)** | Coordinates the six subagents; gates write capability | dispatcher |
| **Hen (ta-onta carrier)** | IS the S1-side seam; [`Body/S/S4/ta-onta/hen/`](Body/S/S4/ta-onta/hen/) wraps `s1'.{vault, semantic}.*` for spine-contribution use | identity — S4 carrier is the S4-side handle to S1' contract |

The **Hen ta-onta carrier** is not a different Hen — it is the S4-side wrapper that surfaces S1' methods into the spine-contribution pipeline. The actual law lives in `hen-compiler-core`. Per DR-M5-1 ratified, the ta-onta carriers are NOT agents, they are service-routing infrastructure; this matches the architectural shape where Hen-carrier is a thin wrapper around `epi_s1_hen_compiler_core`.

### 3.3 Theia shell consumers (Body/M/epi-theia)

Per Tranche 06.4 + Tranche 11 (Theia shell surface hosting):

- **`Body/M/epi-theia/extensions/canon-studio/`** (NEW per Tranche 06.4) — markdown editor extension consuming `s1'.vault.*` for writes and `s1'.semantic.suggest_links` for wikilink autocomplete. **Status: DOC-AHEAD** (S1 contract landed, extension not yet built).
- **`Body/M/epi-theia/extensions/backend-studio/`** (NEW per Tranche 06.4) — LSP-driven `epi-lib` + `portal-core` + S1-S5 cores inspector. **Status: DOC-AHEAD**.
- **`Body/M/epi-theia/extensions/m5-epii/`** — already exists; consumes S5 review evidence which transitively depends on S1' promotion intents.
- **`Body/M/epi-theia/extensions/omnipanel-shell/`** (per Tranche 15.2 reframe of the agentic-control-room substrate) — surfaces dispatch trace and review items; S1' promotion-intent reviews surface here.

The **Theia FS provider** reads vault material directly (the "writes-through-Hen, reads-direct-FS" invariant per [`M5-ARCHITECTURE.md:113`](Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md)). No Obsidian-runtime IPC; Theia and Obsidian coexist via shared filesystem.

### 3.4 The DR-M1-4 contract surface (PROPOSED)

The **most important active proposal** touching S1: DR-M1-4 (per [`13-decision-register.md:343-349`](Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md)) — Hen vault-instance contract for M1-1' Instance Manager. Recommendation: land contract at `Body/S/S4/ta-onta/S4-1p-hen/CONTRACT.md` (or equivalent) declaring:

1. Every M1-1' instance write routes through Hen.
2. Wikilink integrity preserved on rename — already substrate-landed in `gate/s1_hen.rs:138-222`.
3. Coordinate-residency invariant enforced on move — partially substrate-landed via `is_valid_coordinate` + `validate_keys`, **but no "move that changes residency must update `coordinate` frontmatter" check exists**. This is a **landed-gap** to fix (see §5.6).

M1 extension subscribes and never writes vault directly. The substrate to support this contract is already 90% present; what is needed is (a) the carrier contract markdown file, (b) the missing coordinate-residency-on-move check, (c) the `InstanceHandle.vault_anchor` field on the kernel profile (Tranche 10.x).

---

## 4. Contract Surface — What Is Exposed, What Is Missing

### 4.1 Exposed contract types (the public S1' surface)

```text
HenTimestamp                  -- (year, month, day, hour, minute, second); canonical_day_id() = DD-MM-YYYY
ExecutorKind                  -- PiAgent | Service | VendorClaudeSdk
TargetAgent                   -- Anima | Epii
LedgerChannel                 -- 12 envelope channels (transport..ql); compile/return name discipline
CompilerResidencyPlan         -- source_path, compiled_path, vendor_*_alias, thought_lane, day_id, artifact_slug
CompilerInvocation            -- executor_kind, target_agent, required_plugin, required_skill, tool_boundary,
                                 review_policy, mutation_mode, compatibility_backend
CompilePlanRequest/Response   -- the dry-run plan facade
GraphSyncMode                 -- CanonicalWrite | MigrateLegacyCoordinate
GraphSyncIntent               -- pure intent; touches_live_graph: false
ValidationResult              -- {errors[], warnings[]}
WikilinkTarget                -- Path | Heading | PathHeading
Wikilink                      -- raw, raw_target, target, alias, line, column, context
ArtifactEvidence              -- title, coordinate, body_wikilinks[], headings[], content_hash, body_hash, frontmatter
LinkCandidate                 -- target_path, wikilink_title, score, kind, evidence_source_path, evidence_lines, stale
LinkCandidateKind             -- ExplicitOutlink | SemanticSource | SemanticBlock
GraphPromotionIntent          -- node, link_evidence[], frontmatter_evidence[], property_intelligence_request,
                                 relation_candidates, content_hash, markdown_body_hash, compatibility_source_*,
                                 promotion_source, sync_version
PropertyIntelligenceRequest   -- the property-proposal contract for PI agents
RelationInferenceRequest      -- typed PI-relation-inference request
RelationInferenceCandidate    -- {source, target, relation_type ∈ ALLOWED_RELATION_TYPES, confidence, evidence}
RelationInferenceProvider     -- trait; PiAgentRelationInferenceProvider is the canonical impl
```

The 15 `ALLOWED_RELATION_TYPES` ([`relation_inference.rs:11-27`](Body/S/S1/hen-compiler-core/src/relation_inference.rs)): `REFERENCES, SOURCES, CONTAINS, PART_OF, ELABORATES, CONTRASTS, IMPLEMENTS, OPERATES_IN, REFLECTS_AS, INVERTS_TO, SUPPORTS, CRITIQUES, DERIVES_FROM, PROMOTES_TO, SYNCED_FROM`.

The 12 `ENVELOPE_LEDGER_CHANNELS` ([`lib.rs:177-250`](Body/S/S1/hen-compiler-core/src/lib.rs)): `transport, runtime, temporal, coordinate, residency, context, environs, execution, episodic, crystallisation, improvement, ql`. The `ql_first_channels()` reorder puts `ql` at index 0 — this matches the QL-first compiler discipline noted in [`S1-SPEC.md`](Idea/Bimba/Seeds/S/S1/S1-SPEC.md).

### 4.2 Gateway method surface (via `gate/s1_hen.rs`)

| Method | Substrate | Status |
|---|---|---|
| `s1'.vault.read_file` | `read_file` (l.89-105) | LANDED — refuses Protected without capability |
| `s1'.vault.write_file` | `write_file` (l.106-130) | LANDED — atomic; reports wikilink count |
| `s1'.vault.rename_file` | `rename_or_move_file` (l.138-222) | LANDED — atomic + inbound wikilink rewrite |
| `s1'.vault.move_file` | same handler | LANDED |
| `s1'.semantic.suggest_links` | `suggest_links` (l.224-301) | LANDED — Smart Env wrap with privacy + staleness |
| `s1'.vault.append_block` | — | **MISSING** — declared deferred at l.25 |
| `s1'.vault.update_frontmatter` | — | **MISSING** — declared deferred at l.26; [`S1-1-SPEC.md:42`](Idea/Bimba/Seeds/S/S1/S1-1-SPEC.md) confirms this is still operator escape-hatch via `obsidian-cli` |
| `s1'.vault.list_dir` | — | **MISSING** |
| `s1'.vault.watch` | — | **MISSING** |
| `s1'.semantic.neighbors_of` | — | **MISSING** — needs Hen-side surface addition |
| `s1'.semantic.search` | — | **MISSING** |
| `s1'.semantic.by_block` | — | **MISSING** |
| `s1'.entity.capture` | — | **MISSING** — dangling/root-created note capture into Empty candidate residency |
| `s1'.entity.classify` | — | **MISSING** — coordinate/CT/alias/link classification for entity candidates |
| `s1'.entity.promote_to_type` | — | **MISSING** — reviewed Empty candidate promotion into World/Types incubation |
| `s1'.type.classify_c_layer` | — | **MISSING** — C0-C5 semantic authority classification before folder/type placement |
| `s1'.world.graduate` | — | **MISSING** — flat World crystallisation with type-local MOC pointer |
| `s1'.compile` (dry-run) | `plan_compile` (lib.rs:318-397) | LANDED at library level; **NO gateway dispatch yet** |
| `s1'.ledger.append` | — | **MISSING** in gateway; ledger channels declared but no append entry-point |
| `s1'.query` | — | **MISSING** in gateway; vendor `query.py` is reference |
| `s1'.injection` | — | **MISSING** in gateway |

### 4.3 Profile-bus integration

**S1' does NOT directly publish a profile-bus field.** This is correct: S1 is a write/read substrate; the profile bus carries kernel-clock/coordinate state from `portal-core`. The single S1 ↔ profile-bus seam is:

- **`InstanceHandle.vault_anchor: Option<VaultAnchor>`** — per [`M1-ARCHITECTURE.md:388-399`](Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md), bound to DR-M1-4. When M1-1' crystallises a walk through Hen, the `vault_anchor` field on the kernel-bridge profile carries the bimba-vault path + `hen_carrier_id`. This is the **single load-bearing field** that surfaces S1' into the kernel-profile bus.

Tranche 10.x kernel-bridge work owns this field. The S1 side needs only to *produce* the `VaultAnchor` payload on successful write; no `MathemeHarmonicProfile` extension is needed in S1.

### 4.4 What is missing — load-bearing gaps

1. **`s1'.vault.update_frontmatter` gateway method** (S1-1' incomplete mutation side) — surfaces to Canon Studio and Logos Atelier.
2. **`s1'.compile` gateway dispatch** — library-side facade exists; needs JSON-RPC entry point.
3. **`s1'.ledger.{append, query}` gateway dispatch** — substrate (ledger-channel registry) is present; no entry-point.
4. **Coordinate-residency-on-move check** — `rename_or_move_file` does literal-text wikilink rewrite but does NOT validate that a move into a different coordinate folder is reflected in the `coordinate` frontmatter key. DR-M1-4 needs this guarantee. See §5.6.
5. **`s1'.semantic.neighbors_of` + `by_block`** — Smart Env index supports it; the wrapping is not exposed.
6. **`s1'.compile` non-dry-run** — explicitly blocked at [`lib.rs:319-321`](Body/S/S1/hen-compiler-core/src/lib.rs) until review/promotion law lands. This is correct current-state honesty.
7. **No Hen carrier CONTRACT.md** — `Body/S/S4/ta-onta/hen/CONTRACT.md` is the right place to land DR-M1-4 (per [`13-decision-register.md:347`](Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md)).
8. **Entity-candidate lifecycle** — old Empty node-resolution canon + Cycle 3 Smart Env candidate pool are not yet unified in gateway methods. DR-S1-4 / CCT-14 require `s1'.entity.capture`, `classify`, `promote_to_type`, and `s1'.world.graduate` over [[FLOW-2026-06-03-HEN-ENTITY-CAPTURE-LIFECYCLE]].
9. **C-layer semantic typology** — World/Types semantic categories are now rooted under `Coordinates/C/**`, but Hen does not yet expose `s1'.type.classify_c_layer` or graph-promotion evidence for `semantic_authority` / `c_layer_path`. CCT-15 tracks [[FLOW-2026-06-03-C-LAYER-TYPOLOGY-AND-MOC-WORKFLOW]].

---

## 5. Code Cleanup + Modularisation Findings

This section is the substantive engineering pass. Each finding names a specific location, current shape, proposed refactor, benefit, and blast radius.

### 5.1 `lib.rs` is 881 LOC and houses six concerns — split

**Location**: [`Body/S/S1/hen-compiler-core/src/lib.rs`](Body/S/S1/hen-compiler-core/src/lib.rs)

**Current shape**: One file holds (a) residency planning, (b) coordinate validation, (c) frontmatter validation, (d) ledger-channel registry, (e) compile-plan facade, (f) compiler-invocation builder, (g) graph-sync intent. The L-alignment validation alone is 109 LOC ([l.716-825](Body/S/S1/hen-compiler-core/src/lib.rs)). The frontmatter-key validators are 99 LOC ([l.559-714](Body/S/S1/hen-compiler-core/src/lib.rs)). Plus a 73-LOC ledger-channel const-block ([l.177-250](Body/S/S1/hen-compiler-core/src/lib.rs)). The file has crossed the "many concerns, one home" threshold.

**Proposed refactor**: split into a workspace-internal module layout:
```
src/
  lib.rs                  — re-exports only (target: <100 LOC)
  residency.rs            — HenTimestamp, CompilerResidencyPlan, resolve_compiler_residency
  coordinate.rs           — is_valid_coordinate, CF_NAMES/VAK_NAMES/FAMILIES, is_coordinate_key
  frontmatter.rs          — validate_frontmatter, validate_compile_artifact_frontmatter, validate_*
  l_alignments.rs         — validate_l_alignments (the big standalone block)
  ledger.rs               — LedgerChannel, ENVELOPE_LEDGER_CHANNELS, ql_first_channels
  compile_plan.rs         — CompilePlanRequest/Response, plan_compile, CompilerInvocation, compiler_invocation
  graph_sync.rs           — GraphSyncMode, GraphSyncIntent, graph_sync_intent
```

**Benefit**: each module is testable in isolation; new contributors can locate `validate_l_alignments` without grepping; cycle-3 additions (e.g., `s1'.vault.update_frontmatter` law) have a clear home.

**Blast radius**: minimal. The crate exposes types via `pub use` in `lib.rs`; the existing public API can be preserved verbatim. Test files import from the crate root (e.g., `epi_s1_hen_compiler_core::artifact_evidence::collect_artifact_evidence`) and those paths remain valid via the existing module declarations. Risk to S0 gate consumer (`gate/s1_hen.rs`) and S2/S5 consumers: NONE if `pub use` re-exports are added in `lib.rs`. Risk to test files: NONE — they import via crate-root paths.

### 5.2 `smart_env.rs` is 614 LOC and mixes index + scoring + IO — split

**Location**: [`Body/S/S1/hen-compiler-core/src/smart_env.rs`](Body/S/S1/hen-compiler-core/src/smart_env.rs)

**Current shape**: One file owns (a) the `SmartEnvIndex` data model (`SourceRecord`, `BlockRecord`, title-index hashmap), (b) `.ajson` file parsing with pseudo-JSON workaround at [l.504](Body/S/S1/hen-compiler-core/src/smart_env.rs), (c) candidate scoring/ranking, (d) cosine similarity math, (e) wikilink target resolution, (f) the public `suggest_link_candidates` orchestrator.

**Proposed refactor**:
```
src/smart_env/
  mod.rs               — re-exports + public types (LinkCandidate, LinkCandidateRequest/Response, LinkCandidateKind)
  index.rs             — SmartEnvIndex, SourceRecord, BlockRecord, title-index logic, resolve_*
  ajson.rs             — load_ajson_file + the pseudo-JSON trim/wrap workaround (isolate the fragile bit)
  scoring.rs           — cosine_similarity, rank_candidates, candidate_kind_rank
  candidates.rs        — suggest_link_candidates orchestrator
```

**Benefit**: the `.ajson` pseudo-JSON parsing (which is genuinely fragile — Smart Connections writes trailing-comma-terminated entries that the current code wraps in `{}` and strips) becomes isolatable for fuzzing. The cosine-similarity scoring is a tiny self-contained module that could grow new kernels (BM25 fallback for sparse vectors, etc.) without touching the orchestrator.

**Blast radius**: NONE for external API — `LinkCandidate*` types stay public via `mod.rs`. The internal types (`SmartEnvIndex`, `SourceRecord`) are private and have no external consumers. Test files import via the crate root.

### 5.3 `gate/s1_hen.rs` wikilink-rename does literal-text rewriting bypassing Hen — unify

**Location**: [`Body/S/S0/epi-cli/src/gate/s1_hen.rs:155-205`](Body/S/S0/epi-cli/src/gate/s1_hen.rs) (rewrite loop + helpers `rewrite_wikilink_titles_with_count`, `path_matches_title`, `wikilink_title_from_path`).

**Current shape**: The rename handler does **TWO PASSES** that are not unified:
1. Literal-text rewrite of `[[from_title]]` → `[[to_title]]` and its anchor forms (`#`, `^`, `|`) in `rewrite_wikilink_titles_with_count`.
2. A second pass through `parse_wikilinks` *whose result is dropped* ([l.196-205](Body/S/S0/epi-cli/src/gate/s1_hen.rs)) — comment: "We still consult Hen's parser to surface integrity warnings the textual rewrite could miss". The integrity warnings are not actually surfaced; `refusals: Vec<S1VaultRenameRefusal>` is initialised empty and never appended to.

The current code declares Hen the "integrity authority" but the textual rewrite is the "mutation authority". This is a **boundary smell**: the integrity authority is given no power to refuse, and the textual rewrite has no model of the wider link graph.

**Proposed refactor**:
1. Move the rename-reconciliation logic from `gate/s1_hen.rs` *into* `hen-compiler-core` as a new `wikilinks::reconcile_rename(vault_root, from_title, to_title)` function returning `(Vec<ReconciledDoc>, Vec<RenameRefusal>)`. The gateway becomes a thin dispatcher.
2. Use the structured `parse_wikilinks` output as the single source of truth for both "what to rewrite" and "what to flag" — derive the rewritten text from `Wikilink.raw + .target + .alias` reassembly, NOT from textual regex.
3. Surface integrity warnings as `S1VaultRenameRefusal` entries (e.g., orphan heading anchors, ambiguous title matches across multiple files).

**Benefit**: (a) the rename law becomes testable in `hen-compiler-core/tests/` without an `epi-cli` round-trip, (b) future `WikilinkTarget` variants (e.g., block anchors `^block-id` which the current code does NOT model as a distinct `WikilinkTarget` variant, only treats textually) gain automatic coverage, (c) the integrity authority becomes the mutation authority — single seam.

**Blast radius**: MEDIUM. The S0 gateway consumer changes one function call; the rename receipt schema (`S1VaultRenameReceipt` in `epi-s3-gateway-contract`) stays identical. Tests in `epi-cli/tests/gate_s1_vault_surface.rs` must move or duplicate to `hen-compiler-core/tests/rename_reconciliation.rs`.

### 5.4 `Wikilink` struct missing block-anchor variant — extend

**Location**: [`Body/S/S1/hen-compiler-core/src/wikilinks.rs:1-6`](Body/S/S1/hen-compiler-core/src/wikilinks.rs), [`Body/S/S1/hen-compiler-core/src/wikilinks.rs:98-110`](Body/S/S1/hen-compiler-core/src/wikilinks.rs)

**Current shape**: `WikilinkTarget` has three variants: `Path`, `Heading`, `PathHeading`. Obsidian also supports `[[Note^block-id]]` (block anchor) and `[[Note#^block-id]]` syntax. The current parser at `parse_target` only splits on `#`; `^` anchors fall into `WikilinkTarget::Path` with `Note^block-id` as the raw path — wrong.

**Proposed refactor**: add `WikilinkTarget::PathBlock { path, block_id }` and `WikilinkTarget::PathHeadingBlock { path, heading, block_id }`. Extend `parse_target` to split on `^` after `#`. Update `rewrite_wikilink_titles` in `gate/s1_hen.rs` (or after §5.3, in the new `reconcile_rename`) to handle these forms.

**Benefit**: closes the silent-corruption hole where a renamed note breaks block-anchor wikilinks. This is a real Obsidian usage pattern in the seed material — see references like `Quaternal_Logic_Lived_Topology.md` in `Idea/Bimba/Map/datasets/paramasiva-deep/`.

**Blast radius**: LOW. The enum addition is non-breaking via `#[non_exhaustive]` or by exhaustive-match audit. Tests in `wikilink_parser.rs` need new cases.

### 5.5 `validate_l_alignments` is 109 LOC of imperative validation — extract validator type

**Location**: [`Body/S/S1/hen-compiler-core/src/lib.rs:716-825`](Body/S/S1/hen-compiler-core/src/lib.rs)

**Current shape**: One function inspects each entry of an `l_alignments` sequence, walking nested optional fields with raw match-on-`as_str`/`as_u64` calls. It checks: required `lens` string, `lens_index` ∈ 0-11, `mode` ∈ {day, night}, day/night ↔ lens_index parity, weight ∈ 0.0-1.0, `klein_square` 4-element string array. The logic is correct but reads as one walls-of-text validator.

**Proposed refactor**: define a typed struct in (the new) `l_alignments.rs`:
```rust
#[derive(Deserialize)]
struct LAlignmentEntry {
    lens: String,
    lens_index: u8,
    mode: LMode,                     // enum {Day, Night}
    weight: Option<f64>,
    klein_square: Option<[String; 4]>,
}
```
and delegate to `serde_yaml::from_value::<Vec<LAlignmentEntry>>(value.clone())` plus a small post-deserialise `validate(&self) -> Result<()>` for the day/night parity check.

**Benefit**: half the LOC; the validator surfaces type errors via serde's structured error messages instead of hand-rolled `errors.push` strings; future fields (e.g., `tritone_mirror_lens` per M1-2 architecture) drop in as struct fields.

**Blast radius**: LOW. The output `ValidationResult` shape is preserved; tests in `frontmatter.rs` cover the same paths.

### 5.6 No coordinate-residency-on-move enforcement — add

**Location**: gap — affects `gate/s1_hen.rs::rename_or_move_file` and the proposed `wikilinks::reconcile_rename` (§5.3).

**Current shape**: When a file moves from `Idea/Bimba/Seeds/S/S1/S1-0-SPEC.md` to `Idea/Bimba/Seeds/S/S2/S2-0-SPEC.md`, the rename succeeds and inbound wikilinks rewrite, but **no check verifies that the `coordinate:` frontmatter key was updated to match the new residency**. The vault now has an `S1.0`-coordinate file living in the `S2` folder — a silent residency violation.

**Proposed refactor**: in `reconcile_rename` (per §5.3), call `collect_artifact_evidence(to_abs, body)`; extract `coordinate` from frontmatter; cross-check against the new folder via a new function `coordinate_for_residency(rel_path) -> Option<String>` that maps `Idea/Bimba/Seeds/S/{Sn}/{Sn}-{x}-SPEC.md` to expected coordinate `Sn.x` (and similar rules for `World/`, `Empty/Present/`, `Pratibimba/Self/Thought/T/Tn/`). If the parse-extracted coordinate disagrees with the residency-expected coordinate, return an `S1VaultRenameRefusal` (or auto-update frontmatter if a `--auto-update-coordinate` capability is supplied).

**Benefit**: closes DR-M1-4's third invariant ("coordinate-residency invariant enforced on move"). Without this, M1-1' Instance Manager cannot use `s1'.vault.move_file` safely.

**Blast radius**: MEDIUM-HIGH. Adds a refusal path that existing callers don't expect; document as a typed `RefusalReason::CoordinateResidencyMismatch`. Existing tests pass (none currently move across coordinate folders).

### 5.7 `graph_promotion.rs::promotion_class_for_path` uses 9-clause if/else over string-contains — table-driven

**Location**: [`Body/S/S1/hen-compiler-core/src/graph_promotion.rs:154-179`](Body/S/S1/hen-compiler-core/src/graph_promotion.rs)

**Current shape**: 9-clause if/else mapping path-prefix patterns to promotion classes. Adding a new path-pattern (e.g., for Body/M/epi-theia source vs Body/S source) requires editing the if/else chain. Same shape duplicated in `leading_property_families_for_path` at [l.181-196](Body/S/S1/hen-compiler-core/src/graph_promotion.rs).

**Proposed refactor**: lift to a `const PATH_CLASS_TABLE: &[(&str, &str)]` static slice and iterate. Same for `leading_property_families_for_path` using `&[(&str, [&str; 2])]`.

**Benefit**: new path patterns become a const-table edit; the routing law becomes inspectable as data (printable as a debug aid).

**Blast radius**: NONE. Pure refactor.

### 5.8 `PiAgentRelationInferenceProvider::from_env` reads 7 env vars with duplicated default fallbacks — consolidate

**Location**: [`Body/S/S1/hen-compiler-core/src/relation_inference.rs:84-134`](Body/S/S1/hen-compiler-core/src/relation_inference.rs)

**Current shape**: `EPI_REPO_ROOT`, `EPI_HEN_PI_AGENT`, `EPI_HEN_PI_ROLE`, `EPI_HEN_PI_AGENT_DIR`, `EPI_HEN_PI_SYSTEM_PROMPT`, `EPI_HEN_PI_PROGRAM` — each with bespoke `or_else`/`unwrap_or_else`. Hardcoded defaults like `"anima"`, `"logos"`, `"pi"`. The S4 `pi-agent` path (`Body/S/S4/pi-agent/prompts/epi-system.md`) is hardcoded.

**Proposed refactor**: define a `struct HenPiAgentConfig { repo_root, agent, role, agent_dir, system_prompt_path, pi_program }` with `Config::from_env()` and `Config::default_for_repo(repo_root)` constructors. Document env var names in module-level docstring; centralise defaults. Add `HenPiAgentConfig::for_subagent(name: &str)` for the eight named subagents (per DR-M5-1: Anansi, Moirai, Janus, Mercurius, Agora, Zeithoven + Anima dispatcher).

**Benefit**: makes the configuration auditable; supports the six-subagent dispatch pattern declared in DR-M5-1 without requiring per-call env-var overrides; gives tests a builder pattern.

**Blast radius**: LOW. Single caller in `gate/s1_hen.rs` (if any) and tests; the `from_env()` signature is preserved as a thin wrapper.

### 5.9 Test surface: missing rename-reconciliation tests with structured wikilink

**Location**: `Body/S/S1/hen-compiler-core/tests/` lacks `rename_reconciliation.rs`; `Body/S/S0/epi-cli/tests/gate_s1_vault_surface.rs` (not inspected here; per [`S1-5-SPEC.md:39`](Idea/Bimba/Seeds/S/S1/S1-5-SPEC.md)) carries the integration coverage.

**Current shape**: `wikilink_parser.rs` (113 LOC) tests parsing only. `smart_env_link_candidates.rs` (84 LOC) covers candidate suggestion. No test exercises the rename-rewrite path through structured wikilinks.

**Proposed addition**: per §5.3 refactor, add `tests/rename_reconciliation.rs` with cases:
- rename preserves aliases (`[[X|alias]]` → `[[Y|alias]]`)
- rename rewrites `[[X#Heading]]` and (post §5.4) `[[X^block-id]]`
- rename refuses when destination resides in a different coordinate folder than the file's `coordinate:` frontmatter (per §5.6)
- rename in code-fenced blocks does NOT rewrite (already covered for parsing; assert for mutation)

**Benefit**: closes the rename safety invariant for DR-M1-4 with substrate-level coverage.

### 5.10 The vendor Python directory is not declared deprecated in code

**Location**: [`Body/S/S1/hen-compiler/`](Body/S/S1/hen-compiler/)

**Current shape**: 24KB+ of Python scripts (`compile.py`, `query.py`, `flush.py`, `lint.py`) still sit as if they were canonical. The SPECs declare them compatibility/probe material but the directory itself carries no `STATUS.md` or `README.md` declaring "vendor-compat; do not consume from Rust".

**Proposed cleanup**: add `Body/S/S1/hen-compiler/STATUS.md` declaring:
- canonical authority: `Body/S/S1/hen-compiler-core/`
- this directory: compatibility/probe material for Claude memory tooling
- do-not-add: new Python code in canonical S1 pipeline
- migration target: any reusable logic should be ported to `hen-compiler-core` Rust modules

**Benefit**: prevents future contributors from extending the Python side. Aligns with the anti-greenfield discipline: this is **cleanup with a named scope**, not a rebuild.

**Blast radius**: NONE — pure documentation.

---

## 6. Boundary Contracts

### 6.1 What S1 produces (outputs)

- **Vault material on disk** — every `Idea/**.md` and `.canvas` is S1-produced (whether by humans via Obsidian or by Hen-routed agent writes).
- **`ArtifactEvidence`** — typed value for every artefact (S2 promotion, S5 review, M0' inspection).
- **`GraphPromotionIntent`** — pure-data graph-mutation intent consumed by S2 graph-services.
- **`GraphSyncIntent`** — `:Bimba` write or `:BimbaCoordinate` legacy migration intent consumed by S2.
- **`LinkCandidate[]`** — semantic + explicit link suggestions consumed by Canon Studio autocomplete + Anansi research.
- **`RelationInferenceRequest`** — outbound to PI agents (Anima-dispatched).
- **`S1VaultRenameReceipt`** — typed receipt for write/rename operations consumed by Theia surfaces.
- **`CompilePlanResponse`** (dry-run only) — consumed by M5-4 OmniPanel review surfaces.

### 6.2 What S1 consumes (inputs)

- **S0 CLI / gateway dispatch** — `epi vault *` commands route through `Body/S/S0/epi-cli/src/vault/mod.rs` and `Body/S/S0/epi-cli/src/gate/s1_hen.rs` which in turn call `epi_s1_hen_compiler_core`.
- **Smart Connections `.ajson` index** — vault-local Obsidian plugin output at `<vault>/.smart-env/multi/*.ajson`.
- **PI agent process output** — `PiAgentRelationInferenceProvider` spawns `pi --no-tools --no-extensions --no-session --no-context-files --no-prompt-templates --no-themes` for relation inference.
- **S3 envelope channel definitions** — the 12 `ENVELOPE_LEDGER_CHANNELS` correspond to the envelope-field channels defined in S3 transport law.

### 6.3 What S1 does NOT touch

- **Neo4j** — graph mutation is S2; S1 produces intents only. `GraphSyncIntent.touches_live_graph: false` is the invariant.
- **Temporal authority** — Chronos / S3' owns timestamps as truth; `HenTimestamp` is a value type for path-naming, NOT a clock.
- **Constitutional routing** — Pleroma / S4-2p owns capability-matrix; Hen produces evidence, never enforces capability beyond protected-path gating in the gateway.
- **Review evaluation** — Epii / S5' owns review semantics; Hen produces compile-plan artifacts for review, never gates them.
- **Kernel-bridge profile fields** — S1 produces `VaultAnchor` payload; the field on `MathemeHarmonicProfile` is owned by `portal-core` / Tranche 10.x.

---

## 7. Theia Integration Points

### 7.1 Current state

The Theia shell ([`Body/M/epi-theia/`](Body/M/epi-theia/)) consumes S1 surfaces via two mechanisms:

1. **Direct filesystem reads** — via Theia's FS provider. This is invariant; vault material is read directly by Theia for editor/preview surfaces. The `M5-ARCHITECTURE.md:113` line is canonical: "Theia and Obsidian coexist via shared filesystem; **no Obsidian-runtime IPC**".
2. **Kernel-bridge JSON-RPC** — for mutations and semantic queries. Theia extensions call `s1'.vault.*` and `s1'.semantic.*` through the bridge.

### 7.2 Required bridge methods (cycle-3)

For the Tranche 06.4 Canon Studio + Backend Studio extensions to function:

| Bridge method | Source substrate | Tranche |
|---|---|---|
| `s1'.vault.read_file` | LANDED at `gate/s1_hen.rs:89` | — |
| `s1'.vault.write_file` | LANDED at `gate/s1_hen.rs:106` | — |
| `s1'.vault.rename_file` | LANDED at `gate/s1_hen.rs:138` | — |
| `s1'.vault.move_file` | LANDED at `gate/s1_hen.rs:138` | — |
| `s1'.semantic.suggest_links` | LANDED at `gate/s1_hen.rs:224` | — |
| `s1'.vault.update_frontmatter` | **NEW** — needs `hen-compiler-core::frontmatter::update_frontmatter(yaml: &mut Value, mutations)` + gateway wrap | Tranche 06.4 (Canon Studio frontmatter editor) |
| `s1'.vault.append_block` | **NEW** | Tranche 06.4 (Logos Atelier write-back proposal previews) |
| `s1'.semantic.neighbors_of(notePath)` | **NEW** — wrap `SmartEnvIndex::source` lookup | Tranche 06.4 |
| `s1'.semantic.by_block(blockId)` | **NEW** | Tranche 06.4 |
| `s1'.entity.capture` | **NEW** — route dangling wikilinks and root-created notes into Empty entity-candidate residency | CCT-14 / DR-S1-4 |
| `s1'.entity.classify` | **NEW** — coordinate/CT/alias/link classification using frontmatter, wikilinks, Smart Env evidence, and property intelligence | CCT-14 / DR-S1-4 |
| `s1'.entity.promote_to_type` | **NEW** — promote reviewed candidates into coordinate-native World/Types incubation | CCT-14 / DR-S1-4 |
| `s1'.type.classify_c_layer` | **NEW** — resolve C0-C5 semantic type authority before World/Types placement | CCT-15 |
| `s1'.world.graduate` | **NEW** — graduate stable incubations to flat World and leave type-local MOC pointer | CCT-14 / DR-S1-4 |
| `s1'.compile.plan` (dry-run dispatch) | LANDED at library; **needs gateway dispatch in `gate/s1_hen.rs`** | Tranche 06.4 (Backend Studio compile-plan preview) |
| `s1'.compile.validate_artifact` (dispatch around `validate_compile_artifact_frontmatter`) | LANDED at library; **needs gateway dispatch** | Tranche 06.4 |

### 7.3 Required contract types (cycle-3)

The `epi-s3-gateway-contract` crate already defines `S1VaultPathPrivacyClass`, `S1VaultRenameReceipt`, `S1VaultRenameRefusal`, `S1SemanticResponse`, `S1SemanticCandidate*`, `S1SemanticStaleness`. Cycle-3 needs to add:

- `S1VaultFrontmatterUpdateRequest` / `Receipt` — for Canon Studio
- `S1CompilePlanRequest` / `Receipt` — JSON-friendly mirror of the library types
- `S1SemanticNeighborsRequest` / `Response` — typed neighbours-of query
- `S1EntityCaptureRequest` / `Receipt` — captures dangling/root-created notes into Empty residency
- `S1EntityClassificationRequest` / `Response` — candidate coordinate/CT/alias/link classification
- `S1EntityPromotionRequest` / `Receipt` — reviewed Empty candidate -> World/Types incubation
- `S1TypeClassifyCLayerRequest` / `Response` — C0-C5 semantic authority and C-layer path classification
- `S1WorldGraduationRequest` / `Receipt` — World/Types incubation -> flat World crystallisation
- `S1VaultRenameRefusalReason::CoordinateResidencyMismatch` — per §5.6

### 7.4 The Canon Studio integration sketch

Per [`M5-ARCHITECTURE.md:344-345`](Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md), Canon Studio is a Monaco-editor extension with:
- **QL/bimba coordinate decoration** — highlight `M{n}'`, `S{n}'`, `(0/1)`-style context-frame tokens inline. Static parser; consumes coordinate definitions from S2 coordinate-semantics registry (cross-Wave dep).
- **Smart Connections autocomplete** — wikilink autocomplete merging explicit outlinks with semantic neighbours sorted by BGE-micro-v2 cosine. **Consumes `s1'.semantic.suggest_links` over `<vault>/.smart-env/multi/*.ajson`.**
- **Hen-routed writes** — `s1'.vault.write_file` / `update_frontmatter` / `rename_file`. The editor's "Save" button dispatches the JSON-RPC call; Theia's FS-provider write surface is bypassed for the canonical write path.

### 7.5 The OmniPanel review-tab integration

Per Tranche 15.2 + [`M5-ARCHITECTURE.md:449-454`](Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md), the OmniPanel Review tab surfaces `humanRequired` review items. S1' promotion-intent + compile-plan dry-runs are review-gated:

- A compile-plan dispatched with `mutation_mode: "apply"` and `executor_kind: PiAgent` enters the Review tab as an `improvement_request`.
- A `GraphPromotionIntent` with a non-trivial `compatibility_source_coordinate` (legacy migration) enters as a `validation_gate`.
- User final-validation closes the review; only then does the OmniPanel approve the actual mutation (which is currently always BLOCKED at [`lib.rs:329-339`](Body/S/S1/hen-compiler-core/src/lib.rs) until non-dry-run lands).

---

## 8. Anti-Greenfield Audit

| Item | Status | Action |
|---|---|---|
| `Body/S/S1/hen-compiler-core/` (2,702 LOC + 1,258 test LOC) | LANDED — canonical S1' Rust contract | **Consume as-is**; refactor via §5 cleanup (no rebuild) |
| `Body/S/S1/hen-compiler/` Python vendor | LANDED — compatibility/probe substrate | **Audit & document** as compat (§5.10); no new Python code |
| `Body/S/S0/epi-cli/src/gate/s1_hen.rs` (492 LOC) | LANDED — gateway dispatch | **Refactor** (§5.3 unification with hen-compiler-core); preserve method signatures |
| `Body/S/S0/epi-cli/src/vault/{mod, paths, templates, frontmatter}.rs` | LANDED — CLI surface | **Extend** with missing `update_frontmatter` (§4.4); thin S0 membrane preserved |
| `s1'.vault.update_frontmatter` | NOT LANDED | **First-build** — load-bearing gap for Canon Studio; named cycle-3 closure |
| `s1'.vault.append_block` | NOT LANDED | **First-build** — load-bearing gap for Logos Atelier; named cycle-3 closure |
| `s1'.semantic.{neighbors_of, by_block, search}` | NOT LANDED | **First-build** — substrate is present in Smart Env index; surfacing needed |
| `s1'.entity.{capture,classify,promote_to_type}` + `s1'.world.graduate` | NOT LANDED | **First-build with named scope** — unifies old Empty node-resolution canon with Cycle 3 Smart Env suggestions and World/Types crystallisation |
| `s1'.type.classify_c_layer` | NOT LANDED | **First-build with named scope** — routes semantic categories through C0-C5 instead of top-level World/Types roots |
| `s1'.compile.{plan, validate_artifact}` gateway dispatch | NOT LANDED at gateway (library exists) | **Extend** the gateway — concrete named integration blocker |
| `s1'.ledger.{append, query, inject}` gateway dispatch | NOT LANDED | **First-build with named scope** — ledger-channel registry exists; need write entry-point. BLOCKED by non-dry-run review/promotion law |
| DR-M1-4 Hen carrier contract markdown | NOT LANDED | **First-build named integration blocker** — `Body/S/S4/ta-onta/hen/CONTRACT.md` per [`13-decision-register.md:347`](Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md) |
| Coordinate-residency-on-move check | NOT LANDED — landed-gap | **Extend** `rename_or_move_file` per §5.6; named cycle-3 closure |
| `WikilinkTarget` block-anchor variant | NOT LANDED — landed-gap | **Extend** enum per §5.4 |
| Canon Studio Theia extension | NOT LANDED — Tranche 06.4 | **First-build M' product surface** — extension layer, not S1 substrate |
| Backend Studio Theia extension | NOT LANDED — Tranche 06.4 | **First-build M' product surface** |

**Net-new (genuine M' product surfaces)**: Canon Studio + Backend Studio extensions (M' surface).
**Net-new (named integration blockers)**: DR-M1-4 contract markdown; `update_frontmatter` / `append_block` / `compile` gateway dispatch.
**Extend / refactor (NOT rebuild)**: all of §5.

---

## 9. Test / Acceptance Criteria

### 9.1 Existing test surface (must keep green)

```bash
# S1 Rust crate (1,258 LOC of tests, 10 files):
cargo test -p epi-s1-hen-compiler-core

# Tests covered:
#   tests/artifact_evidence.rs            (160 LOC)
#   tests/compile_plan.rs                 (190 LOC)
#   tests/frontmatter.rs                  (203 LOC)
#   tests/graph_promotion_intent.rs       (159 LOC)
#   tests/graph_sync_intent.rs            (49 LOC)
#   tests/property_intelligence_contract.rs (81 LOC)
#   tests/relation_inference_contract.rs  (143 LOC)
#   tests/relation_inference_live.rs      (76 LOC; PI-bound, may skip in CI)
#   tests/smart_env_link_candidates.rs    (84 LOC)
#   tests/wikilink_parser.rs              (113 LOC)

# S0 mirror tests:
cargo test -p epi-cli vault_frontmatter
cargo test -p epi-cli gate_s1_vault_surface
cargo test -p epi-cli vault_hen_boundary_audit
```

### 9.2 New tests required by §5 refactors

```bash
# After §5.3 + §5.4 + §5.6:
cargo test -p epi-s1-hen-compiler-core rename_reconciliation::*
#   - rename_preserves_alias_and_heading_anchors
#   - rename_handles_block_anchor_carat_form          (post §5.4)
#   - rename_refuses_on_coordinate_residency_mismatch (post §5.6)
#   - rename_skips_wikilinks_inside_code_fence
```

### 9.3 Cycle-3 closure acceptance

The S1 cycle-3 closure is complete when:

1. `cargo test -p epi-s1-hen-compiler-core` passes with the refactored module layout (§5.1, §5.2).
2. `grep -rn "s1'.vault.update_frontmatter\|s1'.vault.append_block" Body/S/S0/epi-cli/src/gate/` returns non-empty (gateway methods landed).
3. `test -f Body/S/S4/ta-onta/hen/CONTRACT.md` (DR-M1-4 carrier contract markdown landed).
4. `grep -rn "CoordinateResidencyMismatch" Body/S/S1/hen-compiler-core/src/` returns non-empty (residency invariant landed per §5.6).
5. `grep -rn "WikilinkTarget::PathBlock\|WikilinkTarget::PathHeadingBlock" Body/S/S1/hen-compiler-core/src/` returns non-empty (§5.4).
6. `test -f Body/S/S1/hen-compiler/STATUS.md` (vendor declared compat per §5.10).
7. `grep -rn "s1'.semantic.suggest_links" Body/M/epi-theia/extensions/canon-studio/` returns non-empty (Tranche 06.4 Canon Studio integration validated, when extension lands).

---

## 10. Cross-Cutting Findings — Cycle-3 Ledger

### 10.1 Tranches to enrich

- **Tranche 06.4** (canon-studio + backend-studio extensions): add the new gateway methods this S1 architecture surfaces (`update_frontmatter`, `append_block`, `semantic.neighbors_of`, `compile.plan`). Reference §7.2 above.
- **Tranche 02.X** (Hen carrier contract landing, per DR-M1-4 PROPOSED): the carrier markdown at `Body/S/S4/ta-onta/hen/CONTRACT.md` should reference this architecture document for the three invariants (Hen-routed write, wikilink integrity, coordinate-residency).
- **Tranche 15.x** (UI foundations — provenance-visible, coordinate-as-nav): the substrate-citation gutters in Canon Studio + Backend Studio depend on `s1'.compile.validate_artifact` to surface compiled-artifact frontmatter (specifically the `provenance_refs` chain validated at [`lib.rs:641-670`](Body/S/S1/hen-compiler-core/src/lib.rs)).

### 10.2 New tranches recommended

- **Tranche 02.5 — S1 modularisation pass.** Execute §5.1 + §5.2 + §5.3 + §5.4 + §5.5 + §5.7 + §5.8 + §5.10. Single owner, single CI run. Scope is exclusively `hen-compiler-core` internal refactor + S0 gateway alignment; no API breakage.
- **Tranche 02.6 — coordinate-residency-on-move invariant.** Execute §5.6 + matching tests + DR-M1-4 carrier contract markdown. Single deliverable: the `RenameRefusal::CoordinateResidencyMismatch` path lands, exercised by integration tests.

### 10.3 Cycle-3 decisions surfaced

- **DR-S1-1 (NEW, PROPOSED)**: split `lib.rs` per §5.1. Trivial decision; recommend ratify without debate.
- **DR-S1-2 (NEW, PROPOSED)**: unify rename-reconciliation in `hen-compiler-core` per §5.3. Surface decision for review: does the integrity authority become the mutation authority? Recommend yes.
- **DR-S1-3 (NEW, PROPOSED)**: enforce coordinate-residency-on-move per §5.6. Surface decision: when residency disagrees with frontmatter `coordinate:`, default to **refuse** (auto-update only with explicit capability). Recommend refuse-by-default; auto-update is a future Canon Studio affordance.

### 10.4 New orphans surfaced

- The Python vendor (`Body/S/S1/hen-compiler/`) is effectively orphan to the canonical Rust pipeline; §5.10 closes this by documentation rather than deletion (it remains useful for Claude-memory-compiler local probing).
- The deferred gateway methods (§4.4) are orphans in the sense that the SPECs declare them but the substrate is partial. They are not vault-orphan files; they are surface-orphan declarations.

### 10.5 Profile-bus / kernel-bridge gaps surfaced

- **`InstanceHandle.vault_anchor: Option<VaultAnchor>`** on `MathemeHarmonicProfile` — declared in [`M1-ARCHITECTURE.md:388`](Idea/Bimba/Seeds/M/M1'/M1-ARCHITECTURE.md), bound to DR-M1-4, not landed in `portal-core`. The S1 side is ready to *produce* the `VaultAnchor` on successful crystallisation write; the kernel-bridge field is the missing seam.
- No other S1-driven profile-bus fields are needed. S1 is a side-effect (writes) and a synchronous-query (semantic, frontmatter) surface; the profile bus is for clock/coordinate state, not vault state.

### 10.6 Theia integration points needed

Per §7.2: five NEW bridge methods (`update_frontmatter`, `append_block`, `semantic.neighbors_of`, `semantic.by_block`, `compile.plan`) and one ENRICHED contract enum (`S1VaultRenameRefusalReason::CoordinateResidencyMismatch`). These are concrete deliverables for Tranche 06.4.

---

## 11. Summary

S1 is the **most substrate-complete** layer of the cycle-3 S-stack. The Rust `hen-compiler-core` crate is 90%+ of the canonical surface; the gaps are surfacing (gateway dispatch for `update_frontmatter` / `append_block` / `compile`), invariant tightening (coordinate-residency on move, block-anchor wikilink), and modularisation (the 881-LOC `lib.rs` and 614-LOC `smart_env.rs` should each split into 5-7 modules).

The **load-bearing cross-stack contract** is DR-M1-4: Hen owns vault-instance writes for M1-1' Instance Manager. The substrate is 80% present; the missing 20% is the coordinate-residency-on-move check (§5.6) and the carrier contract markdown.

The **load-bearing M' integration** is Canon Studio (Tranche 06.4): a Theia extension consuming `s1'.vault.*` and `s1'.semantic.*` through the kernel bridge. Substrate is landed; the extension is DOC-AHEAD.

The **anti-greenfield discipline** is clear: every cycle-3 action is named-scope refactor (the eight §5 cleanups) or named-integration first-build (the four gateway dispatch methods + DR-M1-4 contract). No part of S1 is being rebuilt. The Python vendor is being declared compatibility, not deleted.

— S1-ARCHITECTURE.md cycle-3 close.
