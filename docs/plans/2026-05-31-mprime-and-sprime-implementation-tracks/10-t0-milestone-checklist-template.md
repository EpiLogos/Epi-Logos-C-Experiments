# Track 10 Milestone Checklist Template

Use this template for every Track 10 milestone and for any Track 01-09 tranche that claims cross-track integration readiness.

## Milestone Header

- **Milestone id:**
- **Owner track:**
- **Dependent tracks:**
- **Source spec anchors:** link exact sections, files, tests, and ADR ids.
- **Consumed ADRs:** list `ADR-T10-*` ids and current status.
- **Harness services:** list service ids from [[10-t0-local-harness-topology.json]].

## Required Identifiers

| Identifier | Value or blocker | Evidence |
| --- | --- | --- |
| `profile_generation` |  |  |
| `selected_coordinate` |  |  |
| `session_key` |  |  |
| `day_now` |  |  |
| `privacy_class` |  |  |
| `s2_anchor` |  |  |
| `s3_deposition_handle` |  |  |
| `s5_review_evidence_id` |  |  |
| `bridge_readiness` |  |  |

## Readiness Report

| Surface or substrate | Readiness state | Blocker id | Fallback visible to user/agent |
| --- | --- | --- | --- |
| S0 profile |  |  |  |
| S2 graph |  |  |  |
| S3 stream |  |  |  |
| S5 review/evidence |  |  |  |
| `/body` |  |  |  |
| Theia `/pratibimba/system` |  |  |  |
| M extensions |  |  |  |
| Integrated plugins |  |  |  |
| M5-4 agents |  |  |  |

## Verification Commands

Record real commands and their outputs. A captured fixture may support a test, but live-behavior claims require the relevant local service or repository-provided harness.

```bash
# command 1

# command 2
```

## Acceptance Gate

- **Pass criteria met:** yes/no.
- **Mock-free proof:** describe the real service, persisted data, generated fixture, or live harness that produced the evidence.
- **Privacy audit:** confirm protected Nara bodies, private profile hashes, raw identity data, and unrestricted gateway methods did not cross the boundary.
- **Degraded behavior:** list each missing upstream dependency and the typed readiness shown instead of placeholder content.
- **Next unblocked tranche:** name the smallest follow-on task and its required owner-track evidence.
