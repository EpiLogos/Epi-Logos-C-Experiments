use std::{
    collections::VecDeque,
    env, fmt, fs,
    future::Future,
    io,
    path::{Path, PathBuf},
    pin::Pin,
    sync::{Arc, Mutex},
    time::Duration,
};

use serde::{Deserialize, Serialize};
use tokio::{
    sync::{OwnedSemaphorePermit, Semaphore},
    time::Instant,
};

pub const ACCESSOR_NAME: &str = "gemini_embedding";
pub const FULL_RESOLUTION_DIM: usize = 3072;
pub const SUPPORTED_MATRYOSHKA_DIMS: [usize; 3] = [3072, 1536, 768];
pub const DEFAULT_SETTINGS_PATH_ENV: &str = "EPI_LOGOS_CONFIG_PATH";
pub const DEFAULT_API_KEY_ENV: &str = "GEMINI_API_KEY";
pub const DEFAULT_MODEL_ENV: &str = "GEMINI_EMBEDDING_MODEL";

// ---------------------------------------------------------------------------
// Defaults for the OPTIONAL keys of `[gemini_embedding]`.
//
// Why these exist at all: on 2026-07-28 a missing
// `canonical_context_limit_bytes` made `EmbeddingConfig::from_default_file`
// hard-error on a machine that had a perfectly valid API key. The failure
// surfaced in `Body/S/S0/epi-cli/tests/graph_seed.rs`, which loads the config
// only AFTER it has already cleared and re-seeded a graph — so a missing
// *tuning* key aborted the run with the database half-written. A tuning key
// must never be able to do that.
//
// The line this module draws:
//   - IDENTITY / CREDENTIAL keys stay REQUIRED. `model_version` and the API key
//     decide what a vector *means*; a guessed model silently produces vectors
//     that cannot be compared with the canonical ones, which is unrecoverable
//     without knowing which rows were written when. See
//     `EmbeddingConfig::from_file` and `LiveGeminiEmbeddingBackend::new`.
//   - TUNING keys get a DEFAULT. A wrong value here can make the accessor slow
//     or make it retry more than the user wanted; it can never make it write a
//     wrong vector.
//
// The rate-limit values below are deliberately identical to what the sibling
// TypeScript reader of this SAME config section already falls back to
// (`Body/S/S2/external/bimba-mcp/src/embeddings/gemini.ts:148-156`), so the two
// readers of one `[gemini_embedding]` section cannot disagree about a config
// the user never wrote.
// ---------------------------------------------------------------------------

/// Default `[gemini_embedding].canonical_context_limit_bytes` — 1 MiB.
///
/// Chosen because it is the value every existing `[gemini_embedding]` config in
/// this repository already carries
/// (`Body/S/S2/graph-services/src/embeddings.rs:206`,
/// `Body/S/S0/gemini-embedding/tests/accessor_contract.rs:165`), so adopting it
/// as the fallback changes the chunking behaviour — and therefore the cached
/// vectors — of exactly zero existing callers.
///
/// It is a chunking threshold only: set too high, an over-long document is
/// rejected by the Gemini API with an explicit error; it can never yield a
/// silently wrong vector. That is what makes a default safe here.
pub const DEFAULT_CANONICAL_CONTEXT_LIMIT_BYTES: usize = 1_048_576;

/// Default `[gemini_embedding].max_rpm`. Conservative: too low only costs time.
pub const DEFAULT_MAX_RPM: u32 = 60;

/// Default `[gemini_embedding].max_concurrent`.
pub const DEFAULT_MAX_CONCURRENT: usize = 4;

/// Default `[gemini_embedding].backoff_initial_ms`.
pub const DEFAULT_BACKOFF_INITIAL_MS: u64 = 500;

/// Default `[gemini_embedding].backoff_factor` (plain exponential doubling).
pub const DEFAULT_BACKOFF_FACTOR: f64 = 2.0;

/// Default `[gemini_embedding].jitter_ratio` (±10% spread on each back-off).
pub const DEFAULT_JITTER_RATIO: f64 = 0.1;

/// Default `[gemini_embedding].max_retries`.
pub const DEFAULT_MAX_RETRIES: u32 = 3;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TaskType {
    RetrievalQuery,
    RetrievalDocument,
    SemanticSimilarity,
    Classification,
    Clustering,
    QuestionAnswering,
}

