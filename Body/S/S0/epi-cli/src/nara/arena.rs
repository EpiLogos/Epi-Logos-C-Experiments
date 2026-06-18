//! 41.T41.6 — arena admin CLI (ONE-substrate parity surface).
//!
//! Per DR-VAMA-4 the user-facing arena path is the Theia M4' widget; this CLI is
//! the admin / scripted / test / ONE-substrate-compliance carve-out. Each
//! subcommand has exact parity with one `m4.arena.*` gateway route and drives
//! the same [`epi_s3_gateway::m4_arena::M4ArenaRuntime`] route handlers, so the
//! CLI and gateway share one substrate (DR-S5-ONE-1). The runtime is persisted
//! through the terminal-backed PI runtime state file (Tranche 12.03); every
//! command resolves Khora session authority from the active session before it
//! may read or write.

use clap::Subcommand;
use epi_s3_gateway::m4_arena::{ArenaSummonRequest, ArenaTurnRequest, M4ArenaRuntime};
use epi_s3_gateway_contract::{ArenaSceneFilter, ArenaSessionAuthority};
use portal_core::{VamaShaktiClass, VamaShaktiReleaseReason, WarmVamaShakti, WarmVamaShaktiFilter};
use serde::Serialize;
use serde_json::Value;
use std::fs;
use std::io::Write;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::str::FromStr;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Subcommand)]
pub enum ArenaCmd {
    /// epi nara arena scene-open — open a dia-logical arena scene (CPF-gated)
    #[command(name = "scene-open")]
    SceneOpen {
        scene_key: String,
        pinned_coordinate: String,
        #[arg(long = "lifecycle-mode", default_value = "ephemeral")]
        lifecycle_mode: String,
        #[arg(long = "admitted", value_delimiter = ',')]
        admitted_constitutional: Vec<String>,
        #[arg(long = "cpf-token")]
        cpf_token: String,
    },
    /// epi nara arena summon — descend a :World entity into the scene as a Vama Shakti
    Summon {
        scene_key: String,
        entity_coordinate: String,
        #[arg(long = "class")]
        class_name: String,
        #[arg(long = "lifecycle-mode")]
        lifecycle_mode: Option<String>,
    },
    /// epi nara arena turn-advance — append a dialogue turn under Anima orchestration
    #[command(name = "turn-advance")]
    TurnAdvance {
        scene_key: String,
        #[arg(long)]
        speaker: String,
        #[arg(long, default_value = "")]
        intent: String,
        #[arg(long = "kairos-delta", default_value_t = 0.0)]
        kairos_delta: f32,
    },
    /// epi nara arena scene-close — close a scene; release ephemeral, preserve warm
    #[command(name = "scene-close")]
    SceneClose {
        scene_key: String,
        #[arg(long)]
        intent: Option<String>,
    },
    /// epi nara arena list — list arena scenes by status / pinned-coordinate / age
    List {
        #[arg(long)]
        status: Option<String>,
        #[arg(long)]
        pinned: Option<String>,
        #[arg(long = "max-age-ms")]
        max_age_ms: Option<u64>,
    },
    /// epi nara arena subscribe — open a protected-local scene event stream
    Subscribe { scene_key: String },
    /// epi nara arena vama-list-warm — warm Vama Shakti inventory
    #[command(name = "vama-list-warm")]
    VamaListWarm {
        #[arg(long)]
        coordinate: Option<String>,
        #[arg(long = "class")]
        class_filter: Option<String>,
        #[arg(long)]
        age_gte: Option<u64>,
    },
    /// epi nara arena vama-release-warm — GC a warm identity or route it to promotion
    #[command(name = "vama-release-warm")]
    VamaReleaseWarm {
        identity_handle: String,
        #[arg(long, default_value = "gc")]
        reason: String,
        /// On `--reason promote`, also emit an arena-promotion proposal (Tranche 41.11 intake).
        #[arg(long = "emit-proposal")]
        emit_proposal: bool,
        #[arg(long)]
        scenes: Option<u64>,
        #[arg(long)]
        config: Option<PathBuf>,
    },
}

