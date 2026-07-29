//! Property value decoding for the transaction-log forensics decoder.
//!
//! Neo4j inlines short values directly into the property block's 64-bit words
//! and spills longer ones into a `DynamicRecord` chain that the log command
//! carries with it. A decoder that only reads the dynamic spill silently loses
//! most short values — every 4-character coordinate like `M2-3` is inlined.
//! Both paths are implemented here, and anything unrecognised is surfaced as an
//! explicit error rather than dropped.

use std::collections::BTreeMap;
use std::fmt;

use super::codec_tables::{codec_by_id, ENCODING_LATIN1, ENCODING_UTF8, SHORT_STRING_HEADER_BITS};
use super::record::DynamicRecord;

/// `org.neo4j.kernel.impl.store.PropertyType` codes.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PropertyKind {
    Bool,
    Byte,
    Short,
    Char,
    Int,
    Long,
    Float,
    Double,
    String,
    Array,
    ShortString,
    ShortArray,
    Geometry,
    Temporal,
}

impl PropertyKind {
    pub fn from_code(code: u8) -> Option<Self> {
        Some(match code {
            1 => Self::Bool,
            2 => Self::Byte,
            3 => Self::Short,
            4 => Self::Char,
            5 => Self::Int,
            6 => Self::Long,
            7 => Self::Float,
            8 => Self::Double,
            9 => Self::String,
            10 => Self::Array,
            11 => Self::ShortString,
            12 => Self::ShortArray,
            13 => Self::Geometry,
            14 => Self::Temporal,
            _ => return None,
        })
    }

    pub fn name(self) -> &'static str {
        match self {
            Self::Bool => "BOOL",
            Self::Byte => "BYTE",
            Self::Short => "SHORT",
            Self::Char => "CHAR",
            Self::Int => "INT",
            Self::Long => "LONG",
            Self::Float => "FLOAT",
            Self::Double => "DOUBLE",
            Self::String => "STRING",
            Self::Array => "ARRAY",
            Self::ShortString => "SHORT_STRING",
            Self::ShortArray => "SHORT_ARRAY",
            Self::Geometry => "GEOMETRY",
            Self::Temporal => "TEMPORAL",
        }
    }
}

/// A decoded property value. `Array`/`Geometry`/`Temporal` keep their raw
/// payload: the honest cross-check surface for those is the bytes themselves,
/// not a lossy re-interpretation.
#[derive(Debug, Clone, PartialEq)]
pub enum PropertyValue {
    Bool(bool),
    Int(i64),
    Float(f64),
    Char(char),
    Text(String),
    /// A decoded array — spilled (`ARRAY`) or inline packed (`SHORT_ARRAY`).
    Array(ArrayValue),
    /// A value whose encoding this decoder does not claim to understand.
    /// Never silently dropped — it is carried so a caller can see the gap.
    Unsupported { kind: &'static str, blocks: Vec<u64> },
}

impl PropertyValue {
    pub fn as_text(&self) -> Option<&str> {
        match self {
            Self::Text(s) => Some(s.as_str()),
            _ => None,
        }
    }

