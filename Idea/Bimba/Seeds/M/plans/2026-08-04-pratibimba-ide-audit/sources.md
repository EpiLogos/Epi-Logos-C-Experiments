# Sources And Image Provenance

Access date for all external sources: 2026-08-04.

## Current Product Captures

All files under `images/current/` are original 1280x800 captures made during this audit from the local `Body/M/pratibimba-app` renderer.

| File | State |
|---|---|
| `01-personal-daily-disconnected.jpg` | Personal face, daily layout, gateway unavailable |
| `02-cosmic-daily-disconnected.jpg` | Cosmic face, daily layout, gateway unavailable |
| `03-personal-daily-live-gateway.jpg` | Personal face, daily layout, real gateway connected |
| `04-cosmic-daily-live-gateway.jpg` | Cosmic face, daily layout, real gateway connected |
| `05-cosmic-deep-live-gateway.jpg` | Cosmic face, deep layout, real gateway connected |
| `06-personal-deep-live-gateway.jpg` | Personal face, deep layout, real gateway connected |
| `07-m5-subsystem-ground.jpg` | [[M5']] subsystem Ground surface |
| `08-m5-agentic-control-room.jpg` | [[M5']] Agentic Control Room |

The real gateway was started from the repository shared Cargo pool for the live captures. These images are internal project evidence.

## Reference Images

Reference images are retained only for internal design analysis and provenance. They do not grant permission to reproduce another product's protected branding or trade dress.

| File | Source | Evidence use |
|---|---|---|
| `01-vscode-basic-layout.png` | [VS Code User Interface](https://code.visualstudio.com/docs/editing/userinterface) | Stable Activity Bar, Side Bar, editor, panel, and status geometry |
| `02-openai-codex-app.jpg` | [Introducing the Codex app](https://openai.com/index/introducing-the-codex-app/) | Parallel agent task and review framing |
| `03-hermes-desktop-docs.jpg` | [Hermes Desktop](https://hermes-agent.nousresearch.com/docs/user-guide/desktop) | Chat-first desktop shell, context rail, management panes, backend ownership |
| `04-jetbrains-project-tool-window.png` | [JetBrains Project tool window](https://www.jetbrains.com/help/idea/project-tool-window.html) | Durable project hierarchy beside editor |
| `05-jetbrains-project-preview.png` | [JetBrains Project tool window](https://www.jetbrains.com/help/idea/project-tool-window.html) | Preview/edit relationship from the project explorer |
| `06-vscode-command-palette.png` | [VS Code User Interface](https://code.visualstudio.com/docs/editing/userinterface) | Universal keyboard-first command ingress |
| `07-vscode-side-by-side.png` | [VS Code User Interface](https://code.visualstudio.com/docs/editing/userinterface) | Editor groups and adjacent context |
| `08-vscode-tabs-editor-groups.png` | [VS Code User Interface](https://code.visualstudio.com/docs/editing/userinterface) | Documents inside stable editor regions |
| `09-vscode-source-control-overview.png` | [VS Code Source Control](https://code.visualstudio.com/docs/sourcecontrol/overview) | Compact change list and source-control workflow |
| `10-vscode-diff.png` | [VS Code Source Control](https://code.visualstudio.com/docs/sourcecontrol/overview) | Diff as an editor work object |
| `11-vscode-code-review.png` | [VS Code Source Control](https://code.visualstudio.com/docs/sourcecontrol/overview) | Review actions adjacent to changed content |
| `12-cursor-agent-homepage.png` | [Cursor Agent](https://docs.cursor.com/agent) | Agent mode and review-oriented editor composition |

## Additional Product Documentation

- [JetBrains Differences viewer](https://www.jetbrains.com/help/idea/differences-viewer.html) - comparison, navigation, and selective application.
- [JetBrains Search Everywhere](https://www.jetbrains.com/help/idea/searching-everywhere.html?keymap=visual_studio) - universal navigation and action search.
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code/cli-usage) - session continuation, permission modes, allowed tools, and verbose output.
- [Hermes sessions](https://hermes-agent.nousresearch.com/docs/user-guide/sessions/) - continuity across desktop, TUI, and CLI.
- [Hermes security](https://hermes-agent.nousresearch.com/docs/user-guide/security/) - once/session/always/deny approval model.
- [Hermes CLI](https://hermes-agent.nousresearch.com/docs/user-guide/cli) - shared commands and state across carriers.
- [Cursor review](https://docs.cursor.com/en/agent/review) - file-level changes, diffs, and selective acceptance.

## Testing And Observability References

- [Playwright Best Practices](https://playwright.dev/docs/best-practices) - test isolation and preference for user-facing locators and explicit contracts.
- [Playwright Locators](https://playwright.dev/docs/locators) - locating elements as a user perceives them, with test IDs retained as explicit technical contracts where appropriate.
- [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html) - different test granularities, acceptance tests, avoiding redundant high-level tests, and retaining exploratory/usability review.
- [cargo-mutants](https://github.com/sourcefrog/cargo-mutants) - mutation testing that distinguishes code execution from tests that actually detect behavioral changes.
- [Proptest reference](https://docs.rs/proptest/latest/proptest/) - property-based strategies and shrinking for Rust owner-law invariants.
- [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/) - cross-process trace identity, spans, context propagation, events, links, and status.
- [OpenTelemetry observability primer](https://opentelemetry.io/docs/concepts/observability-primer/) - end-to-end request paths through distributed systems and the role of instrumentation.
- [Vitest mocking guide](https://main.vitest.dev/guide/mocking) - legitimate test-double mechanisms and mock-state isolation; mocks remain bounded by the claim they can observe.
