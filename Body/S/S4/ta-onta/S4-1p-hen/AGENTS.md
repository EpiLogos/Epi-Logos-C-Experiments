# AGENTS.md — S4-1p-hen

## Purpose
Hen — "Content Coordination & Vault" ta-onta carrier (S4-1', CT Semantic Phase-Type): the content authority that owns vault topology, the CT template system, frontmatter schema, wikilink breadcrumbs, and the vault-to-graph sync bridge (per `CONTRACT.md`); actualises the S1 (Obsidian/vault) content layer.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S1-SPEC]] (see also [[S-SYSTEM-INDEX]]).

## Ownership
- `CONTRACT.md` — binding responsibility/nesting/vault-intelligence contract for Hen
- `extension.ts` — pi extension entry; registers `hen_template_invoke` and the temporal-delta-aware `hen_hybrid_retrieve`
- `modules/hybrid-retrieve.ts` — exact-path content delta since a Khora response-token boundary; reads only, never writes
- `modules/template-vak.ts` — VAK-address template rendering implementation
- `S1'/frontmatter_schema.ts` — canonical `{family}_{n}_{semantic}` frontmatter schema enforcement
- `S1'/templates/` — CT template archetypes (daily-note, now, prompt, task-spec, thought)
- `S1/tools.json` — S1-layer tool manifest
- `spine-contribution.ts` — Hen's S1/S1' spine injection slot + ledger contribution
- `M/README.md` — cross-cutting M-surface (content-typing metadata, documentation-first)
- `tests/template_vak.test.ts` — VAK template render tests
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

## Child DOX Index
- (leaf)
