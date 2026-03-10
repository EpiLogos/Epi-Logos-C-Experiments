use serde::{Deserialize, Serialize};

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
