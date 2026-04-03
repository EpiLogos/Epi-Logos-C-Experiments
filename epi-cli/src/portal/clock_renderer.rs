//! Offscreen clock renderer: tiny-skia + ab_glyph
//!
//! Renders the Cosmic Clock torus to an RGBA pixmap.
//! Called from a background thread; the pixmap is then converted to
//! DynamicImage and displayed via ratatui-image.

use ab_glyph::{Font, FontRef, ScaleFont};
use tiny_skia::Pixmap;

/// Bundled font bytes (DejaVuSans, ~300KB, includes zodiac + planet Unicode glyphs).
const FONT_BYTES: &[u8] = include_bytes!("../../assets/DejaVuSans.ttf");

// ─────────────────────────────────────────────────────────────────────────────
// COLOR TABLES
// ─────────────────────────────────────────────────────────────────────────────

/// Element base colors: Fire, Earth, Air, Water  (RGB)
const ELEMENT_COLORS: [[u8; 3]; 4] = [
    [220, 80,  30],   // Fire    — orange-red
    [100, 180, 60],   // Earth   — green
    [140, 200, 240],  // Air     — sky blue
    [50,  80,  200],  // Water   — deep blue
];

/// Planet colors for Sun..Pluto (mod-10 ordering)
const PLANET_COLORS: [[u8; 3]; 10] = [
    [255, 215,   0],  // 0 Sun      — gold
    [220, 220, 220],  // 1 Moon     — white
    [0,   220, 220],  // 2 Mercury  — cyan
    [60,  200,  60],  // 3 Venus    — green
    [220,  40,  40],  // 4 Mars     — red
    [60,   60, 220],  // 5 Jupiter  — blue
    [160, 160, 160],  // 6 Saturn   — gray
    [200,   0, 200],  // 7 Uranus   — magenta
    [120,   0, 200],  // 8 Neptune  — purple
    [140,   0,   0],  // 9 Pluto    — dark red
];

/// Aspect line colors for conjunction..opposition
const ASPECT_COLORS: [[u8; 3]; 5] = [
    [255, 255, 100],  // conjunction  — yellow
    [100, 220, 100],  // sextile      — light green
    [220, 100, 100],  // square       — red
    [100, 180, 255],  // trine        — light blue
    [220,  80, 220],  // opposition   — violet
];

/// Zodiac Unicode glyphs (♈..♓)
const ZODIAC_GLYPHS: [char; 12] = [
    '♈', '♉', '♊', '♋', '♌', '♍',
    '♎', '♏', '♐', '♑', '♒', '♓',
];

