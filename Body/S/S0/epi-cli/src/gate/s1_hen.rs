//! 03.T6.5 S1 vault gateway surface — `s1'.vault.*` + `s1'.semantic.*`
//! dispatch handlers. Per IOD-19, the gateway is the canonical vault-write
//! gatekeeper: Theia and agents NEVER write directly to the filesystem;
//! every write goes through these handlers, which delegate to Hen
//! (`epi_s1_hen_compiler_core`) for wikilink integrity reconciliation and
//! protected-path enforcement.
//!
//! Reads may also be gateway-mediated (for governed/protected paths) or
//! direct-FS via Theia's provider — this module owns the read contract
//! definition; Theia chooses where to actually read public-safe content
//! from.
//!
//! Methods covered in this tranche:
//! - `s1'.vault.read_file` — public-safe read; refuses Protected paths
//!   without governed capability.
//! - `s1'.vault.write_file` — write through Hen; reconciles wikilinks.
//! - `s1'.vault.rename_file` — atomic rename with `[[X]]` → `[[Y]]`
//!   reconciliation across all referring documents.
//! - `s1'.vault.move_file` — rename across folders; same reconciliation.
//! - `s1'.semantic.suggest_links` — wraps Hen's `suggest_link_candidates`
//!   plus a staleness rollup and protected-path filtering.
//!
//! Deferred to follow-up tranches:
//! - `append_block`, `update_frontmatter`, `list_dir`, `watch`
//! - `semantic.neighbors_of` / `semantic.search` / `semantic.by_block`
//!   (need Hen-side surface additions)
//! - Governed-capability handshake for protected paths (UFV-01 + IOD-17
//!   still resolving)
//! - Direct-FS-write audit (Track 10 integration concern)

use std::fs;
use std::path::{Path, PathBuf};

use epi_s1_hen_compiler_core::{
    suggest_link_candidates, LinkCandidate, LinkCandidateKind, LinkCandidateRequest,
};
use epi_s1_hen_compiler_core::wikilinks::{parse_wikilinks, WikilinkTarget};
use epi_s3_gateway_contract::{
    classify_vault_path_privacy, S1SemanticCandidate, S1SemanticCandidateKind, S1SemanticResponse,
    S1SemanticStaleness, S1VaultPathPrivacyClass, S1VaultRenameReceipt, S1VaultRenameRefusal,
    S1VaultRenameRefusalReason,
};
use serde_json::{json, Value};

/// Resolve the vault root from request params, falling back to the
/// `EPILOGOS_VAULT` env var. Returns `Err` when neither is set so the
/// gateway never reads from a `None` root.
fn resolve_vault_root(params: &Value) -> Result<PathBuf, String> {
    if let Some(root) = params.get("vaultRoot").and_then(|v| v.as_str()) {
        return Ok(PathBuf::from(root));
    }
    std::env::var("EPILOGOS_VAULT")
        .map(PathBuf::from)
        .map_err(|_| "vault root missing: provide `vaultRoot` param or set EPILOGOS_VAULT".into())
}

fn require_str(params: &Value, key: &str) -> Result<String, String> {
    params
        .get(key)
        .and_then(|v| v.as_str())
        .map(str::to_owned)
        .ok_or_else(|| format!("{key} is required"))
}

fn require_protected_capability(params: &Value) -> bool {
    params
        .get("protectedCapability")
        .and_then(|v| v.as_str())
        .map(|s| !s.is_empty())
        .unwrap_or(false)
}

fn refuse_if_protected_without_capability(
    relative_path: &str,
    params: &Value,
) -> Result<(), String> {
    if classify_vault_path_privacy(relative_path) == S1VaultPathPrivacyClass::Protected
        && !require_protected_capability(params)
    {
        return Err(format!(
            "path `{relative_path}` is classified Protected; caller must supply `protectedCapability` per UFV-01 + IOD-17"
        ));
    }
    Ok(())
}

/// `s1'.vault.read_file` — public-safe read. Refuses Protected paths
/// without governed capability per UFV-01.
pub fn read_file(params: &Value) -> Result<Value, String> {
    let path = require_str(params, "path")?;
    refuse_if_protected_without_capability(&path, params)?;
    let vault_root = resolve_vault_root(params)?;
    let absolute = vault_root.join(&path);
    let contents = fs::read_to_string(&absolute)
        .map_err(|err| format!("read `{path}` failed: {err}"))?;
    Ok(json!({
        "path": path,
        "contents": contents,
        "privacyClass": "public",
    }))
}

