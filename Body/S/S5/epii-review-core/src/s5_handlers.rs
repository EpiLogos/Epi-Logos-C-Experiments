//! The `s5'.review.*` gateway surface, resident at the coordinate that owns it.
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | [[S5]] / S5' — Epii review authority |
//! | Residency  | `Body/S/S5/epii-review-core/src/s5_handlers.rs` |
//! | Position (#n) | #5 — world-return governance gate |
//! | Actualises | [[S5-SPEC]] review governance, Track 53 T53.08 (handler residency) |
//! | Public surface | [`STORE_SUBPATH`], [`review_store_path`], [`submit`], [`inbox`], [`resolve`], [`history`], [`require_human_approval`], [`StateRootContext`], [`S5_REVIEW_METHODS`], [`register_s5_review_handlers`] |
//! | Does NOT own | Method routing (S3's route table), transport, session authority, or the wire error text for an unregistered method |
//! | Contract | [[S5-SPEC]] / [[S3-SPEC]] / `Body/S/epi-kernel-contract/src/method_handler.rs` |
//!
//! # Relocation note (Track 53)
//!
//! Every function below is a verbatim relocation of
//! `Body/S/S0/epi-cli/src/gate/review.rs`. The original module's own audit note
//! stands unchanged and is reproduced here because it is still true — only its
//! *residency* moved:
//!
//! > 13.T7 audit (2026-06-02): every public function in this module is a
//! > **thin adapter** over `ReviewStore`. Governance policy (priority ranking,
//! > kernel-visibility constraints, human-gate requirements, governance profile
//! > validation) lives entirely in S5. The adapter is responsible only for
//! > deserialising gateway JSON params into S5 DTOs, selecting the S5 store root
//! > under `state_root/s5/epii-review`, and re-serialising S5 results for the
//! > gateway frame.
//!
//! What the relocation changes is that the adapter is no longer *in* S0: the
//! store root, the DTO decode, and the frozen wire error each now live beside
//! the law they serve, and S3 reaches them by name through the S-root port.

use std::path::{Path, PathBuf};
use std::sync::Arc;

use epi_kernel_contract::{
    BoxFuture, DuplicateMethod, MethodError, MethodHandler, MethodOutcome, MethodRegistry,
    MethodRequest, MethodResult,
};
use serde_json::{json, Value};

use crate::{
    ReviewInboxFilter, ReviewResolveRequest, ReviewSource, ReviewStatus, ReviewStore,
    ReviewSubmission,
};

/// Canonical subpath under `state_root` where the S5 review store persists.
/// Exposed so external store-location tests can pin the gate root layout.
pub const STORE_SUBPATH: [&str; 2] = ["s5", "epii-review"];

/// Resolve the S5 review store root under the given gate `state_root`.
/// Sole source of truth for the review store location.
pub fn review_store_path(state_root: impl AsRef<Path>) -> PathBuf {
    let mut path = state_root.as_ref().to_path_buf();
    for segment in STORE_SUBPATH {
        path.push(segment);
    }
    path
}

pub fn submit(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let submission: ReviewSubmission =
        serde_json::from_value(params.clone()).map_err(|err| err.to_string())?;
    let item = store(state_root).submit(submission)?;
    Ok(json!({ "item": item }))
}

pub fn inbox(
    state_root: impl AsRef<Path>,
    status: Option<ReviewStatus>,
    source: Option<ReviewSource>,
    limit: Option<usize>,
) -> Result<Value, String> {
    let inbox = store(state_root).inbox(ReviewInboxFilter {
        status,
        source,
        limit,
    })?;
    serde_json::to_value(inbox).map_err(|err| err.to_string())
}

pub fn resolve(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let request: ReviewResolveRequest =
        serde_json::from_value(params.clone()).map_err(|err| err.to_string())?;
    let resolution = store(state_root).resolve(request)?;
    Ok(json!({ "resolution": resolution }))
}

/// Refuse a canonical mutation unless the S5 store records an explicit human
/// approval for this human-gated review item.
///
/// Not a gateway method — it is the guard S1's canon-write path calls before a
/// canonical mutation. It relocates with its siblings because it is pure
/// review-store law and reads the same store root.
pub fn require_human_approval(state_root: impl AsRef<Path>, item_id: &str) -> Result<(), String> {
    store(state_root)
        .approved_human_resolution(item_id)
        .map(|_| ())
}

