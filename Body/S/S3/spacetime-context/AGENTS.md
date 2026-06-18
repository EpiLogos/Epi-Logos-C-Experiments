# AGENTS.md — spacetime-context

## Purpose
SpacetimeDB schema artifacts for S3/S3' runtime persistence surfaces that are not yet housed in the `epi-spacetime-module` Rust table declarations.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S3-SPEC]] (see also [[S3-ARCHITECTURE]])

## Ownership
- `schemas/` — SQL schema artifacts for S3/S3' persistence surfaces, including Aletheia Elo runtime tables.
- Does NOT own reducer implementation, gateway routing, or coordinate semantics; those remain in `epi-spacetime-module`, `gateway`, and the owning S4/S5 specs.

## Local Contracts
- Owning specs: [[S3-SPEC]], [[S3-ARCHITECTURE]], and the calling layer spec that names each schema surface.
- No CONTRACT.md or code Coordinate Header exists at this level.

## Work Guidance
- Keep schema files declarative. Runtime thresholds, seed values, and hyperparameters belong in `~/.epi-logos/config.toml`, not in SQL DDL.
- `[[wikilink]]` coordinate/spec/carrier references in authored docs; SQL comments may use literal paths when needed.

## Verification
- Schema consumers must provide their own migration/application checks; for the Elo schema, run the Aletheia Elo module tests plus any S3 gateway persistence tests that consume the tables.

## Child DOX Index
- (leaf)
