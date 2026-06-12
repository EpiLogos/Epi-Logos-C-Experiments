use portal_core::AnandaVortexProjection;
use serde::Serialize;

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
pub struct Cl42ColourFrame {
    pub signature: i8,
    pub halo: &'static str,
    pub source: &'static str,
}

pub fn frame_from_projection(projection: &AnandaVortexProjection) -> Cl42ColourFrame {
    Cl42ColourFrame {
        signature: projection.cl42_signature_at_position,
        halo: if projection.cl42_signature_at_position < 0 {
            "implicate"
        } else {
            "explicate"
        },
        source: "profile.ananda_vortex.cl42_signature_at_position",
    }
}
