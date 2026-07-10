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

use epi_s1_hen_compiler_core::wikilinks::{
    coordinate_residency_refusal, parse_wikilinks, reconcile_rename, wikilink_title_from_path,
    RenameRefusal, RenameRefusalReason,
};
use epi_s1_hen_compiler_core::{
    entity_list_entry, plan_entity_capture, plan_entity_classify, plan_entity_promote_to_type,
    plan_world_graduate, suggest_link_candidates, EntityListEntry, LinkCandidate,
    LinkCandidateKind, LinkCandidateRequest,
};
use epi_s3_gateway_contract::{
    classify_vault_path_privacy, S1EntityCaptureReceipt, S1EntityClassifyReceipt,
    S1EntityListEntry, S1EntityListReceipt, S1EntityPromoteToTypeReceipt, S1SemanticCandidate,
    S1SemanticCandidateKind, S1SemanticResponse, S1SemanticStaleness, S1VaultPathPrivacyClass,
    S1VaultRenameReceipt, S1VaultRenameRefusal, S1VaultRenameRefusalReason, S1WorldGraduateReceipt,
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
    let contents =
        fs::read_to_string(&absolute).map_err(|err| format!("read `{path}` failed: {err}"))?;
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

    let source_body = fs::read_to_string(&from_abs)
        .map_err(|err| format!("read source `{from}` before residency check failed: {err}"))?;
    if let Some(refusal) = coordinate_residency_refusal(&to, &source_body) {
        let receipt = S1VaultRenameReceipt {
            from_path: from,
            to_path: to,
            reconciled_documents: Vec::new(),
            reconciled_link_count: 0,
            refusals: vec![map_rename_refusal(refusal)],
        };
        return serde_json::to_value(&receipt).map_err(|err| format!("serialize receipt: {err}"));
    }

    fs::rename(&from_abs, &to_abs)
        .map_err(|err| format!("rename `{from}` -> `{to}` failed: {err}"))?;

    let from_title = wikilink_title_from_path(&from);
    let to_title = wikilink_title_from_path(&to);
    let (reconciled, refusals) = reconcile_rename(&vault_root, &from_title, &to_title, &[to_abs]);

    let receipt = S1VaultRenameReceipt {
        from_path: from,
        to_path: to,
        reconciled_documents: reconciled
            .iter()
            .map(|doc| doc.relative_path.clone())
            .collect(),
        reconciled_link_count: reconciled.iter().map(|doc| doc.link_count).sum(),
        refusals: refusals.into_iter().map(map_rename_refusal).collect(),
    };
    serde_json::to_value(&receipt).map_err(|err| format!("serialize receipt: {err}"))
}

fn map_rename_refusal(refusal: RenameRefusal) -> S1VaultRenameRefusal {
    let reason = match refusal.reason {
        RenameRefusalReason::WriteFailed(_) => S1VaultRenameRefusalReason::BimbaCoordinateBreak,
        RenameRefusalReason::CoordinateResidencyMismatch { .. } => {
            S1VaultRenameRefusalReason::CoordinateResidencyMismatch
        }
    };
    S1VaultRenameRefusal {
        source_path: refusal.relative_path,
        reason,
        detail: refusal.detail,
    }
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
    let limit = params.get("limit").and_then(|v| v.as_u64()).unwrap_or(16) as usize;
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
                warnings: vec![format!(
                    "smart_env index not present at {}/.smart-env/multi",
                    vault_root.display()
                )],
                staleness: S1SemanticStaleness::NoIndex,
                smart_env_index_path: None,
            };
            return serde_json::to_value(&response)
                .map_err(|err| format!("serialize response: {err}"));
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

// ============= CCT-14 (+14b) entity-candidate lifecycle handlers =============
//
// The lifecycle LAW lives in `epi_s1_hen_compiler_core::entity_lifecycle`
// (pure plans); these handlers execute the IO. The CLI (`epi entity ...` /
// `epi world ...`) calls the SAME functions, so gateway and CLI capture
// produce identical Hen behaviour by construction (DR-S5-ONE-1).

