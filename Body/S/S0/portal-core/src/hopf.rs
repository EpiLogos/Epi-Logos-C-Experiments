pub const FULL_CYCLE_DEG: f64 = 360.0;
pub const DOUBLE_COVER_DEG: u16 = 720;
pub const DEGREE_PER_TICK: f64 = 30.0;
pub const DEGREE_PER_TICK_U16: u16 = 30;
pub const TRIG_STEP_DEG: f64 = 60.0;
pub const QL_POSITIONS: u8 = 6;
pub const DOUBLE_COVER_STEPS: u8 = 12;

/// Discrete address of the 12-step QL walk inside the 720-degree Hopf/SU(2)
/// double cover.
///
/// `tick12` traverses the 360-degree base at 30 degrees per tick. The Hopf
/// fibre is a separate binary coordinate selected by cycle parity, so the
/// complete SU(2) return takes 24 absolute kernel ticks rather than folding
/// direct/prime positions 6..11 into the second 360-degree layer.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct HopfClockAddress {
    pub tick12: u8,
    pub degree360: u16,
    pub fiber: u8,
    pub degree720: u16,
}

pub fn hopf_clock_address(cycle: u64, tick12: u8) -> HopfClockAddress {
    let tick12 = tick12 % DOUBLE_COVER_STEPS;
    let degree360 = tick12 as u16 * DEGREE_PER_TICK_U16;
    let fiber = (cycle & 1) as u8;
    let degree720 = degree360 + (fiber as u16 * FULL_CYCLE_DEG as u16);
    HopfClockAddress {
        tick12,
        degree360,
        fiber,
        degree720,
    }
}

/// Hopf projection: S3 (720 total space) -> S2 (360 base space).
pub fn hopf_project(exact_degree_720: f64) -> f64 {
    exact_degree_720 % FULL_CYCLE_DEG
}

/// Hopf fiber coordinate: 0 = first 360-degree layer, 1 = second layer.
pub fn hopf_fiber(exact_degree_720: f64) -> u8 {
    if exact_degree_720 >= FULL_CYCLE_DEG {
        1
    } else {
        0
    }
}

/// Validate that a quaternion lies on S3 (unit sphere in 4D).
pub fn validate_quaternion_unity(q: &[f32; 4]) -> Result<(), String> {
    let norm_sq = q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3];
    if (1.0 - norm_sq).abs() > 1e-4 {
        Err(format!(
            "Quaternion off S3: |q|^2 = {:.6}, expected 1.0",
            norm_sq
        ))
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
    fn discrete_clock_keeps_tick12_and_fiber_independent() {
        let direct_prime_boundary = hopf_clock_address(0, 6);
        assert_eq!(direct_prime_boundary.tick12, 6);
        assert_eq!(direct_prime_boundary.degree360, 180);
        assert_eq!(direct_prime_boundary.fiber, 0);
        assert_eq!(direct_prime_boundary.degree720, 180);

        let second_layer_start = hopf_clock_address(1, 0);
        assert_eq!(second_layer_start.tick12, 0);
        assert_eq!(second_layer_start.degree360, 0);
        assert_eq!(second_layer_start.fiber, 1);
        assert_eq!(second_layer_start.degree720, 360);

        let second_layer_end = hopf_clock_address(1, 11);
        assert_eq!(second_layer_end.degree360, 330);
        assert_eq!(second_layer_end.degree720, 690);

        assert_eq!(hopf_clock_address(2, 0), hopf_clock_address(0, 0));
    }

    #[test]
    fn unit_quaternion_validates() {
        assert!(validate_quaternion_unity(&[1.0, 0.0, 0.0, 0.0]).is_ok());
        assert!(validate_quaternion_unity(&[2.0, 0.0, 0.0, 0.0]).is_err());
    }
}
