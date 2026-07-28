//! The port: S5 autoresearch declares which `s5'.improve.*` and `s5'.tune.*`
//! methods it owns and how to reach them.
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | [[S5]] / S5' — Epii autoresearch + tunability authority |
//! | Residency  | `Body/S/S5/epii-autoresearch-core/src/s5_handlers/mod.rs` |
//! | Position (#n) | #5 — the registration surface S3 routes into |
//! | Actualises | Track 53 T53.08 (handler residency), the S-root method-handler port |
//! | Public surface | [`improve`], [`tuning`], [`StateRootContext`], [`S5_AUTORESEARCH_SYNC_METHODS`], [`S5_AUTORESEARCH_ASYNC_METHOD`], [`register_s5_autoresearch_handlers`] |
//! | Does NOT own | Method routing (S3's route table), transport, session authority, or the wire error for an unregistered method |
//! | Contract | `Body/S/epi-kernel-contract/src/method_handler.rs` |
//!
//! # The frozen wire
//!
//! Each table entry pairs a method name with a shim that applies **the error
//! mapper its S0 dispatch arm applied** — `internal_error` → `internal`,
//! `invalid_params_error` → `invalid-params`. The two are not uniform across
//! this surface (`s5'.tune.registry.list` is `internal` while its sibling
//! `s5'.tune.registry.get` is `invalid-params`), and that asymmetry is
//! preserved deliberately: the wire is frozen, and normalising it belongs to a
//! wire track, not to a relocation.

use std::path::Path;
use std::sync::Arc;

use epi_kernel_contract::{
    BoxFuture, DuplicateMethod, MethodError, MethodHandler, MethodOutcome, MethodRegistry,
    MethodRequest, MethodResult,
};
use serde_json::Value;

pub mod improve;
pub mod tuning;

/// The context requirement every relocated S5 handler states. Declared in
/// `epi-s5-epii-review-core` (the S5 crate with no S5 dependencies) and
/// re-exported here so a caller wiring autoresearch handlers can name it
/// without reaching for the review crate.
pub use epi_s5_epii_review_core::s5_handlers::StateRootContext;

/// The uniform shape a synchronous handler is adapted to: state root + raw
/// params in, wire JSON or a frozen wire error out.
pub type AutoresearchHandlerFn = fn(&Path, &Value) -> Result<Value, MethodError>;

/// Method name → owning shim, for every method whose handler is synchronous.
pub const S5_AUTORESEARCH_SYNC_METHODS: &[(&str, AutoresearchHandlerFn)] = &[
    ("s5'.improve.status", handle_improve_status),
    ("s5'.improve.propose", handle_improve_propose),
    ("s5'.improve.evaluate", handle_improve_evaluate),
    ("s5'.improve.promote", handle_improve_promote),
    ("s5'.improve.history", handle_improve_history),
    ("s5'.improve.q_review.run", handle_improve_q_review_run),
    ("s5'.improve.q_review.latest", handle_improve_q_review_latest),
    ("s5'.tune.registry.list", handle_tune_registry_list),
    ("s5'.tune.registry.get", handle_tune_registry_get),
    ("s5'.tune.registry.set", handle_tune_registry_set),
    ("s5'.tune.audit.read", handle_tune_audit_read),
    ("s5'.tune.lock.toggle", handle_tune_lock_toggle),
    ("s5'.tune.propose", handle_tune_propose),
    ("s5'.tune.proposals.list", handle_tune_proposals_list),
    ("s5'.tune.proposals.resolve", handle_tune_proposals_resolve),
];

/// The one method on this surface whose handler is `async` — it awaits a Neo4j
/// round-trip — so it cannot share the synchronous table and gets its own
/// handler type instead.
pub const S5_AUTORESEARCH_ASYNC_METHOD: &str = "s5'.improve.q_review.night_pass";

// --- `s5'.improve.*` — every arm mapped `internal_error`. --------------------

fn handle_improve_status(state_root: &Path, _params: &Value) -> Result<Value, MethodError> {
    improve::status(state_root).map_err(MethodError::internal)
}

fn handle_improve_propose(state_root: &Path, params: &Value) -> Result<Value, MethodError> {
    improve::propose(state_root, params).map_err(MethodError::internal)
}

fn handle_improve_evaluate(state_root: &Path, params: &Value) -> Result<Value, MethodError> {
    improve::evaluate(state_root, params).map_err(MethodError::internal)
}

fn handle_improve_promote(state_root: &Path, params: &Value) -> Result<Value, MethodError> {
    improve::promote(state_root, params).map_err(MethodError::internal)
}

