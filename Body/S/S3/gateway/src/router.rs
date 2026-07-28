//! Routing execution for the gateway control plane.
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | S3 |
//! | Residency  | Body/S/S3/gateway/src/router.rs |
//! | Position   | #3 — Gateway Control Plane, routing authority |
//! | Actualises | [[S3-SPEC]], [[S3-ARCHITECTURE]] §2, Track 53 T53.03 |
//!
//! # Why this is here
//!
//! S3 already owned the route *table* — [`classify_method`], the
//! `METHOD_DISPATCH_PLAN` classification, and every method-name constant. What
//! it did not own was the *execution*: the per-method match that actually
//! reaches a handler lived in S0, at `epi-cli/src/gate/server/dispatch.rs`, and
//! so did the decision of which coordinate answers a call.
//!
//! This module completes the seam. Routing resolves through the S-root
//! [`MethodRegistry`], so S3 decides *which* handler answers without importing
//! any handler implementation — which is the only arrangement the boundary rule
//! permits, since a dispatcher that named its handlers directly would have to
//! import S4 and S5 from S3.
//!
//! # Public surface
//! * [`Router`] — registry-backed routing, generic over the caller's context.
//! * [`unregistered_method_error`] — the frozen wire error for a method no
//!   handler claims, built from S3's own route table.
//! * [`request_from_frame`] — protocol frame to port request.
//! * [`LEGACY_S0_FALLBACK_NAMESPACE`] — the drain's temporary scaffold.
//!
//! # Does NOT own
//! * Any handler body. Handlers are registered by the composition root and
//!   implemented by the coordinate that owns the method.
//! * The transport. The websocket read/write loop and subscription fan-out
//!   remain the caller's; this module answers one request at a time.

use epi_kernel_contract::{MethodError, MethodOutcome, MethodRegistry, MethodRequest};

use crate::dispatch::{classify_method, dispatch_plan_entry};
use crate::protocol::RequestFrame;

/// The namespace under which the composition root registers the not-yet-moved
/// S0 dispatcher while Track 53 drains handlers to their coordinates.
///
/// It is the empty string, so it matches every method as the shortest possible
/// prefix — which makes it strictly lowest priority: any exact registration,
/// and any longer namespace, wins over it. As tranches `53.T53.04`–`53.T53.08`
/// move handlers to their owning crates, this fallback shrinks by subtraction
/// and never has to be edited.
///
/// It is scaffolding with a demolition date: `53.T53.11`'s structural guard
/// asserts no such registration remains.
pub const LEGACY_S0_FALLBACK_NAMESPACE: &str = "";

/// Routes one request to the handler registered for its method.
pub struct Router<C> {
    registry: MethodRegistry<C>,
}

impl<C> Router<C> {
    pub fn new(registry: MethodRegistry<C>) -> Self {
        Self { registry }
    }

    pub fn registry(&self) -> &MethodRegistry<C> {
        &self.registry
    }

    pub fn registry_mut(&mut self) -> &mut MethodRegistry<C> {
        &mut self.registry
    }

    /// Resolve `request` and run the owning handler.
    ///
    /// When no handler claims the method the answer is
    /// [`unregistered_method_error`] — S3's, because S3 is the only layer that
    /// can say whether an unrecognised name is unrouted or merely unserved.
    pub async fn route(&self, ctx: &C, request: &MethodRequest) -> Result<MethodOutcome, MethodError> {
        match self.registry.dispatch(ctx, request).await {
            Some(result) => result,
            None => Err(unregistered_method_error(&request.method)),
        }
    }
}

impl<C> Default for Router<C> {
    fn default() -> Self {
        Self::new(MethodRegistry::new())
    }
}

/// The frozen wire error for a method no registered handler claims.
///
/// The text is contract, not convention: it is reproduced exactly as the S0
/// dispatcher emitted it, because Track 53 moves residency and must not move
/// the wire. Route ownership and dispatch-kind both come from S3's own tables,
/// so the message can distinguish "routed here but unserved" from "unknown".
pub fn unregistered_method_error(method: &str) -> MethodError {
    let kind_hint = dispatch_plan_entry(method)
        .map(|entry| format!(" (dispatch-plan kind: {})", entry.kind.label()))
        .unwrap_or_default();
    let message = classify_method(method)
        .map(|route| {
            format!(
                "{} is routed by {} but has no executable gateway adapter{}",
                method, route.route_id, kind_hint
            )
        })
        .unwrap_or_else(|| format!("{} is not implemented yet{}", method, kind_hint));
    MethodError::new("unimplemented", message)
}

