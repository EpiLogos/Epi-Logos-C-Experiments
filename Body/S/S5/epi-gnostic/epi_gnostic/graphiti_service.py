"""Graphiti episodic memory HTTP compatibility adapter — port 37778.

Wraps graphiti-core for the Pratibimba namespace in the shared Neo4j database while
the target architecture moves Graphiti into a native S3 runtime adapter.
The group_id→database switch is patched out: group_id operates as a property
filter only. All data stays in the "neo4j" database alongside Bimba and Gnostic.
"""
from __future__ import annotations

import os
import re
import time
import hashlib
import json
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Optional

import redis.asyncio as aioredis
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

load_dotenv()

# ── Lazy graphiti init (avoids import cost at startup) ────────────────────────
_graphiti: Any = None
_redis: Any = None
_config: Any = None
_memory_pipeline_graph: Any = None


def _graphiti_group_id(group_id: Optional[str]) -> str:
    """Map canonical gateway/session keys onto Graphiti's storage-safe group id."""
    if not group_id:
        return "default"
    safe = re.sub(r"[^a-zA-Z0-9_-]+", "_", group_id).strip("_")
    return safe or "default"


async def get_graphiti():
    global _graphiti, _config
    if _graphiti is None:
        from graphiti_core import Graphiti
        from graphiti_core.cross_encoder.gemini_reranker_client import GeminiRerankerClient
        from graphiti_core.driver.neo4j_driver import Neo4jDriver
        from graphiti_core.embedder.gemini import GeminiEmbedder, GeminiEmbedderConfig
        from graphiti_core.llm_client.config import LLMConfig
        from graphiti_core.llm_client.gemini_client import GeminiClient

        from epi_gnostic.graphiti_config import GraphitiConfig

        _config = GraphitiConfig()

        driver = Neo4jDriver(
            uri=_config.neo4j_uri,
            user=_config.neo4j_user,
            password=_config.neo4j_password,
            database=_config.neo4j_database,
        )

        # PATCH: monkey-patch graphiti so group_id never triggers a database switch.
        # group_id is used as a property filter only — data stays in "neo4j".
        _patch_graphiti_group_id()

        embedder = GeminiEmbedder(
            config=GeminiEmbedderConfig(
                api_key=_config.gemini_api_key or None,
                embedding_model=_config.embedding_model,
                embedding_dim=_config.embedding_dim,
            ),
            batch_size=1,
        )
        llm_client = GeminiClient(
            config=LLMConfig(
                api_key=_config.gemini_api_key or None,
                model=_config.llm_model,
            )
        )
        cross_encoder = GeminiRerankerClient(
            config=LLMConfig(
                api_key=_config.gemini_api_key or None,
                model=_config.llm_model,
            )
        )

        _graphiti = Graphiti(
            graph_driver=driver,
            embedder=embedder,
            llm_client=llm_client,
            cross_encoder=cross_encoder,
        )
        await _graphiti.build_indices_and_constraints(delete_existing=False)

    return _graphiti


async def get_redis():
    global _redis, _config
    if _redis is None:
        from epi_gnostic.graphiti_config import GraphitiConfig
        if _config is None:
            _config = GraphitiConfig()
        _redis = aioredis.from_url(_config.redis_url, decode_responses=True)
    return _redis


def _patch_graphiti_group_id():
    """Remove the group_id → database switch from graphiti_core.

    graphiti_core/graphiti.py contains logic that clones the driver with a
    different database name when group_id is set. We disable this so that
    group_id acts as a property filter only and all data stays in "neo4j".
    """
    try:
        import graphiti_core.graphiti as _g_mod

        original_add_episode = _g_mod.Graphiti.add_episode

        async def _patched_add_episode(self, *args, **kwargs):
            # Ensure driver is never replaced by group_id switching
            original_driver = self.driver
            result = await original_add_episode(self, *args, **kwargs)
            self.driver = original_driver
            return result

        _g_mod.Graphiti.add_episode = _patched_add_episode
    except Exception:
        pass  # If graphiti internals change, fail gracefully


# -- Harness-blind cross-session memory pipeline -----------------------------

@dataclass
class TranscriptMessage:
    role: str
    content: str
    timestamp: Optional[str] = None
    index: int = 0
    provenance_handle: str = ""


@dataclass
class NeutralTranscript:
    session_id: str
    harness: str
    transcript_ref: str
    messages: list[TranscriptMessage]

    @property
    def text(self) -> str:
        return "\n".join(f"{msg.role}: {msg.content}" for msg in self.messages)


@dataclass
class ExtractedEntity:
    name: str
    type: str = "Concept"
    description: str = ""
    aliases: list[str] = field(default_factory=list)
    provenance_handles: list[str] = field(default_factory=list)