/// Planet Unicode glyphs: Sun..Pluto
const PLANET_GLYPHS: [char; 10] = [
    '☉', '☽', '☿', '♀', '♂', '♃', '♄', '♅', '♆', '♇',
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/// Map zodiac sign (0-11) to element index: Fire=0, Earth=1, Air=2, Water=3.
/// Fire signs: Aries(0), Leo(4), Sagittarius(8).
/// Earth signs: Taurus(1), Virgo(5), Capricorn(9).
/// Air signs: Gemini(2), Libra(6), Aquarius(10).
/// Water signs: Cancer(3), Scorpio(7), Pisces(11).
fn sign_to_element(sign: u8) -> u8 {
    match sign {
        0 | 4 | 8  => 0, // Fire
        1 | 5 | 9  => 1, // Earth
        2 | 6 | 10 => 2, // Air
        3 | 7 | 11 => 3, // Water
        _           => 0, // fallback
    }
}

/// Hamilton product of two quaternions, normalized to unit length.
pub fn quat_mul_norm(a: [f32; 4], b: [f32; 4]) -> [f32; 4] {
    let (aw, ax, ay, az) = (a[0], a[1], a[2], a[3]);
    let (bw, bx, by, bz) = (b[0], b[1], b[2], b[3]);
    let r = [
        aw*bw - ax*bx - ay*by - az*bz,
        aw*bx + ax*bw + ay*bz - az*by,
        aw*by - ax*bz + ay*bw + az*bx,
        aw*bz + ax*by - ay*bx + az*bw,
    ];
    let mag = (r[0]*r[0] + r[1]*r[1] + r[2]*r[2] + r[3]*r[3]).sqrt();
    if mag < 1e-10 { [1.0, 0.0, 0.0, 0.0] } else { [r[0]/mag, r[1]/mag, r[2]/mag, r[3]/mag] }
}

/// Build a quaternion from axis-angle (axis must be unit length, angle in radians).
pub fn quat_from_axis_angle(axis: [f32; 3], angle: f32) -> [f32; 4] {
    let half = angle * 0.5;
    let s = half.sin();
    [half.cos(), axis[0] * s, axis[1] * s, axis[2] * s]
}

/// Rotate a 3-vector by quaternion q = [w, x, y, z] using sandwich product.
pub fn quat_rotate(q: [f32; 4], px: f32, py: f32, pz: f32) -> (f32, f32, f32) {
    let (qw, qx, qy, qz) = (q[0], q[1], q[2], q[3]);
    // t = 2 * cross(q.xyz, p)
    let tx = 2.0 * (qy * pz - qz * py);
    let ty = 2.0 * (qz * px - qx * pz);
    let tz = 2.0 * (qx * py - qy * px);
    // p' = p + qw * t + cross(q.xyz, t)
    (
        px + qw * tx + qy * tz - qz * ty,
        py + qw * ty + qz * tx - qx * tz,
        pz + qw * tz + qx * ty - qy * tx,
    )
}

/// Compute surface color for a torus point.
///
/// - `elem`             element index for this degree (0-3)
/// - `tick`             spanda tick for this phi step (0-11)
/// - `current_tick12`   active tick from clock state
/// - `resolution_level` 0-3 from bifurcation
/// - `illumination`     0.0-1.0 Lambertian shading
fn surface_color(
    elem: u8,
    tick: u8,
    current_tick12: u8,
    resolution_level: u8,
    illumination: f32,
) -> [u8; 3] {
    // Active tick highlight
    if tick == current_tick12 {
        return [255, 240, 80]; // yellow
    }

    let base = ELEMENT_COLORS[elem as usize & 3];
    let illum = illumination.clamp(0.0, 1.0);

    // Implicate strand (ticks 6-11) at resolution >= 1 → dimmed
    let dim = if resolution_level >= 1 && tick >= 6 { 0.45 } else { 1.0 };
    let scale = illum * dim;

    [
        (base[0] as f32 * scale) as u8,
        (base[1] as f32 * scale) as u8,
        (base[2] as f32 * scale) as u8,
    ]
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAW PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

/// Write RGBA pixel directly; clamps to bounds.
#[inline]
fn put_pixel(data: &mut [u8], w: u32, h: u32, x: i32, y: i32, r: u8, g: u8, b: u8) {
    if x < 0 || y < 0 || x >= w as i32 || y >= h as i32 {
        return;
    }
    let off = ((y as u32 * w + x as u32) * 4) as usize;
    data[off]     = r;
    data[off + 1] = g;
    data[off + 2] = b;
    data[off + 3] = 255;
}

/// Filled circle.
fn paint_dot(
    pixmap: &mut Pixmap,
    cx: i32, cy: i32,
    radius: i32,
    color: [u8; 3],
) {
    let w = pixmap.width();
    let h = pixmap.height();
    let data = pixmap.data_mut();
    let r2 = (radius * radius) as f32;
    for dy in -radius..=radius {
        for dx in -radius..=radius {
            if (dx * dx + dy * dy) as f32 <= r2 {
                put_pixel(data, w, h, cx + dx, cy + dy, color[0], color[1], color[2]);
            }
        }
    }
}

/// Bresenham line drawing.
fn draw_line(pixmap: &mut Pixmap, x0: i32, y0: i32, x1: i32, y1: i32, color: [u8; 3]) {
    let w = pixmap.width();
    let h = pixmap.height();
    let data = pixmap.data_mut();

    let mut x = x0;
    let mut y = y0;
    let dx = (x1 - x0).abs();
    let dy = -(y1 - y0).abs();
    let sx = if x0 < x1 { 1i32 } else { -1 };
    let sy = if y0 < y1 { 1i32 } else { -1 };
    let mut err = dx + dy;

    loop {
        put_pixel(data, w, h, x, y, color[0], color[1], color[2]);
        if x == x1 && y == y1 {
            break;
        }
        let e2 = 2 * err;
        if e2 >= dy {
            if x == x1 { break; }
            err += dy;
            x += sx;
        }
        if e2 <= dx {
            if y == y1 { break; }
            err += dx;
            y += sy;
        }
    }
}

/// Render a single glyph alpha-blended at (cx, cy) using pre-scaled font.
fn burn_char(
    pixmap: &mut Pixmap,
    scaled_font: &ab_glyph::PxScaleFont<&FontRef<'_>>,
    ch: char,
    cx: i32,
    cy: i32,
    color: [u8; 3],
) {
    let glyph_id = scaled_font.glyph_id(ch);
    if glyph_id.0 == 0 {
        return;
    }
    let glyph = glyph_id.with_scale_and_position(
        scaled_font.scale(),
        ab_glyph::point(cx as f32, cy as f32),
    );
    if let Some(outlined) = scaled_font.outline_glyph(glyph) {
        let bounds = outlined.px_bounds();
        let w = pixmap.width();
        let h = pixmap.height();
        let data = pixmap.data_mut();
        outlined.draw(|rel_x, rel_y, cov| {
            let px = bounds.min.x as i32 + rel_x as i32;
            let py = bounds.min.y as i32 + rel_y as i32;
            if px < 0 || py < 0 || px >= w as i32 || py >= h as i32 {
                return;
            }
            let alpha = (cov * 255.0) as u8;
            if alpha == 0 {
                return;
            }
            let off = ((py as u32 * w + px as u32) * 4) as usize;
            // Alpha blend over existing pixel
            let a = alpha as u32;
            let ia = 255 - a;
            data[off]     = ((color[0] as u32 * a + data[off]     as u32 * ia) / 255) as u8;
            data[off + 1] = ((color[1] as u32 * a + data[off + 1] as u32 * ia) / 255) as u8;
            data[off + 2] = ((color[2] as u32 * a + data[off + 2] as u32 * ia) / 255) as u8;
            data[off + 3] = 255;
        });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERLAY LAYERS
// ─────────────────────────────────────────────────────────────────────────────

/// Project a degree-position on the torus equator to screen coordinates.
/// `r_offset` controls radial distance: 1.0 = equator, >1.0 = outside, <1.0 = inside.
fn equator_project(
    degree: f32,
    q: [f32; 4],
    r_maj: f32,
    r_min: f32,
    r_offset: f32,
    cx: f32,
    cy: f32,
    dist: f32,
) -> (i32, i32, f32) {
    let theta = degree * std::f32::consts::PI / 180.0;
    let r = r_maj + r_min * r_offset;
    let (rx, ry, rz) = quat_rotate(q, r * theta.cos(), r * theta.sin(), 0.0);
    let w = dist / (dist - rz);
    ((cx + rx * w) as i32, (cy - ry * w) as i32, rz)
}

/// Render backbone rings: degree markers at the torus equator.
fn render_backbone_rings(
    pixmap: &mut Pixmap,
    q: [f32; 4],
    r_maj: f32,
    r_min: f32,
    cx: f32,
    cy: f32,
    dist: f32,
    resolution_level: u8,
) {
    // Scale dot sizes with render resolution
    let dot_scale = ((r_min * 0.05) as i32).max(2).min(10);

    for deg in 0u16..360 {
        let d = deg as f32;
        let (sx, sy, _rz) = equator_project(d, q, r_maj, r_min, 1.0, cx, cy, dist);

        let sign = (deg / 30) as u8;
        let elem = sign_to_element(sign);
        let elem_color = ELEMENT_COLORS[elem as usize];

        if deg % 90 == 0 {
            // Cardinal — large element dot
            paint_dot(pixmap, sx, sy, dot_scale + 2, elem_color);
        } else if deg % 30 == 0 {
            // Zodiac sign boundary — medium dot
            paint_dot(pixmap, sx, sy, dot_scale + 1, elem_color);
        } else if resolution_level >= 1 && deg % 15 == 0 {
            // Amino backbone — gray dot (visible at resolution ≥ 1 only)
            paint_dot(pixmap, sx, sy, dot_scale, [100, 100, 110]);
        } else if resolution_level >= 2 && deg % 10 == 0 {
            // Decan — dark dot
            paint_dot(pixmap, sx, sy, (dot_scale / 2).max(1), [55, 55, 65]);
        }
    }
}

/// Render live planet markers and natal ghost markers.
fn render_planets(
    pixmap: &mut Pixmap,
    q: [f32; 4],
    r_maj: f32,
    r_min: f32,
    cx: f32,
    cy: f32,
    dist: f32,
    planets: &[crate::portal::clock_state::PlanetState; 10],
    natal_degrees: &[u16; 10],
) {
    for i in 0..10usize {
        let deg = planets[i].degree;
        if deg == 0xFFFF {
            continue;
        }
        let color = PLANET_COLORS[i];

        // Scale dot sizes with render resolution
        let dot_scale = ((r_min * 0.05) as i32).max(2).min(10);
        let dot_r = (dot_scale * 3).max(5).min(14);

        // Live marker — outside equator, with white outline for visibility
        let (sx, sy, _) = equator_project(deg as f32, q, r_maj, r_min, 1.3, cx, cy, dist);
        paint_dot(pixmap, sx, sy, dot_r + 2, [255, 255, 255]);
        paint_dot(pixmap, sx, sy, dot_r, color);

        // Retrograde: cross marker
        if planets[i].is_retrograde {
            let cr = dot_r + 2;
            draw_line(pixmap, sx - cr, sy, sx + cr, sy, color);
            draw_line(pixmap, sx, sy - cr, sx, sy + cr, color);
        }

        // Natal ghost — inside equator, dimmed
        let nat = natal_degrees[i];
        if nat != 0xFFFF {
            let ghost_color = [
                (color[0] as u16 * 80 / 255) as u8,
                (color[1] as u16 * 80 / 255) as u8,
                (color[2] as u16 * 80 / 255) as u8,
            ];
            let (nx, ny, _) = equator_project(nat as f32, q, r_maj, r_min, 0.7, cx, cy, dist);
            paint_dot(pixmap, nx, ny, (dot_r * 2 / 3).max(2), ghost_color);
        }
    }
}

/// Render aspect lines between planet pairs.
fn render_aspect_lines(
    pixmap: &mut Pixmap,
    q: [f32; 4],
    r_maj: f32,
    r_min: f32,
    cx: f32,
    cy: f32,
    dist: f32,
    planets: &[crate::portal::clock_state::PlanetState; 10],
    aspects: &[crate::portal::clock_state::PlanetaryAspect],
) {
    for asp in aspects {
        let a = asp.planet_a as usize;
        let b = asp.planet_b as usize;
        if a >= 10 || b >= 10 { continue; }
        let deg_a = planets[a].degree;
        let deg_b = planets[b].degree;
        if deg_a == 0xFFFF || deg_b == 0xFFFF { continue; }

        let (ax, ay, _) = equator_project(deg_a as f32, q, r_maj, r_min, 1.0, cx, cy, dist);
        let (bx, by, _) = equator_project(deg_b as f32, q, r_maj, r_min, 1.0, cx, cy, dist);

        let atype = (asp.aspect_type as usize).min(4);
        let color = ASPECT_COLORS[atype];
        // Dimmed chord line
        let dim_color = [
            (color[0] as u16 * 120 / 255) as u8,
            (color[1] as u16 * 120 / 255) as u8,
            (color[2] as u16 * 120 / 255) as u8,
        ];
        draw_line(pixmap, ax, ay, bx, by, dim_color);
    }
}

/// Render oracle markers: micro-orbit trail, anticodon, current degree.
fn render_oracle_markers(
    pixmap: &mut Pixmap,
    q: [f32; 4],
    r_maj: f32,
    r_min: f32,
    cx: f32,
    cy: f32,
    dist: f32,
    state: &crate::portal::clock_state::PortalClockState,
) {
    let trail_len = state.micro_orbit.len();
    let dot_scale = ((r_min * 0.05) as i32).max(2).min(10);

    // Fading trail
    for (idx, &deg) in state.micro_orbit.iter().enumerate() {
        if deg == 0xFFFF { continue; }
        let fade = (idx as f32 + 1.0) / (trail_len as f32 + 1.0);
        let intensity = (fade * 120.0) as u8;
        let trail_color = [intensity, intensity / 2, 0u8];
        let (tx, ty, _) = equator_project(deg as f32, q, r_maj, r_min, 1.1, cx, cy, dist);
        paint_dot(pixmap, tx, ty, (dot_scale / 2).max(1), trail_color);
    }

    // Anticodon — green marker at deficient degree
    if let Some(ref cast) = state.last_cast {
        let def_deg = cast.deficient_degree;
        if def_deg < 360 {
            let (ax, ay, _) = equator_project(def_deg as f32, q, r_maj, r_min, 1.2, cx, cy, dist);
            paint_dot(pixmap, ax, ay, dot_scale, [0, 200, 80]);
        }
    }

    // Current degree — yellow glow + bright core
    let cur = state.current_degree;
    if cur < 360 {
        let (kx, ky, _) = equator_project(cur as f32, q, r_maj, r_min, 1.15, cx, cy, dist);
        paint_dot(pixmap, kx, ky, dot_scale + 3, [80, 80, 20]);   // outer glow
        paint_dot(pixmap, kx, ky, dot_scale, [255, 240, 0]);       // core
    }
}

/// Burn zodiac glyphs at sign centers (outside equator) and planet glyphs near live planets.
fn burn_labels(
    pixmap: &mut Pixmap,
    q: [f32; 4],
    r_maj: f32,
    r_min: f32,
    cx: f32,
    cy: f32,
    dist: f32,
    planets: &[crate::portal::clock_state::PlanetState; 10],
) {
    let font = match FontRef::try_from_slice(FONT_BYTES) {
        Ok(f) => f,
        Err(_) => return,
    };
    // Scale glyphs proportionally to render resolution
    let glyph_size = (r_min * 0.35).max(12.0).min(48.0);
    let label_scale = ab_glyph::PxScale { x: glyph_size, y: glyph_size };
    let scaled = font.as_scaled(label_scale);

    // Zodiac glyphs at sign centers (15°, 45°, …)
    for sign in 0u8..12 {
        let deg = (sign as f32) * 30.0 + 15.0;
        let (sx, sy, rz) = equator_project(deg, q, r_maj, r_min, 1.8, cx, cy, dist);
        if rz < -r_min * 0.3 { continue; } // skip back-face
        let elem = sign_to_element(sign);
        let color = ELEMENT_COLORS[elem as usize];
        burn_char(pixmap, &scaled, ZODIAC_GLYPHS[sign as usize], sx, sy, color);
    }

    // Planet glyphs near live planet positions
    let planet_glyph_size = (r_min * 0.28).max(8.0).min(36.0);
    let planet_scale = ab_glyph::PxScale { x: planet_glyph_size, y: planet_glyph_size };
    let planet_scaled = font.as_scaled(planet_scale);
    let offset = (glyph_size * 0.6) as i32;
    for i in 0..10usize {
        let deg = planets[i].degree;
        if deg == 0xFFFF { continue; }
        let (px, py, _rz) = equator_project(deg as f32, q, r_maj, r_min, 1.5, cx, cy, dist);
        // No backface cull — planets must always be labeled
        let color = PLANET_COLORS[i];
        burn_char(pixmap, &planet_scaled, PLANET_GLYPHS[i], px + offset, py - offset, color);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

/// Render the Cosmic Clock torus to an RGBA pixmap.
///
/// `view_q`: camera view quaternion (user-controlled rotation, separate from clock state).
/// `zoom`: camera zoom factor (1.0 = default).
/// Returns `None` if pixmap allocation fails (OOM).
pub fn render_clock(
    width: u32,
    height: u32,
    state: &crate::portal::clock_state::PortalClockState,
    view_q: [f32; 4],
    zoom: f32,
) -> Option<Pixmap> {
    use std::f32::consts::PI;

    let mut pixmap = Pixmap::new(width, height)?;

    // Fill near-black background
    {
        let data = pixmap.data_mut();
        let len = data.len();
        let mut i = 0usize;
        while i < len {
            data[i]     = 10;   // R
            data[i + 1] = 10;   // G
            data[i + 2] = 15;   // B
            data[i + 3] = 255;  // A
            i += 4;
        }
    }

    let w = width as f32;
    let h = height as f32;
    let cx = w * 0.5;
    let cy = h * 0.5;
    let scale_base = w.min(h) * 0.5 * 0.88;
    let scale = scale_base / zoom.max(0.1); // zoom < 1 = bigger, > 1 = smaller

    let r_maj = scale * (16.0 / 25.0);
    let r_min = scale * (9.0 / 25.0);
    let dist = scale_base * 3.5; // perspective distance stays fixed

    // Compose: view rotation applied to clock state rotation
    let q = quat_mul_norm(view_q, state.composed_quaternion);
    let tick12 = state.tick12;
    let resolution_level = state.resolution_level;

    // ── Parametric torus surface ──────────────────────────────────────────────
    // 360 theta (degree) × 72 phi (spanda) steps
    let theta_steps = 360usize;
    let phi_steps   = 72usize;

    // Sort theta slices back-to-front (painter's algorithm)
    let mut theta_order: Vec<u32> = (0..theta_steps as u32).collect();
    theta_order.sort_by(|&a, &b| {
        let ta = (a as f32) * std::f32::consts::TAU / theta_steps as f32;
        let tb = (b as f32) * std::f32::consts::TAU / theta_steps as f32;
        let (_, _, za) = quat_rotate(q, r_maj * ta.cos(), r_maj * ta.sin(), 0.0);
        let (_, _, zb) = quat_rotate(q, r_maj * tb.cos(), r_maj * tb.sin(), 0.0);
        za.partial_cmp(&zb).unwrap_or(std::cmp::Ordering::Equal)
    });

    for &ti in &theta_order {
        let theta = (ti as f32) * 2.0 * PI / (theta_steps as f32);
        let sign = ((ti / 30) as u8) % 12;
        let elem = sign_to_element(sign);

        for pi_step in 0..phi_steps {
            let phi = (pi_step as f32) * 2.0 * PI / (phi_steps as f32);
            let tick = ((pi_step * 12) / phi_steps) as u8; // 0-11

            // Torus surface point
            let x0 = (r_maj + r_min * phi.cos()) * theta.cos();
            let y0 = (r_maj + r_min * phi.cos()) * theta.sin();
            let z0 = r_min * phi.sin();

            let (rx, ry, rz) = quat_rotate(q, x0, y0, z0);

            // Perspective projection
            let w_proj = dist / (dist - rz);
            let sx = (cx + rx * w_proj) as i32;
            let sy = (cy - ry * w_proj) as i32;

            if sx < 0 || sy < 0 || sx >= width as i32 || sy >= height as i32 {
                continue;
            }

            // Lambertian: surface normal at (theta, phi)
            let nx0 = theta.cos() * phi.cos();
            let ny0 = theta.sin() * phi.cos();
            let nz0 = phi.sin();
            let (_, _, nrz) = quat_rotate(q, nx0, ny0, nz0);
            // Light from slightly above/forward
            let illum = (nrz * 0.8 + 0.35).clamp(0.0, 1.0);

            let color = surface_color(elem, tick, tick12, resolution_level, illum);

            let idx = sy as usize * width as usize + sx as usize;
            let off = idx * 4;
            let data = pixmap.data_mut();
            data[off]     = color[0];
            data[off + 1] = color[1];
            data[off + 2] = color[2];
            data[off + 3] = 255;
        }
    }

    // ── Overlay layers ────────────────────────────────────────────────────────
    render_backbone_rings(&mut pixmap, q, r_maj, r_min, cx, cy, dist, resolution_level);
    render_planets(
        &mut pixmap, q, r_maj, r_min, cx, cy, dist,
        &state.kairos.planets, &state.natal_degrees,
    );
    render_aspect_lines(
        &mut pixmap, q, r_maj, r_min, cx, cy, dist,
        &state.kairos.planets, &state.aspects,
    );
    render_oracle_markers(&mut pixmap, q, r_maj, r_min, cx, cy, dist, state);
    burn_labels(&mut pixmap, q, r_maj, r_min, cx, cy, dist, &state.kairos.planets);

    Some(pixmap)
}

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn font_loads_successfully() {
        let font = FontRef::try_from_slice(FONT_BYTES);
        assert!(font.is_ok(), "Failed to load bundled font");
    }

    #[test]
    fn render_clock_produces_non_empty_pixmap() {
        use crate::portal::clock_state::PortalClockState;
        let state = PortalClockState::default();
        let pixmap = render_clock(400, 400, &state, [1.0, 0.0, 0.0, 0.0], 1.0);
        assert!(pixmap.is_some(), "render_clock returned None");
        let pixmap = pixmap.unwrap();
        assert_eq!(pixmap.width(), 400);
        assert_eq!(pixmap.height(), 400);

        // At least some pixels must differ from the background (10, 10, 15)
        let data = pixmap.data();
        let non_bg = data.chunks(4).any(|px| {
            !(px[0] == 10 && px[1] == 10 && px[2] == 15)
        });
        assert!(non_bg, "All pixels are background color — torus not rendered");
    }

    #[test]
    fn quat_rotate_identity_is_noop() {
        let identity = [1.0f32, 0.0, 0.0, 0.0];
        let (rx, ry, rz) = quat_rotate(identity, 1.0, 2.0, 3.0);
        assert!((rx - 1.0).abs() < 1e-5, "x not preserved: {rx}");
        assert!((ry - 2.0).abs() < 1e-5, "y not preserved: {ry}");
        assert!((rz - 3.0).abs() < 1e-5, "z not preserved: {rz}");
    }
}
