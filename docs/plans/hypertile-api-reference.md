# Hypertile API Reference (Discovered from 0.1.0 crates)

## ratatui-hypertile (core BSP)

### Hypertile struct
- `new()`, `builder() -> HypertileBuilder`, `Default`
- `compute_layout(&mut self, area: Rect)`
- `split_focused(&mut self, direction: Direction) -> Result<PaneId, StateError>`
- `close_focused(&mut self) -> Result<PaneId, StateError>`
- `focused_pane() -> Option<PaneId>`, `focus_pane(PaneId) -> Result<()>`
- `pane_rect(PaneId) -> Option<Rect>`, `panes() -> Vec<PaneSnapshot>`, `panes_iter()`
- `apply_action(HypertileAction) -> EventOutcome`
- `handle_event(HypertileEvent) -> EventOutcome`
- `set_root(Node)`, `root() -> &Node`, `reset()`
- `set_gap(u16)`, `set_resize_step(f32)`, `set_split_policy(SplitPolicy)`

### Key Types
- `PaneId`: `ROOT`, `new(u64)`, `get() -> u64`
- `PaneSnapshot`: `{ id: PaneId, rect: Rect, is_focused: bool }`
- `Node`: `Pane(PaneId)` | `Split { direction, ratio: f32, first: Box<Node>, second: Box<Node> }`
- `HypertileAction`: FocusNext, FocusPrev, FocusDirection{direction,towards}, SplitFocused{direction}, CloseFocused, ResizeFocused{delta}, MoveFocused{direction,towards,scope}
- `HypertileEvent`: Key(KeyChord), Action(HypertileAction), Tick
- `EventOutcome`: Ignored, Consumed
- `SplitPolicy`: Half, Golden, Fixed(f32)
- `KeyChord`: `{ code: KeyCode, modifiers: Modifiers }`, `new(KeyCode)`, `with_modifiers(KeyCode, Modifiers)`
- `Modifiers`: NONE, SHIFT, CTRL, ALT (bitflags)

### HypertileWidget<F>
StatefulWidget (State=Hypertile), closure `F: FnMut(PaneSnapshot, &mut Buffer)` called per pane.

## ratatui-hypertile-extras (runtime + plugins)

### HypertilePlugin trait
```rust
trait HypertilePlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool);           // required
    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome;             // default: Ignored
    fn on_mount(&mut self, ctx: PluginContext);                                  // default: no-op
    fn on_unmount(&mut self, ctx: PluginContext);                                // default: no-op
    fn save_state(&self) -> Option<serde_json::Value>;                          // serde feature
    fn load_state(&mut self, state: &serde_json::Value) -> Result<(), String>;  // serde feature
}
```
`PluginContext`: `{ pane_id: PaneId }`

### Registry
- `register_plugin_type(&mut self, &str, F)` where F: Fn() -> P, P: HypertilePlugin
- `spawn_plugin(&mut self, &str, PaneId) -> Result<()>`
- `instantiate_plugin(&self, &str) -> Result<Box<dyn HypertilePlugin>>`
- `mount_plugin_instance(&mut self, PaneId, &str, Box<dyn HypertilePlugin>)`
- `remove_plugin(PaneId)`, `plugin(PaneId)`, `plugin_mut(PaneId)`, `plugin_type_for(PaneId)`
- `registered_types() -> Vec<&str>`, `instance_count()`
- `broadcast_event(&mut self, &HypertileEvent) -> EventOutcome`

### HypertileRuntime
- `new()`, `builder() -> HypertileRuntimeBuilder`
- `core() -> &CoreHypertile`, `registry() -> &Registry`
- `mode() -> InputMode`, `set_mode(InputMode)`
- `register_plugin_type(&mut self, &str, F)`
- `split_focused(Direction, &str) -> Result<PaneId>` (takes plugin_type string)
- `close_focused() -> Result<PaneId>`
- `replace_focused_plugin(&mut self, &str)`, `replace_pane_plugin(PaneId, &str)`
- `handle_event(HypertileEvent) -> EventOutcome`
- `render(&mut self, Rect, &mut Buffer)` — renders all panes + palette
- `pane_bar_items()`, `panes()`, `focused_pane()`, `focus_pane(PaneId)`
- `set_border_config`, `set_split_behavior`, `set_move_bindings`, `set_resize_step`

### HypertileRuntimeBuilder
`with_focus_highlight`, `with_default_split_plugin(&str)`, `with_resize_step`, `with_split_policy`, `with_palette_size(w%, h%)`, `with_move_bindings(MoveBindings)`, `with_split_behavior(SplitBehavior)`, `with_border_config`, `with_gap`, `build()`

### WorkspaceRuntime
- `new(builder_factory: impl Fn() -> HypertileRuntimeBuilder)` — factory per new tab
- `active_runtime() -> &HypertileRuntime`, `active_runtime_mut()`
- `new_tab()`, `close_tab(usize)`, `next_tab()`, `prev_tab()`, `go_to_tab(usize)`, `rename_tab(usize, String)`
- `tab_count()`, `active_tab_index()`, `tab_labels() -> Vec<(&str, bool)>`
- `apply_workspace_action(WorkspaceAction)`, `handle_event`, `render`

### WorkspaceAction
NewTab, CloseTab(usize), NextTab, PrevTab, GoToTab(usize), RenameTab(usize, String)

### Other Types
- `InputMode`: Layout, PluginInput
- `SplitBehavior`: DefaultPlugin, Placeholder, PromptPalette
- `MoveBindings`: Vim, ShiftArrows, VimAndShiftArrows
- `BorderConfig`: { borders, border_set, border_style, focused_border_set, focused_border_style }
- `TabBar`: Widget, `from_workspace(&WorkspaceRuntime)`
- `PaneBar`: Widget, `from_runtime(&HypertileRuntime)`
- `event_from_crossterm(KeyEvent) -> Option<HypertileEvent>` (crossterm feature)

## Version Note
ratatui-hypertile-extras pulls ratatui 0.30 + crossterm 0.29. Our code uses ratatui 0.29 + crossterm 0.28. Cargo resolves both. If type mismatches arise, bump our versions.
