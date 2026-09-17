//! The port: S3 declares which `s3'.*` methods it owns and how to reach them.
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | S3′ |
//! | Residency  | Body/S/S3/gateway/src/s3_handlers.rs |
//! | Position   | #3 — Gateway Control Plane, method residency |
//! | Actualises | [[S3-SPEC]] temporal surface, Track 53 T53.01 port / T53.06 |
//!
//! # Public surface
//! * [`S3_METHODS`] — method name → owning handler constructor.
//! * [`register_s3_handlers`] — registers every method S3 owns.
//! * [`TemporalContextEnv`] — the context bound the composition root satisfies.
//!
//! The `s3'.being_pattern.*` producer (CCT-21) registers here too; its law is
//! [`crate::being_pattern`].
//!
//! # Does NOT own
//! * `s3'.temporal.subscribe` and `s3'.spacetime.subscribe`. Both are
//!   cross-coordinate composites: besides this module's temporal context they
//!   need the local-bootstrap `SessionStore::ensure` (which reads `epi-cli`'s
//!   current-session snapshot to build a `CreateSessionContext`), so they stay
//!   at the composition root until that bootstrap has a coordinate of its own.
//!   See the tranche report for T53.06.
//! * The route table and the unregistered-method wire error — S3's dispatcher
//!   owns those, not this module.

use std::path::Path;
use std::sync::Arc;

use epi_kernel_contract::{
    BoxFuture, DuplicateMethod, MethodError, MethodHandler, MethodOutcome, MethodRegistry,
    MethodRequest, MethodResult,
};

use crate::being_pattern;
use crate::session_store::SessionStore;
use crate::temporal_session::{self, TemporalSurfaces};

/// What `s3'.temporal.context` needs from whoever composes it.
///
/// The state root and the session store are S3's own types; the two surfaces
/// are the seam named in [`temporal_session::TemporalSurfaces`] — Kairos and
/// Pratibimba are M4 identity law and S3 must not import upward to reach them.
pub trait TemporalContextEnv: TemporalSurfaces {
    /// The gate state root the context projection reads from.
    fn state_root(&self) -> &Path;
    /// The session store the requested `sessionKey` is resolved against.
    fn session_store(&self) -> &SessionStore;
}

/// `s3'.temporal.context` — resolve a session, project its living context, and
/// (on request) hydrate that context into Redis.
///
/// Defaults, parameter names and error codes are the dispatcher's, unchanged:
/// `sessionKey` defaults to `agent:main:main`, `agentId` to `operator`,
/// `hydrateRedis` to `false`, and both failure paths carried `internal_error`.
struct TemporalContextHandler;

impl<C: TemporalContextEnv> MethodHandler<C> for TemporalContextHandler {
    fn handle<'a>(&'a self, ctx: &'a C, request: &'a MethodRequest) -> BoxFuture<'a, MethodResult> {
        Box::pin(async move {
            let session_key = request
                .params
                .get("sessionKey")
                .and_then(|value| value.as_str())
                .unwrap_or("agent:main:main");
            let agent_id = request
                .params
                .get("agentId")
                .and_then(|value| value.as_str())
                .unwrap_or("operator");
            let mut value = temporal_session::context_value(
                ctx.state_root(),
                ctx.session_store(),
                session_key,
                agent_id,
                ctx,
            )
            // The S0 dispatcher mapped this arm with `internal_error`. The wire
            // is frozen (Track 53 gotcha 7), so a missing session still answers
            // `internal` even though it reads like `not-found` — changing that
            // belongs to a wire track.
            .map_err(MethodError::internal)?;
            if request
                .params
                .get("hydrateRedis")
                .and_then(|value| value.as_bool())
                .unwrap_or(false)
            {
                temporal_session::hydrate_redis_from_context(&mut value)
                    .await
                    .map_err(MethodError::internal)?;
            }
            Ok(MethodOutcome::immediate(value))
        })
    }
}

