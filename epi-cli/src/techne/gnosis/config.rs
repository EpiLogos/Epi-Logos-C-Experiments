use std::path::PathBuf;

#[derive(Debug, Clone)]
pub struct GnosisConfig {
    pub root: PathBuf,
    pub docling_url: String,
    pub chunk_words: usize,
    pub overlap_words: usize,
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

        Self {
            root,
            docling_url: std::env::var("EPILOGOS_DOCLING_URI")
                .unwrap_or_else(|_| "http://localhost:5001".to_string()),
            chunk_words,
            overlap_words,
        }
    }

    pub fn notebooks_path(&self) -> PathBuf {
        self.root.join("notebooks.json")
    }

    pub fn documents_path(&self) -> PathBuf {
        self.root.join("documents.json")
    }
}
