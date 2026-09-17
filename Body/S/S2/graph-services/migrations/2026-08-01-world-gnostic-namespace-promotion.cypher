// Migration: `/World` as a 1st-class S2 namespace + `:Gnostic` label promotion (Tranche 09.T9.14).
// Date: 2026-08-01
// Owner: [[09-integrated-bimba-graph-reconciliation]] Tranche 9.14; DR-WORLD-1, DR-S5-ONE-1, CCT-17b.
// Runner: `node Body/S/S2/graph-services/migrations/run-namespace-promotion.mjs` — DRY RUN by default.
//
// *** NOT APPLIED. REVIEW BEFORE EXECUTING. ***
// This file mutates the authoritative live baseline ontology. Per the standing law the live graph
// IS the authority and canonical writes route through Hen / the Architect, never an autonomous
// agent. It is landed here so the Architect can read the exact statements, run the dry run, and
// then decide. The tranche that produced it did not run the apply path against any live graph.
//
// WHY: DR-WORLD-1 mints `/World` as a 1st-class S2 namespace with the `:World` label (and its
// `:Archetypal` alias), linked back to the base C-coordinates by typed `WORLD_FORM_OF` /
// `WORLD_ONTOLOGY_OF` relations — `/World` is not a parallel structure, it is the C-axis psychoid
// expression of the canonical field, made queryable as entity-forms. DR-S5-ONE-1 promotes
// `:Gnostic` to a real label alongside it (today the Gnostic pipeline writes its nodes under the
// lowercase `GNOSTIC_WORKSPACE` label, so the namespace is implicit and unenforced).
//
// SCHEMA AUTHORITY: every label, relation type and property named below is a registered constant in
// `Body/S/S2/graph-schema` (`WORLD_LABEL`, `ARCHETYPAL_LABEL`, `GNOSTIC_LABEL`, `GNOSTIC_*_LABEL`,
// `WORLD_FORM_OF_RELATION`, `WORLD_ONTOLOGY_OF_RELATION`, `SOURCE_ARTIFACT_SPAN_PROPERTY`). That
// binding is machine-checked: `cargo test -p epi-s2-graph-services --test world_namespace_migration`
// parses THIS file and refuses any literal the registries do not know.
//
// IDEMPOTENT BY CONSTRUCTION: every apply block is `SET n:Label` or `MERGE (a)-[:REL]->(b)`, both of
// which are no-ops on a second run, and every probe counts only what is still PENDING. The runner
// re-runs each probe after applying and fails the run if any probe does not settle at 0. There is no
// DELETE, no REMOVE, and no property overwrite anywhere in this file.
//
// BASELINE MEASURED 2026-08-01 (read-only): 3,431 nodes / 13,485 relationships; `db.labels()` carries
// no `World`, no `Archetypal` and no `Gnostic`; no `WORLD_FORM_OF` or `WORLD_ONTOLOGY_OF` exists;
// `c_1_source_artifact_span` is on no node. 14 nodes carry a `Idea/Bimba/World/...` `vault_path`
// (the S-coordinate Forms and two MOC canvases); 6 `:Bimba` C-coordinate nodes carry
// `world_type_path`. The lowercase `gnostic` workspace label exists with 0 nodes.
//
// WHAT THIS MIGRATION DELIBERATELY DOES NOT DO:
//   * It never invents a `WORLD_FORM_OF` parent. The root link is minted only where the node itself
//     names a resolvable `type_coordinate`; everything else is REPORTED for the Architect. On the
//     measured baseline that means steps 2 and 3 mint nothing — the S-coordinate Forms carry no
//     `type_coordinate`, and which C-coordinate each is a form OF is an ontological call, not a
//     derivation.
//   * It never backfills `c_1_source_artifact_span`. Per CCT-17b that pointer is populated by Hen
//     from the artifact's own wikilinks at promotion time; a migration cannot read the vault.
//   * It never assigns the four `Gnostic:*` sub-namespace labels. The live `gnostic_ns` property
//     carries LightRAG storage namespaces, which are not the DR-S5-ONE-1 sub-namespaces; step 5 is
//     probe-only so the Architect can author that map from real values instead of a guess.

// @step: world-label-promotion
// @why: DR-WORLD-1 — vault residency under `/Idea/Bimba/World/` IS the criterion for the namespace,
//       the same criterion Hen's graph promotion applies. `:Archetypal` is the declared alias and is
//       always set together with `:World` so the two can never drift apart.
// @probe
MATCH (n)
WHERE n.vault_path STARTS WITH 'Idea/Bimba/World/'
  AND NOT (n:World AND n:Archetypal)
RETURN count(n) AS pending;
// @apply
MATCH (n)
WHERE n.vault_path STARTS WITH 'Idea/Bimba/World/'
SET n:World:Archetypal;

