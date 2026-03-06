use crate::graph::api::GraphAPI;
use crate::graph::types::GraphResult;

pub struct CoordinateRetrieval {
    api: GraphAPI,
}

impl CoordinateRetrieval {
    pub fn new(api: GraphAPI) -> Self {
        Self { api }
    }

    pub fn retrieve(&self, coordinate: &str, nested: bool) -> GraphResult {
        let mut result = self.api.query_by_coordinate(coordinate);
        if nested {
            // In full impl: recursively retrieve sub-coordinates
            result.query = result.query.map(|q| format!("{} [nested]", q));
        }
        result
    }
}
