use ratatui::prelude::*;
use ratatui::widgets::*;
use ratatui_hypertile::{EventOutcome, HypertileEvent, KeyCode};
use ratatui_hypertile_extras::HypertilePlugin;

use crate::ffi::{self, tagged};
use crate::portal::theme;

pub struct M0DashboardPlugin {
    entries: Vec<(&'static str, *const ffi::HolographicCoordinate)>,
    selected: usize,
}

// Raw C pointers point to .rodata (static lifetime), safe to send across threads
unsafe impl Send for M0DashboardPlugin {}

impl M0DashboardPlugin {
    pub fn new() -> Self {
        Self {
            entries: Vec::new(),
            selected: 0,
        }
    }

    pub fn with_epi(epi: &ffi::EpiLib) -> Self {
        Self {
            entries: epi.all_bimba(),
            selected: 0,
        }
    }

    fn selected_snapshot(&self) -> Option<ffi::CoordSnapshot> {
        self.entries
            .get(self.selected)
            .and_then(|(_, ptr)| ffi::read_coord(*ptr))
    }

    fn render_entity_list(&self, area: Rect, buf: &mut Buffer) {
        let items: Vec<ListItem> = self
            .entries
            .iter()
            .enumerate()
            .map(|(i, (name, ptr))| {
                let snap = ffi::read_coord(*ptr);
                let inv = snap
                    .as_ref()
                    .map(|s| if s.inversion_state != 0 { "'" } else { " " })
                    .unwrap_or(" ");
                let weave = snap
                    .as_ref()
                    .map(|s| format!("{:.1}", s.weave_state))
                    .unwrap_or_default();
                let line = format!(" {} {:>5}  {}", inv, weave, name);
                let style = if i == self.selected {
                    Style::default().fg(Color::Black).bg(Color::Cyan)
                } else if name.starts_with("CF") {
                    Style::default().fg(Color::Yellow)
                } else if name.starts_with("Weave") {
                    Style::default().fg(Color::Magenta)
                } else if name.starts_with("#") {
                    Style::default().fg(Color::Green)
                } else {
                    Style::default()
                };
                ListItem::new(line).style(style)
            })
            .collect();

        let list = List::new(items).block(
            Block::default()
                .title(" Psychoid Numbers & CF Roots ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(Color::Cyan)),
        );
        Widget::render(list, area, buf);
    }

    fn render_detail(&self, area: Rect, buf: &mut Buffer) {
        let snap = self.selected_snapshot();
        let name = self
            .entries
            .get(self.selected)
            .map(|(n, _)| *n)
            .unwrap_or("?");

        let text = if let Some(s) = snap {
            let family = s.family.name();
            let flags_desc = tagged::flags_description(s.flags);

            vec![
                Line::from(vec![
                    Span::styled("ql_position:  ", Style::default().fg(Color::DarkGray)),
                    Span::styled(
                        format!("0x{:02X}", s.ql_position),
                        Style::default()
                            .fg(Color::White)
                            .add_modifier(Modifier::BOLD),
                    ),
                    Span::raw(format!(" ({})", crate::core::position_name(s.ql_position))),
                ]),
                Line::from(vec![
                    Span::styled("family:       ", Style::default().fg(Color::DarkGray)),
                    Span::raw(family),
                ]),
                Line::from(vec![
                    Span::styled("inversion:    ", Style::default().fg(Color::DarkGray)),
                    Span::styled(
                        if s.inversion_state == 0 {
                            "normal"
                        } else {
                            "inverted (')"
                        },
                        if s.inversion_state != 0 {
                            Style::default().fg(Color::Red)
                        } else {
                            Style::default()
                        },
                    ),
                ]),
                Line::from(vec![
                    Span::styled("flags:        ", Style::default().fg(Color::DarkGray)),
                    Span::raw(format!("0x{:02X} [{}]", s.flags, flags_desc)),
                ]),
                Line::from(vec![
                    Span::styled("weave_state:  ", Style::default().fg(Color::DarkGray)),
                    Span::raw(format!("{:.2}", s.weave_state)),
                ]),
                Line::from(vec![
                    Span::styled("invoke:       ", Style::default().fg(Color::DarkGray)),
                    Span::raw(if s.has_invoke { "yes" } else { "none" }),
                ]),
                Line::from(""),
                Line::from(Span::styled(
                    "── Base Pointers ──",
                    Style::default().fg(Color::Cyan),
                )),
                ptr_line(".p  ", &s.p),
                ptr_line(".s  ", &s.s),
                ptr_line(".t  ", &s.t),
                ptr_line(".m  ", &s.m),
                ptr_line(".l  ", &s.l),
                ptr_line(".c  ", &s.c),
                Line::from(""),
                Line::from(Span::styled(
                    "── Reflective ──",
                    Style::default().fg(Color::Yellow),
                )),
                ptr_line(".cpf", &s.cpf),
                ptr_line(".ct ", &s.ct),
                ptr_line(".cp ", &s.cp),
                ptr_line(".cf ", &s.cf),
                ptr_line(".cfp", &s.cfp),
                ptr_line(".cs ", &s.cs),
            ]
        } else {
            vec![Line::from("No data")]
        };

        let para = Paragraph::new(text).block(
            Block::default()
                .title(format!(" {} ", name))
                .borders(Borders::ALL)
                .border_style(Style::default().fg(Color::Green)),
        );
        Widget::render(para, area, buf);
    }
}

impl HypertilePlugin for M0DashboardPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        if self.entries.is_empty() {
            let para = Paragraph::new("M0' Coordinate Dashboard — no data loaded").block(
                Block::default()
                    .title(" M0' Dashboard ")
                    .borders(Borders::ALL)
                    .border_style(Style::default().fg(theme::pane_border(is_focused))),
            );
            Widget::render(para, area, buf);
            return;
        }

