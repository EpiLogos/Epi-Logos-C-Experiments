use std::fs;
use std::path::PathBuf;
use std::time::Duration;

use epi_s3_gateway::dispatch::{classify_method, dispatch_plan_entry};
use epi_s3_gateway_contract::TerminalBinding;
use serde_json::{json, Value};

use crate::gate::kernel_bridge_runtime::typed_json_m3_lens_codon_binary;
use crate::gate::protocol::RequestFrame;
use crate::gate::runs::{RunContext, RunSnapshot};
use crate::gate::runtime::GatewayRuntimeState;
use crate::gate::sessions::{SessionPatch, SessionStore};
use crate::gate::{
    anima, approvals, browser, channels, chat, config, cron, devices, epii, gnostic, graph,
    graphiti, improve, logs, models, nodes, review, sessions, skills, subagents, system,
    transcripts, update, wizard,
};

use super::method_envelope::{DispatchResult, PostResponseAction};
use super::{
    agent_id_from_session_key, branch_session, inherit_nullable_string_field,
    inherit_nullable_value_field, internal_error, invalid_params_error, is_stop_command_text,
    not_found_error, now_ms, nullable_string_field, optional_parse_param, optional_str,
    publish_activity_surface, publish_presence_surfaces, publish_session_surface, required_str,
    required_str_alias, session_identifier, session_tree, session_value_with_run_state,
};

pub(super) async fn dispatch_rpc(
    state_root: &PathBuf,
    runtime: &GatewayRuntimeState,
    frame: &RequestFrame,
) -> Result<DispatchResult, (String, String)> {
    let store = SessionStore::new(state_root).map_err(internal_error)?;
    let route = classify_method(&frame.method);

    match frame.method.as_str() {
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
                vak_address: frame
                    .params
                    .get("vakAddress")
                    .filter(|value| !value.is_null())
                    .and_then(|value| {
                        serde_json::from_value::<portal_core::VakAddress>(value.clone()).ok()
                    }),
            };
            let record = store.patch(&identifier, patch).map_err(not_found_error)?;
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
            let review = review::submit(
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
            let message = required_str(&frame.params, "message")?;
            let role = frame
                .params
                .get("role")
                .and_then(|value| value.as_str())
                .unwrap_or("assistant");
            let record = store.ensure(&session_key).map_err(internal_error)?;
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
        "s2.graph.query"
        | "s2.graph.node"
        | "s2.graph.traverse"
        | "s2.graph.harmonic_relations.materialize"
        | "s2.graph.pointer_web.compute"
        | "s2.graph.pointer_web.refresh"
        | "s2.graph.kernel_resonance.record"
        | "s2.graph.gds.tangent_overlay"
        | "s2.graph.ontology.reload"
        | "s2.graph.seed.snapshot"
        | "s2.graph.core65.audit"
        | "s2.graph.promotion.dry_run"
        | "s2.graph.promotion.commit"
        | "s2.graph.relation_family.list"
        | "s2.parashaktiCorrespondences"
        | "s2'.coordinate.resolve"
        | "s2'.retrieve"
        | "s2'.rerank"
        | "s2'.enrich" => graph::dispatch_graph_method(&frame.method, &frame.params)
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
        "s4'.vak.evaluate" => anima::vak_evaluate(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
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
        "s3'.temporal.context" => {
            let session_key = frame
                .params
                .get("sessionKey")
                .and_then(|value| value.as_str())
                .unwrap_or("agent:main:main");
            let agent_id = frame
                .params
                .get("agentId")
                .and_then(|value| value.as_str())
                .unwrap_or("operator");
            let mut value =
                crate::gate::temporal::context_value(state_root, &store, session_key, agent_id)
                    .map_err(internal_error)?;
            if frame
                .params
                .get("hydrateRedis")
                .and_then(|value| value.as_bool())
                .unwrap_or(false)
            {
                crate::gate::temporal::hydrate_redis_from_context(&mut value)
                    .await
                    .map_err(internal_error)?;
            }
            Ok(DispatchResult::immediate(value))
        }
        "s1'.vault.read_file" => crate::gate::s1_hen::read_file(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s1'.vault.write_file" => crate::gate::s1_hen::write_file(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s1'.vault.rename_file" | "s1'.vault.move_file" => {
            crate::gate::s1_hen::rename_or_move_file(&frame.params)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "s1'.semantic.suggest_links" => crate::gate::s1_hen::suggest_links(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        // CCT-15: C-layer semantic typology classification.
        "s1'.type.classify_c_layer" => crate::gate::s1_hen::type_classify_c_layer(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        // CCT-14 (+14b): entity-candidate lifecycle + review surfaces.
        "s1'.entity.capture" => crate::gate::s1_hen::entity_capture(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s1'.entity.classify" => crate::gate::s1_hen::entity_classify(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s1'.entity.promote_to_type" => crate::gate::s1_hen::entity_promote_to_type(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s1'.world.graduate" => crate::gate::s1_hen::world_graduate(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s1'.entity.list" => crate::gate::s1_hen::entity_list(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s1'.world.list_entities" => crate::gate::s1_hen::world_list_entities(&frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
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
        "s5'.review.submit" => review::submit(state_root, &frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.review.inbox" => {
            let status = optional_parse_param(&frame.params, "status")?;
            let source = optional_parse_param(&frame.params, "source")?;
            let limit = frame
                .params
                .get("limit")
                .and_then(|value| value.as_u64())
                .map(|value| value as usize);
            review::inbox(state_root, status, source, limit)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "s5'.review.resolve" => review::resolve(state_root, &frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.review.history" => {
            let limit = frame
                .params
                .get("limit")
                .and_then(|value| value.as_u64())
                .map(|value| value as usize);
            review::history(state_root, limit)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
        "s5'.improve.status" => improve::status(state_root)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.improve.propose" => improve::propose(state_root, &frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.improve.evaluate" => improve::evaluate(state_root, &frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.improve.promote" => improve::promote(state_root, &frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.improve.history" => {
            let limit = frame
                .params
                .get("limit")
                .and_then(|value| value.as_u64())
                .map(|value| value as usize);
            improve::history(state_root, limit)
                .map(DispatchResult::immediate)
                .map_err(internal_error)
        }
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
        "s5'.epii.deposit" => epii::deposit(state_root, &frame.params)
            .map(DispatchResult::immediate)
            .map_err(internal_error),
        "s5'.epii.user.orientation" | "s5'.epii.pratibimba.status" | "s5'.epii.kairos.context" => {
            Ok(DispatchResult::immediate(epii::user_orientation()))
        }
        method if method.starts_with("nara.") => {
            crate::gate::nara::dispatch_nara(method, &frame.params).map(DispatchResult::immediate)
        }
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
