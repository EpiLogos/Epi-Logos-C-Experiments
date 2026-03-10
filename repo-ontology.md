# Repo Ontology

This document is the root architectural authority for how the repository's implementation roots and `Idea/` ontology roots relate to each other.

## First Principle

The repository has two different but coupled surfaces:

- Implementation roots such as `epi-lib/`, `epi-cli/`, and `.pi/` hold executable system logic.
- `Idea/` holds the reflective filesystem ontology that the system reads, writes, syncs, and gradually develops.

The goal is not to duplicate the same thing twice. The goal is to give each layer a distinct authority:

- code roots implement behavior
- `Idea/` roots hold structured knowledge, forms, session state, archive, and ontological incubation

## Idea Branch Roles

### `Idea/Bimba/Seeds`

`Seeds` is the versioned planning and specification branch. It holds evolving source documents for architecture, refinements, plans, current-state writeups, and eventually changelog-style continuity material. Seeds are allowed to change over time; they are developmental and discursive.

`Seeds` is where documentation skills, planning flows, and specification work should generally deposit authored design material before it hardens into more canonical forms elsewhere.

### `Idea/Bimba/World`

`World` is the flat library of canonical forms. These are the reusable template or blueprint files that Hen, Templater, and future sync layers can invoke in many situations. The world root is intentionally flat because it behaves like an artifact library rather than a taxonomic tree.

In practice, `World/*.md` holds instantiated synthesis forms such as CT authorities and reusable artifacts like `Daily-Note.md`, `NOW.md`, `Task-Spec.md`, or `Thought.md`. This is the source surface for S2 -> S1 -> S0 epistemic step-down into operational tooling.

### `Idea/Bimba/World/Types`

`World/Types` is not another template folder. It is the incubation mirror for ontology and typology. Its hierarchy must reflect the core coordinate ordering so that vault structure, sync semantics, and Neo4j labels can converge on the same shape.

The current canonical ordering is:

1. `Psychoids/#/#0` through `#/#5`
2. `Coordinates/C` through `Coordinates/M`
3. Each family's direct and inverted sequence, such as `C/C0/C0'` through `C/C5/C5'`
4. Reflective language nested through the `C` inversion ladder:
   - `C0' -> CPF`
   - `C1' -> CT`
   - `C2' -> CFP`
   - `C3' -> CF`
   - `C4' -> CP`
   - `C5' -> CS`

That reflective pairing must be derived from the core C library and schema authorities, not invented ad hoc in filesystem code. `World/Types` therefore acts as the pre-sync ontology mirror that Neo4j label design can follow later.

## Temporal and Runtime Surfaces

### `Idea/Empty/Present`

`Empty/Present` is the temporal working surface for day, session, and now-state material. It is where day folders, session-scoped `now` spaces, and inbox-style user-agent handoff material belong. This is primarily the terrain of Chronos and Anima activity, with Hen defining content shape and Khora supplying session identity and lifecycle commands.

### `Idea/Pratibimba/Self`

`Self` is the reflective runtime surface. It is where self-facing markdown state, bootstrap files, continuations, memory surfaces, and other agent-user reflective materials belong. There should not be a separate `/Agent` root beside it. The self surface already serves that role.

That means bootstrap authorities such as `CONTINUATION.md`, `ANIMA.md`, `PARADIGM.md`, `MEMORY.md`, `NOW.md`, and `TOOLS.md` conceptually belong to `Self`, even when code paths for loading them are implemented elsewhere.

### `Idea/Pratibimba/Self/Thought`

`Thought` is still evolving, but the intended model is Deleuzian: planes of immanence for user-level and agent-level global and local thinking, especially through Psyche, Sophia, and Aletheia flows. It should become the long-horizon surface for classified and routed thought material rather than temporary task scratch.

### `Idea/Pratibimba/Self/Action`

`Action/History` is the archive branch. Session closures, day rotations, and older operational states belong here once they are no longer in the present working surface.

`Action/Work` is the project integration branch. It is the right place for project-scoped notebooks, BKMR integrations, RAG planning surfaces, and persistent or ad hoc source-scoping contexts. In practice this is where Aletheia and S0-era tooling can meet ongoing work.

## System Surface

### `Idea/Pratibimba/System`

`System` is the reflective mirror of deployed or packaged system domains. It can hold mirrors such as `epi-app`, package-image related material, and subsystem-facing structure.

`System/Subsystems` exists for bounded domains of the M' electron app and adjacent system-level surfaces. It is a partitioning root for subsystem-specific reflective material, not a replacement for the executable source trees.

## Authority Rules

1. `epi-lib/` and schema authorities define canonical coordinate and reflective nesting laws.
2. Hen mirrors those laws into vault structure; it does not invent alternate ontologies.
3. `Idea/Bimba/World/*.md` is the flat canonical form library.
4. `Idea/Bimba/World/Types/` is the incubation mirror for ontology and eventual sync labels.
5. `Idea/Pratibimba/Self` is the correct root for bootstrap and self-facing runtime markdown.
6. `Idea/Empty/Present` is the correct root for active day/session/now material.
7. `Idea/Pratibimba/Self/Action/History` is archival authority.
8. `Idea/Pratibimba/Self/Action/Work` is project-scoped work and notebook authority.

## Why This Matters

If these roles stay crisp now, then the system can populate itself in the correct form later:

- documentation skills know where plans versus canonical forms belong
- Hen can resolve template authority without drifting from ontology
- sync to Neo4j can reuse the same label grammar already incubated in `World/Types`
- Khora, Hen, Chronos, Anima, and Aletheia can each operate on the same filesystem without collapsing into one undifferentiated vault
