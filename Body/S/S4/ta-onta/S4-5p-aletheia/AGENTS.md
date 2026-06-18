# AGENTS.md — S4-5p-aletheia

## Purpose
The Aletheia ta-onta carrier extension (S4-5'): a Theia/PI extension that is the "crystallisation and truth-disclosure layer. It owns Gnosis (the local RAG pipeline... thought extraction and T-bucket routing... the SEED.md evening crystallisation cycle, and the specialist subagents" (CONTRACT.md). Carrier S4-5' actualises S5 world-return.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S4-5'-SPEC]] (actualises [[S5-SPEC]] / [[S5-ARCHITECTURE]])

## Ownership
- `extension.ts` — PI extension entry; registers raw Aletheia tools (gnosis ingest/query/notebook, thought-route, crystallise)
- `CONTRACT.md` — binding extension contract (responsibility, hook seams, registered tools)
- `spine-contribution.ts` — this carrier's spine contribution
- `modules/` — implementation units (anansi-lineage, anansi-elo-index, moirai-rehear, moirai-fair-comparison, janus-doorway, janus-threshold, mercurius-translation, mercurius-elo, agora-staging, zeithoven-autoresearch, sophia-ingest, q-proposal-candidate, thought-vak, gate-trigger, chronos-integration, hen-integration, coordinate-loop)
- `tests/` — `*.test.ts` per module + `z_cycle_smoke.test.ts`
- `S5/tools.json` — S5 primitive tool descriptors; `S5'/` — QL augmentation: agents (anansi, moirai, janus, mercurius, agora, zeithoven, aletheia), skills, `janus-envelope.schema.json`
- `skills/`, `clusters/`, `modules/` — workflow gates, per-subagent clusters
- `M/README.md` — cross-cutting M-surface notes (M5 cycle echo, M2 GraphRAG)
- Does NOT own: agent dispatch routing (Anima [[S4-4'-SPEC]]), vault CRUD (Hen), session identity (Khora), temporal scheduling (Chronos triggers, Aletheia runs). Domain law lives in this carrier + Canon, not in [[S0-SPEC]]/[[M'-SYSTEM-SPEC]] by convenience.

## Local Contracts
- `CONTRACT.md` (Aletheia Contract — Knowledge Crystallisation & Truth-Disclosure)
- Coordinate Header / public surface: `extension.ts` (tool registrations), `S5'/janus-envelope.schema.json`
- Owning spec: [[S4-5'-SPEC]]; layer specs [[S5-SPEC]] / [[S5-ARCHITECTURE]]; subsystem [[M5'-SPEC]]

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol; `gitnexus_detect_changes` before committing.
- [[wikilink]] all coordinate/spec/carrier/agent references in artifacts; use coordinate-prefixed `c_n_*` frontmatter for any vault write.
- Thoughts/T-bucket and frontmatter merging happen Rust-side via `epi vault thought-route --vak-address-json` (see `extension.ts` note); the TS renderer in `modules/thought-vak.ts` is reference-only.

## Verification
- `node --test` over `tests/*.test.ts` (per-module + `z_cycle_smoke.test.ts`); inherit ta-onta extension test harness from parent.

## Child DOX Index
- (leaf)
