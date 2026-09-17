//! `s2.*` / `s2'.*` gateway handlers — the graph-substrate methods, at their coordinate.
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | S2 |
//! | Residency  | Body/S/S2/graph-services/src/s2_handlers.rs |
//! | Position   | #2 — GraphDB Substrate (Neo4j), and its S2' semantic face |
//! | Actualises | [[S2-SPEC]], Track 53 T53.05 |
//!
//! These bodies were `epi-cli/src/gate/graph.rs::dispatch_graph_method`. Every
//! `crate::graph::*` path that function used was a thin re-export shim over
//! `epi_s2_graph_services` (`epi-cli/src/graph/client.rs` is literally
//! `pub use epi_s2_graph_services::{Neo4jClient, Neo4jConfig};`), so the whole
//! surface was already S2 law reached through an S0 façade. It now lives where
//! its law does, and the paths are direct `crate::` ones.
//!
//! # Public surface
//! * [`S2_METHODS`] — method name → owning handler, the table S3 registers.
//! * [`register_s2_handlers`] — register every method S2 owns into a registry
//!   the composition root builds.
//!
//! # Does NOT own
//! * Method routing, the registry, or the wire envelope — S-root's
//!   `epi_kernel_contract::method_handler` names the port, S3 routes to it.
//! * `s2.parashaktiCorrespondences`. That handler is a genuine cross-coordinate
//!   composite: its decan chain reads `crate::nara::medicine` / `crate::nara::oracle`
//!   (M4 Nara law) and its epogdoon projection reads
//!   `crate::gate::kernel_bridge_runtime` (the S0 kernel bridge), both resident
//!   in `epi-cli`. S2 cannot depend on `epi-logos` (cargo cycle), so the method
//!   stays behind and composes at the composition root.
//!
//! # Fidelity notes (Track 53 — this is a relocation, not a rewrite)
//! * The wire is frozen. The S0 dispatcher mapped all 21 `s2*` arms with
//!   `internal_error`, so every failure here carries the `internal` code even
//!   where the failure is really a bad param. Changing that belongs to a wire
//!   track, not this one.
//! * The original connected to Neo4j *before* entering its `match`, so three
//!   methods that never touch the client — `s2.graph.seed.snapshot`,
//!   `s2.graph.relation_family.list` — and one that only needs it for the
//!   n10s import still fail with `connect failed: …` when Neo4j is unreachable,
//!   and they fail there *before* any param is validated. Each relocated
//!   handler therefore opens the connection as its first act, preserving both
//!   the failure and its ordering. The two arms that returned before that point
//!   (`s2'.coordinate.resolve`, `s2.graph.pointer_web.compute`) still open no
//!   connection at all.

use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use serde_json::{json, Value};

use epi_kernel_contract::{
    BoxFuture, DuplicateMethod, MethodError, MethodHandler, MethodOutcome, MethodRegistry,
    MethodRequest, MethodResult,
};

use crate::retrieval::{CoordinateRetrieval, PropPredicate};
use crate::{
    fusion_rrf_results, import_epi_ontology_with_n10s, kernel_coordinate_anchor_from_parts,
    ontology_import_plan, DisclosureLevel, GdsOverlayRequest, GraphMethodParams,
    GraphMethodService, GraphNodeRequest, GraphPromotionSyncReport, GraphQueryRequest,
    GraphRAGRetriever, GraphTraverseDirection, GraphTraverseRequest,
    HarmonicRelationMaterializationRequest, HybridFusionConfig, KernelResonanceObservationRequest,
    M0ResidualListRequest, Neo4jClient, Neo4jConfig, PointerWebRefreshRequest, RetrievalResult,
    S2GraphPromotionIntent, SyncCoordinator,
};

const RELATION_FAMILY_VALUES: &[&str] = &[
    "structural",
    "correspondential",
    "kernel_core",
    "inferred",
    "sync",
    "compatibility",
];

// ---------------------------------------------------------------------------
// Handlers — one per method name, each the body of its former `match` arm.
// ---------------------------------------------------------------------------

/// The Neo4j handle every graph-touching arm opened before its `match`. Kept as
/// one helper so the `connect failed: …` message stays literally identical.
fn connect_client() -> Result<Neo4jClient, String> {
    let config = Neo4jConfig::from_env();
    Neo4jClient::connect(&config).map_err(|err| format!("connect failed: {err}"))
}

