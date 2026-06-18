//! 41.T41.6 — `m4.arena.*` gateway route family (S3 native handler).
//!
//! The dia-logical arena runtime is the S3-native authority behind the eight
//! `m4.arena.*` routes registered in
//! [`epi_s3_gateway_contract`]. It owns the in-process scene/presence/turn state
//! that the SpacetimeDB arena tables (41.5) project, and produces the contract
//! handles/receipts that gateway clients and the `epi nara arena` admin CLI
//! consume.
//!
//! **ONE-substrate compliance (DR-S5-ONE-1).** Every route takes an
//! [`ArenaSessionAuthority`] and refuses (`M4ArenaError::Unauthorized`) unless
//! Khora has bound the session to a NOW vault artifact. No arena write may
//! bypass the gateway, and no gateway route may exist without its CLI parity
//! command — both are asserted by the route-contract tests below.
//!
//! **Summon refusal law (DR-VAMA-3 + DR-VAMA-6).** Summoning is
//! addressable-by-coordinate-only: `summon` refuses any `entity_coordinate` that
//! does not resolve into the `:World` namespace, and refuses any classifier
//! outside the closed `egregore / sprite / daemon / mantra` set.
//!
//! **CPF gate (DR-VAMA-3 scene-setup).** `scene_open` refuses without an
//! Anima brainstorming confirmation token — the CPF `(00/00)` gate marker.

use std::collections::BTreeMap;
use std::fmt;

use epi_s3_gateway_contract::{
    ArenaEventStream, ArenaSceneFilter, ArenaSceneHandle, ArenaSessionAuthority, ClosureReceipt,
    ReleaseReceipt, TurnReceipt, VamaShaktiHandle, WarmVamaShaktiHandle,
};
use portal_core::{
    hash_revision, hex_digest, transit_quaternion_at_millis, CpfState, CsDirection, CsField,
    PrewarmVamaShaktiRequest, VakAddress, VamaShaktiClass, VamaShaktiError, VamaShaktiReleaseReason,
    WarmVamaShaktiFilter, WarmVamaShaktiRegistry,
};
use serde::{Deserialize, Serialize};
use std::str::FromStr;

const PRIVACY_PROTECTED_LOCAL: &str = "protected_local_handle_only";
const LIFECYCLE_EPHEMERAL: &str = "ephemeral";

/// Errors raised by the arena route family.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum M4ArenaError {
    /// DR-S5-ONE-1: the route was invoked without Khora session authority.
    Unauthorized,
    /// DR-VAMA-3 scene gate: scene_open requires the CPF brainstorm token.
    MissingCpfToken,
    /// DR-VAMA-3: the entity coordinate does not resolve into `:World`.
    NonWorldCoordinate(String),
    /// DR-VAMA-6: the classifier is outside the closed set.
    UnknownClassifier(String),
    /// The named scene does not exist.
    UnknownScene(String),
    /// The scene exists but is already closed.
    SceneClosed(String),
    /// The warm Vama Shakti identity is unknown.
    UnknownIdentity(String),
    /// A duplicate scene_key was supplied to scene_open.
    DuplicateScene(String),
    /// Underlying warm-registry error.
    VamaShakti(VamaShaktiError),
}

impl fmt::Display for M4ArenaError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Unauthorized => write!(
                f,
                "refused per DR-S5-ONE-1: arena route requires Khora session authority"
            ),
            Self::MissingCpfToken => write!(
                f,
                "refused per DR-VAMA-3: m4.arena.scene_open requires the CPF brainstorm confirmation token"
            ),
            Self::NonWorldCoordinate(coordinate) => write!(
                f,
                "refused per DR-VAMA-3: entity_coordinate `{coordinate}` must resolve to a :World entity; promote or propose it via Hen first"
            ),
            Self::UnknownClassifier(class) => write!(
                f,
                "refused per DR-VAMA-6: vama_shakti_class `{class}` must be one of egregore/sprite/daemon/mantra"
            ),
            Self::UnknownScene(scene) => write!(f, "unknown arena scene `{scene}`"),
            Self::SceneClosed(scene) => write!(f, "arena scene `{scene}` is already closed"),
            Self::UnknownIdentity(handle) => write!(f, "unknown warm Vama Shakti `{handle}`"),
            Self::DuplicateScene(scene) => write!(f, "arena scene `{scene}` already open"),
            Self::VamaShakti(err) => write!(f, "{err}"),
        }
    }
}

