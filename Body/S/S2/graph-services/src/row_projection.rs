//! Coordinate: S2 (graph read projection — the caller's own RETURN, honestly)
//! Residency: Body/S/S2/graph-services/src/row_projection.rs
//! Position (#n): #2 — the substrate boundary where a driver row becomes JSON
//! Actualises: `S2-SPEC.md:159-185` for `s2.graph.query` —
//!   `S2GraphQueryResponse { rows: Record<string, unknown>[]; columns: string[] }`.
//!   A caller-owned Cypher gets a caller-owned projection: every alias the
//!   query RETURNed survives, under its own name, with its own type.
//!
//!   WHY THIS EXISTS. `s2.graph.query` used to run the caller's Cypher and then
//!   map every row through `bimba_node_row` (then named `known_row_json`), a
//!   FIXED seven-column node projection. Every other alias was discarded and
//!   absent columns became `""` / `-1` via `unwrap_or_default()`. Measured
//!   consequence: the Bimba Graph Viewer had never rendered a single edge —
//!   `source`/`target`/`type` never survived the gateway — against a graph
//!   holding 11,295 Bimba→Bimba edges. The rule the split enforces:
//!
//!     Whoever owns the Cypher owns the projection.
//!
//!   Service-owned RETURNs (`node`, `traverse`, `list`, …) keep their typed
//!   projectors, because the service wrote those queries and knows their shape.
//!   `query` is the one method where the caller wrote it, so it gets this.
//!
//! Public surface: `bolt_to_json`, `row_columns`, `row_to_json`,
//!   `SAFE_INTEGER_MAX`, `SAFE_INTEGER_MIN`.
//! Does NOT own: the Cypher guard (`GraphQueryRequest::validate`), the response
//!   envelope (`graph_api.rs::query`), or the typed projectors.
//! Contract: [[S2-SPEC]] §`s2.graph.query`. Two laws hold here —
//!   ABSENT IS `null`, NEVER `""` (24% of the graph is the coordinate-less
//!   Graphiti island; a blank must stay distinguishable from a missing one),
//!   and STRINGS ARE NOT PARSED (158 values across 38 keys are bracket- or
//!   brace-leading but are variously valid JSON, invalid JSON, matheme
//!   notation, and `[[wikilinks]]` — shape-sniffing would corrupt most of them).

use chrono::{DateTime, FixedOffset, NaiveDate, NaiveDateTime, NaiveTime};
use neo4rs::{BoltList, BoltMap, BoltNode, BoltPath, BoltRelation, BoltType, BoltUnboundedRelation, Row};
use serde_json::{json, Map, Value};

/// The largest integer a IEEE-754 double represents exactly. Beyond this a
/// JSON number silently loses precision, so the value is emitted as a decimal
/// STRING instead — a truthful string beats a wrong number.
pub const SAFE_INTEGER_MAX: i64 = 9_007_199_254_740_991;
pub const SAFE_INTEGER_MIN: i64 = -9_007_199_254_740_991;

fn integer_to_json(value: i64) -> Value {
    if (SAFE_INTEGER_MIN..=SAFE_INTEGER_MAX).contains(&value) {
        json!(value)
    } else {
        Value::String(value.to_string())
    }
}

fn list_to_json(list: &BoltList) -> Value {
    Value::Array(list.value.iter().map(bolt_to_json).collect())
}

fn map_to_json(map: &BoltMap) -> Value {
    let mut out = Map::new();
    for (key, value) in map.value.iter() {
        out.insert(key.value.clone(), bolt_to_json(value));
    }
    Value::Object(out)
}

fn node_to_json(node: &BoltNode) -> Value {
    json!({
        "_type": "node",
        "id": integer_to_json(node.id.value),
        "labels": node.labels.value.iter().map(bolt_to_json).collect::<Vec<_>>(),
        "properties": map_to_json(&node.properties),
    })
}

fn relation_to_json(rel: &BoltRelation) -> Value {
    json!({
        "_type": "relationship",
        "id": integer_to_json(rel.id.value),
        "relType": rel.typ.value.clone(),
        "startNodeId": integer_to_json(rel.start_node_id.value),
        "endNodeId": integer_to_json(rel.end_node_id.value),
        "properties": map_to_json(&rel.properties),
    })
}

fn unbounded_relation_to_json(rel: &BoltUnboundedRelation) -> Value {
    json!({
        "_type": "relationship",
        "id": integer_to_json(rel.id.value),
        "relType": rel.typ.value.clone(),
        "properties": map_to_json(&rel.properties),
    })
}

fn path_to_json(path: &BoltPath) -> Value {
    json!({
        "_type": "path",
        "nodes": path.nodes.value.iter().map(bolt_to_json).collect::<Vec<_>>(),
        "relationships": path.rels.value.iter().map(bolt_to_json).collect::<Vec<_>>(),
        "indices": path.indices.value.iter().map(bolt_to_json).collect::<Vec<_>>(),
    })
}

/// Temporals become ISO-8601 strings. A conversion that fails is reported as a
/// tagged object rather than dropped — the caller learns the value exists and
/// that we could not format it, which is the honest outcome.
fn temporal_to_json(kind: &str, formatted: Option<String>) -> Value {
    match formatted {
        Some(text) => Value::String(text),
        None => json!({ "_type": kind, "unrepresentable": true }),
    }
}

