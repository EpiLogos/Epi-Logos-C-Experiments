# AGENTS.md — S4-1p-hen

## Purpose
Hen — "Content Coordination & Vault" ta-onta carrier (S4-1', CT Semantic Phase-Type): the content authority that owns vault topology, the CT template system, frontmatter schema, wikilink breadcrumbs, and the vault-to-graph sync bridge (per `CONTRACT.md`); actualises the S1 (Obsidian/vault) content layer.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S1-SPEC]] (see also [[S-SYSTEM-INDEX]]).

## Ownership
- `CONTRACT.md` — binding responsibility/nesting/vault-intelligence contract for Hen
- `extension.ts` — pi extension entry; registers `hen_template_invoke` and the temporal-delta-aware `hen_hybrid_retrieve`
- `modules/hybrid-retrieve.ts` — exact-path content delta since a Khora response-token boundary; reads only, never writes
- `modules/template-vak.ts` — VAK-address template rendering implementation
- `modules/score-store.ts` — orchestration **score** persistence (50.T50.07). A score is the artifact a repeatable orchestration script becomes: originated in `(00/00)` dialogue, persisted so it can be re-run without re-originating, with runs accumulating against it for later ELO refinement (50.T50.12). It lives here because a stored artifact with a content type is Hen's coordinate — and it deliberately treats the program as OPAQUE JSON, so this module imports nothing from [[Anima]] and knows nothing of VAK addresses or dispatch; S4-4' → S4-1' is the only direction the dependency runs. Scores land in `.epi/scores/` (the runtime state root beside `.epi/gate`), never the vault: a score is runtime machinery, not canon. Faithfulness is enforced rather than assumed — every document carries a SHA-256 over its canonical form (keys sorted, array order preserved) and `loadScore` REFUSES a document whose hash no longer matches, because a drifted score would not reproduce the run it claims to be. Run history is append-only (`<id>.runs.jsonl`); ids are validated so they can never become path segments.
- `S1'/frontmatter_schema.ts` — canonical `{family}_{n}_{semantic}` frontmatter schema enforcement
- `S1'/templates/` — CT template archetypes (daily-note, now, prompt, task-spec, thought)
- `S1/tools.json` — S1-layer tool manifest
- `spine-contribution.ts` — Hen's S1/S1' spine injection slot + ledger contribution
- `M/README.md` — cross-cutting M-surface (content-typing metadata, documentation-first)
- `tests/template_vak.test.ts` — VAK template render tests
- `tests/score_store.test.ts` — score persistence: canonical hashing, save/load round trip, integrity refusal on tamper, id containment, append-only run history
Does NOT own: session identity (Khora), temporal scheduling/archival (Chronos), agent dispatch (Anima), thought classification/crystallisation (Aletheia). Per `CONTRACT.md`, canonical Form/Type/Seed authority lives in `Idea/Bimba/{World,Seeds,World/Types}`, not here.

## Local Contracts
- `CONTRACT.md` (local binding interface)
- Owning spec: [[S1-SPEC]] / [[S1-ARCHITECTURE]]
- Parent carrier contract: `Body/S/S4/ta-onta` (see [[CLAUDE.md]] ta-onta ↔ S-layer map)

## Work Guidance
- Run `gitnexus_impact({target, direction:"upstream"})` before editing any symbol here.
- All entity refs in artifacts use `[[wikilink]]` syntax; vault writes use coordinate-prefixed `c_n_*` frontmatter only (validated by `S1'/frontmatter_schema.ts`).
- Route governed canonical vault writes through `s1'.vault.*` (per `CONTRACT.md`); `epi vault` direct writes are bootstrap/operator mirrors, not the agentic path.

## Verification
Vault frontmatter/residency/wikilink validation via the `bimba-vault-validate` skill before committing any vault write; run the local `tests/template_vak.test.ts` for template-render changes.
- `node --test tests/score_store.test.ts` (50.T50.07) for the score store. Its Anima-side counterpart — origination polarity, program validation, deterministic replay — is `S4-4p-anima/tests/score_lifecycle.test.ts`, with the LIVE end-to-end at `S4-4p-anima/tests/score-lifecycle-live.mjs`.

## Child DOX Index
- (leaf)
