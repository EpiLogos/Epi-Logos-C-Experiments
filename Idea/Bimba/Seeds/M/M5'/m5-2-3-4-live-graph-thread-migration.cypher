// M5-2/3/4 live graph thread migration.
// Covers the remaining graph integration spec threads:
// - M5-2 = direct Siva- / Prakrti over full S/S' spine.
// - M5-3 = direct -Shakti / Purusha over full M' expression.
// - M5-4 = direct Siva-Shakti / Purusha-Prakrti protocol seam over S4/S5 and M' agentic surface.
// Additive only: preserve existing nodes and relationships; do not collapse direct M names into M' affordance labels.

MERGE (mprime:Bimba {coordinate: "M'"})
SET mprime:Coordinate:Pratibimba,
    mprime.c_1_name = "M' Pratibimba Expression",
    mprime.c_1_description = "Rendered, playable Pratibimba expression of the M/Bimba map across M0'-M5' in the Theia shell.",
    mprime.c_1_structure = "M' is the expression plane of M, not a separate ontology: lived-reflected operation of the Bimba coordinate image.",
    mprime.coordinate_parent = "M",
    mprime.coordinate_axis = "prime",
    mprime.c_4_family = "M",
    mprime.m_0_repo_path = "Body/M/epi-theia",
    mprime.m_3_rendered_affordance = "Theia/Pratibimba expression plane",
    mprime.promotion_source = "m5-2-3-4-live-graph-thread-migration.cypher",
    mprime.sync_status = "m5_thread_integrated",
    mprime.sync_version = "m5-2-3-4-live-thread-migration-2026-06-03";

WITH [
  {
    coord:"M5-2",
    name:"Siva- / Prakrti",
    old:"Siva-",
    affordance:"Backend Studio",
    role:"System spine: direct M view into the full S/S' technical and reflective stack.",
    structure:"M5-2 is not generic backend; it is all S/S' as a full nodal structure."
  },
  {
    coord:"M5-3",
    name:"-Shakti / Purusha",
    old:"-Shakti",
    affordance:"Frontend Studio",
    role:"System expression: direct M view into the full M' rendered Pratibimba/Theia coordinate field.",
    structure:"M5-3 is not generic frontend; it is the M' expression-plane as rendered system expression."
  },
  {
    coord:"M5-4",
    name:"Siva-Shakti / Purusha-Prakrti",
    old:"Siva-Shakti",
    affordance:"Agentic Control Room",
    role:"System agentic protocols: mediation of S/S', M', S4/S5 review, runtime agency, and operational capacities.",
    structure:"M5-4 is not merely a UI room; it is the protocol seam where stack, expression, and agentic governance become operational."
  }
] AS rows
UNWIND rows AS row
MERGE (n:Bimba {coordinate: row.coord})
SET n:Coordinate:SubsystemLens,
    n.c_1_legacy_name = CASE
      WHEN n.c_1_name IS NOT NULL AND n.c_1_name <> row.name AND n.c_1_legacy_name IS NULL THEN n.c_1_name
      ELSE n.c_1_legacy_name
    END,
    n.c_1_name = row.name,
    n.c_1_description = CASE
      WHEN n.c_1_description IS NULL OR n.c_1_description STARTS WITH "Node with ID" THEN row.role
      ELSE n.c_1_description
    END,
    n.c_1_structure = row.structure,
    n.c_1_coordinate_role = row.role,
    n.m_3_rendered_affordance = row.affordance,
    n.coordinate_parent = "M5",
    n.coordinate_axis = "direct",
    n.c_4_family = "M",
    n.promotion_source = "m5-2-3-4-live-graph-thread-migration.cypher",
    n.sync_status = "m5_thread_integrated",
    n.sync_version = "m5-2-3-4-live-thread-migration-2026-06-03";

// M5-2 governs the full S/S' spine.
MATCH (m52:Bimba {coordinate:"M5-2"})
UNWIND ["S","S'"] AS rootCoord
MATCH (root:Bimba {coordinate: rootCoord})
MERGE (m52)-[r:GOVERNS_COORDINATE_FAMILY]->(root)
SET r.evidence_kind = "coordinate_canon",
    r.evidence_text = "M5-2 is the direct M branch for the full S/S' system spine.",
    r.source_path = "Idea/Bimba/Seeds/M/M5'/m5-2-3-4-coordinate-graph-integration-spec.md",
    r.created_by_sync_version = "m5-2-3-4-live-thread-migration-2026-06-03";

MATCH (m52:Bimba {coordinate:"M5-2"})
MATCH (snode:Bimba)
WHERE snode.coordinate STARTS WITH "S"
SET snode.s_0_owned_by_coordinate = coalesce(snode.s_0_owned_by_coordinate, "M5-2"),
    snode.sync_status = coalesce(snode.sync_status, "m5_thread_integrated"),
    snode.sync_version = coalesce(snode.sync_version, "m5-2-3-4-live-thread-migration-2026-06-03")
MERGE (m52)-[r:HAS_COORDINATE_SCOPE]->(snode)
SET r.scope_mode = "stack_system",
    r.evidence_kind = "coordinate_scope",
    r.evidence_text = "M5-2 scope compiles to coordinate STARTS WITH S.",
    r.created_by_sync_version = "m5-2-3-4-live-thread-migration-2026-06-03";

// M5-3 governs the full M' expression plane and attaches the existing M0'..M5' nodes.
MATCH (m53:Bimba {coordinate:"M5-3"})
MATCH (mprime:Bimba {coordinate:"M'"})
MERGE (m53)-[r:GOVERNS_COORDINATE_FAMILY]->(mprime)
SET r.evidence_kind = "coordinate_canon",
    r.evidence_text = "M5-3 is the direct M branch for the full M' rendered expression field.",
    r.source_path = "Idea/Bimba/Seeds/M/M5'/m5-2-3-4-coordinate-graph-integration-spec.md",
    r.created_by_sync_version = "m5-2-3-4-live-thread-migration-2026-06-03";

