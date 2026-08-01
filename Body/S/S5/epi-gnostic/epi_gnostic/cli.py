"""CLI entry point for epi-gnostic, called by Rust subprocess.

Usage:
    epi-gnostic status
    epi-gnostic models
    epi-gnostic ingest <file_path> [--coordinate COORD] [--family FAM]
    epi-gnostic ingest-text <text> [--source-id ID]
    epi-gnostic query <question> [--mode MODE]
    epi-gnostic notebook list
    epi-gnostic notebook create <name> [--coordinate COORD]
    epi-gnostic notebook delete <name>
    epi-gnostic list-notebooks [--coordinate COORD]
    epi-gnostic candidates [--filter orphan|promotable|reviewed]
    epi-gnostic etymology <coord>
    epi-gnostic episode-search <query> [--group GROUP] [--vak VAK]
    epi-gnostic evidence-trace <passage_id>
    epi-gnostic query-with-layers <question> [--layers local,global,hybrid]
    epi-gnostic enrich <entity_id> [--coordinate COORD] [--family FAM]

All output is JSON on stdout for Rust to parse.
"""
import asyncio
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv


def _json_out(data: dict):
    print(json.dumps(data, ensure_ascii=False))


def _enricher_for(driver, config):
    """Build a ``CoordinateEnricher`` bound to the config's workspace.

    The workspace IS the node label. ``wrapper.py`` hands LightRAG
    ``workspace=config.workspace``, so entities are written under that label,
    and ``CoordinateEnricher.assign_direct`` matches ``(n:`{workspace}`)``.
    Constructing the enricher without the argument silently falls back to the
    ``"gnostic"`` default, so under a non-default ``GNOSTIC_WORKSPACE`` every
    enrichment matched zero nodes, wrote nothing, and still reported success.
    ``_graph_read`` already reads through ``config.workspace``; this keeps the
    write path on the same label as the read path.
    """
    from epi_gnostic.enrichment.coordinator import CoordinateEnricher

    return CoordinateEnricher(driver, config.neo4j_database, config.workspace)