fn coordinate_resolve(params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        let coordinate = required_string(params, "coordinate")?;
        let resolution = GraphMethodService::resolve_coordinate_string(&coordinate)?;
        serde_json::to_value(resolution).map_err(|err| err.to_string())
    })
}

fn pointer_web_compute(params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        let coordinate = required_string(params, "coordinate")?;
        let resolution = GraphMethodService::resolve_coordinate_string(&coordinate)?;
        let coordinate_anchor = kernel_coordinate_anchor_from_parts(
            &resolution.canonical,
            &resolution.input,
            resolution.compatibility_property.clone(),
        )?;
        let coordinate_reference_projection =
            coordinate_anchor.coordinate_reference_projection.clone();
        Ok(json!({
            "resolution": resolution,
            "coordinate_anchor": coordinate_anchor,
            "coordinateReferenceProjection": coordinate_reference_projection,
            "deprecatedPointerWeb": {
                "status": "deprecated_compatibility_only",
                "replacement": "s2.graph.harmonic_relations.materialize + s2.graph.traverse"
            },
        }))
    })
}

fn graph_query(params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        let client = connect_client()?;
        let service = GraphMethodService::new(&client);
        let cypher = required_string(params, "cypher")?;
        let query_params = params.get("params").cloned().unwrap_or_else(|| json!({}));
        service
            .query(GraphQueryRequest {
                cypher,
                params: GraphMethodParams::from_json(query_params)?,
            })
            .await
    })
}

fn graph_node(params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        let client = connect_client()?;
        let service = GraphMethodService::new(&client);
        let coordinate = required_string(params, "coordinate")?;
        service.node(GraphNodeRequest { coordinate }).await
    })
}

fn graph_list(params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        let client = connect_client()?;
        let service = GraphMethodService::new(&client);
        let coordinate_prefix = required_string(params, "coordinatePrefix")?;
        let offset = params
            .get("offset")
            .and_then(Value::as_i64)
            .unwrap_or_default();
        let limit = params.get("limit").and_then(Value::as_i64).unwrap_or(20);
        service
            .list_m0_residual(M0ResidualListRequest {
                coordinate_prefix,
                offset,
                limit,
            })
            .await
    })
}

fn graph_list_by_filter(params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        let client = connect_client()?;
        // Track 48 §13.E — coordinate-scoped base-view list-by-filter. The
        // async row-returning `list_by_filter` on CoordinateRetrieval already
        // yields `{ "rows": [...] }`; the handler just marshals params.
        let coordinate_scope = params
            .get("coordinateScope")
            .and_then(Value::as_str)
            .unwrap_or("");
        let predicates: Vec<PropPredicate> = match params.get("propertyFilters") {
            Some(value) => serde_json::from_value(value.clone())
                .map_err(|err| format!("invalid propertyFilters: {err}"))?,
            None => Vec::new(),
        };
        let limit = params.get("limit").and_then(Value::as_i64);
        CoordinateRetrieval::new(&client)
            .list_by_filter(coordinate_scope, &predicates, limit)
            .await
    })
}

fn graph_traverse(params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        let client = connect_client()?;
        let service = GraphMethodService::new(&client);
        let from = required_string(params, "from")?;
        let edge_types = params
            .get("edgeTypes")
            .and_then(|value| value.as_array())
            .map(|items| {
                items
                    .iter()
                    .filter_map(|item| item.as_str().map(str::to_owned))
                    .collect::<Vec<_>>()
            })
            .unwrap_or_default();
        let direction = match params
            .get("direction")
            .and_then(|value| value.as_str())
            .unwrap_or("both")
        {
            "outbound" => GraphTraverseDirection::Outbound,
            "inbound" => GraphTraverseDirection::Inbound,
            _ => GraphTraverseDirection::Both,
        };
        let depth = params
            .get("depth")
            .and_then(|value| value.as_u64())
            .unwrap_or(1) as u32;
        service
            .traverse(GraphTraverseRequest {
                from,
                edge_types,
                direction,
                depth,
            })
            .await
    })
}

fn kernel_resonance_record(params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        let client = connect_client()?;
        let service = GraphMethodService::new(&client);
        service
            .record_kernel_resonance(KernelResonanceObservationRequest {
                source_coordinate: required_string(params, "sourceCoordinate")?,
                session_key: required_string(params, "sessionKey")?,
                timestamp_ms: required_u64(params, "timestampMs")?,
                lens: required_u8(params, "lens", 5)?,
                ascent_helix: params
                    .get("ascentHelix")
                    .and_then(|value| value.as_bool())
                    .unwrap_or(false),
                position: required_u8(params, "position", 5)?,
                score: required_f64(params, "score")?,
                kernel_tick: required_u8(params, "kernelTick", 11)?,
                graphiti_arc_id: params
                    .get("graphitiArcId")
                    .and_then(|value| value.as_str())
                    .map(str::to_owned),
            })
            .await
    })
}

