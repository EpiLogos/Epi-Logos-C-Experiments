# Epi-Logos UI Design Tokens

This is the canonical Epi-Logos design token bundle for the M' Theia shell. The JSON file uses the W3C Design Tokens Community Group draft object shape: every token carries `$value`, `$type`, and `$description`.

## Namespace

- `epilogos.colour.*`: family, element, flow, psyche-facet, signal, readiness, privacy, chroma-depth, capacity, bridge, surface, layout, insight, skeleton, signature.
- `epilogos.typography.*`: mono.coordinate, mono.label, prose.body, prose.canon, prose.legal, ui.micro, ui.chip, ui.tooltip, ui.status-bar.
- `epilogos.motion.*`: tick, toggle, reveal, slerp, bloom, settle, lemniscate.
- `epilogos.spacing.*`: tight, compact, standard, generous, section.
- `epilogos.depth.*`: surface, overlay, tooltip, modal, notification.

Canonical examples include `epilogos.colour.family.m.3`, `epilogos.colour.signature.cool`, `epilogos.typography.mono.coordinate`, `epilogos.motion.lemniscate`, `epilogos.spacing.standard`, and `epilogos.depth.modal`.

## Consumption

Consume-not-fork is binding: extension code imports shared design primitives and design tokens instead of re-authoring primitive components, hex colours, spacing dimensions, or motion durations. The lint rule at `scripts/eslint-rules/consume-not-fork-design-tokens.mjs` rejects design-primitive consumers that locally redefine canonical primitives or hardcode token-equivalent values.

## Derivation

Token descriptions cite their derivation surface inline. The main sources are `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture`, `Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md §§5-6`, `Idea/Bimba/Seeds/M/M3'/alpha_rasa_bridge_ql.md alpha/16:9/4pi proof overlay`, and `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11`.
