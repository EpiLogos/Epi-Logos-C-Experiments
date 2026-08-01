//! The S3' BeingPattern live-state producer stream (CCT-21).
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | S3′ |
//! | Residency  | Body/S/S3/gateway/src/being_pattern.rs |
//! | Position   | #3 — Gateway Control Plane, live-state production lane |
//! | Actualises | [[S3-SPEC]] temporal surface; cycle-3 CCT-21 (16.T16.21) |
//!
//! # Public surface
//! * [`BeingPatternProducer`] — the live-state producer; observes entities,
//!   projects their being-patterns, bumps stream generations, names the Redis
//!   temporal handles, forwards protected provenance refs.
//! * [`producer`] — the process-wide producer the S3 handlers dispatch into.
//! * [`BEING_PATTERN_EVENT_CHAIN`] — the ordered nine-event stream.
//!
//! # Does NOT own
//! * S2 canon. Nothing here writes Neo4j. `ActualisingOne` hypotheses are
//!   **emit-review-only**: they carry `reviewRisk: forced-unification` and
//!   `status: emitted-review-only`, and promotion to canon stays on the
//!   existing Hen/S2 write path (`s1'.q_articulation.accept`) behind M5 review
//!   plus M0 witness. See CCT-21 (f).
//! * The SpaceTimeDB table/reducer law — that is
//!   `Body/S/S3/epi-spacetime-module/src/lib.rs`. This module CALLS those
//!   reducers through [`crate::spacetime::SpacetimePresence`].
//! * The Redis key vocabulary — `Body/S/S3/redis-context` owns the key shapes;
//!   this module only uses them.
//! * Protected content of any kind. Every payload that leaves this module goes
//!   through `assert_being_pattern_public_safe` — handles, refs and public-safe
//!   summaries only, per the `ProtectedReferenceOnly` privacy class the
//!   kernel-bridge assigns the three `being_pattern_*` surfaces.
//!
//! # Honesty contract
//! This producer NEVER invents entities. An entity exists in the stream only
//! because a caller observed it; `project` on an unobserved entity is a
//! `not_found`, not a fabricated projection. Side effects that could not land
//! (no Redis, no SpaceTimeDB configured) are reported as `landed: false` with
//! a reason — never silently claimed.

use std::collections::BTreeMap;
use std::sync::{Mutex, OnceLock};

use epi_kernel_contract::MethodError;
use epi_s3_gateway_contract::{
    assert_being_pattern_public_safe, being_pattern_acceptance_replay,
    BeingPatternReviewCandidateProjection, BeingPatternStreamEvent, BeingPatternStreamEventKind,
    BEING_PATTERN_OBSERVE_METHOD, BEING_PATTERN_PROJECT_METHOD,
    BEING_PATTERN_REVIEW_CANDIDATE_METHOD, BEING_PATTERN_SUBSCRIBE_METHOD, BEING_PATTERN_TABLES,
};
use epi_s3_redis_context::{CacheTier, RedisCache, RedisConfig, RedisKey};
use portal_core::{
    BeingEntityRef, BeingObserverAnchor, BeingPatternClockAddress, BeingPatternProtectedRef,
    BeingPatternRelationEdge, BioQuaternionHandle, ElementalWeightProjection,
    M2M3RelationProjection, MonoPolyOperator, PasuBeingPatternProjection, PasuLiveStateHandle,
    PasuReviewRisk, PerspectiveRole, StableIdentityHandle,
};
use serde_json::{json, Value};

use crate::spacetime::{being_pattern_bridge_handle_payload, SpacetimeRegistration};

/// The ordered stream CCT-21 (a) specifies. The SpaceTimeDB reducers emit the
/// first five on `observe`, the next three on `project`, and the last on
/// `review_candidate` — this constant is the whole chain in one place so a
/// consumer can assert the order without reconstructing it.
pub const BEING_PATTERN_EVENT_CHAIN: [BeingPatternStreamEventKind; 9] = [
    BeingPatternStreamEventKind::EntityObserved,
    BeingPatternStreamEventKind::BeingPatternProjected,
    BeingPatternStreamEventKind::PerspectiveRoleResolved,
    BeingPatternStreamEventKind::MonoPolyOperatorResolved,
    BeingPatternStreamEventKind::ClockAddressUpdated,
    BeingPatternStreamEventKind::AspectEdgeComputed,
    BeingPatternStreamEventKind::ElementalResonanceChanged,
    BeingPatternStreamEventKind::PatternPacketFormed,
    BeingPatternStreamEventKind::ReviewCandidateEmitted,
];

/// The canon status every live relation edge carries. Live state is never
/// canonical: an edge is review-required until the Hen/S2 path promotes it.
const LIVE_ONLY_CANON_STATUS: &str = "live-only-review-required";

/// Where a `ReviewCandidateEmitted` event may be promoted — and by whom.
const CANON_PROMOTION_PATH: &str =
    "M5 review + M0 witness -> Hen/S2 write path (s1'.q_articulation.accept); \
     CCT-21 never writes S2 canon";

const MAX_RETAINED_EVENTS: usize = 256;

