---
coordinate: "M1-3'"
status: "designed-2026-07-11 (awaiting build; tranches in §8)"
created: "2026-07-11"
authored_by: "Claude (Fable 5), derived from the M-level substrate per the Architect's challenge; ownership law per Architect dialogue 2026-07-11"
depends_on:
  - "[[M1-ARCHITECTURE]] (§T2.11 Spanda dual-oscillator, landed 2026-07-08)"
  - "[[epi-logos-kernel-spec]] (the matheme tick shape: eight elements, twelve epogdoon-steps)"
  - "[[M1-2-ANANDA-VORTEX-ARCHITECTURE]] (§6 tick choreography, §8.6 accessibility)"
  - "[[M'-ENGINE-FACES-ONTOLOGY-2026-07-11]] (DR-FACE-7; 22.T22.1 spine-gap ruling)"
  - "[[M'-SURFACE-REENVISIONING-2026-07-01]] (DR-FACE-2 boot = supervise)"
---

# M1-3' Spanda Transport — Holding and Walking the One Clock

> **The question this document answers** (Architect, 2026-07-11): the tick-transport
> gap behind Tranche 22.T22.1 "needs to be approached from the newly founded tick
> basis in the co-oscillation of 0/1 and 1/0... all mysteries should be revealed and
> sorted here." And the constraint that sorts them: *do not conflate the raw
> underlying tick — essential to the Paramaśiva engine and by extension the
> M1-M2-M3 audio-philosophy engine — with a health/heartbeat tick for the gateway,
> which is just a client portal.* If the two connect at all, the portal's read is
> **derived from, never 1:1 with**, the spanda oscillation.

## 0. Why this document — the mystery and its two conflations

Tranche 22.1 (Spanda walk navigator) stalled because its driving capability
(`requestScrubToTick`) never existed. Investigating *why* it never existed exposed
two conflations sitting in the cycle-3 language, and this document exists to keep
them sorted for every agent who touches transport:

**Conflation 1 — the engine's clock vs the portal's pulse.** The gateway emits
`profile.update` at 1 Hz (`spawn_profile_heartbeat`,
`Body/S/S0/epi-cli/src/gate/server/mod.rs:73`). That heartbeat is a *portal*
concern: liveness, staleness detection, client sync. It is not — and must never
become — the engine's clock. Today the heartbeat derives its projection from
**wall-clock ms + a generation counter** (`from_clock_tick(now_ms, generation)`),
which contradicts the landed T2.11 canon: *"`tick12` is a readout of continuous
cycle phase; nothing re-grounds on it."* The oscillation exists in the kernel as
mathematics (`spanda.rs::tick12_readout(cycle_phase)`), but no one owns the phase
as *state* — which is exactly why it could be neither held nor walked.

**Conflation 2 — display-scrub vs engine-walk.** The word "scrub" appears across
the cycle-3 surfaces meaning two different acts:

- **Display-scrub** — a face replaying *already-received* profile records.
  Landed: the carrier's modulation engine owns pause/scrub over a 720-tick ring
  of received frames ([[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]] §6.7 +
  carrier foothold; DR-TS-6 "tick pause/scrub always permitted"; §8.6
  accessibility contracts). This is legitimate today: it replays the one clock's
  *history*, invents nothing, affects only the local view.
- **Engine-walk** — commanding the organism's own phase: holding the traversal,
  walking to a chosen step, stepping through the matheme. This affects *every*
  subscriber (faces, agents, audio) because there is one organism and one clock.
  This is the capability that never existed, and the subject of this document.

**Naming law:** these are never both called "scrub." A face scrubs its view;
only the kernel walks the organism.

## 1. The ground (verified in substrate, 2026-07-11)

- **The tick floor is a continuous field.** T2.11 (landed 2026-07-08; C ground
  `epi-lib/include/m1.h:404` block, Rust surface `portal-core/src/spanda.rs`;
  kernel-truth green): the (0/1)/(1/0) dual counter-phase oscillation is an HKB
  relative-phase field, bistable at φ=0 (`=`) and φ=π (`≠`). *"The field is
  where the twelvefold flowers before the ring reads it out."*
- **`tick12` is a readout, not a counter.** `tick12_readout(cycle_phase: f64) → u8`.
  The twelve stops of any navigator are the twelve epogdoon-steps of the matheme's
  own traversal ([[epi-logos-kernel-spec]]: six descent + six ascent helix;
  Klein-flip at 5→6, Möbius-return at 11→0 — structural facts, already emitted
  as the `KleinFlipEvent` union).
- **Two involutions are the canonical jumps** (Klein four-group): reflection
  `spanda_invert` #(n)=11−n — traversal-reversal, the SU(2) antipode on
  `RING_QUATERNION_LUT`; half-turn `spanda_half_turn` n↦(n+6) mod 12 — the
  antiphase pole-swap. *Every `#` names which involution it means* — including
  in the transport API.