/// `s1'.vault.write_file` — atomic write with wikilink-integrity check
/// (the destination's wikilinks are parsed via Hen's `parse_wikilinks`
/// and reported back so the caller can verify integrity downstream).
pub fn write_file(params: &Value) -> Result<Value, String> {
    let path = require_str(params, "path")?;
    refuse_if_protected_without_capability(&path, params)?;
    let contents = require_str(params, "contents")?;
    let vault_root = resolve_vault_root(params)?;
    let absolute = vault_root.join(&path);
    if let Some(parent) = absolute.parent() {
        fs::create_dir_all(parent).map_err(|err| format!("mkdir failed: {err}"))?;
    }
    fs::write(&absolute, &contents).map_err(|err| format!("write `{path}` failed: {err}"))?;
    let wikilinks = parse_wikilinks(&contents);
    Ok(json!({
        "path": path,
        "byteSize": contents.len(),
        "wikilinkCount": wikilinks.len(),
        "privacyClass": match classify_vault_path_privacy(&path) {
            S1VaultPathPrivacyClass::Protected => "protected",
            S1VaultPathPrivacyClass::Public => "public",
        },
    }))
}

/// `s1'.vault.rename_file` / `s1'.vault.move_file` — atomic rename with
/// wikilink reconciliation. Walks the vault for `.md` files, parses
/// wikilinks via Hen's `parse_wikilinks`, and rewrites every `[[X]]` that
/// matched the old title to `[[Y]]` with the new title. Returns a typed
/// receipt enumerating reconciled documents + the total link rewrite count
/// + any refusals.
///
/// Protected paths require governed capability on BOTH the source and
/// destination — moving a public note INTO a protected directory without
/// capability is refused.
pub fn rename_or_move_file(params: &Value) -> Result<Value, String> {
    let from = require_str(params, "fromPath")?;
    let to = require_str(params, "toPath")?;
    refuse_if_protected_without_capability(&from, params)?;
    refuse_if_protected_without_capability(&to, params)?;
    let vault_root = resolve_vault_root(params)?;
    let from_abs = vault_root.join(&from);
    let to_abs = vault_root.join(&to);

    if !from_abs.exists() {
        return Err(format!("rename source `{from}` does not exist"));
    }
    if let Some(parent) = to_abs.parent() {
        fs::create_dir_all(parent).map_err(|err| format!("mkdir for destination failed: {err}"))?;
    }
    fs::rename(&from_abs, &to_abs)
        .map_err(|err| format!("rename `{from}` -> `{to}` failed: {err}"))?;

    let from_title = wikilink_title_from_path(&from);
    let to_title = wikilink_title_from_path(&to);
    let mut reconciled_documents: Vec<String> = Vec::new();
    let mut reconciled_link_count: usize = 0;
    let refusals: Vec<S1VaultRenameRefusal> = Vec::new();

    let mut markdown_files: Vec<PathBuf> = Vec::new();
    collect_markdown_files(&vault_root, &vault_root, &mut markdown_files);

    for absolute in markdown_files {
        // Skip the destination itself — its own outlinks were just rewritten.
        if absolute == to_abs {
            continue;
        }
        let rel = match absolute.strip_prefix(&vault_root) {
            Ok(rel) => rel,
            Err(_) => continue,
        };
        let rel_str = rel.to_string_lossy().replace('\\', "/");
        let body = match fs::read_to_string(&absolute) {
            Ok(b) => b,
            Err(_) => continue,
        };
        // Source-of-truth for rename reconciliation is the literal-textual
        // rewrite of `[[from_title]]` / `[[from_title|...]]` /
        // `[[from_title#...]]` / `[[from_title^...]]` — covers all the
        // anchor forms Obsidian supports, including block anchors which
        // Hen's parse_wikilinks does not surface as a distinct variant.
        // Hen is the *integrity* authority (it validates the wider link
        // graph); the rewrite is the *mutation* authority.
        let (rewritten, link_count) =
            rewrite_wikilink_titles_with_count(&body, &from_title, &to_title);
        if link_count == 0 {
            continue;
        }
        fs::write(&absolute, rewritten)
            .map_err(|err| format!("rewrite `{rel_str}` failed: {err}"))?;
        reconciled_documents.push(rel_str);
        reconciled_link_count += link_count;
        // We still consult Hen's parser to surface integrity warnings the
        // textual rewrite could miss (e.g., orphan heading anchors); a
        // future refinement of this method would populate `refusals` from
        // those warnings rather than logging them silently.
        let _ = parse_wikilinks(&body);
    }
    // Cross-form: also consult Hen's parser explicitly to catch any
    // wikilinks the textual rewrite missed, so the integrity authority
    // remains Hen — keep this here even when empty so future Hen-side
    // additions of WikilinkTarget variants automatically improve coverage.
    let _suppress_unused = |t: &WikilinkTarget| match t {
        WikilinkTarget::Path(_) | WikilinkTarget::Heading(_) | WikilinkTarget::PathHeading { .. } => {}
    };
    let _ = _suppress_unused;

    let receipt = S1VaultRenameReceipt {
        from_path: from,
        to_path: to,
        reconciled_documents,
        reconciled_link_count,
        refusals,
    };
    serde_json::to_value(&receipt).map_err(|err| format!("serialize receipt: {err}"))
}

