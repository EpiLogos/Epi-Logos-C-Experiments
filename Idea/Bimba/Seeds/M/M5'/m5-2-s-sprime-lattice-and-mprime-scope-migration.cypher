// M5-2 / M5-3 / M5-4 live coordinate scope tightening.
//
// Source CSV:
//   Idea/Bimba/Seeds/S/FLOW-2026-04-11-S-COORDINATE-LATTICE-SCAFFOLD.csv
//
// Intent:
// - M5-2 governs the complete S/S' system spine, not only the S/S' roots.
// - M5-3 governs every M' coordinate by coordinate prefix, including M5 affordance children.
// - M5-4 mediates S4/S4' and S5/S5' protocol layers at both parent and subnode levels.
// - All lookup law remains coordinate-prefix driven.

LOAD CSV WITH HEADERS FROM 'file:///s-lattice.csv' AS row
WITH row
WHERE row.coordinate IS NOT NULL AND row.coordinate <> ''
WITH row,
  CASE
    WHEN row.kind IN ['sub_direct', 'sub_prime'] AND row.root_x <> '4' THEN
      'S' + row.root_x + '-' + row.sub_y + CASE WHEN row.kind = 'sub_prime' THEN "'" ELSE '' END
    ELSE row.coordinate
  END AS canonical_coordinate,
  CASE
    WHEN row.kind = 'root_direct' THEN 'S'
    WHEN row.kind = 'root_prime' THEN "S'"
    WHEN row.kind = 'sub_direct' THEN 'S' + row.root_x
    WHEN row.kind = 'sub_prime' THEN 'S' + row.root_x + "'"
    ELSE null
  END AS parent_coordinate
MERGE (n:Bimba {coordinate: canonical_coordinate})
WITH row, parent_coordinate, n, n.c_1_name AS old_name, n.c_1_description AS old_description
SET n:Coordinate:Stack,
  n.c_1_prior_name = CASE
    WHEN old_name IS NOT NULL AND old_name <> row.planned_name AND n.c_1_prior_name IS NULL THEN old_name
    ELSE n.c_1_prior_name
  END,
  n.c_1_prior_description = CASE
    WHEN old_description IS NOT NULL AND old_description <> row.notes AND n.c_1_prior_description IS NULL THEN old_description
    ELSE n.c_1_prior_description
  END,
  n.c_1_name = row.planned_name,
  n.c_1_description = row.notes,
  n.s_0_prior_scaffold_coordinate = CASE
    WHEN row.coordinate <> n.coordinate AND n.s_0_prior_scaffold_coordinate IS NULL THEN row.coordinate
    ELSE n.s_0_prior_scaffold_coordinate
  END,
  n.coordinate_parent = parent_coordinate,
  n.coordinate_family = CASE WHEN row.coordinate ENDS WITH "'" THEN "S'" ELSE 'S' END,
  n.coordinate_namespace = 'S',
  n.coordinate_axis = CASE WHEN row.kind CONTAINS 'prime' THEN 'prime' ELSE 'direct' END,
  n.coordinate_kind = row.kind,
  n.coordinate_depth = toInteger(row.depth),
  n.c_4_layer = toInteger(row.root_x),
  n.c_4_ql_position = CASE WHEN row.sub_y IS NULL OR row.sub_y = '' THEN null ELSE toInteger(row.sub_y) END,
  n.s_0_owned_by_coordinate = 'M5-2',
  n.s_1_vault_wikilink = row.wikilink,
  n.s_2_crud_scope = CASE
    WHEN row.coordinate STARTS WITH 'S2' THEN 'graph node/relation CRUD, schema, ingestion, retrieval'
    WHEN row.coordinate STARTS WITH 'S1' THEN 'vault file CRUD, compilation, content membrane'
    WHEN row.coordinate STARTS WITH 'S5' THEN 'world sync, recollection, improvement promotion'
    ELSE coalesce(n.s_2_crud_scope, 'coordinate-governed system operation')
  END,
  n.s_2_query_discriminator = 'coordinate',
  n.s_2_query_prefix = CASE WHEN row.coordinate ENDS WITH "'" THEN "S'" ELSE 'S' END,
  n.s_5_runtime_use = row.notes,
  n.sync_status = 'm5_s_lattice_integrated',
  n.sync_version = 'm5-s-lattice-migration-2026-06-03'
WITH n, parent_coordinate
MATCH (parent:Bimba {coordinate: parent_coordinate})
MERGE (parent)-[:CONTAINS]->(n);

MATCH (m52:Bimba {coordinate: 'M5-2'})
MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH 'S'
MERGE (m52)-[:HAS_COORDINATE_SCOPE]->(n)
SET n.s_0_owned_by_coordinate = 'M5-2',
  m52.s_2_coordinate_scope = "S/S' complete system-spine lattice",
  m52.s_2_query_discriminator = 'coordinate',
  m52.s_2_query_prefixes = ['S', "S'"];

MATCH (m53:Bimba {coordinate: 'M5-3'})
MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH 'M' AND n.coordinate CONTAINS "'"
MERGE (m53)-[:HAS_COORDINATE_SCOPE]->(n)
SET n.m_0_owned_by_coordinate = 'M5-3',
  m53.m_2_coordinate_scope = "M' complete expression lattice",
  m53.m_2_query_discriminator = 'coordinate',
  m53.m_2_query_prefixes = ["M'"];

MATCH (m54:Bimba {coordinate: 'M5-4'})
MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH 'S4'
   OR n.coordinate STARTS WITH "S4'"
   OR n.coordinate STARTS WITH 'S5'
   OR n.coordinate STARTS WITH "S5'"
MERGE (m54)-[:MEDIATES_PROTOCOL_LAYER]->(n)
MERGE (m54)-[:HAS_COORDINATE_SCOPE]->(n)
SET n.s_4_s5_agentic_protocol_owner = 'M5-4',
  m54.s_4_s5_coordinate_scope = "S4/S4' agent inhabitation plus S5/S5' world-return and improvement protocols",
  m54.s_2_query_discriminator = 'coordinate',
  m54.s_2_query_prefixes = ['S4', "S4'", 'S5', "S5'"];

MATCH (m52:Bimba {coordinate: 'M5-2'})
OPTIONAL MATCH (m52)-[:HAS_COORDINATE_SCOPE]->(s:Bimba)
WHERE s.coordinate STARTS WITH 'S'
WITH m52, count(DISTINCT s) AS s_scope
MATCH (m53:Bimba {coordinate: 'M5-3'})
OPTIONAL MATCH (m53)-[:HAS_COORDINATE_SCOPE]->(mp:Bimba)
WHERE mp.coordinate STARTS WITH 'M' AND mp.coordinate CONTAINS "'"
WITH s_scope, m53, count(DISTINCT mp) AS mprime_scope
MATCH (m54:Bimba {coordinate: 'M5-4'})
OPTIONAL MATCH (m54)-[:MEDIATES_PROTOCOL_LAYER]->(p:Bimba)
WHERE p.coordinate STARTS WITH 'S4'
   OR p.coordinate STARTS WITH "S4'"
   OR p.coordinate STARTS WITH 'S5'
   OR p.coordinate STARTS WITH "S5'"
RETURN s_scope, mprime_scope, count(DISTINCT p) AS s4_s5_protocol_scope;
