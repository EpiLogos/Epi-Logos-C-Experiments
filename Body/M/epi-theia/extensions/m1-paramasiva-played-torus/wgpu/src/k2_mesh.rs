use portal_core::MathemeHarmonicProfile;
use serde::Serialize;

use crate::K2Topology;

#[derive(Clone, Debug, PartialEq, Serialize)]
pub struct K2MeshSummary {
    pub meridians: u16,
    pub parallels: u16,
    pub vertex_count: u32,
    pub index_count: u32,
    pub degree720: u16,
    pub genus: u8,
}

pub fn build_k2_mesh(topology: &K2Topology, profile: &MathemeHarmonicProfile) -> K2MeshSummary {
    let meridians = 72;
    let parallels = 24;
    K2MeshSummary {
        meridians,
        parallels,
        vertex_count: meridians as u32 * parallels as u32,
        index_count: meridians as u32 * parallels as u32 * 6,
        degree720: topology.double_cover_deg,
        genus: topology.torus_genus,
    }
    .with_profile_degree(profile.degree720)
}

impl K2MeshSummary {
    fn with_profile_degree(mut self, degree720: u16) -> Self {
        self.degree720 = self.degree720.max(degree720);
        self
    }
}