pub fn history(state_root: impl AsRef<Path>, limit: Option<usize>) -> Result<Value, String> {
    let history = store(state_root).history(limit)?;
    serde_json::to_value(history).map_err(|err| err.to_string())
}

fn store(state_root: impl AsRef<Path>) -> ReviewStore {
    ReviewStore::new(review_store_path(state_root))
}

// ---------------------------------------------------------------------------
// The port: S5 declares which `s5'.review.*` methods it owns and how to reach
// them.
// ---------------------------------------------------------------------------

/// The one thing every relocated S5 handler needs from the caller's context.
///
/// [`MethodHandler`] is generic over the context precisely so no layer names a
/// gateway type. These handlers are still state-root-addressed, so S5 states
/// that requirement as a trait bound and the composition root satisfies it for
/// its own context type — the dependency stays inverted.
///
/// It is declared **here**, in the S5 crate with no S5 dependencies, so that
/// `epii-autoresearch-core` and `epii-agent-core` (both of which depend on this
/// crate) can share one trait and the composition root writes exactly one impl.
/// If S-root ever grows a context-accessor vocabulary of its own, this is the
/// declaration to lift.
pub trait StateRootContext: Send + Sync {
    /// The gate state root the handler resolves its store beneath.
    fn state_root(&self) -> &Path;
}

/// The uniform shape every `s5'.review.*` handler is adapted to: state root +
/// raw params in, wire JSON or a frozen wire error out.
pub type ReviewHandlerFn = fn(&Path, &Value) -> Result<Value, MethodError>;

/// Method name → owning shim. Each shim applies the error mapper the S0
/// dispatch arm applied, so the wire vocabulary is preserved exactly.
pub const S5_REVIEW_METHODS: &[(&str, ReviewHandlerFn)] = &[
    ("s5'.review.submit", handle_submit),
    ("s5'.review.inbox", handle_inbox),
    ("s5'.review.resolve", handle_resolve),
    ("s5'.review.history", handle_history),
];

/// The dispatcher's `internal_error`: every `s5'.review.*` arm mapped its
/// handler failure this way. The wire is frozen (Track 53 gotcha 7), so the
/// code stays `internal` even where a failure is really a bad param.
fn handle_submit(state_root: &Path, params: &Value) -> Result<Value, MethodError> {
    submit(state_root, params).map_err(MethodError::internal)
}

/// `s5'.review.inbox` is the one arm with a two-code shape: the status/source
/// params are parsed by the dispatcher's `optional_parse_param`, which fails
/// `invalid-params`, while the handler itself fails `internal`. Both are
/// preserved.
fn handle_inbox(state_root: &Path, params: &Value) -> Result<Value, MethodError> {
    let status = optional_parse_param(params, "status")?;
    let source = optional_parse_param(params, "source")?;
    let limit = optional_limit(params);
    inbox(state_root, status, source, limit).map_err(MethodError::internal)
}

fn handle_resolve(state_root: &Path, params: &Value) -> Result<Value, MethodError> {
    resolve(state_root, params).map_err(MethodError::internal)
}

fn handle_history(state_root: &Path, params: &Value) -> Result<Value, MethodError> {
    history(state_root, optional_limit(params)).map_err(MethodError::internal)
}

/// Relocated from the dispatcher's `optional_parse_param`, message and code
/// unchanged: an unparsable param is `invalid-params: "{key} is invalid: {err}"`.
fn optional_parse_param<T>(params: &Value, key: &str) -> Result<Option<T>, MethodError>
where
    T: serde::de::DeserializeOwned,
{
    params
        .get(key)
        .map(|value| {
            serde_json::from_value(value.clone())
                .map_err(|err| MethodError::invalid_params(format!("{key} is invalid: {err}")))
        })
        .transpose()
}

/// Relocated from the dispatch arms' inline `limit` extraction — a non-integer
/// `limit` is silently ignored there, and that oddity is preserved.
fn optional_limit(params: &Value) -> Option<usize> {
    params
        .get("limit")
        .and_then(|value| value.as_u64())
        .map(|value| value as usize)
}

struct ReviewMethodHandler(ReviewHandlerFn);

impl<C: StateRootContext> MethodHandler<C> for ReviewMethodHandler {
    fn handle<'a>(&'a self, ctx: &'a C, request: &'a MethodRequest) -> BoxFuture<'a, MethodResult> {
        let handler = self.0;
        Box::pin(async move {
            handler(ctx.state_root(), &request.params).map(MethodOutcome::immediate)
        })
    }
}