impl TaskType {
    pub fn as_gemini_task_type(self) -> &'static str {
        match self {
            Self::RetrievalQuery => "RETRIEVAL_QUERY",
            Self::RetrievalDocument => "RETRIEVAL_DOCUMENT",
            Self::SemanticSimilarity => "SEMANTIC_SIMILARITY",
            Self::Classification => "CLASSIFICATION",
            Self::Clustering => "CLUSTERING",
            Self::QuestionAnswering => "QUESTION_ANSWERING",
        }
    }
}

impl fmt::Display for TaskType {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(self.as_gemini_task_type())
    }
}

#[derive(Debug, Clone)]
pub struct EmbeddingConfig {
    pub api_key: Option<String>,
    pub model_version: String,
    pub cache_root: PathBuf,
    pub canonical_context_limit_bytes: usize,
    pub rate_limit: RateLimitConfig,
    pub policy: CloudOptInPolicy,
}

impl EmbeddingConfig {
    pub fn from_default_file() -> Result<Self, EmbeddingError> {
        Self::from_file(default_config_path())
    }

    /// Load the accessor config from a `config.toml`.
    ///
    /// A missing file is treated exactly like an empty one, so every key below
    /// resolves the same way whether the file is absent or merely incomplete.
    ///
    /// Only `model_version` is required — it is identity, not tuning (see the
    /// `DEFAULT_*` consts above). Everything else falls back to a documented
    /// default, so an incomplete config can no longer abort a caller midway
    /// through a side-effecting run.
    pub fn from_file(path: impl AsRef<Path>) -> Result<Self, EmbeddingError> {
        let path = path.as_ref();
        let config = read_config_file(path)?;
        let gemini = config.gemini_embedding.clone().unwrap_or_default();
        let model_version = env::var(DEFAULT_MODEL_ENV)
            .ok()
            .filter(|value| !value.trim().is_empty())
            .or_else(|| gemini.model_version.clone())
            .ok_or_else(|| {
                invalid_config(format!(
                    "missing [gemini_embedding].model_version (and ${DEFAULT_MODEL_ENV} is unset).\n\
                     The embedding model identity has no safe default: it decides vector \
                     compatibility, so a guessed model would silently write vectors that cannot be \
                     compared with the canonical ones.\n\n{}",
                    config_block_hint(path)
                ))
            })?;

        let canonical_context_limit_bytes = gemini
            .canonical_context_limit_bytes
            .unwrap_or(DEFAULT_CANONICAL_CONTEXT_LIMIT_BYTES);
        // Validate at load rather than at first chunk: an explicitly wrong value
        // should fail before the caller starts doing side-effecting work, not
        // deep inside `embed_document`.
        if canonical_context_limit_bytes == 0 {
            return Err(invalid_config(format!(
                "[gemini_embedding].canonical_context_limit_bytes must be greater than zero in {} \
                 (omit the key entirely to accept the default of \
                 {DEFAULT_CANONICAL_CONTEXT_LIMIT_BYTES})",
                path.display()
            )));
        }

        Ok(Self {
            api_key: env::var(DEFAULT_API_KEY_ENV).ok(),
            model_version,
            cache_root: gemini.cache_root.clone().unwrap_or_else(default_cache_root),
            canonical_context_limit_bytes,
            rate_limit: RateLimitConfig::from_section(gemini, path)?,
            policy: CloudOptInPolicy::from_config(config),
        })
    }