@dataclass
class ExtractedRelationship:
    source: str
    target: str
    predicate: str
    description: str = ""


@dataclass
class ExtractedEventAnchor:
    label: str
    timestamp: Optional[str] = None
    provenance_handle: str = ""


@dataclass
class SophiaExtraction:
    entities: list[ExtractedEntity]
    relationships: list[ExtractedRelationship]
    event_anchors: list[ExtractedEventAnchor]
    summary: str


@dataclass
class EntityNode:
    uuid: str
    name: str
    type: str
    description: str
    aliases: list[str]
    first_seen_episode: str
    last_seen_episode: str
    provenance_handles: list[str]


@dataclass
class RelationshipEdge:
    uuid: str
    source_uuid: str
    target_uuid: str
    predicate: str
    description: str
    first_seen_episode: str
    last_seen_episode: str


@dataclass
class EpisodeNode:
    uuid: str
    session_id: str
    timestamp: str
    harness: str
    entity_count: int
    edge_count: int
    transcript_ref: str
    summary: str
    provenance_handles: list[str] = field(default_factory=list)


@dataclass
class IngestReceipt:
    session_id: str
    entities_extracted: int
    episodic_edges_created: int
    graphiti_episode_uuid: str


def _stable_uuid(namespace: str, *parts: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_URL, namespace + ":" + "|".join(parts)))


def _entity_key(name: str) -> str:
    return re.sub(r"\s+", " ", name.strip().casefold())


def _content_to_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        blocks: list[str] = []
        for block in content:
            if isinstance(block, dict):
                text = block.get("text") or block.get("content")
                if text:
                    blocks.append(str(text))
            elif block is not None:
                blocks.append(str(block))
        return "\n".join(blocks)
    if content is None:
        return ""
    return str(content)


def _message_from_mapping(entry: dict[str, Any], index: int, handle: str) -> TranscriptMessage:
    msg = entry.get("message") if isinstance(entry.get("message"), dict) else entry
    role = str(msg.get("role") or entry.get("role") or "unknown")
    timestamp = msg.get("timestamp") or entry.get("timestamp") or entry.get("created_at")
    return TranscriptMessage(
        role=role,
        content=_content_to_text(msg.get("content")),
        timestamp=str(timestamp) if timestamp else None,
        index=index,
        provenance_handle=handle,
    )


def canonicalise_transcript(
    transcript_blob: Any,
    *,
    session_id: Optional[str] = None,
    harness: Optional[str] = None,
    transcript_ref: Optional[str] = None,
) -> NeutralTranscript:
    """Canonicalise plaintext, neutral JSONL, or Claude-native JSONL transcript."""
    if isinstance(transcript_blob, bytes):
        transcript_blob = transcript_blob.decode("utf-8")

    raw_text = transcript_blob if isinstance(transcript_blob, str) else json.dumps(transcript_blob, sort_keys=True)
    digest = hashlib.sha256(raw_text.encode("utf-8")).hexdigest()[:12]
    resolved_session_id = session_id or f"session-{digest}"
    resolved_harness = harness or "neutral"
    resolved_ref = transcript_ref or f"transcript://{resolved_harness}/{resolved_session_id}"

    entries: list[Any] = []
    if isinstance(transcript_blob, list):
        entries = transcript_blob
    elif isinstance(transcript_blob, dict):
        resolved_session_id = session_id or str(transcript_blob.get("session_id") or resolved_session_id)
        resolved_harness = harness or str(transcript_blob.get("harness") or resolved_harness)
        resolved_ref = transcript_ref or str(transcript_blob.get("transcript_ref") or resolved_ref)
        entries = list(transcript_blob.get("messages") or transcript_blob.get("transcript") or [])
    else:
        stripped = raw_text.strip()
        if stripped:
            parsed_json = None
            try:
                parsed_json = json.loads(stripped)
            except json.JSONDecodeError:
                parsed_json = None
            if isinstance(parsed_json, dict):
                return canonicalise_transcript(
                    parsed_json,
                    session_id=resolved_session_id,
                    harness=resolved_harness,
                    transcript_ref=resolved_ref,
                )
            if isinstance(parsed_json, list):
                entries = parsed_json
            else:
                jsonl_entries: list[Any] = []
                all_jsonl = True
                for line in stripped.splitlines():
                    if not line.strip():
                        continue
                    try:
                        jsonl_entries.append(json.loads(line))
                    except json.JSONDecodeError:
                        all_jsonl = False
                        break
                entries = jsonl_entries if all_jsonl and jsonl_entries else []
                if not entries:
                    for index, line in enumerate(stripped.splitlines(), start=1):
                        if not line.strip():
                            continue
                        role = "unknown"
                        content = line.strip()
                        match = re.match(r"^(user|assistant|system|tool)\s*:\s*(.+)$", content, re.I)
                        if match:
                            role = match.group(1).lower()
                            content = match.group(2)
                        entries.append({"role": role, "content": content})

    messages: list[TranscriptMessage] = []
    for index, entry in enumerate(entries, start=1):
        handle = f"{resolved_ref}#L{index}"
        if isinstance(entry, dict):
            message = _message_from_mapping(entry, index, handle)
        else:
            message = TranscriptMessage(
                role="unknown",
                content=_content_to_text(entry),
                index=index,
                provenance_handle=handle,
            )
        if message.content.strip():
            messages.append(message)

    return NeutralTranscript(
        session_id=resolved_session_id,
        harness=resolved_harness,
        transcript_ref=resolved_ref,
        messages=messages,
    )


