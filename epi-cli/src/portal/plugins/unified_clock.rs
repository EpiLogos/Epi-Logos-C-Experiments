//! Cosmic Clock plugin: 75/25 split layout (torus + data panel).
//!
//! Left 75%: offscreen torus rendered via tiny-skia → ratatui-image.
//! Right 25%: data panel with kairos, planets, clock state, controls.
//! Background render thread at ~30fps. Auto-rotate OFF by default.

use std::cell::RefCell;
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::mpsc;
use std::sync::{Arc, Mutex};

use ratatui::prelude::*;
use ratatui::widgets::{Block, Borders};
use ratatui_hypertile::{EventOutcome, HypertileEvent, KeyCode};
use ratatui_hypertile_extras::HypertilePlugin;
use ratatui_image::picker::Picker;
use ratatui_image::protocol::StatefulProtocol;
use ratatui_image::{Resize, StatefulImage};

use crate::portal::clock_renderer::{quat_from_axis_angle, quat_mul_norm};
use crate::portal::clock_state::SharedClockState;

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/// Rotation step size for keyboard controls (~5°).
const ROT_STEP: f32 = 0.087;

/// Zoom step per keypress.
const ZOOM_STEP: f32 = 0.1;

const SIGN_NAMES: [&str; 12] = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const PLANET_NAMES: [&str; 10] = [
    "Sun", "Moon", "Mercury", "Venus", "Mars",
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
];

const PLANET_GLYPHS_PANEL: [char; 10] = [
    '☉', '☽', '☿', '♀', '♂', '♃', '♄', '♅', '♆', '♇',
];

const ZODIAC_GLYPHS_PANEL: [char; 12] = [
    '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓',
];

// ─────────────────────────────────────────────────────────────────────────────
// RENDER SIZE (shared with background thread)
// ─────────────────────────────────────────────────────────────────────────────

struct RenderSize {
    cols: AtomicU32,
    rows: AtomicU32,
}

/// Shared camera view quaternion — user-controlled rotation, separate from clock state.
type SharedViewQ = Arc<Mutex<[f32; 4]>>;

// ─────────────────────────────────────────────────────────────────────────────
// PLUGIN
// ─────────────────────────────────────────────────────────────────────────────

pub struct UnifiedClockPlugin {
    clock: SharedClockState,
    frame_rx: mpsc::Receiver<StatefulProtocol>,
    current_frame: RefCell<Option<StatefulProtocol>>,
    render_size: Arc<RenderSize>,
    view_q: SharedViewQ,
    auto_rotate: Arc<AtomicBool>,
    zoom: Arc<Mutex<f32>>,
    _render_thread: Option<std::thread::JoinHandle<()>>,
}

