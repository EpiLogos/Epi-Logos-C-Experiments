//! Physical-pole (1-2-3 engine) and mental-pole (4-5-0 intelligence) snapshots.
//!
//! These are typed contracts. The physical-pole render stack
//! (Tauri/Bevy/wgpu) and the mental-pole stack (LLM/EBM/Verifier) consume
//! and produce instances of these shapes; their construction can be
//! partial today and full when the rendering and intelligence rings are
//! implemented.

use serde::{Deserialize, Serialize};

use crate::diagnostic::AnuttaraDiagnostic;

/// 7 chakras plus the below-axis (8th) position per physical-pole spec §3.
pub const CHAKRAL_COUNT: usize = 8;

/// 12 fine-grained MEF lens weights (6 lenses × descent + ascent helix).
pub const LENS_WEIGHT_DIM: usize = 12;

/// 64-cell codon-hexagram clock (4³ = 2⁶ = 64 per physical-pole spec §4).
pub const CODON_CELL_COUNT: u8 = 64;

/// A point on the torus parametrised by (θ poloidal, φ toroidal). Both
/// angles are in radians, expected in `[0, 2π)`.
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub struct TorusPoint {
    pub theta: f32,
    pub phi: f32,
    /// `R/r` aspect ratio; `9/8` encodes the epogdoon, `φ = 1.618…`
    /// encodes the Clifford-symmetric torus.
    pub aspect_ratio: f32,
    pub winding: WindingNumber,
}

impl TorusPoint {
    /// Construct a torus point, wrapping the input angles into `[0, 2π)`
    /// and rejecting non-finite values.
    pub fn new(
        theta: f32,
        phi: f32,
        aspect_ratio: f32,
        winding: WindingNumber,
    ) -> Result<Self, &'static str> {
        if !theta.is_finite() || !phi.is_finite() || !aspect_ratio.is_finite() {
            return Err("torus point angles and aspect ratio must be finite");
        }
        if aspect_ratio <= 0.0 {
            return Err("torus point aspect ratio must be positive");
        }
        Ok(Self {
            theta: wrap_two_pi(theta),
            phi: wrap_two_pi(phi),
            aspect_ratio,
            winding,
        })
    }
}

/// `(p, q)` torus-knot winding numbers. The kernel spec's 2:1 winding
/// (`p = 2`, `q = 1`) is the topological signature of the descent +
/// ascent double-cover.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct WindingNumber {
    pub p: i32,
    pub q: i32,
}

impl WindingNumber {
    pub const DOUBLE_COVER: Self = Self { p: 2, q: 1 };
}

/// Activation of one chakra-planet pair at a tick. `amplitude` is in
/// `[0, 1]`.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ChakralActivation {
    pub index: u8,
    pub chakra: String,
    pub planet: String,
    pub element: String,
    pub frequency_hz: f32,
    pub amplitude: f32,
}

impl ChakralActivation {
    pub fn new(
        index: u8,
        chakra: impl Into<String>,
        planet: impl Into<String>,
        element: impl Into<String>,
        frequency_hz: f32,
        amplitude: f32,
    ) -> Result<Self, &'static str> {
        if usize::from(index) >= CHAKRAL_COUNT {
            return Err("chakra index must be in 0..CHAKRAL_COUNT");
        }
        if !frequency_hz.is_finite() || frequency_hz < 0.0 {
            return Err("chakra frequency must be finite and non-negative");
        }
        if !amplitude.is_finite() || !(0.0..=1.0).contains(&amplitude) {
            return Err("chakra amplitude must be a finite value in [0, 1]");
        }
        Ok(Self {
            index,
            chakra: chakra.into(),
            planet: planet.into(),
            element: element.into(),
            frequency_hz,
            amplitude,
        })
    }
}

/// One cell of the 64-cell codon-clock. The hexagram is six binary lines
/// (true = yang, false = yin) from bottom to top.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct CodonClockCell {
    pub index: u8,
    pub codon: [char; 3],
    pub hexagram_lines: [bool; 6],
    pub amino_acid: char,
}

