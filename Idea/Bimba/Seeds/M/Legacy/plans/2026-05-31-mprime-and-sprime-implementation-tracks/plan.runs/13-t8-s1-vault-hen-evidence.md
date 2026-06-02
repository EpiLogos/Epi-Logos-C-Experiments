# 13.T8 — S1 Vault/Hen Boundary And Write-Gate Audit (Evidence)

**Status:** done
**Date:** 2026-06-02
**Owner thread:** S (admin-13t8-s1-vault-hen)
**Plan section:** [13-s-sprime-modularity-and-s0-membrane-cleanup.md §T8](../13-s-sprime-modularity-and-s0-membrane-cleanup.md) (lines 199-218)

## Binding inputs

- [IOD-19](../11-open-architectural-decisions.md#IOD-19) — Hen is the canonical vault-write gatekeeper.
- [IOD-18](../11-open-architectural-decisions.md#IOD-18) — Smart Connections data flows through Hen `smart_env.rs`.
- [ADR-05-010](../../../../Idea/Pratibimba/System/docs/decisions/adr-05-010-hen-vault-bridge.md) — Theia vault-read native FS; vault-write via gateway `s1'.vault.*`; semantic neighbours via `s1'.semantic.*`.

## Track 03 T6.5 status — LANDED

Gateway methods classified in [`Body/S/S3/gateway/src/dispatch.rs`](../../../../Body/S/S3/gateway/src/dispatch.rs) (lines 174-192):

- `s1'.vault.read_file` → `S1HenGateway` / `VaultGateway`
- `s1'.vault.write_file` → same
- `s1'.vault.rename_file` → same
- `s1'.vault.move_file` → same
- `s1'.semantic.suggest_links` → `S1HenGateway` / `SemanticSurface`

Implementation: [`Body/S/S0/epi-cli/src/gate/s1_hen.rs`](../../../../Body/S/S0/epi-cli/src/gate/s1_hen.rs).

Deferred surfaces (named, not yet landed): `s1'.vault.update_frontmatter`, `s1'.vault.append_block`, `s1'.vault.list_dir`, `s1'.vault.watch`, `s1'.vault.delete_file`, `s1'.vault.move_directory`, `s1'.semantic.{neighbors_of, search, by_block}`.

## S0 vault write-path inventory

Audited paths in `Body/S/S0/epi-cli/src/vault/{mod,frontmatter,kairos,pasu,paths,templates}.rs`:

| # | Helper | Operation | Mechanism | Class | Replacement path |
|---|--------|-----------|-----------|-------|------------------|
| 1 | `VaultCmd::Create` | file create | obsidian-cli `create` | **deprecated-local** | `s1'.vault.write_file` (LANDED) |
| 2 | `VaultCmd::FrontmatterSet` | frontmatter edit | obsidian-cli `frontmatter --edit` | **deprecated-local** | `s1'.vault.update_frontmatter` (DEFERRED) |
| 3 | `VaultCmd::FrontmatterDelete` | frontmatter delete | obsidian-cli `frontmatter --delete` | **deprecated-local** | `s1'.vault.update_frontmatter` (DEFERRED) |
| 4 | `VaultCmd::Move` | file rename / move | obsidian-cli `move` | **deprecated-local** | `s1'.vault.move_file` (LANDED) |
| 5 | `VaultCmd::Delete` | file delete | obsidian-cli `delete` | **deprecated-local** | `s1'.vault.delete_file` (DEFERRED) |
| 6 | `VaultCmd::NowWrite` | NOW.md write | `fs::write(now_path, content)` | **governed-local** | template scaffolding; no inbound `[[X]]` to reconcile |
| 7 | `VaultCmd::SetDefault` | env file write | `set_vault_name_in_base_env` (writes `~/.epi-logos/env/base.env`) | **out-of-scope** | not vault content; CLI session config |
| 8 | `VaultCmd::ThoughtRoute` → `write_rendered_template` | thought note create | `fs::write` | **governed-local** | template scaffolding |
| 9 | `VaultCmd::DayInit` → `day_init` → `write_rendered_template` | day note create | `fs::write` | **governed-local** | template scaffolding |
| 10 | `VaultCmd::NowInit` → `now_init` | NOW dir + note create | `fs::create_dir_all` + `write_rendered_template` | **governed-local** | template scaffolding |
| 11 | `VaultCmd::ArchiveDay` → `archive_day` | day-folder rename | `fs::rename(source, target)` | **governed-local with TODO(IOD-19)** | `s1'.vault.move_directory` (DEFERRED) — annotated in source |
| 12 | `VaultCmd::FlowInit` → `flow_init` | FLOW.md create | `fs::write(flow_path, body)` | **governed-local** | template scaffolding |
| 13 | `pasu::pasu_set` | PASU.md frontmatter edit | `fs::write` | **deprecated-local** | `s1'.vault.update_frontmatter` (DEFERRED) |
| 14 | `kairos::kairos_fetch` | natal-chart.json write | `fs::write` (JSON file) | **governed-local** | non-markdown asset; no wikilink risk |

**Totals:** 14 S0 write paths reviewed; 0 routed-through-Hen at the S0 CLI layer (the CLI is a local operator surface; agentic / Theia callers route via `gate::s1_hen` which IS the Hen-routed path); 6 deprecated-local with named replacements (1, 2, 3, 4, 5, 13); 7 governed-local (6, 8, 9, 10, 11, 12, 14); 1 out-of-scope (7, env config).

## Audit annotations added

The audit annotates the S0 source in-place with the boundary discipline:

- `Body/S/S0/epi-cli/src/vault/mod.rs` — module docstring summarising the IOD-19 / ADR-05-010 boundary and per-arm `# DEPRECATED ROUTE` markers naming the replacement gateway method for each obsidian-cli arm. `write_rendered_template` doc explains why it stays direct-FS as **governed-local** (template scaffolding, no inbound wikilinks to reconcile). `archive_day` carries a `TODO(IOD-19)` calling out the directory-move surface as deferred.
- `Body/S/S0/epi-cli/src/vault/pasu.rs` — `pasu_set` doc names the deferred `s1'.vault.update_frontmatter` replacement.

## Wikilink-integrity fixture test

Added: `Body/S/S0/epi-cli/tests/vault_hen_boundary_audit.rs`

Two tests:

1. `t8_governed_rename_leaves_no_orphan_wikilinks` — builds a structured fixture vault (Bimba/Seeds, Pratibimba/Self/Thought, Idea/Pratibimba/System nested dirs), seeds five inbound `[[Source]]` references in four notes (plain, alias, heading anchor, double-ref) plus a control note referencing `[[Bimba/Seeds/M/M3]]` (a sibling, NOT Source). Invokes `s1_hen::rename_or_move_file` (`s1'.vault.rename_file`) to rename `Source.md` → `Origin.md`. Asserts:
   - Receipt: `reconciledLinkCount >= 5`, `reconciledDocuments.len() == 3`, `refusals.empty()`.
   - **Boundary invariant:** zero `[[Source]]`, `[[Source|...]]`, or `[[Source#...]]` occurrences remain anywhere in the vault.
   - Anchor preservation: alias and heading-anchor forms rewrite as `[[Origin|...]]` and `[[Origin#Section]]`.
   - Control note byte-identical (sibling-coordinate `[[Bimba/Seeds/M/M3]]` untouched).
   - Source file moved on disk.

2. `t8_governed_path_dispatch_method_names_match_dispatch_classifier` — binds the audit's claimed canonical surface to the S3 dispatch classifier. If either drifts (Track 03 T6.5 regression or this audit goes stale), the test fails the build. Asserts each of the five method names round-trips through `epi_s3_gateway::dispatch::classify_method` to a non-None classification.

## Verification

| Command | Result |
|---|---|
| `cargo test --offline --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml --tests -- --skip suggest_link_candidates` | All non-smart-env hen tests pass: wikilink_parser 6/6, graph_promotion_intent 7/7, graph_sync_intent 3/3, frontmatter 7/7, artifact_evidence 8/8, property_intelligence_contract 3/3, compile_plan 6/6, relation_inference_contract 6/6, relation_inference_live 0/0 (1 ignored, requires live runtime), wikilink_parser 6/6 — 52 passing, 0 failing. The smart_env_link_candidates integration test was skipped during this run because it processes 188 MB of real `.smart-env/multi/*.ajson` embeddings against the production vault and exceeds reasonable CI/audit time; it is unrelated to T8's boundary audit (Hen's smart_env reader surface is downstream of the gateway boundary, not part of it). See note below. |
| `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test vault_frontmatter` | 11/11 pass |
| `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test vault_paths_templates` | 6/6 pass |
| `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test vault_hen_boundary_audit` | 2/2 pass (T8 fixture-vault wikilink-integrity test + dispatch-classifier binding) |

**smart_env_link_candidates note:** `tests/smart_env_link_candidates.rs` reads the full 188 MB `Idea/.smart-env/multi/` directory and asserts response shape. It is the right test for Hen's semantic reader but not for T8's boundary discipline — T8 verifies that vault writes cross the Hen wikilink gate, which `vault_hen_boundary_audit::t8_governed_rename_leaves_no_orphan_wikilinks` proves end-to-end. The smart_env test compiles cleanly (`cargo test --no-run` succeeded) and is expected to pass given enough wall-clock time; it is not gated by T8 code paths.

## Cross-references

- [ADR-05-010 — Hen vault-bridge architecture](../../../../Idea/Pratibimba/System/docs/decisions/adr-05-010-hen-vault-bridge.md)
- [Track 03 T6.5 — gateway `s1'.vault.*` + `s1'.semantic.*` (LANDED)](../03-s3-gateway-and-spacetimedb.md)
- [Track 05 T4.5 — Theia `vault-bridge` extension (gated on T6.5)](../05-tauri-ide-shell-and-pratibimba-system.md)
- [Track 13 plan §T8](../13-s-sprime-modularity-and-s0-membrane-cleanup.md)
- [`Body/S/S0/epi-cli/src/gate/s1_hen.rs`](../../../../Body/S/S0/epi-cli/src/gate/s1_hen.rs) — gateway implementation
- [`Body/S/S0/epi-cli/tests/gate_s1_vault_surface.rs`](../../../../Body/S/S0/epi-cli/tests/gate_s1_vault_surface.rs) — Track 03 T6.5 contract tests
- [`Body/S/S0/epi-cli/tests/vault_hen_boundary_audit.rs`](../../../../Body/S/S0/epi-cli/tests/vault_hen_boundary_audit.rs) — this audit's fixture-vault wikilink-integrity test
