use serde::Serialize;

/// Degree constants — 3×60 structure (equilateral triangle → 6 tiles → 360°)
/// Mirrors C m1.h: TRIG_STEP_DEG, FULL_CYCLE_DEG, DEGREE_PER_TICK, etc.
pub const FULL_CYCLE_DEG: f64 = 360.0;
pub const DEGREE_PER_TICK: f64 = 30.0;
pub const TRIG_STEP_DEG: f64 = 60.0;
pub const QL_POSITIONS: u8 = 6;
pub const DOUBLE_COVER_STEPS: u8 = 12;

/// Hopf projection: S³ (720° total space) → S² (360° base space)
/// This IS the `% 360` operation, named for what it is.
pub fn hopf_project(exact_degree_720: f64) -> f64 {
    exact_degree_720 % FULL_CYCLE_DEG
}

/// Hopf fiber coordinate: 0 = explicate (Strand A), 1 = implicate (Strand B)
pub fn hopf_fiber(exact_degree_720: f64) -> u8 {
    if exact_degree_720 >= FULL_CYCLE_DEG {
        1
    } else {
        0
    }
}

/// Validate that a quaternion lies on S³ (unit sphere in 4D).
/// The Hopf fibration requires S³ — a non-unit quaternion breaks the bundle.
pub fn validate_quaternion_unity(q: &[f32; 4]) -> Result<(), String> {
    let norm_sq = q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3];
    if (1.0 - norm_sq).abs() > 1e-4 {
        Err(format!(
            "Quaternion off S³: |q|² = {:.6}, expected 1.0",
            norm_sq
        ))
    } else {
        Ok(())
    }
}

#[derive(Debug, Serialize)]
pub struct ClockState {
    pub torus_pos: u8,
    pub spanda_stage: u8,
    pub ascending: bool,
    pub phase: u8, // 0 = explicate (Strand A), 1 = implicate (Strand B)
    pub active_poles: u8,
    pub element_count: u8,
    pub spanda_track: u8,
    pub cf_substage: u8,
}

/// Read M1 torus state — currently from kairos cache since FFI not wired
pub fn show(json: bool) -> Result<String, String> {
    // Derive clock state from kairos cache
    let kairos = super::kairos::load_current()?;

    let state = match kairos {
        Some(k) => {
            let sun_deg = k
                .planets
                .iter()
                .find(|p| p.planet_id == 0)
                .map(|p| p.degree)
                .unwrap_or(0.0);
            let base_deg = hopf_project(sun_deg as f64);
            let phase = hopf_fiber(sun_deg as f64);
            let torus_pos = (base_deg / DEGREE_PER_TICK) as u8;
            let ascending = phase == 0;
            let stage = if ascending { torus_pos } else { 11 - torus_pos };

            ClockState {
                torus_pos,
                spanda_stage: stage,
                ascending,
                phase,
                active_poles: if ascending { 0x01 } else { 0x02 },
                element_count: get_topological_element_count(torus_pos),
                spanda_track: phase,
                cf_substage: stage,
            }
        }
        None => {
            return Err("No clock state. Run 'epi nara wind' first.".to_string());
        }
    };

    if json {
        serde_json::to_string_pretty(&state).map_err(|e| e.to_string())
    } else {
        Ok(format!(
            "Nara Clock\n  Torus: {} ({})\n  Spanda: stage {} track {}\n  Phase: {} ({})\n  Elements: {}\n  CF substage: {}",
            state.torus_pos,
            if state.ascending { "ascending" } else { "descending" },
            state.spanda_stage, state.spanda_track,
            state.phase,
            if state.phase == 0 { "explicate" } else { "implicate" },
            state.element_count, state.cf_substage
        ))
    }
}

/// Mirror of C TOPOLOGICAL_ELEMENT_COUNT_LUT[12]
fn get_topological_element_count(ring_pos: u8) -> u8 {
    const LUT: [u8; 12] = [1, 2, 2, 3, 4, 5, 8, 10, 12, 6, 7, 11];
    LUT[(ring_pos % 12) as usize]
}