/// The four CCT-21 BeingPattern producer methods. The handler bodies are
/// `crate::being_pattern`; these are the thin bindings that put the producer on
/// the wire. `subscribe` needs the state root (it reads the SpaceTimeDB
/// registration to name the consumer's subscription plan); the other three do
/// not touch `ctx`.
struct BeingPatternObserveHandler;
struct BeingPatternProjectHandler;
struct BeingPatternSubscribeHandler;
struct BeingPatternReviewCandidateHandler;

impl<C: TemporalContextEnv> MethodHandler<C> for BeingPatternObserveHandler {
    fn handle<'a>(&'a self, _ctx: &'a C, request: &'a MethodRequest) -> BoxFuture<'a, MethodResult> {
        Box::pin(async move {
            being_pattern::producer()
                .observe(&request.params)
                .await
                .map(MethodOutcome::immediate)
        })
    }
}

impl<C: TemporalContextEnv> MethodHandler<C> for BeingPatternProjectHandler {
    fn handle<'a>(&'a self, _ctx: &'a C, request: &'a MethodRequest) -> BoxFuture<'a, MethodResult> {
        Box::pin(async move {
            being_pattern::producer()
                .project(&request.params)
                .await
                .map(MethodOutcome::immediate)
        })
    }
}

impl<C: TemporalContextEnv> MethodHandler<C> for BeingPatternSubscribeHandler {
    fn handle<'a>(&'a self, ctx: &'a C, request: &'a MethodRequest) -> BoxFuture<'a, MethodResult> {
        Box::pin(async move {
            being_pattern::producer()
                .subscribe(&request.params, ctx.state_root())
                .map(MethodOutcome::immediate)
        })
    }
}

impl<C: TemporalContextEnv> MethodHandler<C> for BeingPatternReviewCandidateHandler {
    fn handle<'a>(&'a self, _ctx: &'a C, request: &'a MethodRequest) -> BoxFuture<'a, MethodResult> {
        Box::pin(async move {
            being_pattern::producer()
                .review_candidate(&request.params)
                .await
                .map(MethodOutcome::immediate)
        })
    }
}

/// Every `s3'.*` method whose law is resident at this coordinate.
///
/// A table rather than a match arm, so the count is checkable and a name can
/// never be silently dropped on the way to registration.
pub const S3_METHODS: &[&str] = &[
    "s3'.temporal.context",
    "s3'.being_pattern.observe",
    "s3'.being_pattern.project",
    "s3'.being_pattern.subscribe",
    "s3'.being_pattern.review_candidate",
];

/// Register every method S3 owns into a registry the composition root builds.
pub fn register_s3_handlers<C: TemporalContextEnv + 'static>(
    registry: &mut MethodRegistry<C>,
) -> Result<(), DuplicateMethod> {
    registry.register("s3'.temporal.context", Arc::new(TemporalContextHandler))?;
    // CCT-21 (16.T16.21). Track 53 residency: the producer is S3's law, so it
    // registers HERE and never as an `epi-cli` match arm.
    registry.register(
        "s3'.being_pattern.observe",
        Arc::new(BeingPatternObserveHandler),
    )?;
    registry.register(
        "s3'.being_pattern.project",
        Arc::new(BeingPatternProjectHandler),
    )?;
    registry.register(
        "s3'.being_pattern.subscribe",
        Arc::new(BeingPatternSubscribeHandler),
    )?;
    registry.register(
        "s3'.being_pattern.review_candidate",
        Arc::new(BeingPatternReviewCandidateHandler),
    )?;
    Ok(())
}

#[cfg(test)]
mod port_tests {
    use super::*;
    use serde_json::{json, Value};

    struct TestEnv {
        state_root: std::path::PathBuf,
        store: SessionStore,
    }

    impl TemporalSurfaces for TestEnv {
        fn kairos_surface(&self, day_id: &str) -> Value {
            json!({ "available": false, "dayId": day_id })
        }

        fn pratibimba_surface(&self) -> Value {
            json!({ "available": false, "anchorId": Value::Null })
        }
    }

    impl TemporalContextEnv for TestEnv {
        fn state_root(&self) -> &Path {
            &self.state_root
        }

