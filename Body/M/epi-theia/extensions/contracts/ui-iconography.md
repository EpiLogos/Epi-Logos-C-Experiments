# UI Iconography Contract

Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] -> [[THEIA-UI-PATTERNS-ARCHITECTURE]]

`ui-iconography.ts` is the machine-readable icon contract for the [[M']] Theia surface. SVG assets live in `contracts/icons/` and are consumed as custom icons before falling back to Theia Codicons.

## Custom Icon Set

| Icon | Role | Codicon fallback |
| --- | --- | --- |
| `coordinate-tree.svg` | `pratibimba.activity-bar.coordinate-tree` activity-bar mode; branching tree with coordinate markers. | `$(list-tree)` |
| `bimba-graph-viewer.svg` | `pratibimba.activity-bar.bimba-graph-viewer` activity-bar mode; graph, solar, and tree convergence. | `$(graph)` |
| `canon-studio.svg` | `pratibimba.activity-bar.canon-studio` activity-bar mode; markdown text plus structured marker. | `$(book)` |
| `backend-studio.svg` | `pratibimba.activity-bar.backend-studio` activity-bar mode; LSP/code plus cog. | `$(server-process)` |
| `smart-connections.svg` | `pratibimba.activity-bar.smart-connections` activity-bar mode; semantic links with halo. | `$(circuit-board)` |
| `coin-flip.svg` | Title-bar 0/1 toggle per Track 15.5. | `$(sync)` |
| `lemniscate.svg` | `LemniscateTransition` default glyph, with the visible `#4` cross-binding anchor. | `$(symbol-operator)` |
| `family-m0-anuttara.svg` | Mn family glyph: void/recognition. | `$(circle-large-outline)` |
| `family-m1-paramasiva.svg` | Mn family glyph: Spanda/pulse. | `$(pulse)` |
| `family-m2-parashakti.svg` | Mn family glyph: cymatic/vibration. | `$(radio-tower)` |
| `family-m3-mahamaya.svg` | Mn family glyph: wheel/codon. | `$(symbol-enum)` |
| `family-m4-nara.svg` | Mn family glyph: vessel/personal. | `$(person)` |
| `family-m5-epii.svg` | Mn family glyph: recursion/atelier. | `$(references)` |
| `family-p.svg` | Inline `CoordinateString` P-tier marker. | `$(primitive-square)` |
| `family-s.svg` | Inline `CoordinateString` S-tier marker. | `$(layers)` |
| `family-t.svg` | Inline `CoordinateString` T-tier marker. | `$(edit)` |
| `family-m.svg` | Inline `CoordinateString` M-tier marker. | `$(symbol-namespace)` |
| `family-l.svg` | Inline `CoordinateString` L-tier marker. | `$(eye)` |
| `family-c.svg` | Inline `CoordinateString` C-tier marker. | `$(symbol-class)` |

## Activity-Bar Binding

The five custom activity-bar mode icons bind to `widget.application-shell-left`:

| Mode id | Widget id | Custom icon |
| --- | --- | --- |
| `pratibimba.activity-bar.coordinate-tree` | `pratibimba.ide-shell.coordinate-tree` | `pratibimba.icon.coordinate-tree` |
| `pratibimba.activity-bar.bimba-graph-viewer` | `pratibimba.ide-shell.bimba-graph-viewer` | `pratibimba.icon.bimba-graph-viewer` |
| `pratibimba.activity-bar.canon-studio` | `pratibimba.ide-shell.canon-studio` | `pratibimba.icon.canon-studio` |
| `pratibimba.activity-bar.backend-studio` | `pratibimba.ide-shell.backend-studio` | `pratibimba.icon.backend-studio` |
| `pratibimba.activity-bar.smart-connections` | `pratibimba.smart-connections-sidebar` | `pratibimba.icon.smart-connections` |

## Fallback Convention

Any UI element absent from `UI_ICON_SET` uses Theia Codicons. Default fallbacks are:

- Commands: `$(gear)`
- Navigation: `$(arrow-right)`
- Status/readiness: `$(pass)`

Consumers must not hardcode local icon paths. They read `ui-iconography.ts`, the browser contribution in `integrated-composition/src/browser/icons-contribution.ts`, or the `CoordinateString` family-glyph data attributes.
