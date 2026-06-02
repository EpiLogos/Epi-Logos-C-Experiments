# Track 05 — M4 Nara Reconciliation

Reconciles [[M4']] across the four corpora. M4 substrate is **one of the strongest in the M' stack**. `Body/S/S0/portal-core/src/personal_identity.rs` (403 LOC) carries real `q_personal`, `ElementalBalance`, `compose_personal_quaternion(Q_identity·Q_transit·Q_activity)`, and `PersonalResonance::from_quaternions(q_personal, q_cosmic)` returning a metric in `[0,1]`. `kernel.rs:486` wires this into `MathemeHarmonicProfile` per tick, and `codon_charge_quaternion` provides `q_cosmic` from the M3 codon — confirming **Cl(4,2) is ONE shared algebra** (`quaternion.rs` is used by both poles), not four. Kerykeion is real via `epi-cli/src/nara/wind.rs:117-148`. `nara_journal.rs`, `m4.h`, `m4.c`, `graphiti-runtime` ("protected-local-episodic-memory" privacy boundary literal), and `gateway/tests/dispatch_contract.rs` (routes `nara.*` through `S4S5DomainAdapter/NaraExtension`) are all landed. The m4-nara extension (contract `2026-06-01.07-T7`) declares the full `NaraDayContainer` + artifact tree + Graphiti episode handles + `ProtectedPersonalFieldInput` shape.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md`, `Idea/Pratibimba/System/Subsystems/Nara/nara-ux-full-m4-branch-update.md`
- Companions: `Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md`, `Idea/Bimba/Seeds/M/M4'/m4-prime-nara-day-episodes-and-oracle-artifacts.md`, `Idea/Bimba/Seeds/M/M4'/nara-m4-0-0-birthdate-encoding-spec.md`, `Idea/Bimba/Seeds/M/M4'/m4-prime-nara-integration-research.md`
- Full row-level reconciliation: `plan.runs/wave-a-m4-reconciliation-matrix.md`

## Cycle 2 Substrate Inheritance

Consume as-is — `personal_identity.rs::PersonalResonance` + `compose_personal_quaternion`; `kernel.rs::MathemeHarmonicProfile.resonance`; `nara_journal.rs`; `m4.h` (772 LOC); `m4.c` (673 LOC); `graphiti-runtime/src/lib.rs` protected-local-episodic privacy literal; `gateway/tests/dispatch_contract.rs` `S4S5DomainAdapter`; `Body/M/epi-theia/extensions/m4-nara` (contract `2026-06-01.07-T7`). Cycle 2 Track 06 owned the journal/day-container/artifact spine. Cycle 3 closes surface, decomposition, and identity-augment lifecycle.

## Tranches

1. **5.1 — Resonance + Conjugate-Form indicator rendering on Nara surface** *(spec-ahead-integration)*

   Extend m4-nara to render resonance (numeric + Major/Minor/Shadow conjugate-form-character) on each `NaraArtifactEnvelope` and day summary. Obey §6.5 — no quaternion-dump, lean identity sidebar only.

   Verification: `pnpm -C Body/M/epi-theia/extensions/m4-nara build`; `grep -n 'ConjugateFormCharacter\|resonance' Body/M/epi-theia/extensions/m4-nara/src/`; new render tests including `pending-resonance` fallback.

2. **5.2 — Nara DayContainer vault path alignment** *(doc-ahead-landing; DR-M4-1 VALIDATED)*

   Canonical path is `${VAULT_ROOT}/Idea/Empty/Present/{day_id}/` (the standing vault convention used by `epi vault day-init`). Both `M4'-SPEC §6.6` (`${VAULT}/Pratibimba/Nara/{day_id}/`) and `m4-nara/src/common/nara-surface.ts::dayContainerPath` (`${vaultRoot}/day/{dayId}/`) are drift to be patched to canonical.

   Verification: `grep -n 'Empty/Present\|dayContainerPath' Body/M/epi-theia/extensions/m4-nara/src/common/nara-surface.ts` reflects canonical path; `grep -n 'Empty/Present' Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md` reflects spec patch; `createNaraArtifact → readNaraDayContainer` round-trip passes on `Idea/Empty/Present/{day_id}/`.

3. **5.3 — Graphiti runtime Nara relations insertion API** *(code-pending-closure)*

   Add `nara_insert_relation(day_id, episode_handle, relation)` API on `graphiti-runtime` writing `:HAS_DAY` / `:CONTAINS_DAILY_NOTE` / `:PART_OF_DAY` / `:NEXT_IN_ARC` edges. Privacy-class enforcement.

   Verification: `cargo check -p graphiti-runtime`; `cargo test -p graphiti-runtime --test nara_relations`; `grep -rn 'HAS_DAY\|NEXT_IN_ARC' Body/S/S3/graphiti-runtime/src/`.

4. **5.4 — `(q_b, q_p)` Bimba/Pratibimba decomposition of Q_composed** *(code-pending-closure)*

   `decompose_bioquaternion(q_composed) -> (q_b, q_p)` on `personal_identity.rs`. Unit test proves `(q_b, q_p)` is a **read of Q_composed**, not an independent input. Protected-local rendering hook on Theia.

   Verification: `cargo check -p portal-core`; `cargo test -p portal-core personal_identity::bioquaternion_decomposition`.

5. **5.5 — Psychoid-cymatic field solver + audio-cymatic driver (minimum-viable)** *(code-pending-closure)*

   New `portal-core::psychoid_cymatic` module consuming `MathemeHarmonicProfile.audio_octet[8]` / `nodal_quartet[4]`. Emits **opaque renderer handle**, never raw field body via S3. Option-F vs Option-S decision point.

   Verification: `cargo check -p portal-core`; `test -d Body/S/S0/portal-core/src/psychoid_cymatic` OR `grep -rn 'psychoid_cymatic' Body/S/S0/portal-core/src/`; `grep -rn 'psychoid\|cymatic' Body/M/epi-theia/extensions/m4-nara/src/`.

6. **5.6 — M4-0 birthdate encoding + six-layer identity branch** *(code-pending-closure)*

   Birthdate-encoding module (mod6/inverse, mod12 MEF, lens-square, L2' elemental extraction, caps, evidence paths) in portal-core. **Absent layers as "pending", not fabricated** (Jungian/Gene Keys/Human Design return pending when not supplied).

   Verification: `cargo check -p portal-core`; `cargo test -p portal-core m4_0_0_birthdate_encoding`; absence test confirms pending status for unsupplied layers.

7. **5.7 — q_personal baseline + axis-lock + identity-hash + Vāma policy + 0/1 polarity** *(contradiction-decision; routes to DR-M4-2)*

   Single decision-register row resolving `M4'-SPEC §7.13`'s five interrelated open questions: (1) `q_personal` Kerykeion-only baseline vs integrated q_Nara; (2) Cl(4,2) axis order `[w=Earth, x=Fire, y=Water, z=Air]` vs alternates; (3) identity-hash migration path PASU/BLAKE3 → quaternionic signature; (4) Vāma classifier policy (internal-mandatory but user-visible-opt-in vs contemplative-offering-only); (5) personal cymatic 0/1 polarity (cross-links Tranche 11.1 DR-TS-1).

   Verification: DR-M4-2 committed; `grep -n 'axis_order\|q_personal_baseline' Body/S/S0/portal-core/src/personal_identity.rs` reflects lock.

8. **5.8 — Period reading trajectory reconstruction** *(doc-ahead-landing)*

   `period_reading(day_range)` API on `nara_journal.rs` reconstructing Q_composed trajectory from Graphiti episodes + Chronos/Kairos handles + history. Preserves privacy. Emits Hopf-projected trajectory handle for psychoid renderer.

   Verification: `cargo check -p portal-core`; `cargo test -p portal-core nara_journal::period_reading`; protected-local invariant test confirms no raw bodies returned.

9. **5.9 — Identity-augment proposal lifecycle (M4 side)** *(spec-ahead-integration)*

   Adapter API + state machine `proposed → reviewed → accepted|rejected → applied` on `personal_identity.rs`. **Only `applied` mutates Q_identity.** Theia surface hook surfaces pending proposals read-only.

   Verification: `cargo check -p portal-core`; `cargo test -p portal-core personal_identity::proposal_lifecycle`; contract test confirms only `applied` verdict mutates `Q_identity`.

10. **5.10 — Connectivity-vs-bounded-access discriminator** *(code-pending-closure)*

    Gateway contract test asserting live Graphiti / Neo4j / Redis / SpaceTimeDB ping is **not** a grant of bounded access for `nara.*` methods.

    Verification: `cargo test -p gateway --test dispatch_contract` (extended); `grep -rn 'bounded_access\|connectivity_check' Body/S/S3/gateway/src/` returns hits.
