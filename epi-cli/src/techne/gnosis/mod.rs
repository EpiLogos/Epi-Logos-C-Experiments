pub mod chunker;
pub mod config;
pub mod docling_client;
pub mod ingest;
pub mod notebook;
pub mod query;
pub mod sync;

use clap::Subcommand;
use config::GnosisConfig;

#[derive(Subcommand)]
pub enum GnosisCmd {
    /// Check gnosis/docling/neo4j configuration state
    Status,
    /// Manage Docling service lifecycle
    Serve {
        #[command(subcommand)]
        cmd: ServeCmd,
    },
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
    /// Sync from Vimarsa stores
    Sync {
        #[arg(long = "from-vimarsa")]
        from_vimarsa: bool,
    },
}

#[derive(Subcommand)]
pub enum ServeCmd {
    Start,
    Stop,
    Status,
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
            let docling = docling_client::status(&config)?;
            let embedding = std::env::var("GEMINI_API_KEY").is_ok();
            Ok(format!(
                "docling: {} ({})\nneo4j: {}\nembedding_api: {}\nnotebooks: {}\ndocuments: {}",
                if docling.configured {
                    "configured"
                } else {
                    "missing"
                },
                docling.url,
                std::env::var("EPILOGOS_NEO4J_URI")
                    .unwrap_or_else(|_| "bolt://localhost:7687".to_string()),
                if embedding { "configured" } else { "missing" },
                notebooks.len(),
                documents.len(),
            ))
        }
        GnosisCmd::Serve { cmd } => match cmd {
            ServeCmd::Status => {
                let docling = docling_client::status(&config)?;
                Ok(format!(
                    "docling-serve configured: {}\ndocker available: {}\ncompose: {}",
                    docling.configured,
                    docling.docker_available,
                    docling.compose_file.display()
                ))
            }
            ServeCmd::Start => docker_compose(&["up", "-d", "docling-serve"]),
            ServeCmd::Stop => docker_compose(&["stop", "docling-serve"]),
        },
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
        GnosisCmd::Sync { from_vimarsa } => {
            if *from_vimarsa {
                sync::sync_from_vimarsa(&config)
            } else {
                Ok("sync skipped".to_string())
            }
        }
    }
}

fn docker_compose(args: &[&str]) -> Result<String, String> {
    let compose_file = docling_client::compose_path()?;
    let output = std::process::Command::new("docker")
        .args(["compose", "-f", compose_file.to_str().unwrap()])
        .args(args)
        .output()
        .map_err(|err| format!("docker compose failed: {err}"))?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).trim().to_string())
    }
}
