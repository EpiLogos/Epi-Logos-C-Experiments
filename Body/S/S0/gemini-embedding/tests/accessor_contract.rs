use std::{
    fs,
    future::Future,
    path::PathBuf,
    pin::Pin,
    sync::{Arc, Mutex},
};

use gemini_embedding::{
    BackendRequest, CloudOptInPolicy, EmbeddingBackend, EmbeddingConfig, EmbeddingError,
    GeminiEmbeddingAccessor, MockGeminiEmbeddingBackend, TaskType,
};

#[derive(Clone, Default)]
struct CountingBackend {
    calls: Arc<Mutex<usize>>,
}

impl CountingBackend {
    fn calls(&self) -> usize {
        *self.calls.lock().expect("calls lock")
    }
}

impl EmbeddingBackend for CountingBackend {
    fn embed<'a>(
        &'a self,
        request: BackendRequest<'a>,
    ) -> Pin<Box<dyn Future<Output = Result<Vec<f32>, EmbeddingError>> + Send + 'a>> {
        Box::pin(async move {
            *self.calls.lock().expect("calls lock") += 1;
            assert_eq!(request.output_dim, 3072);
            Ok((0..3072).map(|idx| idx as f32).collect())
        })
    }
}

#[tokio::test]
async fn cache_read_through_uses_backend_once_then_serves_from_cache() {
    let fixture = Fixture::new(true);
    let backend = CountingBackend::default();
    let accessor = GeminiEmbeddingAccessor::new(fixture.config(), backend.clone());

    let first = accessor
        .embed_document("same document", TaskType::RetrievalDocument, 3072)
        .await
        .expect("first embed");
    let second = accessor
        .embed_document("same document", TaskType::RetrievalDocument, 3072)
        .await
        .expect("second embed");

    assert_eq!(backend.calls(), 1);
    assert!(!first.cache_hit);
    assert!(second.cache_hit);
    assert_eq!(first.vector, second.vector);
}

#[tokio::test]
async fn matryoshka_dims_are_sliced_from_full_resolution_cache() {
    let fixture = Fixture::new(true);
    let backend = CountingBackend::default();
    let accessor = GeminiEmbeddingAccessor::new(fixture.config(), backend.clone());

    let full = accessor
        .embed_document("matryoshka document", TaskType::SemanticSimilarity, 3072)
        .await
        .expect("full embed");
    let half = accessor
        .embed_document("matryoshka document", TaskType::SemanticSimilarity, 1536)
        .await
        .expect("half embed");
    let quarter = accessor
        .embed_document("matryoshka document", TaskType::SemanticSimilarity, 768)
        .await
        .expect("quarter embed");

    assert_eq!(backend.calls(), 1);
    assert_eq!(half.vector, full.vector[..1536]);
    assert_eq!(quarter.vector, full.vector[..768]);
    assert!(half.cache_hit);
    assert!(quarter.cache_hit);
}

#[tokio::test]
async fn missing_cloud_opt_in_returns_typed_refusal() {
    let fixture = Fixture::new(false);
    let accessor = GeminiEmbeddingAccessor::new(fixture.config(), CountingBackend::default());

    let error = accessor
        .embed_document("private document", TaskType::RetrievalDocument, 3072)
        .await
        .expect_err("opt-in should be required");

    match error {
        EmbeddingError::CloudOptInRequired {
            accessor,
            scope,
            command,
        } => {
            assert_eq!(accessor, "gemini_embedding");
            assert_eq!(scope, "RETRIEVAL_DOCUMENT");
            assert_eq!(command, "epi settings opt-in gemini_embedding");
        }
        other => panic!("unexpected error: {other:?}"),
    }
}

#[tokio::test]
async fn mock_backend_vectors_are_deterministic_by_document_hash() {
    let fixture = Fixture::new(true);
    let backend = MockGeminiEmbeddingBackend::default();
    let accessor = GeminiEmbeddingAccessor::new(fixture.config(), backend);

    let first = accessor
        .embed_document("mocked document", TaskType::RetrievalDocument, 768)
        .await
        .expect("first mock embed");
    let second = accessor
        .embed_document("mocked document", TaskType::RetrievalDocument, 768)
        .await
        .expect("second mock embed");
    let different = accessor
        .embed_document("different document", TaskType::RetrievalDocument, 768)
        .await
        .expect("different mock embed");

    assert_eq!(first.vector, second.vector);
    assert_ne!(first.vector, different.vector);
    assert_eq!(first.vector.len(), 768);
}

struct Fixture {
    _dir: tempfile::TempDir,
    settings_path: PathBuf,
    cache_root: PathBuf,
}

impl Fixture {
    fn new(opted_in: bool) -> Self {
        let dir = tempfile::tempdir().expect("tempdir");
        let settings_path = dir.path().join("config.toml");
        let cache_root = dir.path().join("cache");
        let opt_in = if opted_in {
            r#"
[cloud_opt_in.gemini_embedding]
recorded = true
scopes = ["RETRIEVAL_DOCUMENT", "SEMANTIC_SIMILARITY"]
"#
        } else {
            ""
        };
        fs::write(
            &settings_path,
            format!(
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
{opt_in}
"#
            ),
        )
        .expect("write config");

        Self {
            _dir: dir,
            settings_path,
            cache_root,
        }
    }

    fn config(&self) -> EmbeddingConfig {
        let mut config = EmbeddingConfig::from_file(&self.settings_path).expect("load config");
        config.cache_root = self.cache_root.clone();
        config.policy = CloudOptInPolicy::from_file(&self.settings_path);
        config
    }
}
