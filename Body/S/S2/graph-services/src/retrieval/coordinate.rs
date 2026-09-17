use crate::CoordinateArrayParser;
use crate::Neo4jClient;
use neo4rs::query;
use serde::Deserialize;

pub struct CoordinateRetrieval<'a> {
    client: &'a Neo4jClient,
}

/// Common Bimba return clause — aliased columns for neo4rs Row::get.
const BASE_RETURN: &str = "\
n.coordinate AS coordinate, \
n.c_1_name AS name, \
n.c_4_family AS family, \
n.c_4_layer AS layer, \
n.c_4_ql_position AS ql_position, \
n.c_2_uuid AS uuid";

/// Base-view return clause (Track 48 §13.E `s2.graph.list_by_filter`). Surfaces
/// the coordinate join key plus the `c_N_*` frontmatter columns the BasesView
/// renders, so a `list_by_filter` row matches the shape the static `.base`
/// snapshot carries. Missing properties simply read back as `null`.
const BASE_VIEW_RETURN: &str = "\
n.coordinate AS coordinate, \
n.title AS title, \
n.c_1_name AS name, \
n.c_4_artifact_role AS c_4_artifact_role, \
n.c_4_family AS c_4_family, \
n.c_4_layer AS c_4_layer, \
n.c_4_ql_position AS c_4_ql_position, \
n.c_2_uuid AS c_2_uuid, \
n.c_layer_role AS c_layer_role, \
n.world_type_path AS world_type_path";

/// A single property predicate for `list_by_filter` — the Rust mirror of the
/// Theia `PropPredicate` (Track 48 §13.D). `value` is unused for the
/// `exists` / `missing` ops.
#[derive(Debug, Clone, Deserialize)]
pub struct PropPredicate {
    pub property: String,
    pub op: String,
    #[serde(default)]
    pub value: serde_json::Value,
}

/// Scalar binding plan emitted by the pure Cypher builder so the async method
/// can bind `$pN` params without re-inspecting predicate values.
#[derive(Debug, Clone, PartialEq)]
pub enum FilterParam {
    Str(String),
    Int(i64),
    Float(f64),
    Bool(bool),
}

/// Reject any property name that is not a bare `[A-Za-z0-9_]` identifier — the
/// name is interpolated into Cypher (`n.<prop>`), so it must never carry
/// injection surface. Values always bind through `$pN` parameters.
fn sanitize_property(prop: &str) -> Result<&str, String> {
    if !prop.is_empty() && prop.chars().all(|c| c.is_ascii_alphanumeric() || c == '_') {
        Ok(prop)
    } else {
        Err(format!("invalid property name in filter: {prop:?}"))
    }
}

/// Convert a JSON predicate value into a scalar binding. Arrays / objects are
/// rejected — predicates compare against scalars only.
fn predicate_value_to_param(value: &serde_json::Value) -> Result<FilterParam, String> {
    match value {
        serde_json::Value::String(s) => Ok(FilterParam::Str(s.clone())),
        serde_json::Value::Bool(b) => Ok(FilterParam::Bool(*b)),
        serde_json::Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                Ok(FilterParam::Int(i))
            } else if let Some(f) = n.as_f64() {
                Ok(FilterParam::Float(f))
            } else {
                Err("unsupported numeric filter value".to_string())
            }
        }
        other => Err(format!("filter value must be a scalar, got: {other}")),
    }
}

