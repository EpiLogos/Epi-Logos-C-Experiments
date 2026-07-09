# AGENTS.md — S4-2p-pleroma

## Purpose
The Pleroma carrier (S4-2' in ta-onta): the bounded-execution substrate registry — "the execution substrate registry" owning the bounded primitives, PI tool registration surface, execution-mode enforcement, Techne terminal/session tooling, and `techne_vama_summon` registration (per `CONTRACT.md`). TypeScript extension tree (no crate/package manifest); folds onto the S2 entity layer.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S4-2-SPEC]] (carrier law); layer ground [[S4-SPEC]] / [[S2-SPEC]].

## Ownership
- `extension.ts` — PI extension entry; registers bounded primitives, damage-control, tilldone, Techne terminal tools, and `techne_vama_summon` refusal-law metadata.
- `CONTRACT.md` — binding carrier contract: responsibility, 7 bounded primitives, PI hook seams, invariants.
- `spine-contribution.ts` — spine compositor contribution (`coordinate: "S2/S3"`: injection slot, ledger, compiler pass, query).
- `S2/` — primitive + tool source: `pleroma-primitives.ts` (PRIMITIVE_REGISTRY), `terminal-tools.ts` (Techne argv builder + capability matrix), `damage-control.ts`, `tilldone.ts`, `themeMap.ts` (per-extension visual identity), `child-extension-propagation.ts`, `prompt-url-widget.ts`.
- `S2'/skills/` — atomic skill substrate (tmux, cmux, ralph-tui, worktrunk, context7, techne-* relay/spawn/webmcp bridges); `pleroma-skill-proxy/` owns the central skill-store symlink projector for `claude-native`, `codex-native`, and `hermes-acp` launch surfaces.
- `S2'/evals/` — 6 eval suites (atomic-tools, discharge, klein, manifest, ouroboros, topology-routing).
- `tests/` — `terminal_tools.test.ts` (node:test contract test).
- Does NOT own: orchestration skills + constitutional agents (→ Anima), evidence-acquisition + Moirai agents (→ Aletheia), vault content/law (→ Hen). Carrier domain law lives here in `CONTRACT.md` + [[S4-2-SPEC]], not in [[S0-SPEC]]/[[M0'-SPEC]] by convenience.

## Local Contracts
- `CONTRACT.md` (Pleroma carrier contract — binding interface for primitives, hook seams, invariants).
- Code coordinate headers: `S2/terminal-tools.ts` `//` doc-block (gateway authority law); `extension.ts` registration surface.
- Owning specs: [[S4-2-SPEC]]; layer [[S4-SPEC]] / [[S4-ARCHITECTURE]] / [[S2-SPEC]] / [[S2-ARCHITECTURE]]; stack index [[S-SYSTEM-INDEX]].

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.
- Honor `CONTRACT.md` invariants: declare execution mode (bounded/interactive/background); no primitive calls another primitive; prefer bounded `epi_cli` discovery (`epi core knowing`, `epi vault read/search`) over raw filesystem grep.

## Verification
- `node --test "Body/S/S4/ta-onta/S4-2p-pleroma/tests/terminal_tools.test.ts"` (Techne terminal-tools contract test).
- `node --test "Body/S/S4/ta-onta/S4-2p-pleroma/S2'/skills/pleroma-skill-proxy/skill-projector.test.mjs (incl. 46.3 Aeon-projects-like-any-skill case)"` (central skill-store symlink projection and `skill_lookup` parity).

## Child DOX Index
- (leaf)
