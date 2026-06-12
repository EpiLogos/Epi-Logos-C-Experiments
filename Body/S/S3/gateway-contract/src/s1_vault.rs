use serde::{Deserialize, Serialize};

// ============= 03.T6.5 S1 vault gateway surface =============
//
// The gateway is the canonical write gatekeeper for the Obsidian vault per
// IOD-19. Theia and agents NEVER write directly to the vault filesystem —
// they invoke `s1'.vault.{read_file, write_file, move_file, rename_file}`
// and the gateway delegates to Hen (the S1 compiler) which enforces
// wikilink integrity, path soundness, and the protected-path privacy class.
//
// `s1'.semantic.suggest_links` wraps Hen's `suggest_link_candidates` so the
// kernel-bridge and M-extensions can consume the same typed candidate
// payload (ExplicitOutlink / SemanticSource / SemanticBlock) via gateway
// RPC instead of reading the smart_env JSON directly.

/// 03.T6.5: privacy classification for a vault path. `Public` means
/// ordinary vault content (notes, blocks, frontmatter). `Protected` means
/// content under `Idea/Pratibimba/Nara/<day>/protected/...` — Nara journal
/// bodies, dream bodies, raw birth data — which MUST NOT be exposed
/// through s1'.vault.* or s1'.semantic.* unless the caller carries the
/// governed protected capability per UFV-01 + IOD-17.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum S1VaultPathPrivacyClass {
    Public,
    Protected,
}

/// 03.T6.5: classify a vault-relative path. Returns `Protected` when the
/// path lies under any `Idea/Pratibimba/Nara/<day>/protected/...` segment;
/// `Public` otherwise. Paths are normalised to forward-slash form before
/// matching so Windows-style separators are accepted on caller's behalf.
pub fn classify_vault_path_privacy(vault_relative_path: &str) -> S1VaultPathPrivacyClass {
    let normalised = vault_relative_path.replace('\\', "/");
    let trimmed = normalised.trim_start_matches('/');
    // Match the alpha-spec invariant: any `Nara/<day>/protected` segment
    // marks the rest of the path as protected, regardless of depth.
    if trimmed
        .split('/')
        .collect::<Vec<_>>()
        .windows(3)
        .any(|window| window[0] == "Nara" && window[2] == "protected")
    {
        return S1VaultPathPrivacyClass::Protected;
    }
    // Also catch the direct `Idea/Pratibimba/Nara/<day>/protected/...` form
    // as the canonical vault root layout.
    if trimmed.contains("Pratibimba/Nara/") && trimmed.contains("/protected/") {
        return S1VaultPathPrivacyClass::Protected;
    }
    S1VaultPathPrivacyClass::Public
}

/// 03.T6.5: a wikilink reference inside a markdown document, located so
/// rename/move reconciliation can rewrite it atomically.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct S1WikilinkReference {
    pub source_path: String,
    pub target_title: String,
    pub line_index: usize,
    pub byte_start: usize,
    pub byte_end: usize,
}

/// 03.T6.5: the result of a vault rename or move. Carries the list of
/// referring documents that were reconciled (their `[[X]]` updated to
/// `[[Y]]`) and any documents that were refused because the rename would
/// orphan a heading or break a Bimba-coordinate anchor.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct S1VaultRenameReceipt {
    pub from_path: String,
    pub to_path: String,
    pub reconciled_documents: Vec<String>,
    pub reconciled_link_count: usize,
    pub refusals: Vec<S1VaultRenameRefusal>,
}

/// 03.T6.5: a refusal carried in `S1VaultRenameReceipt.refusals` when the
/// rename would break a wikilink the gateway cannot safely rewrite (e.g.,
/// heading anchor `[[X#heading]]` and the heading no longer exists in the
/// destination).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct S1VaultRenameRefusal {
    pub source_path: String,
    pub reason: S1VaultRenameRefusalReason,
    pub detail: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum S1VaultRenameRefusalReason {
    OrphanHeading,
    OrphanBlockAnchor,
    BimbaCoordinateBreak,
    ProtectedPath,
}

/// 03.T6.5: typed candidate kind from Hen's `LinkCandidateKind`. Mirrored
/// in the gateway contract so consumers don't need to depend on the Hen
/// crate directly to consume the semantic response.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum S1SemanticCandidateKind {
    ExplicitOutlink,
    SemanticSource,
    SemanticBlock,
}

/// 03.T6.5: one semantic link candidate.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct S1SemanticCandidate {
    pub target_path: String,
    pub wikilink_title: String,
    pub score: f32,
    pub kind: S1SemanticCandidateKind,
    pub evidence_source_path: String,
    pub evidence_lines: Option<(usize, usize)>,
    pub stale: bool,
    pub privacy_class: S1VaultPathPrivacyClass,
}

/// 03.T6.5: a `s1'.semantic.suggest_links` response. Carries staleness so
/// consumers can decide whether to act on the candidates or refresh.
/// `staleness` aggregates per-candidate `stale` flags into a single
/// kernel-bridge-friendly state.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct S1SemanticResponse {
    pub seed_sources: Vec<String>,
    pub candidates: Vec<S1SemanticCandidate>,
    pub warnings: Vec<String>,
    pub staleness: S1SemanticStaleness,
    pub smart_env_index_path: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum S1SemanticStaleness {
    /// Every candidate's underlying source was indexed after the note's
    /// last mtime — the index is current.
    Current,
    /// At least one candidate's underlying source has been modified since
    /// it was last indexed — consumer may want to refresh.
    Stale,
    /// The smart_env index could not be located at all (e.g., the vault
    /// hasn't been indexed yet) — consumer should treat candidates as
    /// best-effort and refresh before acting.
    NoIndex,
}
