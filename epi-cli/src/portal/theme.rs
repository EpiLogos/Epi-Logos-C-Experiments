use ratatui::style::{Color, Modifier, Style};

/// M-level accent colors (spec section 9.2)
pub fn m_level_color(m: u8) -> Color {
    match m {
        0 => Color::Green,     // M0' Ground
        1 => Color::Cyan,      // M1' Mathematical
        2 => Color::Magenta,   // M2' Vibrational
        3 => Color::Yellow,    // M3' Symbolic
        4 => Color::Red,       // M4' Personal
        5 => Color::White,     // M5' Integration
        _ => Color::DarkGray,
    }
}

pub fn pane_border(focused: bool) -> Color {
    if focused {
        Color::Cyan
    } else {
        Color::DarkGray
    }
}

pub fn tab_style(active: bool) -> Style {
    if active {
        Style::default()
            .fg(Color::Cyan)
            .add_modifier(Modifier::BOLD)
    } else {
        Style::default().fg(Color::DarkGray)
    }
}

pub fn status_ok() -> Style {
    Style::default().fg(Color::Green)
}
pub fn status_warn() -> Style {
    Style::default().fg(Color::Yellow)
}
pub fn status_error() -> Style {
    Style::default().fg(Color::Red)
}
pub fn input_cursor() -> Style {
    Style::default().fg(Color::Yellow)
}

pub fn pane_title(m_level: u8) -> Style {
    Style::default()
        .fg(m_level_color(m_level))
        .add_modifier(Modifier::BOLD)
}

#[cfg(test)]
mod tests {
    use super::*;
    use ratatui::style::Color;

    #[test]
    fn m_level_colors_are_distinct() {
        let colors: Vec<Color> = (0..=5).map(|m| m_level_color(m)).collect();
        for i in 0..colors.len() {
            for j in (i + 1)..colors.len() {
                assert_ne!(
                    colors[i], colors[j],
                    "M{} and M{} should have different colors",
                    i, j
                );
            }
        }
    }

    #[test]
    fn pane_border_color_changes_with_focus() {
        assert_ne!(pane_border(true), pane_border(false));
    }
}
