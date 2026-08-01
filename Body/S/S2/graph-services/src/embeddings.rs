//! The S2 embedding seam: the Gemini accessor as this layer uses it, plus the
//! guard that stands between a generated vector and the vector index it would
//! be written into.
//!
//! **`GEMINI_EMBED_DIMS` is a *request* knob, not a storage contract.** It picks
//! the matryoshka width asked of the model for one call. `gemini-embedding`
//! already refuses anything outside `SUPPORTED_MATRYOSHKA_DIMS`
//! (`gemini_embedding::EmbeddingConfig::target_dim`), so 3072/1536/768 are all
//! generatable and deliberately stay that way — the narrower widths are
//! legitimate for deliberate experimentation.
//!
//! What that knob can never do is decide what the graph will *store*. The
//! `coord_embedding` vector index has one fixed dimensionality. A vector of any
//! other width written against it is not indexed: it sits on the node looking
//! perfectly correct while dropping out of every similarity query, and the
//! canon that Bimba and Gnosis share ONE embedding space breaks with nothing
//! reporting it. That is the failure [`check_write_width`] exists to make
//! impossible. The refusal lives at the write/index boundary
//! ([`ensure_index_accepts_writes`], called from
//! `semantic::refresh_coordinate_embedding`) and NOT at config construction,
//! which is exactly what keeps 1536/768 generation available.
//!
//! **The index — not a constant — is the authority for its own width.** It has
//! moved before: `Body/S/S5/epi-gnostic/scripts/migrate_bimba_embeddings.py`
//! exists because `coord_embedding` was once 768-dimensional and had to be
//! migrated to 3072. So the guard reads `SHOW VECTOR INDEXES` on the connected
//! graph and compares against what it finds there. Only when the index does not
//! exist yet does it fall back to the DDL that will create it
//! (`epi_s2_graph_schema::SEMANTIC_EMBEDDING_DIMENSIONS`, emitted by
//! `graph-schema`'s `VECTOR_INDEX`), because at that moment the DDL is the only
//! statement of what the index will accept. Never truncate-to-fit; never write
//! anyway.

use epi_s2_graph_schema::{SEMANTIC_EMBEDDING_DIMENSIONS, SEMANTIC_EMBEDDING_INDEX};
use gemini_embedding::{
    GeminiEmbeddingAccessor, LiveGeminiEmbeddingBackend, TaskType, FULL_RESOLUTION_DIM,
};
use neo4rs::query;

use crate::Neo4jClient;

/// Primary env var selecting the matryoshka request width.
pub const EMBED_DIMS_ENV: &str = "GEMINI_EMBED_DIMS";
/// Legacy alias for [`EMBED_DIMS_ENV`], read second.
pub const EMBED_DIMS_ENV_ALIAS: &str = "GEMINI_EMBEDDING_DIMS";

#[derive(Debug)]
pub struct EmbeddingConfig {
    pub api_key: String,
    pub model: String,
    pub dimensions: usize,
    /// Which env var actually supplied `dimensions`, or `None` when nothing did
    /// and the full-resolution default applied. Carried so a refusal can name
    /// the knob that is responsible rather than guess at it.
    pub dimensions_env: Option<&'static str>,
    inner: gemini_embedding::EmbeddingConfig,
}

impl EmbeddingConfig {
    pub fn from_env() -> Result<Self, String> {
        let api_key = std::env::var(gemini_embedding::DEFAULT_API_KEY_ENV)
            .map_err(|_| format!("{} not set", gemini_embedding::DEFAULT_API_KEY_ENV))?;
        let mut inner = gemini_embedding::EmbeddingConfig::from_default_file()
            .map_err(|error| error.to_string())?;
        inner.api_key = Some(api_key.clone());

        if let Ok(model) = std::env::var("GEMINI_EMBED_MODEL")
            .or_else(|_| std::env::var(gemini_embedding::DEFAULT_MODEL_ENV))
        {
            inner.model_version = model;
        }

        // A request knob: which matryoshka width to ask the model for. Whether
        // the resulting vector may be STORED is decided later, against the live
        // index — see the module header and `check_write_width`.
        let dimensions_env = [EMBED_DIMS_ENV, EMBED_DIMS_ENV_ALIAS]
            .into_iter()
            .find(|name| {
                std::env::var(name)
                    .ok()
                    .and_then(|value| value.parse::<usize>().ok())
                    .is_some()
            });
        let dimensions = dimensions_env
            .and_then(|name| std::env::var(name).ok())
            .and_then(|value| value.parse().ok())
            .unwrap_or(FULL_RESOLUTION_DIM);
        inner
            .target_dim(dimensions)
            .map_err(|error| error.to_string())?;

        Ok(Self {
            api_key,
            model: inner.model_version.clone(),
            dimensions,
            dimensions_env,
            inner,
        })
    }
}

