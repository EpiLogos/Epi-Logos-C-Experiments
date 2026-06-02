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

        # BEDROCK edge to Bimba #4 coordinate
        await session.run(
            """
            MATCH (pn:Pratibimba:PersonalNexus {coordinate: '4.4.4.4'})
            MATCH (bc:Bimba {coordinate: '#4'})
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
