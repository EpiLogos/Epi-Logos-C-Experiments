# `@pratibimba/pratibimba-layouts`

**Track 05 T2 deliverable** — workspace-layout contributions for the Pratibimba System Theia shell.

## What this extension provides

Two named workspace layouts that the user can toggle between via OmniPanel commands, plus the `PratibimbaLayoutSwitcher` service that performs the transition:

| Layout id | Label | Purpose |
|---|---|---|
| `daily-0-1` | 0/1 Daily Layout | First-mounted lean free-flow workspace: journal, agent check-in, lightweight cymatic placeholder (Track 12), bridge-readiness status. |
| `ide-deep` | Deep IDE Layout | Summoned heavy IDE workbench: M0/M5 chrome, six M-extension slots, two integrated-plugin slots, OmniPanel as canonical `/` command membrane. |

## How it works

Per canon §2-§3 (the Theia-only revision) there is **one Theia process, one renderer**. Layouts are intra-process view changes, not separate apps or webviews. The switcher:

1. Records the active layout as a User-scope Theia preference (`epi-logos.layout.active`).
2. Fires an `onLayoutChange` event with the target descriptor and a `PreservedLayoutState` snapshot.
3. Defers concrete widget materialisation (mount/reveal/focus/hide) to the owning extensions — each subscribes to `onLayoutChange` and decides which of its widgets to expose for the new layout.

The kernel-bridge subscription is **process-scoped**, not layout-scoped. Switching layouts does not open a second bridge subscription (verified at Track 05 T3 against this contract).

## Commands

| Command id | Label |
|---|---|
| `pratibimba.layout.switch-to-daily` | Pratibimba: Return to 0/1 Daily Layout |
| `pratibimba.layout.switch-to-ide-deep` | Pratibimba: Summon Deep IDE Layout |
| `pratibimba.layout.toggle` | Pratibimba: Toggle Workspace Layout |

## Consumed by

- `@pratibimba/omnipanel-shell` — wraps the layout commands as OmniPanel summon actions.
- `@pratibimba/kernel-bridge` (Track 05 T3) — process-scoped DI singleton; layout-mode change drives lite/full subscription mode without resubscribing.
- All six M-extensions (Track 05 T6) — observe layout changes via `onLayoutChange` to decide which widget shape (compact vs full) to surface.
- Integrated plugins 1-2-3 and 4/5/0 (Track 05 T7) — engage only in the deep IDE layout by default.

## Tests

The T2 verification lines this extension addresses:

- "The Theia app launches and mounts the 0/1 daily layout by default" — `PratibimbaLayoutSwitcher.restoreInitialLayout()` defaults to daily-0-1 when no preference exists.
- "Layout switching preserves selected-coordinate state, session key, and bridge connection identity across at least one round-trip" — `PreservedLayoutState` typed contract on `LayoutModeChange` events.

Note: a full Theia-app smoke test that actually mounts both layouts requires the omnipanel-shell + M-extension widgets to register their layout-change subscribers first. T2 lands the layout primitive; T3+ wires concrete widgets to it.