/// Where the width an index will accept was learned from.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum IndexWidthSource {
    /// `SHOW VECTOR INDEXES` on the connected graph. The authority.
    LiveIndex,
    /// The index is not in the graph yet, so the DDL that will create it is the
    /// only statement of what it will accept.
    PendingSchemaDdl,
}

impl IndexWidthSource {
    fn describe(self) -> &'static str {
        match self {
            Self::LiveIndex => "read from the live graph via SHOW VECTOR INDEXES",
            Self::PendingSchemaDdl => {
                "the index does not exist yet; width taken from the graph-schema DDL that will create it"
            }
        }
    }
}

/// The width a vector must have to actually land in the semantic vector index.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct IndexWidth {
    pub index: &'static str,
    pub dimensions: usize,
    pub source: IndexWidthSource,
}

/// Ask the connected graph how wide `coord_embedding` is.
///
/// Read-only: `SHOW VECTOR INDEXES` is a system command with no write clause.
pub async fn live_index_width(graph: &Neo4jClient) -> Result<IndexWidth, String> {
    let rows = graph
        .run_query(
            query(
                "SHOW VECTOR INDEXES YIELD name, options
                 WHERE name = $index
                 RETURN toInteger(options['indexConfig']['vector.dimensions']) AS dimensions",
            )
            .param("index", SEMANTIC_EMBEDDING_INDEX),
        )
        .await
        .map_err(|error| {
            format!(
                "cannot read the width of vector index `{SEMANTIC_EMBEDDING_INDEX}` from the live \
                 graph (SHOW VECTOR INDEXES failed: {error}); refusing to write embeddings without \
                 knowing what the index accepts"
            )
        })?;

    let Some(row) = rows.first() else {
        return Ok(IndexWidth {
            index: SEMANTIC_EMBEDDING_INDEX,
            dimensions: SEMANTIC_EMBEDDING_DIMENSIONS,
            source: IndexWidthSource::PendingSchemaDdl,
        });
    };

    let dimensions = row.get::<i64>("dimensions").map_err(|error| {
        format!(
            "vector index `{SEMANTIC_EMBEDDING_INDEX}` exists but reports no readable \
             `vector.dimensions` ({error}); refusing to write embeddings against an index whose \
             width cannot be established"
        )
    })?;
    if dimensions <= 0 {
        return Err(format!(
            "vector index `{SEMANTIC_EMBEDDING_INDEX}` reports a non-positive \
             `vector.dimensions` of {dimensions}; refusing to write"
        ));
    }

    Ok(IndexWidth {
        index: SEMANTIC_EMBEDDING_INDEX,
        dimensions: dimensions as usize,
        source: IndexWidthSource::LiveIndex,
    })
}

/// The decision itself, separated from the I/O so it is testable on its own.
///
/// `configured_from` names the env var that produced `configured`, when one did.
pub fn check_write_width(
    configured: usize,
    configured_from: Option<&str>,
    index: IndexWidth,
) -> Result<(), String> {
    if configured == index.dimensions {
        return Ok(());
    }

    let knob = match configured_from {
        Some(name) => format!("`{name}`"),
        None => format!("`{EMBED_DIMS_ENV}` (unset — full-resolution default)"),
    };
    Err(format!(
        "embedding width mismatch: configured width is {configured} (from {knob}) but vector index \
         `{index_name}` is {index_dim}-dimensional ({source}). Refusing to write: a {configured}-wide \
         vector stored against a {index_dim}-wide index is silently excluded from the index, so it \
         disappears from every similarity query while still looking correct on the node — which is \
         exactly how the one-shared-embedding-space canon breaks without a symptom. Never \
         truncate-to-fit. Either set `{env}` (or `{alias}`) to {index_dim}, or migrate the index \
         first (see Body/S/S5/epi-gnostic/scripts/migrate_bimba_embeddings.py). `{env}` selects a \
         matryoshka REQUEST width; it is not a storage contract.",
        index_name = index.index,
        index_dim = index.dimensions,
        source = index.source.describe(),
        env = EMBED_DIMS_ENV,
        alias = EMBED_DIMS_ENV_ALIAS,
    ))
}

