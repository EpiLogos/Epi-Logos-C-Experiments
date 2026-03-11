use ratatui::prelude::*;
use ratatui::widgets::*;
use ratatui_hypertile::{EventOutcome, HypertileEvent, KeyCode};
use ratatui_hypertile_extras::HypertilePlugin;
use crate::portal::theme;
use crate::nara::{identity, kairos};

// ─── Cached display fields parsed from identity + kairos JSON ───────────────

struct IdentityFields {
    hash_preview: String,
    layer_count: u32,
    layer_mask: u8,
    last_wound: Option<u64>,
    layers: Vec<(String, bool, u8)>, // (name, present, completeness)
}

struct KairosFields {
    active_decan: u8,
    dominant_element: u8,
    dominant_sign: u8,
    active_tattva: u8,
    fresh: bool,
    planets: Vec<PlanetDisplay>,
}

struct PlanetDisplay {
    name: String,
    degree: f32,
    anchor: u16,
    retrograde: bool,
}

pub struct M4IdentityPlugin {
    identity: Option<IdentityFields>,
    kairos_state: Option<KairosFields>,
    no_profile: bool,
    no_kairos: bool,
    identity_err: Option<String>,
    kairos_err: Option<String>,
    show_planets: bool,
    needs_refresh: bool,
}

impl M4IdentityPlugin {
    pub fn new() -> Self {
        let mut plugin = Self {
            identity: None,
            kairos_state: None,
            no_profile: false,
            no_kairos: false,
            identity_err: None,
            kairos_err: None,
            show_planets: false,
            needs_refresh: true,
        };
        plugin.load_data();
        plugin
    }

    fn load_data(&mut self) {
        self.needs_refresh = false;

        // Load identity profile
        match identity::load_profile() {
            Ok(Some(profile)) => {
                let mut layers = Vec::new();
                let mut keys: Vec<&String> = profile.layers.keys().collect();
                keys.sort();
                for key in keys {
                    if let Some(meta) = profile.layers.get(key) {
                        layers.push((key.clone(), meta.present, meta.completeness));
                    }
                }
                self.identity = Some(IdentityFields {
                    hash_preview: profile.hash_preview.clone(),
                    layer_count: profile.layer_presence_mask.count_ones(),
                    layer_mask: profile.layer_presence_mask,
                    last_wound: profile.last_wound,
                    layers,
                });
                self.no_profile = false;
                self.identity_err = None;
            }
            Ok(None) => {
                self.identity = None;
                self.no_profile = true;
                self.identity_err = None;
            }
            Err(e) => {
                self.identity = None;
                self.no_profile = false;
                self.identity_err = Some(e);
            }
        }

        // Load kairos state
        let fresh = kairos::is_current_fresh();
        match kairos::load_current() {
            Ok(Some(result)) => {
                let planet_names = [
                    "Sun", "Earth", "Venus", "Mercury", "Moon",
                    "Saturn", "Jupiter", "Mars", "Neptune", "Pluto",
                ];
                let planets: Vec<PlanetDisplay> = result.planets.iter().map(|p| {
                    let name = planet_names
                        .get(p.planet_id as usize)
                        .unwrap_or(&"?");
                    PlanetDisplay {
                        name: name.to_string(),
                        degree: p.degree,
                        anchor: p.degree_anchor,
                        retrograde: p.retrograde,
                    }
                }).collect();

                self.kairos_state = Some(KairosFields {
                    active_decan: result.active_decan,
                    dominant_element: result.dominant_element,
                    dominant_sign: result.dominant_sign,
                    active_tattva: result.active_tattva,
                    fresh,
                    planets,
                });
                self.no_kairos = false;
                self.kairos_err = None;
            }
            Ok(None) => {
                self.kairos_state = None;
                self.no_kairos = true;
                self.kairos_err = None;
            }
            Err(e) => {
                self.kairos_state = None;
                self.no_kairos = false;
                self.kairos_err = Some(e);
            }
        }
    }

