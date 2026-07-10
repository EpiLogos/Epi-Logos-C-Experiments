//! `ApiKeyStore` — reports API-key presence from the process environment.
//!
//! The canonical user-side source is the shell (`~/.zshenv`). This store does
//! NOT parse zshenv; it relies on the shell having exported the keys into the
//! process environment. It reports `Present`/`Missing` per key and never
//! exposes a key value beyond the accessor that needs it.

use std::env;

/// Presence of a named API key, without ever surfacing the value.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum KeyPresence {
    Present,
    Missing,
}

impl KeyPresence {
    pub fn is_present(self) -> bool {
        matches!(self, KeyPresence::Present)
    }

    pub fn as_str(self) -> &'static str {
        match self {
            KeyPresence::Present => "present",
            KeyPresence::Missing => "missing",
        }
    }
}

/// Reads required and optional API keys from the process environment.
#[derive(Debug, Clone, Copy, Default)]
pub struct ApiKeyStore;

impl ApiKeyStore {
    pub fn from_env() -> Self {
        Self
    }

    /// Presence of `env_name` in the process environment. A key that is present
    /// but blank is treated as `Missing` — an exported-but-empty key is not
    /// usable, and reporting it `Present` would be misleading.
    pub fn presence(&self, env_name: &str) -> KeyPresence {
        classify(env::var(env_name).ok())
    }
}

/// Pure classification of a raw environment lookup — kept separate so it can be
/// tested without mutating global process environment (which races across the
/// parallel test harness).
fn classify(value: Option<String>) -> KeyPresence {
    match value {
        Some(raw) if !raw.trim().is_empty() => KeyPresence::Present,
        _ => KeyPresence::Missing,
    }
}

#[cfg(test)]
mod tests {
    use super::{classify, KeyPresence};

    #[test]
    fn present_key_with_value_is_present() {
        assert_eq!(classify(Some("sk-abc123".to_owned())), KeyPresence::Present);
    }

    #[test]
    fn missing_key_is_missing() {
        assert_eq!(classify(None), KeyPresence::Missing);
    }

    #[test]
    fn blank_or_whitespace_key_is_treated_as_missing() {
        assert_eq!(classify(Some(String::new())), KeyPresence::Missing);
        assert_eq!(classify(Some("   ".to_owned())), KeyPresence::Missing);
    }

    #[test]
    fn presence_reports_without_exposing_value() {
        // The public surface returns only a KeyPresence — there is no method
        // that yields the key value. This test documents that contract.
        assert_eq!(KeyPresence::Present.as_str(), "present");
        assert_eq!(KeyPresence::Missing.as_str(), "missing");
    }
}
