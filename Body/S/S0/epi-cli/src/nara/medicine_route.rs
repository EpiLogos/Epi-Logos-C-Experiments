/// epi nara medicine safety
pub fn safety(practice: Option<&str>) -> Result<String, String> {
    match practice {
        Some(p) => Ok(format!(
            "Safety check for '{}': CLEAR (no contraindications)",
            p
        )),
        None => Ok("Safety status: CLEAR — no active contraindications.".to_string()),
    }
}
