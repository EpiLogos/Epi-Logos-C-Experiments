//! `epi canon coord` — the graph-live canon depth ladder.
//!
//! Coordinate Header (`convention:coordinate-header:v1`)
//! - Coordinate: S0 (Terminal / CLI / C Ground)
//! - Residency: `Body/S/S0/epi-cli/src/canon/coord.rs`
//! - Position (#0): membrane surface — the token-lean canon distribution
//!   primitive that reads concatenated `q_*` content + `qm_*` provenance from
//!   the live `:Bimba` graph and returns canonical packets at three depth rungs.
//! - Actualises: the `pithy | qv-detail | relational` depth ladder (Track 09,
//!   Tranche 9.13); the MCP `spec_retrieve` wire contract mirrors this exact
//!   command (`CanonCoordDepthSchema = ['pithy','qv-detail','relational']`).
//! - Public surface: [`CoordArgs`], [`CanonDepth`], [`run`].
//! - Does NOT own: the graph substrate (S2 graph-services owns the `:Bimba`
//!   node law), nor any write path — this surface is read-only canon delivery.
//!
//! GRAPH-TRUTH LAW (Track 09 is graph-live): every rung reads the LIVE Neo4j
//! `:Bimba` graph through the SAME S2 seam the rest of the CLI uses
//! (`Neo4jConfig::from_env` / `Neo4jClient::connect`, see `gate/graph.rs` and
//! `core/quintessential_view.rs`). There is deliberately NO static-dataset
//! fallback: if Neo4j is unreachable the command returns `Err` and the process
//! exits non-zero, so a canon-coord run can NEVER pass while claiming live
//! coverage with the graph down — that silent fallback is the exact cheat this
//! surface eliminates.

use clap::{Args, ValueEnum};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::graph::client::{Neo4jClient, Neo4jConfig};

#[derive(Args, Debug, Clone)]
pub struct CoordArgs {
    /// Coordinate id to resolve. Defaults to the root token for piping.
    pub coordinate_id: Option<String>,
    /// Depth rung to render.
    #[arg(long, value_enum, default_value_t = CanonDepth::Pithy)]
    pub depth: CanonDepth,
    /// Emit multi-line JSON for humans.
    #[arg(long)]
    pub pretty: bool,
    /// Keep JSON output explicit for shell pipelines. JSON is the default.
    #[arg(long)]
    pub json: bool,
}

/// The three canon depth rungs. Kept byte-parallel with the bimba-mcp
/// `CanonCoordDepthSchema` so the CLI and the MCP wire contract accept exactly
/// the same depth vocabulary (Tranche 17.28 parity).
#[derive(Debug, Clone, Copy, PartialEq, Eq, ValueEnum, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum CanonDepth {
    /// Kernel essence — `q_5`/`q_5'`/`q_1`/`q_1'` registers concatenated
    /// (definition + integration archetypes, both phases).
    Pithy,
    /// Every `q_*` / `q_*'` content register on the node plus `qm_*` provenance,
    /// ordered per the concatenation contract (position ascending, base before
    /// prime).
    QvDetail,
    /// `pithy` plus the node's `q_4` locality signature expanded with one-hop
    /// adjacent-node pithy excerpts (the neighbourhood / edge layer).
    Relational,
}

impl CanonDepth {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Pithy => "pithy",
            Self::QvDetail => "qv-detail",
            Self::Relational => "relational",
        }
    }
}

/// One live quaternal register read off the graph node.
#[derive(Debug, Clone)]
struct QRegister {
    key: String,
    position: u8,
    prime: bool,
    text: String,
}

/// A live `:Bimba` node's canon surface: its quaternal registers and `qm_`
/// provenance, read as they are.
#[derive(Debug, Clone)]
struct CanonNode {
    coordinate: String,
    name: Option<String>,
    registers: Vec<QRegister>,
    provenance: Vec<(String, String)>,
}

