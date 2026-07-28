use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, OnceLock};
use std::time::Duration;

use epi_kernel_contract::{
    BoxFuture, FollowUp, MethodError, MethodHandler, MethodOutcome, MethodRegistry, MethodRequest,
    MethodResult,
};
use epi_s3_gateway::dispatch::{classify_method, dispatch_plan_entry};
use epi_s3_gateway::router::{request_from_frame, Router, LEGACY_S0_FALLBACK_NAMESPACE};
use epi_s3_gateway_contract::TerminalBinding;
use portal_core::{
    ananda_projection, kernel_tick_from_epogdoon, m3_transcription_projection, PortalClockState,
    VakAddress,
};
use serde_json::{json, Value};

use crate::gate::kernel_bridge_runtime::{
    typed_json_m2_cymatic_monopoly_state, typed_json_m2_epogdoon_projection,
    typed_json_m2_planetary_elemental_weights, typed_json_m3_lens_codon_binary,
    typed_json_m3_lens_field,
};
use crate::gate::protocol::RequestFrame;
use crate::gate::runs::{RunContext, RunSnapshot};
use crate::gate::runtime::GatewayRuntimeState;
use crate::gate::sessions::{SessionPatch, SessionStore};
use crate::gate::{
    anima, approvals, browser, channels, chat, config, cron, devices, epii, gnostic, graph,
    graphiti, logs, models, nodes, sessions, skills, subagents, system, transcripts, update,
    verifier, wizard,
};

use super::method_envelope::{DispatchResult, PostResponseAction};

use super::{
    agent_id_from_session_key, branch_session, inherit_nullable_string_field,
    inherit_nullable_value_field, internal_error, invalid_params_error, is_stop_command_text,
    not_found_error, now_ms, nullable_string_field, optional_parse_param, optional_str,
    publish_activity_surface, publish_presence_surfaces, publish_session_surface, required_str,
    required_str_alias, session_identifier, session_tree, session_value_with_run_state,
};

/// The context every registered handler receives.
///
/// Both fields are cheap to clone — `GatewayRuntimeState` is an `Arc` handle —
/// so the router can hold a registry that outlives any single request instead
/// of being rebuilt per call.
pub(crate) struct GatewayCallContext {
    pub(crate) state_root: PathBuf,
    pub(crate) runtime: GatewayRuntimeState,
    /// S3's session store, owned so the S3 handler port can borrow it.
    pub(crate) session_store: epi_s3_gateway::session_store::SessionStore,
}

// The composition root is where the coordinates meet. Each layer stated what it
// needs as a trait rather than importing a gateway type, so the wiring is these
// three impls and nothing else — S1, S2, S3 and S5 named none of each other.

impl epi_s5_epii_review_core::s5_handlers::StateRootContext for GatewayCallContext {
    fn state_root(&self) -> &std::path::Path {
        &self.state_root
    }
}

impl epi_s3_gateway::temporal_session::TemporalSurfaces for GatewayCallContext {
    // Kairos and Pratibimba are M4 identity law resident in this crate, so S3
    // takes them as an injected surface rather than importing upward.
    fn kairos_surface(&self, day_id: &str) -> Value {
        crate::gate::temporal::kairos_surface_value(day_id)
    }

    fn pratibimba_surface(&self) -> Value {
        crate::gate::temporal::pratibimba_surface_value()
    }
}

impl epi_s3_gateway::s3_handlers::TemporalContextEnv for GatewayCallContext {
    fn state_root(&self) -> &std::path::Path {
        &self.state_root
    }

    fn session_store(&self) -> &epi_s3_gateway::session_store::SessionStore {
        &self.session_store
    }
}

/// The not-yet-relocated S0 dispatcher, wrapped as a handler so it can be
/// parked on the registry's lowest-priority namespace while Track 53 drains
/// handlers to their coordinates (`53.T53.04`–`53.T53.08`).
///
/// Nothing about the 179 method arms below changed: they are reached through
/// the registry now rather than called directly, which is what moves the
/// routing decision to S3 without moving a single handler body yet.
struct LegacyS0Dispatcher;

impl MethodHandler<GatewayCallContext> for LegacyS0Dispatcher {
    fn handle<'a>(
        &'a self,
        ctx: &'a GatewayCallContext,
        request: &'a MethodRequest,
    ) -> BoxFuture<'a, MethodResult> {
        Box::pin(async move {
            let frame = RequestFrame {
                kind: "rpc".to_owned(),
                id: request.id,
                method: request.method.clone(),
                params: request.params.clone(),
            };
            legacy_dispatch_rpc(
                &ctx.state_root,
                &ctx.runtime,
                &frame,
                request.peer_is_loopback,
            )
            .await
            .map(outcome_from_dispatch_result)
            .map_err(MethodError::from)
        })
    }
}

/// The process-wide router. Built once; S3 owns the resolution rule.
fn router() -> &'static Router<GatewayCallContext> {
    static ROUTER: OnceLock<Router<GatewayCallContext>> = OnceLock::new();
    ROUTER.get_or_init(|| {
        let mut registry = MethodRegistry::new();
        // T53.04: S1 owns its `s1'.*` methods and registers them itself. Exact
        // names outrank the fallback namespace below, so these leave the legacy
        // dispatcher by subtraction.
        epi_s1_hen_compiler_core::s1_handlers::register_s1_handlers(&mut registry)
            .expect("s1' handlers register exactly once");
        epi_s2_graph_services::register_s2_handlers(&mut registry)
            .expect("s2 handlers register exactly once");
        epi_s3_gateway::register_s3_handlers(&mut registry)
            .expect("s3' handlers register exactly once");
        epi_s5_epii_review_core::s5_handlers::register_s5_review_handlers(&mut registry)
            .expect("s5' review handlers register exactly once");
        epi_s5_epii_autoresearch_core::s5_handlers::register_s5_autoresearch_handlers(&mut registry)
            .expect("s5' improve/tune handlers register exactly once");
        epi_s5_epii_agent_core::s5_handlers::register_s5_epii_handlers(&mut registry)
            .expect("s5' epii handlers register exactly once");
        registry
            .register_namespace(LEGACY_S0_FALLBACK_NAMESPACE, Arc::new(LegacyS0Dispatcher))
            .expect("the legacy fallback is registered exactly once");
        Router::new(registry)
    })
}

/// `startAgentRun` / `startChatRun` follow-up discriminators.
///
/// The S-root port models a post-response action as an opaque `kind` +
/// `payload` so that S4 semantics stay out of the root contract; these two
/// constants are where S0 re-attaches the meaning.
const FOLLOW_UP_START_AGENT_RUN: &str = "startAgentRun";
const FOLLOW_UP_START_CHAT_RUN: &str = "startChatRun";

fn outcome_from_dispatch_result(result: DispatchResult) -> MethodOutcome {
    match result.post_response {
        None => MethodOutcome::immediate(result.result),
        Some(action) => {
            let (kind, run_id, session_key, message) = match action {
                PostResponseAction::StartAgentRun {
                    run_id,
                    session_key,
                    message,
                } => (FOLLOW_UP_START_AGENT_RUN, run_id, session_key, message),
                PostResponseAction::StartChatRun {
                    run_id,
                    session_key,
                    message,
                } => (FOLLOW_UP_START_CHAT_RUN, run_id, session_key, message),
            };
            MethodOutcome::with_follow_up(
                result.result,
                FollowUp::new(
                    kind,
                    json!({
                        "runId": run_id,
                        "sessionKey": session_key,
                        "message": message,
                    }),
                ),
            )
        }
    }
}

fn dispatch_result_from_outcome(outcome: MethodOutcome) -> Result<DispatchResult, (String, String)> {
    let Some(follow_up) = outcome.follow_up else {
        return Ok(DispatchResult::immediate(outcome.result));
    };
    let field = |name: &str| -> Result<String, (String, String)> {
        follow_up
            .payload
            .get(name)
            .and_then(Value::as_str)
            .map(str::to_owned)
            .ok_or_else(|| {
                internal_error(format!(
                    "follow-up '{}' is missing string field '{}'",
                    follow_up.kind, name
                ))
            })
    };
    let run_id = field("runId")?;
    let session_key = field("sessionKey")?;
    let message = field("message")?;
    let action = match follow_up.kind.as_str() {
        FOLLOW_UP_START_AGENT_RUN => PostResponseAction::StartAgentRun {
            run_id,
            session_key,
            message,
        },
        FOLLOW_UP_START_CHAT_RUN => PostResponseAction::StartChatRun {
            run_id,
            session_key,
            message,
        },
        other => {
            return Err(internal_error(format!(
                "unknown post-response follow-up kind '{other}'"
            )))
        }
    };
    Ok(DispatchResult::with_post_response(outcome.result, action))
}

