pub const FULL_CYCLE_DEG: f64 = 360.0;
pub const DEGREE_PER_TICK: f64 = 30.0;
pub const TRIG_STEP_DEG: f64 = 60.0;
pub const QL_POSITIONS: u8 = 6;
pub const DOUBLE_COVER_STEPS: u8 = 12;

/// Hopf projection: S3 (720 total space) -> S2 (360 base space).
pub fn hopf_project(exact_degree_720: f64) -> f64 {
    exact_degree_720 % FULL_CYCLE_DEG
}

/// Hopf fiber coordinate: 0 = explicate (Strand A), 1 = implicate (Strand B).
pub fn hopf_fiber(exact_degree_720: f64) -> u8 {
    if exact_degree_720 >= FULL_CYCLE_DEG { 1 } else { 0 }
}

/// Validate that a quaternion lies on S3 (unit sphere in 4D).
pub fn validate_quaternion_unity(q: &[f32; 4]) -> Result<(), String> {
    let norm_sq = q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3];
    if (1.0 - norm_sq).abs() > 1e-4 {
        Err(format!("Quaternion off S3: |q|^2 = {:.6}, expected 1.0", norm_sq))
    } else {
        Ok(())
    }
}

/// Topological element count LUT — mirrors C TOPOLOGICAL_ELEMENT_COUNT_LUT[12].
pub const TOPOLOGICAL_ELEMENT_COUNT: [u8; 12] = [1, 2, 2, 3, 4, 5, 8, 10, 12, 6, 7, 11];

pub fn get_topological_element_count(ring_pos: u8) -> u8 {
    TOPOLOGICAL_ELEMENT_COUNT[(ring_pos % 12) as usize]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hopf_project_wraps() {
        assert!((hopf_project(370.0) - 10.0).abs() < 1e-10);
        assert!((hopf_project(180.0) - 180.0).abs() < 1e-10);
    }

    #[test]
    fn hopf_fiber_explicate_implicate() {
        assert_eq!(hopf_fiber(100.0), 0);
        assert_eq!(hopf_fiber(400.0), 1);
    }

    #[test]
    fn unit_quaternion_validates() {
        assert!(validate_quaternion_unity(&[1.0, 0.0, 0.0, 0.0]).is_ok());
        assert!(validate_quaternion_unity(&[2.0, 0.0, 0.0, 0.0]).is_err());
    }
}
