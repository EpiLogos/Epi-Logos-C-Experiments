# AGENTS.md — plugins

## Purpose
The S5 Epii resource/plugin package: a local plugin registry (`registry.jsonl` → `epi-logos`) plus the bundled `epi-logos` plugin — "Paradox-coherent reasoning for Claude. Quaternal Logic question-shaping, Meta-Epistemic Framework diagnosis, topological traversal, and Thought artifact persistence" (`.claude-plugin/plugin.json`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S5-SPEC]] / [[S5-ARCHITECTURE]]

## Ownership
- `registry.jsonl` — single-line plugin registry; maps name `epi-logos` (v0.1.0, `source: local`, agents `["epii"]`) to bundle root `Body/S/S5/plugins/epi-logos`.
- `epi-logos/` — the plugin bundle (multi-host: `.claude-plugin/`, `.codex/`, `.pi-agent/` manifests; `skills/`, `commands/`, `agents/`, `resources/`, `lib/`, `hooks/`, `scripts/`; `README.md` is the bundle entry doc). Entry point: `skills/using-epi-logos`.
- Does NOT own coordinate semantics, kernel shapes, or the runtime stores — those live in sibling S5 cores (`epii-agent-core/`, `epi-kbase-core/`, …) and their owning specs; this dir only registers/packages.

## Local Contracts
- Bundle manifests: `epi-logos/.claude-plugin/plugin.json` + `marketplace.json`; `epi-logos/.pi-agent/plugin.json` (Pi activation contract).
- Registry shape: `registry.jsonl` (one JSON object per line).
- Owning specs: [[S5-SPEC]], [[S5-ARCHITECTURE]], [[S-SYSTEM-INDEX]]. No CONTRACT.md here — see parent + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- Bundle scaffold: `bash Body/S/S5/plugins/epi-logos/tests/run-scaffold-checks.sh` (per `epi-logos/README.md`).
- No Rust/Python crate here — inherit parent layer verification for the S5 cores.

## Child DOX Index
- (leaf — `epi-logos/` is a bundled plugin package with no AGENTS.md of its own)
