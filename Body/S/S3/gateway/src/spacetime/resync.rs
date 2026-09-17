use epi_s3_gateway_contract::SPACETIME_PROJECTION_SOURCE_NATIVE_WS;
use serde::{Deserialize, Serialize};
use serde_json::Value;

// Connection state + resync tracker (was S0; now S3)
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum SpacetimeProjectionConnectionState {
    Connected,
    ConnectionLost,
    Reconnecting,
    StaleProfile,
    ResyncedProfileGeneration,
    DegradedButSubscribable,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SpacetimeProjectionUpdate {
    pub state: SpacetimeProjectionConnectionState,
    pub source: String,
    pub profile_generation: Option<u64>,
    pub stale_profile_generation: Option<u64>,
    pub resynced_profile_generation: Option<u64>,
    pub degraded_but_subscribable: bool,
    pub context: Option<Value>,
}

#[derive(Debug, Clone, Default)]
pub struct SpacetimeProjectionResyncTracker {
    current_generation: Option<u64>,
    stale_generation: Option<u64>,
    reconnecting: bool,
}

impl SpacetimeProjectionResyncTracker {
    pub fn current_generation(&self) -> Option<u64> {
        self.current_generation
    }

    pub fn mark_connection_lost(&mut self) -> SpacetimeProjectionUpdate {
        self.stale_generation = self.current_generation;
        self.reconnecting = false;
        SpacetimeProjectionUpdate {
            state: SpacetimeProjectionConnectionState::ConnectionLost,
            source: SPACETIME_PROJECTION_SOURCE_NATIVE_WS.to_owned(),
            profile_generation: self.current_generation,
            stale_profile_generation: self.stale_generation,
            resynced_profile_generation: None,
            degraded_but_subscribable: false,
            context: None,
        }
    }

    pub fn mark_reconnecting(&mut self) -> SpacetimeProjectionUpdate {
        self.stale_generation = self.stale_generation.or(self.current_generation);
        self.reconnecting = true;
        SpacetimeProjectionUpdate {
            state: SpacetimeProjectionConnectionState::Reconnecting,
            source: SPACETIME_PROJECTION_SOURCE_NATIVE_WS.to_owned(),
            profile_generation: self.current_generation,
            stale_profile_generation: self.stale_generation,
            resynced_profile_generation: None,
            degraded_but_subscribable: false,
            context: None,
        }
    }

    pub fn mark_degraded_but_subscribable(&mut self) -> SpacetimeProjectionUpdate {
        self.stale_generation = self.stale_generation.or(self.current_generation);
        SpacetimeProjectionUpdate {
            state: SpacetimeProjectionConnectionState::DegradedButSubscribable,
            source: SPACETIME_PROJECTION_SOURCE_NATIVE_WS.to_owned(),
            profile_generation: self.current_generation,
            stale_profile_generation: self.stale_generation,
            resynced_profile_generation: None,
            degraded_but_subscribable: true,
            context: None,
        }
    }

    pub fn observe_context(&mut self, context: Value) -> SpacetimeProjectionUpdate {
        let generation = context
            .pointer("/kernel/generation")
            .and_then(Value::as_u64);
        let state = if self.reconnecting {
            if generation.is_some() && generation != self.stale_generation {
                SpacetimeProjectionConnectionState::ResyncedProfileGeneration
            } else {
                SpacetimeProjectionConnectionState::StaleProfile
            }
        } else {
            SpacetimeProjectionConnectionState::Connected
        };
        let resynced_generation = (state
            == SpacetimeProjectionConnectionState::ResyncedProfileGeneration)
            .then_some(generation)
            .flatten();
        let update = SpacetimeProjectionUpdate {
            state,
            source: context
                .pointer("/spacetimedb/projectionSource")
                .and_then(Value::as_str)
                .unwrap_or(SPACETIME_PROJECTION_SOURCE_NATIVE_WS)
                .to_owned(),
            profile_generation: generation,
            stale_profile_generation: self.stale_generation,
            resynced_profile_generation: resynced_generation,
            degraded_but_subscribable: false,
            context: Some(context),
        };
        if update.resynced_profile_generation.is_some()
            || update.state == SpacetimeProjectionConnectionState::Connected
        {
            self.current_generation = generation;
            self.stale_generation = None;
            self.reconnecting = false;
        }
        update
    }
}

// =============================================================================
