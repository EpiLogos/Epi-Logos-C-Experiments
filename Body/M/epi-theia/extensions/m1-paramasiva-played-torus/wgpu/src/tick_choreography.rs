use portal_core::MathemeHarmonicProfile;
use serde::Serialize;

#[derive(Clone, Debug, PartialEq, Serialize)]
pub struct TickChoreographyFrame {
    pub tick12: u8,
    pub degree720: u16,
    pub orientation_quaternion: [f32; 4],
    pub klein_flip_at_this_tick: bool,
    pub quaternion_source: &'static str,
}

pub fn frame_from_profile(profile: &MathemeHarmonicProfile) -> TickChoreographyFrame {
    TickChoreographyFrame {
        tick12: profile.tick12,
        degree720: profile.degree720,
        orientation_quaternion: profile.ananda_vortex.ring_quaternion,
        klein_flip_at_this_tick: profile.ananda_vortex.klein_flip_at_this_tick,
        quaternion_source: "profile.ananda_vortex.ring_quaternion",
    }
}
