---
name: bimba-populate
description: >
  Populate the Neo4j S2' M-branch coordinate tree from JSON datasets.
  Reads full node content, semantically apportions to coordinate-forward
  {family}_{n}[_{sub_n}]*_{semantic} properties, generates Cypher files
  for human review, then executes approved Cypher against Neo4j.
triggers:
  - populate bimba
  - populate m-branch
  - load coordinates to neo4j
  - bimba populate
  - generate bimba cypher
---

# Bimba Populate Skill

## What this skill does

Loads M-branch coordinate data from JSON datasets into Neo4j using the
coordinate-forward `{family}_{n}[_{sub_n}]*_{semantic}` property schema.

The core work is **semantic apportionment**: you (the agent) read each node's
full content and judge which coordinate slot each piece of content belongs in —
based on what the content IS, not what source key it came from. Property keys
are coordinate addresses that encode ontological position. Getting them right
makes the graph's topology implicitly coherent: all `c_0_*` properties across
nodes form the ground stratum; all `c_4_*` form the typological stratum.

Sub-numbers (`c_0_1_languification`, `m_3_2_pairing_matrix`) give organisational
freedom within a position. They follow QL semantics: lower sub-numbers are more
ground-ward within that position. Use them for genuinely distinct sub-domains,
not as sequence indices.

Cypher files are generated to `epi-gnostic/cypher/generated/` — one per branch.
The user reviews them in conversation. Review IS the human-in-loop: the user
reads the Cypher, says what to fix, and the agent amends. When approved, the
agent executes via `cypher-shell`.

---

## Prerequisites — check before starting

```bash
# Neo4j running?
cypher-shell -u neo4j -p $NEO4J_PASSWORD "RETURN 1"

# APOC installed?
cypher-shell -u neo4j -p $NEO4J_PASSWORD "RETURN apoc.version()"

# Bootstrap DDL run? (run if needed)
cypher-shell -u neo4j -p $NEO4J_PASSWORD \
  --file epi-gnostic/cypher/00-bootstrap.cypher

# enrich.py works?
python epi-gnostic/scripts/enrich.py "#3"
```

If Neo4j is not running, you can still run Stage A (generate Cypher files) in
dry-run mode — just skip execution until Neo4j is available.

---

## Invocation

The user specifies scope:

```
populate bimba                         → all branches, full pipeline
populate bimba --branch M3             → M3 only
populate bimba --stage nodes           → node apportionment only
populate bimba --stage relations       → relations Cypher only
populate bimba --stage execute M3      → execute already-generated m3-nodes.cypher
populate bimba --dry-run               → generate Cypher only, do not execute
```

If no scope is given, ask: **"Which branch(es)? (M0–M5 or ALL). Nodes only, relations too, or full pipeline?"**

---

## Stage A: Node Apportionment + Cypher Generation

### A1. Load context

Before apportioning any node, read:
- `epi-gnostic/schema-context.md` — defines every slot's meaning and the apportionment rules
- Coordinate system summary: C0=Ground, C1=Form, C2=Entity, C3=Process, C4=Type, C5=Integration

### A2. For each branch being processed

**A2.1 — Find the dataset file**

```
docs/datasets/anuttara-deep/    → M0
docs/datasets/paramasiva-deep/  → M1
docs/datasets/parashakti-deep/  → M2
docs/datasets/mahamaya-deep/    → M3
docs/datasets/nara-deep/        → M4
docs/datasets/epii-deep/        → M5
```

Try node files in order: `nodes-full-detail.json`, `nodes-full-details.json`, `nodes-full-data.json`.
If none of the three match, list the files in the dataset directory and ask the user which file to use.
Each file may be a root-level list, `{"nodes": [...]}`, or a single object — handle all three.

**A2.2 — Process nodes in batches of 20–30**

Large branches (M2 ~1100 nodes, M3 ~996 nodes) cannot fit in a single context pass.
Process in batches of 20–30, appending to the output file after each batch.

For each node in the batch:

**Step 1 — Get computed enrichment:**
```bash
python epi-gnostic/scripts/enrich.py "{coordinate}"
```
Use the returned `c_2_uuid`, `c_4_family`, `c_4_ql_position`, `c_4_layer`, `c_4_topo_mode` verbatim.

**Step 2 — Apportion semantically:**

Read ALL source properties (from `filteredProps` or root dict). Then:

- Assign to the slot whose meaning most faithfully matches what the content IS
- C0 slots → content that is the ground/essential nature
- C1 slots → content about form and structural definition
- C2 slots → instance-level identifying content
- C3 slots → operational, processual, temporal content
- C4 slots → typological, categorical content
- C5 slots → integrative, cross-system, resonance content
- M{n} slots → subsystem-specific content (use schema-context.md for per-subsystem slots)
- Split source properties when one piece of prose spans multiple semantic slots
- Use sub-numbers (`c_0_1_*`, `m_3_2_*`) for genuinely distinct sub-domains within a position; sub-numbers follow QL semantics (0 = more ground-ward)
- Wrap all list-type slots in arrays even if source is a string
- Drop: notionPageId, subsystem (int), id (int)
- Omit slots for which no content is present — do not fabricate

**Step 3 — Generate the Cypher block:**

```cypher
// {coordinate} | {c_1_name} | {one-line description}
MERGE (n:BimbaNode { coordinate: '{coordinate}' })
// --- Canonical core ---
SET n.c_0_essence           = '{value}'
SET n.c_1_name              = '{value}'
SET n.c_1_description       = '{value}'
SET n.c_1_form              = '{value}'
SET n.c_2_uuid              = '{from enrich.py}'
SET n.c_3_updated_at        = '{value}'
SET n.c_3_context_frame     = '{value}'
SET n.c_4_family            = 'M'
SET n.c_4_ql_position       = {int}
SET n.c_4_layer             = '{from enrich.py}'
SET n.c_4_topo_mode         = '{from enrich.py}'
SET n.c_4_access_level      = '{value}'
SET n.c_4_ql_category       = '{value}'
SET n.c_4_ql_operator_types = ['{val1}', '{val2}']
SET n.c_5_resonances        = ['{val1}', '{val2}']
// --- Extended (harmonizable + subsystem-specific) ---
SET n += {
  c_0_consciousness_structure: '...',
  c_1_key_principles: ['...'],
  m_3_quaternionic_signature: '...'
  // PROPOSED: m_3_new_concept: '...'
}
ON CREATE SET n.c_3_created_at = datetime()
;
```

Blank line between nodes. Sub-numbered properties appear in QL order within their group.

**Step 4 — Append to file:**
Write/append the batch output to `epi-gnostic/cypher/generated/m{n}-nodes.cypher`
(where n = the branch number: 0 for M0, 3 for M3, etc.)

**A2.3 — Batch progress report**

After each batch of 20–30 nodes, report briefly:
```
[M3 batch 2/34] Nodes #3-1-0-6 through #3-1-1-5 written (20 nodes).
Notable decisions:
  - #3-1-0-8: split 'description' across c_1_description + c_1_form
  - #3-1-1-0: used m_3_2_pairing_matrix (sub-numbered) for matrix sub-domain
  - #3-1-1-3: PROPOSED m_3_chromatic_structure (no existing slot)
Say 'continue' or 'stop here to review'.
```

This lets the user pause and review mid-branch without waiting for the whole file.

**A2.4 — Branch completion**

```
[M3 complete] 996 nodes → epi-gnostic/cypher/generated/m3-nodes.cypher
PROPOSED slots: 3 (search '// PROPOSED' in file)
Ready for review. Say 'review M3', 'continue to M4', or 'execute M3'.
```

---

## Stage B: Human Review

The user reads the generated `.cypher` file. The conversation IS the review.

**What the user might say → what you do:**

| User says | Your action |
|-----------|-------------|
| "Move #3-1-0-0 dragon metaphor to c_1_form" | Find that node block, move the content, confirm |
| "The c_0_essence for #3-2 is too thin, expand it" | Re-read source node, enrich the essence, update block |
| "PROPOSED m_3_chromatic_structure — approve it" | Remove `// PROPOSED` comment |
| "Re-do M3 nodes #3-1-0 through #3-1-5" | Re-read those source nodes, re-apportion, overwrite those blocks |
| "All M3 looks good" | Confirm and offer: execute M3 or continue to M4 |
| "Why did you put X in c_3 not c_1?" | Explain the semantic reasoning; offer to move if user disagrees |

**Never during review:**
- Re-run full apportionment batch without being asked
- Modify nodes not mentioned
- Add properties outside `{family}_{n}[_{sub_n}]*_{semantic}` convention
- Fabricate content not in the source

---

## Stage C: Relations Cypher Generation

After node branches are reviewed and approved, generate relations.

**C1. Load relation files**

For each branch: `docs/datasets/{branch-dir}/relations.json`
Also: `docs/datasets/relations_hash.json` (root-level)

**C2. For each relation:**

Source format:
```json
{ "source": "#3", "target": "#3-1", "relType": "HAS_INTERNAL_COMPONENT", "relProperties": {} }
```

Generate:
```cypher
// {source} -[{relType}]-> {target}
MATCH (a:BimbaNode { coordinate: '{source}' })
MATCH (b:BimbaNode { coordinate: '{target}' })
MERGE (a)-[r:{relType} {
  c_3_created_at: datetime(),
  c_4_confidence: 1.0,
  c_4_method: 'structural',
  c_5_source_ref: 'datasets/{branch-dir}/relations.json'
}]->(b)
;
```