    fn element_name(id: u8) -> &'static str {
        match id {
            1 => "Air",
            2 => "Fire",
            3 => "Water",
            4 => "Earth",
            _ => "\u{2014}",
        }
    }

    fn sign_name(id: u8) -> &'static str {
        match id {
            0 => "Aries", 1 => "Taurus", 2 => "Gemini", 3 => "Cancer",
            4 => "Leo", 5 => "Virgo", 6 => "Libra", 7 => "Scorpio",
            8 => "Sagittarius", 9 => "Capricorn", 10 => "Aquarius", 11 => "Pisces",
            _ => "\u{2014}",
        }
    }

    fn tattva_name(id: u8) -> &'static str {
        match id {
            0 => "Tejas (Fire)",
            1 => "Prithvi (Earth)",
            2 => "Vayu (Air)",
            3 => "Apas (Water)",
            4 => "Akasha (Ether)",
            _ => "\u{2014}",
        }
    }
}

impl HypertilePlugin for M4IdentityPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let accent = theme::m_level_color(4);
        let dim = Style::default().fg(Color::DarkGray);
        let label_style = Style::default().fg(Color::Yellow);
        let value_style = Style::default().fg(Color::White);

        let mut lines: Vec<Line> = Vec::new();

        // ── Identity section ────────────────────────────────────────────
        if self.no_profile && self.identity.is_none() {
            lines.push(Line::from(Span::styled(
                "  No identity profile found.",
                Style::default().fg(Color::Yellow),
            )));
            lines.push(Line::from(Span::styled(
                "  Run `epi nara wind` to initialize identity",
                dim,
            )));
            lines.push(Line::from(""));
        } else if let Some(ref err) = self.identity_err {
            lines.push(Line::from(vec![
                Span::styled("  Identity error: ", Style::default().fg(Color::Red)),
                Span::raw(err.as_str()),
            ]));
            lines.push(Line::from(""));
        } else if let Some(ref id) = self.identity {
            lines.push(Line::from(vec![
                Span::styled("  Hash: ", label_style),
                Span::styled(&id.hash_preview, value_style),
                Span::styled(
                    format!("  ({}/5 layers, mask: 0x{:02x})", id.layer_count, id.layer_mask),
                    dim,
                ),
            ]));
            if let Some(ts) = id.last_wound {
                lines.push(Line::from(vec![
                    Span::styled("  Last wound: ", label_style),
                    Span::styled(format!("{}", ts), value_style),
                ]));
            } else {
                lines.push(Line::from(vec![
                    Span::styled("  Last wound: ", label_style),
                    Span::styled("\u{2014}", dim),
                ]));
            }
            for (name, present, completeness) in &id.layers {
                let mark = if *present { "\u{2713}" } else { "\u{2717}" };
                let mark_color = if *present { Color::Green } else { Color::Red };
                lines.push(Line::from(vec![
                    Span::raw("    "),
                    Span::styled(mark, Style::default().fg(mark_color)),
                    Span::raw(format!(" {} ", name)),
                    Span::styled(format!("{}/5", completeness), dim),
                ]));
            }
            lines.push(Line::from(""));
        }

        // ── Kairos section ──────────────────────────────────────────────
        lines.push(Line::from(Span::styled(
            "  Kairos",
            Style::default().fg(accent).add_modifier(Modifier::BOLD),
        )));

        if self.no_kairos && self.kairos_state.is_none() {
            lines.push(Line::from(Span::styled(
                "  No kairos state. Run `epi nara kairos sync`",
                dim,
            )));
        } else if let Some(ref err) = self.kairos_err {
            lines.push(Line::from(vec![
                Span::styled("  Kairos error: ", Style::default().fg(Color::Red)),
                Span::raw(err.as_str()),
            ]));
        } else if let Some(ref k) = self.kairos_state {
            let freshness = if k.fresh { "fresh" } else { "stale" };
            let fresh_color = if k.fresh { Color::Green } else { Color::Yellow };

            lines.push(Line::from(vec![
                Span::styled("  Active decan: ", label_style),
                Span::styled(format!("{}", k.active_decan), value_style),
                Span::styled(format!("  [{}]", freshness), Style::default().fg(fresh_color)),
            ]));
            lines.push(Line::from(vec![
                Span::styled("  Dominant element: ", label_style),
                Span::styled(Self::element_name(k.dominant_element), value_style),
            ]));
            lines.push(Line::from(vec![
                Span::styled("  Dominant sign: ", label_style),
                Span::styled(Self::sign_name(k.dominant_sign), value_style),
            ]));
            lines.push(Line::from(vec![
                Span::styled("  Active tattva: ", label_style),
                Span::styled(Self::tattva_name(k.active_tattva), value_style),
            ]));

            if self.show_planets && !k.planets.is_empty() {
                lines.push(Line::from(""));
                lines.push(Line::from(Span::styled("  Planets", label_style)));
                for p in &k.planets {
                    let retro = if p.retrograde { " (R)" } else { "" };
                    lines.push(Line::from(vec![
                        Span::raw(format!("    {:<10}", p.name)),
                        Span::styled(format!("{:>7.2}\u{00b0}", p.degree), value_style),
                        Span::styled(format!("  anchor:{}", p.anchor), dim),
                        Span::styled(retro.to_string(), Style::default().fg(Color::Red)),
                    ]));
                }
            }
        }

        // ── Footer hints ────────────────────────────────────────────────
        lines.push(Line::from(""));
        lines.push(Line::from(Span::styled(
            "  [r] refresh  [p] toggle planets",
            dim,
        )));

        let para = Paragraph::new(lines).block(
            Block::default()
                .title(Span::styled(
                    " Identity / Kairos ",
                    Style::default().fg(accent).add_modifier(Modifier::BOLD),
                ))
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))),
        );
        Widget::render(para, area, buf);
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        if let HypertileEvent::Key(chord) = event {
            match chord.code {
                KeyCode::Char('r') => {
                    self.load_data();
                    return EventOutcome::Consumed;
                }
                KeyCode::Char('p') => {
                    self.show_planets = !self.show_planets;
                    return EventOutcome::Consumed;
                }
                _ => {}
            }
        }
        EventOutcome::Ignored
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

