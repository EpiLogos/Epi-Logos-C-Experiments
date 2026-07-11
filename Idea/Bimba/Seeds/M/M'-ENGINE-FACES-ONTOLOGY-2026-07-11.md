---
coordinate: "M'"
status: "ratified-2026-07-11"
created: "2026-07-11"
authored_by: "Claude (Fable 5), opus-e-widgets lane discovery + Architect dialogue"
depends_on:
  - "[[M'-SURFACE-REENVISIONING-2026-07-01]]"
  - "[[M'-SYSTEM-SPEC]]"
  - "[[M0'-SPEC]]"
  - "[[M1'-SPEC]]"
  - "[[M2'-SPEC]]"
  - "[[M3'-SPEC]]"
  - "[[M4'-SPEC]]"
  - "[[M5'-SPEC]]"
supersedes_framing_of:
  - "cycle-3 design-recon Tracks 21, 22, 23, 24, 25, 26 (per-Mn frontend-deep)"
  - "cycle-3 design-recon Tracks 15, 30, 31 (UI foundations / design-language / chrome catalog)"
---

# M' Engine Faces Ontology — The Widget Was the Hangover

> **Ratified by the Architect 2026-07-11** — "is this where we discover the widget
> paradigm is a hangover from theia and we should be considering the integrated
> functional truth of these carriers as the existing engine/system of the 1-2-3
> 4/5/0 in the pratibimba-app and kernel...? lets get clear and find the right way
> to carry the intent of the planned work to the right surface." Decision row:
> **DR-FACE-7** (registered in the cycle-3 decision register and §8 of the parent
> re-envisioning doc). This document is the frontend-tranche corollary of
> [[M'-SURFACE-REENVISIONING-2026-07-01]]: that document decided what the app IS
> (one organism, one face, Tauri-supervised kernel); this one decides what the
> planned *widget work* becomes inside that organism.

## 0. Why this document — the discovery

On 2026-07-11 the `opus-e-widgets` lane tried to execute seven tranches from the
cycle-3 design-reconciliation plans: 21.T21.1 (Layer Selector tab-strip),
22.T22.1 (Spanda walk navigator), 23.T23.1 (M2 per-view widget-class
registration), 25.T25.1 (Day-Calendar widget), 30.T30.1 (Typography scale
contract), 15.T15.10 + 31.T31.1 (status-bar discipline and entries catalog).

Every one of them stalled — and the stalls had a **shared shape**, which is what
made this a discovery rather than seven separate problems:

- 21.T21.1 asked for a provenance pill whose state taxonomy
  (`bridged_local`/`bridged_public`) the carrier had *deliberately* unified away.
- 22.T22.1 asked for a scrub-bar widget whose driving capability
  (`requestScrubToTick`) does not exist on the bridge — the gap was never
  frontend at all.
- 23.T23.1 asked for `ReactWidget` subclasses registered with `WidgetFactory` in
  `frontend-module.ts` — machinery that has no referent in a Tauri app.
- 15.T15.10/31.T31.1 asked for "exactly six" status entries whose enumeration the
  carrier's `StatusStrip` had already outgrown in an *honest* direction (it
  surfaces a `supervisor` thread, because on this carrier the app genuinely
  supervises the gateway — Theia never supervised anything).
- 30.T30.1's typed-constants file would have satisfied the letter of the tranche
  while `styles.css` kept its ~33 ad-hoc font sizes — the intent unserved.

The diagnosis: **the unit of the plan was wrong.** The design-recon tracks were
authored when the M' carrier was Theia, and Theia's unit is the *widget* — a
self-contained thing that registers itself into a shell, owns a slot, owns
chrome contributions, owns view classes. The pratibimba-app carrier
([[M'-SURFACE-REENVISIONING-2026-07-01]] §3) has no shell to register into. It
has a **bus**. Holding the tranches to the widget frame is why they all read as
"blocked" or "needs reconciliation": they were specified as parts for a shell
that was retired.

This document re-authors the *ontology* those tracks assume, so their intents —
which remain almost entirely valid — can be carried to the surfaces that
actually exist.

## 1. The reorientation — read this before touching any 21–31 tranche

Get this frame settled before executing anything; it inverts several habits the
plan-language will otherwise pull you back into.

**The app is one playing organism, not a shell of parts.** `pratibimba-app`
boots by *supervising the kernel gateway* (boot = supervise, DR-FACE-2): the
surface cannot open without the organism because opening it is starting the
organism. Everything visible is downstream of one heartbeat — the
**profile-tick** — arriving over one bridge. There is no moment where a
"widget" independently exists, owns data, and later gets wired in. Wiring-in is
not a phase; it is the medium.

**The unit is the face, not the widget.** A *face* is a pure projection over
the kernel spine: it subscribes to named bus channels and named stores, renders
what they carry, and **owns nothing** — no clock (the profile tick is the only
clock), no day-now (the session store's thread), no selection (the coordinate
store), no provenance vocabulary (the unified `ProvenanceState` taxonomy and
`ProvenanceBadge` primitive), no colour or type voice (the spine's token
vocabulary). A face can always answer three questions: *which pole do I belong
to, which channels do I read, and what would Playwright see if I were live?*

**Two poles over one spine.** The organism has exactly two poles, and the
carrier's directory structure already confesses them:

| | **Pole 1-2-3 — the cosmic played instrument** | **Pole 4-5-0 — the personal lived return** |
|---|---|---|
| Lives in | `src/engine/`, `src/components/` render services, `src/audio/` | `src/panes/` |
| Content | M1 structure (torus, Klein topology, spanda) · M2 correspondence (cymatic, modulation, resonance) · M3 manifestation (codon wheel, cosmic wheel, world clock) | M4 Nara (journal, oracle, now, day) · M5 Epii (review, sessions, deposit) · M0 ground (layer rail, relation family, pedagogical return) |
| Mode | Plays itself on the tick; the user is listener-participant | Receives the day; the user is author-witness |
| Its faces are | views into the playing (overlays, inspectors, transport) | surfaces of habitation (where lived material lands and returns) |

The **spine** both poles read from: `src/bridge/` (gateway client, kernel-bridge
types, privacy scrubber), `src/state/` (the four-store law: tick, coordinate,
session, provenance), `src/commands/` (the intent registry), and `src/ui/` (the
presentation vocabulary: tokens, primitives, ProvenanceBadge,
foundationPrinciples). The spine is where the old "cross-cutting chrome" tracks
(15, 30, 31) actually live: they were never widget-adjacent concerns; they are
**spine law**.

**Ownership is inverted from the Theia frame.** In the widget frame, features
accumulate *into* widgets, and the plan asks "which widget owns the day-now?"
In the face frame that question is malformed: threads live on the spine, and
faces *read* them. When a tranche says "widget X owns/registers/contributes Y,"
translate before executing: the contribution machinery is dead; the *thread* Y
either already runs through the spine or is a genuine gap.

**"Done" changes meaning.** A widget-tranche was done when the widget existed
and was registered. A face-intent is done when **the organism demonstrably
carries the intent** — proven by driving the real app against the real gateway
(UF class: Playwright / app-smoke), never by a file existing. This is why a
tranche can close as done *with zero code written*: if the live engine already
carries the intent, the honest close is proof, not construction.

## 2. The three fates — the sorting diagnostic

Every widget-intent in Tracks 21–26 + 15/30/31 resolves to exactly one fate:

**Fate A — carried-by-integration.** The intent is already a live face, usually
under a different name than the plan expected (the plan named Theia parts; the
carrier named organs). Close: UF-prove the live behaviour, mark done citing
DR-FACE-7 and the carrying surface. *No construction.*

**Fate B — face-gap.** The intent is real, frontend, and not yet projected.
Build it as a face: on the correct pole, reading spine channels, speaking spine
vocabulary, UF-provable. What you do *not* build: registration machinery, local
state stores, private clocks, private provenance, per-widget chrome.

**Fate C — spine-gap.** The intent was mis-filed as UI; its missing substance
is a kernel/bridge capability or a substrate emission. It leaves the frontend
lane entirely: mark **blocked** naming the owning substrate tranche, or route
to the kernel queue. Building a UI face over a missing spine thread is
forbidden — that is how placeholders and fake clocks get born.

**The sorting algorithm** (run on claim, for any 21–31 tranche):

1. Read the tranche's design-recon section in full. Strip every Theia noun
   (widget, `WidgetFactory`, `frontend-module.ts`, contribution, shell slot,
   `ReactWidget`, activity bar) — what remains is the *intent* plus the
   *content-law* (data shapes, field lists, pedagogy contracts, privacy rules).
   Content-law stays binding; the nouns do not.
2. Name the intent in one sentence without Theia vocabulary.
3. Ask the carrier: which pole does this intent belong to, and does a live face
   already carry it? (`grep` is not enough — read the candidate face and run
   the app; carrier names differ from plan names.)
4. Assign the fate. If B, name the face's pole, channels, and UF proof before
   writing code. If C, name the missing spine capability and its owning
   substrate track; do not build around it.
5. Close per fate, citing DR-FACE-7. Evidence names the fate explicitly.

## 3. The nine tracks sorted

The seven lane tranches, sorted with the carrier read in hand (2026-07-11);
sibling tracks 24/26 sort the same way on claim.

| Tranche | Intent (de-Theia'd) | Fate | Ruling |
|---|---|---|---|
| **21.T21.1** Layer Selector | Six M0-X' read registers, switchable, provenance-visible | **A + small B** | `M0LayerRail` carries the six-register grammar (local buttons, bridged `↗` deep-links, active state, `m0.layer.*` commands). Gap: a per-layer provenance chip — built with the **existing** `ProvenanceBadge`/`ProvenanceState`. The spec's `bridged_local`/`bridged_public` states are **not** added: bridged-ness is structural (`placement: 'bridged'` on the layer model), not provenance; the chip shows the S2 read state only. |
| **22.T22.1** Spanda walk | Walk the matheme as a playable instrument: transport over the tick | **C** | The engine already *is* the played instrument. Missing: `requestScrubToTick` + slerp-fraction emission on the kernel-bridge (substrate family 15.9/02.x). Blocked until the spine thread exists; afterwards the face is a thin transport strip (12 tick stops, play/pause, next-event preview) on the 1-2-3 pole. `WalkPane` is a *different, live* face (graph-walk-as-melody) — leave it alone. |
| **23.T23.1** M2 views | M2's three aspects each visible: cymatic, meaning, correspondence | **A ×2 + B ×1** | Cymatic: carried (`CymaticField` + `engine/cymaticField.ts`). Meaning-packet: carried (`AsmaMirrorOverlay` over `s2.parashaktiCorrespondences`). Correspondence-as-navigable-face: gap — a 1-2-3-pole face over the same channel. `WidgetFactory` registration: dead, no residue. |
| **25.T25.1** Day-Calendar | Navigate the lived days | **B** | 4-5-0-pole face over the `Idea/Empty/Present/` day-tree, in the `JournalTimelinePane`/`NowPane` family. Reads the session store's day-now thread; navigating selects a day, never *owns* the day-now. |
| **30.T30.1** Typography | One named type voice for the whole organism | **B (spine)** | Named scale as CSS custom properties in `styles.css` + consumption; the ~33 ad-hoc `font-size` literals are the drift to collapse (migration may stage, vocabulary may not). KaTeX matheme rendering stays content-law, landing when a face needs it. |
| **15.T15.10 + 31.T31.1** Status bar | The organism's live state threads, surfaced once each, owned by none | **A** | `StatusStrip` *is* the discipline. Carrier-native law replaces the Theia enumeration: **state-thread entries ≡ the spine's state threads, each surfaced exactly once** (threads, not stores — the session store carries two threads, day-now and session-key, and each gets its own entry). The `supervisor` entry is carrier-truth (boot = supervise, DR-FACE-2); the merged tick/generation entry is honest (the store's monotonic generation *is* the tick thread). "Exactly six" was a Theia artifact; the catalog-and-validators intent of 31 survives as **lint over faces** (no local clocks, no raw hex, no invented provenance, state-threads-once) — partially live already as the carrier-tokens suite + `foundationPrinciples.ts`. |
| Track 24 (M3) — sibling | M3 manifestation faces | sort on claim | Much already carried: `M3InspectorsPane`, `m3PentadicInspector`, `CodonWheel`, `M3CosmicWheelRenderService`, world-clock binding. |
| Track 26 (M5) — sibling | M5 review/recognition faces | sort on claim | Much already carried: `m5ReviewGate`, `SessionsPane`, `m4DepositReception`. |

## 4. Supersession mechanics

- The nine design-recon track files (21–26, 15, 30, 31) carry a header
  annotation pointing here. **Their content-law stands** — data shapes, field
  lists, pedagogy contracts, privacy rules remain binding law over faces. Only
  the widget/registration framing is dead.
- Ledger tranche-ids are stable. Each closes per its fate (A: UF proof + done;
  B: build face + done; C: blocked naming the substrate owner), evidence citing
  DR-FACE-7 and the fate. No mass re-enumeration: unclaimed tranches sort on
  claim via §2's algorithm.
- UF class discipline is unchanged and is *why* this ontology is honest: a
  face-close needs the real app driven against the real gateway. A fate-A close
  with UF proof is a first-class done, not a shortcut.
- This document is law for M' frontend tranches, below the Mn'/Sn specs and
  beside [[M'-SURFACE-REENVISIONING-2026-07-01]]. Where a design-recon section
  and this ontology conflict on *framing*, this wins; where they conflict on
  *content* (a field name, a privacy rule), the design-recon section and its
  owning Mn' spec win.

## 5. DR-FACE-7 (registered)

**Decision:** The unit of M' frontend work is the **face** — a stateless
projection over the kernel spine (profile-tick bus + four-store law + spine
vocabulary) — not the Theia widget. The organism has two poles (1-2-3 cosmic
played instrument; 4-5-0 personal lived return) over one spine; Tracks 15/30/31
are spine law, not chrome. Every widget-intent in Tracks 21–26 + 15/30/31 sorts
to carried-by-integration / face-gap / spine-gap, and closes per fate.

**Status:** VALIDATED · 2026-07-11 · by the Architect (this session, quoted in
the header) · **Source:** the opus-e-widgets lane discovery (§0) + the carrier
read of 2026-07-11 · **Consumes:** DR-FACE-1..6.