        let chunks = Layout::default()
            .direction(Direction::Horizontal)
            .constraints([Constraint::Percentage(35), Constraint::Percentage(65)])
            .split(area);

        self.render_entity_list(chunks[0], buf);
        self.render_detail(chunks[1], buf);
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        if self.entries.is_empty() {
            return EventOutcome::Ignored;
        }
        if let HypertileEvent::Key(chord) = event {
            match chord.code {
                KeyCode::Down | KeyCode::Char('j') => {
                    if self.selected + 1 < self.entries.len() {
                        self.selected += 1;
                    }
                    return EventOutcome::Consumed;
                }
                KeyCode::Up | KeyCode::Char('k') => {
                    if self.selected > 0 {
                        self.selected -= 1;
                    }
                    return EventOutcome::Consumed;
                }
                _ => {}
            }
        }
        EventOutcome::Ignored
    }
}

fn ptr_line<'a>(label: &'a str, info: &ffi::PtrInfo) -> Line<'a> {
    let display = info.display();
    let color = if info.is_null {
        Color::DarkGray
    } else if info.tags.nesting {
        Color::Cyan
    } else if info.tags.branching {
        Color::Yellow
    } else {
        Color::White
    };

    Line::from(vec![
        Span::styled(
            format!("  {}  ", label),
            Style::default().fg(Color::DarkGray),
        ),
        Span::styled(display, Style::default().fg(color)),
    ])
}

// ═══════════════════════════════════════════════════════════════════════════
// M0FamiliesPlugin — 36-coordinate explorer
// ═══════════════════════════════════════════════════════════════════════════

pub struct M0FamiliesPlugin {
    epi: ffi::EpiLib,
    arena: ffi::CoordinateArena,
    family_coords: Vec<(String, ffi::CoordSnapshot)>,
    selected: usize,
}

// EpiLib holds raw pointers to .rodata (static lifetime), safe to send
unsafe impl Send for M0FamiliesPlugin {}

impl M0FamiliesPlugin {
    pub fn new() -> Self {
        let epi = ffi::EpiLib::new();
        let mut arena = ffi::CoordinateArena {
            slots: std::ptr::null_mut(),
            capacity: 0,
            count: 0,
        };
        epi.arena_init(&mut arena, 64);

        let mut mirrors: [*mut ffi::HolographicCoordinate; 6] = [std::ptr::null_mut(); 6];
        epi.families_init(&mut arena, &mut mirrors);
        epi.families_crosslink(&mut arena);
        epi.families_wire_reflective(&mut arena);

        // Read all allocated coordinates
        let families = ["P", "S", "T", "M", "L", "C"];
        let positions = ["0", "1", "2", "3", "4", "5"];
        let mut family_coords = Vec::new();

        for slot_idx in 0..arena.count {
            let ptr = unsafe { arena.slots.add(slot_idx as usize) };
            if let Some(snap) = ffi::read_coord(ptr) {
                let fam_idx = snap.family as u8;
                let fam_letter = if (fam_idx as usize) >= 1 && (fam_idx as usize) <= 6 {
                    families[fam_idx as usize - 1]
                } else {
                    "?"
                };
                let pos_label = if (snap.ql_position as usize) < 6 {
                    positions[snap.ql_position as usize]
                } else {
                    "?"
                };
                let name = format!("{}{}", fam_letter, pos_label);
                family_coords.push((name, snap));
            }
        }

        Self {
            epi,
            arena,
            family_coords,
            selected: 0,
        }
    }

