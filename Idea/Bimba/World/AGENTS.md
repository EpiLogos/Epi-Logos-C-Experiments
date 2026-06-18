# AGENTS.md — World

## Purpose
`Idea/Bimba/World` is the **crystallised ontology surface**: the flat Forms/definitions, the
context-type templates, the system nexus [[World-Ontology]], and the `Types/` MOC/canvas residency
mirror. It is an **upward / crystallisation** tree — its Forms are authored here and promoted into
the graph by Hen, as distinct from `Map/` (the downward reflection of the graph).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[World-Ontology]].

## Ownership
- Flat Forms (`*.md`): crystallised coordinate definitions (`L*`, `P*`, `C0`/`S0`/`T0`/`M0`, …),
  context-type templates (`CT0`–`CT5`), and surface templates (`NOW`, `FLOW`, `Daily-Note`,
  `Pattern-Note`). Forms are flat and unique — no `/Forms/` subfolder.
- [[World-Ontology]] — the system nexus (`c_4_artifact_role: "system-nexus"`); residency law + the
  three-layer model (`World` = crystallised Forms · `Seeds` = specs/source · `World/Types` = pre-sync
  graph-type incubation).
- `Types/` — the ordered ontology mirror: `Coordinates/` (C/P/L/S/T/M families + primes, each with a
  `.canvas` MOC) and `Psychoids/` (`#`, `#0`–`#5`). Pre-graph-sync incubation surface; see `Types/README.md`.
- Does NOT own implementation, specs, or the graph projection — specs live in `Seeds/`, the navigable
  graph reflection in `Map/`, behaviour in the `Body/` roots.

## Local Contracts
- Owning ontology frame + residency law: [[World-Ontology]], [[repo-ontology]]; Types residency rule:
  `Types/README.md`.
- Crystallisation authority: canon Form/Type writes go through Hen
  ([[S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL]]) — SwarmVault never writes here.
- No `CONTRACT.md` / crate — knowledge tree.

## Work Guidance
- Vault writes MUST use coordinate-prefixed `c_n_*` frontmatter; `coordinate` is the one exempt key;
  `c_0_source_coordinates` is always `string[]`. Unknown keys are ERRORS.
- Every Form carries `coordinate` + `c_4_artifact_role` (`form`/`definition`/`system-nexus`/…); the
  role IS the OKF `type` (see root `AGENTS.md` → Child Doc Shape → OKF profile).
- `[[wikilink]]` every coordinate / spec / concept reference by basename (verify the target exists).

## Verification
- Run the `bimba-vault-validate` skill before committing (frontmatter, residency, wikilinks,
  hierarchy placement; `Types/Coordinates/` paths must match the coordinate value).

## Child DOX Index
- (leaf) — flat Forms + `Types/` (Coordinates + Psychoids MOC/canvas surface) have no nested AGENTS.md;
  navigate via [[World-Ontology]] and the family `.canvas` MOCs.