#[derive(Default)]
struct ProducerState {
    generation: u64,
    entities: BTreeMap<String, PasuBeingPatternProjection>,
    edges: BTreeMap<String, BeingPatternRelationEdge>,
    candidates: BTreeMap<String, BeingPatternReviewCandidateProjection>,
    events: Vec<BeingPatternStreamEvent>,
}

/// The live-state producer. One per gateway process (see [`producer`]); tests
/// build their own so state never leaks between cases.
pub struct BeingPatternProducer {
    state: Mutex<ProducerState>,
}

impl Default for BeingPatternProducer {
    fn default() -> Self {
        Self::new()
    }
}

/// The process-wide producer the registered S3 handlers dispatch into.
pub fn producer() -> &'static BeingPatternProducer {
    static PRODUCER: OnceLock<BeingPatternProducer> = OnceLock::new();
    PRODUCER.get_or_init(BeingPatternProducer::new)
}

impl BeingPatternProducer {
    pub fn new() -> Self {
        Self {
            state: Mutex::new(ProducerState::default()),
        }
    }

    /// `s3'.being_pattern.observe` — induct an entity into the live stream.
    pub async fn observe(&self, params: &Value) -> Result<Value, MethodError> {
        assert_params_public_safe(params)?;
        let entity_id = required_string(params, "entityId")?;
        let entity_kind = optional_string(params, "entityKind").unwrap_or_else(|| "being".into());
        let perspective_role = parse_perspective_role(params)?;
        let monopoly_operator = parse_monopoly_operator(params, "monopolyOperator")?;
        let session_key =
            optional_string(params, "sessionKey").unwrap_or_else(|| "agent:main:main".into());
        let agent_id = optional_string(params, "agentId").unwrap_or_else(|| "operator".into());
        let verifier_refs = parse_verifier_refs(params)?;
        let clock_address = parse_clock_address(params);
        let elemental_weights = parse_elemental_weights(params, "elementalWeights")
            .unwrap_or(ElementalWeightProjection {
                fire: 0.0,
                water: 0.0,
                air: 0.0,
                earth: 0.0,
            });

        let (generation, projection) = {
            let mut state = self.lock()?;
            state.generation += 1;
            let generation = state.generation;
            let projection = build_projection(
                &entity_id,
                &entity_kind,
                perspective_role,
                monopoly_operator,
                generation,
                clock_address,
                elemental_weights,
                verifier_refs.clone(),
                state
                    .entities
                    .get(&entity_id)
                    .map(|previous| previous.relation_edges.clone())
                    .unwrap_or_default(),
            );
            state
                .entities
                .insert(entity_id.clone(), projection.clone());
            push_events(
                &mut state,
                &BEING_PATTERN_EVENT_CHAIN[0..5],
                &entity_id,
                generation,
            );
            (generation, projection)
        };

        let payload = public_safe_payload(&projection)?;
        let redis = self
            .cache_presence(&entity_id, generation, &payload)
            .await;
        let spacetime = self.publish_observation(
            &entity_id,
            &entity_kind,
            &session_key,
            generation,
            &projection,
            &payload,
        );

        Ok(json!({
            "method": BEING_PATTERN_OBSERVE_METHOD,
            "coordinateOwner": "S3'",
            "generation": generation,
            "sessionKey": session_key,
            "agentId": agent_id,
            "entityRef": projection.entity_ref,
            "liveState": projection.live_state,
            "perspectiveRole": projection.perspective_role,
            "monopolyOperator": projection.monopoly_operator,
            "reviewRisk": projection.review_risk,
            "events": event_names(&BEING_PATTERN_EVENT_CHAIN[0..5]),
            "redis": redis,
            "spacetime": spacetime,
            "privacyClass": "protected-reference-only",
            "s2Mutated": false,
        }))
    }

