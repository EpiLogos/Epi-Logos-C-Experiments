# Track 09.T0 — Mediation Contract Preflight And VAK Baseline

This directory contains the **contract ledger** for Track 09 (Agentic Mediation And Operational Capacities) preflight tranche T0.

## Primary artifact

- [`track-09-preflight.json`](./track-09-preflight.json) — machine-readable contract ledger. Every inventoried surface (CLI, agent contract, upstream track hook, capacity route profile) is named with:
  - `owner` (which upstream track owns the field/method)
  - `readiness` (`authoritative` / `transitional` / `blocked`)
  - `privacy_gate` (`public_current` / `session_scoped` / `protected_local` / `review_gate` / `forbidden_to_agents`)
  - `is_prose_assumption` (true only where a Track 09 plan body names something but no live implementation backs it; these are also listed in `readiness_blockers`)

A downstream implementer in 09.T1 should consume the JSON directly. This markdown is orientation only.

## VAK baseline summary

- **Governance lead for Track 09:** Sophia (across Anuttara, Paramasiva, Parashakti, Mahamaya, Epii-on-Epii)
- **Dispatch function:** Anima (preserved across all six profiles)
- **Nara exception:** Anima-primary with five Anima gates (admission / refresh-trigger / deployment / rollback / DPO-trigger); Sophia is secondary for cross-subsystem coherence
- **User-final validation gate:** required for load-bearing changes across all six profiles

The baseline VAK address observed for each capacity profile is recorded in `evidence/vak-<profile>.json`. The current `epi agent vak evaluate` heuristic returns identical VAK addresses for five of six representative tasks — flagged as readiness blocker `vak.profile-aware-mapping`.

## Evidence

All raw CLI JSON outputs and the verification summary live in [`evidence/`](./evidence/). To re-run:

```bash
~/.cargo/bin/epi agent vak evaluate "<task text>" --json
~/.cargo/bin/epi agent roster list --json
```

Representative task texts (drawn from the Track 09 plan body for each capacity profile) are recorded in `track-09-preflight.json#vak_baseline_for_track_09.baseline_invocations[*].task_text`.

## Verification result

| Assertion | Result |
|---|---|
| All six capacity profiles return CPF/CT/CP/CF/CFP/CS | PASS |
| `epi agent roster list --json` exposes epii, anima, aletheia | PASS |
| `Body/S/S5/epii-agent/agent-contract.json` has nonempty `gateway_methods` | PASS (11 methods) |
| `Body/S/S5/epii-agent/agent-contract.json` declares `forbidden_authority` | PASS (3 entries) |
| No required field is represented only by a prose assumption | PASS — 4 prose-only items are explicitly flagged as `readiness_blocker` rather than recorded as ready |

## Readiness blockers carried into Track 09 T1+

See `track-09-preflight.json#readiness_blockers` for the full list. The most consequential for T1 sequencing:

- `vak.profile-aware-mapping` — T1 must build profile-aware VAK or treat the heuristic as deterministic baseline
- `track-09.dispatch-tool-variant-bindings-incomplete` — five of six dispatch-tool variants still need gateway/library bindings
- `aletheia.agent-contract-missing` — no `aletheia-agent/agent-contract.json` exists; T2 governance metadata is blocked until it lands
- `sophia.governance-lead-metadata-missing` — capability matrix encodes Sophia as a constitutional leaf; T2 must lift her to governance lead without breaking three-way parity
- `track-01.t7-bounded-capabilities-not-landed` — bounded agent capabilities allowlist depends on Track 01 T7
- `track-04.promotion-dry-run-only` — non-dry-run promotion stays blocked
- `track-05.agentic-control-room-host-missing` — T9 acceptance blocked until host lands
