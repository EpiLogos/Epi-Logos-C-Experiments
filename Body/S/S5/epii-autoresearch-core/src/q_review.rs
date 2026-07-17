//! Coordinate: S5 M5' (Epii Q-review curation)
//! Residency: Body/S/S5/epii-autoresearch-core/src
//! Position (#n): M5-4' self-referential autoresearch
//! Actualises: detector-configured corpus reads and durable QReviewQueue JSONL
//!   persistence for governed pair-development routing.
//! Public surface: CorpusSnapshot, QDetectorConfig, QReviewStore, queue DTOs,
//!   detector functions, and JSONL writer.
//! Does NOT own: corpus mutation, review decisions, proposal composition, Hen
//!   promotion, or gateway dispatch.
//! Contract: [[S5-SPEC]] / [[S5-ARCHITECTURE]] / [[M5'-SPEC]]

use std::collections::{BTreeMap, BTreeSet};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

use epi_s2_graph_services::{read_bimba_curation_snapshot, Neo4jClient};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CorpusSnapshot {
    pub day_id: String,
    pub graph_revision: u64,
    pub nodes: Vec<BimbaNodeSnapshot>,
    #[serde(default)]
    pub canonical_relations: Vec<CanonicalRelationSnapshot>,
    #[serde(default)]
    pub resonance_edges: Vec<ResonanceEdgeSnapshot>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct BimbaNodeSnapshot {
    pub coordinate: String,
    pub namespace: String,
    pub c_4_family: String,
    pub c_4_ql_position: String,
    pub c_4_lens: String,
    #[serde(default)]
    pub q_values: BTreeMap<String, String>,
    #[serde(default)]
    pub review_epochs: BTreeMap<String, u64>,
    pub embedding_3072: Vec<f64>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CanonicalRelationSnapshot {
    pub source_coordinate: String,
    pub target_coordinate: String,
    pub relation_family: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ResonanceEdgeSnapshot {
    pub source_coordinate: String,
    pub target_coordinate: String,
    pub confidence: f64,
    pub has_canonical_bimba_relation: bool,
    pub source_namespace: String,
    pub target_namespace: String,
}

#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct QDetectorConfig {
    pub articulation_gap_peer_ratio: f64,
    pub contradiction_vector_disagreement_threshold: f64,
    pub resonance_promotion_confidence_threshold: f64,
    pub stale_revision_threshold: u64,
    pub priority_order: Vec<QReviewReasonClass>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct AutoresearchConfigFile {
    autoresearch: QDetectorConfig,
}

impl QDetectorConfig {
    pub fn load_from_default_path() -> Result<Self, String> {
        let home = env::var("HOME")
            .map_err(|_| "HOME is required to locate ~/.epi-logos/config.toml".to_owned())?;
        Self::load_from_path(Path::new(&home).join(".epi-logos/config.toml"))
    }

    pub fn load_from_path(path: impl AsRef<Path>) -> Result<Self, String> {
        let path = path.as_ref();
        let content = fs::read_to_string(path)
            .map_err(|err| format!("failed to read {}: {err}", path.display()))?;
        let config: AutoresearchConfigFile = toml::from_str(&content)
            .map_err(|err| format!("failed to parse {}: {err}", path.display()))?;
        validate_config(&config.autoresearch)?;
        Ok(config.autoresearch)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum QReviewReasonClass {
    ArticulationGap,
    PromotionCandidate,
    ContradictionCandidate,
    StaleByNonRevisit,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum QReviewSurfaceKind {
    M4ResidentEditing,
    M5DialecticalReview,
    M0PrimeGraphChrome,
    M5ContinuityReview,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct QReviewSurface {
    pub portal_plugin_id: String,
    pub theia_workspace: String,
    pub vak_cf: String,
    pub vak_cp: String,
    pub kind: QReviewSurfaceKind,
    pub pair_composition_action: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct QReviewEvidenceRef {
    pub kind: String,
    pub uri: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub coordinate: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct QReviewQueueEntry {
    pub target_coordinate: String,
    pub q_key: String,
    pub reason_class: QReviewReasonClass,
    pub evidence_refs: Vec<QReviewEvidenceRef>,
    pub priority: u32,
    pub source_detector: String,
    pub review_surface: QReviewSurface,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct QReviewQueue {
    pub day_id: String,
    pub graph_revision: u64,
    pub generated_by: String,
    pub entries: Vec<QReviewQueueEntry>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
struct QReviewQueueMetadata {
    day_id: String,
    graph_revision: u64,
    generated_by: String,
}

#[derive(Debug, Clone)]
pub struct QReviewStore {
    root: PathBuf,
}

impl QReviewStore {
    pub fn new(root: impl AsRef<Path>) -> Self {
        Self {
            root: root.as_ref().to_path_buf(),
        }
    }

    pub fn run(
        &self,
        corpus_snapshot: CorpusSnapshot,
        last_review_epoch: u64,
        config: &QDetectorConfig,
    ) -> Result<QReviewQueue, String> {
        let queue = epii_self_referential_read(corpus_snapshot, last_review_epoch, config)?;
        validate_day_id(&queue.day_id)?;
        write_q_review_jsonl(&queue, self.queue_path(&queue.day_id))?;
        self.write_metadata(&queue)?;
        Ok(queue)
    }

    /// Build and curate the live S2 Bimba projection for a night pass.
    ///
    /// The caller supplies temporal context only. S2 remains the sole source
    /// of graph facts, and S5 remains the sole owner of detector execution
    /// and queue persistence.
    pub async fn run_night_pass(
        &self,
        client: &Neo4jClient,
        day_id: &str,
        last_review_epoch: u64,
        config: &QDetectorConfig,
    ) -> Result<QReviewQueue, String> {
        validate_day_id(day_id)?;
        let snapshot = read_bimba_curation_snapshot(client).await?;
        self.run(
            CorpusSnapshot {
                day_id: day_id.to_owned(),
                graph_revision: snapshot.graph_revision,
                nodes: snapshot
                    .nodes
                    .into_iter()
                    .map(|node| BimbaNodeSnapshot {
                        coordinate: node.coordinate,
                        namespace: node.namespace,
                        c_4_family: node.c_4_family,
                        c_4_ql_position: node.c_4_ql_position,
                        c_4_lens: node.c_4_lens,
                        q_values: node.q_values,
                        review_epochs: node.review_epochs,
                        embedding_3072: node.embedding_3072,
                    })
                    .collect(),
                canonical_relations: snapshot
                    .canonical_relations
                    .into_iter()
                    .map(|relation| CanonicalRelationSnapshot {
                        source_coordinate: relation.source_coordinate,
                        target_coordinate: relation.target_coordinate,
                        relation_family: relation.relation_family,
                    })
                    .collect(),
                resonance_edges: snapshot
                    .resonance_edges
                    .into_iter()
                    .map(|edge| ResonanceEdgeSnapshot {
                        source_coordinate: edge.source_coordinate,
                        target_coordinate: edge.target_coordinate,
                        confidence: edge.confidence,
                        has_canonical_bimba_relation: edge.has_canonical_bimba_relation,
                        source_namespace: edge.source_namespace,
                        target_namespace: edge.target_namespace,
                    })
                    .collect(),
            },
            last_review_epoch,
            config,
        )
    }

    pub fn latest(&self, day_id: &str, cf: Option<&str>) -> Result<Option<QReviewQueue>, String> {
        validate_day_id(day_id)?;
        let path = self.queue_path(day_id);
        if !path.exists() {
            return Ok(None);
        }
        let contents = fs::read_to_string(&path)
            .map_err(|err| format!("failed to read QReviewQueue {}: {err}", path.display()))?;
        let metadata_path = self.metadata_path(day_id);
        let metadata: QReviewQueueMetadata =
            serde_json::from_str(&fs::read_to_string(&metadata_path).map_err(|err| {
                format!(
                    "failed to read QReviewQueue metadata {}: {err}",
                    metadata_path.display()
                )
            })?)
            .map_err(|err| {
                format!(
                    "invalid QReviewQueue metadata {}: {err}",
                    metadata_path.display()
                )
            })?;
        if metadata.day_id != day_id {
            return Err(format!(
                "QReviewQueue metadata day_id {} does not match requested day_id {day_id}",
                metadata.day_id
            ));
        }
        let mut entries = Vec::new();
        for (index, line) in contents
            .lines()
            .filter(|line| !line.trim().is_empty())
            .enumerate()
        {
            let entry = serde_json::from_str::<QReviewQueueEntry>(line).map_err(|err| {
                format!(
                    "invalid QReviewQueue JSONL {} line {}: {err}",
                    path.display(),
                    index + 1
                )
            })?;
            if cf.is_none_or(|expected| entry.review_surface.vak_cf == expected) {
                entries.push(entry);
            }
        }
        Ok(Some(QReviewQueue {
            day_id: metadata.day_id,
            graph_revision: metadata.graph_revision,
            generated_by: metadata.generated_by,
            entries,
        }))
    }

    fn write_metadata(&self, queue: &QReviewQueue) -> Result<(), String> {
        let path = self.metadata_path(&queue.day_id);
        let metadata = QReviewQueueMetadata {
            day_id: queue.day_id.clone(),
            graph_revision: queue.graph_revision,
            generated_by: queue.generated_by.clone(),
        };
        let encoded = serde_json::to_vec(&metadata).map_err(|err| err.to_string())?;
        fs::write(&path, encoded).map_err(|err| {
            format!(
                "failed to write QReviewQueue metadata {}: {err}",
                path.display()
            )
        })
    }

    fn queue_path(&self, day_id: &str) -> PathBuf {
        self.root
            .join("queues")
            .join(format!("q_review_{day_id}.jsonl"))
    }

    fn metadata_path(&self, day_id: &str) -> PathBuf {
        self.root
            .join("queues")
            .join(format!("q_review_{day_id}.meta.json"))
    }
}

fn validate_day_id(day_id: &str) -> Result<(), String> {
    if day_id.trim().is_empty() {
        return Err("day_id is required".to_owned());
    }
    if day_id.contains(['/', '\\']) {
        return Err("day_id must not contain a path separator".to_owned());
    }
    Ok(())
}

impl QReviewQueue {
    pub fn to_jsonl(&self) -> Result<String, String> {
        self.entries
            .iter()
            .map(|entry| serde_json::to_string(entry).map_err(|err| err.to_string()))
            .collect::<Result<Vec<_>, _>>()
            .map(|lines| {
                if lines.is_empty() {
                    String::new()
                } else {
                    format!("{}\n", lines.join("\n"))
                }
            })
    }
}

pub fn epii_self_referential_read(
    corpus_snapshot: CorpusSnapshot,
    last_review_epoch: u64,
    config: &QDetectorConfig,
) -> Result<QReviewQueue, String> {
    validate_config(config)?;
    validate_snapshot(&corpus_snapshot)?;

    let mut entries = Vec::new();
    entries.extend(detect_articulation_gaps(&corpus_snapshot, config)?);
    entries.extend(detect_resonance_promotions(&corpus_snapshot, config)?);
    entries.extend(detect_contradiction_candidates(&corpus_snapshot, config)?);
    entries.extend(detect_stale_by_non_revisit(
        &corpus_snapshot,
        last_review_epoch,
        config,
    )?);

    entries.sort_by(|left, right| {
        left.priority
            .cmp(&right.priority)
            .then_with(|| left.target_coordinate.cmp(&right.target_coordinate))
            .then_with(|| left.q_key.cmp(&right.q_key))
            .then_with(|| left.source_detector.cmp(&right.source_detector))
    });
    entries.dedup_by(|left, right| {
        left.target_coordinate == right.target_coordinate
            && left.q_key == right.q_key
            && left.reason_class == right.reason_class
    });

    Ok(QReviewQueue {
        day_id: corpus_snapshot.day_id,
        graph_revision: corpus_snapshot.graph_revision,
        generated_by: "epii_self_referential_read".to_owned(),
        entries,
    })
}

pub fn write_q_review_jsonl(queue: &QReviewQueue, path: impl AsRef<Path>) -> Result<(), String> {
    let path = path.as_ref();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| {
            format!(
                "failed to create QReviewQueue parent directory {}: {err}",
                parent.display()
            )
        })?;
    }
    fs::write(path, queue.to_jsonl()?).map_err(|err| {
        format!(
            "failed to write QReviewQueue JSONL {}: {err}",
            path.display()
        )
    })
}

pub fn detect_articulation_gaps(
    snapshot: &CorpusSnapshot,
    config: &QDetectorConfig,
) -> Result<Vec<QReviewQueueEntry>, String> {
    validate_config(config)?;
    validate_snapshot(snapshot)?;

    let mut clusters: BTreeMap<(&str, &str, &str), Vec<&BimbaNodeSnapshot>> = BTreeMap::new();
    for node in &snapshot.nodes {
        clusters
            .entry((
                node.c_4_family.as_str(),
                node.c_4_ql_position.as_str(),
                node.c_4_lens.as_str(),
            ))
            .or_default()
            .push(node);
    }

    let mut entries = Vec::new();
    for nodes in clusters.values() {
        if nodes.len() < 2 {
            continue;
        }
        let q_keys = nodes
            .iter()
            .flat_map(|node| node.q_values.keys())
            .filter(|key| is_q_key(key))
            .cloned()
            .collect::<BTreeSet<_>>();

        for node in nodes {
            let peer_count = nodes.len().saturating_sub(1);
            if peer_count == 0 {
                continue;
            }
            for q_key in &q_keys {
                if node.q_values.contains_key(q_key) {
                    continue;
                }
                let carriers = nodes
                    .iter()
                    .filter(|peer| peer.coordinate != node.coordinate)
                    .filter(|peer| peer.q_values.contains_key(q_key))
                    .count();
                let ratio = carriers as f64 / peer_count as f64;
                if ratio >= config.articulation_gap_peer_ratio {
                    entries.push(QReviewQueueEntry {
                        target_coordinate: node.coordinate.clone(),
                        q_key: q_key.clone(),
                        reason_class: QReviewReasonClass::ArticulationGap,
                        evidence_refs: vec![QReviewEvidenceRef {
                            kind: "cluster_peer_q_key_ratio".to_owned(),
                            uri: format!(
                                "bimba://cluster/{}/{}/{}#{}",
                                node.c_4_family, node.c_4_ql_position, node.c_4_lens, q_key
                            ),
                            coordinate: Some(node.coordinate.clone()),
                            summary: Some(format!("{carriers}/{peer_count} peers carry {q_key}")),
                        }],
                        priority: priority_for(QReviewReasonClass::ArticulationGap, config),
                        source_detector: "epii-q-articulation-gap-detector".to_owned(),
                        review_surface: surface_for(QReviewReasonClass::ArticulationGap),
                    });
                }
            }
        }
    }
    Ok(entries)
}

pub fn detect_contradiction_candidates(
    snapshot: &CorpusSnapshot,
    config: &QDetectorConfig,
) -> Result<Vec<QReviewQueueEntry>, String> {
    validate_config(config)?;
    validate_snapshot(snapshot)?;

    let nodes = snapshot
        .nodes
        .iter()
        .map(|node| (node.coordinate.as_str(), node))
        .collect::<BTreeMap<_, _>>();
    let mut entries = Vec::new();

    for relation in &snapshot.canonical_relations {
        let Some(source) = nodes.get(relation.source_coordinate.as_str()) else {
            continue;
        };
        let Some(target) = nodes.get(relation.target_coordinate.as_str()) else {
            continue;
        };
        let source_text = source.q_values.get("q_3_i0_dialectical_movement");
        let target_text = target.q_values.get("q_3_i0_dialectical_movement");
        let (Some(source_text), Some(target_text)) = (source_text, target_text) else {
            continue;
        };
        let disagreement = 1.0 - cosine_similarity(&source.embedding_3072, &target.embedding_3072)?;
        if disagreement > config.contradiction_vector_disagreement_threshold
            || lexical_disagreement(source_text, target_text) > 0.55
        {
            entries.push(QReviewQueueEntry {
                target_coordinate: source.coordinate.clone(),
                q_key: "q_3_i0_dialectical_movement".to_owned(),
                reason_class: QReviewReasonClass::ContradictionCandidate,
                evidence_refs: vec![QReviewEvidenceRef {
                    kind: "canonical_relation_vector_disagreement".to_owned(),
                    uri: format!(
                        "bimba://relation/{}/{}/{}",
                        relation.relation_family, source.coordinate, target.coordinate
                    ),
                    coordinate: Some(target.coordinate.clone()),
                    summary: Some(format!("disagreement={disagreement:.6}")),
                }],
                priority: priority_for(QReviewReasonClass::ContradictionCandidate, config),
                source_detector: "epii-q-contradiction-candidate-detector".to_owned(),
                review_surface: surface_for(QReviewReasonClass::ContradictionCandidate),
            });
        }
    }
    Ok(entries)
}

pub fn detect_stale_by_non_revisit(
    snapshot: &CorpusSnapshot,
    last_review_epoch: u64,
    config: &QDetectorConfig,
) -> Result<Vec<QReviewQueueEntry>, String> {
    validate_config(config)?;
    validate_snapshot(snapshot)?;

    let current_revision = snapshot.graph_revision.max(last_review_epoch);
    let mut entries = Vec::new();
    for node in &snapshot.nodes {
        let latest_epoch = node.review_epochs.values().copied().max().unwrap_or(0);
        if current_revision.saturating_sub(latest_epoch) > config.stale_revision_threshold {
            let Some(q_key) = node.q_values.keys().find(|key| is_q_key(key)).cloned() else {
                // A review-epoch key identifies the node, not an editable Q
                // articulation. Missing articulations are owned by the gap
                // detector; never send Q-metadata into pair composition.
                continue;
            };
            entries.push(QReviewQueueEntry {
                target_coordinate: node.coordinate.clone(),
                q_key,
                reason_class: QReviewReasonClass::StaleByNonRevisit,
                evidence_refs: vec![QReviewEvidenceRef {
                    kind: "graph_revision_staleness".to_owned(),
                    uri: format!("bimba://graph_revision/{}", snapshot.graph_revision),
                    coordinate: Some(node.coordinate.clone()),
                    summary: Some(format!(
                        "latest_review_epoch={latest_epoch}; current_revision={current_revision}"
                    )),
                }],
                priority: priority_for(QReviewReasonClass::StaleByNonRevisit, config),
                source_detector: "epii-q-stale-by-non-revisit-detector".to_owned(),
                review_surface: surface_for(QReviewReasonClass::StaleByNonRevisit),
            });
        }
    }
    Ok(entries)
}

pub fn detect_resonance_promotions(
    snapshot: &CorpusSnapshot,
    config: &QDetectorConfig,
) -> Result<Vec<QReviewQueueEntry>, String> {
    validate_config(config)?;
    validate_snapshot(snapshot)?;

    Ok(snapshot
        .resonance_edges
        .iter()
        .filter(|edge| edge.confidence > config.resonance_promotion_confidence_threshold)
        .filter(|edge| !edge.has_canonical_bimba_relation)
        .filter(|edge| edge.source_namespace != edge.target_namespace)
        .map(|edge| QReviewQueueEntry {
            target_coordinate: edge.source_coordinate.clone(),
            q_key: "q_1_i0_relation_family".to_owned(),
            reason_class: QReviewReasonClass::PromotionCandidate,
            evidence_refs: vec![QReviewEvidenceRef {
                kind: "resonates_with_high_confidence".to_owned(),
                uri: format!(
                    "gnosis://resonates_with/{}::{}",
                    edge.source_coordinate, edge.target_coordinate
                ),
                coordinate: Some(edge.target_coordinate.clone()),
                summary: Some(format!("confidence={:.6}", edge.confidence)),
            }],
            priority: priority_for(QReviewReasonClass::PromotionCandidate, config),
            source_detector: "epii-q-resonance-harvester".to_owned(),
            review_surface: surface_for(QReviewReasonClass::PromotionCandidate),
        })
        .collect())
}

fn validate_snapshot(snapshot: &CorpusSnapshot) -> Result<(), String> {
    if snapshot.day_id.trim().is_empty() {
        return Err("corpus_snapshot.day_id is required".to_owned());
    }
    for node in &snapshot.nodes {
        if node.coordinate.trim().is_empty() {
            return Err("node.coordinate is required".to_owned());
        }
        if node.embedding_3072.len() != 3072 {
            return Err(format!(
                "node {} embedding_3072 must contain exactly 3072 dimensions, got {}",
                node.coordinate,
                node.embedding_3072.len()
            ));
        }
    }
    Ok(())
}

fn validate_config(config: &QDetectorConfig) -> Result<(), String> {
    if !(0.0..=1.0).contains(&config.articulation_gap_peer_ratio) {
        return Err("articulation_gap_peer_ratio must be between 0 and 1".to_owned());
    }
    if !(0.0..=2.0).contains(&config.contradiction_vector_disagreement_threshold) {
        return Err(
            "contradiction_vector_disagreement_threshold must be between 0 and 2".to_owned(),
        );
    }
    if !(0.0..=1.0).contains(&config.resonance_promotion_confidence_threshold) {
        return Err("resonance_promotion_confidence_threshold must be between 0 and 1".to_owned());
    }
    if config.priority_order.is_empty() {
        return Err("priority_order must contain at least one reason class".to_owned());
    }
    Ok(())
}

fn is_q_key(key: &str) -> bool {
    let Some(rest) = key.strip_prefix("q_") else {
        return false;
    };
    let mut segments = rest.split('_');
    let Some(position) = segments.next() else {
        return false;
    };
    matches!(position.trim_end_matches('\'').as_bytes(), [b'0'..=b'5'])
        && segments.any(|segment| !segment.is_empty())
}

fn priority_for(reason_class: QReviewReasonClass, config: &QDetectorConfig) -> u32 {
    config
        .priority_order
        .iter()
        .position(|item| *item == reason_class)
        .map(|position| position as u32)
        .unwrap_or(config.priority_order.len() as u32)
}

fn surface_for(reason_class: QReviewReasonClass) -> QReviewSurface {
    match reason_class {
        QReviewReasonClass::ArticulationGap => QReviewSurface {
            portal_plugin_id: "m5.q_review".to_owned(),
            theia_workspace: "agentic-control-room/pair-composition".to_owned(),
            vak_cf: "(4.5/0)".to_owned(),
            vak_cp: "M4-3'".to_owned(),
            kind: QReviewSurfaceKind::M4ResidentEditing,
            pair_composition_action: "open_in_pair_composition".to_owned(),
        },
        QReviewReasonClass::PromotionCandidate => QReviewSurface {
            portal_plugin_id: "m5.q_review".to_owned(),
            theia_workspace: "agentic-control-room/pair-composition".to_owned(),
            vak_cf: "(5/0)".to_owned(),
            vak_cp: "M0'".to_owned(),
            kind: QReviewSurfaceKind::M0PrimeGraphChrome,
            pair_composition_action: "open_in_pair_composition".to_owned(),
        },
        QReviewReasonClass::ContradictionCandidate => QReviewSurface {
            portal_plugin_id: "m5.q_review".to_owned(),
            theia_workspace: "agentic-control-room/pair-composition".to_owned(),
            vak_cf: "(0/1/2/3)".to_owned(),
            vak_cp: "M5".to_owned(),
            kind: QReviewSurfaceKind::M5DialecticalReview,
            pair_composition_action: "open_in_pair_composition".to_owned(),
        },
        QReviewReasonClass::StaleByNonRevisit => QReviewSurface {
            portal_plugin_id: "m5.q_review".to_owned(),
            theia_workspace: "agentic-control-room/pair-composition".to_owned(),
            vak_cf: "(4.5/0)".to_owned(),
            vak_cp: "M5-4'".to_owned(),
            kind: QReviewSurfaceKind::M5ContinuityReview,
            pair_composition_action: "open_in_pair_composition".to_owned(),
        },
    }
}

fn cosine_similarity(left: &[f64], right: &[f64]) -> Result<f64, String> {
    if left.len() != right.len() {
        return Err("embedding vectors must have matching dimensions".to_owned());
    }
    let dot = left.iter().zip(right).map(|(a, b)| a * b).sum::<f64>();
    let left_norm = left.iter().map(|value| value * value).sum::<f64>().sqrt();
    let right_norm = right.iter().map(|value| value * value).sum::<f64>().sqrt();
    if left_norm == 0.0 || right_norm == 0.0 {
        return Ok(0.0);
    }
    Ok((dot / (left_norm * right_norm)).clamp(-1.0, 1.0))
}

fn lexical_disagreement(left: &str, right: &str) -> f64 {
    let left_tokens = token_set(left);
    let right_tokens = token_set(right);
    if left_tokens.is_empty() && right_tokens.is_empty() {
        return 0.0;
    }
    let intersection = left_tokens.intersection(&right_tokens).count();
    let union = left_tokens.union(&right_tokens).count();
    1.0 - (intersection as f64 / union as f64)
}

fn token_set(value: &str) -> BTreeSet<String> {
    value
        .split(|ch: char| !ch.is_ascii_alphanumeric())
        .filter(|token| token.len() > 2)
        .map(|token| token.to_ascii_lowercase())
        .collect()
}
