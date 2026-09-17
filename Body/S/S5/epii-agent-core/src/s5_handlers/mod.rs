//! The port: the S5 Epii agent declares which `s5'.epii.*` methods it owns and
//! how to reach them.
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | [[S5]] / S5' — Epii agent surface |
//! | Residency  | `Body/S/S5/epii-agent-core/src/s5_handlers/mod.rs` |
//! | Position (#n) | #5 — the registration surface S3 routes into |
//! | Actualises | Track 53 T53.08 (handler residency), the S-root method-handler port |
//! | Public surface | [`epii`], [`epii_axiom`], [`StateRootContext`], [`S5_EPII_METHODS`], [`register_s5_epii_handlers`] |
//! | Does NOT own | Method routing (S3's route table), transport, session authority, or the four `s5'.epii.*` composites named below |
//! | Contract | `Body/S/epi-kernel-contract/src/method_handler.rs` |
//!
//! # What this port deliberately does NOT register
//!
//! Four `s5'.epii.*` / `s5'.gnosis.*` methods stayed in the S0 dispatcher
//! because their bodies are cross-coordinate joins, not S5 law wearing an S5
//! name:
//!
//! | Method | Why it stayed |
//! |--------|---------------|
//! | `s5'.epii.status` | folds a world-return envelope over the Gnosis config/notebook/ingest modules, the `nara.*` dispatcher, and the graphiti status probe |
//! | `s5'.epii.runtime.context` | reads the gateway session store, the temporal context builder, the SpacetimeDB readiness probe, and the parity port constant |
//! | `s5'.epii.user.orientation` (and its aliases `s5'.epii.pratibimba.status`, `s5'.epii.kairos.context`) | reads the pratibimba temporal surface and the cached Kairos snapshot |
//! | `s5'.gnosis.context.retrieve` | runs the local Gnosis query pipeline |
//!
//! Each is named for the composition root to compose. Registering a partial
//! version here would change the wire; leaving them is the honest split.

use std::path::Path;
use std::sync::Arc;

use epi_kernel_contract::{
    BoxFuture, DuplicateMethod, MethodError, MethodHandler, MethodOutcome, MethodRegistry,
    MethodRequest, MethodResult,
};
use serde_json::Value;

pub mod epii;
pub mod epii_axiom;

/// The context requirement every relocated S5 handler states. Declared in
/// `epi-s5-epii-review-core` (the S5 crate with no S5 dependencies) and
/// re-exported here so a caller wiring Epii handlers can name it without
/// reaching for the review crate.
pub use epi_s5_epii_review_core::s5_handlers::StateRootContext;

/// The uniform shape every `s5'.epii.*` handler is adapted to: state root +
/// raw params in, wire JSON or a frozen wire error out.
pub type EpiiHandlerFn = fn(&Path, &Value) -> Result<Value, MethodError>;

/// Method name → owning shim. Each shim applies the error mapper its S0
/// dispatch arm applied — `deposit.list` is `invalid-params` while its write
/// sibling `deposit` is `internal`, and that asymmetry is frozen wire, not a
/// bug to fix here.
pub const S5_EPII_METHODS: &[(&str, EpiiHandlerFn)] = &[
    ("s5'.epii.deposit", handle_deposit),
    ("s5'.epii.deposit.list", handle_deposit_list),
    ("s5'.epii.axiom_translate", handle_axiom_translate),
    (
        "s5'.epii.axiom_translation_history",
        handle_axiom_translation_history,
    ),
];

fn handle_deposit(state_root: &Path, params: &Value) -> Result<Value, MethodError> {
    epii::deposit(state_root, params).map_err(MethodError::internal)
}

fn handle_deposit_list(state_root: &Path, params: &Value) -> Result<Value, MethodError> {
    epii::deposit_list(state_root, params).map_err(MethodError::invalid_params)
}

fn handle_axiom_translate(state_root: &Path, params: &Value) -> Result<Value, MethodError> {
    epii_axiom::translate_and_persist(state_root, params).map_err(MethodError::internal)
}

fn handle_axiom_translation_history(
    state_root: &Path,
    _params: &Value,
) -> Result<Value, MethodError> {
    epii_axiom::history_value(state_root).map_err(MethodError::internal)
}

struct EpiiMethodHandler(EpiiHandlerFn);

impl<C: StateRootContext> MethodHandler<C> for EpiiMethodHandler {
    fn handle<'a>(&'a self, ctx: &'a C, request: &'a MethodRequest) -> BoxFuture<'a, MethodResult> {
        let handler = self.0;
        Box::pin(async move {
            handler(ctx.state_root(), &request.params).map(MethodOutcome::immediate)
        })
    }
}

