#![cfg(feature = "txlog-forensics")]
//! Audits edges at the stop point by how many endpoints resolve to a coordinate.
use std::collections::BTreeMap;
use std::path::PathBuf;
use epi_s2_graph_services::txlog_forensics::replay::{find_mass_delete, replay_until};
use epi_s2_graph_services::txlog_forensics::TxLogDecoder;

#[test]
#[ignore]
fn audit() {
    let p = PathBuf::from(std::env::var("HOME").unwrap())
        .join("bimba-forensic/work/transactions/neo4j/neostore.transaction.db.0");
    let d = TxLogDecoder::open(&p).unwrap();
    let (tx, _) = find_mass_delete(&d).unwrap().unwrap();
    let (store, tokens, _) = replay_until(&d, tx).unwrap();
    let coords = store.node_coordinates(&tokens);
    let rels = store.relationships(&tokens);

    let (mut both, mut one, mut neither) = (0usize, 0usize, 0usize);
    let mut one_sided_types: BTreeMap<String, usize> = BTreeMap::new();
    let mut samples: Vec<String> = Vec::new();

    for r in &rels {
        let a = coords.get(&r.start_node);
        let b = coords.get(&r.end_node);
        match (a, b) {
            (Some(_), Some(_)) => both += 1,
            (Some(c), None) | (None, Some(c)) => {
                one += 1;
                *one_sided_types.entry(r.type_name.clone()).or_default() += 1;
                if samples.len() < 10 {
                    samples.push(format!("{} <-> coordinate {}", r.type_name, c));
                }
            }
            (None, None) => neither += 1,
        }
    }
    println!("edges total: {}", rels.len());
    println!("both endpoints are coordinates : {both}");
    println!("EXACTLY ONE endpoint is a coordinate : {one}");
    println!("neither endpoint is a coordinate : {neither}");
    let mut t: Vec<_> = one_sided_types.into_iter().collect();
    t.sort_by_key(|(_, n)| std::cmp::Reverse(*n));
    println!("one-sided edge types: {:?}", &t[..t.len().min(20)]);
    for s in &samples { println!("  sample: {s}"); }
}
