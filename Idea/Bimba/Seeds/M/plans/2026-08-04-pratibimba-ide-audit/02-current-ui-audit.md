# Current UI Audit

## Audit Method

The carrier was inspected in source and driven at 1280x800 in Chromium in two states:

1. renderer running with no gateway;
2. renderer connected to the real `target/debug/epi` gateway on port 18794.

The audit exercised both faces, both layout modes, the [[M5']] subsystem entry, and the [[M5']] Agentic Control Room. Captures are in `images/current/`.

## Surface Inventory

| Layout cell | Default mounted navigation |
|---|---|
| Daily personal left | 9 tabs: Vault, Journal, Calendar, Oracle, Session close, Anchor, Fretboard, Personal, Coordinates. |
| Daily personal main | 10 tabs: Now, M1 Deep, Arena, CU Ledger, Autoresearch, Medicine, Transform, Coordinate, Logos, Kairos setup. |
| Daily cosmic main | 13 tabs: Cosmic Engine, Spanda, Walk, Bimba, Bases, Correspondence, Klein, Played Torus, M1 Surface, Pentadic, M3 Inspectors, M5 EBM, Axiom. |
| Deep shared left | Vault, Connections, Coordinates. |
| Deep cosmic main | 12 structural/instrument tabs. |
| Deep personal main | 9 governance/personal tabs. |
| OmniPanel | 10 vertical folds on both faces: Pi, Sessions, Dispatch, Tools, Evidence, Review, Gateway, Diagnostics, Tuning, Settings. |

Authority: `App.tsx:210-380`, `deepPaneSet.ts:142-340`, and `omnipanelRuntime.ts:67-151`.

The raw count is not the defect by itself. The defect is that almost every domain concept is promoted to peer navigation. There is no stable hierarchy distinguishing workspace, document, tool, inspector, task, and service.

## Captured Findings

### Daily personal, disconnected

![[images/current/01-personal-daily-disconnected.jpg]]

The first screen is a wall of vertical and horizontal tabs surrounding readiness prose. The central task is unclear. The strongest action is a centered empty-state card, while internal states such as `pending-codon-rotation-projection`, `Wave A blocked`, and gateway diagnostics compete with the user's daily work.

### Daily cosmic, live gateway

![[images/current/04-cosmic-daily-live-gateway.jpg]]

The live cosmic instrument is the strongest existing composition. It demonstrates that the profile bus and visual engine can produce a real experience. It is still framed by thirteen peer tabs, ten vertical membrane tabs, multiple technical strips, and overlapping summary chrome. The canvas gets the centre, but not a legible workflow.

### Deep personal

![[images/current/06-personal-deep-live-gateway.jpg]]

`ide-deep` opens on an empty Canon Update ledger. The screen does not expose a file editor, terminal, agent conversation, change set, diff, or task context. It is a different tab list, not a different work mode.

### [[M5']] Subsystem Ground

![[images/current/07-m5-subsystem-ground.jpg]]

The subsystem page begins with internal component ids, tranche references, implementation evidence sentences, and a named-unbuilt paragraph. This is development ledger content presented as product UI. It directly contradicts the canonical conversational/operational default.

### Agentic Control Room

![[images/current/08-m5-agentic-control-room.jpg]]

The Control Room renders a dispatch roster, capability count, run-tree text, source paths, and long explanatory paragraphs. It lacks the interaction grammar of an agent harness: no task composer, inspectable selected run, collapsible tool stream, active context set, approval queue, file changes, diff, or review action.

## Severity Findings

### P0 - The Shell Does Not Establish An IDE

The deep layout does not provide the classical stable geometry of a workbench:

- no visible activity bar or primary tool selector;
- no persistent project/coordinate explorer paired with an active editor;
- no interactive terminal or PTY;
- no source-control/change list;
- no first-class diff/review editor;
- no adjacent agent/task surface;
- no bottom output/problems/terminal panel.

The carrier has a CodeMirror editor and many backend-aware panes, but users must discover them through a catalogue of tabs and commands. A component inventory is not an IDE composition.

### P0 - [[M5']] Is Not The Agent-Led IDE Specified By Canon

[[M5'-SPEC]] (lines 71-81) says the default should be conversational engagement. The current [[M5']] ground and Control Room are explanatory readouts. The Pi chat exists inside the collapsed right membrane, but it is spatially and conceptually detached from files, edits, run state, and review.

There is no complete visible loop:

`intent -> selected context -> agent run -> tool activity -> changed files -> diff -> tests/evidence -> human decision -> deposit/promotion`.

### P0 - The Coordinate System Is Surface Taxonomy, Not Workflow Architecture

Coordinates appear in labels, badges, tab names, rails, and subsystem strata, yet the user cannot reliably answer:

- What am I working on?
- Which coordinate owns it?
- Which files, graph nodes, sessions, and evidence are in context?
- Which agent is acting, with what authority?
- What changed?
- What must I decide next?

