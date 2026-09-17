pub const PLANET_COUNT: usize = 10;

/// Mirrors M2_PLANET_LUT.keplerian_vel in epi-lib/include/m2.h (arcsec/day x 10).
pub const PLANET_KEPLERIAN_VELOCITY: [f32; PLANET_COUNT] = [
    35_999.0, 47_270.0, 14_739.0, 3_600.0, 1_886.0, 299.0, 120.0, 42.0, 21.0, 14.0,
];