impl std::error::Error for M4ArenaError {}

impl From<VamaShaktiError> for M4ArenaError {
    fn from(err: VamaShaktiError) -> Self {
        match err {
            VamaShaktiError::InvalidClass(class) => Self::UnknownClassifier(class),
            VamaShaktiError::UnknownIdentity(handle) | VamaShaktiError::ReleasedIdentity(handle) => {
                Self::UnknownIdentity(handle)
            }
            other => Self::VamaShakti(other),
        }
    }
}

/// Request for `m4.arena.summon`. The Form digest / psyche template are
/// resolved server-side from the `:World` entity (here defaulted from the
/// coordinate, mirroring the `epi nara arena summon` admin path).
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArenaSummonRequest {
    pub scene_key: String,
    pub entity_coordinate: String,
    pub vama_shakti_class: String,
    pub lifecycle_mode_override: Option<String>,
}

/// Request for `m4.arena.turn_advance`.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArenaTurnRequest {
    pub scene_key: String,
    pub speaker_handle: String,
    pub intent: String,
    #[serde(default)]
    pub turn_kairos_delta: f32,
    #[serde(default)]
    pub cited_coordinates: Vec<VakAddress>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PresenceState {
    identity_handle: String,
    entity_coordinate: String,
    vama_shakti_class: VamaShaktiClass,
    lifecycle_mode: String,
    admitted_at_ms: u64,
    released: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SceneRuntime {
    handle: ArenaSceneHandle,
    presences: Vec<PresenceState>,
    turn_counter: u64,
    line_counter: u64,
}

impl SceneRuntime {
    fn refreshed_handle(&self) -> ArenaSceneHandle {
        let mut handle = self.handle.clone();
        handle.admitted_vama_shakti_count =
            self.presences.iter().filter(|p| !p.released).count() as u32;
        handle.turn_count = self.turn_counter as u32;
        handle
    }
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M4ArenaRuntime {
    pub warm_vama_shaktis: WarmVamaShaktiRegistry,
    #[serde(default)]
    scenes: BTreeMap<String, SceneRuntime>,
}

impl M4ArenaRuntime {
    /// `m4.arena.scene_open` — open a new arena scene. Refuses without the CPF
    /// brainstorm confirmation token (DR-VAMA-3 scene gate) and without Khora
    /// session authority (DR-S5-ONE-1).
    #[allow(clippy::too_many_arguments)]
    pub fn scene_open(
        &mut self,
        authority: &ArenaSessionAuthority,
        scene_key: impl Into<String>,
        pinned_coordinate: impl Into<String>,
        lifecycle_mode_default: impl Into<String>,
        admitted_constitutional: Vec<String>,
        cpf_brainstorm_confirmation_token: impl Into<String>,
        now_ms: u64,
    ) -> Result<ArenaSceneHandle, M4ArenaError> {
        require_authority(authority)?;
        let cpf_brainstorm_confirmation_token = cpf_brainstorm_confirmation_token.into();
        if cpf_brainstorm_confirmation_token.trim().is_empty() {
            return Err(M4ArenaError::MissingCpfToken);
        }
        let scene_key = scene_key.into();
        if self.scenes.contains_key(&scene_key) {
            return Err(M4ArenaError::DuplicateScene(scene_key));
        }
        let handle = ArenaSceneHandle {
            scene_key: scene_key.clone(),
            pinned_coordinate: pinned_coordinate.into(),
            lifecycle_mode_default: lifecycle_mode_default.into(),
            admitted_constitutional,
            status: "open".to_owned(),
            opened_at_ms: now_ms,
            closed_at_ms: None,
            admitted_vama_shakti_count: 0,
            turn_count: 0,
            cpf_brainstorm_confirmation_token,
            privacy_class: PRIVACY_PROTECTED_LOCAL.to_owned(),
        };
        self.scenes.insert(
            scene_key,
            SceneRuntime {
                handle: handle.clone(),
                presences: Vec::new(),
                turn_counter: 0,
                line_counter: 0,
            },
        );
        Ok(handle)
    }

    /// `m4.arena.summon` — descend a `:World` entity into the scene as a Vama
    /// Shakti. Refuses non-`:World` coordinates (DR-VAMA-3) and classifiers
    /// outside the closed set (DR-VAMA-6).
    pub fn summon(
        &mut self,
        authority: &ArenaSessionAuthority,
        request: &ArenaSummonRequest,
        now_ms: u64,
    ) -> Result<VamaShaktiHandle, M4ArenaError> {
        require_authority(authority)?;
        if !is_world_coordinate(&request.entity_coordinate) {
            return Err(M4ArenaError::NonWorldCoordinate(
                request.entity_coordinate.clone(),
            ));
        }
        let vama_shakti_class = VamaShaktiClass::from_str(&request.vama_shakti_class)
            .map_err(|_| M4ArenaError::UnknownClassifier(request.vama_shakti_class.clone()))?;
        if !self.scenes.contains_key(&request.scene_key) {
            return Err(M4ArenaError::UnknownScene(request.scene_key.clone()));
        }
        if self.scene_is_closed(&request.scene_key) {
            return Err(M4ArenaError::SceneClosed(request.scene_key.clone()));
        }

        let coordinate = vak_address_from_coordinate(&request.entity_coordinate, vama_shakti_class);
        let canonical_form_digest = hash_revision(&request.entity_coordinate);
        let psyche_template_md = default_psyche_template_md();
        let psyche_template_revision = hash_revision(&psyche_template_md);
        let entity_form_md = format!(
            "coordinate: {}\nclass: {vama_shakti_class}\n",
            request.entity_coordinate
        );
        let archetypal_sattva = format!("{}:{vama_shakti_class}", request.entity_coordinate);

        // Reuse a warm identity when one already exists (warm resurfacing);
        // otherwise prewarm a fresh one. The identity handle is deterministic
        // per DR-VAMA-2, so this is idempotent across fresh scenes.
        let essential = portal_core::derive_vama_shakti_essential_identity(
            &coordinate,
            &canonical_form_digest,
            &archetypal_sattva,
            vama_shakti_class,
            psyche_template_revision,
        );
        let identity_handle = hex_digest(&essential.vama_shakti_quintessence_hash);
        if !self
            .warm_vama_shaktis
            .warm
            .get(&identity_handle)
            .map(|row| row.is_active())
            .unwrap_or(false)
        {
            self.warm_vama_shaktis.prewarm(PrewarmVamaShaktiRequest {
                coordinate_label: request.entity_coordinate.clone(),
                coordinate: coordinate.clone(),
                canonical_form_digest,
                archetypal_sattva,
                vama_shakti_class,
                psyche_template_md: psyche_template_md.clone(),
                entity_form_md: entity_form_md.clone(),
                psyche_template_revision,
                now_ms,
            });
        }

        let presence = self.warm_vama_shaktis.summon_warm(
            request.scene_key.clone(),
            &identity_handle,
            transit_quaternion_at_millis(now_ms),
            &psyche_template_md,
            &entity_form_md,
            psyche_template_revision,
            now_ms,
        )?;

        let lifecycle_mode = request.lifecycle_mode_override.clone().unwrap_or_else(|| {
            self.scenes
                .get(&request.scene_key)
                .map(|scene| scene.handle.lifecycle_mode_default.clone())
                .unwrap_or_else(|| LIFECYCLE_EPHEMERAL.to_owned())
        });

        let clock_position = essential.vama_shakti_clock_position;
        let scene = self
            .scenes
            .get_mut(&request.scene_key)
            .ok_or_else(|| M4ArenaError::UnknownScene(request.scene_key.clone()))?;
        // Upsert presence (at most one live presence per identity).
        scene.presences.retain(|p| p.identity_handle != identity_handle);
        scene.presences.push(PresenceState {
            identity_handle: identity_handle.clone(),
            entity_coordinate: request.entity_coordinate.clone(),
            vama_shakti_class,
            lifecycle_mode: lifecycle_mode.clone(),
            admitted_at_ms: now_ms,
            released: false,
        });
        scene.handle = scene.refreshed_handle();

        Ok(VamaShaktiHandle {
            scene_key: request.scene_key.clone(),
            identity_handle,
            entity_coordinate: request.entity_coordinate.clone(),
            vama_shakti_class,
            lifecycle_mode,
            vama_shakti_clock_position: clock_position,
            psyche_template_revision_drift: presence.psyche_template_revision_drift,
            admitted_at_ms: now_ms,
        })
    }

    /// `m4.arena.turn_advance` — Anima orchestration appends an ArenaTurn +
    /// ArenaDialogueLine. When the speaker is a warm Vama Shakti, its
    /// classifier-aware Q-activity accumulator is perturbed.
    pub fn turn_advance(
        &mut self,
        authority: &ArenaSessionAuthority,
        request: &ArenaTurnRequest,
        now_ms: u64,
    ) -> Result<TurnReceipt, M4ArenaError> {
        require_authority(authority)?;
        if !self.scenes.contains_key(&request.scene_key) {
            return Err(M4ArenaError::UnknownScene(request.scene_key.clone()));
        }
        if self.scene_is_closed(&request.scene_key) {
            return Err(M4ArenaError::SceneClosed(request.scene_key.clone()));
        }

        let pinned = self
            .scenes
            .get(&request.scene_key)
            .map(|scene| scene.handle.pinned_coordinate.clone())
            .unwrap_or_default();
        let turn_index = self
            .scenes
            .get(&request.scene_key)
            .map(|scene| scene.turn_counter as u32)
            .unwrap_or(0);

        // Resolve speaker class from a live presence (if the speaker is a Vama
        // Shakti rather than "user"/"constitutional:*").
        let speaker_class = self
            .scenes
            .get(&request.scene_key)
            .and_then(|scene| {
                scene
                    .presences
                    .iter()
                    .find(|p| !p.released && p.identity_handle == request.speaker_handle)
                    .map(|p| p.vama_shakti_class)
            });

        let vak_address = arena_turn_vak_address(&pinned, turn_index, speaker_class);

        if speaker_class.is_some() {
            // Accumulate classifier-aware Q-activity for the speaking shakti.
            self.warm_vama_shaktis.apply_turn(
                &request.speaker_handle,
                &vak_address,
                request.turn_kairos_delta,
                &request.cited_coordinates,
                now_ms,
            )?;
        }

        let scene = self
            .scenes
            .get_mut(&request.scene_key)
            .ok_or_else(|| M4ArenaError::UnknownScene(request.scene_key.clone()))?;
        let turn_id = scene.turn_counter;
        let line_id = scene.line_counter;
        scene.turn_counter += 1;
        scene.line_counter += 1;
        scene.handle = scene.refreshed_handle();

        Ok(TurnReceipt {
            scene_key: request.scene_key.clone(),
            turn_id,
            turn_index,
            speaker_handle: request.speaker_handle.clone(),
            speaker_class,
            line_id,
            vak_address,
            arrived_at_ms: now_ms,
        })
    }

    /// `m4.arena.subscribe` — protected-local event stream for a scene. Dialogue
    /// bodies never cross to the global projection (DR-VAMA-4/DR-VAMA-5).
    pub fn subscribe(
        &self,
        authority: &ArenaSessionAuthority,
        scene_key: &str,
    ) -> Result<ArenaEventStream, M4ArenaError> {
        require_authority(authority)?;
        if !self.scenes.contains_key(scene_key) {
            return Err(M4ArenaError::UnknownScene(scene_key.to_owned()));
        }
        Ok(ArenaEventStream {
            scene_key: scene_key.to_owned(),
            subscription_id: format!("{}/arena/{scene_key}/stream", authority.arena_redis_prefix()),
            privacy_class: PRIVACY_PROTECTED_LOCAL.to_owned(),
            event_kinds: vec![
                "arena_turn".to_owned(),
                "arena_dialogue_line".to_owned(),
                "arena_presence".to_owned(),
            ],
        })
    }

    /// `m4.arena.scene_close` — close a scene, release ephemeral presences,
    /// preserve warm ones, and emit closure for 41.9 distillation.
    pub fn scene_close(
        &mut self,
        authority: &ArenaSessionAuthority,
        scene_key: &str,
        closure_intent: Option<String>,
        now_ms: u64,
    ) -> Result<ClosureReceipt, M4ArenaError> {
        require_authority(authority)?;
        if !self.scenes.contains_key(scene_key) {
            return Err(M4ArenaError::UnknownScene(scene_key.to_owned()));
        }
        if self.scene_is_closed(scene_key) {
            return Err(M4ArenaError::SceneClosed(scene_key.to_owned()));
        }

        // Collect ephemeral identities to GC; warm-mode presences are preserved.
        let (ephemeral, preserved): (Vec<String>, Vec<String>) = {
            let scene = self
                .scenes
                .get(scene_key)
                .ok_or_else(|| M4ArenaError::UnknownScene(scene_key.to_owned()))?;
            let mut ephemeral = Vec::new();
            let mut preserved = Vec::new();
            for presence in scene.presences.iter().filter(|p| !p.released) {
                if presence.lifecycle_mode == LIFECYCLE_EPHEMERAL {
                    ephemeral.push(presence.identity_handle.clone());
                } else {
                    preserved.push(presence.identity_handle.clone());
                }
            }
            (ephemeral, preserved)
        };

        for handle in &ephemeral {
            // GC the warm identity backing an ephemeral presence; ignore unknowns.
            let _ = self
                .warm_vama_shaktis
                .release(handle, VamaShaktiReleaseReason::Gc, now_ms);
        }

        let scene = self
            .scenes
            .get_mut(scene_key)
            .ok_or_else(|| M4ArenaError::UnknownScene(scene_key.to_owned()))?;
        for presence in scene.presences.iter_mut() {
            if presence.lifecycle_mode == LIFECYCLE_EPHEMERAL {
                presence.released = true;
            }
        }
        scene.handle.status = "closed".to_owned();
        scene.handle.closed_at_ms = Some(now_ms);
        scene.handle = scene.refreshed_handle();

        Ok(ClosureReceipt {
            scene_key: scene_key.to_owned(),
            closure_intent,
            released_ephemeral_count: ephemeral.len() as u32,
            preserved_warm_count: preserved.len() as u32,
            closed_at_ms: now_ms,
            closure_emitted_for_distillation: true,
        })
    }

    /// `m4.arena.list` — list scenes by status / pinned-coordinate / age.
    pub fn list(
        &self,
        authority: &ArenaSessionAuthority,
        filter: &ArenaSceneFilter,
        now_ms: u64,
    ) -> Result<Vec<ArenaSceneHandle>, M4ArenaError> {
        require_authority(authority)?;
        let handles = self
            .scenes
            .values()
            .map(SceneRuntime::refreshed_handle)
            .filter(|handle| {
                filter
                    .status
                    .as_ref()
                    .map(|status| handle.status == *status)
                    .unwrap_or(true)
            })
            .filter(|handle| {
                filter
                    .pinned_coordinate
                    .as_ref()
                    .map(|coord| handle.pinned_coordinate == *coord)
                    .unwrap_or(true)
            })
            .filter(|handle| {
                filter
                    .max_age_ms
                    .map(|age| now_ms.saturating_sub(handle.opened_at_ms) <= age)
                    .unwrap_or(true)
            })
            .collect();
        Ok(handles)
    }

    /// `m4.arena.vama_list_warm` — warm Vama Shakti inventory.
    pub fn vama_list_warm(
        &self,
        authority: &ArenaSessionAuthority,
        filter: &WarmVamaShaktiFilter,
    ) -> Result<Vec<WarmVamaShaktiHandle>, M4ArenaError> {
        require_authority(authority)?;
        let handles = self
            .warm_vama_shaktis
            .list_warm(filter)
            .into_iter()
            .map(|row| WarmVamaShaktiHandle {
                identity_handle: row.identity_handle,
                coordinate_label: row.coordinate_label,
                vama_shakti_class: row.essential_identity.vama_shakti_class,
                turns_participated_count: row.q_activity_accumulator.turn_count,
                warmed_at_ms: row.warmed_at_ms,
                last_seen_at_ms: row.last_seen_at_ms,
            })
            .collect();
        Ok(handles)
    }

    /// `m4.arena.vama_release_warm` — GC a warm identity or route it to
    /// promotion (Tranche 41.11).
    pub fn vama_release_warm(
        &mut self,
        authority: &ArenaSessionAuthority,
        identity_handle: &str,
        reason: VamaShaktiReleaseReason,
        now_ms: u64,
    ) -> Result<ReleaseReceipt, M4ArenaError> {
        require_authority(authority)?;
        let routed_to_promotion = reason == VamaShaktiReleaseReason::Promote;
        let row = self
            .warm_vama_shaktis
            .release(identity_handle, reason.clone(), now_ms)?;
        Ok(ReleaseReceipt {
            identity_handle: row.identity_handle,
            reason,
            routed_to_promotion,
            released_at_ms: now_ms,
        })
    }

    fn scene_is_closed(&self, scene_key: &str) -> bool {
        self.scenes
            .get(scene_key)
            .map(|scene| scene.handle.closed_at_ms.is_some())
            .unwrap_or(false)
    }
}

fn require_authority(authority: &ArenaSessionAuthority) -> Result<(), M4ArenaError> {
    if authority.is_authorized() {
        Ok(())
    } else {
        Err(M4ArenaError::Unauthorized)
    }
}

/// Mirror of the Pleroma `resolvesAsWorldCoordinate` law (DR-VAMA-3 +
/// DR-WORLD-1): the coordinate must address the `:World` / `/World` namespace.
fn is_world_coordinate(coordinate: &str) -> bool {
    let trimmed = coordinate.trim();
    for prefix in [":World", "/World"] {
        if let Some(rest) = trimmed.strip_prefix(prefix) {
            if rest.starts_with('/') || rest.starts_with(':') {
                return rest.len() > 1;
            }
        }
    }
    false
}

fn default_psyche_template_md() -> String {
    "psyche_template_authority: default-local-admin\nsix_section_profile: true\n".to_owned()
}

fn vak_address_from_coordinate(coordinate: &str, class: VamaShaktiClass) -> VakAddress {
    VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT4".to_owned()],
        cp: coordinate.to_owned(),
        cf: "(4.5/0)".to_owned(),
        cfp: "m4.arena.vama".to_owned(),
        cs: CsField {
            code: format!("vama:{class}:{coordinate}"),
            direction: CsDirection::Day,
        },
    }
}

fn arena_turn_vak_address(
    pinned: &str,
    turn_index: u32,
    speaker_class: Option<VamaShaktiClass>,
) -> VakAddress {
    let class_tag = speaker_class
        .map(|class| class.as_str())
        .unwrap_or("non-vama");
    VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT4".to_owned()],
        cp: format!("{pinned}.turn.{turn_index}"),
        cf: "(4.5/0)".to_owned(),
        cfp: "m4.arena.dialogue".to_owned(),
        cs: CsField {
            code: format!("arena-dialogue-{turn_index}:{class_tag}"),
            direction: CsDirection::Day,
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use epi_s3_gateway_contract::{M4_ARENA_METHODS, M4_ARENA_ROUTE_CONTRACTS};

    fn authority() -> ArenaSessionAuthority {
        ArenaSessionAuthority {
            session_key: "agent:arena-rt:main".to_owned(),
            vault_now_path: "/vault/Empty/Present/19-06-2026/arena-rt/now.md".to_owned(),
            day_id: "19-06-2026".to_owned(),
        }
    }

    const WORLD_COORD: &str = ":World/Types/C/C5/egregore-of-the-now";

    #[test]
    fn m4_arena_round_trip() {
        let auth = authority();
        let mut rt = M4ArenaRuntime::default();

        // scene_open
        let scene = rt
            .scene_open(
                &auth,
                "arena:rt",
                "C5",
                LIFECYCLE_EPHEMERAL,
                vec!["Sophia".to_owned()],
                "cpf-confirmed-rt",
                1_000,
            )
            .expect("scene opens with CPF token");
        assert_eq!(scene.status, "open");
        assert_eq!(scene.privacy_class, PRIVACY_PROTECTED_LOCAL);
        assert_eq!(scene.admitted_constitutional, vec!["Sophia".to_owned()]);

        // summon a :World daemon
        let handle = rt
            .summon(
                &auth,
                &ArenaSummonRequest {
                    scene_key: "arena:rt".to_owned(),
                    entity_coordinate: WORLD_COORD.to_owned(),
                    vama_shakti_class: "daemon".to_owned(),
                    lifecycle_mode_override: None,
                },
                2_000,
            )
            .expect("daemon summons from :World coordinate");
        assert_eq!(handle.vama_shakti_class, VamaShaktiClass::Daemon);
        assert_eq!(handle.lifecycle_mode, LIFECYCLE_EPHEMERAL);
        let identity_handle = handle.identity_handle.clone();

        // turn_advance by the summoned shakti
        let receipt = rt
            .turn_advance(
                &auth,
                &ArenaTurnRequest {
                    scene_key: "arena:rt".to_owned(),
                    speaker_handle: identity_handle.clone(),
                    intent: "open the dialogue".to_owned(),
                    turn_kairos_delta: 0.25,
                    cited_coordinates: Vec::new(),
                },
                3_000,
            )
            .expect("turn advances");
        assert_eq!(receipt.turn_index, 0);
        assert_eq!(receipt.speaker_class, Some(VamaShaktiClass::Daemon));
        assert_eq!(receipt.vak_address.cfp, "m4.arena.dialogue");

        // subscribe
        let stream = rt.subscribe(&auth, "arena:rt").expect("subscribe");
        assert_eq!(stream.privacy_class, PRIVACY_PROTECTED_LOCAL);
        assert!(stream.event_kinds.contains(&"arena_turn".to_owned()));

        // list (open scenes)
        let open = rt
            .list(
                &auth,
                &ArenaSceneFilter {
                    status: Some("open".to_owned()),
                    ..ArenaSceneFilter::default()
                },
                3_500,
            )
            .expect("list open scenes");
        assert_eq!(open.len(), 1);
        assert_eq!(open[0].admitted_vama_shakti_count, 1);
        assert_eq!(open[0].turn_count, 1);

        // scene_close — ephemeral presence is released
        let closure = rt
            .scene_close(&auth, "arena:rt", Some("rt done".to_owned()), 4_000)
            .expect("scene closes");
        assert_eq!(closure.released_ephemeral_count, 1);
        assert_eq!(closure.preserved_warm_count, 0);
        assert!(closure.closure_emitted_for_distillation);

        // closed scene drops out of the open filter
        let still_open = rt
            .list(
                &auth,
                &ArenaSceneFilter {
                    status: Some("open".to_owned()),
                    ..ArenaSceneFilter::default()
                },
                4_500,
            )
            .expect("list");
        assert!(still_open.is_empty());

        // ephemeral identity was GC'd, so warm inventory is empty
        let warm = rt
            .vama_list_warm(&auth, &WarmVamaShaktiFilter::default())
            .expect("warm list");
        assert!(warm.is_empty());
    }

    #[test]
    fn warm_lifecycle_presence_survives_close_and_releases_to_promotion() {
        let auth = authority();
        let mut rt = M4ArenaRuntime::default();
        rt.scene_open(
            &auth,
            "arena:warm",
            "C5",
            "warm",
            Vec::new(),
            "cpf-warm",
            1_000,
        )
        .expect("scene opens");
        let handle = rt
            .summon(
                &auth,
                &ArenaSummonRequest {
                    scene_key: "arena:warm".to_owned(),
                    entity_coordinate: WORLD_COORD.to_owned(),
                    vama_shakti_class: "egregore".to_owned(),
                    lifecycle_mode_override: Some("warm".to_owned()),
                },
                2_000,
            )
            .expect("summon");
        let closure = rt
            .scene_close(&auth, "arena:warm", None, 3_000)
            .expect("close");
        assert_eq!(closure.released_ephemeral_count, 0);
        assert_eq!(closure.preserved_warm_count, 1);

        // warm identity persists and can be routed to promotion (41.11)
        let release = rt
            .vama_release_warm(
                &auth,
                &handle.identity_handle,
                VamaShaktiReleaseReason::Promote,
                4_000,
            )
            .expect("release to promotion");
        assert!(release.routed_to_promotion);
    }

    #[test]
    fn summon_refuses_non_world_coordinate_dr_vama_3() {
        let auth = authority();
        let mut rt = M4ArenaRuntime::default();
        rt.scene_open(&auth, "arena:x", "C5", "ephemeral", Vec::new(), "cpf", 1)
            .expect("scene opens");
        let err = rt
            .summon(
                &auth,
                &ArenaSummonRequest {
                    scene_key: "arena:x".to_owned(),
                    entity_coordinate: "C5.not-world".to_owned(),
                    vama_shakti_class: "daemon".to_owned(),
                    lifecycle_mode_override: None,
                },
                2,
            )
            .expect_err("non-:World coordinate must refuse");
        assert!(matches!(err, M4ArenaError::NonWorldCoordinate(_)));
    }

    #[test]
    fn summon_refuses_unknown_classifier_dr_vama_6() {
        let auth = authority();
        let mut rt = M4ArenaRuntime::default();
        rt.scene_open(&auth, "arena:x", "C5", "ephemeral", Vec::new(), "cpf", 1)
            .expect("scene opens");
        let err = rt
            .summon(
                &auth,
                &ArenaSummonRequest {
                    scene_key: "arena:x".to_owned(),
                    entity_coordinate: WORLD_COORD.to_owned(),
                    vama_shakti_class: "poltergeist".to_owned(),
                    lifecycle_mode_override: None,
                },
                2,
            )
            .expect_err("unknown classifier must refuse");
        assert!(matches!(err, M4ArenaError::UnknownClassifier(_)));
    }

    #[test]
    fn scene_open_refuses_without_cpf_token() {
        let auth = authority();
        let mut rt = M4ArenaRuntime::default();
        let err = rt
            .scene_open(&auth, "arena:x", "C5", "ephemeral", Vec::new(), "   ", 1)
            .expect_err("empty CPF token must refuse");
        assert_eq!(err, M4ArenaError::MissingCpfToken);
    }

    #[test]
    fn one_substrate_every_route_enforces_khora_session_authority() {
        // Contract surface: every route declares Khora session authority and a
        // CLI parity command, and the method list matches the registration.
        assert_eq!(M4_ARENA_ROUTE_CONTRACTS.len(), 8);
        assert_eq!(M4_ARENA_METHODS.len(), 8);
        for (contract, method) in M4_ARENA_ROUTE_CONTRACTS.iter().zip(M4_ARENA_METHODS) {
            assert_eq!(contract.method, *method);
            assert!(
                contract.khora_session_authority,
                "DR-S5-ONE-1: {} must enforce Khora session authority",
                contract.method
            );
            assert!(
                contract.cli_command.starts_with("epi nara arena"),
                "DR-VAMA-4: {} must have an `epi nara arena` CLI parity command",
                contract.method
            );
        }

        // Runtime surface: every route refuses an unauthorized session.
        let unauth = ArenaSessionAuthority::default();
        let mut rt = M4ArenaRuntime::default();
        let summon = ArenaSummonRequest {
            scene_key: "arena:x".to_owned(),
            entity_coordinate: WORLD_COORD.to_owned(),
            vama_shakti_class: "daemon".to_owned(),
            lifecycle_mode_override: None,
        };
        let turn = ArenaTurnRequest {
            scene_key: "arena:x".to_owned(),
            speaker_handle: "user".to_owned(),
            intent: "x".to_owned(),
            turn_kairos_delta: 0.0,
            cited_coordinates: Vec::new(),
        };
        assert_eq!(
            rt.scene_open(&unauth, "s", "C5", "ephemeral", Vec::new(), "cpf", 1),
            Err(M4ArenaError::Unauthorized)
        );
        assert_eq!(rt.summon(&unauth, &summon, 1), Err(M4ArenaError::Unauthorized));
        assert_eq!(
            rt.turn_advance(&unauth, &turn, 1),
            Err(M4ArenaError::Unauthorized)
        );
        assert_eq!(
            rt.subscribe(&unauth, "s"),
            Err(M4ArenaError::Unauthorized)
        );
        assert_eq!(
            rt.scene_close(&unauth, "s", None, 1),
            Err(M4ArenaError::Unauthorized)
        );
        assert_eq!(
            rt.list(&unauth, &ArenaSceneFilter::default(), 1),
            Err(M4ArenaError::Unauthorized)
        );
        assert_eq!(
            rt.vama_list_warm(&unauth, &WarmVamaShaktiFilter::default()),
            Err(M4ArenaError::Unauthorized)
        );
        assert_eq!(
            rt.vama_release_warm(&unauth, "h", VamaShaktiReleaseReason::Gc, 1),
            Err(M4ArenaError::Unauthorized)
        );
    }
}
