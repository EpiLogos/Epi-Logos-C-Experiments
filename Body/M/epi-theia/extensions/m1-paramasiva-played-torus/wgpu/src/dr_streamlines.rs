use portal_core::{AnandaVortexProjection, DrRingPhase};
use serde::Serialize;

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
pub struct StreamlineFrame {
    pub phase: DrRingPhase,
    pub source: &'static str,
}

pub fn frame_from_projection(projection: &AnandaVortexProjection) -> StreamlineFrame {
    StreamlineFrame {
        phase: projection.dr_ring_phase,
        source: "profile.ananda_vortex.dr_ring_phase",
    }
}