For relations with non-empty `relProperties`, apportion those properties using
the same `{family}_{n}[_{sub_n}]*_{semantic}` convention and add them to the
relation properties map.

**C3.** Write to `epi-gnostic/cypher/generated/relations.cypher`

**C4.** Present for review — same conversation protocol as Stage B.

**C5. Execution ordering:**
Execute all approved `m{n}-nodes.cypher` files BEFORE executing `relations.cypher`.
After executing `relations.cypher`, verify the total relation count:

```cypher
MATCH (a:BimbaNode)-[r]->(b:BimbaNode) RETURN count(r)
```

Compare against the total relation count in the source files. If the counts diverge, MATCH returned no rows for some relations — the source or target nodes were missing at execution time.

---

## Stage D: Execution

Once a Cypher file is approved:

```bash
cypher-shell -u neo4j -p $NEO4J_PASSWORD \
  --file epi-gnostic/cypher/generated/m3-nodes.cypher
```

Execute one file at a time. After each, verify with a count query:

```bash
cypher-shell -u neo4j -p $NEO4J_PASSWORD \
  --query "MATCH (n:BimbaNode) WHERE n.c_4_ql_position = {n} RETURN count(n)"
```

Substitute `{n}` with the branch number being verified (0 for M0, 3 for M3, etc.).
Count should match the node count in the Cypher file.

**If errors occur:**
1. Read the error message
2. Identify the offending MERGE block by coordinate
3. Fix that block in the Cypher file
4. Re-run only the failing block (extract it, run standalone)
   Copy the single `MERGE...SET...ON CREATE SET...;` block (everything between the blank-line separators for that coordinate) into a temp file and run: `cypher-shell -u neo4j -p $NEO4J_PASSWORD --file /tmp/single-node.cypher`
5. Do NOT re-execute the whole file — use `MERGE` idempotency

**For relations** — use inline MATCH/MERGE per relation type if APOC is unavailable,
otherwise use `02-relations-upsert.cypher` via a Python driver call.

---

## Stage E: Embeddings

After all nodes are executed:

```bash
# Check nodes needing embeddings
cypher-shell -u neo4j -p $NEO4J_PASSWORD \
  --query "MATCH (n:BimbaNode) WHERE n.c_5_embedding IS NULL RETURN count(n)"
```

Embeddings are generated by `embed.py` (separate script, requires `GOOGLE_API_KEY`).
Input text per node: `"{coordinate}: {c_1_name}. {c_0_essence}. {c_1_description}"`
Model: `gemini-embedding-2-preview`, 3072 dimensions, stored as `c_5_embedding`.

---

## Stage F: 18-Fold Pointer Resolution

After embeddings, wire the pointer web using `03-pointers-resolve.cypher`.
**Note: pointer computation algorithm not yet implemented.** When Stage F is reached, ask the user for the coordinate arithmetic rules before proceeding. Do not attempt to infer the batch structure without explicit guidance.

The 18 pointer refs per node: `c_ref`, `p_ref`, `l_ref`, `s_ref`, `t_ref`, `m_ref` (direct families), `cpf_ref`, `ct_ref`, `cp_ref`, `cf_ref`, `cfp_ref`, `cs_ref` (reflective coords), `c_inv_ref`, `p_inv_ref`, `l_inv_ref`, `s_inv_ref`, `t_inv_ref`, `m_inv_ref` (inverted families).

---

## Pipeline Summary

| Stage | What happens | Trigger |
|-------|-------------|---------|
| A | Read datasets → apportion → generate `m{n}-nodes.cypher` | Invocation |
| B | Human reviews Cypher ↔ agent amends | Conversation |
| C | Generate `relations.cypher` | After node branches approved |
| D | Execute approved `.cypher` files | After review approval |
| E | Generate embeddings (`embed.py`) | After all nodes executed |
| F | 18-fold pointer resolution | After embeddings |

---

## Adding New Properties

The `{family}_{n}[_{sub_n}]*_{semantic}` convention is open-ended:

- **New subsystem-specific slot found during apportionment**: flag with `// PROPOSED`, get approval, then note in `epi-gnostic/schema-context.md`
- **Already coordinate-prefixed properties in source**: pass through directly
- **Patching existing nodes with new properties**: generate targeted `SET` Cypher and execute — no need to re-run the full branch file
- **Sub-numbered slots**: introduce freely when sub-domains are genuinely distinct; document in schema-context.md after approval

The Cypher files are generated fresh from content each run — they are not templates to maintain.
