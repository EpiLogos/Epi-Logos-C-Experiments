//! Full-screen Cosmic Clock plugin.
//!
//! Renders the torus clock scene via tiny-skia offscreen → ratatui-image.
//! A background thread handles rendering; the plugin displays the latest frame.
//! The torus auto-rotates slowly and responds to keyboard camera controls.

use std::cell::RefCell;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::mpsc;
use std::sync::{Arc, Mutex};

use ratatui::prelude::*;
use ratatui_hypertile::{EventOutcome, HypertileEvent, KeyCode};
use ratatui_hypertile_extras::HypertilePlugin;
use ratatui_image::picker::Picker;
use ratatui_image::protocol::StatefulProtocol;
use ratatui_image::{Resize, StatefulImage};

use crate::portal::clock_renderer::{quat_from_axis_angle, quat_mul_norm};
use crate::portal::clock_state::SharedClockState;

/// Shared render-area size: the render thread reads this to know the target pixel dimensions.
struct RenderSize {
    cols: AtomicU32,
    rows: AtomicU32,
}

/// Shared camera view quaternion — user-controlled rotation, separate from clock state.
type SharedViewQ = Arc<Mutex<[f32; 4]>>;

pub struct UnifiedClockPlugin {
    clock: SharedClockState,
    frame_rx: mpsc::Receiver<StatefulProtocol>,
    current_frame: RefCell<Option<StatefulProtocol>>,
    render_size: Arc<RenderSize>,
    view_q: SharedViewQ,
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

        // Start with an angled view so the torus looks 3D from the start
        // Tilt ~30° around X axis for a nice perspective
        let initial_view = quat_from_axis_angle([1.0, 0.0, 0.0], 0.5);
        let view_q: SharedViewQ = Arc::new(Mutex::new(initial_view));

        // Spawn render thread
        let render_clock = clock.clone();
        let render_size_ref = render_size.clone();
        let render_view_q = view_q.clone();
        let handle = std::thread::Builder::new()
            .name("clock-render".into())
            .spawn(move || {
                render_loop(render_clock, picker, font_size, render_size_ref, render_view_q, tx);
            })
            .ok();

        // Trigger a kairos sync in the background so planets load on first launch
        {
            let sync_clock = clock.clone();
            std::thread::Builder::new()
                .name("kairos-init".into())
                .spawn(move || {
                    // Try loading cache first; if stale or missing, sync
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
            _render_thread: handle,
        }
    }
}

fn render_loop(
    clock: SharedClockState,
    picker: Picker,
    font_size: (u16, u16),
    render_size: Arc<RenderSize>,
    view_q: SharedViewQ,
    tx: mpsc::Sender<StatefulProtocol>,
) {
    let mut frame_count = 0u64;

    loop {
        let state = clock.lock().unwrap().clone();
        let cols = render_size.cols.load(Ordering::Relaxed);
        let rows = render_size.rows.load(Ordering::Relaxed);

        // Compute pixel dimensions from terminal cell area × font size
        let (fw, fh) = (font_size.0.max(1) as u32, font_size.1.max(1) as u32);
        let w = (cols * fw).max(200).min(2400);
        let h = (rows * fh).max(200).min(1600);

        // Apply slow auto-rotation: gentle yaw drift
        let auto_angle = (frame_count as f32) * 0.003;
        let auto_q = quat_from_axis_angle([0.0, 1.0, 0.0], auto_angle);

        // Get user view quaternion and compose with auto-rotation
        let user_q = *view_q.lock().unwrap();
        let final_view = quat_mul_norm(user_q, auto_q);

        if let Some(pixmap) = crate::portal::clock_renderer::render_clock(w, h, &state, final_view) {
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

        // ~8fps continuous rendering
        std::thread::sleep(std::time::Duration::from_millis(125));
    }
}

/// Rotation step size for keyboard controls (~5°)
const ROT_STEP: f32 = 0.087;

impl HypertilePlugin for UnifiedClockPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, _is_focused: bool) {
        // Publish current area size so render thread can compute pixel dimensions
        self.render_size.cols.store(area.width as u32, Ordering::Relaxed);
        self.render_size.rows.store(area.height as u32, Ordering::Relaxed);

        // Drain channel, keep latest frame
        while let Ok(frame) = self.frame_rx.try_recv() {
            *self.current_frame.borrow_mut() = Some(frame);
        }

        let mut frame_ref = self.current_frame.borrow_mut();
        if let Some(ref mut protocol) = *frame_ref {
            // Scale to fill the entire area
            let image = StatefulImage::default().resize(Resize::Scale(None));
            StatefulWidget::render(image, area, buf, protocol);
        } else {
            // No frame yet — show loading message
            let block = ratatui::widgets::Block::default()
                .title(" Cosmic Clock — rendering... ")
                .borders(ratatui::widgets::Borders::ALL)
                .border_style(Style::default().fg(Color::Cyan));
            ratatui::widgets::Widget::render(block, area, buf);
        }
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        if let HypertileEvent::Key(chord) = event {
            match chord.code {
                // Camera rotation: arrow keys
                KeyCode::Left => {
                    let rot = quat_from_axis_angle([0.0, 1.0, 0.0], -ROT_STEP);
                    let mut q = self.view_q.lock().unwrap();
                    *q = quat_mul_norm(rot, *q);
                    EventOutcome::Consumed
                }
                KeyCode::Right => {
                    let rot = quat_from_axis_angle([0.0, 1.0, 0.0], ROT_STEP);
                    let mut q = self.view_q.lock().unwrap();
                    *q = quat_mul_norm(rot, *q);
                    EventOutcome::Consumed
                }
                KeyCode::Up => {
                    let rot = quat_from_axis_angle([1.0, 0.0, 0.0], -ROT_STEP);
                    let mut q = self.view_q.lock().unwrap();
                    *q = quat_mul_norm(rot, *q);
                    EventOutcome::Consumed
                }
                KeyCode::Down => {
                    let rot = quat_from_axis_angle([1.0, 0.0, 0.0], ROT_STEP);
                    let mut q = self.view_q.lock().unwrap();
                    *q = quat_mul_norm(rot, *q);
                    EventOutcome::Consumed
                }
                // Reset view
                KeyCode::Char('r') => {
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
                            let kairos = crate::nara::kairos::kerykeion_result_to_kairos_state(&result);
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
