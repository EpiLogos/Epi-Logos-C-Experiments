# AGENTS.md — gateway-contract

## Purpose
`epi-s3-gateway-contract`: "S3 gateway protocol and method contract for Epi-Logos" (Cargo.toml `description`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S3-SPEC]] (see also [[S3-ARCHITECTURE]], [[S-SYSTEM-INDEX]])

## Ownership
- `src/lib.rs` — crate root; declares + re-exports every contract module, typed [[S0]] bridge packet/projection surfaces, named S1 C-first type lifecycle methods, and named S2 graph gateway-exposure constants. Carries the 43.2 `//!` Coordinate Header (17.T17.1); the `m4.arena.` method literals stay in this file per the 41.T41.6 verification grep.
- `src/protocol.rs` — wire protocol (handshake / RPC envelope) and method-name registry, including phase-preserving `s5'.gnostic.resolve` / `s0'.anuttara.trace`, `s5'.gnostic.musical_transcript`, the live `kernelBridge.m3.lensCodonBinary(lensId)` S0-product adapter, `s2.graph.ananda_position`, the S1 C-first type lifecycle methods, and the S2 graph exposure family (`gds.tangent_overlay`, `ontology.reload`, `seed.snapshot`, `core65.audit`, `promotion.*`, `relation_family.list`).
- `src/session.rs` — session authority types/methods.
- `src/harness.rs` — normalized harness dispatch envelope, turn-event stream, backing-kind, parent-slice handle (`ConversationSliceHandle`/`VakAddressFilter` defined here so they ride the dispatch envelope), and tool-call enforcement hook contract.
- `src/context.rs` — canonical contextual-slice surface (12.T12.31): re-exports `ConversationSliceHandle`/`VakAddressFilter`, adds the [[SessionRecord]]-derived builder, the three `SliceRedactionPolicy` levels, the `dispatch_with_parent_slice` contract row, and the [[chronos]] `c=1`/`c=0` bifurcation-router seat.
- `src/dispatch_plan.rs` — dispatch plan contract (largest module), including resolve/trace ownership rows.
- `src/spacetime.rs` — SpacetimeDB presence-layer contract.
- `src/being_pattern.rs` — CCT-21 BeingPattern live-state method names, stream event/projection carriers, replay fixture, and public-safe guard.
- `src/kernel_bridge.rs` — S0 kernel bridge contract.
- `src/nara_pattern.rs` — typed PatternPacket edge for the nara-session close seam (rerun 05.T5.11, Track 16/18 typed-JSON-edge law): `NaraPatternPacket`/`MahamayaTranscription` type the live `route_nara_session_close` JSON; §5.11 preserved refs (`oracle_frame_ref`, `symbolic_protein_ref`, `vak_address`, `deck_context`, `sequence_mode`, packet refs, graph provenance, review state) are typed-optional until that seam stamps them; `assert_pattern_packet_identity_safe` refuses Q_identity / M4-0 branch-evidence payloads at the edge. Envelope law lives in [[Body/S/S0/portal-core]] `src/nara/`.
- `src/s1_vault.rs` — S1 vault method contract, including vault/semantic receipts, `S1VaultRenameRefusalReason::CoordinateResidencyMismatch`, plus C-first type lifecycle receipts for `s1'.type.classify_c_layer`, `s1'.entity.promote_to_type`, and `s1'.world.graduate`, and the CCT-14 entity-candidate lifecycle surface (`s1'.entity.capture/classify/list`, `s1'.world.list_entities` — `S1EntityCaptureRequest/Receipt`, `S1EntityClassifyRequest/Receipt`, `S1EntityListEntry/Receipt`; `S1_ENTITY_LIFECYCLE_METHODS` groups all six, each an `S1HenAdapter` dispatch-plan row paired with an `epi entity`/`epi world` CLI command per [[DR-S5-ONE-1]]).
- `src/graphiti.rs`, `src/temporal.rs`, `src/privacy.rs`, `src/portal_events.rs`, `src/release.rs` — Graphiti, temporal, privacy, portal-event, and release-gate contracts.
- `src/verifier.rs` — `s0'.verifier.{check_state,emit_query,validate_membership,owl_query}` method contract plus typed-query / membership / OWL request DTOs.
- `src/tests.rs` (cfg-test) + `tests/hermes_inspired_contracts.rs` + `tests/harness_envelope_roundtrip.rs` + `tests/vak_phase_resolve_contract.rs` — contract tests.
- Does NOT own runtime behaviour — that is sibling `gateway/` (`epi-s3-gateway`). Domain law for other layers stays in its owning coordinate ([[S4-SPEC]] dispatch, [[S2-SPEC]] graph, [[S5-SPEC]] world-return), not here by convenience.

## Local Contracts
- Code Coordinate Header: `src/lib.rs` `//!` module-doc (43.2 convention); Cargo.toml `description` mirrors the one-liner (no CONTRACT.md / README.md here).
- Owning specs: [[S3-SPEC]], [[S3-ARCHITECTURE]].
- Deps (Cargo.toml): `epi-kernel-contract`, `portal-core`.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings (this is a shared contract crate — broad blast radius).
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo test --manifest-path Body/S/S3/gateway-contract/Cargo.toml --test being_pattern_live_state` for CCT-21; `cargo test --manifest-path Body/S/S3/gateway-contract/Cargo.toml --test vak_phase_resolve_contract` for phase-preserving resolve/trace routes; `cargo test -p epi-s3-gateway-contract --test harness_envelope_roundtrip` from this crate root for Track 42 harness contracts; `cargo test -p epi-s3-gateway-contract` only in a workspace that includes this excluded crate; or `make rust-test` from repo root.

## Child DOX Index
- (leaf)