/// Entry point from the websocket loop. Unchanged in signature and in wire
/// behaviour; routing now resolves through S3.
pub(super) async fn dispatch_rpc(
    state_root: &PathBuf,
    runtime: &GatewayRuntimeState,
    frame: &RequestFrame,
    peer_is_loopback: bool,
) -> Result<DispatchResult, (String, String)> {
    let ctx = GatewayCallContext {
        state_root: state_root.clone(),
        runtime: runtime.clone(),
        session_store: epi_s3_gateway::session_store::SessionStore::new(state_root)
            .map_err(internal_error)?,
    };
    let request = request_from_frame(frame, peer_is_loopback);
    match router().route(&ctx, &request).await {
        Ok(outcome) => dispatch_result_from_outcome(outcome),
        Err(error) => Err(error.into()),
    }
}

async fn legacy_dispatch_rpc(
    state_root: &PathBuf,
    runtime: &GatewayRuntimeState,
    frame: &RequestFrame,
    peer_is_loopback: bool,
) -> Result<DispatchResult, (String, String)> {
    let store = SessionStore::new(state_root).map_err(internal_error)?;
    let route = classify_method(&frame.method);

    match frame.method.as_str() {
        "vault.day.ensure" => crate::gate::day_start::ensure_day(&frame.params)
            .and_then(|receipt| serde_json::to_value(receipt).map_err(|err| err.to_string()))
            .map(DispatchResult::immediate)
            .map_err(invalid_params_error),
        "khora.session_start" => crate::gate::day_start::start_session(&frame.params)
            .and_then(|receipt| serde_json::to_value(receipt).map_err(|err| err.to_string()))
            .map(DispatchResult::immediate)
            .map_err(invalid_params_error),
        // Method literal (not the const) so the S3 route-ownership cross-walk
        // can grep the dispatched method name in S0's dispatch surface — the
        // house convention every sibling arm follows (kept in sync with
        // gateway-contract METHOD_NAMES by dispatch_contract::T9).
        "kernelBridge.m3.lensCodonBinary(lensId)" => {
            let lens_id = frame
                .params
                .get("lensId")
                .and_then(Value::as_u64)
                .ok_or_else(|| {
                    invalid_params_error("lensId must be an unsigned integer".to_owned())
                })?;
            if lens_id > u8::MAX as u64 {
                return Err(invalid_params_error(format!(
                    "lensId {lens_id} outside functional M3 lenses 0..16"
                )));
            }
            typed_json_m3_lens_codon_binary(lens_id as u8)
                .map(DispatchResult::immediate)
                .map_err(invalid_params_error)
        }
        "kernelBridge.m2.epogdoonProjection(address72)" => {
            let address72 = frame
                .params
                .get("address72")
                .and_then(Value::as_u64)
                .ok_or_else(|| {
                    invalid_params_error("address72 must be an unsigned integer".to_owned())
                })?;
            if address72 > u8::MAX as u64 {
                return Err(invalid_params_error(format!(
                    "address72 {address72} exceeds the kernel's u8 range"
                )));
            }
            Ok(DispatchResult::immediate(
                typed_json_m2_epogdoon_projection(address72 as u8),
            ))
        }
        "kernelBridge.m2.cymaticMonoPolyState(address72)" => {
            let address72 = frame
                .params
                .get("address72")
                .and_then(Value::as_u64)
                .ok_or_else(|| {
                    invalid_params_error("address72 must be an unsigned integer".to_owned())
                })?;
            if address72 > u8::MAX as u64 {
                return Err(invalid_params_error(format!(
                    "address72 {address72} exceeds the kernel's u8 range"
                )));
            }
            Ok(DispatchResult::immediate(
                typed_json_m2_cymatic_monopoly_state(address72 as u8),
            ))
        }
        "kernelBridge.m2.planetaryElementalWeights()" => {
            let state = live_portal_clock_state()?;
            Ok(DispatchResult::immediate(
                typed_json_m2_planetary_elemental_weights(&state),
            ))
        }
        "kernelBridge.m3.lensField(lensId)" => {
            let lens_id = frame
                .params
                .get("lensId")
                .and_then(Value::as_u64)
                .ok_or_else(|| {
                    invalid_params_error("lensId must be an unsigned integer".to_owned())
                })?;
            if lens_id > 16 {
                return Err(invalid_params_error(format!(
                    "lensId {lens_id} outside functional M3 lenses 0..16"
                )));
            }
            let layout = frame.params.get("layout").and_then(Value::as_str);
            let state = live_portal_clock_state()?;
            // Track 38 surface: epsilon injected from the tunable registry
            // (schema default 0.05); the kernel stays registry-free.
            let akasha_epsilon = crate::nara::weights::tunable_f32(
                "m3.lens_field.akasha_balance_epsilon",
                portal_core::lens_field::AKASHA_BALANCE_EPSILON_DEFAULT,
            );
            Ok(DispatchResult::immediate(
                typed_json_m3_lens_field(&state, lens_id as u8, layout, akasha_epsilon)
                    .map_err(invalid_params_error)?,
            ))
        }
        "s5.oracle.iching.cast" => crate::nara::oracle::cast_iching_ribbon()
            .map(|receipt| {
                DispatchResult::immediate(serde_json::to_value(receipt).unwrap_or_default())
            })
            .map_err(invalid_params_error),
        "s5'.gnostic.musical_transcript" => {
            let vak_address = frame.params.get("vakAddress").ok_or_else(|| {
                invalid_params_error("vakAddress is required for M3 transcription".to_owned())
            })?;
            let vak_address =
                serde_json::from_value::<VakAddress>(vak_address.clone()).map_err(|err| {
                    invalid_params_error(format!("invalid vakAddress for M3 transcription: {err}"))
                })?;
            let cycle = frame
                .params
                .get("cycle")
                .and_then(Value::as_u64)
                .ok_or_else(|| {
                    invalid_params_error("cycle must be an unsigned integer".to_owned())
                })?;
            let sub_tick = frame
                .params
                .get("subTick")
                .and_then(Value::as_u64)
                .ok_or_else(|| {
                    invalid_params_error("subTick must be an unsigned integer".to_owned())
                })?;
            if sub_tick > u8::MAX as u64 {
                return Err(invalid_params_error(format!(
                    "subTick {sub_tick} exceeds the kernel's u8 range"
                )));
            }
            let clock_degree = frame
                .params
                .get("clockDegree")
                .and_then(Value::as_u64)
                .ok_or_else(|| {
                    invalid_params_error("clockDegree must be an unsigned integer".to_owned())
                })?;
            if clock_degree > u16::MAX as u64 {
                return Err(invalid_params_error(format!(
                    "clockDegree {clock_degree} exceeds the clock's u16 range"
                )));
            }
            let packet = m3_transcription_projection(
                &vak_address,
                kernel_tick_from_epogdoon(cycle, sub_tick as u8),
                clock_degree as u16,
            )
            .map_err(|err| invalid_params_error(err.to_string()))?;
            serde_json::to_value(packet)
                .map(DispatchResult::immediate)
                .map_err(|err| internal_error(err.to_string()))
        }
        "s2.graph.ananda_position" => {
            let vak_address = frame.params.get("vakAddress").ok_or_else(|| {
                invalid_params_error("vakAddress is required for Ananda projection".to_owned())
            })?;
            let vak_address =
                serde_json::from_value::<VakAddress>(vak_address.clone()).map_err(|err| {
                    invalid_params_error(format!("invalid vakAddress for Ananda projection: {err}"))
                })?;
            let projection = ananda_projection(&vak_address)
                .map_err(|err| invalid_params_error(err.to_string()))?;
            serde_json::to_value(projection)
                .map(DispatchResult::immediate)
                .map_err(|err| internal_error(err.to_string()))
        }
        "s0'.verifier.check_state" => verifier::check_state(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(invalid_params_error),
        "s0'.verifier.emit_query" => verifier::emit_query(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(invalid_params_error),
        "s0'.verifier.respond_question" => {
            verifier::respond_question(state_root, runtime, peer_is_loopback, &frame.params)
                .map(DispatchResult::immediate)
                .map_err(invalid_params_error)
        }
        "s0'.verifier.validate_membership" => verifier::validate_membership(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(invalid_params_error),
        "s0'.verifier.owl_query" => verifier::owl_query(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(invalid_params_error),
        "sessions.list" => {
            let items = store
                .list()
                .map_err(internal_error)?
                .into_iter()
                .map(|record| sessions::record_to_value(&record))
                .collect::<Vec<_>>();
            let mut result = sessions::list_result(&store).map_err(internal_error)?;
            result["items"] = json!(items);
            Ok(DispatchResult::immediate(result))
        }
        "sessions.resolve" | "sessions.run-state" => {
            let identifier = session_identifier(&frame.params)?;
            let record = store.resolve(&identifier).map_err(not_found_error)?;
            Ok(DispatchResult::immediate(session_value_with_run_state(
                runtime, &record,
            )))
        }
        "sessions.preview" => {
            let identifier = session_identifier(&frame.params)?;
            let record = store.resolve(&identifier).map_err(not_found_error)?;
            chat::preview(state_root, &record.canonical_key)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "sessions.patch" => {
            let identifier = session_identifier(&frame.params)?;
            // Snapshot before-state for provenance diff
            let before = store.resolve(&identifier).ok();
            let vak_address = frame
                .params
                .get("vakAddress")
                .filter(|value| !value.is_null())
                .map(|value| {
                    serde_json::from_value::<portal_core::VakAddress>(value.clone())
                        .map_err(|err| invalid_params_error(format!("invalid vakAddress: {err}")))
                })
                .transpose()?;
            let terminal_binding = frame
                .params
                .get("terminalBinding")
                .map(|value| {
                    if value.is_null() {
                        Ok(None)
                    } else {
                        serde_json::from_value::<TerminalBinding>(value.clone())
                            .map(Some)
                            .map_err(|err| {
                                invalid_params_error(format!("invalid terminalBinding: {err}"))
                            })
                    }
                })
                .transpose()?;
            let patch = SessionPatch {
                aliases: frame.params.get("aliases").and_then(|value| {
                    value.as_array().map(|items| {
                        items
                            .iter()
                            .filter_map(|item| item.as_str().map(str::to_owned))
                            .collect::<Vec<_>>()
                    })
                }),
                label: frame
                    .params
                    .get("label")
                    .map(|value| value.as_str().map(str::to_owned)),
                session_id: frame
                    .params
                    .get("sessionId")
                    .and_then(|value| value.as_str().map(str::to_owned)),
                day_id: frame
                    .params
                    .get("dayId")
                    .map(|value| value.as_str().map(str::to_owned)),
                active_agent_id: frame
                    .params
                    .get("activeAgentId")
                    .and_then(|value| value.as_str().map(str::to_owned)),
                subagent_lineage: frame.params.get("subagentLineage").and_then(|value| {
                    value.as_array().map(|items| {
                        items
                            .iter()
                            .filter_map(|item| item.as_str().map(str::to_owned))
                            .collect::<Vec<_>>()
                    })
                }),
                thinking_level: frame
                    .params
                    .get("thinkingLevel")
                    .map(|value| value.as_str().map(str::to_owned)),
                verbose_level: frame
                    .params
                    .get("verboseLevel")
                    .map(|value| value.as_str().map(str::to_owned)),
                reasoning_level: frame
                    .params
                    .get("reasoningLevel")
                    .map(|value| value.as_str().map(str::to_owned)),
                spawned_by: frame
                    .params
                    .get("spawnedBy")
                    .map(|value| value.as_str().map(str::to_owned)),
                parent_session_key: frame
                    .params
                    .get("parentSessionKey")
                    .map(|value| value.as_str().map(str::to_owned)),
                source_session_key: frame
                    .params
                    .get("sourceSessionKey")
                    .map(|value| value.as_str().map(str::to_owned)),
                source_session_kind: frame
                    .params
                    .get("sourceSessionKind")
                    .map(|value| value.as_str().map(str::to_owned)),
                vault_now_path: frame
                    .params
                    .get("vaultNowPath")
                    .map(|value| value.as_str().map(str::to_owned)),
                runtime_cwd: frame
                    .params
                    .get("runtimeCwd")
                    .map(|value| value.as_str().map(str::to_owned)),
                vault_root: frame
                    .params
                    .get("vaultRoot")
                    .map(|value| value.as_str().map(str::to_owned)),
                resource_loader_id: frame
                    .params
                    .get("resourceLoaderId")
                    .map(|value| value.as_str().map(str::to_owned)),
                retry_settlement_state: frame
                    .params
                    .get("retrySettlementState")
                    .map(|value| value.as_str().map(str::to_owned)),
                diagnostics: frame
                    .params
                    .get("diagnostics")
                    .and_then(|value| value.as_array().map(|items| items.to_vec())),
                delivery_context: frame.params.get("deliveryContext").map(|value| {
                    if value.is_null() {
                        None
                    } else {
                        Some(value.clone())
                    }
                }),
                channel: frame
                    .params
                    .get("channel")
                    .map(|value| value.as_str().map(str::to_owned)),
                thread_id: frame
                    .params
                    .get("threadId")
                    .map(|value| value.as_str().map(str::to_owned)),
                group_id: frame
                    .params
                    .get("groupId")
                    .map(|value| value.as_str().map(str::to_owned)),
                group_channel: frame
                    .params
                    .get("groupChannel")
                    .map(|value| value.as_str().map(str::to_owned)),
                group_space: frame
                    .params
                    .get("groupSpace")
                    .map(|value| value.as_str().map(str::to_owned)),
                team_id: frame
                    .params
                    .get("teamId")
                    .map(|value| value.as_str().map(str::to_owned)),
                team_role: frame
                    .params
                    .get("teamRole")
                    .map(|value| value.as_str().map(str::to_owned)),
                orchestration_kind: frame
                    .params
                    .get("orchestrationKind")
                    .map(|value| value.as_str().map(str::to_owned)),
                cmux_workspace: frame
                    .params
                    .get("cmuxWorkspace")
                    .map(|value| value.as_str().map(str::to_owned)),
                cmux_surface: frame
                    .params
                    .get("cmuxSurface")
                    .map(|value| value.as_str().map(str::to_owned)),
                cmux_pane_id: frame
                    .params
                    .get("cmuxPaneId")
                    .map(|value| value.as_str().map(str::to_owned)),
                terminal_binding,
                model_override: frame
                    .params
                    .get("modelOverride")
                    .map(|value| value.as_str().map(str::to_owned)),
                provider_override: frame
                    .params
                    .get("providerOverride")
                    .map(|value| value.as_str().map(str::to_owned)),
                cli_session_ids: frame.params.get("cliSessionIds").and_then(|value| {
                    value.as_array().map(|items| {
                        items
                            .iter()
                            .filter_map(|item| item.as_str().map(str::to_owned))
                            .collect::<Vec<_>>()
                    })
                }),
                // VAK address: deserialize from JSON-RPC params. Clients
                // (Khora session_start, multi-session orchestrators) supply
                // `vakAddress` as a JSON object matching `portal_core::VakAddress`.
                // Absent / null = no change to the existing record (single
                // Option, unlike the double-Option string fields above —
                // VakAddress doesn't support an explicit clear-to-None over
                // the wire today; that's a separate sentinel design).
                vak_address: vak_address.clone(),
            };
            let record = store.patch(&identifier, patch).map_err(not_found_error)?;
            if let Some(vak_address) = vak_address {
                let bias_weights_empty =
                    epi_s2_graph_services::HybridRetriever::vak_bias_weights(&vak_address)
                        .is_empty();
                runtime.install_vak_profile_state(vak_address, bias_weights_empty);
            }
            // Provenance: session_open when vault_now_path first set
            let had_now_path = before
                .as_ref()
                .map(|r| r.vault_now_path.is_some())
                .unwrap_or(false);
            if !had_now_path && record.vault_now_path.is_some() {
                graphiti::fire_provenance(graphiti::provenance_from_record(
                    "session_open",
                    &record.session_id,
                    &record.canonical_key,
                    record.channel.as_deref(),
                    record.day_id.as_deref(),
                    record.vault_now_path.as_deref(),
                ));
            }
            // Provenance: channel_bind when channel first set
            let had_channel = before
                .as_ref()
                .map(|r| r.channel.is_some())
                .unwrap_or(false);
            if !had_channel && record.channel.is_some() {
                graphiti::fire_provenance(graphiti::provenance_from_record(
                    "channel_bind",
                    &record.session_id,
                    &record.canonical_key,
                    record.channel.as_deref(),
                    record.day_id.as_deref(),
                    record.vault_now_path.as_deref(),
                ));
            }
            publish_session_surface(state_root, &record)?;
            Ok(DispatchResult::immediate(json!({
                "ok": true,
                "key": record.canonical_key,
                "entry": sessions::session_row(&record),
                "record": sessions::record_to_value(&record),
            })))
        }
        "sessions.reset" => {
            let identifier = session_identifier(&frame.params)?;
            let record = store.resolve(&identifier).map_err(not_found_error)?;
            chat::reset(state_root, &record.canonical_key).map_err(internal_error)?;
            Ok(DispatchResult::immediate(
                json!({ "ok": true, "canonicalKey": record.canonical_key }),
            ))
        }
        "sessions.delete" => {
            let identifier = session_identifier(&frame.params)?;
            // Provenance: session_close before deletion
            if let Ok(r) = store.resolve(&identifier) {
                graphiti::fire_provenance(graphiti::provenance_from_record(
                    "session_close",
                    &r.session_id,
                    &r.canonical_key,
                    r.channel.as_deref(),
                    r.day_id.as_deref(),
                    r.vault_now_path.as_deref(),
                ));
            }
            let record = store.delete(&identifier).map_err(not_found_error)?;
            let transcript_path = chat::transcript_path(state_root, &record.canonical_key);
            if transcript_path.exists() {
                fs::remove_file(transcript_path).map_err(|err| internal_error(err.to_string()))?;
            }
            Ok(DispatchResult::immediate(
                json!({ "ok": true, "canonicalKey": record.canonical_key }),
            ))
        }
        "sessions.compact" => {
            let identifier = session_identifier(&frame.params)?;
            let record = store.resolve(&identifier).map_err(not_found_error)?;
            let mut result =
                chat::compact(state_root, &record.canonical_key).map_err(internal_error)?;
            let transcript_path = chat::transcript_path(state_root, &record.canonical_key);
            let transcript_items =
                chat::history(state_root, &record.canonical_key).map_err(internal_error)?;
            let temporal_context = crate::gate::temporal::context_for_record(
                state_root,
                &record,
                &record.active_agent_id,
            );
            let graphiti_evidence = graphiti::session_memory_search(&json!({
                "query": format!("session compact {}", record.canonical_key),
                "agentId": record.active_agent_id,
                "sessionKey": record.canonical_key,
                "dayId": temporal_context["day"]["dayId"].as_str().unwrap_or("unknown-day"),
                "namespaceRef": temporal_context["graphiti"]["namespaceRef"].as_str().unwrap_or("pratibimba-local"),
                "limit": 5
            }))
            .await
            .map_err(internal_error)?;
            let gnosis_evidence = epii::gnosis_context_retrieve(&json!({
                "query": format!("session compact {}", record.canonical_key),
                "agentId": "epii",
                "sessionKey": record.canonical_key,
                "limit": 5
            }))
            .unwrap_or_else(|error| {
                json!({
                    "method": "s5'.gnosis.context.retrieve",
                    "runtimeAvailable": false,
                    "error": error,
                    "results": []
                })
            });
            let session_rows = store
                .list()
                .map_err(internal_error)?
                .into_iter()
                .map(|session| sessions::session_row(&session))
                .collect::<Vec<_>>();
            let evidence = json!({
                "session": sessions::record_to_value(&record),
                "now": temporal_context["now"].clone(),
                "temporal": temporal_context,
                "transcript": {
                    "path": transcript_path.display().to_string(),
                    "messageCount": transcript_items.len(),
                    "items": transcript_items,
                },
                "sessionTree": {
                    "sessions": session_rows,
                },
                "graphiti": graphiti_evidence,
                "gnosis": gnosis_evidence,
            });
            let review = epi_s5_epii_review_core::s5_handlers::submit(
                state_root,
                &json!({
                    "source": "aletheia",
                    "title": format!("Session compact summary: {}", record.canonical_key),
                    "body": format!(
                        "Aletheia compacted gateway session {} for Epii review. Transcript messages: {}.",
                        record.canonical_key,
                        result["messageCount"].as_u64().unwrap_or_default()
                    ),
                    "priority": "normal",
                    "coordinate_context": {
                        "sessionKey": record.canonical_key,
                        "recordSessionId": record.session_id,
                        "dayId": record.day_id,
                        "nowPath": record.vault_now_path,
                        "transcriptPath": transcript_path.display().to_string(),
                        "pipeline": [
                            "NOW",
                            "transcript",
                            "session_tree",
                            "graphiti_episodes",
                            "kbase_gnosis_retrieval",
                            "aletheia_crystallisation",
                            "epii_review"
                        ]
                    },
                    "proposed_action": {
                        "kind": "aletheia_crystallisation",
                        "target": {
                            "sessionKey": record.canonical_key,
                            "transcriptPath": transcript_path.display().to_string()
                        },
                        "destination": "epii"
                    },
                    "requires_human": true
                }),
            )
            .map_err(internal_error)?;
            result["summary"] = json!({
                "transcriptPath": transcript_path.display().to_string(),
                "pipeline": "NOW + transcript + session tree + Graphiti episodes + kbase/Gnosis retrieval -> Aletheia crystallisation -> Epii review inbox",
                "evidence": evidence
            });
            result["epiiReview"] = review["item"].clone();
            Ok(DispatchResult::immediate(result))
        }
        "sessions.fork" => {
            let record = branch_session(&store, &frame.params, "fork").map_err(internal_error)?;
            publish_session_surface(state_root, &record)?;
            Ok(DispatchResult::immediate(json!({
                "ok": true,
                "canonicalKey": record.canonical_key,
                "record": sessions::record_to_value(&record),
                "entry": sessions::session_row(&record),
            })))
        }
        "sessions.resume" => {
            let record = branch_session(&store, &frame.params, "resume").map_err(internal_error)?;
            publish_session_surface(state_root, &record)?;
            Ok(DispatchResult::immediate(json!({
                "ok": true,
                "canonicalKey": record.canonical_key,
                "record": sessions::record_to_value(&record),
                "entry": sessions::session_row(&record),
            })))
        }
        "sessions.import" => {
            let target_key = required_str(&frame.params, "targetSessionKey")?;
            let source_key = required_str(&frame.params, "sourceSessionKey")?;
            let mut record = store.ensure(&target_key).map_err(internal_error)?;
            let patch = SessionPatch {
                label: frame
                    .params
                    .get("label")
                    .map(|value| value.as_str().map(str::to_owned)),
                session_id: frame
                    .params
                    .get("sessionId")
                    .and_then(|value| value.as_str().map(str::to_owned)),
                source_session_key: Some(Some(source_key)),
                source_session_kind: Some(Some("import".to_owned())),
                parent_session_key: optional_str(&frame.params, "parentSessionKey").map(Some),
                day_id: frame
                    .params
                    .get("dayId")
                    .map(|value| value.as_str().map(str::to_owned)),
                active_agent_id: frame
                    .params
                    .get("activeAgentId")
                    .and_then(|value| value.as_str().map(str::to_owned)),
                vault_now_path: frame
                    .params
                    .get("vaultNowPath")
                    .map(|value| value.as_str().map(str::to_owned)),
                runtime_cwd: frame
                    .params
                    .get("runtimeCwd")
                    .map(|value| value.as_str().map(str::to_owned)),
                vault_root: frame
                    .params
                    .get("vaultRoot")
                    .map(|value| value.as_str().map(str::to_owned)),
                resource_loader_id: frame
                    .params
                    .get("resourceLoaderId")
                    .map(|value| value.as_str().map(str::to_owned)),
                retry_settlement_state: frame
                    .params
                    .get("retrySettlementState")
                    .map(|value| value.as_str().map(str::to_owned)),
                diagnostics: frame
                    .params
                    .get("diagnostics")
                    .and_then(|value| value.as_array().map(|items| items.to_vec())),
                ..Default::default()
            };
            record = store
                .patch(&record.canonical_key, patch)
                .map_err(internal_error)?;
            publish_session_surface(state_root, &record)?;
            Ok(DispatchResult::immediate(json!({
                "ok": true,
                "canonicalKey": record.canonical_key,
                "record": sessions::record_to_value(&record),
                "entry": sessions::session_row(&record),
            })))
        }
        "sessions.tree" => {
            let identifier = session_identifier(&frame.params)?;
            let root = store.resolve(&identifier).map_err(not_found_error)?;
            let tree = session_tree(&store, &root.canonical_key).map_err(internal_error)?;
            Ok(DispatchResult::immediate(tree))
        }
        "health" => system::health_snapshot(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "status" => system::status_summary(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "wake" => {
            let mode = optional_str(&frame.params, "mode").unwrap_or_else(|| "now".to_owned());
            let text = optional_str(&frame.params, "text").unwrap_or_else(|| "wake".to_owned());
            let payload = json!({
                "ok": true,
                "mode": mode,
                "text": text,
            });
            publish_activity_surface(state_root, "wake", payload.clone())?;
            Ok(DispatchResult::immediate(payload))
        }
        "agent" => start_agent_run(state_root, runtime, &store, &frame.params).await,
        "agent.wait" => wait_for_run(runtime, &frame.params).await,
        "chat.send" => start_chat_run(state_root, runtime, &store, &frame.params).await,
        "chat.inject" => {
            let session_key = required_str(&frame.params, "sessionKey")?;
            let record = store.ensure(&session_key).map_err(internal_error)?;

            // 50.T50.14 — a completed orchestration deposits its deterministic
            // trace into the session transcript. Additive on the EXISTING
            // transcript-write method rather than a new one: `chat.inject` is
            // already "put a record in this session's transcript", the trace is
            // a transcript record, and a dedicated method is a contract-surface
            // decision that belongs to the Architect, not to this tranche.
            // When `orchestrationTrace` is present it is the payload and
            // `message` is not required; the two shapes never mix.
            if let Some(raw) = frame.params.get("orchestrationTrace") {
                let trace: epi_s3_gateway_contract::OrchestrationTrace =
                    serde_json::from_value(raw.clone()).map_err(|err| {
                        invalid_params_error(format!("orchestrationTrace is unreadable: {err}"))
                    })?;
                if trace.score_hash.trim().is_empty() {
                    // Replay is checkable only because the program identity
                    // rides along; a trace without it cannot be compared to
                    // the run it claims to repeat.
                    return Err(invalid_params_error(
                        "orchestrationTrace.scoreHash is required — a trace with no program \
                         identity cannot be replayed against the run it claims to be"
                            .to_owned(),
                    ));
                }
                let vak_address = frame
                    .params
                    .get("vakAddress")
                    .and_then(|value| serde_json::from_value(value.clone()).ok());
                let op_count = trace.ops.len();
                let run_id = trace.run_id.clone();
                epi_s3_gateway::transcripts::append_orchestration_trace(
                    state_root,
                    &record.canonical_key,
                    trace,
                    vak_address,
                )
                .map_err(internal_error)?;
                publish_session_surface(state_root, &record)?;
                return Ok(DispatchResult::immediate(json!({
                    "ok": true,
                    "canonicalKey": record.canonical_key,
                    "kind": epi_s3_gateway_contract::ORCHESTRATION_TRACE_KIND,
                    "runId": run_id,
                    "ops": op_count,
                })));
            }

            let message = required_str(&frame.params, "message")?;
            let role = frame
                .params
                .get("role")
                .and_then(|value| value.as_str())
                .unwrap_or("assistant");
            chat::inject_message(state_root, &record.canonical_key, role, &message)
                .map_err(internal_error)?;
            publish_session_surface(state_root, &record)?;
            Ok(DispatchResult::immediate(
                json!({ "ok": true, "canonicalKey": record.canonical_key }),
            ))
        }
        "chat.abort" => {
            let session_key = required_str(&frame.params, "sessionKey")?;
            let record = store.resolve(&session_key).map_err(not_found_error)?;
            let run_ids = if let Some(run_id) = optional_str(&frame.params, "runId") {
                if super::websocket::abort_chat_run(
                    state_root,
                    runtime,
                    &record.canonical_key,
                    &run_id,
                    "rpc",
                )
                .await
                .map_err(internal_error)?
                {
                    vec![run_id]
                } else {
                    Vec::new()
                }
            } else {
                super::websocket::abort_chat_runs_for_session(
                    state_root,
                    runtime,
                    &record.canonical_key,
                    "rpc",
                )
                .await
                .map_err(internal_error)?
            };
            Ok(DispatchResult::immediate(json!({
                "ok": true,
                "canonicalKey": record.canonical_key,
                "aborted": !run_ids.is_empty(),
                "runIds": run_ids,
            })))
        }
        "chat.history" => {
            let session_key = required_str(&frame.params, "sessionKey")?;
            let record = store.resolve(&session_key).map_err(not_found_error)?;
            let mut result = chat::history_response(state_root, &record.canonical_key)
                .map_err(internal_error)?;
            result["canonicalKey"] = json!(record.canonical_key);
            Ok(DispatchResult::immediate(result))
        }
        "config.get" => config::config_value(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "config.schema" => Ok(DispatchResult::immediate(config::schema_value())),
        "config.set" => {
            if let Some(raw) = frame.params.get("raw").and_then(|value| value.as_str()) {
                let base_hash = frame
                    .params
                    .get("baseHash")
                    .and_then(|value| value.as_str());
                config::set_raw_value(state_root, raw, base_hash)
                    .map(DispatchResult::immediate)
                    .map_err(internal_error)
            } else {
                let key = required_str(&frame.params, "key")?;
                let value =
                    frame.params.get("value").cloned().ok_or_else(|| {
                        ("invalid-params".to_owned(), "value is required".to_owned())
                    })?;
                config::set_value(state_root, &key, &value)
                    .map(DispatchResult::immediate)
                    .map_err(internal_error)
            }
        }
        "config.patch" => {
            let patch = frame
                .params
                .get("patch")
                .cloned()
                .unwrap_or_else(|| json!({}));
            config::patch_value(state_root, &patch)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "config.apply" => {
            if let Some(raw) = frame.params.get("raw").and_then(|value| value.as_str()) {
                let base_hash = frame
                    .params
                    .get("baseHash")
                    .and_then(|value| value.as_str());
                config::apply_raw_value(state_root, raw, base_hash)
                    .map(DispatchResult::immediate)
                    .map_err(internal_error)
            } else {
                let patch = frame
                    .params
                    .get("patch")
                    .cloned()
                    .unwrap_or_else(|| json!({}));
                config::apply_value(state_root, &patch)
                    .map(DispatchResult::immediate)
                    .map_err(internal_error)
            }
        }
        "set-heartbeats" => {
            let heartbeats = frame
                .params
                .get("heartbeats")
                .cloned()
                .unwrap_or_else(|| json!({}));
            let result = system::set_heartbeats(state_root, &heartbeats).map_err(internal_error)?;
            publish_presence_surfaces(state_root, &result)?;
            Ok(DispatchResult::immediate(result))
        }
        "last-heartbeat" => system::last_heartbeat(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "system-presence" => system::presence(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "presence.list" => system::presence_list(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "status.summary" => system::status_summary(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "health.snapshot" => system::health_snapshot(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "system-event" => {
            let kind = required_str(&frame.params, "kind")?;
            let payload = frame
                .params
                .get("payload")
                .cloned()
                .unwrap_or_else(|| json!({}));
            let result =
                system::event(state_root, &kind, payload.clone()).map_err(internal_error)?;
            publish_activity_surface(state_root, &kind, payload)?;
            Ok(DispatchResult::immediate(result))
        }
        "models.list" => models::list(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "logs.tail" => {
            let lines = frame
                .params
                .get("lines")
                .and_then(|value| value.as_u64())
                .or_else(|| frame.params.get("limit").and_then(|value| value.as_u64()))
                .unwrap_or(20) as usize;
            logs::tail(state_root, lines)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "usage.status" => system::usage_status(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "usage.cost" => system::usage_cost(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "update.run" => update::run(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "wizard.start" => {
            let flow = required_str(&frame.params, "flow")?;
            wizard::start(state_root, &flow)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "wizard.next" => wizard::next(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "wizard.cancel" => wizard::cancel(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "wizard.status" => wizard::status(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "node.pair.request" => {
            let node = required_str(&frame.params, "node")?;
            nodes::pair_request(state_root, &node)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "node.pair.list" => nodes::pair_list(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "node.pair.approve" => {
            let node = required_str(&frame.params, "node")?;
            nodes::pair_approve(state_root, &node)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "node.pair.reject" => {
            let node = required_str(&frame.params, "node")?;
            nodes::pair_reject(state_root, &node)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "node.pair.verify" => {
            let node = required_str(&frame.params, "node")?;
            nodes::pair_verify(state_root, &node)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "node.rename" => {
            let node = required_str(&frame.params, "node")?;
            let name = required_str(&frame.params, "name")?;
            nodes::rename(state_root, &node, &name)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "node.list" => nodes::list(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "node.describe" => {
            let node = required_str(&frame.params, "node")?;
            nodes::describe(state_root, &node)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "node.invoke" => {
            let node = required_str(&frame.params, "node")?;
            let command = required_str(&frame.params, "command")?;
            nodes::invoke(state_root, &node, &command)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "node.invoke.result" => {
            let result_id = required_str(&frame.params, "resultId")?;
            nodes::invoke_result(state_root, &result_id)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "node.event" => {
            let node = required_str(&frame.params, "node")?;
            let kind = required_str(&frame.params, "kind")?;
            let payload = frame
                .params
                .get("payload")
                .cloned()
                .unwrap_or_else(|| json!({}));
            nodes::event(state_root, &node, &kind, payload)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "browser.request" => {
            let url = required_str(&frame.params, "url")?;
            let method = frame
                .params
                .get("method")
                .and_then(|value| value.as_str())
                .unwrap_or("GET")
                .to_owned();
            browser::request(state_root, &url, &method)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "web.login.start" => {
            let channel =
                optional_str(&frame.params, "channel").unwrap_or_else(|| "whatsapp".to_owned());
            let workspace =
                optional_str(&frame.params, "workspace").unwrap_or_else(|| "main".to_owned());
            channels::mark_login_start(state_root, &channel).map_err(internal_error)?;
            browser::login_start(state_root, &channel, &workspace)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "web.login.wait" => {
            let login_id = frame.params.get("loginId").and_then(|value| value.as_str());
            let result = browser::login_wait(state_root, login_id).map_err(internal_error)?;
            if let Some(channel) = result.get("channel").and_then(|value| value.as_str()) {
                channels::mark_login_wait(state_root, channel).map_err(internal_error)?;
            }
            Ok(DispatchResult::immediate(result))
        }
        "device.pair.list" => devices::pair_list(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "device.pair.approve" => {
            let device = required_str_alias(&frame.params, &["device", "requestId", "deviceId"])?;
            devices::pair_approve(state_root, &device)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "device.pair.reject" => {
            let device = required_str_alias(&frame.params, &["device", "requestId", "deviceId"])?;
            devices::pair_reject(state_root, &device)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "device.token.rotate" => {
            let device = required_str_alias(&frame.params, &["device", "deviceId"])?;
            devices::token_rotate(state_root, &device)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "device.token.revoke" => {
            let device = required_str(&frame.params, "device")?;
            let token = required_str(&frame.params, "token")?;
            devices::token_revoke(state_root, &device, &token)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "exec.approval.request" => {
            let command = required_str(&frame.params, "command")?;
            let node = required_str(&frame.params, "node")?;
            approvals::request(state_root, &command, &node)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "exec.approval.resolve" => {
            let approval_id = required_str(&frame.params, "approvalId")?;
            let decision = required_str(&frame.params, "decision")?;
            approvals::resolve(state_root, &approval_id, &decision)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "exec.approvals.get" => approvals::get(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "exec.approvals.set" => {
            let mode = required_str(&frame.params, "mode")?;
            approvals::set_mode(state_root, &mode)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "exec.approvals.node.get" => {
            let node = required_str(&frame.params, "node")?;
            approvals::node_get(state_root, &node)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "exec.approvals.node.set" => {
            let node = required_str(&frame.params, "node")?;
            let mode = required_str(&frame.params, "mode")?;
            approvals::node_set(state_root, &node, &mode)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "channels.status" => channels::status(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "channels.send" | "send" => {
            let channel = required_str(&frame.params, "channel")?;
            let target =
                required_str_alias(&frame.params, &["target", "chatId", "channelId", "to"])?;
            let text = required_str_alias(&frame.params, &["text", "message"])?;
            channels::send_text(state_root, &channel, &target, &text)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "channels.files.list" => {
            let channel =
                optional_str(&frame.params, "channel").unwrap_or_else(|| "google-drive".to_owned());
            let page_size = frame
                .params
                .get("pageSize")
                .and_then(|value| value.as_u64())
                .unwrap_or(20) as u32;
            channels::list_files(state_root, &channel, page_size)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "channels.logout" => {
            let channel = required_str(&frame.params, "channel")?;
            channels::logout(state_root, &channel)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        // 02.T2.13 / DR-M1-5 — the spanda walk family: engine-walk transport
        // acts on the ONE kernel-owned anchor (installed by the heartbeat,
        // sampled by every emission). The response is the post-act anchor —
        // public-safe plain numbers; clients evaluate phase locally. A
        // missing anchor is the honest not-ready state, never fabricated.
        "m1.spanda.hold"
        | "m1.spanda.release"
        | "m1.spanda.walk_to"
        | "m1.spanda.step"
        | "m1.spanda.half_turn" => {
            let at_ms = now_ms() as u64;
            let walk_tick = if frame.method == "m1.spanda.walk_to" {
                let tick = frame
                    .params
                    .get("tick")
                    .and_then(Value::as_u64)
                    .ok_or_else(|| invalid_params_error("tick (0-11) is required".to_owned()))?;
                if tick > 11 {
                    return Err(invalid_params_error(format!(
                        "tick {tick} outside the twelvefold (0-11)"
                    )));
                }
                Some(tick as u8)
            } else {
                None
            };
            // `reflect` NAMES the involution (spanda_invert, 11−n); `backward`
            // is the plain −1 ring-step. Naming both apart is the T2.11 law.
            let reflect = frame
                .params
                .get("reflect")
                .and_then(Value::as_bool)
                .unwrap_or(false);
            let backward = frame
                .params
                .get("backward")
                .and_then(Value::as_bool)
                .unwrap_or(false);
            if reflect && backward {
                return Err(invalid_params_error(
                    "reflect and backward are distinct acts — name one".to_owned(),
                ));
            }
            let acted = runtime.with_spanda_anchor(|anchor| match frame.method.as_str() {
                "m1.spanda.hold" => anchor.hold(at_ms),
                "m1.spanda.release" => anchor.release(at_ms),
                "m1.spanda.walk_to" => anchor.walk_to_tick(at_ms, walk_tick.unwrap_or(0)),
                "m1.spanda.step" if reflect => anchor.apply_reflection(at_ms),
                "m1.spanda.step" => anchor.step(at_ms, backward),
                _ => anchor.apply_half_turn(at_ms),
            });
            match acted {
                Some(anchor) => {
                    let block = super::spanda_block_json(&anchor, at_ms);
                    // 02.T2.14: the transport act pushes IMMEDIATELY — every
                    // subscriber learns the organism is held/walked between
                    // heartbeat samples, not at the next one.
                    let mut event_payload = json!({ "act": frame.method });
                    if let (Some(target), Some(source)) =
                        (event_payload.as_object_mut(), block.as_object())
                    {
                        for (key, value) in source {
                            target.insert(key.clone(), value.clone());
                        }
                    }
                    runtime.broadcast(epi_s3_gateway_contract::GatewayEvent::new(
                        "portal.spanda_transport",
                        None,
                        None,
                        None,
                        event_payload,
                    ));
                    Ok(DispatchResult::immediate(json!({
                        "act": frame.method,
                        "spanda": block,
                    })))
                }
                None => Err(internal_error(
                    "spanda anchor not installed yet — the heartbeat has not started".to_owned(),
                )),
            }
        }
        // T53.05: the other 20 s2* methods are registered by
        // epi_s2_graph_services::register_s2_handlers. Only the composite stays:
        // parashaktiCorrespondences needs S2 graph + M4 Nara medicine/oracle +
        // the S0 kernel bridge, and no single crate may hold all three.
        "s2.parashaktiCorrespondences" => graph::dispatch_graph_method(&frame.method, &frame.params)
            .await
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "cron.status" => cron::status(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "cron.list" => cron::list(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "cron.add" => {
            let name = required_str(&frame.params, "name")?;
            let description = frame
                .params
                .get("description")
                .and_then(|value| value.as_str())
                .unwrap_or_default()
                .to_owned();
            let agent_id = frame.params.get("agentId").and_then(|value| value.as_str());
            let enabled = frame
                .params
                .get("enabled")
                .and_then(|value| value.as_bool())
                .unwrap_or(true);
            let schedule = frame
                .params
                .get("schedule")
                .cloned()
                .unwrap_or_else(|| json!({}));
            let payload = frame
                .params
                .get("payload")
                .cloned()
                .unwrap_or_else(|| json!({}));
            let session_target = frame
                .params
                .get("sessionTarget")
                .and_then(|value| value.as_str())
                .unwrap_or("main");
            let wake_mode = frame
                .params
                .get("wakeMode")
                .and_then(|value| value.as_str())
                .unwrap_or("next-heartbeat");
            let isolation = frame.params.get("isolation").cloned();
            cron::add(
                state_root,
                &name,
                &description,
                agent_id,
                enabled,
                schedule,
                session_target,
                wake_mode,
                payload,
                isolation,
            )
            .map(DispatchResult::immediate)
            .map_err(internal_error)
        }
        "cron.update" => {
            let id = required_str(&frame.params, "id")?;
            let patch = frame
                .params
                .get("patch")
                .cloned()
                .unwrap_or_else(|| json!({}));
            let enabled = patch
                .get("enabled")
                .and_then(|value| value.as_bool())
                .or_else(|| {
                    frame
                        .params
                        .get("enabled")
                        .and_then(|value| value.as_bool())
                });
            let description = patch
                .get("description")
                .and_then(|value| value.as_str())
                .or_else(|| {
                    frame
                        .params
                        .get("description")
                        .and_then(|value| value.as_str())
                });
            cron::update(state_root, &id, enabled, description)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "cron.run" => {
            let id = required_str(&frame.params, "id")?;
            cron::run(state_root, &id)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "cron.runs" => {
            let id = required_str(&frame.params, "id")?;
            cron::runs(state_root, &id)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "cron.remove" => {
            let id = required_str(&frame.params, "id")?;
            cron::remove(state_root, &id)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "talk.mode" => {
            let mode = required_str(&frame.params, "mode")?;
            system::talk_mode(state_root, &mode)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "tts.status" => system::tts_status(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "tts.enable" => system::tts_enable(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "tts.disable" => system::tts_disable(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "tts.convert" => {
            let text = required_str(&frame.params, "text")?;
            system::tts_convert(state_root, &text)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "tts.setProvider" => {
            let provider = required_str(&frame.params, "provider")?;
            system::tts_set_provider(state_root, &provider)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "tts.providers" => Ok(DispatchResult::immediate(system::tts_providers())),
        "voicewake.get" => system::voicewake_get(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "voicewake.set" => {
            let enabled = frame
                .params
                .get("enabled")
                .and_then(|value| value.as_bool())
                .unwrap_or(false);
            let phrase = frame
                .params
                .get("phrase")
                .and_then(|value| value.as_str())
                .unwrap_or_default()
                .to_owned();
            system::voicewake_set(state_root, enabled, &phrase)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "skills.status" => skills::status(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "skills.bins" => skills::bins(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "skills.install" => {
            let skill = required_str_alias(&frame.params, &["skill", "skillKey", "name"])?;
            skills::install(state_root, &skill)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "skills.update" => {
            let skill = required_str_alias(&frame.params, &["skill", "skillKey", "name"])?;
            let enabled = frame
                .params
                .get("enabled")
                .and_then(|value| value.as_bool());
            let api_key = frame.params.get("apiKey").and_then(|value| value.as_str());
            skills::update(state_root, &skill, enabled, api_key)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "s4.agent.query" => anima::agent_query(state_root, &frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s4.agent.notify" => anima::agent_notify(state_root, &frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s4.agent.status" => anima::agent_status(state_root, &frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        // 50.T50.13 / DR-VAK-6 — `portal.vak_eval` has been a declared contract
        // with no emitter since it was named (the Pleroma capability matrix
        // lists it under `pre_tool_call.must_emit`). This is the emitter: every
        // VAK evaluation now publishes the degree it was read at, and the tonal
        // reading of the run when the caller supplied a trace and its lens.
        "s4'.vak.evaluate" => {
            let response = anima::vak_evaluate(&frame.params).map_err(internal_error)?;
            if let Some(payload) = anima::vak_eval_event(&frame.params, &response) {
                runtime.broadcast(epi_s3_gateway_contract::GatewayEvent::new(
                    "portal.vak_eval",
                    None,
                    None,
                    None,
                    payload,
                ));
            }
            Ok(DispatchResult::immediate(response))
        }
        "s4'.orchestrate" => anima::orchestrate(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s4'.mediation.route" => anima::mediation_route(state_root, &frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s4'.mediation.capabilities.list" => anima::mediation_capabilities_list(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s4'.psyche.state" => anima::psyche_state(state_root, &frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s4'.psyche.update" => anima::psyche_update(state_root, &frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s4'.permission.get" => anima::permission_get(state_root, &frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s4'.context.assemble" => anima::context_assemble(state_root, &frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s4'.orchestration.score" => anima::orchestration_score(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s1'.q_articulation.accept" => {
            crate::gate::s1_hen::q_articulation_accept(state_root, &frame.params)
                .await
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "s2.codon.aa_lookup" => crate::gate::codon::aa_lookup(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(invalid_params_error),
        // 24.T24.7 — scalar M3 reference resolution (i-ching / decan / m3-codon
        // resolve off landed datasets; the remaining declared kinds answer an
        // honest `resolved: false` naming their owner).
        "s2.codon.scalar_ref.read" => crate::gate::codon::scalar_ref_read(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(invalid_params_error),
        // CCT-15: C-layer semantic typology classification.
        // CCT-14 (+14b): entity-candidate lifecycle + review surfaces.
        "s3'.temporal.subscribe" => super::subscription::dispatch_temporal_subscribe(
            state_root,
            runtime,
            &store,
            &frame.params,
        )
        .await
        .map(DispatchResult::immediate)
        .map_err(internal_error),
        "s3'.spacetime.subscribe" => super::subscription::dispatch_spacetime_subscribe(
            state_root,
            runtime,
            &store,
            &frame.params,
        )
        .await
        .map(DispatchResult::immediate)
        .map_err(internal_error),
        "s5'.epii.status" => epii::status(state_root)
            .await
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.epii.runtime.context" => epii::runtime_context(state_root, &frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5.episodic.search" => graphiti::session_memory_search(&frame.params)
            .await
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5.episodic.deposit" => graphiti::session_memory_deposit(&frame.params)
            .await
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5.episodic.kernel_resonance.deposit" => graphiti::kernel_resonance_deposit(&frame.params)
            .await
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5.episodic.kernel_profile_observation.deposit" => {
            graphiti::kernel_profile_observation_deposit(&frame.params)
                .await
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "s5'.gnosis.context.retrieve" => epii::gnosis_context_retrieve(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.gnostic.ingest" => gnostic::ingest(state_root, &frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.gnostic.query" => gnostic::query(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.gnostic.notebook" => gnostic::notebook(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.gnostic.status" => gnostic::status()
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.gnostic.models" => gnostic::models()
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.gnostic.resolve" => gnostic::resolve(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.gnostic.candidates" => gnostic::candidates(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.gnostic.etymology" => gnostic::etymology(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.gnostic.list_notebooks" => gnostic::list_notebooks(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.gnostic.episode_search" => gnostic::episode_search(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.gnostic.evidence_trace" => gnostic::evidence_trace(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.gnostic.query_with_layers" => gnostic::query_with_layers(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        // 26.T26.10 — the read sibling; a projection of the review store the
        // write path already submits into.
        "s5'.epii.user.orientation" | "s5'.epii.pratibimba.status" | "s5'.epii.kairos.context" => {
            Ok(DispatchResult::immediate(epii::user_orientation()))
        }
        // 25.T25.11 — nara.transform.* are first-class METHOD_NAMES entries
        // (unlike the other nara.* route extensions, which are intentionally
        // absent from METHOD_NAMES), so the S3 T9 cross-walk requires them to
        // appear explicitly in the S0 dispatch surface. They forward to the
        // same nara dispatcher as the prefix arm below — identical runtime
        // behaviour, mirroring how s5'.epii.* is handled just above.
        method @ "nara.transform.start" | method @ "nara.transform.advance" => {
            crate::gate::nara::dispatch_nara_with_state_root(
                state_root,
                peer_is_loopback,
                method,
                &frame.params,
            )
            .map(DispatchResult::immediate)
        }
        method if method.starts_with("nara.") => crate::gate::nara::dispatch_nara_with_state_root(
            state_root,
            peer_is_loopback,
            method,
            &frame.params,
        )
        .map(DispatchResult::immediate),
        _ => {
            // Route ownership AND dispatch-kind both come from S3 — S0 never
            // synthesises either. If a method lands here, S3's route table
            // recognised it (so the substrate is known) but no in-process
            // gateway adapter implements it yet; the dispatch-plan kind tells
            // the operator which substrate is expected to own the work.
            let kind_hint = dispatch_plan_entry(&frame.method)
                .map(|entry| format!(" (dispatch-plan kind: {})", entry.kind.label()))
                .unwrap_or_default();
            let message = route
                .map(|route| {
                    format!(
                        "{} is routed by {} but has no executable gateway adapter{}",
                        frame.method, route.route_id, kind_hint
                    )
                })
                .unwrap_or_else(|| format!("{} is not implemented yet{}", frame.method, kind_hint));
            Err(("unimplemented".to_owned(), message))
        }
    }
}

fn live_portal_clock_state() -> Result<PortalClockState, (String, String)> {
    let (degrees, retrograde, _) =
        crate::nara::kairos::heartbeat_live_sky_tiered().ok_or_else(|| {
            invalid_params_error(
                "live Kairos state unavailable: run 'epi nara kairos sync' first".to_owned(),
            )
        })?;
    let mut state = PortalClockState::default();
    for (index, degree) in degrees.into_iter().enumerate() {
        state.kairos.planets[index].degree = degree.rem_euclid(360.0) as u16;
        state.kairos.planets[index].is_retrograde = retrograde[index];
    }
    state.kairos.valid = true;
    state.kairos.timestamp = (now_ms() / 1000) as u64;
    Ok(state)
}

async fn start_agent_run(
    state_root: &PathBuf,
    runtime: &GatewayRuntimeState,
    store: &SessionStore,
    params: &Value,
) -> Result<DispatchResult, (String, String)> {
    let session_key = required_str(params, "sessionKey")?;
    let message = required_str(params, "message")?;
    let run_id =
        optional_str(params, "idempotencyKey").unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
    let requested_spawned_by = params.get("spawnedBy").and_then(Value::as_str);
    let subagent_launch =
        subagents::resolve_agent_launch_context(store, &session_key, requested_spawned_by)
            .map_err(internal_error)?;
    let record = store.ensure(&session_key).map_err(internal_error)?;
    let canonical_key = record.canonical_key.clone();
    let agent_id =
        agent_id_from_session_key(&canonical_key).unwrap_or_else(|| canonical_key.clone());
    let spawned_by_patch = match subagent_launch.as_ref() {
        Some(context) => Some(Some(context.spawned_by.clone())),
        None => {
            if params.get("spawnedBy").is_some() {
                return Err(invalid_params_error(
                    "spawnedBy is only supported for subagent:* sessions",
                ));
            }
            None
        }
    };
    let record = store
        .patch(
            &canonical_key,
            SessionPatch {
                active_agent_id: Some(agent_id),
                subagent_lineage: subagent_launch
                    .as_ref()
                    .map(|context| context.subagent_lineage.clone()),
                spawned_by: spawned_by_patch,
                vault_now_path: inherit_nullable_string_field(
                    params,
                    "vaultNowPath",
                    subagent_launch
                        .as_ref()
                        .and_then(|context| context.vault_now_path.clone()),
                ),
                delivery_context: inherit_nullable_value_field(
                    params,
                    "deliveryContext",
                    subagent_launch
                        .as_ref()
                        .and_then(|context| context.delivery_context.clone()),
                ),
                channel: inherit_nullable_string_field(
                    params,
                    "channel",
                    subagent_launch
                        .as_ref()
                        .and_then(|context| context.channel.clone()),
                ),
                thread_id: inherit_nullable_string_field(
                    params,
                    "threadId",
                    subagent_launch
                        .as_ref()
                        .and_then(|context| context.thread_id.clone()),
                ),
                group_id: inherit_nullable_string_field(
                    params,
                    "groupId",
                    subagent_launch
                        .as_ref()
                        .and_then(|context| context.group_id.clone()),
                ),
                group_channel: inherit_nullable_string_field(
                    params,
                    "groupChannel",
                    subagent_launch
                        .as_ref()
                        .and_then(|context| context.group_channel.clone()),
                ),
                group_space: inherit_nullable_string_field(
                    params,
                    "groupSpace",
                    subagent_launch
                        .as_ref()
                        .and_then(|context| context.group_space.clone()),
                ),
                label: nullable_string_field(params, "label"),
                thinking_level: nullable_string_field(params, "thinkingLevel"),
                verbose_level: nullable_string_field(params, "verboseLevel"),
                reasoning_level: nullable_string_field(params, "reasoningLevel"),
                model_override: nullable_string_field(params, "modelOverride"),
                provider_override: nullable_string_field(params, "providerOverride"),
                ..SessionPatch::default()
            },
        )
        .map_err(internal_error)?;
    let canonical_key = record.canonical_key.clone();

    runtime.register_run(RunContext::new(&run_id, &canonical_key, "agent"));
    runtime.cache_snapshot(RunSnapshot {
        run_id: run_id.clone(),
        session_key: canonical_key.clone(),
        status: "running".to_owned(),
        started_at_ms: now_ms(),
        ended_at_ms: None,
        error: None,
    });
    publish_session_surface(state_root, &record)?;
    transcripts::append_message(state_root, &canonical_key, "user", &message, Some(&run_id))
        .map_err(internal_error)?;

    Ok(DispatchResult::with_post_response(
        json!({
            "ok": true,
            "runId": run_id.clone(),
            "canonicalKey": canonical_key.clone(),
            "status": "accepted",
            "acceptedAt": now_ms(),
        }),
        PostResponseAction::StartAgentRun {
            run_id,
            session_key: canonical_key,
            message,
        },
    ))
}

async fn start_chat_run(
    state_root: &PathBuf,
    runtime: &GatewayRuntimeState,
    store: &SessionStore,
    params: &Value,
) -> Result<DispatchResult, (String, String)> {
    let session_key = required_str(params, "sessionKey")?;
    let message = required_str(params, "message")?;
    let record = store.ensure(&session_key).map_err(internal_error)?;
    if is_stop_command_text(&message) {
        let run_ids = super::websocket::abort_chat_runs_for_session(
            state_root,
            runtime,
            &record.canonical_key,
            "stop",
        )
        .await
        .map_err(internal_error)?;
        return Ok(DispatchResult::immediate(json!({
            "ok": true,
            "canonicalKey": record.canonical_key,
            "aborted": !run_ids.is_empty(),
            "runIds": run_ids,
        })));
    }
    let run_id =
        chat::send_message(state_root, &record.canonical_key, &message).map_err(internal_error)?;

    runtime.register_run(RunContext::new(&run_id, &record.canonical_key, "chat.send"));
    runtime.cache_snapshot(RunSnapshot {
        run_id: run_id.clone(),
        session_key: record.canonical_key.clone(),
        status: "running".to_owned(),
        started_at_ms: now_ms(),
        ended_at_ms: None,
        error: None,
    });
    runtime.add_chat_run(&record.canonical_key, &run_id);
    publish_session_surface(state_root, &record)?;

    Ok(DispatchResult::with_post_response(
        json!({
            "ok": true,
            "runId": run_id.clone(),
            "canonicalKey": record.canonical_key.clone(),
            "status": "started",
        }),
        PostResponseAction::StartChatRun {
            run_id,
            session_key: record.canonical_key,
            message,
        },
    ))
}

async fn wait_for_run(
    runtime: &GatewayRuntimeState,
    params: &Value,
) -> Result<DispatchResult, (String, String)> {
    let run_id = required_str(params, "runId")?;
    let timeout_ms = params
        .get("timeoutMs")
        .and_then(|value| value.as_u64())
        .unwrap_or(30_000);
    let deadline = tokio::time::Instant::now() + Duration::from_millis(timeout_ms);

    loop {
        if let Some(snapshot) = runtime.snapshot(&run_id) {
            if snapshot.ended_at_ms.is_some() {
                return Ok(DispatchResult::immediate(json!({
                    "runId": snapshot.run_id,
                    "status": snapshot.status,
                    "startedAt": snapshot.started_at_ms,
                    "endedAt": snapshot.ended_at_ms,
                    "error": snapshot.error,
                })));
            }
        }

        if tokio::time::Instant::now() >= deadline {
            return Ok(DispatchResult::immediate(json!({
                "runId": run_id,
                "status": "timeout",
            })));
        }

        tokio::time::sleep(Duration::from_millis(10)).await;
    }
}

#[cfg(test)]
mod routing_seam_tests {
    use super::*;

    /// The post-response action survives the trip through the S-root port.
    ///
    /// This is the one lossy-looking hop introduced by routing through the
    /// registry: `PostResponseAction` is an S0/S4 concern, the port carries an
    /// opaque `FollowUp`, and S0 re-attaches the meaning on the way back. If
    /// this round trip drifts, agent and chat runs stop starting after their
    /// response is written — a failure the wire itself would not show.
    #[test]
    fn start_agent_run_round_trips_through_the_opaque_follow_up() {
        let original = DispatchResult::with_post_response(
            json!({ "ok": true }),
            PostResponseAction::StartAgentRun {
                run_id: "run-7".to_owned(),
                session_key: "sess-1".to_owned(),
                message: "hello".to_owned(),
            },
        );

        let outcome = outcome_from_dispatch_result(original);
        assert_eq!(
            outcome.follow_up.as_ref().map(|f| f.kind.as_str()),
            Some(FOLLOW_UP_START_AGENT_RUN)
        );

        let restored = dispatch_result_from_outcome(outcome).expect("round trip");
        assert_eq!(restored.result, json!({ "ok": true }));
        match restored.post_response {
            Some(PostResponseAction::StartAgentRun {
                run_id,
                session_key,
                message,
            }) => {
                assert_eq!(run_id, "run-7");
                assert_eq!(session_key, "sess-1");
                assert_eq!(message, "hello");
            }
            other => panic!("expected StartAgentRun, got {other:?}"),
        }
    }

    #[test]
    fn start_chat_run_round_trips_and_stays_distinct_from_agent_run() {
        let outcome = outcome_from_dispatch_result(DispatchResult::with_post_response(
            Value::Null,
            PostResponseAction::StartChatRun {
                run_id: "run-8".to_owned(),
                session_key: "sess-2".to_owned(),
                message: "chat".to_owned(),
            },
        ));
        assert_eq!(
            outcome.follow_up.as_ref().map(|f| f.kind.as_str()),
            Some(FOLLOW_UP_START_CHAT_RUN)
        );

        match dispatch_result_from_outcome(outcome)
            .expect("round trip")
            .post_response
        {
            Some(PostResponseAction::StartChatRun { run_id, .. }) => assert_eq!(run_id, "run-8"),
            other => panic!("expected StartChatRun, got {other:?}"),
        }
    }

    #[test]
    fn an_immediate_result_carries_no_follow_up() {
        let outcome = outcome_from_dispatch_result(DispatchResult::immediate(json!({ "a": 1 })));
        assert!(outcome.follow_up.is_none());
        let restored = dispatch_result_from_outcome(outcome).expect("round trip");
        assert_eq!(restored.result, json!({ "a": 1 }));
        assert!(restored.post_response.is_none());
    }

    /// A follow-up S0 does not recognise is refused rather than dropped —
    /// silently discarding it would swallow an agent run.
    #[test]
    fn an_unknown_follow_up_kind_is_refused() {
        let outcome = MethodOutcome::with_follow_up(
            Value::Null,
            FollowUp::new("somethingElse", json!({"runId":"r","sessionKey":"s","message":"m"})),
        );
        let (code, message) = dispatch_result_from_outcome(outcome).expect_err("must refuse");
        assert_eq!(code, "internal");
        assert!(message.contains("somethingElse"), "got: {message}");
    }

    #[test]
    fn a_malformed_follow_up_payload_is_refused() {
        let outcome = MethodOutcome::with_follow_up(
            Value::Null,
            FollowUp::new(FOLLOW_UP_START_AGENT_RUN, json!({ "runId": "r" })),
        );
        let (code, message) = dispatch_result_from_outcome(outcome).expect_err("must refuse");
        assert_eq!(code, "internal");
        assert!(message.contains("sessionKey"), "got: {message}");
    }

    /// The router S0 hands every request to resolves the legacy dispatcher for
    /// a method no coordinate has claimed yet — which is what keeps the wire
    /// unchanged while `53.T53.04`–`08` drain handlers out from under it.
    #[test]
    fn the_process_router_parks_the_legacy_dispatcher_on_the_fallback_namespace() {
        let registry = router().registry();
        assert_eq!(
            registry.namespace_prefixes(),
            vec![LEGACY_S0_FALLBACK_NAMESPACE],
            "the drain scaffold must be the only namespace registration"
        );
        // Every still-unmoved method resolves through it.
        for method in ["sessions.list", "cron.add", "s5'.improve.propose", "nara.pasu.show"] {
            assert!(
                registry.contains(method),
                "{method} must still resolve while the drain is in progress"
            );
        }
    }
}
