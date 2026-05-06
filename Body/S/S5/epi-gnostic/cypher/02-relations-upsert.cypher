// 02-relations-upsert.cypher
// Parameters: $batch — list of relation objects.
// Each item: { source, target, rel_type, props }
// props must include: c_3_created_at, c_4_confidence, c_4_method, c_5_source_ref
// Requires APOC plugin (minimum APOC 4.x).
//
// APOC version compatibility:
//   APOC 4.x (Neo4j 4.x): YIELD column is 'rel'         → YIELD rel AS r
//   APOC 5.x (Neo4j 5.x): YIELD column is 'relationship' → YIELD relationship AS r
// This file uses APOC 4.x syntax. If running Neo4j 5.x + APOC 5.x, change the
// YIELD line to: YIELD relationship AS r

UNWIND $batch AS rel
MATCH (a:BimbaNode { coordinate: rel.source })
MATCH (b:BimbaNode { coordinate: rel.target })
CALL apoc.merge.relationship(a, rel.rel_type, {}, rel.props, b)
  YIELD rel AS r
RETURN count(r) AS merged;
