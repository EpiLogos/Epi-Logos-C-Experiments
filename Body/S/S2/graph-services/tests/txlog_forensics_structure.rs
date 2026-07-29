//! Track 54 T54.02b — restore the coordinate nodes the dataset replay never
//! reproduced, together with their edges.
//!
//! The base restore brought back the M-branch well (996/996 Map coordinates)
//! but reproduced only the TOP-LEVEL S and L coordinates: live carries
//! `S0..S5` + primes and `L0..L5` + primes, twelve each, and nothing below
//! them. The whole `S0-0 … S5-5` and `L0-0 … L5-5` sub-lattice — with every
//! prime — was lost, and nothing currently reads it, so no test went red.
//!
//! Nodes are emitted with `MERGE` on coordinate so a re-run is idempotent, and
//! edges only where BOTH endpoints resolve to a coordinate: an edge to an
//! unresolvable endpoint is reported, never invented.

#![cfg(feature = "txlog-forensics")]

use std::collections::{BTreeMap, BTreeSet};
use std::fmt::Write as _;
use std::path::PathBuf;

use epi_s2_graph_services::txlog_forensics::replay::{
    cypher_literal, find_mass_delete, replay_until,
};
use epi_s2_graph_services::txlog_forensics::TxLogDecoder;

fn log_path() -> PathBuf {
    if let Ok(p) = std::env::var("EPI_TXLOG_FORENSIC_PATH") {
        return PathBuf::from(p);
    }
    PathBuf::from(std::env::var("HOME").expect("HOME"))
        .join("bimba-forensic/work/transactions/neo4j/neostore.transaction.db.0")
}

fn quote(s: &str) -> String {
    let mut out = String::from("'");
    for c in s.chars() {
        match c {
            '\'' => out.push_str("\\'"),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            _ => out.push(c),
        }
    }
    out.push('\'');
    out
}

/// A label is only safe to interpolate if it is a plain identifier.
fn safe_label(l: &str) -> bool {
    !l.is_empty()
        && l.chars().next().map(|c| c.is_ascii_alphabetic()).unwrap_or(false)
        && l.chars().all(|c| c.is_ascii_alphanumeric() || c == '_')
}

fn safe_rel_type(t: &str) -> bool {
    safe_label(t)
}