fn gds_tangent_overlay(params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        let client = connect_client()?;
        let service = GraphMethodService::new(&client);
        let coordinate = required_string(params, "coordinate")?;
        let top_k = params
            .get("topK")
            .or_else(|| params.get("top_k"))
            .and_then(|value| value.as_u64())
            .unwrap_or(8) as usize;
        service
            .gds_tangent_overlay(GdsOverlayRequest { coordinate, top_k })
            .await
    })
}

fn ontology_reload(_params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        let client = connect_client()?;
        import_epi_ontology_with_n10s(&client).await?;
        let plan = ontology_import_plan();
        Ok(json!({
            "method": "s2.graph.ontology.reload",
            "ontologyUri": plan.ontology_uri,
            "versionIri": plan.version_iri,
            "sourceFormat": plan.source_format,
            "turtleSha256": plan.turtle_sha256,
            "status": "reloaded"
        }))
    })
}

fn seed_snapshot(_params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        // The connection is unused by this arm, but the original opened it
        // before the match, so an unreachable Neo4j still fails this method.
        let _client = connect_client()?;
        let queries = crate::seed::seed_baseline_snapshot_queries();
        let coordinates = crate::seed::seed_baseline_coordinates();
        let relationship_types = crate::seed::seed_relationship_types();
        Ok(json!({
            "method": "s2.graph.seed.snapshot",
            "coordinateCount": coordinates.len(),
            "coordinates": coordinates,
            "relationshipTypes": relationship_types,
            "queries": queries.iter().map(|query| json!({
                "name": query.name,
                "cypher": query.cypher
            })).collect::<Vec<_>>()
        }))
    })
}

fn core65_audit(_params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        let client = connect_client()?;
        let service = GraphMethodService::new(&client);
        service.core_65_audit().await
    })
}

fn promotion_dry_run(params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        let _client = connect_client()?;
        let intent = promotion_intent_from_params(params)?;
        let plan = SyncCoordinator::validate_promotion_intent(&intent)?;
        let report = GraphPromotionSyncReport::planned(&plan);
        Ok(json!({
            "method": "s2.graph.promotion.dry_run",
            "report": report,
            "plan": {
                "coordinate": plan.coordinate,
                "identityProperty": plan.identity_property,
                "labels": plan.labels,
                "properties": plan.properties,
                "sourcePath": plan.source_path,
                "relationCount": plan.relationships.len(),
                "compatibilityMigrations": plan.compatibility_migrations,
                "syncVersion": plan.sync_version,
                "promotionSource": plan.promotion_source
            },
            "canonicalWritePerformed": false
        }))
    })
}

fn promotion_commit(params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        let client = connect_client()?;
        let intent = promotion_intent_from_params(params)?;
        let report = SyncCoordinator::new(&client).promote_intent(&intent).await?;
        Ok(json!({
            "method": "s2.graph.promotion.commit",
            "report": report,
            "canonicalWritePerformed": true
        }))
    })
}

fn relation_family_list(_params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        // Constant payload, but the original still required the connection the
        // dispatcher opened ahead of the match. Preserved verbatim.
        let _client = connect_client()?;
        Ok(json!({
            "method": "s2.graph.relation_family.list",
            "property": "c_1_relation_family",
            "values": RELATION_FAMILY_VALUES,
            "source": "DR-IG-1 / S2 graph-services relation-family discriminator"
        }))
    })
}

fn harmonic_relations_materialize(params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        let client = connect_client()?;
        let service = GraphMethodService::new(&client);
        let timestamp_ms = params
            .get("timestampMs")
            .and_then(|value| value.as_u64())
            .unwrap_or_else(current_epoch_millis);
        service
            .materialize_harmonic_relations(HarmonicRelationMaterializationRequest { timestamp_ms })
            .await
    })
}