    /// `s3'.being_pattern.project` — project an observed entity's being-pattern
    /// (and, when a second observed entity is named, their live relation edge).
    pub async fn project(&self, params: &Value) -> Result<Value, MethodError> {
        assert_params_public_safe(params)?;
        let entity_id = required_string(params, "entityId")?;
        let related_entity_id = optional_string(params, "relatedEntityId");
        let edge_kind = optional_string(params, "edgeKind").unwrap_or_else(|| "aspect-like".into());
        let aspect_label = optional_string(params, "aspectLabel");

        let (generation, projection, edge, emitted) = {
            let mut state = self.lock()?;
            let mut source = state
                .entities
                .get(&entity_id)
                .cloned()
                .ok_or_else(|| unobserved(&entity_id))?;
            state.generation += 1;
            let generation = state.generation;
            source.live_state.generation = generation;
            source.live_state.stream_delta = stream_delta_key(generation);

            let edge = match related_entity_id.as_deref() {
                Some(target_id) => {
                    let target = state
                        .entities
                        .get(target_id)
                        .cloned()
                        .ok_or_else(|| unobserved(target_id))?;
                    let edge = build_relation_edge(
                        &source,
                        &target,
                        generation,
                        &edge_kind,
                        aspect_label.as_deref(),
                    );
                    state.edges.insert(edge.edge_id.clone(), edge.clone());
                    source.relation_edges = vec![edge.clone()];
                    source.m2_m3_relation = edge.m2_m3_relation.clone();
                    if let Some(stored) = state.entities.get_mut(target_id) {
                        stored.relation_edges = vec![edge.clone()];
                        stored.live_state.generation = generation;
                        stored.live_state.stream_delta = stream_delta_key(generation);
                        stored.m2_m3_relation = edge.m2_m3_relation.clone();
                    }
                    Some(edge)
                }
                None => None,
            };

            let emitted: &[BeingPatternStreamEventKind] = if edge.is_some() {
                &BEING_PATTERN_EVENT_CHAIN[5..8]
            } else {
                &BEING_PATTERN_EVENT_CHAIN[7..8]
            };
            push_events(&mut state, emitted, &entity_id, generation);
            state
                .entities
                .insert(entity_id.clone(), source.clone());
            (generation, source, edge, emitted.to_vec())
        };

        let payload = public_safe_payload(&projection)?;
        let redis = self
            .cache_presence(&entity_id, generation, &payload)
            .await;
        let spacetime = match edge.as_ref() {
            Some(edge) => self.publish_relation(edge),
            None => json!({
                "attempted": false,
                "reason": "no relatedEntityId — nothing to project into being_pattern_relation_edge",
            }),
        };

        Ok(json!({
            "method": BEING_PATTERN_PROJECT_METHOD,
            "coordinateOwner": "S3'",
            "generation": generation,
            "projection": payload,
            "relationEdges": edge.as_ref().map(|edge| vec![edge.clone()]).unwrap_or_default(),
            "canonStatus": LIVE_ONLY_CANON_STATUS,
            "events": event_names(&emitted),
            "redis": redis,
            "spacetime": spacetime,
            "privacyClass": "protected-reference-only",
            "s2Mutated": false,
        }))
    }

    /// `s3'.being_pattern.subscribe` — the consumer-facing view of the stream:
    /// current generation, the observed roster, the ordered event chain, the
    /// Redis/SpaceTimeDB handles the consumer binds to.
    pub fn subscribe(&self, params: &Value, state_root: &std::path::Path) -> Result<Value, MethodError> {
        let session_key =
            optional_string(params, "sessionKey").unwrap_or_else(|| "agent:main:main".into());
        let agent_id = optional_string(params, "agentId").unwrap_or_else(|| "operator".into());
        let filter = params
            .get("entityIds")
            .and_then(Value::as_array)
            .map(|ids| {
                ids.iter()
                    .filter_map(Value::as_str)
                    .map(str::to_owned)
                    .collect::<Vec<_>>()
            });
        let include_replay = params
            .get("includeAcceptanceReplay")
            .and_then(Value::as_bool)
            .unwrap_or(false);

        let (generation, projections, edges, candidates, events) = {
            let state = self.lock()?;
            let selected = state
                .entities
                .values()
                .filter(|projection| match filter.as_ref() {
                    Some(ids) => ids.contains(&projection.entity_ref.entity_id),
                    None => true,
                })
                .cloned()
                .collect::<Vec<_>>();
            (
                state.generation,
                selected,
                state.edges.values().cloned().collect::<Vec<_>>(),
                state.candidates.values().cloned().collect::<Vec<_>>(),
                state.events.clone(),
            )
        };

        let mut payloads = Vec::with_capacity(projections.len());
        for projection in &projections {
            payloads.push(public_safe_payload(projection)?);
        }

        let plan = SpacetimeRegistration::from_env(
            epi_s3_gateway_contract::DEFAULT_GATEWAY_PORT,
            state_root,
        )
        .ok()
        .flatten()
        .map(|registration| json!(registration.subscription_plan(&session_key, &agent_id)));

        let mut result = json!({
            "method": BEING_PATTERN_SUBSCRIBE_METHOD,
            "coordinateOwner": "S3'",
            "sessionKey": session_key,
            "agentId": agent_id,
            "generation": generation,
            "streamDeltaKey": stream_delta_key(generation),
            "tables": BEING_PATTERN_TABLES,
            "eventChain": event_names(&BEING_PATTERN_EVENT_CHAIN),
            "entities": payloads,
            "relationEdges": edges,
            "reviewCandidates": candidates,
            "events": events,
            "spacetimeSubscriptionPlan": plan,
            "privacyClass": "protected-reference-only",
            "s2Mutated": false,
            // Honesty: an empty roster means nobody has observed anything yet.
            // The producer does not manufacture inhabitants to look alive.
            "source": if projections.is_empty() {
                "live-producer (no entity observed yet)"
            } else {
                "live-producer"
            },
        });

        if include_replay {
            // The CCT-21 acceptance replay is a FIXTURE, and says so. It exists
            // so 18.10 / 25.22 / 29.16 consumers can be driven from one known
            // generation; it is never presented as live observation.
            let replay = being_pattern_acceptance_replay();
            result["acceptanceReplay"] = json!({
                "source": "acceptance-replay-fixture",
                "generation": replay.generation,
                "events": replay.events,
                "userProjection": being_pattern_bridge_handle_payload(&replay.user_projection),
                "schoolProjection": being_pattern_bridge_handle_payload(&replay.school_projection),
                "relationEdges": replay.relation_edges,
                "reviewCandidate": replay.review_candidate,
                "m4ConsumerGeneration": replay.m4_consumer_generation,
                "clockOverlayGeneration": replay.clock_overlay_generation,
                "s2MutationAttempted": replay.s2_mutation_attempted,
            });
        }
        Ok(result)
    }

