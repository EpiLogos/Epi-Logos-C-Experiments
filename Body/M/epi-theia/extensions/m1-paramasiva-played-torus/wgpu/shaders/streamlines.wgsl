@fragment
fn fs_main(@location(0) phase: f32) -> @location(0) vec4<f32> {
  let pulse = fract(phase / 9.0);
  return vec4<f32>(1.0, 0.82 + pulse * 0.12, 0.18, 1.0);
}