fn pointer_web_refresh(params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        let client = connect_client()?;
        let service = GraphMethodService::new(&client);
        let coordinate = required_string(params, "coordinate")?;
        let timestamp_ms = params
            .get("timestampMs")
            .and_then(|value| value.as_u64())
            .unwrap_or_else(current_epoch_millis);
        service
            .refresh_pointer_web(PointerWebRefreshRequest {
                coordinate,
                timestamp_ms,
            })
            .await
    })
}

fn retrieve(params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        let client = connect_client()?;
        let query = required_string(params, "query")?;
        let depth = params
            .get("depth")
            .and_then(|value| value.as_u64())
            .map(|value| value as u32);
        GraphRAGRetriever::new(&client)
            .retrieve(&query, depth, Some(10))
            .await
    })
}

fn rerank(params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        // `s2'.rerank` is pure fusion arithmetic, but the connection the
        // dispatcher opened before the match gated it all the same.
        let _client = connect_client()?;
        let vector_results = parse_results(params, "vectorResults")?;
        let graph_results = parse_results(params, "graphResults")?;
        let results = fusion_rrf_results(
            &vector_results,
            &graph_results,
            HybridFusionConfig::default(),
        );
        Ok(json!({ "results": results }))
    })
}

fn enrich(params: &Value) -> BoxFuture<'_, Result<Value, String>> {
    Box::pin(async move {
        let client = connect_client()?;
        let coordinates = params
            .get("coordinates")
            .and_then(|value| value.as_array())
            .ok_or_else(|| "coordinates must be an array".to_string())?
            .iter()
            .map(|value| {
                value
                    .as_str()
                    .map(str::to_owned)
                    .ok_or_else(|| "coordinates must contain strings".to_string())
            })
            .collect::<Result<Vec<_>, _>>()?;
        let level = params
            .get("level")
            .and_then(|value| value.as_str())
            .and_then(|value| match value {
                "uuid" => Some(DisclosureLevel::UuidOnly),
                "identity" => Some(DisclosureLevel::Identity),
                "summary" => Some(DisclosureLevel::Summary),
                "content" => Some(DisclosureLevel::Content),
                "connected" => Some(DisclosureLevel::Connected),
                "complete" => Some(DisclosureLevel::Complete),
                _ => None,
            })
            .unwrap_or(DisclosureLevel::Summary);
        let refs = coordinates.iter().map(String::as_str).collect::<Vec<_>>();
        let results = GraphRAGRetriever::new(&client)
            .progressive_disclosure_batch(&refs, level)
            .await?;
        Ok(json!({ "results": results }))
    })
}

// ---------------------------------------------------------------------------
// Shared param helpers — verbatim from the S0 dispatcher.
// ---------------------------------------------------------------------------

fn promotion_intent_from_params(params: &Value) -> Result<S2GraphPromotionIntent, String> {
    let value = params
        .get("intent")
        .cloned()
        .unwrap_or_else(|| params.clone());
    serde_json::from_value(value).map_err(|err| format!("invalid promotion intent: {err}"))
}

fn required_string(params: &Value, key: &str) -> Result<String, String> {
    params
        .get(key)
        .and_then(|value| value.as_str())
        .map(str::to_owned)
        .ok_or_else(|| format!("{key} must be a string"))
}

fn required_u64(params: &Value, key: &str) -> Result<u64, String> {
    params
        .get(key)
        .and_then(|value| value.as_u64())
        .ok_or_else(|| format!("{key} must be a positive integer"))
}

fn required_u8(params: &Value, key: &str, max: u8) -> Result<u8, String> {
    let value = required_u64(params, key)?;
    if value > max as u64 {
        return Err(format!("{key} must be <= {max}"));
    }
    Ok(value as u8)
}

fn required_f64(params: &Value, key: &str) -> Result<f64, String> {
    let value = params
        .get(key)
        .and_then(|value| value.as_f64())
        .ok_or_else(|| format!("{key} must be a number"))?;
    if !value.is_finite() {
        return Err(format!("{key} must be finite"));
    }
    Ok(value)
}

fn current_epoch_millis() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or(0)
}

fn parse_results(params: &Value, key: &str) -> Result<Vec<RetrievalResult>, String> {
    match params.get(key) {
        Some(value) => serde_json::from_value(value.clone())
            .map_err(|err| format!("{key} must be RetrievalResult[]: {err}")),
        None => Ok(Vec::new()),
    }
}

// ---------------------------------------------------------------------------
// The port: S2 declares which `s2*` methods it owns and how to reach them.
// ---------------------------------------------------------------------------

