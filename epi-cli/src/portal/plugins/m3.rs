use std::sync::mpsc::{channel, Receiver, Sender};

use crate::core::knowing::{build_family_dossier_with_mode, types::KnowingDossier, DossierMode};
use crate::core::overlay;
use crate::portal::clock_state::SharedClockState;
use crate::portal::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;
use ratatui_hypertile::{EventOutcome, HypertileEvent, KeyCode};
use ratatui_hypertile_extras::{HypertilePlugin, PluginContext};

// ── Background load types ─────────────────────────────────────────────────────

enum LoadResult {
    Ok(KnowingDossier),
    Err(String),
}

// ── Focus state ───────────────────────────────────────────────────────────────

#[derive(Clone, Copy, PartialEq)]
enum PanelFocus {
    CoordinateInput,
    Essence,
    QvFacets,
    Structural,
    Relations,
    Vimarsa,
    Actions,
}

// ── Plugin struct ─────────────────────────────────────────────────────────────

pub struct M3KnowingPlugin {
    coordinate_input: String,
    input_mode: bool,
    dossier: Option<KnowingDossier>,
    loading: bool,
    error: Option<String>,
    focus: PanelFocus,
    struct_selected: usize,
    vimarsa_selected: usize,
    essence_scroll: usize,
    history: Vec<String>,
    shared_clock: Option<SharedClockState>,
    result_tx: Sender<LoadResult>,
    result_rx: Receiver<LoadResult>,
    spinner_frame: usize,
    mounted: bool,
}

const SPINNER: [char; 10] = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

const FAMILY_NAMES: [&str; 6] = ["C", "P", "L", "S", "T", "M"];
const FAMILY_DOMAINS: [&str; 6] = [
    "Ontological Foundation",
    "Functional Semantics",
    "Epistemic Modes",
    "Technology Layers",
    "Artifacts / Cognition",
    "Consciousness Domains",
];
const FAMILY_COLORS: [Color; 6] = [
    Color::Green,   // C
    Color::Magenta, // P
    Color::Yellow,  // L
    Color::Cyan,    // S
    Color::White,   // T
    Color::Red,     // M
];

impl M3KnowingPlugin {
    pub fn new() -> Self {
        let (tx, rx) = channel();
        Self {
            coordinate_input: String::new(),
            input_mode: false,
            dossier: None,
            loading: false,
            error: None,
            focus: PanelFocus::CoordinateInput,
            struct_selected: 0,
            vimarsa_selected: 0,
            essence_scroll: 0,
            history: Vec::new(),
            shared_clock: None,
            result_tx: tx,
            result_rx: rx,
            spinner_frame: 0,
            mounted: false,
        }
    }

    pub fn new_with_clock(clock: SharedClockState) -> Self {
        let mut s = Self::new();
        s.shared_clock = Some(clock);
        s
    }

    fn do_mount(&mut self) {
        if self.coordinate_input.is_empty() {
            let suggested = if let Some(ref clock) = self.shared_clock {
                let state = clock.lock().unwrap();
                format!("C{}", state.tick12 % 6)
            } else {
                "C0".to_string()
            };
            self.coordinate_input = suggested.clone();
            self.trigger_load(suggested);
        }
        self.mounted = true;
    }

    fn trigger_load(&mut self, coordinate: String) {
        self.loading = true;
        self.error = None;
        self.dossier = None;
        let tx = self.result_tx.clone();
        let coord = coordinate.clone();
        std::thread::spawn(move || {
            if let Some((family, pos, inverted)) = parse_coordinate(&coord) {
                let dossier = build_family_dossier_with_mode(
                    family,
                    pos,
                    inverted,
                    None,
                    20,
                    DossierMode::Full,
                );
                let _ = tx.send(LoadResult::Ok(dossier));
            } else {
                let _ = tx.send(LoadResult::Err(format!(
                    "Invalid coordinate: '{}'. Use format: C0, P3, M4, etc.",
                    coord
                )));
            }
        });
    }

    fn poll_load_result(&mut self) {
        if let Ok(result) = self.result_rx.try_recv() {
            self.loading = false;
            match result {
                LoadResult::Ok(d) => {
                    self.dossier = Some(d);
                }
                LoadResult::Err(msg) => {
                    self.error = Some(msg);
                }
            }
        }
    }
}

// ── Coordinate parser ─────────────────────────────────────────────────────────

