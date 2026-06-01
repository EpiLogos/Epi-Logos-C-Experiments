# S2 Local Graph Topology Runbook

## Service Topology

The engineer-facing local stack is `docker-compose.epi-s2.yml`:

- `neo4j`: canonical S2 coordinate graph at `bolt://localhost:7687`.
- `redis`: Redis Stack semantic cache substrate at `redis://localhost:6379`.
- `graphiti`: protected episodic runtime that depends on Neo4j and Redis but must not write protected episode bodies into canonical S2 projections.

The default Neo4j image installs APOC only:

```yaml
NEO4J_PLUGINS: '["apoc"]'
NEO4J_dbms_security_procedures_unrestricted: apoc.*
```

n10s and GDS are first-class S2' dependencies, but this topology does not silently assume they are present. `epi graph doctor --json` reports them as separate blocked readiness sections until the selected Neo4j image/profile exposes real `n10s.*` and `gds.*` procedures.

## Readiness Contract

Run:

```bash
epi graph doctor --json
```

The JSON report must include independent readiness objects:

- `neo4j`: Bolt connectivity.
- `schema`: graph metadata/schema version presence.
- `apoc`: live `SHOW PROCEDURES` check for the `apoc.` namespace required by dataset import.
- `n10s`: live `SHOW PROCEDURES` check for the `n10s.` namespace.
- `owl2Rl`: live `SHOW PROCEDURES` check for `n10s.inference.` after n10s is available.
- `gds`: live `SHOW PROCEDURES` check for the `gds.` namespace.
- `privacyProjection`: Option 1 GDS overlay readiness, blocked unless GDS is live and protected-local labels are excluded.

If n10s or GDS are intentionally unavailable, leave the section `status` as `blocked` and use the section `fallback` text as the operational explanation. Do not mark ontology import, OWL inference, or GDS overlays ready from configuration flags, static files, or mocked procedure lists.

## Seed Baseline Contract

The canonical seed is idempotent and queryable through the S2 coordinate API. The baseline is:

- 102 seed nodes: `#`, six psychoids, four weave nodes, seven `CF_*` nodes, six `Family_*` meta-nodes, 72 family coordinates, and six VAK coordinates.
- At least 306 canonical seed relationships among those nodes.
- Legacy numbered psychoid inputs resolve through the M-family application surface, so `#4` resolves to `M4`.
- The bare root `#` remains directly queryable as the root fact and is not rewritten to a missing `M` node.
- Family identity is stored in properties such as `c_4_family`; family-specific labels like `Family_C` are not canonical.

Smoke consumers should use the query set exposed by `seed_baseline_snapshot_queries()` in `Body/S/S2/graph-services/src/seed.rs` for node-group counts, seed relationship counts, and M0'/M1'/M5' sample nodes.

## Live Procedure Checks

For manual inspection:

```cypher
SHOW PROCEDURES YIELD name
WHERE name STARTS WITH 'apoc.'
RETURN name
ORDER BY name
LIMIT 8;
```

```cypher
SHOW PROCEDURES YIELD name
WHERE name STARTS WITH 'n10s.'
RETURN name
ORDER BY name
LIMIT 8;
```

```cypher
SHOW PROCEDURES YIELD name
WHERE name STARTS WITH 'gds.'
RETURN name
ORDER BY name
LIMIT 8;
```

`privacyProjection` follows the initial S2' Option 1 policy: GDS recommendations are derived overlays, not canonical relations, and protected Graphiti/Nara labels are excluded from projection candidates.

## `epi:` Ontology Bridge

The S2-owned ontology artifact lives at `Body/S/S2/ontology/epi.ttl`. It defines the `epi:` OWL2 RL bridge for coordinate classes, relation families, source/spec/code/test anchors, and public Anuttara fields. Anuttara aliases shown to M0' (`symbol`, `formulation_type`, and `complete_formulation`) are read from S2 properties (`c_1_symbol`, `c_1_formulation_type`, and `c_1_complete_formulation`) with provenance; renderers must not invent placeholder values.

The Rust bridge exposes parameterized n10s import/export plans and records OWL2 RL / SHACL reporting facts in `GraphMeta`. A local Neo4j image without `n10s.*` procedures must remain blocked in `epi graph doctor --json`; ontology import and OWL inference are only ready when those live procedures exist.

## GDS Option 1 Overlay Contract

The baseline projection is `s2_public_bimba_option1_v1`: public `Bimba` coordinate topology, registered non-compatibility relationship types, and explicit exclusion of `GraphitiEpisode`, `NaraBody`, `ProtectedLocalBody`, and `PrivateProjection`. The projection plan is a GDS in-memory projection only; it must not create canonical relationships or persist recommendations into Neo4j.

When `gds.*` procedures are absent, `gds_tangent_overlay` returns a blocked payload with algorithm descriptors, projection/privacy metadata, empty `derivedNodes`, and `canonicalWritePerformed=false`. That blocked payload is the production readiness state for the default APOC-only local topology, not a placeholder recommendation set.
