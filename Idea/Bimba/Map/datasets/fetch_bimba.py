#!/usr/bin/env python3
"""Fetch Bimba datasets from Neo4j and save as JSON files."""

import json
import urllib.request
import urllib.error
import base64
import os

NEO4J_URL = "http://localhost:7475/db/neo4j/tx/commit"
NEO4J_USER = "neo4j"
NEO4J_PASS = "password"
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

def run_query(cypher):
    payload = json.dumps({"statements": [{"statement": cypher}]}).encode("utf-8")
    creds = base64.b64encode(f"{NEO4J_USER}:{NEO4J_PASS}".encode()).decode()
    req = urllib.request.Request(
        NEO4J_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Basic {creds}",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def flatten_results(raw):
    """Convert Neo4j REST response to list of dicts."""
    results = raw.get("results", [])
    if not results:
        return []
    columns = results[0]["columns"]
    rows = []
    for row in results[0]["data"]:
        rows.append(dict(zip(columns, row["row"])))
    return rows

NODE_QUERY = """
MATCH (n) WHERE n.bimbaCoordinate STARTS WITH '{branch}'
RETURN n.bimbaCoordinate AS coordinate, n.name AS name, n.coreNature AS coreNature,
       n.completeFormulation AS formulation, n.description AS description,
       n.operationalEssence AS essence, n.internalStructure AS structure
ORDER BY n.bimbaCoordinate
"""

REL_QUERY = """
MATCH (n)-[r]->(m)
WHERE n.bimbaCoordinate STARTS WITH '{branch}'
RETURN n.bimbaCoordinate AS source, type(r) AS type, m.bimbaCoordinate AS target
ORDER BY n.bimbaCoordinate
"""

BRANCHES = [
    ("0", "anuttara"),
    ("1", "paramasiva"),
    ("2", "parashakti"),
    ("3", "mahamaya"),
    ("4", "nara"),
    ("5", "epii"),
]

FOUNDATION_QUERY = """
MATCH (n)-[r]->(m)
WHERE n.bimbaCoordinate IN ['#0', '#1', '#2', '#3', '#4', '#5']
  AND m.bimbaCoordinate IN ['#0', '#1', '#2', '#3', '#4', '#5']
RETURN n.bimbaCoordinate AS source, type(r) AS type, m.bimbaCoordinate AS target
"""

def save(filename, data):
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  Saved {len(data)} records → {filename}")

if __name__ == "__main__":
    print("Fetching Bimba datasets from Neo4j...\n")

    for num, name in BRANCHES:
        branch = f"#{num}"

        print(f"[{branch}] {name.capitalize()} — node data")
        raw = run_query(NODE_QUERY.format(branch=branch))
        rows = flatten_results(raw)
        save(f"nodes_{name}.json", rows)

        print(f"[{branch}] {name.capitalize()} — relationships")
        raw = run_query(REL_QUERY.format(branch=branch))
        rows = flatten_results(raw)
        save(f"relations_{name}.json", rows)

    print("\n[root] Full foundation relationships (#0–#5 trunk)")
    raw = run_query(FOUNDATION_QUERY)
    rows = flatten_results(raw)
    save("relations_foundation.json", rows)

    print("\nDone. All datasets saved.")
