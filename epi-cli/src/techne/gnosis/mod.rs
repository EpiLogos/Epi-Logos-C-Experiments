pub mod config;
pub mod ingest;
pub mod notebook;
pub mod query;

use clap::Subcommand;
use config::GnosisConfig;

#[derive(Subcommand)]
pub enum GnosisCmd {
    /// Check gnosis/neo4j configuration state
    Status,
    /// Ingest a source file into local gnosis storage
    Ingest {
        source: String,
        #[arg(long)]
        notebook: Option<String>,
        #[arg(long, default_value = "Canonical")]
        source_type: String,
    },
    /// Query ingested local knowledge
    Query {
        question: String,
        #[arg(long)]
        notebook: Option<String>,
        #[arg(long, default_value_t = 3)]
        top_k: usize,
    },
    /// Notebook CRUD
    Notebook {
        #[command(subcommand)]
        cmd: NotebookCmd,
    },
    /// Document listing
    Document {
        #[command(subcommand)]
        cmd: DocumentCmd,
    },
    /// Ingest a document via the Python epi-gnostic CLI
    IngestGnostic {
        source: String,
        #[arg(long)]
        coordinate: Option<String>,
        #[arg(long)]
        family: Option<String>,
    },
    /// Query the gnostic namespace via the Python epi-gnostic CLI
    QueryGnostic {
        question: String,
        #[arg(long)]
        mode: Option<String>,
    },
    /// Enrich a known entity via the Python epi-gnostic CLI
    Enrich {
        entity_id: String,
        #[arg(long)]
        coordinate: Option<String>,
        #[arg(long)]
        family: Option<String>,
    },
}

#[derive(Subcommand)]
pub enum NotebookCmd {
    Create { name: String },
    List,
    Delete { name: String },
}

#[derive(Subcommand)]
pub enum DocumentCmd {
    List {
        #[arg(long)]
        notebook: Option<String>,
    },
}

pub fn dispatch(cmd: &GnosisCmd) -> Result<String, String> {
    let config = GnosisConfig::from_env();
    match cmd {
        GnosisCmd::Status => {
            let notebooks = notebook::list(&config)?;
            let documents = ingest::list_documents(&config)?;
            let embedding = std::env::var("GEMINI_API_KEY").is_ok();
            Ok(format!(
                "neo4j: {}\nembedding_api: {}\nnotebooks: {}\ndocuments: {}",
                std::env::var("EPILOGOS_NEO4J_URI")
                    .unwrap_or_else(|_| "bolt://localhost:7687".to_string()),
                if embedding { "configured" } else { "missing" },
                notebooks.len(),
                documents.len(),
            ))
        }
        GnosisCmd::Ingest {
            source,
            notebook,
            source_type,
        } => {
            let record = ingest::ingest_path(&config, source, notebook.as_deref(), source_type)?;
            Ok(format!(
                "stored {} chunks for {} in {}",
                record.chunks.len(),
                record.title,
                record.notebook.unwrap_or_else(|| "default".to_string())
            ))
        }
        GnosisCmd::Query {
            question,
            notebook,
            top_k,
        } => {
            let matches = query::query_local(
                &config,
                question,
                query::QueryOptions {
                    notebook: notebook.as_deref(),
                    source_type: None,
                    title: None,
                    top_k: *top_k,
                },
            )?;
            if matches.is_empty() {
                return Ok("no matches".to_string());
            }
            Ok(matches
                .into_iter()
                .map(|(document, score, text, heading)| {
                    format!(
                        "- [{}] {} score={} {}",
                        document.title,
                        heading.unwrap_or_else(|| "No heading".to_string()),
                        score,
                        text
                    )
                })
                .collect::<Vec<_>>()
                .join("\n"))
        }
        GnosisCmd::Notebook { cmd } => match cmd {
            NotebookCmd::Create { name } => {
                let record = notebook::create(&config, name)?;
                Ok(format!("created notebook {}", record.name))
            }
            NotebookCmd::List => {
                let notebooks = notebook::list(&config)?;
                Ok(notebooks
                    .into_iter()
                    .map(|record| format!("- {}", record.name))
                    .collect::<Vec<_>>()
                    .join("\n"))
            }
            NotebookCmd::Delete { name } => {
                let deleted = notebook::delete(&config, name)?;
                Ok(if deleted {
                    format!("deleted notebook {name}")
                } else {
                    format!("notebook {name} not found")
                })
            }
        },
        GnosisCmd::Document { cmd } => match cmd {
            DocumentCmd::List { notebook } => {
                let documents = ingest::list_documents(&config)?;
                Ok(documents
                    .into_iter()
                    .filter(|record| {
                        notebook
                            .as_deref()
                            .map(|expected| record.notebook.as_deref() == Some(expected))
                            .unwrap_or(true)
                    })
                    .map(|record| format!("- {} [{}]", record.title, record.source_type))
                    .collect::<Vec<_>>()
                    .join("\n"))
            }
        },
        GnosisCmd::IngestGnostic {
            source,
            coordinate,
            family,
        } => ingest::ingest_gnostic(&config, source, coordinate.as_deref(), family.as_deref()),
        GnosisCmd::QueryGnostic { question, mode } => {
            query::query_gnostic(&config, question, mode.as_deref())
        }
        GnosisCmd::Enrich {
            entity_id,
            coordinate,
            family,
        } => ingest::ingest_gnostic(
            &config,
            entity_id,
            coordinate.as_deref(),
            family.as_deref(),
        ),
    }
}