async def _run(args: list[str]):
    load_dotenv()

    from epi_gnostic.config import GnosticConfig

    config = GnosticConfig()
    cmd = args[0] if args else "status"

    if cmd == "status":
        _json_out({
            "status": "ok",
            "workspace": config.workspace,
            "neo4j_uri": config.neo4j_uri,
            "embedding_model": config.embedding_model,
            "llm_model": config.llm_model,
            "embedding_dim": config.embedding_dim,
        })
        return

    if cmd == "models":
        _json_out({
            "status": "ok",
            "workspace": config.workspace,
            "embedding_model": config.embedding_model,
            "llm_model": config.llm_model,
            "embedding_dim": config.embedding_dim,
            "cosine_threshold": config.cosine_threshold,
        })
        return

    if cmd == "notebook":
        _json_out(_notebook(config, args[1:]))
        return

    if cmd == "list-notebooks":
        _json_out(_list_notebooks(config, _flag(args, "--coordinate")))
        return

    # 12.T12.2 graph-read commands: direct Neo4j reads over the enrichment
    # vocabulary (label = workspace; bimba_coordinate / RESONATES_WITH /
    # MAPS_TO_COORDINATE / :Episodic) — no RAG initialisation needed.
    if cmd in {"candidates", "etymology", "episode-search", "evidence-trace", "resolve"}:
        _json_out(await _graph_read(config, cmd, args[1:]))
        return

    if cmd == "query-with-layers":
        # Refuse malformed input before the heavyweight RAG initialisation.
        if len(args) < 2 or args[1].startswith("--"):
            _json_out({"status": "error", "message": "query-with-layers requires a question argument"})
            return
        requested = (_flag(args, "--layers") or "local,global,hybrid").split(",")
        unknown = [layer for layer in requested if layer not in {"naive", "local", "global", "hybrid"}]
        if unknown:
            _json_out({"status": "error", "message": f"unknown layers: {unknown}; valid: ['global', 'hybrid', 'local', 'naive']"})
            return

    from epi_gnostic.wrapper import GnosticRAG
    from neo4j import AsyncGraphDatabase

    rag = GnosticRAG(config)
    await rag.initialize()

    try:
        if cmd == "ingest":
            file_path = args[1]
            coordinate = _flag(args, "--coordinate")
            family = _flag(args, "--family") or "#"
            # 12.T12.13 finding D3: `aletheia_gnosis_ingest` has always declared a
            # `notebook` parameter and pushed `--notebook <name>`, but neither
            # this command nor the Rust arm accepted the flag — so setting it did
            # not merely get dropped, clap REFUSED the whole invocation and the
            # ingest failed outright. Accepted here and recorded against the
            # notebook registry that already exists (`notebooks.json`), so the
            # parameter names a real association instead of breaking the call.
            notebook = _flag(args, "--notebook")

            result = await rag.ingest_document(
                file_path=file_path,
                coordinate=coordinate,
                family=family,
            )

            if notebook:
                result["notebook"] = _record_notebook_document(config, notebook, file_path)

            # If direct coordinate supplied, run enrichment on ingested nodes
            if coordinate:
                driver = AsyncGraphDatabase.driver(config.neo4j_uri)
                enricher = _enricher_for(driver, config)
                async with driver.session(database=config.neo4j_database) as session:
                    res = await session.run(
                        "MATCH (n:gnostic) WHERE n.file_path CONTAINS $fp "
                        "RETURN n.entity_id AS eid",
                        fp=Path(file_path).name,
                    )
                    eids = [r["eid"] async for r in res]
                for eid in eids:
                    await enricher.assign_direct(eid, coordinate, family)
                await driver.close()

            _json_out(result)

        elif cmd == "ingest-text":
            text = args[1]
            source_id = _flag(args, "--source-id") or "stdin"
            result = await rag.ingest_text(text, source_id=source_id)
            _json_out(result)

        elif cmd == "query":
            question = args[1]
            mode = _flag(args, "--mode") or "hybrid"
            # 12.T12.13 finding D3: `top_k` was a declared tool parameter with
            # no route to the retriever — an agent that set it got no error and
            # no effect. QueryParam carries a real `top_k`, so it is plumbed
            # rather than dropped. A non-integer or non-positive value is
            # REFUSED, not silently coerced: a bad bound would quietly change
            # what the retrieval saw.
            top_k_raw = _flag(args, "--top-k")
            top_k = None
            if top_k_raw is not None:
                try:
                    top_k = int(top_k_raw)
                except ValueError:
                    _json_out({"status": "error", "message": f"--top-k must be an integer, got {top_k_raw!r}"})
                    return
                if top_k < 1:
                    _json_out({"status": "error", "message": f"--top-k must be >= 1, got {top_k}"})
                    return
            answer = await rag.query(question, mode=mode, top_k=top_k)
            _json_out({"status": "ok", "answer": answer, "mode": mode, "top_k": top_k})

        elif cmd == "query-with-layers":
            question = args[1]
            layers = (_flag(args, "--layers") or "local,global,hybrid").split(",")
            answers = {}
            for layer in layers:
                answers[layer] = await rag.query(question, mode=layer)
            _json_out({"status": "ok", "question": question, "layers": answers})

        elif cmd == "enrich":
            entity_id = args[1]
            coordinate = _flag(args, "--coordinate")
            family = _flag(args, "--family") or "#"

            driver = AsyncGraphDatabase.driver(config.neo4j_uri)
            enricher = _enricher_for(driver, config)

            if coordinate:
                await enricher.assign_direct(entity_id, coordinate, family)
                _json_out({"status": "ok", "method": "direct", "coordinate": coordinate})
            else:
                from lightrag.llm.gemini import gemini_model_complete
                result = await enricher.classify_entity(
                    entity_id=entity_id,
                    entity_name="",
                    entity_description="",
                    source_context="",
                    llm_func=gemini_model_complete,
                    family_hint=family,
                )
                _json_out({"status": "ok", "method": "llm_classified", **result})
            await driver.close()

        else:
            _json_out({"status": "error", "message": f"Unknown command: {cmd}"})

    finally:
        await rag.shutdown()


def _flag(args: list[str], flag: str) -> str | None:
    """Extract --flag value from args list."""
    try:
        idx = args.index(flag)
        return args[idx + 1] if idx + 1 < len(args) else None
    except ValueError:
        return None


