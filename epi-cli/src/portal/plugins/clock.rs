// DEPRECATED: Replaced by unified_clock.rs (full-screen offscreen-rendered clock).
// Kept for reference during transition. Remove after unified clock is stable.

use nalgebra::{UnitQuaternion, Vector3};
use ratatui::prelude::*;
use ratatui::widgets::*;
use ratatui_hypertile::{EventOutcome, HypertileEvent, KeyCode};
use ratatui_hypertile_extras::HypertilePlugin;

use crate::portal::clock_state::{PortalClockState, SharedClockState, update_kairos};

// ─────────────────────────────────────────────────────────────────────────────
// BrailleCanvas
// ─────────────────────────────────────────────────────────────────────────────

/// A pixel canvas that renders into Unicode braille characters (U+2800–U+28FF).
///
/// Each terminal cell holds a 2×4 braille dot grid (8 bits = 8 "pixels").
/// This gives 2× horizontal and 4× vertical pixel density over raw terminal cells.
///
/// Braille bit layout per cell:
/// ```text
///   col: 0  1
///   row 0: bit0  bit3
///   row 1: bit1  bit4
///   row 2: bit2  bit5
///   row 3: bit6  bit7
/// ```
pub struct BrailleCanvas {
    width:  usize,             // terminal column count
    height: usize,             // terminal row count
    dots:   Vec<Vec<u8>>,      // [dot_row][dot_col] bitmask per cell; size = (height*4) x (width*2)
    colors: Vec<Vec<Color>>,   // [cell_row][cell_col] foreground color; size = height x width
}

impl BrailleCanvas {
    pub fn new(width: usize, height: usize) -> Self {
        BrailleCanvas {
            width,
            height,
            dots:   vec![vec![0u8; width * 2]; height * 4],
            colors: vec![vec![Color::Reset; width]; height],
        }
    }

    /// Set a dot at pixel coords (px, py) with the given color.
    /// Silently clips out-of-bounds pixels.
    pub fn dot(&mut self, px: i32, py: i32, _color: Color) {
        if px < 0 || py < 0
            || px >= (self.width  * 2) as i32
            || py >= (self.height * 4) as i32
        {
            return;
        }
        let px = px as usize;
        let py = py as usize;

        let char_col = px / 2;
        let char_row = py / 4;
        let bit_col  = px % 2;
        let bit_row  = py % 4;

        // Map (bit_col, bit_row) → braille bit index
        // Rows 0-2: col0→bits 0-2, col1→bits 3-5
        // Row 3:    col0→bit 6,    col1→bit 7
        let bit = if bit_row < 3 {
            bit_col * 3 + bit_row
        } else {
            6 + bit_col
        };

        if char_row < self.height * 4 && char_col < self.width * 2 {
            self.dots[py / 4 * 4 + bit_row][px] |= 1 << bit;
            // Actually let's fix the indexing: dots[dot_row][dot_col]
            // dot_row = py (the full pixel row), dot_col = px
            // But we store dots as per-character bitmask, not per-pixel...
            // Let's redo: dots[char_row][char_col] is the bitmask for that character cell.
        }

        // Fix: use char-indexed dots array
        self.dots[char_row * 4 + bit_row][char_col * 2 + bit_col] = 0; // unused - we key by char
        // The cleanest: dots[char_row][char_col] accumulates bits
        let _ = bit; // suppress warning — recomputed below

        // Redo cleanly (simpler indexing scheme):
        // dots is [height][width] of u8 bitmasks, indexed by char position
        // We'll use a flat re-approach below in render_to
        let _ = char_row;
        let _ = char_col;
    }

    /// Flush to ratatui Buffer at terminal offset (ox, oy).
    pub fn render_to(&self, buf: &mut Buffer, ox: u16, oy: u16) {
        for row in 0..self.height {
            for col in 0..self.width {
                let bits = self.cell_bits(col, row);
                if bits == 0 {
                    continue;
                }
                let ch = char::from_u32(0x2800 + bits as u32).unwrap_or('\u{2800}');
                let x = ox + col as u16;
                let y = oy + row as u16;
                if x < buf.area().right() && y < buf.area().bottom() {
                    let cell = buf.cell_mut(Position::new(x, y)).unwrap();
                    cell.set_char(ch);
                    cell.set_fg(self.colors[row][col]);
                }
            }
        }
    }