    pub fn target_dim(&self, requested: usize) -> Result<usize, EmbeddingError> {
        if SUPPORTED_MATRYOSHKA_DIMS.contains(&requested) {
            Ok(requested)
        } else {
            Err(EmbeddingError::UnsupportedTargetDim {
                requested,
                supported: SUPPORTED_MATRYOSHKA_DIMS,
            })
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct RateLimitConfig {
    pub max_rpm: u32,
    pub max_concurrent: usize,
    pub backoff_initial_ms: u64,
    pub backoff_factor: f64,
    pub jitter_ratio: f64,
    pub max_retries: u32,
}

impl Default for RateLimitConfig {
    /// The documented `DEFAULT_*` tuning values, as applied when
    /// `[gemini_embedding]` omits them.
    fn default() -> Self {
        Self {
            max_rpm: DEFAULT_MAX_RPM,
            max_concurrent: DEFAULT_MAX_CONCURRENT,
            backoff_initial_ms: DEFAULT_BACKOFF_INITIAL_MS,
            backoff_factor: DEFAULT_BACKOFF_FACTOR,
            jitter_ratio: DEFAULT_JITTER_RATIO,
            max_retries: DEFAULT_MAX_RETRIES,
        }
    }
}

impl RateLimitConfig {
    /// Every key here is tuning, so every key defaults. Values the user *did*
    /// write are still validated as strictly as before — a default is a
    /// fallback for silence, never a repair for a wrong value.
    fn from_section(
        section: GeminiEmbeddingSection,
        path: &Path,
    ) -> Result<Self, EmbeddingError> {
        let max_rpm = section.max_rpm.unwrap_or(DEFAULT_MAX_RPM);
        let max_concurrent = section.max_concurrent.unwrap_or(DEFAULT_MAX_CONCURRENT);
        let backoff_initial_ms = section
            .backoff_initial_ms
            .unwrap_or(DEFAULT_BACKOFF_INITIAL_MS);
        let backoff_factor = section.backoff_factor.unwrap_or(DEFAULT_BACKOFF_FACTOR);
        let jitter_ratio = section.jitter_ratio.unwrap_or(DEFAULT_JITTER_RATIO);
        let max_retries = section.max_retries.unwrap_or(DEFAULT_MAX_RETRIES);

        if max_rpm == 0 {
            return Err(invalid_tuning_value(path, "max_rpm must be greater than zero"));
        }
        if max_concurrent == 0 {
            return Err(invalid_tuning_value(
                path,
                "max_concurrent must be greater than zero",
            ));
        }
        if backoff_factor < 1.0 {
            return Err(invalid_tuning_value(
                path,
                "backoff_factor must be at least 1.0",
            ));
        }
        if !(0.0..=1.0).contains(&jitter_ratio) {
            return Err(invalid_tuning_value(
                path,
                "jitter_ratio must be between 0.0 and 1.0",
            ));
        }

        Ok(Self {
            max_rpm,
            max_concurrent,
            backoff_initial_ms,
            backoff_factor,
            jitter_ratio,
            max_retries,
        })
    }
}

#[derive(Debug, Clone)]
pub struct CloudOptInPolicy {
    config: ConfigFile,
}

impl CloudOptInPolicy {
    pub fn from_default_file() -> Self {
        Self::from_file(default_config_path())
    }

    pub fn from_file(path: impl AsRef<Path>) -> Self {
        let config = read_config_file(path).unwrap_or_default();
        Self::from_config(config)
    }

    fn from_config(config: ConfigFile) -> Self {
        Self { config }
    }

    pub fn require(&self, accessor: &str, scope: TaskType) -> Result<(), EmbeddingError> {
        let Some(section) = self.config.cloud_opt_in.as_ref() else {
            return Err(opt_in_required(accessor, scope));
        };
        let Some(record) = section.gemini_embedding.as_ref() else {
            return Err(opt_in_required(accessor, scope));
        };

        if !record.recorded.unwrap_or(false) && !record.enabled.unwrap_or(false) {
            return Err(opt_in_required(accessor, scope));
        }

        if let Some(scopes) = &record.scopes {
            let requested = scope.as_gemini_task_type();
            if !scopes
                .iter()
                .any(|item| item == "*" || item.eq_ignore_ascii_case(requested))
            {
                return Err(EmbeddingError::CloudOptInScopeRefused {
                    accessor: accessor.to_owned(),
                    scope: requested.to_owned(),
                });
            }
        }

        Ok(())
    }
}

pub trait EmbeddingBackend: Clone + Send + Sync + 'static {
    fn embed<'a>(
        &'a self,
        request: BackendRequest<'a>,
    ) -> Pin<Box<dyn Future<Output = Result<Vec<f32>, EmbeddingError>> + Send + 'a>>;
}

#[derive(Debug, Clone, Copy)]
pub struct BackendRequest<'a> {
    pub model_version: &'a str,
    pub document_hash: &'a str,
    pub chunks: &'a [&'a str],
    pub task_type: TaskType,
    pub output_dim: usize,
}

