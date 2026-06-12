use portal_core::{MathemeHarmonicProfile, MathemeNodalConstraint};
use serde::Serialize;

#[derive(Clone, Debug, PartialEq, Serialize)]
pub struct DiamondCentreFrame {
    pub particle_emitters: [f32; 8],
    pub satellite_glyphs: [MathemeNodalConstraint; 4],
    pub particle_source: &'static str,
    pub satellite_source: &'static str,
}

pub fn frame_from_profile(profile: &MathemeHarmonicProfile) -> DiamondCentreFrame {
    DiamondCentreFrame {
        particle_emitters: profile.audio_octet,
        satellite_glyphs: profile.nodal_quartet.clone(),
        particle_source: "profile.audio_octet",
        satellite_source: "profile.nodal_quartet",
    }
}
