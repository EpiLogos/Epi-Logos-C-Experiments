use portal_core::{
    transit_quaternion_at_millis, ArenaPresence, PrewarmVamaShaktiRequest, QActivityAccumulator,
    VamaShaktiError, VamaShaktiReleaseReason, WarmVamaShakti, WarmVamaShaktiFilter,
    WarmVamaShaktiRegistry,
};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M4ArenaRuntime {
    pub warm_vama_shaktis: WarmVamaShaktiRegistry,
}

impl M4ArenaRuntime {
    pub fn prewarm_vama_shakti(&mut self, req: PrewarmVamaShaktiRequest) -> WarmVamaShakti {
        self.warm_vama_shaktis.prewarm(req)
    }

    pub fn summon_warm_vama_shakti(
        &mut self,
        scene_key: impl Into<String>,
        identity_handle: &str,
        current_psyche_template_md: &str,
        current_entity_form_md: &str,
        current_psyche_template_revision: [u8; 32],
        now_ms: u64,
    ) -> Result<ArenaPresence, VamaShaktiError> {
        self.warm_vama_shaktis.summon_warm(
            scene_key,
            identity_handle,
            transit_quaternion_at_millis(now_ms),
            current_psyche_template_md,
            current_entity_form_md,
            current_psyche_template_revision,
            now_ms,
        )
    }

    pub fn apply_vama_turn(
        &mut self,
        identity_handle: &str,
        turn_vak_address: &portal_core::VakAddress,
        turn_kairos_delta: f32,
        cited_coordinates: &[portal_core::VakAddress],
        now_ms: u64,
    ) -> Result<[f32; 4], VamaShaktiError> {
        self.warm_vama_shaktis.apply_turn(
            identity_handle,
            turn_vak_address,
            turn_kairos_delta,
            cited_coordinates,
            now_ms,
        )
    }

    pub fn list_warm_vama_shaktis(&self, filter: &WarmVamaShaktiFilter) -> Vec<WarmVamaShakti> {
        self.warm_vama_shaktis.list_warm(filter)
    }

    pub fn release_vama_shakti(
        &mut self,
        identity_handle: &str,
        reason: VamaShaktiReleaseReason,
        now_ms: u64,
    ) -> Result<WarmVamaShakti, VamaShaktiError> {
        self.warm_vama_shaktis
            .release(identity_handle, reason, now_ms)
    }
}

pub fn accumulated_activity_for_presence(presence: &ArenaPresence) -> QActivityAccumulator {
    QActivityAccumulator {
        vama_shakti_class: presence.vama_shakti_class,
        q_activity_accumulator: presence.q_activity_accumulator,
        turn_count: presence.accumulated_turns_observed,
        perturbation_hash: [0u8; 32],
        last_turn_kairos_delta: 0.0,
    }
}
