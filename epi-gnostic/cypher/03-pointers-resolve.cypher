// 03-pointers-resolve.cypher
// Parameters: $batch — list of pointer objects.
// Each item: { coordinate, c_ref, p_ref, l_ref, s_ref, t_ref, m_ref,
//              cpf_ref, ct_ref, cp_ref, cf_ref, cfp_ref, cs_ref,
//              c_inv_ref, p_inv_ref, l_inv_ref, s_inv_ref, t_inv_ref, m_inv_ref }
// All refs are coordinate strings or null.
// Note: only c_inv_ref and cf_ref generate graph edges (POLAR_OPPOSITE, CONTEXT_FRAME_REF).
// The remaining 16 refs are stored as node properties only — pointer edge materialisation
// for the full 18-fold web is deferred to Stage F (pointer algorithm not yet implemented).
//
// Run as 3 separate statements — each UNWIND is independent so the WHERE clauses
// do not compound across branches.

// Statement 1: Write all 18 pointer properties onto each node.
UNWIND $batch AS ptr
MATCH (n:BimbaNode { coordinate: ptr.coordinate })
SET n.c_ref     = ptr.c_ref,   n.p_ref   = ptr.p_ref,
    n.l_ref     = ptr.l_ref,   n.s_ref   = ptr.s_ref,
    n.t_ref     = ptr.t_ref,   n.m_ref   = ptr.m_ref,
    n.cpf_ref   = ptr.cpf_ref, n.ct_ref  = ptr.ct_ref,
    n.cp_ref    = ptr.cp_ref,  n.cf_ref  = ptr.cf_ref,
    n.cfp_ref   = ptr.cfp_ref, n.cs_ref  = ptr.cs_ref,
    n.c_inv_ref = ptr.c_inv_ref, n.p_inv_ref = ptr.p_inv_ref,
    n.l_inv_ref = ptr.l_inv_ref, n.s_inv_ref = ptr.s_inv_ref,
    n.t_inv_ref = ptr.t_inv_ref, n.m_inv_ref = ptr.m_inv_ref
RETURN count(n) AS props_set;

// Statement 2: POLAR_OPPOSITE edges (c_inv_ref only).
// Independent UNWIND — WHERE does not compound with Statement 3.
UNWIND $batch AS ptr
WITH ptr
WHERE ptr.c_inv_ref IS NOT NULL
MATCH (n:BimbaNode { coordinate: ptr.coordinate })
MATCH (ci:BimbaNode { coordinate: ptr.c_inv_ref })
MERGE (n)-[:POLAR_OPPOSITE { family: 'c' }]->(ci)
RETURN count(*) AS polar_opposite_edges;

// Statement 3: CONTEXT_FRAME_REF edges (cf_ref only).
// Independent UNWIND — applies to all nodes with cf_ref, regardless of c_inv_ref.
UNWIND $batch AS ptr
WITH ptr
WHERE ptr.cf_ref IS NOT NULL
MATCH (n:BimbaNode { coordinate: ptr.coordinate })
MATCH (cf:BimbaNode { coordinate: ptr.cf_ref })
MERGE (n)-[:CONTEXT_FRAME_REF { coord: 'cf' }]->(cf)
RETURN count(*) AS context_frame_edges;