/// Register every `s5'.review.*` method S5 owns into a registry the composition
/// root builds.
pub fn register_s5_review_handlers<C: StateRootContext + 'static>(
    registry: &mut MethodRegistry<C>,
) -> Result<(), DuplicateMethod> {
    for (method, handler) in S5_REVIEW_METHODS {
        registry.register(*method, Arc::new(ReviewMethodHandler(*handler)))?;
    }
    Ok(())
}

#[cfg(test)]
mod port_tests {
    use super::*;

    struct TestCtx(PathBuf);

    impl StateRootContext for TestCtx {
        fn state_root(&self) -> &Path {
            &self.0
        }
    }

    fn temp_ctx(tag: &str) -> TestCtx {
        let dir = std::env::temp_dir().join(format!(
            "epi-s5-review-port-{tag}-{}",
            std::process::id()
        ));
        let _ = std::fs::remove_dir_all(&dir);
        TestCtx(dir)
    }

    #[test]
    fn every_registered_method_is_an_s5_review_name_and_unique() {
        let mut registry: MethodRegistry<TestCtx> = MethodRegistry::new();
        register_s5_review_handlers(&mut registry).expect("no duplicate method names");
        assert_eq!(registry.len(), S5_REVIEW_METHODS.len());
        for (method, _) in S5_REVIEW_METHODS {
            assert!(
                method.starts_with("s5'.review."),
                "{method} is not an s5' review method"
            );
            assert!(registry.contains(method), "{method} did not register");
        }
    }

    #[test]
    fn the_store_root_is_unchanged_by_the_relocation() {
        assert_eq!(STORE_SUBPATH, ["s5", "epii-review"]);
        assert_eq!(
            review_store_path(Path::new("/tmp/state-root")),
            PathBuf::from("/tmp/state-root/s5/epii-review")
        );
    }

    #[tokio::test]
    async fn a_handler_failure_keeps_the_frozen_internal_code() {
        let mut registry: MethodRegistry<TestCtx> = MethodRegistry::new();
        register_s5_review_handlers(&mut registry).unwrap();
        let ctx = temp_ctx("submit-fail");

        // An empty object is not a `ReviewSubmission`, so the handler errors;
        // the dispatcher mapped this arm with `internal_error`.
        let error = registry
            .dispatch(&ctx, &MethodRequest::with_params("s5'.review.submit", json!({})))
            .await
            .expect("method is registered")
            .expect_err("a malformed submission fails");
        assert_eq!(error.code, "internal");
    }

    #[tokio::test]
    async fn an_unparsable_inbox_filter_keeps_the_frozen_invalid_params_code() {
        let mut registry: MethodRegistry<TestCtx> = MethodRegistry::new();
        register_s5_review_handlers(&mut registry).unwrap();
        let ctx = temp_ctx("inbox-filter");

        // The dispatcher parsed `status` with `optional_parse_param`, which
        // fails `invalid-params` BEFORE the handler runs. The two-code shape of
        // this arm must survive the move.
        let error = registry
            .dispatch(
                &ctx,
                &MethodRequest::with_params("s5'.review.inbox", json!({ "status": "banana" })),
            )
            .await
            .expect("method is registered")
            .expect_err("an unknown status fails");
        assert_eq!(error.code, "invalid-params");
        assert!(
            error.message.starts_with("status is invalid: "),
            "frozen message shape changed: {}",
            error.message
        );
    }

    #[tokio::test]
    async fn an_absent_store_answers_an_empty_inbox_through_the_registry() {
        let mut registry: MethodRegistry<TestCtx> = MethodRegistry::new();
        register_s5_review_handlers(&mut registry).unwrap();
        let ctx = temp_ctx("inbox-empty");

        let outcome = registry
            .dispatch(&ctx, &MethodRequest::with_params("s5'.review.inbox", json!({})))
            .await
            .expect("method is registered")
            .expect("an absent store is an empty inbox, not an error");
        assert_eq!(outcome.result["items"], json!([]));
        assert_eq!(outcome.follow_up, None);
    }

    #[test]
    fn limit_extraction_matches_the_dispatch_arm() {
        assert_eq!(optional_limit(&json!({})), None);
        assert_eq!(optional_limit(&json!({ "limit": 3 })), Some(3));
        // A non-integer limit was silently ignored by the arm; preserved.
        assert_eq!(optional_limit(&json!({ "limit": "3" })), None);
    }
}