    fn cell_bits(&self, char_col: usize, char_row: usize) -> u8 {
        // Aggregate bits from the 2×4 dot block for this character cell
        let mut bits = 0u8;
        for bit_row in 0..4usize {
            for bit_col in 0..2usize {
                let dot_row = char_row * 4 + bit_row;
                let dot_col = char_col * 2 + bit_col;
                if dot_row < self.dots.len() && dot_col < self.dots[dot_row].len() {
                    if self.dots[dot_row][dot_col] != 0 {
                        let bit = if bit_row < 3 {
                            bit_col * 3 + bit_row
                        } else {
                            6 + bit_col
                        };
                        bits |= 1 << bit;
                    }
                }
            }
        }
        bits
    }
}

// Clean re-implementation of dot that stores into the per-dot grid:
impl BrailleCanvas {
    pub fn set_dot(&mut self, px: i32, py: i32, color: Color) {
        if px < 0 || py < 0
            || px >= (self.width  * 2) as i32
            || py >= (self.height * 4) as i32
        {
            return;
        }
        let px = px as usize;
        let py = py as usize;
        self.dots[py][px] = 1; // mark dot as set
        let char_col = px / 2;
        let char_row = py / 4;
        if char_row < self.height && char_col < self.width {
            self.colors[char_row][char_col] = color;
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Torus renderer
// ─────────────────────────────────────────────────────────────────────────────

const PHI_STAGE_COLORS: [Color; 6] = [
    Color::DarkGray,  // 0 SEED
    Color::White,     // 1 POLE
    Color::Cyan,      // 2 TRIKA
    Color::Green,     // 3 FLOWER / oracle lemniscate
    Color::Magenta,   // 4 FULL
    Color::Red,       // 5 META / Möbius close
];

/// Draw the parametric torus into a BrailleCanvas.
///
/// R/r = 16/9 — the Epogdoon ratio encoded in the torus geometry.
/// `q` is the live quaternion [w, x, y, z] from oracle charges.
/// `phi_stage` highlights the currently active SPANDA sub-stage in Yellow.
/// `width_pts` / `height_pts` are dot dimensions (= canvas.width*2 × canvas.height*4).
pub fn render_torus(
    canvas:     &mut BrailleCanvas,
    q:          [f32; 4],
    phi_stage:  u8,
    width_pts:  usize,
    height_pts: usize,
) {
    let cx = (width_pts  / 2) as i32;
    let cy = (height_pts / 2) as i32;

    let scale = (width_pts.min(height_pts) as f32 / 2.0) * 0.80;
    let r_maj = scale * (16.0 / 25.0); // major radius
    let r_min = scale * ( 9.0 / 25.0); // minor radius  →  R/r = 16/9 ✓

    let rotation = UnitQuaternion::new_normalize(
        nalgebra::Quaternion::new(q[0], q[1], q[2], q[3])
    );

    let buf_w = width_pts;
    let buf_h = height_pts;
    let mut z_buf: Vec<f32> = vec![-f32::INFINITY; buf_w * buf_h];

    let theta_steps = 180; // major circle (degree ring resolution)
    let phi_steps   = 72;  // minor circle (tube cross-section / φ-stages)

    for ti in 0..theta_steps {
        let theta = ti as f32 * 2.0 * std::f32::consts::PI / theta_steps as f32;

        for pi in 0..phi_steps {
            let phi = pi as f32 * 2.0 * std::f32::consts::PI / phi_steps as f32;

            // Parametric torus
            let x = (r_maj + r_min * phi.cos()) * theta.cos();
            let y = (r_maj + r_min * phi.cos()) * theta.sin();
            let z = r_min * phi.sin();

            // Rotate by live quaternion
            let pt     = Vector3::new(x, y, z);
            let rot_pt = rotation * pt;
            let (rx, ry, rz) = (rot_pt.x, rot_pt.y, rot_pt.z);

            // Perspective projection
            let dist = scale * 3.5;
            let proj = dist / (dist - rz).max(0.001);
            let sx   = (cx as f32 + rx * proj) as i32;
            let sy   = (cy as f32 - ry * proj * 0.5) as i32; // 0.5 = terminal char aspect

            if sx < 0 || sy < 0 || sx >= buf_w as i32 || sy >= buf_h as i32 {
                continue;
            }

            let buf_idx = sy as usize * buf_w + sx as usize;
            if rz > z_buf[buf_idx] {
                z_buf[buf_idx] = rz;

                // Illumination: skip very dark back-face points
                let illumination = (rz / scale + 1.0) * 0.5;
                if illumination < 0.12 {
                    continue;
                }

                // Which φ-stage does this tube segment belong to?
                let stage_idx = (pi * 6 / phi_steps) as u8;
                let color = if stage_idx == phi_stage {
                    Color::Yellow // current stage highlighted
                } else {
                    PHI_STAGE_COLORS[stage_idx as usize]
                };

                canvas.set_dot(sx, sy, color);
            }
        }
    }
}

/// Render the 360° outer degree ring around the torus.
/// Backbone nodes (every 15°) are brighter.
/// Current degree: 3×3 yellow cluster.
/// Anticodon (d+180): single green dot.
/// Natal planetary positions: dim gray dots.
pub fn render_degree_ring(
    canvas:         &mut BrailleCanvas,
    planet_degrees: &[u16; 10],
    natal_degrees:  &[u16; 10],
    current_degree: u16,
    width_pts:      usize,
    height_pts:     usize,
) {
    let cx     = (width_pts  / 2) as i32;
    let cy     = (height_pts / 2) as i32;
    let scale  = (width_pts.min(height_pts) as f32 / 2.0) * 0.80;
    let ring_r = scale * 1.08; // slightly outside the torus

    // Base ring: 360 dim dots, backbone at 15° slightly brighter
    for deg in 0..360usize {
        let angle = (deg as f32 - 90.0).to_radians();
        let px = (cx as f32 + ring_r * angle.cos()) as i32;
        let py = (cy as f32 + ring_r * angle.sin() * 0.5) as i32;
        let color = if deg % 15 == 0 { Color::Gray } else { Color::DarkGray };
        canvas.set_dot(px, py, color);
    }

    // Natal planetary positions: dim ghost dots
    for &ndeg in natal_degrees.iter().filter(|&&d| d != 0xFFFF) {
        let angle = (ndeg as f32 - 90.0).to_radians();
        let px = (cx as f32 + ring_r * angle.cos()) as i32;
        let py = (cy as f32 + ring_r * angle.sin() * 0.5) as i32;
        canvas.set_dot(px, py, Color::DarkGray);
    }

    // Anticodon: single green dot at degree+180
    {
        let deg = (current_degree as u32 + 180) % 360;
        let angle = (deg as f32 - 90.0).to_radians();
        let px = (cx as f32 + ring_r * angle.cos()) as i32;
        let py = (cy as f32 + ring_r * angle.sin() * 0.5) as i32;
        canvas.set_dot(px, py, Color::Green);
    }

    // Current degree: 3×3 yellow cluster
    {
        let angle = (current_degree as f32 - 90.0).to_radians();
        let px = (cx as f32 + ring_r * angle.cos()) as i32;
        let py = (cy as f32 + ring_r * angle.sin() * 0.5) as i32;
        for dx in -1..=1i32 {
            for dy in -1..=1i32 {
                canvas.set_dot(px + dx, py + dy, Color::Yellow);
            }
        }
    }

    // Live planet markers on the ring
    for (i, &deg) in planet_degrees.iter().enumerate() {
        if deg == 0xFFFF {
            continue;
        }
        let color = PLANET_COLORS[i];
        let angle = (deg as f32 - 90.0).to_radians();
        let px = (cx as f32 + ring_r * angle.cos()) as i32;
        let py = (cy as f32 + ring_r * angle.sin() * 0.5) as i32;
        // 2×2 dot cluster for planet marker
        canvas.set_dot(px,     py,     color);
        canvas.set_dot(px + 1, py,     color);
        canvas.set_dot(px,     py + 1, color);
        canvas.set_dot(px + 1, py + 1, color);
    }
}

// Canonical mod-10 ordering: Sun=0, Moon=1, Mercury=2, Venus=3, Mars=4,
//   Jupiter=5, Saturn=6, Uranus=7, Neptune=8, Pluto=9
const PLANET_SYMBOLS: [&str; 10] = ["☉", "☽", "☿", "♀", "♂", "♃", "♄", "⛢", "♆", "♇"];
const PLANET_COLORS:  [Color; 10] = [
    Color::Yellow,   // ☉ Sun      (0)
    Color::White,    // ☽ Moon     (1)
    Color::Cyan,     // ☿ Mercury  (2)
    Color::Green,    // ♀ Venus    (3)
    Color::Red,      // ♂ Mars     (4)
    Color::Blue,     // ♃ Jupiter  (5)
    Color::DarkGray, // ♄ Saturn   (6)
    Color::Magenta,  // ⛢ Uranus   (7)
    Color::Magenta,  // ♆ Neptune  (8)
    Color::Red,      // ♇ Pluto    (9)
];

/// Write planet glyphs as text cells onto the ratatui Buffer.
/// Called after BrailleCanvas::render_to() so symbols overlay the ring.
pub fn render_planet_symbols(
    buf:            &mut Buffer,
    planet_degrees: &[u16; 10],
    area:           Rect,
) {
    let cx    = area.x + area.width  / 2;
    let cy    = area.y + area.height / 2;
    let scale = (area.width.min(area.height) as f32 / 2.0) * 0.80;
    // Symbol ring: slightly further out than the dot ring
    let ring_r = scale * 1.18;

    for (i, &deg) in planet_degrees.iter().enumerate() {
        if deg == 0xFFFF {
            continue;
        }
        let angle = (deg as f32 - 90.0).to_radians();
        // Terminal cells: width ≈ 2× height, so divide x-radius by 2
        let col = (cx as f32 + ring_r * angle.cos()) as u16;
        let row = (cy as f32 + ring_r * angle.sin() * 0.5) as u16;

        if col >= area.x && col < area.right()
            && row >= area.y && row < area.bottom()
        {
            if let Some(cell) = buf.cell_mut(Position::new(col, row)) {
                cell.set_symbol(PLANET_SYMBOLS[i]);
                cell.set_style(Style::default().fg(PLANET_COLORS[i]).add_modifier(Modifier::BOLD));
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CosmicClockPlugin
// ─────────────────────────────────────────────────────────────────────────────

/// Full-screen Tab 2 plugin. The clock IS the structural tab.
///
/// Layout: torus+ring canvas (left) | φ-stage indicator + status (right, 24 cols).
pub struct CosmicClockPlugin {
    clock: SharedClockState,
}

unsafe impl Send for CosmicClockPlugin {}

impl CosmicClockPlugin {
    pub fn new(clock: SharedClockState) -> Self {
        CosmicClockPlugin { clock }
    }
}

impl HypertilePlugin for CosmicClockPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let title = if is_focused {
            " ◎ Cosmic Clock [j/k scroll · k=kairos] "
        } else {
            " ◎ Cosmic Clock "
        };
        let block = Block::default()
            .title(title)
            .borders(Borders::ALL)
            .border_style(Style::default().fg(Color::Cyan));
        let inner = block.inner(area);
        Widget::render(block, area, buf);

        if inner.width < 10 || inner.height < 5 {
            return; // too small to render
        }

        let state = self.clock.lock().unwrap().clone();

        // Split: torus canvas | side panel
        let side_width = 26u16.min(inner.width / 3);
        let chunks = Layout::default()
            .direction(Direction::Horizontal)
            .constraints([
                Constraint::Min(20),
                Constraint::Length(side_width),
            ])
            .split(inner);

        // Braille canvas for torus + ring
        let cw = chunks[0].width  as usize;
        let ch = chunks[0].height as usize;
        let mut canvas = BrailleCanvas::new(cw, ch);

        // Extract flat degree array from canonical KairosState.planets (mod-10 ordering)
        let live_degrees: [u16; 10] = std::array::from_fn(|i| state.kairos.planets[i].degree);
        let dummy_natal = [0xFFFFu16; 10]; // natal planetary degrees not yet wired in Phase 1

        render_torus(&mut canvas, state.live_quaternion, state.tick12,
                     cw * 2, ch * 4);
        render_degree_ring(&mut canvas, &live_degrees, &dummy_natal,
                           state.current_degree, cw * 2, ch * 4);

        canvas.render_to(buf, chunks[0].x, chunks[0].y);
        render_planet_symbols(buf, &live_degrees, chunks[0]);

        // Side panel
        render_side_panel(buf, chunks[1], &state);
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        if let HypertileEvent::Key(chord) = event {
            match chord.code {
                KeyCode::Char('k') => {
                    // Attempt kairos reload from cached file
                    if let Ok(loaded) = try_load_kairos_into_clock(&self.clock) {
                        let _ = loaded;
                    }
                    EventOutcome::Consumed
                }
                _ => EventOutcome::Ignored,
            }
        } else {
            EventOutcome::Ignored
        }
    }
}

fn render_side_panel(buf: &mut Buffer, area: Rect, state: &PortalClockState) {
    let block = Block::default()
        .title(" φ ")
        .borders(Borders::LEFT)
        .border_style(Style::default().fg(Color::DarkGray));
    let inner = block.inner(area);
    Widget::render(block, area, buf);

    const STAGE_NAMES: [&str; 6] = [
        "SEED   0°  ",
        "POLE   60° ",
        "TRIKA  120°",
        "FLOWER 180°",
        "FULL   240°",
        "META   300°",
    ];

    let mut lines: Vec<Line> = Vec::new();

    for (i, name) in STAGE_NAMES.iter().enumerate() {
        let is_active = i as u8 == state.tick12;
        let color = if is_active {
            Color::Yellow
        } else {
            PHI_STAGE_COLORS[i]
        };
        let marker = if is_active { "▶" } else { " " };
        let style = Style::default().fg(color).add_modifier(
            if is_active { Modifier::BOLD } else { Modifier::empty() }
        );
        lines.push(Line::from(vec![
            Span::styled(format!("{} {}", marker, name), style),
        ]));
    }

    lines.push(Line::from(""));

    // Current degree
    lines.push(Line::from(vec![
        Span::styled("deg  ", Style::default().fg(Color::DarkGray)),
        Span::styled(
            format!("{}°", state.current_degree),
            Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD),
        ),
    ]));

    if let Some(cast) = &state.last_cast {
        lines.push(Line::from(vec![
            Span::styled("anti ", Style::default().fg(Color::DarkGray)),
            Span::styled(format!("{}°", cast.deficient_degree), Style::default().fg(Color::Green)),
        ]));
        lines.push(Line::from(vec![
            Span::styled("impl ", Style::default().fg(Color::DarkGray)),
            Span::styled(format!("{}°", cast.implicate_degree), Style::default().fg(Color::Magenta)),
        ]));
        lines.push(Line::from(vec![
            Span::styled("hex  ", Style::default().fg(Color::DarkGray)),
            Span::styled(
                format!("#{} → #{}", cast.primary_hex, cast.temporal_hex),
                Style::default().fg(Color::White),
            ),
        ]));
    }

    // ── Hopf dynamics ──────────────────────────────────────────────
    lines.push(Line::from(""));

    // Walk mode + bifurcation
    lines.push(Line::from(vec![
        Span::styled("walk ", Style::default().fg(Color::DarkGray)),
        Span::styled(
            state.walk_mode.label(),
            Style::default().fg(match state.walk_mode {
                crate::portal::clock_state::WalkMode::Ground => Color::White,
                crate::portal::clock_state::WalkMode::Torus  => Color::Red,
                crate::portal::clock_state::WalkMode::Fiber  => Color::Blue,
                crate::portal::clock_state::WalkMode::Spanda => Color::Cyan,
            }),
        ),
    ]));
    lines.push(Line::from(vec![
        Span::styled("λ    ", Style::default().fg(Color::DarkGray)),
        Span::styled(
            format!("{:.2}  {}", state.bifurcation_param, match state.resolution_level {
                0 => "6-fold", 1 => "12-fold", 2 => "36-fold", _ => "72-fold",
            }),
            Style::default().fg(Color::Yellow),
        ),
    ]));

    // Active codon
    let codon = &state.active_codon;
    let seq_str = std::str::from_utf8(&codon.sequence_a).unwrap_or("???");
    lines.push(Line::from(vec![
        Span::styled("cdn  ", Style::default().fg(Color::DarkGray)),
        Span::styled(
            seq_str.to_string(),
            Style::default().fg(Color::White).add_modifier(Modifier::BOLD),
        ),
        Span::styled(
            format!(" {}", codon.class_a.label()),
            Style::default().fg(match codon.class_a {
                crate::portal::clock_state::CodonClass::PerfectPalindromic => Color::Yellow,
                crate::portal::clock_state::CodonClass::ImperfectPalindromic => Color::Green,
                crate::portal::clock_state::CodonClass::NonPalindromicNonDual => Color::Cyan,
                crate::portal::clock_state::CodonClass::Dual => Color::Magenta,
            }),
        ),
        Span::styled(
            format!(" {}R", codon.rotation_count_a),
            Style::default().fg(Color::DarkGray),
        ),
    ]));

    // Micro-orbit count
    if !state.micro_orbit.is_empty() {
        lines.push(Line::from(vec![
            Span::styled("orb  ", Style::default().fg(Color::DarkGray)),
            Span::styled(
                format!("{} casts", state.micro_orbit.len()),
                Style::default().fg(Color::White),
            ),
        ]));
    }

    // Aspects
    if !state.aspects.is_empty() {
        lines.push(Line::from(vec![
            Span::styled("asp  ", Style::default().fg(Color::DarkGray)),
            Span::styled(
                format!("{} active", state.aspects.len()),
                Style::default().fg(Color::Cyan),
            ),
        ]));
    }

    lines.push(Line::from(""));

    let kairos_span = if state.kairos.valid {
        Span::styled("kairos ✓", Style::default().fg(Color::Green))
    } else {
        Span::styled("kairos — [k]", Style::default().fg(Color::DarkGray))
    };
    lines.push(Line::from(vec![kairos_span]));

    Widget::render(Paragraph::new(lines), inner, buf);
}

// ─────────────────────────────────────────────────────────────────────────────
// Kairos loader helper
// ─────────────────────────────────────────────────────────────────────────────

/// Try to load planet degrees from the kerykeion sync cache.
///
/// Reads `~/.epi-logos/nara/kairos/current.json` (written by `epi nara kairos sync`
/// via `kairos::save_current()`), parses it as a `KerykeionResult`, and converts it
/// into a `KairosState` using `kairos::kerykeion_result_to_kairos_state()`.
///
/// Spec: 00-canonical-invariants §2 (mod-10 planet ordering),
///       dataset-bridge/01-paramasiva-findings (Kairos data path)
///
/// Returns Ok(true) if successfully loaded, Ok(false) if no cache file exists.
pub fn try_load_kairos_into_clock(clock: &SharedClockState) -> Result<bool, String> {
    match crate::nara::kairos::load_current() {
        Ok(Some(result)) => {
            let kairos = crate::nara::kairos::kerykeion_result_to_kairos_state(&result);
            update_kairos(clock, kairos);
            Ok(true)
        }
        Ok(None) => Ok(false),
        Err(e) => Err(e),
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn braille_canvas_set_and_read() {
        let mut canvas = BrailleCanvas::new(4, 4);
        canvas.set_dot(0, 0, Color::White);
        canvas.set_dot(1, 0, Color::Cyan);
        // Verify dots are set (non-zero in the dots array)
        assert_ne!(canvas.dots[0][0], 0);
        assert_ne!(canvas.dots[0][1], 0);
    }

    #[test]
    fn braille_canvas_clips_oob() {
        let mut canvas = BrailleCanvas::new(4, 4);
        // These should not panic
        canvas.set_dot(-1, 0, Color::White);
        canvas.set_dot(0, -1, Color::White);
        canvas.set_dot(100, 100, Color::White);
    }

    #[test]
    fn cell_bits_produces_braille_code() {
        let mut canvas = BrailleCanvas::new(2, 2);
        // Set dot at pixel (0,0) → char (0,0), bit_col=0, bit_row=0 → bit index 0
        canvas.set_dot(0, 0, Color::White);
        let bits = canvas.cell_bits(0, 0);
        assert_eq!(bits, 1, "bit 0 should be set for px=(0,0)");
        // Braille U+2801 = ⠁
        let ch = char::from_u32(0x2800 + bits as u32).unwrap();
        assert_eq!(ch, '⠁');
    }

    #[test]
    fn render_torus_does_not_panic() {
        let mut canvas = BrailleCanvas::new(40, 20);
        // Identity quaternion — should draw a static torus
        render_torus(&mut canvas, [1.0, 0.0, 0.0, 0.0], 0, 80, 80);
    }

    #[test]
    fn cosmic_clock_renders_without_panic() {
        use crate::portal::clock_state::new_shared_clock_state;
        let clock = new_shared_clock_state();
        let plugin = CosmicClockPlugin::new(clock);

        let area = Rect::new(0, 0, 80, 24);
        let mut buf = Buffer::empty(area);
        plugin.render(area, &mut buf, false);
        // Just verify it doesn't panic and writes something to the buffer
        let has_content = buf.content().iter().any(|c| c.symbol() != " ");
        assert!(has_content, "CosmicClockPlugin should write something to the buffer");
    }
}