        fn session_store(&self) -> &SessionStore {
            &self.store
        }
    }

    fn env(name: &str) -> TestEnv {
        let mut root = std::env::temp_dir();
        root.push(format!(
            "epi-s3-handlers-{name}-{}-{:?}",
            std::process::id(),
            std::thread::current().id()
        ));
        if root.exists() {
            std::fs::remove_dir_all(&root).unwrap();
        }
        let store = SessionStore::new(&root).unwrap();
        TestEnv {
            state_root: root,
            store,
        }
    }

    fn registry() -> MethodRegistry<TestEnv> {
        let mut registry = MethodRegistry::new();
        register_s3_handlers(&mut registry).expect("no duplicate method names");
        registry
    }

    #[test]
    fn every_registered_method_is_an_s3_prime_name_and_unique() {
        let registry = registry();
        assert_eq!(registry.len(), S3_METHODS.len());
        for method in S3_METHODS {
            assert!(method.starts_with("s3'."), "{method} is not an s3' method");
            assert!(registry.contains(method), "{method} did not register");
        }
    }

    /// The parameter defaults are wire contract: an empty params object must
    /// still resolve `agent:main:main` for `operator`.
    #[tokio::test]
    async fn empty_params_fall_back_to_the_dispatchers_session_and_agent_defaults() {
        let env = env("defaults");
        env.store.create("agent:main:main").unwrap();
        let registry = registry();

        let outcome = registry
            .dispatch(
                &env,
                &MethodRequest::with_params("s3'.temporal.context", json!({})),
            )
            .await
            .expect("method is registered")
            .expect("an existing session resolves");

        assert_eq!(outcome.result["session"]["canonicalKey"], "agent:main:main");
        assert_eq!(outcome.result["session"]["requestedAgentId"], "operator");
        assert_eq!(outcome.result["coordinateOwner"], "S3'");
        // Not asked to hydrate — the projection must not claim it did.
        assert_eq!(outcome.result["redis"]["hydrated"], json!(false));
        assert_eq!(outcome.follow_up, None);
    }

    /// The named params reach the projection, and the injected surfaces are
    /// the ones the context carries — proving the ctx port is actually used.
    #[tokio::test]
    async fn named_params_and_injected_surfaces_reach_the_projection() {
        let env = env("named");
        env.store.create("agent:nara:main").unwrap();
        let registry = registry();

        let outcome = registry
            .dispatch(
                &env,
                &MethodRequest::with_params(
                    "s3'.temporal.context",
                    json!({ "sessionKey": "agent:nara:main", "agentId": "nara" }),
                ),
            )
            .await
            .expect("method is registered")
            .expect("an existing session resolves");

        assert_eq!(outcome.result["session"]["canonicalKey"], "agent:nara:main");
        assert_eq!(outcome.result["session"]["requestedAgentId"], "nara");
        assert_eq!(outcome.result["kairos"]["available"], json!(false));
        assert_eq!(outcome.result["pratibimba"]["available"], json!(false));
        assert_eq!(outcome.result["terminal"]["terminalBacked"], json!(false));
    }

    /// An unresolvable session carried `internal_error` through the S0
    /// dispatcher. The wire is frozen: it must still be `internal`.
    #[tokio::test]
    async fn an_unresolvable_session_keeps_the_frozen_internal_code() {
        let env = env("missing");
        let registry = registry();

        let error = registry
            .dispatch(
                &env,
                &MethodRequest::with_params(
                    "s3'.temporal.context",
                    json!({ "sessionKey": "agent:absent:absent" }),
                ),
            )
            .await
            .expect("method is registered")
            .expect_err("an unknown session fails");

        assert_eq!(error.code, "internal");
    }

    /// The two subscribe methods are deliberately NOT here. If one is ever
    /// registered without the composite being resolved, this test says so.
    #[test]
    fn the_subscribe_composites_are_not_claimed_by_this_coordinate_yet() {
        let registry = registry();
        assert!(!registry.contains("s3'.temporal.subscribe"));
        assert!(!registry.contains("s3'.spacetime.subscribe"));
    }
}
