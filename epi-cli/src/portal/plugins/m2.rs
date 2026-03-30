use crate::nara::medicine::{PLANET_CHAKRA, ZODIAC_DECAN_TABLE};
use crate::portal::clock_state::SharedClockState;
use crate::portal::theme;
use ratatui::prelude::*;
use ratatui::widgets::*;
use ratatui_hypertile::{EventOutcome, HypertileEvent, KeyCode};
use ratatui_hypertile_extras::HypertilePlugin;

// ── Static lookup tables ──────────────────────────────────────────────────────

/// Decan rulers in Chaldean/Golden Dawn order, canonical mod-10 planet indices.
/// medicine.rs Planet_Id: SUN=0, EARTH=1(unused), VENUS=2, MERCURY=3, MOON=4, SATURN=5, JUPITER=6, MARS=7
pub static DECAN_RULER_TABLE: [u8; 36] = [
    7, 0, 2,  // Aries:       Mars(7), Sun(0), Venus(2)
    3, 4, 5,  // Taurus:      Mercury(3), Moon(4), Saturn(5)
    6, 7, 0,  // Gemini:      Jupiter(6), Mars(7), Sun(0)
    2, 3, 4,  // Cancer:      Venus(2), Mercury(3), Moon(4)
    5, 6, 7,  // Leo:         Saturn(5), Jupiter(6), Mars(7)
    0, 2, 3,  // Virgo:       Sun(0), Venus(2), Mercury(3)
    4, 5, 6,  // Libra:       Moon(4), Saturn(5), Jupiter(6)
    7, 0, 2,  // Scorpio:     Mars(7), Sun(0), Venus(2)
    3, 4, 5,  // Sagittarius: Mercury(3), Moon(4), Saturn(5)
    6, 7, 0,  // Capricorn:   Jupiter(6), Mars(7), Sun(0)
    2, 3, 4,  // Aquarius:    Venus(2), Mercury(3), Moon(4)
    5, 6, 7,  // Pisces:      Saturn(5), Jupiter(6), Mars(7)
];

pub static PLANET_SYMBOLS: [char; 10] = [
    '☉', // 0: Sun
    '⊕', // 1: Earth (geocentric observer)
    '♀', // 2: Venus
    '☿', // 3: Mercury
    '☽', // 4: Moon
    '♄', // 5: Saturn
    '♃', // 6: Jupiter
    '♂', // 7: Mars
    '♆', // 8: Neptune
    '♇', // 9: Pluto
];

pub static CHAKRA_SYMBOLS: [char; 8] = [
    '⊕', '①', '②', '③', '④', '⑤', '⑥', '⑦',
];

pub static PLANET_NAMES: [&str; 10] = [
    "Sun", "Earth", "Venus", "Mercury", "Moon",
    "Saturn", "Jupiter", "Mars", "Neptune", "Pluto",
];

pub static ELEMENT_NAMES: [&str; 5] = ["Akasha", "Air", "Fire", "Water", "Earth"];
pub static CHAKRA_NAMES: [&str; 8] = [
    "Ground", "Muladhara", "Svadhisthana", "Manipura",
    "Anahata", "Vishuddha", "Ajna", "Sahasrara",
];
pub static ZODIAC_NAMES: [&str; 12] = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];
pub static ZODIAC_GLYPHS: [char; 12] = [
    '\u{2648}', '\u{2649}', '\u{264A}', '\u{264B}', '\u{264C}', '\u{264D}',
    '\u{264E}', '\u{264F}', '\u{2650}', '\u{2651}', '\u{2652}', '\u{2653}',
];

// Element from zodiac sign: Fire(2)=Aries/Leo/Sag(0,4,8), Earth(4)=Taurus/Virgo/Cap(1,5,9),
// Air(1)=Gemini/Libra/Aquarius(2,6,10), Water(3)=Cancer/Scorpio/Pisces(3,7,11)
static SIGN_ELEMENT: [u8; 12] = [
    2, 4, 1, 3, 2, 4, 1, 3, 2, 4, 1, 3,
];

pub fn element_color(element: u8) -> Color {
    match element {
        1 => Color::Yellow,   // Air
        2 => Color::Red,      // Fire
        3 => Color::Cyan,     // Water
        4 => Color::Green,    // Earth
        _ => Color::White,    // Akasha / unknown
    }
}