impl UnifiedClockPlugin {
    pub fn new(clock: SharedClockState) -> Self {
        let (tx, rx) = mpsc::channel::<StatefulProtocol>();

        // Initialize picker — try to detect terminal protocol, fall back to halfblocks
        let picker = Picker::from_query_stdio().unwrap_or_else(|_| Picker::halfblocks());
        let font_size = picker.font_size();

        let render_size = Arc::new(RenderSize {
            cols: AtomicU32::new(80),
            rows: AtomicU32::new(24),
        });

        // Start with an angled view so the torus looks 3D from the start (~30° tilt)
        let initial_view = quat_from_axis_angle([1.0, 0.0, 0.0], 0.5);
        let view_q: SharedViewQ = Arc::new(Mutex::new(initial_view));

        // Auto-rotate OFF by default
        let auto_rotate = Arc::new(AtomicBool::new(false));

        // Zoom default 1.0
        let zoom = Arc::new(Mutex::new(1.0f32));

        // Spawn render thread
        let render_clock_state = clock.clone();
        let render_size_ref = render_size.clone();
        let render_view_q = view_q.clone();
        let render_auto = auto_rotate.clone();
        let render_zoom = zoom.clone();
        let handle = std::thread::Builder::new()
            .name("clock-render".into())
            .spawn(move || {
                render_loop(
                    render_clock_state,
                    picker,
                    font_size,
                    render_size_ref,
                    render_view_q,
                    render_auto,
                    render_zoom,
                    tx,
                );
            })
            .ok();

        // Trigger kairos sync in background so planets load on first launch
        {
            let sync_clock = clock.clone();
            std::thread::Builder::new()
                .name("kairos-init".into())
                .spawn(move || {
                    if !crate::nara::kairos::is_current_fresh() {
                        let _ = crate::nara::kairos::sync_current();
                    }
                    if let Ok(Some(kr)) = crate::nara::kairos::load_current() {
                        let kairos = crate::nara::kairos::kerykeion_result_to_kairos_state(&kr);
                        crate::portal::clock_state::update_kairos_full(&sync_clock, kairos);
                    }
                })
                .ok();
        }

        UnifiedClockPlugin {
            clock,
            frame_rx: rx,
            current_frame: RefCell::new(None),
            render_size,
            view_q,
            auto_rotate,
            zoom,
            _render_thread: handle,
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDER LOOP (background thread, ~30fps)
// ─────────────────────────────────────────────────────────────────────────────

fn render_loop(
    clock: SharedClockState,
    picker: Picker,
    font_size: (u16, u16),
    render_size: Arc<RenderSize>,
    view_q: SharedViewQ,
    auto_rotate: Arc<AtomicBool>,
    zoom: Arc<Mutex<f32>>,
    tx: mpsc::Sender<StatefulProtocol>,
) {
    let mut frame_count = 0u64;

    loop {
        let frame_start = std::time::Instant::now();

        let state = clock.lock().unwrap().clone();
        let cols = render_size.cols.load(Ordering::Relaxed);
        let rows = render_size.rows.load(Ordering::Relaxed);

        // Compute pixel dimensions from terminal cell area × font size
        let (fw, fh) = (font_size.0.max(1) as u32, font_size.1.max(1) as u32);
        let w = (cols * fw).max(200).min(2400);
        let h = (rows * fh).max(200).min(1600);

        // Compose view quaternion with optional auto-rotation
        let user_q = *view_q.lock().unwrap();
        let final_view = if auto_rotate.load(Ordering::Relaxed) {
            let auto_angle = (frame_count as f32) * 0.005;
            let auto_q = quat_from_axis_angle([0.0, 1.0, 0.0], auto_angle);
            quat_mul_norm(user_q, auto_q)
        } else {
            user_q
        };

        let current_zoom = *zoom.lock().unwrap();

        if let Some(pixmap) = crate::portal::clock_renderer::render_clock(w, h, &state, final_view, current_zoom) {
            let data = pixmap.data().to_vec();
            if let Some(img_buf) = image::RgbaImage::from_raw(w, h, data) {
                let dyn_img: image::DynamicImage = img_buf.into();
                let protocol = picker.new_resize_protocol(dyn_img);
                if tx.send(protocol).is_err() {
                    return; // receiver dropped, plugin gone
                }
            }
        }

        frame_count += 1;

        // Adaptive frame timing: target 33ms per frame (~30fps)
        let elapsed = frame_start.elapsed();
        let target = std::time::Duration::from_millis(33);
        if elapsed < target {
            std::thread::sleep(target - elapsed);
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA PANEL
// ─────────────────────────────────────────────────────────────────────────────

fn render_data_panel(
    area: Rect,
    buf: &mut Buffer,
    state: &crate::portal::clock_state::PortalClockState,
    auto_rotate: bool,
) {
    // Draw panel border
    let block = Block::default()
        .title(" Cosmic Clock ")
        .title_style(Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD))
        .borders(Borders::ALL)
        .border_style(Style::default().fg(Color::DarkGray));
    let inner = block.inner(area);
    ratatui::widgets::Widget::render(block, area, buf);

    if inner.width < 2 || inner.height < 4 {
        return;
    }

    let mut y = inner.y;
    let x = inner.x + 1;
    let w = inner.width.saturating_sub(2) as usize;

    // Helper: write a line and advance y
    macro_rules! line {
        ($style:expr, $($arg:tt)*) => {{
            if y < inner.y + inner.height {
                let text = format!($($arg)*);
                let span = Span::styled(&text[..text.len().min(w)], $style);
                buf.set_span(x, y, &span, w as u16);
                #[allow(unused_assignments)]
                { y += 1; }
            }
        }};
    }

    // ── Kairos status ──────────────────────────────────────────────────────
    if state.kairos.valid {
        line!(Style::default().fg(Color::Green), "Kairos: synced");
    } else {
        line!(Style::default().fg(Color::Red), "Kairos: no data");
    }

    // blank
    y += 1;

    // ── Planet table ───────────────────────────────────────────────────────
    line!(Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD), "Planets");

    for i in 0..10usize {
        if y >= inner.y + inner.height {
            break;
        }
        let ps = &state.kairos.planets[i];
        if ps.degree == 0xFFFF {
            line!(Style::default().fg(Color::DarkGray),
                "{} {:<8} --",
                PLANET_GLYPHS_PANEL[i], PLANET_NAMES[i]);
        } else {
            let deg = ps.degree;
            let sign_idx = (deg / 30) as usize % 12;
            let sign_deg = deg % 30;
            let retro = if ps.is_retrograde { "R" } else { " " };
            line!(Style::default().fg(Color::White),
                "{} {:<8} {:>3}° {} {} {}",
                PLANET_GLYPHS_PANEL[i],
                PLANET_NAMES[i],
                sign_deg,
                ZODIAC_GLYPHS_PANEL[sign_idx],
                SIGN_NAMES[sign_idx],
                retro);
        }
    }

    // blank
    y += 1;

    // ── Clock state ────────────────────────────────────────────────────────
    line!(Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD), "Clock State");
    line!(Style::default().fg(Color::White),
        "Walk:  {}", state.walk_mode.label());
    line!(Style::default().fg(Color::White),
        "QL:    {}", state.ql_position);
    line!(Style::default().fg(Color::White),
        "Tick:  {}", state.tick12);
    line!(Style::default().fg(Color::White),
        "Res:   {}", state.resolution_level);

    // Current degree + sign
    if state.current_degree < 360 {
        let sign_idx = (state.current_degree / 30) as usize % 12;
        let sign_deg = state.current_degree % 30;
        line!(Style::default().fg(Color::Yellow),
            "Deg:   {}° {} {}",
            sign_deg, ZODIAC_GLYPHS_PANEL[sign_idx], SIGN_NAMES[sign_idx]);
    }

    // Auto-rotate indicator
    y += 1;
    if auto_rotate {
        line!(Style::default().fg(Color::Green), "Auto-rotate: ON");
    } else {
        line!(Style::default().fg(Color::DarkGray), "Auto-rotate: off");
    }

    // ── Controls legend ────────────────────────────────────────────────────
    y += 1;
    line!(Style::default().fg(Color::DarkGray).add_modifier(Modifier::ITALIC), "Controls");
    line!(Style::default().fg(Color::DarkGray), "Arrows: rotate");
    line!(Style::default().fg(Color::DarkGray), "+/-:    zoom");
    line!(Style::default().fg(Color::DarkGray), "Space:  auto-rot");
    line!(Style::default().fg(Color::DarkGray), "r:      reset");
    line!(Style::default().fg(Color::DarkGray), "k:      kairos");
}

// ─────────────────────────────────────────────────────────────────────────────
// HYPERTILE PLUGIN IMPL
// ─────────────────────────────────────────────────────────────────────────────

impl HypertilePlugin for UnifiedClockPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, _is_focused: bool) {
        let panel_width = (area.width as u32 * 25 / 100).max(28).min(40) as u16;
        let torus_width = area.width.saturating_sub(panel_width);

        let torus_area = Rect {
            x: area.x,
            y: area.y,
            width: torus_width,
            height: area.height,
        };
        let panel_area = Rect {
            x: area.x + torus_width,
            y: area.y,
            width: panel_width,
            height: area.height,
        };

        // Tell render thread the TORUS area size (not full area)
        self.render_size.cols.store(torus_area.width as u32, Ordering::Relaxed);
        self.render_size.rows.store(torus_area.height as u32, Ordering::Relaxed);

        // Drain channel, keep latest frame
        while let Ok(frame) = self.frame_rx.try_recv() {
            *self.current_frame.borrow_mut() = Some(frame);
        }

        let mut frame_ref = self.current_frame.borrow_mut();
        if let Some(ref mut protocol) = *frame_ref {
            let image = StatefulImage::default().resize(Resize::Scale(None));
            StatefulWidget::render(image, torus_area, buf, protocol);
        } else {
            // No frame yet — show loading message
            let block = Block::default()
                .title(" Cosmic Clock — rendering... ")
                .borders(Borders::ALL)
                .border_style(Style::default().fg(Color::Cyan));
            ratatui::widgets::Widget::render(block, torus_area, buf);
        }

        // Render data panel directly to buffer
        let state = self.clock.lock().unwrap().clone();
        let auto = self.auto_rotate.load(Ordering::Relaxed);
        render_data_panel(panel_area, buf, &state, auto);
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        if let HypertileEvent::Key(chord) = event {
            match chord.code {
                // Camera rotation: arrow keys (disable auto-rotation)
                KeyCode::Left => {
                    self.auto_rotate.store(false, Ordering::Relaxed);
                    let rot = quat_from_axis_angle([0.0, 1.0, 0.0], -ROT_STEP);
                    let mut q = self.view_q.lock().unwrap();
                    *q = quat_mul_norm(rot, *q);
                    EventOutcome::Consumed
                }
                KeyCode::Right => {
                    self.auto_rotate.store(false, Ordering::Relaxed);
                    let rot = quat_from_axis_angle([0.0, 1.0, 0.0], ROT_STEP);
                    let mut q = self.view_q.lock().unwrap();
                    *q = quat_mul_norm(rot, *q);
                    EventOutcome::Consumed
                }
                KeyCode::Up => {
                    self.auto_rotate.store(false, Ordering::Relaxed);
                    let rot = quat_from_axis_angle([1.0, 0.0, 0.0], -ROT_STEP);
                    let mut q = self.view_q.lock().unwrap();
                    *q = quat_mul_norm(rot, *q);
                    EventOutcome::Consumed
                }
                KeyCode::Down => {
                    self.auto_rotate.store(false, Ordering::Relaxed);
                    let rot = quat_from_axis_angle([1.0, 0.0, 0.0], ROT_STEP);
                    let mut q = self.view_q.lock().unwrap();
                    *q = quat_mul_norm(rot, *q);
                    EventOutcome::Consumed
                }
                // Zoom in
                KeyCode::Char('+') | KeyCode::Char('=') => {
                    let mut z = self.zoom.lock().unwrap();
                    *z = (*z - ZOOM_STEP).max(0.3);
                    EventOutcome::Consumed
                }
                // Zoom out
                KeyCode::Char('-') => {
                    let mut z = self.zoom.lock().unwrap();
                    *z = (*z + ZOOM_STEP).min(3.0);
                    EventOutcome::Consumed
                }
                // Toggle auto-rotation
                KeyCode::Char(' ') => {
                    let prev = self.auto_rotate.load(Ordering::Relaxed);
                    self.auto_rotate.store(!prev, Ordering::Relaxed);
                    EventOutcome::Consumed
                }
                // Reset view: default angle + zoom 1.0 + auto-rotate off
                KeyCode::Char('r') => {
                    self.auto_rotate.store(false, Ordering::Relaxed);
                    *self.zoom.lock().unwrap() = 1.0;
                    let mut q = self.view_q.lock().unwrap();
                    *q = quat_from_axis_angle([1.0, 0.0, 0.0], 0.5);
                    EventOutcome::Consumed
                }
                // Force kairos sync
                KeyCode::Char('k') => {
                    let clock = self.clock.clone();
                    std::thread::spawn(move || {
                        let _ = crate::nara::kairos::sync_current();
                        if let Ok(Some(result)) = crate::nara::kairos::load_current() {
                            let kairos =
                                crate::nara::kairos::kerykeion_result_to_kairos_state(&result);
                            crate::portal::clock_state::update_kairos_full(&clock, kairos);
                        }
                    });
                    EventOutcome::Consumed
                }
                _ => EventOutcome::Ignored,
            }
        } else {
            EventOutcome::Ignored
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::portal::clock_state::new_shared_clock_state;

    #[test]
    fn unified_clock_plugin_creates_without_panic() {
        let clock = new_shared_clock_state();
        let _plugin = UnifiedClockPlugin::new(clock);
    }
}
