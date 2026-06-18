//! Tritone mirror-consistency invariant for the 72-vector head.

#[derive(Debug, Clone, PartialEq)]
pub struct MirrorConsistencyReport {
    pub checked_pairs: usize,
    pub violations: usize,
    pub loss: f32,
    pub max_abs_delta: f32,
    tolerance: f32,
}

impl MirrorConsistencyReport {
    pub fn evaluate(vector: &[f32], tolerance: f32) -> Self {
        let mut checked_pairs = 0usize;
        let mut violations = 0usize;
        let mut loss = 0.0f32;
        let mut max_abs_delta = 0.0f32;
        if vector.len() == 72 {
            for lens_anchor in 0..12 {
                for position in 0..3 {
                    let left = vector[lens_anchor * 6 + position];
                    let right = vector[lens_anchor * 6 + (5 - position)];
                    let delta = (left - right).abs();
                    checked_pairs += 1;
                    loss += delta * delta;
                    max_abs_delta = max_abs_delta.max(delta);
                    if delta > tolerance {
                        violations += 1;
                    }
                }
            }
        } else {
            violations = 1;
            loss = f32::INFINITY;
            max_abs_delta = f32::INFINITY;
        }
        Self {
            checked_pairs,
            violations,
            loss,
            max_abs_delta,
            tolerance,
        }
    }

    pub fn assert_invariant(&self) -> Result<(), String> {
        if self.violations == 0 {
            Ok(())
        } else {
            Err(format!(
                "tritone mirror invariant failed: {} violation(s), max_abs_delta {:.6}, tolerance {:.6}",
                self.violations, self.max_abs_delta, self.tolerance
            ))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::MirrorConsistencyReport;

    #[test]
    fn mirror_consistency_loss() {
        let mut vector = [0.0f32; 72];
        for lens_anchor in 0..12 {
            for position in 0..3 {
                let value = (lens_anchor + position + 1) as f32 / 24.0;
                vector[lens_anchor * 6 + position] = value;
                vector[lens_anchor * 6 + (5 - position)] = value;
            }
        }
        let report = MirrorConsistencyReport::evaluate(&vector, 0.0001);
        assert_eq!(report.checked_pairs, 36);
        assert_eq!(report.violations, 0);
        assert_eq!(report.loss, 0.0);
    }
}
