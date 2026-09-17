//! epi-s5-kbase-core - S5.2' kbase foundations for bounded resource context,
//! project scoping, and search facets.
//!
//! # Coordinate Header
//!
//! | Field | Value |
//! |---|---|
//! | Coordinate | [[S5]] / S5.2' |
//! | Residency | `Body/S/S5/epi-kbase-core/src/lib.rs` |
//! | Position (#n) | #2' - Kbase / bounded resource context |
//! | Actualises | [[S5-SPEC]], [[S5-ARCHITECTURE]], and `Body/S/S5/epi-kbase/CONTRACT.md` |
//! | Public surface | `kbase`, `parse`, `project`, `script`, `types`, and `vimarsa` modules |
//! | Does NOT own | Coordinate semantics, kernel envelopes, Epii agent contract authority, or search-script implementation bodies |
//! | Contract | `Body/S/S5/epi-kbase/CONTRACT.md` |

pub mod kbase;
pub mod parse;
pub mod project;
pub mod script;
pub mod types;
pub mod vimarsa;
