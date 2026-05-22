# M5' Epii Agentic IDE Foundation Research

Status: research draft
Date: 2026-05-22

## Local and External Sources Consulted

Local sources consulted:

- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`
- `docs/specs/M/M5-epii-holographic-integration.md`
- `docs/plans/2026-03-07-m5-epii-design.md`
- `Body/S/S0/epi-lib/include/m5.h`
- `Body/S/S0/epi-lib/src/m5.c`
- `Body/M/epi-tauri/src/domains/M5_Epii/EpiiDashboard.tsx`
- `Body/M/epi-tauri/src/domains/M5_Epii/LibraryFolio.tsx`
- `Body/M/epi-tauri/src/domains/M5_Epii/AtelierExcavator.tsx`
- `Body/M/epi-tauri/src/domains/M5_Epii/EpiiAgent.tsx`
- `Body/M/epi-tauri/src/services/epiiClient.ts`
- `Body/M/epi-tauri/src/services/graphClient.ts`
- `Body/M/epi-tauri/src/services/vaultClient.ts`
- `Body/M/epi-tauri/src/services/agentExecutionClient.ts`
- `Body/M/epi-tauri/src/services/types.ts`
- `Body/S/S5/epii-review-core/src/lib.rs`
- `Body/S/S5/epii-agent-core/src/lib.rs`
- `Body/S/S5/epii-review-core/tests/review_inbox.rs`
- `Body/S/S5/epii-agent-core/tests/agent_access.rs`
- `Body/S/S0/epi-cli/tests/gate_epii_agent_access.rs`
- `Body/S/S3/gateway-contract/src/lib.rs`
- `Body/S/S3/gateway/src/dispatch.rs`

External primary/official sources consulted:

- VS Code Code - OSS repository and wiki: https://github.com/microsoft/vscode and https://github.com/microsoft/vscode/wiki/source-code-organization
- VS Code web extension and virtual workspace docs: https://code.visualstudio.com/api/extension-guides/web-extensions and https://code.visualstudio.com/api/extension-guides/virtual-workspaces
- Monaco Editor repository/docs: https://github.com/microsoft/monaco-editor
- CodeMirror 6 system guide: https://codemirror.net/docs/guide/
- Eclipse Theia architecture, extension, and Theia AI docs: https://theia-ide.org/docs/architecture/, https://theia-ide.org/docs/extensions/, and https://theia-ide.org/docs/theia_ai/
- OpenVSCode Server repository: https://github.com/gitpod-io/openvscode-server

Web access was available. External research was limited to official or primary project sources.

## M5' IDE Operational Surface Summary

M5' is not a generic code editor with an AI chat bolted on. The local M5' spec defines it as the Epii/Anuttara return: an AI-agent-led developer and pedagogical IDE spanning canon, graph, code, agents, review, and Logos-cycle archaeology. The six required surfaces are Library/Bimba pedagogy, Philosophy/Canon Studio, Backend Studio, Frontend Studio, Agentic Control Room, and Logos Atelier.

The current Tauri implementation is an early three-tab shell:

- `EpiiDashboard.tsx` exposes `Library`, `Atelier`, and `Epii Agent` tabs.
- `LibraryFolio.tsx` calls `epiiClient.library.search` with namespaces `all`, `bimba`, `gnostic`, and `atelier`.
- `AtelierExcavator.tsx` lists words and constellations but does not yet run the full etymology FSM workflow.
- `EpiiAgent.tsx` lists agents, invokes an `agent_turn`, streams `agent:run:<run_id>` events, and can abort a run.

The backend substrate is more developed than the visible UI. The C layer gives M5 a compact container with `M5_Root`, dynamic Anima/Aletheia rosters, a 12-tick Logos FSM, an etymology FSM, paradox/scent state, and a guarded tick-11 Mobius write-back. The S5 Rust layer provides a real review inbox and Epii deposit path: review items persist, human-gated reviews cannot be approved by agents, deposits can create linked autoresearch improvement runs, and gateway methods are already registered for `s5'.review.*`, `s5'.improve.*`, `s5'.epii.*`, `s5.episodic.*`, and `s5'.gnosis.context.retrieve`.

The next practical M5' IDE surface should therefore be a governed workbench, not a full IDE rewrite: a split workspace where file/canon buffers, graph context, agent run evidence, and review/promotion state are visible together. The core user journey is: select a file or graph coordinate, inspect linked Bimba/Gnosis/Atelier context, ask Epii or a bounded agent to propose work, watch the run, inspect artifacts/tests/evidence, submit or resolve review, then promote only through an approved gate.

## Candidate IDE Foundations and Tradeoffs

Recommended near-term foundation: keep the existing Tauri app and add a focused editor/workbench layer, likely CodeMirror for canonical markdown and structured pedagogy first, with Monaco considered for richer code panes once LSP-style needs are concrete.

- CodeMirror 6 is the lightest fit for the current M5' shape. Its official guide describes a modular editor built from packages such as `@codemirror/state` and `@codemirror/view`, with immutable editor state and a functional core. This fits reviewable transactions, diff capture, markdown/canon editing, and pedagogy panels. Tradeoff: it is not a full IDE; file tree, LSP, terminal, tests, SCM, and agent UI must remain Epii-native.
- Monaco is the best fit when M5' needs a VS Code-like code editing pane. Official Monaco docs describe models as file-like content identified by URIs, providers for features such as completion/hover, and the need for proper model URIs for language intelligence. Tradeoff: Monaco does not run VS Code extensions, relies on web workers, is heavier than CodeMirror, and still needs custom file/review/agent integration.
- Code - OSS / VS Code is the richest reference for workbench architecture, extension host isolation, SCM/debug/search, and remote/web split. Microsoft documents a layered modular core, an extension host, and separate workbench/server/code layers. Tradeoff: adopting/forking the full workbench would likely make Epii fit VS Code's product model instead of making graph/review/agent governance first-class. Also distinguish Code - OSS MIT source from Microsoft's VS Code distribution and marketplace/licensed additions.
- OpenVSCode Server is useful as a remote sidecar for browser access to an upstream VS Code workspace. Its repository describes a server on a remote machine accessed through a browser. Tradeoff: it is a heavyweight remote IDE surface, not a local-first pedagogical workbench. It could be launched for code-heavy implementation runs, but should not own M5' graph/review semantics.
- Eclipse Theia is the strongest full custom IDE platform candidate. Theia's architecture uses separate frontend/backend processes communicating over JSON-RPC/WebSockets or REST, and its extension docs distinguish VS Code extensions, Theia extensions, plugins, and headless plugins. Theia AI also provides agents and tool functions for workspace actions. Tradeoff: this is a platform adoption decision, not a lightweight layer. It could make sense if Epii needs a distributable custom IDE product, but it duplicates much of the current Tauri/gateway architecture.

The main architectural implication from the external research is that M5' should treat "IDE foundation" as a layered choice:

- Editor widget: CodeMirror or Monaco.
- Workbench orchestration: current Tauri/React shell plus Epii-native panels.
- File/graph/agent authority: existing Rust gateway, graph/vault clients, S5 review/autoresearch stores.
- Optional remote code surface: OpenVSCode or Theia only as a sidecar or later productization path.

## Graph Namespace/File/Code/Agent Integration Model

The M5' spec's namespace boundary is load-bearing: `bimba`, `gnosis`, `etymology`, and protected `pratibimba` must link without collapsing into one data plane. Current UI types use `gnostic` and `atelier`, so implementation should either normalize to the spec names or introduce an explicit compatibility map:

- `bimba`: canonical coordinate topology and graph law.
- `gnosis`: library/document/chunk knowledge and pedagogical retrieval.
- `etymology`: Atelier words, roots, semantic drift, constellations, and crystallisations.
- `pratibimba`: protected Nara/Graphiti handles, never raw personal body text unless a governed review capability permits it.

M5' should introduce one artifact-reference model across file, graph, code, run, and review surfaces. A practical URI scheme can be:

- `vault://Idea/...` for Obsidian/canon/library markdown.
- `repo://Body/...` for source files under controlled repository roots.
- `graph://bimba/<coordinate>` for canonical graph nodes.
- `gnosis://document/<id>#chunk=<n>` for library retrieval.
- `etymology://word/<id>` and `etymology://constellation/<id>` for Atelier state.
- `pratibimba://episode/<id>` for protected episode handles.
- `run://<run_id>` for agent execution.
- `review://<item_id>` and `improvement://<run_id>` for governance state.

