// 03-pointers-resolve.cypher
// Parameters: $batch — list of pointer objects.
// Each item: { coordinate, c_ref, p_ref, l_ref, s_ref, t_ref, m_ref,
//              cpf_ref, ct_ref, cp_ref, cf_ref, cfp_ref, cs_ref,
//              c_inv_ref, p_inv_ref, l_inv_ref, s_inv_ref, t_inv_ref, m_inv_ref }
// All refs are coordinate strings or null.

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
WITH n, ptr
WHERE ptr.c_inv_ref IS NOT NULL
MATCH (ci:BimbaNode { coordinate: ptr.c_inv_ref })
MERGE (n)-[:POLAR_OPPOSITE { family: 'c' }]->(ci)
WITH n, ptr
WHERE ptr.cf_ref IS NOT NULL
MATCH (cf:BimbaNode { coordinate: ptr.cf_ref })
MERGE (n)-[:CONTEXT_FRAME_REF { coord: 'cf' }]->(cf)
RETURN count(n) AS resolved;