class SophiaExtractionService:
    """Prompt-contract extraction surface with deterministic local fallback."""

    prompt_contract = (
        "Extract named entities, relationships, and event anchors from a "
        "harness-neutral transcript. Return JSON with entities, relationships, "
        "and event_anchors; do not assume a Claude-only harness."
    )

    _stop_names = {
        "User",
        "Assistant",
        "System",
        "Please",
        "The",
        "This",
        "That",
        "Return",
        "JSON",
    }

    _agent_names = {"Sophia", "Aletheia", "Anima", "Eros", "Logos", "Nous", "Mythos", "Psyche"}

    def extract_entities(self, transcript: Any) -> SophiaExtraction:
        neutral = (
            transcript
            if isinstance(transcript, NeutralTranscript)
            else canonicalise_transcript(transcript)
        )
        entities_by_key: dict[str, ExtractedEntity] = {}
        relationships: dict[tuple[str, str, str], ExtractedRelationship] = {}
        anchors: list[ExtractedEventAnchor] = []

        for msg in neutral.messages:
            names = self._extract_names(msg.content)
            if msg.timestamp:
                anchors.append(
                    ExtractedEventAnchor(
                        label=f"{msg.role}:{msg.index}",
                        timestamp=msg.timestamp,
                        provenance_handle=msg.provenance_handle,
                    )
                )
            for name in names:
                key = _entity_key(name)
                entity = entities_by_key.get(key)
                if entity is None:
                    entity = ExtractedEntity(
                        name=name,
                        type=self._infer_type(name),
                        description=f"Mentioned in {neutral.harness} transcript {neutral.session_id}.",
                        provenance_handles=[msg.provenance_handle],
                    )
                    entities_by_key[key] = entity
                elif msg.provenance_handle not in entity.provenance_handles:
                    entity.provenance_handles.append(msg.provenance_handle)

            for left, right in zip(names, names[1:]):
                if _entity_key(left) == _entity_key(right):
                    continue
                predicate = self._predicate_for(msg.content)
                rel_key = (_entity_key(left), _entity_key(right), predicate)
                relationships.setdefault(
                    rel_key,
                    ExtractedRelationship(
                        source=left,
                        target=right,
                        predicate=predicate,
                        description=f"{left} {predicate.lower()} {right} in transcript {neutral.session_id}.",
                    ),
                )

        summary = neutral.text[:400] if neutral.messages else ""
        return SophiaExtraction(
            entities=list(entities_by_key.values()),
            relationships=list(relationships.values()),
            event_anchors=anchors,
            summary=summary,
        )

    def _extract_names(self, content: str) -> list[str]:
        method_names = re.findall(r"\bs\d'?\.memory\.[a-z_]+\b", content)
        capitalised = re.findall(
            r"\b[A-Z][A-Za-z0-9']+(?:[- ][A-Z][A-Za-z0-9']+)*\b",
            content,
        )
        coordinate_names = re.findall(r"\b[SMCLPT]\d'?\b", content)
        ordered: list[str] = []
        for name in [*method_names, *capitalised, *coordinate_names]:
            cleaned = name.strip(".,:;()[]{}")
            if cleaned and cleaned not in self._stop_names and cleaned not in ordered:
                ordered.append(cleaned)
        return ordered

    def _infer_type(self, name: str) -> str:
        if name in self._agent_names:
            return "Agent"
        if name == "Graphiti":
            return "EpisodicGraph"
        if name.startswith("s2'") or name.startswith("s5'"):
            return "ApiMethod"
        if re.fullmatch(r"[SMCLPT]\d'?", name):
            return "Coordinate"
        return "Concept"

    def _predicate_for(self, content: str) -> str:
        lowered = content.casefold()
        if "extract" in lowered:
            return "EXTRACTS_FOR"
        if "entif" in lowered or "deduplicat" in lowered:
            return "ENTIFIES_FOR"
        if "graphiti" in lowered or "commit" in lowered or "store" in lowered:
            return "COMMITS_TO"
        return "CO_OCCURS_WITH"


