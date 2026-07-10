//! `SettingsManifest` — declares the set of API keys the system knows about and
//! their privacy class. Drives `epi settings status` rendering and maps a key to
//! the stable opt-in id used in the `[cloud_opt_in.<id>]` config section.

/// Privacy class of a manifest key.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PrivacyClass {
    /// Used only for local computation; no cloud dispatch, no opt-in required.
    LocalOnly,
    /// Cloud-class use is gated by a recorded opt-in per [[M'-MODEL-SLOT-SPEC]].
    CloudOptIn,
}

impl PrivacyClass {
    pub fn as_str(self) -> &'static str {
        match self {
            PrivacyClass::LocalOnly => "local-only",
            PrivacyClass::CloudOptIn => "cloud-opt-in",
        }
    }
}

/// One key the manifest declares.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ManifestEntry {
    /// Environment variable the key is read from (e.g. `GEMINI_API_KEY`).
    pub env_name: &'static str,
    /// Stable opt-in id used in `[cloud_opt_in.<id>]` (e.g. `gemini_embedding`).
    /// `None` for local-only keys that carry no opt-in.
    pub opt_in_key: Option<&'static str>,
    pub privacy: PrivacyClass,
    pub required: bool,
}

/// The declared set of keys + privacy classes.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SettingsManifest {
    entries: Vec<ManifestEntry>,
}

impl SettingsManifest {
    /// The canonical manifest. Provider API keys are cloud-opt-in and read from
    /// the process environment; the gemini id matches the accessor's
    /// `[cloud_opt_in.gemini_embedding]` reader so opt-in interoperates.
    pub fn canonical() -> Self {
        Self {
            entries: vec![
                ManifestEntry {
                    env_name: "GEMINI_API_KEY",
                    opt_in_key: Some("gemini_embedding"),
                    privacy: PrivacyClass::CloudOptIn,
                    required: false,
                },
                ManifestEntry {
                    env_name: "ANTHROPIC_API_KEY",
                    opt_in_key: Some("anthropic"),
                    privacy: PrivacyClass::CloudOptIn,
                    required: false,
                },
                ManifestEntry {
                    env_name: "OPENAI_API_KEY",
                    opt_in_key: Some("openai"),
                    privacy: PrivacyClass::CloudOptIn,
                    required: false,
                },
            ],
        }
    }

    pub fn entries(&self) -> &[ManifestEntry] {
        &self.entries
    }

    /// Resolve a manifest entry by its opt-in id (the `<key>` in
    /// `epi settings opt-in <key>`).
    pub fn find_by_opt_in_key(&self, opt_in_key: &str) -> Option<&ManifestEntry> {
        self.entries
            .iter()
            .find(|entry| entry.opt_in_key == Some(opt_in_key))
    }

    pub fn find_by_env_name(&self, env_name: &str) -> Option<&ManifestEntry> {
        self.entries.iter().find(|entry| entry.env_name == env_name)
    }
}

#[cfg(test)]
mod tests {
    use super::{PrivacyClass, SettingsManifest};

    #[test]
    fn canonical_manifest_declares_gemini_as_cloud_opt_in() {
        let manifest = SettingsManifest::canonical();
        let gemini = manifest
            .find_by_env_name("GEMINI_API_KEY")
            .expect("gemini key present in canonical manifest");
        assert_eq!(gemini.privacy, PrivacyClass::CloudOptIn);
        assert_eq!(gemini.opt_in_key, Some("gemini_embedding"));
    }

    #[test]
    fn opt_in_key_maps_back_to_the_accessor_id() {
        let manifest = SettingsManifest::canonical();
        // `gemini_embedding` is the exact id the accessor's CloudOptInPolicy reads.
        assert!(manifest.find_by_opt_in_key("gemini_embedding").is_some());
        assert!(manifest.find_by_opt_in_key("does_not_exist").is_none());
    }

    #[test]
    fn every_entry_has_a_stable_env_name() {
        let manifest = SettingsManifest::canonical();
        assert!(!manifest.entries().is_empty());
        for entry in manifest.entries() {
            assert!(!entry.env_name.is_empty());
        }
    }
}
