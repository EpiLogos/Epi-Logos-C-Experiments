"""One-shot migration: re-embed BimbaCoordinate nodes from 768-dim to 3072-dim.

Usage:
    GEMINI_API_KEY=... python3 scripts/migrate_bimba_embeddings.py [--dry-run]

Steps:
    1. Drop old coord_embedding index (768-dim)
    2. Fetch all BimbaCoordinate nodes (name + bimbaCoordinate fields)
    3. Re-embed with gemini-embedding-2-preview at 3072-dim
    4. Write new embeddings via db.create.setNodeVectorProperty()
    5. Recreate index at 3072-dim
"""
import asyncio
import os
import sys

import numpy as np
from dotenv import load_dotenv
from neo4j import AsyncGraphDatabase


async def migrate(dry_run: bool = False):
    load_dotenv()

    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    database = os.getenv("NEO4J_DATABASE", "neo4j")
    api_key = os.getenv("GEMINI_API_KEY", "")

    if not api_key and not dry_run:
        print("ERROR: GEMINI_API_KEY not set")
        sys.exit(1)

    driver = AsyncGraphDatabase.driver(uri)

    # Step 1: Fetch all BimbaCoordinate nodes
    print("Fetching BimbaCoordinate nodes...")
    async with driver.session(database=database) as session:
        result = await session.run(
            "MATCH (n:BimbaCoordinate) "
            "RETURN n.bimbaCoordinate AS coord, n.name AS name "
            "ORDER BY n.bimbaCoordinate"
        )
        nodes = [dict(r) async for r in result]

    print(f"Found {len(nodes)} BimbaCoordinate nodes")

    if dry_run:
        for n in nodes:
            print(f"  {n['coord']}: {n['name']}")
        print("\n[DRY RUN] Would drop index, re-embed, and recreate. Exiting.")
        await driver.close()
        return

    # Step 2: Drop old index
    print("Dropping old coord_embedding index...")
    async with driver.session(database=database) as session:
        await session.run("DROP INDEX coord_embedding IF EXISTS")

    # Step 3: Generate 3072-dim embeddings
    # gemini_embed is an EmbeddingFunc dataclass wrapping an async inner function.
    # Call .func directly to bypass the wrapper's default model/dim and supply our own.
    print("Generating 3072-dim embeddings with gemini-embedding-2-preview...")
    from lightrag.llm.gemini import gemini_embed

    texts = [f"{n['name']}: {n.get('coord', '')}" for n in nodes]

    # Call the underlying async function directly so we can control model + embedding_dim.
    # gemini_embed.func signature:
    #   async def gemini_embed(texts, model, base_url, api_key, embedding_dim, ...)
    embeddings = await gemini_embed.func(
        texts,
        model="gemini-embedding-2-preview",
        api_key=api_key,
        embedding_dim=3072,
    )

    if isinstance(embeddings, np.ndarray):
        embeddings = embeddings.tolist()

    print(f"Generated {len(embeddings)} embeddings, dim={len(embeddings[0])}")

    # Step 4: Write embeddings to nodes
    print("Writing embeddings to BimbaCoordinate nodes...")
    for i, node in enumerate(nodes):
        async with driver.session(database=database) as session:
            await session.run(
                "MATCH (n:BimbaCoordinate {bimbaCoordinate: $coord}) "
                "CALL db.create.setNodeVectorProperty(n, 'semantic_embedding', $embedding)",
                coord=node["coord"],
                embedding=embeddings[i],
            )
    print(f"Updated {len(nodes)} nodes")

    # Step 5: Recreate index at 3072-dim
    print("Creating new coord_embedding index at 3072-dim...")
    async with driver.session(database=database) as session:
        await session.run(
            "CREATE VECTOR INDEX coord_embedding IF NOT EXISTS "
            "FOR (n:BimbaCoordinate) ON n.semantic_embedding "
            "OPTIONS { indexConfig: {"
            "  `vector.dimensions`: 3072,"
            "  `vector.similarity_function`: 'cosine',"
            "  `vector.hnsw.m`: 16,"
            "  `vector.hnsw.ef_construction`: 200,"
            "  `vector.quantization.enabled`: true"
            "}}"
        )

    print("Migration complete!")
    await driver.close()


def main():
    dry_run = "--dry-run" in sys.argv
    asyncio.run(migrate(dry_run=dry_run))


if __name__ == "__main__":
    main()
