use crate::portal::clock_state::SharedClockState;
use crate::portal::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;
use ratatui_hypertile::{EventOutcome, HypertileEvent};
use ratatui_hypertile_extras::HypertilePlugin;

const ZODIAC_GLYPHS: [char; 12] = [
    '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓',
];

// Spanda tick labels (12 positions)
const TICK_LABELS: [&str; 12] = [
    "t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10", "t11",
];

pub struct MiniClockPlugin {
    shared_clock: Option<SharedClockState>,
    current_tick12: u8,
    current_degree: u16,
}

impl MiniClockPlugin {
    pub fn new() -> Self {
        Self {
            shared_clock: None,
            current_tick12: 0,
            current_degree: 0,
        }
    }

    pub fn new_with_clock(clock: SharedClockState) -> Self {
        let mut s = Self::new();
        s.shared_clock = Some(clock);
        s.sync_clock();
        s
    }

    pub fn tick_count(&self) -> usize {
        12
    }

    fn sync_clock(&mut self) {
        if let Some(ref clock) = self.shared_clock {
            let state = clock.lock().unwrap();
            self.current_tick12 = state.tick12;
            self.current_degree = state.current_degree;
        }
    }

    fn zodiac_sign_for_degree(degree: u16) -> usize {
        (degree / 30) as usize % 12
    }
}

impl HypertilePlugin for MiniClockPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let sign_idx = Self::zodiac_sign_for_degree(self.current_degree);

        // Build 12 tick labels with current tick highlighted
        let mut wheel_lines: Vec<Line> = Vec::new();
        wheel_lines.push(Line::from(vec![Span::styled(
            "  Spanda Wheel  ",
            Style::default()
                .fg(Color::Yellow)
                .add_modifier(Modifier::BOLD),
        )]));
        wheel_lines.push(Line::from(""));

        // Arrange ticks in two columns of 6
        for i in 0..6usize {
            let left_tick = i;
            let right_tick = i + 6;
            let left_active = self.current_tick12 as usize == left_tick;
            let right_active = self.current_tick12 as usize == right_tick;

            let left_span = Span::styled(
                format!(
                    "  {} {}",
                    TICK_LABELS[left_tick],
                    ZODIAC_GLYPHS[left_tick % 12]
                ),
                if left_active {
                    Style::default()
                        .fg(Color::Cyan)
                        .add_modifier(Modifier::BOLD)
                } else {
                    Style::default().fg(Color::DarkGray)
                },
            );
            let sep_span = Span::raw("  │  ");
            let right_span = Span::styled(
                format!(
                    "{} {} ",
                    ZODIAC_GLYPHS[right_tick % 12],
                    TICK_LABELS[right_tick]
                ),
                if right_active {
                    Style::default()
                        .fg(Color::Cyan)
                        .add_modifier(Modifier::BOLD)
                } else {
                    Style::default().fg(Color::DarkGray)
                },
            );
            wheel_lines.push(Line::from(vec![left_span, sep_span, right_span]));
        }

        wheel_lines.push(Line::from(""));
        wheel_lines.push(Line::from(vec![
            Span::styled("  degree: ", Style::default().fg(Color::DarkGray)),
            Span::styled(
                format!("{:3}°  {}", self.current_degree, ZODIAC_GLYPHS[sign_idx]),
                Style::default().fg(Color::Yellow),
            ),
        ]));
        wheel_lines.push(Line::from(vec![
            Span::styled("  tick12: ", Style::default().fg(Color::DarkGray)),
            Span::styled(
                format!(
                    "{} ({})",
                    self.current_tick12,
                    TICK_LABELS[self.current_tick12 as usize % 12]
                ),
                Style::default().fg(Color::Cyan),
            ),
        ]));

        // Walk mode + bifurcation gauge
        if let Some(ref cs) = self.shared_clock {
            if let Ok(s) = cs.lock() {
                let walk_color = match s.walk_mode {
                    crate::portal::clock_state::WalkMode::Ground => Color::White,
                    crate::portal::clock_state::WalkMode::Torus => Color::Red,
                    crate::portal::clock_state::WalkMode::Fiber => Color::Blue,
                    crate::portal::clock_state::WalkMode::Spanda => Color::Cyan,
                };
                let lambda_bars = (s.bifurcation_param * 8.0).round() as usize;
                let bar = "▓".repeat(lambda_bars.min(8)) + &"░".repeat(8 - lambda_bars.min(8));
                wheel_lines.push(Line::from(vec![
                    Span::styled(
                        format!("  {} ", s.walk_mode.label()),
                        Style::default().fg(walk_color),
                    ),
                    Span::styled(bar, Style::default().fg(Color::Yellow)),
                ]));
            }
        }

        let para = Paragraph::new(wheel_lines).block(
            Block::default()
                .title(" M' Mini Clock ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))),
        );
        Widget::render(para, area, buf);
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        match event {
            HypertileEvent::Tick => {
                self.sync_clock();
                EventOutcome::Consumed
            }
            _ => EventOutcome::Ignored,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tick_count_is_12() {
        let plugin = MiniClockPlugin::new();
        assert_eq!(plugin.tick_count(), 12);
    }

    #[test]
    fn zodiac_sign_for_degree_0_is_aries() {
        assert_eq!(MiniClockPlugin::zodiac_sign_for_degree(0), 0); // Aries
    }

    #[test]
    fn zodiac_sign_for_degree_30_is_taurus() {
        assert_eq!(MiniClockPlugin::zodiac_sign_for_degree(30), 1); // Taurus
    }

    #[test]
    fn zodiac_sign_for_degree_359_is_pisces() {
        assert_eq!(MiniClockPlugin::zodiac_sign_for_degree(359), 11); // Pisces
    }

    #[test]
    fn new_with_clock_creates_plugin() {
        use crate::portal::clock_state::new_shared_clock_state;
        let clock = new_shared_clock_state();
        let plugin = MiniClockPlugin::new_with_clock(clock);
        assert_eq!(plugin.tick_count(), 12);
    }
}
