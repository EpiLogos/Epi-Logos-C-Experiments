# ADR-05-010 — Hen vault-bridge architecture: Theia FS read + Hen-gateway write + Hen semantic-neighbours

**Status:** Decided 2026-06-01 (evening)
**Decision register:** [IOD-18](../../../../Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md#IOD-18) (Smart Connections via Hen `smart_env.rs`), [IOD-19](../../../../Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md#IOD-19) (Hen as vault-write gatekeeper)
**Affected tracks:** 05 (this track), 03 (gateway surface), 07 (M-extensions that consume vault data), 09 (agentic mediation)
**Replaces:** [ADR-05-008](./adr-05-008-obsidian-md-vsc.md) (`obsidian-md-vsc` — SUPERSEDED)
**Gated on:** Track 03 T6.5 (gateway `s1'.vault.*` + `s1'.semantic.*` methods)

## Context

ADR-05-008 originally proposed embedding the `willasm.obsidian-md-vsc` VS Code extension as canonical S1 vault reach. Same-day research surfaced that the extension is **not a vault renderer** — it is a remote-control shim via the `obsidian-advanced-uri` plugin that sends command-palette and settings messages to a running Obsidian desktop instance. It does not:

- Render `[[wikilinks]]`
- Show graph view, render embeds, parse vault structure
- Read `.obsidian/plugins/` (so cannot surface Smart Connections data)
- Operate without a running Obsidian desktop app

The decision was reversed. This ADR records the replacement architecture.

## Decision

S1 vault reach inside Theia decomposes into three orthogonal capabilities, each grounded in mature substrate:

### 1. Vault read — Theia native FS provider

- **Mechanism:** Theia's standard `@theia/filesystem` provider exposes [[/Idea]] (or the user-configured vault root via the `epi-logos.vault.path` preference) directly.
- **Why:** No middleware. Theia already does file-tree, file-read, file-watch idiomatically. The gateway still owns the *contract definition* for what counts as a vault read, but ordinary text reads do not need to round-trip through it.
- **Boundary:** Protected paths (`Idea/Pratibimba/Nara/<day>/protected/`) are NOT served by the native FS provider. Theia mounts those only via governed `s1'.vault.read_file` with capability check.

### 2. Vault write — Hen-gateway via `s1'.vault.*` (IOD-19)

- **Mechanism:** A new `vault-bridge` Theia extension (Track 05 T4.5 deliverable) wraps the gateway `s1'.vault.{read_file, write_file, move_file, rename_file, append_block, update_frontmatter, list_dir, watch}` methods (Track 03 T6.5 deliverable). All vault writes from Theia, M-extensions, agents, and integrated plugins go through this single path.
- **Why Hen mediates writes:** Hen's [`Body/S/S1/hen-compiler-core/src/wikilinks.rs`](../../../../Body/S/S1/hen-compiler-core/src/wikilinks.rs) `parse_wikilinks(markdown)` + [`graph_promotion.rs`](../../../../Body/S/S1/hen-compiler-core/src/graph_promotion.rs) write surface protect:
  - **Wikilink integrity** — atomically update all `[[X]]` to `[[Y]]` across the vault when a referenced file is renamed/moved.
  - **Path soundness** — reject writes that would orphan headings or break Bimba-coordinate-anchored cross-references.
  - **Rename safety** — emit a confirmation list of affected files before commit; surface as a typed error for Theia to render.
- **Boundary:** Theia must NEVER write to the vault filesystem directly. The `vault-bridge` extension intercepts direct-FS-write attempts and rejects them with a typed error pointing at the gateway path (T4.5 verification line: "No-direct-FS-write test: simulate a Theia attempt to write to `Idea/...` directly; assert the audit lane catches it as an unsanctioned write").

### 3. Vault semantic-neighbours — Hen `smart_env.rs` via `s1'.semantic.*` (IOD-18)

- **Mechanism:** The same `vault-bridge` extension wraps `s1'.semantic.{suggest_links, neighbors_of, search, by_block}` methods (Track 03 T6.5 deliverable) which call [`Body/S/S1/hen-compiler-core/src/smart_env.rs`](../../../../Body/S/S1/hen-compiler-core/src/smart_env.rs) `suggest_link_candidates(LinkCandidateRequest) → LinkCandidateResponse`.
- **Data source:** `Idea/.smart-env/multi/*.ajson` — local BGE-micro-v2 embeddings authored by the user's running Obsidian + Smart Connections plugin. No HTTP, no Obsidian-IPC, no embedding generation inside Theia (phase 1).
- **Response shape:** typed `LinkCandidate { target_path, wikilink_title, score, kind: ExplicitOutlink|SemanticSource|SemanticBlock, evidence_source_path, evidence_lines, stale }`. The `stale` flag fires when `.smart-env/multi/*.ajson` is older than the underlying note's mtime.
- **Phase-2 capability** (deferred per IOD-18): optional Theia-side re-embedding via `transformers.js` or Ollama writing to the same `.smart-env/multi/*.ajson` format, so the user does not need to keep Obsidian running for fresh embeddings.

### 4. Markdown rendering — Theia native + Canon Studio extension (T4 / T4.5)

- **Mechanism:** Theia's built-in markdown editor handles the canonical markdown surface. A new **Canon Studio** Theia-native extension (Track 05 T4) adds QL/bimba-coordinate decorations + (at T4.5) wikilink autocompletion that merges explicit outlinks (deterministic, via `parse_wikilinks`) with semantic candidates (sorted by cosine score with staleness badges).
- **Boundary:** Canon Studio routes all saves and renames through `VaultBridgeAPI.writeFile` / `moveFile` / `renameFile` — never through Theia's native FS write. Direct-FS-write attempts get the same typed-rejection treatment as in capability 2 above.

## Coexistence with the user's Obsidian app

The user's existing Obsidian desktop app continues to run independently for authoring and Smart Connections embedding generation. Theia and Obsidian coexist via the shared vault filesystem; **no IPC needed**. Canon Studio offers an "open in Obsidian to refresh" deep-link quick action (via the OS handler, not via any VS Code extension) when the semantic index is stale, but the operation is user-driven, not programmatic.

## Substrate-truth confirmation (T0 substrate gate)

| Component | Path | Status |
|---|---|---|
| `wikilinks.rs` parser | [`Body/S/S1/hen-compiler-core/src/wikilinks.rs`](../../../../Body/S/S1/hen-compiler-core/src/wikilinks.rs) | **Landed** — production-grade. Test: [`wikilink_parser.rs`](../../../../Body/S/S1/hen-compiler-core/tests/wikilink_parser.rs). |
| `smart_env.rs` semantic-neighbour reader | [`Body/S/S1/hen-compiler-core/src/smart_env.rs`](../../../../Body/S/S1/hen-compiler-core/src/smart_env.rs) | **Landed** — production-grade. Test: [`smart_env_link_candidates.rs`](../../../../Body/S/S1/hen-compiler-core/tests/smart_env_link_candidates.rs). |
| Smart Connections data | `Idea/.smart-env/multi/*.ajson` | **Landed** — user's existing Obsidian + Smart Connections produces these. |
| `graph_promotion.rs`, `property_intelligence.rs`, `relation_inference.rs`, `artifact_evidence.rs` | `Body/S/S1/hen-compiler-core/src/` | **Landed** — production surfaces that `s1'.vault.*` will compose. |
| `s1'.vault.*` + `s1'.semantic.*` gateway methods | `Body/S/S3/gateway` | **NOT YET LANDED** — Track 03 T6.5 deliverable, active thread's writescope. |
| `vault-bridge` Theia extension | `Idea/Pratibimba/System/extensions/vault-bridge/` | **NOT YET LANDED** — Track 05 T4.5 deliverable, gated on Track 03 T6.5. |
| `smart-connections-sidebar` Theia contribution | `Idea/Pratibimba/System/extensions/smart-connections-sidebar/` | **NOT YET LANDED** — Track 05 T4.5 deliverable. |
| Canon Studio extension | `Idea/Pratibimba/System/extensions/canon-studio/` | **NOT YET LANDED** — Track 05 T4 deliverable (T4.5 extends with autocompletion). |
| `epi-gnostic` Python + Graphiti substrate | [`Body/S/S5/epi-gnostic/`](../../../../Body/S/S5/epi-gnostic/) | **Landed** — production. Treated as RAG-anything substrate that downstream Track 04 / Track 09 surfaces consume; not a Track 05 composition target. |

## Consequences

- **T2** (current tranche): no `obsidian-md-vsc-bundle` registration; no `extensions/obsidian-md-vsc-bundle/` package; remove from `plugins/` build step.
- **T4**: Canon Studio is Theia-native (not a VS Code extension borrow).
- **T4.5** (new sub-tranche): build `vault-bridge` + `smart-connections-sidebar` extensions; extend Canon Studio with wikilink autocompletion; route all saves/renames through `VaultBridgeAPI`. Gated on Track 03 T6.5.
- **T6**: M4 Nara's flow/journal/highlight surfaces consume `VaultBridgeAPI` for writes and `SemanticBridgeAPI` for backlinks/neighbours.
- **T7**: integrated plugin-4-5-0 protected-personal-field surfaces use the governed-protected-capability path on `s1'.vault.*` for protected reads.
- **T9**: acceptance harness verifies the no-direct-FS-write invariant; the privacy audit walks `s1'.vault.*` and `s1'.semantic.*` envelopes for forbidden raw content.

## Privacy & boundary discipline

Same as ADR-05-008's discipline, retargeted at the new substrate:

1. Vault path surfaced as a Theia preference (`epi-logos.vault.path`); refuse to start `vault-bridge` if unset; render one-time setup prompt.
2. Protected paths (`Idea/Pratibimba/Nara/<day>/protected/`) inaccessible via `s1'.vault.*` unless caller carries a governed protected capability per IOD-17 + UFV-01. Same for `s1'.semantic.*` neighbour responses — protected paths excluded from candidate lists by default.
3. Raw vault content never crosses gateway envelopes, S2 graph payloads, S5 evidence DTOs, or observability events unless a governed M-extension capability explicitly opens a vault-derived view.

## Cross-references

- [m5-prime-system-shape-and-tauri-ide-canon.md §0.3a / §0.3b / §1.1](../../../Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md) — canon updates supporting the reversal.
- [M5'-SPEC.md Sixfold IDE Surface table](../../../Bimba/Seeds/M/M5'/M5'-SPEC.md) — updated to reflect Hen-vault-bridge.
- [Track 03 T6.5](../../../../Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/03-s3-gateway-and-spacetimedb.md) — gateway-surface deliverable.
- [Track 05 T4.5](../../../../Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/05-tauri-ide-shell-and-pratibimba-system.md) — Theia-side deliverable.
- [IOD-18](../../../../Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md#IOD-18), [IOD-19](../../../../Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md#IOD-19).
- [ADR-05-008 — SUPERSEDED](./adr-05-008-obsidian-md-vsc.md).