    fn family_color(family: ffi::CoordinateFamily) -> Color {
        match family {
            ffi::CoordinateFamily::P => Color::Green,
            ffi::CoordinateFamily::S => Color::Blue,
            ffi::CoordinateFamily::T => Color::Yellow,
            ffi::CoordinateFamily::M => Color::Red,
            ffi::CoordinateFamily::L => Color::Magenta,
            ffi::CoordinateFamily::C => Color::Cyan,
            _ => Color::White,
        }
    }
}

impl Drop for M0FamiliesPlugin {
    fn drop(&mut self) {
        self.epi.arena_destroy(&mut self.arena);
    }
}

impl HypertilePlugin for M0FamiliesPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let accent = theme::m_level_color(0);

        if self.family_coords.is_empty() {
            let para = Paragraph::new("M0' Families — no coordinates loaded").block(
                Block::default()
                    .title(" M0' Families ")
                    .borders(Borders::ALL)
                    .border_style(Style::default().fg(theme::pane_border(is_focused))),
            );
            Widget::render(para, area, buf);
            return;
        }

        let chunks = Layout::default()
            .direction(Direction::Horizontal)
            .constraints([Constraint::Percentage(30), Constraint::Percentage(70)])
            .split(area);

        // Left: family coordinate list (6x6 = 36 coords)
        let items: Vec<ListItem> = self
            .family_coords
            .iter()
            .enumerate()
            .map(|(i, (name, snap))| {
                let inv = if snap.inversion_state != 0 { "'" } else { " " };
                let line = format!(" {}{}  pos={}", name, inv, snap.ql_position);
                let style = if i == self.selected {
                    Style::default().fg(Color::Black).bg(Color::Cyan)
                } else {
                    Style::default().fg(Self::family_color(snap.family))
                };
                ListItem::new(line).style(style)
            })
            .collect();

        let list = List::new(items).block(
            Block::default()
                .title(Span::styled(
                    " 36 Family Coordinates ",
                    Style::default().fg(accent).add_modifier(Modifier::BOLD),
                ))
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))),
        );
        Widget::render(list, chunks[0], buf);

        // Right: detail for selected
        if let Some((name, snap)) = self.family_coords.get(self.selected) {
            let flags_desc = tagged::flags_description(snap.flags);
            let lines = vec![
                Line::from(vec![
                    Span::styled("name:         ", Style::default().fg(Color::DarkGray)),
                    Span::styled(
                        name.clone(),
                        Style::default()
                            .fg(Color::White)
                            .add_modifier(Modifier::BOLD),
                    ),
                ]),
                Line::from(vec![
                    Span::styled("family:       ", Style::default().fg(Color::DarkGray)),
                    Span::raw(snap.family.name()),
                ]),
                Line::from(vec![
                    Span::styled("ql_position:  ", Style::default().fg(Color::DarkGray)),
                    Span::raw(format!(
                        "0x{:02X} ({})",
                        snap.ql_position,
                        crate::core::position_name(snap.ql_position)
                    )),
                ]),
                Line::from(vec![
                    Span::styled("flags:        ", Style::default().fg(Color::DarkGray)),
                    Span::raw(format!("0x{:02X} [{}]", snap.flags, flags_desc)),
                ]),
                Line::from(vec![
                    Span::styled("weave_state:  ", Style::default().fg(Color::DarkGray)),
                    Span::raw(format!("{:.2}", snap.weave_state)),
                ]),
                Line::from(vec![
                    Span::styled("inversion:    ", Style::default().fg(Color::DarkGray)),
                    Span::styled(
                        if snap.inversion_state == 0 {
                            "normal"
                        } else {
                            "inverted (')"
                        },
                        if snap.inversion_state != 0 {
                            Style::default().fg(Color::Red)
                        } else {
                            Style::default()
                        },
                    ),
                ]),
                Line::from(""),
                Line::from(Span::styled(
                    "── Base Pointers ──",
                    Style::default().fg(Color::Cyan),
                )),
                ptr_line(".p  ", &snap.p),
                ptr_line(".s  ", &snap.s),
                ptr_line(".t  ", &snap.t),
                ptr_line(".m  ", &snap.m),
                ptr_line(".l  ", &snap.l),
                ptr_line(".c  ", &snap.c),
                Line::from(""),
                Line::from(Span::styled(
                    "── Reflective ──",
                    Style::default().fg(Color::Yellow),
                )),
                ptr_line(".cpf", &snap.cpf),
                ptr_line(".ct ", &snap.ct),
                ptr_line(".cp ", &snap.cp),
                ptr_line(".cf ", &snap.cf),
                ptr_line(".cfp", &snap.cfp),
                ptr_line(".cs ", &snap.cs),
            ];

            let para = Paragraph::new(lines).block(
                Block::default()
                    .title(format!(" {} -- Detail ", name))
                    .borders(Borders::ALL)
                    .border_style(Style::default().fg(Color::Green)),
            );
            Widget::render(para, chunks[1], buf);
        }
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        if self.family_coords.is_empty() {
            return EventOutcome::Ignored;
        }
        if let HypertileEvent::Key(chord) = event {
            match chord.code {
                KeyCode::Down | KeyCode::Char('j') => {
                    if self.selected + 1 < self.family_coords.len() {
                        self.selected += 1;
                    }
                    return EventOutcome::Consumed;
                }
                KeyCode::Up | KeyCode::Char('k') => {
                    if self.selected > 0 {
                        self.selected -= 1;
                    }
                    return EventOutcome::Consumed;
                }
                _ => {}
            }
        }
        EventOutcome::Ignored
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
    fn m0_dashboard_renders_entity_list() {
        let epi = crate::ffi::EpiLib::new();
        let plugin = M0DashboardPlugin::with_epi(&epi);
        let area = Rect::new(0, 0, 80, 24);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content = buffer_to_string(&buf, area);
        assert!(
            content.contains("Psychoid") || content.contains("#0"),
            "Should render psychoid entity list"
        );
    }

    #[test]
    fn m0_dashboard_empty_renders_stub() {
        let plugin = M0DashboardPlugin::new();
        let area = Rect::new(0, 0, 60, 10);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, false);
        let content = buffer_to_string(&buf, area);
        assert!(
            content.contains("no data"),
            "Empty plugin should show no data message"
        );
    }

    #[test]
    fn m0_dashboard_navigation() {
        let epi = crate::ffi::EpiLib::new();
        let mut plugin = M0DashboardPlugin::with_epi(&epi);
        assert_eq!(plugin.selected, 0);

        // Navigate down
        let down = HypertileEvent::Key(ratatui_hypertile::KeyChord {
            code: KeyCode::Char('j'),
            modifiers: ratatui_hypertile::Modifiers::NONE,
        });
        let result = plugin.on_event(&down);
        assert!(matches!(result, EventOutcome::Consumed));
        assert_eq!(plugin.selected, 1);

        // Navigate up
        let up = HypertileEvent::Key(ratatui_hypertile::KeyChord {
            code: KeyCode::Char('k'),
            modifiers: ratatui_hypertile::Modifiers::NONE,
        });
        let result = plugin.on_event(&up);
        assert!(matches!(result, EventOutcome::Consumed));
        assert_eq!(plugin.selected, 0);

        // At top, up should not underflow
        let result = plugin.on_event(&up);
        assert!(matches!(result, EventOutcome::Consumed));
        assert_eq!(plugin.selected, 0);
    }

    // ── M0FamiliesPlugin ──

    #[test]
    fn m0_families_renders_title() {
        let plugin = M0FamiliesPlugin::new();
        let area = Rect::new(0, 0, 80, 24);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content = buffer_to_string(&buf, area);
        assert!(
            content.contains("36 Family") || content.contains("Families"),
            "Should show families title"
        );
    }

    #[test]
    fn m0_families_navigation() {
        let mut plugin = M0FamiliesPlugin::new();
        assert_eq!(plugin.selected, 0);

        let down = HypertileEvent::Key(ratatui_hypertile::KeyChord {
            code: KeyCode::Char('j'),
            modifiers: ratatui_hypertile::Modifiers::NONE,
        });
        let result = plugin.on_event(&down);
        assert!(matches!(result, EventOutcome::Consumed));
        assert_eq!(plugin.selected, 1);

        let up = HypertileEvent::Key(ratatui_hypertile::KeyChord {
            code: KeyCode::Char('k'),
            modifiers: ratatui_hypertile::Modifiers::NONE,
        });
        let result = plugin.on_event(&up);
        assert!(matches!(result, EventOutcome::Consumed));
        assert_eq!(plugin.selected, 0);
    }

    #[test]
    fn m0_families_has_coordinates() {
        let plugin = M0FamiliesPlugin::new();
        assert!(
            !plugin.family_coords.is_empty(),
            "Should have loaded family coordinates from arena"
        );
    }
}
