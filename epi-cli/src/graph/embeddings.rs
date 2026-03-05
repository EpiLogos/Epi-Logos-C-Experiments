pub struct GeminiEmbeddingClient {
    api_key: String,
}

impl GeminiEmbeddingClient {
    pub fn new(api_key: String) -> Self {
        Self { api_key }
    }

    pub fn embed(&self, text: &str) -> Result<Vec<f32>, String> {
        if self.api_key.is_empty() {
            return Err("GEMINI_API_KEY not set".to_string());
        }
        // Stub: return zero vector
        let _ = text;
        Ok(vec![0.0f32; 768])
    }
}
