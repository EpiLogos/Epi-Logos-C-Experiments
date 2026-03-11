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
}
