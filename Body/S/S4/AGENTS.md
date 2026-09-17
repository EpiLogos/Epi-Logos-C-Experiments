# AGENTS.md — S4

## Purpose
The S4 Agent Runtime layer: the repo-native PI/agent surface (`pi-agent`), the ta-onta carrier extension tree (S4-0'..S4-5'), and the deliverable plugin set (`plugins`). No crate/package manifest sits at this level — it is a TypeScript + config runtime tree composed via spine contributions.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S4-SPEC]]

## Ownership
- `pi-agent/` — repo-native PI surface ("the repo-native PI surface for Epi-Logos"); `composite-entry.ts`, `extensions/` shims, `prompts/`, `agents/` topology, `skills/`, `damage-control-rules.yaml`. Control plane is the `epi agent ...` CLI.
- `ta-onta/` — canonical S4' carrier source home; six carrier classes via symlinks (`khora`->S4-0p, `hen`->S4-1p, `pleroma`->S4-2p, `chronos`->S4-3p, `anima`->S4-4p, `aletheia`->S4-5p), the `S4-x` custom ML skill carrier, `composite-entry.ts`, `spine/` (compositor + types), `shared/` (VAK address + entitlement), `plugin-runtime-bridge.ts`.
- `plugins/` — deliverable plugin set: `pleroma/` (capability-matrix, hooks, skills, evals) + `registry.jsonl` (claude-mem, pleroma).
- Does NOT own coordinate semantics or agent constitution law beyond runtime wiring: per-carrier domain law lives in each carrier's `Sx-Yp-*/CONTRACT.md` (e.g. `ta-onta/S4-2p-pleroma/CONTRACT.md`) and the owning [[S4-SPEC]], not here.

## Local Contracts
- Carrier contracts: each `ta-onta/S4-Np-<carrier>/CONTRACT.md` (e.g. `ta-onta/S4-2p-pleroma/CONTRACT.md`).
- Plugin manifest: `plugins/pleroma/.claude-plugin/plugin.json` (`description` = executive S4' layer for ta-onta VAK orchestration); `plugins/registry.jsonl`.
- Owning specs: [[S4-SPEC]], [[S4-ARCHITECTURE]]; stack index [[S-SYSTEM-INDEX]].
- No CONTRACT.md exists at this S4 root level — see per-carrier + children + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.
- Treat `pi-agent/` as production runtime config (per its README): review changes here like CLI code. Edit the Body source tree, never the managed `~/.epi/agents/...` copies.

## Verification
- ta-onta TypeScript contract suites: `node --test Body/S/S4/ta-onta/shared/*.test.ts` (entitlement + VAK address tests).
- Pleroma plugin tests: `Body/S/S4/plugins/pleroma/tests/` (e.g. `test_capability_matrix.py`).
- Repo-wide Rust harness `make rust-test` does not cover this dir directly; no crate manifest here.

## Child DOX Index
- `ta-onta/AGENTS.md` — canonical S4' carrier source: six carriers (khora/hen/pleroma/chronos/anima/aletheia) composed via spine contributions.
- `plugins/AGENTS.md` — deliverable plugin set (`pleroma` local plugin + `registry.jsonl`).
- `pi-agent/AGENTS.md` — repo-native PI surface; composite entry, extension shims, prompts, agent topology; driven by `epi agent` CLI.
