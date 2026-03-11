use ratatui::prelude::*;
use ratatui::widgets::*;
use ratatui_hypertile::{EventOutcome, HypertileEvent, KeyCode};
use ratatui_hypertile_extras::HypertilePlugin;

use crate::ffi::{EpiLib, WalkContext};
use crate::portal::theme;

pub struct M1WalkPlugin {
    epi: EpiLib,
    ctx: WalkContext,
    history: Vec<(u8, u8)>, // (position, covering) at each step
}

// EpiLib holds raw pointers to .rodata (static lifetime), safe to send
unsafe impl Send for M1WalkPlugin {}

impl M1WalkPlugin {
    pub fn new() -> Self {
        Self {
            epi: EpiLib::new(),
            ctx: WalkContext::default(),
            history: vec![(0, 0)],
        }
    }

    pub fn with_epi(epi: &EpiLib) -> Self {
        // EpiLib::new() is cheap — just reads static addresses
        // We create our own since we need ownership
        let _ = epi;
        Self::new()
    }

    fn step(&mut self) {
        self.epi
            .torus_walk(self.epi.psychoid_0, &mut self.ctx, 1);
        self.history
            .push((self.ctx.current_position, self.ctx.covering));
    }

    fn reset(&mut self) {
        self.ctx = WalkContext::default();
        self.history = vec![(0, 0)];
    }

    fn double_cover(&mut self) {
        self.epi
            .double_covering(self.epi.psychoid_0, &mut self.ctx);
        self.history
            .push((self.ctx.current_position, self.ctx.covering));
    }