/// Returns (family_id, archetype_pos, is_inverted)
/// family_id: C=0, P=1, L=2, S=3, T=4, M=5
fn parse_coordinate(input: &str) -> Option<(u8, u8, bool)> {
    let s = input.trim().to_uppercase();
    let inverted = s.ends_with('\'');
    let s = if inverted { &s[..s.len() - 1] } else { &s[..] };
    if s.len() < 2 {
        return None;
    }
    let family = match s.chars().next()? {
        'C' => 0u8,
        'P' => 1,
        'L' => 2,
        'S' => 3,
        'T' => 4,
        'M' => 5,
        _ => return None,
    };
    let pos: u8 = s[1..].parse().ok()?;
    if pos > 5 {
        return None;
    }
    Some((family, pos, inverted))
}

// ── HypertilePlugin impl ──────────────────────────────────────────────────────

impl HypertilePlugin for M3KnowingPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        // Outer layout: input bar / main / action bar
        let rows = Layout::vertical([
            Constraint::Length(3),
            Constraint::Min(1),
            Constraint::Length(3),
        ])
        .split(area);

        // ── Row 0: Coordinate Input Bar ──────────────────────────────────────
        let clock_hint = if let Some(ref d) = self.dossier {
            let pos = parse_coordinate(&d.coordinate)
                .map(|(_, p, _)| p)
                .unwrap_or(0);
            format!("  {} · pos {}", d.title, pos)
        } else if self.loading {
            "  Loading...".to_string()
        } else {
            String::new()
        };
        let input_text = format!(
            " Coord: [{}]{}  [↑/↓] history ({})",
            self.coordinate_input,
            clock_hint,
            self.history.len()
        );
        let input_border_style = if self.focus == PanelFocus::CoordinateInput && is_focused {
            Style::default().fg(Color::Yellow)
        } else {
            Style::default().fg(theme::pane_border(is_focused))
        };
        let input_para = Paragraph::new(input_text).block(
            Block::default()
                .title(" M3' Knowing Dossier ")
                .borders(Borders::ALL)
                .border_style(input_border_style),
        );
        Widget::render(input_para, rows[0], buf);

        // ── Row 1: Main Content ───────────────────────────────────────────────
        let cols = Layout::horizontal([
            Constraint::Percentage(60),
            Constraint::Percentage(40),
        ])
        .split(rows[1]);

        let left = Layout::vertical([
            Constraint::Percentage(35),
            Constraint::Percentage(65),
        ])
        .split(cols[0]);

        let right = Layout::vertical([
            Constraint::Percentage(50),
            Constraint::Percentage(50),
        ])
        .split(cols[1]);

        // Left-top: Essence
        self.render_essence(left[0], buf, is_focused);
        // Left-bottom: Structural
        self.render_structural(left[1], buf, is_focused);
        // Right-top: QV Facets
        self.render_qv_facets(right[0], buf, is_focused);
        // Right-bottom: Relations + Vimarsa
        let right_bottom = Layout::vertical([
            Constraint::Percentage(50),
            Constraint::Percentage(50),
        ])
        .split(right[1]);
        self.render_relations(right_bottom[0], buf, is_focused);
        self.render_vimarsa(right_bottom[1], buf, is_focused);

        // ── Row 2: Action Bar ─────────────────────────────────────────────────
        let back_enabled = !self.history.is_empty();
        let refresh_enabled = !self.loading;
        let action_text = format!(
            " {} Refresh  [o] Open  [g] Glow  {} Back  [c] Copy  [?] Help",
            if refresh_enabled { "[r]" } else { " r " },
            if back_enabled { "[←]" } else { " ← " },
        );
        let action_style = Style::default().fg(Color::DarkGray);
        let action_para = Paragraph::new(action_text).style(action_style);
        Widget::render(action_para, rows[2], buf);
    }

    fn on_mount(&mut self, _ctx: PluginContext) {
        self.do_mount();
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        match event {
            HypertileEvent::Tick => {
                self.poll_load_result();
                if self.loading {
                    self.spinner_frame = (self.spinner_frame + 1) % SPINNER.len();
                }
                EventOutcome::Consumed
            }
            HypertileEvent::Key(key) => {
                if self.input_mode {
                    match &key.code {
                        KeyCode::Char(c) => {
                            self.coordinate_input.push(*c);
                            EventOutcome::Consumed
                        }
                        KeyCode::Backspace => {
                            self.coordinate_input.pop();
                            EventOutcome::Consumed
                        }
                        KeyCode::Enter => {
                            self.input_mode = false;
                            let coord = self.coordinate_input.trim().to_uppercase();
                            if parse_coordinate(&coord).is_some() {
                                if let Some(prev) =
                                    self.dossier.as_ref().map(|d| d.coordinate.clone())
                                {
                                    self.history.push(prev);
                                }
                                self.trigger_load(coord);
                                self.focus = PanelFocus::Essence;
                            }
                            EventOutcome::Consumed
                        }
                        KeyCode::Escape => {
                            self.input_mode = false;
                            self.focus = PanelFocus::Essence;
                            EventOutcome::Consumed
                        }
                        _ => EventOutcome::Ignored,
                    }
                } else {
                    match &key.code {
                        KeyCode::Char('i') | KeyCode::Char('/') => {
                            self.input_mode = true;
                            self.focus = PanelFocus::CoordinateInput;
                            EventOutcome::Consumed
                        }
                        KeyCode::Tab => {
                            self.focus = match self.focus {
                                PanelFocus::CoordinateInput => PanelFocus::Essence,
                                PanelFocus::Essence => PanelFocus::QvFacets,
                                PanelFocus::QvFacets => PanelFocus::Structural,
                                PanelFocus::Structural => PanelFocus::Relations,
                                PanelFocus::Relations => PanelFocus::Vimarsa,
                                PanelFocus::Vimarsa => PanelFocus::Actions,
                                PanelFocus::Actions => PanelFocus::CoordinateInput,
                            };
                            EventOutcome::Consumed
                        }
                        KeyCode::Up | KeyCode::Char('k') => {
                            match self.focus {
                                PanelFocus::Structural => {
                                    if self.struct_selected > 0 {
                                        self.struct_selected -= 1;
                                    }
                                }
                                PanelFocus::Essence => {
                                    if self.essence_scroll > 0 {
                                        self.essence_scroll -= 1;
                                    }
                                }
                                PanelFocus::Vimarsa => {
                                    if self.vimarsa_selected > 0 {
                                        self.vimarsa_selected -= 1;
                                    }
                                }
                                _ => {}
                            }
                            EventOutcome::Consumed
                        }
                        KeyCode::Down | KeyCode::Char('j') => {
                            match self.focus {
                                PanelFocus::Structural => {
                                    if self.struct_selected < 5 {
                                        self.struct_selected += 1;
                                    }
                                }
                                PanelFocus::Essence => {
                                    self.essence_scroll += 1;
                                }
                                PanelFocus::Vimarsa => {
                                    if let Some(d) = &self.dossier {
                                        if self.vimarsa_selected + 1
                                            < d.vimarsa_field.items.len()
                                        {
                                            self.vimarsa_selected += 1;
                                        }
                                    }
                                }
                                _ => {}
                            }
                            EventOutcome::Consumed
                        }
                        KeyCode::Enter => {
                            if self.focus == PanelFocus::Structural {
                                if let Some(d) = &self.dossier {
                                    let family = FAMILY_NAMES[self.struct_selected];
                                    let pos = parse_coordinate(&d.coordinate)
                                        .map(|(_, p, _)| p)
                                        .unwrap_or(0);
                                    let target = format!("{}{}", family, pos);
                                    let prev = d.coordinate.clone();
                                    self.history.push(prev);
                                    self.coordinate_input = target.clone();
                                    self.trigger_load(target);
                                }
                            }
                            EventOutcome::Consumed
                        }
                        KeyCode::Left | KeyCode::Backspace => {
                            if let Some(prev) = self.history.pop() {
                                self.coordinate_input = prev.clone();
                                self.trigger_load(prev);
                            }
                            EventOutcome::Consumed
                        }
                        KeyCode::Char('r') => {
                            if !self.loading {
                                let coord = self.coordinate_input.clone();
                                self.trigger_load(coord);
                            }
                            EventOutcome::Consumed
                        }
                        _ => EventOutcome::Ignored,
                    }
                }
            }
            _ => EventOutcome::Ignored,
        }
    }
}

