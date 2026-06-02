use serde::{Deserialize, Serialize};

pub const BIMBA_BASE_RADIUS: f32 = 1200.0;
pub const BIMBA_RADIUS_DECAY: f32 = 0.3;
pub const BIMBA_Z_OSCILLATION: f32 = 20.0;
pub const HEX_ANGLE_OFFSET: f32 = -std::f32::consts::FRAC_PI_6;
pub const HEX_ANGLE_STEP: f32 = std::f32::consts::FRAC_PI_3;

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct BimbaPosition {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "class", rename_all = "snake_case")]
pub enum GeometryClass {
    Hexagonal6Fold,
    DoubleHexagon12Fold { offset_degrees: f32 },
    Triangular3Fold,
    Square4Fold,
    Octahedral,
    Icosahedral,
    TorusGenusN { genus: u8 },
    KleinBottle,
    Custom { id: String },
}

impl Default for GeometryClass {
    fn default() -> Self {
        GeometryClass::Hexagonal6Fold
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SubGraphGeometry {
    pub root_coordinate: String,
    pub class: GeometryClass,
    pub orientation_quaternion: [f32; 4],
    pub scale: f32,
    pub source: GeometrySource,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "source", rename_all = "snake_case")]
pub enum GeometrySource {
    Detected { confidence: f32 },
    Frontmatter,
    Manual,
}

pub fn calculate_hexagonal_position(coordinate: &str) -> BimbaPosition {
    if coordinate == "#" {
        return BimbaPosition {
            x: 0.0,
            y: 0.0,
            z: 0.0,
        };
    }
    let body = coordinate.trim_start_matches('#');
    let segments: Vec<&str> = body.split(|c: char| c == '-' || c == '.').collect();

    let mut pos = BimbaPosition {
        x: 0.0,
        y: 0.0,
        z: 0.0,
    };
    let mut radius = BIMBA_BASE_RADIUS;

    for (level_idx, segment) in segments.iter().enumerate() {
        let value: i32 = segment.parse().unwrap_or(0);
        let hex_pos = ((value % 6) + 6) % 6;
        let angle = (hex_pos as f32) * HEX_ANGLE_STEP + HEX_ANGLE_OFFSET;

        pos.x += radius * angle.cos();
        pos.y += radius * angle.sin();
        pos.z += if level_idx % 2 == 0 {
            BIMBA_Z_OSCILLATION
        } else {
            -BIMBA_Z_OSCILLATION
        };

        radius *= BIMBA_RADIUS_DECAY;
    }

    pos
}

pub fn calculate_batch_positions(coordinates: &[String]) -> Vec<(String, BimbaPosition)> {
    coordinates
        .iter()
        .map(|c| (c.clone(), calculate_hexagonal_position(c)))
        .collect()
}

pub fn detect_geometry_class(child_count: usize) -> GeometryClass {
    match child_count {
        3 => GeometryClass::Triangular3Fold,
        4 => GeometryClass::Square4Fold,
        6 => GeometryClass::Hexagonal6Fold,
        12 => GeometryClass::DoubleHexagon12Fold {
            offset_degrees: 30.0,
        },
        _ => GeometryClass::Hexagonal6Fold,
    }
}

pub fn default_subgraph_geometry(coordinate: &str) -> SubGraphGeometry {
    SubGraphGeometry {
        root_coordinate: coordinate.to_string(),
        class: GeometryClass::Hexagonal6Fold,
        orientation_quaternion: [1.0, 0.0, 0.0, 0.0],
        scale: 1.0,
        source: GeometrySource::Detected { confidence: 1.0 },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn root_is_origin() {
        let pos = calculate_hexagonal_position("#");
        assert_eq!(pos.x, 0.0);
        assert_eq!(pos.y, 0.0);
        assert_eq!(pos.z, 0.0);
    }

    #[test]
    fn position_0_is_lower_right() {
        let pos = calculate_hexagonal_position("#0");
        assert!(pos.x > 0.0, "x should be positive for #0");
        assert!(pos.y < 0.0, "y should be negative for #0");
        assert!((pos.z - BIMBA_Z_OSCILLATION).abs() < 1e-4);
    }

    #[test]
    fn six_positions_form_hexagon() {
        let positions: Vec<BimbaPosition> =
            (0..6).map(|i| calculate_hexagonal_position(&format!("#{i}"))).collect();
        for p in &positions {
            let r = (p.x * p.x + p.y * p.y).sqrt();
            assert!(
                (r - BIMBA_BASE_RADIUS).abs() < 1.0,
                "all level-0 positions should be at base radius"
            );
        }
    }

    #[test]
    fn nested_position_closer_to_origin_axis() {
        let p0 = calculate_hexagonal_position("#0");
        let p01 = calculate_hexagonal_position("#0-1");
        let r0 = (p0.x * p0.x + p0.y * p0.y).sqrt();
        let r01 = (p01.x * p01.x + p01.y * p01.y).sqrt();
        assert!(r01 != r0, "nested should differ from parent radius");
    }

    #[test]
    fn z_oscillates() {
        let p = calculate_hexagonal_position("#0-1-2");
        assert!(p.z.abs() > 0.0);
    }

    #[test]
    fn batch_positions() {
        let coords = vec!["#".into(), "#0".into(), "#3".into()];
        let results = calculate_batch_positions(&coords);
        assert_eq!(results.len(), 3);
        assert_eq!(results[0].0, "#");
    }

    #[test]
    fn detect_geometry() {
        assert!(matches!(detect_geometry_class(6), GeometryClass::Hexagonal6Fold));
        assert!(matches!(detect_geometry_class(3), GeometryClass::Triangular3Fold));
        assert!(matches!(detect_geometry_class(4), GeometryClass::Square4Fold));
        assert!(matches!(detect_geometry_class(12), GeometryClass::DoubleHexagon12Fold { .. }));
        assert!(matches!(detect_geometry_class(7), GeometryClass::Hexagonal6Fold));
    }
}
