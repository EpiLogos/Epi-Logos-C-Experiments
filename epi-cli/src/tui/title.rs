use ratatui::{
    buffer::Buffer,
    layout::Rect,
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::Widget,
    Frame,
};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum TitleVariant {
    Mini,
    Small,
    Full,
}

const MINI_TITLE: &[&str] = &["epi-logos"];

const SMALL_TITLE: &[&str] = &[
    "                                    ",
    "         '      'T                  ",
    " m, .m, .m       ]   m,  mm  m,  m, ",
    "]`] ]`T  ]       ]  ]`T ]`T ]`T ] ' ",
    "]\"\" ] ]  ]   \"`  ]  ] ] ] ] ] ]  \"\\ ",
    "'b/ ]bP .dm      'm 'bP 'bT 'bP 'm/ ",
    "    ]                    ,]         ",
    "    '                    '`         ",
];

const FULL_TITLE: &[&str] = &[
    "                                                               ",
    "                 \"           \"\"#                               ",
    "  mmm   mmmm   mmm             #     mmm    mmmm   mmm    mmm  ",
    " #\"  #  #\" \"#    #             #    #\" \"#  #\" \"#  #\" \"#  #   \" ",
    " #\"\"\"\"  #   #    #     \"\"\"     #    #   #  #   #  #   #   \"\"\"m ",
    " \"#mm\"  ##m#\"  mm#mm           \"mm  \"#m#\"  \"#m\"#  \"#m#\"  \"mmm\" ",
    "        #                                   m  #               ",
    "        \"                                    \"\"                ",
];

pub(crate) fn title_variant(area: Rect) -> TitleVariant {
    if area.width < 70 || area.height < 18 {
        TitleVariant::Mini
    } else if area.width < 110 || area.height < 30 {
        TitleVariant::Small
    } else {
        TitleVariant::Full
    }
}

fn title_lines(variant: TitleVariant) -> &'static [&'static str] {
    match variant {
        TitleVariant::Mini => MINI_TITLE,
        TitleVariant::Small => SMALL_TITLE,
        TitleVariant::Full => FULL_TITLE,
    }
}

pub(crate) fn title_block_height(area: Rect) -> u16 {
    let lines = title_lines(title_variant(area));
    lines.len() as u16 + 1
}

pub(crate) fn render_title(area: Rect, buf: &mut Buffer) {
    let variant = title_variant(area);
    let lines = title_lines(variant);
    let height = lines.len() as u16;
    let width = lines.iter().map(|line| line.len()).max().unwrap_or(0) as u16;

    let x = area.x + area.width.saturating_sub(width) / 2;
    let y = area.y + area.height.saturating_sub(height) / 2;

    for (idx, text) in lines.iter().enumerate() {
        let style = title_style(variant, idx, lines.len(), text);
        let line = Line::from(Span::styled(*text, style));
        buf.set_line(
            x,
            y + idx as u16,
            &line,
            area.width.saturating_sub(x - area.x),
        );
    }
}

pub(crate) fn draw_title(frame: &mut Frame, area: Rect) {
    frame.render_widget(TitleWidget, area);
}

struct TitleWidget;

impl Widget for TitleWidget {
    fn render(self, area: Rect, buf: &mut Buffer) {
        render_title(area, buf);
    }
}

fn title_style(variant: TitleVariant, index: usize, total: usize, text: &str) -> Style {
    if text.trim().is_empty() {
        return Style::default();
    }

    if matches!(variant, TitleVariant::Mini) {
        return Style::default()
            .fg(Color::Cyan)
            .add_modifier(Modifier::BOLD);
    }

    let band = index * 3 / total.max(1);
    let color = match band {
        0 => Color::Green,
        1 => Color::Cyan,
        _ => Color::Magenta,
    };

    Style::default().fg(color).add_modifier(Modifier::BOLD)
}

#[cfg(test)]
mod tests {
    use super::*;
    use ratatui::buffer::Buffer;

    #[test]
    fn selects_mini_title_when_viewport_is_tight() {
        let area = Rect::new(0, 0, 52, 12);
        assert_eq!(title_variant(area), TitleVariant::Mini);
    }

    #[test]
    fn renders_mini_title_into_buffer() {
        let area = Rect::new(0, 0, 32, 4);
        let mut buffer = Buffer::empty(area);

        render_title(area, &mut buffer);

        let rendered = buffer
            .content()
            .iter()
            .map(|cell| cell.symbol())
            .collect::<String>();

        assert!(rendered.contains("epi-logos"));
    }
}