#[test]
#[ignore = "writes structure-recovery artifacts; run explicitly"]
fn emit_missing_coordinate_nodes_and_edges() {
    let decoder = TxLogDecoder::open(&log_path()).expect("header");
    let (delete_tx, _) = find_mass_delete(&decoder).expect("decode").expect("delete tx");
    let (store, tokens, _) = replay_until(&decoder, delete_tx).expect("replay");

    let nodes = store.coordinate_nodes(&tokens);
    let id_to_coord = store.node_coordinates(&tokens);

    // Coordinates present in the live graph.
    let live_path = std::env::var("EPI_LIVE_PROPS").expect("EPI_LIVE_PROPS");
    let live_text = std::fs::read_to_string(&live_path).expect("read live inventory");
    let live: BTreeSet<String> = live_text
        .lines()
        .filter_map(|l| l.split_once('\t'))
        .map(|(c, _)| c.trim().to_string())
        .collect();

    let missing: Vec<_> =
        nodes.iter().filter(|n| n.coordinate().map(|c| !live.contains(c)).unwrap_or(false)).collect();
    let missing_coords: BTreeSet<&str> = missing.iter().filter_map(|n| n.coordinate()).collect();
    println!("live coordinates: {}", live.len());
    println!("coordinates to restore: {}", missing_coords.len());

    let mut cypher = String::new();
    writeln!(cypher, "// Coordinate nodes the dataset replay never reproduced, recovered from").unwrap();
    writeln!(cypher, "// the transaction log (state immediately before tx {delete_tx}, the mass delete).").unwrap();
    writeln!(cypher, "// MERGE on coordinate: re-running this is idempotent.\n").unwrap();

    let mut label_counts: BTreeMap<String, usize> = BTreeMap::new();
    let mut unsafe_labels: BTreeSet<String> = BTreeSet::new();
    let mut dropped_test_labels: BTreeSet<String> = BTreeSet::new();
    let mut without_bimba: Vec<String> = Vec::new();
    let mut unlabelled: Vec<String> = Vec::new();
    let mut node_props = 0usize;

    for node in &missing {
        let Some(coord) = node.coordinate() else { continue };
        if !node.labels.iter().any(|l| l == "Bimba") {
            without_bimba.push(coord.to_string());
        }
        // `test_*` labels are pollution left by test runs on real nodes. The
        // nodes are genuine and get restored; the labels do not come back.
        let labels: Vec<&String> = node
            .labels
            .iter()
            .filter(|l| {
                if l.starts_with("test_") {
                    dropped_test_labels.insert((*l).clone());
                    return false;
                }
                l.as_str() != "Bimba"
            })
            .collect();
        for l in &node.labels {
            *label_counts.entry((*l).clone()).or_default() += 1;
            if !safe_label(l) {
                unsafe_labels.insert((*l).clone());
            }
        }
        let mut assignments = Vec::new();
        for (name, (value, _)) in &node.properties {
            if name == "coordinate" {
                continue;
            }
            if let Some(lit) = cypher_literal(value) {
                assignments.push(format!("  `{name}`: {lit}"));
                node_props += 1;
            }
        }
        // MERGE on the node's OWN primary label. The L sub-lattice never
        // carried `:Bimba` — it is `Coordinate`/`MEFLens`/`MEFSubLens` — and
        // stamping `:Bimba` onto it would inject 43 nodes into the canonical
        // namespace that were never in it, and that the wipe's own
        // `MATCH (n:Bimba)` would then sweep.
        let primary = if node.labels.iter().any(|l| l == "Bimba") {
            "Bimba".to_string()
        } else {
            match labels.iter().find(|l| safe_label(l)) {
                Some(l) => (*l).clone(),
                None => {
                    unlabelled.push(coord.to_string());
                    continue;
                }
            }
        };
        let extra: String = labels
            .iter()
            .filter(|l| safe_label(l) && l.as_str() != primary.as_str())
            .map(|l| format!(":{l}"))
            .collect::<Vec<_>>()
            .join("");
        writeln!(cypher, "MERGE (n:{primary} {{coordinate: {}}})", quote(coord)).unwrap();
        if !extra.is_empty() {
            writeln!(cypher, "  SET n{extra}").unwrap();
        }
        if assignments.is_empty() {
            writeln!(cypher, ";").unwrap();
        } else {
            writeln!(cypher, "  SET n += {{\n{}\n}};", assignments.join(",\n")).unwrap();
        }
    }

    // ---- edges ----
    let rels = store.relationships(&tokens);
    println!("relationships at stop point: {}", rels.len());

    let mut edge_cypher = String::new();
    let mut edges_emitted = 0usize;
    let mut edges_unresolvable = 0usize;
    let mut edge_types: BTreeMap<String, usize> = BTreeMap::new();
    let mut seen_edges: BTreeSet<(String, String, String)> = BTreeSet::new();

    for rel in &rels {
        let (Some(a), Some(b)) =
            (id_to_coord.get(&rel.start_node), id_to_coord.get(&rel.end_node))
        else {
            edges_unresolvable += 1;
            continue;
        };
        // Only edges that touch a coordinate being restored.
        if !missing_coords.contains(a.as_str()) && !missing_coords.contains(b.as_str()) {
            continue;
        }
        if !safe_rel_type(&rel.type_name) {
            edges_unresolvable += 1;
            continue;
        }
        let key = (a.clone(), rel.type_name.clone(), b.clone());
        if !seen_edges.insert(key) {
            continue;
        }
        *edge_types.entry(rel.type_name.clone()).or_default() += 1;

        let props: Vec<String> = rel
            .properties
            .iter()
            .filter_map(|(k, (v, _))| cypher_literal(v).map(|l| format!("  `{k}`: {l}")))
            .collect();
        writeln!(
            edge_cypher,
            "MATCH (a {{coordinate: {}}}), (b {{coordinate: {}}})",
            quote(a),
            quote(b)
        )
        .unwrap();
        if props.is_empty() {
            writeln!(edge_cypher, "MERGE (a)-[:`{}`]->(b);", rel.type_name).unwrap();
        } else {
            writeln!(
                edge_cypher,
                "MERGE (a)-[r:`{}`]->(b) SET r += {{\n{}\n}};",
                rel.type_name,
                props.join(",\n")
            )
            .unwrap();
        }
        edges_emitted += 1;
    }

    let out_dir = PathBuf::from(std::env::var("EPI_RECOVERY_OUT").unwrap_or_else(|_| {
        std::env::temp_dir().join("epi-recovery").to_string_lossy().into_owned()
    }));
    std::fs::create_dir_all(&out_dir).expect("mkdir");
    let node_path = out_dir.join("recovered-missing-coordinate-nodes.cypher");
    let edge_path = out_dir.join("recovered-missing-coordinate-edges.cypher");
    std::fs::write(&node_path, cypher).expect("write nodes");
    std::fs::write(&edge_path, edge_cypher).expect("write edges");

    println!("wrote {} ({} nodes, {node_props} properties)", node_path.display(), missing_coords.len());
    println!("wrote {} ({edges_emitted} edges)", edge_path.display());
    println!("edges with an unresolvable endpoint or unsafe type (reported, not invented): {edges_unresolvable}");
    println!("labels on restored nodes: {label_counts:?}");
    println!("test_* labels dropped (pollution, not restored): {dropped_test_labels:?}");
    println!("skipped for having no usable label ({}): {:?}", unlabelled.len(), unlabelled);
    println!("restored coordinates that did NOT carry :Bimba ({}): {:?}", without_bimba.len(), without_bimba);
    if !unsafe_labels.is_empty() {
        println!("labels NOT applied because they are not plain identifiers: {unsafe_labels:?}");
    }
    let mut types: Vec<_> = edge_types.into_iter().collect();
    types.sort_by_key(|(_, n)| std::cmp::Reverse(*n));
    println!("edge types (top 15): {:?}", &types[..types.len().min(15)]);

    assert!(missing_coords.len() > 100, "expected the lost sub-lattice");
    assert!(edges_emitted > 0, "restored nodes must not be left orphaned");
}