impl CodonClockCell {
    pub fn new(
        index: u8,
        codon: [char; 3],
        hexagram_lines: [bool; 6],
        amino_acid: char,
    ) -> Result<Self, &'static str> {
        if index >= CODON_CELL_COUNT {
            return Err("codon clock cell index must be in 0..64");
        }
        for base in codon {
            if !matches!(base, 'A' | 'T' | 'G' | 'C' | 'U') {
                return Err("codon base must be one of A, T, G, C, U");
            }
        }
        Ok(Self {
            index,
            codon,
            hexagram_lines,
            amino_acid,
        })
    }
}

/// Physical-pole (1-2-3 engine) snapshot at a tick.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PhysicalPoleState {
    pub torus: TorusPoint,
    pub chakral: Vec<ChakralActivation>,
    pub codon_clock: CodonClockCell,
    /// Optional audio frequency (Hz) currently sounded — primarily for
    /// cymatic-render alignment. Independent of chakral activations,
    /// which carry their own per-position frequency.
    pub audio_frequency_hz: Option<f32>,
}

impl PhysicalPoleState {
    pub fn new(
        torus: TorusPoint,
        chakral: Vec<ChakralActivation>,
        codon_clock: CodonClockCell,
        audio_frequency_hz: Option<f32>,
    ) -> Result<Self, &'static str> {
        if chakral.len() > CHAKRAL_COUNT {
            return Err("chakral activations may not exceed CHAKRAL_COUNT");
        }
        let mut seen = [false; CHAKRAL_COUNT];
        for activation in &chakral {
            let i = usize::from(activation.index);
            if i >= CHAKRAL_COUNT {
                return Err("chakra activation index out of range");
            }
            if seen[i] {
                return Err("duplicate chakra activation index");
            }
            seen[i] = true;
        }
        if let Some(freq) = audio_frequency_hz {
            if !freq.is_finite() || freq < 0.0 {
                return Err("audio frequency must be finite and non-negative");
            }
        }
        Ok(Self {
            torus,
            chakral,
            codon_clock,
            audio_frequency_hz,
        })
    }
}

/// 12-fold lens weights matching the MEF double-cover (6 lenses × 2
/// helices). Each weight is in `[0, 1]` and the sum is in `(0, 1]` to
/// allow partial activation.
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub struct LensWeights12 {
    pub weights: [f32; LENS_WEIGHT_DIM],
}

impl LensWeights12 {
    pub fn new(weights: [f32; LENS_WEIGHT_DIM]) -> Result<Self, &'static str> {
        let mut sum = 0.0f32;
        for w in weights {
            if !w.is_finite() {
                return Err("lens weight must be finite");
            }
            if !(0.0..=1.0).contains(&w) {
                return Err("lens weight must be in [0, 1]");
            }
            sum += w;
        }
        if !(0.0..=1.0 + f32::EPSILON).contains(&sum) {
            return Err("lens weight sum must be in [0, 1]");
        }
        Ok(Self { weights })
    }

    pub fn uniform() -> Self {
        let w = 1.0 / LENS_WEIGHT_DIM as f32;
        Self {
            weights: [w; LENS_WEIGHT_DIM],
        }
    }

    /// Index helper: (lens 0..6, ascent_helix) -> dimension 0..12.
    pub fn index_for(lens: u8, ascent_helix: bool) -> Option<usize> {
        if lens >= 6 {
            return None;
        }
        Some(usize::from(lens) * 2 + if ascent_helix { 1 } else { 0 })
    }
}

/// Surface articulation produced by the LLM-Nara when speaking
/// recognition back into a session.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct NaraArticulation {
    pub text: String,
    /// Optional session key carrying the articulation. Empty when the
    /// articulation is pre-session (e.g., dev praxis).
    pub session_key: Option<String>,
    /// Optional model identifier the LLM was invoked under.
    pub model: Option<String>,
}

/// Outcome from the verifier ring at a tick. `Silence` corresponds to
/// the `○` symbolic response — no questions raised. `Diagnostic` carries
/// the parsed Anuttara symbolic expression.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "kebab-case")]
pub enum VerifierOutcome {
    Silence,
    Diagnostic(AnuttaraDiagnostic),
}

