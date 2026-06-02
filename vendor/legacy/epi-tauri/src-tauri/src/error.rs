use serde::Serialize;

#[derive(thiserror::Error, Debug)]
#[allow(dead_code)]
pub enum AppError {
    #[error("gateway error: {0}")]
    Gateway(String),
    #[error("graph error: {0}")]
    Graph(String),
    #[error("vault error: {0}")]
    Vault(String),
    #[error("temporal error: {0}")]
    Temporal(String),
    #[error("agent error: {0}")]
    Agent(String),
    #[error("io error: {0}")]
    Io(String),
    #[error("config error: {0}")]
    Config(String),
    #[error("not found: {0}")]
    NotFound(String),
    #[error("unauthorized: {0}")]
    Unauthorized(String),
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut s = serializer.serialize_struct("AppError", 2)?;
        let kind = match self {
            AppError::Gateway(_) => "gateway",
            AppError::Graph(_) => "graph",
            AppError::Vault(_) => "vault",
            AppError::Temporal(_) => "temporal",
            AppError::Agent(_) => "agent",
            AppError::Io(_) => "io",
            AppError::Config(_) => "config",
            AppError::NotFound(_) => "not_found",
            AppError::Unauthorized(_) => "unauthorized",
        };
        s.serialize_field("kind", kind)?;
        s.serialize_field("message", &self.to_string())?;
        s.end()
    }
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError::Io(e.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        AppError::Config(e.to_string())
    }
}