// ── Core data structs ─────────────────────────────────────────────────────────

#[derive(Clone, Copy)]
pub struct MatrixCell {
    pub half_decan_idx: u8,
    pub decan_idx: u8,
    pub strand: u8,
    pub ruling_planet: u8,
    pub element: u8,
    pub zodiac_sign: u8,
    pub decan_within_sign: u8,
    pub chakra: u8,
    pub primary_hex: u8,
    pub body_zone: &'static str,
    pub herb: &'static str,
}

impl Default for MatrixCell {
    fn default() -> Self {
        MatrixCell {
            half_decan_idx: 0,
            decan_idx: 0,
            strand: 0,
            ruling_planet: 0,
            element: 0,
            zodiac_sign: 0,
            decan_within_sign: 0,
            chakra: 0,
            primary_hex: 0,
            body_zone: "",
            herb: "",
        }
    }
}

#[derive(Clone, Copy, PartialEq)]
pub enum ViewMode {
    Matrix,
    Detail,
    PlanetOverlay,
}

// ── Plugin struct ─────────────────────────────────────────────────────────────

pub struct M2VibrationalPlugin {
    cells: [[MatrixCell; 6]; 12],
    current_tick12: u8,
    planet_at_half_decan: [Option<u8>; 72],
    selected: (usize, usize),
    view_mode: ViewMode,
    shared_clock: Option<SharedClockState>,
}

impl M2VibrationalPlugin {
    pub fn new() -> Self {
        Self {
            cells: build_cells(),
            current_tick12: 0,
            planet_at_half_decan: [None; 72],
            selected: (0, 0),
            view_mode: ViewMode::Matrix,
            shared_clock: None,
        }
    }

    pub fn new_with_clock(clock: SharedClockState) -> Self {
        let mut s = Self::new();
        s.shared_clock = Some(clock);
        s.sync_clock();
        s
    }

    fn sync_clock(&mut self) {
        if let Some(ref clock) = self.shared_clock {
            let state = clock.lock().unwrap();
            self.current_tick12 = state.tick12;
            // Update planet positions from kairos
            self.planet_at_half_decan = [None; 72];
            for (planet_idx, planet) in state.kairos.planets.iter().enumerate() {
                if planet.degree == 0xFFFF {
                    continue;
                }
                // degree 0-359 → decan 0-35 → half-decan 0-71
                let decan_idx = (planet.degree / 10) as u8;
                let hd_a = (decan_idx * 2) as usize;
                let hd_b = hd_a + 1;
                if hd_a < 72 {
                    self.planet_at_half_decan[hd_a] = Some(planet_idx as u8);
                }
                if hd_b < 72 {
                    self.planet_at_half_decan[hd_b] = Some(planet_idx as u8);
                }
            }
        }
    }

    fn selected_cell(&self) -> &MatrixCell {
        &self.cells[self.selected.0][self.selected.1]
    }

    fn render_matrix(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let outer = Layout::vertical([
            Constraint::Length(3),
            Constraint::Min(1),
            Constraint::Length(1),
        ])
        .split(area);

        // Status bar
        let cell = self.selected_cell();
        let chakra_idx = cell.chakra as usize;
        let planet_idx = cell.ruling_planet as usize;
        let sign_idx = cell.zodiac_sign as usize;
        let elem_idx = cell.element as usize;
        let status = format!(
            " tick12={} · {} D{} · {} · {} {} · Chakra {} {}",
            self.selected.0,
            ZODIAC_NAMES.get(sign_idx).unwrap_or(&"?"),
            cell.decan_idx,
            ELEMENT_NAMES.get(elem_idx).unwrap_or(&"?"),
            PLANET_SYMBOLS.get(planet_idx).copied().unwrap_or('?'),
            PLANET_NAMES.get(planet_idx).unwrap_or(&"?"),
            CHAKRA_SYMBOLS.get(chakra_idx).copied().unwrap_or('?'),
            CHAKRA_NAMES.get(chakra_idx).unwrap_or(&"?"),
        );
        let status_para = Paragraph::new(status).block(
            Block::default()
                .borders(Borders::ALL)
                .border_style(Style::default().fg(theme::pane_border(is_focused))),
        );
        Widget::render(status_para, outer[0], buf);

        // Main matrix + detail split
        let inner = Layout::horizontal([
            Constraint::Percentage(70),
            Constraint::Percentage(30),
        ])
        .split(outer[1]);

        self.render_grid(inner[0], buf);
        self.render_detail_sidebar(inner[1], buf);

        // Key hint bar
        let hints = Paragraph::new(
            " [jk/arrows] Navigate  [hl] QL  [Enter] Detail  [p] Planets  [r] Refresh",
        )
        .style(Style::default().fg(Color::DarkGray));
        Widget::render(hints, outer[2], buf);
    }

