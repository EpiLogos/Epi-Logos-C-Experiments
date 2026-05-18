use std::path::{Component, Path, PathBuf};
use std::sync::{Arc, Mutex};

use crate::portal::clock_state::{new_shared_clock_state, PortalClockState, SharedClockState};
use crate::sesh::session::{read_session_state, repo_root_from_env};

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum PortalTemporalSource {
    SessionState,
    GatewayContext,
    ClockOnly,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PortalTemporalSurface {
    pub source: PortalTemporalSource,
    pub coordinate_owner: String,
    pub agent_access_owner: String,
    pub vault_root: Option<PathBuf>,
    pub day_id: Option<String>,
    pub session_id: Option<String>,
    pub now_path: Option<PathBuf>,
    pub now_wikilink: Option<String>,
    pub canonical_session_key: Option<String>,
    pub active_agent_id: Option<String>,
    pub resource_loader_id: Option<String>,
    pub runtime_cwd: Option<PathBuf>,
    pub source_session_key: Option<String>,
    pub source_session_kind: Option<String>,
    pub graphiti_session_arc_id: Option<String>,
    pub kairos_valid: bool,
    pub kairos_fresh: bool,
    pub kairos_source: String,
    pub redis_hydrated: bool,
    pub redis_session_now_key: Option<String>,
    pub spacetimedb_projection_source: Option<String>,
    pub spacetimedb_projection_table: Option<String>,
    pub spacetimedb_kairos_projection_table: Option<String>,
    pub spacetimedb_global_projection_table: Option<String>,
    pub pratibimba_anchor_id: Option<String>,
    pub pratibimba_coordinate: String,
    pub kernel_generation: u64,
    pub kernel_sub_tick: u8,
    pub kernel_phase: String,
    pub kernel_element: String,
    pub kernel_harmonic_ratio: String,
    pub kernel_total_energy: String,
    pub generation: u64,
}

impl PortalTemporalSurface {
    pub fn from_clock_and_session(clock: &PortalClockState) -> Self {
        let session = read_session_state(&repo_root_from_env()).ok();
        let now_path = session.as_ref().map(|state| state.context.now_path.clone());
        let inferred = now_path.as_deref().and_then(infer_now_identity);
        let vault_root = inferred
            .as_ref()
            .map(|identity| identity.vault_root.clone());
        let day_id = session
            .as_ref()
            .map(|state| state.context.day_id.clone())
            .or_else(|| inferred.as_ref().map(|identity| identity.day_id.clone()));
        let session_id = session
            .as_ref()
            .map(|state| state.context.session_id.clone())
            .or_else(|| {
                inferred
                    .as_ref()
                    .map(|identity| identity.session_id.clone())
            });
        let now_wikilink = match (&vault_root, &now_path, &session_id) {
            (Some(root), Some(path), Some(session_id)) => {
                Some(now_wikilink(root, path, session_id))
            }
            _ => None,
        };

        let pratibimba = crate::gate::temporal::pratibimba_surface_value();
        let pratibimba_anchor_id = pratibimba
            .pointer("/anchorId")
            .and_then(serde_json::Value::as_str)
            .map(ToOwned::to_owned);

        Self {
            source: if session.is_some() {
                PortalTemporalSource::SessionState
            } else {
                PortalTemporalSource::ClockOnly
            },
            coordinate_owner: "S3'".to_string(),
            agent_access_owner: "S4/S5".to_string(),
            vault_root,
            day_id,
            session_id,
            now_path,
            now_wikilink,
            canonical_session_key: None,
            active_agent_id: None,
            resource_loader_id: None,
            runtime_cwd: None,
            source_session_key: None,
            source_session_kind: None,
            graphiti_session_arc_id: None,
            kairos_valid: clock.kairos.valid,
            kairos_fresh: crate::nara::kairos::is_current_fresh(),
            kairos_source: "nara.kairos.current".to_string(),
            redis_hydrated: false,
            redis_session_now_key: None,
            spacetimedb_projection_source: None,
            spacetimedb_projection_table: None,
            spacetimedb_kairos_projection_table: None,
            spacetimedb_global_projection_table: None,
            pratibimba_anchor_id,
            pratibimba_coordinate: "M4.4.4.4".to_string(),
            kernel_generation: clock.generation,
            kernel_sub_tick: clock.kernel_projection.tick.sub_tick,
            kernel_phase: format!("{:?}", clock.kernel_projection.tick.phase),
            kernel_element: format!("{:?}", clock.kernel_projection.tick.element),
            kernel_harmonic_ratio: format!("{:.6}", clock.kernel_projection.tick.harmonic_ratio),
            kernel_total_energy: format!("{:.6}", clock.kernel_projection.energy.total_energy),
            generation: clock.generation,
        }
    }

    pub fn from_gateway_context(value: &serde_json::Value) -> Result<Self, String> {
        let now_path = value
            .pointer("/now/path")
            .and_then(serde_json::Value::as_str)
            .filter(|path| !path.is_empty())
            .map(PathBuf::from);
        let inferred = now_path.as_deref().and_then(infer_now_identity);
        let vault_root = inferred
            .as_ref()
            .map(|identity| identity.vault_root.clone());
        let session_id = value
            .pointer("/session/sessionId")
            .and_then(serde_json::Value::as_str)
            .map(ToOwned::to_owned)
            .or_else(|| {
                inferred
                    .as_ref()
                    .map(|identity| identity.session_id.clone())
            });
        let day_id = value
            .pointer("/day/dayId")
            .and_then(serde_json::Value::as_str)
            .map(ToOwned::to_owned)
            .or_else(|| inferred.as_ref().map(|identity| identity.day_id.clone()));
        let now_wikilink = value
            .pointer("/now/wikilink")
            .and_then(serde_json::Value::as_str)
            .map(ToOwned::to_owned)
            .or_else(|| match (&vault_root, &now_path, &session_id) {
                (Some(root), Some(path), Some(session_id)) => {
                    Some(now_wikilink(root, path, session_id))
                }
                _ => None,
            });

        Ok(Self {
            source: PortalTemporalSource::GatewayContext,
            coordinate_owner: value
                .pointer("/coordinateOwner")
                .and_then(serde_json::Value::as_str)
                .unwrap_or("S3'")
                .to_string(),
            agent_access_owner: value
                .pointer("/agentAccessOwner")
                .and_then(serde_json::Value::as_str)
                .unwrap_or("S4/S5")
                .to_string(),
            vault_root,
            day_id,
            session_id,
            now_path,
            now_wikilink,
            canonical_session_key: value
                .pointer("/session/canonicalKey")
                .and_then(serde_json::Value::as_str)
                .map(ToOwned::to_owned),
            active_agent_id: value
                .pointer("/session/activeAgentId")
                .and_then(serde_json::Value::as_str)
                .map(ToOwned::to_owned),
            resource_loader_id: value
                .pointer("/session/resourceLoaderId")
                .and_then(serde_json::Value::as_str)
                .map(ToOwned::to_owned),
            runtime_cwd: value
                .pointer("/session/runtimeCwd")
                .and_then(serde_json::Value::as_str)
                .filter(|path| !path.is_empty())
                .map(PathBuf::from),
            source_session_key: value
                .pointer("/session/sourceSessionKey")
                .and_then(serde_json::Value::as_str)
                .map(ToOwned::to_owned),
            source_session_kind: value
                .pointer("/session/sourceSessionKind")
                .and_then(serde_json::Value::as_str)
                .map(ToOwned::to_owned),
            graphiti_session_arc_id: value
                .pointer("/graphiti/sessionArcId")
                .and_then(serde_json::Value::as_str)
                .map(ToOwned::to_owned),
            kairos_valid: value
                .pointer("/kairos/available")
                .and_then(serde_json::Value::as_bool)
                .unwrap_or(false),
            kairos_fresh: value
                .pointer("/kairos/fresh")
                .and_then(serde_json::Value::as_bool)
                .unwrap_or(false),
            kairos_source: value
                .pointer("/kairos/source")
                .and_then(serde_json::Value::as_str)
                .unwrap_or("nara.kairos.current")
                .to_string(),
            redis_hydrated: value
                .pointer("/redis/hydrated")
                .and_then(serde_json::Value::as_bool)
                .unwrap_or(false),
            redis_session_now_key: value
                .pointer("/redis/sessionNowKey")
                .and_then(serde_json::Value::as_str)
                .map(ToOwned::to_owned),
            spacetimedb_projection_source: value
                .pointer("/spacetimedb/projectionSource")
                .and_then(serde_json::Value::as_str)
                .map(ToOwned::to_owned),
            spacetimedb_projection_table: value
                .pointer("/spacetimedb/projectionTable")
                .and_then(serde_json::Value::as_str)
                .map(ToOwned::to_owned),
            spacetimedb_kairos_projection_table: value
                .pointer("/spacetimedb/kairosProjectionTable")
                .and_then(serde_json::Value::as_str)
                .map(ToOwned::to_owned),
            spacetimedb_global_projection_table: value
                .pointer("/spacetimedb/globalProjectionTable")
                .or_else(|| value.pointer("/globalTemporal/projectionTable"))
                .and_then(serde_json::Value::as_str)
                .map(ToOwned::to_owned),
            pratibimba_anchor_id: value
                .pointer("/pratibimba/anchorId")
                .and_then(serde_json::Value::as_str)
                .map(ToOwned::to_owned),
            pratibimba_coordinate: value
                .pointer("/pratibimba/coordinate")
                .and_then(serde_json::Value::as_str)
                .unwrap_or("M4.4.4.4")
                .to_string(),
            kernel_generation: value
                .pointer("/kernel/generation")
                .and_then(serde_json::Value::as_u64)
                .unwrap_or(0),
            kernel_sub_tick: value
                .pointer("/kernel/tick/subTick")
                .and_then(serde_json::Value::as_u64)
                .map(|v| v.min(11) as u8)
                .unwrap_or(0),
            kernel_phase: gateway_value_string(value.pointer("/kernel/tick/phase"), "Descent"),
            kernel_element: gateway_value_string(
                value.pointer("/kernel/tick/element"),
                "BimbaEncoding",
            ),
            kernel_harmonic_ratio: gateway_value_string(
                value.pointer("/kernel/tick/harmonicRatio"),
                "1.000000",
            ),
            kernel_total_energy: gateway_value_string(
                value.pointer("/kernel/energy/totalEnergy"),
                "0.000000",
            ),
            generation: 0,
        })
    }
}

fn gateway_value_string(value: Option<&serde_json::Value>, fallback: &str) -> String {
    match value {
        Some(serde_json::Value::String(value)) if !value.is_empty() => value.clone(),
        Some(serde_json::Value::Number(value)) => value
            .as_f64()
            .map(|number| format!("{number:.6}"))
            .unwrap_or_else(|| fallback.to_string()),
        _ => fallback.to_string(),
    }
}

pub type SharedPortalTemporalSurface = Arc<Mutex<PortalTemporalSurface>>;

#[derive(Clone)]
pub struct PortalRuntimeState {
    clock: SharedClockState,
    temporal: SharedPortalTemporalSurface,
}

impl PortalRuntimeState {
    pub fn new() -> Self {
        let clock = new_shared_clock_state();
        let temporal = {
            let snapshot = clock.lock().unwrap();
            Arc::new(Mutex::new(PortalTemporalSurface::from_clock_and_session(
                &snapshot,
            )))
        };
        Self { clock, temporal }
    }

    pub fn from_gateway_context_value(value: serde_json::Value) -> Result<Self, String> {
        let clock = new_shared_clock_state();
        let temporal = Arc::new(Mutex::new(PortalTemporalSurface::from_gateway_context(
            &value,
        )?));
        Ok(Self { clock, temporal })
    }

    pub fn clock(&self) -> SharedClockState {
        self.clock.clone()
    }

    pub fn temporal(&self) -> SharedPortalTemporalSurface {
        self.temporal.clone()
    }

    pub fn refresh_temporal_from_clock(&self) {
        let surface = {
            let snapshot = self.clock.lock().unwrap();
            PortalTemporalSurface::from_clock_and_session(&snapshot)
        };
        *self.temporal.lock().unwrap() = surface;
    }

    pub fn refresh_from_session_store_context(
        &self,
        state_root: &Path,
        session_key: &str,
        agent_id: &str,
    ) -> Result<bool, String> {
        let store = crate::gate::sessions::SessionStore::new(state_root)?;
        let value =
            crate::gate::temporal::context_value(state_root, &store, session_key, agent_id)?;
        self.refresh_from_gateway_context_value(&value)
    }

    pub fn refresh_from_gateway_context_value(
        &self,
        value: &serde_json::Value,
    ) -> Result<bool, String> {
        let surface = PortalTemporalSurface::from_gateway_context(value)?;
        *self.temporal.lock().unwrap() = surface;
        Ok(true)
    }

    pub fn refresh_from_default_gateway_context(&self) -> Result<bool, String> {
        let state_root = dirs::home_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join(".epi")
            .join("gate");
        self.refresh_from_session_store_context(&state_root, "agent:main:main", "epii")
    }

    pub fn refresh_from_spacetimedb_projection(
        &self,
        registration: &crate::gate::spacetimedb_bridge::SpacetimeRegistration,
        session_key: &str,
        agent_id: &str,
    ) -> Result<bool, String> {
        let Some(value) = registration.projection_temporal_context(session_key, agent_id)? else {
            return Ok(false);
        };
        self.refresh_from_gateway_context_value(&value)
    }
}

#[derive(Debug)]
struct NowIdentity {
    vault_root: PathBuf,
    day_id: String,
    session_id: String,
}

fn infer_now_identity(path: &Path) -> Option<NowIdentity> {
    let parts = path
        .components()
        .filter_map(|component| match component {
            Component::Normal(part) => part.to_str().map(str::to_string),
            Component::RootDir => Some("/".to_string()),
            _ => None,
        })
        .collect::<Vec<_>>();
    let empty_idx = parts.iter().position(|part| part == "Empty")?;
    if parts.get(empty_idx + 1).map(String::as_str) != Some("Present") {
        return None;
    }
    let day_id = parts.get(empty_idx + 2)?.clone();
    let session_id = parts.get(empty_idx + 3)?.clone();
    let mut root = PathBuf::new();
    for part in &parts[..empty_idx] {
        root.push(part);
    }
    Some(NowIdentity {
        vault_root: root,
        day_id,
        session_id,
    })
}

fn now_wikilink(vault_root: &Path, now_path: &Path, session_id: &str) -> String {
    let relative = now_path
        .strip_prefix(vault_root)
        .unwrap_or(now_path)
        .with_extension("");
    format!(
        "[[{}|NOW {}]]",
        relative.display().to_string().replace('\\', "/"),
        session_id
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::portal::clock_state::PortalClockState;

    #[test]
    fn temporal_surface_can_feed_clock_and_nara_epii_from_one_projection() {
        let mut clock = PortalClockState::default();
        clock.kairos.valid = true;
        clock.generation = 7;
        clock.tick12 = 7;
        crate::portal::clock_state::sync_kernel_projection(&mut clock);

        let surface = PortalTemporalSurface::from_clock_and_session(&clock);

        assert_eq!(surface.coordinate_owner, "S3'");
        assert_eq!(surface.agent_access_owner, "S4/S5");
        assert_eq!(surface.kairos_source, "nara.kairos.current");
        assert_eq!(surface.pratibimba_coordinate, "M4.4.4.4");
        assert!(surface.kairos_valid);
        assert_eq!(surface.kernel_generation, 7);
        assert_eq!(surface.kernel_sub_tick, 7);
        assert_eq!(surface.kernel_phase, "Ascent");
        assert_eq!(surface.kernel_element, "InverseMobius");
        assert_eq!(surface.kernel_harmonic_ratio, "0.750000");
        assert_eq!(surface.generation, 7);
    }

    #[test]
    fn temporal_surface_hydrates_from_gateway_context_payload() {
        let payload = serde_json::json!({
            "coordinateOwner": "S3'",
            "agentAccessOwner": "S4/S5",
            "day": { "dayId": "07-05-2026" },
            "now": {
                "path": "/vault/Empty/Present/07-05-2026/session-main/now.md",
                "wikilink": "[[Empty/Present/07-05-2026/session-main/now|NOW session-main]]"
            },
            "session": { "sessionId": "session-main" },
            "kairos": {
                "available": true,
                "fresh": true,
                "source": "nara.kairos.current"
            },
            "redis": {
                "hydrated": true,
                "sessionNowKey": "s3:gateway:temporal:session:session-main:now:md"
            },
            "spacetimedb": {
                "projectionTable": "session_surface",
                "kairosProjectionTable": "kairos_surface"
            },
            "pratibimba": {
                "anchorId": "pratibimba-abcd1234",
                "coordinate": "M4.4.4.4"
            },
            "kernel": {
                "generation": 11,
                "tick": {
                    "subTick": 4,
                    "phase": "Descent",
                    "element": "SlashFlip",
                    "harmonicRatio": 1.125
                },
                "energy": {
                    "totalEnergy": 0.375
                }
            }
        });

        let surface = PortalTemporalSurface::from_gateway_context(&payload)
            .expect("gateway temporal context should hydrate portal surface");

        assert_eq!(surface.source, PortalTemporalSource::GatewayContext);
        assert_eq!(surface.day_id.as_deref(), Some("07-05-2026"));
        assert_eq!(surface.session_id.as_deref(), Some("session-main"));
        assert_eq!(
            surface.redis_session_now_key.as_deref(),
            Some("s3:gateway:temporal:session:session-main:now:md")
        );
        assert!(surface.redis_hydrated);
        assert_eq!(
            surface.spacetimedb_projection_table.as_deref(),
            Some("session_surface")
        );
        assert_eq!(
            surface.spacetimedb_kairos_projection_table.as_deref(),
            Some("kairos_surface")
        );
        assert_eq!(
            surface.pratibimba_anchor_id.as_deref(),
            Some("pratibimba-abcd1234")
        );
        assert_eq!(surface.kernel_generation, 11);
        assert_eq!(surface.kernel_sub_tick, 4);
        assert_eq!(surface.kernel_element, "SlashFlip");
        assert_eq!(surface.kernel_harmonic_ratio, "1.125000");
        assert_eq!(surface.kernel_total_energy, "0.375000");
    }

    #[test]
    fn runtime_refreshes_temporal_surface_from_session_store_context() {
        let root = std::env::temp_dir().join(format!(
            "epi-portal-runtime-session-store-{}",
            std::process::id()
        ));
        let _ = std::fs::remove_dir_all(&root);
        let vault = root.join("vault");
        let now_path = vault
            .join("Empty")
            .join("Present")
            .join("07-05-2026")
            .join("session-main")
            .join("now.md");
        std::fs::create_dir_all(now_path.parent().unwrap()).unwrap();
        std::fs::write(&now_path, "# NOW\n\n[[Kairos]] context.\n").unwrap();

        let store_root = root.join("gate");
        let store = crate::gate::sessions::SessionStore::new(&store_root).unwrap();
        let record = store.create("agent:main:main").unwrap();
        store
            .patch(
                &record.canonical_key,
                crate::gate::session_store::SessionPatch {
                    vault_now_path: Some(Some(now_path.display().to_string())),
                    active_agent_id: Some("epii".to_string()),
                    ..Default::default()
                },
            )
            .unwrap();

        let runtime = PortalRuntimeState::new();
        let refreshed = runtime
            .refresh_from_session_store_context(&store_root, "agent:main:main", "epii")
            .expect("session-store temporal refresh should work");

        let temporal = runtime.temporal();
        let temporal = temporal.lock().unwrap();
        assert!(refreshed);
        assert_eq!(temporal.source, PortalTemporalSource::GatewayContext);
        assert_eq!(temporal.day_id.as_deref(), Some("07-05-2026"));
        assert_eq!(temporal.session_id.as_deref(), Some("session-main"));
        assert_eq!(
            temporal.redis_session_now_key.as_deref(),
            Some("s3:gateway:temporal:session:session-main:now:md")
        );
    }

    #[test]
    fn runtime_surface_carries_agent_access_and_memory_context_from_gateway_session() {
        let root = std::env::temp_dir().join(format!(
            "epi-portal-runtime-agent-access-{}",
            std::process::id()
        ));
        let _ = std::fs::remove_dir_all(&root);
        let vault = root.join("vault");
        let now_path = vault
            .join("Empty")
            .join("Present")
            .join("08-05-2026")
            .join("20260508-101500-fork01")
            .join("now.md");
        std::fs::create_dir_all(now_path.parent().unwrap()).unwrap();
        std::fs::write(&now_path, "# NOW\n\n[[Graphiti]] session memory.\n").unwrap();

        let store_root = root.join("gate");
        let store = crate::gate::sessions::SessionStore::new(&store_root).unwrap();
        let record = store.create("agent:anima:fork:one").unwrap();
        store
            .patch(
                &record.canonical_key,
                crate::gate::session_store::SessionPatch {
                    session_id: Some("20260508-101500-fork01".to_owned()),
                    day_id: Some(Some("08-05-2026".to_owned())),
                    vault_now_path: Some(Some(now_path.display().to_string())),
                    runtime_cwd: Some(Some(root.join("repo").display().to_string())),
                    resource_loader_id: Some(Some("loader://anima/plugin-runtime".to_owned())),
                    active_agent_id: Some("anima".to_string()),
                    source_session_key: Some(Some("agent:anima:new:one".to_owned())),
                    source_session_kind: Some(Some("fork".to_owned())),
                    ..Default::default()
                },
            )
            .unwrap();

        let runtime = PortalRuntimeState::new();
        runtime
            .refresh_from_session_store_context(&store_root, "agent:anima:fork:one", "epii")
            .expect("session-store temporal refresh should work");

        let temporal = runtime.temporal();
        let temporal = temporal.lock().unwrap();
        assert_eq!(
            temporal.canonical_session_key.as_deref(),
            Some("agent:anima:fork:one")
        );
        assert_eq!(temporal.active_agent_id.as_deref(), Some("anima"));
        assert_eq!(
            temporal.resource_loader_id.as_deref(),
            Some("loader://anima/plugin-runtime")
        );
        assert_eq!(
            temporal.graphiti_session_arc_id.as_deref(),
            Some("day:08-05-2026:session:20260508-101500-fork01")
        );
        assert_eq!(
            temporal.source_session_key.as_deref(),
            Some("agent:anima:new:one")
        );
        assert_eq!(temporal.source_session_kind.as_deref(), Some("fork"));
    }

    #[test]
    fn runtime_refreshes_temporal_surface_from_spacetimedb_projection_context() {
        let payload = serde_json::json!({
            "day": { "dayId": "07-05-2026" },
            "now": { "wikilink": "[[NOW session-main]]" },
            "session": { "sessionId": "session-main" },
            "kairos": { "available": true, "fresh": true, "source": "nara.kairos.current" },
            "pratibimba": { "anchorId": "pratibimba-abcd1234", "coordinate": "M4.4.4.4" },
            "redis": { "hydrated": true, "sessionNowKey": "s3:gateway:temporal:session:session-main:now:md" },
            "spacetimedb": {
                "projectionSource": "http-sql-poll",
                "projectionTable": "session_surface",
                "kairosProjectionTable": "kairos_surface"
            }
        });
        let runtime = PortalRuntimeState::from_gateway_context_value(payload).unwrap();
        let temporal = runtime.temporal();
        let temporal = temporal.lock().unwrap();

        assert_eq!(temporal.source, PortalTemporalSource::GatewayContext);
        assert_eq!(
            temporal.spacetimedb_projection_source.as_deref(),
            Some("http-sql-poll")
        );
        assert_eq!(
            temporal.spacetimedb_projection_table.as_deref(),
            Some("session_surface")
        );
    }
}
