use gemini_embedding::{
    GeminiEmbeddingAccessor, LiveGeminiEmbeddingBackend, TaskType, FULL_RESOLUTION_DIM,
};

#[derive(Debug)]
pub struct EmbeddingConfig {
    pub api_key: String,
    pub model: String,
    pub dimensions: usize,
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

        let dimensions = std::env::var("GEMINI_EMBED_DIMS")
            .or_else(|_| std::env::var("GEMINI_EMBEDDING_DIMS"))
            .ok()
            .and_then(|s| s.parse().ok())
            .unwrap_or(FULL_RESOLUTION_DIM);
        inner
            .target_dim(dimensions)
            .map_err(|error| error.to_string())?;

        Ok(Self {
            api_key,
            model: inner.model_version.clone(),
            dimensions,
            inner,
        })
    }
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

    #[test]
    fn test_config_from_env_missing_key() {
        let _lock = ENV_MUTEX.lock().unwrap();
        std::env::remove_var("GEMINI_API_KEY");
        let result = EmbeddingConfig::from_env();
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("GEMINI_API_KEY not set"));
    }

    #[test]
    fn test_config_from_env_with_key() {
        let _lock = ENV_MUTEX.lock().unwrap();
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

    #[test]
    fn test_config_custom_model_and_dims() {
        let _lock = ENV_MUTEX.lock().unwrap();
        std::env::set_var("GEMINI_API_KEY", "test-key");
        let config_path = write_config("graph-services-custom-config.toml");
        std::env::set_var(gemini_embedding::DEFAULT_SETTINGS_PATH_ENV, &config_path);
        std::env::set_var("GEMINI_EMBED_MODEL", "text-embedding-005");
        std::env::set_var("GEMINI_EMBED_DIMS", "1536");
        let config = EmbeddingConfig::from_env().unwrap();
        assert_eq!(config.model, "text-embedding-005");
        assert_eq!(config.dimensions, 1536);
        std::env::remove_var("GEMINI_API_KEY");
        std::env::remove_var("GEMINI_EMBED_MODEL");
        std::env::remove_var("GEMINI_EMBED_DIMS");
        std::env::remove_var(gemini_embedding::DEFAULT_SETTINGS_PATH_ENV);
        std::fs::remove_file(config_path).unwrap();
    }

    #[test]
    fn test_config_invalid_dims_is_rejected() {
        let _lock = ENV_MUTEX.lock().unwrap();
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
            inner: test_inner_config(),
        });
        assert_eq!(client.dimensions(), 3072);
        assert_eq!(client.model(), "gemini-embedding-2-preview");
    }

    #[tokio::test]
    #[ignore] // requires GEMINI_API_KEY
    async fn test_embed_real() {
        let config = EmbeddingConfig::from_env().unwrap();
        let client = GeminiEmbeddingClient::new(config);
        let result = client.embed("Hello, world!").await.unwrap();
        assert!(!result.is_empty());
    }

    #[tokio::test]
    #[ignore] // requires GEMINI_API_KEY
    async fn test_embed_batch_real() {
        let config = EmbeddingConfig::from_env().unwrap();
        let client = GeminiEmbeddingClient::new(config);
        let results = client.embed_batch(&["Hello", "World"]).await.unwrap();
        assert_eq!(results.len(), 2);
    }

    fn test_inner_config() -> gemini_embedding::EmbeddingConfig {
        let mut config = gemini_embedding::EmbeddingConfig::from_file(write_config(
            "graph-services-inner-config.toml",
        ))
        .unwrap();
        config.api_key = Some("test".to_owned());
        config
    }

    fn write_config(name: &str) -> std::path::PathBuf {
        let path = std::env::temp_dir().join(format!("{}-{name}", std::process::id()));
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