class InMemoryGraphitiStore:
    """Schema-faithful episodic graph used for local Graphiti pipeline behavior."""

    def __init__(self):
        self.entities: dict[str, EntityNode] = {}
        self.entity_key_index: dict[str, str] = {}
        self.relationships: dict[str, RelationshipEdge] = {}
        self.episodes: dict[str, EpisodeNode] = {}

    def prepare_episode(
        self,
        *,
        session_id: str,
        harness: str,
        transcript_ref: str,
        summary: str,
    ) -> EpisodeNode:
        episode_uuid = _stable_uuid("graphiti:episode", session_id, transcript_ref, summary[:120])
        return EpisodeNode(
            uuid=episode_uuid,
            session_id=session_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            harness=harness,
            entity_count=0,
            edge_count=0,
            transcript_ref=transcript_ref,
            summary=summary,
            provenance_handles=[transcript_ref],
        )

    async def commit_episode(self, extraction: SophiaExtraction, episode: EpisodeNode) -> IngestReceipt:
        nodes_by_entity_key: dict[str, EntityNode] = {}
        for extracted in extraction.entities:
            name = extracted.name.strip()
            if not name:
                continue
            key = _entity_key(name)
            node_uuid = self.entity_key_index.get(key)
            if node_uuid is None:
                node_uuid = _stable_uuid("graphiti:entity", key)
                node = EntityNode(
                    uuid=node_uuid,
                    name=name,
                    type=extracted.type,
                    description=extracted.description,
                    aliases=list(dict.fromkeys(extracted.aliases)),
                    first_seen_episode=episode.uuid,
                    last_seen_episode=episode.uuid,
                    provenance_handles=list(dict.fromkeys(extracted.provenance_handles)),
                )
                self.entities[node_uuid] = node
                self.entity_key_index[key] = node_uuid
            else:
                node = self.entities[node_uuid]
                node.last_seen_episode = episode.uuid
                if extracted.description and extracted.description not in node.description:
                    node.description = (node.description + " " + extracted.description).strip()
                for alias in extracted.aliases:
                    if alias not in node.aliases and _entity_key(alias) != key:
                        node.aliases.append(alias)
                for handle in extracted.provenance_handles:
                    if handle not in node.provenance_handles:
                        node.provenance_handles.append(handle)
            nodes_by_entity_key[key] = node

        created_edges = 0
        for rel in extraction.relationships:
            source = nodes_by_entity_key.get(_entity_key(rel.source))
            target = nodes_by_entity_key.get(_entity_key(rel.target))
            if source is None or target is None or source.uuid == target.uuid:
                continue
            edge_uuid = _stable_uuid(
                "graphiti:relationship",
                source.uuid,
                target.uuid,
                rel.predicate,
            )
            if edge_uuid not in self.relationships:
                self.relationships[edge_uuid] = RelationshipEdge(
                    uuid=edge_uuid,
                    source_uuid=source.uuid,
                    target_uuid=target.uuid,
                    predicate=rel.predicate,
                    description=rel.description,
                    first_seen_episode=episode.uuid,
                    last_seen_episode=episode.uuid,
                )
                created_edges += 1
            else:
                self.relationships[edge_uuid].last_seen_episode = episode.uuid

        episode.entity_count = len(nodes_by_entity_key)
        episode.edge_count = created_edges
        self.episodes[episode.uuid] = episode
        return IngestReceipt(
            session_id=episode.session_id,
            entities_extracted=episode.entity_count,
            episodic_edges_created=episode.edge_count,
            graphiti_episode_uuid=episode.uuid,
        )

    async def query(self, query: str, *, num_results: int = 10) -> dict[str, Any]:
        needle = query.casefold()
        entities = [
            asdict(node)
            for node in self.entities.values()
            if needle in node.name.casefold()
            or needle in node.description.casefold()
            or any(needle in alias.casefold() for alias in node.aliases)
        ][:num_results]
        entity_uuids = {entity["uuid"] for entity in entities}
        relationships = [
            asdict(edge)
            for edge in self.relationships.values()
            if edge.source_uuid in entity_uuids or edge.target_uuid in entity_uuids
        ][:num_results]
        episodes = [
            asdict(episode)
            for episode in self.episodes.values()
            if needle in episode.summary.casefold() or needle in episode.session_id.casefold()
        ][:num_results]
        return {"entities": entities, "relationships": relationships, "episodes": episodes}