    fn render_grid(&self, area: Rect, buf: &mut Buffer) {
        if area.height < 2 {
            return;
        }
        // Header row
        let header = format!(
            " {:<9}| {:<5}| {:<5}| {:<5}| {:<5}| {:<5}| {:<5}",
            "t12\\QL", "#0", "#1", "#2", "#3", "#4", "#5"
        );
        buf.set_string(
            area.x,
            area.y,
            &header,
            Style::default().fg(Color::DarkGray),
        );

        let start_y = area.y + 1;

        for tick12 in 0..12usize {
            let y = start_y + tick12 as u16;
            if y >= area.y + area.height {
                break;
            }

            let is_current = tick12 as u8 == self.current_tick12;
            let is_selected_row = tick12 == self.selected.0;
            let strand_label = if tick12 < 6 { 'A' } else { 'B' };
            let sign_idx = self.cells[tick12][0].zodiac_sign as usize;
            let glyph = ZODIAC_GLYPHS.get(sign_idx).copied().unwrap_or('?');

            let current_marker = if is_current { '►' } else { ' ' };
            let row_prefix = format!(
                "{}{:>2} {} {}",
                current_marker, tick12, glyph, strand_label
            );

            let row_style = if is_current {
                Style::default()
                    .add_modifier(Modifier::BOLD)
                    .fg(element_color(self.cells[tick12][0].element))
            } else if is_selected_row {
                Style::default().fg(Color::White)
            } else {
                Style::default().fg(Color::DarkGray)
            };

            let mut line = format!("{:<9}", row_prefix);

            for ql in 0..6usize {
                let cell = &self.cells[tick12][ql];
                let hd = cell.half_decan_idx as usize;
                let is_selected_cell = tick12 == self.selected.0 && ql == self.selected.1;

                let cell_content = if self.view_mode == ViewMode::PlanetOverlay {
                    if let Some(p) = self.planet_at_half_decan[hd] {
                        let sym = PLANET_SYMBOLS.get(p as usize).copied().unwrap_or('?');
                        format!("|{:^4}", sym)
                    } else {
                        format!("|{:^4}", '\u{00B7}') // middle dot
                    }
                } else if is_selected_cell {
                    format!("|>{:02}<", hd)
                } else {
                    format!("|{:^4}", format!("D{:02}", hd))
                };
                line.push_str(&cell_content);
            }

            // Draw Mobius boundary separator between strand A and B
            if tick12 == 5 {
                let sep_y = y + 1;
                if sep_y < area.y + area.height {
                    buf.set_string(
                        area.x,
                        sep_y,
                        "  \u{2550}\u{2550}\u{2550} Mobius boundary \u{2550}\u{2550}\u{2550}",
                        Style::default()
                            .fg(Color::Magenta)
                            .add_modifier(Modifier::DIM),
                    );
                }
            }

            buf.set_string(area.x, y, &line, row_style);
        }
    }

