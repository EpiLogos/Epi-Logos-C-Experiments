//! Neo4j 5.26 transaction-log decoder (Track 54 — Bimba graph enrichment recovery).
//!
//! On 2026-07-28 a test ran `MATCH (n:Bimba) DETACH DELETE n` against the live
//! development graph. The store pages were reclaimed, so the deleted content is
//! gone from the store files — but Neo4j's transaction log records *both* the
//! before- and after-image of every changed record, and this log was never
//! rotated. The before-images are therefore the only surviving copy of the
//! destroyed nodes, properties and relationships.
//!
//! This module walks `neostore.transaction.db.0` and emits a typed command
//! stream. It is deliberately strict: an unknown command type, property type,
//! or short-string encoding is an **error**, never a skipped record. A decoder
//! that silently drops what it does not understand would produce a plausible,
//! quietly incomplete recovery — the failure mode this track exists to avoid.
//!
//! Wire formats are transcribed from Neo4j 5.26.21's own serializers, read out
//! of the shipped jar (`LogCommandSerializationV5_0`, `V4_2`, `V4_3_D3`), and
//! the SHORT_STRING codec tables are extracted from
//! `org.neo4j.internal.codec.ShortStringCodec` rather than reproduced by hand.
//!
//! Coordinate: S2 (GraphDB substrate). Feature-gated (`txlog-forensics`) because
//! this is recovery tooling over a stopped store, not a serving path.

pub mod codec_tables;
pub mod cursor;
pub mod record;
pub mod value;

use std::collections::BTreeMap;
use std::fmt;
use std::path::Path;

use cursor::{Cursor, CursorError};
use record::{
    read_node_record, read_property_record, read_relationship_group_record,
    read_relationship_record, read_schema_record, read_token_record, NodeRecord, PropertyRecord,
    RelationshipGroupRecord, RelationshipRecord, SchemaRecord, TokenRecord,
};
use value::{concat_chain, decode_block, DecodedProperty};

/// `LogEntryTypeCodes`
pub const TX_START: u8 = 1;
pub const COMMAND: u8 = 3;
pub const TX_COMMIT: u8 = 5;
pub const LEGACY_CHECK_POINT: u8 = 7;
pub const DETACHED_CHECK_POINT: u8 = 8;
pub const DETACHED_CHECK_POINT_V5_0: u8 = 9;
pub const CHUNK_START: u8 = 10;
pub const CHUNK_END: u8 = 11;
pub const TX_ROLLBACK: u8 = 12;

/// The header is 128 bytes for `LogFormat.V9`.
pub const LOG_HEADER_SIZE_V9: usize = 128;

#[derive(Debug)]
pub enum DecodeError {
    Cursor(CursorError),
    Value(value::ValueError),
    UnknownCommandType { type_code: u8, offset: usize },
    UnknownEntryType { type_code: u8, offset: usize },
    UnsupportedLogFormat { format: u8 },
    Io(std::io::Error),
}

impl fmt::Display for DecodeError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Cursor(e) => write!(f, "{e}"),
            Self::Value(e) => write!(f, "{e}"),
            Self::UnknownCommandType { type_code, offset } => {
                write!(f, "unknown command type {type_code} at offset {offset}")
            }
            Self::UnknownEntryType { type_code, offset } => {
                write!(f, "unknown log entry type {type_code} at offset {offset}")
            }
            Self::UnsupportedLogFormat { format } => {
                write!(f, "unsupported log format version {format} (this decoder handles V9)")
            }
            Self::Io(e) => write!(f, "io error: {e}"),
        }
    }
}

impl std::error::Error for DecodeError {}

impl From<CursorError> for DecodeError {
    fn from(e: CursorError) -> Self {
        Self::Cursor(e)
    }
}

impl From<value::ValueError> for DecodeError {
    fn from(e: value::ValueError) -> Self {
        Self::Value(e)
    }
}

// ---------------------------------------------------------------------------
// header
// ---------------------------------------------------------------------------

#[derive(Debug, Clone)]
pub struct LogHeader {
    pub format_version: u8,
    pub log_version: u64,
    pub last_append_index: i64,
    pub store_creation_time: i64,
    pub store_random: i64,
    pub storage_engine: String,
    pub format_name: String,
    pub start_offset: usize,
}