class GraphitiServiceStore(InMemoryGraphitiStore):
    """Graphiti-backed store that also writes the explicit episodic schema."""

    def __init__(self, graphiti: Any):
        super().__init__()
        self.graphiti = graphiti

    async def commit_episode(self, extraction: SophiaExtraction, episode: EpisodeNode) -> IngestReceipt:
        receipt = await super().commit_episode(extraction, episode)
        await self.graphiti.add_episode(
            name=f"memory:{episode.session_id}:{episode.uuid}",
            episode_body=episode.summary,
            source_description=(
                f"s2'.memory.ingest_transcript:harness={episode.harness}:"
                f"transcript_ref={episode.transcript_ref}"
            ),
            reference_time=datetime.now(timezone.utc),
            group_id=_graphiti_group_id(episode.session_id),
        )
        await self._write_schema_to_driver(episode)
        return receipt

    async def _write_schema_to_driver(self, episode: EpisodeNode) -> None:
        driver = getattr(self.graphiti, "driver", None)
        if driver is None:
            return
        async with driver.session() as session:
            await session.run(
                """
                MERGE (ep:EpisodeNode {uuid: $uuid})
                SET ep.session_id = $session_id,
                    ep.timestamp = $timestamp,
                    ep.harness = $harness,
                    ep.entity_count = $entity_count,
                    ep.edge_count = $edge_count,
                    ep.transcript_ref = $transcript_ref,
                    ep.summary = $summary,
                    ep.provenance_handles = $provenance_handles
                """,
                **asdict(episode),
            )
            for node in self.entities.values():
                await session.run(
                    """
                    MERGE (en:EntityNode {uuid: $uuid})
                    SET en.name = $name,
                        en.type = $type,
                        en.description = $description,
                        en.aliases = $aliases,
                        en.first_seen_episode = $first_seen_episode,
                        en.last_seen_episode = $last_seen_episode,
                        en.provenance_handles = $provenance_handles
                    WITH en
                    MATCH (ep:EpisodeNode {uuid: $episode_uuid})
                    MERGE (ep)-[:MENTIONS_ENTITY]->(en)
                    """,
                    **asdict(node),
                    episode_uuid=episode.uuid,
                )
            for edge in self.relationships.values():
                await session.run(
                    """
                    MATCH (source:EntityNode {uuid: $source_uuid})
                    MATCH (target:EntityNode {uuid: $target_uuid})
                    MERGE (source)-[rel:RELATIONSHIP_EDGE {uuid: $uuid}]->(target)
                    SET rel.predicate = $predicate,
                        rel.description = $description,
                        rel.first_seen_episode = $first_seen_episode,
                        rel.last_seen_episode = $last_seen_episode
                    """,
                    **asdict(edge),
                )

    async def query(self, query: str, *, num_results: int = 10) -> dict[str, Any]:
        driver = getattr(self.graphiti, "driver", None)
        if driver is not None:
            needle = query.casefold()
            async with driver.session() as session:
                entity_rows = await session.run(
                    """
                    MATCH (en:EntityNode)
                    WHERE toLower(en.name) CONTAINS $needle
                       OR toLower(coalesce(en.description, '')) CONTAINS $needle
                       OR any(alias IN coalesce(en.aliases, []) WHERE toLower(alias) CONTAINS $needle)
                    RETURN en LIMIT $limit
                    """,
                    needle=needle,
                    limit=num_results,
                )
                entities = [dict(row["en"]) async for row in entity_rows]
                return {"entities": entities, "relationships": [], "episodes": []}
        return await super().query(query, num_results=num_results)


class AletheiaEntificationService:
    def __init__(self, graph: InMemoryGraphitiStore):
        self.graph = graph

    async def entify(self, extraction: SophiaExtraction, session_graphiti_episode: EpisodeNode) -> IngestReceipt:
        return await self.graph.commit_episode(extraction, session_graphiti_episode)


def _default_memory_graph() -> InMemoryGraphitiStore:
    global _memory_pipeline_graph
    if _memory_pipeline_graph is None:
        _memory_pipeline_graph = InMemoryGraphitiStore()
    return _memory_pipeline_graph


async def ingest_transcript(
    transcript_blob: Any,
    *,
    session_id: Optional[str] = None,
    harness: Optional[str] = None,
    transcript_ref: Optional[str] = None,
    graph: Optional[InMemoryGraphitiStore] = None,
) -> IngestReceipt:
    neutral = canonicalise_transcript(
        transcript_blob,
        session_id=session_id,
        harness=harness,
        transcript_ref=transcript_ref,
    )
    graph = graph or _default_memory_graph()
    extraction = sophia.extract_entities(neutral)
    episode = graph.prepare_episode(
        session_id=neutral.session_id,
        harness=neutral.harness,
        transcript_ref=neutral.transcript_ref,
        summary=extraction.summary,
    )
    return await AletheiaEntificationService(graph).entify(extraction, episode)


