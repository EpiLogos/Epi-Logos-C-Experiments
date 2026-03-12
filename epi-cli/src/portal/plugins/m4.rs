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

// ═══════════════════════════════════════════════════════════════════════════
// M4FlowPlugin — CT0 flow writer
// ═══════════════════════════════════════════════════════════════════════════

pub struct M4FlowPlugin {
    entries: Vec<String>,
    scroll_offset: usize,
    input_buffer: String,
    input_mode: bool,
    flow_path: Option<std::path::PathBuf>,
    status_msg: Option<String>,
}

impl M4FlowPlugin {
    pub fn new() -> Self {
        let mut plugin = Self {
            entries: Vec::new(),
            scroll_offset: 0,
            input_buffer: String::new(),
            input_mode: false,
            flow_path: None,
            status_msg: None,
        };
        plugin.load_flow();
        plugin
    }

    fn load_flow(&mut self) {
        // Try to find FLOW.md via vault conventions
        let home = dirs::home_dir().unwrap_or_default();
        let vault_base = home.join("Documents").join("Epi-Logos C Experiments")
            .join("Idea").join("Empty").join("Present");

        // Try today's date folder
        let candidates = [
            vault_base.join("FLOW.md"),
            home.join("Documents").join("Epi-Logos C Experiments")
                .join("Idea").join("Bimba").join("World").join("FLOW.md"),
        ];

        for path in &candidates {
            if path.exists() {
                self.flow_path = Some(path.clone());
                match std::fs::read_to_string(path) {
                    Ok(content) => {
                        self.entries = content
                            .lines()
                            .filter(|l| !l.trim().is_empty() && !l.starts_with("---") && !l.starts_with("coordinate:"))
                            .map(|l| l.to_string())
                            .collect();
                    }
                    Err(e) => {
                        self.status_msg = Some(format!("Error reading FLOW.md: {}", e));
                    }
                }
                return;
            }
        }

        self.status_msg = Some("No FLOW.md found. Run `epi vault flow-init` to initialize.".to_string());
    }

    fn append_entry(&mut self, text: &str) {
        if let Some(ref path) = self.flow_path {
            use std::io::Write;
            match std::fs::OpenOptions::new().create(true).append(true).open(path) {
                Ok(mut file) => {
                    let timestamp = chrono::Utc::now().format("%H:%M").to_string();
                    let line = format!("\n- [{}] {}", timestamp, text);
                    if writeln!(file, "{}", line).is_ok() {
                        self.entries.push(format!("- [{}] {}", timestamp, text));
                        self.status_msg = Some("Entry added.".to_string());
                    }
                }
                Err(e) => {
                    self.status_msg = Some(format!("Write error: {}", e));
                }
            }
        } else {
            self.status_msg = Some("No FLOW.md path set.".to_string());
        }
    }
}