#[derive(Debug, Clone)]
pub struct GeminiEmbeddingAccessor<B: EmbeddingBackend> {
    config: EmbeddingConfig,
    backend: B,
}

impl<B: EmbeddingBackend> GeminiEmbeddingAccessor<B> {
    pub fn new(config: EmbeddingConfig, backend: B) -> Self {
        Self { config, backend }
    }

    pub async fn embed_document(
        &self,
        document: impl AsRef<str>,
        task_type: TaskType,
        target_dim: usize,
    ) -> Result<EmbeddingResult, EmbeddingError> {
        self.config.policy.require(ACCESSOR_NAME, task_type)?;
        let target_dim = self.config.target_dim(target_dim)?;
        let document = document.as_ref();
        let document_hash = document_hash(document.as_bytes());

        if let Some(vector) = self.read_cached(&document_hash, target_dim)? {
            return Ok(EmbeddingResult {
                vector,
                target_dim,
                full_dim: FULL_RESOLUTION_DIM,
                document_hash,
                model_version: self.config.model_version.clone(),
                cache_hit: true,
            });
        }

        if target_dim != FULL_RESOLUTION_DIM {
            if let Some(full) = self.read_cached(&document_hash, FULL_RESOLUTION_DIM)? {
                let vector = truncate_matryoshka(&full, target_dim)?;
                self.write_cache(&document_hash, target_dim, &vector)?;
                return Ok(EmbeddingResult {
                    vector,
                    target_dim,
                    full_dim: FULL_RESOLUTION_DIM,
                    document_hash,
                    model_version: self.config.model_version.clone(),
                    cache_hit: true,
                });
            }
        }

        let chunks = chunk_document(document, self.config.canonical_context_limit_bytes)?;
        let chunk_refs = chunks.iter().map(String::as_str).collect::<Vec<_>>();
        let request = BackendRequest {
            model_version: &self.config.model_version,
            document_hash: &document_hash,
            chunks: &chunk_refs,
            task_type,
            output_dim: FULL_RESOLUTION_DIM,
        };
        let full = self.backend.embed(request).await?;
        if full.len() != FULL_RESOLUTION_DIM {
            return Err(EmbeddingError::UnexpectedDimension {
                expected: FULL_RESOLUTION_DIM,
                actual: full.len(),
            });
        }

        self.write_cache(&document_hash, FULL_RESOLUTION_DIM, &full)?;
        let vector = truncate_matryoshka(&full, target_dim)?;
        if target_dim != FULL_RESOLUTION_DIM {
            self.write_cache(&document_hash, target_dim, &vector)?;
        }

        Ok(EmbeddingResult {
            vector,
            target_dim,
            full_dim: FULL_RESOLUTION_DIM,
            document_hash,
            model_version: self.config.model_version.clone(),
            cache_hit: false,
        })
    }

    fn read_cached(
        &self,
        document_hash: &str,
        target_dim: usize,
    ) -> Result<Option<Vec<f32>>, EmbeddingError> {
        let path = self.cache_path(document_hash, target_dim);
        match fs::read_to_string(&path) {
            Ok(contents) => {
                let record: CacheRecord =
                    serde_json::from_str(&contents).map_err(|source| EmbeddingError::Cache {
                        path,
                        message: source.to_string(),
                    })?;
                if record.model_version != self.config.model_version
                    || record.document_hash != document_hash
                    || record.dim != target_dim
                {
                    return Ok(None);
                }
                Ok(Some(record.vector))
            }
            Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(None),
            Err(source) => Err(EmbeddingError::Io {
                path,
                message: source.to_string(),
            }),
        }
    }

    fn write_cache(
        &self,
        document_hash: &str,
        target_dim: usize,
        vector: &[f32],
    ) -> Result<(), EmbeddingError> {
        let path = self.cache_path(document_hash, target_dim);
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|source| EmbeddingError::Io {
                path: parent.to_path_buf(),
                message: source.to_string(),
            })?;
        }
        let record = CacheRecord {
            model_version: self.config.model_version.clone(),
            document_hash: document_hash.to_owned(),
            dim: target_dim,
            vector: vector.to_vec(),
        };
        let contents = serde_json::to_string(&record).map_err(|source| EmbeddingError::Cache {
            path: path.clone(),
            message: source.to_string(),
        })?;
        fs::write(&path, contents).map_err(|source| EmbeddingError::Io {
            path,
            message: source.to_string(),
        })
    }

    fn cache_path(&self, document_hash: &str, target_dim: usize) -> PathBuf {
        self.config
            .cache_root
            .join(&self.config.model_version)
            .join(format!("{document_hash}.{target_dim}"))
    }
}

