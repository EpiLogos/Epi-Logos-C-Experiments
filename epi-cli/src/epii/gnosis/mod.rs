use clap::Subcommand;

use crate::techne::gnosis::{
    config::GnosisConfig, docling_client, ingest, notebook, query,
};

#[derive(Subcommand)]
pub enum GnosisCmd {
    /// Curated RAG contexts
    Context {
        #[command(subcommand)]
        cmd: ContextCmd,
    },
    /// Ingest a source file into local gnosis storage
    Ingest {
        source: String,
        #[arg(long = "context")]
        context: Option<String>,
        #[arg(long, default_value = "Canonical")]
        source_type: String,
    },
    /// Query ingested local knowledge
    Query {
        question: String,
        #[arg(long = "context")]
        context: Option<String>,
        #[arg(long, default_value_t = 3)]
        top_k: usize,
    },
    /// Check gnosis/docling/neo4j configuration state
    Status,
}

#[derive(Subcommand)]
pub enum ContextCmd {
    Create { name: String },
    List,
    Delete { name: String },
}

pub fn dispatch(cmd: &GnosisCmd) -> Result<String, String> {
    let config = GnosisConfig::from_env();
    match cmd {
        GnosisCmd::Context { cmd } => match cmd {
            ContextCmd::Create { name } => {
                let record = notebook::create(&config, name)?;
                Ok(format!("created context {}", record.name))
            }
            ContextCmd::List => {
                let contexts = notebook::list(&config)?;
                Ok(contexts
                    .into_iter()
                    .map(|record| format!("- {}", record.name))
                    .collect::<Vec<_>>()
                    .join("\n"))
            }
            ContextCmd::Delete { name } => {
                let deleted = notebook::delete(&config, name)?;
                Ok(if deleted {
                    format!("deleted context {name}")
                } else {
                    format!("context {name} not found")
                })
            }
        },
        GnosisCmd::Ingest {
            source,
            context,
            source_type,
        } => {
            let record = ingest::ingest_path(&config, source, context.as_deref(), source_type)?;
            Ok(format!(
                "stored {} chunks for {} in {}",
                record.chunks.len(),
                record.title,
                record.notebook.unwrap_or_else(|| "default".to_string())
            ))
        }
        GnosisCmd::Query {
            question,
            context,
            top_k,
        } => {
            let matches = query::query_local(
                &config,
                question,
                query::QueryOptions {
                    notebook: context.as_deref(),
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
        GnosisCmd::Status => {
            let contexts = notebook::list(&config)?;
            let documents = ingest::list_documents(&config)?;
            let docling = docling_client::status(&config)?;
            Ok(format!(
                "docling: {} ({})\ncontexts: {}\ndocuments: {}",
                if docling.configured {
                    "configured"
                } else {
                    "missing"
                },
                docling.url,
                contexts.len(),
                documents.len(),
            ))
        }
    }
}
