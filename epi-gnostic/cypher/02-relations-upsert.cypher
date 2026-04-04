// 02-relations-upsert.cypher
// Parameters: $batch — list of relation objects.
// Each item: { source, target, rel_type, props }
// props must include: c_3_created_at, c_4_confidence, c_4_method, c_5_source_ref
// Requires APOC plugin.

UNWIND $batch AS rel
MATCH (a:BimbaNode { coordinate: rel.source })
MATCH (b:BimbaNode { coordinate: rel.target })
CALL apoc.merge.relationship(a, rel.rel_type, {}, rel.props, b)
  YIELD rel AS r
RETURN count(r) AS merged;
