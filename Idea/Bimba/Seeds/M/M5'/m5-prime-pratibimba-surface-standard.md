---
coordinate: "M5'"
c_4_artifact_role: "seed"
c_1_ct_type: "CT4a"
c_3_ctx_frame: "5/0"
c_3_created_at: "2026-06-17T10:00:00Z"
c_0_source_coordinates:
  - "Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md"
  - "Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md"
  - "Idea/Bimba/Seeds/M/M5'/M5-ARCHITECTURE.md"
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/15-ui-design-foundations.md"
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/27-omnipanel-tabs-deep.md"
  - "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md"
  - "Body/M/epi-theia/extensions/contracts/ui-foundation-principles.md"
  - "Body/M/epi-theia/extensions/omnipanel-shell/src/common/omnipanel-runtime.ts"
  - "Body/S/S3/gateway/src/temporal_context.rs"
  - "Body/S/S3/gateway-contract/src/session.rs"
  - "Body/S/S4/ta-onta/S4-4p-anima/modules/psyche-continuity.ts"
  - "Body/S/S5/epii-review-core/src/lib.rs"
  - "Idea/Bimba/World/FLOW.md"
  - "Idea/Bimba/World/NOW.md"
---

# M5' — Pratibimba Surface Standard

## A Seed Specification of the App-Wide Standard by Which Every M' [[Theia]] Surface Renders Typed Truth as Interactive [[Block|Blocks]] — One Schema, Typed and Templated by [[CTX]] Context-Frame Coordinates, Format-Agnostic Across Markdown and MDX, Carried Live on the Day/Now Context Runtime — So That Review-Inbox Items, Day Artifacts, Evidence, and Dispatch Genealogy Become Engaging, Context-Aware, Bidirectionally-Editable Reflections That Close Their Loop Through the Existing [[Human Gate]], Without a New Runtime Channel and Without Touching Canon

