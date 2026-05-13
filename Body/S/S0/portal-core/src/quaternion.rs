use crate::types::WalkMode;

/// Hamilton product of two quaternions [w, x, y, z].
pub fn quat_mul(a: [f32; 4], b: [f32; 4]) -> [f32; 4] {
    let (aw, ax, ay, az) = (a[0], a[1], a[2], a[3]);
    let (bw, bx, by, bz) = (b[0], b[1], b[2], b[3]);
    [
        aw * bw - ax * bx - ay * by - az * bz,
        aw * bx + ax * bw + ay * bz - az * by,
        aw * by - ax * bz + ay * bw + az * bx,
        aw * bz + ax * by - ay * bx + az * bw,
    ]
}

/// Normalize a quaternion to unit length. Returns identity if magnitude is near zero.
pub fn quat_normalize(q: [f32; 4]) -> [f32; 4] {
    let mag = (q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]).sqrt();
    if mag < f32::EPSILON {
        [1.0, 0.0, 0.0, 0.0]
    } else {
        [q[0] / mag, q[1] / mag, q[2] / mag, q[3] / mag]
    }
}

/// Derive walk mode from quaternion: argmax of |w|, |x|, |y|, |z|.
/// Ground=|w| dominant, Torus=|x|, Fiber=|y|, Spanda=|z|.
pub fn derive_walk_mode(q: [f32; 4]) -> WalkMode {
    let abs = [q[0].abs(), q[1].abs(), q[2].abs(), q[3].abs()];
    let mut max_idx = 0usize;
    for i in 1..4 {
        if abs[i] > abs[max_idx] {
            max_idx = i;
        }
    }
    match max_idx {
        0 => WalkMode::Ground,
        1 => WalkMode::Torus,
        2 => WalkMode::Fiber,
        _ => WalkMode::Spanda,
    }
}

/// Derive bifurcation parameter and resolution level from quaternion.
/// Bifurcation parameter lambda = sqrt(x^2 + y^2 + z^2). Mirrors C walk_bifurcation_param().
pub fn derive_bifurcation(q: [f32; 4]) -> (f32, u8) {
    let lambda = (q[1] * q[1] + q[2] * q[2] + q[3] * q[3]).sqrt();
    let level = if lambda < 0.25 {
        0
    } else if lambda < 0.50 {
        1
    } else if lambda < 0.75 {
        2
    } else {
        3
    };
    (lambda, level)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn quat_mul_identity() {
        let id = [1.0f32, 0.0, 0.0, 0.0];
        let q = [0.5, 0.5, 0.5, 0.5];
        let result = quat_mul(id, q);
        for i in 0..4 {
            assert!((result[i] - q[i]).abs() < 1e-6);
        }
    }

    #[test]
    fn quat_mul_ij_eq_k() {
        let i_q = [0.0f32, 1.0, 0.0, 0.0];
        let j_q = [0.0f32, 0.0, 1.0, 0.0];
        let result = quat_mul(i_q, j_q);
        assert!((result[3] - 1.0).abs() < 1e-6);
    }

    #[test]
    fn normalize_zero_returns_identity() {
        assert_eq!(quat_normalize([0.0; 4]), [1.0, 0.0, 0.0, 0.0]);
    }

    #[test]
    fn walk_mode_ground_for_identity() {
        assert_eq!(derive_walk_mode([1.0, 0.0, 0.0, 0.0]), WalkMode::Ground);
    }

    #[test]
    fn walk_mode_torus_for_x() {
        assert_eq!(derive_walk_mode([0.1, 0.9, 0.1, 0.1]), WalkMode::Torus);
    }

    #[test]
    fn walk_mode_fiber_for_y() {
        assert_eq!(derive_walk_mode([0.1, 0.1, 0.9, 0.1]), WalkMode::Fiber);
    }

    #[test]
    fn walk_mode_spanda_for_z() {
        assert_eq!(derive_walk_mode([0.1, 0.1, 0.1, 0.9]), WalkMode::Spanda);
    }

    #[test]
    fn bifurcation_identity_is_zero() {
        let (lambda, res) = derive_bifurcation([1.0, 0.0, 0.0, 0.0]);
        assert!(lambda.abs() < 1e-6);
        assert_eq!(res, 0);
    }

    #[test]
    fn bifurcation_pure_rotation() {
        let (lambda, res) = derive_bifurcation([0.0, 1.0, 0.0, 0.0]);
        assert!((lambda - 1.0).abs() < 1e-6);
        assert_eq!(res, 3);
    }
}