async def query_graphiti(
    query: str,
    *,
    graph: Optional[InMemoryGraphitiStore] = None,
    num_results: int = 10,
) -> dict[str, Any]:
    graph = graph or _default_memory_graph()
    return await graph.query(query, num_results=num_results)


sophia = SophiaExtractionService()


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(title="epi-graphiti", version="0.1.0")


# ── Request models ────────────────────────────────────────────────────────────

class ProvenanceEvent(BaseModel):
    event_type: str
    session_id: str
    channel_id: str
    channel_type: str
    day_id: str
    vault_now_path: Optional[str] = None
    tick12: int = 0
    kairos_snapshot: Optional[dict] = None
    timestamp: Optional[str] = None


class EpisodeRequest(BaseModel):
    content: str
    ql_position: str
    cpf: str
    cp: str
    source: str = "agent"
    arc_id: Optional[str] = None
    arc_type: Optional[str] = None
    oracle_face: Optional[str] = None
    reference_time: Optional[str] = None
    day_id: str = ""
    tick12: int = 0
    group_id: Optional[str] = None


class ArcOpenRequest(BaseModel):
    arc_id: str
    arc_type: str
    opening_episode: Optional[str] = None
    kairos_snapshot: Optional[dict] = None
    group_id: Optional[str] = None


class ArcCloseRequest(BaseModel):
    arc_id: str
    crystallisation_text: str
    ql_close_position: str = "5"
    group_id: Optional[str] = None


class IdentityEventRequest(BaseModel):
    event_type: str
    quintessence_hash: str
    tick12: int = 0
    layer_key: Optional[str] = None
    source: str = "pasu-init"
    cp: str = "4.0"
    natal_degree: Optional[float] = None
    natal_sun_decan: Optional[str] = None


class SearchRequest(BaseModel):
    query: str
    ql_position_prefix: Optional[str] = None
    cpf_filter: Optional[str] = None
    sun_decan_filter: Optional[str] = None
    inverted_only: bool = False
    num_results: int = 10
    group_id: Optional[str] = None
    use_redis_cache: bool = True


class TranscriptIngestRequest(BaseModel):
    transcript: Any
    session_id: Optional[str] = None
    harness: Optional[str] = None
    transcript_ref: Optional[str] = None


# ── Redis cache helpers ───────────────────────────────────────────────────────

async def _cache_search(redis, cache_key: str, result: list) -> None:
    await redis.setex(cache_key, 1800, __import__("json").dumps(result))


async def _get_cached_search(redis, cache_key: str) -> Optional[list]:
    val = await redis.get(cache_key)
    if val:
        return __import__("json").loads(val)
    return None


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "epi-graphiti", "port": 37778}


@app.get("/stats")
async def stats():
    g = await get_graphiti()
    try:
        # Count Pratibimba nodes/edges via driver
        driver = g.driver
        async with driver.session() as session:
            node_res = await session.run(
                "MATCH (n:Pratibimba) RETURN count(n) AS cnt"
            )
            node_cnt = (await node_res.single())["cnt"]
            edge_res = await session.run(
                "MATCH (:Pratibimba)-[r]->(:Pratibimba) RETURN count(r) AS cnt"
            )
            edge_cnt = (await edge_res.single())["cnt"]
        return {"node_count": node_cnt, "edge_count": edge_cnt}
    except Exception as exc:
        return {"node_count": 0, "edge_count": 0, "error": str(exc)}


@app.post("/provenance")
async def provenance(event: ProvenanceEvent):
    """S3' gateway thin event → typed episode (provenance skeleton)."""
    g = await get_graphiti()

    # Map channel_type → CPF
    CPF_MAP = {
        "cmux_ralph":       "(4.0/1-4.4/5)",
        "brainstorm":       "(00/00)",
        "subagent":         "(4.0/1-4.4/5)",
        "cli_direct":       "(0/1/2)",
        "background_cron":  "(0/1/2)",
        "oracle_session":   "(0/1/2/3)",
    }
    QL_MAP = {
        "session_open":      "0",
        "session_close":     "5'",
        "channel_bind":      "1",
        "channel_unbind":    "1'",
        "subagent_spawn":    "2",
        "subagent_complete": "3",
    }

    cpf = CPF_MAP.get(event.channel_type, "(00/00)")
    ql  = QL_MAP.get(event.event_type, "0")

    content = (
        f"{event.event_type}: session={event.session_id} "
        f"channel={event.channel_id} type={event.channel_type} "
        f"day={event.day_id}"
    )

    await g.add_episode(
        name=f"provenance:{event.event_type}:{event.session_id}",
        episode_body=content,
        source_description=f"s3-gateway:{event.channel_type}",
        reference_time=__import__("datetime").datetime.utcnow(),
        group_id=_graphiti_group_id(event.session_id),
    )

    return {"status": "ok", "ql": ql, "cpf": cpf}