/// The write/index boundary guard: refuse before anything reaches the graph.
pub async fn ensure_index_accepts_writes(
    graph: &Neo4jClient,
    embedder: &GeminiEmbeddingClient,
) -> Result<(), String> {
    let width = live_index_width(graph).await?;
    check_write_width(embedder.dimensions(), embedder.dimensions_env(), width)
}

pub struct GeminiEmbeddingClient {
    config: EmbeddingConfig,
    accessor: GeminiEmbeddingAccessor<LiveGeminiEmbeddingBackend>,
}

impl GeminiEmbeddingClient {
    pub fn new(config: EmbeddingConfig) -> Self {
        let backend = LiveGeminiEmbeddingBackend::new(&config.inner)
            .expect("EmbeddingConfig::from_env validates live Gemini API key");
        let accessor = GeminiEmbeddingAccessor::new(config.inner.clone(), backend);
        Self { config, accessor }
    }

    pub async fn embed(&self, text: &str) -> Result<Vec<f32>, String> {
        self.accessor
            .embed_document(text, TaskType::SemanticSimilarity, self.config.dimensions)
            .await
            .map(|result| result.vector)
            .map_err(|error| error.to_string())
    }

    pub async fn embed_batch(&self, texts: &[&str]) -> Result<Vec<Vec<f32>>, String> {
        let mut results = Vec::with_capacity(texts.len());
        for text in texts {
            results.push(self.embed(text).await?);
        }
        Ok(results)
    }

    pub fn dimensions(&self) -> usize {
        self.config.dimensions
    }

