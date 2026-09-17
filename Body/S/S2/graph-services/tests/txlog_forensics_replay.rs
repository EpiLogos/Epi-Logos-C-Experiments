//! Track 54 T54.02 — reconstruct the pre-wipe property state and emit the delta.
//!
//! Structure is NOT reconstructed here: the base restore already brought nodes
//! and relationships back. What the restore could not bring back is any property
//! with no repo-side source — the dataset replay only restores the generator's
//! `registeredTargets` allowlist, so a `q_*` register curated straight into the
//! graph had nowhere to come from. Those are what this recovers.
//!
//! Run:
//! ```text
//! cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml \
//!   --features txlog-forensics --test txlog_forensics_replay -- --ignored --nocapture
//! ```

#![cfg(feature = "txlog-forensics")]

use std::collections::BTreeMap;
use std::path::PathBuf;

use epi_s2_graph_services::txlog_forensics::replay::{
    find_mass_delete, replay_until, ReplayStore,
};
use epi_s2_graph_services::txlog_forensics::TxLogDecoder;

fn log_path() -> PathBuf {
    if let Ok(p) = std::env::var("EPI_TXLOG_FORENSIC_PATH") {
        return PathBuf::from(p);
    }
    PathBuf::from(std::env::var("HOME").expect("HOME"))
        .join("bimba-forensic/work/transactions/neo4j/neostore.transaction.db.0")
}

fn open() -> TxLogDecoder {
    let path = log_path();
    assert!(path.exists(), "forensic log not found at {}", path.display());
    TxLogDecoder::open(&path).expect("header parses")
}

#[test]
#[ignore = "needs the forensic archive at ~/bimba-forensic"]
fn the_mass_delete_transaction_is_identifiable_by_its_size() {
    let decoder = open();
    let found = find_mass_delete(&decoder).expect("decode").expect("a delete tx exists");
    println!("largest node-deleting tx: {} with {} node deletions", found.0, found.1);

    // The wipe removed the whole :Bimba namespace in one transaction. Anything
    // in the hundreds-to-thousands is the outlier we are looking for; ordinary
    // curation transactions delete a handful of nodes at most.
    assert!(
        found.1 > 500,
        "expected a mass delete, found only {} deletions in tx {}",
        found.1,
        found.0
    );
}

#[test]
#[ignore = "needs the forensic archive at ~/bimba-forensic"]
fn pre_wipe_property_state_is_recovered_and_is_richer_than_the_restore() {
    let decoder = open();
    let (delete_tx, deletions) =
        find_mass_delete(&decoder).expect("decode").expect("delete tx");
    println!("stopping before tx {delete_tx} ({deletions} node deletions)");

    let (store, tokens, stats) = replay_until(&decoder, delete_tx).expect("replay");
    println!(
        "applied {} transactions; {} nodes in use; {} property records in use",
        stats.transactions_applied, stats.nodes_in_use, stats.property_records_in_use
    );

    let nodes = store.coordinate_nodes(&tokens);
    println!("nodes carrying a coordinate: {}", nodes.len());

    let mut by_coordinate: BTreeMap<&str, usize> = BTreeMap::new();
    let mut q_registers = 0usize;
    let mut total_props = 0usize;
    for node in &nodes {
        if let Some(c) = node.coordinate() {
            by_coordinate.insert(c, node.properties.len());
        }
        for key in node.properties.keys() {
            total_props += 1;
            if key.starts_with("q_") || key.starts_with("qm_") {
                q_registers += 1;
            }
        }
    }
    println!(
        "distinct coordinates: {}, total properties: {}, q_/qm_ properties: {}",
        by_coordinate.len(),
        total_props,
        q_registers
    );

    // The live graph after the base restore carries 374 q/qm properties across
    // 66 nodes. The log must beat that decisively or the recovery is pointless.
    assert!(
        by_coordinate.len() > 900,
        "expected the full coordinate space, got {}",
        by_coordinate.len()
    );
    assert!(
        q_registers > 374,
        "recovery must exceed the {} q/qm properties the restore left live, got {}",
        374,
        q_registers
    );

    // S3 is the concrete regression: cli_canon_coord_depth_ladder fails today
    // because the live S3 node has zero q_ registers.
    let s3 = nodes
        .iter()
        .find(|n| n.coordinate() == Some("S3"))
        .expect("S3 must be recoverable from the log");
    let s3_q: Vec<&String> =
        s3.properties.keys().filter(|k| k.starts_with("q_")).collect();
    println!("S3 recovered q_ registers ({}): {:?}", s3_q.len(), s3_q);
    assert!(!s3_q.is_empty(), "S3 must come back with its q_ registers");
}

/// Emit the reviewable artifacts: the delta Cypher and its JSON audit.
///
/// `EPI_LIVE_PROPS` points at a TSV of `coordinate<TAB>propertyKey` for the
/// CURRENT graph, produced by:
/// `MATCH (n:Bimba) WHERE n.coordinate IS NOT NULL UNWIND keys(n) AS k RETURN n.coordinate, k`
#[test]
#[ignore = "writes recovery artifacts; run explicitly"]
fn emit_recovered_property_delta() {
    let decoder = open();
    let (delete_tx, _) = find_mass_delete(&decoder).expect("decode").expect("delete tx");
    let (store, tokens, _) = replay_until(&decoder, delete_tx).expect("replay");
    let nodes = store.coordinate_nodes(&tokens);

    let live = load_live_inventory();
    println!("live coordinates: {}", live.len());

    let out_dir = PathBuf::from(std::env::var("EPI_RECOVERY_OUT").unwrap_or_else(|_| {
        std::env::temp_dir().join("epi-recovery").to_string_lossy().into_owned()
    }));
    std::fs::create_dir_all(&out_dir).expect("create output dir");
    write_artifacts(&store, &nodes, &out_dir, delete_tx, &live);
}

