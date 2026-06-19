# AGENTS.md — contracts

## Purpose
Implementation-control contract artifacts for the M' Theia extensions workspace — extension/composition preflight contracts plus the canonical UI design-token, colour-token, motion-token, typography, and composition-rule sources. No runtime package; pure contract docs consumed by sibling extensions.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] (per-coordinate: [[M1'-SPEC]], [[M2'-SPEC]], [[M3'-SPEC]], [[M4'-SPEC]], [[M5'-SPEC]]; UI lineage: [[THEIA-UI-PATTERNS-ARCHITECTURE]]).

## Ownership
- `07-t0-extension-contract-preflight.{json,md}` — Track 07 six-M-extension boundary contract against the shared `KernelBridgeAPI`; readiness taxonomy + forbidden-import rule + command/route convention.
- `08-t0-composition-contract-preflight.{json,md}` — Track 08 integrated-plugin composition contract ([[plugin-integrated-1-2-3]] + [[plugin-integrated-4-5-0]]); inherits 07.T0's bridge/taxonomy/imports.
- `07-t2-track08-contribution-contracts.md` — Track 07→08 contribution boundary (`TRACK_08_CONTRIBUTION` shape, route chain, observability event rule).
- `ui-design-tokens.{ts,json,md}` — canonical W3C-shape design-token bundle (`epilogos.*` namespace) consumed via consume-not-fork lint.
- `ui-colour-tokens.{json,ts,md}` — canonical coordinate-derived chromatic token bundle (`epilogos.colour.*` namespace) with W3C-shape JSON, typed exports, and per-token derivation citations.
- `ui-theme-mapping.ts` — per-token light/dark/Nara theme resolver for `epilogos.colour.*`, consuming the [[OmniPanel]] theme-domain remap convention.
- `ui-motion-tokens.{json,ts,md}` — canonical profile-tick-derived motion grammar (`epilogos.motion.*` namespace) with W3C-shape JSON, typed exports, reduced-motion durations, and single profile-tick subscription law.
- `ui-accessibility.{ts,md}` — binding accessibility contract for focus rings, reduced motion, screen-reader equivalents, pause/scrub keybindings, and WCAG contrast harness helpers.
- `ui-typography.{ts,md}` — named typography token → Theia CSS-variable contract.
- `ui-iconography.{ts,md}` + `icons/` — custom [[M']] icon set, Theia Codicons fallback mapping, activity-bar mode icon bindings, family-letter glyph contract.
- `ui-foundation-principles.md`, `ui-composition-rules.md` — normative M' surface principles + composition-over-juxtaposition rules for integrated plugins.
- `ui-visual-regression-catalog.md` — visual-regression baseline catalog (DR-WC-DL-5; owned by `@pratibimba/acceptance-harness`).
- `readiness-state-grammar.{json,md}` — canonical per-readiness-state UX grammar; keeps the nine-state readiness taxonomy authoritative while layering render-time flavours.
- `onboarding-completion-ledger.json` — onboarding/cold-start completion ledger.
- Does NOT own: extension runtime/UI internals (each owning M' extension), bridge runtime ([[kernel-bridge]] over [[S3-SPEC]] gate), or the validators/scripts that enforce these contracts (sibling `../scripts`, `../test`).

## Local Contracts
- The preflight contract pairs above (JSON = machine-readable authority, MD = human-readable narrative).
- `readiness-state-grammar.{json,md}` — machine/human authority for readiness-state UX responses and render-time flavours.
- The UI token/colour-token/theme-mapping/motion-token/accessibility/typography/iconography/composition/foundation rule docs above (binding `epilogos.*` surface).
- Owning specs: [[M'-SYSTEM-SPEC]] and the per-coordinate M' specs; UI lineage [[THEIA-UI-PATTERNS-ARCHITECTURE]].

## Work Guidance
- Run `gitnexus_impact` before editing any exported token/contract symbol; honour the d=1 WILL-BREAK rule.
- [[wikilink]] all coordinate/spec/agent/tool references in any authored artifact.
- Edit `ui-design-tokens.ts` / `ui-typography.ts` / `ui-motion-tokens.ts` / `ui-accessibility.ts` / `ui-iconography.ts` as source surfaces where applicable; keep `.json`/`.md` siblings and `icons/` assets consistent — extensions consume-not-fork these (no local hex/spacing/duration/motion/a11y/icon redefinition).
- Blocked/degraded readiness must name an owner-track command that produces the payload; no handwritten happy-path JSON as readiness evidence.

## Verification
- `node Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs`
- `node --test Body/M/epi-theia/extensions/test/validate-extension-contract-preflight.test.mjs`
- `node --test Body/M/epi-theia/extensions/test/validate-composition-contract-preflight.test.mjs`
- Full suite: `pnpm test:contracts` from `Body/M/epi-theia`.

## Child DOX Index
- (leaf)