    fn render_torus_strip(&self, area: Rect, buf: &mut Buffer) {
        let pos = self.ctx.current_position;
        let inv = self.ctx.covering != 0;

        let positions: [(u8, &str); 6] = [
            (0, "#0"),
            (1, "#1"),
            (2, "#2"),
            (3, "#3"),
            (4, "#4"),
            (5, "#5"),
        ];

        let mut spans: Vec<Span> = vec![Span::raw("  ")];
        for (i, (p, label)) in positions.iter().enumerate() {
            let active = pos == *p;
            let style = if active && inv {
                Style::default()
                    .fg(Color::Black)
                    .bg(Color::Red)
                    .add_modifier(Modifier::BOLD)
            } else if active {
                Style::default()
                    .fg(Color::Black)
                    .bg(Color::Green)
                    .add_modifier(Modifier::BOLD)
            } else if *p == 4 {
                Style::default().fg(Color::Cyan)
            } else {
                Style::default().fg(Color::White)
            };
            spans.push(Span::styled(format!(" {} ", label), style));
            if i < 5 {
                let arrow = if *p == 4 { " \u{22B8} " } else { " \u{2192} " };
                spans.push(Span::styled(arrow, Style::default().fg(Color::DarkGray)));
            }
        }
        spans.push(Span::styled(
            " \u{2192} ",
            Style::default().fg(Color::DarkGray),
        ));
        spans.push(Span::styled("#0", Style::default().fg(Color::Green)));
        spans.push(Span::styled(
            " \u{21BB}",
            Style::default().fg(Color::Green),
        ));

        let covering_label = if inv { "INVERTED (')" } else { "NORMAL" };
        let covering_style = if inv {
            Style::default().fg(Color::Red).add_modifier(Modifier::BOLD)
        } else {
            Style::default().fg(Color::Green)
        };

        let text = vec![
            Line::from(spans),
            Line::from(""),
            Line::from(vec![
                Span::styled("  Covering: ", Style::default().fg(Color::DarkGray)),
                Span::styled(covering_label, covering_style),
            ]),
        ];

        let para = Paragraph::new(text).block(
            Block::default()
                .title(" Torus Walk \u{2014} Interactive ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(Color::Magenta)),
        );
        Widget::render(para, area, buf);
    }

    fn render_state(&self, area: Rect, buf: &mut Buffer) {
        let pos_name = crate::core::position_name(self.ctx.current_position);
        let text = vec![
            Line::from(vec![
                Span::styled("  Position:  ", Style::default().fg(Color::DarkGray)),
                Span::styled(
                    format!("#{} ({})", self.ctx.current_position, pos_name),
                    Style::default()
                        .fg(Color::White)
                        .add_modifier(Modifier::BOLD),
                ),
            ]),
            Line::from(vec![
                Span::styled("  Steps:     ", Style::default().fg(Color::DarkGray)),
                Span::raw(format!("{}", self.ctx.step_count)),
            ]),
            Line::from(vec![
                Span::styled("  Cycles:    ", Style::default().fg(Color::DarkGray)),
                Span::raw(format!("{}", self.ctx.cycle_count)),
            ]),
            Line::from(vec![
                Span::styled("  Covering:  ", Style::default().fg(Color::DarkGray)),
                Span::raw(if self.ctx.covering == 0 {
                    "Normal"
                } else {
                    "Inverted"
                }),
            ]),
        ];
        let para = Paragraph::new(text).block(
            Block::default()
                .title(" State ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(Color::Green)),
        );
        Widget::render(para, area, buf);
    }

    fn render_history(&self, area: Rect, buf: &mut Buffer) {
        let max_lines = area.height.saturating_sub(2) as usize;
        let start = if self.history.len() > max_lines {
            self.history.len() - max_lines
        } else {
            0
        };

        let lines: Vec<Line> = self.history[start..]
            .iter()
            .enumerate()
            .map(|(i, (pos, cov))| {
                let step_num = start + i;
                let inv_marker = if *cov != 0 { "'" } else { " " };
                let color = match pos {
                    0 => Color::Green,
                    4 => Color::Cyan,
                    5 => Color::Magenta,
                    _ => Color::White,
                };
                Line::from(vec![
                    Span::styled(
                        format!("  {:>3}  ", step_num),
                        Style::default().fg(Color::DarkGray),
                    ),
                    Span::styled(
                        format!("#{}{}", pos, inv_marker),
                        Style::default().fg(color),
                    ),
                    Span::styled(
                        format!("  {}", crate::core::position_name(*pos)),
                        Style::default().fg(Color::DarkGray),
                    ),
                ])
            })
            .collect();

        let para = Paragraph::new(lines).block(
            Block::default()
                .title(" Walk History ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(Color::Cyan)),
        );
        Widget::render(para, area, buf);
    }

    fn render_footer(&self, area: Rect, buf: &mut Buffer) {
        let text = Line::from(vec![
            Span::styled(
                " [space]",
                Style::default()
                    .fg(Color::Cyan)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::raw(" step  "),
            Span::styled(
                "[c]",
                Style::default()
                    .fg(Color::Yellow)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::raw(" double-cover  "),
            Span::styled(
                "[r]",
                Style::default().fg(Color::Red).add_modifier(Modifier::BOLD),
            ),
            Span::raw(" reset"),
        ]);
        let footer = Paragraph::new(text).block(
            Block::default()
                .borders(Borders::ALL)
                .border_style(Style::default().fg(Color::DarkGray)),
        );
        Widget::render(footer, area, buf);
    }
}

impl HypertilePlugin for M1WalkPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        // Wrap in an outer border to show focus state
        let block = Block::default()
            .title(" M1' Walk ")
            .borders(Borders::ALL)
            .border_style(Style::default().fg(theme::pane_border(is_focused)));
        let inner = block.inner(area);
        Widget::render(block, area, buf);

        // Re-layout within the inner area (after border)
        let chunks = Layout::default()
            .direction(Direction::Vertical)
            .constraints([
                Constraint::Length(5),
                Constraint::Min(6),
                Constraint::Length(3),
            ])
            .split(inner);

        self.render_torus_strip(chunks[0], buf);

        // Middle: state + history side by side
        let mid = Layout::default()
            .direction(Direction::Horizontal)
            .constraints([Constraint::Percentage(40), Constraint::Percentage(60)])
            .split(chunks[1]);

        self.render_state(mid[0], buf);
        self.render_history(mid[1], buf);

        self.render_footer(chunks[2], buf);
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        if let HypertileEvent::Key(chord) = event {
            match chord.code {
                KeyCode::Char(' ') => {
                    self.step();
                    return EventOutcome::Consumed;
                }
                KeyCode::Char('c') => {
                    self.double_cover();
                    return EventOutcome::Consumed;
                }
                KeyCode::Char('r') => {
                    self.reset();
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
    fn m1_walk_renders_torus_position() {
        let plugin = M1WalkPlugin::new();
        let area = Rect::new(0, 0, 80, 24);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content = buffer_to_string(&buf, area);
        assert!(content.contains("#0"), "Should show torus position #0");
    }

    #[test]
    fn m1_walk_step_increments_step_count() {
        let mut plugin = M1WalkPlugin::new();
        assert_eq!(plugin.ctx.step_count, 0);
        plugin.step();
        assert!(plugin.ctx.step_count > 0, "Step count should increase after step");
        assert_eq!(plugin.history.len(), 2);
    }

    #[test]
    fn m1_walk_reset_returns_to_ground() {
        let mut plugin = M1WalkPlugin::new();
        plugin.step();
        plugin.step();
        plugin.reset();
        assert_eq!(plugin.ctx.current_position, 0);
        assert_eq!(plugin.ctx.step_count, 0);
        assert_eq!(plugin.history.len(), 1);
    }

    #[test]
    fn m1_walk_double_cover_completes() {
        let mut plugin = M1WalkPlugin::new();
        plugin.double_cover();
        // double_covering does a full 720 walk then resets covering to 0
        assert!(plugin.ctx.step_count > 0, "Should have walked steps");
        assert_eq!(plugin.history.len(), 2);
    }

    #[test]
    fn m1_walk_event_space_steps() {
        let mut plugin = M1WalkPlugin::new();
        let space = HypertileEvent::Key(ratatui_hypertile::KeyChord {
            code: KeyCode::Char(' '),
            modifiers: ratatui_hypertile::Modifiers::NONE,
        });
        let result = plugin.on_event(&space);
        assert!(matches!(result, EventOutcome::Consumed));
        assert!(plugin.ctx.step_count > 0);
    }

    #[test]
    fn m1_walk_event_r_resets() {
        let mut plugin = M1WalkPlugin::new();
        plugin.step();
        plugin.step();
        let reset = HypertileEvent::Key(ratatui_hypertile::KeyChord {
            code: KeyCode::Char('r'),
            modifiers: ratatui_hypertile::Modifiers::NONE,
        });
        let result = plugin.on_event(&reset);
        assert!(matches!(result, EventOutcome::Consumed));
        assert_eq!(plugin.ctx.step_count, 0);
    }

    #[test]
    fn m1_walk_ignores_unknown_keys() {
        let mut plugin = M1WalkPlugin::new();
        let unknown = HypertileEvent::Key(ratatui_hypertile::KeyChord {
            code: KeyCode::Char('z'),
            modifiers: ratatui_hypertile::Modifiers::NONE,
        });
        let result = plugin.on_event(&unknown);
        assert!(matches!(result, EventOutcome::Ignored));
    }
}
