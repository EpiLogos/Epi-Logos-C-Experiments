# AGENTS.md — gateway-contract

## Purpose
`epi-s3-gateway-contract`: "S3 gateway protocol and method contract for Epi-Logos" (Cargo.toml `description`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S3-SPEC]] (see also [[S3-ARCHITECTURE]], [[S-SYSTEM-INDEX]])

## Ownership
- `src/lib.rs` — crate root; declares + re-exports every contract module, typed [[S0]] bridge packet/projection surfaces, `VAULT_DAY_ENSURE_METHOD` / `KHORA_SESSION_START_METHOD`, the governed [[M4']] `NARA_TRANSFORM_*` lifecycle, the [[M3']] `S2_CODON_AA_LOOKUP_METHOD`, named S1 C-first type lifecycle methods, named S2 graph gateway-exposure constants, `s5.oracle.iching.cast`, and the `s5'.tune.*` / `s5'.tune.proposals.*` contract constants. Carries the 43.2 `//!` Coordinate Header (17.T17.1); the `m4.arena.` method literals stay in this file per the 41.T41.6 verification grep.
- `src/protocol.rs` — wire protocol (handshake / RPC envelope) and method-name registry, including phase-preserving `s5'.gnostic.resolve` / `s0'.anuttara.trace`, `s5'.gnostic.musical_transcript`, the governed [[M4']] `nara.transform.{start,advance}` lifecycle, the governed [[M3']] `s5.oracle.iching.cast` route, `s2.codon.aa_lookup`, `s5'.tune.proposals.{list,resolve}`, the live `kernelBridge.m2.epogdoonProjection(address72)`, `kernelBridge.m2.planetaryElementalWeights()`, `kernelBridge.m3.lensCodonBinary(lensId)`, and `kernelBridge.m3.lensField(lensId)` (generic lens-field dynamic: structure + live activation for all 16+1 lenses, pleromatic symbolic system at lens 6) S0-product adapters, `s2.graph.ananda_position`, the S1 C-first type lifecycle methods, and the S2 graph exposure family (`gds.tangent_overlay`, `ontology.reload`, `seed.snapshot`, `core65.audit`, `promotion.*`, `relation_family.list`).
- `S2_GRAPH_LIST_METHOD` / `S2_GRAPH_LIST_BY_FILTER_METHOD` / `S2_GRAPH_GATEWAY_EXPOSED_METHODS` — registers `s2.graph.list` as the read-only [[M0]] residual-browser route and its sibling `s2.graph.list_by_filter` as the Track 48 §13.E coordinate-scoped base-view data layer (over `CoordinateRetrieval` in `Body/S/S2/graph-services`; dispatched by the S0 `gate::graph::dispatch_graph_method` host arm), and keeps dispatch-plan and live hello advertisement in parity. `KERNEL_BRIDGE_M2_CYMATIC_MONOPOLY_STATE_METHOD` owns the public C-backed cymatic state literal.
- `src/session.rs` — session authority types/methods.
- `src/harness.rs` — normalized harness dispatch envelope, turn-event stream, backing-kind, parent-slice handle (`ConversationSliceHandle`/`VakAddressFilter` defined here so they ride the dispatch envelope), and tool-call enforcement hook contract.
- `src/context.rs` — canonical contextual-slice surface (12.T12.31): re-exports `ConversationSliceHandle`/`VakAddressFilter`, adds the [[SessionRecord]]-derived builder, the three `SliceRedactionPolicy` levels, the `dispatch_with_parent_slice` contract row, and the [[chronos]] `c=1`/`c=0` bifurcation-router seat.
- `src/dispatch_plan.rs` — dispatch plan contract (largest module), including resolve/trace ownership rows.
- `src/spacetime.rs` — SpacetimeDB presence-layer contract.
- `src/being_pattern.rs` — CCT-21 BeingPattern live-state method names, stream event/projection carriers, replay fixture, and public-safe guard.
- `src/kernel_bridge.rs` — S0 kernel bridge contract.
- `src/nara_pattern.rs` — typed PatternPacket edge for the nara-session close seam (rerun 05.T5.11, Track 16/18 typed-JSON-edge law): `NaraPatternPacket`/`MahamayaTranscription` type the live `route_nara_session_close` JSON; §5.11 preserved refs (`oracle_frame_ref`, `symbolic_protein_ref`, `vak_address`, `deck_context`, `sequence_mode`, packet refs, graph provenance, review state) are typed-optional until that seam stamps them; `assert_pattern_packet_identity_safe` refuses Q_identity / M4-0 branch-evidence payloads at the edge. Envelope law lives in [[Body/S/S0/portal-core]] `src/nara/`.
- `src/s1_vault.rs` — S1 vault method contract, including typed `s1'.base.ensure` request/receipt/view shapes, vault/semantic receipts, `S1VaultRenameRefusalReason::CoordinateResidencyMismatch`, plus C-first type lifecycle receipts for `s1'.type.classify_c_layer`, `s1'.entity.promote_to_type`, and `s1'.world.graduate`, and the CCT-14 entity-candidate lifecycle surface (`s1'.entity.capture/classify/list`, `s1'.world.list_entities` — `S1EntityCaptureRequest/Receipt`, `S1EntityClassifyRequest/Receipt`, `S1EntityListEntry/Receipt`; `S1_ENTITY_LIFECYCLE_METHODS` groups all six). `s1'.base.ensure` and `s1'.q_articulation.accept` are separate `S1HenAdapter` routes; Q acceptance remains human-gated and never promotes a candidate file.
- `src/graphiti.rs`, `src/temporal.rs`, `src/privacy.rs`, `src/portal_events.rs`, `src/release.rs` — Graphiti, temporal, privacy, portal-event, and release-gate contracts.
- `src/verifier.rs` — `s0'.verifier.{check_state,emit_query,respond_question,validate_membership,owl_query}` method contract plus typed-query, protected-local symbolic response/receipt, membership, and OWL DTOs. `respond_question` requires the profile generation that emitted the question, treats source/session values as client claims rather than authentication, returns the S3 parser-skill-shaped coordinate summary and an opaque persisted-response id, and never claims re-verification from free text alone. Canon update flag: [[S3-SPEC]], [[S0-SPEC]], and [[M0'-SPEC]].
- `src/tests.rs` (cfg-test) + `tests/hermes_inspired_contracts.rs` + `tests/harness_envelope_roundtrip.rs` + `tests/vak_phase_resolve_contract.rs` — contract tests.
- Does NOT own runtime behaviour — that is sibling `gateway/` (`epi-s3-gateway`). Domain law for other layers stays in its owning coordinate ([[S4-SPEC]] dispatch, [[S2-SPEC]] graph, [[S5-SPEC]] world-return), not here by convenience.

## Local Contracts
- Code Coordinate Header: `src/lib.rs` `//!` module-doc (43.2 convention); Cargo.toml `description` mirrors the one-liner (no CONTRACT.md / README.md here).
- Owning specs: [[S3-SPEC]], [[S3-ARCHITECTURE]].
- Canon update flag: [[S3-SPEC]], [[S0-SPEC]], [[S1-SPEC]], [[S4-SPEC]], [[M2'-SPEC]], [[M3'-SPEC]], and [[M4'-SPEC]] should record the admitted public `vault.day.ensure`, `khora.session_start`, `kernelBridge.m2.epogdoonProjection(address72)`, `kernelBridge.m2.cymaticMonoPolyState(address72)`, `kernelBridge.m2.planetaryElementalWeights()`, `s2.codon.aa_lookup`, `s5.oracle.iching.cast`, and `nara.transform.{start,advance}` routes; day ensure is classified through the [[S1]] Hen/vault boundary, Khora start through [[S4]] orchestration, codon lookup through the C-backed [[M3]] transcription authority, and the I-Ching route through [[S5]] governance.
- Deps (Cargo.toml): `epi-kernel-contract`, `portal-core`.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings (this is a shared contract crate — broad blast radius).
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo test --manifest-path Body/S/S3/gateway-contract/Cargo.toml --test being_pattern_live_state` for CCT-21; `cargo test --manifest-path Body/S/S3/gateway-contract/Cargo.toml --test vak_phase_resolve_contract` for phase-preserving resolve/trace routes; `cargo test -p epi-s3-gateway-contract --test harness_envelope_roundtrip` from this crate root for Track 42 harness contracts; `cargo test -p epi-s3-gateway-contract` only in a workspace that includes this excluded crate; or `make rust-test` from repo root.

## Child DOX Index
- (leaf)