/// coordinate -> property keys currently present on the live node.
fn load_live_inventory() -> BTreeMap<String, std::collections::BTreeSet<String>> {
    // With no inventory the delta degenerates to the full recovered set, which
    // still exercises emission end to end. The real delta run passes the file.
    let Ok(path) = std::env::var("EPI_LIVE_PROPS") else {
        println!("EPI_LIVE_PROPS unset — emitting the full recovered set, not a delta");
        return BTreeMap::new();
    };
    let text = std::fs::read_to_string(&path).expect("read live inventory");
    let mut out: BTreeMap<String, std::collections::BTreeSet<String>> = BTreeMap::new();
    for line in text.lines() {
        let Some((coord, key)) = line.split_once('\t') else { continue };
        let coord = coord.trim();
        let key = key.trim();
        if coord.is_empty() || key.is_empty() {
            continue;
        }
        out.entry(coord.to_string()).or_default().insert(key.to_string());
    }
    out
}

fn write_artifacts(
    _store: &ReplayStore,
    nodes: &[epi_s2_graph_services::txlog_forensics::replay::NodeState],
    out_dir: &std::path::Path,
    delete_tx: i64,
    live: &BTreeMap<String, std::collections::BTreeSet<String>>,
) {
    use epi_s2_graph_services::txlog_forensics::replay::cypher_literal;
    use std::fmt::Write as _;

    let mut cypher = String::new();
    let mut audit = String::from("[\n");
    let mut emitted = 0usize;
    let mut skipped = 0usize;
    let mut already_live = 0usize;
    let mut no_live_node = 0usize;
    let mut coords_touched = 0usize;
    let mut first = true;

    writeln!(cypher, "// Recovered Bimba property state from the transaction log.").unwrap();
    writeln!(
        cypher,
        "// Replayed forward and stopped immediately before tx {delete_tx} (the mass delete)."
    )
    .unwrap();
    writeln!(
        cypher,
        "// Properties only: nodes and relationships were already restored. Additive `SET n +=`,"
    )
    .unwrap();
    writeln!(cypher, "// so nothing already live is overwritten by a stale value.\n").unwrap();

    for node in nodes {
        let Some(coordinate) = node.coordinate() else { continue };
        // Only coordinates that exist live can be SET. Structure is not this
        // tranche's job, so a recovered coordinate with no live node is
        // reported, never invented.
        let empty = std::collections::BTreeSet::new();
        let live_keys = match live.get(coordinate) {
            Some(keys) => keys,
            None if live.is_empty() => &empty,
            None => {
                no_live_node += 1;
                continue;
            }
        };
        let mut assignments = Vec::new();
        for (name, (value, tx)) in &node.properties {
            if name == "coordinate" {
                continue;
            }
            // Additive only: never overwrite a value the live graph already has.
            if live_keys.contains(name.as_str()) {
                already_live += 1;
                continue;
            }
            match cypher_literal(value) {
                Some(literal) => {
                    assignments.push(format!("  `{name}`: {literal}"));
                    if !first {
                        audit.push_str(",\n");
                    }
                    first = false;
                    let _ = write!(
                        audit,
                        "  {{\"coordinate\": {}, \"property\": {}, \"tx\": {}}}",
                        json_str(coordinate),
                        json_str(name),
                        tx
                    );
                    emitted += 1;
                }
                None => skipped += 1,
            }
        }
        if assignments.is_empty() {
            continue;
        }
        coords_touched += 1;
        writeln!(
            cypher,
            "MATCH (n:Bimba {{coordinate: {}}}) SET n += {{\n{}\n}};",
            cypher_string_for(coordinate),
            assignments.join(",\n")
        )
        .unwrap();
    }
    audit.push_str("\n]\n");

    let cypher_path = out_dir.join("recovered-bimba-properties.cypher");
    let audit_path = out_dir.join("recovered-bimba-properties.audit.json");
    std::fs::write(&cypher_path, cypher).expect("write cypher");
    std::fs::write(&audit_path, audit).expect("write audit");

    println!("wrote {} ({emitted} property assignments over {coords_touched} coordinates)", cypher_path.display());
    println!("wrote {}", audit_path.display());
    println!("already present live (left alone): {already_live}");
    println!("recovered coordinates with no live node (reported, not created): {no_live_node}");
    println!("skipped (undecoded TEMPORAL/GEOMETRY, never guessed): {skipped}");
    assert!(emitted > 1_000, "expected a substantial delta, got {emitted}");
}

fn cypher_string_for(s: &str) -> String {
    format!("'{}'", s.replace('\\', "\\\\").replace('\'', "\\'"))
}

fn json_str(s: &str) -> String {
    let mut out = String::from("\"");
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            c if (c as u32) < 0x20 => out.push_str(&format!("\\u{:04x}", c as u32)),
            c => out.push(c),
        }
    }
    out.push('"');
    out
}
