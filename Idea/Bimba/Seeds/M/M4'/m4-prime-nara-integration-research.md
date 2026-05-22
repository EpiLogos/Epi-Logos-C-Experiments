---
coordinate: "M4'"
status: "research-note-interface-only"
date: "2026-05-22"
scope: "M4' integration seams; Nara implementation is separate"
---

# M4' Nara Integration Surface - Interface Research Note

## Local Sources Consulted

- `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md`
- `Idea/Bimba/Seeds/M/M4'/m4-prime-nara-activity-graphiti-instrument.md`
- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`
- `Idea/Bimba/Seeds/S/S5/S5-SPEC.md`
- `Idea/Bimba/Seeds/S/S-AD-HOC-ROADMAP.md`
- `docs/datasets/nara-deep/nodes-full-detail.json`
- `docs/datasets/nara-deep/relations.json`
- `Body/S/S0/epi-lib/include/m4.h`
- `Body/S/S0/epi-lib/src/m4.c`
- `Body/S/S0/epi-cli/src/nara/identity.rs`
- `Body/S/S0/epi-cli/src/nara/oracle.rs`
- `Body/S/S0/epi-cli/src/nara/weights.rs`
- `Body/S/S0/portal-core/src/state.rs`
- `Body/S/S3/graphiti-runtime/src/lib.rs`

## M4' Interface Summary

[[M4']] is the protected personal activity surface for [[Nara]], but this note does not re-spec Nara itself. Nara's full dashboard, journal modalities, oracle engines, transformation processors, and personal Pratibimba behavior are owned by the M4' specs and related Nara work. The interface concern here is narrower: the other M' surfaces must treat M4' as a protected seam that accepts shared harmonic context, records lived activity under privacy rules, emits safe handles and bounded live-state deltas, and routes durable identity change through review.

The central distinction is `identity / transit / activity`. Identity is the stable #4.0 quintessence anchor; transit is the current kerykeion/kairos and harmonic condition; activity is the lived stream of journal entries, daily notes, dreams, highlights, oracle casts, sessions, loops, and review events. Cross-M surfaces may compose these as `Q_composed = normalize(Q_identity * Q_transit * Q_activity)`, but they must not collapse them. Journal text must not mutate identity. Oracle is a privileged service at #4.2 and a typed activity source; it is not the umbrella name for all M4' activity.

The load-bearing M4' runtime hub is #4.4 / #4.4.4.4. Dataset relations confirm that #4.0 manifests in #4.4.4.4, #4.3-5 records to #4.4.4.4, #4.4.4.4 contributes patterns to #4.5, and #4.5 returns to, updates wisdom in, and reseeds #4.0. That means other surfaces should send lived events into protected episodic context first, then let M5'/Epii review decide whether anything deserves canonical promotion.

## Required Inputs And Outputs For M1'-M3' And M5'

M1' -> M4':

- Provide tick, tone, harmonic role, QL position, and route/position context as handles from the shared `MathemeHarmonicProfile`.
- Do not regenerate pitch or route law inside M4' UI, journal parsing, or Graphiti reducers.
- M4' may use M1' context to answer "what position was active when this entry/cast/session happened?"

M4' -> M1':

- Return safe activity trajectory handles, optional `Q_activity` deltas, and reviewed lens/mode suggestions.
- Never return raw journal body, dream text, private oracle interpretation, or protected Graphiti body as route metadata.
- Sonification or replay may use safe profile sequences only; private text must not be encoded into audio without governed local consent.

M2' -> M4':

- Provide resonance72, element, decan, chakra, body-zone, planetary/chakral, and correspondence context as graph/profile law.
- M4' consumes these as inference priors and stamps, not as renderer-local correspondences.
- Elemental law remains fixed: A = Water/Cups/Feeling, T/U = Fire/Wands/Intuition, C = Earth/Pentacles/Sensation, G = Air/Swords/Thinking.
- Bioquaternion weighting must preserve the canonical `[FIRE, WATER, EARTH, AIR] -> [w=EARTH, x=FIRE, y=WATER, z=AIR]` remap before normalization.

M4' -> M2':

- Return derived symbolic observations only with parser state, confidence, provenance, source span handles, privacy class, and decay policy.
- Return `pending-parser` or `unknown` when no real parser exists. The current all-Fire journal stub in `identity.rs` is not production behavior.
- Return body/element/chakra/decan suggestions as advisory signals, not medicine claims or identity facts.

M3' -> M4':

- Provide hexagram, codon, tarot, line-change, rotation, mahamaya address64, and modal inversion as symbolic transcription handles.
- M4' may use them for oracle history, synchronicity recognition, activity tags, and transformation patterning.
- M4' must not define the 64-address law, codon rotation law, or transcription tables locally.

M4' -> M3':

- Return oracle payloads, activity-derived symbolic tags, and accepted activity quaternion deltas through the shared activity state contract.
- Preserve oracle as `kind = oracle` in the broader activity stream, with consent, hygiene, randomness, kairos, and canonical tag provenance.
- Do not treat every journal, dream, or highlight as an oracle cast.

M4' -> M5':

- Send protected episode handles, derived observations, review candidates, identity augment proposals, playbook/curriculum candidates, and source provenance to M5'/Epii.
- M5' receives enough evidence to review, accept, reject, defer, or request revision without receiving public raw private bodies.
- Promotion state must be explicit: `proposed -> reviewed -> accepted|rejected -> applied`.

M5' -> M4':

- Return review decisions, insight records, curriculum/playbook updates, and accepted identity augment instructions.
- Rejected or stale proposals remain historical episode data, not hidden state.
- M5' review can inspect protected evidence only inside governed capability; public Epii surfaces show handles, summaries, and decisions.

Shell 1 preview:

- Shell `1` is the lean personal/world-return preview of M4'/M5'/M0' relevant ground. It may show Flow editor, identity sidebar, DAY/NOW, review alerts, immediate Epii/Nara affordances, and safe coordinate context.
- Shell `1` must not become the full M4' Nara dashboard, full M5' IDE, or full M0' map explorer. The 4+2 subsystem pages provide that depth.
- Shell `1` and Shell `0` must consume the same active coordinate, tick, and `MathemeHarmonicProfile`; only the foreground face changes.

## Privacy, Protection, And Promotion Rules

- Raw journal bodies, dream text, session bodies, oracle interpretations, unreconciled Graphiti episode text, birth data, natal chart internals, MBTI strings, Gene Keys, Human Design payloads, full profile hashes, layer masks, protected bioquaternion state, and private resonance vectors remain protected-local.
- Public/current projections may expose tick, coordinate, safe profile handles, aggregate/count-only layer summaries, resonance/address handles, DAY/NOW/session handles, deposition handles, privacy class, and reviewed public summaries.
- Graphiti is protected episodic memory, not identity source of truth. Runtime code already rejects `identity_mutation = true`; M4' should extend that guard to activity deposits.
- `#4.4.4.4` is the protected Personal Pratibimba anchor. Activity records land there as protected episodes before they can feed review.
- #4.5/M5' is the only route from repeated activity pattern to identity-affecting change. Activity can influence live state immediately through bounded, decayed `Q_activity`; it becomes identity only through reviewed recognition.
- Oracle history is protected Nara activity. Canonical oracle tags may inform medicine/transformation/review, but raw interpretation and question context stay protected unless explicitly exported.
- Hash previews are display/routing derivatives only. The 32-byte BLAKE3 quintessence hash is the canonical identity address and should not be replaced by an 8-character preview.