pub fn dispatch(cmd: &ArenaCmd, json: bool) -> Result<String, String> {
    let authority = resolve_authority()?;
    let now_ms = now_ms();
    let mut runtime = load_runtime()?;

    match cmd {
        ArenaCmd::SceneOpen {
            scene_key,
            pinned_coordinate,
            lifecycle_mode,
            admitted_constitutional,
            cpf_token,
        } => {
            let handle = runtime
                .scene_open(
                    &authority,
                    scene_key.clone(),
                    pinned_coordinate.clone(),
                    lifecycle_mode.clone(),
                    admitted_constitutional.clone(),
                    cpf_token.clone(),
                    now_ms,
                )
                .map_err(|err| err.to_string())?;
            save_runtime(&runtime)?;
            render(json, &handle, || {
                format!(
                    "Opened scene {} (pinned {}, {}, status {})",
                    handle.scene_key,
                    handle.pinned_coordinate,
                    handle.lifecycle_mode_default,
                    handle.status
                )
            })
        }
        ArenaCmd::Summon {
            scene_key,
            entity_coordinate,
            class_name,
            lifecycle_mode,
        } => {
            let handle = runtime
                .summon(
                    &authority,
                    &ArenaSummonRequest {
                        scene_key: scene_key.clone(),
                        entity_coordinate: entity_coordinate.clone(),
                        vama_shakti_class: class_name.clone(),
                        lifecycle_mode_override: lifecycle_mode.clone(),
                    },
                    now_ms,
                )
                .map_err(|err| err.to_string())?;
            save_runtime(&runtime)?;
            render(json, &handle, || {
                format!(
                    "Summoned {} {} into {} ({})",
                    handle.vama_shakti_class,
                    handle.entity_coordinate,
                    handle.scene_key,
                    handle.identity_handle
                )
            })
        }
        ArenaCmd::TurnAdvance {
            scene_key,
            speaker,
            intent,
            kairos_delta,
        } => {
            let receipt = runtime
                .turn_advance(
                    &authority,
                    &ArenaTurnRequest {
                        scene_key: scene_key.clone(),
                        speaker_handle: speaker.clone(),
                        intent: intent.clone(),
                        turn_kairos_delta: *kairos_delta,
                        cited_coordinates: Vec::new(),
                    },
                    now_ms,
                )
                .map_err(|err| err.to_string())?;
            save_runtime(&runtime)?;
            render(json, &receipt, || {
                format!(
                    "Turn {} by {} (line {})",
                    receipt.turn_index, receipt.speaker_handle, receipt.line_id
                )
            })
        }
        ArenaCmd::SceneClose { scene_key, intent } => {
            let receipt = runtime
                .scene_close(&authority, scene_key, intent.clone(), now_ms)
                .map_err(|err| err.to_string())?;
            save_runtime(&runtime)?;
            render(json, &receipt, || {
                format!(
                    "Closed {} (released {} ephemeral, preserved {} warm)",
                    receipt.scene_key,
                    receipt.released_ephemeral_count,
                    receipt.preserved_warm_count
                )
            })
        }
        ArenaCmd::List {
            status,
            pinned,
            max_age_ms,
        } => {
            let scenes = runtime
                .list(
                    &authority,
                    &ArenaSceneFilter {
                        status: status.clone(),
                        pinned_coordinate: pinned.clone(),
                        max_age_ms: *max_age_ms,
                    },
                    now_ms,
                )
                .map_err(|err| err.to_string())?;
            if json {
                serde_json::to_string_pretty(&scenes).map_err(|err| err.to_string())
            } else if scenes.is_empty() {
                Ok("No arena scenes.".to_owned())
            } else {
                Ok(scenes
                    .iter()
                    .map(|scene| {
                        format!(
                            "{}\t{}\t{}\tvama={}\tturns={}",
                            scene.scene_key,
                            scene.status,
                            scene.pinned_coordinate,
                            scene.admitted_vama_shakti_count,
                            scene.turn_count
                        )
                    })
                    .collect::<Vec<_>>()
                    .join("\n"))
            }
        }
        ArenaCmd::Subscribe { scene_key } => {
            let stream = runtime
                .subscribe(&authority, scene_key)
                .map_err(|err| err.to_string())?;
            render(json, &stream, || {
                format!(
                    "Subscribed to {} ({}, kinds: {})",
                    stream.scene_key,
                    stream.privacy_class,
                    stream.event_kinds.join(", ")
                )
            })
        }
        ArenaCmd::VamaListWarm {
            coordinate,
            class_filter,
            age_gte,
        } => {
            let class = class_filter
                .as_deref()
                .map(VamaShaktiClass::from_str)
                .transpose()
                .map_err(|err| err.to_string())?;
            let rows = runtime
                .vama_list_warm(
                    &authority,
                    &WarmVamaShaktiFilter {
                        coordinate: coordinate.clone(),
                        vama_shakti_class: class,
                        age_gte_ms: *age_gte,
                        now_ms,
                    },
                )
                .map_err(|err| err.to_string())?;
            if json {
                serde_json::to_string_pretty(&rows).map_err(|err| err.to_string())
            } else if rows.is_empty() {
                Ok("No warm Vama Shaktis.".to_owned())
            } else {
                Ok(rows
                    .iter()
                    .map(|row| {
                        format!(
                            "{}\t{}\t{}\tturns={}",
                            row.identity_handle,
                            row.coordinate_label,
                            row.vama_shakti_class,
                            row.turns_participated_count
                        )
                    })
                    .collect::<Vec<_>>()
                    .join("\n"))
            }
        }
        ArenaCmd::VamaReleaseWarm {
            identity_handle,
            reason,
            emit_proposal,
            scenes,
            config,
        } => {
            let release_reason =
                VamaShaktiReleaseReason::from_str(reason).map_err(|err| err.to_string())?;
            // Capture the warm row before release for the 41.11 promotion intake.
            let warm_row = runtime
                .warm_vama_shaktis
                .warm
                .get(identity_handle)
                .cloned();
            let receipt = runtime
                .vama_release_warm(&authority, identity_handle, release_reason, now_ms)
                .map_err(|err| err.to_string())?;

            let proposal = if *emit_proposal && receipt.routed_to_promotion {
                let row = warm_row.ok_or_else(|| {
                    format!("warm Vama Shakti row {identity_handle} unavailable for promotion intake")
                })?;
                let input = promotion_generator_input(&row, scenes.unwrap_or(0), true)?;
                Some(invoke_arena_promotion(&input, config.as_ref())?)
            } else {
                None
            };
            save_runtime(&runtime)?;

            if json {
                let mut value = serde_json::to_value(&receipt).map_err(|err| err.to_string())?;
                if let (Some(object), Some(proposal)) = (value.as_object_mut(), proposal.as_ref()) {
                    object.insert("promotionProposal".to_owned(), proposal.clone());
                }
                serde_json::to_string_pretty(&value).map_err(|err| err.to_string())
            } else {
                let mut out = format!(
                    "Released {} (reason {}, promotion={})",
                    receipt.identity_handle, reason, receipt.routed_to_promotion
                );
                if let Some(proposal) = proposal.as_ref() {
                    out.push('\n');
                    out.push_str(&render_promotion_summary(proposal));
                }
                Ok(out)
            }
        }
    }
}

