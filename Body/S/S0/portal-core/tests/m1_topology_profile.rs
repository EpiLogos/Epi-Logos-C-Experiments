//! Track 02.T2.3 — the M1-5 single-torus topology invariants ride the profile.
//!
//! `MathemeHarmonicProfile::from_tick` must carry a real `m1_topology`
//! projection (doubleCoverDeg=720, torusGenus=1, χ=0, S3->S2 Hopf, unit ring
//! quaternion) plus the live Klein-flip descriptors, and it must serialize
//! under the `m1Topology` key that the carrier's `topologyFromPayload` reads.
//! This kills the orphan `M1TopologyProjection` (defined + fixture-tested but
//! never produced by real code) — the exact hollow-artifact pattern cycle 3
//! died of.

use portal_core::{kernel_tick_from_epogdoon, MathemeHarmonicProfile};
use serde_json::Value;

#[test]
fn profile_carries_m1_topology_invariants() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 6));
    let topo = &profile.m1_topology;
    assert_eq!(topo.double_cover_deg, 720, "K² double-cover is 720°");
    assert_eq!(topo.torus_genus, 1, "single K² torus is genus 1");
    assert_eq!(topo.euler_characteristic, 0, "χ(T²) = 2 - 2·genus = 0");
    assert_eq!(topo.hopf_identity, "S3 -> S2 Hopf fibration");
    assert_eq!(topo.parent_attribution, "M1-5 is the +1 parent");

    // The ring quaternion is real (codon-charge) and sits on S3 (unit length).
    let mag2: f32 = topo.ring_quaternion.iter().map(|c| c * c).sum();
    assert!(
        (mag2 - 1.0).abs() < 1e-4,
        "ring quaternion off S3: |q|^2={mag2}"
    );
    // element_count is the per-ring-position topological count, never a magic const.
    assert!(
        topo.element_count >= 1,
        "element_count derives from the ring LUT"
    );
}

#[test]
fn profile_m1_topology_klein_flip_descriptors_track_the_event() {
    // tick 6 = the M1 tritone crossing: m1-origin Klein flip present.
    let crossing = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 6));
    assert!(
        crossing.klein_flip.is_some(),
        "tick 6 fires a klein_flip event"
    );
    assert!(
        crossing.m1_topology.k2_tritone_crossing.contains("tritone"),
        "k2 descriptor names the crossing: {}",
        crossing.m1_topology.k2_tritone_crossing
    );
    assert!(
        crossing
            .m1_topology
            .m1_origin_klein_flip
            .contains("present"),
        "m1-origin flip present at the crossing: {}",
        crossing.m1_topology.m1_origin_klein_flip
    );

    // tick 2 = quiescent: no m1-origin flip.
    let day = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 2));
    assert!(day.klein_flip.is_none(), "tick 2 is quiescent");
    assert!(
        day.m1_topology.m1_origin_klein_flip.contains("None"),
        "no m1-origin flip on a quiescent tick: {}",
        day.m1_topology.m1_origin_klein_flip
    );
}

#[test]
fn profile_serializes_m1_topology_under_the_carrier_key() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 6));
    let wire = serde_json::to_value(&profile).expect("profile serializes");
    let topo = &wire["m1Topology"];
    assert_eq!(topo["doubleCoverDeg"], Value::from(720));
    assert_eq!(topo["torusGenus"], Value::from(1));
    assert!(
        topo["hopfIdentity"].is_string(),
        "carrier reads hopfIdentity"
    );
    assert!(
        topo["k2TritoneCrossing"].is_string(),
        "carrier's topologyFromPayload reads k2TritoneCrossing"
    );
    assert!(
        topo["m1OriginKleinFlip"].is_string(),
        "carrier's topologyFromPayload reads m1OriginKleinFlip"
    );

    // Survives the wire round-trip alongside the rest of the profile.
    let decoded: MathemeHarmonicProfile =
        serde_json::from_str(&serde_json::to_string(&profile).expect("serializes"))
            .expect("profile round-trips");
    assert_eq!(decoded.m1_topology.double_cover_deg, 720);
}