// @step: world-form-of-root-link
// @why: DR-WORLD-1 psychoid-root link — every `:World` entity carries a typed `WORLD_FORM_OF` back
//       to its primary C-coordinate. Minted ONLY where the node names a `type_coordinate` that
//       resolves to a live `:Bimba` node. No fallback, no inference. Membership is matched on the
//       label OR the residency predicate that step 1 promotes from, so a DRY RUN taken before any
//       apply still measures the real prospective work instead of reporting a hollow 0.
// @probe
MATCH (w)
WHERE (w:World OR w.vault_path STARTS WITH 'Idea/Bimba/World/')
  AND w.type_coordinate IS NOT NULL
MATCH (c:Bimba {coordinate: w.type_coordinate})
WHERE NOT (w)-[:WORLD_FORM_OF]->(c)
RETURN count(*) AS pending;
// @apply
MATCH (w)
WHERE (w:World OR w.vault_path STARTS WITH 'Idea/Bimba/World/')
  AND w.type_coordinate IS NOT NULL
MATCH (c:Bimba {coordinate: w.type_coordinate})
MERGE (w)-[:WORLD_FORM_OF]->(c);

// @step: world-form-of-unresolved-report
// @why: the honest complement of the step above — every World-namespace node whose root link cannot
//       be derived. These are the Architect's decisions, not the migration's. A non-zero count here
//       is EXPECTED on the measured baseline (the S-coordinate Forms carry no `type_coordinate`,
//       and which C-coordinate each is a form OF is an ontological call). The runner prints it and
//       does not gate on it.
// @report
MATCH (w)
WHERE (w:World OR w.vault_path STARTS WITH 'Idea/Bimba/World/')
  AND (w.type_coordinate IS NULL
       OR NOT EXISTS { MATCH (:Bimba {coordinate: w.type_coordinate}) })
RETURN w.coordinate AS coordinate, w.vault_path AS vault_path, w.type_coordinate AS type_coordinate
ORDER BY coordinate;

// @step: world-ontology-of-moc-authority
// @why: DR-WORLD-1 sites `WORLD_ONTOLOGY_OF` at C4 — the Types / MOC authority. A MOC is a `.canvas`
//       artifact under `World/Types/`; it declares the typology its coordinate owns. Same rule as
//       above: minted only where `type_coordinate` resolves.
// @probe
MATCH (w)
WHERE (w:World OR w.vault_path STARTS WITH 'Idea/Bimba/World/')
  AND w.vault_path ENDS WITH '.canvas'
  AND w.vault_path STARTS WITH 'Idea/Bimba/World/Types/'
  AND w.type_coordinate IS NOT NULL
MATCH (c:Bimba {coordinate: w.type_coordinate})
WHERE NOT (w)-[:WORLD_ONTOLOGY_OF]->(c)
RETURN count(*) AS pending;
// @apply
MATCH (w)
WHERE (w:World OR w.vault_path STARTS WITH 'Idea/Bimba/World/')
  AND w.vault_path ENDS WITH '.canvas'
  AND w.vault_path STARTS WITH 'Idea/Bimba/World/Types/'
  AND w.type_coordinate IS NOT NULL
MATCH (c:Bimba {coordinate: w.type_coordinate})
MERGE (w)-[:WORLD_ONTOLOGY_OF]->(c);

// @step: gnostic-label-promotion
// @why: DR-S5-ONE-1 — the Gnostic pipeline writes every node under its lowercase `GNOSTIC_WORKSPACE`
//       label (default `gnostic`, see `epi_gnostic/config.py`), so the namespace exists in the data
//       but not in the schema. This promotes the canonical `:Gnostic` label onto exactly those nodes.
//       Additive only: the lowercase workspace label is left in place, because the Python storage
//       adapter still MERGEs and indexes on it.
// @probe
MATCH (n:gnostic)
WHERE NOT n:Gnostic
RETURN count(n) AS pending;
// @apply
MATCH (n:gnostic)
SET n:Gnostic;

// @step: gnostic-subnamespace-inventory
// @why: DR-S5-ONE-1 declares four sub-namespaces (`Gnostic:Corpus`, `Gnostic:Notebook`,
//       `Gnostic:Etymology`, `Gnostic:Skills`). The live discriminator is `gnostic_ns`, which today
//       carries LightRAG STORAGE namespaces — a different axis. Assigning the four labels from those
//       values would be an invention, so this step only inventories what is actually there. The
//       Architect authors the map; a follow-up migration applies it.
// @report
MATCH (n)
WHERE n:Gnostic OR n:gnostic
RETURN n.gnostic_ns AS gnostic_ns, count(n) AS nodes
ORDER BY nodes DESC;
