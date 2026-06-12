use portal_core::MathemeHarmonicProfile;
use serde::Serialize;

#[derive(Clone, Debug, PartialEq, Serialize)]
pub struct HopfShadowFrame {
    pub sheet: u8,
    pub opacity: f32,
    pub source: &'static str,
}

pub fn frame_from_profile(profile: &MathemeHarmonicProfile) -> HopfShadowFrame {
    HopfShadowFrame {
        sheet: profile.ananda_vortex.helix_sheet,
        opacity: 0.3,
        source: "profile.ananda_vortex.helix_sheet",
    }
}
