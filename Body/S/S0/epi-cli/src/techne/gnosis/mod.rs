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
        /// Record the ingested document against a Gnosis notebook.
        ///
        /// 12.T12.13 finding D3: `aletheia_gnosis_ingest` has always pushed
        /// `--notebook <name>`, and this arm did not accept it — so clap
        /// refused the whole invocation and the ingest FAILED rather than
        /// silently ignoring the parameter.
        #[arg(long)]
        notebook: Option<String>,
    },
    /// Query the gnostic namespace via the Python epi-gnostic CLI
    QueryGnostic {
        question: String,
        #[arg(long)]
        mode: Option<String>,
        /// Bound how many retrieved items the mode considers (LightRAG `top_k`).
        ///
        /// 12.T12.13 finding D3: declared by `aletheia_gnosis_query` and
        /// dropped on the floor — no error, no effect.
        #[arg(long)]
        top_k: Option<u32>,
    },
    /// Enrich a known entity via the Python epi-gnostic CLI
    Enrich {
        entity_id: String,
        #[arg(long)]
        coordinate: Option<String>,
        #[arg(long)]
        family: Option<String>,
    },
    /// Consolidated entity handle for a coordinate or passage id (s5'.gnostic.resolve parity)
    Resolve { reference: String },
    /// PASU orphan-candidate surface (s5'.gnostic.candidates parity)
    Candidates {
        #[arg(long)]
        filter: Option<String>,
    },
    /// Etymology cluster around a coordinate (s5'.gnostic.etymology parity)
    Etymology { coord: String },
    /// Coordinate-filtered notebook listing (s5'.gnostic.list_notebooks parity)
    ListNotebooks {
        #[arg(long)]
        coordinate: Option<String>,
    },
    /// Graphiti episode search (s5'.gnostic.episode_search parity)
    EpisodeSearch {
        query: String,
        #[arg(long)]
        vak: Option<String>,
        #[arg(long)]
        group: Option<String>,
    },
    /// Provenance pointer chain for a passage (s5'.gnostic.evidence_trace parity)
    EvidenceTrace { passage_id: String },
    /// Per-layer query across LightRAG modes (s5'.gnostic.query_with_layers parity)
    QueryWithLayers {
        question: String,
        #[arg(long)]
        layers: Option<String>,
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
            notebook,
        } => ingest::ingest_gnostic(
            &config,
            source,
            coordinate.as_deref(),
            family.as_deref(),
            notebook.as_deref(),
        ),
        GnosisCmd::QueryGnostic {
            question,
            mode,
            top_k,
        } => query::query_gnostic(&config, question, mode.as_deref(), *top_k),
        // 12.T12.13 clause (b): the cross-namespace `MAPS_TO_COORDINATE` edge is
        // minted by `CoordinateEnricher.assign_direct`, reachable only via the
        // epi-gnostic `enrich` subcommand. This arm used to call
        // `ingest::ingest_gnostic`, which handed the entity id to
        // `epi-gnostic ingest` as a document path — so the enrich branch of the
        // Python CLI was dispatched by nothing, and the Aletheia Pi tool
        // `aletheia_gnosis_enrich` (which spawns this command) could never reach
        // the enricher.
        GnosisCmd::Enrich {
            entity_id,
            coordinate,
            family,
        } => {
            let mut args = vec!["enrich", entity_id.as_str()];
            if let Some(coord) = coordinate.as_deref() {
                args.extend(["--coordinate", coord]);
            }
            if let Some(fam) = family.as_deref() {
                args.extend(["--family", fam]);
            }
            query::run_gnostic_passthrough(&config, &args)
        }
        GnosisCmd::Resolve { reference } => {
            query::run_gnostic_passthrough(&config, &["resolve", reference])
        }
        GnosisCmd::Candidates { filter } => {
            let mut args = vec!["candidates"];
            if let Some(f) = filter.as_deref() {
                args.extend(["--filter", f]);
            }
            query::run_gnostic_passthrough(&config, &args)
        }
        GnosisCmd::Etymology { coord } => {
            query::run_gnostic_passthrough(&config, &["etymology", coord])
        }
        GnosisCmd::ListNotebooks { coordinate } => {
            let mut args = vec!["list-notebooks"];
            if let Some(c) = coordinate.as_deref() {
                args.extend(["--coordinate", c]);
            }
            query::run_gnostic_passthrough(&config, &args)
        }
        GnosisCmd::EpisodeSearch {
            query: q,
            vak,
            group,
        } => {
            let mut args = vec!["episode-search", q];
            if let Some(v) = vak.as_deref() {
                args.extend(["--vak", v]);
            }
            if let Some(g) = group.as_deref() {
                args.extend(["--group", g]);
            }
            query::run_gnostic_passthrough(&config, &args)
        }
        GnosisCmd::EvidenceTrace { passage_id } => {
            query::run_gnostic_passthrough(&config, &["evidence-trace", passage_id])
        }
        GnosisCmd::QueryWithLayers { question, layers } => {
            let mut args = vec!["query-with-layers", question];
            if let Some(l) = layers.as_deref() {
                args.extend(["--layers", l]);
            }
            query::run_gnostic_passthrough(&config, &args)
        }
    }
}
