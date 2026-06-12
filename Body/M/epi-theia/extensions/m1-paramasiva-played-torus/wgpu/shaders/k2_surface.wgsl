struct VertexOut {
  @builtin(position) position: vec4<f32>,
};

@vertex
fn vs_main(@location(0) position: vec3<f32>) -> VertexOut {
  var out: VertexOut;
  out.position = vec4<f32>(position, 1.0);
  return out;
}

@fragment
fn fs_main() -> @location(0) vec4<f32> {
  return vec4<f32>(0.16, 0.21, 0.28, 1.0);
}