The coordinate should be a persistent context spine and navigation model. It should not require one visible peer surface for every coordinate concept.

### P1 - Navigation Is Flat And Fragmented

- Daily cosmic has 13 main tabs and no primary sidebar.
- Daily personal has 19 left/main tabs before the 10 Omni folds.
- Deep mode preserves the same tab-first grammar.
- Six subsystem pages are command-opened dynamic tabs, not first-class workspaces in a visible navigation tree.
- The OmniPanel has no direct route to those six pages.
- Five activity-bar modes exist in stores and command registration, but there is no rendered activity bar. The walkthrough explicitly falls back to a centred card because the control has no carrier equivalent (`walkthrough.ts:25-32`).

### P1 - Product UI Exposes Implementation Ledger Language

Visible surfaces contain:

- internal component ids such as `canonUpdateLedger` and `m5Ebm`;
- tranche ids and decision-register references;
- source file paths and missing-producer explanations;
- raw readiness ids;
- implementation-status prose.

This information belongs in diagnostics, evidence, tooltips, or developer inspection. It should not be the primary body of Home, subsystem Ground, or Control Room.

### P1 - Readiness Debt Dominates Work

The carrier's honesty discipline is valuable, but it has been applied as pervasive prose. Pending states occupy primary canvas space even when there is no user action available. The result is an app that continually explains why it is not an app.

Readiness should use four levels:

1. concise status in chrome;
2. local inline state at the unavailable control;
3. actionable organism-health detail in one panel;
4. technical evidence only on demand.

### P1 - Visual Hierarchy And Legibility Are Weak

- The base palette is dominated by dark violet, raised violet, violet accent, and violet hairlines (`styles.css:1-15`).
- Most semantic colour exists as tiny badges; the overall field remains one-note.
- Vertical text tabs on both sides are slow to scan and truncate easily.
- Dense 0.66-0.85rem type is used for both important work and incidental diagnostics.
- Several panes use long full-width prose at editor density without editorial hierarchy.
- The bottom status region can expand into multi-line pending explanations, consuming workspace height.
- Cosmic overlays and summary cards compete with the central canvas.

### P1 - Central Composition Has Become Difficult To Govern

`App.tsx` is 2,095 lines and directly imports/displays almost every pane through one switch. `styles.css` is 9,466 lines. `SubsystemWorkspacePane.tsx` maintains a second renderer table for gathered surfaces. This makes local correctness possible while overall composition drifts.

The four live FlexLayout models are walked and republished during render (`App.tsx:1940-1968`). Both faces remain mounted (`App.tsx:1994-2035`). Those choices preserve state, but they also create hidden-face mounting hazards documented inside `deepPaneSet.ts`. The shell is carrying product orchestration, route registry, pane factory, test instrumentation, persistence, and state coordination in one body.

### P2 - Tests Prove Presence Better Than Usefulness

The repository has extensive behavioral coverage, including real-gateway browser tests. It proves many important facts: panes mount, commands route, profile generations advance, state persists, vault bytes round-trip, and privacy boundaries reject unsafe shapes.

It does not adequately prove:

- a user can understand the first screen;
- a new task can move from prompt to reviewed change;
- [[M0']]-[[M5']] feel like coherent workspaces;
- keyboard and pointer navigation remain usable under real content volume;
- an unavailable substrate produces one clear recovery path;
- the native app, rather than the harness, owns the complete runtime path.

The activity-bar suite, for example, tests command state and shell attributes without a visible activity-bar control.

## Functional Assets To Preserve

The redesign should retain and recompose these bodies:

- real gateway client and profile stream;
- four persisted face/layout models as migration input;
- command registry and palette;
- CodeMirror Canon Studio editor;
- Tiptap NOW editor;
- vault tree and governed write boundary;
- sessions and chat clients;
- Bimba graph and coordinate navigation;
- Cosmic Engine and profile-driven visual/audio components;
- oracle cast/deposit path;
- provenance, readiness, and cross-layout intent types;
- real-gateway and real-filesystem test harnesses.

The redesign is not a request to discard the system. It is a request to stop presenting its parts as peers.

## Current-State Scorecard

| Dimension | Score | Verdict |
|---|---:|---|
| Canonical hierarchy | 2/10 | Labels exist; experience collapses layers. |
| Classical IDE utility | 2/10 | Editor exists; workbench geometry does not. |
| Agent harness utility | 3/10 | Chat/run data exist; end-to-end supervision loop does not. |
| Runtime transparency | 6/10 | Honest statuses exist; they are fragmented and too prominent. |
| Coordinate legibility | 4/10 | Coordinate data is visible; ownership and next action are unclear. |
| Visual hierarchy | 3/10 | Strong cosmic asset; weak shell and text hierarchy. |
| Functional substrate reuse | 7/10 | Many real components and typed bridges are available. |
| Production startup | 2/10 | Native gateway startup currently fails while boot receipt passes. |

Overall product verdict: **major recomposition required; preserve substrate, replace shell architecture**.