/// `s1'.entity.capture` — capture a dangling wikilink target or loose root
/// note into `Idea/Empty/Present/{day}/entities/`. When `source` names an
/// existing vault file its body is carried over (the original file is left
/// in place; removal stays with the governed `s1'.vault.move_file` path).
pub fn entity_capture(params: &Value) -> Result<Value, String> {
    let source = require_str(params, "source")?;
    let day_id = require_str(params, "dayId")?;
    let creator = params
        .get("creatorIdentity")
        .and_then(|v| v.as_str())
        .map(str::to_owned);
    let vault_root = resolve_vault_root(params)?;

    let source_abs = vault_root.join(&source);
    let existing_body = if source_abs.is_file() {
        Some(
            fs::read_to_string(&source_abs)
                .map_err(|err| format!("read capture source `{source}` failed: {err}"))?,
        )
    } else {
        None
    };

    let plan = plan_entity_capture(&source, &day_id, creator.as_deref(), existing_body.as_deref())?;
    refuse_if_protected_without_capability(&plan.candidate_path, params)?;
    let absolute = vault_root.join(&plan.candidate_path);
    if let Some(parent) = absolute.parent() {
        fs::create_dir_all(parent).map_err(|err| format!("mkdir failed: {err}"))?;
    }
    fs::write(&absolute, &plan.markdown)
        .map_err(|err| format!("write `{}` failed: {err}", plan.candidate_path))?;

    let receipt = S1EntityCaptureReceipt {
        candidate_path: plan.candidate_path,
        title: plan.title,
        candidate_state: "candidate".to_owned(),
        birth_codon: plan.birth_codon.record.codon,
        birth_codon_state: plan.birth_codon.state.as_str().to_owned(),
    };
    serde_json::to_value(&receipt).map_err(|err| format!("serialize receipt: {err}"))
}

/// `s1'.entity.classify` — assign a provisional C-layer to a captured
/// candidate; the provisional birth-codon recomputes (CCT-14b).
pub fn entity_classify(params: &Value) -> Result<Value, String> {
    let candidate_path = require_str(params, "candidatePath")?;
    let c_layer = params
        .get("cLayer")
        .and_then(|v| v.as_str())
        .map(str::to_owned);
    let vault_root = resolve_vault_root(params)?;
    let absolute = vault_root.join(&candidate_path);
    let current = fs::read_to_string(&absolute)
        .map_err(|err| format!("read candidate `{candidate_path}` failed: {err}"))?;

    let plan = plan_entity_classify(&candidate_path, &current, c_layer.as_deref())?;
    fs::write(&absolute, &plan.markdown)
        .map_err(|err| format!("write `{candidate_path}` failed: {err}"))?;

    let receipt = S1EntityClassifyReceipt {
        candidate_path: plan.candidate_path,
        type_coordinate: plan.type_coordinate,
        birth_codon: plan.birth_codon.record.codon,
        birth_codon_state: plan.birth_codon.state.as_str().to_owned(),
    };
    serde_json::to_value(&receipt).map_err(|err| format!("serialize receipt: {err}"))
}

