use std::path::PathBuf;

#[derive(Debug, Clone)]
pub struct GnosisConfig {
    pub root: PathBuf,
    pub chunk_words: usize,
    pub overlap_words: usize,
    pub python_bin: String,
}

impl GnosisConfig {
    pub fn from_env() -> Self {
        let home = std::env::var("HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("."));
        let root = home.join(".epi-logos").join("gnosis");
        let chunk_words = std::env::var("EPI_GNOSIS_CHUNK_WORDS")
            .ok()
            .and_then(|value| value.parse::<usize>().ok())
            .unwrap_or(512);
        let overlap_words = std::env::var("EPI_GNOSIS_OVERLAP_WORDS")
            .ok()
            .and_then(|value| value.parse::<usize>().ok())
            .unwrap_or(64);
        let python_bin =
            std::env::var("EPI_GNOSTIC_PYTHON").unwrap_or_else(|_| "epi-gnostic".into());

        Self {
            root,
            chunk_words,
            overlap_words,
            python_bin,
        }
    }

    pub fn notebooks_path(&self) -> PathBuf {
        self.root.join("notebooks.json")
    }

    pub fn documents_path(&self) -> PathBuf {
        self.root.join("documents.json")
    }
}
