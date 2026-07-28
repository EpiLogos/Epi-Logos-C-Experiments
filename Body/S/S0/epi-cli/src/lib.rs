pub mod agent;
pub mod app;
pub mod bimba;
pub mod book;
pub mod canon;
pub mod code;
pub mod core;
pub mod entity;
pub mod ffi;
pub mod gate;
pub mod graph;
pub mod know;
// T53.02: the `pub use epi_s5_*::*` / `epi_s1_*::*` blanket re-exports that
// stood here are gone. They let the S0 CLI restate four other crates' entire
// public surfaces as its own, which is the shape that made "which layer owns
// this type?" unanswerable from an import line. Consumers now name the owning
// crate directly.
pub mod nara;
pub mod notebook;
pub mod portal;
pub mod profile;
pub mod sesh;
pub mod settings;
pub mod skill;
pub mod slot;
pub mod sync;
pub mod techne;
pub mod tui;
pub mod up;
pub mod vault;
pub mod vimarsa;
pub mod world;