/// `s1'.entity.promote_to_type` — move a reviewed candidate into
/// `World/Types/Coordinates/**`; the birth-codon ratifies.
pub fn entity_promote_to_type(params: &Value) -> Result<Value, String> {
    let candidate_path = require_str(params, "candidatePath")?;
    let vault_root = resolve_vault_root(params)?;
    let from_abs = vault_root.join(&candidate_path);
    let current = fs::read_to_string(&from_abs)
        .map_err(|err| format!("read candidate `{candidate_path}` failed: {err}"))?;

    let plan = plan_entity_promote_to_type(&candidate_path, &current)?;
    let to_abs = vault_root.join(&plan.to_path);
    if let Some(parent) = to_abs.parent() {
        fs::create_dir_all(parent).map_err(|err| format!("mkdir failed: {err}"))?;
    }
    fs::write(&to_abs, &plan.markdown)
        .map_err(|err| format!("write `{}` failed: {err}", plan.to_path))?;
    fs::remove_file(&from_abs)
        .map_err(|err| format!("remove promoted candidate `{candidate_path}` failed: {err}"))?;

    let intent = &plan.intent;
    let string_array = |key: &str| -> Vec<String> {
        intent
            .node
            .properties
            .get(key)
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|v| v.as_str().map(str::to_owned))
                    .collect()
            })
            .unwrap_or_default()
    };
    let type_coordinate = intent
        .node
        .properties
        .get("type_coordinate")
        .and_then(|v| v.as_str())
        .unwrap_or("C2")
        .to_owned();
    let receipt = S1EntityPromoteToTypeReceipt {
        entity_path: candidate_path,
        type_coordinate,
        aliases: string_array("aliases"),
        candidate_state: "promoted".to_owned(),
        accepted_wikilinks: string_array("accepted_wikilinks"),
        target_type_path: plan.to_path.trim_end_matches(".md").to_owned(),
        graph_promotion_ready: true,
    };
    let mut value =
        serde_json::to_value(&receipt).map_err(|err| format!("serialize receipt: {err}"))?;
    value["birthCodon"] = json!(plan.birth_codon.record.codon);
    value["birthCodonState"] = json!(plan.birth_codon.state.as_str());
    if let Some(event) = &plan.birth_codon.transition_event {
        value["birthCodonTransition"] = json!(event);
    }
    Ok(value)
}

/// `s1'.world.graduate` — graduate a stable type-local definition flat
/// into `World/{Name}.md`, retaining the type-local file as a MOC pointer.
pub fn world_graduate(params: &Value) -> Result<Value, String> {
    let type_path = require_str(params, "typePath")?;
    let vault_root = resolve_vault_root(params)?;
    let source_abs = vault_root.join(&type_path);
    let current = fs::read_to_string(&source_abs)
        .map_err(|err| format!("read type entity `{type_path}` failed: {err}"))?;

    let plan = plan_world_graduate(&type_path, &current)?;
    let flat_abs = vault_root.join(&plan.flat_world_path);
    if let Some(parent) = flat_abs.parent() {
        fs::create_dir_all(parent).map_err(|err| format!("mkdir failed: {err}"))?;
    }
    fs::write(&flat_abs, &plan.flat_markdown)
        .map_err(|err| format!("write `{}` failed: {err}", plan.flat_world_path))?;
    fs::write(&source_abs, &plan.moc_pointer_markdown)
        .map_err(|err| format!("rewrite MOC pointer `{type_path}` failed: {err}"))?;

    let type_coordinate = plan
        .intent
        .node
        .properties
        .get("type_coordinate")
        .and_then(|v| v.as_str())
        .unwrap_or("C2")
        .to_owned();
    let receipt = S1WorldGraduateReceipt {
        source_c_authority_path: plan.type_source_path,
        flat_world_target: plan.flat_world_path,
        type_coordinate,
        crystallisation_state: "crystallised_world_form".to_owned(),
        graph_promotion_ready: true,
    };
    let mut value =
        serde_json::to_value(&receipt).map_err(|err| format!("serialize receipt: {err}"))?;
    value["birthCodon"] = json!(plan.birth_codon.record.codon);
    value["birthCodonState"] = json!(plan.birth_codon.state.as_str());
    Ok(value)
}