    /// `s3'.being_pattern.review_candidate` — emit-review-only. Admits ONLY
    /// `ActualisingOne` hypotheses (CCT-21 (f)); every other operator is a
    /// refusal, not a downgrade. Writes no S2 canon.
    pub async fn review_candidate(&self, params: &Value) -> Result<Value, MethodError> {
        assert_params_public_safe(params)?;
        let candidate_id = required_string(params, "candidateId")?;
        let entity_ids = params
            .get("entityIds")
            .and_then(Value::as_array)
            .map(|ids| {
                ids.iter()
                    .filter_map(Value::as_str)
                    .map(str::to_owned)
                    .collect::<Vec<_>>()
            })
            .filter(|ids: &Vec<String>| !ids.is_empty())
            .ok_or_else(|| {
                MethodError::invalid_params(
                    "entityIds must be a non-empty array of observed entity ids".to_owned(),
                )
            })?;
        let operator = parse_monopoly_operator(params, "monopolyOperator")?;
        if operator != MonoPolyOperator::ActualisingOne {
            return Err(MethodError::invalid_params(format!(
                "{BEING_PATTERN_REVIEW_CANDIDATE_METHOD} admits ONLY ActualisingOne hypotheses \
                 (got {operator:?}); a forced-collapse hypothesis is the only thing that becomes \
                 a review candidate"
            )));
        }
        let verifier_refs = parse_verifier_refs(params)?;

        let (generation, candidate) = {
            let mut state = self.lock()?;
            for entity_id in &entity_ids {
                if !state.entities.contains_key(entity_id) {
                    return Err(unobserved(entity_id));
                }
            }
            state.generation += 1;
            let generation = state.generation;
            let candidate = BeingPatternReviewCandidateProjection {
                candidate_id: candidate_id.clone(),
                generation,
                entity_ids: entity_ids.clone(),
                monopoly_operator: operator,
                // The law, not a parameter: ActualisingOne is always forced
                // unification.
                review_risk: PasuReviewRisk::ForcedUnification,
                verifier_refs: verifier_refs.clone(),
            };
            state
                .candidates
                .insert(candidate_id.clone(), candidate.clone());
            push_events(
                &mut state,
                &BEING_PATTERN_EVENT_CHAIN[8..9],
                &candidate_id,
                generation,
            );
            (generation, candidate)
        };

        let candidate_value = serde_json::to_value(&candidate).map_err(|err| {
            MethodError::internal(format!("review candidate is not serialisable: {err}"))
        })?;
        assert_being_pattern_public_safe(&candidate_value).map_err(MethodError::invalid_params)?;

        let redis = self
            .cache_review_candidate(&candidate_id, &candidate_value)
            .await;
        let spacetime = self.publish_review_candidate(&candidate, &entity_ids);

        Ok(json!({
            "method": BEING_PATTERN_REVIEW_CANDIDATE_METHOD,
            "coordinateOwner": "S3'",
            "generation": generation,
            "candidate": candidate_value,
            "reviewRisk": PasuReviewRisk::ForcedUnification,
            "status": "emitted-review-only",
            "canonPromotionPath": CANON_PROMOTION_PATH,
            "events": event_names(&BEING_PATTERN_EVENT_CHAIN[8..9]),
            "redis": redis,
            "spacetime": spacetime,
            "privacyClass": "protected-reference-only",
            "s2Mutated": false,
        }))
    }

    /// Current stream generation — for tests and for consumers that only need
    /// to know whether they are stale.
    pub fn generation(&self) -> u64 {
        self.state.lock().map(|state| state.generation).unwrap_or(0)
    }

