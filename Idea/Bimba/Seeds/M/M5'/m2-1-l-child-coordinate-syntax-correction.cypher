// Correct L/L' child coordinate syntax after direct M2-1 branch port.
//
// Canon:
// - Lens heads remain L0..L5 and L0'..L5'.
// - Lens child branches use hyphen syntax: Lx-y / Lx-y'.
// - Prime/inversion marker lives at the end of the child coordinate.
// - Dotted syntax is not valid for ordinary L child coordinates.

MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH 'L'
  AND n.coordinate CONTAINS '.'
WITH n, n.coordinate AS old_coordinate, split(n.coordinate, '.') AS parts
WITH n,
  old_coordinate,
  parts[0] AS lens_head,
  parts[1] AS child_index,
  parts[0] ENDS WITH "'" AS is_prime
WITH n,
  old_coordinate,
  lens_head,
  CASE
    WHEN is_prime THEN replace(lens_head, "'", "") + "-" + child_index + "'"
    ELSE lens_head + "-" + child_index
  END AS corrected_coordinate
SET n.coordinate = corrected_coordinate,
  n.coordinate_parent = lens_head,
  n.l_0_prior_dotted_coordinate = coalesce(n.l_0_prior_dotted_coordinate, old_coordinate),
  n.sync_status = 'm2_1_l_child_coordinate_syntax_corrected',
  n.sync_version = 'm2-1-l-child-coordinate-syntax-correction-2026-06-03';

MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH 'L'
  AND n.coordinate CONTAINS '.'
WITH count(n) AS dotted_l_children
MATCH (n:Bimba)
WHERE n.coordinate STARTS WITH 'L'
  AND n.coordinate CONTAINS '-'
RETURN dotted_l_children, count(n) AS hyphen_l_children, collect(n.coordinate)[0..12] AS sample;
