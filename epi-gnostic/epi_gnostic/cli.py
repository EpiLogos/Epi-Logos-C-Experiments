"""CLI entry point for epi-gnostic, called by Rust subprocess.

Usage:
    epi-gnostic status
    epi-gnostic ingest <file_path> [--coordinate COORD] [--family FAM]
    epi-gnostic ingest-text <text> [--source-id ID]
    epi-gnostic query <question> [--mode MODE]
    epi-gnostic enrich <entity_id> [--coordinate COORD] [--family FAM]

All output is JSON on stdout for Rust to parse.
"""
import asyncio
import json
import sys
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


def main():
    args = sys.argv[1:]
    asyncio.run(_run(args))


if __name__ == "__main__":
    main()