    pub fn as_array(&self) -> Option<&ArrayValue> {
        match self {
            Self::Array(a) => Some(a),
            _ => None,
        }
    }
}

/// Arrays keep their element type, because a `float[]` embedding and a
/// `String[]` coordinate list must not be conflated when Cypher is re-emitted.
#[derive(Debug, Clone, PartialEq)]
pub enum ArrayValue {
    Bool(Vec<bool>),
    // Integer widths stay distinct: Neo4j reports `long[]` and `int[]` as
    // different types, and collapsing them loses source fidelity.
    Byte(Vec<i64>),
    Short(Vec<i64>),
    Int(Vec<i64>),
    Long(Vec<i64>),
    /// 32-bit source width — kept distinct from `Double` because Neo4j does.
    Float(Vec<f64>),
    Double(Vec<f64>),
    Char(Vec<char>),
    Text(Vec<String>),
}

impl ArrayValue {
    pub fn len(&self) -> usize {
        match self {
            Self::Bool(v) => v.len(),
            Self::Byte(v) | Self::Short(v) | Self::Int(v) | Self::Long(v) => v.len(),
            Self::Float(v) | Self::Double(v) => v.len(),
            Self::Char(v) => v.len(),
            Self::Text(v) => v.len(),
        }
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    /// Integer elements, whatever the source width.
    pub fn as_ints(&self) -> Option<&[i64]> {
        match self {
            Self::Byte(v) | Self::Short(v) | Self::Int(v) | Self::Long(v) => Some(v),
            _ => None,
        }
    }

    /// Element type name matching Neo4j's own rendering, for golden comparison.
    pub fn element_type(&self) -> &'static str {
        match self {
            Self::Bool(_) => "boolean",
            Self::Byte(_) => "byte",
            Self::Short(_) => "short",
            Self::Int(_) => "int",
            Self::Long(_) => "long",
            Self::Float(_) => "float",
            Self::Double(_) => "double",
            Self::Char(_) => "char",
            Self::Text(_) => "String",
        }
    }
}

#[derive(Debug, Clone)]
pub struct DecodedProperty {
    pub key_id: u32,
    pub kind: PropertyKind,
    pub value: PropertyValue,
}

#[derive(Debug)]
pub enum ValueError {
    UnknownPropertyType(u8),
    UnknownShortStringEncoding(u8),
    BrokenDynamicChain { start: i64 },
    TruncatedArray,
    UnsupportedArrayElement(&'static str),
    Utf8(std::string::FromUtf8Error),
}

impl fmt::Display for ValueError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::UnknownPropertyType(c) => write!(f, "unknown property type code {c}"),
            Self::UnknownShortStringEncoding(e) => {
                write!(f, "unknown short-string encoding {e}")
            }
            Self::BrokenDynamicChain { start } => {
                write!(f, "dynamic record chain starting at {start} is broken")
            }
            Self::TruncatedArray => write!(f, "array payload ended mid-element"),
            Self::UnsupportedArrayElement(t) => {
                write!(f, "unsupported array element type {t}")
            }
            Self::Utf8(e) => write!(f, "invalid utf-8 in dynamic string: {e}"),
        }
    }
}

impl std::error::Error for ValueError {}

/// Read `count` bits starting at `offset` out of the little-endian block words.
fn read_bits(blocks: &[u64], offset: u32, count: u32) -> u64 {
    if count == 0 {
        return 0;
    }
    let mut out: u64 = 0;
    for i in 0..count {
        let bit = offset + i;
        let word = (bit / 64) as usize;
        if word >= blocks.len() {
            break;
        }
        let shift = bit % 64;
        let value = (blocks[word] >> shift) & 1;
        out |= value << i;
    }
    out
}