    fn lock(&self) -> Result<std::sync::MutexGuard<'_, ProducerState>, MethodError> {
        self.state
            .lock()
            .map_err(|_| MethodError::internal("being-pattern producer lock poisoned".to_owned()))
    }

    // ---- side effects: attempted, reported, never silently claimed ----------

    async fn cache_presence(&self, entity_id: &str, generation: u64, payload: &Value) -> Value {
        let presence = RedisKey::being_pattern_presence(entity_id);
        let state_key = RedisKey::being_pattern_state(entity_id);
        let delta = RedisKey::being_pattern_stream_delta(generation);
        let keys = json!({
            "presence": presence.as_str(),
            "state": state_key.as_str(),
            "streamDelta": delta.as_str(),
        });
        let writes = [
            (presence, payload.to_string()),
            (state_key, payload.to_string()),
            (
                delta,
                json!({"generation": generation, "entityId": entity_id}).to_string(),
            ),
        ];
        json!({ "keys": keys, "cached": self.write_keys(&writes).await })
    }

    async fn cache_review_candidate(&self, candidate_id: &str, candidate: &Value) -> Value {
        let key = RedisKey::being_pattern_review_candidate(candidate_id);
        let keys = json!({ "reviewCandidate": key.as_str() });
        let writes = [(key, candidate.to_string())];
        json!({ "keys": keys, "cached": self.write_keys(&writes).await })
    }

    async fn write_keys(&self, writes: &[(RedisKey, String)]) -> Value {
        let mut cache = match RedisCache::connect(&RedisConfig::from_env()).await {
            Ok(cache) => cache,
            Err(err) => {
                return json!({
                    "landed": false,
                    "reason": format!("redis unavailable: {err}"),
                })
            }
        };
        for (key, value) in writes {
            let ttl = match key.tier() {
                CacheTier::Hot => CacheTier::Hot.ttl_seconds(),
                tier => tier.ttl_seconds(),
            };
            if let Err(err) = cache.set_with_ttl(key.as_str(), value, ttl).await {
                return json!({
                    "landed": false,
                    "reason": format!("redis write failed for {}: {err}", key.as_str()),
                });
            }
        }
        json!({ "landed": true })
    }

    fn publish_observation(
        &self,
        entity_id: &str,
        entity_kind: &str,
        session_key: &str,
        generation: u64,
        projection: &PasuBeingPatternProjection,
        payload: &Value,
    ) -> Value {
        let Some(registration) = self.registration() else {
            return spacetime_unconfigured("observe_being_pattern_entity");
        };
        let live_state = json!(projection.live_state).to_string();
        let provenance = json!(projection.verifier_refs).to_string();
        let outcome = registration.client().observe_being_pattern_entity(
            entity_id,
            entity_kind,
            &registration.installation_id,
            &registration.gateway_id,
            session_key,
            generation,
            &live_state,
            &payload.to_string(),
            &provenance,
        );
        spacetime_outcome("observe_being_pattern_entity", outcome)
    }

    fn publish_relation(&self, edge: &BeingPatternRelationEdge) -> Value {
        let Some(registration) = self.registration() else {
            return spacetime_unconfigured("project_being_pattern_relation");
        };
        let outcome = registration.client().project_being_pattern_relation(
            &edge.edge_id,
            &edge.source_entity_id,
            &edge.target_entity_id,
            edge.generation,
            &edge.edge_kind,
            &edge.aspect_label,
            &json!(edge.elemental_delta).to_string(),
            &json!(edge.verifier_refs).to_string(),
        );
        spacetime_outcome("project_being_pattern_relation", outcome)
    }

    fn publish_review_candidate(
        &self,
        candidate: &BeingPatternReviewCandidateProjection,
        entity_ids: &[String],
    ) -> Value {
        let Some(registration) = self.registration() else {
            return spacetime_unconfigured("emit_being_pattern_review_candidate");
        };
        let outcome = registration.client().emit_being_pattern_review_candidate(
            &candidate.candidate_id,
            candidate.generation,
            &entity_ids.join(","),
            "ActualisingOne",
            &json!(candidate.verifier_refs).to_string(),
        );
        spacetime_outcome("emit_being_pattern_review_candidate", outcome)
    }

    fn registration(&self) -> Option<SpacetimeRegistration> {
        SpacetimeRegistration::from_env(
            epi_s3_gateway_contract::DEFAULT_GATEWAY_PORT,
            std::path::Path::new("."),
        )
        .ok()
        .flatten()
    }
}

// ---- construction ----------------------------------------------------------

#[allow(clippy::too_many_arguments)]
fn build_projection(
    entity_id: &str,
    entity_kind: &str,
    perspective_role: PerspectiveRole,
    monopoly_operator: MonoPolyOperator,
    generation: u64,
    clock_address: BeingPatternClockAddress,
    elemental_weights: ElementalWeightProjection,
    verifier_refs: Vec<BeingPatternProtectedRef>,
    relation_edges: Vec<BeingPatternRelationEdge>,
) -> PasuBeingPatternProjection {
    // The graph anchor is a REFERENCE into S2, not a write. S2 owns canonical
    // identity; the producer only points at it.
    let graph_anchor = format!("neo4j://s2/Bimba/{entity_id}");
    let mut redis_psyche = BTreeMap::new();
    redis_psyche.insert(
        "presence".to_owned(),
        RedisKey::being_pattern_presence(entity_id).as_str().to_owned(),
    );
    redis_psyche.insert(
        "state".to_owned(),
        RedisKey::being_pattern_state(entity_id).as_str().to_owned(),
    );
    let m2_m3_relation = relation_edges
        .first()
        .map(|edge| edge.m2_m3_relation.clone())
        .unwrap_or_else(|| M2M3RelationProjection {
            relation_handle: format!("m2m3:{entity_id}:{generation}"),
            source: "S3' being-pattern live producer".to_owned(),
            planet_planet_edges: vec![],
            planet_aperture_edges: vec![],
            pending_dataset_badges: vec![],
        });

    PasuBeingPatternProjection {
        entity_ref: BeingEntityRef {
            entity_id: entity_id.to_owned(),
            entity_kind: entity_kind.to_owned(),
            graph_anchor: graph_anchor.clone(),
            public_label: None,
        },
        stable_identity: StableIdentityHandle {
            graph_anchor,
            identity_handle: format!("s2:identity:{entity_id}"),
            source: "S2 Neo4j canonical graph".to_owned(),
        },
        live_state: PasuLiveStateHandle {
            spacetime_row_id: format!("being_pattern_presence:{entity_id}"),
            generation,
            redis_psyche,
            day_ref: String::new(),
            now_ref: String::new(),
            stream_delta: stream_delta_key(generation),
            // Graphiti refs are whatever the caller could evidence — never
            // synthesised. An empty list means no episode backs this yet.
            graphiti_episode_refs: verifier_refs.clone(),
        },
        observer_anchor: BeingObserverAnchor {
            observer_entity_id: entity_id.to_owned(),
            observer_role: perspective_role,
            anchor_ref: format!("observer:earth-centred:{entity_id}"),
        },
        clock_address,
        monopoly_operator,
        perspective_role,
        nara_family_role: None,
        m2_m3_relation,
        // A handle, never a body: the protected bioquaternion stays local.
        bioquaternion_handles: vec![BioQuaternionHandle {
            handle: format!("protected-local://bioquaternion/{entity_id}/current"),
            privacy: "protected-local-body".to_owned(),
            source: "M4 protected handle only".to_owned(),
        }],
        elemental_weights,
        relation_edges,
        verifier_refs,
        review_risk: PasuReviewRisk::for_operator(monopoly_operator),
    }
}