/// Register every `s5'.epii.*` method the Epii agent coordinate owns into a
/// registry the composition root builds.
pub fn register_s5_epii_handlers<C: StateRootContext + 'static>(
    registry: &mut MethodRegistry<C>,
) -> Result<(), DuplicateMethod> {
    for (method, handler) in S5_EPII_METHODS {
        registry.register(*method, Arc::new(EpiiMethodHandler(*handler)))?;
    }
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
            "epi-s5-epii-port-{tag}-{}",
            std::process::id()
        ));
        let _ = std::fs::remove_dir_all(&dir);
        TestCtx(dir)
    }

    fn registry() -> MethodRegistry<TestCtx> {
        let mut registry = MethodRegistry::new();
        register_s5_epii_handlers(&mut registry).expect("no duplicate method names");
        registry
    }

    #[test]
    fn every_registered_method_is_an_s5_epii_name_and_unique() {
        let registry = registry();
        assert_eq!(registry.len(), S5_EPII_METHODS.len());
        for (method, _) in S5_EPII_METHODS {
            assert!(
                method.starts_with("s5'.epii."),
                "{method} is not an s5' epii method"
            );
            assert!(registry.contains(method), "{method} did not register");
        }
    }

    #[test]
    fn the_cross_coordinate_composites_are_not_claimed_here() {
        let registry = registry();
        // Claiming a name whose body could not move would silently break the
        // wire, because exact registrations outrank the legacy fallback
        // namespace the composition root still parks the dispatcher on.
        for composite in [
            "s5'.epii.status",
            "s5'.epii.runtime.context",
            "s5'.epii.user.orientation",
            "s5'.epii.pratibimba.status",
            "s5'.epii.kairos.context",
            "s5'.gnosis.context.retrieve",
        ] {
            assert!(
                !registry.contains(composite),
                "{composite} is a cross-coordinate composite and must stay routable to the \
                 composition root"
            );
        }
    }

    #[tokio::test]
    async fn a_deposit_failure_keeps_the_frozen_internal_code() {
        let registry = registry();
        let ctx = temp_ctx("deposit");

        // `{}` is not a `DepositRequest`; the arm mapped with `internal_error`.
        let error = registry
            .dispatch(&ctx, &MethodRequest::with_params("s5'.epii.deposit", json!({})))
            .await
            .expect("method is registered")
            .expect_err("a malformed deposit fails");
        assert_eq!(error.code, "internal");
    }

    #[tokio::test]
    async fn a_deposit_list_failure_keeps_the_frozen_invalid_params_code() {
        let registry = registry();
        let ctx = temp_ctx("deposit-list");

        let error = registry
            .dispatch(
                &ctx,
                &MethodRequest::with_params("s5'.epii.deposit.list", json!({ "status": "banana" })),
            )
            .await
            .expect("method is registered")
            .expect_err("an unknown status fails");
        assert_eq!(error.code, "invalid-params");
        assert!(error.message.contains("unknown status 'banana'"));
    }

    #[tokio::test]
    async fn an_absent_store_lists_no_deposits_rather_than_failing() {
        let registry = registry();
        let ctx = temp_ctx("deposit-list-empty");

        let outcome = registry
            .dispatch(
                &ctx,
                &MethodRequest::with_params("s5'.epii.deposit.list", json!({})),
            )
            .await
            .expect("method is registered")
            .expect("an absent store is an empty projection");
        assert_eq!(outcome.result["deposits"], json!([]));
        assert_eq!(outcome.result["matched"], json!(0));
        assert_eq!(outcome.result["governance_owner"], json!("S5'"));
        assert_eq!(outcome.result["storage_substrate"], json!("S2"));
    }

    #[tokio::test]
    async fn axiom_translation_history_reads_the_persisted_store_through_the_registry() {
        let registry = registry();
        let ctx = temp_ctx("axiom-history");

        let outcome = registry
            .dispatch(
                &ctx,
                &MethodRequest::with_params("s5'.epii.axiom_translation_history", json!({})),
            )
            .await
            .expect("method is registered")
            .expect("an absent store is an empty history");
        assert_eq!(outcome.result, json!({ "sessions": [] }));

        // And it reads what `persist` wrote, at the unchanged store path.
        let session = epii_axiom::translate(
            "ground",
            "dispatch-1",
            "axiom-port",
            "epii_judge",
            &|_prompt: &str, _slot: &str| Ok(("out".to_string(), "trace".to_string())),
        )
        .expect("the injected translator succeeds");
        epii_axiom::persist(ctx.state_root(), &session).expect("persist writes");

        let outcome = registry
            .dispatch(
                &ctx,
                &MethodRequest::with_params("s5'.epii.axiom_translation_history", json!({})),
            )
            .await
            .expect("method is registered")
            .expect("history reads");
        assert_eq!(outcome.result["sessions"][0]["id"], json!("axiom-port"));
        let _ = std::fs::remove_dir_all(ctx.state_root());
    }

    #[tokio::test]
    async fn axiom_translate_without_an_articulation_keeps_the_frozen_internal_code() {
        let registry = registry();
        let ctx = temp_ctx("axiom-translate");

        // Fails on the missing param BEFORE any model invocation, so this
        // asserts the mapper without touching the PI harness.
        let error = registry
            .dispatch(
                &ctx,
                &MethodRequest::with_params("s5'.epii.axiom_translate", json!({})),
            )
            .await
            .expect("method is registered")
            .expect_err("a missing articulation fails");
        assert_eq!(error.code, "internal");
        assert_eq!(error.message, "missing required param 'articulation'");
    }
}