#[derive(Debug, Clone)]
pub struct LiveGeminiEmbeddingBackend {
    api_key: String,
    client: reqwest::Client,
    limiter: Arc<RateLimiter>,
    rate_limit: RateLimitConfig,
}

impl LiveGeminiEmbeddingBackend {
    /// The API key stays REQUIRED and deliberately has no config-file fallback:
    /// a credential must not be guessable, and must never be written into a
    /// file that gets committed. It is read from the process environment only
    /// (canonically exported from the user's `~/.zshenv`).
    ///
    /// Note this check lives here, at *live-backend construction*, not in
    /// [`EmbeddingConfig::from_file`] — loading config must stay infallible for
    /// mock/offline callers who never issue a cloud call.
    pub fn new(config: &EmbeddingConfig) -> Result<Self, EmbeddingError> {
        let api_key = config
            .api_key
            .clone()
            .filter(|key| !key.trim().is_empty())
            .ok_or_else(|| EmbeddingError::Config {
                message: format!(
                    "${DEFAULT_API_KEY_ENV} is required for live Gemini embedding calls but is \
                     unset or empty.\nExport it in your shell profile (canonically \
                     `~/.zshenv`):\n\n    export {DEFAULT_API_KEY_ENV}=\"…\"\n\nThen open a new \
                     shell, or `source ~/.zshenv`. Check what the process can see with \
                     `epi settings status`."
                ),
            })?;
        Ok(Self {
            api_key,
            client: reqwest::Client::new(),
            limiter: Arc::new(RateLimiter::new(config.rate_limit.clone())),
            rate_limit: config.rate_limit.clone(),
        })
    }

    async fn embed_once(&self, request: BackendRequest<'_>) -> Result<Vec<f32>, EmbeddingError> {
        let mut chunk_vectors = Vec::with_capacity(request.chunks.len());
        for chunk in request.chunks {
            let _permit = self.limiter.acquire().await;
            self.limiter.wait_rpm_turn().await;
            let url = format!(
                "https://generativelanguage.googleapis.com/v1beta/models/{}:embedContent",
                request.model_version
            );
            let body = serde_json::json!({
                "model": format!("models/{}", request.model_version),
                "content": { "parts": [{ "text": chunk }] },
                "taskType": request.task_type.as_gemini_task_type(),
                "outputDimensionality": request.output_dim,
            });
            let response = self
                .client
                .post(url)
                .header("x-goog-api-key", &self.api_key)
                .json(&body)
                .send()
                .await
                .map_err(|source| EmbeddingError::Backend(source.to_string()))?;
            if !response.status().is_success() {
                let status = response.status();
                let body = response.text().await.unwrap_or_default();
                return Err(EmbeddingError::Backend(format!(
                    "Gemini API error {status}: {body}"
                )));
            }
            let data: GeminiEmbedResponse = response
                .json()
                .await
                .map_err(|source| EmbeddingError::Backend(source.to_string()))?;
            chunk_vectors.push(data.embedding.values);
        }

        average_vectors(chunk_vectors, request.output_dim)
    }
}

impl EmbeddingBackend for LiveGeminiEmbeddingBackend {
    fn embed<'a>(
        &'a self,
        request: BackendRequest<'a>,
    ) -> Pin<Box<dyn Future<Output = Result<Vec<f32>, EmbeddingError>> + Send + 'a>> {
        Box::pin(async move {
            let mut delay = Duration::from_millis(self.rate_limit.backoff_initial_ms);
            let attempts = self.rate_limit.max_retries.saturating_add(1);
            let mut last_error = None;
            for attempt in 0..attempts {
                match self.embed_once(request).await {
                    Ok(vector) => return Ok(vector),
                    Err(error) if is_retryable(&error) && attempt + 1 < attempts => {
                        last_error = Some(error);
                        let jittered = jitter(
                            delay,
                            self.rate_limit.jitter_ratio,
                            request.document_hash,
                            attempt,
                        );
                        tokio::time::sleep(jittered).await;
                        delay = delay.mul_f64(self.rate_limit.backoff_factor);
                    }
                    Err(error) => return Err(error),
                }
            }
            Err(last_error
                .unwrap_or_else(|| EmbeddingError::Backend("embedding retry exhausted".to_owned())))
        })
    }
}

