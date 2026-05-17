// Migration: :BimbaCoordinate scaffold → :Bimba with coordinate-driven properties.
// Date: 2026-05-17
// Plan: docs/plans/2026-05-17-bimba-map-ingestion-plan.md (§6)
//
// Strategy:
//   Step 1: MERGE each :BimbaCoordinate into a :Bimba carrying all properties under
//           their canonical {family}_{n}_{semantic} names. COALESCE preserves any
//           existing values on the :Bimba side.
//   Step 2: Transfer scaffold relationships from :BimbaCoordinate to :Bimba.
//   Step 3: Verification queries to confirm parity before deletion.
//   Step 4 (separate, human-gated): DETACH DELETE the old :BimbaCoordinate set.

// ---------------------------------------------------------------------------
// STEP 1 — Property migration
// ---------------------------------------------------------------------------

MATCH (old:BimbaCoordinate)
MERGE (new:Bimba {coordinate: old.bimbaCoordinate})
SET new.c_4_layer = COALESCE(new.c_4_layer, old.layer),
    new.c_4_topo_mode = COALESCE(new.c_4_topo_mode, old.topo_mode),
    new.c_4_weave_state = COALESCE(new.c_4_weave_state, old.weave_state),
    new.c_4_inversion_state = COALESCE(new.c_4_inversion_state, old.inversion_state),
    new.c_4_flags = COALESCE(new.c_4_flags, old.flags),
    new.c_4_family = COALESCE(new.c_4_family, old.family),
    new.c_4_ql_position = COALESCE(new.c_4_ql_position, old.ql_position),
    new.c_2_uuid = COALESCE(new.c_2_uuid, old.uuid),
    new.c_1_name = COALESCE(new.c_1_name, old.name),
    new.c_1_description = COALESCE(new.c_1_description, old.description),
    new.c_0_essence = COALESCE(new.c_0_essence, old.essence),
    new.c_5_embedding = COALESCE(new.c_5_embedding, old.semantic_embedding),
    new.bimbaCoordinate = COALESCE(new.bimbaCoordinate, old.bimbaCoordinate);

// ---------------------------------------------------------------------------
// STEP 2 — Relationship transfer (current scaffold types only)
// ---------------------------------------------------------------------------

// MANIFESTS — 144 expected
CALL (*) {
  MATCH (s_old:BimbaCoordinate)-[:MANIFESTS]->(t_old:BimbaCoordinate)
  MATCH (s_new:Bimba {coordinate: s_old.bimbaCoordinate})
  MATCH (t_new:Bimba {coordinate: t_old.bimbaCoordinate})
  MERGE (s_new)-[:MANIFESTS]->(t_new)
} IN TRANSACTIONS OF 100 ROWS;

// BEDROCK — 144 expected
CALL (*) {
  MATCH (s_old:BimbaCoordinate)-[:BEDROCK]->(t_old:BimbaCoordinate)
  MATCH (s_new:Bimba {coordinate: s_old.bimbaCoordinate})
  MATCH (t_new:Bimba {coordinate: t_old.bimbaCoordinate})
  MERGE (s_new)-[:BEDROCK]->(t_new)
} IN TRANSACTIONS OF 100 ROWS;

// INVERTS_TO — 72 expected
CALL (*) {
  MATCH (s_old:BimbaCoordinate)-[:INVERTS_TO]->(t_old:BimbaCoordinate)
  MATCH (s_new:Bimba {coordinate: s_old.bimbaCoordinate})
  MATCH (t_new:Bimba {coordinate: t_old.bimbaCoordinate})
  MERGE (s_new)-[:INVERTS_TO]->(t_new)
} IN TRANSACTIONS OF 100 ROWS;

// ANCHORED_TO — 14 expected
CALL (*) {
  MATCH (s_old:BimbaCoordinate)-[:ANCHORED_TO]->(t_old:BimbaCoordinate)
  MATCH (s_new:Bimba {coordinate: s_old.bimbaCoordinate})
  MATCH (t_new:Bimba {coordinate: t_old.bimbaCoordinate})
  MERGE (s_new)-[:ANCHORED_TO]->(t_new)
} IN TRANSACTIONS OF 100 ROWS;

// ---------------------------------------------------------------------------
// STEP 3 — Verification
// ---------------------------------------------------------------------------

// Coordinate parity
MATCH (old:BimbaCoordinate)
WITH count(old) AS old_count
MATCH (new:Bimba)
WHERE new.bimbaCoordinate IS NOT NULL
WITH old_count, count(new) AS migrated_count
RETURN old_count, migrated_count, old_count = migrated_count AS parity_ok;

// Relationship parity per type
MATCH (a:BimbaCoordinate)-[r]->(b:BimbaCoordinate)
WITH type(r) AS t, count(r) AS old_count
OPTIONAL MATCH (na:Bimba)-[r2]->(nb:Bimba)
WHERE type(r2) = t
  AND na.bimbaCoordinate IS NOT NULL
  AND nb.bimbaCoordinate IS NOT NULL
WITH t, old_count, count(r2) AS new_count
RETURN t AS rel_type, old_count, new_count, new_count >= old_count AS parity_ok
ORDER BY rel_type;

// ---------------------------------------------------------------------------
// STEP 4 — HUMAN-GATED DELETION (do NOT auto-run)
// ---------------------------------------------------------------------------

// MATCH (old:BimbaCoordinate) DETACH DELETE old;
