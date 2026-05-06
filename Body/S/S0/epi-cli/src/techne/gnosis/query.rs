use super::config::GnosisConfig;
use super::ingest::{list_documents, DocumentRecord};
use serde::Serialize;

#[derive(Debug, Clone)]
pub struct QueryOptions<'a> {
    pub notebook: Option<&'a str>,
    pub source_type: Option<&'a str>,
    pub title: Option<&'a str>,
    pub top_k: usize,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum DisclosureLevel {
    Chunk,
    SourceSummary,
}

#[derive(Debug, Clone, Serialize)]
pub struct SourceSelection {
    pub notebook: Option<String>,
    pub source_type: Option<String>,
    pub title: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct GnosisQueryHit {
    pub document_id: String,
    pub title: String,
    pub notebook: Option<String>,
    pub source_type: String,
    pub source_path: String,
    pub score: usize,
    pub section_heading: Option<String>,
    pub text: String,
    pub disclosure: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct GnosisQueryReport {
    pub coordinate: &'static str,
    pub service: &'static str,
    pub storage_substrate: &'static str,
    pub governance_owner: &'static str,
    pub query: String,
    pub source_selection: SourceSelection,
    pub disclosure_level: DisclosureLevel,
    pub hits: Vec<GnosisQueryHit>,
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

pub fn query_local_report(
    config: &GnosisConfig,
    question: &str,
    options: QueryOptions<'_>,
    disclosure_level: DisclosureLevel,
) -> Result<GnosisQueryReport, String> {
    let source_selection = SourceSelection {
        notebook: options.notebook.map(str::to_owned),
        source_type: options.source_type.map(str::to_owned),
        title: options.title.map(str::to_owned),
    };
    let hits = query_local(config, question, options)?
        .into_iter()
        .map(|(document, score, text, section_heading)| {
            let disclosure = disclosure_for_hit(&document, &section_heading, disclosure_level);
            GnosisQueryHit {
                document_id: document.id,
                title: document.title,
                notebook: document.notebook,
                source_type: document.source_type,
                source_path: document.source_path,
                score,
                section_heading,
                text,
                disclosure,
            }
        })
        .collect();

    Ok(GnosisQueryReport {
        coordinate: "S5",
        service: "gnosis",
        storage_substrate: "S2",
        governance_owner: "S5'",
        query: question.to_owned(),
        source_selection,
        disclosure_level,
        hits,
    })
}

fn disclosure_for_hit(
    document: &DocumentRecord,
    section_heading: &Option<String>,
    level: DisclosureLevel,
) -> String {
    match level {
        DisclosureLevel::Chunk => section_heading
            .as_deref()
            .map(|heading| format!("{} :: {}", document.title, heading))
            .unwrap_or_else(|| document.title.clone()),
        DisclosureLevel::SourceSummary => {
            let notebook = document
                .notebook
                .as_deref()
                .map(|value| format!(" notebook={value}"))
                .unwrap_or_default();
            let section = section_heading
                .as_deref()
                .map(|value| format!(" section={value}"))
                .unwrap_or_default();
            format!(
                "{} [{}]{}{} source={}",
                document.title, document.source_type, notebook, section, document.source_path
            )
        }
    }
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