fn render<T: Serialize>(
    json: bool,
    value: &T,
    human: impl FnOnce() -> String,
) -> Result<String, String> {
    if json {
        serde_json::to_string_pretty(value).map_err(|err| err.to_string())
    } else {
        Ok(human())
    }
}

/// Resolve Khora session authority from the active session environment. DR-S5-ONE-1
/// forbids any arena write without it.
fn resolve_authority() -> Result<ArenaSessionAuthority, String> {
    let session_key = env_first(&[
        "EPI_GATE_SESSION_KEY",
        "EPI_GATEWAY_SESSION_KEY",
        "EPI_SESSION_ID",
        "EPI_ARENA_SESSION_KEY",
    ]);
    let vault_now_path = env_first(&["EPI_NOW_PATH", "EPI_ARENA_NOW_PATH"]);
    let day_id = env_first(&["EPI_DAY_ID", "EPI_ARENA_DAY_ID"]).unwrap_or_default();
    let authority = ArenaSessionAuthority {
        session_key: session_key.unwrap_or_default(),
        vault_now_path: vault_now_path.unwrap_or_default(),
        day_id,
    };
    if !authority.is_authorized() {
        return Err(
            "refused per DR-S5-ONE-1: no Khora session authority (set EPI_NOW_PATH + EPI_SESSION_ID, or run inside a Khora session)"
                .to_owned(),
        );
    }
    Ok(authority)
}