/// A one-hop adjacent node's pithy excerpt (the relational neighbourhood).
#[derive(Debug, Clone)]
struct CanonNeighbour {
    coordinate: String,
    name: Option<String>,
    relations: Vec<String>,
    excerpt: String,
}

struct CanonFetch {
    node: Option<CanonNode>,
    neighbours: Vec<CanonNeighbour>,
}

pub fn run(args: &CoordArgs) -> Result<Value, String> {
    let coordinate = args
        .coordinate_id
        .as_deref()
        .unwrap_or("#")
        .trim()
        .to_owned();
    if coordinate.is_empty() {
        return Err("coordinate id must not be empty".to_owned());
    }
    resolve_coordinate(&coordinate, args.depth)
}

/// Resolve one coordinate at `depth` against the LIVE `:Bimba` graph. `Err`
/// means Neo4j was unreachable or the query failed — the caller exits non-zero
/// (HONEST failure, never a synthetic fallback). A reachable graph with no node
/// for the coordinate returns a valid packet with `node_present: false`.
pub fn resolve_coordinate(coordinate: &str, depth: CanonDepth) -> Result<Value, String> {
    let want_neighbours = matches!(depth, CanonDepth::Relational);
    let fetch = fetch_canon(coordinate, want_neighbours)?;

    let resolved_coordinate = fetch
        .node
        .as_ref()
        .map(|node| node.coordinate.clone())
        .unwrap_or_else(|| coordinate.to_owned());

    let mut payload = json!({
        "coordinate": resolved_coordinate,
        "query_coordinate": coordinate,
        "depth": depth.as_str(),
        "graph_available": true,
        "node_present": fetch.node.is_some(),
    });
    if let Some(name) = fetch.node.as_ref().and_then(|node| node.name.clone()) {
        payload["name"] = json!(name);
    }

    match depth {
        CanonDepth::Pithy => render_pithy(&mut payload, fetch.node.as_ref()),
        CanonDepth::QvDetail => render_qv_detail(&mut payload, fetch.node.as_ref()),
        CanonDepth::Relational => {
            render_relational(&mut payload, fetch.node.as_ref(), &fetch.neighbours)
        }
    }

    Ok(payload)
}

fn render_pithy(payload: &mut Value, node: Option<&CanonNode>) {
    let all = node.map(|n| n.registers.as_slice()).unwrap_or_default();
    let registers = pithy_registers(all);
    let content = concat_registers(&registers);
    payload["registers"] = registers_json(&registers);
    payload["content"] = json!(content);
    payload["token_estimate"] = json!(estimate_tokens(&content));
}

fn render_qv_detail(payload: &mut Value, node: Option<&CanonNode>) {
    let registers = node.map(|n| n.registers.clone()).unwrap_or_default();
    let provenance = node.map(|n| n.provenance.clone()).unwrap_or_default();
    let content = concat_registers(&registers);
    payload["registers"] = registers_json(&registers);
    payload["provenance"] = json!(provenance
        .iter()
        .map(|(key, value)| json!({ "key": key, "value": value }))
        .collect::<Vec<_>>());
    payload["content"] = json!(content);
    payload["token_estimate"] = json!(estimate_tokens(&content));
}

fn render_relational(payload: &mut Value, node: Option<&CanonNode>, neighbours: &[CanonNeighbour]) {
    let all = node.map(|n| n.registers.as_slice()).unwrap_or_default();
    let pithy = pithy_registers(all);
    let locality: Vec<QRegister> = all.iter().filter(|reg| reg.position == 4).cloned().collect();

    let mut content_parts: Vec<String> = Vec::new();
    content_parts.push(concat_registers(&pithy));
    if !locality.is_empty() {
        content_parts.push(concat_registers(&locality));
    }
    for neighbour in neighbours {
        content_parts.push(format!(
            "[{}]{} {}",
            neighbour.coordinate,
            neighbour
                .name
                .as_deref()
                .map(|name| format!(" {name}"))
                .unwrap_or_default(),
            neighbour.excerpt
        ));
    }
    let content = content_parts
        .into_iter()
        .filter(|part| !part.is_empty())
        .collect::<Vec<_>>()
        .join("\n\n");

    payload["registers"] = registers_json(&pithy);
    payload["locality"] = registers_json(&locality);
    payload["neighbours"] = json!(neighbours
        .iter()
        .map(|neighbour| json!({
            "coordinate": neighbour.coordinate,
            "name": neighbour.name,
            "relations": neighbour.relations,
            "excerpt": neighbour.excerpt,
        }))
        .collect::<Vec<_>>());
    payload["content"] = json!(content);
    payload["token_estimate"] = json!(estimate_tokens(&content));
}

