use std::mem::size_of;

#[repr(C)]
#[derive(Clone, Copy, Debug)]
struct ClockBackboneNode {
    degree: u16,
    backbone_index: u8,
    hour_of_day: u8,
    zodiac_sign: u8,
    is_cusp: u8,
    amino_acid_idx: u8,
    is_palindromic: u8,
    _pad: [u8; 4],
}

#[link(name = "epilogos", kind = "static")]
extern "C" {
    static CLOCK_BACKBONE: [ClockBackboneNode; 24];
    fn m3_build_backbone();
}

#[test]
fn clock_backbone_node_contract_is_populated() {
    assert_eq!(size_of::<ClockBackboneNode>(), 12);

    unsafe {
        m3_build_backbone();
        assert_eq!(CLOCK_BACKBONE.len(), 24);

        for (idx, node) in CLOCK_BACKBONE.iter().copied().enumerate() {
            assert_eq!(node.degree, idx as u16);
            assert_eq!(node.backbone_index, idx as u8);
            assert_eq!(node.hour_of_day, idx as u8);
            assert_eq!(node.zodiac_sign, (idx / 2) as u8);
            assert_eq!(node.is_cusp, u8::from(idx % 2 == 0));
            assert_eq!(node.amino_acid_idx, idx as u8);
            assert_eq!(node.is_palindromic, 1);
            assert_eq!(node._pad, [0; 4]);
        }
    }
}

#[test]
fn structural_clock_laws_hold() {
    assert_eq!(60 * 6, 360);
    assert_eq!(64 * 6 - 24, 360);
    assert_eq!(360 + 24, 64 * 6);
    assert_eq!(24 % 12, 0);
    assert_eq!(12 % 4, 0);
    assert_eq!(360 % 24, 0);
}

#[test]
fn trigonometric_clock_checks_hold() {
    let pi = std::f64::consts::PI;

    assert!((pi.sin()).abs() < 1e-12);
    assert!(((pi / 2.0).sin() - 1.0).abs() < 1e-12);
    assert!((0.0_f64.cos() - 1.0).abs() < 1e-12);
    assert!((pi.cos() + 1.0).abs() < 1e-12);
}
