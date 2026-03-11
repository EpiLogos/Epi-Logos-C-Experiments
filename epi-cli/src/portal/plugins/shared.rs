use ratatui::prelude::*;
use ratatui::widgets::*;
use ratatui_hypertile::{EventOutcome, HypertileEvent, KeyCode};
use ratatui_hypertile_extras::HypertilePlugin;

pub struct HelpPlugin {
    scroll: usize,
}

impl HelpPlugin {
    pub fn new() -> Self {
        Self { scroll: 0 }
    }
}

impl HypertilePlugin for HelpPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let border_color = if is_focused {
            Color::Cyan
        } else {
            Color::DarkGray
        };

        let lines = vec![
            Line::from(Span::styled(
                "Portal Keybindings",
                Style::default()
                    .fg(Color::Cyan)
                    .add_modifier(Modifier::BOLD),
            )),
            Line::from(""),
            Line::from(vec![
                Span::styled("  Alt+h/j/k/l  ", Style::default().fg(Color::Yellow)),
                Span::raw("Move focus between panes"),
            ]),
            Line::from(vec![
                Span::styled("  Alt+H/J/K/L  ", Style::default().fg(Color::Yellow)),
                Span::raw("Move pane in direction"),
            ]),
            Line::from(vec![
                Span::styled("  Alt+s        ", Style::default().fg(Color::Yellow)),
                Span::raw("Split horizontal"),
            ]),
            Line::from(vec![
                Span::styled("  Alt+v        ", Style::default().fg(Color::Yellow)),
                Span::raw("Split vertical"),
            ]),
            Line::from(vec![
                Span::styled("  Alt+w        ", Style::default().fg(Color::Yellow)),
                Span::raw("Close focused pane"),
            ]),
            Line::from(vec![
                Span::styled("  Alt+[/]      ", Style::default().fg(Color::Yellow)),
                Span::raw("Resize pane"),
            ]),
            Line::from(vec![
                Span::styled("  Tab/S-Tab    ", Style::default().fg(Color::Yellow)),
                Span::raw("Switch workspace tab"),
            ]),
            Line::from(vec![
                Span::styled("  Alt+p        ", Style::default().fg(Color::Yellow)),
                Span::raw("Command palette"),
            ]),
            Line::from(vec![
                Span::styled("  Alt+r        ", Style::default().fg(Color::Yellow)),
                Span::raw("Reset layout"),
            ]),
            Line::from(vec![
                Span::styled("  Enter        ", Style::default().fg(Color::Yellow)),
                Span::raw("Enter pane input mode"),
            ]),
            Line::from(vec![
                Span::styled("  Escape       ", Style::default().fg(Color::Yellow)),
                Span::raw("Return to layout mode"),
            ]),
            Line::from(vec![
                Span::styled("  q            ", Style::default().fg(Color::Yellow)),
                Span::raw("Quit portal"),
            ]),
            Line::from(""),
            Line::from(Span::styled(
                "Available Plugins",
                Style::default()
                    .fg(Color::Cyan)
                    .add_modifier(Modifier::BOLD),
            )),
            Line::from(""),
            Line::from("  m0.dashboard    Coordinate inspector"),
            Line::from("  m0.families     36-family explorer"),
            Line::from("  m1.walk         Torus walk"),
            Line::from("  m2.vibrational  Vibrational matrix (stub)"),
            Line::from("  m3.knowing      Epistemic browser (stub)"),
            Line::from("  m4.identity     Identity/kairos dashboard"),
            Line::from("  m4.flow         CT0 flow writer"),
            Line::from("  m4.oracle       Oracle cast + history"),
            Line::from("  m4.medicine     Elemental balance"),
            Line::from("  m4.transform    Transformation cycles"),
            Line::from("  m4.lens         Wisdom lenses"),
            Line::from("  m4.pratibimba   Personal graph stats"),
            Line::from("  m5.logos        Logos cycle status"),
            Line::from("  m5.chat         Agent chat (stub)"),
            Line::from("  m5.fsm          M5 Logos FSM"),
            Line::from("  shared.status   Cross-M overview"),
            Line::from("  shared.help     This help"),
        ];

        let para = Paragraph::new(lines)
            .scroll((self.scroll as u16, 0))
            .block(
                Block::default()
                    .title(" Help ")
                    .borders(Borders::ALL)
                    .border_style(Style::default().fg(border_color)),
            );
        Widget::render(para, area, buf);
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        if let HypertileEvent::Key(chord) = event {
            match chord.code {
                KeyCode::Down | KeyCode::Char('j') => {
                    self.scroll = self.scroll.saturating_add(1);
                    return EventOutcome::Consumed;
                }
                KeyCode::Up | KeyCode::Char('k') => {
                    self.scroll = self.scroll.saturating_sub(1);
                    return EventOutcome::Consumed;
                }
                _ => {}
            }
        }
        EventOutcome::Ignored
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// StatusPlugin — cross-M aggregate overview
// ═══════════════════════════════════════════════════════════════════════════