fn build_relation_edge(
    source: &PasuBeingPatternProjection,
    target: &PasuBeingPatternProjection,
    generation: u64,
    edge_kind: &str,
    aspect_label: Option<&str>,
) -> BeingPatternRelationEdge {
    let source_id = &source.entity_ref.entity_id;
    let target_id = &target.entity_ref.entity_id;
    let delta = ElementalWeightProjection {
        fire: target.elemental_weights.fire - source.elemental_weights.fire,
        water: target.elemental_weights.water - source.elemental_weights.water,
        air: target.elemental_weights.air - source.elemental_weights.air,
        earth: target.elemental_weights.earth - source.elemental_weights.earth,
    };
    let separation = (i32::from(target.clock_address.degree360)
        - i32::from(source.clock_address.degree360))
    .rem_euclid(360);
    let mut verifier_refs = source.verifier_refs.clone();
    verifier_refs.extend(target.verifier_refs.iter().cloned());

    BeingPatternRelationEdge {
        edge_id: format!("edge:{source_id}:{target_id}:{generation}"),
        source_entity_id: source_id.clone(),
        target_entity_id: target_id.clone(),
        edge_kind: edge_kind.to_owned(),
        aspect_label: aspect_label
            .map(str::to_owned)
            .unwrap_or_else(|| format!("separation-{separation}-degrees")),
        generation,
        m2_m3_relation: M2M3RelationProjection {
            relation_handle: format!("m2m3:edge:{source_id}:{target_id}:{generation}"),
            source: "S3' being-pattern live producer".to_owned(),
            planet_planet_edges: vec![],
            planet_aperture_edges: vec![],
            pending_dataset_badges: vec![],
        },
        elemental_delta: delta,
        verifier_refs,
        canon_status: LIVE_ONLY_CANON_STATUS.to_owned(),
    }
}

fn push_events(
    state: &mut ProducerState,
    kinds: &[BeingPatternStreamEventKind],
    entity_id: &str,
    generation: u64,
) {
    for kind in kinds {
        state.events.push(BeingPatternStreamEvent {
            kind: *kind,
            generation,
            entity_id: entity_id.to_owned(),
            payload: json!({ "eventKind": kind.as_str(), "generation": generation }),
        });
    }
    if state.events.len() > MAX_RETAINED_EVENTS {
        let overflow = state.events.len() - MAX_RETAINED_EVENTS;
        state.events.drain(0..overflow);
    }
}

fn public_safe_payload(projection: &PasuBeingPatternProjection) -> Result<Value, MethodError> {
    let payload = being_pattern_bridge_handle_payload(projection);
    assert_being_pattern_public_safe(&payload).map_err(MethodError::internal)?;
    Ok(payload)
}

fn stream_delta_key(generation: u64) -> String {
    RedisKey::being_pattern_stream_delta(generation)
        .as_str()
        .to_owned()
}

fn event_names(kinds: &[BeingPatternStreamEventKind]) -> Vec<&'static str> {
    kinds.iter().map(|kind| kind.as_str()).collect()
}

fn spacetime_unconfigured(reducer: &str) -> Value {
    json!({
        "attempted": false,
        "reducer": reducer,
        "reason": "SpaceTimeDB not configured (set SPACETIMEDB_URL or EPI_GATE_SPACETIME_URL); \
                   the producer stream is in-process only",
    })
}

fn spacetime_outcome(reducer: &str, outcome: Result<(), String>) -> Value {
    match outcome {
        Ok(()) => json!({ "attempted": true, "reducer": reducer, "landed": true }),
        Err(err) => json!({
            "attempted": true,
            "reducer": reducer,
            "landed": false,
            "reason": err,
        }),
    }
}