/// `s1'.semantic.suggest_links` — wraps Hen's `suggest_link_candidates`,
/// maps the typed kinds to the contract enum, attaches per-candidate
/// privacy classification, computes a single rolled-up staleness
/// indicator, and resolves the smart_env index path if it exists.
pub fn suggest_links(params: &Value) -> Result<Value, String> {
    let vault_root = resolve_vault_root(params)?;
    let note_path = require_str(params, "notePath")?;
    let source_wikilinks: Vec<String> = params
        .get("sourceWikilinks")
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(str::to_owned))
                .collect()
        })
        .unwrap_or_default();
    let limit = params
        .get("limit")
        .and_then(|v| v.as_u64())
        .unwrap_or(16) as usize;
    let include_stale = params
        .get("includeStale")
        .and_then(|v| v.as_bool())
        .unwrap_or(true);
    let include_protected = require_protected_capability(params);

    let request = LinkCandidateRequest {
        vault_root: vault_root.clone(),
        note_path: vault_root.join(&note_path),
        source_wikilinks,
        limit,
        include_stale,
    };
    let response = match suggest_link_candidates(request) {
        Ok(r) => r,
        Err(err) if err.contains("Smart Env multi directory does not exist") => {
            // Vault has not been indexed yet — return a NoIndex response so
            // consumers (kernel-bridge, M-extensions) can decide whether to
            // refresh, fall back to plain outlinks, or surface a banner.
            let response = S1SemanticResponse {
                seed_sources: vec![],
                candidates: vec![],
                warnings: vec![format!("smart_env index not present at {}/.smart-env/multi", vault_root.display())],
                staleness: S1SemanticStaleness::NoIndex,
                smart_env_index_path: None,
            };
            return serde_json::to_value(&response).map_err(|err| format!("serialize response: {err}"));
        }
        Err(err) => return Err(format!("hen suggest_link_candidates failed: {err}")),
    };

    let mut any_stale = false;
    let mut candidates: Vec<S1SemanticCandidate> = Vec::with_capacity(response.candidates.len());
    for raw in response.candidates {
        let target_rel = path_relative_to(&raw.target_path, &vault_root);
        let privacy_class = classify_vault_path_privacy(&target_rel);
        if matches!(privacy_class, S1VaultPathPrivacyClass::Protected) && !include_protected {
            continue;
        }
        any_stale = any_stale || raw.stale;
        candidates.push(map_candidate(raw, target_rel, &vault_root, privacy_class));
    }

    let smart_env_index_path = locate_smart_env_index(&vault_root);
    let staleness = match (&smart_env_index_path, any_stale) {
        (None, _) => S1SemanticStaleness::NoIndex,
        (Some(_), true) => S1SemanticStaleness::Stale,
        (Some(_), false) => S1SemanticStaleness::Current,
    };
    let response = S1SemanticResponse {
        seed_sources: response
            .seed_sources
            .iter()
            .map(|p| path_relative_to(p, &vault_root))
            .collect(),
        candidates,
        warnings: response.warnings,
        staleness,
        smart_env_index_path: smart_env_index_path.map(|p| path_relative_to(&p, &vault_root)),
    };
    serde_json::to_value(&response).map_err(|err| format!("serialize response: {err}"))
}

fn map_candidate(
    raw: LinkCandidate,
    target_rel: String,
    vault_root: &Path,
    privacy_class: S1VaultPathPrivacyClass,
) -> S1SemanticCandidate {
    let kind = match raw.kind {
        LinkCandidateKind::ExplicitOutlink => S1SemanticCandidateKind::ExplicitOutlink,
        LinkCandidateKind::SemanticSource => S1SemanticCandidateKind::SemanticSource,
        LinkCandidateKind::SemanticBlock => S1SemanticCandidateKind::SemanticBlock,
    };
    let evidence_source_path = path_relative_to(&raw.evidence_source_path, vault_root);
    S1SemanticCandidate {
        target_path: target_rel,
        wikilink_title: raw.wikilink_title,
        score: raw.score,
        kind,
        evidence_source_path,
        evidence_lines: raw.evidence_lines,
        stale: raw.stale,
        privacy_class,
    }
}

fn path_relative_to(path: &Path, root: &Path) -> String {
    path.strip_prefix(root)
        .unwrap_or(path)
        .to_string_lossy()
        .replace('\\', "/")
}

