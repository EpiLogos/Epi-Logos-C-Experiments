pub mod ananda_heatmap;
pub mod cl42_colour;
pub mod diamond_centre;
pub mod dr_streamlines;
pub mod hopf_shadow;
pub mod k2_mesh;
pub mod tick_choreography;

use portal_core::MathemeHarmonicProfile;
use serde::Serialize;

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
pub struct K2Topology {
    pub double_cover_deg: u16,
    pub torus_genus: u8,
    pub boundary: &'static str,
    pub source: &'static str,
}

#[derive(Clone, Debug, PartialEq, Serialize)]
pub struct PlayedTorusRenderFrame {
    pub topology: K2Topology,
    pub mesh: k2_mesh::K2MeshSummary,
    pub ananda_heatmap: ananda_heatmap::AnandaHeatmapCell,
    pub streamlines: dr_streamlines::StreamlineFrame,
    pub colour: cl42_colour::Cl42ColourFrame,
    pub hopf_shadow: hopf_shadow::HopfShadowFrame,
    pub diamond: diamond_centre::DiamondCentreFrame,
    pub tick: tick_choreography::TickChoreographyFrame,
}

pub fn frame_from_profile(profile: &MathemeHarmonicProfile) -> PlayedTorusRenderFrame {
    let topology = substrate_topology();
    PlayedTorusRenderFrame {
        mesh: k2_mesh::build_k2_mesh(&topology, profile),
        ananda_heatmap: ananda_heatmap::active_cell_from_projection(&profile.ananda_vortex),
        streamlines: dr_streamlines::frame_from_projection(&profile.ananda_vortex),
        colour: cl42_colour::frame_from_projection(&profile.ananda_vortex),
        hopf_shadow: hopf_shadow::frame_from_profile(profile),
        diamond: diamond_centre::frame_from_profile(profile),
        tick: tick_choreography::frame_from_profile(profile),
        topology,
    }
}

pub fn substrate_topology() -> K2Topology {
    K2Topology {
        double_cover_deg: parse_define_u16("DOUBLE_COVER_DEG")
            .expect("m1.h must declare DOUBLE_COVER_DEG"),
        torus_genus: parse_define_u16("TORUS_GENUS")
            .expect("m1.h must declare TORUS_GENUS") as u8,
        boundary: "single-k2-only",
        source: "Body/S/S0/epi-lib/include/m1.h",
    }
}

fn parse_define_u16(name: &str) -> Option<u16> {
    m1_header()
        .lines()
        .find_map(|line| parse_define_line(line, name))
}

fn parse_define_line(line: &str, name: &str) -> Option<u16> {
    let trimmed = line.trim();
    let rest = trimmed.strip_prefix("#define")?.trim_start();
    let rest = rest.strip_prefix(name)?.trim_start();
    let token = rest
        .split(|ch: char| ch.is_whitespace() || ch == '/' || ch == '(')
        .next()?
        .trim_end_matches('u')
        .trim_end_matches('U');
    token.parse::<u16>().ok()
}

fn m1_header() -> &'static str {
    include_str!("../../../../../../S/S0/epi-lib/include/m1.h")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_topology_from_substrate_header() {
        let topology = substrate_topology();
        assert_eq!(topology.double_cover_deg, 720);
        assert_eq!(topology.torus_genus, 1);
        assert_eq!(topology.boundary, "single-k2-only");
    }
}