// ---- params ----------------------------------------------------------------

fn unobserved(entity_id: &str) -> MethodError {
    MethodError::not_found(format!(
        "entity '{entity_id}' has not been observed; call \
         {BEING_PATTERN_OBSERVE_METHOD} first — the producer does not invent live entities"
    ))
}

fn required_string(params: &Value, key: &str) -> Result<String, MethodError> {
    optional_string(params, key)
        .ok_or_else(|| MethodError::invalid_params(format!("{key} must be a non-empty string")))
}

fn optional_string(params: &Value, key: &str) -> Option<String> {
    params
        .get(key)
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_owned)
}

/// Accepts `FirstPerson`, `first-person`, `first_person` — one vocabulary, any
/// casing the caller's language produced.
fn normalise(value: &str) -> String {
    value
        .chars()
        .filter(|ch| ch.is_ascii_alphanumeric())
        .map(|ch| ch.to_ascii_lowercase())
        .collect()
}

fn parse_perspective_role(params: &Value) -> Result<PerspectiveRole, MethodError> {
    let Some(raw) = optional_string(params, "perspectiveRole") else {
        return Ok(PerspectiveRole::ThirdPerson);
    };
    match normalise(&raw).as_str() {
        "firstperson" => Ok(PerspectiveRole::FirstPerson),
        "secondperson" => Ok(PerspectiveRole::SecondPerson),
        "firstpersonplural" => Ok(PerspectiveRole::FirstPersonPlural),
        "thirdperson" => Ok(PerspectiveRole::ThirdPerson),
        "collectivewe" => Ok(PerspectiveRole::CollectiveWe),
        "integralwei" => Ok(PerspectiveRole::IntegralWeI),
        _ => Err(MethodError::invalid_params(format!(
            "unknown perspectiveRole '{raw}' (FirstPerson|SecondPerson|FirstPersonPlural|\
             ThirdPerson|CollectiveWe|IntegralWeI)"
        ))),
    }
}

fn parse_monopoly_operator(params: &Value, key: &str) -> Result<MonoPolyOperator, MethodError> {
    let Some(raw) = optional_string(params, key) else {
        return Ok(MonoPolyOperator::Mono);
    };
    match normalise(&raw).as_str() {
        "mono" => Ok(MonoPolyOperator::Mono),
        "poly" => Ok(MonoPolyOperator::Poly),
        "actuallymany" => Ok(MonoPolyOperator::ActuallyMany),
        "potentiallyone" => Ok(MonoPolyOperator::PotentiallyOne),
        "actualisingone" => Ok(MonoPolyOperator::ActualisingOne),
        "potentiatingmany" => Ok(MonoPolyOperator::PotentiatingMany),
        "monopoly" => Ok(MonoPolyOperator::MonoPoly),
        _ => Err(MethodError::invalid_params(format!(
            "unknown {key} '{raw}' (Mono|Poly|ActuallyMany|PotentiallyOne|ActualisingOne|\
             PotentiatingMany|MonoPoly)"
        ))),
    }
}

fn parse_clock_address(params: &Value) -> BeingPatternClockAddress {
    let node = params.get("clockAddress");
    let Some(node) = node.filter(|value| value.is_object()) else {
        // No clock observation supplied: say so rather than inventing a degree.
        return BeingPatternClockAddress {
            degree360: 0,
            tick12: 0,
            hexagram: None,
            line: None,
            source: "no clock observation supplied".to_owned(),
        };
    };
    let u16_at = |key: &str| node.get(key).and_then(Value::as_u64).unwrap_or(0) as u16;
    BeingPatternClockAddress {
        degree360: u16_at("degree360") % 360,
        tick12: (node.get("tick12").and_then(Value::as_u64).unwrap_or(0) % 12) as u8,
        hexagram: node
            .get("hexagram")
            .and_then(Value::as_u64)
            .map(|value| value as u8),
        line: node
            .get("line")
            .and_then(Value::as_u64)
            .map(|value| value as u8),
        source: optional_string(node, "source")
            .unwrap_or_else(|| "caller-supplied clock observation".to_owned()),
    }
}

fn parse_elemental_weights(params: &Value, key: &str) -> Option<ElementalWeightProjection> {
    let node = params.get(key)?;
    let at = |name: &str| node.get(name).and_then(Value::as_f64).unwrap_or(0.0) as f32;
    Some(ElementalWeightProjection {
        fire: at("fire"),
        water: at("water"),
        air: at("air"),
        earth: at("earth"),
    })
}

fn parse_verifier_refs(params: &Value) -> Result<Vec<BeingPatternProtectedRef>, MethodError> {
    let Some(items) = params.get("verifierRefs").and_then(Value::as_array) else {
        return Ok(vec![]);
    };
    items
        .iter()
        .map(|item| {
            Ok(BeingPatternProtectedRef {
                episode_id: required_string(item, "episodeId")?,
                source_ref: required_string(item, "sourceRef")?,
                public_summary: optional_string(item, "publicSummary").unwrap_or_default(),
            })
        })
        .collect()
}

