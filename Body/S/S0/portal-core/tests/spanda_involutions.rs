//! Coordinate: S0/#1 (M1-3 Spanda — the two involutions, index-arithmetic half)
//! Actualises: [[02-m1-paramasiva-reconciliation]] T2.11 "Two distinct
//! involutions" (decided 2026-07-06) — the 12-ring carries TWO order-2
//! operations: `spanda_invert(n) = 11−n` (reflection, traversal-reversal, the
//! `1/0` return-switch) and the half-turn `n ↦ n+6 (mod 12)` (antiphase
//! pole-swap). They are NOT the same map; their composite is `n ↦ 5−n
//! (mod 12)`; the four maps {id, half-turn, reflection, composite} close as a
//! Klein four-group inside the ring's dihedral symmetry.
//! Does NOT own: the continuous-field half of the law (pole-swap audible only
//! in superposition) — that is the expected-red `spanda_two_involutions_distinct`
//! in kernel_truth.rs, owned by Track 02.

use portal_core::spanda::spanda_invert;

/// The half-turn (antiphase pole-swap) — spec arithmetic, independent of the
/// implementation under test.
fn half_turn(n: u8) -> u8 {
    (n + 6) % 12
}

/// The composite `5−n (mod 12)` — spec arithmetic.
fn composite(n: u8) -> u8 {
    (5 + 12 - (n % 12)) % 12
}

#[test]
fn spanda_invert_is_the_reflection_with_involution_and_complement_laws() {
    for n in 0u8..12 {
        // The reflection law: #(n) = 11 − n.
        assert_eq!(spanda_invert(n), 11 - n, "spanda_invert({n}) != 11−{n}");
        // Involution: #(#(n)) = n.
        assert_eq!(
            spanda_invert(spanda_invert(n)),
            n,
            "reflection not order-2 at {n}"
        );
        // Complement: n + #(n) = 11.
        assert_eq!(n + spanda_invert(n), 11, "complement law broken at {n}");
    }
}

#[test]
fn reflection_and_half_turn_are_distinct_order_two_maps() {
    let mut differs_somewhere = false;
    for n in 0u8..12 {
        // Half-turn is order 2.
        assert_eq!(half_turn(half_turn(n)), n, "half-turn not order-2 at {n}");
        if spanda_invert(n) != half_turn(n) {
            differs_somewhere = true;
        }
    }
    assert!(
        differs_somewhere,
        "reflection (11−n) and half-turn (n+6) must be distinct as maps"
    );
    // Sharper: they agree on NO even count that would collapse them — count
    // fixed coincidence points. 11−n == n+6 (mod 12) ⇔ 2n ≡ 5 (mod 12),
    // which has no solution (5 is odd): the two involutions NEVER coincide.
    for n in 0u8..12 {
        assert_ne!(
            spanda_invert(n),
            half_turn(n),
            "involutions coincide at {n} — 2n≡5 (mod 12) should be unsolvable"
        );
    }
}

#[test]
fn reflection_and_half_turn_compose_to_5_minus_n_closing_the_klein_four_group() {
    for n in 0u8..12 {
        // Composite in both orders (the group is abelian on these elements).
        assert_eq!(
            spanda_invert(half_turn(n)) % 12,
            composite(n),
            "reflection∘half-turn != 5−n at {n}"
        );
        assert_eq!(
            half_turn(spanda_invert(n)),
            composite(n),
            "half-turn∘reflection != 5−n at {n}"
        );
        // Composite is itself order 2 — the fourth Klein element.
        assert_eq!(composite(composite(n)), n, "composite not order-2 at {n}");
    }
    // Klein four-group closure: every pairwise product of {s, r, sr} lands
    // back in {id, s, r, sr}. With s=half-turn, r=reflection, sr=composite:
    // s·r = sr (asserted above), s·sr = r, r·sr = s.
    for n in 0u8..12 {
        assert_eq!(
            half_turn(composite(n)),
            spanda_invert(n),
            "s·sr != r at {n}"
        );
        assert_eq!(
            spanda_invert(composite(n)) % 12,
            half_turn(n),
            "r·sr != s at {n}"
        );
    }
}
