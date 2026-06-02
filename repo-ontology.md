# Repo Ontology

**See also:** [[CLAUDE.md]] (C architecture), [[AGENTS.md]] (agent dispatch), [[Idea/Bimba/World/World-Ontology.md]] (knowledge nexus)

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

`Thought` is the long-horizon surface for classified thought material. Its ontological model is Deleuzian: T-coordinates name universal planes of immanence, and T'-coordinates name localized instantiated thoughts crystallised from those planes into a specific mind at a specific session moment.

**T / T' coordinate duality:**

- **T-family** (#4, Lemniscate): the six universal planes of immanence — archetypal thinking modes that any mind participates in. T0=Questions, T1=Traces, T2=Challenges, T3=Patterns, T4=Discoveries, T5=Insights. These are not filing categories — they are living dimensions of thought.
- **T'-family** (inverted): localized instantiated thoughts. A T3' artifact is a specific pattern-note arising in a session from the universal T3 plane. T' artifacts are coordinate-linked back to their Bimba T-position via `source_coordinates[]`.

**Three-step thought lifecycle:**

```
In-session (Psyche):
  Agent writes to {NOW}/thinking/    — ephemeral cognitive scratch

Task completion (Sophia):
  Sophia classifies thinking/ content → routes to {NOW}/thoughts/
  Each thought acquires its T'-position (T0'=question, T5'=insight, etc.)

Session end / Night' (Aletheia):
  Aletheia reads thoughts/ → archives to /Pratibimba/Self/Thought/T{n}/
  Filename: T{n}-{YYYYMMDD-HHmmss}.md
  Frontmatter: source_coordinates[] multi-form (links T' artifact to Bimba canonical space)
  Gnosis: thought chunk ingested into family notebook for retrieval
```

The T' archive folders at `Idea/Pratibimba/Self/Thought/T0/` through `T5/` are the global accumulation surface. They grow over time as crystallised evidence of the living planes.

**source_coordinates is multi-form:** Any Pratibimba artifact (thought, task-spec, pattern-note) carries `source_coordinates: string[]` — multiple coordinate references linking the instantiated artifact back to the Bimba canonical space it emerged from. A single T3' pattern-note might carry `["M4-3", "T3", "S1"]` — its M-branch origin, its T-plane position, its S-stack layer. This is the general Pratibimba→Bimba linking principle, not a single-coordinate foreign key.

### `Idea/Pratibimba/Self/Action`

`Action/History` is the archive branch. Session closures, day rotations, and older operational states belong here once they are no longer in the present working surface.

`Action/Work` is the project integration branch. It is the right place for project-scoped notebooks, BKMR integrations, RAG planning surfaces, and persistent or ad hoc source-scoping contexts. In practice this is where Aletheia and S0-era tooling can meet ongoing work.

## System Surface

### `Idea/Pratibimba/System`

`System` is the **architectural / UX design surface** for the user-facing app. It holds `docs/` (ADRs, operator runbooks, dependency model, naming) and `Subsystems/` (M-domain design notes). It is reflective material — design-time discourse — and is **not** an executable source tree.

The executable Theia/Electron application that this design surface describes lives at `Body/M/epi-theia/`. The legacy Tauri shell it superseded is preserved as a migration baseline at `vendor/legacy/epi-tauri/`.

`System/Subsystems` partitions design notes by M-coordinate (Anuttara, Paramasiva, Parashakti, Mahamaya, Nara, epii) for cross-cutting widget / extension specification — paired one-to-one with the `Body/M/epi-theia/extensions/m{0..5}-*` runtime packages.

## Frontmatter Key Law — C-Family as Ontological Default

All vault artifact frontmatter uses the `{family}_{n}_{semantic}` format. The C family is the **ontological default**: most properties describe the *being* of an artifact and map naturally to C-coordinates. The reflective C-inversion ladder gives the position semantics:

| Position | Ontological role | Frontmatter examples |
|---|---|---|
| C0 | Bimba/Ground/Source | `c_0_source_coordinates`, `c_0_provenance_refs` |
| C1 | Form/Definition | `c_1_ct_type`, `c_1_template_name` |
| C2 | Entity/Operation | `c_2_session_id`, `c_2_parent_session_id`, `c_2_uuid` |
| C3 | Process/Canvas | `c_3_ctx_frame`, `c_3_day_id`, `c_3_created_at`, `c_3_updated_at`, `c_3_period_type` |
| C4 | Type/Context | `c_4_artifact_role`, `c_4_invocation_kind`, `c_4_invocation_profile` |
| C5 | Pratibimba/Integration | `c_5_reflection_complete`, `c_5_aletheia_verifies` |

**The rule**: use non-C prefixes only when the property is genuinely domain-specific — it belongs to a specific family's territory, not to the artifact's categorical self-description. Current non-C survivors:
- `t_0_thought_type` — T-bucket position is a T-domain fact (which plane of immanence the thought arose from)
- `m_4_nara_domain` — M4 (Nara) subsystem hook, genuine M4 concern

**Ambiguity is a signal**: when a key could plausibly sit at C0 or C3 (e.g. `day_id` as ground anchor vs. processual container), notice the tension — it reflects real ontological ambiguity in the artifact's nature. Choose the reading that best serves the artifact's function; C3 is correct for temporal stamps (process markers), C0 for sourcing/origin references. The rigidity of the scheme is in the format; the semantics allow honest recognition of relation.

**`coordinate` is the one true exception**: it IS the Bimba ground reference itself, not a property of the artifact. It stands alone without a family prefix.

**`c_0_source_coordinates` is always `string[]`**: the multi-form Pratibimba→Bimba link. Never a scalar. Multiple coordinate refs link an instantiated artifact back to its Bimba canonical space (e.g. `["M4-3", "T3", "S1"]`).

## Wikilink Law

Every artifact produced by an agent or skill MUST use `[[wikilink]]` syntax for all entity references. Use liberally:

- Session IDs: `[[NOW-{c_2_session_id}]]`
- Day paths: `[[{YYYY}/{MM}/W{WW}/{DD}]]`
- Coordinate names: `[[M4-3]]`, `[[C5]]`
- Concept and tool names when first introduced in an artifact
- Any proper noun, named entity, or cross-referenced document

This is not optional formatting — it is what makes the vault a traversable graph rather than flat files. Obsidian's wikilink graph and Neo4j's sync both depend on this density.

**Structural breadcrumbs** (Khora's responsibility):
- On `session_start`: Khora appends `[[NOW-{c_2_session_id}]]` to today's daily-note under `## Sessions`
- Every `now.md` template includes `[[{day_path}]]` (link to parent day folder) and `[[FLOW]]` (link to today's journal) in its header section
- Every CT2+ artifact (task-spec and above) must have at least one `[[]]` backlink to its session or day

**Hen verifies**: `hen_frontmatter_validate` warns if a CT2+ artifact has empty `c_0_source_coordinates` and no wikilinks in body.

## Gateway and Session Architecture

The S3 gateway (`epi-cli/src/gate/`) is the **source of truth for live session state**. The vault is the persistent archive. These are complementary, not redundant:

- Gateway `SessionStore`: tracks active sessions, channel bindings, NOW vault paths, agent identity
- Vault NOW folder: the persistent artifact surface for the session's working output
- The session object carries `vault_now_path` so agents can navigate from gateway session → vault

**Multiple sessions per day, multiple channels per session**: A day folder may contain many NOW subfolders (one per session). Each session can have multiple active channels (WhatsApp, Telegram, Discord, etc.). The gateway `sessions.list` response is the authoritative view of what is currently active.

**Port**: S3 gateway production port is `18794`. No separate test port — tests run against the production gateway. The Electron app OmniPanel connects to `ws://localhost:18794` (configurable via URL field).

**Techne**: Gateway lifecycle management (start/stop/status, session management, logs, debug) belongs to the **Techne** subagent within Pleroma. Techne is the craft-level execution helper — it owns mechanical/operational skills (gateway, tmux, cmux, update, wizard) and will eventually hold skills for skill/extension/plugin/subagent development. Chronos owns temporal scheduling semantics and calls Techne's gateway primitives to execute.

## Authority Rules

1. `epi-lib/` and schema authorities define canonical coordinate and reflective nesting laws.
2. Hen mirrors those laws into vault structure; it does not invent alternate ontologies.
3. `Idea/Bimba/World/*.md` is the flat canonical form library.
4. `Idea/Bimba/World/Types/` is the incubation mirror for ontology and eventual sync labels.
5. `Idea/Pratibimba/Self` is the correct root for bootstrap and self-facing runtime markdown.
6. `Idea/Empty/Present` is the correct root for active day/session/now material.
7. `Idea/Pratibimba/Self/Action/History` is archival authority.
8. `Idea/Pratibimba/Self/Action/Work` is project-scoped work and notebook authority.
9. C-family is the ontological default for frontmatter keys. Use non-C prefixes only for genuinely domain-specific properties (see Frontmatter Key Law above).
10. `[[wikilink]]` syntax is mandatory for all entity references in agent-produced artifacts (see Wikilink Law above).
11. `c_0_source_coordinates` is always `string[]` — multi-form Pratibimba→Bimba link, never a scalar.
12. Gateway `SessionStore` is the source of truth for live session state; vault is the persistent archive.
13. S3 gateway production port: `18794`. Techne owns gateway lifecycle; Chronos owns temporal scheduling semantics.

## Why This Matters

If these roles stay crisp now, then the system can populate itself in the correct form later:

- documentation skills know where plans versus canonical forms belong
- Hen can resolve template authority without drifting from ontology
- sync to Neo4j can reuse the same label grammar already incubated in `World/Types`
- Khora, Hen, Chronos, Anima, and Aletheia can each operate on the same filesystem without collapsing into one undifferentiated vault