- **Three rates are distinct and stay distinct** (T2.11 honesty fence): the
  ~1.5–4.0 Hz oscillator band (config-anchored, centre ≈2.5 Hz) ≠ the 1 Hz
  portal heartbeat ≠ the UI framerate.
- **Determinism is native.** Profile content is *derived* from phase
  (`from_tick`); walking to a phase re-derives the same harmonic content. No
  event-log replay machinery is needed at the engine level, ever.

## 2. Ownership law — the engine owns the phase; the portal samples it

**The phase is kernel-owned state in portal-core** — never gateway-loop state,
never renderer state. Concretely: a `SpandaPhaseAnchor` in the kernel:

```
SpandaPhaseAnchor {
    epoch_ms:  u64,      // when the anchor was set (wall time, for evaluation only)
    phase0:    f64,      // cycle phase at the epoch
    rate_hz:   f64,      // config-anchored oscillator rate (band-checked, never fake)
    mode:      Flowing | Held | Walking,
    direction: Forward | Reflected,   // Reflected IS spanda_invert, named
}
```

**Lazy evaluation — no loop anywhere.** Phase-at-instant is *computed on read*:
flowing → `φ(t) = φ0 + 2π·rate·(t − epoch)`; held → `φ(t) = φ0` for all t;
walking → set `φ0`, mode returns to Held (or Flowing on release). The
oscillation is a mathematical object with an anchor, evaluated at whatever
grain the reader needs — audio engine at sample rate, UI at 60 fps, portal at
1 Hz, agents on demand. **Nothing polls at oscillation grain because nothing
polls at all.** This is the Architect's "derived from but not 1:1" made
structural: one anchor, many read-grains.

**The portal stays a portal.** The 1 Hz heartbeat keeps its liveness/staleness
job and its cadence. What changes is its *content*: `tick12`/`degree720` in the
projection derive from the kernel anchor instead of raw wall-clock. `now_ms`
stays for timestamps and the kairos sky — **the sky is world-owned and never
holds**: a held matheme under a still-moving sky is honest; a frozen sky would
be a lie. The `generation` counter stays a portal-owned emission counter,
monotonic, advancing even while held (same phase content, new generations) —
the carrier's monotonic-generation gate survives untouched.

**Audio-engine migration path (named now so the abstraction sits right).** When
the M1' generative-audio engine lands, the *audio callback* becomes the true
sample-accurate home of the phase, and the anchor authority migrates INTO it —
kernel and portal then read from the audio thread's anchor. The
`SpandaPhaseAnchor` interface is defined kernel-side today precisely so that
migration changes the *implementor*, not the contract. The portal never owns it
in either era.

## 3. The walk family — transport as kernel acts through the portal

Gateway methods (S0 membrane; names final at contract-landing, family fixed):

| Method | Kernel act | Notes |
|---|---|---|
| `m1.spanda.hold` | freeze anchor at current φ | broadcast transport event |
| `m1.spanda.release` | resume Flowing from held φ | re-anchors epoch |
| `m1.spanda.walk_to` | set φ0 to the phase whose readout is tick N (or raw φ) | deterministic re-derivation |
| `m1.spanda.step` | advance/retreat one epogdoon-step | reverse direction IS `spanda_invert` (named `reflect: true`) |
| `m1.spanda.half_turn` | jump to the antiphase pole-swap point (n+6 mod 12) | the second involution, named |

Registration follows the proven 16.T16.14 chain: contract constant →
`METHOD_NAMES` → dispatch_plan row → S0 dispatch arm → `parity.rs` → gateway
tests; the method leaves `s3_only_methods()` when its arm lands. Verification
class **W** (live-wire): a real spawned gateway must demonstrate hold → tick12
constant across generations → release → tick12 flows again.

**One organism, no private timelines.** Transport acts affect the one broadcast
— every face and every agent sees the organism held or walked (the heartbeat
comment already carries the law: *"renderers may not run a private clock"*). A
private forked timeline would be a second clock; forbidden. The study-mode for
a single surface is display-scrub (§0), which needs no kernel act.

## 4. The wire — the anchor rides, the fraction dissolves

`profile.update` gains a public-safe spanda block:

```
spanda: {
    epochMs, phase0, rateHz,            // the anchor — a few numbers, not a stream
    mode: 'flowing' | 'held' | 'walking',
    direction: 'forward' | 'reflected',
    tick12,                              // readout at emission, for cheap consumers
}
```