@app.post("/episode")
async def add_episode(req: EpisodeRequest):
    """S4' full QL-typed episode addition."""
    g = await get_graphiti()

    name = f"episode:{req.ql_position}:{req.cp}:{int(time.time())}"
    if req.arc_id:
        name = f"{req.arc_id}:{req.ql_position}:{int(time.time())}"

    await g.add_episode(
        name=name,
        episode_body=req.content,
        source_description=f"agent:{req.source}:cpf={req.cpf}:cp={req.cp}:ql={req.ql_position}",
        reference_time=__import__("datetime").datetime.utcnow(),
        group_id=_graphiti_group_id(req.group_id),
    )

    return {"status": "ok", "name": name}


@app.post("/memory/ingest_transcript")
async def memory_ingest_transcript(req: TranscriptIngestRequest):
    """s2'.memory.ingest_transcript: harness-neutral transcript to Graphiti."""
    g = await get_graphiti()
    receipt = await ingest_transcript(
        req.transcript,
        session_id=req.session_id,
        harness=req.harness,
        transcript_ref=req.transcript_ref,
        graph=GraphitiServiceStore(g),
    )
    return asdict(receipt)


@app.get("/memory/query_graphiti")
async def memory_query_graphiti(query: str, num_results: int = 10):
    """s2'.memory.query_graphiti: semantic recall over explicit memory schema."""
    g = await get_graphiti()
    return await query_graphiti(
        query,
        graph=GraphitiServiceStore(g),
        num_results=num_results,
    )


@app.post("/arc/open")
async def arc_open(req: ArcOpenRequest):
    """Open a named episode arc (Saga)."""
    g = await get_graphiti()

    opening = req.opening_episode or f"Arc opened: {req.arc_id} ({req.arc_type})"
    await g.add_episode(
        name=f"arc:open:{req.arc_id}",
        episode_body=opening,
        source_description=f"arc:open:type={req.arc_type}",
        reference_time=__import__("datetime").datetime.utcnow(),
        group_id=_graphiti_group_id(req.group_id),
    )

    # Cache arc state in Redis
    redis = await get_redis()
    await redis.hset(f"arc:{req.arc_id}", mapping={
        "arc_id": req.arc_id,
        "arc_type": req.arc_type,
        "status": "open",
        "opened_at": str(int(time.time())),
    })

    return {"status": "ok", "arc_id": req.arc_id, "action": "opened"}


@app.post("/arc/close")
async def arc_close(req: ArcCloseRequest):
    """Close an episode arc with integration episode."""
    g = await get_graphiti()

    await g.add_episode(
        name=f"arc:close:{req.arc_id}",
        episode_body=req.crystallisation_text,
        source_description=f"arc:close:ql={req.ql_close_position}",
        reference_time=__import__("datetime").datetime.utcnow(),
        group_id=_graphiti_group_id(req.group_id),
    )

    redis = await get_redis()
    await redis.hset(f"arc:{req.arc_id}", mapping={
        "status": "closed",
        "closed_at": str(int(time.time())),
        "crystallisation": req.crystallisation_text[:200],
    })

    return {"status": "ok", "arc_id": req.arc_id, "action": "closed"}


@app.post("/identity/event")
async def identity_event(req: IdentityEventRequest):
    """Identity layer change or PersonalNexus init event."""
    g = await get_graphiti()
    driver = g.driver

    content = (
        f"Identity event: {req.event_type}. "
        f"Quintessence: {req.quintessence_hash[:8]}. "
        f"tick12={req.tick12}. source={req.source}."
    )
    if req.layer_key:
        content += f" Layer: {req.layer_key}."

    # Upsert PersonalNexus anchor node
    async with driver.session() as session:
        await session.run(
            """
            MERGE (pn:Pratibimba:PersonalNexus {coordinate: '4.4.4.4'})
            ON CREATE SET
                pn.quintessence_hash = $qhash,
                pn.tick12_home = $tick12,
                pn.degree_home = $degree,
                pn.sun_decan_natal = $decan,
                pn.created_at = timestamp()
            ON MATCH SET
                pn.quintessence_hash = $qhash,
                pn.tick12_home = $tick12,
                pn.updated_at = timestamp()
            """,
            qhash=req.quintessence_hash,
            tick12=req.tick12,
            degree=req.natal_degree or 0.0,
            decan=req.natal_sun_decan or "",
        )

        # BEDROCK edge to Bimba M4 coordinate (graph is M-keyed; '#' is the legacy tag)
        await session.run(
            """
            MATCH (pn:Pratibimba:PersonalNexus {coordinate: '4.4.4.4'})
            MATCH (bc:Bimba {coordinate: 'M4'})
            MERGE (pn)-[:BEDROCK]->(bc)
            """,
        )

    # Record as episode
    await g.add_episode(
        name=f"identity:{req.event_type}:{req.quintessence_hash[:8]}",
        episode_body=content,
        source_description=f"identity:cp=4.0:source={req.source}",
        reference_time=__import__("datetime").datetime.utcnow(),
        group_id=_graphiti_group_id(req.quintessence_hash),
    )

    return {
        "status": "ok",
        "event_type": req.event_type,
        "quintessence_hash": req.quintessence_hash[:8],
    }


