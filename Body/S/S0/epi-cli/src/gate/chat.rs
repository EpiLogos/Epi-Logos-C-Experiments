//! Thin S3 caller for the chat runtime (13.T3 host extraction).
//!
//! Pre-13.T3 this module owned the `chat.*` runtime (history, preview,
//! compact, send_message, inject_message, abort_run, transcript_path). Per
//! 13.T3 the runtime moved to `Body/S/S3/gateway/src/chat.rs`; this S0 module
//! is now a re-export shim so the S0 dispatcher (`gate::server::dispatch_rpc`)
//! and tests continue to compile without churn.

pub use epi_s3_gateway::chat::{
    abort_run, compact, history, history_response, inject_message, preview, reset, send_message,
    transcript_path, ChatEntry, HANDLER_OWNER,
};
