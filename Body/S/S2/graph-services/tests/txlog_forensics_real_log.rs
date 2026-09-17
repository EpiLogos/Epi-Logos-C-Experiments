//! Track 54 T54.01 — behavioural proof of the transaction-log decoder against
//! the real 118 MB forensic log captured after the 2026-07-28 wipe.
//!
//! These tests are `#[ignore]`d because they need the forensic archive, which
//! is deliberately not in the repository (60 MB, and it is evidence). Run them
//! explicitly:
//!
//! ```text
//! cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml \
//!   --features txlog-forensics --test txlog_forensics_real_log -- --ignored --nocapture
//! ```
//!
//! The expected counts are NOT this decoder's own output blessed as truth: they
//! were produced independently by Neo4j 5.26.21's own `LogEntryReader` (see
//! `~/bimba-forensic/work/oracle/DumpTxLog.java`). Two decoders written from
//! different sides agreeing on 854,078 entries and every per-type count is what
//! makes the framing trustworthy — a misparse anywhere desynchronises the
//! stream and the counts diverge immediately.

#![cfg(feature = "txlog-forensics")]

use std::collections::BTreeMap;
use std::path::PathBuf;

use epi_s2_graph_services::txlog_forensics::{
    decode_property_record, Command, TxLogDecoder,
};

fn log_path() -> PathBuf {
    if let Ok(p) = std::env::var("EPI_TXLOG_FORENSIC_PATH") {
        return PathBuf::from(p);
    }
    let home = std::env::var("HOME").expect("HOME must be set");
    PathBuf::from(home)
        .join("bimba-forensic/work/transactions/neo4j/neostore.transaction.db.0")
}

fn open() -> TxLogDecoder {
    let path = log_path();
    assert!(
        path.exists(),
        "forensic transaction log not found at {}. Extract it with:\n  \
         mkdir -p ~/bimba-forensic/work && tar xzf \
         ~/bimba-forensic/neo4j-data-forensic-20260728.tar.gz -C ~/bimba-forensic/work \
         ./transactions/neo4j/neostore.transaction.db.0",
        path.display()
    );
    TxLogDecoder::open(&path).expect("log header must parse")
}

/// Counts produced independently by Neo4j's own `LogEntryReader`.
fn oracle_command_census() -> BTreeMap<&'static str, u64> {
    BTreeMap::from([
        ("GroupDegreeCommand", 1_206),
        ("LabelTokenCommand", 463),
        ("NodeCommand", 75_228),
        ("NodeCountsCommand", 19_930),
        ("PropertyCommand", 311_295),
        ("PropertyKeyTokenCommand", 5_930),
        ("RelationshipCommand", 101_699),
        ("RelationshipCountsCommand", 213_367),
        ("RelationshipGroupCommand", 2_699),
        ("RelationshipTypeTokenCommand", 1_421),
        ("SchemaRuleCommand", 460),
    ])
}

#[test]
#[ignore = "needs the forensic archive at ~/bimba-forensic"]
fn header_matches_the_forensic_store() {
    let decoder = open();
    let header = decoder.header();
    assert_eq!(header.format_version, 9, "log format V9");
    assert_eq!(header.log_version, 0, "never rotated: this is version .0");
    assert_eq!(header.last_append_index, 1, "covers from database birth");
    assert_eq!(header.storage_engine, "record");
    assert_eq!(header.format_name, "aligned");
    // 2026-03-07, the database's creation time.
    assert_eq!(header.store_creation_time, 1_772_886_897_263);
}

