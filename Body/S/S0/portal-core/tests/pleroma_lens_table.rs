// Coordinate: M3' pleromatic lens laws (Lens 6) — canon v1 proof suite.
// Residency: Body/S/S0/portal-core/tests.
// Position (#n): #3 pattern / verification.
// Actualises: §4 ground-inheritance laws + §2 fixed-seat layouts of
//             `pleroma-30-syzygy-lens6-integration.md`.
// Public surface: test binary only.
// Does NOT own: the table (src/pleroma_lens.rs) or the division row (phase_space.rs).
// Contract: [[M3'-SPEC]] / pleroma canon v1 (2026-07-19).

use portal_core::kernel::projections::phase_space::CLOCK_LENSES_16;
use portal_core::pleroma_lens::{
    aeon_at_segment, diameter_digit_sum, diameter_for_syzygy, segment_element,
    segment_for_aeon, segment_ground_dyad, syzygy_at_diameter, PleromaArc, PleromaElement,
    PleromaLayout, INTERLEAVED_456_DIAMETER_BY_SYZYGY, PLEROMA_AEONS, PLEROMA_AEON_COUNT,
    PLEROMA_LENS_ID, PLEROMA_SYZYGY_COUNT, PLEROMA_THRESHOLD_DIAMETERS,
};

#[test]
fn lens_6_is_the_pleromatic_division_row() {
    let lens = &CLOCK_LENSES_16[PLEROMA_LENS_ID as usize];
    assert_eq!(lens.slice, 12);
    assert_eq!(lens.sections, 30);
    assert_eq!(lens.name, "Pleromatic");
    assert!(!lens.temporal_canon, "pleromatic lens is analytic, not temporal canon");
}

#[test]
fn thirty_aeons_in_fifteen_syzygies_with_456_arc_quotas() {
    assert_eq!(PLEROMA_AEONS.len(), PLEROMA_AEON_COUNT);
    // Emanation indices 1..=30 in order; names unique.
    for (i, a) in PLEROMA_AEONS.iter().enumerate() {
        assert_eq!(a.emanation_index as usize, i + 1);
        assert_eq!(a.syzygy as usize, i / 2);
        assert_eq!(a.prior, i % 2 == 0);
    }
    let mut names: Vec<&str> = PLEROMA_AEONS.iter().map(|a| a.name).collect();
    names.sort_unstable();
    names.dedup();
    assert_eq!(names.len(), PLEROMA_AEON_COUNT, "aeon names are unique");
    // Every syzygy has exactly one prior and one consort of the same arc.
    for s in 0..PLEROMA_SYZYGY_COUNT as u8 {
        let members: Vec<_> = PLEROMA_AEONS.iter().filter(|a| a.syzygy == s).collect();
        assert_eq!(members.len(), 2);
        assert_ne!(members[0].prior, members[1].prior);
        assert_eq!(members[0].arc, members[1].arc);
    }
    // Arc quotas 4/5/6 — quaternary, pentad, QL-hexad; LCM(4,5,6) = 60 = ground period.
    let quota = |arc: PleromaArc| {
        (0..PLEROMA_SYZYGY_COUNT as u8)
            .filter(|&s| PLEROMA_AEONS[(s as usize) * 2].arc == arc)
            .count() as u8
    };
    assert_eq!(quota(PleromaArc::Ogdoad), 4);
    assert_eq!(quota(PleromaArc::Decad), 5);
    assert_eq!(quota(PleromaArc::Dodecad), 6);
    assert_eq!(lcm(lcm(4, 5), 6), 60, "arc generators synchronize at the ground period");
}