/// Decode one property block. `dynamic` is the block's own value-record chain
/// as carried by the log command (never a store lookup).
pub fn decode_block(
    blocks: &[u64],
    dynamic: &[DynamicRecord],
) -> Result<DecodedProperty, ValueError> {
    let header = blocks.first().copied().unwrap_or(0);
    let key_id = (header & 0x00FF_FFFF) as u32;
    let type_code = ((header >> 24) & 0x0F) as u8;
    let kind =
        PropertyKind::from_code(type_code).ok_or(ValueError::UnknownPropertyType(type_code))?;

    let value = match kind {
        PropertyKind::Bool => PropertyValue::Bool(((header >> 28) & 0x1) != 0),
        PropertyKind::Byte => PropertyValue::Int(((header >> 28) as i8) as i64),
        PropertyKind::Short => PropertyValue::Int(((header >> 28) as u16 as i16) as i64),
        PropertyKind::Char => {
            let raw = ((header >> 28) & 0xFFFF) as u32;
            PropertyValue::Char(char::from_u32(raw).unwrap_or('\u{FFFD}'))
        }
        PropertyKind::Int => PropertyValue::Int(((header >> 28) as u32 as i32) as i64),
        PropertyKind::Long => {
            // Bit 28 flags "value is inlined in the remaining 35 bits".
            if (header >> 28) & 0x1 != 0 {
                let raw = header >> 29;
                // Sign-extend from 35 bits.
                let shifted = (raw << 29) as i64 >> 29;
                PropertyValue::Int(shifted)
            } else {
                PropertyValue::Int(blocks.get(1).copied().unwrap_or(0) as i64)
            }
        }
        PropertyKind::Float => {
            let raw = ((header >> 28) & 0xFFFF_FFFF) as u32;
            PropertyValue::Float(f32::from_bits(raw) as f64)
        }
        PropertyKind::Double => {
            PropertyValue::Float(f64::from_bits(blocks.get(1).copied().unwrap_or(0)))
        }
        PropertyKind::ShortString => decode_short_string(blocks)?,
        PropertyKind::ShortArray => PropertyValue::Array(decode_short_array(blocks)?),
        PropertyKind::String => {
            let start = (header >> 28) as i64;
            let bytes = concat_chain(dynamic, start)?;
            PropertyValue::Text(String::from_utf8(bytes).map_err(ValueError::Utf8)?)
        }
        PropertyKind::Array => {
            let start = (header >> 28) as i64;
            let payload = concat_chain(dynamic, start)?;
            PropertyValue::Array(decode_dynamic_array(&payload)?)
        }
        PropertyKind::Geometry | PropertyKind::Temporal => {
            PropertyValue::Unsupported { kind: kind.name(), blocks: blocks.to_vec() }
        }
    };

    Ok(DecodedProperty { key_id, kind, value })
}

fn decode_short_string(blocks: &[u64]) -> Result<PropertyValue, ValueError> {
    let header = blocks[0];
    let encoding = ((header >> 28) & 0x1F) as u8;
    let length = ((header >> 33) & 0x3F) as u32;

    if encoding == ENCODING_LATIN1 {
        let mut out = String::with_capacity(length as usize);
        for i in 0..length {
            let code = read_bits(blocks, SHORT_STRING_HEADER_BITS + i * 8, 8) as u8;
            out.push(code as char);
        }
        return Ok(PropertyValue::Text(out));
    }
    if encoding == ENCODING_UTF8 {
        let mut bytes = Vec::with_capacity(length as usize);
        for i in 0..length {
            bytes.push(read_bits(blocks, SHORT_STRING_HEADER_BITS + i * 8, 8) as u8);
        }
        return Ok(PropertyValue::Text(
            String::from_utf8(bytes).map_err(ValueError::Utf8)?,
        ));
    }

    let codec =
        codec_by_id(encoding).ok_or(ValueError::UnknownShortStringEncoding(encoding))?;
    let step = codec.step as u32;
    let mut out = String::with_capacity(length as usize);
    for i in 0..length {
        let code = read_bits(blocks, SHORT_STRING_HEADER_BITS + i * step, step) as usize;
        let ch = codec.table.get(code).copied().unwrap_or(b'?');
        out.push(ch as char);
    }
    Ok(PropertyValue::Text(out))
}

/// `DynamicArrayStore.NUMBER_HEADER_SIZE`
const NUMBER_HEADER_SIZE: usize = 3;
/// `DynamicArrayStore.STRING_HEADER_SIZE`
const STRING_HEADER_SIZE: usize = 5;

fn be_i32(bytes: &[u8], at: usize) -> Result<i32, ValueError> {
    bytes
        .get(at..at + 4)
        .map(|b| i32::from_be_bytes([b[0], b[1], b[2], b[3]]))
        .ok_or(ValueError::TruncatedArray)
}

