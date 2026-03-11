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
            let para = Paragraph::new("M0' Coordinate Dashboard — no data loaded")
                .block(
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

pub struct M0FamiliesPlugin;

impl M0FamiliesPlugin {
    pub fn new() -> Self { Self }
}

impl HypertilePlugin for M0FamiliesPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let para = Paragraph::new("M0' Families Explorer — stub")
            .block(Block::default()
                .title(" M0' Families ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))));
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
    fn m0_dashboard_renders_entity_list() {
        let epi = crate::ffi::EpiLib::new();
        let plugin = M0DashboardPlugin::with_epi(&epi);
        let area = Rect::new(0, 0, 80, 24);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content = buffer_to_string(&buf, area);
        assert!(content.contains("Psychoid") || content.contains("#0"),
            "Should render psychoid entity list");
    }

    #[test]
    fn m0_dashboard_empty_renders_stub() {
        let plugin = M0DashboardPlugin::new();
        let area = Rect::new(0, 0, 60, 10);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, false);
        let content = buffer_to_string(&buf, area);
        assert!(content.contains("no data"), "Empty plugin should show no data message");
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
}
