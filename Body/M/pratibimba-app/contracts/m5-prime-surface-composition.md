<!--
Coordinate: M' M5' (surface-composition pattern doc — rerun 26.T26.15)
Residency: Body/M/pratibimba-app/contracts/m5-prime-surface-composition.md
Position (#n): #5 — Integration (the doc that names how the three M5' surfaces compose)
Actualises: WC-M5-18 — the M5'-flavoured surface-composition pattern. Retarget of the
  frozen epi-theia target `extensions/contracts/m5-prime-surface-composition.md` to the
  live carrier per CHARTER.md rule 2 (Theia contract surfaces are LAW; Theia plumbing —
  Inversify, SharedBridgeAdapter class, widget ids — is dead, realised in the carrier by
  the GatewayClient bus + gateway method routes + zustand stores). Built FROM the 26.15
  spec (design-recon 26-m5-epii-frontend-deep.md §15), never ported from epi-theia.
Public surface: the five sections below (§1 Three Surfaces / §2 SharedBridgeAdapter
  Capability Bindings / §3 Why Not Conflate / §4 Composition Rules / §5 DR Cross-Reference)
  are the grep-anchored contract; the chromeContract-style consistency gate is the
  carrier UF close proof (Track 26 = UF class).
Does NOT own: the surfaces themselves (M5EbmObservatoryPane, M5RecognitionLayer +
  PersonalRecognitionEngine, the OmniPanel governed folds); the bus/method contract
  (bridge/gatewayClient.ts); the DR law (13-decision-register.md).
-->

# M5′ Surface-Composition Pattern

**M5′ is not a chat. M5′ is the energy-evaluation engine.** The user reads M5′ to understand the *reasoning behind Pi's words*; the user *converses* with Pi at the OmniPanel. This document names the **three M5′-flavoured surfaces**, the capabilities each binds, why two of them must never be conflated with the M4′ LLM voice, and the rule by which the personal surface **composes** rather than juxtaposes.

> **Carrier note (CHARTER.md rule 2).** The original 26.15 spec targets the frozen `Body/M/epi-theia/extensions/contracts/…` and speaks of a `SharedBridgeAdapter` capability object injected via Inversify. That adapter is the **frozen-Theia concept**; the live carrier realises the identical capability *law* through the `KernelBridgeClient` bus (`bridge/gatewayClient.ts` — `onProfile` / `onStatus` / `onEvent` / `onChime`) plus the `s5'.*` / `aletheia_*` **gateway method routes** and the zustand stores (`state/stores.ts`). Where §2 below names a `SharedBridgeAdapter` capability, read it as *"the carrier binds this via the bus callback or gateway method route named in parentheses."*

---

## §1 Three Surfaces

M5′ appears in the carrier as **three distinct surfaces**, each with its own residency, flavour, and scope. They are one engine seen three ways — never three copies of one widget.

| # | Surface | Flavour / scope | Carrier residency |
|---|---------|-----------------|-------------------|
| 1 | **Standalone — EBM observatory** | `ide-deep`; the M5′ mental-pole **scoring** face rendered whole ("M5′ does not talk. It scores."): the 12×6 = 72-cell resonance grid, the three Klein-V₄ tritone-square overlays, energy + gradient + Möbius-descent readouts, checkpoint badge. | `src/panes/M5EbmObservatoryPane.tsx` (26.1/26.2), scoring over `src/panes/m5Ebm.ts` and the S5 substrate `Body/S/S5/epii-autoresearch-core` (`export_ebm_state`). |
| 2 | **Ide-shell chrome — governed widgets** | `ide-deep`; the governed surfaces through which **canonical work** flows — evidence, review, atelier write-back, capability tree, and the M0↔M5 library seam. | `src/panes/omni/ReviewBlocksPane.tsx` + `src/panes/omni/evidenceShapes.ts` + `src/commands/atelier.ts` + `src/panes/m5ReviewGate.ts` + `src/panes/m0M5LibrarySeam.ts`. |
| 3 | **Recognition-layer slot** | `daily-0-1` personal-face; **Mahamaya recognition at personal scale** — where the personal field meets the canonical city-scape (*tat tvam asi* made visible, UX §7). | `src/panes/M5RecognitionLayer.tsx` (26.11) backed by `src/engine/PersonalRecognitionEngine.tsx`. |

The **standalone** surface is M5′ read at canonical scale (the whole city). The **recognition-layer slot** is M5′ read at personal scale (this person, in the city). The **ide-shell chrome** is the set of governed gates that let canonical work *move* — it is M5′ acting, not M5′ displayed.

---

## §2 SharedBridgeAdapter Capability Bindings

Each surface binds a fixed set of capabilities. In the carrier these are the bus callbacks (`onProfile` for the cached kernel profile; readiness rides the profile/event windows; coordinate context rides `useCoordinateStore`) and the `s5'.*` / `aletheia_*` gateway method routes. Capabilities are **per-surface** — a surface that does not bind a capability does not read it.

**Surface 1 — Standalone (EBM observatory):**
- `onProfile` → reads the `MathemeResonance72Projection` window (the 72-cell energy field the grid renders).
- `onReadiness` → the checkpoint/readiness banner (no checkpoint on the bus ⇒ narrative + pending banner only; grid/energy/gradient suppressed).
- `s5'.improve.history` → the improvement/wisdom-delta trail behind the score.
- `s5'.epii.runtimeContext` → the runtime context the scoring runs against.
- `s5'.review.inbox` → the governed items awaiting recognition.

**Surface 2 — Ide-shell chrome (governed widgets):**
- `onProfile` + `onReadiness` → the shared readiness taxonomy every governed fold gates on.
- `s5'.review.*` (`s5'.review.inbox` / `s5'.review.submit` / `s5'.review.resolve`) → the review gate (`m5ReviewGate.ts`, `ReviewBlocksPane.tsx`).
- `s5'.improve.*` (`s5'.improve.history` / `s5'.improve.status` / `s5'.improve.q_review.latest`) → the improvement surface.
- `s5'.gnostic.*` (`s5'.gnostic.etymology` / `s5'.gnostic.ingest`, 6.1) → the gnostic evidence seam (`evidenceShapes.ts`).
- `aletheia_*` (via Anima dispatch — e.g. `aletheia_crystallise`) → the atelier canonical write-back path (`atelier.ts`, `s5'.canon_update.*`).

**Surface 3 — Recognition-layer slot:**
- `onProfile` → reads `Q_composed` + `CanonRecognitionAnchor` (the composed personal quaternion and its canonical anchor).
- `onCoordinateContext` → the active coordinate the personal recognition is read against (carrier: `useCoordinateStore.setSelected`).

---

## §3 Why Not Conflate

The **OmniPanel Pi Chat** (15.2) is the **M4′ LLM voice** — natural-language composition of recognition. The **M5′ standalone observatory** is **M5′ EBM reasoning** — energy evaluation across the 72-cell field. These are **two surfaces of the DR-MP-1 mental-pole triplet, not one surface**:

- **M4′ LLM voice** *composes* recognition (Pi's words).
- **M5′ EBM** *evaluates* energy across 72 cells (the scoring behind the words).
- **M0′ Verifier** *checks axioms* and emits questions (the ground the words must answer to).

**Conflating the Pi chat with the M5′ observatory collapses the triplet** — it makes the LLM voice look like the reasoning, when the reasoning is the *scored field the voice reads from*. Wave-C therefore never owns the M4′ LLM voice; OmniPanel Pi Chat (15.2) stays untouched. The observatory is *why*; the chat is *what was said*.

---

## §4 Composition Rules

Per **15.4 composition-over-juxtaposition**: the recognition-layer slot **composes** with its neighbours into *one* surface, it does not sit *beside* them as three panels.

- The **recognition-layer slot** (Surface 3) composes with the **M4 journal** and the **M0 cymatic** field into a single `daily-0-1` personal-face surface — one composed reading, not a three-pane juxtaposition.
- Composition is a geometric-slot relation (the composition substrate hard-fails juxtaposition where the profile forbids it), not a free layout of independent widgets.
- The **standalone** observatory (Surface 1) is *not* composed into the personal face — it is the canonical-scale read, hosted whole in `ide-deep`.

The teaching posture (paidagōgos): never lecturing, always conducting traversal, always returning the teaching to the lived concern. Composition is how three M5′-flavoured surfaces become one coherent posture.

---

## §5 DR Cross-Reference

- **DR-M5-1** — M5′ is the EBM energy-evaluation engine (not a chat); the observatory is its scoring face.
- **DR-MP-1** — the mental-pole triplet (M4′ voice / M5′ EBM / M0′ Verifier); the three positions in joint operation.
- **DR-MP-2**, **DR-MP-3** — the triplet's composition and non-conflation law.
- **DR-WC-M5-1**, **DR-WC-M5-2**, **DR-WC-M5-3** — the Wave-C M5′ surface decisions (standalone vs governed-chrome vs recognition-slot; capability bindings; composition over juxtaposition).

*(All DR ids resolve in `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md`.)*

---

*M5′ is not a chat. M5′ is the energy-evaluation engine. Five governed chrome widgets are the surfaces through which canonical work flows; the recognition-layer slot is where the personal field meets the canonical city-scape. Three M5′-flavoured surfaces compose into one coherent posture — never lecturing, always conducting traversal, always returning the teaching to the lived concern.*
