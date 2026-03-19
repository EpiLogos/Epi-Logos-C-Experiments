use crate::portal::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;
use ratatui_hypertile_extras::HypertilePlugin;

pub struct M2VibrationalPlugin;

impl M2VibrationalPlugin {
    pub fn new() -> Self {
        Self
    }
}

impl HypertilePlugin for M2VibrationalPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let para =
            Paragraph::new("M2' Vibrational Matrix — requires M0-M3 visualiser implementation")
                .block(
                    Block::default()
                        .title(" M2' Vibrational ")
                        .borders(Borders::ALL)
                        .border_style(Style::default().fg(theme::pane_border(is_focused))),
                );
        Widget::render(para, area, buf);
    }
}
