#!/usr/bin/env python3
"""Regenerate the bounded Smart Env fixture for smart_env_link_candidates tests.

The live Obsidian Smart Connections store at ``Idea/.smart-env/multi`` has grown
to ~410MB (3070 ``.ajson`` files, ~70% of them node_modules-derived). Running
``suggest_link_candidates`` against the whole live tree performs an O(N^2)
block-similarity scan with a filesystem ``.exists()`` stat per candidate, so the
integration test could not terminate within 540s and was non-deterministic as the
vault changed.

This script extracts a SMALL, REAL subset of the live store into a committed
fixture vault. The embeddings are genuine bge-micro-v2 vectors copied verbatim
from the live index (no mocks). Re-run only when the upstream notes change:

    python3 tests/fixtures/generate_smart_env_fixture.py

Determinism: only the curated sources below are emitted, so the test is fast and
stable regardless of how the live vault grows.
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", "..", "..", ".."))
LIVE_MULTI = os.path.join(REPO_ROOT, "Idea", ".smart-env", "multi")
FIXTURE_VAULT = os.path.join(HERE, "smart-env-vault")
FIXTURE_MULTI = os.path.join(FIXTURE_VAULT, ".smart-env", "multi")

# Seed source. Outlinks are trimmed to exactly the two the test cares about:
#   - S-SYSTEM-INDEX  -> an ExplicitOutlink candidate (file present => not stale)
#   - S4-SPEC         -> a stale candidate (no file in fixture => filtered out)
SEED = "Bimba/Seeds/S/S-SHARDING-TASK-LIST.md"
SEED_AJSON = "Bimba_Seeds_S_S-SHARDING-TASK-LIST_md.ajson"
SEED_OUTLINKS = [
    {"title": "S-SYSTEM-INDEX", "target": "S-SYSTEM-INDEX", "line": 6},
    {"title": "S4-SPEC", "target": "S4-SPEC"},
]
MAX_SEED_BLOCKS = 36  # >= MAX_SEED_BLOCKS (32) in smart_env.rs so seed_blocks is exercised

# Explicit-outlink target source (file present in fixture => candidate is fresh).
INDEX_SRC = "Bimba/Seeds/S/S-SYSTEM-INDEX.md"
INDEX_AJSON = "Bimba_Seeds_S_S-SYSTEM-INDEX_md.ajson"

# Semantic neighbour: NOT linked by the seed, so its blocks surface purely as
# SemanticBlock candidates at a DISTINCT existing target (proves the semantic path
# and the evidence_lines carry-through).
NEIGHBOR_SRC = "Bimba/Seeds/S/S-SHARD-HARMONIZATION-PROTOCOL.md"
NEIGHBOR_AJSON = "Bimba_Seeds_S_S-SHARD-HARMONIZATION-PROTOCOL_md.ajson"
MAX_NEIGHBOR_BLOCKS = 8

# Stale source: emitted into the index but NO file is written, so resolve marks it
# stale and upsert drops it. This is what the "filters_stale_paths" test asserts.
STALE_SRC = "Bimba/Seeds/S/S4-SPEC.md"
STALE_AJSON = "Bimba_Seeds_S_S4-SPEC_md.ajson"

# Files that MUST exist in the fixture vault (so `.exists()` => not stale).
VAULT_FILES = [SEED, INDEX_SRC, NEIGHBOR_SRC]


def load_ajson(name):
    raw = open(os.path.join(LIVE_MULTI, name), encoding="utf-8").read().strip().rstrip(",")
    return json.loads("{" + raw + "}")


def source_entity(data):
    for v in data.values():
        if v.get("class_name") == "SmartSource":
            return v
    raise SystemExit("no SmartSource in fixture input")


def block_entities(data):
    return [v for v in data.values() if v.get("class_name") == "SmartBlock"]


def write_ajson(name, entities):
    # Match the live format: a comma-separated list of `"key": {..}` members with
    # no enclosing braces (smart_env.rs wraps the body in `{}` at load time).
    parts = [json.dumps(k) + ":" + json.dumps(v, ensure_ascii=False) for k, v in entities]
    with open(os.path.join(FIXTURE_MULTI, name), "w", encoding="utf-8") as fh:
        fh.write(",\n".join(parts) + "\n")


def main():
    os.makedirs(FIXTURE_MULTI, exist_ok=True)

    # --- Seed source + a bounded set of its largest blocks (real vectors) ---
    seed_data = load_ajson(SEED_AJSON)
    seed_src = source_entity(seed_data)
    seed_src = dict(seed_src)
    seed_src["outlinks"] = SEED_OUTLINKS
    seed_blocks = [v for v in block_entities(seed_data) if v.get("embeddings")]
    seed_blocks.sort(key=lambda b: b.get("size", 0), reverse=True)
    seed_blocks = seed_blocks[:MAX_SEED_BLOCKS]
    entities = [(SEED, seed_src)] + [(b["key"], b) for b in seed_blocks]
    write_ajson(SEED_AJSON, entities)

    # --- Explicit-outlink target source (+ a couple of blocks) ---
    idx_data = load_ajson(INDEX_AJSON)
    idx_src = source_entity(idx_data)
    idx_blocks = [v for v in block_entities(idx_data) if v.get("embeddings") and v.get("lines")][:4]
    write_ajson(INDEX_AJSON, [(INDEX_SRC, idx_src)] + [(b["key"], b) for b in idx_blocks])

    # --- Semantic neighbour source + line-bearing blocks ---
    nb_data = load_ajson(NEIGHBOR_AJSON)
    nb_src = source_entity(nb_data)
    nb_blocks = [v for v in block_entities(nb_data) if v.get("embeddings") and v.get("lines")]
    nb_blocks.sort(key=lambda b: b.get("size", 0), reverse=True)
    nb_blocks = nb_blocks[:MAX_NEIGHBOR_BLOCKS]
    write_ajson(NEIGHBOR_AJSON, [(NEIGHBOR_SRC, nb_src)] + [(b["key"], b) for b in nb_blocks])

    # --- Stale source: real vector, but NO vault file (=> filtered) ---
    stale_src = dict(source_entity(idx_data))
    stale_src["path"] = STALE_SRC
    stale_src["outlinks"] = []
    write_ajson(STALE_AJSON, [(STALE_SRC, stale_src)])

    # --- Vault note files so `.exists()` resolves fresh for non-stale targets ---
    for rel in VAULT_FILES:
        abs_path = os.path.join(FIXTURE_VAULT, rel)
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        title = os.path.splitext(os.path.basename(rel))[0]
        with open(abs_path, "w", encoding="utf-8") as fh:
            fh.write(f"# {title}\n\nFixture placeholder for hen-compiler-core smart_env tests.\n")

    # Report sizes
    total = sum(
        os.path.getsize(os.path.join(FIXTURE_MULTI, f)) for f in os.listdir(FIXTURE_MULTI)
    )
    print(f"wrote fixture: {len(os.listdir(FIXTURE_MULTI))} ajson files, {total/1024:.1f} KB")


if __name__ == "__main__":
    main()
