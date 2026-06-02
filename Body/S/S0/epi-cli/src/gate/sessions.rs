//! Thin S3 caller for the sessions surface (13.T3 host extraction).
//!
//! Pre-13.T3 this module owned the JSON envelope constructors
//! `record_to_value`, `session_row`, and `list_result`. Per 13.T3 those moved
//! into `Body/S/S3/gateway/src/sessions.rs`; this S0 module now re-exports the
//! S3 runtime surface so the S0 dispatcher (`gate::server::dispatch_rpc`),
//! tests, and the CLI sub-command `epi gate sessions …` continue to compile
//! without churn. The `SessionStore` is the local-bootstrap CLI wrapper that
//! injects the current session context (vault root, day id) when creating a
//! record — that piece stays in S0 because `epi-cli` knows about
//! `crate::sesh::session` while the S3 crate must not depend on the CLI tree.

pub use super::session_store::{SessionPatch, SessionRecord, SessionStore};
pub use epi_s3_gateway::sessions::{list_result, record_to_value, session_row, HANDLER_OWNER};
