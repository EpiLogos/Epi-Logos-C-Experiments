@fragment
fn fs_main(@location(0) cell_value: f32) -> @location(0) vec4<f32> {
  let heat = clamp(cell_value / 9.0, 0.0, 1.0);
  return vec4<f32>(heat, 0.72, 1.0 - heat, 1.0);
}