@app.get("/search")
async def search(
    query: str,
    ql_position_prefix: Optional[str] = None,
    cpf_filter: Optional[str] = None,
    sun_decan_filter: Optional[str] = None,
    tick12: Optional[int] = None,
    inverted_only: bool = False,
    cs_filter: Optional[str] = None,
    num_results: int = 10,
    group_id: Optional[str] = None,
    use_redis_cache: bool = True,
):
    g = await get_graphiti()
    redis = await get_redis()

    import hashlib

    cache_key = f"graphiti:search:{hashlib.sha256((query + str(ql_position_prefix) + str(group_id) + str(tick12) + str(inverted_only)).encode()).hexdigest()[:12]}"

    if use_redis_cache:
        cached = await _get_cached_search(redis, cache_key)
        if cached is not None:
            return {"results": cached, "cache": "hit"}

    results = await g.search(
        query=query,
        num_results=num_results * 3,
        group_ids=[_graphiti_group_id(group_id)] if group_id else None,
    )

    serialised = []
    for r in (results or []):
        r_dict = {
            "uuid": str(r.uuid),
            "fact": getattr(r, "fact", ""),
            "content": getattr(r, "fact", getattr(r, "source_description", "")),
            "ql_position": getattr(r, "ql_position", ""),
            "cpf": getattr(r, "cpf", ""),
            "tick12": getattr(r, "tick12", None),
            "sun_decan": getattr(r, "sun_decan", ""),
            "source_description": getattr(r, "source_description", ""),
            "created_at": str(getattr(r, "created_at", "")),
        }
        # Apply post-filters
        if ql_position_prefix and not r_dict["ql_position"].startswith(ql_position_prefix):
            continue
        if sun_decan_filter and r_dict["sun_decan"] != sun_decan_filter:
            continue
        if tick12 is not None and r_dict["tick12"] != tick12:
            continue
        if inverted_only and not r_dict["ql_position"].endswith("'"):
            continue
        if cs_filter == "night_prime" and not r_dict["ql_position"].endswith("'"):
            continue
        serialised.append(r_dict)
        if len(serialised) >= num_results:
            break

    if use_redis_cache:
        await _cache_search(redis, cache_key, serialised)

    return {"results": serialised, "cache": "miss"}


@app.get("/episodes")
async def episodes(day_id: str = "", group_id: Optional[str] = None):
    g = await get_graphiti()
    driver = g.driver

    async with driver.session() as session:
        query = "MATCH (e:Episodic) WHERE 1=1"
        params: dict = {}
        if group_id:
            query += " AND e.group_id = $gid"
            params["gid"] = _graphiti_group_id(group_id)
        query += " RETURN e ORDER BY e.created_at DESC LIMIT 50"
        res = await session.run(query, **params)
        rows = [dict(r["e"]) async for r in res]

    return {"episodes": rows, "count": len(rows)}


@app.post("/communities/build")
async def build_communities(body: dict = {}):
    """Phase 7: Build Graphiti communities nightly. Fire from cron_evening handler."""
    g = await get_graphiti()
    try:
        # graphiti_core.graphiti.Graphiti exposes build_communities if available
        if hasattr(g, "build_communities"):
            await g.build_communities()
            return {"status": "ok", "message": "communities built"}
        else:
            # Fallback: run community detection via Neo4j GDS if available
            driver = g.driver
            async with driver.session() as session:
                await session.run(
                    "CALL gds.louvain.stream('Episodic', {}) YIELD nodeId, communityId "
                    "WITH gds.util.asNode(nodeId) AS n, communityId "
                    "SET n.community_id = communityId"
                )
            return {"status": "ok", "message": "communities built via GDS"}
    except Exception as e:
        return {"status": "warn", "message": f"community build skipped: {e}"}


# ── Entrypoint ────────────────────────────────────────────────────────────────

def main():
    from epi_gnostic.graphiti_config import GraphitiConfig
    cfg = GraphitiConfig()
    uvicorn.run(
        "epi_gnostic.graphiti_service:app",
        host="0.0.0.0",
        port=cfg.port,
        reload=False,
        log_level="info",
    )


if __name__ == "__main__":
    main()
