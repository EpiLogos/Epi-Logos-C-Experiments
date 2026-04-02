//! Offscreen clock renderer: tiny-skia + ab_glyph
//!
//! Renders the Cosmic Clock torus to an RGBA pixmap.
//! Called from a background thread; the pixmap is then converted to
//! DynamicImage and displayed via ratatui-image.

/// Bundled font bytes (DejaVuSans, ~300KB, includes zodiac + planet Unicode glyphs).
const FONT_BYTES: &[u8] = include_bytes!("../../assets/DejaVuSans.ttf");

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn font_loads_successfully() {
        use ab_glyph::FontRef;
        let font = FontRef::try_from_slice(FONT_BYTES);
        assert!(font.is_ok(), "Failed to load bundled font");
    }
}