struct StatusSection {
    label: &'static str,
    value: String,
    indicator: StatusIndicator,
}

#[derive(Clone, Copy)]
enum StatusIndicator {
    Green,
    Yellow,
    Red,
    Gray,
}

impl StatusIndicator {
    fn color(self) -> Color {
        match self {
            Self::Green => Color::Green,
            Self::Yellow => Color::Yellow,
            Self::Red => Color::Red,
            Self::Gray => Color::DarkGray,
        }
    }

    fn symbol(self) -> &'static str {
        match self {
            Self::Green => "+",
            Self::Yellow => "~",
            Self::Red => "!",
            Self::Gray => "-",
        }
    }
}

pub struct StatusPlugin {
    sections: Vec<StatusSection>,
}

impl StatusPlugin {
    pub fn new() -> Self {
        let mut plugin = Self {
            sections: Vec::new(),
        };
        plugin.load_data();
        plugin
    }

    fn load_data(&mut self) {
        self.sections.clear();

        // Identity / wound status
        let (identity_val, identity_ind) = match crate::nara::identity::load_profile() {
            Ok(Some(profile)) => {
                let wound_str = profile.last_wound
                    .map(|ts| format!("last wound: {}", ts))
                    .unwrap_or_else(|| "no wounds".to_string());
                let layers = profile.layer_presence_mask.count_ones();
                (format!("{}/5 layers, {}", layers, wound_str), StatusIndicator::Green)
            }
            Ok(None) => ("No profile".to_string(), StatusIndicator::Yellow),
            Err(e) => (format!("Error: {}", e), StatusIndicator::Red),
        };
        self.sections.push(StatusSection {
            label: "Identity",
            value: identity_val,
            indicator: identity_ind,
        });

        // Kairos freshness
        let kairos_fresh = crate::nara::kairos::is_current_fresh();
        let (kairos_val, kairos_ind) = match crate::nara::kairos::load_current() {
            Ok(Some(k)) => {
                let fresh_str = if kairos_fresh { "fresh" } else { "stale" };
                (format!("decan {} [{}]", k.active_decan, fresh_str),
                 if kairos_fresh { StatusIndicator::Green } else { StatusIndicator::Yellow })
            }
            Ok(None) => ("Not synced".to_string(), StatusIndicator::Gray),
            Err(e) => (format!("Error: {}", e), StatusIndicator::Red),
        };
        self.sections.push(StatusSection {
            label: "Kairos",
            value: kairos_val,
            indicator: kairos_ind,
        });

        // Transform cycles
        let (transform_val, transform_ind) = match crate::nara::transform::status(false) {
            Ok(text) => {
                // Parse open count from text
                let open_count = text.lines()
                    .find(|l| l.contains("Open:"))
                    .and_then(|l| l.split_whitespace().last())
                    .and_then(|n| n.parse::<u32>().ok())
                    .unwrap_or(0);
                let ind = if open_count > 0 { StatusIndicator::Yellow } else { StatusIndicator::Green };
                (format!("{} open cycles", open_count), ind)
            }
            Err(e) => (format!("Error: {}", e), StatusIndicator::Red),
        };
        self.sections.push(StatusSection {
            label: "Transform",
            value: transform_val,
            indicator: transform_ind,
        });

        // Logos progress
        let (logos_val, logos_ind) = match crate::nara::logos::status(false) {
            Ok(text) => {
                let completed = text.lines().filter(|l| l.contains('+') && l.contains('[') ).count();
                let ind = match completed {
                    6 => StatusIndicator::Green,
                    0 => StatusIndicator::Gray,
                    _ => StatusIndicator::Yellow,
                };
                (format!("{}/6 stages", completed), ind)
            }
            Err(e) => (format!("Error: {}", e), StatusIndicator::Red),
        };
        self.sections.push(StatusSection {
            label: "Logos",
            value: logos_val,
            indicator: logos_ind,
        });

        // Oracle hygiene
        let (oracle_val, oracle_ind) = match crate::nara::oracle::show_hygiene(None) {
            Ok(text) => {
                let casts_line = text.lines()
                    .find(|l| l.contains("Casts today"))
                    .unwrap_or("0/6");
                (casts_line.trim().to_string(), StatusIndicator::Green)
            }
            Err(e) => (format!("Error: {}", e), StatusIndicator::Red),
        };
        self.sections.push(StatusSection {
            label: "Oracle",
            value: oracle_val,
            indicator: oracle_ind,
        });

        // Pratibimba (always stub for now)
        self.sections.push(StatusSection {
            label: "Pratibimba",
            value: "Neo4j required".to_string(),
            indicator: StatusIndicator::Gray,
        });

        // Gateway status - try TCP connect
        let gateway_status = std::net::TcpStream::connect_timeout(
            &std::net::SocketAddr::from(([127, 0, 0, 1], 18794)),
            std::time::Duration::from_millis(200),
        );
        let (gw_val, gw_ind) = match gateway_status {
            Ok(_) => ("connected (port 18794)".to_string(), StatusIndicator::Green),
            Err(_) => ("offline".to_string(), StatusIndicator::Gray),
        };
        self.sections.push(StatusSection {
            label: "Gateway",
            value: gw_val,
            indicator: gw_ind,
        });
    }
}