/// Decode a protocol frame into the port's request shape.
pub fn request_from_frame(frame: &RequestFrame, peer_is_loopback: bool) -> MethodRequest {
    MethodRequest {
        method: frame.method.clone(),
        id: frame.id,
        params: frame.params.clone(),
        peer_is_loopback,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use epi_kernel_contract::{BoxFuture, MethodHandler, MethodResult};
    use serde_json::{json, Value};
    use std::sync::Arc;

    struct Ctx;

    struct Fixed(&'static str);

    impl MethodHandler<Ctx> for Fixed {
        fn handle<'a>(&'a self, _ctx: &'a Ctx, _req: &'a MethodRequest) -> BoxFuture<'a, MethodResult> {
            Box::pin(async move { Ok(MethodOutcome::immediate(json!({ "servedBy": self.0 }))) })
        }
    }

    fn request(method: &str) -> MethodRequest {
        MethodRequest::with_params(method, Value::Null)
    }

    #[tokio::test]
    async fn routes_to_the_registered_handler() {
        let mut registry = MethodRegistry::new();
        registry
            .register("s2.graph.node", Arc::new(Fixed("s2")))
            .unwrap();
        let router = Router::new(registry);

        let outcome = router
            .route(&Ctx, &request("s2.graph.node"))
            .await
            .expect("registered method succeeds");
        assert_eq!(outcome.result, json!({ "servedBy": "s2" }));
    }

    /// A method the route table KNOWS but no handler serves must keep the
    /// exact message S0 emitted — same code, same sentence, same kind hint.
    #[tokio::test]
    async fn a_routed_but_unserved_method_keeps_the_frozen_wire_error() {
        let router: Router<Ctx> = Router::default();
        // Pick a real method from S3's own route table so the test binds to
        // the shipped classification rather than a fabricated name.
        let method = crate::dispatch::NARA_PASU_RPC_METHODS[0];
        let route = classify_method(method).expect("method is in the route table");

        let error = router
            .route(&Ctx, &request(method))
            .await
            .expect_err("no handler registered");

        assert_eq!(error.code, "unimplemented");
        assert!(
            error.message.starts_with(&format!(
                "{} is routed by {} but has no executable gateway adapter",
                method, route.route_id
            )),
            "unexpected message: {}",
            error.message
        );
        // The dispatch-plan kind hint is appended when the plan knows the method.
        if let Some(entry) = dispatch_plan_entry(method) {
            assert!(error
                .message
                .ends_with(&format!(" (dispatch-plan kind: {})", entry.kind.label())));
        }
    }

    #[tokio::test]
    async fn an_unrouted_method_reports_not_implemented_yet() {
        let router: Router<Ctx> = Router::default();
        let method = "totally.unknown.method";
        assert!(
            classify_method(method).is_none(),
            "test depends on this name being absent from the route table"
        );

        let error = router
            .route(&Ctx, &request(method))
            .await
            .expect_err("no handler registered");

        assert_eq!(error.code, "unimplemented");
        assert_eq!(error.message, format!("{method} is not implemented yet"));
    }

    /// The drain's scaffold: the composition root parks the not-yet-moved S0
    /// dispatcher on the empty namespace, and any real registration outranks it.
    #[tokio::test]
    async fn the_legacy_fallback_namespace_is_outranked_by_every_real_registration() {
        let mut registry = MethodRegistry::new();
        registry
            .register_namespace(LEGACY_S0_FALLBACK_NAMESPACE, Arc::new(Fixed("legacy-s0")))
            .unwrap();
        registry
            .register("s1'.base.ensure", Arc::new(Fixed("s1-moved")))
            .unwrap();
        registry
            .register_namespace("nara.", Arc::new(Fixed("nara-owner")))
            .unwrap();
        let router = Router::new(registry);

        let served = |method: &'static str| {
            let router = &router;
            async move {
                router
                    .route(&Ctx, &request(method))
                    .await
                    .expect("resolves")
                    .result["servedBy"]
                    .clone()
            }
        };

        // A migrated method reaches its new owner...
        assert_eq!(served("s1'.base.ensure").await, json!("s1-moved"));
        // ...a delegated namespace reaches its owner...
        assert_eq!(served("nara.transform.begin").await, json!("nara-owner"));
        // ...and everything not yet moved still reaches the S0 dispatcher, so
        // the wire is unchanged while the drain proceeds.
        assert_eq!(served("sessions.list").await, json!("legacy-s0"));
        assert_eq!(served("cron.add").await, json!("legacy-s0"));
    }

    #[test]
    fn frame_decodes_into_the_port_request() {
        let frame = RequestFrame {
            kind: "rpc".to_owned(),
            id: 42,
            method: "s2.graph.node".to_owned(),
            params: json!({ "coord": "#5-2" }),
        };

        let request = request_from_frame(&frame, true);
        assert_eq!(request.method, "s2.graph.node");
        assert_eq!(request.id, 42);
        assert_eq!(request.params, json!({ "coord": "#5-2" }));
        assert!(request.peer_is_loopback);
    }
}
