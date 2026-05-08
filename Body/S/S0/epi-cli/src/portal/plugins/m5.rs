use crate::ffi;
use crate::portal::runtime_state::SharedPortalTemporalSurface;
use crate::portal::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;
use ratatui_hypertile::{EventOutcome, HypertileEvent, KeyCode};
use ratatui_hypertile_extras::HypertilePlugin;

// ═══════════════════════════════════════════════════════════════════════════
// M5LogosPlugin — Logos cycle status from nara::logos
// ═══════════════════════════════════════════════════════════════════════════

pub struct M5LogosPlugin {
    status_text: String,
    selected_stage: usize,
    stage_detail: Option<String>,
}

impl M5LogosPlugin {
    pub fn new() -> Self {
        let mut plugin = Self {
            status_text: String::new(),
            selected_stage: 0,
            stage_detail: None,
        };
        plugin.load_data();
        plugin
    }

    fn load_data(&mut self) {
        self.status_text =
            crate::nara::logos::status(false).unwrap_or_else(|e| format!("Error: {}", e));
    }

    fn load_stage_detail(&mut self) {
        let idx = self.selected_stage as u8;
        self.stage_detail = Some(
            crate::nara::logos::stage(idx, None, false)
                .unwrap_or_else(|e| format!("Stage {} not yet completed: {}", idx, e)),
        );
    }
}

impl HypertilePlugin for M5LogosPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let accent = theme::m_level_color(5);
        let dim = Style::default().fg(Color::DarkGray);

        let chunks = Layout::default()
            .direction(Direction::Vertical)
            .constraints([
                Constraint::Length(3), // progress bar
                Constraint::Min(5),    // status + detail
                Constraint::Length(1), // footer
            ])
            .split(area);

        // Progress bar as stage indicators
        let stage_names = [
            "A-Logos",
            "Pro-Logos",
            "Dia-Logos",
            "Logos",
            "Epi-Logos",
            "Ana-Logos",
        ];
        let stage_spans: Vec<Span> = stage_names
            .iter()
            .enumerate()
            .map(|(i, name)| {
                let style = if i == self.selected_stage {
                    Style::default()
                        .fg(Color::Black)
                        .bg(Color::Magenta)
                        .add_modifier(Modifier::BOLD)
                } else {
                    Style::default().fg(Color::DarkGray)
                };
                Span::styled(format!(" {} ", name), style)
            })
            .collect();

        let progress = Paragraph::new(Line::from(stage_spans)).block(
            Block::default()
                .title(Span::styled(
                    " M5' Logos Cycle ",
                    Style::default().fg(accent).add_modifier(Modifier::BOLD),
                ))
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))),
        );
        Widget::render(progress, chunks[0], buf);

        // Main content: status + stage detail
        let mut lines: Vec<Line> = Vec::new();
        for sl in self.status_text.lines() {
            lines.push(Line::from(Span::styled(
                format!("  {}", sl),
                Style::default().fg(Color::White),
            )));
        }

        if let Some(ref detail) = self.stage_detail {
            lines.push(Line::from(""));
            lines.push(Line::from(Span::styled(
                "  Stage Output",
                Style::default().fg(Color::Yellow),
            )));
            for dl in detail.lines().take(15) {
                lines.push(Line::from(Span::styled(
                    format!("  {}", dl),
                    Style::default().fg(Color::White),
                )));
            }
        }

        let content = Paragraph::new(lines).block(
            Block::default()
                .borders(Borders::ALL)
                .border_style(Style::default().fg(Color::DarkGray)),
        );
        Widget::render(content, chunks[1], buf);

        // Footer
        let footer = Paragraph::new(Span::styled(
            "  [r] run next  [j/k] navigate stages  [Enter] view stage  [R] refresh",
            dim,
        ));
        Widget::render(footer, chunks[2], buf);
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        if let HypertileEvent::Key(chord) = event {
            match chord.code {
                KeyCode::Char('j') | KeyCode::Down => {
                    if self.selected_stage < 5 {
                        self.selected_stage += 1;
                    }
                    return EventOutcome::Consumed;
                }
                KeyCode::Char('k') | KeyCode::Up => {
                    if self.selected_stage > 0 {
                        self.selected_stage -= 1;
                    }
                    return EventOutcome::Consumed;
                }
                KeyCode::Enter => {
                    self.load_stage_detail();
                    return EventOutcome::Consumed;
                }
                KeyCode::Char('r') => {
                    match crate::nara::logos::run(None, None, false) {
                        Ok(msg) => self.status_text = msg,
                        Err(e) => self.status_text = format!("Error: {}", e),
                    }
                    self.load_data();
                    return EventOutcome::Consumed;
                }
                KeyCode::Char('R') => {
                    self.load_data();
                    return EventOutcome::Consumed;
                }
                _ => {}
            }
        }
        EventOutcome::Ignored
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// M5FsmPlugin — M5 Logos FSM (FFI-backed)
// ═══════════════════════════════════════════════════════════════════════════

