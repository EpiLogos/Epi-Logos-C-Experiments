// Correct S/S' child coordinate syntax after S lattice import.
//
// Canon:
// - S4.* / S4.*' keep the dotted 4-operator form.
// - Other S children use branch syntax: Sx-y / Sx-y'.
// - Prime/inversion marker lives at the end of the child coordinate.

MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH 'S'
  AND n.coordinate CONTAINS '.'
WITH n, n.coordinate AS old_coordinate, split(n.coordinate, '.') AS parts
WITH n,
  old_coordinate,
  parts[0] AS parent_base,
  replace(parts[1], "'", "") AS child_index,
  n.coordinate ENDS WITH "'" AS is_prime
WHERE NOT parent_base ENDS WITH '4'
WITH n,
  old_coordinate,
  parent_base,
  CASE
    WHEN is_prime THEN parent_base + '-' + child_index + "'"
    ELSE parent_base + '-' + child_index
  END AS corrected_coordinate,
  CASE
    WHEN is_prime THEN parent_base + "'"
    ELSE parent_base
  END AS corrected_parent
SET n.coordinate = corrected_coordinate,
  n.coordinate_parent = corrected_parent,
  n.s_0_prior_dotted_coordinate = coalesce(n.s_0_prior_dotted_coordinate, old_coordinate),
  n.sync_status = 'm5_s_child_coordinate_syntax_corrected',
  n.sync_version = 'm5-s-child-coordinate-syntax-correction-2026-06-03';

MATCH (m52:Bimba {coordinate: 'M5-2'})
MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH 'S'
MERGE (m52)-[:HAS_COORDINATE_SCOPE]->(n)
SET n.s_0_owned_by_coordinate = 'M5-2';

MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH 'S'
  AND n.coordinate CONTAINS '.'
  AND NOT split(n.coordinate, '.')[0] ENDS WITH '4'
WITH count(n) AS illegal_dotted_s_children
MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH 'S'
  AND n.coordinate CONTAINS '-'
WITH illegal_dotted_s_children, count(n) AS hyphen_s_children
MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH 'S4.'
RETURN illegal_dotted_s_children, hyphen_s_children, count(n) AS allowed_s4_dotted_children;