fn handle_improve_history(state_root: &Path, params: &Value) -> Result<Value, MethodError> {
    improve::history(state_root, optional_limit(params)).map_err(MethodError::internal)
}

fn handle_improve_q_review_run(state_root: &Path, params: &Value) -> Result<Value, MethodError> {
    improve::q_review_run(state_root, params).map_err(MethodError::internal)
}

fn handle_improve_q_review_latest(state_root: &Path, params: &Value) -> Result<Value, MethodError> {
    improve::q_review_latest(state_root, params).map_err(MethodError::internal)
}

// --- `s5'.tune.*` — mixed mappers, preserved arm for arm. -------------------

fn handle_tune_registry_list(state_root: &Path, _params: &Value) -> Result<Value, MethodError> {
    tuning::list(state_root).map_err(MethodError::internal)
}

fn handle_tune_registry_get(state_root: &Path, params: &Value) -> Result<Value, MethodError> {
    tuning::get(state_root, params).map_err(MethodError::invalid_params)
}

fn handle_tune_registry_set(state_root: &Path, params: &Value) -> Result<Value, MethodError> {
    tuning::set(state_root, params).map_err(MethodError::invalid_params)
}

/// The only handler on this surface that never reads the state root — the
/// tunable audit lives under `$HOME/.epi-logos/tunable-audit`, not under the
/// gate state root. The adapter still receives it; `tuning::audit_read` ignores
/// it, exactly as the dispatch arm did by not passing it.
fn handle_tune_audit_read(_state_root: &Path, params: &Value) -> Result<Value, MethodError> {
    tuning::audit_read(params).map_err(MethodError::invalid_params)
}

fn handle_tune_lock_toggle(state_root: &Path, params: &Value) -> Result<Value, MethodError> {
    tuning::lock_toggle(state_root, params).map_err(MethodError::invalid_params)
}

fn handle_tune_propose(state_root: &Path, params: &Value) -> Result<Value, MethodError> {
    tuning::propose(state_root, params).map_err(MethodError::invalid_params)
}

fn handle_tune_proposals_list(state_root: &Path, _params: &Value) -> Result<Value, MethodError> {
    tuning::proposals_list(state_root).map_err(MethodError::internal)
}

fn handle_tune_proposals_resolve(state_root: &Path, params: &Value) -> Result<Value, MethodError> {
    tuning::proposals_resolve(state_root, params).map_err(MethodError::invalid_params)
}

/// Relocated from the dispatch arms' inline `limit` extraction — a non-integer
/// `limit` is silently ignored there, and that oddity is preserved.
fn optional_limit(params: &Value) -> Option<usize> {
    params
        .get("limit")
        .and_then(|value| value.as_u64())
        .map(|value| value as usize)
}

struct AutoresearchMethodHandler(AutoresearchHandlerFn);

impl<C: StateRootContext> MethodHandler<C> for AutoresearchMethodHandler {
    fn handle<'a>(&'a self, ctx: &'a C, request: &'a MethodRequest) -> BoxFuture<'a, MethodResult> {
        let handler = self.0;
        Box::pin(async move {
            handler(ctx.state_root(), &request.params).map(MethodOutcome::immediate)
        })
    }
}

/// `s5'.improve.q_review.night_pass`. Its dispatch arm `.await`ed the handler
/// and then mapped with `internal_error`; both survive.
struct QReviewNightPassHandler;

impl<C: StateRootContext> MethodHandler<C> for QReviewNightPassHandler {
    fn handle<'a>(&'a self, ctx: &'a C, request: &'a MethodRequest) -> BoxFuture<'a, MethodResult> {
        Box::pin(async move {
            improve::q_review_night_pass(ctx.state_root(), &request.params)
                .await
                .map(MethodOutcome::immediate)
                .map_err(MethodError::internal)
        })
    }
}

/// Register every `s5'.improve.*` and `s5'.tune.*` method S5 autoresearch owns
/// into a registry the composition root builds.
pub fn register_s5_autoresearch_handlers<C: StateRootContext + 'static>(
    registry: &mut MethodRegistry<C>,
) -> Result<(), DuplicateMethod> {
    for (method, handler) in S5_AUTORESEARCH_SYNC_METHODS {
        registry.register(*method, Arc::new(AutoresearchMethodHandler(*handler)))?;
    }
    registry.register(S5_AUTORESEARCH_ASYNC_METHOD, Arc::new(QReviewNightPassHandler))?;
    Ok(())
}

#[cfg(test)]
mod port_tests {
    use super::*;
    use serde_json::json;
    use std::path::PathBuf;

    struct TestCtx(PathBuf);

    impl StateRootContext for TestCtx {
        fn state_root(&self) -> &Path {
            &self.0
        }
    }