## Implementation And Test Implications For Cross-M Surfaces

- Cross-M UI and gateway contracts should define an activity envelope with `event_id`, `kind`, DAY/NOW/session, source refs, privacy class, identity ref, `MathemeHarmonicProfile` ref, kairos snapshot, raw body handle, derived observation, state effect, and provenance.
- M1'/M2'/M3' widgets must consume shared profile handles instead of recomputing harmonic, correspondential, or transcription law in the renderer.
- The portal state model should distinguish `Q_identity`, `Q_transit`, and `Q_activity`, even if the current compatibility field is named `live_quaternion`.
- Tests should prove M4' free-text parser absence returns pending/unknown, not fabricated element weights.
- Tests should prove element/nucleotide/suit/function/quaternion remap consistency across M3, M4 identity, oracle, weights, and journal parser outputs.
- Tests should catch any drift between identity-layer elemental profiles, oracle/body weights, tarot/I-Ching payloads, and bioquaternion composition.
- Tests should prove Graphiti activity deposits reject direct identity mutation and route identity-affecting observations to M5' proposals.
- Tests should prove journal, dream, oracle, highlight, and session bodies do not appear in S2 public graph projections, SpaceTimeDB public projections, or public-current profile payloads.
- Tests should prove Shell `1` renders safe Nara/Epii preview data without hydrating protected profile details, journal contents, or raw Graphiti bodies.
- Tests should prove raw service health is separate from bounded agent access. A live Graphiti/Neo4j/Redis/SpaceTimeDB service does not prove Anima, Nara, or Epii may read, write, mutate, or promote.
- Tests should prove M5' review promotion requires accepted review state and source lineage before any identity augment or canonical graph projection is applied.

## Open Research Questions

- What exact Rust type should own `NaraActivityEvent` so M4', Shell `1`, Graphiti, and M5' review share one schema without creating a renderer-local duplicate?
- Should `portal-core` rename `live_quaternion` to `activity_quaternion`, or preserve `live_quaternion` as compatibility while exposing an explicit activity slot in API contracts?
- What is the first production-grade local parser tranche for journal/dream text: deterministic segmentation and safe null symbolic output only, or a bounded classifier with element/lens candidates from day one?
- What are the minimum safe fields for Shell `1` identity display if S5 currently avoids leaking hash previews, while M4' specs allow hash previews as display-only handles?
- How should oracle history be split between protected raw interpretation, safe canonical tags, and reviewed summaries that M5' can cite?
- Which review object shape best preserves proposal lifecycle, source spans, Graphiti episode ids, parser version, confidence, decay, and human/Epii decision evidence?
- How should activity decay be represented so live-state perturbations fade without erasing historical episode provenance?
- What cross-M test fixture can exercise one real flow from M1'/M2'/M3' context -> M4' protected activity deposit -> M5' review decision without mocking core behavior?
