# Pratibimba IDE Audit

Date: 2026-08-04
Status: evidence-backed audit; Phase A runtime truth and Phase B workbench foundation landed
Carrier audited: `Body/M/pratibimba-app/`

## Executive Verdict

The current carrier contains many real components and a substantial test corpus, but it does not yet compose them into the product specified by [[M'-SYSTEM-SPEC]]. It behaves as a catalogue of panes, tabs, readiness disclosures, and coordinate fragments. It does not behave as a coherent IDE or as a clear agentic harness.

The failure is primarily architectural, not cosmetic:

1. The coordinate system has been translated into surface inventory rather than interaction architecture.
2. The 0/1 parent shell, `/` operator membrane, and [[M0']]-[[M5']] depth layer are present as labels and layout variants, but not as a legible hierarchy of work.
3. The deep layout is another tab collection. It does not provide the stable explorer/editor/agent/terminal/diff geometry expected of an IDE.
4. [[M5']] is specified as a conversational agent-led developer and pedagogical IDE, but its visible control-room and subsystem entry surfaces are dominated by explanatory prose and internal implementation identifiers.
5. The original native-startup receipt was not organism-safe: a stale `epiBin` configuration prevented gateway launch while the then-current native boot test still passed. Phase A now repairs and validates binary resolution, gates native reveal on supervisor/handshake/profile/vault truth, and has passed a fresh real-[[Tauri]] stale-config boot run. The historical receipt remains invalid evidence.
6. The app supervises only the gateway and vault watcher. Redis, Neo4j, Graphiti, SpaceTimeDB, and agent execution readiness are not represented as one owned startup dependency graph.

This is recoverable. The carrier already has useful production pieces: real gateway/profile transport, command registry, persisted layouts, CodeMirror and Tiptap editors, vault access, sessions, chat, graph consumers, oracle deposition, provenance stores, and a large behavioral test base. The redesign should preserve those bodies while replacing the shell grammar that currently scatters them.

## Audit Set

- [[01-canonical-intent]] - what the system is canonically trying to be.
- [[02-current-ui-audit]] - shell, navigation, workflow, and visual findings.
- [[03-runtime-startup-audit]] - native boot, gateway, services, and test gaps.
- [[04-reference-research]] - IDE and agent-harness reference patterns.
- [[05-coordinate-gap-matrix]] - requirement-by-requirement gap table.
- [[06-redesign-brief]] - proposed product architecture and staged delivery.
- [[07-cycle3-inheritance-contract]] - binding preservation and anti-rerun contract for all Cycle 3 work.
- [[08-new-plan-handoff]] - concise instructions for the parallel implementation-planning session.
- [[09-testing-truth-audit]] - why the large suite and real E2E gates still certified the wrong product.
- [[10-full-system-verification-architecture]] - the canonical claim/proof lattice across [[S]], [[S']], and [[M']].
- [[11-test-suite-migration-plan]] - staged suite and harness remediation without another indiscriminate rerun.
- [[12-testing-plan-handoff]] - binding verification instructions for the parallel planning session.
- [[13-phase-a-b-foundation-receipt]] - implemented startup/workbench scope, real receipts, and remaining Phase B/C boundary.
- [[data/README]] - machine-readable 656-task and 55-track traceability snapshots.
- [[sources]] - source URLs and image provenance.
- [[captures/runtime-evidence]] - observed commands and outcomes.
- [[captures/testing-evidence]] - suite counts, task-proof extraction, gate boundaries, and concurrent-source caveats.

## Evidence Folders

- `images/current/` - eight 1280x800 captures of the current renderer with disconnected and live gateway states.
- `images/references/` - official IDE and agent-product reference material retained for internal design research.
- `captures/` - textual runtime receipts and audit notes.
- `data/` - the full 656-task evidence join and 55-track inheritance register for Cycle 3.

## Immediate Product Priorities

1. Extend the landed native startup profile from gateway/vault truth to the required/optional organism service graph.
2. Continue migrating the retained pane catalogue into the landed stable IDE geometry.
3. Make [[M5']] a real agent workbench: conversation, context, tool stream, terminal, changes, diff, and review.
4. Deepen the landed [[M0']]-[[M5']] workspace presets around distinct primary work objects.
5. Move readiness detail out of primary work surfaces into a dedicated organism-health panel.
6. Replace generic-gate closure with a canonical claim registry, task-specific proof, typed environments, and complete native/user/governance workflows.
7. Require every new tranche to declare its inherited Cycle 3 tasks, existing bodies, proof, disposition, and IDE destination.

## Audit Boundary

This audit does not settle unresolved ontology or invent missing [[S]]/[[S']] services. It distinguishes three classes explicitly:

- **Carrier composition defect** - the backend or component exists, but the app presents it incoherently.
- **Runtime integration defect** - the service exists, but startup, transport, or readiness does not make it product-live.
- **Substrate gap** - the required method, projection, agent route, or governed write path does not yet exist.

That distinction is essential. The redesign must not hide substrate gaps with renderer prose, fixtures, local tables, or ornamental pending states.