    /// The env var that selected [`Self::dimensions`], when one did. Used by
    /// [`check_write_width`] so a refusal names the knob actually responsible.
    pub fn dimensions_env(&self) -> Option<&'static str> {
        self.config.dimensions_env
    }

    pub fn model(&self) -> &str {
        &self.config.model
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Note: env-var-based tests are serialized via ENV_MUTEX to avoid race conditions
    // when tests run in parallel and mutate the same environment variables.
    static ENV_MUTEX: std::sync::Mutex<()> = std::sync::Mutex::new(());

    /// Take the env lock, recovering from poisoning. Without this, one genuinely
    /// failing test poisons the mutex and every other env test in this module
    /// fails with `PoisonError` — turning one readable red into six unreadable
    /// ones. The guarded data is `()`; there is no state to be corrupted by a
    /// panic, only env vars each test sets for itself.
    fn lock_env() -> std::sync::MutexGuard<'static, ()> {
        ENV_MUTEX
            .lock()
            .unwrap_or_else(|poison| poison.into_inner())
    }

    #[test]
    fn test_config_from_env_missing_key() {
        let _lock = lock_env();
        std::env::remove_var("GEMINI_API_KEY");
        let result = EmbeddingConfig::from_env();
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("GEMINI_API_KEY not set"));
    }

    #[test]
    fn test_config_from_env_with_key() {
        let _lock = lock_env();
        // Clear ambient model overrides (e.g. a shell-exported GEMINI_EMBEDDING_MODEL)
        // so the model_version written to the fixture config file is what round-trips.
        std::env::remove_var("GEMINI_EMBED_MODEL");
        std::env::remove_var(gemini_embedding::DEFAULT_MODEL_ENV);
        std::env::set_var("GEMINI_API_KEY", "test-key-12345");
        let config_path = write_config("graph-services-default-config.toml");
        std::env::set_var(gemini_embedding::DEFAULT_SETTINGS_PATH_ENV, &config_path);
        let config = EmbeddingConfig::from_env().unwrap();
        assert_eq!(config.api_key, "test-key-12345");
        assert_eq!(config.model, "gemini-embedding-2-preview");
        assert_eq!(config.dimensions, 3072);
        std::env::remove_var("GEMINI_API_KEY");
        std::env::remove_var(gemini_embedding::DEFAULT_SETTINGS_PATH_ENV);
        std::fs::remove_file(config_path).unwrap();
    }

    // ---------------------------------------------------------------------
    // Replaces `test_config_custom_model_and_dims`, which set two env vars and
    // asserted the config had read them back. A setter setting a value proves
    // nothing: it stayed green through the entire window in which a 1536-wide
    // vector could be written against a 3072-wide index. The tests below assert
    // the two behaviours that actually matter and that would each go red if the
    // guard were removed or inverted — generation at a narrow width is still
    // allowed, storing it against a disagreeing index is not.
    // ---------------------------------------------------------------------

    fn index_at(dimensions: usize) -> IndexWidth {
        IndexWidth {
            index: SEMANTIC_EMBEDDING_INDEX,
            dimensions,
            source: IndexWidthSource::LiveIndex,
        }
    }

    #[test]
    fn narrow_width_is_generatable_but_refused_at_the_index_boundary() {
        let _lock = lock_env();
        std::env::set_var("GEMINI_API_KEY", "test-key");
        let config_path = write_config("graph-services-narrow-width-config.toml");
        std::env::set_var(gemini_embedding::DEFAULT_SETTINGS_PATH_ENV, &config_path);
        std::env::set_var(EMBED_DIMS_ENV, "1536");

        // Generation at 1536 stays possible — the Architect's flexibility.
        let config = EmbeddingConfig::from_env().expect("1536 is a supported request width");
        assert_eq!(config.dimensions, 1536);
        assert_eq!(config.dimensions_env, Some(EMBED_DIMS_ENV));

        // Storing it against a 3072 index is not.
        let refusal = check_write_width(config.dimensions, config.dimensions_env, index_at(3072))
            .expect_err("a 1536-wide vector must not be written to a 3072-wide index");
        assert!(
            refusal.contains("1536"),
            "names the configured width: {refusal}"
        );
        assert!(refusal.contains("3072"), "names the index width: {refusal}");
        assert!(
            refusal.contains(SEMANTIC_EMBEDDING_INDEX),
            "names the index: {refusal}"
        );
        assert!(
            refusal.contains(EMBED_DIMS_ENV),
            "names the responsible env var: {refusal}"
        );

        std::env::remove_var("GEMINI_API_KEY");
        std::env::remove_var(EMBED_DIMS_ENV);
        std::env::remove_var(gemini_embedding::DEFAULT_SETTINGS_PATH_ENV);
        std::fs::remove_file(config_path).unwrap();
    }

    #[test]
    fn matching_width_is_accepted_whatever_the_index_says() {
        // Deliberately not only 3072: the index has already moved once (768 ->
        // 3072, see migrate_bimba_embeddings.py), so the guard must agree with
        // whatever the index reports rather than with a constant.
        for dimensions in gemini_embedding::SUPPORTED_MATRYOSHKA_DIMS {
            assert!(
                check_write_width(dimensions, Some(EMBED_DIMS_ENV), index_at(dimensions)).is_ok(),
                "width {dimensions} must be accepted by a {dimensions}-wide index"
            );
        }
    }

    #[test]
    fn a_pending_index_is_judged_against_the_ddl_that_will_create_it() {
        let pending = IndexWidth {
            index: SEMANTIC_EMBEDDING_INDEX,
            dimensions: SEMANTIC_EMBEDDING_DIMENSIONS,
            source: IndexWidthSource::PendingSchemaDdl,
        };
        assert!(check_write_width(SEMANTIC_EMBEDDING_DIMENSIONS, None, pending).is_ok());
        let refusal = check_write_width(768, Some(EMBED_DIMS_ENV), pending)
            .expect_err("768 must not be written where the DDL will create a 3072 index");
        assert!(
            refusal.contains("768") && refusal.contains("3072"),
            "{refusal}"
        );
        assert!(refusal.contains("does not exist yet"), "{refusal}");
    }

    #[test]
    fn unsupported_width_is_refused_by_target_dim() {
        let config = test_inner_config();
        let error = config
            .target_dim(999)
            .expect_err("999 is not a matryoshka width");
        let rendered = error.to_string();
        assert!(rendered.contains("999"), "{rendered}");
        assert!(rendered.contains("3072"), "{rendered}");
        // The three that ARE supported must survive the same call.
        for dimensions in gemini_embedding::SUPPORTED_MATRYOSHKA_DIMS {
            assert_eq!(config.target_dim(dimensions).unwrap(), dimensions);
        }
    }

    #[tokio::test]
    async fn matryoshka_truncation_really_yields_the_requested_width() {
        // Uses the deterministic in-crate backend rather than the network, so
        // this asserts the accessor's real truncation arithmetic without a live
        // key. The prefix assertion is the point: matryoshka truncation must be
        // a prefix of the full-resolution vector, not a separate embedding.
        let mut config = {
            let _lock = lock_env();
            test_inner_config()
        };
        let cache_root = std::env::temp_dir().join(format!(
            "{}-graph-services-matryoshka-cache",
            std::process::id()
        ));
        let _ = std::fs::remove_dir_all(&cache_root);
        config.cache_root = cache_root.clone();
        let accessor =
            GeminiEmbeddingAccessor::new(config, gemini_embedding::MockGeminiEmbeddingBackend);
        let document = "S2 coordinate document for the matryoshka width contract";

        // Cold cache: goes to the backend at full resolution, then truncates.
        let narrow = accessor
            .embed_document(document, TaskType::SemanticSimilarity, 1536)
            .await
            .unwrap();
        assert_eq!(narrow.vector.len(), 1536);
        assert_eq!(narrow.target_dim, 1536);
        assert!(!narrow.cache_hit);

        let full = accessor
            .embed_document(document, TaskType::SemanticSimilarity, FULL_RESOLUTION_DIM)
            .await
            .unwrap();
        assert_eq!(full.vector.len(), FULL_RESOLUTION_DIM);
        assert_eq!(
            narrow.vector,
            full.vector[..1536],
            "1536 must be the leading 1536 components of the 3072 vector"
        );

        let narrowest = accessor
            .embed_document(document, TaskType::SemanticSimilarity, 768)
            .await
            .unwrap();
        assert_eq!(narrowest.vector.len(), 768);
        assert_eq!(narrowest.vector, full.vector[..768]);

        let _ = std::fs::remove_dir_all(&cache_root);
    }

    #[test]
    fn test_config_invalid_dims_is_rejected() {
        let _lock = lock_env();
        std::env::set_var("GEMINI_API_KEY", "test-key");
        let config_path = write_config("graph-services-invalid-dims-config.toml");
        std::env::set_var(gemini_embedding::DEFAULT_SETTINGS_PATH_ENV, &config_path);
        std::env::set_var("GEMINI_EMBED_DIMS", "not-a-number");
        let config = EmbeddingConfig::from_env().unwrap();
        assert_eq!(config.dimensions, 3072);
        std::env::set_var("GEMINI_EMBED_DIMS", "999");
        assert!(EmbeddingConfig::from_env().is_err());
        std::env::remove_var("GEMINI_API_KEY");
        std::env::remove_var("GEMINI_EMBED_DIMS");
        std::env::remove_var(gemini_embedding::DEFAULT_SETTINGS_PATH_ENV);
        std::fs::remove_file(config_path).unwrap();
    }

    #[test]
    fn test_client_dimensions() {
        let client = GeminiEmbeddingClient::new(EmbeddingConfig {
            api_key: "test".into(),
            model: "gemini-embedding-2-preview".into(),
            dimensions: 3072,
            dimensions_env: None,
            inner: test_inner_config(),
        });
        assert_eq!(client.dimensions(), 3072);
        assert_eq!(client.model(), "gemini-embedding-2-preview");
    }

    #[tokio::test]
    #[ignore = "hits the paid Gemini embedding endpoint; needs a live GEMINI_API_KEY"]
    async fn test_embed_real() {
        let config = EmbeddingConfig::from_env().unwrap();
        let client = GeminiEmbeddingClient::new(config);
        let result = client.embed("Hello, world!").await.unwrap();
        assert!(!result.is_empty());
    }

    #[tokio::test]
    #[ignore = "hits the paid Gemini embedding endpoint; needs a live GEMINI_API_KEY"]
    async fn test_embed_batch_real() {
        let config = EmbeddingConfig::from_env().unwrap();
        let client = GeminiEmbeddingClient::new(config);
        let results = client.embed_batch(&["Hello", "World"]).await.unwrap();
        assert_eq!(results.len(), 2);
    }

    fn test_inner_config() -> gemini_embedding::EmbeddingConfig {
        let path = write_config("graph-services-inner-config.toml");
        let mut config = gemini_embedding::EmbeddingConfig::from_file(&path).unwrap();
        let _ = std::fs::remove_file(&path);
        config.api_key = Some("test".to_owned());
        config
    }

    fn write_config(name: &str) -> std::path::PathBuf {
        // Unique per call: two tests running in parallel used to land on the
        // same path, so one read a fixture the other was mid-write on and saw a
        // truncated file with no `model_version`.
        static SEQ: std::sync::atomic::AtomicUsize = std::sync::atomic::AtomicUsize::new(0);
        let seq = SEQ.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        let path = std::env::temp_dir().join(format!("{}-{seq}-{name}", std::process::id()));
        std::fs::write(
            &path,
            r#"
[gemini_embedding]
model_version = "gemini-embedding-2-preview"
max_rpm = 600
max_concurrent = 4
backoff_initial_ms = 1
backoff_factor = 2.0
jitter_ratio = 0.0
max_retries = 1
canonical_context_limit_bytes = 1048576

[cloud_opt_in.gemini_embedding]
recorded = true
scopes = ["SEMANTIC_SIMILARITY"]
"#,
        )
        .unwrap();
        path
    }
}