const M5_SUB_BRANCHES: [(&str, &str); 6] = [
    ("#5-0  M+M'", "Integral Identity -- M0-M5 mirror"),
    (
        "#5-1  L+P+L'+P'",
        "Theory Topology -- accumulated understanding",
    ),
    ("#5-2  S+S'", "Full Stack -- objective + project-specific"),
    ("#5-3  M' UI", "Electron App -- WebMCP protocol hooks"),
    ("#5-4  S4/S4'", "Agent Rosters -- Anima + Aletheia"),
    ("#5-5  T+C+T'+C'", "Logos Cycle -- cadence of immanence"),
];

pub struct M5FsmPlugin {
    m5_root: *mut libc::c_void,
    arena: ffi::CoordinateArena,
    logos_state: ffi::M5LogosState,
    selected: usize,
    #[allow(dead_code)] // retained for future FFI calls
    epi: ffi::EpiLib,
}

// Raw C pointers point to .rodata/arena (controlled lifetime), safe to send
unsafe impl Send for M5FsmPlugin {}

impl M5FsmPlugin {
    pub fn new() -> Self {
        let epi = ffi::EpiLib::new();
        let mut arena = ffi::CoordinateArena {
            slots: std::ptr::null_mut(),
            capacity: 0,
            count: 0,
        };
        epi.arena_init(&mut arena, 64);

        // Allocate an HC for M5 at position #5
        let hc = epi.arena_alloc(&mut arena);
        unsafe {
            (*hc).ql_position = 5;
            (*hc).family = 7; // NONE (raw psychoid)
        }

        let m5_root = unsafe { ffi::m5_init(&mut arena as *mut _, hc) };
        let logos_state = ffi::M5LogosState {
            pipeline_tick: 0,
            current_stage: 0,
            active_divine_act: 0,
            is_implicate: false,
            active_r_factor: 0,
        };

        Self {
            m5_root,
            arena,
            logos_state,
            selected: 0,
            epi,
        }
    }

    fn advance_logos(&mut self) {
        if !self.m5_root.is_null() {
            self.logos_state = unsafe { ffi::m5_advance_logos(self.m5_root) };
        }
    }

    fn stage_name(&self) -> &'static str {
        let idx = self.logos_state.current_stage as usize;
        if idx < 6 {
            unsafe {
                let ptr = ffi::M5_LOGOS_STAGE_NAMES[idx];
                if !ptr.is_null() {
                    let cstr = std::ffi::CStr::from_ptr(ptr);
                    cstr.to_str().unwrap_or("?")
                } else {
                    "?"
                }
            }
        } else {
            "?"
        }
    }

    fn lookup(&self, family: u8, pos: u8) -> String {
        if self.m5_root.is_null() {
            return "(no root)".to_string();
        }
        let coord_id = ((family as u16 & 0x7) << 13) | ((pos as u16 & 0x7) << 10);
        unsafe {
            let ptr = ffi::m5_lookup(self.m5_root, coord_id, 0);
            if !ptr.is_null() {
                let cstr = std::ffi::CStr::from_ptr(ptr);
                cstr.to_str().unwrap_or("(invalid)").to_string()
            } else {
                "(no view)".to_string()
            }
        }
    }
}

impl Drop for M5FsmPlugin {
    fn drop(&mut self) {
        if !self.m5_root.is_null() {
            unsafe { ffi::m5_teardown(self.m5_root) };
        }
        unsafe { ffi::arena_destroy(&mut self.arena as *mut _) };
    }
}

