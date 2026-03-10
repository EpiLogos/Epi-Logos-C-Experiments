use super::config::GnosisConfig;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DoclingStatus {
    pub compose_file: PathBuf,
    pub configured: bool,
    pub docker_available: bool,
    pub url: String,
}

pub fn status(config: &GnosisConfig) -> Result<DoclingStatus, String> {
    let compose_file = compose_path()?;
    let compose = fs::read_to_string(&compose_file)
        .map_err(|err| format!("failed to read {}: {err}", compose_file.display()))?;
    Ok(DoclingStatus {
        compose_file,
        configured: compose.contains("docling-serve"),
        docker_available: std::process::Command::new("docker")
            .arg("--version")
            .output()
            .is_ok(),
        url: config.docling_url.clone(),
    })
}

pub fn compose_path() -> Result<PathBuf, String> {
    let root = std::env::var("EPILOGOS_ROOT")
        .map(PathBuf::from)
        .or_else(|_| std::env::current_dir())
        .unwrap_or_else(|_| PathBuf::from("."));
    let direct = root.join("docker-compose.epi-s2.yml");
    if direct.exists() {
        return Ok(direct);
    }
    let parent = root
        .parent()
        .map(|path| path.join("docker-compose.epi-s2.yml"));
    if let Some(path) = parent {
        if path.exists() {
            return Ok(path);
        }
    }
    Err("docker-compose.epi-s2.yml not found".to_string())
}
