# Chrome Action Surface Policy

This document is the canonical contribution policy for toolbar, context-menu, and inline-button actions in the [[M']] Theia chrome. It closes CC-11 by turning the action-surface distinction from Track 31 into a stable implementation contract for every [[M0']]..[[M5']] extension and integrated plugin that contributes commands to the shell.

These rules are normative. A contribution MUST choose exactly one action surface by the action's scope, target, and persistence. A contribution that cannot satisfy the rule for its chosen surface MUST publish blocked readiness rather than duplicating the action on another surface.

Source plan: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/31-chrome-contributions-catalog.md` section `31.11`; source rows CC-11, Track 15 foundation principles 5 and 6, and tranche `11.10`.

## Rule 1: Toolbar = Persistent Global Action On The Active Widget

Theia's `TabBarToolbarContribution` is the consumption path for widget-global toolbar actions. A toolbar action belongs to the active widget as a whole; it is not bound to a text selection, graph node, review row, or artifact instance.

Required implementation grammar:

- Each toolbar action MUST bind to a registered command.
- Each toolbar action MUST honour a `when`-clause or equivalent enablement predicate for the active widget.
- Each toolbar action MUST render through `TabBarToolbarRegistry.registerItem(...)`.
- Toolbar actions are GLOBAL to the widget and MUST NOT depend on the current selection.

Examples:

- `m4-nara` Day Calendar widget: a "Today" action sits at the right of the TabBar and jumps the active calendar widget to the current day; this is the toolbar form of tranche `25.1`.
- `m5-epii` Review widget: a "Filter by capacity" dropdown scopes the whole Review widget; it is not tied to one selected review row.

## Rule 2: Context-Menu = Selection-Bound Action That Varies By Target

Theia's `MenuModelRegistry` context-menu paths are the consumption path for selection-bound actions. A context-menu action is only available at the selected target's natural menu surface.

Required implementation grammar:

- Each context-menu item MUST register against a context-menu path such as `'navigator-context-menu'`, `'canvas-context-menu'`, or the owning extension's typed context path.
- Each context-menu item MUST honour a `when`-clause or equivalent predicate for selection state and target type.
- Each context-menu item MUST appear ONLY in the selected target's natural menu surface.
- Context-menu items MUST NOT be promoted into toolbar buttons merely because they are frequently used.

Examples:

- `m4-nara` canvas right-click menu from tranche `11.10` offers "Toggle Highlight", "Inscribe Recognition Mark", and "Open in Day Calendar" according to the selected text or node.
- `ide-shell-m0-m5` Coordinate Tree right-click menu offers "Reveal in Bimba Graph", "Open in Canon Studio", and "Deposit Review Evidence" according to the selected coordinate node.

## Rule 3: Inline-Button = Artifact-Level Action Embedded In Content

An inline-button is rendered inside a React widget body when the action operates on a specific artifact instance that is already visible in content. Inline buttons do not occupy Theia shell chrome and do not stand in for selection menus.

Required implementation grammar:

- Each inline-button MUST render within the owning React widget body, never in the toolbar or context-menu.
- Each inline-button MUST dispatch through `commands.executeCommand(...)`.
- Each inline-button MUST remain disabled when the artifact is in a non-actionable state, such as an already-reviewed item.
- Inline buttons MUST be visually and semantically attached to the artifact instance they operate on.

Examples:

- `m4-nara` DayContainer artifact rows host an "Open Canvas" inline-button per artifact, following the artifact-row interaction pattern from tranche `25.2`.
- `m5-epii` Review queue rows host a "Mark Reviewed" inline-button for the specific review row; this is the inline-button form for Track `26` review queue actions.

## Per-Mn Surface Cross-Links

- `11.10` FloatingMenu: canvas selection actions belong to the selection context, so toolbar buttons MUST NOT duplicate FloatingMenu actions.
- `11.12` ambient strip click-expand: ambient strip expansion is an inline-button/content interaction when the target is a rendered strip instance.
- `25.1` Day Calendar "Today": widget-global navigation belongs in the `TabBarToolbarContribution` path.
- `26` Review queue inline buttons: row-scoped review actions belong beside the artifact row, with disabled state derived from the row's actionable status.

## Anti-Patterns

- Toolbar buttons that duplicate FloatingMenu actions from `11.10`.
- Inline buttons that should be context-menu items because the action varies by a selected text range, graph node, coordinate node, or canvas object.
- Context-menu items that should be toolbar actions because the action is global to the active widget and independent of selection.
- Parallel shell chrome that bypasses Theia contribution paths when `TabBarToolbarContribution`, `MenuModelRegistry`, or React widget-body inline-button rendering already owns the action surface.
