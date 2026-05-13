use crate::types::{PlanetaryAspect, PortalClockState};

/// (angle_degrees, orb_degrees) for the 5 Ptolemaic aspects.
/// 0=conjunction, 1=sextile, 2=square, 3=trine, 4=opposition.
pub const ASPECT_ANGLES: [(u16, u8); 5] = [(0, 10), (60, 6), (90, 8), (120, 8), (180, 10)];

/// Compute all planetary aspects from current kairos state.
/// Pure-math version: mutates state directly, no Arc/Mutex.
pub fn compute_aspects(state: &mut PortalClockState) {
    let mut aspects = Vec::new();
    for a in 0..10u8 {
        let deg_a = state.kairos.planets[a as usize].degree;
        if deg_a == 0xFFFF {
            continue;
        }
        for b in (a + 1)..10u8 {
            let deg_b = state.kairos.planets[b as usize].degree;
            if deg_b == 0xFFFF {
                continue;
            }
            let diff = ((deg_a as i32) - (deg_b as i32)).unsigned_abs() as u16;
            let angular_diff = diff.min(360 - diff);
            for (idx, &(target, orb)) in ASPECT_ANGLES.iter().enumerate() {
                let diff_from_exact = (angular_diff as f32 - target as f32).abs();
                if diff_from_exact <= orb as f32 {
                    aspects.push(PlanetaryAspect {
                        planet_a: a,
                        planet_b: b,
                        aspect_type: idx as u8,
                        angle: angular_diff as f32,
                        orb: diff_from_exact,
                    });
                }
            }
        }
    }
    state.aspects = aspects;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn finds_conjunction() {
        let mut state = PortalClockState::default();
        state.kairos.planets[0].degree = 100;
        state.kairos.planets[1].degree = 105;
        compute_aspects(&mut state);
        assert!(!state.aspects.is_empty());
        assert_eq!(state.aspects[0].aspect_type, 0);
    }

    #[test]
    fn finds_opposition() {
        let mut state = PortalClockState::default();
        state.kairos.planets[0].degree = 10;
        state.kairos.planets[1].degree = 190;
        compute_aspects(&mut state);
        let opp = state.aspects.iter().find(|a| a.aspect_type == 4);
        assert!(opp.is_some());
    }
}
