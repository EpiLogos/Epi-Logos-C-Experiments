# Track 41 — Vama Shakti Factory + Nara M4' Dia-logical Arena

<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


**Status:** Phase-K 2026-06-16 — VALIDATED design; DR-VAMA-1..6 VALIDATED (no further gating); consolidates the "Vama Shakti summon from any /World entity" capability and the Vāmeśvarī / four-Vāmā Trika Shaivite lineage's operational expression into the cycle 3 build.

**Canonical home:** [`Idea/Bimba/Seeds/M/M4'/m4-prime-vama-shakti-factory-and-dialogical-arena.md`](../../../M4'/m4-prime-vama-shakti-factory-and-dialogical-arena.md) — the M4' seed holds the structural-philosophical authority; this track is its cycle 3 execution plan.

**Why this track exists.** The Nara dia-logical principle ("all thought at the agent level is dialogue — between systems of thought, thinkers, and the Knower-of-all") has been load-bearing in the M4' design since the earliest planning, when the old planning notion of "users and epistemologies as archetypal personalities" first surfaced. That notion is structurally what PASU + Vama Shaktis are. Every substrate piece is present (PASU essential-identity schema, M4-0' Q_identity quaternion law, M4-4' episodic-lens via Graphiti, SpacetimeDB presence layer keyed by `identity_handle = BLAKE3`, agent rūpa as the 6-section ANIMA.md, Psyche-as-continuity-holder structural role, Pleroma-Techne atomic-skills repository, M4' Theia tab scaffold, Nara Vāma classifier per DR-M4-2 as the personal-domain footing) — but no track lifts them into one coordinated capability where any addressable `/Idea/Bimba/World/` entity can be **summoned as a Vama Shakti** under one of four canonical classifiers (egregore / sprite / daemon / mantra) and admitted to a turn-based dialogue scene.