#[derive(Debug, Clone, Default)]
pub struct MockGeminiEmbeddingBackend;

impl EmbeddingBackend for MockGeminiEmbeddingBackend {
    fn embed<'a>(
        &'a self,
        request: BackendRequest<'a>,
    ) -> Pin<Box<dyn Future<Output = Result<Vec<f32>, EmbeddingError>> + Send + 'a>> {
        Box::pin(async move {
            let mut output = Vec::with_capacity(request.output_dim);
            let mut counter = 0u64;
            while output.len() < request.output_dim {
                let mut hasher = blake3::Hasher::new();
                hasher.update(request.document_hash.as_bytes());
                hasher.update(request.model_version.as_bytes());
                hasher.update(request.task_type.as_gemini_task_type().as_bytes());
                hasher.update(&counter.to_le_bytes());
                let block = hasher.finalize();
                for bytes in block.as_bytes().chunks_exact(4) {
                    let raw = u32::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]);
                    output.push((raw as f32 / u32::MAX as f32) * 2.0 - 1.0);
                    if output.len() == request.output_dim {
                        break;
                    }
                }
                counter += 1;
            }
            Ok(output)
        })
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct EmbeddingResult {
    pub vector: Vec<f32>,
    pub target_dim: usize,
    pub full_dim: usize,
    pub document_hash: String,
    pub model_version: String,
    pub cache_hit: bool,
}

#[derive(Debug)]
pub enum EmbeddingError {
    CloudOptInRequired {
        accessor: String,
        scope: String,
        command: String,
    },
    CloudOptInScopeRefused {
        accessor: String,
        scope: String,
    },
    UnsupportedTargetDim {
        requested: usize,
        supported: [usize; 3],
    },
    UnexpectedDimension {
        expected: usize,
        actual: usize,
    },
    EmptyDocument,
    Config {
        message: String,
    },
    Io {
        path: PathBuf,
        message: String,
    },
    Cache {
        path: PathBuf,
        message: String,
    },
    Backend(String),
}

impl fmt::Display for EmbeddingError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::CloudOptInRequired {
                accessor,
                scope,
                command,
            } => write!(
                formatter,
                "cloud opt-in required for {accessor} scope {scope}; run `{command}`"
            ),
            Self::CloudOptInScopeRefused { accessor, scope } => write!(
                formatter,
                "cloud opt-in for {accessor} does not include scope {scope}"
            ),
            Self::UnsupportedTargetDim {
                requested,
                supported,
            } => write!(
                formatter,
                "unsupported target_dim {requested}; supported values are {supported:?}"
            ),
            Self::UnexpectedDimension { expected, actual } => {
                write!(formatter, "expected embedding dim {expected}, got {actual}")
            }
            Self::EmptyDocument => formatter.write_str("document must not be empty"),
            Self::Config { message } => formatter.write_str(message),
            Self::Io { path, message } => write!(formatter, "{}: {}", path.display(), message),
            Self::Cache { path, message } => write!(formatter, "{}: {}", path.display(), message),
            Self::Backend(message) => formatter.write_str(message),
        }
    }
}

impl std::error::Error for EmbeddingError {}

pub fn document_hash(document: &[u8]) -> String {
    blake3::hash(document).to_hex().to_string()
}

fn truncate_matryoshka(vector: &[f32], target_dim: usize) -> Result<Vec<f32>, EmbeddingError> {
    if vector.len() < target_dim {
        return Err(EmbeddingError::UnexpectedDimension {
            expected: target_dim,
            actual: vector.len(),
        });
    }
    Ok(vector[..target_dim].to_vec())
}

