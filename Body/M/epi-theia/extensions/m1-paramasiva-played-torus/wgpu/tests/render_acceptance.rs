use std::{fs, path::Path};

use m1_paramasiva_played_torus_wgpu::{
    ananda_heatmap::{active_cell_from_projection, perspex_stack_from_projection},
    frame_from_profile, substrate_topology,
};
use portal_core::{
    kernel_tick_from_epogdoon, AnandaMatrixOp, AnandaVortexCell, AnandaVortexProjection,
    DrRingPhase, MathemeHarmonicProfile,
};

#[test]
fn render_frame_asserts_single_k2_topology_from_substrate() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(2, 7));
    let frame = frame_from_profile(&profile);

    assert_eq!(frame.topology.double_cover_deg, 720);
    assert_eq!(frame.topology.torus_genus, 1);
    assert_eq!(frame.topology.source, "Body/S/S0/epi-lib/include/m1.h");
    assert_eq!(frame.topology.boundary, "single-k2-only");
    assert_eq!(frame.mesh.genus, 1);
    assert_eq!(frame.tick.orientation_quaternion, profile.ananda_vortex.ring_quaternion);
}

#[test]
fn vimarsha_windows_are_profile_consumed_not_recomputed() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(3, 8));
    let frame = frame_from_profile(&profile);

    assert_eq!(frame.diamond.particle_emitters, profile.audio_octet);
    assert_eq!(frame.diamond.satellite_glyphs, profile.nodal_quartet);
    assert_eq!(frame.diamond.particle_emitters.len(), 8);
    assert_eq!(frame.diamond.satellite_glyphs.len(), 4);
    assert_eq!(frame.diamond.particle_source, "profile.audio_octet");
    assert_eq!(frame.diamond.satellite_source, "profile.nodal_quartet");
}

#[test]
fn ananda_source_fidelity_uses_active_cell_value_for_named_raw_and_digit_cells() {
    let seven_x_plus_one = AnandaVortexProjection {
        active_matrix_op: AnandaMatrixOp::Pratibimba,
        active_cell: (7, 9),
        active_cell_value: AnandaVortexCell::from_address(AnandaMatrixOp::Pratibimba, 7, 9),
        dr_ring_phase: DrRingPhase {
            mahamaya_idx: 2,
            parashakti_idx: 6,
        },
        cl42_signature_at_position: 1,
        ring_quaternion: [0.0, 1.0, 0.0, 0.0],
        helix_sheet: 1,
        klein_flip_at_this_tick: false,
    };
    let seven_cell = active_cell_from_projection(&seven_x_plus_one);
    assert_eq!(seven_cell.source, "profile.ananda_vortex.active_cell_value");
    assert_eq!(seven_cell.value.raw_value, Some(64));
    assert_eq!(seven_cell.value.dr_value, Some(1));

    let eight_x_plus_zero = AnandaVortexProjection {
        active_matrix_op: AnandaMatrixOp::Bimba,
        active_cell: (8, 9),
        active_cell_value: AnandaVortexCell::from_address(AnandaMatrixOp::Bimba, 8, 9),
        dr_ring_phase: DrRingPhase {
            mahamaya_idx: 8,
            parashakti_idx: 9,
        },
        cl42_signature_at_position: -1,
        ring_quaternion: [0.0, -1.0, 0.0, 0.0],
        helix_sheet: 1,
        klein_flip_at_this_tick: false,
    };
    let eight_cell = active_cell_from_projection(&eight_x_plus_zero);
    assert_eq!(eight_cell.source, "profile.ananda_vortex.active_cell_value");
    assert_eq!(eight_cell.value.raw_value, Some(72));
    assert_eq!(eight_cell.value.dr_value, Some(9));
}

#[test]
fn boundary_audit_finds_no_downstream_torus_primitive_in_extension_sources() {
    let combined = source_tree("src");
    assert!(!combined.contains("T2_Mahamaya"));
    assert!(!combined.contains("double_torus"));
    assert!(!combined.contains("T2_Mahamāyā"));
    assert!(!combined.contains("m3_torus_outer"));
}

