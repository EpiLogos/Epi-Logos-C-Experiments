//! Full-screen Cosmic Clock plugin.
//!
//! Renders the torus clock scene via tiny-skia offscreen → ratatui-image.
//! A background thread handles rendering; the plugin displays the latest frame.

use std::cell::RefCell;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::mpsc;
use std::sync::Arc;

use ratatui::prelude::*;
use ratatui_hypertile::{EventOutcome, HypertileEvent, KeyCode};
use ratatui_hypertile_extras::HypertilePlugin;
use ratatui_image::picker::Picker;
use ratatui_image::protocol::StatefulProtocol;
use ratatui_image::{Resize, StatefulImage};

use crate::portal::clock_state::SharedClockState;

/// Shared render-area size: the render thread reads this to know the target pixel dimensions.
/// Updated by the plugin's render() when the terminal area changes.
struct RenderSize {
    cols: AtomicU32,
    rows: AtomicU32,
}

pub struct UnifiedClockPlugin {
    clock: SharedClockState,
    frame_rx: mpsc::Receiver<StatefulProtocol>,
    current_frame: RefCell<Option<StatefulProtocol>>,
    render_size: Arc<RenderSize>,
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

        // Spawn render thread
        let render_clock = clock.clone();
        let render_size_ref = render_size.clone();
        let handle = std::thread::Builder::new()
            .name("clock-render".into())
            .spawn(move || {
                render_loop(render_clock, picker, font_size, render_size_ref, tx);
            })
            .ok();

        UnifiedClockPlugin {
            clock,
            frame_rx: rx,
            current_frame: RefCell::new(None),
            render_size,
            _render_thread: handle,
        }
    }
}

fn render_loop(
    clock: SharedClockState,
    picker: Picker,
    font_size: (u16, u16),
    render_size: Arc<RenderSize>,
    tx: mpsc::Sender<StatefulProtocol>,
) {
    let mut last_generation = u64::MAX; // force first render
    let mut last_cols = 0u32;
    let mut last_rows = 0u32;
    let mut idle_count = 0u32;

    loop {
        let state = clock.lock().unwrap().clone();
        let cols = render_size.cols.load(Ordering::Relaxed);
        let rows = render_size.rows.load(Ordering::Relaxed);
        let size_changed = cols != last_cols || rows != last_rows;
        let gen_changed = state.generation != last_generation;

        if !gen_changed && !size_changed {
            idle_count += 1;
            let sleep_ms = if idle_count > 100 { 1000 } else { 200 };
            std::thread::sleep(std::time::Duration::from_millis(sleep_ms));
            continue;
        }

        last_generation = state.generation;
        last_cols = cols;
        last_rows = rows;
        idle_count = 0;

        // Compute pixel dimensions from terminal cell area × font size
        let (fw, fh) = (font_size.0.max(1) as u32, font_size.1.max(1) as u32);
        let w = (cols * fw).max(200).min(2400);
        let h = (rows * fh).max(200).min(1600);

        if let Some(pixmap) = crate::portal::clock_renderer::render_clock(w, h, &state) {
            let data = pixmap.data().to_vec();
            if let Some(img_buf) = image::RgbaImage::from_raw(w, h, data) {
                let dyn_img: image::DynamicImage = img_buf.into();
                let protocol = picker.new_resize_protocol(dyn_img);
                if tx.send(protocol).is_err() {
                    return; // receiver dropped, plugin gone
                }
            }
        }

        // Active frame rate: ~10fps
        std::thread::sleep(std::time::Duration::from_millis(100));
    }
}

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
                KeyCode::Char('k') => {
                    // Force kairos reload
                    if let Ok(Some(result)) = crate::nara::kairos::load_current() {
                        let kairos = crate::nara::kairos::kerykeion_result_to_kairos_state(&result);
                        crate::portal::clock_state::update_kairos_full(&self.clock, kairos);
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
