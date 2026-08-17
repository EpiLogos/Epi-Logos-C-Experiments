# RECON-R1 — Versioned capability-map snapshot

Issue: #3. Parent: #2. Downstream mapping: #4.

This directory is a **versioned evidence-backed map**, not a freeze on Epi-Logos development.

`freeze` in the historical ticket wording means only: *pin the source revisions used for this R1 reading so later cross-mapping can reproduce what was meant at this point in time*. New Epi-Logos, QL/MEF, O:I or provider development is expected to continue and may produce later snapshots.

## Coordinate correction

The live Cycle-3 source corpus establishes the distinction used throughout these artifacts:

```text
M / M'  = Epi-Logos subsystem/domain field
           M0 Anuttara
           M1 Paramasiva
           M2 Parashakti
           M3 Mahamaya
           M4 Nara
           M5 Epii

S / S'  = technical/runtime stack and its conjugate/augmentation laws
           S0 command/kernel materialisation
           S1 vault/Hen
           S2 graph/coordinate/retrieval
           S3 gateway/temporal state
           S4 agent runtime/inhabitation
           S5 world-return/Epii technical return law
```

The original #2/#3/#4 ticket prose used `S0 Anuttara ... S5 Epii`. That naming is retained only as a recorded ticket conflict and should be corrected before R2 work.

## R1 artifacts

- `AUTHORITATIVE-SOURCE-MANIFEST.md` — exact source/tree/blob revisions used for the snapshot.
- `CYCLE3-M-MPRIME-CAPABILITY-MATRIX.md` — six-domain M/M' map and the 36 current M' capability families.
- `S-SPRIME-TECHNICAL-CAPABILITY-MATRIX.md` — S/S' technical/runtime map and authority boundaries.
- `BIMBA-CANONICAL-INVENTORY.md` — Bimba identity, map corpus, schema/material store, mutation, MCP and verification inventory.
- `LEGACY-TECHNOLOGY-LEDGER.md` — provisional disposition of historical/current implementation bodies without treating them as product identity.
- `CAPABILITY-INVENTORY.json` — deterministic machine map for R2: 50 capability records plus technology dispositions and unresolved conflicts.

## Machine-map validation contract

`CAPABILITY-INVENTORY.json` is ordinary JSON with no generated/runtime dependency. A downstream checkout can validate the structural contract with:

```bash
jq -e '
  .schema_version == "recon-r1-capability-inventory/1" and
  .snapshot_not_project_freeze == true and
  .coordinate_law.domain_family == "M/M\u0027" and
  .coordinate_law.technical_family == "S/S\u0027" and
  (.records | length) == 50 and
  all(.records[];
    has("capability_ref") and
    has("subsystem_owner") and
    has("name") and
    has("purpose") and
    has("status_class") and
    has("spec_sources") and
    has("implementation_refs") and
    has("inputs") and
    has("outputs") and
    has("effects") and
    has("source_of_truth") and
    has("write_authority") and
    has("providers_protocols") and
    has("Bimba_relation") and
    has("verification") and
    has("historical_refs") and
    has("open_questions")
  )
' Idea/Bimba/Seeds/Reconstitution/R1/CAPABILITY-INVENTORY.json
```

The connector environment used to author this snapshot could read/write GitHub but did not have a networked local checkout, so R1 does **not** pretend to have re-run the repository's provider-backed Neo4j/MCP/application suites. Existing test/fixture evidence is cited as evidence-at-source; fresh execution belongs to implementation/protocol sessions.

## Acceptance reading

| #3 acceptance item | R1 result |
|---|---|
| authoritative source manifest with exact revisions | satisfied |
| six subsystem domains from current material | satisfied on M/M', with the ticket's S-family naming conflict explicitly corrected |
| planned vs implemented made explicit | satisfied through human matrices + `implementation_state` in machine records |
| deep Cycle-3 M/M' represented | satisfied at six domains × six M' feature families |
| relevant S/S' represented | satisfied as technical/runtime strata, not domain aliases |
| dedicated Bimba authority inventory | satisfied |
| Theia and detritus classified | satisfied; durable behaviours separated from shell/provider identity |
| substantive claims tied to source evidence | satisfied through pinned source registry and human source refs |
| machine-readable inventory | satisfied; 50 records with stable refs and a deterministic `jq` validation contract |
| no migration/refactor in R1 | satisfied |
| unresolved conflicts recorded | satisfied |

## Readiness

**READY FOR CROSS-MAP**, with these non-blocking carried questions:

- normalize raw Anuttara source field names versus S2 display fields without losing provenance;
- produce a deterministic core-65 kernel ↔ broader S2 relation audit when that becomes an implementation concern;
- repair stale moved-fixture paths only in the implementation/testing tranche that owns them;
- verify live provider-backed S4 methods when a later tranche needs them.

None changes the now-established identity/authority distinction required for R2.

## Where the living integration maps belong

R1 evidence remains in the Epi-Logos source repository because it describes that repository at a pinned revision. The **ongoing QL/MEF relation and cross-field maps should be developed in `EpiLogos/QL-MEF`**, where QL/MEF owns the formal/refractive mapping method and can keep developing the Epi-Logos integration without making this R1 snapshot a frozen architecture.

The QL-MEF handoff should preserve one important boundary already stated in its current Wayfinder work: its Meta-Knowledge Graph projection is not automatically the canonical Epi-Logos Bimba Graph; any relation is an explicit bridge/mapping with source, revision, authority and provenance.