/// Build the read-only Cypher + ordered parameter bindings for a list-by-filter
/// query. Pure (no DB) so it is unit-tested directly. `$limit` is bound by the
/// caller. Returns an error on an unknown op, a non-identifier property, or a
/// non-scalar value.
pub fn build_list_by_filter_query(
    coordinate_scope: &str,
    predicates: &[PropPredicate],
) -> Result<(String, Vec<(String, FilterParam)>), String> {
    let mut clauses: Vec<String> = Vec::new();
    let mut params: Vec<(String, FilterParam)> = Vec::new();

    let scope = coordinate_scope.trim();
    if !scope.is_empty() {
        clauses.push("n.coordinate STARTS WITH $scope".to_string());
        params.push(("scope".to_string(), FilterParam::Str(scope.to_string())));
    }

    for (i, pred) in predicates.iter().enumerate() {
        let prop = sanitize_property(&pred.property)?;
        let pname = format!("p{i}");
        let clause = match pred.op.as_str() {
            "eq" => {
                params.push((pname.clone(), predicate_value_to_param(&pred.value)?));
                format!("n.{prop} = ${pname}")
            }
            "neq" => {
                params.push((pname.clone(), predicate_value_to_param(&pred.value)?));
                format!("n.{prop} <> ${pname}")
            }
            "startsWith" => match predicate_value_to_param(&pred.value)? {
                FilterParam::Str(s) => {
                    params.push((pname.clone(), FilterParam::Str(s)));
                    format!("n.{prop} STARTS WITH ${pname}")
                }
                _ => return Err("startsWith requires a string value".to_string()),
            },
            "lt" => {
                params.push((pname.clone(), predicate_value_to_param(&pred.value)?));
                format!("n.{prop} < ${pname}")
            }
            "gt" => {
                params.push((pname.clone(), predicate_value_to_param(&pred.value)?));
                format!("n.{prop} > ${pname}")
            }
            "exists" => format!("n.{prop} IS NOT NULL"),
            "missing" => format!("n.{prop} IS NULL"),
            other => return Err(format!("unsupported filter op: {other}")),
        };
        clauses.push(clause);
    }

    let where_clause = if clauses.is_empty() {
        String::new()
    } else {
        format!("WHERE {} ", clauses.join(" AND "))
    };
    let cypher = format!(
        "MATCH (n:Bimba) {where_clause}RETURN {BASE_VIEW_RETURN} ORDER BY coordinate ASC LIMIT $limit"
    );
    Ok((cypher, params))
}