/// Project ONE driver value to JSON. Structural values (node/relationship/path)
/// carry a `_type` tag: it tells the caller what the value is without leaking a
/// driver struct, which is what `S2-SPEC.md:185` asks for.
pub fn bolt_to_json(value: &BoltType) -> Value {
    match value {
        BoltType::Null(_) => Value::Null,
        BoltType::String(v) => Value::String(v.value.clone()),
        BoltType::Boolean(v) => Value::Bool(v.value),
        BoltType::Integer(v) => integer_to_json(v.value),
        BoltType::Float(v) => json!(v.value),
        BoltType::List(v) => list_to_json(v),
        BoltType::Map(v) => map_to_json(v),
        BoltType::Node(v) => node_to_json(v),
        BoltType::Relation(v) => relation_to_json(v),
        BoltType::UnboundedRelation(v) => unbounded_relation_to_json(v),
        BoltType::Path(v) => path_to_json(v),
        BoltType::Date(v) => temporal_to_json(
            "date",
            NaiveDate::try_from(v).ok().map(|d| d.format("%Y-%m-%d").to_string()),
        ),
        BoltType::DateTime(v) => temporal_to_json(
            "datetime",
            DateTime::<FixedOffset>::try_from(v).ok().map(|d| d.to_rfc3339()),
        ),
        BoltType::DateTimeZoneId(v) => temporal_to_json(
            "datetime",
            DateTime::<FixedOffset>::try_from(v).ok().map(|d| d.to_rfc3339()),
        ),
        BoltType::LocalDateTime(v) => temporal_to_json(
            "localdatetime",
            NaiveDateTime::try_from(v).ok().map(|d| d.format("%Y-%m-%dT%H:%M:%S%.f").to_string()),
        ),
        BoltType::Time(v) => {
            let (time, offset): (NaiveTime, FixedOffset) = v.into();
            Value::String(format!("{}{}", time.format("%H:%M:%S%.f"), offset))
        }
        BoltType::LocalTime(v) => {
            let time: NaiveTime = v.into();
            Value::String(time.format("%H:%M:%S%.f").to_string())
        }
        // Duration/Point/Bytes have no lossless scalar form. They are emitted
        // as tagged objects carrying their real components — never dropped,
        // never flattened into something that reads like a different type.
        // BoltDuration keeps its month/day/second components private, and a
        // month is not a fixed number of seconds — so the ISO-8601 form would
        // have to invent a calendar. The total std::time::Duration is what the
        // driver will hand over losslessly; the tag says what it is.
        BoltType::Duration(v) => {
            let total = std::time::Duration::from(v.clone());
            json!({
                "_type": "duration",
                "seconds": total.as_secs(),
                "nanoseconds": total.subsec_nanos(),
            })
        }
        BoltType::Point2D(v) => json!({
            "_type": "point",
            "srid": v.sr_id.value,
            "x": v.x.value,
            "y": v.y.value,
        }),
        BoltType::Point3D(v) => json!({
            "_type": "point",
            "srid": v.sr_id.value,
            "x": v.x.value,
            "y": v.y.value,
            "z": v.z.value,
        }),
        BoltType::Bytes(v) => json!({ "_type": "bytes", "length": v.value.len() }),
    }
}

/// The row's REAL column names, in the driver's order — the `columns` echo
/// `S2-SPEC.md:177` specifies. Derived from the result, never from a compiled
/// list, so an empty result yields an empty vector rather than a fabricated one.
pub fn row_columns(row: &Row) -> Vec<String> {
    row.keys().into_iter().map(|key| key.value.clone()).collect()
}

/// Project one row as `{ alias: value }` over its own columns.
pub fn row_to_json(row: &Row) -> Value {
    let mut out = Map::new();
    for key in row.keys() {
        let name = key.value.clone();
        // A key the driver reported must always appear, even if we cannot read
        // it back — omitting it would misreport the result's shape.
        let value = row
            .get::<BoltType>(name.as_str())
            .map(|bolt| bolt_to_json(&bolt))
            .unwrap_or(Value::Null);
        out.insert(name, value);
    }
    Value::Object(out)
}

#[cfg(test)]
mod tests {
    use super::*;
    use neo4rs::{BoltBoolean, BoltInteger, BoltString};

    #[test]
    fn integers_inside_the_safe_range_stay_numbers() {
        assert_eq!(integer_to_json(42), json!(42));
        assert_eq!(integer_to_json(SAFE_INTEGER_MAX), json!(SAFE_INTEGER_MAX));
    }

    #[test]
    fn integers_outside_the_safe_range_become_strings_not_lossy_numbers() {
        let big = SAFE_INTEGER_MAX + 1;
        assert_eq!(integer_to_json(big), Value::String(big.to_string()));
        let small = SAFE_INTEGER_MIN - 1;
        assert_eq!(integer_to_json(small), Value::String(small.to_string()));
    }

    #[test]
    fn null_projects_as_null_never_as_empty_string() {
        // The law that keeps the coordinate-less Graphiti island (671 nodes,
        // 24% of the graph) distinguishable from a truncation bug.
        assert_eq!(bolt_to_json(&BoltType::Null(Default::default())), Value::Null);
    }

    #[test]
    fn strings_are_returned_verbatim_and_never_parsed() {
        for raw in [
            "[0/0, ((0/1)/(1/0)), {T1: 0/(0/1), 0/1}]", // c_1_form matheme
            "[[S0]]",                                   // s_1_vault_wikilink
            "{\"a\": 1}",                               // valid JSON
            "{a: 1, ...}",                              // invalid JSON
        ] {
            let value = BoltType::String(BoltString::new(raw));
            assert_eq!(bolt_to_json(&value), Value::String(raw.to_owned()));
        }
    }

    #[test]
    fn lists_and_maps_project_recursively() {
        let mut map = BoltMap::default();
        map.put(BoltString::new("n"), BoltType::Integer(BoltInteger::new(7)));
        let list = BoltType::List(BoltList {
            value: vec![BoltType::Map(map), BoltType::Boolean(BoltBoolean::new(true))],
        });
        assert_eq!(bolt_to_json(&list), json!([{ "n": 7 }, true]));
    }
}
