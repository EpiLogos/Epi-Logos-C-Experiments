use super::config::GnosisConfig;
use super::notebook;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::Path;

// Chunker types inlined here (chunker.rs deprecated in Task 7 — replaced by RAG-Anything)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ChunkRecord {
    pub chunk_index: usize,
    pub section_heading: Option<String>,
    pub text: String,
}

#[derive(Debug, Clone, Copy)]
pub struct ChunkingOptions {
    pub max_words: usize,
    pub overlap_words: usize,
}

impl ChunkingOptions {
    pub fn from_env_defaults(max_words: usize, overlap_words: usize) -> Self {
        Self {
            max_words,
            overlap_words,
        }
    }

    pub fn for_tests(max_words: usize, overlap_words: usize) -> Self {
        Self {
            max_words,
            overlap_words,
        }
    }
}

pub fn chunk_markdown(content: &str, options: &ChunkingOptions) -> Vec<ChunkRecord> {
    let mut sections = Vec::new();
    let mut current_heading: Option<String> = None;
    let mut current_lines = Vec::new();

    for line in content.lines() {
        if line.starts_with('#') {
            if !current_lines.is_empty() {
                sections.push((current_heading.clone(), current_lines.join("\n")));
                current_lines.clear();
            }
            current_heading = Some(line.trim_start_matches('#').trim().to_string());
        } else if !line.trim().is_empty() {
            current_lines.push(line.trim().to_string());
        }
    }
    if !current_lines.is_empty() {
        sections.push((current_heading, current_lines.join("\n")));
    }

    let mut chunks = Vec::new();
    for (heading, text) in sections {
        let words: Vec<&str> = text.split_whitespace().collect();
        if words.is_empty() {
            continue;
        }
        let mut start = 0usize;
        while start < words.len() {
            let end = usize::min(start + options.max_words, words.len());
            let chunk_words = &words[start..end];
            chunks.push(ChunkRecord {
                chunk_index: chunks.len(),
                section_heading: heading.clone(),
                text: chunk_words.join(" "),
            });
            if end == words.len() {
                break;
            }
            let step = options
                .max_words
                .saturating_sub(options.overlap_words)
                .max(1);
            start += step;
        }
    }
    chunks
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DocumentRecord {
    pub id: String,
    pub title: String,
    pub notebook: Option<String>,
    pub source_type: String,
    pub source_path: String,
    pub ingested_at: String,
    pub chunks: Vec<ChunkRecord>,
}

pub fn ingest_path(
    config: &GnosisConfig,
    source: &str,
    notebook_name: Option<&str>,
    source_type: &str,
) -> Result<DocumentRecord, String> {
    let path = Path::new(source);
    if !path.exists() {
        return Err(format!("source not found: {}", path.display()));
    }
    let content = fs::read_to_string(path)
        .map_err(|err| format!("failed to read {}: {err}", path.display()))?;
    if let Some(name) = notebook_name {
        let _ = notebook::create(config, name)?;
    }

    let options = ChunkingOptions::from_env_defaults(config.chunk_words, config.overlap_words);
    let chunks = chunk_markdown(&content, &options);
    let mut hasher = Sha256::new();
    hasher.update(path.display().to_string());
    hasher.update(&content);
    let id = format!("{:x}", hasher.finalize());
    let record = DocumentRecord {
        id: id.clone(),
        title: path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or(source)
            .to_string(),
        notebook: notebook_name.map(ToOwned::to_owned),
        source_type: source_type.to_string(),
        source_path: path.display().to_string(),
        ingested_at: Utc::now().to_rfc3339(),
        chunks,
    };

    let mut documents = list_documents(config)?;
    documents.retain(|existing| existing.id != id);
    documents.push(record.clone());
    write_documents(config, &documents)?;
    Ok(record)
}

pub fn list_documents(config: &GnosisConfig) -> Result<Vec<DocumentRecord>, String> {
    let path = config.documents_path();
    if !path.exists() {
        return Ok(Vec::new());
    }
    let body = fs::read_to_string(&path)
        .map_err(|err| format!("failed to read {}: {err}", path.display()))?;
    serde_json::from_str(&body).map_err(|err| format!("failed to parse {}: {err}", path.display()))
}

pub fn write_documents(config: &GnosisConfig, documents: &[DocumentRecord]) -> Result<(), String> {
    let path = config.documents_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|err| format!("failed to create {}: {err}", parent.display()))?;
    }
    let body = serde_json::to_string_pretty(documents)
        .map_err(|err| format!("failed to serialize documents: {err}"))?;
    fs::write(&path, body).map_err(|err| format!("failed to write {}: {err}", path.display()))
}
