# IDE And Agent-Harness Reference Research

## Research Question

The useful question is not which existing product Pratibimba should resemble visually. It is which interaction patterns repeatedly make complex technical work legible: stable spatial roles, one active context, inspectable agent action, explicit change review, persistent sessions, and clear runtime health.

The images in `images/references/` are design evidence, not a request to copy another product's trade dress.

## Classical IDE Geometry

### Visual Studio Code

The [VS Code workbench](https://code.visualstudio.com/docs/editing/userinterface) uses a stable grammar:

- Activity Bar selects a major tool domain.
- Primary Side Bar provides the current domain's explorer.
- Editor Groups hold the work objects.
- Secondary Side Bar can keep a second context, such as chat, visible.
- Panel holds terminal, output, problems, and other transient operational views.
- Status Bar provides compact workspace and runtime state.
- Command Palette gives keyboard-first access without making every command permanent chrome.

Its [source-control experience](https://code.visualstudio.com/docs/sourcecontrol/overview) places changed files in a compact list and opens a real diff in the editor. This makes review part of the same workbench rather than a detached report.

Relevant captures: `01-vscode-basic-layout.png`, `06-vscode-command-palette.png`, `07-vscode-side-by-side.png`, `08-vscode-tabs-editor-groups.png`, and `09` through `11` for source control and review.

![[images/references/01-vscode-basic-layout.png]]

### JetBrains IDEs

The [Project tool window](https://www.jetbrains.com/help/idea/project-tool-window.html) is a durable hierarchical context beside the editor. It can change presentation without changing its spatial role. [Search Everywhere](https://www.jetbrains.com/help/idea/searching-everywhere.html?keymap=visual_studio) acts as a universal jump surface, while the [Differences viewer](https://www.jetbrains.com/help/idea/differences-viewer.html) treats comparison and selective application as first-class editor work.

Relevant captures: `04-jetbrains-project-tool-window.png` and `05-jetbrains-project-preview.png`.

![[images/references/04-jetbrains-project-tool-window.png]]

### Lessons For [[M']]

1. Spatial roles should remain stable while content changes.
2. A workspace tree and command search are complementary, not competing navigation systems.
3. Documents, graphs, diffs, and visual instruments belong in editor groups; services and diagnostics do not.
4. Terminal, output, problems, and evidence are operational panels, not primary tabs.
5. Status should be terse until the user asks for detail.

## Agentic Harness Patterns

### OpenAI Codex App

The [Codex app](https://openai.com/index/introducing-the-codex-app/) frames agent work as a command centre for parallel, long-running tasks. It foregrounds task isolation, progress, review, skills, automations, and permissions. The transferable lesson is that an agent is not merely a chat pane: it has a task identity, context, execution history, outputs, and a review boundary.

Relevant capture: `02-openai-codex-app.jpg`.

### Claude Code

The [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code/cli-usage) makes session continuation, permission modes, allowed tools, and verbose tool output explicit. The transferable lesson is continuity plus graduated disclosure: the main exchange remains conversational, while tool detail and authority are inspectable when needed.

### Hermes Agent

The [Hermes desktop app](https://hermes-agent.nousresearch.com/docs/user-guide/desktop) uses a chat-first centre, a left navigation rail, a right preview/context rail, management panes, a status bar, and a command palette. It also starts and manages its own local backend rather than asking the user to infer missing infrastructure. Hermes documents [session continuity](https://hermes-agent.nousresearch.com/docs/user-guide/sessions/) across CLI, TUI, and desktop, and its [security model](https://hermes-agent.nousresearch.com/docs/user-guide/security/) exposes dangerous-command choices such as allow once, allow for session, always allow, or deny.

Relevant capture: `03-hermes-desktop-docs.jpg`.

![[images/references/03-hermes-desktop-docs.jpg]]

### Cursor

Cursor distinguishes [Agent, Ask, and Manual modes](https://docs.cursor.com/agent), making operational authority legible before execution. Its [review flow](https://docs.cursor.com/en/agent/review) treats file-by-file changes, diffs, and selective acceptance as part of the agent loop.

Relevant capture: `12-cursor-agent-homepage.png`.

![[images/references/12-cursor-agent-homepage.png]]

### Lessons For [[M5']]

1. Every run needs a clear task, mode, selected context, authority, status, and lineage.
2. Conversation should remain beside the active work object, not inside a collapsed service drawer.
3. Tool events should be collapsible and inspectable, with approvals at the point of risk.
4. Changed files, diffs, tests, evidence, and review decisions should form one continuous path.
5. Sessions must resume into the same context, layout, artifacts, and pending decisions.
6. Runtime health must distinguish product startup from a test harness that happens to launch dependencies.

## What Pratibimba Should Not Copy

- It should not reduce [[M0']]-[[M4']] to a conventional file-only IDE.
- It should not turn the coordinate system into decorative breadcrumbs.
- It should not hide privacy, evidence, or promotion governance behind generic AI sparkle.
- It should not make chat the sole surface; visual instruments, canon editing, graph work, and lived continuity remain real work objects.
- It should not imitate another product's colour, typography, branding, or exact component arrangement.

The target is a classical workbench grammar carrying a distinct coordinate-native system.