async def _graph_read(config, cmd: str, args: list[str]) -> dict:
    """12.T12.2: direct Neo4j reads over the enrichment vocabulary.

    Every read is over what the graph really carries — label = workspace,
    `bimba_coordinate`/`coordinate_family`/`assignment_method` from the
    CoordinateEnricher, `RESONATES_WITH`/`MAPS_TO_COORDINATE` edges to
    `:Bimba`, and Graphiti `:Episodic` nodes. Empty results are honest
    empties, never invented.
    """
    from neo4j import AsyncGraphDatabase

    ws = config.workspace
    driver = AsyncGraphDatabase.driver(config.neo4j_uri)
    try:
        async with driver.session(database=config.neo4j_database) as session:
            if cmd == "candidates":
                candidate_filter = _flag(args, "--filter") or "orphan"
                where = {
                    "orphan": "n.bimba_coordinate IS NULL",
                    "promotable": "n.bimba_coordinate IS NOT NULL AND n.review_state IS NULL",
                    "reviewed": "n.review_state = 'reviewed'",
                }.get(candidate_filter)
                if where is None:
                    return {"status": "error", "message": f"unknown filter {candidate_filter!r}; expected orphan, promotable, or reviewed"}
                res = await session.run(
                    f"MATCH (n:`{ws}`) WHERE {where} "
                    f"RETURN n.vector_id AS entity_id, n.entity_name AS entity_name, "
                    f"       n.bimba_coordinate AS coordinate, n.assignment_method AS assignment_method "
                    f"ORDER BY entity_id LIMIT 200"
                )
                rows = await res.data()
                return {"status": "ok", "filter": candidate_filter, "count": len(rows), "candidates": rows}

            if cmd == "etymology":
                if not args or args[0].startswith("--"):
                    return {"status": "error", "message": "etymology requires a coordinate argument"}
                coord = args[0]
                res = await session.run(
                    f"MATCH (n:`{ws}`) WHERE n.bimba_coordinate = $coord "
                    f"RETURN n.vector_id AS entity_id, n.entity_name AS entity_name, "
                    f"       n.assignment_method AS assignment_method",
                    coord=coord,
                )
                anchors = await res.data()
                res = await session.run(
                    f"MATCH (n:`{ws}`)-[r:RESONATES_WITH]->(bc:Bimba {{coordinate: $coord}}) "
                    f"RETURN n.vector_id AS entity_id, n.entity_name AS entity_name, "
                    f"       n.bimba_coordinate AS home_coordinate, r.confidence AS confidence",
                    coord=coord,
                )
                resonant = await res.data()
                return {
                    "status": "ok",
                    "coordinate": coord,
                    "cluster": {"anchors": anchors, "resonant": resonant},
                    "count": len(anchors) + len(resonant),
                }

            if cmd == "episode-search":
                if not args or args[0].startswith("--"):
                    return {"status": "error", "message": "episode-search requires a query argument"}
                query = args[0]
                group = _flag(args, "--group")
                vak = _flag(args, "--vak")
                cypher = "MATCH (e:Episodic) WHERE toLower(coalesce(e.content, '')) CONTAINS toLower($q)"
                params: dict = {"q": query}
                if group:
                    cypher += " AND e.group_id = $gid"
                    params["gid"] = group
                if vak:
                    cypher += " AND toLower(coalesce(e.content, '')) CONTAINS toLower($vak)"
                    params["vak"] = vak
                cypher += (
                    " RETURN e.uuid AS uuid, e.name AS name, e.group_id AS group_id, "
                    "        e.created_at AS created_at, left(coalesce(e.content, ''), 400) AS excerpt "
                    " ORDER BY e.created_at DESC LIMIT 25"
                )
                res = await session.run(cypher, **params)
                rows = await res.data()
                episodes = [
                    {**row, "created_at": str(row["created_at"]) if row.get("created_at") is not None else None}
                    for row in rows
                ]
                return {"status": "ok", "query": query, "count": len(episodes), "episodes": episodes}

            if cmd == "resolve":
                # Consolidated read (unified-memory layer 2, DR-WORLD-1): one
                # handle for a coordinate or a vector_id — entities, their
                # coordinate assignments, resonances, and provenance anchors.
                if not args or args[0].startswith("--"):
                    return {"status": "error", "message": "resolve requires a coordinate or passage id argument"}
                ref = args[0]
                res = await session.run(
                    f"MATCH (n:`{ws}`) WHERE n.bimba_coordinate = $ref OR n.vector_id = $ref "
                    f"OPTIONAL MATCH (n)-[:RESONATES_WITH]->(rc:Bimba) "
                    f"RETURN n.vector_id AS entity_id, n.entity_name AS entity_name, "
                    f"       n.bimba_coordinate AS coordinate, n.coordinate_family AS family, "
                    f"       n.assignment_method AS assignment_method, n.source_id AS source_id, "
                    f"       collect(rc.coordinate) AS resonances "
                    f"LIMIT 50",
                    ref=ref,
                )
                rows = await res.data()
                entities = [
                    {
                        **{k: row.get(k) for k in ("entity_id", "entity_name", "coordinate", "family", "assignment_method")},
                        "resonances": [r for r in (row.get("resonances") or []) if r],
                        "anchors": [chunk for chunk in (row.get("source_id") or "").split("<SEP>") if chunk],
                    }
                    for row in rows
                ]
                return {"status": "ok", "ref": ref, "found": bool(entities), "entities": entities}

            # evidence-trace
            if not args or args[0].startswith("--"):
                return {"status": "error", "message": "evidence-trace requires a passage id argument"}
            passage_id = args[0]
            res = await session.run(
                f"MATCH (n:`{ws}` {{vector_id: $vid}}) "
                f"RETURN n.entity_name AS entity_name, n.bimba_coordinate AS coordinate, "
                f"       n.source_id AS source_id, n.file_path AS file_path",
                vid=passage_id,
            )
            rows = await res.data()
            if not rows:
                return {"status": "ok", "passage_id": passage_id, "found": False, "anchors": []}
            row = rows[0]
            anchors = [chunk for chunk in (row.get("source_id") or "").split("<SEP>") if chunk]
            return {
                "status": "ok",
                "passage_id": passage_id,
                "found": True,
                "entity_name": row.get("entity_name"),
                "coordinate": row.get("coordinate"),
                "file_path": row.get("file_path"),
                "anchors": anchors,
            }
    finally:
        await driver.close()


