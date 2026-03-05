pub struct QLAlignmentValidator;

impl QLAlignmentValidator {
    pub fn new() -> Self { Self }

    pub fn validate_coordinate(&self, coordinate: &str) -> bool {
        matches!(coordinate,
            "#0" | "#1" | "#2" | "#3" | "#4" | "#5" |
            "P0" | "P1" | "P2" | "P3" | "P4" | "P5" |
            "S0" | "S1" | "S2" | "S3" | "S4" | "S5" |
            "T0" | "T1" | "T2" | "T3" | "T4" | "T5" |
            "M0" | "M1" | "M2" | "M3" | "M4" | "M5" |
            "L0" | "L1" | "L2" | "L3" | "L4" | "L5" |
            "C0" | "C1" | "C2" | "C3" | "C4" | "C5"
        )
    }
}