// ── Panel render helpers ──────────────────────────────────────────────────────

impl M3KnowingPlugin {
    fn render_essence(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let title = if self.loading {
            format!(" Essence {} ", SPINNER[self.spinner_frame])
        } else {
            " Essence ".to_string()
        };
        let border_style = if self.focus == PanelFocus::Essence && is_focused {
            Style::default().fg(Color::Yellow)
        } else {
            Style::default().fg(theme::pane_border(false))
        };

        let content = if let Some(ref e) = self.error {
            vec![Line::from(Span::styled(
                format!("[Error: {}]", e),
                Style::default().fg(Color::Red),
            ))]
        } else if self.loading {
            vec![Line::from("Loading...")]
        } else if let Some(ref d) = self.dossier {
            let phase_text = d
                .essence
                .phase
                .as_deref()
                .unwrap_or("")
                .to_string();
            let mut lines = vec![
                Line::from(vec![
                    Span::styled(
                        d.title.clone(),
                        Style::default()
                            .fg(Color::Yellow)
                            .add_modifier(Modifier::BOLD),
                    ),
                    Span::raw("  "),
                    Span::styled(
                        phase_text,
                        Style::default()
                            .fg(Color::DarkGray)
                            .add_modifier(Modifier::ITALIC),
                    ),
                ]),
                Line::from(""),
            ];
            for word_line in
                textwrap_simple(&d.essence.text, area.width.saturating_sub(4) as usize)
            {
                lines.push(Line::from(word_line));
            }
            let pulse_text = d.notebook_pulse.text.as_deref().unwrap_or("");
            if !pulse_text.is_empty() {
                lines.push(
                    Line::from("· · ·").style(Style::default().fg(Color::DarkGray)),
                );
                lines.push(
                    Line::from(pulse_text.to_string())
                        .style(Style::default().fg(Color::DarkGray)),
                );
            }
            lines
        } else {
            vec![Line::from(
                "Press [i] to enter a coordinate",
            )
            .style(Style::default().fg(Color::DarkGray))]
        };

        let para = Paragraph::new(content)
            .block(
                Block::default()
                    .title(title)
                    .borders(Borders::ALL)
                    .border_style(border_style),
            )
            .scroll((self.essence_scroll as u16, 0))
            .wrap(Wrap { trim: true });
        Widget::render(para, area, buf);
    }

