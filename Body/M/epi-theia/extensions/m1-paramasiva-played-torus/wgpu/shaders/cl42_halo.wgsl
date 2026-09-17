@fragment
fn fs_main(@location(0) signature: f32) -> @location(0) vec4<f32> {
  if (signature < 0.0) {
    return vec4<f32>(0.22, 0.44, 0.96, 0.74);
  }
  return vec4<f32>(0.88, 0.78, 0.32, 0.74);
}
