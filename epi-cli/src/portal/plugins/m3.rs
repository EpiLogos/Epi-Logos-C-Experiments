use crate::portal::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;
use ratatui_hypertile_extras::HypertilePlugin;

pub struct M3KnowingPlugin;

impl M3KnowingPlugin {
    pub fn new() -> Self {
        Self
    }
}

impl HypertilePlugin for M3KnowingPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let para = Paragraph::new("M3' Knowing Dossier — open with `epi core knowing <coord>`")
            .block(
                Block::default()
                    .title(" M3' Knowing ")
                    .borders(Borders::ALL)
                    .border_style(Style::default().fg(theme::pane_border(is_focused))),
            );
        Widget::render(para, area, buf);
    }
}