    fn render_structural(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let border_style = if self.focus == PanelFocus::Structural && is_focused {
            Style::default().fg(Color::Green)
        } else {
            Style::default().fg(theme::pane_border(false))
        };

        // Determine current coordinate's position digit
        let pos = self
            .dossier
            .as_ref()
            .and_then(|d| parse_coordinate(&d.coordinate))
            .map(|(_, p, _)| p)
            .unwrap_or(0);

        // Which family letter is active?
        let current_family_idx = self.dossier.as_ref().and_then(|d| {
            FAMILY_NAMES
                .iter()
                .position(|&f| d.coordinate.starts_with(f))
        });

        let mut rows: Vec<Line> = vec![Line::from(Span::styled(
            "  #  Family   Coord  Domain",
            Style::default().fg(Color::DarkGray),
        ))];
        rows.push(Line::from(Span::styled(
            "  ─────────────────────────────────────────",
            Style::default().fg(Color::DarkGray),
        )));

        // If a dossier is loaded, prefer the structural_correspondences for labels
        for (i, (&fam, (&domain, &color))) in FAMILY_NAMES
            .iter()
            .zip(FAMILY_DOMAINS.iter().zip(FAMILY_COLORS.iter()))
            .enumerate()
        {
            let cursor = if i == self.struct_selected
                && self.focus == PanelFocus::Structural
            {
                "►"
            } else {
                " "
            };
            let coord = format!("{}{}", fam, pos);
            let is_current = current_family_idx == Some(i);
            let style = Style::default().fg(color).add_modifier(if is_current {
                Modifier::BOLD
            } else {
                Modifier::empty()
            });
            rows.push(Line::from(vec![
                Span::styled(format!("{}  ", cursor), Style::default().fg(Color::White)),
                Span::styled(format!("{:<8} ", fam), style),
                Span::styled(format!("{:<6} ", coord), style),
                Span::styled(domain.to_string(), Style::default().fg(Color::DarkGray)),
            ]));
        }

        let para = Paragraph::new(rows).block(
            Block::default()
                .title(" Structural ")
                .borders(Borders::ALL)
                .border_style(border_style),
        );
        Widget::render(para, area, buf);
    }