    fn temp_ctx(tag: &str) -> TestCtx {
        let dir = std::env::temp_dir().join(format!(
            "epi-s5-autoresearch-port-{tag}-{}",
            std::process::id()
        ));
        let _ = std::fs::remove_dir_all(&dir);
        TestCtx(dir)
    }

    fn registry() -> MethodRegistry<TestCtx> {
        let mut registry = MethodRegistry::new();
        register_s5_autoresearch_handlers(&mut registry).expect("no duplicate method names");
        registry
    }

    #[test]
    fn every_registered_method_is_an_owned_s5_name_and_unique() {
        let registry = registry();
        assert_eq!(registry.len(), S5_AUTORESEARCH_SYNC_METHODS.len() + 1);
        for (method, _) in S5_AUTORESEARCH_SYNC_METHODS {
            assert!(
                method.starts_with("s5'.improve.") || method.starts_with("s5'.tune."),
                "{method} is not a method this coordinate owns"
            );
            assert!(registry.contains(method), "{method} did not register");
        }
        assert!(registry.contains(S5_AUTORESEARCH_ASYNC_METHOD));
        assert!(
            !registry.contains("s5'.review.submit"),
            "the review surface belongs to epi-s5-epii-review-core, not here"
        );
    }

    #[test]
    fn registering_twice_is_refused_rather_than_silently_overwritten() {
        let mut registry = registry();
        let refused = register_s5_autoresearch_handlers(&mut registry)
            .expect_err("a second claim on these names must be refused");
        assert_eq!(refused.method, "s5'.improve.status");
    }

    #[tokio::test]
    async fn improve_failures_keep_the_frozen_internal_code() {
        let registry = registry();
        let ctx = temp_ctx("improve-propose");

        // `{}` is not a `ProposeRequest`, so the handler errors before touching
        // the store; the dispatcher mapped every `s5'.improve.*` arm with
        // `internal_error`.
        let error = registry
            .dispatch(
                &ctx,
                &MethodRequest::with_params("s5'.improve.propose", json!({})),
            )
            .await
            .expect("method is registered")
            .expect_err("a malformed proposal fails");
        assert_eq!(error.code, "internal");
    }

    #[tokio::test]
    async fn tune_get_keeps_the_frozen_invalid_params_code() {
        let registry = registry();
        let ctx = temp_ctx("tune-get");

        // `required_key` runs before the registry is loaded, so this asserts the
        // mapper without reading or writing any tunable state.
        let error = registry
            .dispatch(
                &ctx,
                &MethodRequest::with_params("s5'.tune.registry.get", json!({})),
            )
            .await
            .expect("method is registered")
            .expect_err("a missing key fails");
        assert_eq!(error.code, "invalid-params");
        assert_eq!(error.message, "key must be a non-empty string");
    }

    #[tokio::test]
    async fn tune_audit_read_keeps_the_frozen_invalid_params_code() {
        let registry = registry();
        let ctx = temp_ctx("tune-audit");

        let error = registry
            .dispatch(
                &ctx,
                &MethodRequest::with_params("s5'.tune.audit.read", json!({ "key": "  " })),
            )
            .await
            .expect("method is registered")
            .expect_err("a blank key fails");
        assert_eq!(error.code, "invalid-params");
    }

    #[test]
    fn the_two_tune_registry_arms_really_do_carry_different_codes() {
        // Guards the asymmetry from being "tidied up": `list` was `internal`
        // and `get` was `invalid-params` in the dispatcher, and a relocation
        // must not normalise them.
        let ctx = temp_ctx("tune-asymmetry");
        let list = handle_tune_registry_list(ctx.state_root(), &json!({}));
        let get = handle_tune_registry_get(ctx.state_root(), &json!({}));
        assert_eq!(
            get.expect_err("a missing key fails").code,
            "invalid-params"
        );
        if let Err(error) = list {
            assert_eq!(error.code, "internal");
        }
    }

    #[test]
    fn limit_extraction_matches_the_dispatch_arm() {
        assert_eq!(optional_limit(&json!({})), None);
        assert_eq!(optional_limit(&json!({ "limit": 7 })), Some(7));
        assert_eq!(optional_limit(&json!({ "limit": "7" })), None);
    }

    #[test]
    fn the_improvement_store_root_is_unchanged_by_the_relocation() {
        assert_eq!(improve::STORE_SUBPATH, ["s5", "epii-autoresearch"]);
        assert_eq!(
            improve::improvement_store_path(Path::new("/tmp/state-root")),
            PathBuf::from("/tmp/state-root/s5/epii-autoresearch")
        );
    }
}