impl VerifierOutcome {
    pub fn is_silence(&self) -> bool {
        matches!(self, Self::Silence)
    }
}

/// Mental-pole (4-5-0 intelligence) snapshot at a tick.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct MentalPoleState {
    pub nara_articulation: Option<NaraArticulation>,
    pub epii_lens_weights: LensWeights12,
    pub anuttara_verifier: VerifierOutcome,
}

impl MentalPoleState {
    pub fn new(
        nara_articulation: Option<NaraArticulation>,
        epii_lens_weights: LensWeights12,
        anuttara_verifier: VerifierOutcome,
    ) -> Self {
        Self {
            nara_articulation,
            epii_lens_weights,
            anuttara_verifier,
        }
    }
}

fn wrap_two_pi(angle: f32) -> f32 {
    let two_pi = std::f32::consts::TAU;
    let wrapped = angle.rem_euclid(two_pi);
    if wrapped < 0.0 {
        wrapped + two_pi
    } else {
        wrapped
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn torus_point_wraps_angles_and_rejects_nonfinite() {
        let p = TorusPoint::new(
            std::f32::consts::TAU + 0.5,
            -0.25,
            9.0 / 8.0,
            WindingNumber::DOUBLE_COVER,
        )
        .expect("valid torus point");
        assert!((p.theta - 0.5).abs() < 1e-5);
        assert!((p.phi - (std::f32::consts::TAU - 0.25)).abs() < 1e-5);

        assert!(TorusPoint::new(f32::NAN, 0.0, 1.0, WindingNumber::DOUBLE_COVER).is_err());
        assert!(TorusPoint::new(0.0, 0.0, 0.0, WindingNumber::DOUBLE_COVER).is_err());
    }

    #[test]
    fn lens_weights_enforce_bounds_and_sum() {
        assert!(LensWeights12::new([0.1; 12]).is_err()); // sum 1.2 > 1
        let uniform = LensWeights12::uniform();
        assert!((uniform.weights.iter().sum::<f32>() - 1.0).abs() < 1e-5);

        let mut weights = [0.0; 12];
        weights[0] = 0.5;
        weights[11] = 0.5;
        LensWeights12::new(weights).expect("valid mirror-pair weighting");

        assert_eq!(LensWeights12::index_for(0, false), Some(0));
        assert_eq!(LensWeights12::index_for(0, true), Some(1));
        assert_eq!(LensWeights12::index_for(5, true), Some(11));
        assert_eq!(LensWeights12::index_for(6, false), None);
    }

    #[test]
    fn chakral_activation_validates_range() {
        ChakralActivation::new(0, "muladhara", "Earth", "Earth", 256.0, 0.8)
            .expect("valid muladhara activation");
        assert!(ChakralActivation::new(8, "x", "y", "z", 1.0, 0.5).is_err());
        assert!(ChakralActivation::new(0, "x", "y", "z", -1.0, 0.5).is_err());
        assert!(ChakralActivation::new(0, "x", "y", "z", 1.0, 1.5).is_err());
    }

    #[test]
    fn physical_pole_rejects_duplicate_chakras() {
        let activation =
            ChakralActivation::new(0, "muladhara", "Earth", "Earth", 256.0, 0.8).unwrap();
        let dup = activation.clone();
        let codon = CodonClockCell::new(0, ['A', 'T', 'G'], [false; 6], 'M').unwrap();
        let torus = TorusPoint::new(0.0, 0.0, 9.0 / 8.0, WindingNumber::DOUBLE_COVER).unwrap();
        assert!(PhysicalPoleState::new(torus, vec![activation, dup], codon, None).is_err());
    }

    #[test]
    fn codon_cell_rejects_invalid_base() {
        assert!(CodonClockCell::new(0, ['A', 'Z', 'G'], [false; 6], 'M').is_err());
        assert!(CodonClockCell::new(64, ['A', 'T', 'G'], [false; 6], 'M').is_err());
    }
}