fn env_first(keys: &[&str]) -> Option<String> {
    for key in keys {
        if let Ok(value) = std::env::var(key) {
            if !value.trim().is_empty() {
                return Some(value);
            }
        }
    }
    None
}

fn load_runtime() -> Result<M4ArenaRuntime, String> {
    let path = runtime_path()?;
    if !path.exists() {
        return Ok(M4ArenaRuntime::default());
    }
    let bytes = fs::read(&path).map_err(|err| format!("read {}: {err}", path.display()))?;
    serde_json::from_slice(&bytes).map_err(|err| format!("parse {}: {err}", path.display()))
}

fn save_runtime(runtime: &M4ArenaRuntime) -> Result<(), String> {
    let path = runtime_path()?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| format!("create {}: {err}", parent.display()))?;
    }
    let bytes = serde_json::to_vec_pretty(runtime).map_err(|err| err.to_string())?;
    fs::write(&path, bytes).map_err(|err| format!("write {}: {err}", path.display()))
}

fn runtime_path() -> Result<PathBuf, String> {
    if let Ok(path) = std::env::var("EPI_NARA_ARENA_RUNTIME_PATH") {
        return Ok(PathBuf::from(path));
    }
    let home =
        dirs::home_dir().ok_or_else(|| "HOME is required for Nara arena runtime".to_owned())?;
    Ok(home
        .join(".epi-logos")
        .join("nara")
        .join("arena-runtime.json"))
}

fn promotion_generator_input(
    row: &WarmVamaShakti,
    scene_count: u64,
    user_response_quality_witnessed: bool,
) -> Result<Value, String> {
    let mut value = serde_json::to_value(row).map_err(|err| err.to_string())?;
    let object = value
        .as_object_mut()
        .ok_or_else(|| "warm Vama Shakti row did not serialize as an object".to_owned())?;
    object.insert("sceneCount".to_owned(), Value::from(scene_count));
    object.insert(
        "userResponseQualityWitnessed".to_owned(),
        Value::from(user_response_quality_witnessed),
    );
    Ok(value)
}

fn invoke_arena_promotion(input: &Value, config: Option<&PathBuf>) -> Result<Value, String> {
    let python = std::env::var("EPI_ARENA_PROMOTION_PYTHON")
        .or_else(|_| std::env::var("EPI_GNOSTIC_PYTHON"))
        .unwrap_or_else(|_| "python3".to_owned());
    let mut command = Command::new(&python);
    command.args(["-m", "epi_gnostic.arena_promotion", "-"]);
    if let Some(config) = config {
        command.arg("--config").arg(config);
    }
    if let Some(pythonpath) = arena_promotion_pythonpath() {
        command.env("PYTHONPATH", pythonpath);
    }
    command
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    let mut child = command
        .spawn()
        .map_err(|err| format!("failed to run arena-promotion generator {python}: {err}"))?;
    {
        let stdin = child
            .stdin
            .as_mut()
            .ok_or_else(|| "arena-promotion generator stdin unavailable".to_owned())?;
        let bytes = serde_json::to_vec(input).map_err(|err| err.to_string())?;
        stdin
            .write_all(&bytes)
            .map_err(|err| format!("write arena-promotion input: {err}"))?;
    }
    let output = child
        .wait_with_output()
        .map_err(|err| format!("wait for arena-promotion generator: {err}"))?;
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    if !output.status.success() {
        let diagnostic = if stderr.trim().is_empty() {
            stdout.trim()
        } else {
            stderr.trim()
        };
        return Err(format!("arena-promotion generator failed: {diagnostic}"));
    }
    serde_json::from_str(stdout.trim()).map_err(|err| {
        format!(
            "arena-promotion generator returned non-JSON output: {err}; stdout={}",
            stdout.trim()
        )
    })
}

fn arena_promotion_pythonpath() -> Option<String> {
    let source_path = std::env::var("EPI_GNOSTIC_SOURCE_PATH")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../S5/epi-gnostic"));
    if !source_path.exists() {
        return std::env::var("PYTHONPATH").ok();
    }
    match std::env::var("PYTHONPATH") {
        Ok(existing) if !existing.trim().is_empty() => {
            Some(format!("{}:{}", source_path.display(), existing))
        }
        _ => Some(source_path.display().to_string()),
    }
}

