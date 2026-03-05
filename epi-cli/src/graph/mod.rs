use clap::Subcommand;

pub mod types;
pub mod client;
pub mod api;
pub mod mapper;
pub mod sync;
pub mod sync_coordinator;
pub mod sync_orchestrator;
pub mod bidirectional_sync;
pub mod embeddings;
pub mod redis_cache;
pub mod retrieval;
pub mod alignment_validator;
pub mod coordinate_array_parser;
pub mod link_enforcement;
pub mod relationship_manager;

#[derive(Subcommand)]
pub enum GraphCmd {
    /// Show Neo4j/Redis connection status
    Status,
    /// Query by QL coordinate (#0-#5, P0-P5, etc.)
    Query {
        coordinate: String,
    },
    /// Sync vault to graph
    Sync {
        path: Option<String>,
    },
    /// Coordinate-based retrieval
    Retrieve {
        coordinate: String,
        #[arg(short, long)]
        nested: bool,
    },
    /// GraphRAG retrieval
    #[command(name = "graphrag")]
    GraphRAG {
        query: String,
        #[arg(short, long)]
        depth: Option<usize>,
    },
    /// Hybrid vector + graph retrieval
    Hybrid {
        query: String,
        #[arg(short, long)]
        top_k: Option<usize>,
    },
}

pub fn dispatch(cmd: &GraphCmd) -> Result<String, String> {
    match cmd {
        GraphCmd::Status => {
            Ok("Graph status: Neo4j (not connected), Redis (not connected)".to_string())
        }
        GraphCmd::Query { coordinate } => {
            let graph_api = api::GraphAPI::new(None, None);
            let result = graph_api.query_by_coordinate(coordinate);
            match result.error {
                Some(e) => Err(e),
                None => Ok(format!("Coordinate {}: {} nodes found", coordinate, result.nodes.len())),
            }
        }
        GraphCmd::Sync { path } => {
            Ok(format!("Sync initiated for path: {}", path.as_deref().unwrap_or("vault root")))
        }
        GraphCmd::Retrieve { coordinate, nested } => {
            Ok(format!("Retrieving {} (nested: {})", coordinate, nested))
        }
        GraphCmd::GraphRAG { query, depth } => {
            Ok(format!("GraphRAG query: '{}' (depth: {})", query, depth.unwrap_or(3)))
        }
        GraphCmd::Hybrid { query, top_k } => {
            Ok(format!("Hybrid query: '{}' (top_k: {})", query, top_k.unwrap_or(10)))
        }
    }
}