    fn render_qv_facets(&self, area: Rect, buf: &mut Buffer, _is_focused: bool) {
        let mut lines = vec![
            Line::from(Span::styled(
                "QUADRATIC VIEW FACETS",
                Style::default()
                    .fg(Color::DarkGray)
                    .add_modifier(Modifier::BOLD),
            )),
            Line::from(Span::styled(
                "──────────────────────────────────────────",
                Style::default().fg(Color::DarkGray),
            )),
        ];

        let none_span = || Span::styled("·", Style::default().fg(Color::DarkGray));

        if let Some(ref d) = self.dossier {
            // Try overlay_entry first for a QvEntry with essence/qv fields;
            // fall back to the dossier's qv_facet.
            // Extract all values eagerly as owned Strings to avoid lifetime issues.
            let overlay_entry = overlay::overlay_entry(&d.coordinate);

            let essence_val: Option<String> = overlay_entry
                .as_ref()
                .and_then(|oe| oe.essence.clone());
            let q_nature_val: Option<String> = overlay_entry
                .as_ref()
                .and_then(|oe| oe.q_nature.clone())
                .or_else(|| d.qv_facet.q_nature.clone());
            let q_essence_val: Option<String> = overlay_entry
                .as_ref()
                .and_then(|oe| oe.q_essence.clone())
                .or_else(|| d.qv_facet.q_essence.clone());
            let q_formulation_val: Option<String> = overlay_entry
                .as_ref()
                .and_then(|oe| oe.q_formulation.clone())
                .or_else(|| d.qv_facet.q_formulation.clone());
            let q_structure_val: Option<String> = overlay_entry
                .as_ref()
                .and_then(|oe| oe.q_structure.clone())
                .or_else(|| d.qv_facet.q_structure.clone());

            // essence line
            if let Some(ref ess) = essence_val {
                lines.push(Line::from(vec![
                    Span::styled("essence:      ", Style::default().fg(Color::DarkGray)),
                    Span::styled(ess.clone(), Style::default().fg(Color::White)),
                ]));
            } else {
                lines.push(Line::from(vec![
                    Span::styled("essence:      ", Style::default().fg(Color::DarkGray)),
                    none_span(),
                ]));
            }

            // QV facet lines — build from owned Strings to avoid lifetime issues
            lines.push(qv_opt_line_string("q_nature:     ", q_nature_val, Color::Yellow));
            lines.push(qv_opt_line_string("q_essence:    ", q_essence_val, Color::Green));
            lines.push(qv_opt_line_string(
                "q_formulation:",
                q_formulation_val,
                Color::Cyan,
            ));
            lines.push(qv_opt_line_string(
                "q_structure:  ",
                q_structure_val,
                Color::Magenta,
            ));
        } else {
            lines.push(Line::from(Span::styled(
                "[Load a coordinate to view QV facets]",
                Style::default().fg(Color::DarkGray),
            )));
        }

        let para = Paragraph::new(lines)
            .block(
                Block::default()
                    .title(" QV Facets ")
                    .borders(Borders::ALL)
                    .border_style(Style::default().fg(Color::DarkGray)),
            )
            .wrap(Wrap { trim: true });
        Widget::render(para, area, buf);
    }

    fn render_relations(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let border_style = if self.focus == PanelFocus::Relations && is_focused {
            Style::default().fg(Color::Cyan)
        } else {
            Style::default().fg(theme::pane_border(false))
        };
        let content = if let Some(ref d) = self.dossier {
            if d.relational_field.items.is_empty() {
                vec![Line::from(Span::styled(
                    "[Graph unavailable — Neo4j not connected]",
                    Style::default()
                        .fg(Color::Yellow)
                        .add_modifier(Modifier::DIM),
                ))]
            } else {
                d.relational_field
                    .items
                    .iter()
                    .map(|item| {
                        let detail_str = item.detail.as_deref().unwrap_or("");
                        Line::from(vec![
                            Span::styled("→ ", Style::default().fg(Color::Green)),
                            Span::raw(format!(
                                "{:<24} {}",
                                truncate_str(&item.label, 24),
                                detail_str
                            )),
                        ])
                    })
                    .collect()
            }
        } else {
            vec![Line::from(Span::styled(
                "[No data]",
                Style::default().fg(Color::DarkGray),
            ))]
        };
        let para = Paragraph::new(content).block(
            Block::default()
                .title(" Relations ")
                .borders(Borders::ALL)
                .border_style(border_style),
        );
        Widget::render(para, area, buf);
    }

