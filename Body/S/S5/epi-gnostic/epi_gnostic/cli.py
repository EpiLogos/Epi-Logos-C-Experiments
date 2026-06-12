"""CLI entry point for epi-gnostic, called by Rust subprocess.

Usage:
    epi-gnostic status
    epi-gnostic models
    epi-gnostic ingest <file_path> [--coordinate COORD] [--family FAM]
    epi-gnostic ingest-text <text> [--source-id ID]
    epi-gnostic query <question> [--mode MODE]
    epi-gnostic notebook list
    epi-gnostic notebook create <name>
    epi-gnostic notebook delete <name>
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

    from epi_gnostic.wrapper import GnosticRAG
    from epi_gnostic.enrichment.coordinator import CoordinateEnricher
    from neo4j import AsyncGraphDatabase

    rag = GnosticRAG(config)
    await rag.initialize()

    try:
        if cmd == "ingest":
            file_path = args[1]
            coordinate = _flag(args, "--coordinate")
            family = _flag(args, "--family") or "#"

            result = await rag.ingest_document(
                file_path=file_path,
                coordinate=coordinate,
                family=family,
            )

            # If direct coordinate supplied, run enrichment on ingested nodes
            if coordinate:
                driver = AsyncGraphDatabase.driver(config.neo4j_uri)
                enricher = CoordinateEnricher(driver, config.neo4j_database)
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
            answer = await rag.query(question, mode=mode)
            _json_out({"status": "ok", "answer": answer, "mode": mode})

        elif cmd == "enrich":
            entity_id = args[1]
            coordinate = _flag(args, "--coordinate")
            family = _flag(args, "--family") or "#"

            driver = AsyncGraphDatabase.driver(config.neo4j_uri)
            enricher = CoordinateEnricher(driver, config.neo4j_database)

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
        existing = next((entry for entry in notebooks if entry["name"] == name), None)
        if existing is None:
            existing = {
                "name": name,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "workspace": config.workspace,
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