impl<'a> CoordinateRetrieval<'a> {
    pub fn new(client: &'a Neo4jClient) -> Self {
        Self { client }
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /// Single coordinate lookup — validates via CoordinateArrayParser first.
    pub async fn query_by_coordinate(&self, coord: &str) -> Result<Vec<serde_json::Value>, String> {
        let _parsed = CoordinateArrayParser::parse_one(coord)?;
        let q = query(&format!(
            "MATCH (n:Bimba {{coordinate: $coord}}) RETURN {}",
            BASE_RETURN
        ))
        .param("coord", coord.to_owned());
        let rows = self
            .client
            .run_query(q)
            .await
            .map_err(|e| format!("query error: {}", e))?;
        Ok(rows.iter().map(|r| Self::row_to_json(r)).collect())
    }

    /// Multi-coordinate lookup.
    pub async fn query_multi(&self, coords: &[&str]) -> Result<Vec<serde_json::Value>, String> {
        // Validate every coordinate
        for c in coords {
            CoordinateArrayParser::parse_one(c)?;
        }
        // Match each requested coordinate explicitly; this avoids the flaky
        // `IN $coords` behavior we observed against the live Neo4j driver.
        let coord_list: Vec<String> = coords.iter().map(|c| c.to_string()).collect();
        let q = query(&format!(
            "UNWIND $coords AS coord \
             MATCH (n:Bimba {{coordinate: coord}}) \
             RETURN {}",
            BASE_RETURN
        ))
        .param("coords", coord_list);
        let rows = self
            .client
            .run_query(q)
            .await
            .map_err(|e| format!("query error: {}", e))?;
        Ok(rows.iter().map(|r| Self::row_to_json(r)).collect())
    }

    /// N-hop context around a coordinate (depth capped at 4).
    pub async fn query_context(
        &self,
        coord: &str,
        depth: u32,
    ) -> Result<serde_json::Value, String> {
        let _parsed = CoordinateArrayParser::parse_one(coord)?;
        let depth = depth.min(4); // safety cap
        let cypher = format!(
            "MATCH (center:Bimba {{coordinate: $coord}}) \
             OPTIONAL MATCH path = (center)-[*1..{}]-(neighbor:Bimba) \
             RETURN center.coordinate AS center, \
                    collect(DISTINCT neighbor.coordinate) AS neighbors",
            depth
        );
        let q = query(&cypher).param("coord", coord.to_owned());
        let rows = self
            .client
            .run_query(q)
            .await
            .map_err(|e| format!("context error: {}", e))?;
        if rows.is_empty() {
            return Err(format!("coordinate not found: {}", coord));
        }
        let center: String = rows[0].get("center").unwrap_or_default();
        let neighbors: Vec<String> = rows[0].get("neighbors").unwrap_or_default();
        let count = neighbors.len();
        Ok(serde_json::json!({
            "center": center,
            "depth": depth,
            "neighbors": neighbors,
            "neighbor_count": count,
        }))
    }

    /// All coordinates in a coordinate family.
    pub async fn query_by_family(&self, family: &str) -> Result<Vec<serde_json::Value>, String> {
        const VALID: &[&str] = &["C", "P", "L", "S", "T", "M", "NONE"];
        if !VALID.contains(&family) {
            return Err(format!("invalid family: {}", family));
        }
        let q = query(&format!(
            "MATCH (n:Bimba {{c_4_family: $fam}}) RETURN {} ORDER BY n.c_4_ql_position",
            BASE_RETURN
        ))
        .param("fam", family.to_owned());
        let rows = self
            .client
            .run_query(q)
            .await
            .map_err(|e| format!("query error: {}", e))?;
        Ok(rows.iter().map(|r| Self::row_to_json(r)).collect())
    }

    /// Coordinates framed by a context-frame node (via FRAMES relationship).
    pub async fn query_by_cf(&self, cf_name: &str) -> Result<Vec<serde_json::Value>, String> {
        let q = query(&format!(
            "MATCH (cf:Bimba {{coordinate: $cf}})-[:FRAMES]->(n) RETURN {}",
            BASE_RETURN
        ))
        .param("cf", cf_name.to_owned());
        let rows = self
            .client
            .run_query(q)
            .await
            .map_err(|e| format!("query error: {}", e))?;
        Ok(rows.iter().map(|r| Self::row_to_json(r)).collect())
    }

    /// List-by-filter over the Bimba coordinate index (Track 48 §13.E
    /// `s2.graph.list_by_filter`). Returns `{ "rows": [...] }` — each row is a
    /// coordinate-keyed object carrying the base-view columns. `coordinate_scope`
    /// is a coordinate prefix (`""` = whole map); `predicates` are `c_N_*`
    /// frontmatter filters; `limit` defaults to 200 and is capped at 1000.
    pub async fn list_by_filter(
        &self,
        coordinate_scope: &str,
        predicates: &[PropPredicate],
        limit: Option<i64>,
    ) -> Result<serde_json::Value, String> {
        let (cypher, bindings) = build_list_by_filter_query(coordinate_scope, predicates)?;
        let limit = limit.unwrap_or(200).clamp(1, 1000);
        let mut q = query(&cypher).param("limit", limit);
        for (name, val) in bindings {
            q = match val {
                FilterParam::Str(s) => q.param(&name, s),
                FilterParam::Int(i) => q.param(&name, i),
                FilterParam::Float(f) => q.param(&name, f),
                FilterParam::Bool(b) => q.param(&name, b),
            };
        }
        let rows = self
            .client
            .run_query(q)
            .await
            .map_err(|e| format!("list_by_filter error: {}", e))?;
        let rows: Vec<serde_json::Value> = rows.iter().map(Self::base_view_row_to_json).collect();
        Ok(serde_json::json!({ "rows": rows }))
    }

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    /// Project a base-view row into a coordinate-keyed JSON object. Absent
    /// (null) string columns are dropped rather than emitted as `""`, so the
    /// row shape matches the sparse `.base` snapshot frontmatter.
    fn base_view_row_to_json(row: &neo4rs::Row) -> serde_json::Value {
        let mut obj = serde_json::Map::new();
        obj.insert(
            "coordinate".to_string(),
            serde_json::Value::String(row.get("coordinate").unwrap_or_default()),
        );
        for key in [
            "title",
            "name",
            "c_4_artifact_role",
            "c_4_family",
            "c_4_layer",
            "c_2_uuid",
            "c_layer_role",
            "world_type_path",
        ] {
            if let Ok(v) = row.get::<String>(key) {
                if !v.is_empty() {
                    obj.insert(key.to_string(), serde_json::Value::String(v));
                }
            }
        }
        if let Ok(p) = row.get::<i64>("c_4_ql_position") {
            obj.insert("c_4_ql_position".to_string(), serde_json::json!(p));
        }
        serde_json::Value::Object(obj)
    }

    fn row_to_json(row: &neo4rs::Row) -> serde_json::Value {
        let coord: String = row.get("coordinate").unwrap_or_default();
        let name: String = row.get("name").unwrap_or_default();
        let family: String = row.get("family").unwrap_or_default();
        let layer: String = row.get("layer").unwrap_or_default();
        let ql_pos: i64 = row.get("ql_position").unwrap_or(-1);
        let uuid: String = row.get("uuid").unwrap_or_default();

        serde_json::json!({
            "coordinate": coord,
            "name": name,
            "family": family,
            "layer": layer,
            "ql_position": ql_pos,
            "uuid": uuid,
        })
    }
}

// ===========================================================================
// Unit tests — pure list-by-filter Cypher builder (no DB required)
// ===========================================================================
#[cfg(test)]
mod tests {
    use super::*;

    fn pred(property: &str, op: &str, value: serde_json::Value) -> PropPredicate {
        PropPredicate {
            property: property.to_string(),
            op: op.to_string(),
            value,
        }
    }

