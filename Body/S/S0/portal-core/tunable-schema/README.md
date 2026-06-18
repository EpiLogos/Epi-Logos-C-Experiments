# Tunable Schema Authoring Guide

This directory holds the canonical tunability schema for the Epi-Logos system.
Each `*.tunable.toml` file declares a set of related knobs with full metadata.
See [Track 38 spec](../../../../../Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/38-tunability-surface-architecture.md).

## File Naming

`{owning-subsystem-or-carrier}.tunable.toml`, for example `nara_session.tunable.toml`,
`mythos.tunable.toml`, `hen.tunable.toml`, `aletheia.tunable.toml`, or
`cross.tunable.toml`.

## Per-Knob Metadata

```toml
[[tunable]]
key = "subsystem.scope.knob_name"
type = "u32"
default = 256
residency_class = "freeze-on-session-start"
scope_class = "global"
tuning_risk_class = "A"
ml_trainable = false
privacy_class = "non-sensitive"
structural_invariant = false
owning_subsystem = "M4"
owning_carrier = "anima"
authoritative_doc = "Tranche 5.26"
warrant_constants = []
description = "..."

[tunable.range]
min = 16
max = 4096
```

Supported `type` values: `bool`, `u32`, `u64`, `f32`, `string`, `enum`,
`f32_triplet`, `string_array`, and `u32_lut`.

## Class-Chooser

### `residency_class`

Use `freeze-on-session-start` by default, especially when a knob affects
determinism within a session. Use `restart-required` for loaded model weights,
agent harness composition, or constraint-registry registration. Use `hot-reload`
only for changes with no determinism dependency.

### `scope_class`

Use `per-pasu` when the value depends on PASU-bound rhythm, preference, or
identity. Use `per-session` only for session debug overrides. Otherwise use
`global`.

### `tuning_risk_class`

| Class | When |
| --- | --- |
| `A` | Structural-adjacent, ML-trainable, voice-template, privacy-touching, or user-visible. |
| `B` | Cosmetic or bounded presentation behavior with rollback. |
| `C` | Purely internal thresholds, cache TTLs, and existing Aletheia-pattern knobs. |

### `ml_trainable`

Set `true` only if the knob can be learned from accumulated corpus plus user
feedback. If PASU-derived data contributes to the training signal, the
`privacy_class` must be `local-only`.

### `privacy_class`

| Class | When |
| --- | --- |
| `local-only` | PASU-bound raw content derived; never crosses PASU boundary. |
| `vector-derived` | Derived from already-vectorized signal; may train on cloud opt-in with consent. |
| `non-sensitive` | No privacy implication. |

### `structural_invariant`

Set `true` only for structural-canon constants such as codon cardinalities,
`EPOGDOON_NUM/DEN`, `RESONANCE_DIM=72`, `QUATERNION_AXIS_ORDER`,
`M3_TAROT_CODON_MAP`, or `M2_PLANET_LUT`. Invariant knobs must include
`warrant_constants = [...]` naming the locking constants and an
`authoritative_doc` citation. The verifier rejects tuning proposals targeting
structural-invariant knobs.

## Validation

Run from project root:

```bash
cargo test -p portal-core --test tunable_registry_load
cargo test -p portal-core --test tunable_registry_validate
cargo test -p portal-core --test tunable_full_registry
```
