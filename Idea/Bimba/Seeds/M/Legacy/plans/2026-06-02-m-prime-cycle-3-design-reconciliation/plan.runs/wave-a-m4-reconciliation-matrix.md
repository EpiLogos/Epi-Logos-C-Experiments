# Wave-A M4 (Nara) — Cycle-3 Four-Way Reconciliation Matrix

Owner: wave-a-m4
Cycle: M' cycle 3 — design reconciliation
Scope: M4 (Nara) — personal-Pratibimba, day-episodes, oracle artifacts, personal quaternion, psychoid cymatic field, Graphiti integration, dialogic voice governance.

## Sources Consulted

- Corpus 1 (UX intent): `Idea/Pratibimba/System/Subsystems/Nara/nara-ux-full-m4-branch-update.md` (1117 LOC; sections 1–14)
- Corpus 2 (M' Seed authority):
  - `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md` (315 LOC, full read)
  - `Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md` (headings + §§4–9 surveyed)
  - `Idea/Bimba/Seeds/M/M4'/m4-prime-nara-day-episodes-and-oracle-artifacts.md` (heading scan)
  - `Idea/Bimba/Seeds/M/M4'/nara-m4-0-0-birthdate-encoding-spec.md` (heading scan)
  - `Idea/Bimba/Seeds/M/M4'/m4-prime-nara-integration-research.md` (heading scan)
- Corpus 3 (substrate truth):
  - `Body/S/S0/epi-lib/include/m4.h` (772 LOC) + `Body/S/S0/epi-lib/src/m4.c` (673 LOC)
  - `Body/S/S0/portal-core/src/personal_identity.rs` (403 LOC; grep'd q_personal, ElementalBalance, PersonalResonance, compose_personal_quaternion, from_kerykeion_json)
  - `Body/S/S0/portal-core/src/nara_journal.rs` (466 LOC)
  - `Body/S/S0/portal-core/src/kernel.rs` (lines 374–490 — q_cosmic, codon_charge_quaternion, MathemeHarmonicProfile, resonance)
  - `Body/S/S0/portal-core/src/harmonic_profile.rs` (re-export surface)
  - `Body/S/S0/portal-core/src/events.rs` (klein_flip field present on relation descriptor)
  - `Body/S/S0/portal-core/src/quaternion.rs` (119 LOC; underlying Cl(4,2) quaternion ops)
  - `Body/S/S0/epi-cli/src/nara/wind.rs` (lines 55–212 — kerykeion_natal / kerykeion_current via kairos)
  - `Body/S/S3/graphiti-runtime/src/lib.rs` (episode payload, "protected-local-episodic-memory" privacy boundary, kernel_resonance / kernel_profile_observation episode types)
  - `Body/S/S3/gateway/tests/dispatch_contract.rs` (`nara.*` route classification under S4S5DomainAdapter / NaraExtension)
- Corpus 4 (Theia surface): `Body/M/epi-theia/extensions/m4-nara/{package.json, src/common/nara-surface.ts, src/common/index.ts, src/browser/frontend-module.ts}` (contract version `2026-06-01.07-T7`)
- Reference: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-2-canonical/06-m4-nara-extension.md` (cycle-2 tranches T0–T3)

## Standing Invariants Honored

- S0 (epi-lib, portal-core, epi-cli) is **landed/consumed substrate** — `m4.h` (772 LOC), `m4.c` (673 LOC), `personal_identity.rs`, `nara_journal.rs`, `kernel.rs` are real. Any tranche touching these is `consume as-is`, `audit/verify`, or `extend`.
- S3 graphiti-runtime is landed substrate. The Nara consumer extends the existing Graphiti privacy boundary; it does not rebuild it.
- The matheme spine M1→M2→M3 supplies cosmic-side; M4 supplies the personal pole; the `+1` parent invariant lives at M1-5 (not M0) — the UX doc respects this (no M0-witness wording detected).
- Cl(4,2) is the shared algebra: `portal-core/src/quaternion.rs` is used by `personal_identity.rs` (personal pole), `mahamaya.rs` / `codon_charge_quaternion` in `kernel.rs` (cosmic codon pole), and consumed by `kernel.rs` `PersonalResonance::from_quaternions(q_personal, q_cosmic)` — **one algebra, not four**. Verified at code level.
- `/pratibimba/system` + `Body/M/epi-theia` is the M' Theia shell authority; `m4-nara` extension lives there.

## The Four-Way Matrix

| # | Claim (UX doc) | Spec authority (M' Seed) | Code/substrate evidence | Theia surface | Status |
|---|---|---|---|---|---|
| 1 | "#4.4.4.4 is the living personal-Pratibimba locus where the protected personal field, quaternionic state, and psychoid rendering are updated" (§1, §2.2) | M4'-SPEC §7.1 names M4-4-4-4 as personal-Pratibimba carrying identity/elemental quintessence/quaternionic form | `portal-core/src/personal_identity.rs:104-138` — `PersonalIdentityProfile { q_personal: [f32;4], natal_chart_handle, elemental_balance }` + `composed_quaternion(q_transit, q_activity)`; `kernel.rs:486` instantiates `PersonalResonance::from_quaternions(identity.q_personal, profile.q_cosmic)` | `m4-nara/src/common/nara-surface.ts` carries `NaraDayContainer`, artifact tree, graphiti episodes — but **no field rendering surface** for q_personal / q_composed yet; surface input has `ProtectedPersonalFieldInput` (lines 80–88) defining handles `qIdentityHandle`, `qTransitHandle`, `qActivityHandle`, `qComposedHandle`, `audioBusHandle`, `planetaryChakralStateHandle` — but no rendering consumer | **SPEC-AHEAD** — substrate carries q_personal/q_composed/resonance; Theia extension declares handle contract but renders only day/artifact tree (no resonance indicator, no personal field) |
| 2 | "Q_composed = Q_identity · Q_transit · Q_activity" is the operative state (§5.4) | M4'-SPEC §7.3a — same formula; bioquaternion `(q_b, q_p)` is a decomposition/reading, not independent input | `personal_identity.rs:177-185` — `compose_personal_quaternion(q_identity, q_transit, q_activity)` exists and is real; uses `quat_mul` on normalized inputs | Theia contract names `qComposedHandle` (nara-surface.ts:83) but no decomposition `(q_b, q_p)` rendering | **ALIGNED** at spec/substrate; **SPEC-AHEAD** at Theia |
| 3 | Personal quaternion is computable from Kerykeion natal data (§2.2, §5.1) | M4'-SPEC §7.2 — Kerykeion natal → `q_personal` per planet element/weight aggregation; §7.5 names `q_personal`, `natal_chart_handle`, `elemental_balance` as required profile fields | `personal_identity.rs:112-132` — `from_kerykeion_json(...)` and `from_natal_chart(...)` constructors; `epi-cli/src/nara/wind.rs:117-148` — `kairos::run_kerykeion_natal(date, time, lat, lon)` populates profile + sets `kerykeion_version = "4.x"` | Theia surface receives `natalChartHandle` only via opaque handle (no rendering) | **ALIGNED** — spec law + substrate path both real |
| 4 | "Every M4-3 lens-position reading is one addressing of the same 72-invariant the bimba map plays" (§13.3) — the 72 is one invariant addressed by six axes | M4'-SPEC §6.7 — M4' consumes resonance72 from M2' as a context handle, does not regenerate 72-address law | `kernel.rs` exposes `MathemeResonance72Projection` (re-exported via harmonic_profile.rs); kernel's 72 projection is consumed by Nara not regenerated | Theia contract receives `MathemeHarmonicProfileBoundary` (line 1) — but no resonance72 rendering on the Nara surface yet | **SPEC-AHEAD** — substrate ships resonance72; Theia M4 surface doesn't surface it |
| 5 | "The personal cymatic field … and the canonical bimba city-scape … share the same Cl(4,2) algebra and the same MathemeHarmonicProfile" (§13.3) | M4'-SPEC §7.4 — Cl(4,2) is the shared substrate; personal-quaternion and cosmic-quaternion are two points in it; resonance is the metric | One algebra confirmed: `portal-core/src/quaternion.rs` shared by `personal_identity.rs` and `kernel::codon_charge_quaternion`; both produce `[f32;4]` unit quaternions consumed by single `PersonalResonance::from_quaternions` | No integrated-450 plugin surface verified at this scope (cross-cutting) | **ALIGNED** at spec/substrate |
| 6 | Day-as-episode-container with NOW-stamped artifact-children; canonical store `${VAULT}/Pratibimba/Nara/{day_id}/` (§9, §12.1) | M4'-SPEC §6.6 — DayContainer + typed artifact children (oracle, journal, dream, agent-chat, etc.); Quaternal Tarot/I-Ching as first-class M4' artifact kinds | `nara-surface.ts:42-72` defines `NaraDayContainer` + `NaraArtifactEnvelope` with `dayId, artifactHandle, nowPath, sessionKey, privacyClass, bodySha256, scalarRefs, graphitiEpisodeHandles`; `createNaraArtifact()` writes to `${vaultRoot}/day/{dayId}/artifacts/{kind}/` — **path differs from spec's `${VAULT}/Pratibimba/Nara/{day_id}/`** | `m4-nara` extension owns `createNaraArtifact` / `readNaraDayContainer` / `createGraphitiEpisode` | **CONTRADICTION (minor)** — vault path: spec says `Pratibimba/Nara/{day_id}/`, code uses `${vaultRoot}/day/{dayId}/`. Decision needed: align code to spec, or update spec to current code path. |
| 7 | Graphiti `:HAS_DAY`, `:CONTAINS_DAILY_NOTE`, `:PART_OF_DAY`, `:NEXT_IN_ARC` relationships on real episodes (§6.6, §8) | M4'-SPEC §7.11 — same four relations explicit; PersonalNexus → DayContainer → artifact children topology | `nara-surface.ts:48-56` `NaraGraphitiEpisode.relation: 'HAS_DAY' \| 'CONTAINS_DAILY_NOTE' \| 'PART_OF_DAY' \| 'NEXT_IN_ARC'`; `createGraphitiEpisode()` writes envelopes; `graphiti-runtime/src/lib.rs:132` carries `"privacyBoundary": "protected-local-episodic-memory"`. **However** the four relations are not yet asserted in `graphiti-runtime` payload schema — extension creates local envelopes, but no S3 `:HAS_DAY`/`:NEXT_IN_ARC` write path verified | Theia extension carries the relation enum; no S3 round-trip integration test found for these four relations | **CODE-PENDING** — `graphiti-runtime` does not yet enforce/insert the four Nara relations as graph edges. Owning spec: M4'-SPEC §7.11 + m4-prime-nara-day-episodes-and-oracle-artifacts. Unblocking contract: a Nara-relation insertion API on `graphiti-runtime` |
| 8 | Three-quaternion composition + bioquaternion `(q_b, q_p)` decomposition is the operative reading (§5.4) — psychoid cymatic field is local-protected, never cosmic-facing (§2, §7.7) | M4'-SPEC §7.3a, §7.7 — same; psychoid-cymatic-field-engine §2.1–§5 elaborates field rendering law | `(q_b, q_p)` decomposition: **no substrate** in `portal-core/src/` for explicit bimba/pratibimba decomposition of `Q_composed`; cymatic field rendering: **no substrate** for "psychoid cymatic field" solver. Audio bus contract `audio_octet[8]` lives in `kernel.rs` (Mathheme bus) — handle named in Theia (`audioBusHandle`) | Theia: `ProtectedPersonalFieldInput.audioBusHandle` declared (nara-surface.ts:84) but **no field renderer**. No `psychoid_cymatic` module in m4-nara extension | **DOC-AHEAD** / partial CODE-PENDING — psychoid cymatic field solver + `(q_b, q_p)` decomposition are spec'd but unbuilt. Cycle-3 must classify as a known gap, not greenfield-rebuild the substrate Cl(4,2)/audio bus that already exists |
| 9 | Vāma Śaktis as contemplative recognition vocabulary, never sovereignty judgement (§2.4, §7.9; psychoid spec §8) | M4'-SPEC §7.9 — sixfold unit, contemplative-only; §7.13 open question: classifier-internal may be mandatory while presentation remains opt-in | No `vama`/`vāma`/`Vama` symbol in `portal-core/src/` substrate. No Vama classifier path in code. UX doc treats Vāma Śaktis as "contemplative recognition offerings" only (line 175) | No Vama surface in `m4-nara` extension | **DOC-AHEAD** — UX and spec both name Vāma vocabulary; substrate carries no classifier or recognition vocab. Cycle-3 tranche must decide whether to land a contemplative-offering interface or downgrade until M5/Anima governance ready |
| 10 | M4-0 six-layer identity derivation (Birthdate encoding, Decanic, Jungian, Gene Keys, Human Design, Quintessence) — M4-0-5 integrates to `Q_identity`; absent layers represented as absent evidence (§2.1, §10.1) | M4'-SPEC §7.10 — six-layer branch; baseline = M4-0-0 + M4-0-1 + M4-0-5; nara-m4-0-0-birthdate-encoding-spec is the testable pattern | `personal_identity.rs` carries only `q_personal` from natal data (Kerykeion-only baseline = §7.2 wording). **No** birthdate-encoding (mod6/mod12 MEF), no Jungian/Gene Keys/Human Design integration. No traceable layer-output / evidence-path / contradiction-preservation API | No M4-0 identity-layer panel in m4-nara extension | **CODE-PENDING + open contradiction** — substrate baseline is "Kerykeion-only `q_personal`"; spec §7.13 flags the open canon question "Kerykeion-only `q_personal` vs integrated `q_Nara`". Decision register entry required |
| 11 | M4' privacy boundary: journal bodies, dreams, oracle interpretations, raw quaternion state, unreconciled Graphiti episodes are protected-local; only handles flow public (§10.7) | M4'-SPEC §7.6 (personal-quaternion strict privacy class); §6.7 (only safe live-state handles, bounded Q_activity deltas, retrieval handles) | `graphiti-runtime/src/lib.rs:132` `"privacyBoundary": "protected-local-episodic-memory"` literal in payload; `nara-surface.ts` `NaraPrivacyClass` enum + `buildS2CanonicalProjection` excludes body fields (`protectedBodiesIncluded: false`) + `buildPublicProfilePayload` returns empty `bodyFields: []`; gateway routes `nara.*` to S4S5DomainAdapter | Theia surface always emits `protectedBodiesRendered: false` in observability events (line 280) | **ALIGNED** — privacy law is real in code |
| 12 | Resonance indicator on every journal entry / oracle cast / dream / highlight (§6.1, §6.2, §7.3 in spec) | M4'-SPEC §7.3 — `resonance(t) = | q_personal · q_cosmic(t) |` per tick; §7.5 — `MathemeHarmonicProfile.resonance` precomputed | `personal_identity.rs:151-175` — `PersonalResonance::from_quaternions(q_personal, q_cosmic)` returns metric in [0,1]; `kernel.rs:486` instantiates per profile-build; ConjugateFormCharacter (Major/Minor/Shadow) re-exported via `harmonic_profile.rs` | `m4-nara/src/common/nara-surface.ts` exposes `MathemeHarmonicProfileBoundary` to the surface but **does not render the resonance indicator** on artifacts | **SPEC-AHEAD** — substrate ships resonance; Theia M4 surface doesn't render it per-artifact yet |
| 13 | Lightweight 0/1 daily surface vs deep `4+2` M4-nara IDE surface vs integrated 4/5/0 recognition surface — three distinct surface modes (§6.1, §6.3, §6.4) | M4'-SPEC §6.6 — lightweight 0/1 daily surface is daily-use; `m4-nara` IDE extension is deep engagement; integrated 4/5/0 plugin composes M4+M5+M0 | `m4-nara` extension exists (Theia frontend-module). No 0/1 lightweight Nara surface or 4/5/0 integrated plugin observed in `Body/M/epi-theia/extensions/` from this domain scope (cross-cutting Wave-B owns plugin-integrated-4-5-0) | `m4-nara` extension scaffolded but minimal (Nara DayContainer + Graphiti browser only per package.json description) | **SPEC-AHEAD** — M4' deep IDE surface is partial; daily 0/1 surface and 4/5/0 plugin are owned by cross-cutting tranches |
| 14 | `klein_flip` / kleinFlipState on personal-pole relation descriptors (UX implies bimba/pratibimba inversion; spec §7.3a "Hopf projection sends composed identity-trajectory to S²") | M4'-SPEC §7.3a — Hopf projection; §7.11 — M4-3 carries `(p,q)` torus-knot phase-history telemetry | `portal-core/src/events.rs:35` carries `klein_flip: bool` on `RelationDescriptor` + `EventEnvelope`; `portal-core/src/hopf.rs` exists (Hopf projection module) — both are landed | No kleinFlip / Hopf-trajectory rendering on Nara surface | **SPEC-AHEAD** — kleinFlip + Hopf both landed in substrate; Nara renders neither |
| 15 | Parser path (Pi-agent inference for typed `NaraSymbolicObservation`) vs Dialogic path (Nara voice adapter via M5' QLoRA governance) — two distinct paths that must not collapse (§3, §7.12 spec) | M4'-SPEC §7.12 — Pi parser ≠ Nara dialogue; QLoRA governed by Anima/Sophia/Epii; consent-gated and rollback-capable | No QLoRA / Nara voice adapter substrate found in this scope (Wave-B agentic layer owns Pi/Anima/Aletheia carriers). `m4-nara` package.json description doesn't claim either; spec §7.12 references `[[m5-prime-epii-on-nara-qlora-dialogic-voice]]` under M5' governance | No parser-vs-dialogue split rendered in m4-nara extension; `ConsentRecord` + `VoiceCorpusAdmissionInput` interfaces present (nara-surface.ts:90–108) — contract only, no consumer | **DOC-AHEAD / cross-cutting** — Pi parser + Nara voice adapter belong to the Wave-B agentic-layer tranche (S4↔S5 ownership). Carries an ORPHAN warning if no carrier owns it |
| 16 | Period readings (daily/weekly/lunar/solar-arc) reconstruct Q_composed trajectory and render via psychoid field as lived-time paths (§7.8 spec; UX §6.3 "Graphiti episode trajectories") | M4'-SPEC §7.8 — temporal-processual reading layer via Graphiti+Chronos/Kairos+history directory | `epi-cli/src/nara/wind.rs` runs Kairos/Kerykeion current-tick; no trajectory reconstruction observed in `nara_journal.rs` (run quick grep — no `trajectory`/`period_reading` API). Chronos/Kairos adapters exist at S4-3p-chronos | No trajectory panel in m4-nara extension | **DOC-AHEAD** — trajectory reconstruction API + psychoid lived-time rendering are spec'd but unbuilt. Spec is downstream of the psychoid cymatic field engine (claim 8) |
| 17 | M5' review gate (proposed → reviewed → accepted|rejected → applied) is the only path from activity to identity (§4.2, §10.6 UX; §6.7 spec) | M4'-SPEC §6.7 — promotion is one-way and governed; identity-augment proposals only via M5-4/M5' review | No proposal-lifecycle state machine found in `personal_identity.rs`. `Q_activity` can be perturbed but no `proposed/reviewed/accepted/applied` state. Wave-B M5/agentic-layer owns the review-core | Theia: `m4-nara` doesn't expose review/proposal UI. M5'/Epii extension is the natural owner | **DOC-AHEAD / cross-cutting** — orphan risk on the personal-side adapter that must consume the review verdicts |
| 18 | "Nara distinguishes raw service connectivity from actual bounded agent access" (§8 spec readiness) | M4'-SPEC §6.7, §8 | No code-level test asserting this distinction was located in `portal-core` or `m4-nara` extension within this scope | Theia: extension declares readiness blockers (`buildM4NaraSurface` falls to `authority_payload_missing` when day container absent — nara-surface.ts:264-268) but no connectivity-vs-bounded-access discriminator | **CODE-PENDING** — readiness blocker named in spec; test/discriminator not landed |

## Anomalies

### CONTRADICTIONS (decision-register entries)

1. **Vault path for DayContainer (row 6).** Spec §6.6 says `${VAULT}/Pratibimba/Nara/{day_id}/`. `m4-nara` extension writes to `${vaultRoot}/day/{dayId}/`. Decision required: which is canonical? Recommend aligning extension to spec's `Pratibimba/Nara/{day_id}/` path so the canonical store is explicit and matches the protected-local namespace law.
2. **`q_personal` baseline (row 10).** M4'-SPEC §7.13 itself names this as open: §7.2 describes `q_personal` as Kerykeion-natal-only; §7.10 + nara-m4-0-identity-branch-integration-map describe M4-0-5 as integrated quintessence from six layers. Substrate today is Kerykeion-only. Decision required: does `q_personal` stay the natal baseline (and `Q_identity` name the integrated form), or does `q_personal` itself become the integrated `q_Nara`?
3. **Quaternion axis ordering (M4'-SPEC §7.13).** §7.2 uses `[w=Earth, x=Fire, y=Water, z=Air]`; nara-m4-0-identity-branch-integration-map phrases `q_Nara = Earth + Water·i + Fire·j + Air·k`; m4-prime-nara-activity-graphiti-instrument locks `[F,W,E,A] → [w=E, x=F, y=W, z=A]`. Need kernel-level lock before further integration work.
4. **Vāma classifier vs contemplative offering (M4'-SPEC §7.13).** Internal classifier mandatory but user-visible only? Spec leaves open; the cycle-3 decision should set internal/external policy.
5. **0/1 surface polarity (M4'-SPEC §7.13).** psychoid-cymatic-field-engine assigns `0`=cosmic, `1`=personal; m5-prime-system-shape says lightweight `0`=personal cymatic field. Cross-cuts the M' Tauri shell — Wave-B Theia-shell agent should resolve this.

### CODE-PENDING (named, classified, NOT proposed for greenfield rebuild)

- Graphiti runtime missing Nara relation insertion (`:HAS_DAY`, `:CONTAINS_DAILY_NOTE`, `:PART_OF_DAY`, `:NEXT_IN_ARC`) at the S3 graph-edge level (row 7). Owner: `graphiti-runtime` + M4'-SPEC §7.11.
- Psychoid cymatic field solver + audio-cymatic-derivation from `M2-1' bus` (row 8). Owner: M4'-SPEC §7.7 + psychoid-cymatic-field-engine spec.
- `(q_b, q_p)` bimba/pratibimba decomposition of `Q_composed` (row 8). Owner: M4'-SPEC §7.3a + alpha_quaternionic_integration_across_M_stack §7.5.
- M4-0 birthdate encoding + six-layer identity derivation + evidence-path preservation (row 10). Owner: nara-m4-0-0-birthdate-encoding-spec + M4'-SPEC §7.10.
- Q_composed period-reading / trajectory reconstruction over Graphiti + Chronos/Kairos handles (row 16). Owner: M4'-SPEC §7.8.
- Identity-augment proposal lifecycle `proposed/reviewed/accepted/applied` on personal-pole adapter (row 17). Owner: M5'-SPEC review gate + M4'-SPEC §6.7.
- Connectivity-vs-bounded-access discriminator + readiness blocker test (row 18). Owner: M4'-SPEC §8.

### ORPHAN warnings

- **Nara voice adapter / QLoRA dialogic-voice owner** — UX §3, M4'-SPEC §7.12 and m5-prime-epii-on-nara-qlora-dialogic-voice imply Anima leads admission. No carrier object verified in this scope. Cross-link to Wave-B agentic-layer tranche; if Wave-B finds no Anima/Pi owner, raise to no-orphan audit.
- **Psychoid cymatic field renderer surface** — Spec §7.7 + psychoid-cymatic-field-engine name it explicitly; m4-nara extension has handle inputs but no renderer module. Must be owned by m4-nara extension itself (this is the M' product surface — first-build ownership allowed).

## Proposed Cycle-3 Tranches

Cycle-2 substrate inheritance line: cycle 2 Track 06 owned `Journal/Daily/Dream/Oracle` (T0), `Personal Quaternion + Kerykeion source` (T1), `Psychoid-Cymatic Field + Resonance Surface` (T2), and `Day Episodes + Artifact Graph + Dialogic Voice` (T3). Cycle 3 closes the substrate gaps these tranches assume, the Theia-side consumers they declared, and the decision register items §7.13 leaves open.

### 5.1 — Resonance + Conjugate-Form Indicator Rendering on Nara Surface
- Classification: spec-ahead-integration
- Cycle 2 substrate inheritance: consume `Body/S/S0/portal-core/src/personal_identity.rs::PersonalResonance` and `kernel.rs::MathemeHarmonicProfile.resonance` (both landed); consume `MathemeHarmonicProfileBoundary` already wired into `m4-nara/src/common/nara-surface.ts` as-is.
- Deliverable: extend `m4-nara` extension to render the resonance indicator (numeric + ConjugateFormCharacter Major/Minor/Shadow) on each `NaraArtifactEnvelope` in the artifact tree and on the day summary header. Surface obeys §6.5 — no quaternion-dump, just resonance + conjugate-form character + lean identity sidebar.
- Verification: `pnpm -C Body/M/epi-theia/extensions/m4-nara build` succeeds; `grep -n "ConjugateFormCharacter\|resonance" Body/M/epi-theia/extensions/m4-nara/src/common/*.ts` returns non-empty after change; new tests in `m4-nara` cover rendering when profile carries resonance and falling back when `pending-resonance`.

### 5.2 — Nara DayContainer Vault Path Decision and Alignment
- Classification: contradiction-decision
- Cycle 2 substrate inheritance: consume `m4-nara/src/common/nara-surface.ts::createNaraArtifact / dayContainerPath` as-is for now.
- Deliverable: decision-register entry resolving spec §6.6 (`Pratibimba/Nara/{day_id}/`) vs current code (`day/{dayId}/`); either update `dayContainerPath` to match spec or update spec to current path; document in 13 (decision register).
- Verification: `grep -n "dayContainerPath\|Pratibimba/Nara" Body/M/epi-theia/extensions/m4-nara/src/common/nara-surface.ts` after change matches the decision; round-trip test `createNaraArtifact` → `readNaraDayContainer` passes against the canonical path.

### 5.3 — Graphiti Runtime Nara Relations Insertion API
- Classification: code-pending-closure
- Cycle 2 substrate inheritance: extend `Body/S/S3/graphiti-runtime/src/lib.rs` (landed) with a `nara_insert_relation(day_id, episode_handle, relation)` that writes `:HAS_DAY` / `:CONTAINS_DAILY_NOTE` / `:PART_OF_DAY` / `:NEXT_IN_ARC` edges on the Graphiti backend.
- Deliverable: API + privacy-class enforcement (protected-local) + integration test against `Body/S/S3/gateway/tests/graphiti_runtime_contract.rs`.
- Verification: `cargo check -p graphiti-runtime`; `cargo test -p graphiti-runtime --test nara_relations` (new test); grep-check `grep -rn "HAS_DAY\|NEXT_IN_ARC" Body/S/S3/graphiti-runtime/src/` returns the new relation symbols.

### 5.4 — `(q_b, q_p)` Bimba/Pratibimba Decomposition of `Q_composed`
- Classification: code-pending-closure (substrate gap, NOT greenfield — extends existing `personal_identity.rs` + `quaternion.rs`)
- Cycle 2 substrate inheritance: extend `Body/S/S0/portal-core/src/personal_identity.rs::compose_personal_quaternion` (landed) with a `decompose_bioquaternion(q_composed) -> (q_b, q_p)` reading function per M4'-SPEC §7.3a; consume `Cl(4,2)` algebra at `quaternion.rs` as-is.
- Deliverable: decomposition fn, unit test proving `(q_b, q_p)` is a read of `Q_composed` and not an independent input; protected-local rendering hook on Theia.
- Verification: `cargo check -p portal-core`; `cargo test -p portal-core personal_identity::bioquaternion_decomposition`.

### 5.5 — Psychoid-Cymatic Field Solver + Audio-Cymatic Driver (gap audit + minimum-viable solver)
- Classification: code-pending-closure (with explicit Option F / Option S decision per M4'-SPEC §7.7)
- Cycle 2 substrate inheritance: consume `kernel.rs` `MathemeHarmonicProfile.audio_octet[8]` / `nodal_quartet[4]` as the cymatic substrate input (per M' kernel-bridge readiness, Wave-B); extend `portal-core/src/` with a `psychoid_cymatic` module that emits opaque renderer-handle output and never exposes raw field body via S3.
- Deliverable: minimum-viable solver behind a Option-F-vs-Option-S decision point; Theia `m4-nara` renderer consumes the handle.
- Verification: `cargo check -p portal-core`; presence test `test -d Body/S/S0/portal-core/src/psychoid_cymatic || grep -rn "psychoid_cymatic" Body/S/S0/portal-core/src/`; Theia: `grep -rn "psychoid\|cymatic" Body/M/epi-theia/extensions/m4-nara/src/`.

### 5.6 — M4-0 Birthdate Encoding + Six-Layer Identity Branch Implementation
- Classification: code-pending-closure
- Cycle 2 substrate inheritance: extend `Body/S/S0/portal-core/src/personal_identity.rs` with M4-0-0 birthdate encoding (mod6 / inverse / mod12 MEF / lens-square / L2' elemental extraction / caps / evidence paths) per nara-m4-0-0-birthdate-encoding-spec; absent layers represented as absent evidence.
- Deliverable: birthdate-encoding module + tests proving raw totals / mod6 / inverse / mod12 / MEF / caps / evidence paths preserved (no Pythagorean root reduction).
- Verification: `cargo check -p portal-core`; `cargo test -p portal-core m4_0_0_birthdate_encoding`; absence-test that Jungian / Gene Keys / Human Design layer outputs are `pending` not fabricated.

### 5.7 — `q_personal` Identity Baseline Decision and Axis Lock
- Classification: contradiction-decision
- Cycle 2 substrate inheritance: consume `personal_identity.rs` Kerykeion-only baseline as-is, pending decision.
- Deliverable: decision-register entry resolving open canon questions M4'-SPEC §7.13 (1)+(2): `q_personal` Kerykeion-only vs integrated `q_Nara`; axis order `[w=Earth, x=Fire, y=Water, z=Air]` vs the elemental remap; identity-hash migration path.
- Verification: decision committed under 13 (decision register); `grep -n "axis_order\|q_personal_baseline" Body/S/S0/portal-core/src/personal_identity.rs` reflects lock if decision picks an axis convention.

### 5.8 — Period Reading Trajectory Reconstruction
- Classification: doc-ahead-landing
- Cycle 2 substrate inheritance: consume `epi-cli/src/nara/wind.rs::run_kerykeion_current` (landed), Chronos/Kairos adapters at `Body/S/S4/ta-onta/S4-3p-chronos/` (landed substrate per spec), `graphiti-runtime` episode retrieval (landed).
- Deliverable: `period_reading(day_range)` API on `nara_journal.rs` that reconstructs `Q_composed` trajectory from Graphiti episodes + Chronos/Kairos handles + history directory; preserves privacy class; emits opaque Hopf-projected trajectory handle for psychoid field renderer.
- Verification: `cargo check -p portal-core`; `cargo test -p portal-core nara_journal::period_reading`; protected-local invariant test confirms no raw bodies in returned trajectory.

### 5.9 — Identity-Augment Proposal Lifecycle Adapter (M4-side of M5' review gate)
- Classification: spec-ahead-integration
- Cycle 2 substrate inheritance: consume the M5' review-core / Epii review path owned by Wave-B M5 tranche; extend `personal_identity.rs` with proposal state machine `proposed → reviewed → accepted|rejected → applied`.
- Deliverable: adapter API + state-machine + Theia surface hook that surfaces pending proposals on M4 side (read-only) and consumes verdicts.
- Verification: `cargo check -p portal-core`; `cargo test -p portal-core personal_identity::proposal_lifecycle`; contract test confirms only `applied` mutates `Q_identity`.

### 5.10 — Connectivity-vs-Bounded-Access Discriminator Test
- Classification: code-pending-closure
- Cycle 2 substrate inheritance: extend `gateway` tests + `m4-nara` extension readiness logic with a discriminator that proves a live Graphiti / Neo4j / Redis / SpaceTimeDB ping is not a grant of bounded access.
- Deliverable: contract test that asserts the distinction at gateway level for `nara.*` methods.
- Verification: `cargo test -p gateway --test dispatch_contract` + new sub-test; `grep -rn "bounded_access\|connectivity_check" Body/S/S3/gateway/src/` returns non-empty after change.

## Status Summary

- ALIGNED: 4 (rows 2 spec/substrate, 3, 5, 11)
- DOC-AHEAD: 4 (rows 8 partial, 9, 15, 16, 17 — counted with overlap as 4 distinct DOC-AHEAD-dominant)
- SPEC-AHEAD: 5 (rows 1, 2 Theia leg, 4, 12, 13, 14)
- CODE-PENDING: 4 (rows 7, 8 substrate, 10, 18)
- CONTRADICTION: 2 explicit in matrix + 4 §7.13 open canon items = 5 decision-register candidates (rows 6, 10; plus axis order, Vama policy, 0/1 polarity)
- ORPHAN: 2 (Nara voice carrier; psychoid renderer surface — owner candidate is m4-nara extension itself)

(Distinct-row counts; some claims fall across categories.)

## Closing Note

M4 substrate is among the strongest in the M' stack: `personal_identity.rs` carries real q_personal/Q_composed/PersonalResonance derived from real Kerykeion paths through `epi-cli/src/nara/wind.rs` + Kairos; `nara_journal.rs` + `m4-nara/nara-surface.ts` give DayContainer + artifact-envelope law with privacy-class enforcement at `graphiti-runtime`. The major gaps are (a) the Theia M4 surface not yet rendering the resonance / conjugate-form / personal field that the substrate ships, (b) the psychoid cymatic field engine itself, (c) the M4-0 six-layer identity branch (Kerykeion-only baseline today), and (d) the proposal-lifecycle review gate adapter. None of these are greenfield — every one extends an already-landed substrate module under M4'-SPEC named authority.
