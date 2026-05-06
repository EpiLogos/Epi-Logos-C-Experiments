use ratatui::style::Color;

/// M-level accent colors (spec section 9.2)
pub fn m_level_color(m: u8) -> Color {
    match m {
        0 => Color::Green,   // M0' Ground
        1 => Color::Cyan,    // M1' Mathematical
        2 => Color::Magenta, // M2' Vibrational
        3 => Color::Yellow,  // M3' Symbolic
        4 => Color::Red,     // M4' Personal
        5 => Color::White,   // M5' Integration
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