pub fn parse_header(data: &[u8]) -> Result<LogHeader, DecodeError> {
    let mut c = Cursor::new(data);
    // The first long packs the format version into the high byte (big-endian
    // here — this field predates the little-endian switch and is written with
    // `putLong` on a big-endian header buffer).
    let encoded = c.bytes(8)?;
    let encoded = u64::from_be_bytes([
        encoded[0], encoded[1], encoded[2], encoded[3], encoded[4], encoded[5], encoded[6],
        encoded[7],
    ]);
    let format_version = (encoded >> 56) as u8;
    let log_version = encoded & 0x00FF_FFFF_FFFF_FFFF;
    if format_version != 9 {
        return Err(DecodeError::UnsupportedLogFormat { format: format_version });
    }
    let last_append_index = i64::from_be_bytes(c.bytes(8)?.try_into().unwrap());
    let _reserved = c.bytes(8)?;
    // StoreId: version byte, creationTime, random, two short strings, major, minor.
    let _store_id_version = c.u8()?;
    let store_creation_time = i64::from_be_bytes(c.bytes(8)?.try_into().unwrap());
    let store_random = i64::from_be_bytes(c.bytes(8)?.try_into().unwrap());
    let engine_len = c.u8()? as usize;
    let storage_engine = String::from_utf8_lossy(c.bytes(engine_len)?).into_owned();
    let format_len = c.u8()? as usize;
    let format_name = String::from_utf8_lossy(c.bytes(format_len)?).into_owned();

    Ok(LogHeader {
        format_version,
        log_version,
        last_append_index,
        store_creation_time,
        store_random,
        storage_engine,
        format_name,
        start_offset: LOG_HEADER_SIZE_V9,
    })
}

// ---------------------------------------------------------------------------
// commands
// ---------------------------------------------------------------------------

#[derive(Debug, Clone)]
pub enum Command {
    Node { before: NodeRecord, after: NodeRecord },
    Property { before: PropertyRecord, after: PropertyRecord },
    Relationship { before: RelationshipRecord, after: RelationshipRecord },
    RelationshipGroup { before: RelationshipGroupRecord, after: RelationshipGroupRecord },
    PropertyKeyToken { before: TokenRecord, after: TokenRecord },
    LabelToken { before: TokenRecord, after: TokenRecord },
    RelationshipTypeToken { before: TokenRecord, after: TokenRecord },
    NodeCounts { label_id: i32, delta: i64 },
    RelationshipCounts { start_label_id: i32, type_id: i32, end_label_id: i32, delta: i64 },
    GroupDegree { combined_key: i64, delta: i64 },
    SchemaRule {
        before: SchemaRecord,
        after: SchemaRecord,
        rule: Option<BTreeMap<String, SchemaValue>>,
    },
}