impl HypertilePlugin for M4FlowPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let accent = theme::m_level_color(4);
        let dim = Style::default().fg(Color::DarkGray);

        let inner_height = area.height.saturating_sub(4) as usize; // borders + input + status
        let input_height: u16 = if self.input_mode { 3 } else { 1 };

        let chunks = Layout::default()
            .direction(Direction::Vertical)
            .constraints([
                Constraint::Min(3),
                Constraint::Length(input_height),
            ])
            .split(area);

        // Entries list
        let visible_start = if self.entries.len() > inner_height.saturating_sub(2) {
            self.entries.len().saturating_sub(inner_height.saturating_sub(2)) + self.scroll_offset.min(0)
        } else {
            0
        };
        let visible_start = visible_start.saturating_sub(self.scroll_offset);

        let lines: Vec<Line> = self.entries.iter()
            .skip(visible_start)
            .take(inner_height)
            .map(|entry| {
                Line::from(Span::styled(format!("  {}", entry), Style::default().fg(Color::White)))
            })
            .collect();

        let mut all_lines = lines;
        if let Some(ref msg) = self.status_msg {
            if all_lines.is_empty() {
                all_lines.push(Line::from(Span::styled(
                    format!("  {}", msg), Style::default().fg(Color::Yellow),
                )));
            }
        }
        if all_lines.is_empty() {
            all_lines.push(Line::from(Span::styled(
                "  Flow writer -- initialize with `epi vault flow-init`", dim,
            )));
        }

        let entries_block = Paragraph::new(all_lines).block(
            Block::default()
                .title(Span::styled(" M4' Flow ", Style::default().fg(accent).add_modifier(Modifier::BOLD)))
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))),
        );
        Widget::render(entries_block, chunks[0], buf);

        // Input line
        let input_text = if self.input_mode {
            format!("  > {}_", self.input_buffer)
        } else {
            "  [i] input  [j/k] scroll  [r] reload".to_string()
        };
        let input_style = if self.input_mode {
            Style::default().fg(Color::Yellow)
        } else {
            dim
        };
        let input_para = Paragraph::new(Span::styled(input_text, input_style));
        Widget::render(input_para, chunks[1], buf);
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        if let HypertileEvent::Key(chord) = event {
            if self.input_mode {
                match chord.code {
                    KeyCode::Enter => {
                        if !self.input_buffer.is_empty() {
                            let text = self.input_buffer.clone();
                            self.append_entry(&text);
                            self.input_buffer.clear();
                        }
                        self.input_mode = false;
                        return EventOutcome::Consumed;
                    }
                    KeyCode::Escape => {
                        self.input_mode = false;
                        self.input_buffer.clear();
                        return EventOutcome::Consumed;
                    }
                    KeyCode::Backspace => {
                        self.input_buffer.pop();
                        return EventOutcome::Consumed;
                    }
                    KeyCode::Char(c) => {
                        self.input_buffer.push(c);
                        return EventOutcome::Consumed;
                    }
                    _ => {}
                }
            } else {
                match chord.code {
                    KeyCode::Char('i') | KeyCode::Enter => {
                        self.input_mode = true;
                        return EventOutcome::Consumed;
                    }
                    KeyCode::Char('j') | KeyCode::Down => {
                        if self.scroll_offset > 0 {
                            self.scroll_offset -= 1;
                        }
                        return EventOutcome::Consumed;
                    }
                    KeyCode::Char('k') | KeyCode::Up => {
                        self.scroll_offset += 1;
                        return EventOutcome::Consumed;
                    }
                    KeyCode::Char('r') => {
                        self.load_flow();
                        return EventOutcome::Consumed;
                    }
                    _ => {}
                }
            }
        }
        EventOutcome::Ignored
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// M4OraclePlugin — oracle cast + history + hygiene
// ═══════════════════════════════════════════════════════════════════════════

pub struct M4OraclePlugin {
    history_text: String,
    hygiene_text: String,
    last_cast: Option<String>,
    consent_pending: bool,
    scroll: usize,
}

impl M4OraclePlugin {
    pub fn new() -> Self {
        let mut plugin = Self {
            history_text: String::new(),
            hygiene_text: String::new(),
            last_cast: None,
            consent_pending: false,
            scroll: 0,
        };
        plugin.load_data();
        plugin
    }

    fn load_data(&mut self) {
        self.history_text = crate::nara::oracle::show_history()
            .unwrap_or_else(|e| format!("Error: {}", e));
        self.hygiene_text = crate::nara::oracle::show_hygiene(None)
            .unwrap_or_else(|e| format!("Error: {}", e));
    }
}