#[test]
fn default_layout_partitions_the_fifteen_diameters() {
    // The seat table is a permutation of 0..15.
    let mut seats = INTERLEAVED_456_DIAMETER_BY_SYZYGY.to_vec();
    seats.sort_unstable();
    assert_eq!(seats, (0..15).collect::<Vec<u8>>());
    // Arc seat-sets per canon §2a.
    let seats_of = |arc: PleromaArc| -> Vec<u8> {
        let mut v: Vec<u8> = (0..PLEROMA_SYZYGY_COUNT as u8)
            .filter(|&s| PLEROMA_AEONS[(s as usize) * 2].arc == arc)
            .map(|s| diameter_for_syzygy(PleromaLayout::Interleaved456, s))
            .collect();
        v.sort_unstable();
        v
    };
    assert_eq!(seats_of(PleromaArc::Ogdoad), vec![0, 4, 7, 12]);
    assert_eq!(seats_of(PleromaArc::Decad), vec![2, 5, 8, 11, 14]);
    assert_eq!(seats_of(PleromaArc::Dodecad), vec![1, 3, 6, 9, 10, 13]);
    // Pentagram law: the five Decad diameters are exactly 36° apart (Δd = 3).
    let decad = seats_of(PleromaArc::Decad);
    for w in decad.windows(2) {
        assert_eq!(w[1] - w[0], 3, "Decad pentagram: consecutive diameters 3 apart (36°)");
    }
    // Round trip: syzygy_at_diameter inverts diameter_for_syzygy.
    for s in 0..PLEROMA_SYZYGY_COUNT as u8 {
        let d = diameter_for_syzygy(PleromaLayout::Interleaved456, s);
        assert_eq!(syzygy_at_diameter(PleromaLayout::Interleaved456, d), s);
    }
}

#[test]
fn threshold_diameters_carry_the_cardinal_zeros_and_belong_to_the_ogdoad() {
    for &d in &PLEROMA_THRESHOLD_DIAMETERS {
        let a = segment_ground_dyad(d);
        let b = segment_ground_dyad(d + 15);
        let digits: Vec<u8> = a.digits.iter().chain(b.digits.iter()).copied().collect();
        assert_eq!(
            digits.iter().filter(|&&x| x == 0).count(),
            2,
            "threshold diameter {d} touches exactly two Pisano cardinal zeros"
        );
        let syzygy = syzygy_at_diameter(PleromaLayout::Interleaved456, d);
        assert_eq!(
            PLEROMA_AEONS[(syzygy as usize) * 2].arc,
            PleromaArc::Ogdoad,
            "both threshold syzygies sit in the root arc"
        );
    }
    // The cardinal zeros are ground positions 0/15/30/45 (degrees 0/90/180/270).
    assert_eq!(segment_ground_dyad(0).positions, [0, 1]);
    assert_eq!(segment_ground_dyad(7).positions, [14, 15]);
    assert_eq!(segment_ground_dyad(15).positions, [30, 31]);
    assert_eq!(segment_ground_dyad(22).positions, [44, 45]);
}

#[test]
fn syzygy_digit_sums_inherit_the_ten_complement_law() {
    // 20 per diameter except the two threshold diameters (10 each); total 280.
    let mut total = 0u16;
    for d in 0..15u8 {
        let sum = diameter_digit_sum(d);
        if PLEROMA_THRESHOLD_DIAMETERS.contains(&d) {
            assert_eq!(sum, 10, "threshold diameter {d}");
        } else {
            assert_eq!(sum, 20, "regular diameter {d}");
        }
        total += sum;
    }
    assert_eq!(total, 280, "full Pisano digit sum decomposes over the 15 syzygies");
}

#[test]
fn every_syzygy_pairs_cross_complementary_elements() {
    // Fire↔Air (yang) or Earth↔Water (yin) — the Matrix-2 diagonal reading.
    let mut yang_pairs = 0;
    let mut yin_pairs = 0;
    for d in 0..15u8 {
        let e1 = segment_element(d);
        let e2 = segment_element(d + 15);
        assert_eq!(e2, e1.cross_complement(), "diameter {d} element complement");
        match e1 {
            PleromaElement::Fire | PleromaElement::Air => yang_pairs += 1,
            PleromaElement::Earth | PleromaElement::Water => yin_pairs += 1,
        }
    }
    assert_eq!((yang_pairs, yin_pairs), (6, 9), "observed 6/9 chiasm");
    // Spot checks against Ring-1 (cosmic-clock §2.2): midpoints 6°=Aries/Fire,
    // 90°=Cancer/Water, 270°=Capricorn/Earth, 354°=Pisces/Water.
    assert_eq!(segment_element(0), PleromaElement::Fire);
    assert_eq!(segment_element(7), PleromaElement::Water);
    assert_eq!(segment_element(22), PleromaElement::Earth);
    assert_eq!(segment_element(29), PleromaElement::Water);
}

