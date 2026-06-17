# AGENTS.md — plugins

## Purpose
The deliverable plugin set for the S4 Agent Runtime: one local plugin (`pleroma`) plus a registry that enumerates the plugins shipped to the agent harness. No crate/package manifest sits at this level — it is a plugin tree indexed by `registry.jsonl`.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S4-SPEC]]

## Ownership
- `registry.jsonl` — plugin registry (two entries: `claude-mem` vendor plugin at `vendors/claude-mem-v10.5.5/plugin`; `pleroma` local plugin at `Body/S/S4/plugins/pleroma`), each declaring `agents: [main, anima, aletheia]`.
- `pleroma/` — local plugin, "executive S4' layer for ta-onta VAK orchestration, constitutional agents, and Technē substrate" (per `.claude-plugin/plugin.json`); contains `.claude-plugin/plugin.json` (manifest), `capability-matrix.json` (S4/S4' capability membrane), `settings.json` (default agent permissions), `commands/`, `skills/`, `hooks/`, `evals/`, `tests/`.
- Does NOT own carrier domain law: the pleroma plugin is derived from ta-onta specs — source-of-truth carrier law lives in `Body/S/S4/ta-onta/S4-2p-pleroma/CONTRACT.md` and the owning [[S4-SPEC]], not here.

## Local Contracts
- Plugin manifest: `pleroma/.claude-plugin/plugin.json`; plugin index: `registry.jsonl`.
- Capability membrane: `pleroma/capability-matrix.json` (coordinate `S4/S4'`, owner_agent `anima`).
- Source carrier contract (delegated): `Body/S/S4/ta-onta/S4-2p-pleroma/CONTRACT.md`.
- Owning specs: [[S4-SPEC]], [[S4-ARCHITECTURE]]; stack index [[S-SYSTEM-INDEX]].

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.
- The `pleroma` plugin is derived from ta-onta specs (per its manifest) — change the ta-onta source, then re-derive; do not hand-edit derived content as canonical.

## Verification
- Capability matrix tests: `python -m pytest Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py`.

## Child DOX Index
- (leaf)