fn render_promotion_summary(proposal: &Value) -> String {
    if proposal.get("event").and_then(Value::as_str) == Some("promotion_not_ready") {
        return "Promotion proposal not emitted; warm Vama Shakti has not crossed its class profile.".to_owned();
    }
    let proposal_id = proposal
        .get("proposal_id")
        .and_then(Value::as_str)
        .unwrap_or("arena-promotion");
    let coordinate = proposal
        .get("vama_shakti_coordinate_label")
        .and_then(Value::as_str)
        .unwrap_or("unknown-coordinate");
    let class = proposal
        .get("vama_shakti_class")
        .and_then(Value::as_str)
        .unwrap_or("unknown-class");
    let target = proposal
        .get("augmentation_patch")
        .and_then(|patch| patch.get("target"))
        .and_then(Value::as_str)
        .unwrap_or("unknown-target");
    format!(
        "promotion_proposal_emitted {proposal_id}\t{coordinate}\tclass={class}\ttarget={target}"
    )
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use portal_core::{hash_revision, PrewarmVamaShaktiRequest, VakAddress};
    use portal_core::{CpfState, CsDirection, CsField};

    fn vak_address(coordinate: &str) -> VakAddress {
        VakAddress {
            cpf: CpfState::Mechanistic,
            ct: vec!["CT4".to_owned()],
            cp: coordinate.to_owned(),
            cf: "(4.5/0)".to_owned(),
            cfp: "m4.arena.vama".to_owned(),
            cs: CsField {
                code: format!("vama:{coordinate}"),
                direction: CsDirection::Day,
            },
        }
    }

    #[test]
    fn class_filter_returns_only_sprite_entries() {
        let mut runtime = M4ArenaRuntime::default();
        let psyche = "psyche revision";
        for (coordinate, class) in [
            ("M4.sprite-field", VamaShaktiClass::Sprite),
            ("M4.daemon-field", VamaShaktiClass::Daemon),
        ] {
            runtime
                .warm_vama_shaktis
                .prewarm(PrewarmVamaShaktiRequest {
                    coordinate_label: coordinate.to_owned(),
                    coordinate: vak_address(coordinate),
                    canonical_form_digest: hash_revision(coordinate),
                    archetypal_sattva: coordinate.to_owned(),
                    vama_shakti_class: class,
                    psyche_template_md: psyche.to_owned(),
                    entity_form_md: coordinate.to_owned(),
                    psyche_template_revision: hash_revision(psyche),
                    now_ms: 1_000,
                });
        }

        let rows = runtime.warm_vama_shaktis.list_warm(&WarmVamaShaktiFilter {
            coordinate: None,
            vama_shakti_class: Some(VamaShaktiClass::Sprite),
            age_gte_ms: None,
            now_ms: 2_000,
        });

        assert_eq!(rows.len(), 1);
        assert_eq!(
            rows[0].essential_identity.vama_shakti_class,
            VamaShaktiClass::Sprite
        );
    }

    #[test]
    fn promotion_generator_input_carries_scene_and_user_witness_fields() {
        let mut runtime = M4ArenaRuntime::default();
        let psyche = "psyche revision";
        let row = runtime.warm_vama_shaktis.prewarm(PrewarmVamaShaktiRequest {
            coordinate_label: "M4.daemon-field".to_owned(),
            coordinate: vak_address("M4.daemon-field"),
            canonical_form_digest: hash_revision("M4.daemon-field"),
            archetypal_sattva: "M4.daemon-field".to_owned(),
            vama_shakti_class: VamaShaktiClass::Daemon,
            psyche_template_md: psyche.to_owned(),
            entity_form_md: "form:M4.daemon-field".to_owned(),
            psyche_template_revision: hash_revision(psyche),
            now_ms: 1_000,
        });

        let input = promotion_generator_input(&row, 4, true).expect("serializes row");

        assert_eq!(input["sceneCount"], 4);
        assert_eq!(input["userResponseQualityWitnessed"], true);
        assert_eq!(
            input["essentialIdentity"]["vamaShaktiClass"],
            serde_json::Value::String("daemon".to_owned())
        );
    }
}