/// Decode a spilled array payload (`DynamicArrayStore`). The first byte is the
/// element `PropertyType`; string arrays carry a length-prefixed list, numeric
/// arrays a bit-packed body whose width is declared in the header.
pub fn decode_dynamic_array(payload: &[u8]) -> Result<ArrayValue, ValueError> {
    let Some(&type_id) = payload.first() else {
        return Ok(ArrayValue::Text(Vec::new()));
    };
    let kind = PropertyKind::from_code(type_id).ok_or(ValueError::UnknownPropertyType(type_id))?;

    if kind == PropertyKind::String {
        let count = be_i32(payload, 1)?;
        if count < 0 {
            return Err(ValueError::TruncatedArray);
        }
        let mut out = Vec::with_capacity(count.min(4096) as usize);
        let mut at = STRING_HEADER_SIZE;
        for _ in 0..count {
            let len = be_i32(payload, at)?;
            at += 4;
            if len < 0 {
                return Err(ValueError::TruncatedArray);
            }
            let end = at + len as usize;
            let slice = payload.get(at..end).ok_or(ValueError::TruncatedArray)?;
            out.push(String::from_utf8(slice.to_vec()).map_err(ValueError::Utf8)?);
            at = end;
        }
        return Ok(ArrayValue::Text(out));
    }

    // Numeric: [typeId][bitsUsedInLastByte][requiredBits] then packed items.
    let bits_used_in_last_byte = *payload.get(1).ok_or(ValueError::TruncatedArray)? as usize;
    let required_bits = *payload.get(2).ok_or(ValueError::TruncatedArray)? as usize;
    let body = payload.get(NUMBER_HEADER_SIZE..).ok_or(ValueError::TruncatedArray)?;
    if required_bits == 0 {
        return Ok(empty_numeric(kind));
    }
    let total_bits = body.len() * 8 - (8 - bits_used_in_last_byte);
    let count = total_bits / required_bits;

    // Neo4j packs these with `Bits`, which fills from the most significant end
    // of the byte run, so items are read big-endian-first across the body.
    let mut raw = Vec::with_capacity(count);
    for i in 0..count {
        let start = total_bits - (i + 1) * required_bits;
        raw.push(read_bits_be(body, start, required_bits));
    }
    raw.reverse();

    numeric_array(raw, kind)
}

fn empty_numeric(kind: PropertyKind) -> ArrayValue {
    numeric_array(Vec::new(), kind).unwrap_or(ArrayValue::Int(Vec::new()))
}

/// Turn raw packed words into a typed array, preserving the element width.
fn numeric_array(raw: Vec<u64>, kind: PropertyKind) -> Result<ArrayValue, ValueError> {
    let ints = |raw: Vec<u64>| raw.into_iter().map(|v| to_signed(v, kind)).collect::<Vec<_>>();
    Ok(match kind {
        PropertyKind::Bool => ArrayValue::Bool(raw.into_iter().map(|v| v != 0).collect()),
        PropertyKind::Byte => ArrayValue::Byte(ints(raw)),
        PropertyKind::Short => ArrayValue::Short(ints(raw)),
        PropertyKind::Int => ArrayValue::Int(ints(raw)),
        PropertyKind::Long => ArrayValue::Long(ints(raw)),
        PropertyKind::Char => ArrayValue::Char(
            raw.into_iter()
                .map(|v| char::from_u32(v as u32).unwrap_or('\u{FFFD}'))
                .collect(),
        ),
        PropertyKind::Float => {
            ArrayValue::Float(raw.into_iter().map(|v| f32::from_bits(v as u32) as f64).collect())
        }
        PropertyKind::Double => ArrayValue::Double(raw.into_iter().map(f64::from_bits).collect()),
        other => return Err(ValueError::UnsupportedArrayElement(other.name())),
    })
}

/// Packed integers are stored zero-extended in `requiredBits`, then read back
/// at the element type's natural width — `Bits.getInt` truncates to 32 bits and
/// lets the sign fall out of that. Sign-extending at `requiredBits` instead
/// would turn a positive 6-bit 57 into -7.
fn to_signed(raw: u64, kind: PropertyKind) -> i64 {
    match kind {
        PropertyKind::Byte => (raw as u8) as i8 as i64,
        PropertyKind::Short => (raw as u16) as i16 as i64,
        PropertyKind::Int => (raw as u32) as i32 as i64,
        _ => raw as i64,
    }
}