    fn render_detail_sidebar(&self, area: Rect, buf: &mut Buffer) {
        let cell = self.selected_cell();
        let sign_idx = cell.zodiac_sign as usize;
        let planet_idx = cell.ruling_planet as usize;
        let chakra_idx = cell.chakra as usize;
        let elem_idx = cell.element as usize;

        let content = vec![
            Line::from(vec![
                Span::styled("decan:  ", Style::default().fg(Color::DarkGray)),
                Span::styled(
                    format!("{}", cell.decan_idx),
                    Style::default().fg(Color::White),
                ),
            ]),
            Line::from(vec![
                Span::styled("sign:   ", Style::default().fg(Color::DarkGray)),
                Span::styled(
                    format!(
                        "{} {}",
                        ZODIAC_GLYPHS.get(sign_idx).copied().unwrap_or('?'),
                        ZODIAC_NAMES.get(sign_idx).unwrap_or(&"?")
                    ),
                    Style::default()
                        .fg(element_color(cell.element))
                        .add_modifier(Modifier::BOLD),
                ),
            ]),
            Line::from(vec![
                Span::styled("elem:   ", Style::default().fg(Color::DarkGray)),
                Span::styled(
                    ELEMENT_NAMES.get(elem_idx).unwrap_or(&"?").to_string(),
                    Style::default().fg(element_color(cell.element)),
                ),
            ]),
            Line::from(vec![
                Span::styled("ruler:  ", Style::default().fg(Color::DarkGray)),
                Span::styled(
                    format!(
                        "{} {}",
                        PLANET_SYMBOLS.get(planet_idx).copied().unwrap_or('?'),
                        PLANET_NAMES.get(planet_idx).unwrap_or(&"?")
                    ),
                    Style::default().fg(Color::Yellow),
                ),
            ]),
            Line::from(vec![
                Span::styled("chakra: ", Style::default().fg(Color::DarkGray)),
                Span::styled(
                    format!(
                        "{} {}",
                        CHAKRA_SYMBOLS.get(chakra_idx).copied().unwrap_or('?'),
                        CHAKRA_NAMES.get(chakra_idx).unwrap_or(&"?")
                    ),
                    Style::default().fg(Color::Cyan),
                ),
            ]),
            Line::from(vec![
                Span::styled("strand: ", Style::default().fg(Color::DarkGray)),
                Span::styled(
                    if cell.strand == 0 {
                        "A (explicate)"
                    } else {
                        "B (implicate)"
                    },
                    Style::default().fg(Color::White),
                ),
            ]),
            Line::from(vec![
                Span::styled("hex:    ", Style::default().fg(Color::DarkGray)),
                Span::styled(
                    format!("~{} [approx]", cell.primary_hex),
                    Style::default().fg(Color::DarkGray),
                ),
            ]),
            Line::from(""),
            Line::from(vec![
                Span::styled("body:   ", Style::default().fg(Color::DarkGray)),
                Span::styled(cell.body_zone, Style::default().fg(Color::Green)),
            ]),
            Line::from(vec![
                Span::styled("herb:   ", Style::default().fg(Color::DarkGray)),
                Span::styled(cell.herb, Style::default().fg(Color::Green)),
            ]),
        ];

        let para = Paragraph::new(content)
            .block(
                Block::default()
                    .title(" Detail ")
                    .borders(Borders::ALL)
                    .border_style(Style::default().fg(Color::DarkGray)),
            )
            .wrap(Wrap { trim: true });
        Widget::render(para, area, buf);
    }
}

fn build_cells() -> [[MatrixCell; 6]; 12] {
    let mut cells = [[MatrixCell::default(); 6]; 12];
    for tick12 in 0..12usize {
        for ql_pos in 0..6usize {
            let half_decan_idx = (tick12 * 6 + ql_pos) as u8;
            let decan_idx = half_decan_idx / 2;
            let strand = if tick12 < 6 { 0u8 } else { 1u8 };
            let zodiac_sign = decan_idx / 3;
            let decan_within_sign = decan_idx % 3;
            let ruling_planet = DECAN_RULER_TABLE[decan_idx as usize];
            let element = SIGN_ELEMENT[zodiac_sign as usize];
            // PLANET_CHAKRA has 8 entries (Planet_Id 0-7). Clamp to 7 for safety.
            let planet_chakra_idx = (ruling_planet as usize).min(PLANET_CHAKRA.len() - 1);
            let chakra = PLANET_CHAKRA[planet_chakra_idx];
            // Approximate hexagram until CLOCK_DEGREE_LUT is built (Task 5)
            let primary_hex = ((decan_idx as u16 * 64) / 36) as u8;
            let body_zone = ZODIAC_DECAN_TABLE[decan_idx as usize].body_part;
            let herb = ZODIAC_DECAN_TABLE[decan_idx as usize].herb;

            cells[tick12][ql_pos] = MatrixCell {
                half_decan_idx,
                decan_idx,
                strand,
                ruling_planet,
                element,
                zodiac_sign,
                decan_within_sign,
                chakra,
                primary_hex,
                body_zone,
                herb,
            };
        }
    }
    cells
}