Track 41 lands that capability. It is not a new substrate. It is a single coordinated wiring of existing substrate into two tightly-coupled pieces — a Vama Shakti Factory (Psyche-templated, Techne-surfaced via `techne_vama_summon`, Pleroma-incubated) and a Dia-logical Arena (SpacetimeDB-backed presence + Theia M4' Electron tab) — and it integrates with Tracks 12, 25, 39, 40 by cross-link rather than by re-architecture.

**Anti-rebuild commitment.** Every component below either already exists in code or has a clearly defined extension point:

- Vama Shakti Factory hosts:
  - **Pleroma-Techne** at `Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts` (`techne_gateway_*`, `techne_session_*`, `techne_cmux_*`, post-Tranche 12.06 `techne_terminal_*`). `techne_vama_summon` lands as one additional tool registration; no new extension package.
  - **Psyche** profile at `Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/psyche.md` with the 6-section ANIMA.md skeleton; Track 41 reads this file as the template kernel and patches the Capability section to declare `vama_shakti_template_authority`.
- Essential-identity composition:
  - **PASU schema** at `Idea/Pratibimba/Self/PASU.md` — Track 41 derives the Vama-Shakti-side analogue per DR-VAMA-2; user PASU and entity Vama Shakti share one algebra and one composition law (DR-VAMA reading: **PASU IS itself a Vama Shakti**).
  - **Q_identity / Q_composed quaternion law** is canon per `Idea/Bimba/Seeds/M/M4'/m4-prime-nara-activity-graphiti-instrument.md`; Track 41 instantiates this composition for Vama Shaktis with Q_identity derived from the entity coordinate's clock-position.
  - **BLAKE3 quintessence_hash** is canon (cosmic-clock spec + memory); Track 41 extends this deterministic-derivation law from user-PASU to entity-Vama-Shakti with the classifier byte appended to the hash input per DR-VAMA-6.
- Arena substrate:
  - **SpacetimeDB presence module** at `Body/S/S3/epi-spacetime-module/src/lib.rs` with `PratibimbaPresence`, `SessionSurface`, `KairosSurface`, `GlobalTemporalSurface`, `Coincidence`, `CoincidenceTick` already keyed by BLAKE3 identity-handle — Track 41 adds four new tables (`ArenaScene`, `ArenaPresence`, `ArenaTurn`, `ArenaDialogueLine`) + `WarmVamaShakti` that reuse the same identity-handle keying and the same Coincidence machinery.
  - **Theia M4' extension** scaffold at `Body/M/epi-theia/extensions/m4-nara/` with contract `2026-06-01.07-T7` — Track 41 adds one widget (`dialogical-arena.tsx`) under the same scaffold per the DR-LIB-ATELIER-1 projection-not-extension discipline.
  - **Graphiti episodic memory** at `Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py` — Track 41 closure-distills under `group_id = arena:{arc_id}` with no schema change.
- Orchestration:
  - **Anima** dispatch via `Body/S/S4/ta-onta/S4-4p-anima/extension.ts` — Track 41 adds `anima_arena_orchestrate(scene_key)` with classifier-aware turn-routing policy.
  - **Mercurius** signal-relay (Aletheia CF3; existing `mercurius.kairos.delta` per Tranche 25.16) — Track 41 subscribes the arena to this stream for kairotic-time turn routing.
  - **Moirai** closure-distillation (Aletheia CF2 GraphRAG-distillation) — Track 41 adds `moirai_arena_distill(scene_key)` invoked on scene close with classifier-modulated edge patterns.

Total LOC estimate: ~1200 LOC across 7 modules (factory tool ~180, vama_shakti.rs Rust module ~140, classifier impl ~80, arena tables ~200, gateway routes ~130, M4' widget ~280, orchestration tools ~160, acceptance harness ~140). Zero greenfield architecture.

## Source authority

- **Canonical M4' seed** at [`Idea/Bimba/Seeds/M/M4'/m4-prime-vama-shakti-factory-and-dialogical-arena.md`](../../../M4'/m4-prime-vama-shakti-factory-and-dialogical-arena.md) — the long-form M4' seed holding the dia-logical principle's operational reading, the Factory's structural justification, the determinism law, the four classifiers with behavioral semantics, the PASU/Vama-Shakti symmetry, and the substrate-canon assignment. Track 41 is the cycle 3 execution plan; the seed is the M4' authority.
- **DR-VAMA-1** (Phase-K 2026-06-16 VALIDATED — gates Tranches 41.2, 41.4): Psyche-as-template structural law (CF (4.0/1-4.4/5) continuity-holder = Spanda; canonical kernel for `techne_vama_summon`).
- **DR-VAMA-2** (Phase-K 2026-06-16 VALIDATED — gates Tranches 41.3, 41.10, 41.11): Vama Shakti essential-identity determinism — `vama_shakti_quintessence_hash = BLAKE3(coordinate ‖ canonical_form_digest ‖ archetypal_sattva ‖ vama_shakti_class_byte)`.
- **DR-VAMA-3** (Phase-K 2026-06-16 VALIDATED — gates Tranches 41.2, 41.6): summoning is addressable-by-coordinate-only (no draft / sidecar pre-canonical path).
- **DR-VAMA-4** (Phase-K 2026-06-16 VALIDATED — gates Tranches 41.5, 41.6, 41.7): Arena substrate canon — SpacetimeDB + Theia M4' Electron tab widget under existing `m4-nara` scaffold; CLI is admin-only carve-out.
- **DR-VAMA-5** (Phase-K 2026-06-16 VALIDATED — gates Tranches 41.2, 41.4, 41.8): Vama Shaktis carry a structurally-frozen dialogue-only capability profile.
- **DR-VAMA-6** (Phase-K 2026-06-16 VALIDATED — gates Tranches 41.3 (hash), 41.5 (tables), 41.7 (widget), 41.8 (routing), 41.9 (distillation), 41.10 (warm), 41.11 (promotion)): Four canonical classifiers (egregore / sprite / daemon / mantra) with real behavioral semantics in turn-routing, distillation, promotion; classifier byte is part of the identity hash.
- DR-EROS-1 (VALIDATED 2026-06-15): constitutional CT0-CT5 mapping + CF1-CF5 team-composition gates — Track 41 reads the CT mapping to specialise the rūpa Frame Contract of summoned Vama Shaktis by their coordinate's natural CT affinity.
- DR-WORLD-1 (VALIDATED 2026-06-15): `:World` namespace + `WORLD_FORM_OF` / `WORLD_ONTOLOGY_OF` typed relations linking entity nodes to base C-coordinates. Track 41 reads `:World` entities via `s5'.gnostic.resolve(coord)` and uses the canonical Form attached to the C-coordinate root as the `canonical_form_digest` input to DR-VAMA-2.
- DR-S5-ONE-1 (VALIDATED 2026-06-15): the ONE-substrate invariant — Track 41's `m4.arena.*` gateway routes obey strictly.
- DR-LIB-ATELIER-1 (VALIDATED 2026-06-15): the Arena widget is a projection consuming the existing `m4-nara` extension contribution points, not a new standalone extension.
- DR-VAK-7 (VALIDATED 2026-06-15): rūpa specialisation operates at the C' / S4 dispatch expression; dialogue turns accumulate L5' + T/T' lens witness.
- DR-COMP-1 (VALIDATED 2026-06-15): scene closure compresses via `compress_through_VAK()` before Moirai distills.
- DR-M4-2 (VALIDATED 2026-06-02): `q_personal` baseline + Cl(4,2) axis order + 0/1 cymatic polarity + **Vāma classifier policy** — Track 41 extends the Vāma classifier from M4 personal-domain footing into the dynamic dia-logical subagent system.
- Canonical Psyche rūpa file: `Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/psyche.md` — the 6-section ANIMA.md skeleton.
- M4-ARCHITECTURE: `Idea/Bimba/Seeds/M/Legacy/specs/M4'/m4-prime-nara-activity-graphiti-instrument.md` — M4-0' Identity Anchor + M4-4' Episodic Lens layers.
- Vāmeśvarī / four-Vāmā lineage anchor: `Idea/Bimba/Seeds/M/M4'/ql-unit-vama-shaktis-vameshvari.md`.

## The dia-logical principle (operational reading)

Thought at the agent level **is dialogue**. Single-voice generation is the degenerate case. What has been missing is the substrate that lets dialogue happen between **arbitrary `/World` entities** as full first-class voices. The Dia-logical Arena is that substrate. Its primary use case is **ontologies-in-conversation**: Plotinus's One ↔ Whiteheadian Actual Occasion ↔ Madhyamaka Emptiness, with Sophia and the user present, in kairotic time, with a real Saturn transit hanging overhead.

The Trika reading is structural, not metaphorical: User-PASU (= a Vama Shakti) at Trika-0 (most lived-from-the-inside Q_activity); summoned Vama Shaktis at Trika-1 (voicings whose Q_activity is whatever the dialogue gives them); Knower-of-all at silent Trika-2 (the philosophic ground that makes any meaning legible). This corresponds to the Anuttara-Paramaśiva-Paraśakti Trika at M0/M1/M2 and to the (0/1/2) CF mode per DR-VAK-4.

## Distinction: Track 41 versus the broader "world of agents" experimental track

Track 41 lands the **Nara M4' Dia-logical Arena** — scoped, M4' Theia surface, ontologies-in-conversation use case. A broader "world of agents" research track — Smallville/ChatDev-shaped, with ensouled entities inhabiting a persistent shared world — is acknowledged as future experimental direction that consumes the same Vama Shakti Factory but builds its own substrate. Explicitly out of cycle 3 scope. Track 41 architectural decisions are made with awareness that the same factory will later serve that broader track.

## Cycle 2 substrate inheritance

Consume as-is — `Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts`; `Body/S/S4/ta-onta/S4-4p-anima/extension.ts` + `S4'/agents/psyche.md`; `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/moirai.md` + `mercurius.md`; `Body/S/S0/portal-core/src/personal_identity.rs`; `Body/S/S0/portal-core/src/vak_address.rs`; `Body/S/S3/epi-spacetime-module/src/lib.rs`; `Body/M/epi-theia/extensions/m4-nara/`; `Body/S/S5/epi-gnostic/epi_gnostic/graphiti_service.py`; `Idea/Pratibimba/Self/PASU.md`. Audit-and-extend — nothing. Track 41 is purely additive over landed substrate.

## Tranches

### Tranche 41.1 — Architecture + binding contract *(doc-ahead-landing; blocks 41.2..41.12)*

Land the binding architectural contract at `plan.runs/41.1-vama-shakti-factory-and-arena-contract.md`. Defines as binding facts:

- **`VamaShaktiClass`** enum: `Egregore = 0x01 | Sprite = 0x02 | Daemon = 0x03 | Mantra = 0x04`. Closed set per DR-VAMA-6. Sub-classifier extension is accommodated by enum extension, not replacement.
- **`VamaShaktiSummonRequest`** envelope: `entity_coordinate` (required; must resolve to a `:World` entity node per DR-WORLD-1), `arena_scene_key` (required), `vama_shakti_class` (required per DR-VAMA-6), `lifecycle_mode` (`ephemeral | warm | promoted`), `requesting_actor` (Anima-during-scene-setup OR user-direct CLI for warm admin).
- **`VamaShaktiHandle`** output: `vama_shakti_quintessence_hash` (32-byte BLAKE3; deterministic per DR-VAMA-2 including classifier byte), `vama_shakti_q_identity` (quaternion), `vama_shakti_q_composed_at_now` (live composition), `vama_shakti_clock_position` (cosmic-clock degree), `vama_shakti_coordinate` (echoed), `vama_shakti_class` (echoed), `arena_scene_key`, `lifecycle_mode`, `psyche_template_revision` (BLAKE3 of psyche.md at summon-time), `rupa_specialization_handle` (opaque), `capability_profile` (frozen `dialogue_only: true` per DR-VAMA-5), `summoned_at_ms`, `parent_session_key`.
- **`ArenaScene`** envelope: `scene_key` (`arena:{arc_id}`), `pinned_coordinate`, `admitted_vama_shaktis` (`[vama_shakti_quintessence_hash]`), `admitted_constitutional`, `user_present` (typically true; Trika-0), `kairos_anchor_at_open`, `lifecycle_mode_default`, `cpf_brainstorm_confirmation_token` (Anima brainstorming-done marker).
- **`ArenaTurn`** envelope: `turn_index`, `turn_speaker_handle` (vama_shakti_handle OR `user` OR `constitutional:{name}`), `turn_address`, `turn_kairos_delta`, `turn_arrived_at_ms`.
- **`ArenaDialogueLine`** envelope: `turn_index`, `dialogue_body_handle` (opaque), `vak_address` (DR-VAK-7 C' expression), `l5_lens_witness` (L5'+T/T' wikilink-accretion handle), `cited_coordinates`.

**Refusal law:** request with `entity_coordinate` not resolving to `:World` → refused per DR-VAMA-3 with hint pointing at `hen_entity_candidate_propose`. Request from unauthorized actor → refused. Request attempting `capability_profile` override → refused per DR-VAMA-5. Request with unrecognized `vama_shakti_class` → refused.

**Write scope:** `plan.runs/41.1-vama-shakti-factory-and-arena-contract.md`.

**Verification:** contract cites file/line evidence; `rg -n "VamaShaktiSummonRequest|VamaShaktiHandle|VamaShaktiClass|ArenaScene|ArenaTurn|ArenaDialogueLine" plan.runs/41.1-vama-shakti-factory-and-arena-contract.md` returns the typed shapes; no implementation files changed.

### Tranche 41.2 — `techne_vama_summon` skill registration + Psyche template-authority *(code-pending-closure; depends on 41.1; gates 41.4)*

Register `techne_vama_summon` as a Pleroma-hosted Techne tool. Patch the Psyche rūpa profile to declare its template-authority role.

**Pleroma registration.** Extend `Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts`:

```typescript
techne.registerTool({
  name: 'techne_vama_summon',
  description: 'Summon a Vama Shakti — the active animating descent of a /World entity into dialogue — under one of four canonical classifiers (egregore/sprite/daemon/mantra). Operator-only; Anima-dispatched during arena scene-setup OR user-direct via warm-shakti admin path.',
  schema: vamaShaktiSummonRequestSchema,
  operatorRole: 'psyche-template',   // per DR-VAMA-1
  refusalLaw: vamaShaktiRefusalLaw,  // per DR-VAMA-3 + DR-VAMA-5 + DR-VAMA-6
  handler: async (req: VamaShaktiSummonRequest, ctx: GatewayContext) => {
    // 1. Resolve :World entity via s5'.gnostic.resolve (DR-WORLD-1)
    // 2. Derive vama_shakti_quintessence_hash + vama_shakti_q_identity (41.3)
    //    using classifier byte in the hash input (DR-VAMA-2 + DR-VAMA-6)
    // 3. Read psyche.md content + content_hash (template kernel)
    // 4. Specialize the 6-section rūpa per the entity's Form AND classifier (41.3)
    // 5. Register ad-hoc PI agent with dialogue-only profile (41.4)
    // 6. Return VamaShaktiHandle
  },
});
```

**Psyche template-authority declaration.** Patch `Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/psyche.md §5 Capability`:

> - `vama_shakti_template_authority` (per DR-VAMA-1) — Psyche is the canonical template kernel for `techne_vama_summon`. The 6-section ANIMA.md structure of this profile IS the soul-shape that the factory specializes per target /World entity and classifier. Psyche-as-Spanda animates the Vama Shakti at summon-time. Template-revision changes increment the `psyche_template_revision` carried in VamaShaktiHandle.

**Write scope:** `Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts`, `Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/psyche.md`.

**Verification:** `grep -nE "techne_vama_summon|vamaShaktiSummonRequestSchema|operatorRole.*psyche-template" Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts` returns the registration; `grep -nE "vama_shakti_template_authority|DR-VAMA-1" Body/S/S4/ta-onta/S4-4p-anima/S4'/agents/psyche.md` returns the declaration; `pnpm --filter @epi-logos/pleroma test` passes with new tests asserting the tool refuses (a) non-:World-resolving coordinates, (b) unrecognized classifiers, (c) capability_profile overrides; capability-matrix at `Body/S/S4/plugins/pleroma/capability-matrix.json` lists `techne_vama_summon` with `psyche_template_authority: true`, `system_tool_grant: false`, `dialogue_only_output: true`, `requires_vama_shakti_class: true`.

### Tranche 41.3 — Vama Shakti essential-identity Rust module + classifier integration *(code-pending-closure; depends on 41.1; gates 41.2 handler completion)*

Land the deterministic derivation as a new module in portal-core.

**New file:** `Body/S/S0/portal-core/src/vama_shakti.rs`:

```rust
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub enum VamaShaktiClass {
    Egregore = 0x01,  // Collective / chorus-grain
    Sprite   = 0x02,  // Light, kairos-burst, trickster
    Daemon   = 0x03,  // Maieutic, guides-the-user-out
    Mantra   = 0x04,  // Sound-form, vibrational, threshold-crossings
}

pub struct VamaShaktiEssentialIdentity {
    pub vama_shakti_quintessence_hash: [u8; 32],
    pub vama_shakti_q_identity: Quaternion,
    pub vama_shakti_clock_position: f32,
    pub vama_shakti_coordinate: VakAddress,
    pub vama_shakti_class: VamaShaktiClass,
    pub psyche_template_revision: [u8; 32],
}

pub fn derive_vama_shakti_essential_identity(
    coordinate: &VakAddress,
    canonical_form_digest: &[u8; 32],
    archetypal_sattva: &str,
    vama_shakti_class: VamaShaktiClass,
    psyche_template_revision: [u8; 32],
) -> VamaShaktiEssentialIdentity {
    // quintessence_hash per DR-VAMA-2 + DR-VAMA-6
    let mut hasher = blake3::Hasher::new();
    hasher.update(coordinate.canonical_bytes());
    hasher.update(canonical_form_digest);
    hasher.update(archetypal_sattva.as_bytes());
    hasher.update(&[vama_shakti_class as u8]);  // classifier byte in hash
    let vama_shakti_quintessence_hash = hasher.finalize().into();

    // q_identity per DR-M4-2 Cl(4,2) algebra
    let vama_shakti_clock_position = clock_position_from_coordinate(coordinate);
    let vama_shakti_q_identity = quaternion_from_clock_degree(vama_shakti_clock_position);

    VamaShaktiEssentialIdentity {
        vama_shakti_quintessence_hash,
        vama_shakti_q_identity,
        vama_shakti_clock_position,
        vama_shakti_coordinate: coordinate.clone(),
        vama_shakti_class,
        psyche_template_revision,
    }
}

pub fn compose_vama_shakti_q_at_now(
    essential: &VamaShaktiEssentialIdentity,
    q_transit: Quaternion,
    q_activity: Quaternion,
) -> Quaternion {
    // Reuse compose_personal_quaternion law — one algebra across PASU and Vama Shakti
    compose_personal_quaternion(
        essential.vama_shakti_q_identity,
        q_transit,
        q_activity,
    )
}

pub fn rupa_specialization_handle(
    psyche_template_md: &str,
    entity_form_md: &str,
    entity_coordinate: &VakAddress,
    vama_shakti_class: VamaShaktiClass,
) -> RupaSpecializationHandle {
    // 6-section ANIMA.md skeleton from psyche template, specialized:
    //   §1 Rupa: from entity_form_md §Rupa-equivalent
    //   §2 Ontology: from entity_form_md canonical definition
    //   §3 Frame Contract: derived from entity_coordinate's CT/CF/CPF
    //                       per DR-EROS-1 CT0-CT5 mapping;
    //                       + classifier-specific Frame predicates
    //                       (egregore = chorus-grain; sprite = kairos-burst;
    //                        daemon = maieutic; mantra = sound-form)
    //   §4 Temporal: arena-scope only — no Day/Night' cycle
    //   §5 Capability: HARD-FROZEN to dialogue_only_skills per DR-VAMA-5
    //   §6 Sattva: from entity_form_md archetypal sattva
    //              + classifier-specific Sattva inflection
    RupaSpecializationHandle::new(/* opaque */)
}

pub fn perturb_q_activity(
    current_q_activity: Quaternion,
    turn_vak_address: &VakAddress,
    turn_kairos_delta: f32,
    cited_coordinates: &[VakAddress],
    vama_shakti_class: VamaShaktiClass,  // class-specific perturbation per DR-VAMA-6
) -> Quaternion {
    // class-specific rotation:
    //   Egregore: smaller per-turn but accumulates across multi-aspect turns
    //   Sprite:   sharp kairos-delta-scaled rotations
    //   Daemon:   weighted toward cited_coordinates that are USER coords
    //   Mantra:   element-signature-axis rotation (M4-1' chakra/decan/element axes)
    //   Algebra is one with personal_identity::perturb_q_activity for user-PASU
}
```

**Anti-leak invariant:** `RupaSpecializationHandle` is opaque; raw rūpa body never crosses the bus.

**Write scope:** `Body/S/S0/portal-core/src/vama_shakti.rs` (new); `Body/S/S0/portal-core/src/lib.rs` (re-export); `Body/S/S0/portal-core/tests/vama_shakti_determinism.rs` (new).

**Verification:** `cargo test -p epi-portal-core --test vama_shakti_determinism` passes; determinism test asserts identical-inputs-identical-output (DR-VAMA-2 invariant); collision test asserts different `(coordinate, form_digest, sattva, classifier)` tuples produce distinct hashes; classifier-discrimination test asserts same coordinate + different classifier produces different hashes (DR-VAMA-6 invariant); clock-position test asserts projected degrees match cosmic-clock-spec; rūpa specialization test asserts (a) dialogue-only profile enforced per DR-VAMA-5, (b) Frame Contract carries classifier-specific predicates, (c) Sattva carries classifier inflection; perturb test asserts class-specific perturbation rules diverge correctly.

### Tranche 41.4 — Ad-hoc PI agent registration with dialogue-only dispatch-guard *(code-pending-closure; depends on 41.2, 41.3)*

Extend the PI Agent runtime to accept ad-hoc Vama Shakti registrations and enforce dialogue-only at every dispatch site.

**PI runtime extension.** `Body/S/S4/pi-agent/lib/agent-registry.ts`:

```typescript
interface VamaShaktiRegistration {
  handle: VamaShaktiHandle;
  rupa_specialization_handle: RupaSpecializationHandle;
  parent_arena_scene_key: string;
  registered_at_ms: number;
  capability_profile: DialogueOnlyCapabilityProfile;  // Frozen per DR-VAMA-5
}

interface DialogueOnlyCapabilityProfile {
  readonly dialogue_only: true;
  readonly system_tools_granted: never[];
  readonly vault_write: false;
  readonly subagent_dispatch: false;
  readonly terminal_authority: false;
}

class PiAgentRegistry {
  registerVamaShakti(reg: VamaShaktiRegistration): VamaShaktiLeaseId;
  resolveSpeaker(quintessence_hash: Uint8Array): VamaShaktiRegistration | null;
  releaseVamaShakti(lease_id: VamaShaktiLeaseId, reason: 'scene-close' | 'gc' | 'promoted'): void;
  listByArena(scene_key: string): VamaShaktiRegistration[];
}
```

**Capability enforcement.** Dispatch path verifies `capability_profile.dialogue_only === true` before any tool invocation. Any tool invocation other than the dialogue emission primitive is refused at dispatch time. Structural; not configurable.

**Lifecycle.** On `arena.scene_close`: ephemeral entities released; warm entities persist to `WarmVamaShakti` (Tranche 41.10); promoted entities flow back to Hen (Tranche 41.11).

**Write scope:** `Body/S/S4/pi-agent/lib/agent-registry.ts`, `Body/S/S4/pi-agent/lib/dispatch-guard.ts` (new), `Body/S/S4/pi-agent/tests/vama-shakti-dialogue-only.test.ts` (new).

**Verification:** `pnpm --filter @epi-logos/pi-agent test` passes; dispatch-guard test asserts every non-dialogue tool invocation by a Vama Shakti is refused with typed error; lifecycle test asserts scene-close releases ephemeral and preserves warm; `grep -nE "DialogueOnlyCapabilityProfile|registerVamaShakti|dispatch-guard" Body/S/S4/pi-agent/lib/` returns landings; capability-matrix at `Body/S/S4/plugins/pi-agent/capability-matrix.json` registers `vama_shakti_dialogue_only_invariant: true`.

### Tranche 41.5 — SpacetimeDB Arena tables + projection schema bump *(code-pending-closure; depends on 41.1)*

Extend `Body/S/S3/epi-spacetime-module/src/lib.rs` to add five new tables, reusing identity-handle keying and Coincidence machinery.

```rust
#[spacetimedb(table)]
pub struct ArenaScene {
    #[primarykey] pub scene_key: String,
    pub pinned_coordinate: String,
    pub user_present: bool,
    pub admitted_constitutional: Vec<String>,
    pub kairos_anchor_at_open: u32,
    pub lifecycle_mode_default: String,
    pub cpf_brainstorm_confirmation_token: String,
    pub opened_at_ms: u64,
    pub closed_at_ms: Option<u64>,
    pub privacy_class: String,
}

#[spacetimedb(table)]
pub struct ArenaPresence {
    #[primarykey] pub presence_id: u64,
    #[unique] pub vama_shakti_identity_handle: [u8; 32],  // = vama_shakti_quintessence_hash
    pub scene_key: String,
    pub vama_shakti_coordinate: String,
    pub vama_shakti_class: u8,  // VamaShaktiClass enum value
    pub vama_shakti_clock_position: f32,
    pub lifecycle_mode: String,
    pub admitted_at_ms: u64,
    pub released_at_ms: Option<u64>,
}

#[spacetimedb(table)]
pub struct ArenaTurn {
    #[primarykey] pub turn_id: u64,
    pub scene_key: String,
    pub turn_index: u32,
    pub turn_speaker_handle: String,    // "user" | "constitutional:{name}" | hex(quintessence_hash)
    pub turn_speaker_class: Option<u8>, // VamaShaktiClass when speaker is a vama shakti
    pub turn_address: String,
    pub turn_kairos_delta_json: String,
    pub turn_arrived_at_ms: u64,
}

#[spacetimedb(table)]
pub struct ArenaDialogueLine {
    #[primarykey] pub line_id: u64,
    pub turn_id: u64,
    pub scene_key: String,
    pub dialogue_body_handle: String,    // opaque
    pub vak_address: String,
    pub l5_lens_witness_handle: String,
    pub cited_coordinates_json: String,
    pub emitted_at_ms: u64,
}

#[spacetimedb(table)]
pub struct WarmVamaShakti {
    #[primarykey] pub vama_shakti_identity_handle: [u8; 32],
    pub vama_shakti_coordinate: String,
    pub vama_shakti_class: u8,
    pub psyche_template_revision: [u8; 32],
    pub last_scene_key: String,
    pub q_activity_accumulator_json: String,
    pub turns_participated_count: u32,
    pub scenes_participated_count: u32,
    pub first_warmed_at_ms: u64,
    pub last_active_at_ms: u64,
    pub promotion_proposal_emitted: bool,
}
```

**Coincidence reuse.** When an `ArenaPresence` row enters a scene whose `pinned_coordinate` matches an existing `Coincidence.aspect_grid_cell`, a `CoincidenceTick` is appended noting the Vama Shakti co-presence with classifier — surfaces "the dialogue between Plotinus-as-daemon and Whitehead-as-egregore happened in the same coordinate-cell where your natal Saturn is transiting today."

**Privacy.** `ArenaScene.privacy_class` always `protected_local_handle_only`. Global projection: scene_key + admitted-count + open/closed-status + class-distribution-summary only; no body, no handle, no speaker, no q_activity_accumulator.

**Projection schema bump.** `PROJECTION_SCHEMA_VERSION` from `2026-06-02.s3-projection-v2` to `2026-06-16.s3-projection-v3`.

**Write scope:** `Body/S/S3/epi-spacetime-module/src/lib.rs`, `Body/S/S3/epi-spacetime-module/tests/arena_tables.rs` (new).

**Verification:** `cargo test -p epi-spacetime-module arena_tables_round_trip` passes; insertion test (1 ArenaScene + 3 ArenaPresence × 3 classifiers + 2 ArenaTurn + 2 ArenaDialogueLine) round-trips; classifier discrimination test asserts ArenaPresence carries class byte; privacy-projection test asserts global projection exposes scene_key + count + status + class-distribution only; coincidence-reuse test asserts CoincidenceTick is appended on co-location; `grep -n "PROJECTION_SCHEMA_VERSION.*2026-06-16.s3-projection-v3" Body/S/S3/epi-spacetime-module/src/lib.rs` returns the bump.

### Tranche 41.6 — Gateway routes `m4.arena.*` *(code-pending-closure; depends on 41.4, 41.5)*

Register the arena gateway-route family obeying DR-S5-ONE-1.

**Routes (8):**

| Method | Args | Returns | Backing |
|---|---|---|---|
| `m4.arena.scene_open` | `pinned_coordinate, lifecycle_mode_default, admitted_constitutional, cpf_brainstorm_confirmation_token` | `ArenaSceneHandle` | New ArenaScene row; refuses without CPF token |
| `m4.arena.summon` | `scene_key, entity_coordinate, vama_shakti_class, lifecycle_mode_override?` | `VamaShaktiHandle` | Dispatches to `techne_vama_summon`; appends ArenaPresence |
| `m4.arena.turn_advance` | `scene_key, speaker_handle, intent` | `TurnReceipt` | Anima orchestration computes turn; appends ArenaTurn + ArenaDialogueLine |
| `m4.arena.subscribe` | `scene_key` | `ArenaEventStream` | SpacetimeDB subscription; protected-local stream |
| `m4.arena.scene_close` | `scene_key, closure_intent?` | `ClosureReceipt` | Closes scene; releases ephemeral; emits closure for 41.9; preserves warm |
| `m4.arena.list` | `filter?` | `[ArenaSceneHandle]` | Lists scenes by status / pinned-coordinate / age |
| `m4.arena.vama_list_warm` | `coordinate_filter?, class_filter?` | `[WarmVamaShaktiHandle]` | Warm-vama-shakti inventory; admin-CLI-callable |
| `m4.arena.vama_release_warm` | `vama_shakti_identity_handle, reason` | `ReleaseReceipt` | GC or route to promotion (Tranche 41.11) |

**ONE-substrate compliance per DR-S5-ONE-1.** CLI parity: `epi nara arena scene-open / summon / turn-advance / scene-close / list / vama-list-warm / vama-release-warm / subscribe`. Per DR-VAMA-4: user-facing path is the widget; CLI exists for admin / scripted / test / ONE-substrate compliance. All routes write through Khora session authority. Warm-vama-shakti persistence routes through Tranche 12.03 terminal-backed PI runtime. Redis hierarchical: arena rows cache under `{day}/{session}/arena/{scene_key}/*`.

**Write scope:** `Body/S/S3/gateway-contract/src/lib.rs`, `Body/S/S3/gateway/src/m4_arena.rs` (new), `Body/S/S0/epi-cli/src/nara/arena.rs` (new — admin CLI), `Body/S/S0/epi-cli/tests/gate_m4_arena.rs` (new).

**Verification:** `grep -nE "m4.arena\." Body/S/S3/gateway-contract/src/lib.rs` returns 8 registrations; `grep -nE "epi nara arena" Body/S/S0/epi-cli/src/nara/arena.rs` returns 8 subcommands; `cargo test -p epi-s3-gateway m4_arena_round_trip` passes; refusal test asserts `m4.arena.summon` refuses non-:World coords (DR-VAMA-3) and unknown classifiers (DR-VAMA-6); CPF-gate test asserts `m4.arena.scene_open` refuses without brainstorm token; ONE-substrate compliance test asserts every route has Khora-session-authority enforcement.

### Tranche 41.7 — Theia M4' Arena widget with classifier glyphs *(code-pending-closure; depends on 41.6; consumes Track 25 widget infrastructure)*

Build `Body/M/epi-theia/extensions/m4-nara/src/browser/widgets/dialogical-arena.tsx` as a `ReactWidget`, following Track 25 widget pattern.

**Structure:**
- **Scene-list strip** (top): open arena scenes from `m4.arena.list({status:'open'})`.
- **Scene-detail pane** (center): `pinned_coordinate` chip; admitted Vama Shakti chips with **classifier glyphs** (egregore = ◍ chorus mark; sprite = ✦ spark mark; daemon = ◐ half-circle inscribed; mantra = 〰 wave mark — exact glyphs TBD in 41.1 contract finalization); admitted constitutional chips; user-as-Trika-0 marker; live kairos ring (reuses Tranche 25.16 Mercurius indicator); turn-by-turn dialogue scrollback per turn carrying speaker-chip + classifier-glyph + VAK-address chip + kairos-delta chip + dialogue line; user input region at bottom.
- **Warm-vama-shakti strip** (right rail): warm inventory from `m4.arena.vama_list_warm`; click → admit/release; classifier filter dropdown.
- **Scene-setup wizard** (non-modal per Tranche 32.3 no-modal-invariant): brainstorm-flow with Anima at CPF (00/00); user picks `pinned_coordinate`, Vama Shakti admissions WITH classifier per admission (default suggested from Form's coordinate-family hints; user override), constitutional participation, lifecycle defaults; `m4.arena.scene_open` invoked at bottom of flow.
- **Privacy chrome:** `mext-privacy-protected-local-handle-only`.

**View ID:** `m4.nara.dialogicalArena` (new).

**TRACK_08 export:** `M4DialogicalArenaCard` for plugin-integrated-4-5-0 composition per Tranche 15.4. Mini-modes: badge (active-scene count) / compact-card (current-scene summary with class-distribution chip) / inspector (full arena widget).

**Subscriptions:** `m4.arena.subscribe`; `mercurius.kairos.delta`; `SharedBridgeAdapter.onCoordinateContext`.

**Anti-leak.** Widget MUST NOT call `m4.arena.summon` directly bypassing the scene-setup wizard's Anima brainstorming. Every summon runs through the wizard's CPF (00/00) gate.

**Write scope:** `Body/M/epi-theia/extensions/m4-nara/src/browser/widgets/dialogical-arena.tsx`, `src/common/index.ts` (extend `ALL_VIEW_IDS` + `TRACK_08_EXPORTS`), `src/browser/frontend-module.ts` (register), `style/dialogical-arena.css`, `test/dialogical-arena.test.tsx`.

**Verification:** `pnpm -C Body/M/epi-theia/extensions/m4-nara build` clean; `grep -nE "m4.nara.dialogicalArena|M4DialogicalArenaCard" src/common/index.ts` returns the view id + export; widget render test against fixture `ArenaScene` with 3 Vama Shaktis (one per non-egregore class) + 5 turns; classifier-glyph test asserts each admitted chip carries the correct glyph per `vama_shakti_class`; privacy invariant test asserts `protectedBodiesProjected: false`; CPF-gate test asserts wizard refuses without brainstorm confirmation.

### Tranche 41.8 — Anima arena orchestration with classifier-aware turn routing *(code-pending-closure; depends on 41.4, 41.5, 41.6)*

Patch `Body/S/S4/ta-onta/S4-4p-anima/extension.ts` to add `anima_arena_orchestrate(scene_key)` with the canonical classifier-aware turn-routing policy.

**Tool:**

```typescript
anima.registerTool({
  name: 'anima_arena_orchestrate',
  description: 'Orchestrate classifier-aware turn routing within an active arena scene. CPF (00/00) gated at scene-setup; CPF (0/1/2) Trika operational during turn loop.',
  schema: { scene_key: string, intent?: string },
  handler: async (req, ctx) => {
    // 1. Resolve ArenaScene + admitted Vama Shaktis (with class) + user
    // 2. Read kairos_delta from Mercurius
    // 3. Decide next speaker per classifier-aware turn-routing policy (below)
    // 4. Dispatch (vama shakti → 41.4 dispatch-guard, dialogue-only;
    //              constitutional → standard Anima; user → UI input)
    // 5. Append ArenaTurn + ArenaDialogueLine
    // 6. Emit observability event
  },
});
```

**Turn-routing policy (canonical, classifier-aware, encoded as pure testable function):**

1. User input pending → user-turn next (Trika-0 priority)
2. Else if previous turn was user AND any admitted **daemon-class** present → daemon speaks (maieutic law)
3. Else if kairos_delta > sprite_threshold AND any admitted **sprite-class** present → sprite speaks (kairos-burst law)
4. Else if kairos_anchor crossed mantra_threshold AND any admitted **mantra-class** present → mantra speaks (kairotic-threshold law)
5. Else if previous turn's `cited_coordinates` include an admitted Vama Shakti not yet spoken → that Vama Shakti speaks (response-to-citation law)
6. Else if Sophia admitted AND `turn_index ≥ scene_close_threshold` → Sophia synthesizes
7. Else round-robin among admitted Vama Shaktis; **egregore-class** allowed longer turn-length budget

**Class-specific turn budgets** (configurable thresholds in `~/.epi-logos/config.toml [arena.classifier]`):
- `egregore.turn_length_multiplier = 2.5` (chorus-grain needs longer turns)
- `sprite.kairos_burst_threshold_delta = 0.30` (kairos delta needed to trigger sprite)
- `daemon.maieutic_question_form_bias = 0.75` (probability of routing to question-form)
- `mantra.kairos_threshold_crossing_threshold = 0.50`

**Mercurius subscription.** Orchestrator subscribes to `mercurius.kairos.delta` for scene lifetime; each delta updates accumulated kairos state; routing policy reads.

**CPF (00/00) gate enforcement.** Orchestrator refuses without `cpf_brainstorm_confirmation_token` from `ArenaScene`.

**Write scope:** `Body/S/S4/ta-onta/S4-4p-anima/extension.ts`, `Body/S/S4/ta-onta/S4-4p-anima/lib/arena-orchestrator.ts` (new — turn-routing policy as pure function), `Body/S/S4/ta-onta/S4-4p-anima/tests/arena-orchestrator.test.ts` (new).

**Verification:** `pnpm --filter @epi-logos/anima test` passes; turn-routing policy test asserts each canonical branch produces expected next-speaker for fixture inputs covering all 4 classifiers; classifier-specific behavior test asserts daemon-class triggered post-user, sprite-class triggered on kairos delta, mantra-class triggered on kairos threshold-crossing, egregore-class gets longer turn budget; Mercurius subscription test asserts kairos-delta updates routing state; CPF-gate test asserts refusal without token; dialogue-only enforcement test asserts Vama Shakti dispatch routes through 41.4 dispatch-guard.

### Tranche 41.9 — Moirai closure-distillation with classifier-modulated edge patterns *(code-pending-closure; depends on 41.6, 41.8; cross-link CCT-17)*

Add `moirai_arena_distill(scene_key)` — closure-distillation routine running on `m4.arena.scene_close` and metabolising the dialogue transcript into Graphiti episodes + classifier-modulated typed graph edges.

**Patch Moirai profile.** `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/moirai.md §5 Capability`:

> - `arena_closure_distillation` (per Track 41.9) — Moirai's GraphRAG-distillation (Klotho/Lachesis/Atropos) techne extends to arena dialogue closure. On `m4.arena.scene_close`, Moirai is dispatched by Anima at Aletheia-crystallisation-mode (CF2 gate); the dialogue transcript is compressed-through-VAK per CCT-17 + DR-COMP-1; the compressed form is added as a Graphiti episode under `group_id = arena:{arc_id}`; cited-coordinate edges are written per classifier-modulated pattern per DR-VAMA-6. This is **Jungian amplification operationalised**.

**Tool:**

```typescript
moirai.registerTool({
  name: 'moirai_arena_distill',
  description: 'Closure-distill an arena scene to Graphiti episodes + classifier-modulated graph edges. Jungian amplification routed back to canon. Anima-dispatched at scene_close during Aletheia-crystallisation-mode.',
  schema: { scene_key: string },
  handler: async (req, ctx) => {
    // 1. Read all ArenaDialogueLine + ArenaTurn rows for scene_key
    // 2. Resolve dialogue_body_handle locally (privileged closure path)
    // 3. compress_through_VAK(transcript) per CCT-17 + DR-COMP-1
    // 4. graphiti_service.add_episode(
    //      name = f"arena:close:{scene_key}",
    //      episode_body = vak_compressed_transcript,
    //      source_description = f"agent:moirai:arena_distill:cpf={scene.pinned_coordinate}:classifiers={class_distribution}",
    //      group_id = f"arena:{arc_id}",
    //      reference_time = scene.closed_at_ms,
    //    )
    // 5. For each cited_coordinate, write ARENA_DIALOGUE_OF edge with edge-pattern per speaker's vama_shakti_class:
    //      egregore: multi-edge fan-out — one edge per constituent reference coordinate of the egregore
    //      sprite:   single sparse high-resonance edge with high weight
    //      daemon:   edge from cited_coord weighted by USER's cited_coordinates rather than daemon's own
    //      mantra:   edge lands at element/chakra/decan coordinate (M2' planetary-tattva sub-namespace) instead of semantic-content coord
    // 6. For each Vama-Shakti pair with ≥ N exchange turns: DIALOGICAL_RESONANCE_AT edge (a→b, properties: scene_key, kairos_anchor, class_pair)
    // 7. Return distillation receipt with episode id + edge count by class
  },
});
```

**Graph-edge schema.** Add to `Body/S/S2/graph-schema/src/lib.rs`:

```rust
pub const ARENA_DIALOGUE_OF: &str = "ARENA_DIALOGUE_OF";
pub const DIALOGICAL_RESONANCE_AT: &str = "DIALOGICAL_RESONANCE_AT";
// Edge properties include: vama_shakti_class (speaker's class for ARENA_DIALOGUE_OF)
//                          class_pair (for DIALOGICAL_RESONANCE_AT)
```

These join `c_1_relation_family` per DR-IG-1.

**Write scope:** `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/moirai.md` (patch), `Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts` (register), `Body/S/S5/epi-gnostic/epi_gnostic/arena_distillation.py` (new), `Body/S/S2/graph-schema/src/lib.rs` (relation constants + class properties), `Body/S/S4/ta-onta/S4-5p-aletheia/tests/arena_distill.test.ts` (new).

**Verification:** `grep -nE "ARENA_DIALOGUE_OF|DIALOGICAL_RESONANCE_AT" Body/S/S2/graph-schema/src/lib.rs` returns constants; `grep -nE "moirai_arena_distill|arena_closure_distillation" Body/S/S4/ta-onta/S4-5p-aletheia/extension.ts Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/moirai.md` returns registrations; `pnpm --filter @epi-logos/aletheia test` passes; closure-distill test runs a fixture scene (3 Vama Shaktis one per class + 9 turns) asserting: 1 Graphiti episode under correct group_id, edge patterns match classifier rules (egregore fan-out edges, sprite single-edge, daemon user-weighted, mantra element-axis), pairwise class_pair edges land; cross-validate `compress_through_VAK` invoked; `pytest Body/S/S5/epi-gnostic/tests/test_arena_distillation.py -q` passes.

### Tranche 41.10 — Warm Vama Shakti persistence + classifier-specific Q_activity accumulation *(code-pending-closure; depends on 41.4, 41.5, 41.9)*

Implement warm-vama-shakti lifecycle. Warm-mode Vama Shaktis persist across scenes; Q_activity accumulator grows per turn per classifier-specific perturbation rule (per Tranche 41.3 `perturb_q_activity` class branch).

**Warm resurfacing.** On `m4.arena.summon` for an `identity_handle` in `WarmVamaShakti`:
- Load existing `Q_activity_accumulator`
- Compose `Q_composed_at_now = Q_identity * Q_transit(now) * Q_activity_accumulator`
- Recompute rūpa specialization from current `psyche_template_revision`; if newer than warm row's revision, set `psyche_template_revision_drift` on ArenaPresence
- Vama Shakti enters scene "remembering" prior trajectories; co-admitted Vama Shaktis observe accumulated state

**CLI admin surface (per DR-VAMA-4):**
- `epi nara arena vama list-warm [--coordinate <coord>] [--class <egregore|sprite|daemon|mantra>] [--age-gte <ms>]`
- `epi nara arena vama warm <coordinate> --class <classifier>` — pre-warm
- `epi nara arena vama release <identity_handle> [--reason gc|promote]` — release or route to 41.11

**Write scope:** `Body/S/S0/portal-core/src/vama_shakti.rs` (extend with accumulator state structs + class-branch perturbation), `Body/S/S3/gateway/src/m4_arena.rs` (warm-mode resurfacing), `Body/S/S0/epi-cli/src/nara/arena.rs` (admin commands), `Body/S/S0/portal-core/tests/q_activity_accumulator.rs` (new).

**Verification:** `cargo test -p epi-portal-core --test q_activity_accumulator` passes; class-specific perturbation determinism test asserts identical sequences produce identical accumulator state per class; warm-resurfacing test (warm vama shakti, 4 turns, scene close, resurface) asserts Q_composed reflects accumulated state; template-revision-drift test asserts flag is set on resurface against newer psyche.md; admin CLI test passes; class-filter test asserts `epi nara arena vama list-warm --class sprite` returns only sprite-class entries.

### Tranche 41.11 — Promotion path: warm Vama Shakti → Hen canon update *(spec-ahead-integration; depends on 41.10; cross-link Track 40)*

Land warm → promoted → canon lifecycle. When a warm Vama Shakti crosses **classifier-specific** thresholds (per DR-VAMA-6 promotion threshold profile column), augmented-rūpa proposal flows back to Hen via M4-5' Review/Promotion path and lands as a Track 40 CU-ENTITY row.

**Promotion triggers.** `~/.epi-logos/config.toml [arena.promotion]`:

```toml
[arena.promotion.egregore]
turns_threshold = 60         # higher — egregores need more dialogue
scenes_threshold = 6
q_activity_magnitude_threshold = 0.40
augmentation_target = "form_text"  # text augmentation

[arena.promotion.sprite]
turns_threshold = 15         # lower — sprites earn fast through flash
scenes_threshold = 2
q_activity_magnitude_threshold = 0.25
augmentation_target = "form_text"

[arena.promotion.daemon]
turns_threshold = 30
scenes_threshold = 4
q_activity_magnitude_threshold = 0.40
augmentation_target = "form_text"
user_response_quality_required = true  # daemon promotion requires user-witness

[arena.promotion.mantra]
turns_threshold = 30
scenes_threshold = 8         # higher scenes — mantras slow-accrete
q_activity_magnitude_threshold = 0.50
augmentation_target = "element_signature"  # element-shift not text-shift

auto_propose = false  # surface proposal to user via M4' widget when false
```

**Proposal payload.** Carries original `vama_shakti_coordinate`, `vama_shakti_class`, `psyche_template_revision`, accumulated `Q_activity_accumulator`, distilled VAK-address signature, citation-coordinate frequency, pairwise resonance summary, **classifier-class-appropriate** augmentation patch (`form_text` for egregore/sprite/daemon; `element_signature` for mantra).

**M4-5' routing.** Sophia (CT5) + Psyche (CT4a/CT4b) co-govern review. On accept:
1. CU-ENTITY row in Track 40 (with `vama_shakti_class` provenance)
2. Form .md patch routed to Hen per CCT-14; attribution `<!-- augmented from arena lifecycle T{turns}_S{scenes}_M{magnitude}_class{vama_shakti_class} -->`
3. WarmVamaShakti `promotion_status: 'accepted'`

On reject: archive to `Idea/Empty/Pratibimba/arena-promotion-archive/{date}-{coord}-{class}-{hash}.md`; warm row `promotion_status: 'rejected'`.

**Write scope:** `Body/S/S0/epi-cli/src/nara/arena.rs` (extend with `epi nara arena vama propose-promotion`), `Body/S/S4/ta-onta/S4-1p-hen/extension.ts` (extend entity-candidate lifecycle for arena-promotion intake per CCT-14), `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/40-bimba-canon-update-ledger.md` (extend §Lifecycle with arena-promotion intake flow; document class-specific augmentation_target field), `Body/S/S5/epi-gnostic/epi_gnostic/arena_promotion.py` (new — class-appropriate proposal-payload + augmentation-patch generation).

**Verification:** `grep -nE "arena-promotion|promotion_proposal_emitted|vama_shakti_class" Body/S/S4/ta-onta/S4-1p-hen/extension.ts` returns integration; `grep -nE "ARENA.*intake|arena-promotion|vama_shakti" 40-bimba-canon-update-ledger.md` returns the new intake-flow doc; `pytest Body/S/S5/epi-gnostic/tests/test_arena_promotion.py -q` passes; classifier-specific threshold-firing test asserts proposal emits per class profile; mantra-class element-signature augmentation test asserts patch targets element-axis instead of form-text; non-overwriting augmentation test asserts patches preserve prior content + carry class provenance comment.

### Tranche 41.12 — End-to-end acceptance harness with classifier coverage *(code-pending-closure; depends on 41.2..41.11)*

Full e2e harness proving Factory + Arena substrate works as one coordinated system across all four classifiers.

**Scenario.** Use four `:World` Form entities (or seed synthetic Forms) — one chosen as a natural fit per classifier:

1. NOW-bound session; gateway start; Khora session authority verified.
2. `m4.arena.scene_open(pinned_coordinate="C5", lifecycle_mode_default="ephemeral", admitted_constitutional=["Sophia"], cpf_brainstorm_confirmation_token=<test-token>)`. Assert CPF gate.
3. Summon four Vama Shaktis, one per classifier: `m4.arena.summon(scene_key, E1, "egregore")`, `(E2, "sprite")`, `(E3, "daemon")`, `(E4, "mantra")`. Assert determinism per DR-VAMA-2: re-summon same coord+class in fresh scene → same `vama_shakti_quintessence_hash`; same coord different class → DIFFERENT hash (DR-VAMA-6 classifier-byte-in-hash invariant).
4. Subscribe via `m4.arena.subscribe`.
5. Advance 16 turns covering each classifier-routing branch: post-user turn → daemon (branch 2); kairos delta spike → sprite (branch 3); kairos threshold crossing → mantra (branch 4); cited-coord response → response-to-citation (branch 5); turn budget → egregore gets longer turn (branch 7). Assert each `ArenaDialogueLine` carries correct `vak_address` + speaker `class`; assert dialogue-only-refusal on attempted system-tool invocation by any Vama Shakti.
6. Close scene. Assert Moirai distillation: 1 Graphiti episode under correct group_id; classifier-modulated edge patterns landed correctly (egregore fan-out; sprite sparse; daemon user-weighted; mantra element-axis); pairwise resonance edges with `class_pair` properties; ephemeral entities released.
7. Warm-lifecycle scenario: scope to one classifier (e.g., daemon-class), simulate 4 scenes × 8 turns each; assert classifier-specific Q_activity accumulation; assert resurfacing carries accumulated state per class-specific perturbation rule.
8. Promotion scenario per classifier: configure each classifier's thresholds at minimal values; trigger; assert proposal payload carries classifier-appropriate `augmentation_target`; assert CU-ENTITY row in Track 40 with class provenance; mantra-class case asserts element-signature augmentation (not text).
9. Privacy assertion: `global_temporal_surface` never carries body/handle/speaker/q_activity throughout — only scene_key + counts + status + class-distribution-summary.

**Real artifacts:** real `SessionStore`, real Graphiti (skip when Neo4j unavailable), real SpacetimeDB test bridge, real PASU read, real Mercurius signal-relay (kairos-stub mode acceptable per FR-3).

**Write scope:** `Body/S/S0/epi-cli/tests/arena_vama_shakti_e2e.rs` (new), `Body/S/S5/epi-gnostic/tests/test_arena_e2e_distillation.py` (new), fixture files under `Body/S/S0/epi-cli/tests/fixtures/arena/` for E1-E4 synthetic Forms.

**Verification:** `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test arena_vama_shakti_e2e` passes in live-capable environments; contract-fallback tests pass otherwise; m-dev evidence string includes real test counts + live/skipped status; `rg -n "DR-VAMA-1|DR-VAMA-2|DR-VAMA-3|DR-VAMA-4|DR-VAMA-5|DR-VAMA-6" Body/S/S0/epi-cli/tests Body/S/S5/epi-gnostic/tests` shows each DR has explicit invariant-test assertions; classifier-coverage test asserts all 4 classes exercised in routing/distillation/promotion paths.

## Cross-track hooks

- **Track 12 Agentic Layer (S4 ↔ S5)** — Track 41 is canonical home of the Vama Shakti Factory. Track 12 Pleroma-Techne section gains cross-link to Tranche 41.2 declaring `techne_vama_summon`. Anima orchestration extended by Tranche 41.8. Moirai GraphRAG-distillation extended by Tranche 41.9. Psyche profile patched per Tranche 41.2. Constitutional CT0-CT5 mapping per DR-EROS-1 read by Tranche 41.3 for rūpa Frame Contract specialisation.
- **Track 25 M4 Nara Frontend Deep** — Track 41 adds `dialogical-arena.tsx` widget under existing `m4-nara` scaffold; Track 25 widget-ownership pattern + privacy chrome + TRACK_08 discipline applies verbatim. Arena widget consumes kairos-display (25.15), Mercurius relay (25.16), privacy-class chrome (25.18), personal-cymatic-field renderer (25.6) for entity-presence visualization.
- **Track 39 S5' ONE Substrate** — Track 41 `m4.arena.*` family obeys DR-S5-ONE-1 strictly. DR-COMP-1 `compress_through_VAK()` invoked by Tranche 41.9. DR-WORLD-1 `:World` + `s5'.gnostic.resolve` consumed by Tranche 41.2 + 41.3.
- **Track 40 Bimba Canon Update Ledger** — Tranche 41.11 writes CU-ENTITY rows with `vama_shakti_class` provenance; Track 40 §Lifecycle gains `arena-promotion` intake flow + `augmentation_target` field documenting class-specific augmentation (form_text vs element_signature). Track 40 also gains a CU-VOCAB row for Vama Shakti canonical name (referencing this track + the seed).
- **Track 16 Cross-Cutting Closures** — Tranche 41.9 invokes CCT-17 `compress_through_VAK()`. CCT-14 entity-candidate lifecycle extended by Tranche 41.11.
- **Track 14 No-Orphan Audit + Release Gates** — Track 41 contributes new audit subjects: `m4.nara.dialogicalArena` view id (41.7), four SpacetimeDB Arena tables + `WarmVamaShakti` (41.5), `techne_vama_summon` registration (41.2), classifier enum + behavioral implementations (41.3, 41.5, 41.8, 41.9), six DR-VAMA rows (already in Track 13 VALIDATED). Release gate G14 verifies all owned.

## Execution sequence (Track 41 internal dependency order)

```
                            41.1 (contract; blocks all)
                             |
              +--------------+--------------+
              |              |              |
            41.3           41.2           41.5
       (vama_shakti.rs  (techne_vama_  (SpacetimeDB tables
        + classifier     summon + Psyche  + WarmVamaShakti)
        impl)            patch)
              |              |              |
              +------+-------+              |
                     |                       |
                   41.4                    41.6
            (ad-hoc PI registration   (gateway routes
             + dispatch-guard)          m4.arena.* + admin CLI)
                     |                       |
                     +-----+-------+---------+
                           |       |
                          41.7   41.8         41.9
                       (M4'    (Anima      (Moirai
                       widget) classifier- classifier-
                              aware       modulated
                              routing)    edges)
                                   |              |
                                   +------+-------+
                                          |
                                        41.10
                                  (warm + class-specific
                                   Q_activity perturb)
                                          |
                                        41.11
                                  (class-specific
                                   promotion paths)
                                          |
                                        41.12
                                  (e2e: 4-class coverage)
```

## Open verification subjects for Tranche 14 (release gates)

- Every `m4.arena.*` route has CLI parity + Khora session authority + ONE-substrate compliance.
- DR-VAMA-1..6 VALIDATED in Track 13 (no PROPOSED gating).
- No standalone arena Theia extension (DR-VAMA-4 invariant); widget under `m4-nara`.
- `dialogical-arena.tsx` carries protected-local-handle-only chrome; no observability event carries raw dialogue.
- Dispatch-guard 41.4 tested with non-dialogue tool refusal for ad-hoc Vama Shakti.
- WarmVamaShakti privacy: `q_activity_accumulator_json` never reaches global projection.
- Moirai distillation episode reachable via `s5'.gnostic.episode_search(query, vak_filter='arena')`.
- `m4.nara.dialogicalArena` view id orphan-audit row present + owned (41.7).
- All four `vama_shakti_class` values exercised in classifier-modulated edge patterns (41.9), turn routing (41.8), promotion targets (41.11), e2e harness (41.12).
- Classifier byte present in `vama_shakti_quintessence_hash` derivation (DR-VAMA-6) — verifiable by re-derivation test with classifier byte mutation producing distinct hash.