/// One relocated handler: params in, JSON or a message out — asynchronously,
/// because every one of these arms may touch Neo4j.
///
/// The S1 port could use a plain `fn(&Value) -> Result<Value, String>` because
/// its handlers are synchronous. S2's are not, and `async fn` items have
/// unnameable opaque return types, so a table of them cannot be built from fn
/// pointers. Returning an explicit [`BoxFuture`] makes each handler a nameable
/// `fn` again and keeps the S1 shape — one adapter over a `(name, fn)` table —
/// rather than twenty near-identical handler structs.
type S2HandlerFn = for<'a> fn(&'a Value) -> BoxFuture<'a, Result<Value, String>>;

/// The one adapter, generic over the caller's context because S2 needs none of
/// it — which is the point: the coordinate that owns these methods names no
/// gateway type to serve them.
struct S2Handler(S2HandlerFn);

impl<C: Send + Sync> MethodHandler<C> for S2Handler {
    fn handle<'a>(&'a self, _ctx: &'a C, request: &'a MethodRequest) -> BoxFuture<'a, MethodResult> {
        let handler = self.0;
        Box::pin(async move {
            handler(&request.params)
                .await
                .map(MethodOutcome::immediate)
                // The S0 dispatcher mapped all 21 `s2*` arms with
                // `internal_error`. The wire is frozen (Track 53 gotcha 7), so
                // the code stays `internal` even for what are plainly
                // invalid-params failures — changing it belongs to a wire track.
                .map_err(MethodError::internal)
        })
    }
}

/// Method name → owning handler. Twenty of the twenty-one `s2*` arms the S0
/// dispatcher carried; `s2.parashaktiCorrespondences` is absent by law, see the
/// module header.
pub const S2_METHODS: &[(&str, S2HandlerFn)] = &[
    ("s2.graph.query", graph_query),
    ("s2.graph.node", graph_node),
    ("s2.graph.list", graph_list),
    ("s2.graph.list_by_filter", graph_list_by_filter),
    ("s2.graph.traverse", graph_traverse),
    (
        "s2.graph.harmonic_relations.materialize",
        harmonic_relations_materialize,
    ),
    ("s2.graph.pointer_web.compute", pointer_web_compute),
    ("s2.graph.pointer_web.refresh", pointer_web_refresh),
    ("s2.graph.kernel_resonance.record", kernel_resonance_record),
    ("s2.graph.gds.tangent_overlay", gds_tangent_overlay),
    ("s2.graph.ontology.reload", ontology_reload),
    ("s2.graph.seed.snapshot", seed_snapshot),
    ("s2.graph.core65.audit", core65_audit),
    ("s2.graph.promotion.dry_run", promotion_dry_run),
    ("s2.graph.promotion.commit", promotion_commit),
    ("s2.graph.relation_family.list", relation_family_list),
    ("s2'.coordinate.resolve", coordinate_resolve),
    ("s2'.retrieve", retrieve),
    ("s2'.rerank", rerank),
    ("s2'.enrich", enrich),
];

/// The one method the S0 dispatcher routed here that S2 must NOT claim, named
/// so the omission is asserted rather than merely described. See the module
/// header for why it is a cross-coordinate composite.
pub const S2_COMPOSITE_AT_ROOT: &str = "s2.parashaktiCorrespondences";

/// Register every method S2 owns into a registry the composition root builds.
pub fn register_s2_handlers<C: Send + Sync + 'static>(
    registry: &mut MethodRegistry<C>,
) -> Result<(), DuplicateMethod> {
    for (method, handler) in S2_METHODS {
        registry.register(*method, Arc::new(S2Handler(*handler)))?;
    }
    Ok(())
}

#[cfg(test)]
mod port_tests {
    use super::*;

    struct NoCtx;

    #[test]
    fn every_registered_method_is_an_s2_name_and_unique() {
        let mut registry: MethodRegistry<NoCtx> = MethodRegistry::new();
        register_s2_handlers(&mut registry).expect("no duplicate method names");
        assert_eq!(registry.len(), S2_METHODS.len());
        for (method, _) in S2_METHODS {
            assert!(
                method.starts_with("s2.") || method.starts_with("s2'."),
                "{method} is not an s2 method"
            );
            assert!(registry.contains(method), "{method} did not register");
        }
    }