/// The privacy gate on the way IN. `assert_being_pattern_public_safe` is the
/// same predicate the bridge applies on the way out; applying it to params too
/// means a protected body cannot enter the stream at all.
fn assert_params_public_safe(params: &Value) -> Result<(), MethodError> {
    assert_being_pattern_public_safe(params).map_err(|err| {
        MethodError::invalid_params(format!(
            "{err} — the being-pattern stream carries handles, refs and public-safe summaries only"
        ))
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    async fn observed(
        producer: &BeingPatternProducer,
        id: &str,
        role: &str,
        operator: &str,
    ) -> Value {
        producer
            .observe(&json!({
                "entityId": id,
                "entityKind": id,
                "perspectiveRole": role,
                "monopolyOperator": operator,
                "elementalWeights": {"fire": 0.3, "water": 0.2, "air": 0.4, "earth": 0.1},
                "clockAddress": {"degree360": 137, "tick12": 5, "hexagram": 42, "line": 3},
            }))
            .await
            .expect("observation succeeds")
    }

    #[tokio::test]
    async fn the_acceptance_scenario_runs_two_entities_through_one_stream() {
        let producer = BeingPatternProducer::new();
        let user = observed(&producer, "user-being", "FirstPerson", "Mono").await;
        let school = observed(&producer, "school-of-thought-being", "ThirdPerson", "Poly").await;
        assert_eq!(user["perspectiveRole"], "FirstPerson");
        assert_eq!(user["monopolyOperator"], "Mono");
        assert_eq!(school["perspectiveRole"], "ThirdPerson");
        assert_eq!(school["monopolyOperator"], "Poly");

        let projected = producer
            .project(&json!({
                "entityId": "user-being",
                "relatedEntityId": "school-of-thought-being",
            }))
            .await
            .expect("projection succeeds");
        assert_eq!(
            projected["events"],
            json!([
                "AspectEdgeComputed",
                "ElementalResonanceChanged",
                "PatternPacketFormed"
            ])
        );
        assert_eq!(
            projected["relationEdges"][0]["canonStatus"],
            LIVE_ONLY_CANON_STATUS
        );
        assert_eq!(projected["s2Mutated"], json!(false));

        let subscribed = producer
            .subscribe(&json!({}), std::path::Path::new("."))
            .expect("subscribe succeeds");
        assert_eq!(subscribed["entities"].as_array().unwrap().len(), 2);
        assert_eq!(
            subscribed["eventChain"].as_array().unwrap().len(),
            BEING_PATTERN_EVENT_CHAIN.len()
        );
        // One generation counter drives every consumer.
        assert_eq!(
            subscribed["generation"],
            json!(producer.generation()),
        );
    }

    #[tokio::test]
    async fn review_candidate_admits_only_actualising_one_and_never_mutates_s2() {
        let producer = BeingPatternProducer::new();
        observed(&producer, "user-being", "FirstPerson", "Mono").await;
        observed(&producer, "school-of-thought-being", "ThirdPerson", "Poly").await;

        let refused = producer
            .review_candidate(&json!({
                "candidateId": "candidate:mono:1",
                "entityIds": ["user-being"],
                "monopolyOperator": "Mono",
            }))
            .await
            .expect_err("Mono is not a review candidate");
        assert_eq!(refused.code, "invalid-params");
        assert!(refused.message.contains("ActualisingOne"));

        let emitted = producer
            .review_candidate(&json!({
                "candidateId": "candidate:actualising-one:1",
                "entityIds": ["user-being", "school-of-thought-being"],
                "monopolyOperator": "ActualisingOne",
            }))
            .await
            .expect("ActualisingOne is admitted");
        assert_eq!(emitted["reviewRisk"], "forced-unification");
        assert_eq!(emitted["status"], "emitted-review-only");
        assert_eq!(emitted["s2Mutated"], json!(false));
        assert_eq!(emitted["events"], json!(["ReviewCandidateEmitted"]));
        assert!(emitted["canonPromotionPath"]
            .as_str()
            .unwrap()
            .contains("Hen/S2"));
    }

    #[tokio::test]
    async fn an_unobserved_entity_is_not_found_rather_than_invented() {
        let producer = BeingPatternProducer::new();
        let error = producer
            .project(&json!({"entityId": "never-observed"}))
            .await
            .expect_err("an unobserved entity has no projection");
        assert_eq!(error.code, "not-found");

        let empty = producer
            .subscribe(&json!({}), std::path::Path::new("."))
            .expect("subscribe succeeds with nothing observed");
        assert_eq!(empty["entities"], json!([]));
        assert!(empty["source"].as_str().unwrap().contains("no entity"));
    }

    #[tokio::test]
    async fn a_protected_body_cannot_enter_the_stream() {
        let producer = BeingPatternProducer::new();
        let error = producer
            .observe(&json!({
                "entityId": "user-being",
                "verifierRefs": [{
                    "episodeId": "episode:1",
                    "sourceRef": "graphiti:episode:1",
                    "episodeBody": "the protected journal text",
                }],
            }))
            .await
            .expect_err("a protected body is refused at the door");
        assert_eq!(error.code, "invalid-params");
        assert!(error.message.contains("episodeBody"));
    }
}