/// Select the pithy registers in the canonical order `q_5, q_5', q_1, q_1'`
/// (integration then definition, base phase then prime phase within a position,
/// keys sorted within a phase).
fn pithy_registers(all: &[QRegister]) -> Vec<QRegister> {
    let mut out = Vec::new();
    for position in [5u8, 1u8] {
        for prime in [false, true] {
            let mut matched: Vec<QRegister> = all
                .iter()
                .filter(|reg| reg.position == position && reg.prime == prime)
                .cloned()
                .collect();
            matched.sort_by(|left, right| left.key.cmp(&right.key));
            out.extend(matched);
        }
    }
    out
}

fn registers_json(registers: &[QRegister]) -> Value {
    json!(registers
        .iter()
        .map(|reg| json!({
            "key": reg.key,
            "position": reg.position,
            "phase": if reg.prime { "prime" } else { "base" },
            "text": reg.text,
        }))
        .collect::<Vec<_>>())
}

fn concat_registers(registers: &[QRegister]) -> String {
    registers
        .iter()
        .map(|reg| reg.text.clone())
        .collect::<Vec<_>>()
        .join("\n\n")
}

/// Rough token estimate (~4 chars/token) for the depth-budget indicator. This
/// is a REPORTED figure, never a gate: the surface renders whatever content the
/// live graph carries, however dense.
fn estimate_tokens(content: &str) -> usize {
    let chars = content.chars().count();
    chars.div_ceil(4)
}