> **The canonical claim.** The **Pratibimba Surface Standard** is the C5 ([[Pratibimba]]) rendering law for the whole [[epi-theia]] app. A surface never invents its own presentation; it renders **[[Block|blocks]]** — typed, schema-validated *reflections* of underlying truth (review items, evidence envelopes, pattern packets, diffs, day artifacts). The block is C5: an *instance/reflection* of canon, never canon itself. This is not a Nara feature. It is the cross-cutting standard every M0–M5 surface, the [[OmniPanel]], and the [[ACR]] render against — with [[M4'|Nara]] as its most-visible surface, not its owner. M5' [[Epii]], as the integral/system-shape pole, holds the standard's authority because Epii owns *how the whole system shows up*.

> **Two integrations, and they must never be conflated.** **(A) [[CTX]] — the context-frame coordinate class.** CTX is the reflective coordinate system (`cf · ct · cp · cpf · cfp · cs`) that, at the [[Hen]]/vault level, *types each artifact and selects its template* by context-frame alignment (`(00/00)`, `(0/1)`, `(0/1/2)`, `(0/1/2/3)`, `(4.0/1-4.4/5)`, `(5/0)`) — CT0 is [[FLOW]], CT4b is [[NOW]]/daily-note, and so on. CTX is **format-agnostic**: the *same* context-frame coordinate structures a block whether it serialises as **markdown or MDX**. The Surface Standard integrates *into CTX* by making every block CTX-typed and CTX-templated, and by extending CTX to govern MDX as a first-class format alongside markdown ([[DR-PSS-3]]). **(B) The day/now context runtime — NOT CTX.** Live agent↔UI↔agent state has its own home: the S3' temporal-context store (`s3'.temporal.context`/`subscribe`, `context_for_record()`) + S4.4 [[Psyche]] continuity (`SessionState`, `s4'.psyche.state`/`update`, `carryForward`) — the runtime of the day/now paradigm. The Surface Standard *rides* this runtime for live transport, adding **no new channel and no new state store** ([[DR-PSS-5]]). This runtime is the day/now paradigm; it is not CTX. Conflating the two is the error this seed forecloses.

> **Every block carries its [[CTX]] frame, which types and templates it.** A block's address is not a flat coordinate but the full context-frame quadruple `cf / ct / cp / cpf` (+ `cs` direction). That CTX coordinate both *addresses* the block and *selects its template* — per the `c_1_ct_type` / `c_3_ctx_frame` frontmatter law and the CF-literal law ([[DR-VAK-4]]). User interactions **inherit** the parent block's frame unless they **explicitly shift** it. A block stripped of its CTX frame is invalid ([[DR-PSS-1]]).

> **The loop closes through what already exists.** A review-item block's *affordances* ARE the built [[Human Gate]] verdicts — approve / reject / revise / defer / annotate (`ReviewDecision`). User action emits a typed session intent → routed by a `resolutionTarget` (agent vs human) → `s4'.psyche.update`. The gate stays exactly `enforceHumanGate` + `IOD17Parity` from `omnipanel-runtime.ts`. No new governance, no modals (Foundation Principle 5).

> **Native, not vendored.** The pattern is drawn as *inspiration* from the open-source [[Builder.io]] `agent-native` / `skills` work (MIT) — its block-registry, its `get-plan-blocks` live-catalog discipline, its element-selection→context loop, its annotation→agent routing. None of its runtime (React/Nitro/Drizzle/assistant-ui) is adopted. Everything is re-implemented in [[Theia]] `ReactWidget` + kernel-bridge idioms ([[DR-PSS-2]]). See companion plan [[44-pratibimba-surface-standard]] for the build.

> **Companion documents:**
> - [[M5'-SPEC]] — M5' Epii domain contract; the integral/system-shape authority this seed serves
> - [[m5-prime-system-shape-and-tauri-ide-canon]] — S-as-backend / M'-as-frontend / Theia-as-shell canon
> - [[15-ui-design-foundations]] — Track 15: the 9 binding Foundation Principles this standard extends (G7)
> - [[27-omnipanel-tabs-deep]] — the OmniPanel Review/Evidence/Dispatch tabs that are the standard's first consumers
> - [[30-design-language-layer]] — the design-language tokens this standard renders through
> - `Body/M/epi-theia/extensions/contracts/ui-foundation-principles.md` — the materialized UI-foundation contract that gains a Surface-Standard section
> - Track 44 cycle-3 execution plan: [[44-pratibimba-surface-standard]]

---

## I. What the standard is

The Pratibimba Surface Standard defines **how an M' [[Theia]] surface turns typed truth into something a human can see, read, and act on** — uniformly, across the whole app.

Today each surface improvises. The [[OmniPanel]] review tab, the [[ACR]] dispatch trace, the M4-Nara day surface, the evidence inspector each hand-roll their rendering and their interaction wiring. Track 15 named the *principles* (coordinate-as-navigation, provenance-always-visible, OmniPanel-as-membrane, no-modals) but not the **grammar** that realises them. This standard is that grammar: a single block vocabulary, a single renderer, a single interaction loop — every block typed and templated by the [[CTX]] context-frame system, every live update carried on the day/now context runtime.

A **[[Block]]** is the atom. It is C5: a *reflection* of underlying truth — a `ReviewItemDeep`, a `PatternPacket`, an `IntegratedEvidenceEnvelope`, a diff, a file-tree, a day-briefing section. The block is never the canon and never the durable record; it is the rendered instance through which the human meets that record and acts back on it.

## II. The Block schema (one definition)

```
Block {
  id            // stable, unique within its surface
  type          // resolved against the live catalog (§III) — never hard-coded
  ctx {         // the full context frame — types + templates the block; mandatory (DR-PSS-1)
    cf          // e.g. "(4.0/1-4.4/5)" | "(0/1/2)" | "(5/0)"
    ct          // e.g. "CT4b"  — the artifact-type / template selector
    cp          // e.g. "4.4"
    cpf?        // e.g. "(00/00)" for dialogue frames
    cs?         // "outbound" | "inbound" — Möbius direction
  }
  coordinate?   // the Bimba ground reference this block reflects (e.g. "M4-3")
  privacyClass  // "public" | "protected" | "protected-local" — drives drop/redact
  provenance?   // IntegratedEvidenceEnvelope handle / s2 provenance handles
  data          // schema-validated payload, per type
  affordances?  // declared interactions: verdict | annotate | select | navigate
}
```

Every block is **schema-validated per type** (the native analogue of the inspiration's `BlockSpec` + zod). The block's `ctx` coordinate is not decoration: it *types the block and selects its template* (the [[Hen]]/vault `c_1_ct_type` / `c_3_ctx_frame` law), and it does so **format-agnostically** — the same `ctx` structures the block whether it serialises as markdown or MDX (see §IV; [[DR-PSS-3]]). Every block also carries `privacyClass` + (where it reflects evidence) `provenance`, so the renderer and the wire envelope can enforce privacy and trace lineage — reusing the built `sanitizeProtectedHandle` machinery and the `IntegratedEvidenceEnvelope` from `evidence-envelope.ts`. A block whose `privacyClass` exceeds the surface's clearance is dropped or redacted *before* render, not after.

## III. Core vocabulary + a runtime-served catalog

The standard defines a **core block set** and an **extension rule**.

Core set (M0–M5 surfaces extend it): `rich-text`, `callout`, `diff`, `data-model`, `file-tree`, `annotated-code`, `code`, `table`, `checklist`, `question-form`, `review-item`, `evidence`, `dispatch-genealogy`, `tool-stream-event`, `pattern-packet`, `kairos-strip`, `resonance-indicator`, `wireframe`, `diagram`.

**No surface or agent hard-codes block types.** Mirroring the inspiration's `get-plan-blocks` discipline, the **block catalog is served at runtime over the gateway** ([[Techne]]-operated). Authoring agents/skills resolve the vocabulary live; widgets register their specs at activation. This is what keeps the **IOD-17 parity** (capability-matrix ↔ agent-contract ↔ widget) from drifting — a block type that is not in the live catalog, or whose three faces disagree, is rejected, exactly as `omnipanel-runtime.ts` already gates committal review decisions on `IOD17Parity.inParity`.

## IV. The two edges (and the persisted edge is format-agnostic)

One in-memory `Block[]`, two edges — and the persisted edge serialises in *either* format, structured by CTX:

- **Wire (live).** Blocks are projected from existing typed data (`ReviewItemDeep` → `review-item` + `evidence` + `dispatch-genealogy` blocks; `PatternPacket` → `pattern-packet`; tool events → `tool-stream-event`) and carried in/alongside the `s3'.temporal.context` envelope (Redis Hot tier for poll; `s3'.temporal.subscribe` for stream) — the **day/now context runtime**, not CTX. This is the live path for ephemeral surfaces; nothing new is persisted. `toWire` / `fromWire` round-trip the `Block[]` ([[DR-PSS-5]]).
- **Persisted block-doc (CTX-structured, format-agnostic).** A persisted form — C-family frontmatter (`coordinate`, `c_1_ct_type`, `c_3_ctx_frame`, `privacyClass`) + an ordered block list whose structure is supplied by the [[CTX]] context-frame coordinate, serialising as **either markdown or MDX** (the format is a free choice; CTX provides the structure either way — [[DR-PSS-3]]). Written **only** into `Idea/Empty/Present/{day_id}/`: the legal [[Pratibimba]]/Empty residency; never canon; [[Hen]] owns the CTX template, the standard authors the instance ([[DR-PSS-4]]). This is the authored path for day artifacts that live in the day paradigm: the [[Nara]] daily-briefing (Track 5.18), session visual-recap, NOW summaries. `toDoc` / `fromDoc` round-trip the same `Block[]` in either format.

Live surfaces stay runtime-native; durable artifacts stay day-native and CTX-typed; one vocabulary and one renderer serve both.

## V. The renderer (native [[Theia]])

- **`BlockRegistry`** — `type → BlockSpec`, where `BlockSpec = { schema, Read, Edit?, editSurface: 'inline' | 'panel' | 'container', privacyGate }`. Registered per-extension at activation; the union of registrations IS the live catalog (§III).
- **`BlockHostWidget`** — a `ReactWidget` that takes a `Block[]` and renders each through its spec's `Read` (or `Edit`), enforcing `privacyGate` first. Consumed by the [[OmniPanel]] tabs, [[ACR]], and the M0–M5 extensions. One renderer, every surface — the realisation of Foundation Principle 6 (composition over juxtaposition).

## VI. The interaction paradigm

1. **Render path (agent/runtime → surface).** Runtime projects typed data → `Block[]` → carried in the `s3'.temporal.context` envelope (the day/now runtime) → `m-extension-runtime` → `BlockHostWidget`. The envelope's existing privacy posture gates every block.
2. **Verdict/annotation path (surface → agent).** A block's affordances are the built verdicts (`approve | reject | revise | defer | annotate`). A user action emits a typed session intent (riding `sessions.patch`, or a minimal `blocks.annotate` / `blocks.verdict` op — [[DR-PSS-5]]), routed by `resolutionTarget` (agent vs human) into `s4'.psyche.update`. The gate is unchanged: `enforceHumanGate` + `IOD17Parity`; committal verdicts blocked for agent actors and for recursive self-review, exactly as built.
3. **Selection → context (this is context-xray, not a Pinpoint clone).** Selecting a passage / element / coordinate fires `s2'.coordinate.context_xray` (+ optional S5' episodic) and/or the spec-ahead `s4'.context.assemble` → related blocks/coordinates/episodes → injected into the agent as a CTX-framed context handle. This realises the [[FLOW]] "highlighted passage → context snippet (future feature)" through the seam that already exists conceptually. Bidirectional: agent inscriptions highlight back via the M4-Nara `HighlightService`.
4. **Agent↔UI & A2A = the day/now context runtime (NOT [[CTX]]).** agent→UI is `temporal.context`; UI→agent is session-op → `psyche.update`; agent→agent is `route_anima_invoke` with VAK-address patching. "A2A / agent-card alignment" means *describing these existing gateway methods as an agent-card* so [[Hermes]] and external agents (Claude Code, Codex) interoperate — no new transport ([[DR-PSS-6]]).

## VII. Integration seams

The standard plugs into **two distinct systems**. Keeping them distinct is load-bearing.

### (A) [[CTX]] — context-frame typing & templating ([[Hen]]/vault)

Every block and every persisted block-doc is typed and templated by its CTX coordinate (`c_1_ct_type` / `c_3_ctx_frame`). [[Hen]] owns the CTX *template definitions* (which context-frame maps to which template); the Surface Standard *consumes* them to render instances, and *extends* CTX so a template can be served in **MDX as well as markdown** (format-agnostic — [[DR-PSS-3]]). The standard never defines or mutates a CTX template — that authority stays Hen's ([[DR-PSS-4]]). Frame preservation: every block + every interaction carries `cf/ct/cp/cpf`; inherit-or-shift law ([[DR-PSS-1]], grounded in [[DR-VAK-4]]).

### (B) The day/now context runtime — live transport (NOT CTX)

The standard rides existing runtime methods; new contract entries are added only where a genuinely new intent has no existing carrier.

| Seam | Existing surface | What the standard adds |
|------|------------------|------------------------|
| Live block transport | `s3'.temporal.context` / `s3'.temporal.subscribe`, `context_for_record()` | a `blocks` projection in the envelope (Hot tier); no new channel |
| Interaction continuity | `Psyche.SessionState` (`psyche-continuity.ts`) | a `renderer` field (active block ids, pending verdict, current selection) that survives handoff via `carryForward` |
| UI → agent intents | `sessions.patch` + `s4'.psyche.update` | minimal `blocks.annotate` / `blocks.verdict` session ops ([[DR-PSS-5]]), gated by `enforceHumanGate` |
| Selection → context | `s2'.coordinate.context_xray` (planned), `s4'.context.assemble` (spec-ahead) | block/passage selection as the xray trigger; result injected as CTX-framed handle |
| A2A interop | `route_anima_invoke`, `s4'.mediation.route` | an agent-card describing these methods ([[DR-PSS-6]]); no new transport |

## VIII. Ownership

- **[[Mythos]]** (pattern-recognition, CF `(0/1/2/3)`) — *advises which block-pattern fits* an artifact (e.g. "this is a before/after change → `diff` in `columns`"). Selection, not rendering.
- **An authoring skill** (agent-agnostic, in the lineage of `visual-plan`) — *emits* the `Block[]`; exercised by [[Nara]] for personal/day artifacts and by [[Epii]]/review for human-gate items.
- **[[Techne]]** ([[Pleroma]], gateway lifecycle) — *operates* the renderer surface and serves the block catalog over the gateway.
- **[[Psyche]]** (S4.4) — owns interaction-state continuity across session handoff (day/now runtime).
- **[[Hen]]** — unchanged canon authority, and owner of the [[CTX]] *template/type definitions*. The standard *consumes* Hen's CTX templates to render instances and never defines or mutates one; block-docs only ever land in `Empty/Present` ([[Pratibimba]]), never canon ([[DR-PSS-4]]).

## IX. How the standard honours Track 15's Foundation Principles

| Track 15 principle | How the Surface Standard realises it |
|--------------------|--------------------------------------|
| 1 — Coordinate as primary navigation | every block carries `coordinate` + `ctx`; `navigate` affordance roots in coordinate |
| 2 — Profile-tick as primary clock | blocks re-render on temporal-context tick advance, not user input |
| 3 — Provenance always visible | `privacyClass` + `provenance` are first-class fields; readiness/verdict rendered inline, never a separate panel |
| 4 — Bimba/Pratibimba as UI dial | the block IS the Pratibimba (C5) face; the same typed truth renders under either pole |
| 5 — OmniPanel as `/` membrane, no modals | review-item blocks land verdicts inline in the OmniPanel Review tab; no modal review surfaces |
| 6 — Composition over juxtaposition | one `BlockHostWidget` composes a surface from blocks; not three side-by-side widgets |
| 7 — Activity-bar discipline | the standard is a render layer inside existing slots; it adds no new panels |
| 8 — Theia conventions where they fit | `ReactWidget`, contributions, command palette — consumed, not reinvented |
| 9 — Day-now as ambient thread | the persisted block-doc lives at `Empty/Present/{day_id}/`; the day-now anchor is a thread blocks read |

## X. Boundaries / non-goals

- **No new runtime channel, no new state store, no new artifact-type system.** The **day/now context runtime** carries live state; **[[CTX]]** (the [[Hen]]-owned context-frame coordinate class) types and templates artifacts. The standard consumes both and adds neither — it is a skin over them.
- **No canon writes.** Block-docs persist only to `Empty/Present` ([[Pratibimba]]); canon promotion remains [[Hen]]'s, through review.
- **No vendored runtime.** [[Builder.io]] `agent-native`/`skills` is inspiration only (MIT). Native [[Theia]]/kernel-bridge implementation throughout ([[DR-PSS-2]]).
- **No new governance.** The [[Human Gate]] (`enforceHumanGate` + `IOD17Parity`) is reused verbatim; the standard renders its verdicts, it does not redefine them.
- **No replacement of built substrate.** `epii-review-core` / `epii-agent-core` / the day-scoped inbox contract are consumed as-is; the standard is the missing *presentation* over already-built data.

## XI. Execution

The structural-philosophical authority is this seed. The cycle-3 execution plan — the vertical slice (`block-contract` → `BlockRegistry` + `BlockHostWidget` → project `ReviewItemDeep` → render in OmniPanel Review → wire verdict back under human-gate), the sequenced follow-on tranches (context-xray, daily-briefing block-doc, A2A agent-card, M0–M5 rollout), the four-corpora matrix, and the validated decision rows [[DR-PSS-1]]..[[DR-PSS-6]] — lives in [[44-pratibimba-surface-standard]]. G7 (`ui-foundation-principles.md`) and Track 30 (`design-language-layer`) gain Surface-Standard cross-references; G8 gains `BlockHostWidget` visual-regression baselines.
