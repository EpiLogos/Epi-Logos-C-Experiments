//! The S-root method-handler port — the inversion that makes residency possible.
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | S-root |
//! | Residency  | Body/S/epi-kernel-contract/src/method_handler.rs |
//! | Position   | #0 — the port beneath every S layer |
//! | Actualises | [[S0-SPEC]] DR-S0-1 (parent of all S layers), Track 53 T53.01 |
//!
//! # Why this lives below everyone
//!
//! A gateway that serves `s1'.*`, `s2.*`, `s3'.*`, `s4'.*` and `s5'.*` must
//! reach every layer, while `rustSStackBoundary` forbids any layer from
//! importing a layer above it. Those two requirements are only jointly
//! satisfiable by dependency inversion against a port that sits *below*
//! everyone: each layer implements [`MethodHandler`] for the methods its own
//! coordinate owns, the composition root registers those implementations, and
//! S3 routes by name through [`MethodRegistry`] without importing a single
//! implementation. Moving a universal dispatcher into any layer instead only
//! trades S0→S5 violations for S3→S5 ones.
//!
//! # Public surface
//! * [`MethodRequest`] / [`MethodOutcome`] / [`MethodError`] — the envelope
//!   handlers exchange, carrying the frozen wire vocabulary.
//! * [`FollowUp`] — an opaque post-response action; S-root names the shape,
//!   the control plane owns the meaning.
//! * [`MethodHandler`] — the port itself, generic over the caller's context so
//!   no layer type is named here.
//! * [`MethodRegistry`] — name → handler and namespace → handler, refusing
//!   duplicate registration of either.
//!
//! # Namespaces
//!
//! The registry resolves an exact method name first, then the **longest**
//! registered namespace prefix. Both are needed because the dispatcher this
//! port replaces is not uniformly exact-match: alongside its literal arms it
//! carries a guard arm delegating an entire namespace to a sub-dispatcher
//! (`method if method.starts_with("nara.")` → a 2,073-line handler tree). An
//! exact-name-only registry would answer every `nara.*` call as unregistered
//! and silently break that surface, so namespace registration is part of the
//! port rather than a later addition. Exact-before-prefix preserves the
//! existing arm order, where literal arms are matched ahead of the guard.
//!
//! # Does NOT own
//! * The set of method names, their routing, or their dispatch-kind
//!   classification — that is S3's route table (`METHOD_DISPATCH_PLAN`).
//! * The wire error for an *unregistered* method. [`MethodRegistry::dispatch`]
//!   returns `None` rather than synthesising one, because the real fallback
//!   message is built from S3's route table and the wire is frozen.
//! * Any handler implementation, transport, or session authority.

use std::collections::BTreeMap;
use std::fmt;
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;

use serde_json::Value;

/// A future returned by a [`MethodHandler`], boxed so the trait stays
/// dyn-compatible (`async fn` in traits is not object-safe).
pub type BoxFuture<'a, T> = Pin<Box<dyn Future<Output = T> + Send + 'a>>;

/// What a handler produces, or the error it reports.
pub type MethodResult = Result<MethodOutcome, MethodError>;

/// One inbound method call, decoded from the wire.
///
/// This mirrors the fields of the gateway `RequestFrame` that a handler is
/// entitled to see. Transport concerns (frame kind, socket, peer address) stay
/// with the control plane.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MethodRequest {
    /// The dispatched method name, e.g. `s1'.base.ensure`.
    pub method: String,
    /// The request id, echoed into the response frame by the control plane.
    pub id: u64,
    /// Raw parameters. Handlers parse and validate their own shape.
    pub params: Value,
    /// Whether the calling peer is loopback. Some methods are loopback-only.
    pub peer_is_loopback: bool,
}

impl MethodRequest {
    /// Build a request. `params` defaults to `Value::Null` via
    /// [`MethodRequest::with_params`] when a caller has none.
    pub fn new(method: impl Into<String>, id: u64, params: Value, peer_is_loopback: bool) -> Self {
        Self {
            method: method.into(),
            id,
            params,
            peer_is_loopback,
        }
    }

    /// Convenience for tests and internal calls: a loopback request with id 0.
    pub fn with_params(method: impl Into<String>, params: Value) -> Self {
        Self::new(method, 0, params, true)
    }
}