/// Connect once to the live graph and read the node's canon surface, plus its
/// one-hop neighbourhood when the depth needs it. Mirrors the S2 seam used by
/// `core/quintessential_view.rs::load_graph_subbranch`.
fn fetch_canon(coordinate: &str, want_neighbours: bool) -> Result<CanonFetch, String> {
    let alternates = coordinate_alternates(coordinate);
    let quoted = alternates
        .iter()
        .map(|coord| format!("'{}'", escape_cypher_literal(coord)))
        .collect::<Vec<_>>()
        .join(", ");

    // `q_*` keys are node-specific (each coordinate carries its own quaternal
    // register slugs), so collect them dynamically from `keys(n)` rather than
    // pinning a fixed RETURN list. `qm_*` carries provenance. Parallel key/value
    // comprehensions iterate the same `keys(n)` order so index i aligns.
    let node_cypher = format!(
        "MATCH (n:Bimba) WHERE n.coordinate IN [{coords}] \
         RETURN n.coordinate AS coordinate, \
                n.c_1_name AS name, \
                [k IN keys(n) WHERE k STARTS WITH 'q_' AND n[k] IS NOT NULL] AS q_keys, \
                [k IN keys(n) WHERE k STARTS WITH 'q_' AND n[k] IS NOT NULL | toString(n[k])] AS q_vals, \
                [k IN keys(n) WHERE k STARTS WITH 'qm_' AND n[k] IS NOT NULL] AS qm_keys, \
                [k IN keys(n) WHERE k STARTS WITH 'qm_' AND n[k] IS NOT NULL | toString(n[k])] AS qm_vals \
         LIMIT 1",
        coords = quoted,
    );

    // One-hop neighbourhood: distinct adjacent `:Bimba` nodes with their pithy
    // excerpt source (q_5 base, else q_1 base, else name) and the relation types
    // joining them. `ORDER BY` + `LIMIT` keep the result deterministic.
    let neighbour_cypher = format!(
        "MATCH (n:Bimba)-[r]-(m:Bimba) \
         WHERE n.coordinate IN [{coords}] AND m.coordinate IS NOT NULL \
         WITH m, collect(DISTINCT type(r)) AS rels \
         RETURN m.coordinate AS coordinate, \
                m.c_1_name AS name, \
                rels AS relations, \
                [k IN keys(m) WHERE k STARTS WITH 'q_5_' AND m[k] IS NOT NULL | toString(m[k])] AS q5, \
                [k IN keys(m) WHERE k STARTS WITH 'q_1_' AND m[k] IS NOT NULL | toString(m[k])] AS q1 \
         ORDER BY m.coordinate LIMIT 12",
        coords = quoted,
    );

    let fetch = async move {
        let config = Neo4jConfig::from_env();
        let client = Neo4jClient::connect(&config)
            .map_err(|err| format!("Neo4j connect failed: {err}"))?;

        let rows = client
            .run(&node_cypher)
            .await
            .map_err(|err| format!("Neo4j canon node query failed: {err}"))?;
        let node = match rows.first() {
            None => None,
            Some(row) => {
                let coordinate = row
                    .get::<String>("coordinate")
                    .map_err(|err| format!("Neo4j canon row missing coordinate: {err}"))?;
                let registers = build_registers(
                    row.get::<Vec<String>>("q_keys").unwrap_or_default(),
                    row.get::<Vec<String>>("q_vals").unwrap_or_default(),
                );
                let provenance = zip_pairs(
                    row.get::<Vec<String>>("qm_keys").unwrap_or_default(),
                    row.get::<Vec<String>>("qm_vals").unwrap_or_default(),
                );
                Some(CanonNode {
                    coordinate,
                    name: non_empty(row.get::<String>("name").ok()),
                    registers,
                    provenance,
                })
            }
        };

        let neighbours = if want_neighbours && node.is_some() {
            let rows = client
                .run(&neighbour_cypher)
                .await
                .map_err(|err| format!("Neo4j canon neighbour query failed: {err}"))?;
            let mut out = Vec::new();
            for row in &rows {
                let Some(coordinate) = non_empty(row.get::<String>("coordinate").ok()) else {
                    continue;
                };
                let name = non_empty(row.get::<String>("name").ok());
                let mut relations = row.get::<Vec<String>>("relations").unwrap_or_default();
                relations.retain(|rel| !rel.trim().is_empty());
                relations.sort();
                relations.dedup();
                let q5 = row.get::<Vec<String>>("q5").unwrap_or_default();
                let q1 = row.get::<Vec<String>>("q1").unwrap_or_default();
                let source = first_non_empty(&q5)
                    .or_else(|| first_non_empty(&q1))
                    .or_else(|| name.clone())
                    .unwrap_or_default();
                out.push(CanonNeighbour {
                    coordinate,
                    name,
                    relations,
                    excerpt: excerpt(&source, 240),
                });
            }
            out
        } else {
            Vec::new()
        };

        Ok::<CanonFetch, String>(CanonFetch { node, neighbours })
    };

    block_on_graph(fetch)
}

/// Parse a `q_*` key into (position, prime-phase). The register vocabulary is
/// `q_{n}[_i]_{slug}` where `n` is the leading position digit and an `i`
/// segment immediately after it marks the prime (inverted) phase — e.g.
/// `q_5_consequence_...` is position 5 base, `q_5_i_integration_...` is
/// position 5 prime.
fn parse_register_key(key: &str) -> Option<(u8, bool)> {
    let rest = key.strip_prefix("q_")?;
    let mut segments = rest.split('_');
    let head = segments.next()?;
    let digit = head.chars().find(|ch| ch.is_ascii_digit())?;
    let position = digit.to_digit(10)? as u8;
    let prime = segments.next() == Some("i");
    Some((position, prime))
}

