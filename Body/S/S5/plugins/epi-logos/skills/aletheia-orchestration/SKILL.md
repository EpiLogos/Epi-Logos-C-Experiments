# Aletheia Orchestration — Dispatch Contract

## Purpose

Aletheia is the six-facet techne-guardian dispatch system: Anansi (CF0), Janus (CF1), Moirai (CF2), Mercurius (CF3), Agora (CF4), and Zeithoven (CF5) are facet-shaped by design intent. Per DR-M5-1, **Anima is the dispatcher and the only synthesis authority.** The six guardians disclose angles; they never conclude.

This skill defines the veto primitive — the formal recognition of one-sidedness under Klein topology.

## FacetReturn Type

Every dispatched Aletheia guardian returns one of:

```ts
type FacetReturn =
  | { kind: 'disclosure'; facet: FacetId; angle: string; evidence: Citation[] }
  | { kind: 'veto'; facet: FacetId; reason: string; what_is_missed: string };
```

## Veto Protocol

A `veto` blocks the current synthesis from being written as the recognition. When Anima receives a veto, it may:

1. **Re-dispatch** — re-dispatch the facet-set with the veto noted, so other facets can address what was missed.
2. **Defer** — defer synthesis to the next return. The orbit lengthens — coupled to `c_3_response_orbit` in Khora flow-watcher (Track 19.11).
3. **Escalate** — escalate to the user as a `retrospective-surfacing` highlight (Track 11.11), explicitly marked "open question — the facets are not converging."

## Dispatch Rules

1. **Every dispatched facet discloses an angle; never concludes.** A facet provides a perspective, not a verdict.
2. **Anima is the only synthesis authority.** No facet may produce an independent report or claim to speak for the whole. Psyche-aspect rendering (Sophia for wisdom-integration, Nous for intellectual ground, Mythos for narrative, etc.) is Anima's authorial register choice — not separate dispatch authorities.
3. **Any facet may return `veto` instead of `disclosure`.** A veto is the formal recognition that the facet sees something the current angle-set is missing.
4. **Veto handling follows the three-path protocol** (re-dispatch / defer / escalate) based on `c_3_klein_weighting` (12.18).
5. **Veto patterns persist** in `CONTINUATION.md` and the `aletheia_veto_log` SpacetimeDB table so subsequent runs see recurring gaps.
6. **Miscalibration threshold:** 3+ vetoes from the same facet in a single session → emit `aletheia.dispatch.miscalibrated` observability event. The dispatch logic is flagged as miscalibrated for that facet — the weighting should be adjusted before the next dispatch.

## Veto Persistence

Veto patterns are stored in the `aletheia_veto_log` SpacetimeDB table:

| Field | Type | Description |
|-------|------|-------------|
| veto_id | UUID | Primary key |
| facet | FacetId | The vetoing facet (CF0–CF5) |
| session_id | String | Session identifier |
| reason | String | Why the veto was issued |
| what_is_missed | String | What the facet sees as missing from the current angle-set |
| timestamp | Timestamp | When the veto was issued |
| resolution | VetoResolution | How the veto was resolved (redispatched/deferred/escalated/pending) |

Anima's dispatch logic reads `c_3_klein_weighting` (12.18) to select the guardian-set. Recurring veto patterns from prior sessions inform facet weighting for future dispatches.

## Observability

- `aletheia.veto.issued` — emitted when any facet returns a veto.
- `aletheia.synthesis.blocked` — emitted when a veto blocks the current synthesis.
- `aletheia.dispatch.miscalibrated` — emitted when a single facet has issued 3+ vetoes in a session, flagging the dispatch weighting as needing recalibration.
- `aletheia.veto.resolved` — emitted when a veto is resolved (redispatched, deferred, or escalated).

## Constitutional Invariants

Per DR-M5-1:
- Anima is the dispatcher and the only synthesis authority.
- The six Aletheia guardians are techne-facets, not peer agents.
- Under Klein topology, no single facet can speak for the whole — the whole is non-orientable.
- The veto is a feature, not a failure: it is the system's recognition of its own one-sidedness.
