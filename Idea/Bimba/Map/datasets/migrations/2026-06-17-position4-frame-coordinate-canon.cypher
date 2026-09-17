// Migration: position-4 context-frame coordinate canonicalisation (Track 45).
// Date: 2026-06-17
// Owner: [[45-bimba-map-indexing-and-dox-okf-unification]]
//
// WHY: the generator (Body/S/S2/graph-services `wrap_context_frames`) used to parenthesise the
// WHOLE position-4 frame segment, producing `M0-(4.0/1)` and splitting the QL fractal-doubling
// frame into `M0-4.4.0-(4.4/5)`. The canonical form keeps the `4.` OUTSIDE via dot-notation and
// keeps the doubling atomic:
//     M0-(4.0/1)        -> M0-4.(0/1)
//     M0-(4.0/1/2)      -> M0-4.(0/1/2)
//     M0-(4.0/1/2/3)    -> M0-4.(0/1/2/3)
//     M0-(4.5/0)        -> M0-4.(5/0)
//     M0-4.4.0-(4.4/5)  -> M0-4.(4.0/1-4.4/5)
// Simple frames `(0/1)` / `(5/0)` / `(0/360)` are ALREADY correct and are left untouched.
//
// SCOPE: 40 :Bimba nodes (M0-4.* and M1-3-4.* regions). This is a SURGICAL rename — it does NOT
// re-run the scaffold→:Bimba migration (the graph is in an advanced state). SAFE to re-run
// (idempotent): the WHERE only matches nodes still holding the old whole-paren form; the prior
// value is backed up to `c_0_prior_coordinate`.
//
// REVIEW BEFORE EXECUTING. After running, audit string-valued references to the renamed coords
// (e.g. `c_0_source_coordinates`, `relatedCoordinates`, gnostic `:MAPS_TO_COORDINATE` targets,
// `bimba_coordinate` on gnostic nodes) — Neo4j *relationships* survive (node-based), but any
// coordinate-STRING property elsewhere still points at the old form and may need the same rewrite.

MATCH (n:Bimba)
WHERE n.coordinate CONTAINS '(4.0/1)'
   OR n.coordinate CONTAINS '(4.0/1/2)'
   OR n.coordinate CONTAINS '(4.0/1/2/3)'
   OR n.coordinate CONTAINS '(4.5/0)'
   OR n.coordinate CONTAINS '4.4.0-(4.4/5)'
WITH n, n.coordinate AS old_coordinate
SET n.c_0_prior_coordinate = coalesce(n.c_0_prior_coordinate, old_coordinate),
    n.coordinate = replace(replace(replace(replace(replace(
        old_coordinate,
        '4.4.0-(4.4/5)', '4.(4.0/1-4.4/5)'),
        '(4.0/1/2/3)',   '4.(0/1/2/3)'),
        '(4.0/1/2)',     '4.(0/1/2)'),
        '(4.0/1)',       '4.(0/1)'),
        '(4.5/0)',       '4.(5/0)'),
    n.sync_status = 'coordinate_position4_dotnotation_canon',
    n.sync_version = 'map-track-45-coordinate-canon-2026-06-17'
RETURN count(n) AS renamed;

// Verification (run after): expect 0 rows.
// MATCH (n:Bimba) WHERE n.coordinate CONTAINS '(4.0/1)' OR n.coordinate CONTAINS '(4.5/0)'
//    OR n.coordinate CONTAINS '4.4.0-(4.4/5)' RETURN n.coordinate;
