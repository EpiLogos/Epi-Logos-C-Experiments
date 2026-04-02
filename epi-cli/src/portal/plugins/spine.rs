use std::time::{SystemTime, UNIX_EPOCH};

use crate::portal::clock_state::SharedClockState;
use crate::portal::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;
use ratatui_hypertile::{EventOutcome, HypertileEvent};
use ratatui_hypertile_extras::HypertilePlugin;

const CHAKRA_SYMBOLS: [char; 8] = ['⊕', '①', '②', '③', '④', '⑤', '⑥', '⑦'];
const CHAKRA_NAMES: [&str; 8] = [
    "Muladhara",    // 0 Root
    "Svadhisthana", // 1 Sacral
    "Manipura",     // 2 Solar Plexus
    "Anahata",      // 3 Heart
    "Vishuddha",    // 4 Throat
    "Ajna",         // 5 Third Eye
    "Sahasrara",    // 6 Crown
    "Bindu",        // 7 Transpersonal
];
const CHAKRA_COLORS: [Color; 8] = [
    Color::Red,       // Root
    Color::LightRed,
    Color::Yellow,
    Color::Green,
    Color::Cyan,
    Color::LightBlue,
    Color::Magenta,
    Color::White,     // Bindu
];

/// Oracle decay: levels fade to neutral (0.5) over 4 hours (14400 seconds)
const ORACLE_DECAY_SECS: f32 = 14400.0;
const NEUTRAL_LEVEL: f32 = 0.5;

pub struct M4SpinePlugin {
    shared_clock: Option<SharedClockState>,
    chakra_levels: [f32; 8],
    active_chakra: u8,
    last_cast_ts: u64,
}

impl M4SpinePlugin {
    pub fn new() -> Self {
        Self {
            shared_clock: None,
            chakra_levels: [NEUTRAL_LEVEL; 8],
            active_chakra: 0xFF,
            last_cast_ts: 0,
        }
    }

    pub fn new_with_clock(clock: SharedClockState) -> Self {
        let mut s = Self::new();
        s.shared_clock = Some(clock);
        s.sync_clock();
        s
    }

    pub fn chakra_levels(&self) -> &[f32] {
        &self.chakra_levels
    }

    fn sync_clock(&mut self) {
        if let Some(ref clock) = self.shared_clock {
            let state = clock.lock().unwrap();
            self.last_cast_ts = state.last_cast_timestamp;
            self.active_chakra = state.kairos.active_chakra;

            // Apply oracle decay to raw chakra levels
            let now_secs = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or(0);
            let elapsed = now_secs.saturating_sub(self.last_cast_ts) as f32;
            let decay = (elapsed / ORACLE_DECAY_SECS).min(1.0);

            for (i, level) in state.chakra_levels.iter().enumerate() {
                // Lerp from raw level toward neutral as time passes
                self.chakra_levels[i] = level + (NEUTRAL_LEVEL - level) * decay;
            }
        }
    }

    fn level_bar(level: f32, width: usize) -> String {
        let filled = (level.clamp(0.0, 1.0) * width as f32) as usize;
        let blocks = ['░', '▒', '▓', '█'];
        let full_blocks = filled;
        let frac = (level * width as f32).fract();
        let partial_idx = (frac * 4.0) as usize;
        let partial = if full_blocks < width && frac > 0.0 {
            Some(blocks[partial_idx.min(3)])
        } else {
            None
        };
        let empty = width
            .saturating_sub(full_blocks)
            .saturating_sub(if partial.is_some() { 1 } else { 0 });
        let mut bar = String::new();
        for _ in 0..full_blocks {
            bar.push('█');
        }
        if let Some(p) = partial {
            bar.push(p);
        }
        for _ in 0..empty {
            bar.push(' ');
        }
        bar
    }
}

