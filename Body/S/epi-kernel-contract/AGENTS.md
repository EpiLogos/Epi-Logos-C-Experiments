# AGENTS.md — epi-kernel-contract

## Purpose
"Parent-role kernel-aligned contract layer for Epi-Logos: KernelTickEnvelope, TrajectoryDeposit, AnuttaraDiagnostic, PhysicalPoleState, MentalPoleState" (Cargo.toml `description`). This crate is the **S-stack root contract** at `Body/S/` — sibling to S0..S5, not an S0 member (per DR-S0-1).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S-SYSTEM-INDEX]]

## Ownership
- `src/lib.rs` — crate root / public surface; re-exports `portal-core` primitives, declares the 7 contract modules
- `src/envelope.rs` — `KernelTickEnvelope` (braids tick/energy/resonance/poles), `ENVELOPE_COORDINATE_OWNER`, `ENVELOPE_PRIVACY_CLASS`
- `src/deposit.rs` — `TrajectoryDeposit` / `TrajectoryDepositRef` / `TrajectoryElement` (graphiti episodic shape at `#4.4.4.4-{anchor}`)
- `src/diagnostic.rs` — `AnuttaraDiagnostic`, `AnuttaraExpression`, `AnuttaraParseError`
- `src/poles.rs` — `PhysicalPoleState` (1-2-3 engine), `MentalPoleState` (4-5-0 intelligence), activation/clock/weights types
- `src/analysis.rs`, `src/constraint.rs`, `src/ingestion.rs` — resonance analysis, verifier/constraint registry, ingestion session shapes
- `Cargo.toml`, `Cargo.lock` — crate manifest; depends on `portal-core` (S0)
- Does NOT own algorithms: math lives in `portal-core`; kernel evaluation/deposit/verification live in the per-S subsystem crates (lib.rs doc-header). This crate holds **shapes plus invariant constructors** only.

## Local Contracts
- Coordinate Header: `src/lib.rs` `//!` doc-comment (the binding description of every exported shape)
- Owning spec: [[S-SYSTEM-INDEX]] (S-stack root); [[S0-SPEC]] / [[S0-ARCHITECTURE]] for the `portal-core` primitives it re-exports
- No local `CONTRACT.md` (none yet — see Canon)

## Work Guidance
- Run `gitnexus_impact({target, direction:"upstream"})` before editing any exported symbol — this is the cross-stack contract surface; many S-layer crates consume these types.
- [[wikilink]] all entity/coordinate/spec refs in any artifact you author.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
`cargo test -p epi-kernel-contract`

## Child DOX Index
- (leaf)