    /// The 21 names the S0 dispatch arm covered, minus the one composite. If a
    /// name is dropped or misspelled in the relocation the wire silently loses
    /// a method, so the table is pinned literally.
    #[test]
    fn the_table_carries_exactly_the_twenty_relocated_names() {
        let mut names = S2_METHODS
            .iter()
            .map(|(method, _)| *method)
            .collect::<Vec<_>>();
        names.sort_unstable();
        assert_eq!(
            names,
            vec![
                "s2'.coordinate.resolve",
                "s2'.enrich",
                "s2'.rerank",
                "s2'.retrieve",
                "s2.graph.core65.audit",
                "s2.graph.gds.tangent_overlay",
                "s2.graph.harmonic_relations.materialize",
                "s2.graph.kernel_resonance.record",
                "s2.graph.list",
                "s2.graph.list_by_filter",
                "s2.graph.node",
                "s2.graph.ontology.reload",
                "s2.graph.pointer_web.compute",
                "s2.graph.pointer_web.refresh",
                "s2.graph.promotion.commit",
                "s2.graph.promotion.dry_run",
                "s2.graph.query",
                "s2.graph.relation_family.list",
                "s2.graph.seed.snapshot",
                "s2.graph.traverse",
            ]
        );
        assert_eq!(S2_METHODS.len(), 20);
    }

    /// The composite stays at the composition root. S2 claiming it would be a
    /// silent promise it cannot keep — the M4 Nara and S0 kernel-bridge law it
    /// needs is unreachable from this crate.
    #[test]
    fn the_parashakti_composite_is_not_claimed_by_s2() {
        let mut registry: MethodRegistry<NoCtx> = MethodRegistry::new();
        register_s2_handlers(&mut registry).unwrap();
        assert!(!registry.contains(S2_COMPOSITE_AT_ROOT));
        assert!(!S2_METHODS
            .iter()
            .any(|(method, _)| *method == S2_COMPOSITE_AT_ROOT));
    }

    #[tokio::test]
    async fn a_handler_failure_keeps_the_frozen_internal_code() {
        let mut registry: MethodRegistry<NoCtx> = MethodRegistry::new();
        register_s2_handlers(&mut registry).unwrap();
        // `s2'.coordinate.resolve` returns before any Neo4j contact, so a
        // missing `coordinate` fails offline. The dispatcher mapped every s2
        // arm with `internal_error` and that must not drift.
        let error = registry
            .dispatch(
                &NoCtx,
                &MethodRequest::with_params("s2'.coordinate.resolve", json!({})),
            )
            .await
            .expect("method is registered")
            .expect_err("missing params fails");
        assert_eq!(error.code, "internal");
        assert_eq!(error.message, "coordinate must be a string");
    }

    /// The two arms the dispatcher answered before opening Neo4j still answer
    /// without it — the relocation must not have pulled them behind `connect`.
    #[tokio::test]
    async fn the_pre_connect_arms_still_resolve_without_a_graph() {
        let mut registry: MethodRegistry<NoCtx> = MethodRegistry::new();
        register_s2_handlers(&mut registry).unwrap();

        let resolved = registry
            .dispatch(
                &NoCtx,
                &MethodRequest::with_params(
                    "s2'.coordinate.resolve",
                    json!({ "coordinate": "M2-3" }),
                ),
            )
            .await
            .expect("method is registered")
            .expect("coordinate resolution is kernel law, not a graph read");
        assert!(resolved.result.get("canonical").is_some());

        let computed = registry
            .dispatch(
                &NoCtx,
                &MethodRequest::with_params(
                    "s2.graph.pointer_web.compute",
                    json!({ "coordinate": "M2-3" }),
                ),
            )
            .await
            .expect("method is registered")
            .expect("pointer-web compute is kernel law, not a graph read");
        assert_eq!(
            computed.result["deprecatedPointerWeb"]["status"],
            "deprecated_compatibility_only"
        );
        assert_eq!(
            computed.result["deprecatedPointerWeb"]["replacement"],
            "s2.graph.harmonic_relations.materialize + s2.graph.traverse"
        );
    }

    /// The constant-payload arm is one of the oddities this relocation
    /// preserves: it reads nothing from the graph yet the original opened the
    /// connection before matching, so its values are only reachable through
    /// that gate. The table itself is asserted directly.
    #[test]
    fn the_relation_family_values_are_the_dr_ig_1_set() {
        assert_eq!(
            RELATION_FAMILY_VALUES,
            &[
                "structural",
                "correspondential",
                "kernel_core",
                "inferred",
                "sync",
                "compatibility",
            ]
        );
    }
}