impl HypertilePlugin for StatusPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let border_color = if is_focused { Color::Cyan } else { Color::DarkGray };
        let dim = Style::default().fg(Color::DarkGray);

        let mut lines: Vec<Line> = Vec::new();
        lines.push(Line::from(Span::styled(
            "  Cross-M Status Overview",
            Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD),
        )));
        lines.push(Line::from(""));

        for section in &self.sections {
            let ind_color = section.indicator.color();
            let ind_sym = section.indicator.symbol();
            lines.push(Line::from(vec![
                Span::styled(format!("  [{}] ", ind_sym), Style::default().fg(ind_color)),
                Span::styled(
                    format!("{:<12}", section.label),
                    Style::default().fg(Color::Yellow),
                ),
                Span::styled(&section.value, Style::default().fg(Color::White)),
            ]));
        }

        lines.push(Line::from(""));
        lines.push(Line::from(Span::styled(
            "  Read-only overview. Use CLI commands for actions.",
            dim,
        )));

        let para = Paragraph::new(lines).block(
            Block::default()
                .title(" Status ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(border_color)),
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
    fn help_plugin_renders_keybinding_reference() {
        let plugin = HelpPlugin::new();
        let area = Rect::new(0, 0, 60, 20);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content = buffer_to_string(&buf, area);
        assert!(
            content.contains("Alt"),
            "Should contain Alt keybinding references"
        );
    }

    #[test]
    fn help_plugin_renders_plugin_list() {
        let plugin = HelpPlugin::new();
        let area = Rect::new(0, 0, 60, 40);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content = buffer_to_string(&buf, area);
        assert!(
            content.contains("m4.identity"),
            "Should list m4.identity plugin"
        );
    }

    #[test]
    fn status_plugin_renders_title() {
        let plugin = StatusPlugin::new();
        let area = Rect::new(0, 0, 70, 20);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content = buffer_to_string(&buf, area);
        assert!(content.contains("Status"), "Should show Status title");
    }

    #[test]
    fn status_plugin_shows_sections() {
        let plugin = StatusPlugin::new();
        let area = Rect::new(0, 0, 70, 20);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content = buffer_to_string(&buf, area);
        assert!(content.contains("Identity"), "Should show Identity section");
        assert!(content.contains("Gateway"), "Should show Gateway section");
    }

    #[test]
    fn status_indicator_colors_are_distinct() {
        assert_ne!(StatusIndicator::Green.color(), StatusIndicator::Red.color());
        assert_ne!(StatusIndicator::Yellow.color(), StatusIndicator::Gray.color());
    }
}
