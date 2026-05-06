/// Default kbase project scope.
pub const DEFAULT_PROJECT: &str = "epi-logos";

/// Map a coordinate string to its aperture-aware bkmr project name.
///
/// Given a coordinate like "M0", detect the family letter and map:
///   M -> "M", C -> "C", P -> "P", L -> "L", S -> "S", T -> "T"
///   #, CF, W, VAK -> "root"
///   Fallback -> "epi-logos"
pub fn aperture_project_for_coord(coord: &str) -> &'static str {
    let trimmed = coord.trim();
    if trimmed.starts_with('#') || trimmed.starts_with("CF") || trimmed.starts_with("VAK") {
        return "root";
    }
    if trimmed.starts_with('W')
        && (trimmed.len() > 1 && trimmed.as_bytes()[1].is_ascii_digit() || trimmed == "W")
    {
        return "root";
    }
    match trimmed.as_bytes().first() {
        Some(b'M') => "M",
        Some(b'C') => "C",
        Some(b'P') => "P",
        Some(b'L') => "L",
        Some(b'S') => "S",
        Some(b'T') => "T",
        _ => DEFAULT_PROJECT,
    }
}

/// Build a run-scoped project identifier: `{base}:{day_id}:{session_id}`.
pub fn build_run_scoped_project(day_id: &str, session_id: &str, base: Option<&str>) -> String {
    let base = base.unwrap_or(DEFAULT_PROJECT);
    format!("{}:{}:{}", base, day_id, session_id)
}

/// Build a day-scoped project identifier: `{base}:{day_id}`.
pub fn build_day_scoped_project(day_id: &str, base: Option<&str>) -> String {
    let base = base.unwrap_or(DEFAULT_PROJECT);
    format!("{}:{}", base, day_id)
}
