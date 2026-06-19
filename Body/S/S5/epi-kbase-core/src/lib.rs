//! Coordinate: [[S5]] / S5.2' kbase foundations.
//! Residency: `Body/S/S5/epi-kbase-core`.
//! Position: S5 integral world-boundary support crate for bounded resource context.
//! Actualises: project-aware kbase and Vimarsa search facets for DAY/NOW agent runs.
//! Public surface: `kbase`, `parse`, `project`, `script`, `types`, and `vimarsa`.
//! Does NOT own: coordinate semantics, kernel envelopes, or the Epii agent contract.
//! Contract: [[S5-SPEC]] / [[S5-ARCHITECTURE]] plus `Body/S/S5/epi-kbase/CONTRACT.md`.

pub mod kbase;
pub mod parse;
pub mod project;
pub mod script;
pub mod types;
pub mod vimarsa;