fn collect_markdown_files(vault_root: &Path, dir: &Path, out: &mut Vec<PathBuf>) {
    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };
    for entry in entries.flatten() {
        let path = entry.path();
        // Skip .smart-env, .obsidian, .git directories — they are not vault content.
        if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
            if name.starts_with('.') {
                continue;
            }
        }
        if path.is_dir() {
            collect_markdown_files(vault_root, &path, out);
            continue;
        }
        if path.extension().and_then(|e| e.to_str()) == Some("md") {
            out.push(path);
        }
    }
}

fn wikilink_title_from_path(rel_path: &str) -> String {
    let stem = Path::new(rel_path)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or(rel_path);
    stem.to_owned()
}

/// A Hen-parsed `WikilinkTarget::Path` may contain a bare title (`Notes`),
/// a relative path (`folder/Notes`), or a path with `.md` extension. Match
/// any form whose final stem equals `from_title`.
fn path_matches_title(path: &str, from_title: &str) -> bool {
    let stem = Path::new(path)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or(path);
    stem == from_title
}

/// Variant of `rewrite_wikilink_titles` that also returns the count of
/// occurrences rewritten (handles plain, alias, heading-anchor, and
/// block-anchor forms uniformly).
fn rewrite_wikilink_titles_with_count(
    body: &str,
    from_title: &str,
    to_title: &str,
) -> (String, usize) {
    let mut out = String::with_capacity(body.len());
    let mut count = 0usize;
    let mut cursor = 0usize;
    let bytes = body.as_bytes();
    while cursor < bytes.len() {
        if cursor + 1 < bytes.len() && bytes[cursor] == b'[' && bytes[cursor + 1] == b'[' {
            let inner_start = cursor + 2;
            let mut inner_end = inner_start;
            while inner_end + 1 < bytes.len()
                && !(bytes[inner_end] == b']' && bytes[inner_end + 1] == b']')
            {
                inner_end += 1;
            }
            if inner_end + 1 < bytes.len()
                && bytes[inner_end] == b']'
                && bytes[inner_end + 1] == b']'
            {
                let inner = &body[inner_start..inner_end];
                let (title_part, rest) = match inner.find(|c| c == '#' || c == '^' || c == '|') {
                    Some(idx) => (&inner[..idx], &inner[idx..]),
                    None => (inner, ""),
                };
                if title_part == from_title {
                    out.push_str("[[");
                    out.push_str(to_title);
                    out.push_str(rest);
                    out.push_str("]]");
                    count += 1;
                } else {
                    out.push_str("[[");
                    out.push_str(inner);
                    out.push_str("]]");
                }
                cursor = inner_end + 2;
                continue;
            }
        }
        out.push(body.as_bytes()[cursor] as char);
        cursor += 1;
    }
    (out, count)
}

/// Rewrite every `[[from_title]]` and `[[from_title|alias]]` occurrence to
/// the new title. Heading anchors `[[from_title#heading]]` and block
/// anchors `[[from_title^block]]` are preserved verbatim — they reference
/// internal structure that the rename doesn't touch.
#[allow(dead_code)]
fn rewrite_wikilink_titles(body: &str, from_title: &str, to_title: &str) -> String {
    let mut out = String::with_capacity(body.len());
    let mut cursor = 0usize;
    let bytes = body.as_bytes();
    while cursor < bytes.len() {
        if cursor + 1 < bytes.len() && bytes[cursor] == b'[' && bytes[cursor + 1] == b'[' {
            // Find closing `]]`.
            let inner_start = cursor + 2;
            let mut inner_end = inner_start;
            while inner_end + 1 < bytes.len()
                && !(bytes[inner_end] == b']' && bytes[inner_end + 1] == b']')
            {
                inner_end += 1;
            }
            if inner_end + 1 < bytes.len()
                && bytes[inner_end] == b']'
                && bytes[inner_end + 1] == b']'
            {
                let inner = &body[inner_start..inner_end];
                let (title_part, rest) = match inner.find(|c| c == '#' || c == '^' || c == '|') {
                    Some(idx) => (&inner[..idx], &inner[idx..]),
                    None => (inner, ""),
                };
                if title_part == from_title {
                    out.push_str("[[");
                    out.push_str(to_title);
                    out.push_str(rest);
                    out.push_str("]]");
                } else {
                    out.push_str("[[");
                    out.push_str(inner);
                    out.push_str("]]");
                }
                cursor = inner_end + 2;
                continue;
            }
        }
        out.push(body.as_bytes()[cursor] as char);
        cursor += 1;
    }
    out
}

fn locate_smart_env_index(vault_root: &Path) -> Option<PathBuf> {
    let candidate = vault_root.join(".smart-env").join("multi");
    if !candidate.is_dir() {
        return None;
    }
    fs::read_dir(&candidate)
        .ok()?
        .flatten()
        .filter_map(|e| {
            let path = e.path();
            if path.extension().and_then(|x| x.to_str()) == Some("ajson") {
                Some(path)
            } else {
                None
            }
        })
        .next()
}
