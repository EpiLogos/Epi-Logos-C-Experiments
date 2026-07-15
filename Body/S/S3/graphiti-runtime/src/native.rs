use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::{hash_map::DefaultHasher, BTreeMap, BTreeSet};
use std::hash::{Hash, Hasher};

use crate::NaraRelation;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct TranscriptMessage {
    pub role: String,
    pub content: String,
    pub timestamp: Option<String>,
    pub index: usize,
    pub provenance_handle: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct NeutralTranscript {
    pub session_id: String,
    pub harness: String,
    pub transcript_ref: String,
    pub messages: Vec<TranscriptMessage>,
}

impl NeutralTranscript {
    pub fn text(&self) -> String {
        self.messages
            .iter()
            .map(|message| format!("{}: {}", message.role, message.content))
            .collect::<Vec<_>>()
            .join("\n")
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ExtractedEntity {
    pub name: String,
    #[serde(rename = "type")]
    pub entity_type: String,
    pub description: String,
    #[serde(default)]
    pub aliases: Vec<String>,
    #[serde(default)]
    pub provenance_handles: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ExtractedRelationship {
    pub source: String,
    pub target: String,
    pub predicate: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ExtractedEventAnchor {
    pub label: String,
    pub timestamp: Option<String>,
    pub provenance_handle: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SophiaExtraction {
    pub entities: Vec<ExtractedEntity>,
    pub relationships: Vec<ExtractedRelationship>,
    pub event_anchors: Vec<ExtractedEventAnchor>,
    pub summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct EntityNode {
    pub uuid: String,
    pub name: String,
    #[serde(rename = "type")]
    pub entity_type: String,
    pub description: String,
    pub aliases: Vec<String>,
    pub first_seen_episode: String,
    pub last_seen_episode: String,
    pub provenance_handles: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct RelationshipEdge {
    pub uuid: String,
    pub source_uuid: String,
    pub target_uuid: String,
    pub predicate: String,
    pub description: String,
    pub first_seen_episode: String,
    pub last_seen_episode: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct EpisodeNode {
    pub uuid: String,
    pub session_id: String,
    pub timestamp: String,
    pub harness: String,
    pub entity_count: usize,
    pub edge_count: usize,
    pub transcript_ref: String,
    pub summary: String,
    #[serde(default)]
    pub provenance_handles: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct IngestReceipt {
    pub session_id: String,
    pub entities_extracted: usize,
    pub episodic_edges_created: usize,
    pub graphiti_episode_uuid: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq, Eq)]
pub struct MemoryQueryResult {
    pub entities: Vec<EntityNode>,
    pub relationships: Vec<RelationshipEdge>,
    pub episodes: Vec<EpisodeNode>,
}

pub trait GraphitiClient {
    fn ingest_transcript(
        &mut self,
        transcript_blob: &str,
        session_id: Option<&str>,
        harness: Option<&str>,
        transcript_ref: Option<&str>,
    ) -> Result<IngestReceipt, String>;

    fn query_graphiti(&self, query: &str, num_results: usize) -> MemoryQueryResult;
}

#[derive(Debug, Clone, Default)]
pub struct NativeLibraryClient {
    store: InMemoryGraphitiStore,
    extractor: SophiaExtractionService,
}

impl NativeLibraryClient {
    pub fn new(store: InMemoryGraphitiStore) -> Self {
        Self {
            store,
            extractor: SophiaExtractionService::default(),
        }
    }

    pub fn store(&self) -> &InMemoryGraphitiStore {
        &self.store
    }

    pub fn store_mut(&mut self) -> &mut InMemoryGraphitiStore {
        &mut self.store
    }
}

impl GraphitiClient for NativeLibraryClient {
    fn ingest_transcript(
        &mut self,
        transcript_blob: &str,
        session_id: Option<&str>,
        harness: Option<&str>,
        transcript_ref: Option<&str>,
    ) -> Result<IngestReceipt, String> {
        let neutral = canonicalise_transcript(transcript_blob, session_id, harness, transcript_ref);
        let extraction = self.extractor.extract_entities(&neutral);
        let episode = self.store.prepare_episode(
            &neutral.session_id,
            &neutral.harness,
            &neutral.transcript_ref,
            &extraction.summary,
        );
        Ok(self.store.commit_episode(extraction, episode))
    }

    fn query_graphiti(&self, query: &str, num_results: usize) -> MemoryQueryResult {
        self.store.query(query, num_results)
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq, Eq)]
pub struct InMemoryGraphitiStore {
    pub entities: BTreeMap<String, EntityNode>,
    pub entity_key_index: BTreeMap<String, String>,
    pub relationships: BTreeMap<String, RelationshipEdge>,
    pub episodes: BTreeMap<String, EpisodeNode>,
}

impl InMemoryGraphitiStore {
    pub fn insert_nara_relation(
        &mut self,
        day_id: &str,
        episode_handle: &str,
        relation: &NaraRelation,
    ) -> (RelationshipEdge, bool) {
        let predicate = relation.kind.edge_label();
        let edge_uuid = stable_id(
            "graphiti:nara-relation",
            &[day_id, episode_handle, &relation.target_handle, predicate],
        );
        if let Some(edge) = self.relationships.get_mut(&edge_uuid) {
            edge.last_seen_episode = episode_handle.to_owned();
            return (edge.clone(), false);
        }

        let edge = RelationshipEdge {
            uuid: edge_uuid.clone(),
            source_uuid: episode_handle.to_owned(),
            target_uuid: relation.target_handle.clone(),
            predicate: predicate.to_owned(),
            description: serde_json::json!({
                "dayId": day_id,
                "privacyClass": relation.privacy_class.as_str(),
                "metadata": relation.metadata,
            })
            .to_string(),
            first_seen_episode: episode_handle.to_owned(),
            last_seen_episode: episode_handle.to_owned(),
        };
        self.relationships.insert(edge_uuid, edge.clone());
        (edge, true)
    }

    pub fn nara_relations_for_episode(&self, episode_handle: &str) -> Vec<RelationshipEdge> {
        self.relationships
            .values()
            .filter(|edge| {
                edge.source_uuid == episode_handle
                    && matches!(
                        edge.predicate.as_str(),
                        "HAS_DAY" | "CONTAINS_DAILY_NOTE" | "PART_OF_DAY" | "NEXT_IN_ARC"
                    )
            })
            .cloned()
            .collect()
    }

    pub fn prepare_episode(
        &self,
        session_id: &str,
        harness: &str,
        transcript_ref: &str,
        summary: &str,
    ) -> EpisodeNode {
        let episode_uuid = stable_id(
            "graphiti:episode",
            &[
                session_id,
                transcript_ref,
                &summary[..summary.len().min(120)],
            ],
        );
        EpisodeNode {
            uuid: episode_uuid,
            session_id: session_id.to_owned(),
            timestamp: chrono::Utc::now().to_rfc3339(),
            harness: harness.to_owned(),
            entity_count: 0,
            edge_count: 0,
            transcript_ref: transcript_ref.to_owned(),
            summary: summary.to_owned(),
            provenance_handles: vec![transcript_ref.to_owned()],
        }
    }

    pub fn commit_episode(
        &mut self,
        extraction: SophiaExtraction,
        mut episode: EpisodeNode,
    ) -> IngestReceipt {
        let mut nodes_by_entity_key: BTreeMap<String, EntityNode> = BTreeMap::new();

        for extracted in extraction.entities {
            let name = extracted.name.trim();
            if name.is_empty() {
                continue;
            }
            let key = entity_key(name);
            let node_uuid = if let Some(node_uuid) = self.entity_key_index.get(&key) {
                node_uuid.clone()
            } else {
                let node_uuid = stable_id("graphiti:entity", &[&key]);
                let node = EntityNode {
                    uuid: node_uuid.clone(),
                    name: name.to_owned(),
                    entity_type: extracted.entity_type.clone(),
                    description: extracted.description.clone(),
                    aliases: unique(extracted.aliases.clone()),
                    first_seen_episode: episode.uuid.clone(),
                    last_seen_episode: episode.uuid.clone(),
                    provenance_handles: unique(extracted.provenance_handles.clone()),
                };
                self.entities.insert(node_uuid.clone(), node);
                self.entity_key_index.insert(key.clone(), node_uuid.clone());
                node_uuid
            };

            let node = self
                .entities
                .get_mut(&node_uuid)
                .expect("entity index points at stored node");
            node.last_seen_episode = episode.uuid.clone();
            if !extracted.description.is_empty()
                && !node.description.contains(&extracted.description)
            {
                if !node.description.is_empty() {
                    node.description.push(' ');
                }
                node.description.push_str(&extracted.description);
            }
            for alias in extracted.aliases {
                if entity_key(&alias) != key && !node.aliases.contains(&alias) {
                    node.aliases.push(alias);
                }
            }
            for handle in extracted.provenance_handles {
                if !node.provenance_handles.contains(&handle) {
                    node.provenance_handles.push(handle);
                }
            }
            nodes_by_entity_key.insert(key, node.clone());
        }

        let mut created_edges = 0;
        for rel in extraction.relationships {
            let Some(source) = nodes_by_entity_key.get(&entity_key(&rel.source)) else {
                continue;
            };
            let Some(target) = nodes_by_entity_key.get(&entity_key(&rel.target)) else {
                continue;
            };
            if source.uuid == target.uuid {
                continue;
            }
            let edge_uuid = stable_id(
                "graphiti:relationship",
                &[&source.uuid, &target.uuid, &rel.predicate],
            );
            if let Some(edge) = self.relationships.get_mut(&edge_uuid) {
                edge.last_seen_episode = episode.uuid.clone();
            } else {
                self.relationships.insert(
                    edge_uuid.clone(),
                    RelationshipEdge {
                        uuid: edge_uuid,
                        source_uuid: source.uuid.clone(),
                        target_uuid: target.uuid.clone(),
                        predicate: rel.predicate,
                        description: rel.description,
                        first_seen_episode: episode.uuid.clone(),
                        last_seen_episode: episode.uuid.clone(),
                    },
                );
                created_edges += 1;
            }
        }

        episode.entity_count = nodes_by_entity_key.len();
        episode.edge_count = created_edges;
        let session_id = episode.session_id.clone();
        let graphiti_episode_uuid = episode.uuid.clone();
        self.episodes.insert(episode.uuid.clone(), episode);

        IngestReceipt {
            session_id,
            entities_extracted: nodes_by_entity_key.len(),
            episodic_edges_created: created_edges,
            graphiti_episode_uuid,
        }
    }

    pub fn query(&self, query: &str, num_results: usize) -> MemoryQueryResult {
        let needle = query.to_lowercase();
        let limit = num_results.max(1);
        let entities = self
            .entities
            .values()
            .filter(|node| {
                node.name.to_lowercase().contains(&needle)
                    || node.description.to_lowercase().contains(&needle)
                    || node
                        .aliases
                        .iter()
                        .any(|alias| alias.to_lowercase().contains(&needle))
            })
            .take(limit)
            .cloned()
            .collect::<Vec<_>>();
        let entity_uuids = entities
            .iter()
            .map(|entity| entity.uuid.clone())
            .collect::<BTreeSet<_>>();
        let relationships = self
            .relationships
            .values()
            .filter(|edge| {
                entity_uuids.contains(&edge.source_uuid) || entity_uuids.contains(&edge.target_uuid)
            })
            .take(limit)
            .cloned()
            .collect::<Vec<_>>();
        let episodes = self
            .episodes
            .values()
            .filter(|episode| {
                episode.summary.to_lowercase().contains(&needle)
                    || episode.session_id.to_lowercase().contains(&needle)
            })
            .take(limit)
            .cloned()
            .collect::<Vec<_>>();

        MemoryQueryResult {
            entities,
            relationships,
            episodes,
        }
    }
}

#[derive(Debug, Clone, Default)]
pub struct SophiaExtractionService;

impl SophiaExtractionService {
    pub fn extract_entities(&self, transcript: &NeutralTranscript) -> SophiaExtraction {
        let mut entities_by_key: BTreeMap<String, ExtractedEntity> = BTreeMap::new();
        let mut relationships: BTreeMap<(String, String, String), ExtractedRelationship> =
            BTreeMap::new();
        let mut event_anchors = Vec::new();

        for message in &transcript.messages {
            let names = extract_names(&message.content);
            if let Some(timestamp) = &message.timestamp {
                event_anchors.push(ExtractedEventAnchor {
                    label: format!("{}:{}", message.role, message.index),
                    timestamp: Some(timestamp.clone()),
                    provenance_handle: message.provenance_handle.clone(),
                });
            }

            for name in &names {
                let key = entity_key(name);
                if let Some(entity) = entities_by_key.get_mut(&key) {
                    if !entity
                        .provenance_handles
                        .contains(&message.provenance_handle)
                    {
                        entity
                            .provenance_handles
                            .push(message.provenance_handle.clone());
                    }
                } else {
                    entities_by_key.insert(
                        key,
                        ExtractedEntity {
                            name: name.clone(),
                            entity_type: infer_type(name),
                            description: format!(
                                "Mentioned in {} transcript {}.",
                                transcript.harness, transcript.session_id
                            ),
                            aliases: Vec::new(),
                            provenance_handles: vec![message.provenance_handle.clone()],
                        },
                    );
                }
            }

            for pair in names.windows(2) {
                let left = &pair[0];
                let right = &pair[1];
                if entity_key(left) == entity_key(right) {
                    continue;
                }
                let predicate = predicate_for(&message.content);
                relationships
                    .entry((entity_key(left), entity_key(right), predicate.clone()))
                    .or_insert_with(|| ExtractedRelationship {
                        source: left.clone(),
                        target: right.clone(),
                        predicate: predicate.clone(),
                        description: format!(
                            "{} {} {} in transcript {}.",
                            left,
                            predicate.to_lowercase(),
                            right,
                            transcript.session_id
                        ),
                    });
            }
        }

        let text = transcript.text();
        SophiaExtraction {
            entities: entities_by_key.into_values().collect(),
            relationships: relationships.into_values().collect(),
            event_anchors,
            summary: text.chars().take(400).collect(),
        }
    }
}

pub fn canonicalise_transcript(
    transcript_blob: &str,
    session_id: Option<&str>,
    harness: Option<&str>,
    transcript_ref: Option<&str>,
) -> NeutralTranscript {
    let digest = stable_hash_short(transcript_blob);
    let mut resolved_session_id = session_id
        .map(str::to_owned)
        .unwrap_or_else(|| format!("session-{digest}"));
    let mut resolved_harness = harness.unwrap_or("neutral").to_owned();
    let mut resolved_ref = transcript_ref
        .map(str::to_owned)
        .unwrap_or_else(|| format!("transcript://{resolved_harness}/{resolved_session_id}"));

    let mut entries = Vec::new();
    let stripped = transcript_blob.trim();
    if !stripped.is_empty() {
        if let Ok(parsed) = serde_json::from_str::<Value>(stripped) {
            collect_entries_from_value(
                parsed,
                &mut resolved_session_id,
                &mut resolved_harness,
                &mut resolved_ref,
                session_id.is_some(),
                harness.is_some(),
                transcript_ref.is_some(),
                &mut entries,
            );
        } else {
            let mut jsonl_entries = Vec::new();
            let mut all_jsonl = true;
            for line in stripped.lines().filter(|line| !line.trim().is_empty()) {
                match serde_json::from_str::<Value>(line) {
                    Ok(value) => jsonl_entries.push(value),
                    Err(_) => {
                        all_jsonl = false;
                        break;
                    }
                }
            }
            if all_jsonl && !jsonl_entries.is_empty() {
                entries = jsonl_entries;
            } else {
                entries = stripped
                    .lines()
                    .filter(|line| !line.trim().is_empty())
                    .map(|line| {
                        let trimmed = line.trim();
                        if let Some((role, content)) = role_prefixed_line(trimmed) {
                            serde_json::json!({ "role": role, "content": content })
                        } else {
                            serde_json::json!({ "role": "unknown", "content": trimmed })
                        }
                    })
                    .collect();
            }
        }
    }

    let mut messages = Vec::new();
    for (index, entry) in entries.into_iter().enumerate() {
        let one_based = index + 1;
        let handle = format!("{resolved_ref}#L{one_based}");
        let message = message_from_value(&entry, one_based, &handle);
        if !message.content.trim().is_empty() {
            messages.push(message);
        }
    }

    NeutralTranscript {
        session_id: resolved_session_id,
        harness: resolved_harness,
        transcript_ref: resolved_ref,
        messages,
    }
}

fn collect_entries_from_value(
    value: Value,
    resolved_session_id: &mut String,
    resolved_harness: &mut String,
    resolved_ref: &mut String,
    session_id_pinned: bool,
    harness_pinned: bool,
    transcript_ref_pinned: bool,
    entries: &mut Vec<Value>,
) {
    match value {
        Value::Array(values) => *entries = values,
        Value::Object(mut map) => {
            if !session_id_pinned {
                if let Some(value) = map.get("session_id").and_then(Value::as_str) {
                    *resolved_session_id = value.to_owned();
                }
            }
            if !harness_pinned {
                if let Some(value) = map.get("harness").and_then(Value::as_str) {
                    *resolved_harness = value.to_owned();
                }
            }
            if !transcript_ref_pinned {
                if let Some(value) = map.get("transcript_ref").and_then(Value::as_str) {
                    *resolved_ref = value.to_owned();
                }
            }
            if let Some(Value::Array(values)) =
                map.remove("messages").or_else(|| map.remove("transcript"))
            {
                *entries = values;
            }
        }
        other => entries.push(other),
    }
}

fn message_from_value(entry: &Value, index: usize, handle: &str) -> TranscriptMessage {
    let msg = entry
        .get("message")
        .filter(|value| value.is_object())
        .unwrap_or(entry);
    let role = msg
        .get("role")
        .or_else(|| entry.get("role"))
        .and_then(Value::as_str)
        .unwrap_or("unknown")
        .to_owned();
    let timestamp = msg
        .get("timestamp")
        .or_else(|| entry.get("timestamp"))
        .or_else(|| entry.get("created_at"))
        .and_then(value_to_string);
    TranscriptMessage {
        role,
        content: content_to_text(msg.get("content")),
        timestamp,
        index,
        provenance_handle: handle.to_owned(),
    }
}

fn content_to_text(content: Option<&Value>) -> String {
    match content {
        Some(Value::String(text)) => text.clone(),
        Some(Value::Array(blocks)) => blocks
            .iter()
            .filter_map(|block| match block {
                Value::Object(map) => map
                    .get("text")
                    .or_else(|| map.get("content"))
                    .and_then(value_to_string),
                other => value_to_string(other),
            })
            .collect::<Vec<_>>()
            .join("\n"),
        Some(Value::Null) | None => String::new(),
        Some(other) => value_to_string(other).unwrap_or_default(),
    }
}

fn value_to_string(value: &Value) -> Option<String> {
    match value {
        Value::String(text) => Some(text.clone()),
        Value::Number(number) => Some(number.to_string()),
        Value::Bool(value) => Some(value.to_string()),
        Value::Null => None,
        other => Some(other.to_string()),
    }
}

fn role_prefixed_line(line: &str) -> Option<(&'static str, &str)> {
    const ROLES: &[&str] = &["user", "assistant", "system", "tool"];
    let (role, content) = line.split_once(':')?;
    let role = role.trim().to_ascii_lowercase();
    let role = ROLES.iter().copied().find(|candidate| *candidate == role)?;
    Some((role, content.trim()))
}

fn extract_names(content: &str) -> Vec<String> {
    let mut ordered = Vec::new();
    for raw in content.split_whitespace() {
        let cleaned = raw.trim_matches(|c: char| ".,:;()[]{}\"'".contains(c));
        if cleaned.is_empty() {
            continue;
        }
        if cleaned.contains(".memory.") || is_coordinate_name(cleaned) || starts_uppercase(cleaned)
        {
            let name = cleaned.to_owned();
            if !is_stop_name(&name) && !ordered.contains(&name) {
                ordered.push(name);
            }
        }
    }
    ordered
}

fn starts_uppercase(value: &str) -> bool {
    value.chars().next().is_some_and(char::is_uppercase)
}

fn is_coordinate_name(value: &str) -> bool {
    let trimmed = value.trim_end_matches('\'');
    let mut chars = trimmed.chars();
    let Some(first) = chars.next() else {
        return false;
    };
    matches!(first, 'S' | 'M' | 'C' | 'L' | 'P' | 'T')
        && chars.clone().count() == 1
        && chars.all(|c| c.is_ascii_digit())
}

fn is_stop_name(value: &str) -> bool {
    matches!(
        value,
        "User" | "Assistant" | "System" | "Please" | "The" | "This" | "That" | "Return" | "JSON"
    )
}

fn infer_type(name: &str) -> String {
    if matches!(
        name,
        "Sophia" | "Aletheia" | "Anima" | "Eros" | "Logos" | "Nous" | "Mythos" | "Psyche"
    ) {
        "Agent".to_owned()
    } else if name == "Graphiti" {
        "EpisodicGraph".to_owned()
    } else if name.starts_with("s2'") || name.starts_with("s5'") {
        "ApiMethod".to_owned()
    } else if is_coordinate_name(name) {
        "Coordinate".to_owned()
    } else {
        "Concept".to_owned()
    }
}

fn predicate_for(content: &str) -> String {
    let lowered = content.to_lowercase();
    if lowered.contains("extract") {
        "EXTRACTS_FOR".to_owned()
    } else if lowered.contains("entif") || lowered.contains("deduplicat") {
        "ENTIFIES_FOR".to_owned()
    } else if lowered.contains("graphiti")
        || lowered.contains("commit")
        || lowered.contains("store")
    {
        "COMMITS_TO".to_owned()
    } else {
        "CO_OCCURS_WITH".to_owned()
    }
}

fn entity_key(name: &str) -> String {
    name.split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
        .to_lowercase()
}

fn unique(values: Vec<String>) -> Vec<String> {
    let mut seen = BTreeSet::new();
    values
        .into_iter()
        .filter(|value| seen.insert(value.clone()))
        .collect()
}

fn stable_hash_short(value: &str) -> String {
    let mut hasher = DefaultHasher::new();
    value.hash(&mut hasher);
    format!("{:012x}", hasher.finish() & 0x0000_ffff_ffff_ffff)
}

fn stable_id(namespace: &str, parts: &[&str]) -> String {
    let mut hasher = DefaultHasher::new();
    namespace.hash(&mut hasher);
    for part in parts {
        part.hash(&mut hasher);
    }
    format!("{namespace}:{}", hasher.finish())
}
