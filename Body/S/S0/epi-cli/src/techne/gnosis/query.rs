use super::config::GnosisConfig;
use super::ingest::{list_documents, DocumentRecord};

#[derive(Debug, Clone)]
pub struct QueryOptions<'a> {
    pub notebook: Option<&'a str>,
    pub source_type: Option<&'a str>,
    pub title: Option<&'a str>,
    pub top_k: usize,
}

pub fn query_local(
    config: &GnosisConfig,
    question: &str,
    options: QueryOptions<'_>,
) -> Result<Vec<(DocumentRecord, usize, String, Option<String>)>, String> {
    let terms: Vec<String> = question
        .split_whitespace()
        .map(|term| term.to_lowercase())
        .collect();
    let mut matches = Vec::new();

    for document in list_documents(config)? {
        if let Some(notebook) = options.notebook {
            if document.notebook.as_deref() != Some(notebook) {
                continue;
            }
        }
        if let Some(source_type) = options.source_type {
            if document.source_type != source_type {
                continue;
            }
        }
        if let Some(title) = options.title {
            if document.title != title {
                continue;
            }
        }

        for chunk in &document.chunks {
            let haystack = chunk.text.to_lowercase();
            let score = terms
                .iter()
                .filter(|term| haystack.contains(term.as_str()))
                .count();
            if score > 0 {
                matches.push((
                    document.clone(),
                    score,
                    chunk.text.clone(),
                    chunk.section_heading.clone(),
                ));
            }
        }
    }

    matches.sort_by(|left, right| right.1.cmp(&left.1));
    matches.truncate(options.top_k);
    Ok(matches)
}

/// Query the gnostic namespace via the Python epi-gnostic CLI.
pub fn query_gnostic(
    config: &GnosisConfig,
    question: &str,
    mode: Option<&str>,
) -> Result<String, String> {
    let mut cmd = std::process::Command::new(&config.python_bin);
    cmd.arg("query").arg(question);

    if let Some(m) = mode {
        cmd.arg("--mode").arg(m);
    }

    let output = cmd
        .output()
        .map_err(|e| format!("Failed to run epi-gnostic: {e}"))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("epi-gnostic query failed: {stderr}"));
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