/// Read `count` bits from a byte run, counting bit 0 as the most significant
/// bit of byte 0 (the order `org.neo4j.util.BitBuffer` writes).
fn read_bits_be(body: &[u8], offset: usize, count: usize) -> u64 {
    let mut out: u64 = 0;
    for i in 0..count {
        let bit = offset + i;
        let byte = bit / 8;
        let shift = 7 - (bit % 8);
        let value = body.get(byte).map_or(0, |b| (b >> shift) & 1);
        out = (out << 1) | value as u64;
    }
    out
}

/// Decode an inline packed array. Layout after the 24-bit key and 4-bit type:
/// item type (4 bits), item count (6 bits), bits per item (6 bits), then the
/// packed items. The two 6-bit fields are easy to transpose — `ShortArray`
/// writes `requiredBits` before `arrayLength`, but `BitBuffer` appends from the
/// low end, so in the assembled word the count comes first.
pub fn decode_short_array(blocks: &[u64]) -> Result<ArrayValue, ValueError> {
    let header = blocks[0];
    let item_type_code = ((header >> 28) & 0x0F) as u8;
    let count = ((header >> 32) & 0x3F) as u32;
    let bits_per_item = ((header >> 38) & 0x3F) as u32;
    let kind = PropertyKind::from_code(item_type_code)
        .ok_or(ValueError::UnknownPropertyType(item_type_code))?;
    if bits_per_item == 0 || count == 0 {
        return Ok(empty_numeric(kind));
    }

    const SHORT_ARRAY_HEADER_BITS: u32 = 44;
    let mut raw = Vec::with_capacity(count as usize);
    for i in 0..count {
        raw.push(read_bits(blocks, SHORT_ARRAY_HEADER_BITS + i * bits_per_item, bits_per_item));
    }

    numeric_array(raw, kind)
}

/// Follow the dynamic-record chain from `start`, concatenating payloads.
pub fn concat_chain(records: &[DynamicRecord], start: i64) -> Result<Vec<u8>, ValueError> {
    if records.is_empty() {
        return Ok(Vec::new());
    }
    let by_id: BTreeMap<i64, &DynamicRecord> = records.iter().map(|r| (r.id, r)).collect();
    let mut out = Vec::new();
    let mut cursor = start;
    let mut guard = 0usize;
    let mut followed = false;
    while cursor >= 0 && guard < 1_000_000 {
        guard += 1;
        let Some(record) = by_id.get(&cursor) else { break };
        followed = true;
        out.extend_from_slice(&record.data);
        cursor = record.next_block;
    }
    if !followed {
        // The chain head was not present. Fall back to declaration order so the
        // payload is still recovered, but say so if even that is empty.
        for record in records {
            out.extend_from_slice(&record.data);
        }
        if out.is_empty() {
            return Err(ValueError::BrokenDynamicChain { start });
        }
    }
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn read_bits_crosses_word_boundary() {
        // bit 60..68 spans words 0 and 1.
        let blocks = [0xF000_0000_0000_0000u64, 0x0000_0000_0000_000Fu64];
        assert_eq!(read_bits(&blocks, 60, 8), 0b1111_1111);
    }

    #[test]
    fn unknown_property_type_is_an_error_not_a_silent_drop() {
        let header = 0u64 | (15u64 << 24);
        let err = decode_block(&[header], &[]).unwrap_err();
        assert!(matches!(err, ValueError::UnknownPropertyType(15)));
    }

    #[test]
    fn unknown_short_string_encoding_is_an_error() {
        // encoding 31 is not a real codec id.
        let header = (11u64 << 24) | (31u64 << 28) | (1u64 << 33);
        let err = decode_block(&[header], &[]).unwrap_err();
        assert!(matches!(err, ValueError::UnknownShortStringEncoding(31)));
    }

    #[test]
    fn dynamic_chain_follows_next_pointers_not_declaration_order() {
        let records = vec![
            DynamicRecord { id: 7, next_block: -1, data: b"world".to_vec(), ..Default::default() },
            DynamicRecord { id: 3, next_block: 7, data: b"hello ".to_vec(), ..Default::default() },
        ];
        let bytes = concat_chain(&records, 3).unwrap();
        assert_eq!(String::from_utf8(bytes).unwrap(), "hello world");
    }
}
