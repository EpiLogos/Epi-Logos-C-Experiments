//! Coordinate: S0/#2 (M2 cymatic χ-solver — kernel reference implementation)
//! Actualises: hardening ledger §5 C3 — "χ-solver exists only as renderer
//! GLSL; no tested kernel reference impl, so octet-drives/quartet-constrains
//! can't be checked vs the bus" — closed here against REAL bus values.
//! Spec ([[M2-ARCHITECTURE]] §5.3.1):
//!   χ(x,y) = Σ_{i=0..7} a_i·sin(m_i·π·x/L)·sin(n_i·π·y/L)
//!                     + b_i·cos(m_i·π·x/L)·cos(n_i·π·y/L)
//! with a_i, b_i amplitude-derived from audio_octet[i] and (m_i, n_i) from
//! nodal_quartet[i % 4]. The reference below is independent spec arithmetic;
//! the system under test is the PROFILE BUS (audio_octet + nodal_quartet as
//! written by Vimarśa through from_tick) driving it.
//! Does NOT own: the carrier's shader (tested app-side in cymaticField.test.ts
//! with the pinned FNV hash) or pitch truth (M2-1' Vimarśa writes the bus).

use portal_core::{kernel_tick_from_epogdoon, MathemeHarmonicProfile};

const L: f64 = 1.0;

/// Reference χ per the spec formula — plate geometry, unit scale.
fn chi(audio_octet: &[f32; 8], modes: &[(u8, u8); 4], x: f64, y: f64) -> f64 {
    let max_hz = audio_octet.iter().cloned().fold(f32::EPSILON, f32::max) as f64;
    (0..8)
        .map(|i| {
            let amplitude = audio_octet[i] as f64 / max_hz;
            let (m, n) = modes[i % 4];
            let (m, n) = (m as f64, n as f64);
            // Spec: per-channel amplitude/phase split across the sin·sin and
            // cos·cos terms — the bimba four drive a_i, the pratibimba four b_i.
            let (a, b) = if i < 4 {
                (amplitude, 0.0)
            } else {
                (0.0, amplitude)
            };
            a * (m * std::f64::consts::PI * x / L).sin() * (n * std::f64::consts::PI * y / L).sin()
                + b * (m * std::f64::consts::PI * x / L).cos()
                    * (n * std::f64::consts::PI * y / L).cos()
        })
        .sum()
}

fn bus_at(cycle: u64, sub_tick: u8) -> ([f32; 8], [(u8, u8); 4]) {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(cycle, sub_tick));
    let mut modes = [(0u8, 0u8); 4];
    for (slot, constraint) in profile.nodal_quartet.iter().enumerate() {
        modes[slot] = (constraint.m, constraint.n);
    }
    (profile.audio_octet, modes)
}

#[test]
fn octet_drives_the_field_and_zero_octet_is_stillness() {
    let (octet, modes) = bus_at(7, 3);
    // A live bus must produce a live field somewhere off the node lines.
    let live = chi(&octet, &modes, 0.31, 0.47);
    assert!(live.is_finite());
    let field_energy: f64 = (1..10)
        .flat_map(|i| (1..10).map(move |j| (i, j)))
        .map(|(i, j)| chi(&octet, &modes, i as f64 / 10.0, j as f64 / 10.0).abs())
        .sum();
    assert!(
        field_energy > 0.0,
        "a live audio bus must drive a nonzero field"
    );

    // Octet-drives: silencing the bus stills the field everywhere.
    let silent = [0.0f32; 8];
    for i in 0..10 {
        for j in 0..10 {
            let value = chi(&silent, &modes, i as f64 / 10.0, j as f64 / 10.0);
            assert_eq!(value, 0.0, "zero octet must yield stillness at ({i},{j})");
        }
    }

    // Octet-drives, channel-resolved: perturbing ONE live carrier moves χ.
    let mut perturbed = octet;
    perturbed[2] *= 2.0;
    let mut moved = false;
    for i in 1..10 {
        for j in 1..10 {
            let (x, y) = (i as f64 / 10.0, j as f64 / 10.0);
            if (chi(&perturbed, &modes, x, y) - chi(&octet, &modes, x, y)).abs() > 1e-9 {
                moved = true;
            }
        }
    }
    assert!(moved, "perturbing a live octet channel must move the field");
}

#[test]
fn quartet_constrains_the_nodal_structure() {
    let (octet, modes) = bus_at(7, 3);
    // The sin·sin terms vanish on the plate boundary x=0 — only the cos·cos
    // (pratibimba) terms survive there: the quartet's (m,n) still shape them.
    let boundary = chi(&octet, &modes, 0.0, 0.37);
    assert!(boundary.is_finite());

    // Quartet-constrains: changing one boundary constraint's mode numbers
    // relocates the nodal structure (the field differs somewhere).
    let mut altered = modes;
    altered[1] = (altered[1].0 % 12 + 1, altered[1].1);
    let mut moved = false;
    for i in 1..10 {
        for j in 1..10 {
            let (x, y) = (i as f64 / 10.0, j as f64 / 10.0);
            if (chi(&octet, &altered, x, y) - chi(&octet, &modes, x, y)).abs() > 1e-9 {
                moved = true;
            }
        }
    }
    assert!(
        moved,
        "changing a nodal constraint must relocate the standing wave"
    );

    // Node-line law: for the pure a-term of channel 0 with modes (m,n), the
    // sin factor vanishes at x = k/m — assert the k=1 node of the first
    // bimba channel by isolating it (all other channels silenced).
    let mut solo = [0.0f32; 8];
    solo[0] = octet[0].max(1.0);
    let (m0, _n0) = modes[0];
    if m0 > 0 {
        let node_x = 1.0 / m0 as f64;
        let value = chi(&solo, &modes, node_x, 0.61);
        assert!(
            value.abs() < 1e-9,
            "solo bimba channel must vanish on its sin node line x=1/m (got {value})"
        );
    }
}

#[test]
fn chi_is_deterministic_under_the_same_bus() {
    // Determinism idiom: the same call twice (allowed self-equal CALL).
    let (octet_a, modes_a) = bus_at(11, 9);
    let (octet_b, modes_b) = bus_at(11, 9);
    assert_eq!(
        octet_a, octet_b,
        "the bus itself must be deterministic per tick"
    );
    assert_eq!(modes_a, modes_b);
    for i in 0..8 {
        for j in 0..8 {
            let (x, y) = (i as f64 / 8.0, j as f64 / 8.0);
            assert_eq!(
                chi(&octet_a, &modes_a, x, y).to_bits(),
                chi(&octet_b, &modes_b, x, y).to_bits(),
                "χ must be bit-identical under an identical bus"
            );
        }
    }
    // Distinct ticks drive distinct fields (the bus actually modulates χ).
    let (octet_c, modes_c) = bus_at(11, 4);
    let mut differs = false;
    for i in 1..8 {
        for j in 1..8 {
            let (x, y) = (i as f64 / 8.0, j as f64 / 8.0);
            if (chi(&octet_a, &modes_a, x, y) - chi(&octet_c, &modes_c, x, y)).abs() > 1e-9 {
                differs = true;
            }
        }
    }
    assert!(differs, "different ticks must sound different fields");
}