#[test]
fn substrate_derivation_audit_finds_no_local_table_forks() {
    let combined = source_tree("src");
    assert!(!combined.contains("RING_QUATERNION_LUT ="));
    assert!(!combined.contains("CL42_BASIS ="));
    assert!(!combined.contains("DR_RING_"));
}

#[test]
fn topology_parser_reads_header_values() {
    let topology = substrate_topology();
    assert_eq!(topology.double_cover_deg, 720);
    assert_eq!(topology.torus_genus, 1);
}

#[test]
fn perspex_stack_renders_all_six_families_with_active_foregrounded() {
    // The 15.8 headline: the six canonical Ananda matrix families are rendered
    // as one perspex cross-fade, keyed off active_matrix_op, ordered by the
    // canonical Ananda_Matrix_Op enum (Bimba..Quintessence), never re-derived.
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(2, 7));
    let stack = perspex_stack_from_projection(&profile.ananda_vortex);

    assert_eq!(stack.source, "profile.ananda_vortex.active_matrix_op");
    assert_eq!(stack.active_matrix_op, profile.ananda_vortex.active_matrix_op);

    let order: Vec<AnandaMatrixOp> = stack.layers.iter().map(|layer| layer.op).collect();
    assert_eq!(
        order,
        vec![
            AnandaMatrixOp::Bimba,
            AnandaMatrixOp::Pratibimba,
            AnandaMatrixOp::Sum,
            AnandaMatrixOp::DiffA,
            AnandaMatrixOp::DiffB,
            AnandaMatrixOp::Quintessence,
        ]
    );

    // Exactly one active layer, opaque at 100%; every other layer is present
    // (non-zero glass), so all six families stay legible at once.
    let active: Vec<&_> = stack.layers.iter().filter(|layer| layer.is_active).collect();
    assert_eq!(active.len(), 1);
    assert_eq!(active[0].op, stack.active_matrix_op);
    assert_eq!(active[0].opacity, 1.0);
    for layer in &stack.layers {
        assert!(layer.opacity > 0.0, "every family stays in the perspex stack");
    }
}

#[test]
fn perspex_layer_signature_marks_implicate_boundaries() {
    // Family signature mirrors the substrate ANANDA_FAMILY_SIGNATURE[6]
    // {-1,+1,+1,+1,+1,-1}: Bimba and Quintessence are the implicate boundaries.
    let projection = AnandaVortexProjection {
        active_matrix_op: AnandaMatrixOp::Sum,
        active_cell: (2, 2),
        active_cell_value: AnandaVortexCell::from_address(AnandaMatrixOp::Sum, 2, 2),
        dr_ring_phase: DrRingPhase {
            mahamaya_idx: 4,
            parashakti_idx: 9,
        },
        cl42_signature_at_position: 1,
        ring_quaternion: [0.5, 0.8660254, 0.0, 0.0],
        helix_sheet: 0,
        klein_flip_at_this_tick: false,
    };
    let stack = perspex_stack_from_projection(&projection);
    let signatures: Vec<i8> = stack.layers.iter().map(|layer| layer.signature).collect();
    assert_eq!(signatures, vec![-1, 1, 1, 1, 1, -1]);

    // Sum is active (ring index 2); its neighbours Pratibimba(1) and DiffA(3)
    // cross-fade at the ~20% predecessor/successor opacity.
    assert_eq!(stack.layers[2].opacity, 1.0);
    assert_eq!(stack.layers[1].opacity, 0.2);
    assert_eq!(stack.layers[3].opacity, 0.2);
}

fn source_tree(root: &str) -> String {
    let manifest_dir = env!("CARGO_MANIFEST_DIR");
    let root = Path::new(manifest_dir).join(root);
    collect_sources(&root)
}

fn collect_sources(path: &Path) -> String {
    let mut out = String::new();
    if path.is_file() {
        out.push_str(&fs::read_to_string(path).expect("source file should be readable"));
        return out;
    }
    for entry in fs::read_dir(path).expect("source directory should be readable") {
        let entry = entry.expect("source entry should be readable");
        let path = entry.path();
        if path.is_dir() {
            out.push_str(&collect_sources(&path));
        } else if path.extension().is_some_and(|extension| extension == "rs") {
            out.push_str(&collect_sources(&path));
        }
    }
    out
}
