# M0 Anuttara Tunable Audit Triage

This companion records the manual adjudication of exactly 25 scanner findings. The generated `tunable-audit-report.md` remains executable output and is not hand-edited. A held finding is not schema law; it requires named authority or a representable schema shape before promotion.

| # | Finding | Disposition | Warrant | Schema result |
|---:|---|---|---|---|
| 1 | `6` at `src/engine.c:42` | Structural | Default torus traversal spans the six QL positions. | None. |
| 2 | `6` at `src/engine.c:158` | Structural | The walk-mode dispatcher preserves the same six-position torus cardinality. | None. |
| 3 | `20` in `M4_LENS_MEF_THRESHOLD` at `src/m4.c:219` | Hold with rows 4-8 | One ordered six-value lens LUT, not six independent scalar policies. | None; `u32_lut` cannot honestly encode this array today. |
| 4 | `40` in `M4_LENS_MEF_THRESHOLD` at `src/m4.c:219` | Hold with rows 3, 5-8 | Member of the same ordered lens LUT. | None. |
| 5 | `60` in `M4_LENS_MEF_THRESHOLD` at `src/m4.c:219` | Hold with rows 3-4, 6-8 | Member of the same ordered lens LUT. | None. |
| 6 | `80` in `M4_LENS_MEF_THRESHOLD` at `src/m4.c:219` | Hold with rows 3-5, 7-8 | Member of the same ordered lens LUT. | None. |
| 7 | `100` in `M4_LENS_MEF_THRESHOLD` at `src/m4.c:219` | Hold with rows 3-6, 8 | Member of the same ordered lens LUT. | None. |
| 8 | `120` in `M4_LENS_MEF_THRESHOLD` at `src/m4.c:219` | Hold with rows 3-7 | Member of the same ordered lens LUT. | None. |
| 9 | `200` safety threshold at `src/m4.c:475` | Hold | Runtime policy-shaped, but M4 authority and a named consumer-facing policy are absent. | None. |
| 10 | `0.5f` verifier threshold at `include/m0_verifier.h:42` | Hold | Runtime policy-shaped, but Track 38 does not name a canonical schema key. | None. |
| 11 | `4u` conjugate depth at `include/m0_verifier.h:55` | Hold | The public header default is 4 while Track 38 canon specifies 3; promotion would conceal a contract conflict. | None pending canon resolution. |
| 12 | `4` in `M4_KAIROTIC_DEFAULT_TTL_NS` at `include/m4.h:296` | Hold with rows 13-14 | One four-hour TTL expression, not three independent knobs. | None pending a canonical TTL key. |
| 13 | `3600ull` in `M4_KAIROTIC_DEFAULT_TTL_NS` at `include/m4.h:296` | Hold with rows 12, 14 | Unit conversion inside the same four-hour TTL expression. | None. |
| 14 | `1000000000ull` in `M4_KAIROTIC_DEFAULT_TTL_NS` at `include/m4.h:296` | Hold with rows 12-13 | Nanosecond conversion inside the same four-hour TTL expression. | None. |
| 15 | `256u` symbolic-protein capacity at `include/m4.h:722` | Migrated | The existing registry already declares the bounded session capacity. | Existing `nara.session.protein_capacity`; no duplicate. |
| 16 | `24u` at `include/m1.h:347` | Structural | `VORTEX_5X_CEILING` is canon-backed M1 vortex mathematics. | None. |
| 17 | `0.8660254f` at `src/m1.c:30` | Structural | Coefficient of canonical `RING_QUATERNION_LUT`. | None. |
| 18 | `0.5f` at `src/m1.c:30` | Structural | Coefficient of canonical `RING_QUATERNION_LUT`. | None. |
| 19 | `0.5f` at `src/m1.c:31` | Structural | Coefficient of canonical `RING_QUATERNION_LUT`. | None. |
| 20 | `0.8660254f` at `src/m1.c:31` | Structural | Coefficient of canonical `RING_QUATERNION_LUT`. | None. |
| 21 | `0.5f` at `src/m1.c:33` | Structural | Coefficient of canonical `RING_QUATERNION_LUT`. | None. |
| 22 | `0.8660254f` at `src/m1.c:33` | Structural | Coefficient of canonical `RING_QUATERNION_LUT`. | None. |
| 23 | `0.8660254f` at `src/m1.c:34` | Structural | Coefficient of canonical `RING_QUATERNION_LUT`. | None. |
| 24 | `0.5f` at `src/m1.c:34` | Structural | Coefficient of canonical `RING_QUATERNION_LUT`. | None. |
| 25 | `0.8660254f` at `src/m1.c:35` | Structural | Coefficient of canonical `RING_QUATERNION_LUT`. | None. |

## Separate §7.3 Promotion

`pleroma.session_active_window_minutes` is declared in `portal-core/tunable-schema/pleroma.tunable.toml` with default 60. It is a proven Track 38 §7.3 candidate outside this C scanner queue. This tranche declares schema metadata only; runtime Pleroma consumption remains separate work.
