use std::process::Command;

use super::config::{SecretProvider, SecretsConfig};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SecretStatus {
    Resolved,
    Missing,
    Unavailable { diagnostic: String },
    Error { diagnostic: String },
}

#[derive(Debug, Clone)]
pub struct SecretResolver {
    config: SecretsConfig,
}

#[derive(Debug, Clone, PartialEq, Eq)]
enum ResolveFailure {
    Missing(String),
    Unavailable(String),
    Error(String),
}

impl SecretResolver {
    pub fn new(config: SecretsConfig) -> Self {
        Self { config }
    }

    pub fn status(&self, secret_ref: &str) -> SecretStatus {
        match self.resolve_internal(secret_ref) {
            Ok(_) => SecretStatus::Resolved,
            Err(ResolveFailure::Missing(_)) => SecretStatus::Missing,
            Err(ResolveFailure::Unavailable(diagnostic)) => {
                SecretStatus::Unavailable { diagnostic }
            }
            Err(ResolveFailure::Error(diagnostic)) => SecretStatus::Error { diagnostic },
        }
    }

    pub fn resolve(&self, secret_ref: &str) -> Result<String, String> {
        self.resolve_internal(secret_ref)
            .map_err(|failure| match failure {
                ResolveFailure::Missing(diagnostic)
                | ResolveFailure::Unavailable(diagnostic)
                | ResolveFailure::Error(diagnostic) => diagnostic,
            })
    }

    fn resolve_internal(&self, secret_ref: &str) -> Result<String, ResolveFailure> {
        let secret_ref = secret_ref.trim();
        if secret_ref.is_empty() {
            return Err(ResolveFailure::Missing(
                "secret reference is empty".to_owned(),
            ));
        }
        match self.config.provider {
            SecretProvider::Env => self.resolve_env(secret_ref),
            SecretProvider::OnePassword => self.resolve_one_password(secret_ref),
            SecretProvider::Varlock => self.resolve_varlock(secret_ref),
        }
    }

    fn resolve_env(&self, secret_ref: &str) -> Result<String, ResolveFailure> {
        std::env::var(secret_ref).map_err(|_| {
            ResolveFailure::Missing(format!("environment secret {secret_ref} is not set"))
        })
    }

    fn resolve_one_password(&self, secret_ref: &str) -> Result<String, ResolveFailure> {
        let reference = if secret_ref.starts_with("op://") {
            secret_ref.to_owned()
        } else if let Some(vault) = self.config.one_password_vault.as_deref() {
            format!("op://{vault}/{secret_ref}")
        } else {
            secret_ref.to_owned()
        };
        let output = Command::new("op").arg("read").arg(reference).output();
        resolve_command_output("op", output)
    }

    fn resolve_varlock(&self, secret_ref: &str) -> Result<String, ResolveFailure> {
        let mut command = Command::new("varlock");
        command.arg("get");
        if let Some(profile) = self.config.varlock_profile.as_deref() {
            command.arg("--profile").arg(profile);
        }
        let output = command.arg(secret_ref).output();
        resolve_command_output("varlock", output)
    }
}

fn resolve_command_output(
    binary: &str,
    output: std::io::Result<std::process::Output>,
) -> Result<String, ResolveFailure> {
    let output = output.map_err(|err| {
        if err.kind() == std::io::ErrorKind::NotFound {
            ResolveFailure::Unavailable(format!("{binary} CLI is not available on PATH"))
        } else {
            ResolveFailure::Error(format!("{binary} CLI failed to start: {err}"))
        }
    })?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_owned();
        let diagnostic = if stderr.is_empty() {
            format!("{binary} CLI exited with status {}", output.status)
        } else {
            format!(
                "{binary} CLI exited with status {}: {stderr}",
                output.status
            )
        };
        return Err(ResolveFailure::Error(diagnostic));
    }
    Ok(String::from_utf8_lossy(&output.stdout)
        .trim_end()
        .to_owned())
}