#[test]
#[ignore = "needs the forensic archive at ~/bimba-forensic"]
fn census_over_the_real_log_matches_neo4js_own_reader() {
    let decoder = open();
    let (census, tokens) = decoder.census().expect("full log must decode");

    println!("entries_read              = {}", census.entries_read);
    println!("transaction_starts        = {}", census.transaction_starts);
    println!("transaction_commits       = {}", census.transaction_commits);
    println!("first_tx_id               = {:?}", census.first_tx_id);
    println!("last_tx_id                = {:?}", census.last_tx_id);
    println!("last_commit_time_written  = {:?}", census.last_commit_time_written);
    println!("refused_trailing_commands = {}", census.refused_trailing_commands);
    println!("stopped_because           = {:?}", census.stopped_because);
    println!("entry_census              = {:?}", census.entry_census);
    println!("command_census            = {:?}", census.command_census);
    println!(
        "tokens: property_keys={} labels={} rel_types={}",
        tokens.property_keys.len(),
        tokens.labels.len(),
        tokens.relationship_types.len()
    );

    assert_eq!(census.entries_read, 854_078, "total log entries");
    assert_eq!(census.transaction_starts, 60_190);
    assert_eq!(census.transaction_commits, 60_190);
    assert_eq!(census.first_tx_id, Some(2));
    assert_eq!(census.last_tx_id, Some(60_191));
    assert_eq!(census.last_commit_time_written, Some(1_785_264_269_094));

    let expected = oracle_command_census();
    let actual: BTreeMap<&str, u64> =
        census.command_census.iter().map(|(k, v)| (k.as_str(), *v)).collect();
    assert_eq!(actual, expected, "per-command-type census must match the oracle exactly");

    // Token decoder ring harvested from the log itself.
    assert_eq!(tokens.property_keys.len(), 5_930);
    assert_eq!(tokens.labels.len(), 463);
    assert_eq!(tokens.relationship_types.len(), 1_421);
}

#[test]
#[ignore = "needs the forensic archive at ~/bimba-forensic"]
fn trailing_transaction_is_identified_and_refused_not_half_applied() {
    let decoder = open();
    let mut last_committed = None;
    let (census, _) = decoder
        .decode(|tx, _| {
            last_committed = Some(tx.tx_id);
        })
        .expect("full log must decode");

    // Every emitted transaction is a committed one, and the last TX_COMMIT is
    // identified rather than inferred.
    assert_eq!(last_committed, census.last_tx_id, "last emitted tx == last TX_COMMIT");
    assert_eq!(
        census.refused_trailing_commands, 0,
        "this log has no torn tail; if it ever did, the commands would be refused, not applied"
    );
    assert_eq!(
        census.stopped_because.as_deref(),
        Some("zero-filled tail"),
        "decode stops at the pre-allocated tail, not on a parse error"
    );
}

#[test]
#[ignore = "needs the forensic archive at ~/bimba-forensic"]
fn destroyed_q_register_prose_round_trips_verbatim() {
    let decoder = open();

    let mut found: Option<(i64, String)> = None;
    let mut coordinate_short_strings = 0usize;

    decoder
        .decode(|tx, tokens| {
            for command in &tx.commands {
                let Command::Property { before, after } = command else { continue };
                for record in [before, after] {
                    let Ok(props) = decode_property_record(record) else { continue };
                    for prop in props {
                        let key = tokens
                            .property_keys
                            .get(&(prop.key_id as i32))
                            .map(String::as_str)
                            .unwrap_or("");
                        if key == "coordinate" {
                            if let Some(text) = prop.value.as_text() {
                                if !text.is_empty() {
                                    coordinate_short_strings += 1;
                                }
                            }
                        }
                        if key == "q_2b_ethical_interiorisation" && found.is_none() {
                            if let Some(text) = prop.value.as_text() {
                                found = Some((tx.tx_id, text.to_string()));
                            }
                        }
                    }
                }
            }
        })
        .expect("full log must decode");

    let (tx_id, text) = found.expect(
        "M2-3.q_2b_ethical_interiorisation must be recoverable from the log's before-images",
    );
    println!("recovered from tx {tx_id}, {} bytes", text.len());
    println!("{}", &text[..text.len().min(400)]);

    assert!(text.contains("Picatrix"), "destroyed prose must decode verbatim");
    assert!(text.contains("Ficino"), "destroyed prose must decode verbatim");
    assert!(
        text.contains("ethical interiorisation"),
        "the value must be the real q-register prose, not a fragment"
    );

    // Gotcha 4 in the track brief: short strings are inlined into the property
    // block, so a decoder that only reads the dynamic spill loses nearly every
    // coordinate. Prove the inline path actually fires.
    println!("coordinate values decoded: {coordinate_short_strings}");
    assert!(
        coordinate_short_strings > 1_000,
        "inline short-string decoding must recover coordinates, got {coordinate_short_strings}"
    );
}
