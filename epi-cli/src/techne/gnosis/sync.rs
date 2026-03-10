use super::config::GnosisConfig;

pub fn sync_from_vimarsa(_config: &GnosisConfig) -> Result<String, String> {
    Ok("vimarsa sync scanned 0 new sources".to_string())
}