fn build_registers(keys: Vec<String>, vals: Vec<String>) -> Vec<QRegister> {
    let mut registers: Vec<QRegister> = keys
        .into_iter()
        .zip(vals)
        .filter(|(_, value)| !value.trim().is_empty())
        .filter_map(|(key, text)| {
            let (position, prime) = parse_register_key(&key)?;
            Some(QRegister {
                key,
                position,
                prime,
                text,
            })
        })
        .collect();
    // Concatenation contract: position ascending, base before prime, key sorted.
    registers.sort_by(|left, right| {
        left.position
            .cmp(&right.position)
            .then(left.prime.cmp(&right.prime))
            .then(left.key.cmp(&right.key))
    });
    registers
}

fn zip_pairs(keys: Vec<String>, vals: Vec<String>) -> Vec<(String, String)> {
    let mut pairs: Vec<(String, String)> = keys
        .into_iter()
        .zip(vals)
        .filter(|(_, value)| !value.trim().is_empty())
        .collect();
    pairs.sort_by(|left, right| left.0.cmp(&right.0));
    pairs
}

fn first_non_empty(values: &[String]) -> Option<String> {
    values
        .iter()
        .find(|value| !value.trim().is_empty())
        .cloned()
}

fn non_empty(value: Option<String>) -> Option<String> {
    value.filter(|text| !text.trim().is_empty())
}

fn excerpt(text: &str, max_chars: usize) -> String {
    let trimmed = text.trim();
    if trimmed.chars().count() <= max_chars {
        return trimmed.to_owned();
    }
    let truncated: String = trimmed.chars().take(max_chars).collect();
    format!("{}…", truncated.trim_end())
}

fn coordinate_alternates(raw: &str) -> Vec<String> {
    let mut alternates = vec![raw.to_owned()];
    if let Some(rest) = raw.strip_prefix('#') {
        alternates.push(format!("M{rest}"));
    }
    alternates.sort();
    alternates.dedup();
    alternates
}

fn escape_cypher_literal(value: &str) -> String {
    value
        .replace('\\', "\\\\")
        .replace('\'', "\\'")
        .replace('\n', "\\n")
        .replace('\r', "\\r")
        .replace('\t', "\\t")
}

/// Drive a graph future to completion whether or not we are already inside a
/// tokio runtime, surfacing runtime-construction failure as a graph error.
fn block_on_graph<F, T>(fut: F) -> Result<T, String>
where
    F: std::future::Future<Output = Result<T, String>>,
{
    if let Ok(handle) = tokio::runtime::Handle::try_current() {
        tokio::task::block_in_place(|| handle.block_on(fut))
    } else {
        match tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
        {
            Ok(runtime) => runtime.block_on(fut),
            Err(err) => Err(format!("tokio runtime unavailable: {err}")),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_base_and_prime_register_keys() {
        assert_eq!(parse_register_key("q_5_consequence"), Some((5, false)));
        assert_eq!(parse_register_key("q_5_i_integration"), Some((5, true)));
        assert_eq!(parse_register_key("q_1_gateway_control_plane"), Some((1, false)));
        assert_eq!(parse_register_key("q_2b_ethical"), Some((2, false)));
        assert_eq!(parse_register_key("qm_5_provenance"), None);
        assert_eq!(parse_register_key("c_1_name"), None);
    }

    #[test]
    fn pithy_order_is_five_then_one_base_then_prime() {
        let registers = vec![
            QRegister { key: "q_1_def".into(), position: 1, prime: false, text: "one".into() },
            QRegister { key: "q_5_int".into(), position: 5, prime: false, text: "five".into() },
            QRegister { key: "q_5_i_ret".into(), position: 5, prime: true, text: "five-prime".into() },
            QRegister { key: "q_3_pat".into(), position: 3, prime: false, text: "three".into() },
        ];
        let pithy = pithy_registers(&registers);
        let order: Vec<&str> = pithy.iter().map(|reg| reg.text.as_str()).collect();
        assert_eq!(order, vec!["five", "five-prime", "one"]);
    }
}
