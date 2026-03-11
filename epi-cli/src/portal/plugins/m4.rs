use ratatui::prelude::*;
use ratatui::widgets::*;
use ratatui_hypertile_extras::HypertilePlugin;
use crate::portal::theme;

pub struct M4IdentityPlugin;

impl M4IdentityPlugin {
    pub fn new() -> Self { Self }
}

impl HypertilePlugin for M4IdentityPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let para = Paragraph::new("M4' Identity/Kairos — stub")
            .block(Block::default()
                .title(" M4' Identity ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))));
        Widget::render(para, area, buf);
    }
}

pub struct M4FlowPlugin;

impl M4FlowPlugin {
    pub fn new() -> Self { Self }
}

impl HypertilePlugin for M4FlowPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let para = Paragraph::new("M4' Flow Writer — stub")
            .block(Block::default()
                .title(" M4' Flow ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))));
        Widget::render(para, area, buf);
    }
}

pub struct M4OraclePlugin;

impl M4OraclePlugin {
    pub fn new() -> Self { Self }
}

impl HypertilePlugin for M4OraclePlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let para = Paragraph::new("M4' Oracle — stub")
            .block(Block::default()
                .title(" M4' Oracle ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))));
        Widget::render(para, area, buf);
    }
}

pub struct M4MedicinePlugin;

impl M4MedicinePlugin {
    pub fn new() -> Self { Self }
}

impl HypertilePlugin for M4MedicinePlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let para = Paragraph::new("M4' Medicine — stub")
            .block(Block::default()
                .title(" M4' Medicine ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))));
        Widget::render(para, area, buf);
    }
}

pub struct M4TransformPlugin;

impl M4TransformPlugin {
    pub fn new() -> Self { Self }
}

impl HypertilePlugin for M4TransformPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let para = Paragraph::new("M4' Transform — stub")
            .block(Block::default()
                .title(" M4' Transform ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))));
        Widget::render(para, area, buf);
    }
}

pub struct M4LensPlugin;

impl M4LensPlugin {
    pub fn new() -> Self { Self }
}

impl HypertilePlugin for M4LensPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let para = Paragraph::new("M4' Lens — stub")
            .block(Block::default()
                .title(" M4' Lens ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))));
        Widget::render(para, area, buf);
    }
}

pub struct M4PratibimbaPlugin;

impl M4PratibimbaPlugin {
    pub fn new() -> Self { Self }
}

impl HypertilePlugin for M4PratibimbaPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let para = Paragraph::new("M4' Pratibimba — stub")
            .block(Block::default()
                .title(" M4' Pratibimba ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))));
        Widget::render(para, area, buf);
    }
}