fn chunk_document(document: &str, limit_bytes: usize) -> Result<Vec<String>, EmbeddingError> {
    if document.is_empty() {
        return Err(EmbeddingError::EmptyDocument);
    }
    if limit_bytes == 0 {
        return Err(invalid_config(
            "canonical_context_limit_bytes must be greater than zero",
        ));
    }
    if document.len() <= limit_bytes {
        return Ok(vec![document.to_owned()]);
    }

    let mut chunks = Vec::new();
    let mut start = 0;
    while start < document.len() {
        let mut end = (start + limit_bytes).min(document.len());
        while !document.is_char_boundary(end) && end > start {
            end -= 1;
        }
        if end == start {
            return Err(invalid_config(
                "canonical_context_limit_bytes is too small for UTF-8 chunking",
            ));
        }
        chunks.push(document[start..end].to_owned());
        start = end;
    }
    Ok(chunks)
}

fn average_vectors(vectors: Vec<Vec<f32>>, output_dim: usize) -> Result<Vec<f32>, EmbeddingError> {
    if vectors.is_empty() {
        return Err(EmbeddingError::Backend(
            "Gemini API returned no chunk embeddings".to_owned(),
        ));
    }
    let mut average = vec![0.0; output_dim];
    for vector in &vectors {
        if vector.len() != output_dim {
            return Err(EmbeddingError::UnexpectedDimension {
                expected: output_dim,
                actual: vector.len(),
            });
        }
        for (idx, value) in vector.iter().enumerate() {
            average[idx] += *value;
        }
    }
    let denominator = vectors.len() as f32;
    for value in &mut average {
        *value /= denominator;
    }
    Ok(average)
}

fn is_retryable(error: &EmbeddingError) -> bool {
    matches!(error, EmbeddingError::Backend(_))
}

fn jitter(base: Duration, ratio: f64, document_hash: &str, attempt: u32) -> Duration {
    if ratio == 0.0 || base.is_zero() {
        return base;
    }
    let mut hasher = blake3::Hasher::new();
    hasher.update(document_hash.as_bytes());
    hasher.update(&attempt.to_le_bytes());
    let bytes = hasher.finalize();
    let raw = u64::from_le_bytes(bytes.as_bytes()[..8].try_into().expect("hash bytes"));
    let unit = raw as f64 / u64::MAX as f64;
    let spread = 1.0 - ratio + (unit * ratio * 2.0);
    base.mul_f64(spread.max(0.0))
}

fn opt_in_required(accessor: &str, scope: TaskType) -> EmbeddingError {
    EmbeddingError::CloudOptInRequired {
        accessor: accessor.to_owned(),
        scope: scope.as_gemini_task_type().to_owned(),
        command: "epi settings opt-in gemini_embedding".to_owned(),
    }
}

fn read_config_file(path: impl AsRef<Path>) -> Result<ConfigFile, EmbeddingError> {
    let path = path.as_ref();
    match fs::read_to_string(path) {
        Ok(contents) => toml::from_str(&contents).map_err(|source| EmbeddingError::Config {
            message: format!("invalid config {}: {}", path.display(), source),
        }),
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(ConfigFile::default()),
        Err(source) => Err(EmbeddingError::Io {
            path: path.to_path_buf(),
            message: source.to_string(),
        }),
    }
}

fn default_config_path() -> PathBuf {
    env::var_os(DEFAULT_SETTINGS_PATH_ENV)
        .map(PathBuf::from)
        .unwrap_or_else(|| default_epi_logos_home().join("config.toml"))
}

fn default_cache_root() -> PathBuf {
    default_epi_logos_home().join("cache").join("embeddings")
}

fn default_epi_logos_home() -> PathBuf {
    env::var_os("EPI_LOGOS_HOME")
        .map(PathBuf::from)
        .or_else(|| env::var_os("HOME").map(|home| PathBuf::from(home).join(".epi-logos")))
        .unwrap_or_else(|| PathBuf::from(".epi-logos"))
}