/// A post-response action the control plane should take after the result has
/// been written to the wire.
///
/// S-root deliberately models this as an opaque `kind` + `payload` rather than
/// an enum of concrete actions: the actions that exist today (starting an agent
/// run, starting a chat run) are S3/S4 semantics, and naming them here would
/// pull upper-layer meaning into the root contract.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FollowUp {
    /// Discriminator the control plane maps to its own action type.
    pub kind: String,
    /// Action arguments, interpreted by the control plane.
    pub payload: Value,
}

impl FollowUp {
    pub fn new(kind: impl Into<String>, payload: Value) -> Self {
        Self {
            kind: kind.into(),
            payload,
        }
    }
}

/// A successful handler result: the JSON written to the wire, plus an optional
/// action to run after the response is sent.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MethodOutcome {
    pub result: Value,
    pub follow_up: Option<FollowUp>,
}

impl MethodOutcome {
    /// The common case: answer now, nothing deferred.
    pub fn immediate(result: Value) -> Self {
        Self {
            result,
            follow_up: None,
        }
    }

    /// Answer now, then run `follow_up` once the response is on the wire.
    pub fn with_follow_up(result: Value, follow_up: FollowUp) -> Self {
        Self {
            result,
            follow_up: Some(follow_up),
        }
    }
}

/// A handler failure, carrying the frozen wire error vocabulary.
///
/// The `code` values are the ones the gateway already emits; they are contract,
/// not convention, and must not drift (Track 53 gotcha 7 — the wire is frozen).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MethodError {
    pub code: String,
    pub message: String,
}

impl MethodError {
    pub fn new(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            code: code.into(),
            message: message.into(),
        }
    }

    /// `invalid-params` — the request shape or values are wrong.
    pub fn invalid_params(message: impl Into<String>) -> Self {
        Self::new("invalid-params", message)
    }

    /// `not-found` — the addressed entity does not exist.
    pub fn not_found(message: impl Into<String>) -> Self {
        Self::new("not-found", message)
    }

    /// `internal` — the handler failed for a reason the caller cannot fix.
    pub fn internal(message: impl Into<String>) -> Self {
        Self::new("internal", message)
    }
}

impl fmt::Display for MethodError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}: {}", self.code, self.message)
    }
}

impl std::error::Error for MethodError {}

/// Turn a `(code, message)` pair — the tuple the gateway dispatcher uses today
/// — into a [`MethodError`], so migrating handlers do not have to restate it.
impl From<(String, String)> for MethodError {
    fn from((code, message): (String, String)) -> Self {
        Self { code, message }
    }
}

impl From<MethodError> for (String, String) {
    fn from(error: MethodError) -> Self {
        (error.code, error.message)
    }
}

/// The port. A layer implements this for the methods its own coordinate owns.
///
/// `C` is the caller-supplied context (session store, runtime handle, state
/// root, …). It is a type parameter rather than a concrete type precisely so
/// that S-root names no layer's types: the control plane picks `C`, and every
/// handler registered in one [`MethodRegistry`] shares it.
pub trait MethodHandler<C>: Send + Sync {
    /// Handle one call. Implementations return a boxed future because
    /// `async fn` in a trait is not dyn-compatible, and the registry stores
    /// handlers as trait objects.
    fn handle<'a>(&'a self, ctx: &'a C, request: &'a MethodRequest) -> BoxFuture<'a, MethodResult>;
}

/// Refusal returned when a method name or namespace is registered twice.
///
/// Registration is by explicit call and never by inventory scan, so a handler
/// that is not wired is *absent* rather than silently defaulted — and a name
/// claimed twice is a wiring bug, reported rather than resolved by last-write.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DuplicateMethod {
    pub method: String,
}

impl fmt::Display for DuplicateMethod {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "method '{}' is already registered; each method has exactly one owning handler",
            self.method
        )
    }
}

impl std::error::Error for DuplicateMethod {}

/// Name → handler, plus namespace → handler. Built by the composition root,
/// read by the control plane.
pub struct MethodRegistry<C> {
    handlers: BTreeMap<String, Arc<dyn MethodHandler<C>>>,
    namespaces: BTreeMap<String, Arc<dyn MethodHandler<C>>>,
}

impl<C> MethodRegistry<C> {
    pub fn new() -> Self {
        Self {
            handlers: BTreeMap::new(),
            namespaces: BTreeMap::new(),
        }
    }