Every editor model, graph selection, agent input, review item, and promotion result should carry these refs plus a `coordinate_context`. This matches existing `ReviewSubmission.coordinate_context`, `DepositArtifact`, `InvocationEnvelope.coordinate`, `InvocationEnvelope.day_now`, and the gateway tests that require session, NOW, Graphiti, Gnosis, and kernel evidence to remain bounded.

The workbench should be four cooperating panes rather than separate apps:

- File/editor pane: vault tree and repo tree, markdown/code buffers, validated frontmatter, generated diffs, no direct canonical writes by agents.
- Graph pane: namespace-aware Bimba/Gnosis/Etymology/Pratibimba context, using `graphClient` for graph operations and gateway retrieval for Gnosis/Graphiti context.
- Agent pane: selected agent, capability envelope, selected artifact refs, VAK/coordinate context, run stream, abort, tool/evidence log.
- Review pane: open/deferred/resolved review items, human-required gates, linked improvement runs, approved promotion target, test evidence, and privacy warnings.

This model also aligns with VS Code virtual workspace guidance: editor and agent code should not assume plain local `file` paths. Even if Tauri can read local files, M5' should route workspace access through a provider that knows namespace, privacy, provenance, and promotion rules.

## Agentic Safety/Review/Promotion Flow

The safe M5' flow should be explicit and testable:

1. The user selects artifact refs and a coordinate context from file/graph/library/Atelier panes.
2. The IDE builds an invocation envelope with real `session_key`, `day_now`, selected refs, coordinate, requested agent, and declared write scope.
3. The agent runs in a bounded environment, preferably an isolated worktree or staged patch space for code, and streams events back to the UI.
4. The run deposits evidence through `s5'.epii.deposit` or `s5'.review.submit`, creating an Epii review item and, for improvement requests, a linked autoresearch run.
5. Review is resolved through `s5'.review.resolve`. Human-required items cannot be approved by an agent; the current review core enforces this.
6. Promotion requires an approved Epii review resolution. Existing gate code already blocks autoresearch promotion without approved review, and non-dry-run promotion remains blocked until compiler mutation is wired.
7. Canon/graph/code changes are promoted with artifact refs, tests, source lineage, run id, review id, and destination.

Privacy and identity boundaries should remain visible in the IDE. Graphiti/Nara state is a protected episodic substrate; Epii can show handles, summaries, readiness, and review requirements, but not raw private journal text or protected identity fields. Kernel/harmonic evidence is advisory evidence for review, not autonomous judgement.

The C-level Mobius write-back is a formal M5 invariant, but production M5' should not interpret that as permission for ordinary unchecked mutation. At the IDE layer, "write-back" means reviewed promotion with a traceable resolution, not silent rewriting of Bimba, Gnosis, code, or personal memory.

## Implementation/Test Implications

Implementation implications:

- Start by adding the missing workbench contract, not by adopting a whole external IDE. The current Tauri shell already has vault, graph, Epii, Atelier, and agent clients; the missing layer is a shared artifact/ref/provenance model and a split-pane workspace.
- Normalize `gnostic`/`atelier` UI namespaces against the M5' spec's `gnosis`/`etymology`, or document a stable mapping before additional API surfaces depend on the older names.
- Extend `EpiiAgent.tsx` so invocation uses real gateway runtime context instead of `session_key: ''` and `day_now: null`.
- Add a review inbox surface to the M5' dashboard. The review core is already production-shaped; hiding it from the UI weakens the agentic safety model.
- Keep direct writes behind promotion APIs. Editor save can exist for human edits, but agent edits should become patches/deposits/review items first.
- If CodeMirror is chosen, model transactions should capture artifact refs and diffs. If Monaco is chosen, model URIs should use the canonical artifact URI scheme so providers and provenance point to the same artifact identity.
- If OpenVSCode or Theia is used later, treat it as a code-heavy sidecar that receives selected workspace roots and returns patch/evidence artifacts into Epii review, not as the owner of M5' governance.

Test implications:

- Follow the existing S5 test style: use real persisted stores and gateway dispatch, not mocked review or improvement objects.
- Add gateway tests proving `s5'.epii.runtime.context` is attached to agent invocations from the UI path.
- Add review tests proving human-required items cannot be approved by agents, and promotion still requires an approved Epii review resolution.
- Add namespace tests proving Bimba/Gnosis/Etymology/Pratibimba results remain distinct even when linked by coordinate or session handles.
- Add UI/integration tests for selecting a file/graph node, invoking an agent with refs, receiving run events, creating a review deposit, and surfacing the review item.
- Add editor tests for path normalization, URI stability, diff generation, frontmatter validation, and refusal to write outside allowed roots.
- Add privacy tests proving Nara/Graphiti protected fields remain handle-only in Epii surfaces.
- Add a regression test for the namespace spelling migration if `gnostic` is mapped to `gnosis` and `atelier` to `etymology`.

No implementation should be considered ready if tests only assert rendered placeholders. The key readiness evidence is a real artifact path, graph/namespace refs, an actual run or persisted deposit, review resolution state, and promotion gating.

## Open Research Questions

- Should M5' choose CodeMirror first for canon/pedagogy and add Monaco only for code panes, or standardize on Monaco now to avoid dual editor models?
- What is the minimum repo file-system API the Tauri backend must expose for source browsing without bypassing review/promotion governance?
- Should agent code edits always use git worktrees, or can a patch-buffer model be enough for early M5'?
- What is the canonical mapping between `gnostic` in current UI types and `gnosis` in M5' spec language?
- What schema should represent `etymology` graph edges so Atelier crystallisations can become reviewable graph proposals?
- How should VAK evaluation and Anima orchestration appear in the UI when the current callable frontend only has generic agent invocation?
- Which LSP features are actually needed for M5' Backend/Frontend Studio: diagnostics only, hover/completion, symbol search, rename, debugger, or terminal?
- How should OpenVSCode/Theia sidecars return artifacts into Epii review without creating a second, competing source of truth?
- What is the exact promotion boundary between human-authored canon saves and agent-proposed canon changes?
- How should C-layer M5 invariants, Rust S5 gateway/review contracts, and Tauri UI state be cross-tested so the IDE proves real end-to-end behavior?