impl HypertilePlugin for M5FsmPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let dim = Style::default().fg(Color::DarkGray);

        let outer = Layout::default()
            .direction(Direction::Vertical)
            .constraints([
                Constraint::Length(3), // header
                Constraint::Min(8),    // main
                Constraint::Length(3), // logos strip
                Constraint::Length(1), // footer hints
            ])
            .split(area);

        // Header
        let phase = if self.logos_state.is_implicate {
            "descending"
        } else {
            "ascending"
        };
        let header = Paragraph::new(Line::from(vec![
            Span::styled(
                " M5 (Epii) -- Holographic Integration ",
                Style::default()
                    .fg(Color::White)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::styled(
                format!(
                    "  CF_MOBIUS (5/0)  tick {}/11 {} ",
                    self.logos_state.pipeline_tick, phase
                ),
                Style::default().fg(Color::Magenta),
            ),
        ]))
        .block(
            Block::default()
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))),
        );
        Widget::render(header, outer[0], buf);

        // Main: left = sub-branches, right = detail
        let main_area = Layout::default()
            .direction(Direction::Horizontal)
            .constraints([Constraint::Percentage(40), Constraint::Percentage(60)])
            .split(outer[1]);

        // Left: sub-branch list
        let items: Vec<ListItem> = M5_SUB_BRANCHES
            .iter()
            .enumerate()
            .map(|(i, (name, _))| {
                let style = if i == self.selected {
                    Style::default().fg(Color::Black).bg(Color::Magenta)
                } else {
                    Style::default().fg(Color::White)
                };
                ListItem::new(format!(" {}", name)).style(style)
            })
            .collect();

        let list = List::new(items).block(
            Block::default()
                .title(" Sub-Branches ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(Color::Cyan)),
        );
        Widget::render(list, main_area[0], buf);

        // Right: detail for selected sub-branch
        let (branch_name, branch_desc) = M5_SUB_BRANCHES[self.selected];
        let families_for_branch: &[(u8, &str)] = match self.selected {
            0 => &[
                (5, "M0"),
                (5, "M1"),
                (5, "M2"),
                (5, "M3"),
                (5, "M4"),
                (5, "M5"),
            ],
            1 => &[
                (2, "L0"),
                (2, "L1"),
                (2, "L2"),
                (2, "L3"),
                (2, "L4"),
                (2, "L5"),
                (1, "P0"),
                (1, "P1"),
                (1, "P2"),
                (1, "P3"),
                (1, "P4"),
                (1, "P5"),
            ],
            2 => &[
                (3, "S0"),
                (3, "S1"),
                (3, "S2"),
                (3, "S3"),
                (3, "S4"),
                (3, "S5"),
            ],
            3 => &[(5, "M'")],
            4 => &[(3, "S4"), (3, "S4'")],
            5 => &[
                (4, "T0"),
                (4, "T1"),
                (4, "T2"),
                (4, "T3"),
                (4, "T4"),
                (4, "T5"),
                (0, "C0"),
                (0, "C1"),
                (0, "C2"),
                (0, "C3"),
                (0, "C4"),
                (0, "C5"),
            ],
            _ => &[],
        };

        let mut lines = vec![
            Line::from(vec![
                Span::styled("Branch:  ", dim),
                Span::styled(
                    branch_name,
                    Style::default()
                        .fg(Color::Magenta)
                        .add_modifier(Modifier::BOLD),
                ),
            ]),
            Line::from(vec![Span::styled("Domain:  ", dim), Span::raw(branch_desc)]),
            Line::from(""),
            Line::from(Span::styled(
                "-- QV Lookups --",
                Style::default().fg(Color::Yellow),
            )),
        ];

        for (fam, label) in families_for_branch {
            let pos = label
                .chars()
                .last()
                .and_then(|c| c.to_digit(10))
                .unwrap_or(0) as u8;
            let qv = self.lookup(*fam, pos);
            lines.push(Line::from(vec![
                Span::styled(format!("  {:<4} ", label), Style::default().fg(Color::Cyan)),
                Span::raw(qv),
            ]));
        }

        let detail = Paragraph::new(lines)
            .block(
                Block::default()
                    .title(format!(" {} ", branch_name))
                    .borders(Borders::ALL)
                    .border_style(Style::default().fg(Color::Green)),
            )
            .wrap(Wrap { trim: false });
        Widget::render(detail, main_area[1], buf);

        // Logos strip
        let stage_name = self.stage_name();
        let logos_spans: Vec<Span> = (0u8..6)
            .map(|i| {
                let active = i == self.logos_state.current_stage;
                let name = match i {
                    0 => "A-logos",
                    1 => "Pro-logos",
                    2 => "Dia-logos",
                    3 => "Logos",
                    4 => "Epi-logos",
                    5 => "Ana-logos",
                    _ => "?",
                };
                let style = if active {
                    Style::default()
                        .fg(Color::Black)
                        .bg(Color::Magenta)
                        .add_modifier(Modifier::BOLD)
                } else {
                    Style::default().fg(Color::DarkGray)
                };
                Span::styled(format!(" {} ", name), style)
            })
            .collect();

        let mut all_spans = vec![Span::styled(" Logos FSM: ", dim)];
        all_spans.extend(logos_spans);
        all_spans.push(Span::styled(
            format!("  [{}]", stage_name),
            Style::default().fg(Color::Magenta),
        ));

        let logos_bar = Paragraph::new(Line::from(all_spans)).block(
            Block::default()
                .title(" Logos Cycle ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(Color::Magenta)),
        );
        Widget::render(logos_bar, outer[2], buf);

        // Footer hints
        let footer = Paragraph::new(Span::styled("  [->] advance logos  [j/k] navigate  ", dim));
        Widget::render(footer, outer[3], buf);
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        if let HypertileEvent::Key(chord) = event {
            match chord.code {
                KeyCode::Up | KeyCode::Char('k') => {
                    if self.selected > 0 {
                        self.selected -= 1;
                    }
                    return EventOutcome::Consumed;
                }
                KeyCode::Down | KeyCode::Char('j') => {
                    if self.selected + 1 < 6 {
                        self.selected += 1;
                    }
                    return EventOutcome::Consumed;
                }
                KeyCode::Right | KeyCode::Char('l') => {
                    self.advance_logos();
                    return EventOutcome::Consumed;
                }
                _ => {}
            }
        }
        EventOutcome::Ignored
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// M5ChatPlugin — functional stub
// ═══════════════════════════════════════════════════════════════════════════

pub struct M5ChatPlugin {
    temporal: Option<SharedPortalTemporalSurface>,
}

impl M5ChatPlugin {
    pub fn new() -> Self {
        Self { temporal: None }
    }

    pub fn new_with_temporal(temporal: SharedPortalTemporalSurface) -> Self {
        Self {
            temporal: Some(temporal),
        }
    }
}

impl HypertilePlugin for M5ChatPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let accent = theme::m_level_color(5);
        let dim = Style::default().fg(Color::DarkGray);

        let mut lines = vec![
            Line::from(""),
            Line::from(Span::styled(
                "  M5' Agent Chat",
                Style::default().fg(accent).add_modifier(Modifier::BOLD),
            )),
            Line::from(""),
            Line::from(Span::styled(
                "  Use `epi agent chat` for full interactive experience.",
                Style::default().fg(Color::White),
            )),
            Line::from(""),
            Line::from(Span::styled(
                "  The agent chat requires a subprocess terminal which is",
                dim,
            )),
            Line::from(Span::styled(
                "  not supported within the portal TUI. Launch it from",
                dim,
            )),
            Line::from(Span::styled("  a separate terminal session.", dim)),
            Line::from(""),
            Line::from(Span::styled(
                "  Agents: Anima, Nous, Logos, Eros, Mythos, Psyche, Sophia",
                Style::default().fg(Color::Magenta),
            )),
        ];

        if let Some(temporal) = &self.temporal {
            let temporal = temporal.lock().unwrap();
            lines.push(Line::from(""));
            lines.push(Line::from(Span::styled(
                "  Epii Orientation",
                Style::default().fg(Color::Yellow),
            )));
            lines.push(Line::from(format!(
                "  DAY {}  session {}",
                temporal.day_id.as_deref().unwrap_or("unbound"),
                temporal.session_id.as_deref().unwrap_or("unbound")
            )));
            lines.push(Line::from(format!(
                "  NOW {}",
                temporal
                    .now_wikilink
                    .as_deref()
                    .or_else(|| temporal.now_path.as_ref().and_then(|path| path.to_str()))
                    .unwrap_or("unbound")
            )));
            lines.push(Line::from(format!(
                "  Pratibimba {}  Kairos {} fresh={}",
                temporal
                    .pratibimba_anchor_id
                    .as_deref()
                    .unwrap_or("unbound"),
                temporal.kairos_valid,
                temporal.kairos_fresh
            )));
        }

        let para = Paragraph::new(lines).block(
            Block::default()
                .title(Span::styled(
                    " M5' Chat ",
                    Style::default().fg(accent).add_modifier(Modifier::BOLD),
                ))
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))),
        );
        Widget::render(para, area, buf);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ratatui::buffer::Buffer;
    use ratatui::layout::Rect;

    fn buffer_to_string(buf: &Buffer, area: Rect) -> String {
        let mut s = String::new();
        for y in 0..area.height {
            for x in 0..area.width {
                s.push_str(buf[(x, y)].symbol());
            }
        }
        s
    }

    #[test]
    fn m5_logos_renders_title() {
        let plugin = M5LogosPlugin::new();
        let area = Rect::new(0, 0, 80, 20);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content = buffer_to_string(&buf, area);
        assert!(content.contains("Logos"), "Should show Logos title");
    }

    #[test]
    fn m5_logos_navigation() {
        let mut plugin = M5LogosPlugin::new();
        assert_eq!(plugin.selected_stage, 0);
        let j = HypertileEvent::Key(ratatui_hypertile::KeyChord {
            code: KeyCode::Char('j'),
            modifiers: ratatui_hypertile::Modifiers::NONE,
        });
        plugin.on_event(&j);
        assert_eq!(plugin.selected_stage, 1);

        // Cannot exceed 5
        for _ in 0..10 {
            plugin.on_event(&j);
        }
        assert_eq!(plugin.selected_stage, 5);
    }

    #[test]
    fn m5_fsm_renders_title() {
        let plugin = M5FsmPlugin::new();
        let area = Rect::new(0, 0, 100, 30);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content = buffer_to_string(&buf, area);
        assert!(
            content.contains("M5") || content.contains("Epii"),
            "Should show M5 FSM header"
        );
    }

    #[test]
    fn m5_fsm_advance_logos_consumed() {
        let mut plugin = M5FsmPlugin::new();
        let right = HypertileEvent::Key(ratatui_hypertile::KeyChord {
            code: KeyCode::Right,
            modifiers: ratatui_hypertile::Modifiers::NONE,
        });
        let result = plugin.on_event(&right);
        assert!(
            matches!(result, EventOutcome::Consumed),
            "Right arrow should be consumed by FSM plugin"
        );
    }

    #[test]
    fn m5_fsm_navigation() {
        let mut plugin = M5FsmPlugin::new();
        assert_eq!(plugin.selected, 0);
        let j = HypertileEvent::Key(ratatui_hypertile::KeyChord {
            code: KeyCode::Char('j'),
            modifiers: ratatui_hypertile::Modifiers::NONE,
        });
        plugin.on_event(&j);
        assert_eq!(plugin.selected, 1);
    }

    #[test]
    fn m5_chat_renders_stub() {
        let plugin = M5ChatPlugin::new();
        let area = Rect::new(0, 0, 70, 15);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content = buffer_to_string(&buf, area);
        assert!(content.contains("Chat"), "Should show Chat title");
        assert!(
            content.contains("epi agent chat"),
            "Should mention CLI command alternative"
        );
    }

    #[test]
    fn m5_chat_renders_epii_orientation_from_shared_temporal_surface() {
        let runtime = crate::portal::runtime_state::PortalRuntimeState::from_gateway_context_value(
            serde_json::json!({
                "day": { "dayId": "07-05-2026" },
                "now": { "wikilink": "[[NOW session-main]]" },
                "session": { "sessionId": "session-main" },
                "kairos": { "available": true, "fresh": true, "source": "nara.kairos.current" },
                "pratibimba": { "anchorId": "pratibimba-abcd1234", "coordinate": "M4.4.4.4" },
                "redis": { "hydrated": true, "sessionNowKey": "s3:gateway:temporal:session:session-main:now:md" },
                "spacetimedb": { "projectionTable": "session_surface", "kairosProjectionTable": "kairos_surface" }
            })
        )
        .expect("runtime should hydrate from gateway context");

        let plugin = M5ChatPlugin::new_with_temporal(runtime.temporal());
        let area = Rect::new(0, 0, 90, 18);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content = buffer_to_string(&buf, area);

        assert!(content.contains("07-05-2026"));
        assert!(content.contains("session-main"));
        assert!(content.contains("pratibimba-abcd1234"));
        assert!(content.contains("Epii"));
    }
}