#[cfg(test)]
mod tests {
    use super::*;
    use ratatui::buffer::Buffer;
    use ratatui::layout::Rect;

    fn buffer_to_string(buf: &Buffer, area: Rect) -> String {
        (0..area.height)
            .flat_map(|y| (0..area.width).map(move |x| buf.get(x, y).symbol().to_string()))
            .collect()
    }

    #[test]
    fn m4_identity_renders_title() {
        let plugin = M4IdentityPlugin::new();
        let area = Rect::new(0, 0, 60, 20);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content = buffer_to_string(&buf, area);
        assert!(content.contains("Identity"), "Should show identity title");
    }

    #[test]
    fn m4_identity_shows_hint_keys() {
        let plugin = M4IdentityPlugin::new();
        let area = Rect::new(0, 0, 60, 20);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, false);
        let content = buffer_to_string(&buf, area);
        assert!(
            content.contains("[r] refresh"),
            "Should show refresh keybinding hint"
        );
    }

    #[test]
    fn m4_identity_toggle_planets() {
        let mut plugin = M4IdentityPlugin::new();
        assert!(!plugin.show_planets);
        let event = HypertileEvent::Key(ratatui_hypertile::KeyChord::new(KeyCode::Char('p')));
        let outcome = plugin.on_event(&event);
        assert!(outcome.is_consumed());
        assert!(plugin.show_planets);
        // Toggle back
        let outcome = plugin.on_event(&event);
        assert!(outcome.is_consumed());
        assert!(!plugin.show_planets);
    }

    #[test]
    fn m4_identity_refresh_event() {
        let mut plugin = M4IdentityPlugin::new();
        let event = HypertileEvent::Key(ratatui_hypertile::KeyChord::new(KeyCode::Char('r')));
        let outcome = plugin.on_event(&event);
        assert!(outcome.is_consumed());
    }

    #[test]
    fn m4_identity_ignores_unknown_keys() {
        let mut plugin = M4IdentityPlugin::new();
        let event = HypertileEvent::Key(ratatui_hypertile::KeyChord::new(KeyCode::Char('x')));
        let outcome = plugin.on_event(&event);
        assert!(!outcome.is_consumed());
    }
}
