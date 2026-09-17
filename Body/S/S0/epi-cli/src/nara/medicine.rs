//! Medicine public API facade.
//!
//! Implementation is split into focused sibling modules; this file preserves the
//! historical `crate::nara::medicine::*` API through public re-exports.

pub use super::medicine_cast::*;
pub use super::medicine_frame::*;
pub use super::medicine_route::*;
