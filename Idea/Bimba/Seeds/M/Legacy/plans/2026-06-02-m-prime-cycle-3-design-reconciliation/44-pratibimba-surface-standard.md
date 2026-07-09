# Track 44 — Pratibimba Surface Standard

<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


**Status:** 2026-06-17 — VALIDATED design; DR-PSS-1..6 VALIDATED this session (no further gating, per the standing Phase-K posture *"don't hold anything behind DR's or validation gates"*). Lands the app-wide block-render + interaction standard for the M' Theia surface as a native, CTX-typed, day/now-runtime-carried layer over already-built substrate.

**Canonical home:** [`Idea/Bimba/Seeds/M/M5'/m5-prime-pratibimba-surface-standard.md`](../../../M5'/m5-prime-pratibimba-surface-standard.md) — the M5' seed holds the structural-philosophical authority; this track is its cycle 3 execution plan.

**Why this track exists.** Track 15 named the UI *foundation principles* (coordinate-as-navigation, provenance-always-visible, OmniPanel-as-`/`-membrane, no-modals) but not the **grammar** that realises them. Every surface today improvises its rendering and its interaction wiring: the OmniPanel review tab, the ACR dispatch trace, the M4-Nara day surface, the evidence inspector each hand-roll both. The built human-review substrate (`epii-review-core`, the day-scoped Epii inbox, `ReviewItemDeep`/`enforceHumanGate`/`IOD17Parity` in `omnipanel-runtime.ts`) has no presentation grammar that knows where it belongs — the same gap that drove the ACR-vs-OmniPanel confusion (Track 15 §intro). Track 44 lands that grammar: a single block vocabulary, one native renderer, one interaction loop, every block **CTX-typed and CTX-templated** and carried live on the **day/now context runtime**. Drawn as inspiration (not vendored code) from the open-source Builder.io `agent-native`/`skills` work (MIT).

**Anti-rebuild commitment.** Every component below already exists in code or has a clearly defined extension point:

- **Block contract** lands as new types in `Body/M/epi-theia/extensions/m-extension-runtime/` (the shared bridge API) + a mirrored JSON-schema; no new contract package.
- **Renderer** = a new `block-kit` extension under `Body/M/epi-theia/extensions/` (registry + `ReactWidget`); the only new package, and it is pure presentation.
- **Review data** consumed as-is: `Body/S/S5/epii-review-core/src/lib.rs` (review store), `Body/M/epi-theia/extensions/omnipanel-shell/src/common/omnipanel-runtime.ts` (`ReviewItemDeep`, `ReviewDecision`, `enforceHumanGate`, `IOD17Parity`, `checkReviewGate`). The standard *renders* these; it does not redefine them.
- **Live transport** extends `Body/S/S3/gateway/src/temporal_context.rs` (`context_for_record()`) with a `blocks` projection on the Redis Hot tier + `s3'.temporal.subscribe` — no new channel.
- **Interaction continuity** extends `Body/S/S4/ta-onta/S4-4p-anima/modules/psyche-continuity.ts` (`SessionState`) with a `renderer` field that survives handoff via `carryForward` — no new store.
- **UI→agent intents** ride `sessions.patch` (`Body/S/S3/gateway-contract/src/session.rs`) + `s4'.psyche.update`; a minimal `blocks.annotate` / `blocks.verdict` op is added only because no existing op carries a block verdict.
- **Selection→context** rides `s2'.coordinate.context_xray` (planned) and the spec-ahead `s4'.context.assemble`, plus the M4-Nara `HighlightService` for the bidirectional highlight.
- **Persisted block-doc** lands in `Idea/Empty/Present/{day_id}/` (the Khora day paradigm, flat per DR-PRANA-1 rider); **Hen owns the CTX template**, the standard authors the instance (md or MDX).
- **Foundation principles** updated in place: [`15-ui-design-foundations.md`](15-ui-design-foundations.md), the materialized contract `Body/M/epi-theia/extensions/contracts/ui-foundation-principles.md`, and [`30-design-language-layer.md`](30-design-language-layer.md).

Total LOC estimate: ~1100 LOC across 8 modules (block-contract ~160, BlockRegistry ~90, BlockHostWidget + core specs ~360, review projection ~140, verdict/annotate ops + Psyche renderer field ~120, temporal-context blocks projection ~80, context-xray seam ~90, agent-card ~70). Zero greenfield architecture; one new presentation extension.

## Source authority

- **Canonical M5' seed** at [`Idea/Bimba/Seeds/M/M5'/m5-prime-pratibimba-surface-standard.md`](../../../M5'/m5-prime-pratibimba-surface-standard.md) — holds the C5/Pratibimba rendering law, the one-schema/two-edges model, the CTX vs day/now-runtime distinction, the interaction paradigm, ownership, and the Foundation-Principle mapping. Track 44 is the execution plan; the seed is the authority.
- **DR-PSS-1** (2026-06-17 VALIDATED — gates Tranches 44.1, 44.4): Block CTX-framing law — every block carries `cf/ct/cp/cpf`+`cs`; that coordinate types-and-templates the block; inherit-or-shift on interaction.
- **DR-PSS-2** (2026-06-17 VALIDATED — gates Tranche 44.2): native re-implementation; Builder.io inspiration only; no vendored runtime.
- **DR-PSS-3** (2026-06-17 VALIDATED — gates Tranches 44.1, 44.7): CTX is format-agnostic across markdown and MDX; MDX is a first-class persisted surface format beside markdown.
- **DR-PSS-4** (2026-06-17 VALIDATED — gates Tranche 44.7): block-doc residency + Hen/CTX-template boundary — instances only into `Empty/Present`; Hen owns CTX templates; never canon, never a Hen canon-write.
- **DR-PSS-5** (2026-06-17 VALIDATED — gates Tranches 44.4, 44.5): live transport on the day/now context runtime; UI→agent intents ride session-ops → `psyche.update` under the Human Gate; no new channel/store.
- **DR-PSS-6** (2026-06-17 VALIDATED — gates Tranche 44.8): A2A via agent-card over existing gateway methods; no new transport.
- DR-VAK-4 (VALIDATED 2026-06-13): the M0 sub-coordinate CF literals — DR-PSS-1 grounds the block `ctx` frame in this CF value-space.
- DR-M4-1 (VALIDATED 2026-06-02) + DR-PRANA-1 rider (VALIDATED 2026-06-16): the day-now anchor at flat `Idea/Empty/Present/{DD-MM-YYYY}/` — the persisted block-doc residency target.
- Track 15 (UI Design Foundations) — the 9 binding Foundation Principles this standard realises (G7).
- Track 27 (OmniPanel Tabs Deep) — the Review/Evidence/Dispatch tabs are the standard's first consumers.
- Track 30 (Design Language Layer) — the tokens the renderer draws through.

## The standard in one breath

Every M' surface renders **blocks** — schema-validated C5 reflections of typed truth. One in-memory `Block[]`; two edges: a live **wire** form on the day/now context runtime (`s3'.temporal.context`), and a persisted **block-doc** form (CTX-structured, markdown *or* MDX) in `Empty/Present`. Every block carries its CTX context-frame coordinate (`cf/ct/cp/cpf`), which both addresses it and selects its template. The interaction loop closes through the existing Human Gate. Two integrations, held apart: **CTX** (Hen/vault typing + templating, format-agnostic) and the **day/now context runtime** (live transport) are different systems and are never conflated.

## Four-corpora grounding

- **UX intent:** engaging, context-aware, bidirectionally-editable surfaces — review-inbox items, day artifacts, evidence, dispatch genealogy rendered as interactive blocks rather than hand-rolled panels (M5' seed §I; nara-ux engaging-inbox intent).
- **M' seed spec:** [`m5-prime-pratibimba-surface-standard.md`](../../../M5'/m5-prime-pratibimba-surface-standard.md) (authority) + [`15-ui-design-foundations.md`](15-ui-design-foundations.md) (binding principles).
- **Code / substrate:** `m-extension-runtime` (block-contract), new `block-kit` extension (renderer), `epii-review-core` + `omnipanel-runtime.ts` (review data, consumed), `temporal_context.rs` + `psyche-continuity.ts` (day/now runtime, extended).
- **Theia surface:** `BlockHostWidget` consumed by the OmniPanel tabs (Track 27), ACR, and the M0–M5 extensions.

## Cycle 2/3 substrate inheritance

Consume as-is — `Body/S/S5/epii-review-core/`, `Body/S/S5/epii-agent-core/` (day-scoped inbox), `Body/M/epi-theia/extensions/omnipanel-shell/` (`omnipanel-runtime.ts` review types + gate), `Body/M/epi-theia/extensions/agentic-control-room/` (dispatch/tool-stream), `Body/S/S3/gateway-contract/src/session.rs`, the Khora day paradigm at `Idea/Empty/Present/`. Audit-and-extend — `temporal_context.rs` (+blocks projection), `psyche-continuity.ts` (+renderer field), `15-ui-design-foundations.md` + `ui-foundation-principles.md` + `30-design-language-layer.md` (+Surface-Standard section). New — the `block-kit` extension only.

## Tranches

The **vertical slice is 44.1 → 44.5**: one complete loop on already-built review data — block-contract → renderer → projection → verdict loop → live transport. 44.6 → 44.10 are sequenced follow-ons.

### Tranche 44.1 — Block contract + CTX-framing + live catalog *(doc-ahead-landing; blocks 44.2..44.10)*

Land the binding `block-contract` as TypeScript in `Body/M/epi-theia/extensions/m-extension-runtime/` + a mirrored JSON-schema (so S-layer Rust cores can emit conforming blocks). Defines as binding facts:

- **`Block`** shape: `id`, `type`, `ctx { cf, ct, cp, cpf?, cs? }` (mandatory — DR-PSS-1), `coordinate?`, `privacyClass` (`public | protected | protected-local`), `provenance?` (evidence-envelope / s2 handle), `data`, `affordances?` (`verdict | annotate | select | navigate`).
- **`BlockSpec`**: `{ type, schema, Read, Edit?, editSurface: 'inline'|'panel'|'container', privacyGate }`.
- **Core block-type set:** `rich-text, callout, diff, data-model, file-tree, annotated-code, code, table, checklist, question-form, review-item, evidence, dispatch-genealogy, tool-stream-event, pattern-packet, kairos-strip, resonance-indicator, wireframe, diagram`.
- **`blocks.catalog`** gateway method (Techne-operated): serves the live registered vocabulary so no agent/surface hard-codes types; rejection of any type absent from the catalog or whose IOD-17 faces disagree (mirrors `IOD17Parity.inParity` gating). DR-PSS-1, DR-PSS-3.

### Tranche 44.2 — BlockRegistry + BlockHostWidget (native Theia)

The new `block-kit` extension: `BlockRegistry` (`type → BlockSpec`, the union of registrations IS the live catalog) + `BlockHostWidget` (a `ReactWidget` rendering each block through its spec's `Read`/`Edit`, enforcing `privacyGate` before render). Native Theia + kernel-bridge; no Builder.io runtime (DR-PSS-2). Core specs for the §44.1 vocabulary land here. Visual-regression baseline scaffolding (feeds 44.9 / G8).

### Tranche 44.3 — Projection: ReviewItemDeep → blocks (OmniPanel Review)

A projection layer mapping built typed data to blocks: `ReviewItemDeep → review-item + evidence + dispatch-genealogy` blocks; `PatternPacket → pattern-packet`; tool events `→ tool-stream-event`. Render in the OmniPanel Review tab via `BlockHostWidget` (Track 27 cross-link; the repurposed `REVIEW_DECISION` widget content model). Consumes `epii-review-core` + `omnipanel-runtime.ts` unchanged. First real data rendered through the standard.

### Tranche 44.4 — Verdict/annotation loop under the Human Gate

Wire `review-item` block affordances (`approve|reject|revise|defer|annotate`) → a minimal `blocks.annotate` / `blocks.verdict` session-op (DR-PSS-5) → routed by `resolutionTarget` (agent vs human) → `s4'.psyche.update`. The gate is reused verbatim: `enforceHumanGate` + `IOD17Parity` + `checkReviewGate` from `omnipanel-runtime.ts` (committal verdicts blocked for agent actors and recursive self-review). Extend `Psyche.SessionState` with a `renderer` field (active block ids, pending verdict, current selection) that survives handoff via `carryForward`. DR-PSS-1, DR-PSS-5. **Closes the vertical-slice loop.**

### Tranche 44.5 — Live transport on the day/now context runtime

Extend `context_for_record()` (`temporal_context.rs`) to carry a `blocks` projection on the Redis Hot tier; surface it on `s3'.temporal.context` (poll) + `s3'.temporal.subscribe` (stream). `m-extension-runtime` dispatches arriving blocks to the owning `BlockHostWidget`. Explicitly the **day/now runtime, not CTX** (DR-PSS-5). No new channel; no new store.

### Tranche 44.6 — Selection → context (context-xray seam) *(depends: s2'.coordinate.context_xray landing)*

Block/passage/coordinate selection fires `s2'.coordinate.context_xray` (+ optional S5' episodic) and/or the spec-ahead `s4'.context.assemble`, returning related blocks/coordinates/episodes injected into the agent as a **CTX-framed context handle**. Realises the FLOW.md "highlighted passage → context snippet (future feature)". Bidirectional highlight-back via the M4-Nara `HighlightService`. Gated on the planned `context_xray` route; lands its stub-or-real per S2' readiness.

### Tranche 44.7 — Persisted block-doc (CTX-structured, markdown *or* MDX) in Empty/Present

`toDoc`/`fromDoc` round-trip `Block[]` to a persisted block-doc — C-family frontmatter (`coordinate`, `c_1_ct_type`, `c_3_ctx_frame`, `privacyClass`) + an ordered block list whose structure is supplied by the CTX context-frame coordinate, serialising as **markdown or MDX** (DR-PSS-3). Written only into `Idea/Empty/Present/{day_id}/` (DR-PSS-4). First authored artifact: the Nara daily-briefing (Track 5.18) as a block-doc. **Hen extension note:** serving a CTX template in MDX (not just markdown) extends Hen's template layer — landed here as *consumption + MDX-serialisation*; CTX-template *authoring authority* stays Hen's (DR-PSS-4). If MDX template-authoring is preferred as a Hen-side tranche, it splits cleanly to Track 19/Hen scope.

### Tranche 44.8 — A2A via agent-card

Describe the existing gateway methods (`s3'.temporal.context`, `s4'.psyche.state`/`update`, `route_anima_invoke`, `s4'.mediation.route`) as an A2A agent-card (`/.well-known/agent-card.json`-shaped) so Hermes and external agents (Claude Code, Codex) interoperate with the constitutional agents through one published contract. No new transport (DR-PSS-6).

### Tranche 44.9 — Foundation principles + design language + visual regression (G7/G8)

Add a Surface-Standard section to the materialized contract `Body/M/epi-theia/extensions/contracts/ui-foundation-principles.md` and cross-reference it from [`15-ui-design-foundations.md`](15-ui-design-foundations.md) and [`30-design-language-layer.md`](30-design-language-layer.md). Commit `BlockHostWidget` visual-regression baselines (feeds G8). Verifies the standard honours all 9 Foundation Principles (M5' seed §IX).

### Tranche 44.10 — M0–M5 rollout + no-orphan acceptance harness

Extend remaining surfaces to render via `block-kit`: ACR dispatch-trace + tool-stream (`agentic-control-room`), evidence inspector, the M0–M5 extension widgets where a block grammar fits. Acceptance harness proving: every core block type has an owning extension registration (no-orphan, Track 14); every new gateway method has a contract entry + owner; the verdict loop round-trips under the Human Gate; a persisted block-doc round-trips in both markdown and MDX. Closes Track 44 against the release gates.
