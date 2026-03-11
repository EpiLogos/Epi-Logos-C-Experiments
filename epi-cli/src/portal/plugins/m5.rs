use ratatui::prelude::*;
use ratatui::widgets::*;
use ratatui_hypertile_extras::HypertilePlugin;
use crate::portal::theme;

pub struct M5LogosPlugin;

impl M5LogosPlugin {
    pub fn new() -> Self { Self }
}

impl HypertilePlugin for M5LogosPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let para = Paragraph::new("M5' Logos Cycle — stub")
            .block(Block::default()
                .title(" M5' Logos ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))));
        Widget::render(para, area, buf);
    }
}

pub struct M5ChatPlugin;

impl M5ChatPlugin {
    pub fn new() -> Self { Self }
}

impl HypertilePlugin for M5ChatPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let para = Paragraph::new("M5' Agent Chat — use `epi agent chat` for full experience")
            .block(Block::default()
                .title(" M5' Chat ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))));
        Widget::render(para, area, buf);
    }
}

pub struct M5FsmPlugin;

impl M5FsmPlugin {
    pub fn new() -> Self { Self }
}

impl HypertilePlugin for M5FsmPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let para = Paragraph::new("M5' Logos FSM — stub")
            .block(Block::default()
                .title(" M5' FSM ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))));
        Widget::render(para, area, buf);
    }
}
