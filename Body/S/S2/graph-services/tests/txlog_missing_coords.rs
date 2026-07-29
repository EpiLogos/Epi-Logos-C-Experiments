#![cfg(feature = "txlog-forensics")]
//! Lists recovered coordinates that had no live node, so the gap is itemised
//! rather than asserted.
use std::collections::BTreeSet;
use std::path::PathBuf;
use epi_s2_graph_services::txlog_forensics::replay::{find_mass_delete, replay_until};
use epi_s2_graph_services::txlog_forensics::TxLogDecoder;

#[test]
#[ignore = "needs the forensic archive extracted to ~/bimba-forensic/work plus EPI_LIVE_PROPS pointing at a live-property dump; the 60 MB archive is evidence and is deliberately not in the repo"]
fn list_recovered_coordinates_absent_from_live() {
    let p = PathBuf::from(std::env::var("HOME").unwrap())
        .join("bimba-forensic/work/transactions/neo4j/neostore.transaction.db.0");
    let d = TxLogDecoder::open(&p).unwrap();
    let (tx, _) = find_mass_delete(&d).unwrap().unwrap();
    let (store, tokens, _) = replay_until(&d, tx).unwrap();
    let nodes = store.coordinate_nodes(&tokens);

    let live_path = std::env::var("EPI_LIVE_PROPS").expect("EPI_LIVE_PROPS");
    let text = std::fs::read_to_string(&live_path).unwrap();
    let live: BTreeSet<String> = text
        .lines()
        .filter_map(|l| l.split_once('\t'))
        .map(|(c, _)| c.trim().to_string())
        .collect();

    let mut missing: Vec<(String, usize, Vec<String>)> = Vec::new();
    for n in &nodes {
        if let Some(c) = n.coordinate() {
            if !live.contains(c) {
                missing.push((c.to_string(), n.properties.len(), n.labels.clone()));
            }
        }
    }
    missing.sort();
    println!("live coordinates: {}", live.len());
    println!("recovered coordinates absent from live: {}", missing.len());
    for (c, n, labels) in &missing {
        println!("MISSING\t{c}\t{n} props\t{labels:?}");
    }
}