#[test]
fn default_layout_anchor_seats_hold() {
    let l = PleromaLayout::Interleaved456;
    // Bythos–Sige on the equinoctial threshold axis.
    assert_eq!(aeon_at_segment(l, 0).name, "Bythos");
    assert_eq!(aeon_at_segment(l, 15).name, "Sige");
    // Logos–Zoe on the solstitial threshold axis.
    assert_eq!(aeon_at_segment(l, 7).name, "Logos");
    assert_eq!(aeon_at_segment(l, 22).name, "Zoe");
    // Nous–Aletheia at d=4; Anthropos–Ecclesia at d=12.
    assert_eq!(aeon_at_segment(l, 4).name, "Nous");
    assert_eq!(aeon_at_segment(l, 19).name, "Aletheia");
    assert_eq!(aeon_at_segment(l, 12).name, "Anthropos");
    assert_eq!(aeon_at_segment(l, 27).name, "Ecclesia");
    // Sophia one seat before the return seam; Monogenes–Macaria hold the seam.
    assert_eq!(aeon_at_segment(l, 28).name, "Sophia");
    assert_eq!(aeon_at_segment(l, 13).name, "Theletos");
    assert_eq!(aeon_at_segment(l, 14).name, "Monogenes");
    assert_eq!(aeon_at_segment(l, 29).name, "Macaria");
    // Strand law round trip: every aeon's seat maps back to the same aeon.
    for a in &PLEROMA_AEONS {
        let seat = segment_for_aeon(l, a.emanation_index);
        assert_eq!(aeon_at_segment(l, seat).emanation_index, a.emanation_index);
        assert_eq!(a.prior, seat < 15, "prior on Strand A, consort on Strand B");
    }
}

#[test]
fn emanation_layout_is_contiguous_with_sophia_on_the_seam() {
    let l = PleromaLayout::Emanation;
    for s in 0..PLEROMA_SYZYGY_COUNT as u8 {
        assert_eq!(diameter_for_syzygy(l, s), s, "emanation layout is the identity");
    }
    assert_eq!(aeon_at_segment(l, 0).name, "Bythos");
    assert_eq!(aeon_at_segment(l, 29).name, "Sophia", "Sophia ON the return seam");
    // Contiguous arc blocks: Ogdoad d0..=3, Decad d4..=8, Dodecad d9..=14.
    for d in 0..15u8 {
        let arc = PLEROMA_AEONS[(syzygy_at_diameter(l, d) as usize) * 2].arc;
        let expected = match d {
            0..=3 => PleromaArc::Ogdoad,
            4..=8 => PleromaArc::Decad,
            _ => PleromaArc::Dodecad,
        };
        assert_eq!(arc, expected);
    }
}

#[test]
fn lens_six_is_the_half_ground() {
    // 12° = two 6° ground steps: segment k holds Pisano positions {2k, 2k+1};
    // 30 segments × 2 = the 60-period, pairwise without remainder.
    for k in 0..30u8 {
        let dyad = segment_ground_dyad(k);
        assert_eq!(dyad.positions, [2 * k, 2 * k + 1]);
    }
}

fn lcm(a: u64, b: u64) -> u64 {
    a / gcd(a, b) * b
}

fn gcd(a: u64, b: u64) -> u64 {
    if b == 0 {
        a
    } else {
        gcd(b, a % b)
    }
}
