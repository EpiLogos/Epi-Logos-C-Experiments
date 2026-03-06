pub struct CoordinateArrayParser;

impl CoordinateArrayParser {
    pub fn new() -> Self {
        Self
    }

    /// Parse coordinate array from string like "#0,P3,M4"
    pub fn parse(&self, input: &str) -> Vec<String> {
        input
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect()
    }
}