def _record_notebook_document(config, notebook: str, file_path: str) -> dict:
    """Record an ingested document against a notebook (12.T12.13 finding D3).

    Notebooks are a REGISTRY (`notebooks.json`: name, created_at, workspace,
    optional coordinate), not a retrieval partition — nothing in LightRAG scopes
    a query by notebook, and no chunk carries one. So this records the
    association truthfully and claims nothing more: the notebook is created on
    first use, the document is appended once (idempotent on re-ingest), and the
    returned payload says exactly what happened. It does NOT make retrieval
    notebook-scoped; that needs chunk-level tagging plus a retrieval filter, and
    is unbuilt.
    """
    path = Path(config.working_dir) / "notebooks.json"
    notebooks = _read_notebooks(path)
    entry = next((item for item in notebooks if item.get("name") == notebook), None)
    created = entry is None
    if entry is None:
        entry = {
            "name": notebook,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "workspace": config.workspace,
        }
        notebooks.append(entry)
    documents = entry.setdefault("documents", [])
    already = file_path in documents
    if not already:
        documents.append(file_path)
    _write_notebooks(path, notebooks)
    return {
        "name": notebook,
        "created": created,
        "document_recorded": not already,
        "document_count": len(documents),
        "retrieval_scoped": False,
    }


def _list_notebooks(config, coordinate: str | None) -> dict:
    path = Path(config.working_dir) / "notebooks.json"
    notebooks = _read_notebooks(path)
    if coordinate is not None:
        notebooks = [entry for entry in notebooks if entry.get("coordinate") == coordinate]
    return {"status": "ok", "coordinate_filter": coordinate, "count": len(notebooks), "notebooks": notebooks}


def _notebook(config, args: list[str]) -> dict:
    action = args[0] if args else "list"
    path = Path(config.working_dir) / "notebooks.json"
    notebooks = _read_notebooks(path)

    if action == "list":
        return {"status": "ok", "notebooks": notebooks}

    if action in {"create", "delete"} and len(args) < 2:
        return {"status": "error", "message": f"notebook {action} requires a name"}

    if action == "create":
        name = args[1]
        coordinate = _flag(args, "--coordinate")
        existing = next((entry for entry in notebooks if entry["name"] == name), None)
        if existing is None:
            existing = {
                "name": name,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "workspace": config.workspace,
                **({"coordinate": coordinate} if coordinate else {}),
            }
            notebooks.append(existing)
            _write_notebooks(path, notebooks)
        return {"status": "ok", "notebook": existing}

    if action == "delete":
        name = args[1]
        remaining = [entry for entry in notebooks if entry["name"] != name]
        deleted = len(remaining) != len(notebooks)
        if deleted:
            _write_notebooks(path, remaining)
        return {"status": "ok", "deleted": deleted, "name": name}

    return {
        "status": "error",
        "message": f"Unknown notebook action: {action}",
    }


def _read_notebooks(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, list):
        raise ValueError(f"{path} must contain a JSON list")
    return data


def _write_notebooks(path: Path, notebooks: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(notebooks, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def main():
    args = sys.argv[1:]
    asyncio.run(_run(args))


if __name__ == "__main__":
    main()
