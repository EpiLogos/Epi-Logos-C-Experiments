use ratatui::prelude::*;
use ratatui::widgets::*;
use ratatui_hypertile_extras::HypertilePlugin;
use crate::portal::theme;

pub struct M0DashboardPlugin;

impl M0DashboardPlugin {
    pub fn new() -> Self { Self }
}

impl HypertilePlugin for M0DashboardPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let para = Paragraph::new("M0' Coordinate Dashboard — stub")
            .block(Block::default()
                .title(" M0' Dashboard ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))));
        Widget::render(para, area, buf);
    }
}

pub struct M0FamiliesPlugin;

impl M0FamiliesPlugin {
    pub fn new() -> Self { Self }
}

impl HypertilePlugin for M0FamiliesPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let para = Paragraph::new("M0' Families Explorer — stub")
            .block(Block::default()
                .title(" M0' Families ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))));
        Widget::render(para, area, buf);
    }
}