impl HypertilePlugin for M2VibrationalPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        match self.view_mode {
            ViewMode::Detail => {
                let cell = self.selected_cell();
                let sign_idx = cell.zodiac_sign as usize;
                let planet_idx = cell.ruling_planet as usize;
                let chakra_idx = cell.chakra as usize;
                let elem_idx = cell.element as usize;
                let content = vec![
                    Line::from(
                        format!("half-decan {}", cell.half_decan_idx)
                    ).style(Style::default().add_modifier(Modifier::BOLD)),
                    Line::from(""),
                    Line::from(format!(
                        "  Decan:    #{} of 36  ({}/3 within sign)",
                        cell.decan_idx, cell.decan_within_sign
                    )),
                    Line::from(format!(
                        "  Zodiac:   {} {} ({})",
                        ZODIAC_GLYPHS.get(sign_idx).copied().unwrap_or('?'),
                        ZODIAC_NAMES.get(sign_idx).unwrap_or(&"?"),
                        ELEMENT_NAMES.get(elem_idx).unwrap_or(&"?")
                    )),
                    Line::from(format!(
                        "  Ruling:   {} {}",
                        PLANET_SYMBOLS.get(planet_idx).copied().unwrap_or('?'),
                        PLANET_NAMES.get(planet_idx).unwrap_or(&"?")
                    )),
                    Line::from(format!(
                        "  Chakra:   {} {}",
                        CHAKRA_SYMBOLS.get(chakra_idx).copied().unwrap_or('?'),
                        CHAKRA_NAMES.get(chakra_idx).unwrap_or(&"?")
                    )),
                    Line::from(format!(
                        "  Strand:   {} ({})",
                        if cell.strand == 0 { "A" } else { "B" },
                        if cell.strand == 0 { "explicate, phase=0" } else { "implicate, phase=1" }
                    )),
                    Line::from(format!(
                        "  Hex:      ~{} [approximated — CLOCK_DEGREE_LUT pending]",
                        cell.primary_hex
                    )),
                    Line::from(""),
                    Line::from(format!("  Body Zone: {}", cell.body_zone)),
                    Line::from(format!("  Herb:      {}", cell.herb)),
                    Line::from(""),
                    Line::from(format!("  Spanda tick: t{} of 12", self.selected.0)),
                    Line::from(format!("  QL position: #{}", self.selected.1)),
                    Line::from(""),
                    Line::from("  [Esc] Back  [n] Next  [b] Prev")
                        .style(Style::default().fg(Color::DarkGray)),
                ];
                let para = Paragraph::new(content).block(
                    Block::default()
                        .title(format!(" Cell Detail: half-decan {} ", cell.half_decan_idx))
                        .borders(Borders::ALL)
                        .border_style(Style::default().fg(theme::pane_border(is_focused))),
                );
                Widget::render(para, area, buf);
            }
            _ => self.render_matrix(area, buf, is_focused),
        }
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        match event {
            HypertileEvent::Tick => {
                self.sync_clock();
                EventOutcome::Consumed
            }
            HypertileEvent::Key(chord) => match chord.code {
                KeyCode::Up | KeyCode::Char('k') => {
                    if self.selected.0 > 0 {
                        self.selected.0 -= 1;
                    }
                    EventOutcome::Consumed
                }
                KeyCode::Down | KeyCode::Char('j') => {
                    if self.selected.0 < 11 {
                        self.selected.0 += 1;
                    }
                    EventOutcome::Consumed
                }
                KeyCode::Left | KeyCode::Char('h') => {
                    if self.selected.1 > 0 {
                        self.selected.1 -= 1;
                    }
                    EventOutcome::Consumed
                }
                KeyCode::Right | KeyCode::Char('l') => {
                    if self.selected.1 < 5 {
                        self.selected.1 += 1;
                    }
                    EventOutcome::Consumed
                }
                KeyCode::Enter => {
                    self.view_mode = ViewMode::Detail;
                    EventOutcome::Consumed
                }
                KeyCode::Escape => {
                    self.view_mode = ViewMode::Matrix;
                    EventOutcome::Consumed
                }
                KeyCode::Char('p') => {
                    self.view_mode = if self.view_mode == ViewMode::PlanetOverlay {
                        ViewMode::Matrix
                    } else {
                        ViewMode::PlanetOverlay
                    };
                    EventOutcome::Consumed
                }
                KeyCode::Char('r') => {
                    self.sync_clock();
                    EventOutcome::Consumed
                }
                KeyCode::Char('n') => {
                    if self.view_mode == ViewMode::Detail {
                        let hd = self.selected_cell().half_decan_idx as usize;
                        let next = (hd + 1) % 72;
                        self.selected = (next / 6, next % 6);
                    }
                    EventOutcome::Consumed
                }
                KeyCode::Char('b') => {
                    if self.view_mode == ViewMode::Detail {
                        let hd = self.selected_cell().half_decan_idx as usize;
                        let prev = if hd == 0 { 71 } else { hd - 1 };
                        self.selected = (prev / 6, prev % 6);
                    }
                    EventOutcome::Consumed
                }
                _ => EventOutcome::Ignored,
            },
            _ => EventOutcome::Ignored,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn build_cells_produces_72_valid_cells() {
        let cells = build_cells();
        let mut count = 0;
        for row in &cells {
            for cell in row {
                assert!(cell.decan_idx < 36, "decan_idx out of range: {}", cell.decan_idx);
                assert!(cell.ruling_planet < 10, "ruling_planet out of range: {}", cell.ruling_planet);
                assert!(cell.zodiac_sign < 12, "zodiac_sign out of range: {}", cell.zodiac_sign);
                assert!(cell.chakra < 8, "chakra out of range: {}", cell.chakra);
                count += 1;
            }
        }
        assert_eq!(count, 72);
    }

    #[test]
    fn strand_a_is_ticks_0_to_5() {
        let cells = build_cells();
        for tick in 0..6 {
            for ql in 0..6 {
                assert_eq!(
                    cells[tick][ql].strand, 0,
                    "tick={} ql={} should be strand A", tick, ql
                );
            }
        }
    }

    #[test]
    fn strand_b_is_ticks_6_to_11() {
        let cells = build_cells();
        for tick in 6..12 {
            for ql in 0..6 {
                assert_eq!(
                    cells[tick][ql].strand, 1,
                    "tick={} ql={} should be strand B", tick, ql
                );
            }
        }
    }

    #[test]
    fn half_decan_idx_matches_position() {
        let cells = build_cells();
        for tick in 0..12usize {
            for ql in 0..6usize {
                assert_eq!(
                    cells[tick][ql].half_decan_idx,
                    (tick * 6 + ql) as u8,
                    "half_decan_idx mismatch at tick={} ql={}", tick, ql
                );
            }
        }
    }

    #[test]
    fn decan_ruler_aries_uses_medicine_planet_ids() {
        // Aries decans: Mars(7), Sun(0), Venus(2) — medicine.rs Planet_Id encoding
        assert_eq!(DECAN_RULER_TABLE[0], 7); // Mars
        assert_eq!(DECAN_RULER_TABLE[1], 0); // Sun
        assert_eq!(DECAN_RULER_TABLE[2], 2); // Venus
    }

    #[test]
    fn planet_symbols_has_10_entries() {
        assert_eq!(PLANET_SYMBOLS.len(), 10);
    }

    #[test]
    fn new_with_clock_creates_plugin() {
        use crate::portal::clock_state::new_shared_clock_state;
        let clock = new_shared_clock_state();
        let plugin = M2VibrationalPlugin::new_with_clock(clock);
        assert_eq!(plugin.cells[0][0].half_decan_idx, 0);
        assert_eq!(plugin.cells[11][5].half_decan_idx, 71);
    }

    #[test]
    fn element_correctly_derived_from_sign() {
        let cells = build_cells();
        // Aries (sign=0) = Fire (element=2)
        assert_eq!(cells[0][0].zodiac_sign, 0);
        assert_eq!(cells[0][0].element, 2);
        // Taurus (sign=1) = Earth (element=4) — starts at half-decan 6 → tick=1, ql=0
        assert_eq!(cells[1][0].zodiac_sign, 1);
        assert_eq!(cells[1][0].element, 4);
    }

    #[test]
    fn all_body_zones_and_herbs_non_empty() {
        let cells = build_cells();
        for tick in 0..12 {
            for ql in 0..6 {
                let cell = &cells[tick][ql];
                assert!(
                    !cell.body_zone.is_empty(),
                    "body_zone empty at tick={} ql={} decan={}", tick, ql, cell.decan_idx
                );
                assert!(
                    !cell.herb.is_empty(),
                    "herb empty at tick={} ql={} decan={}", tick, ql, cell.decan_idx
                );
            }
        }
    }
}
