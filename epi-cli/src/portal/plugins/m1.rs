use ratatui::prelude::*;
use ratatui::widgets::*;
use ratatui_hypertile_extras::HypertilePlugin;
use crate::portal::theme;

pub struct M1WalkPlugin;

impl M1WalkPlugin {
    pub fn new() -> Self { Self }
}

impl HypertilePlugin for M1WalkPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let para = Paragraph::new("M1' Torus Walk — stub")
            .block(Block::default()
                .title(" M1' Walk ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))));
        Widget::render(para, area, buf);
    }
}