    /// Register `handler` under `method`. Refuses a duplicate name rather than
    /// overwriting, so two layers cannot both claim a method silently.
    pub fn register(
        &mut self,
        method: impl Into<String>,
        handler: Arc<dyn MethodHandler<C>>,
    ) -> Result<(), DuplicateMethod> {
        let method = method.into();
        if self.handlers.contains_key(&method) {
            return Err(DuplicateMethod { method });
        }
        self.handlers.insert(method, handler);
        Ok(())
    }

    /// Register `handler` for every method beginning with `prefix`.
    ///
    /// This is the port's expression of a namespace delegated wholesale to one
    /// owning sub-dispatcher. Exact registrations always win over a namespace,
    /// so a single method inside a delegated namespace can still be carved out
    /// to its own handler without unregistering the namespace.
    pub fn register_namespace(
        &mut self,
        prefix: impl Into<String>,
        handler: Arc<dyn MethodHandler<C>>,
    ) -> Result<(), DuplicateMethod> {
        let prefix = prefix.into();
        if self.namespaces.contains_key(&prefix) {
            return Err(DuplicateMethod { method: prefix });
        }
        self.namespaces.insert(prefix, handler);
        Ok(())
    }

    /// The handler that would serve `method`: the exact registration if there
    /// is one, otherwise the longest registered namespace prefix.
    pub fn get(&self, method: &str) -> Option<&Arc<dyn MethodHandler<C>>> {
        if let Some(handler) = self.handlers.get(method) {
            return Some(handler);
        }
        self.namespaces
            .iter()
            .filter(|(prefix, _)| method.starts_with(prefix.as_str()))
            .max_by_key(|(prefix, _)| prefix.len())
            .map(|(_, handler)| handler)
    }

    pub fn contains(&self, method: &str) -> bool {
        self.get(method).is_some()
    }

    /// Every exactly-registered method name, sorted. Namespaces are reported
    /// separately by [`MethodRegistry::namespace_prefixes`] — they match an
    /// open set of names and so cannot be enumerated here.
    pub fn method_names(&self) -> Vec<&str> {
        self.handlers.keys().map(String::as_str).collect()
    }

    /// Every registered namespace prefix, sorted.
    pub fn namespace_prefixes(&self) -> Vec<&str> {
        self.namespaces.keys().map(String::as_str).collect()
    }

    /// The number of exact method registrations.
    pub fn len(&self) -> usize {
        self.handlers.len()
    }

    pub fn is_empty(&self) -> bool {
        self.handlers.is_empty() && self.namespaces.is_empty()
    }

    /// Dispatch by name.
    ///
    /// Returns `None` when no handler is registered — deliberately, so the
    /// caller builds the unregistered-method error from its own route table.
    /// S-root does not know whether an unrecognised name is unrouted, routed
    /// but unimplemented, or served by another substrate, and the wire text for
    /// those cases is frozen S3 behaviour.
    pub async fn dispatch(&self, ctx: &C, request: &MethodRequest) -> Option<MethodResult> {
        let handler = self.get(request.method.as_str())?;
        Some(handler.handle(ctx, request).await)
    }
}

impl<C> Default for MethodRegistry<C> {
    fn default() -> Self {
        Self::new()
    }
}