impl HypertilePlugin for M4OraclePlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let accent = theme::m_level_color(4);
        let dim = Style::default().fg(Color::DarkGray);
        let label_style = Style::default().fg(Color::Yellow);

        let mut lines: Vec<Line> = Vec::new();

        // Hygiene section
        lines.push(Line::from(Span::styled(
            "  Hygiene",
            Style::default().fg(accent).add_modifier(Modifier::BOLD),
        )));
        for hl in self.hygiene_text.lines() {
            lines.push(Line::from(Span::styled(
                format!("  {}", hl),
                Style::default().fg(Color::White),
            )));
        }
        lines.push(Line::from(""));

        // History section
        lines.push(Line::from(Span::styled(
            "  History",
            Style::default().fg(accent).add_modifier(Modifier::BOLD),
        )));
        for hl in self.history_text.lines().skip(self.scroll).take(12) {
            lines.push(Line::from(Span::styled(
                format!("  {}", hl),
                Style::default().fg(Color::White),
            )));
        }

        // Last cast output
        if let Some(ref cast) = self.last_cast {
            lines.push(Line::from(""));
            lines.push(Line::from(Span::styled(
                "  Last Cast",
                label_style,
            )));
            for cl in cast.lines() {
                lines.push(Line::from(Span::styled(
                    format!("  {}", cl),
                    Style::default().fg(Color::White),
                )));
            }
        }

        // Consent gate display
        if self.consent_pending {
            lines.push(Line::from(""));
            lines.push(Line::from(Span::styled(
                "  Cast oracle? This is a sacred portal. [y] confirm  [n] cancel",
                Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD),
            )));
        }

        // Footer
        lines.push(Line::from(""));
        let hint = if self.consent_pending {
            "  [y] confirm cast  [n] cancel"
        } else {
            "  [c] cast  [h] refresh hygiene  [j/k] scroll  [r] refresh"
        };
        lines.push(Line::from(Span::styled(hint, dim)));

        let para = Paragraph::new(lines).block(
            Block::default()
                .title(Span::styled(
                    " M4' Oracle ",
                    Style::default().fg(accent).add_modifier(Modifier::BOLD),
                ))
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))),
        );
        Widget::render(para, area, buf);
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        if let HypertileEvent::Key(chord) = event {
            if self.consent_pending {
                match chord.code {
                    KeyCode::Char('y') => {
                        self.consent_pending = false;
                        // Cast with auto-consent (yes=true) since user confirmed in TUI
                        match crate::nara::oracle::cast("iching", "portal cast", true, None) {
                            Ok(result) => self.last_cast = Some(result),
                            Err(e) => self.last_cast = Some(format!("Error: {}", e)),
                        }
                        self.load_data(); // Refresh history
                        return EventOutcome::Consumed;
                    }
                    KeyCode::Char('n') | KeyCode::Escape => {
                        self.consent_pending = false;
                        return EventOutcome::Consumed;
                    }
                    _ => return EventOutcome::Consumed,
                }
            }
            match chord.code {
                KeyCode::Char('c') => {
                    self.consent_pending = true;
                    return EventOutcome::Consumed;
                }
                KeyCode::Char('h') | KeyCode::Char('r') => {
                    self.load_data();
                    return EventOutcome::Consumed;
                }
                KeyCode::Char('j') | KeyCode::Down => {
                    self.scroll = self.scroll.saturating_add(1);
                    return EventOutcome::Consumed;
                }
                KeyCode::Char('k') | KeyCode::Up => {
                    self.scroll = self.scroll.saturating_sub(1);
                    return EventOutcome::Consumed;
                }
                _ => {}
            }
        }
        EventOutcome::Ignored
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// M4MedicinePlugin — elemental balance + chakra + prescription
// ═══════════════════════════════════════════════════════════════════════════

pub struct M4MedicinePlugin {
    balance_text: String,
    chakra_text: String,
    prescription_text: Option<String>,
    safety_text: String,
    error: Option<String>,
}

impl M4MedicinePlugin {
    pub fn new() -> Self {
        let mut plugin = Self {
            balance_text: String::new(),
            chakra_text: String::new(),
            prescription_text: None,
            safety_text: String::new(),
            error: None,
        };
        plugin.load_data();
        plugin
    }

    fn load_data(&mut self) {
        self.error = None;
        self.balance_text = crate::nara::medicine::balance(false)
            .unwrap_or_else(|e| { self.error = Some(e.clone()); format!("Unavailable: {}", e) });
        self.chakra_text = crate::nara::medicine::chakra(false)
            .unwrap_or_else(|e| format!("Unavailable: {}", e));
        self.safety_text = crate::nara::medicine::safety(None)
            .unwrap_or_else(|e| format!("Unavailable: {}", e));
    }
}

