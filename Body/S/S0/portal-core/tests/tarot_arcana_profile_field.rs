//! 24.T24.6 — WC-M3-SA-2: the two tarot ids on the Mahamaya profile field.
//!
//! The M3' tarot wheel renders 22 major arcana + 56 minor arcana. Both decks are
//! kernel law (`m3.c M3_MAJOR_ARCANA` / `M3_TAROT_CODON_MAP`), so the renderer
//! may not hold a deck table — it reads `mahamaya.tarotMajorArcanaCardId` and
//! `mahamaya.tarotMinorId` off the bus. Before this tranche the projection
//! stubbed BOTH to `None`, which read to every consumer as "no producer landed"
//! when in fact the producers had been landed for two tranches and nothing wired
//! them.
//!
//! What this file pins:
//!   1. C↔Rust parity — `major_arcana` mirrors `m3_major_arcana_from_codon`
//!      (m3.c) across all 64 codons, `None` exactly where the C util answers
//!      `0xFF` (STOP codons).
//!   2. The 56-card exact cover — `minor_arcana_id_from_codon` is injective over
//!      exactly 56 of the 64 codons, covering card ids 0..=55 with no gaps
//!      ([[M3'-SPEC]] §8.7, `56 + 8`).
//!   3. The bus actually carries both, agreeing with the same tick's `codonId`,
//!      under the camelCase wire keys the carrier reads.

use epi_lib as _;
use portal_core::m3_transcription_bridge::{major_arcana, minor_arcana, minor_arcana_id_from_codon};
use portal_core::{kernel_tick_from_epogdoon, MathemeHarmonicProfile};

extern "C" {
    /// m3.c — the kernel authority for codon → Major Arcana. Returns `0xFF` for
    /// STOP codons and for any amino-acid index with no arcana assignment.
    fn m3_major_arcana_from_codon(codon: u8) -> u8;
}

/// The C util's "no card" sentinel. The Rust mirror expresses it as `None`.
const NO_ARCANA: u8 = 0xFF;

#[test]
fn major_arcana_mirrors_the_c_kernel_for_every_codon() {
    let mut carried = 0usize;
    let mut refused = 0usize;
    for codon in 0u8..64 {
        let kernel = unsafe { m3_major_arcana_from_codon(codon) };
        let mirrored = major_arcana(codon).map(|card| card.card_id);
        match mirrored {
            Some(card_id) => {
                assert_eq!(
                    kernel, card_id,
                    "codon {codon:#04x}: kernel says card {kernel}, mirror says {card_id}"
                );
                assert!(card_id < 22, "card id {card_id} is outside the 22-card major");
                carried += 1;
            }
            None => {
                assert_eq!(
                    kernel, NO_ARCANA,
                    "codon {codon:#04x}: mirror refused but the kernel returned card {kernel}"
                );
                refused += 1;
            }
        }
    }
    assert_eq!(carried + refused, 64);
    // The three STOP codons (0x10 / 0x13 / 0x1C) are the only refusals — the
    // honest-pending state the wheel renders for an active STOP codon.
    assert_eq!(refused, 3, "only the three STOP codons carry no arcana");
}

#[test]
fn minor_arcana_ids_are_the_fifty_six_card_exact_cover() {
    let mut seen = vec![false; 56];
    let mut covered = 0usize;
    for codon in 0u8..64 {
        let Some(card_id) = minor_arcana_id_from_codon(codon) else {
            continue;
        };
        assert!(card_id < 56, "card id {card_id} is outside the 56-card minor");
        assert!(
            !seen[card_id as usize],
            "card {card_id} claimed by two primary codons"
        );
        seen[card_id as usize] = true;
        covered += 1;
    }
    assert_eq!(covered, 56, "56 of the 64 codons are card primaries");
    assert!(seen.iter().all(|hit| *hit), "every card 0..=55 has a primary codon");
}

/// The wheel's outer ring is four arcs of fourteen. Which arc a bussed card id
/// falls in is substrate law, not a renderer choice — this pins the ordering the
/// carrier's `M3TarotWheel` decomposition (`suit = id / 14`, `rank = id % 14`)
/// is written against, so a substrate re-ordering breaks HERE rather than
/// silently re-labelling every minor card in the UI.
#[test]
fn the_fifty_six_card_ring_is_four_arcs_of_fourteen_in_suit_order() {
    const SUIT_HEADS: [(u8, &str); 4] = [
        (0, "Cups"),
        (14, "Wands"),
        (28, "Pentacles"),
        (42, "Swords"),
    ];
    for (head, suit) in SUIT_HEADS {
        for offset in 0u8..14 {
            let card = minor_arcana(head + offset).expect("card id is inside the 56-card deck");
            assert_eq!(
                card.suit, suit,
                "card {} belongs to {suit}, not {}",
                head + offset,
                card.suit
            );
        }
    }
    assert_eq!(minor_arcana(0).unwrap().rank, "Ace");
    assert_eq!(minor_arcana(13).unwrap().rank, minor_arcana(55).unwrap().rank);
    assert!(minor_arcana(56).is_none(), "the deck stops at 56 cards");
}

#[test]
fn the_profile_bus_carries_both_tarot_ids_for_the_tick_codon() {
    let mut ticks_with_minor = 0usize;
    let mut ticks_with_major = 0usize;
    for cycle in 0u64..6 {
        for tick12 in 0u8..12 {
            let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(cycle, tick12));
            let codon_id = profile.mahamaya.codon_id;

            assert_eq!(
                profile.mahamaya.tarot_minor_id,
                minor_arcana_id_from_codon(codon_id),
                "cycle {cycle} tick {tick12}: minor id disagrees with the codon's card"
            );
            assert_eq!(
                profile.mahamaya.tarot_major_arcana_card_id,
                major_arcana(codon_id).map(|card| card.card_id),
                "cycle {cycle} tick {tick12}: major id disagrees with the codon's arcana"
            );
            // `binary` and `mahamaya` are declared compatibility aliases of the
            // same projection (IOD-04); a divergence here would silently split
            // the M3 lane in two.
            assert_eq!(profile.binary.tarot_minor_id, profile.mahamaya.tarot_minor_id);
            assert_eq!(
                profile.binary.tarot_major_arcana_card_id,
                profile.mahamaya.tarot_major_arcana_card_id
            );

            ticks_with_minor += usize::from(profile.mahamaya.tarot_minor_id.is_some());
            ticks_with_major += usize::from(profile.mahamaya.tarot_major_arcana_card_id.is_some());
        }
    }
    // A stub would have produced zero of each across 72 ticks. This is the
    // assertion that would have caught the `None` wiring gap.
    assert!(ticks_with_minor > 0, "no tick carried a minor-arcana id");
    assert!(ticks_with_major > 0, "no tick carried a major-arcana id");
}

#[test]
fn the_wire_keys_are_the_camel_case_names_the_carrier_reads() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(0, 0));
    let wire = serde_json::to_value(&profile).expect("profile serialises");
    let mahamaya = wire
        .get("mahamaya")
        .and_then(|value| value.as_object())
        .expect("profile carries a mahamaya object");
    assert!(
        mahamaya.contains_key("tarotMajorArcanaCardId"),
        "WC-M3-SA-2 wire key missing: {:?}",
        mahamaya.keys().collect::<Vec<_>>()
    );
    assert!(mahamaya.contains_key("tarotMinorId"));
}
