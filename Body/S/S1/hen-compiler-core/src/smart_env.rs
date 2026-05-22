use std::cmp::Ordering;
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

const MAX_SEED_BLOCKS: usize = 32;

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LinkCandidateRequest {
    pub vault_root: PathBuf,
    pub note_path: PathBuf,
    pub source_wikilinks: Vec<String>,
    pub limit: usize,
    pub include_stale: bool,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LinkCandidateKind {
    ExplicitOutlink,
    SemanticSource,
    SemanticBlock,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct LinkCandidate {
    pub target_path: PathBuf,
    pub wikilink_title: String,
    pub score: f32,
    pub kind: LinkCandidateKind,
    pub evidence_source_path: PathBuf,
    pub evidence_lines: Option<(usize, usize)>,
    pub stale: bool,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct LinkCandidateResponse {
    pub seed_sources: Vec<PathBuf>,
    pub candidates: Vec<LinkCandidate>,
    pub warnings: Vec<String>,
}

#[derive(Clone, Debug)]
struct SourceRecord {
    path: PathBuf,
    outlinks: Vec<RawOutlink>,
    vec: Option<Vec<f32>>,
}

#[derive(Clone, Debug)]
struct BlockRecord {
    source_path: PathBuf,
    lines: Option<(usize, usize)>,
    size: usize,
    vec: Option<Vec<f32>>,
    is_frontmatter: bool,
}

#[derive(Clone, Debug)]
struct ResolvedTarget {
    path: PathBuf,
    stale: bool,
}

#[derive(Clone, Debug, Default)]
struct SmartEnvIndex {
    sources: Vec<SourceRecord>,
    blocks: Vec<BlockRecord>,
    source_by_path: HashMap<PathBuf, usize>,
    title_index: HashMap<String, Vec<PathBuf>>,
}

#[derive(Clone, Debug, Deserialize)]
struct RawOutlink {
    target: String,
    #[serde(default)]
    line: Option<usize>,
}

#[derive(Clone, Debug, Deserialize)]
struct RawEmbedding {
    vec: Vec<f32>,
}

#[derive(Clone, Debug, Deserialize)]
struct RawSourceEntity {
    path: String,
    #[serde(default)]
    outlinks: Vec<RawOutlink>,
    #[serde(default)]
    embeddings: HashMap<String, RawEmbedding>,
    class_name: String,
}

#[derive(Clone, Debug, Deserialize)]
struct RawBlockEntity {
    key: String,
    #[serde(default)]
    lines: Option<[usize; 2]>,
    #[serde(default)]
    size: usize,
    #[serde(default)]
    embeddings: HashMap<String, RawEmbedding>,
    class_name: String,
}

pub fn suggest_link_candidates(
    request: LinkCandidateRequest,
) -> Result<LinkCandidateResponse, String> {
    let index = SmartEnvIndex::load(&request.vault_root)?;
    let mut warnings = Vec::new();
    let seed_sources = resolve_seed_sources(&request, &index, &mut warnings)?;
    let current_note = request.note_path.clone();

    let mut by_target: HashMap<PathBuf, LinkCandidate> = HashMap::new();

    for seed_source in &seed_sources {
        let Some(source) = index.source(seed_source) else {
            continue;
        };

        for outlink in &source.outlinks {
            let Some(target) = index.resolve_wikilink_target(&outlink.target, &request.vault_root)
            else {
                continue;
            };
            upsert_candidate(
                &mut by_target,
                &request,
                &current_note,
                LinkCandidate {
                    target_path: target.path,
                    wikilink_title: note_title(seed_source_name(&outlink.target)),
                    score: 1.0,
                    kind: LinkCandidateKind::ExplicitOutlink,
                    evidence_source_path: seed_source.clone(),
                    evidence_lines: outlink.line.map(|line| (line, line)),
                    stale: target.stale,
                },
            );
        }
    }

    for seed_source in &seed_sources {
        let Some(seed_record) = index.source(seed_source) else {
            continue;
        };
        let Some(seed_vec) = seed_record.vec.as_ref() else {
            continue;
        };

        for candidate_source in &index.sources {
            let Some(candidate_vec) = candidate_source.vec.as_ref() else {
                continue;
            };
            if candidate_source.path == *seed_source {
                continue;
            }
            let target = index.resolve_source_path(&candidate_source.path, &request.vault_root);
            upsert_candidate(
                &mut by_target,
                &request,
                &current_note,
                LinkCandidate {
                    wikilink_title: note_title(candidate_source.path.clone()),
                    target_path: target.path,
                    score: cosine_similarity(seed_vec, candidate_vec),
                    kind: LinkCandidateKind::SemanticSource,
                    evidence_source_path: candidate_source.path.clone(),
                    evidence_lines: None,
                    stale: target.stale,
                },
            );
        }
    }

    let seed_blocks = index.seed_blocks(&seed_sources);
    for seed_block in seed_blocks {
        let Some(seed_vec) = seed_block.vec.as_ref() else {
            continue;
        };

        for candidate_block in &index.blocks {
            if candidate_block.is_frontmatter
                || candidate_block.source_path == seed_block.source_path
            {
                continue;
            }
            let Some(candidate_vec) = candidate_block.vec.as_ref() else {
                continue;
            };
            let target =
                index.resolve_source_path(&candidate_block.source_path, &request.vault_root);
            upsert_candidate(
                &mut by_target,
                &request,
                &current_note,
                LinkCandidate {
                    wikilink_title: note_title(candidate_block.source_path.clone()),
                    target_path: target.path,
                    score: cosine_similarity(seed_vec, candidate_vec),
                    kind: LinkCandidateKind::SemanticBlock,
                    evidence_source_path: candidate_block.source_path.clone(),
                    evidence_lines: candidate_block.lines,
                    stale: target.stale,
                },
            );
        }
    }

    let mut candidates = by_target.into_values().collect::<Vec<_>>();
    candidates.sort_by(rank_candidates);
    candidates = truncate_with_semantic_block_coverage(candidates, request.limit.max(1));

    Ok(LinkCandidateResponse {
        seed_sources,
        candidates,
        warnings,
    })
}

fn resolve_seed_sources(
    request: &LinkCandidateRequest,
    index: &SmartEnvIndex,
    warnings: &mut Vec<String>,
) -> Result<Vec<PathBuf>, String> {
    let mut seed_sources = Vec::new();

    if request.source_wikilinks.is_empty() {
        let target = index.resolve_source_path(&request.note_path, &request.vault_root);
        if index.source(&target.path).is_some() {
            seed_sources.push(target.path);
        }
    } else {
        for source_wikilink in &request.source_wikilinks {
            if let Some(target) =
                index.resolve_wikilink_target(source_wikilink, &request.vault_root)
            {
                if !seed_sources.contains(&target.path) {
                    seed_sources.push(target.path);
                }
            } else {
                warnings.push(format!(
                    "unresolved Smart Env source coordinate: {source_wikilink}"
                ));
            }
        }
    }

    if seed_sources.is_empty() {
        return Err("no Smart Env seed sources resolved".to_owned());
    }

    Ok(seed_sources)
}

fn upsert_candidate(
    by_target: &mut HashMap<PathBuf, LinkCandidate>,
    request: &LinkCandidateRequest,
    current_note: &Path,
    candidate: LinkCandidate,
) {
    if candidate.score <= 0.0 {
        return;
    }
    if candidate.target_path == current_note {
        return;
    }
    if candidate.stale && !request.include_stale {
        return;
    }

    match by_target.get_mut(&candidate.target_path) {
        Some(existing) if rank_candidates(&candidate, existing) == Ordering::Less => {
            *existing = candidate;
        }
        None => {
            by_target.insert(candidate.target_path.clone(), candidate);
        }
        _ => {}
    }
}

fn rank_candidates(left: &LinkCandidate, right: &LinkCandidate) -> Ordering {
    candidate_kind_rank(left.kind)
        .cmp(&candidate_kind_rank(right.kind))
        .then_with(|| {
            right
                .score
                .partial_cmp(&left.score)
                .unwrap_or(Ordering::Equal)
        })
        .then_with(|| left.target_path.cmp(&right.target_path))
}

fn truncate_with_semantic_block_coverage(
    candidates: Vec<LinkCandidate>,
    limit: usize,
) -> Vec<LinkCandidate> {
    if candidates.len() <= limit {
        return candidates;
    }

    let mut selected = candidates.iter().take(limit).cloned().collect::<Vec<_>>();
    if limit > 1
        && !selected
            .iter()
            .any(|candidate| candidate.kind == LinkCandidateKind::SemanticBlock)
    {
        if let Some(block_candidate) = candidates
            .iter()
            .find(|candidate| candidate.kind == LinkCandidateKind::SemanticBlock)
        {
            selected.pop();
            selected.push(block_candidate.clone());
            selected.sort_by(rank_candidates);
        }
    }
    selected
}

fn candidate_kind_rank(kind: LinkCandidateKind) -> u8 {
    match kind {
        LinkCandidateKind::ExplicitOutlink => 0,
        LinkCandidateKind::SemanticBlock => 1,
        LinkCandidateKind::SemanticSource => 2,
    }
}

fn cosine_similarity(left: &[f32], right: &[f32]) -> f32 {
    if left.len() != right.len() || left.is_empty() {
        return 0.0;
    }

    let mut dot = 0.0_f64;
    let mut left_norm = 0.0_f64;
    let mut right_norm = 0.0_f64;
    for (left_value, right_value) in left.iter().zip(right.iter()) {
        let left_value = *left_value as f64;
        let right_value = *right_value as f64;
        dot += left_value * right_value;
        left_norm += left_value * left_value;
        right_norm += right_value * right_value;
    }

    if left_norm == 0.0 || right_norm == 0.0 {
        return 0.0;
    }

    (dot / (left_norm.sqrt() * right_norm.sqrt())) as f32
}

impl SmartEnvIndex {
    fn load(vault_root: &Path) -> Result<Self, String> {
        let smart_env_root = vault_root.join(".smart-env").join("multi");
        if !smart_env_root.exists() {
            return Err(format!(
                "Smart Env multi directory does not exist: {}",
                smart_env_root.display()
            ));
        }

        let mut sources = Vec::new();
        let mut blocks = Vec::new();
        for entry in fs::read_dir(&smart_env_root)
            .map_err(|error| format!("failed to read {}: {error}", smart_env_root.display()))?
        {
            let entry =
                entry.map_err(|error| format!("failed to read Smart Env entry: {error}"))?;
            let path = entry.path();
            if path.extension().and_then(|ext| ext.to_str()) != Some("ajson") {
                continue;
            }
            load_ajson_file(&path, &mut sources, &mut blocks)?;
        }

        let mut source_by_path = HashMap::new();
        let mut title_index: HashMap<String, Vec<PathBuf>> = HashMap::new();
        for (idx, source) in sources.iter().enumerate() {
            source_by_path.insert(source.path.clone(), idx);
            for key in title_keys(&source.path) {
                title_index
                    .entry(key)
                    .or_default()
                    .push(source.path.clone());
            }
        }

        Ok(Self {
            sources,
            blocks,
            source_by_path,
            title_index,
        })
    }

    fn source(&self, path: &Path) -> Option<&SourceRecord> {
        self.source_by_path
            .get(path)
            .and_then(|idx| self.sources.get(*idx))
    }

    fn seed_blocks(&self, seed_sources: &[PathBuf]) -> Vec<&BlockRecord> {
        let mut blocks = self
            .blocks
            .iter()
            .filter(|block| {
                !block.is_frontmatter
                    && block.vec.is_some()
                    && seed_sources.iter().any(|path| *path == block.source_path)
            })
            .collect::<Vec<_>>();
        blocks.sort_by(|left, right| right.size.cmp(&left.size));
        blocks.truncate(MAX_SEED_BLOCKS);
        blocks
    }

    fn resolve_source_path(&self, path: &Path, vault_root: &Path) -> ResolvedTarget {
        let preferred = preferred_path(
            self.title_index
                .get(&normalized_key(&note_title(path.to_path_buf())))
                .cloned()
                .unwrap_or_else(|| vec![path.to_path_buf()]),
            vault_root,
        );
        let stale = !vault_root.join(&preferred).exists();
        ResolvedTarget {
            path: preferred,
            stale,
        }
    }

    fn resolve_wikilink_target(
        &self,
        raw_target: &str,
        vault_root: &Path,
    ) -> Option<ResolvedTarget> {
        let normalized = normalized_wikilink_target(raw_target);
        if normalized.is_empty() {
            return None;
        }

        let path_like = PathBuf::from(&normalized);
        if vault_root.join(&path_like).exists() {
            return Some(ResolvedTarget {
                stale: false,
                path: path_like,
            });
        }

        for ext in ["md", "canvas"] {
            let ext_path = path_like.with_extension(ext);
            if vault_root.join(&ext_path).exists() {
                return Some(ResolvedTarget {
                    stale: false,
                    path: ext_path,
                });
            }
        }

        let mut candidates = self
            .title_index
            .get(&normalized_key(&normalized))
            .cloned()
            .unwrap_or_default();

        if candidates.is_empty() {
            let no_ext = path_like.with_extension("");
            candidates = self
                .title_index
                .get(&normalized_key(
                    &no_ext.to_string_lossy().trim_end_matches('.').to_owned(),
                ))
                .cloned()
                .unwrap_or_default();
        }

        if candidates.is_empty() {
            return None;
        }

        let preferred = preferred_path(candidates, vault_root);
        Some(ResolvedTarget {
            stale: !vault_root.join(&preferred).exists(),
            path: preferred,
        })
    }
}

fn load_ajson_file(
    path: &Path,
    sources: &mut Vec<SourceRecord>,
    blocks: &mut Vec<BlockRecord>,
) -> Result<(), String> {
    let raw = fs::read_to_string(path)
        .map_err(|error| format!("failed to read {}: {error}", path.display()))?;
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return Ok(());
    }

    let json = format!("{{{}}}", trimmed.trim_end_matches(','));
    let data: serde_json::Map<String, serde_json::Value> = serde_json::from_str(&json)
        .map_err(|error| format!("failed to parse {}: {error}", path.display()))?;

    for value in data.into_values() {
        let class_name = value
            .get("class_name")
            .and_then(|value| value.as_str())
            .unwrap_or_default();
        match class_name {
            "SmartSource" => {
                let entity: RawSourceEntity = serde_json::from_value(value).map_err(|error| {
                    format!(
                        "failed to decode SmartSource in {}: {error}",
                        path.display()
                    )
                })?;
                if entity.class_name != "SmartSource" {
                    continue;
                }
                sources.push(SourceRecord {
                    path: PathBuf::from(entity.path),
                    outlinks: entity.outlinks,
                    vec: entity
                        .embeddings
                        .into_values()
                        .next()
                        .map(|embedding| embedding.vec),
                });
            }
            "SmartBlock" => {
                let entity: RawBlockEntity = serde_json::from_value(value).map_err(|error| {
                    format!("failed to decode SmartBlock in {}: {error}", path.display())
                })?;
                if entity.class_name != "SmartBlock" {
                    continue;
                }
                let source_path = entity
                    .key
                    .split('#')
                    .next()
                    .map(PathBuf::from)
                    .ok_or_else(|| format!("invalid SmartBlock key in {}", path.display()))?;
                blocks.push(BlockRecord {
                    source_path,
                    lines: entity.lines.map(|lines| (lines[0], lines[1])),
                    size: entity.size,
                    vec: entity
                        .embeddings
                        .into_values()
                        .next()
                        .map(|embedding| embedding.vec),
                    is_frontmatter: entity.key.contains("#---frontmatter---"),
                });
            }
            _ => {}
        }
    }

    Ok(())
}

fn preferred_path(candidates: Vec<PathBuf>, vault_root: &Path) -> PathBuf {
    let mut candidates = candidates;
    candidates.sort_by(|left, right| {
        let left_exists = vault_root.join(left).exists();
        let right_exists = vault_root.join(right).exists();
        right_exists
            .cmp(&left_exists)
            .then_with(|| left.components().count().cmp(&right.components().count()))
            .then_with(|| left.cmp(right))
    });
    candidates.into_iter().next().unwrap_or_default()
}

fn normalized_wikilink_target(raw_target: &str) -> String {
    raw_target
        .trim()
        .trim_start_matches("[[")
        .trim_end_matches("]]")
        .split('|')
        .next()
        .unwrap_or_default()
        .trim()
        .replace('\\', "/")
}

fn title_keys(path: &Path) -> Vec<String> {
    let mut keys = Vec::new();
    keys.push(normalized_key(&path.to_string_lossy()));
    let no_ext = path.with_extension("");
    keys.push(normalized_key(&no_ext.to_string_lossy()));
    keys.push(normalized_key(&note_title(path.to_path_buf())));
    keys.sort();
    keys.dedup();
    keys
}

fn normalized_key(value: &str) -> String {
    value.trim().trim_matches('"').to_lowercase()
}

fn note_title(path: PathBuf) -> String {
    path.file_stem()
        .map(|stem| stem.to_string_lossy().to_string())
        .unwrap_or_else(|| path.to_string_lossy().to_string())
}

fn seed_source_name(raw_target: &str) -> PathBuf {
    PathBuf::from(normalized_wikilink_target(raw_target))
}