impl HypertilePlugin for M4SpinePlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let bar_width = (area.width as usize)
            .saturating_sub(24)
            .min(20)
            .max(4);
        let mut lines: Vec<Line> = Vec::new();

        lines.push(Line::from(Span::styled(
            "  Chakra Spine  ",
            Style::default()
                .fg(Color::Magenta)
                .add_modifier(Modifier::BOLD),
        )));
        lines.push(Line::from(""));

        for i in (0..8usize).rev() {
            let level = self.chakra_levels[i];
            let bar = Self::level_bar(level, bar_width);
            let is_active = self.active_chakra as usize == i;
            let glyph_style = if is_active {
                Style::default()
                    .fg(CHAKRA_COLORS[i])
                    .add_modifier(Modifier::BOLD)
            } else {
                Style::default().fg(CHAKRA_COLORS[i])
            };
            let bar_style = Style::default().fg(CHAKRA_COLORS[i]);
            let label_style = if is_active {
                Style::default()
                    .fg(Color::White)
                    .add_modifier(Modifier::BOLD)
            } else {
                Style::default().fg(Color::DarkGray)
            };
            lines.push(Line::from(vec![
                Span::styled(format!("  {} ", CHAKRA_SYMBOLS[i]), glyph_style),
                Span::styled(format!("{:<14}", CHAKRA_NAMES[i]), label_style),
                Span::styled(format!("[{}]", bar), bar_style),
                Span::styled(
                    format!(" {:.0}%", level * 100.0),
                    Style::default().fg(Color::DarkGray),
                ),
            ]));
        }

        // λ-modulated resolution indicator
        lines.push(Line::from(""));
        if let Some(ref cs) = self.shared_clock {
            if let Ok(s) = cs.lock() {
                let res_marker = match s.resolution_level {
                    0 => "·  6-fold",
                    1 => "∘  12-fold",
                    2 => "○  36-fold",
                    _ => "●  72-fold",
                };
                lines.push(Line::from(vec![
                    Span::styled(
                        format!("  λ={:.2} ", s.bifurcation_param),
                        Style::default().fg(Color::Yellow),
                    ),
                    Span::styled(
                        res_marker.to_string(),
                        Style::default().fg(Color::Cyan),
                    ),
                ]));
            }
        }

        lines.push(Line::from(vec![Span::styled(
            "  EarthBody Observer",
            Style::default()
                .fg(Color::Green)
                .add_modifier(Modifier::DIM),
        )]));

        if self.last_cast_ts > 0 {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or(0);
            let age_mins = now.saturating_sub(self.last_cast_ts) / 60;
            lines.push(Line::from(vec![Span::styled(
                format!("  last oracle: {}m ago", age_mins),
                Style::default()
                    .fg(Color::DarkGray)
                    .add_modifier(Modifier::DIM),
            )]));
        }

        let para = Paragraph::new(lines).block(
            Block::default()
                .title(" M4 Spine ")
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
    fn chakra_levels_has_8_entries() {
        let plugin = M4SpinePlugin::new();
        assert_eq!(plugin.chakra_levels().len(), 8);
    }

    #[test]
    fn default_levels_are_neutral() {
        let plugin = M4SpinePlugin::new();
        for &level in plugin.chakra_levels() {
            assert!((level - NEUTRAL_LEVEL).abs() < f32::EPSILON);
        }
    }

    #[test]
    fn level_bar_full_is_all_blocks() {
        let bar = M4SpinePlugin::level_bar(1.0, 10);
        assert_eq!(bar.chars().count(), 10);
        assert!(bar.chars().all(|c| c == '█'));
    }

    #[test]
    fn level_bar_zero_is_all_empty() {
        let bar = M4SpinePlugin::level_bar(0.0, 10);
        assert_eq!(bar.chars().count(), 10);
        assert!(bar.chars().all(|c| c == ' '));
    }

    #[test]
    fn new_with_clock_creates_plugin() {
        use crate::portal::clock_state::new_shared_clock_state;
        let clock = new_shared_clock_state();
        let plugin = M4SpinePlugin::new_with_clock(clock);
        assert_eq!(plugin.chakra_levels().len(), 8);
    }
}
