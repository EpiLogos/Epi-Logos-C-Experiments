use reqwest::Client as HttpClient;

#[derive(Debug)]
pub struct EmbeddingConfig {
    pub api_key: String,
    pub model: String,
    pub dimensions: usize,
}

impl EmbeddingConfig {
    pub fn from_env() -> Result<Self, String> {
        Ok(Self {
            api_key: std::env::var("GEMINI_API_KEY")
                .map_err(|_| "GEMINI_API_KEY not set".to_string())?,
            model: std::env::var("GEMINI_EMBED_MODEL")
                .unwrap_or_else(|_| "gemini-embedding-001".into()),
            dimensions: std::env::var("GEMINI_EMBED_DIMS")
                .ok()
                .and_then(|s| s.parse().ok())
                .unwrap_or(768),
        })
    }
}

pub struct GeminiEmbeddingClient {
    config: EmbeddingConfig,
    http: HttpClient,
}

impl GeminiEmbeddingClient {
    pub fn new(config: EmbeddingConfig) -> Self {
        Self {
            config,
            http: HttpClient::new(),
        }
    }

    pub async fn embed(&self, text: &str) -> Result<Vec<f32>, String> {
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:embedContent?key={}",
            self.config.model, self.config.api_key
        );
        let body = serde_json::json!({
            "model": format!("models/{}", self.config.model),
            "content": { "parts": [{ "text": text }] },
            "outputDimensionality": self.config.dimensions,
        });
        let resp = self
            .http
            .post(&url)
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("embed request failed: {}", e))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            return Err(format!("embed API error {}: {}", status, body));
        }

        let data: serde_json::Value = resp
            .json()
            .await
            .map_err(|e| format!("embed parse failed: {}", e))?;

        let values = data["embedding"]["values"]
            .as_array()
            .ok_or("missing embedding.values in response")?
            .iter()
            .map(|v| v.as_f64().unwrap_or(0.0) as f32)
            .collect();
        Ok(values)
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
        std::env::remove_var("GEMINI_EMBED_MODEL");
        std::env::remove_var("GEMINI_EMBED_DIMS");
        let config = EmbeddingConfig::from_env().unwrap();
        assert_eq!(config.api_key, "test-key-12345");
        assert_eq!(config.model, "gemini-embedding-001");
        assert_eq!(config.dimensions, 768);
        std::env::remove_var("GEMINI_API_KEY");
    }

    #[test]
    fn test_config_custom_model_and_dims() {
        let _lock = ENV_MUTEX.lock().unwrap();
        std::env::set_var("GEMINI_API_KEY", "test-key");
        std::env::set_var("GEMINI_EMBED_MODEL", "text-embedding-005");
        std::env::set_var("GEMINI_EMBED_DIMS", "1536");
        let config = EmbeddingConfig::from_env().unwrap();
        assert_eq!(config.model, "text-embedding-005");
        assert_eq!(config.dimensions, 1536);
        std::env::remove_var("GEMINI_API_KEY");
        std::env::remove_var("GEMINI_EMBED_MODEL");
        std::env::remove_var("GEMINI_EMBED_DIMS");
    }

    #[test]
    fn test_config_invalid_dims_falls_back() {
        let _lock = ENV_MUTEX.lock().unwrap();
        std::env::set_var("GEMINI_API_KEY", "test-key");
        std::env::set_var("GEMINI_EMBED_DIMS", "not-a-number");
        let config = EmbeddingConfig::from_env().unwrap();
        assert_eq!(config.dimensions, 768);
        std::env::remove_var("GEMINI_API_KEY");
        std::env::remove_var("GEMINI_EMBED_DIMS");
    }

    #[test]
    fn test_client_dimensions() {
        let client = GeminiEmbeddingClient::new(EmbeddingConfig {
            api_key: "test".into(),
            model: "gemini-embedding-001".into(),
            dimensions: 3072,
        });
        assert_eq!(client.dimensions(), 3072);
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
        let results = client
            .embed_batch(&["Hello", "World"])
            .await
            .unwrap();
        assert_eq!(results.len(), 2);
    }
}