Clients derive `tick12 = readout(φ(now))` and the **intra-tick fraction**
locally from the shared anchor, at any framerate, between heartbeats, with zero
extra traffic. The old ask for a `slerpFraction` emission **dissolves**: the
fraction was always the continuous phase the tick flowers from; emit the anchor
and the renderer's slerp becomes a pure function of it (15.9's primitive
unchanged — it consumes the anchor instead of inventing an animation variable).
Evaluating the shared anchor locally is not a private clock — it is the one
clock read locally, exactly as everyone reading a time standard shares one
time. What stays forbidden: a renderer inventing a rate or advancing an anchor
itself. Disconnection → anchor stale → the provenance store's existing
staleness surface.

**Transport events push immediately** (hold engaged, walked-to-N) — the portal
relays engine events without waiting for the next heartbeat sample.

## 5. The face — 22.T22.1 re-sorted

With the two transports named, the Spanda walk navigator sorts cleanly under
DR-FACE-7:

- **Display-scrub half: fate A/B now** — the modulation engine already owns
  pause/scrub over received frames; the navigator face renders the twelve
  epogdoon stops, the intra-tick fraction bar (anchor-derived), and next-event
  preview (Klein-flip 5→6, Möbius-return 11→0) over what the bus already
  carries.
- **Engine-walk half: fate C until §3 lands** — the hold/walk/step/half-turn
  buttons appear only when the walk family exists on the bridge; until then the
  face ships without them (honest absence, no disabled placeholders pretending
  at capability).
- The two involution buttons are labelled as what they are — reflection `#` and
  half-turn — the Klein four-group as the button set. The matheme is the
  transport bar.

## 6. Alignment ledger — cycle-3 surfaces, read through this document

| Surface | Its claim | Status after this doc |
|---|---|---|
| [[INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE]] §6.7 + carrier foothold | determinism + "scrubbing (pause + scrub_to_tick)" via single-primitive slerp; engine-owned 720-ring pause/scrub | **display-scrub** — correct as landed; engine-walk is separate and additive |
| [[M1-2-ANANDA-VORTEX-ARCHITECTURE]] §8.6 | played-torus accepts pause/scrub, replays deterministic state | **display-scrub** — annotated; engine-walk pointer added |
| [[INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE]] §8.6 | scrub replays handles, never unlocks past raw bodies | law holds for BOTH transports — protected-local is time-invariant under walk too |
| 15-recon 15.9 | quat_slerp choreography; "capability added through 15.9 if not already there" | slerp consumes the anchor; the capability is the §3 walk family, not a 15.9 rider |
| 22-recon 22.1 | `bridge.requestScrubToTick(tick)` drives profile-bus replay | superseded by §3/§5 — the name conflated the two transports |
| DR-TS-6 | tick pause/scrub always permitted | holds; refined — display-scrub always local-free; engine-walk always broadcast |
| [[m123-modal-resonator-bell-kernel-spec]] `strikeRoute: 'manual-scrub'` | a strike source label | unchanged — it names display-scrub interaction |
| M5-ARCHITECTURE §"pause/scrub per 15.9" | affordance reference | reads through this doc's naming law |

## 7. What this unblocks

Engine-walk is the strongest pedagogical affordance in the M1' plan — the
matheme held still and studied mid-phrase, the instrument's teaching mode
([[m1-prime-paramasiva-instrument]]: "Paramaśiva teaches QL by letting you play
it"). It also gives agents a contemplative read: an agent can hold the organism
at a step and read every face's projection of that one phase.

## 8. Build tranches (law-only source; absorb into the rerun ledger per the 40.T0 pattern)

1. **SPANDA-T1 — the anchor lands (kernel).** `SpandaPhaseAnchor` in
   portal-core: lazy evaluation, mode/direction, band-checked rate from
   `[ml.m1_paramasiva]` config; `from_tick`-path derives tick12/degree720 from
   the anchor; heartbeat samples it (`from_clock_tick` retires its wall-clock
   tick derivation; wall-clock stays for timestamps/kairos). Class K+W.
   Verify: kernel-truth extension (anchor evaluation determinism; held ⇒
   constant readout across evaluations) + live-wire (heartbeat carries the
   anchor block).
2. **SPANDA-T2 — the walk family (portal).** §3 methods through the
   16.T16.14 registration chain, involutions named in the API. Class W.
   Verify: dispatch_contract cross-walk + live-wire hold/walk/release
   round-trip (tick12 constant while held across advancing generations).
3. **SPANDA-T3 — the wire block + transport events.** §4 emission; carrier
   bridge types mirror (`bridge/types.ts`); immediate transport-event push.
   Class W. Verify: live-wire capture shows the spanda block + a hold event
   arriving between heartbeats.
4. **SPANDA-T4 — the navigator face (carrier).** §5: twelve-stop strip +
   fraction bar + next-event preview over the anchor (display-scrub half);
   walk buttons appearing on capability presence (engine-walk half). Class UF.
   Verify: Playwright — hold via the face, watch the strip freeze while
   generations advance, release, watch it flow; involution buttons labelled.