    fn render_vimarsa(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let border_style = if self.focus == PanelFocus::Vimarsa && is_focused {
            Style::default().fg(Color::Magenta)
        } else {
            Style::default().fg(theme::pane_border(false))
        };
        let content = if let Some(ref d) = self.dossier {
            d.vimarsa_field
                .items
                .iter()
                .enumerate()
                .map(|(i, item)| {
                    let cursor =
                        if i == self.vimarsa_selected && self.focus == PanelFocus::Vimarsa {
                            "►"
                        } else {
                            " "
                        };
                    Line::from(vec![
                        Span::styled(cursor, Style::default().fg(Color::White)),
                        Span::styled(
                            format!(" [{}] ", i),
                            Style::default().fg(Color::DarkGray),
                        ),
                        Span::raw(truncate_str(
                            &item.label,
                            area.width.saturating_sub(8) as usize,
                        )),
                    ])
                })
                .collect()
        } else {
            vec![Line::from(Span::styled(
                "[No data]",
                Style::default().fg(Color::DarkGray),
            ))]
        };
        let para = Paragraph::new(content).block(
            Block::default()
                .title(" Vimarsa ")
                .borders(Borders::ALL)
                .border_style(border_style),
        );
        Widget::render(para, area, buf);
    }
}

// ── Utility functions ─────────────────────────────────────────────────────────

/// Build a QV label+value line from an owned Option<String>.
/// Returns a Line<'static> since the value is stored as an owned String inside the Span.
fn qv_opt_line_string(label: &'static str, value: Option<String>, color: Color) -> Line<'static> {
    Line::from(vec![
        Span::styled(label, Style::default().fg(Color::DarkGray)),
        if let Some(v) = value {
            Span::styled(v, Style::default().fg(color))
        } else {
            Span::styled("·", Style::default().fg(Color::DarkGray))
        },
    ])
}

fn textwrap_simple(text: &str, width: usize) -> Vec<String> {
    if width == 0 {
        return vec![text.to_string()];
    }
    let mut lines = Vec::new();
    let mut current = String::new();
    for word in text.split_whitespace() {
        if current.is_empty() {
            current.push_str(word);
        } else if current.len() + 1 + word.len() <= width {
            current.push(' ');
            current.push_str(word);
        } else {
            lines.push(current.clone());
            current = word.to_string();
        }
    }
    if !current.is_empty() {
        lines.push(current);
    }
    if lines.is_empty() {
        lines.push(String::new());
    }
    lines
}

fn truncate_str(s: &str, max: usize) -> String {
    if s.len() <= max {
        s.to_string()
    } else {
        format!("{}…", &s[..max.saturating_sub(1)])
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_coordinate_c3_returns_family_0_pos_3() {
        let result = parse_coordinate("C3");
        assert_eq!(result, Some((0, 3, false)));
    }

    #[test]
    fn parse_coordinate_m4_inverted() {
        let result = parse_coordinate("M4'");
        assert_eq!(result, Some((5, 4, true)));
    }

    #[test]
    fn parse_coordinate_lowercase_works() {
        let result = parse_coordinate("p2");
        assert_eq!(result, Some((1, 2, false)));
    }

    #[test]
    fn parse_coordinate_invalid_returns_none() {
        assert_eq!(parse_coordinate("X9"), None);
        assert_eq!(parse_coordinate("C6"), None);
        assert_eq!(parse_coordinate("M"), None);
        assert_eq!(parse_coordinate(""), None);
    }

    #[test]
    fn parse_coordinate_all_families() {
        assert_eq!(parse_coordinate("C0").map(|r| r.0), Some(0));
        assert_eq!(parse_coordinate("P0").map(|r| r.0), Some(1));
        assert_eq!(parse_coordinate("L0").map(|r| r.0), Some(2));
        assert_eq!(parse_coordinate("S0").map(|r| r.0), Some(3));
        assert_eq!(parse_coordinate("T0").map(|r| r.0), Some(4));
        assert_eq!(parse_coordinate("M0").map(|r| r.0), Some(5));
    }

    #[test]
    fn new_with_clock_compiles() {
        use crate::portal::clock_state::new_shared_clock_state;
        let clock = new_shared_clock_state();
        let plugin = M3KnowingPlugin::new_with_clock(clock);
        assert!(!plugin.mounted);
        assert!(plugin.dossier.is_none());
    }

    #[test]
    fn spinner_cycles_through_10_frames() {
        assert_eq!(SPINNER.len(), 10);
    }
}