MATCH (m53:Bimba {coordinate:"M5-3"})
MATCH (mprime:Bimba {coordinate:"M'"})
UNWIND ["M0'","M1'","M2'","M3'","M4'","M5'"] AS coord
MERGE (n:Bimba {coordinate: coord})
SET n:Coordinate:Pratibimba,
    n.coordinate_parent = "M'",
    n.coordinate_axis = "prime",
    n.c_4_family = "M",
    n.m_0_owned_by_coordinate = coalesce(n.m_0_owned_by_coordinate, "M5-3"),
    n.sync_status = "m5_thread_integrated",
    n.sync_version = "m5-2-3-4-live-thread-migration-2026-06-03"
MERGE (mprime)-[contains:CONTAINS]->(n)
SET contains.evidence_kind = "coordinate_canon",
    contains.evidence_text = "M' parent contains M0'-M5' rendered expression coordinates.",
    contains.created_by_sync_version = "m5-2-3-4-live-thread-migration-2026-06-03"
MERGE (m53)-[scope:HAS_COORDINATE_SCOPE]->(n)
SET scope.scope_mode = "m_prime_expression",
    scope.evidence_kind = "coordinate_scope",
    scope.evidence_text = "M5-3 scope compiles to M coordinates with prime detection.",
    scope.created_by_sync_version = "m5-2-3-4-live-thread-migration-2026-06-03";

// M' rendered affordance nodes for the three direct M branch heads.
WITH [
  {coord:"M5-2'", parent:"M5'", name:"Backend Studio", direct:"M5-2", desc:"M' rendered affordance exposing the M5-2 S/S' system spine."},
  {coord:"M5-3'", parent:"M5'", name:"Frontend Studio", direct:"M5-3", desc:"M' rendered affordance exposing the M5-3 M' expression plane."},
  {coord:"M5-4'", parent:"M5'", name:"Agentic Control Room", direct:"M5-4", desc:"M' rendered affordance exposing the M5-4 agentic protocol seam."}
] AS affordances
UNWIND affordances AS row
MERGE (ui:Bimba {coordinate: row.coord})
SET ui:Coordinate:Pratibimba:RenderedAffordance,
    ui.c_1_name = row.name,
    ui.c_1_description = row.desc,
    ui.coordinate_parent = row.parent,
    ui.coordinate_axis = "prime",
    ui.c_4_family = "M",
    ui.m_3_rendered_affordance = row.name,
    ui.m_0_owned_by_coordinate = row.direct,
    ui.sync_status = "m5_thread_integrated",
    ui.sync_version = "m5-2-3-4-live-thread-migration-2026-06-03"
WITH row, ui
MATCH (direct:Bimba {coordinate: row.direct})
MATCH (m5p:Bimba {coordinate:"M5'"})
MERGE (m5p)-[:CONTAINS]->(ui)
MERGE (direct)-[r:EXPOSED_AS_M_PRIME_AFFORDANCE]->(ui)
SET r.evidence_kind = "register_distinction",
    r.evidence_text = "IDE-facing label is stored as M' affordance and does not replace the direct M branch name.",
    r.created_by_sync_version = "m5-2-3-4-live-thread-migration-2026-06-03";

// M5-4 protocol seam: attach to S4/S4'/S5/S5' and M' agentic surface.
MATCH (m54:Bimba {coordinate:"M5-4"})
UNWIND ["S4","S4'","S5","S5'"] AS coord
MATCH (anchor:Bimba {coordinate: coord})
MERGE (m54)-[r:MEDIATES_PROTOCOL_LAYER]->(anchor)
SET r.evidence_kind = "coordinate_canon",
    r.evidence_text = "M5-4 mediates S4/S5 agentic runtime, review, autoresearch, and world-return protocols.",
    r.source_path = "Idea/Bimba/Seeds/M/M5'/m5-2-3-4-coordinate-graph-integration-spec.md",
    r.created_by_sync_version = "m5-2-3-4-live-thread-migration-2026-06-03";

MATCH (m54:Bimba {coordinate:"M5-4"})
MATCH (m5p:Bimba {coordinate:"M5'"})
MATCH (acr:Bimba {coordinate:"M5-4'"})
MERGE (m54)-[:MEDIATES_M_PRIME_AGENTIC_SURFACE]->(m5p)
MERGE (m54)-[:EXPOSED_AS_M_PRIME_AFFORDANCE]->(acr)
SET m54.s_4_agent_affordance = "VAK/agent runtime protocol mediation",
    m54.s_5_promotion_gate = "review/autoresearch/human-validation governed",
    m54.t_4_protocol_scope = "S4/S4', S5/S5', M' agentic affordances, operational capacities",
    m54.sync_status = "m5_thread_integrated",
    m54.sync_version = "m5-2-3-4-live-thread-migration-2026-06-03";

MATCH (m52:Bimba {coordinate:"M5-2"})
MATCH (m53:Bimba {coordinate:"M5-3"})
MATCH (m54:Bimba {coordinate:"M5-4"})
RETURN m52.c_1_name AS m52_name,
       m52.m_3_rendered_affordance AS m52_affordance,
       m53.c_1_name AS m53_name,
       m53.m_3_rendered_affordance AS m53_affordance,
       m54.c_1_name AS m54_name,
       m54.m_3_rendered_affordance AS m54_affordance;
