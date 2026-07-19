// Coordinate: S0 kernel-bridge lens-field capability contract.
// Residency: Body/S/S0/epi-cli/tests.
// Position (#n): #3 process / wire verification.
// Actualises: the `kernelBridge.m3.lensField(lensId)` typed-JSON contract —
//             generic structure + activation for all 16+1 lenses, pleromatic
//             symbolic-system decoration at lens 6, honest-absence activation,
//             layout discipline, and the sealed 16+1 refusal of id 17.
// Public surface: test binary only.
// Does NOT own: the laws (portal-core lens_field/pleroma_lens) or dispatch routing.
// Contract: [[M3'-SPEC]] / 02-16-lenses "Generic Lens-Field Dynamic".

use epi_logos::gate::kernel_bridge_runtime::{
    typed_json_m3_lens_field, KERNEL_BRIDGE_M3_LENS_FIELD,
};
use portal_core::types::PortalClockState;

#[test]
fn lens_field_capability_contract_is_the_gateway_method() {
    assert_eq!(KERNEL_BRIDGE_M3_LENS_FIELD, "kernelBridge.m3.lensField(lensId)");
}

#[test]
fn every_functional_lens_projects_and_id_17_is_refused() {
    let state = PortalClockState::default();
    for lens_id in 0..=16u8 {
        let value = typed_json_m3_lens_field(&state, lens_id, None, 0.05)
            .unwrap_or_else(|e| panic!("lens {lens_id}: {e}"));
        assert_eq!(value["contract"], "kernelBridge.m3.lensField(lensId)");
        assert_eq!(value["lensId"], lens_id);
        let structure = &value["structure"];
        assert_eq!(structure["groundingLensId"], 16);
        let sections = structure["sections"].as_u64().unwrap();
        let slice = structure["slice"].as_u64().unwrap();
        assert_eq!(slice * sections, 360);
        assert_eq!(
            structure["segments"].as_array().unwrap().len() as u64,
            sections
        );
        // Unpositioned kairos: honest absence, never fabrication.
        let activation = &value["activation"];
        assert_eq!(activation["positionedOrbiters"], 0);
        assert!(activation["akashaCondition"].is_null());
        // Symbolic system seats ONLY at the pleromatic lens.
        if lens_id == 6 {
            let symbolic = &value["symbolicSystem"];
            assert_eq!(symbolic["kind"], "pleroma");
            assert_eq!(symbolic["layout"], "interleaved456");
            assert_eq!(symbolic["seats"].as_array().unwrap().len(), 30);
            assert_eq!(symbolic["syzygies"].as_array().unwrap().len(), 15);
        } else {
            assert!(value["symbolicSystem"].is_null(), "lens {lens_id}");
        }
        // The balance quaternion is always present and normalized (identity
        // when the field is empty).
        let q: Vec<f64> = value["balanceQuaternion"]
            .as_array()
            .unwrap()
            .iter()
            .map(|v| v.as_f64().unwrap())
            .collect();
        assert_eq!(q.len(), 4);
        let norm: f64 = q.iter().map(|v| v * v).sum();
        assert!((norm - 1.0).abs() < 1e-5);
    }
    assert!(typed_json_m3_lens_field(&state, 17, None, 0.05).is_err(), "16+1 sealed");
}

#[test]
fn layout_parameter_is_pleroma_only_and_validated() {
    let state = PortalClockState::default();
    let emanation = typed_json_m3_lens_field(&state, 6, Some("emanation"), 0.05).unwrap();
    assert_eq!(emanation["symbolicSystem"]["layout"], "emanation");
    // Sophia ON the seam under emanation; one seat shy under the default.
    let seats = emanation["symbolicSystem"]["seats"].as_array().unwrap();
    assert_eq!(seats[29]["aeon"], "Sophia");
    assert!(
        typed_json_m3_lens_field(&state, 6, Some("bogus"), 0.05).is_err(),
        "unknown layout refused"
    );
    assert!(
        typed_json_m3_lens_field(&state, 9, Some("emanation"), 0.05).is_err(),
        "layout on a non-pleromatic lens refused"
    );
}