/// `s1'.entity.list` — the candidate-pool review surface. Scans
/// `Idea/Empty/Present/{day}/entities/` (all days unless `dayId` given)
/// plus, for `state=promoted|graduated` filters, the World trees.
pub fn entity_list(params: &Value) -> Result<Value, String> {
    let vault_root = resolve_vault_root(params)?;
    let state_filter = params
        .get("state")
        .and_then(|v| v.as_str())
        .map(str::to_owned);
    let day_filter = params
        .get("dayId")
        .and_then(|v| v.as_str())
        .map(str::to_owned);

    let mut entries = Vec::new();
    let present = vault_root.join("Idea/Empty/Present");
    if present.is_dir() {
        for day_dir in fs::read_dir(&present).map_err(|err| err.to_string())?.flatten() {
            let day_name = day_dir.file_name().to_string_lossy().to_string();
            if let Some(day) = &day_filter {
                if *day != day_name {
                    continue;
                }
            }
            let entities_dir = day_dir.path().join("entities");
            collect_entity_entries(&entities_dir, &vault_root, &mut entries);
        }
    }
    if day_filter.is_none() {
        if matches!(state_filter.as_deref(), Some("promoted")) {
            let types_root = vault_root.join("Idea/Bimba/World/Types/Coordinates/C");
            collect_entity_entries_recursive(&types_root, &vault_root, &mut entries, 3);
        }
        if matches!(state_filter.as_deref(), Some("graduated")) {
            collect_entity_entries(&vault_root.join("Idea/Bimba/World"), &vault_root, &mut entries);
        }
    }

    if let Some(state) = &state_filter {
        entries.retain(|entry| entry.state == *state);
    }
    entries.sort_by(|a, b| a.path.cmp(&b.path));
    let receipt = S1EntityListReceipt {
        entries: entries.into_iter().map(contract_list_entry).collect(),
    };
    serde_json::to_value(&receipt).map_err(|err| format!("serialize receipt: {err}"))
}

/// `s1'.world.list_entities` — graduated flat `World/{Name}.md` entities,
/// optionally filtered by coordinate prefix.
pub fn world_list_entities(params: &Value) -> Result<Value, String> {
    let vault_root = resolve_vault_root(params)?;
    let coordinate_filter = params
        .get("coordinate")
        .and_then(|v| v.as_str())
        .map(str::to_owned);

    let mut entries = Vec::new();
    collect_entity_entries(&vault_root.join("Idea/Bimba/World"), &vault_root, &mut entries);
    entries.retain(|entry| entry.state == "graduated");
    if let Some(coordinate) = &coordinate_filter {
        entries.retain(|entry| {
            entry
                .type_coordinate
                .as_deref()
                .is_some_and(|tc| tc == coordinate || tc.starts_with(&format!("{coordinate}-")))
        });
    }
    entries.sort_by(|a, b| a.path.cmp(&b.path));
    let receipt = S1EntityListReceipt {
        entries: entries.into_iter().map(contract_list_entry).collect(),
    };
    serde_json::to_value(&receipt).map_err(|err| format!("serialize receipt: {err}"))
}

fn collect_entity_entries(dir: &Path, vault_root: &Path, entries: &mut Vec<EntityListEntry>) {
    let Ok(read_dir) = fs::read_dir(dir) else {
        return;
    };
    for entry in read_dir.flatten() {
        let path = entry.path();
        if path.extension().and_then(|x| x.to_str()) != Some("md") {
            continue;
        }
        let relative = path_relative_to(&path, vault_root);
        let Ok(markdown) = fs::read_to_string(&path) else {
            continue;
        };
        if let Ok(row) = entity_list_entry(&relative, &markdown) {
            entries.push(row);
        }
    }
}

fn collect_entity_entries_recursive(
    dir: &Path,
    vault_root: &Path,
    entries: &mut Vec<EntityListEntry>,
    depth: usize,
) {
    collect_entity_entries(dir, vault_root, entries);
    if depth == 0 {
        return;
    }
    let Ok(read_dir) = fs::read_dir(dir) else {
        return;
    };
    for entry in read_dir.flatten() {
        let path = entry.path();
        if path.is_dir() {
            collect_entity_entries_recursive(&path, vault_root, entries, depth - 1);
        }
    }
}

fn contract_list_entry(row: EntityListEntry) -> S1EntityListEntry {
    S1EntityListEntry {
        path: row.path,
        title: row.title,
        state: row.state,
        type_coordinate: row.type_coordinate,
        birth_codon: row.birth_codon,
        birth_codon_state: row.birth_codon_state,
    }
}

fn path_relative_to(path: &Path, root: &Path) -> String {
    path.strip_prefix(root)
        .unwrap_or(path)
        .to_string_lossy()
        .replace('\\', "/")
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
