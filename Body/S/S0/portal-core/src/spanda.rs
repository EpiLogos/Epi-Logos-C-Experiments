/// Apply the # inversion operator to a Spanda substage index.
/// Base-pair rule: #(n) = 11 - n  (Watson-Crick complement in 12-fold index space).
pub fn spanda_invert(stage: u8) -> u8 {
    11u8.wrapping_sub(stage)
}

/// Quantize oracle charges to the nearest Spanda substage index (0-11).
/// Uses Water(y/G/np) and Fire(x/A/nn) charges for the minor-circle angle.
pub fn quantize_to_spanda_substage(y: f32, x: f32) -> u8 {
    let phi_angle = y.atan2(x);
    let normalized = (phi_angle + std::f32::consts::PI) / std::f32::consts::TAU;
    ((normalized * 12.0).round() as u8) % 12
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn invert_symmetry() {
        for i in 0..12u8 {
            assert_eq!(spanda_invert(spanda_invert(i)), i);
        }
    }

    #[test]
    fn invert_complement_sums_to_11() {
        for i in 0..12u8 {
            assert_eq!(i + spanda_invert(i), 11);
        }
    }

    #[test]
    fn quantize_returns_valid_range() {
        for angle in 0..360 {
            let rad = (angle as f32) * std::f32::consts::TAU / 360.0;
            let result = quantize_to_spanda_substage(rad.sin(), rad.cos());
            assert!(result < 12);
        }
    }
}