    #[test]
    fn empty_scope_no_predicates_emits_unfiltered_query() {
        let (cypher, params) = build_list_by_filter_query("", &[]).unwrap();
        assert!(params.is_empty());
        assert!(!cypher.contains("WHERE"));
        assert!(cypher.contains("MATCH (n:Bimba)"));
        assert!(cypher.contains("RETURN n.coordinate AS coordinate"));
        assert!(cypher.contains("ORDER BY coordinate ASC"));
        assert!(cypher.contains("LIMIT $limit"));
    }

    #[test]
    fn scope_prefix_binds_scope_param() {
        let (cypher, params) = build_list_by_filter_query("M2-1", &[]).unwrap();
        assert!(cypher.contains("WHERE n.coordinate STARTS WITH $scope"));
        assert_eq!(
            params,
            vec![("scope".to_string(), FilterParam::Str("M2-1".to_string()))]
        );
    }

    #[test]
    fn eq_predicate_on_c_n_property_binds_value() {
        let (cypher, params) = build_list_by_filter_query(
            "",
            &[pred(
                "c_4_artifact_role",
                "eq",
                serde_json::json!("map-index"),
            )],
        )
        .unwrap();
        assert!(cypher.contains("WHERE n.c_4_artifact_role = $p0 "));
        assert_eq!(
            params,
            vec![("p0".to_string(), FilterParam::Str("map-index".to_string()))]
        );
    }

    #[test]
    fn scope_and_predicate_compose_with_and() {
        let (cypher, params) =
            build_list_by_filter_query("M2", &[pred("c_4_family", "eq", serde_json::json!("M"))])
                .unwrap();
        assert!(cypher.contains("n.coordinate STARTS WITH $scope AND n.c_4_family = $p0"));
        assert_eq!(params.len(), 2);
        assert_eq!(params[0].0, "scope");
        assert_eq!(params[1].0, "p0");
    }

    #[test]
    fn exists_and_missing_emit_null_checks_without_params() {
        let (cypher, params) = build_list_by_filter_query(
            "",
            &[
                pred("c_5_reflection_complete", "exists", serde_json::Value::Null),
                pred("title", "missing", serde_json::Value::Null),
            ],
        )
        .unwrap();
        assert!(cypher.contains("n.c_5_reflection_complete IS NOT NULL"));
        assert!(cypher.contains("n.title IS NULL"));
        assert!(params.is_empty());
    }

    #[test]
    fn lt_gt_neq_startswith_each_emit_their_operator() {
        let (cypher, _) = build_list_by_filter_query(
            "",
            &[
                pred("c_4_ql_position", "lt", serde_json::json!(3)),
                pred("c_4_ql_position", "gt", serde_json::json!(0)),
                pred("c_4_family", "neq", serde_json::json!("S")),
                pred("coordinate", "startsWith", serde_json::json!("M0")),
            ],
        )
        .unwrap();
        assert!(cypher.contains("n.c_4_ql_position < $p0"));
        assert!(cypher.contains("n.c_4_ql_position > $p1"));
        assert!(cypher.contains("n.c_4_family <> $p2"));
        assert!(cypher.contains("n.coordinate STARTS WITH $p3"));
    }

    #[test]
    fn numeric_value_binds_as_int() {
        let (_, params) =
            build_list_by_filter_query("", &[pred("c_4_ql_position", "eq", serde_json::json!(2))])
                .unwrap();
        assert_eq!(params, vec![("p0".to_string(), FilterParam::Int(2))]);
    }

    #[test]
    fn non_identifier_property_is_rejected() {
        let err = build_list_by_filter_query(
            "",
            &[pred(
                "c_4_family; MATCH (x) DETACH DELETE x",
                "eq",
                serde_json::json!("M"),
            )],
        )
        .unwrap_err();
        assert!(err.contains("invalid property name"));
    }

    #[test]
    fn unknown_op_is_rejected() {
        let err = build_list_by_filter_query(
            "",
            &[pred("c_4_family", "regex", serde_json::json!("M.*"))],
        )
        .unwrap_err();
        assert!(err.contains("unsupported filter op"));
    }

    #[test]
    fn starts_with_requires_string_value() {
        let err = build_list_by_filter_query(
            "",
            &[pred("c_4_ql_position", "startsWith", serde_json::json!(2))],
        )
        .unwrap_err();
        assert!(err.contains("startsWith requires a string"));
    }

    #[test]
    fn array_value_is_rejected_as_non_scalar() {
        let err = build_list_by_filter_query(
            "",
            &[pred(
                "c_0_source_coordinates",
                "eq",
                serde_json::json!(["M2"]),
            )],
        )
        .unwrap_err();
        assert!(err.contains("scalar"));
    }
}