impl Command {
    pub fn kind(&self) -> &'static str {
        match self {
            Self::Node { .. } => "NodeCommand",
            Self::Property { .. } => "PropertyCommand",
            Self::Relationship { .. } => "RelationshipCommand",
            Self::RelationshipGroup { .. } => "RelationshipGroupCommand",
            Self::PropertyKeyToken { .. } => "PropertyKeyTokenCommand",
            Self::LabelToken { .. } => "LabelTokenCommand",
            Self::RelationshipTypeToken { .. } => "RelationshipTypeTokenCommand",
            Self::NodeCounts { .. } => "NodeCountsCommand",
            Self::RelationshipCounts { .. } => "RelationshipCountsCommand",
            Self::GroupDegree { .. } => "GroupDegreeCommand",
            Self::SchemaRule { .. } => "SchemaRuleCommand",
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum SchemaValue {
    Bool(bool),
    Int(i64),
    Float(f64),
    Text(String),
    Char(char),
    Array(Vec<SchemaValue>),
}

fn read_schema_value(c: &mut Cursor<'_>) -> Result<SchemaValue, DecodeError> {
    let type_code = c.u8()?;
    read_schema_value_of(type_code, c)
}

fn read_schema_value_of(type_code: u8, c: &mut Cursor<'_>) -> Result<SchemaValue, DecodeError> {
    Ok(match type_code {
        0 => SchemaValue::Bool(true),
        1 => SchemaValue::Bool(false),
        2 => SchemaValue::Bool(c.u8()? != 0),
        3 => SchemaValue::Int(c.u8()? as i8 as i64),
        4 => SchemaValue::Int(c.i16()? as i64),
        5 => SchemaValue::Int(c.i32()? as i64),
        6 => SchemaValue::Int(c.i64()?),
        7 => SchemaValue::Float(c.f32()? as f64),
        8 => SchemaValue::Float(c.f64()?),
        9 => {
            let len = c.i32()?;
            if len < 0 {
                return Err(CursorError::Malformed("negative schema string length").into());
            }
            SchemaValue::Text(String::from_utf8_lossy(c.bytes(len as usize)?).into_owned())
        }
        10 => {
            let raw = c.i32()? as u32;
            SchemaValue::Char(char::from_u32(raw).unwrap_or('\u{FFFD}'))
        }
        11 => {
            let len = c.i32()?;
            if len < 0 {
                return Err(CursorError::Malformed("negative schema array length").into());
            }
            let element_type = c.u8()?;
            let mut items = Vec::with_capacity(len.min(4096) as usize);
            for _ in 0..len {
                items.push(read_schema_value_of(element_type, c)?);
            }
            SchemaValue::Array(items)
        }
        other => {
            return Err(DecodeError::UnknownCommandType { type_code: other, offset: c.position() })
        }
    })
}

fn read_schema_rule_map(c: &mut Cursor<'_>) -> Result<BTreeMap<String, SchemaValue>, DecodeError> {
    let size = c.i32()?;
    if size < 0 {
        return Err(CursorError::Malformed("negative schema rule map size").into());
    }
    let mut map = BTreeMap::new();
    for _ in 0..size {
        let key_len = c.i32()?;
        if key_len < 0 {
            return Err(CursorError::Malformed("negative schema rule key length").into());
        }
        let key = String::from_utf8_lossy(c.bytes(key_len as usize)?).into_owned();
        let value = read_schema_value(c)?;
        map.insert(key, value);
    }
    Ok(map)
}

/// Dispatch on the command type byte. Table taken verbatim from
/// `LogCommandSerialization.read(byte, ReadableChannel)`.
fn read_command(c: &mut Cursor<'_>) -> Result<Command, DecodeError> {
    let offset = c.position();
    let type_code = c.u8()?;
    Ok(match type_code {
        1 => {
            let id = c.i64()?;
            Command::Node {
                before: read_node_record(id, c)?,
                after: read_node_record(id, c)?,
            }
        }
        2 => {
            let id = c.i64()?;
            Command::Property {
                before: read_property_record(id, c)?,
                after: read_property_record(id, c)?,
            }
        }
        3 => {
            let id = c.i64()?;
            Command::Relationship {
                before: read_relationship_record(id, c)?,
                after: read_relationship_record(id, c)?,
            }
        }
        4 => {
            let id = c.i32()?;
            Command::RelationshipTypeToken {
                before: read_token_record(id, false, c)?,
                after: read_token_record(id, false, c)?,
            }
        }
        5 => {
            let id = c.i32()?;
            Command::PropertyKeyToken {
                before: read_token_record(id, true, c)?,
                after: read_token_record(id, true, c)?,
            }
        }
        8 => {
            let id = c.i32()?;
            Command::LabelToken {
                before: read_token_record(id, false, c)?,
                after: read_token_record(id, false, c)?,
            }
        }
        9 => {
            let id = c.i64()?;
            Command::RelationshipGroup {
                before: read_relationship_group_record(id, c)?,
                after: read_relationship_group_record(id, c)?,
            }
        }
        16 => Command::RelationshipCounts {
            start_label_id: c.i32()?,
            type_id: c.i32()?,
            end_label_id: c.i32()?,
            delta: c.i64()?,
        },
        17 => Command::NodeCounts { label_id: c.i32()?, delta: c.i64()? },
        18 => {
            let id = c.i64()?;
            let has_rule = c.u8()? == 1;
            let before = read_schema_record(id, c)?;
            let after = read_schema_record(id, c)?;
            let rule = if has_rule { Some(read_schema_rule_map(c)?) } else { None };
            Command::SchemaRule { before, after, rule }
        }
        20 => Command::GroupDegree { combined_key: c.i64()?, delta: c.i64()? },

        // Types 22..27 are the size-optimised variants: only one image is on
        // the wire and the other is synthesised. Which side is on the wire is
        // load-bearing for recovery — a "deleted" command carries the BEFORE
        // image, and that before-image is the only surviving copy of what the
        // mass delete destroyed. Verified against the constructor argument
        // order in `LogCommandSerializationV5_11`.
        22 => {
            let id = c.i64()?;
            let after = read_node_record(id, c)?;
            Command::Node { before: NodeRecord { id, ..Default::default() }, after }
        }
        23 => {
            let id = c.i64()?;
            let before = read_node_record(id, c)?;
            Command::Node { before, after: NodeRecord { id, ..Default::default() } }
        }
        24 => {
            let id = c.i64()?;
            let after = read_property_record(id, c)?;
            Command::Property { before: PropertyRecord { id, ..Default::default() }, after }
        }
        25 => {
            let id = c.i64()?;
            let before = read_property_record(id, c)?;
            Command::Property { before, after: PropertyRecord { id, ..Default::default() } }
        }
        26 => {
            let id = c.i64()?;
            let after = read_relationship_record(id, c)?;
            Command::Relationship {
                before: RelationshipRecord { id, ..Default::default() },
                after,
            }
        }
        27 => {
            let id = c.i64()?;
            let before = read_relationship_record(id, c)?;
            Command::Relationship {
                before,
                after: RelationshipRecord { id, ..Default::default() },
            }
        }
        other => return Err(DecodeError::UnknownCommandType { type_code: other, offset }),
    })
}

// ---------------------------------------------------------------------------
// transactions + census
// ---------------------------------------------------------------------------

#[derive(Debug, Clone)]
pub struct TxStart {
    pub time_written: i64,
    pub last_committed_tx_when_started: i64,
    pub previous_checksum: i32,
    pub append_index: i64,
}

#[derive(Debug, Clone)]
pub struct DecodedTransaction {
    pub tx_id: i64,
    pub start: TxStart,
    pub commit_time: i64,
    pub commands: Vec<Command>,
}

#[derive(Debug, Clone, Default)]
pub struct Census {
    pub entries_read: u64,
    pub transaction_starts: u64,
    pub transaction_commits: u64,
    pub first_tx_id: Option<i64>,
    pub last_tx_id: Option<i64>,
    pub last_commit_time_written: Option<i64>,
    pub entry_census: BTreeMap<String, u64>,
    pub command_census: BTreeMap<String, u64>,
    /// Commands belonging to a transaction that never committed. These are
    /// **refused**, not applied: a half-written trailing transaction is exactly
    /// what must not leak into a reconstruction.
    pub refused_trailing_commands: u64,
    pub stopped_because: Option<String>,
}

/// Names harvested from the token commands in the log itself. The log runs from
/// database birth, so every token creation is present — a self-contained
/// decoder ring that does not depend on the post-wipe store files.
#[derive(Debug, Clone, Default)]
pub struct TokenNames {
    pub property_keys: BTreeMap<i32, String>,
    pub labels: BTreeMap<i32, String>,
    pub relationship_types: BTreeMap<i32, String>,
}

fn token_name(record: &TokenRecord) -> Option<String> {
    if record.name_records.is_empty() {
        return None;
    }
    let bytes = concat_chain(&record.name_records, record.name_id as i64).ok()?;
    if bytes.is_empty() {
        return None;
    }
    Some(String::from_utf8_lossy(&bytes).into_owned())
}

pub struct TxLogDecoder {
    data: Vec<u8>,
    header: LogHeader,
}

impl TxLogDecoder {
    pub fn open(path: &Path) -> Result<Self, DecodeError> {
        let data = std::fs::read(path).map_err(DecodeError::Io)?;
        Self::from_bytes(data)
    }

    pub fn from_bytes(data: Vec<u8>) -> Result<Self, DecodeError> {
        let header = parse_header(&data)?;
        Ok(Self { data, header })
    }

    pub fn header(&self) -> &LogHeader {
        &self.header
    }

    /// Walk the whole log, calling `on_transaction` for every **committed**
    /// transaction in order. Returns the census and the harvested token names.
    ///
    /// Stops cleanly at the zero-filled tail of the pre-allocated file. A
    /// trailing transaction without a commit entry is counted and refused.
    pub fn decode<F>(&self, mut on_transaction: F) -> Result<(Census, TokenNames), DecodeError>
    where
        F: FnMut(&DecodedTransaction, &TokenNames),
    {
        let mut c = Cursor::at(&self.data, self.header.start_offset);
        let mut census = Census::default();
        let mut tokens = TokenNames::default();
        let mut open_start: Option<TxStart> = None;
        let mut open_commands: Vec<Command> = Vec::new();

        loop {
            if c.remaining() < 2 {
                census.stopped_because = Some("end of file".to_string());
                break;
            }
            let entry_offset = c.position();
            // The file is pre-allocated and zero-filled past the live data; a
            // zero version byte is the end of the written log, not a parse bug.
            match c.peek_u8() {
                Some(0) | None => {
                    census.stopped_because = Some("zero-filled tail".to_string());
                    break;
                }
                _ => {}
            }
            let _kernel_version = c.u8()?;
            let entry_type = c.u8()?;

            match entry_type {
                TX_START => {
                    let start = TxStart {
                        time_written: c.i64()?,
                        last_committed_tx_when_started: c.i64()?,
                        previous_checksum: c.i32()?,
                        append_index: c.i64()?,
                    };
                    let additional_header_len = c.i32()?;
                    if additional_header_len < 0 {
                        return Err(CursorError::Malformed("negative additional header").into());
                    }
                    let _additional = c.bytes(additional_header_len as usize)?;
                    census.entries_read += 1;
                    census.transaction_starts += 1;
                    *census.entry_census.entry("TX_START".to_string()).or_default() += 1;
                    open_start = Some(start);
                    open_commands = Vec::new();
                }
                COMMAND => {
                    let command = read_command(&mut c)?;
                    census.entries_read += 1;
                    *census.entry_census.entry("COMMAND".to_string()).or_default() += 1;
                    *census.command_census.entry(command.kind().to_string()).or_default() += 1;
                    match &command {
                        Command::PropertyKeyToken { after, .. } => {
                            if let Some(name) = token_name(after) {
                                tokens.property_keys.insert(after.id, name);
                            }
                        }
                        Command::LabelToken { after, .. } => {
                            if let Some(name) = token_name(after) {
                                tokens.labels.insert(after.id, name);
                            }
                        }
                        Command::RelationshipTypeToken { after, .. } => {
                            if let Some(name) = token_name(after) {
                                tokens.relationship_types.insert(after.id, name);
                            }
                        }
                        _ => {}
                    }
                    open_commands.push(command);
                }
                TX_COMMIT => {
                    let tx_id = c.i64()?;
                    let commit_time = c.i64()?;
                    let _checksum = c.i32()?;
                    census.entries_read += 1;
                    census.transaction_commits += 1;
                    *census.entry_census.entry("TX_COMMIT".to_string()).or_default() += 1;
                    if census.first_tx_id.is_none() {
                        census.first_tx_id = Some(tx_id);
                    }
                    census.last_tx_id = Some(tx_id);
                    census.last_commit_time_written = Some(commit_time);

                    let start = open_start.take().ok_or(CursorError::Malformed(
                        "commit entry without a preceding transaction start",
                    ))?;
                    let tx = DecodedTransaction {
                        tx_id,
                        start,
                        commit_time,
                        commands: std::mem::take(&mut open_commands),
                    };
                    on_transaction(&tx, &tokens);
                }
                CHUNK_START => {
                    // chunked transaction: previousBatchLogPosition + chunkId
                    let _time_written = c.i64()?;
                    let _chunk_id = c.i64()?;
                    let _previous_batch_log_version = c.i64()?;
                    let _previous_batch_byte_offset = c.i64()?;
                    census.entries_read += 1;
                    *census.entry_census.entry("CHUNK_START".to_string()).or_default() += 1;
                }
                CHUNK_END => {
                    let _chunk_id = c.i64()?;
                    let _checksum = c.i32()?;
                    census.entries_read += 1;
                    *census.entry_census.entry("CHUNK_END".to_string()).or_default() += 1;
                }
                TX_ROLLBACK => {
                    let _tx_id = c.i64()?;
                    let _time_written = c.i64()?;
                    let _checksum = c.i32()?;
                    census.entries_read += 1;
                    *census.entry_census.entry("TX_ROLLBACK".to_string()).or_default() += 1;
                    open_start = None;
                    open_commands.clear();
                }
                other => {
                    return Err(DecodeError::UnknownEntryType {
                        type_code: other,
                        offset: entry_offset,
                    })
                }
            }
        }

        if open_start.is_some() {
            census.refused_trailing_commands = open_commands.len() as u64;
        }
        Ok((census, tokens))
    }

    /// Convenience: census only, without retaining transactions.
    pub fn census(&self) -> Result<(Census, TokenNames), DecodeError> {
        self.decode(|_, _| {})
    }
}

/// Decode every property block of a property record into typed properties.
pub fn decode_property_record(
    record: &PropertyRecord,
) -> Result<Vec<DecodedProperty>, value::ValueError> {
    record
        .blocks
        .iter()
        .map(|block| decode_block(&block.blocks, &block.value_records))
        .collect()
}

/// Helper for callers that want a record's dynamic label ids resolved.
pub fn node_label_names(node: &NodeRecord, tokens: &TokenNames) -> Option<Vec<String>> {
    let ids = node.inline_labels()?;
    Some(
        ids.into_iter()
            .map(|id| {
                tokens
                    .labels
                    .get(&(id as i32))
                    .cloned()
                    .unwrap_or_else(|| format!("label#{id}"))
            })
            .collect(),
    )
}

/// Re-exported so callers can build their own chains without reaching into the
/// private module layout.
pub use record::DynamicRecord;