impl HypertilePlugin for M4MedicinePlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let accent = theme::m_level_color(4);
        let dim = Style::default().fg(Color::DarkGray);
        let label_style = Style::default().fg(Color::Yellow);

        let mut lines: Vec<Line> = Vec::new();

        // Error banner
        if let Some(ref err) = self.error {
            lines.push(Line::from(Span::styled(
                format!("  {}", err),
                Style::default().fg(Color::Yellow),
            )));
            lines.push(Line::from(Span::styled(
                "  Requires identity profile + kairos state",
                dim,
            )));
            lines.push(Line::from(""));
        }

        // Balance section
        lines.push(Line::from(Span::styled(
            "  Elemental Balance",
            Style::default().fg(accent).add_modifier(Modifier::BOLD),
        )));
        for bl in self.balance_text.lines() {
            lines.push(Line::from(Span::styled(
                format!("  {}", bl),
                Style::default().fg(Color::White),
            )));
        }
        lines.push(Line::from(""));

        // Chakra section
        lines.push(Line::from(Span::styled(
            "  Chakra",
            label_style,
        )));
        lines.push(Line::from(Span::styled(
            format!("  {}", self.chakra_text),
            Style::default().fg(Color::White),
        )));
        lines.push(Line::from(""));

        // Prescription
        if let Some(ref rx) = self.prescription_text {
            lines.push(Line::from(Span::styled(
                "  Prescription",
                label_style,
            )));
            for pl in rx.lines() {
                lines.push(Line::from(Span::styled(
                    format!("  {}", pl),
                    Style::default().fg(Color::White),
                )));
            }
            lines.push(Line::from(""));
        }

        // Safety
        lines.push(Line::from(Span::styled(
            format!("  Safety: {}", self.safety_text),
            Style::default().fg(Color::Green),
        )));

        // Footer
        lines.push(Line::from(""));
        lines.push(Line::from(Span::styled(
            "  [p] prescribe  [s] safety check  [r] refresh",
            dim,
        )));

        let para = Paragraph::new(lines).block(
            Block::default()
                .title(Span::styled(
                    " M4' Medicine ",
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
                KeyCode::Char('p') => {
                    self.prescription_text = Some(
                        crate::nara::medicine::prescribe("integration")
                            .unwrap_or_else(|e| format!("Error: {}", e))
                    );
                    return EventOutcome::Consumed;
                }
                KeyCode::Char('s') => {
                    self.safety_text = crate::nara::medicine::safety(None)
                        .unwrap_or_else(|e| format!("Error: {}", e));
                    return EventOutcome::Consumed;
                }
                KeyCode::Char('r') => {
                    self.load_data();
                    return EventOutcome::Consumed;
                }
                _ => {}
            }
        }
        EventOutcome::Ignored
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// M4TransformPlugin — transformation cycles
// ═══════════════════════════════════════════════════════════════════════════

pub struct M4TransformPlugin {
    status_text: String,
    recipe_text: String,
    history_text: String,
    scroll: usize,
}

impl M4TransformPlugin {
    pub fn new() -> Self {
        let mut plugin = Self {
            status_text: String::new(),
            recipe_text: String::new(),
            history_text: String::new(),
            scroll: 0,
        };
        plugin.load_data();
        plugin
    }

    fn load_data(&mut self) {
        self.status_text = crate::nara::transform::status(false)
            .unwrap_or_else(|e| format!("Error: {}", e));
        self.recipe_text = crate::nara::transform::recipe(false)
            .unwrap_or_else(|e| format!("Unavailable: {}", e));
        self.history_text = crate::nara::transform::history(false, false)
            .unwrap_or_else(|e| format!("Error: {}", e));
    }
}

impl HypertilePlugin for M4TransformPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let accent = theme::m_level_color(4);
        let dim = Style::default().fg(Color::DarkGray);
        let label_style = Style::default().fg(Color::Yellow);

        let mut lines: Vec<Line> = Vec::new();

        // Status
        lines.push(Line::from(Span::styled(
            "  Status",
            Style::default().fg(accent).add_modifier(Modifier::BOLD),
        )));
        for sl in self.status_text.lines() {
            lines.push(Line::from(Span::styled(
                format!("  {}", sl),
                Style::default().fg(Color::White),
            )));
        }
        lines.push(Line::from(""));

        // Recipe
        lines.push(Line::from(Span::styled("  Recipe", label_style)));
        for rl in self.recipe_text.lines() {
            lines.push(Line::from(Span::styled(
                format!("  {}", rl),
                Style::default().fg(Color::White),
            )));
        }
        lines.push(Line::from(""));

        // History
        lines.push(Line::from(Span::styled("  History", label_style)));
        for hl in self.history_text.lines().skip(self.scroll).take(10) {
            lines.push(Line::from(Span::styled(
                format!("  {}", hl),
                Style::default().fg(Color::White),
            )));
        }

        // Footer
        lines.push(Line::from(""));
        lines.push(Line::from(Span::styled(
            "  [w] write cycle  [c] commit  [j/k] scroll  [r] refresh",
            dim,
        )));

        let para = Paragraph::new(lines).block(
            Block::default()
                .title(Span::styled(
                    " M4' Transform ",
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
                KeyCode::Char('w') => {
                    match crate::nara::transform::write_cycle(None) {
                        Ok(msg) => self.status_text = msg,
                        Err(e) => self.status_text = format!("Error: {}", e),
                    }
                    self.load_data();
                    return EventOutcome::Consumed;
                }
                KeyCode::Char('c') => {
                    match crate::nara::transform::commit("portal-commit", None) {
                        Ok(msg) => self.status_text = msg,
                        Err(e) => self.status_text = format!("Error: {}", e),
                    }
                    self.load_data();
                    return EventOutcome::Consumed;
                }
                KeyCode::Char('j') | KeyCode::Down => {
                    self.scroll = self.scroll.saturating_add(1);
                    return EventOutcome::Consumed;
                }
                KeyCode::Char('k') | KeyCode::Up => {
                    self.scroll = self.scroll.saturating_sub(1);
                    return EventOutcome::Consumed;
                }
                KeyCode::Char('r') => {
                    self.load_data();
                    return EventOutcome::Consumed;
                }
                _ => {}
            }
        }
        EventOutcome::Ignored
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// M4LensPlugin — 6 wisdom lenses
// ═══════════════════════════════════════════════════════════════════════════

pub struct M4LensPlugin {
    lens_list_text: String,
    selected: usize,
    detail_text: Option<String>,
}

impl M4LensPlugin {
    pub fn new() -> Self {
        let mut plugin = Self {
            lens_list_text: String::new(),
            selected: 0,
            detail_text: None,
        };
        plugin.load_data();
        plugin
    }

    fn load_data(&mut self) {
        self.lens_list_text = crate::nara::lens::list(false)
            .unwrap_or_else(|e| format!("Error: {}", e));
    }

    fn load_detail(&mut self) {
        self.detail_text = Some(match self.selected {
            3 => crate::nara::lens::jungian(false)
                .unwrap_or_else(|e| format!("Error: {}", e)),
            5 => crate::nara::lens::trika(false)
                .unwrap_or_else(|e| format!("Error: {}", e)),
            4 => crate::nara::lens::phenomenal(false)
                .unwrap_or_else(|e| format!("Error: {}", e)),
            i => format!(
                "Lens #{} detail\n  Use `epi nara lens apply {}` for full analysis",
                i, i
            ),
        });
    }
}

impl HypertilePlugin for M4LensPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let accent = theme::m_level_color(4);
        let dim = Style::default().fg(Color::DarkGray);

        let chunks = Layout::default()
            .direction(Direction::Horizontal)
            .constraints([Constraint::Percentage(45), Constraint::Percentage(55)])
            .split(area);

        // Left: lens list
        let lens_names = [
            "Gebser (Integral)",
            "Ontological",
            "Epistemological",
            "Jungian Depth",
            "Phenomenological",
            "Trika/Kashmir Shaivism",
        ];

        let items: Vec<ListItem> = lens_names.iter().enumerate().map(|(i, name)| {
            let style = if i == self.selected {
                Style::default().fg(Color::Black).bg(Color::Red)
            } else {
                Style::default().fg(Color::White)
            };
            ListItem::new(format!("  [{}] {}", i, name)).style(style)
        }).collect();

        let list = List::new(items).block(
            Block::default()
                .title(Span::styled(
                    " M4' Lenses ",
                    Style::default().fg(accent).add_modifier(Modifier::BOLD),
                ))
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))),
        );
        Widget::render(list, chunks[0], buf);

        // Right: detail
        let mut detail_lines: Vec<Line> = Vec::new();
        if let Some(ref detail) = self.detail_text {
            for dl in detail.lines() {
                detail_lines.push(Line::from(Span::styled(
                    format!("  {}", dl),
                    Style::default().fg(Color::White),
                )));
            }
        } else {
            detail_lines.push(Line::from(Span::styled(
                "  Press Enter to view lens detail",
                dim,
            )));
        }
        detail_lines.push(Line::from(""));
        detail_lines.push(Line::from(Span::styled(
            "  [j/k] navigate  [Enter] view detail",
            dim,
        )));

        let detail_para = Paragraph::new(detail_lines).block(
            Block::default()
                .title(" Detail ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(Color::DarkGray)),
        );
        Widget::render(detail_para, chunks[1], buf);
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        if let HypertileEvent::Key(chord) = event {
            match chord.code {
                KeyCode::Char('j') | KeyCode::Down => {
                    if self.selected < 5 {
                        self.selected += 1;
                    }
                    return EventOutcome::Consumed;
                }
                KeyCode::Char('k') | KeyCode::Up => {
                    if self.selected > 0 {
                        self.selected -= 1;
                    }
                    return EventOutcome::Consumed;
                }
                KeyCode::Enter => {
                    self.load_detail();
                    return EventOutcome::Consumed;
                }
                _ => {}
            }
        }
        EventOutcome::Ignored
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// M4PratibimbaPlugin — personal graph stats
// ═══════════════════════════════════════════════════════════════════════════

pub struct M4PratibimbaPlugin {
    stats_text: String,
    recent_text: String,
    excavate_result: Option<String>,
}

impl M4PratibimbaPlugin {
    pub fn new() -> Self {
        let mut plugin = Self {
            stats_text: String::new(),
            recent_text: String::new(),
            excavate_result: None,
        };
        plugin.load_data();
        plugin
    }

    fn load_data(&mut self) {
        self.stats_text = crate::nara::pratibimba::stats(false)
            .unwrap_or_else(|e| format!("Error: {}", e));
        self.recent_text = crate::nara::pratibimba::recent(7, false)
            .unwrap_or_else(|e| format!("Error: {}", e));
    }
}

impl HypertilePlugin for M4PratibimbaPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let accent = theme::m_level_color(4);
        let dim = Style::default().fg(Color::DarkGray);
        let label_style = Style::default().fg(Color::Yellow);

        let mut lines: Vec<Line> = Vec::new();

        // Stats section
        lines.push(Line::from(Span::styled(
            "  Stats",
            Style::default().fg(accent).add_modifier(Modifier::BOLD),
        )));
        for sl in self.stats_text.lines() {
            lines.push(Line::from(Span::styled(
                format!("  {}", sl),
                Style::default().fg(Color::White),
            )));
        }
        lines.push(Line::from(""));

        // Recent section
        lines.push(Line::from(Span::styled("  Recent Activity", label_style)));
        for rl in self.recent_text.lines() {
            lines.push(Line::from(Span::styled(
                format!("  {}", rl),
                Style::default().fg(Color::White),
            )));
        }

        // Excavate result
        if let Some(ref result) = self.excavate_result {
            lines.push(Line::from(""));
            lines.push(Line::from(Span::styled("  Excavation", label_style)));
            for el in result.lines() {
                lines.push(Line::from(Span::styled(
                    format!("  {}", el),
                    Style::default().fg(Color::White),
                )));
            }
        }

        lines.push(Line::from(""));
        lines.push(Line::from(Span::styled(
            "  Neo4j required for live graph data",
            Style::default().fg(Color::Yellow),
        )));

        // Footer
        lines.push(Line::from(""));
        lines.push(Line::from(Span::styled(
            "  [e] excavate  [r] refresh",
            dim,
        )));

        let para = Paragraph::new(lines).block(
            Block::default()
                .title(Span::styled(
                    " M4' Pratibimba ",
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
                KeyCode::Char('e') => {
                    self.excavate_result = Some(
                        crate::nara::pratibimba::excavate("self", false)
                            .unwrap_or_else(|e| format!("Error: {}", e))
                    );
                    return EventOutcome::Consumed;
                }
                KeyCode::Char('r') => {
                    self.load_data();
                    return EventOutcome::Consumed;
                }
                _ => {}
            }
        }
        EventOutcome::Ignored
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ratatui::buffer::Buffer;
    use ratatui::layout::Rect;

    fn buffer_to_string(buf: &Buffer, area: Rect) -> String {
        (0..area.height)
            .flat_map(|y| (0..area.width).map(move |x| buf[(x, y)].symbol().to_string()))
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

    // ── M4FlowPlugin ──

    #[test]
    fn m4_flow_renders_title() {
        let plugin = M4FlowPlugin::new();
        let area = Rect::new(0, 0, 60, 15);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content = buffer_to_string(&buf, area);
        assert!(content.contains("Flow"), "Should show Flow title");
    }

    #[test]
    fn m4_flow_input_mode_toggle() {
        let mut plugin = M4FlowPlugin::new();
        assert!(!plugin.input_mode);
        let event = HypertileEvent::Key(ratatui_hypertile::KeyChord::new(KeyCode::Char('i')));
        let outcome = plugin.on_event(&event);
        assert!(outcome.is_consumed());
        assert!(plugin.input_mode);
        // Esc exits
        let esc = HypertileEvent::Key(ratatui_hypertile::KeyChord::new(KeyCode::Escape));
        let outcome = plugin.on_event(&esc);
        assert!(outcome.is_consumed());
        assert!(!plugin.input_mode);
    }

    // ── M4OraclePlugin ──

    #[test]
    fn m4_oracle_renders_title() {
        let plugin = M4OraclePlugin::new();
        let area = Rect::new(0, 0, 60, 20);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content = buffer_to_string(&buf, area);
        assert!(content.contains("Oracle"), "Should show Oracle title");
    }

    #[test]
    fn m4_oracle_consent_gate() {
        let mut plugin = M4OraclePlugin::new();
        assert!(!plugin.consent_pending);
        // Press 'c' to initiate cast
        let c_event = HypertileEvent::Key(ratatui_hypertile::KeyChord::new(KeyCode::Char('c')));
        let outcome = plugin.on_event(&c_event);
        assert!(outcome.is_consumed());
        assert!(plugin.consent_pending);
        // Press 'n' to cancel
        let n_event = HypertileEvent::Key(ratatui_hypertile::KeyChord::new(KeyCode::Char('n')));
        let outcome = plugin.on_event(&n_event);
        assert!(outcome.is_consumed());
        assert!(!plugin.consent_pending);
    }

    // ── M4MedicinePlugin ──

    #[test]
    fn m4_medicine_renders_title() {
        let plugin = M4MedicinePlugin::new();
        let area = Rect::new(0, 0, 60, 20);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content = buffer_to_string(&buf, area);
        assert!(content.contains("Medicine"), "Should show Medicine title");
    }

    // ── M4TransformPlugin ──

    #[test]
    fn m4_transform_renders_title() {
        let plugin = M4TransformPlugin::new();
        let area = Rect::new(0, 0, 60, 20);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content = buffer_to_string(&buf, area);
        assert!(content.contains("Transform"), "Should show Transform title");
    }

    #[test]
    fn m4_transform_scroll() {
        let mut plugin = M4TransformPlugin::new();
        assert_eq!(plugin.scroll, 0);
        let j = HypertileEvent::Key(ratatui_hypertile::KeyChord::new(KeyCode::Char('j')));
        plugin.on_event(&j);
        assert_eq!(plugin.scroll, 1);
        let k = HypertileEvent::Key(ratatui_hypertile::KeyChord::new(KeyCode::Char('k')));
        plugin.on_event(&k);
        assert_eq!(plugin.scroll, 0);
    }

    // ── M4LensPlugin ──

    #[test]
    fn m4_lens_renders_title() {
        let plugin = M4LensPlugin::new();
        let area = Rect::new(0, 0, 70, 15);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content = buffer_to_string(&buf, area);
        assert!(content.contains("Lens"), "Should show Lenses title");
    }

    #[test]
    fn m4_lens_navigation() {
        let mut plugin = M4LensPlugin::new();
        assert_eq!(plugin.selected, 0);
        let j = HypertileEvent::Key(ratatui_hypertile::KeyChord::new(KeyCode::Char('j')));
        plugin.on_event(&j);
        assert_eq!(plugin.selected, 1);
        // Cannot go past 5
        for _ in 0..10 {
            plugin.on_event(&j);
        }
        assert_eq!(plugin.selected, 5);
    }

    // ── M4PratibimbaPlugin ──

    #[test]
    fn m4_pratibimba_renders_title() {
        let plugin = M4PratibimbaPlugin::new();
        let area = Rect::new(0, 0, 60, 20);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, true);
        let content = buffer_to_string(&buf, area);
        assert!(content.contains("Pratibimba"), "Should show Pratibimba title");
    }
}
