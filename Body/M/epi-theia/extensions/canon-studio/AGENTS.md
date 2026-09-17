# AGENTS.md — canon-studio

## Purpose
Theia extension `@pratibimba/canon-studio`: "Monaco markdown editing with QL/Bimba decorations, Smart Connections autocomplete via s1'.semantic.*, and Hen vault writes via s1'.vault.*." (per `package.json` description).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S1-SPEC]] (the S1 substrate this extension routes into via `s1'.semantic.*` / `s1'.vault.*`). Theia-host context: [[M'-SYSTEM-SPEC]].

## Ownership
- `package.json` — extension manifest; name `@pratibimba/canon-studio`, frontend entry `lib/browser/frontend-module`.
- `src/common/canon-surface.ts` — shared surface: widget/command IDs, the four S1' gateway method constants (`s1'.semantic.autocomplete`, `s1'.semantic.context`, `s1'.vault.readMarkdown`, `s1'.vault.writeMarkdown`), `CanonDecoration` types, and request builders/scanner.
- `src/common/index.ts` — public re-export barrel (`./canon-surface`).
- `src/browser/frontend-module.ts` — inversify bindings, view + command contributions.
- `src/browser/canon-studio-widget.tsx` — Monaco markdown editor widget.
- `src/browser/canon-decoration-service.ts` — wraps `scanCanonDecorations` for QL/Bimba/wikilink decorations.
- `style/index.css` — decoration styling.
- `tests/canon-contract.test.mjs` — contract tests over the built `lib/common`.
- Does NOT own the semantic/vault backends: those are S1' (Smart Connections, Hen) reached over the gateway; this extension is a frontend client only.

## Local Contracts
- Code Coordinate surface: `src/common/canon-surface.ts` (the S1' method constants + `CanonDecoration` contract; mirrored by `tests/canon-contract.test.mjs`).
- Owning spec: [[S1-SPEC]] / [[S1-ARCHITECTURE]]; Theia-host spec: [[M'-SYSTEM-SPEC]].
- No local CONTRACT.md (none yet — see parent + Canon).

## Work Guidance
- Run `gitnexus_impact` on any exported symbol in `canon-surface.ts` before editing — the test suite and frontend module both consume it.
- [[wikilink]] all entity references in any markdown/artifacts you author.
- Vault writes go through `s1'.vault.writeMarkdown` (Hen authority) with coordinate-prefixed `c_n_*` frontmatter; never write `Idea/` directly.

## Verification
`pnpm --dir Body/M/epi-theia/extensions/canon-studio test` (builds via `tsc -b`, then `node --test tests/canon-contract.test.mjs`). Or repo-wide contract suite: `pnpm --dir Body/M/epi-theia test:contracts`.

## Child DOX Index
- (leaf)
