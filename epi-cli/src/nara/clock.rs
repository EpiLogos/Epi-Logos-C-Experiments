use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ClockState {
    pub torus_pos: u8,
    pub spanda_stage: u8,
    pub ascending: bool,
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
            let torus_pos = ((sun_deg / 30.0) as u8) % 12;
            let ascending = torus_pos < 6;
            let stage = if ascending { torus_pos } else { 11 - torus_pos };

            ClockState {
                torus_pos,
                spanda_stage: stage,
                ascending,
                active_poles: if ascending { 0x01 } else { 0x02 },
                element_count: get_topological_element_count(torus_pos),
                spanda_track: if ascending { 0 } else { 1 },
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
            "Nara Clock\n  Torus: {} ({})\n  Spanda: stage {} track {}\n  Elements: {}\n  CF substage: {}",
            state.torus_pos,
            if state.ascending { "ascending" } else { "descending" },
            state.spanda_stage, state.spanda_track,
            state.element_count, state.cf_substage
        ))
    }
}

/// Mirror of C TOPOLOGICAL_ELEMENT_COUNT_LUT[12]
fn get_topological_element_count(ring_pos: u8) -> u8 {
    const LUT: [u8; 12] = [1, 2, 2, 3, 4, 5, 8, 10, 12, 6, 7, 11];
    LUT[(ring_pos % 12) as usize]
}