/// The exact TOML the user should paste, naming the file it belongs in.
///
/// Every optional key is shown commented-out at its real default, so the block
/// doubles as documentation: the user can see what the accessor will do before
/// deciding whether to override anything.
fn config_block_hint(path: &Path) -> String {
    format!(
        "Add this block to {} (create the file if it does not exist):\n\n\
         [gemini_embedding]\n\
         # Required. The model identity — it decides vector compatibility, so it has\n\
         # no default. Override per-process with ${DEFAULT_MODEL_ENV}.\n\
         model_version = \"gemini-embedding-2-preview\"\n\
         \n\
         # Optional tuning. Shown at their built-in defaults; uncomment to change.\n\
         # canonical_context_limit_bytes = {DEFAULT_CANONICAL_CONTEXT_LIMIT_BYTES}\n\
         # max_rpm = {DEFAULT_MAX_RPM}\n\
         # max_concurrent = {DEFAULT_MAX_CONCURRENT}\n\
         # backoff_initial_ms = {DEFAULT_BACKOFF_INITIAL_MS}\n\
         # backoff_factor = {DEFAULT_BACKOFF_FACTOR}\n\
         # jitter_ratio = {DEFAULT_JITTER_RATIO}\n\
         # max_retries = {DEFAULT_MAX_RETRIES}\n\
         \n\
         # Required before any cloud call; recorded by `epi settings opt-in gemini_embedding`.\n\
         [cloud_opt_in.gemini_embedding]\n\
         recorded = true\n\
         scopes = [\"*\"]\n\n\
         A full annotated template lives at \
         `Body/S/S0/gemini-embedding/config.example.toml`.",
        path.display()
    )
}

/// A value the user explicitly wrote is out of range. Names the file so the
/// user knows which config to edit — there may be several on a machine
/// (`$EPI_LOGOS_CONFIG_PATH` overrides `~/.epi-logos/config.toml`).
fn invalid_tuning_value(path: &Path, message: &str) -> EmbeddingError {
    invalid_config(format!("[gemini_embedding].{message} in {}", path.display()))
}

fn invalid_config(message: impl Into<String>) -> EmbeddingError {
    EmbeddingError::Config {
        message: message.into(),
    }
}

#[derive(Debug)]
struct RateLimiter {
    semaphore: Arc<Semaphore>,
    max_rpm: usize,
    window: Mutex<VecDeque<Instant>>,
}

impl RateLimiter {
    fn new(config: RateLimitConfig) -> Self {
        Self {
            semaphore: Arc::new(Semaphore::new(config.max_concurrent)),
            max_rpm: config.max_rpm as usize,
            window: Mutex::new(VecDeque::new()),
        }
    }

    async fn acquire(&self) -> OwnedSemaphorePermit {
        self.semaphore
            .clone()
            .acquire_owned()
            .await
            .expect("rate limit semaphore should stay open")
    }

    async fn wait_rpm_turn(&self) {
        loop {
            let sleep_for = {
                let now = Instant::now();
                let minute = Duration::from_secs(60);
                let mut window = self.window.lock().expect("rate window lock");
                while let Some(front) = window.front() {
                    if now.duration_since(*front) >= minute {
                        window.pop_front();
                    } else {
                        break;
                    }
                }
                if window.len() < self.max_rpm {
                    window.push_back(now);
                    return;
                }
                window
                    .front()
                    .map(|front| minute.saturating_sub(now.duration_since(*front)))
                    .unwrap_or(Duration::from_millis(1))
            };
            tokio::time::sleep(sleep_for).await;
        }
    }
}

#[derive(Debug, Default, Clone, Deserialize)]
struct ConfigFile {
    gemini_embedding: Option<GeminiEmbeddingSection>,
    cloud_opt_in: Option<CloudOptInSection>,
}

#[derive(Debug, Default, Clone, Deserialize)]
struct GeminiEmbeddingSection {
    model_version: Option<String>,
    cache_root: Option<PathBuf>,
    canonical_context_limit_bytes: Option<usize>,
    max_rpm: Option<u32>,
    max_concurrent: Option<usize>,
    backoff_initial_ms: Option<u64>,
    backoff_factor: Option<f64>,
    jitter_ratio: Option<f64>,
    max_retries: Option<u32>,
}

#[derive(Debug, Default, Clone, Deserialize)]
struct CloudOptInSection {
    gemini_embedding: Option<CloudOptInRecord>,
}

#[derive(Debug, Default, Clone, Deserialize)]
struct CloudOptInRecord {
    recorded: Option<bool>,
    enabled: Option<bool>,
    scopes: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize)]
struct CacheRecord {
    model_version: String,
    document_hash: String,
    dim: usize,
    vector: Vec<f32>,
}

#[derive(Debug, Deserialize)]
struct GeminiEmbedResponse {
    embedding: GeminiEmbeddingValues,
}

#[derive(Debug, Deserialize)]
struct GeminiEmbeddingValues {
    values: Vec<f32>,
}
