---
coordinate: "M'"
status: "active-spec"
updated: "2026-05-19"
depends_on:
  - "[[M-SYSTEM-INDEX]]"
  - "[[M-M-prime-coordinate-mapping-inaugural]]"
  - "[[S0-SPEC]]"
  - "[[S3-SPEC]]"
  - "[[S4-SPEC]]"
  - "[[S5-SPEC]]"
---

# [[M']] Portal Spec

The [[M']] portal is the shared experiential surface for the [[TUI]] and the desktop app. It is not a separate product ontology. It is the [[Pratibimba]] expression of the [[M]] coordinate map, backed by the same [[S]] / [[S']] services, gateway methods, session runtime, and temporal projection.

The portal grammar is:

| Surface | Register | Coordinate function | Runtime role |
|---|---|---|---|
| `0` | structural ground/map | [[M0']] with access into [[M1']] / [[M2']] / [[M3']] | [[Bimba]] map explorer, coordinate graph, structural navigation, clock entry |
| `/` | command return | [[S0']] over [[S0]]-[[S5]] | [[OmniPanel]] / command centre, gateway sessions, chat, skills, models, config, logs, readiness |
| `1` | personal/world return | [[M4']] / [[M5']] | [[Nara]], [[Epii]], journal, review inbox, autoresearch, user/developer position |

The full [[M']] set must remain visible behind this shorthand:

| Coordinate | Desktop domain | Portal role |
|---|---|---|
| [[M0']] | structural [[Bimba]] map | coordinate ground, graph explorer, source traceability, map-to-action routing |
| [[M1']] | relational/topological movement | pathing, torus/walk logic, relation inspection, coordinate traversal |
| [[M2']] | symbolic/semantic matrix | MEF lenses, harmonic correspondences, semantic/astrological field relations |
| [[M3']] | integrated clock platform | solar-system/kairos clock, temporal visualisation, Nara walkabout routing |
| [[M4']] | [[Nara]] lived interface | journal/flow, daily note, dream journal, oracle, highlights, personal [[Pratibimba]] continuity |
| [[M5']] | [[Epii]] integrative interface | pedagogy, etymological archaeology, [[Bimba]] wisdom exploration, autoresearch, review inbox, VAK/agentic execution |

The build-facing domain requirements live in [[M0'-SPEC]], [[M1'-SPEC]], [[M2'-SPEC]], [[M3'-SPEC]], [[M4'-SPEC]], and [[M5'-SPEC]]. Portal work should use those files for per-domain surface, backend contract, privacy, readiness, and visual/audio criteria, then use this file for the shared `0` / `/` / `1` portal grammar.

The split should be read carefully. In the broad TUI shorthand, `0` can stand for the M0'-M3' structural side. In the desktop app, `0` should be the structural map/ground entry rather than the clock alone. The clock belongs most precisely to [[M3']] as the symbolic temporal visualisation; it should be available from the `0` side, but the `0` surface itself is the Bimba map explorer and coordinate-ground orientation.

This resolves the apparent 0/1 bifurcation:

- `0` holds the map/ground return and can route into the structural 1-2-3 processes.
- [[M1']] / [[M2']] / [[M3']] express the structural movement, vibration, and clock/transcription surfaces.
- [[M4']] / [[M5']] hold the Nara/Epii personal and integrative return.
- `/` is the S0' return through which setup, configuration, command invocation, and agent access become explicit.

## Harmonic / Musical Surface Law

The M' portal must treat the musical instrument as the common rendering substrate for the structural side, clock side, and personal/world return. The same `MathemeHarmonicProfile` should be readable by all M' domains:

- [[M0']] shows the selected coordinate's harmonic profile and pointer-web topology on the Bimba map.
- [[M1']] turns graph traversal into intervallic/topological movement.
- [[M2']] exposes MEF lens anchors, correspondences, elements, and semantic resonance.
- [[M3']] renders the epogdoon tick, bimba/pratibimba helix, Kairos, solar/cosmic clock, sonic pulse, and cymatic boundary.
- [[M4']] records journal/DAY/NOW events against the current harmonic context.
- [[M5']] reviews and improves the system using harmonic-profile, graph, session, and evidence deltas.

The portal should not derive this separately per widget. It should consume the shared kernel/pointer profile from S0/S2/S3 contracts, with [[M'-SYSTEM-SPEC]] as the language authority.

The same profile must also expose the diatonic CF/VAK projection. [[M2']] uses it to show modes and correspondences as context-frame rotations; [[M3']] uses it to make the clock's tick audible/visible as CF progression; [[M5']] uses it so VAK/Anima/Epii routing can share the same tonal/context grammar as the instrument. Ionian-through-Locrian mode labels are acceptable UI terms only when backed by the explicit CF anchor they name.

## Shared Runtime Law

The TUI and desktop app must consume the same underlying truths:

- [[S3]] gateway/session records are the live session authority.
- [[Khora]] owns agent-runtime session identity and [[NOW]] write authority.
- [[SpaceTimeDB]] projects safe live gateway, client, agent, session, temporal, and [[Kairos]] surfaces.
- [[Redis]] carries hot S3' temporal/session context.
- [[Graphiti]] carries episodic memory under S3 runtime architecture and S5/S5' use governance.
- [[Epii]] receives review, validation, summarisation, and autoresearch work through its governed inbox.

The portal must distinguish raw service health from agent access. A connected [[Neo4j]], [[Redis]], gateway, or SpaceTimeDB instance does not prove that [[Anima]], [[Nara]], or [[Epii]] has the correct bounded tools, skills, permissions, and session runtime.

## `/` Surface

The `/` surface is the command/config/readiness centre.

In the TUI this is `s0.command`.

In the desktop app this is [[OmniPanel]].

It must preserve the full operator breadth already present in the current Electron implementation:

- gateway overview and connection settings
- chat and live tool/run display
- session list, select, resolve, preview, patch, reset, delete, compact, fork/resume/import when implemented
- skill surfacing, enablement, install, and key management
- model and provider configuration
- cron/automation setup
- channels and external delivery
- logs, debug RPC, health/readiness
- nodes/devices/pairing
- raw config schema editing and apply/update flows

The `/` surface must not fork backend behavior. It dispatches existing CLI commands, gateway RPC methods, or typed service calls. Product-native method names may remain, but each must have coordinate parity against S/S' ownership.

## `0` Surface

The `0` surface is the structural map and orientation field.

Desktop target:

- [[M0']] graph/map explorer as the first structural viewport.
- coordinate graph navigation over canonical M/Bimba nodes, including legacy `#` coordinate compatibility.
- Bimba node inspection, wikilink/source traceability, and path into deeper structural surfaces.
- entry routes into [[M1']] torus/topology, [[M2']] vibrational matrix, and [[M3']] clock/transcription.
- shared temporal projection display where relevant, without making the clock the whole `0` surface.

The desktop `0` side is where the TUI clock specifications become spatial, visual, and explorable. The target is not a small clock widget. It is the structural world platform: [[M0']] map, [[M1']] relation-walks, [[M2']] correspondential matrix, and [[M3']] solar/kairos clock interlaced so the user can move from current temporal condition into coordinate exploration and Nara walkabouts.

TUI target:

- compact structural dashboard(s) over M0'-M3'.
- clock and mini-clock views as structural orientation plugins.
- coordinate catalog and readiness links into `/`.

## `1` Surface

The `1` surface is the personal/world return.

It contains:

- [[M4']] [[Nara]] journal, editor, search, personal context, Kairos, Pratibimba orientation.
- [[M5']] [[Epii]] developer/system return, review inbox, Gnosis observation, autoresearch evidence, and system-building portal.
- shared access to the same session/temporal projection as the clock and `/` surface.
- bounded tools for Graphiti session memory search/deposit and kbase/Gnosis retrieval, with Epii governance.

Nara and Epii do not own raw services. They invoke or observe shared S-layer services through bounded capability envelopes.

### [[M4']] Nara Modality Surface

The current Electron app already contains the correct M4' seed:

- journal/flow editor as the primary lived stream.
- selected-text highlighting with category/sendoff logic.
- Daily Note, Dream Journal, and Oracle tabs as modality-specific views.
- right-rail highlights and pending-action affordances.

Those pieces should be preserved, but deepened. Daily Note, Dream Journal, and Oracle must become real modality surfaces over the same journal/highlight/session substrate, not decorative placeholders. Highlight sendoff should move from raw slash-string dispatch toward typed VAK/Anima/Epii invocation envelopes, while keeping the ergonomic text-selection gesture.

### [[M5']] Epii Surface

The Epii page must be a clean integrative workspace, not a generic file/agent panel. Its core domains are:

- pedagogy and guided Epi-Logos learning.
- etymological archaeology as conversational co-investigation.
- Bimba map and wisdom-packet exploration.
- autoresearch evidence, system self-review, and spec/code improvement loops.
- inbox/review work where Anima/Aletheia outputs become meaningful to the user/developer position.

For etymological archaeology, [[Epii]] must preserve the staged logic from the older canonical plan: conversational word exploration first; QL community crystallisation when a real pattern emerges; backend Bimba resonance detection, MEF lens analysis, and LightRAG/knowledge sedimentation after that. The UI should not prematurely collapse etymological exploration into map lookup.

### Agentic Execution / Inbox

The VAK/Anima/Epi execution page belongs functionally to [[M5']] and operationally to `/`.

It should expose:

- VAK evaluation and coordinate assignment.
- CF routing into Anima/Aletheia execution.
- selected agent/team/chain with bounded tool and skill gates.
- DAY/NOW/session binding and gateway lineage.
- task payload, run tree, tool stream, outputs, diagnostics, and completion evidence.
- inbox deposits requiring Epii/user review, validation, continuation, or rejection.

This must not become a flat "twelve agent cards" dashboard. Aletheia is an Anima mode/activity surface, and Epi-Logos appears as the coherent Epii/Anima invocation grammar rather than twelve unrelated peers.

## Canonical Source Traceability

These older sources are required reading before implementing the M' app surfaces:

- `/Users/admin/Documents/Epi-Logos/docs/prompts/02-agent-bootstrap-vak-integration-review.md` — VAK integration, Anima/Aletheia relationship, Epi-Logos execution surface.
- `/Users/admin/Documents/Epi-Logos/docs/prompts/03-t-coordinate-thoughts-integration.md` — T-coordinate thought lifecycle and Aletheia crystallisation.
- `/Users/admin/Documents/Epi-Logos/docs/prompts/04-epi-claw-cli-harmonization.md` — CLI/vault/Bimba navigation parity.
- `/Users/admin/Documents/Epi-Logos/docs/plans/2026-02-22-nara-fix-critical-issues.md` — Nara editor/highlight/sendoff remediation and existing UX intent.
- `/Users/admin/Documents/Epi-Logos/docs/plans/2026-02-22-ta-onta-first-working-e2e-readiness.prd.json` — Ta Onta/VAK E2E readiness, Anima/Aletheia, Nara live docs, and conformance scenarios.
- `/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/Self/Action/Work/Bimba Map/#5-4.5.md` — Epii etymological archaeology workflow and backend resonance/lens/sedimentation stages.
- `/Users/admin/Documents/Epi-Logos/Idea/Bimba/Map/M0'.md` through `/Users/admin/Documents/Epi-Logos/Idea/Bimba/Map/M5'.md` — older M' coordinate seeds and Bimba map source material.

## Implementation Rule

The TUI and Tauri app should mirror each other at the logical-contract level, not at the widget level. The TUI may be dense and keyboard-native; the desktop app may be visual and spatial. Both must expose the same portal grammar, same gateway/session truth, same command/config registry, and same separation between structural, command, and personal/world return.