impl<C> fmt::Debug for MethodRegistry<C> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("MethodRegistry")
            .field("methods", &self.method_names())
            .field("namespaces", &self.namespace_prefixes())
            .finish()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    /// Context standing in for the real gateway state, proving the port needs
    /// no knowledge of any layer's types.
    struct FakeCtx {
        vault_root: String,
    }

    /// Fake handler #1 — reads the context and echoes a param.
    struct EchoHandler;

    impl MethodHandler<FakeCtx> for EchoHandler {
        fn handle<'a>(
            &'a self,
            ctx: &'a FakeCtx,
            request: &'a MethodRequest,
        ) -> BoxFuture<'a, MethodResult> {
            Box::pin(async move {
                let note = request
                    .params
                    .get("note")
                    .and_then(Value::as_str)
                    .ok_or_else(|| MethodError::invalid_params("note must be a string"))?;
                Ok(MethodOutcome::immediate(json!({
                    "note": note,
                    "vaultRoot": ctx.vault_root,
                })))
            })
        }
    }

    /// Fake handler #2 — a different method, returning a follow-up action.
    struct StartRunHandler;

    impl MethodHandler<FakeCtx> for StartRunHandler {
        fn handle<'a>(
            &'a self,
            _ctx: &'a FakeCtx,
            _request: &'a MethodRequest,
        ) -> BoxFuture<'a, MethodResult> {
            Box::pin(async move {
                Ok(MethodOutcome::with_follow_up(
                    json!({ "runId": "run-1" }),
                    FollowUp::new("startAgentRun", json!({ "runId": "run-1" })),
                ))
            })
        }
    }

    fn registry() -> MethodRegistry<FakeCtx> {
        let mut registry = MethodRegistry::new();
        registry
            .register("test.echo", Arc::new(EchoHandler))
            .expect("first registration succeeds");
        registry
            .register("test.startRun", Arc::new(StartRunHandler))
            .expect("distinct method registers");
        registry
    }

    #[tokio::test]
    async fn dispatches_by_name_to_the_owning_handler() {
        let registry = registry();
        let ctx = FakeCtx {
            vault_root: "/vault".to_owned(),
        };

        let echoed = registry
            .dispatch(
                &ctx,
                &MethodRequest::with_params("test.echo", json!({ "note": "hello" })),
            )
            .await
            .expect("registered method dispatches")
            .expect("handler succeeds");
        assert_eq!(echoed.result, json!({ "note": "hello", "vaultRoot": "/vault" }));
        assert_eq!(echoed.follow_up, None);

        // The second handler is reached by ITS name, proving the registry keys
        // by method rather than falling through to a first/default handler.
        let started = registry
            .dispatch(&ctx, &MethodRequest::with_params("test.startRun", Value::Null))
            .await
            .expect("registered method dispatches")
            .expect("handler succeeds");
        assert_eq!(started.result, json!({ "runId": "run-1" }));
        assert_eq!(
            started.follow_up,
            Some(FollowUp::new("startAgentRun", json!({ "runId": "run-1" })))
        );
    }

    #[test]
    fn duplicate_registration_is_refused_and_leaves_the_first_handler_in_place() {
        let mut registry = registry();
        let before = registry.len();

        let refused = registry
            .register("test.echo", Arc::new(StartRunHandler))
            .expect_err("a second claim on the same method name must be refused");

        assert_eq!(
            refused,
            DuplicateMethod {
                method: "test.echo".to_owned()
            }
        );
        assert_eq!(registry.len(), before, "refusal must not insert");
        assert!(refused
            .to_string()
            .contains("exactly one owning handler"));
    }

    #[tokio::test]
    async fn refused_duplicate_does_not_displace_the_original_handler() {
        let mut registry = registry();
        let _ = registry.register("test.echo", Arc::new(StartRunHandler));
        let ctx = FakeCtx {
            vault_root: "/vault".to_owned(),
        };

        // Still the EchoHandler: a refused registration is a no-op, not a
        // last-write-wins overwrite.
        let echoed = registry
            .dispatch(
                &ctx,
                &MethodRequest::with_params("test.echo", json!({ "note": "still-echo" })),
            )
            .await
            .expect("method still registered")
            .expect("handler succeeds");
        assert_eq!(echoed.result["note"], json!("still-echo"));
    }

    #[tokio::test]
    async fn unregistered_method_returns_none_so_the_caller_owns_the_wire_error() {
        let registry = registry();
        let ctx = FakeCtx {
            vault_root: "/vault".to_owned(),
        };

        let outcome = registry
            .dispatch(&ctx, &MethodRequest::with_params("test.absent", Value::Null))
            .await;

        assert!(
            outcome.is_none(),
            "S-root must not synthesise the unregistered-method error; the route \
             table that can describe it lives in S3"
        );
    }

    #[tokio::test]
    async fn handler_errors_carry_the_frozen_wire_codes() {
        let registry = registry();
        let ctx = FakeCtx {
            vault_root: "/vault".to_owned(),
        };

        let error = registry
            .dispatch(&ctx, &MethodRequest::with_params("test.echo", json!({})))
            .await
            .expect("method registered")
            .expect_err("missing required param fails");

        assert_eq!(error.code, "invalid-params");
        // Round trips through the (code, message) tuple the current dispatcher
        // uses, so a migrating handler keeps its exact wire error.
        let tuple: (String, String) = error.clone().into();
        assert_eq!(tuple.0, "invalid-params");
        assert_eq!(MethodError::from(tuple), error);
    }

    #[test]
    fn registry_reports_its_registered_names() {
        let registry = registry();
        assert_eq!(registry.method_names(), vec!["test.echo", "test.startRun"]);
        assert!(registry.contains("test.echo"));
        assert!(!registry.contains("test.absent"));
    }

    /// A namespace handler that reports which method reached it, standing in
    /// for the `nara.*` sub-dispatcher the current gateway delegates to.
    struct NamespaceHandler(&'static str);

    impl MethodHandler<FakeCtx> for NamespaceHandler {
        fn handle<'a>(
            &'a self,
            _ctx: &'a FakeCtx,
            request: &'a MethodRequest,
        ) -> BoxFuture<'a, MethodResult> {
            Box::pin(async move {
                Ok(MethodOutcome::immediate(json!({
                    "servedBy": self.0,
                    "method": request.method,
                })))
            })
        }
    }

    #[tokio::test]
    async fn a_registered_namespace_serves_every_method_beneath_it() {
        let mut registry = registry();
        registry
            .register_namespace("nara.", Arc::new(NamespaceHandler("nara")))
            .expect("namespace registers");
        let ctx = FakeCtx {
            vault_root: "/vault".to_owned(),
        };

        // The whole open namespace resolves, not just names known up front.
        // Without this the guard arm `method if method.starts_with("nara.")`
        // could not be expressed and every nara call would 404.
        for method in ["nara.transform.begin", "nara.arena.state", "nara.x.y.z"] {
            let outcome = registry
                .dispatch(&ctx, &MethodRequest::with_params(method, Value::Null))
                .await
                .unwrap_or_else(|| panic!("{method} must resolve through the namespace"))
                .expect("handler succeeds");
            assert_eq!(outcome.result["servedBy"], json!("nara"));
            assert_eq!(outcome.result["method"], json!(method));
        }

        // A neighbouring name that merely shares a stem is NOT captured.
        assert!(registry
            .dispatch(&ctx, &MethodRequest::with_params("narwhal.dive", Value::Null))
            .await
            .is_none());
    }

    #[tokio::test]
    async fn exact_registration_wins_over_a_namespace_and_longest_prefix_wins() {
        let mut registry = MethodRegistry::new();
        registry
            .register_namespace("nara.", Arc::new(NamespaceHandler("broad")))
            .unwrap();
        registry
            .register_namespace("nara.transform.", Arc::new(NamespaceHandler("specific")))
            .unwrap();
        registry
            .register("nara.transform.begin", Arc::new(NamespaceHandler("exact")))
            .unwrap();
        let ctx = FakeCtx {
            vault_root: "/vault".to_owned(),
        };

        let served = |method: &'static str| {
            let registry = &registry;
            let ctx = &ctx;
            async move {
                registry
                    .dispatch(ctx, &MethodRequest::with_params(method, Value::Null))
                    .await
                    .expect("resolves")
                    .expect("succeeds")
                    .result["servedBy"]
                    .clone()
            }
        };

        // Exact beats both namespaces — this is what lets one method be carved
        // out of a delegated namespace, and it mirrors the current arm order
        // where literal arms precede the starts_with guard.
        assert_eq!(served("nara.transform.begin").await, json!("exact"));
        // Longest matching prefix beats the shorter one.
        assert_eq!(served("nara.transform.commit").await, json!("specific"));
        assert_eq!(served("nara.arena.state").await, json!("broad"));
    }

    #[test]
    fn duplicate_namespace_registration_is_refused() {
        let mut registry = MethodRegistry::new();
        registry
            .register_namespace("nara.", Arc::new(NamespaceHandler("first")))
            .expect("first namespace registers");

        let refused = registry
            .register_namespace("nara.", Arc::new(NamespaceHandler("second")))
            .expect_err("a second claim on the same namespace must be refused");
        assert_eq!(refused.method, "nara.");
        assert_eq!(registry.namespace_prefixes(), vec!["nara."]);
    }

    #[test]
    fn a_namespace_and_an_exact_name_are_separate_registrations() {
        let mut registry = MethodRegistry::new();
        registry
            .register("nara.", Arc::new(NamespaceHandler("exact")))
            .expect("exact name registers");
        // Registering the same string as a namespace is not a duplicate: the
        // two are different claims, resolved in different passes.
        registry
            .register_namespace("nara.", Arc::new(NamespaceHandler("namespace")))
            .expect("namespace registers independently");
        assert_eq!(registry.method_names(), vec!["nara."]);
        assert_eq!(registry.namespace_prefixes(), vec!["nara."]);
    }

    #[test]
    fn error_constructors_use_the_gateway_vocabulary() {
        assert_eq!(MethodError::invalid_params("x").code, "invalid-params");
        assert_eq!(MethodError::not_found("x").code, "not-found");
        assert_eq!(MethodError::internal("x").code, "internal");
    }
}
