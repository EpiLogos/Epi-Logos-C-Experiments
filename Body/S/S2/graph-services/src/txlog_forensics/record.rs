//! Record images carried by Neo4j transaction-log commands.
//!
//! Field order and flag bits are transcribed from Neo4j 5.26.21's own
//! `org.neo4j.internal.recordstorage.LogCommandSerializationV5_0` (and
//! `V4_2`/`V4_3_D3` for the counts commands), read out of the shipped jar. Every
//! command carries a *before* and an *after* image; the before-image is what
//! makes recovery of a deleted graph possible at all.

use super::cursor::{Cursor, CursorError};

/// `Record.IN_USE`
pub const FLAG_IN_USE: u8 = 0x01;
pub const FLAG_CREATED: u8 = 0x02;
pub const FLAG_REQUIRES_SECONDARY_UNIT: u8 = 0x04;
pub const FLAG_HAS_SECONDARY_UNIT: u8 = 0x08;
pub const FLAG_USES_FIXED_REFERENCE: u8 = 0x10;
pub const FLAG_SECONDARY_UNIT_CREATED: u8 = 0x20;

#[derive(Debug, Clone, Default, PartialEq)]
pub struct DynamicRecord {
    pub id: i64,
    pub type_code: i32,
    pub in_use: bool,
    pub created: bool,
    pub start_record: bool,
    pub next_block: i64,
    pub data: Vec<u8>,
}

#[derive(Debug, Clone, Default)]
pub struct NodeRecord {
    pub id: i64,
    pub in_use: bool,
    pub created: bool,
    pub dense: bool,
    pub next_prop: i64,
    pub next_rel: i64,
    pub label_field: i64,
    pub dynamic_labels: Vec<DynamicRecord>,
}

impl NodeRecord {
    /// Inline labels, when the label field is not a pointer into the dynamic
    /// label store. Mirrors `NodeLabelsField.fieldPointsToDynamicRecordOfLabels`
    /// / `InlineNodeLabels`: the high byte holds the count, and the remaining
    /// 36 bits hold `count` labels packed at `36 / count` bits each.
    pub fn inline_labels(&self) -> Option<Vec<u32>> {
        let field = self.label_field as u64;
        // 0x8000000000 set => the body is a dynamic record id.
        if field & 0x8000_0000_00 != 0 {
            return None;
        }
        let count = ((field & 0xF0_0000_0000) >> 36) as u32;
        if count == 0 {
            return Some(Vec::new());
        }
        let bits_per_label = 36 / count;
        let mask = (1u64 << bits_per_label) - 1;
        let mut out = Vec::with_capacity(count as usize);
        for i in 0..count {
            let shift = i * bits_per_label;
            out.push(((field >> shift) & mask) as u32);
        }
        out.sort_unstable();
        Some(out)
    }
}

#[derive(Debug, Clone, Default)]
pub struct RelationshipRecord {
    pub id: i64,
    pub in_use: bool,
    pub created: bool,
    pub first_node: i64,
    pub second_node: i64,
    pub type_id: i32,
    pub first_prev_rel: i64,
    pub first_next_rel: i64,
    pub second_prev_rel: i64,
    pub second_next_rel: i64,
    pub next_prop: i64,
    pub first_in_first_chain: bool,
    pub first_in_second_chain: bool,
}

#[derive(Debug, Clone, Default)]
pub struct PropertyBlockRecord {
    pub blocks: Vec<u64>,
    pub value_records: Vec<DynamicRecord>,
}

#[derive(Debug, Clone, Default)]
pub struct PropertyRecord {
    pub id: i64,
    pub in_use: bool,
    pub created: bool,
    pub node_id: Option<i64>,
    pub rel_id: Option<i64>,
    pub schema_rule_id: Option<i64>,
    pub prev_prop: i64,
    pub next_prop: i64,
    pub blocks: Vec<PropertyBlockRecord>,
    pub deleted_records: Vec<DynamicRecord>,
}

#[derive(Debug, Clone, Default)]
pub struct RelationshipGroupRecord {
    pub id: i64,
    pub in_use: bool,
    pub created: bool,
    pub type_id: i32,
    pub next: i64,
    pub first_out: i64,
    pub first_in: i64,
    pub first_loop: i64,
    pub owning_node: i64,
}

#[derive(Debug, Clone, Default)]
pub struct TokenRecord {
    pub id: i32,
    pub in_use: bool,
    pub created: bool,
    pub internal: bool,
    pub property_count: i32,
    pub name_id: i32,
    pub name_records: Vec<DynamicRecord>,
}

#[derive(Debug, Clone, Default)]
pub struct SchemaRecord {
    pub id: i64,
    pub in_use: bool,
    pub created: bool,
    pub constraint: bool,
    pub next_prop: i64,
}

// ---------------------------------------------------------------------------
// parsers
// ---------------------------------------------------------------------------

pub fn read_dynamic_record(c: &mut Cursor<'_>) -> Result<DynamicRecord, CursorError> {
    let id = c.i64()?;
    let type_code = c.i32()?;
    let flags = c.u8()?;
    let in_use = flags & FLAG_IN_USE != 0;
    let created = flags & FLAG_CREATED != 0;
    let mut record = DynamicRecord {
        id,
        type_code,
        in_use,
        created,
        start_record: false,
        next_block: -1,
        data: Vec::new(),
    };
    if in_use {
        record.start_record = flags & FLAG_SECONDARY_UNIT_CREATED != 0;
        let nr_of_bytes = c.i32()?;
        if !(0..=16_777_215).contains(&nr_of_bytes) {
            return Err(CursorError::Malformed("dynamic record length out of range"));
        }
        record.next_block = c.i64()?;
        record.data = c.bytes(nr_of_bytes as usize)?.to_vec();
    }
    Ok(record)
}

/// `readDynamicRecords` / `readDynamicRecordList` — both are an `int` count
/// followed by that many records.
pub fn read_dynamic_record_list(c: &mut Cursor<'_>) -> Result<Vec<DynamicRecord>, CursorError> {
    let n = c.i32()?;
    if n < 0 {
        return Err(CursorError::Malformed("negative dynamic record count"));
    }
    let mut out = Vec::with_capacity(n.min(1024) as usize);
    for _ in 0..n {
        out.push(read_dynamic_record(c)?);
    }
    Ok(out)
}

pub fn read_node_record(id: i64, c: &mut Cursor<'_>) -> Result<NodeRecord, CursorError> {
    let flags = c.u8()?;
    let in_use = flags & FLAG_IN_USE != 0;
    let created = flags & FLAG_CREATED != 0;
    let has_secondary = flags & FLAG_HAS_SECONDARY_UNIT != 0;

    let mut record = NodeRecord { id, created, ..Default::default() };
    if in_use {
        let dense = c.u8()? == 1;
        let next_prop = c.i64()?;
        let next_rel = c.i64()?;
        let label_field = c.i64()?;
        record.in_use = true;
        record.dense = dense;
        record.next_prop = next_prop;
        record.next_rel = next_rel;
        record.label_field = label_field;
    }
    if has_secondary {
        let _secondary_unit_id = c.i64()?;
    }
    record.dynamic_labels = read_dynamic_record_list(c)?;
    Ok(record)
}

pub fn read_relationship_record(
    id: i64,
    c: &mut Cursor<'_>,
) -> Result<RelationshipRecord, CursorError> {
    let flags = c.u8()?;
    let in_use = flags & FLAG_IN_USE != 0;
    let created = flags & FLAG_CREATED != 0;
    let has_secondary = flags & FLAG_HAS_SECONDARY_UNIT != 0;

    let mut record = RelationshipRecord { id, created, ..Default::default() };
    if in_use {
        record.in_use = true;
        record.first_node = c.i64()?;
        record.second_node = c.i64()?;
        record.type_id = c.i32()?;
        record.first_prev_rel = c.i64()?;
        record.first_next_rel = c.i64()?;
        record.second_prev_rel = c.i64()?;
        record.second_next_rel = c.i64()?;
        record.next_prop = c.i64()?;
        let extra = c.u8()?;
        record.first_in_first_chain = extra & 0x01 != 0;
        record.first_in_second_chain = extra & 0x02 != 0;
    } else {
        // Not-in-use relationships still carry their type on the wire.
        record.first_node = -1;
        record.second_node = -1;
        record.type_id = c.i32()?;
    }
    if has_secondary {
        let _secondary_unit_id = c.i64()?;
    }
    Ok(record)
}

pub fn read_property_block(c: &mut Cursor<'_>) -> Result<PropertyBlockRecord, CursorError> {
    let block_size_bytes = c.u8()? as usize;
    if block_size_bytes == 0 || block_size_bytes % 8 != 0 {
        return Err(CursorError::Malformed("property block size is not a multiple of 8"));
    }
    let count = block_size_bytes / 8;
    let mut blocks = Vec::with_capacity(count);
    for _ in 0..count {
        blocks.push(c.i64()? as u64);
    }
    let value_records = read_dynamic_record_list(c)?;
    Ok(PropertyBlockRecord { blocks, value_records })
}

pub fn read_property_record(id: i64, c: &mut Cursor<'_>) -> Result<PropertyRecord, CursorError> {
    let flags = c.u8()?;
    let in_use = flags & FLAG_IN_USE != 0;
    let created = flags & FLAG_CREATED != 0;
    let node_property = flags & 0x40 != 0;
    let rel_property = flags & 0x80 != 0;

    let next_prop = c.i64()?;
    let prev_prop = c.i64()?;
    let entity_id = c.i64()?;

    let mut record = PropertyRecord {
        id,
        in_use,
        created,
        prev_prop,
        next_prop,
        ..Default::default()
    };
    if entity_id != -1 {
        if node_property {
            record.node_id = Some(entity_id);
        } else if rel_property {
            record.rel_id = Some(entity_id);
        } else {
            record.schema_rule_id = Some(entity_id);
        }
    }

    let nr_property_blocks = c.u8()? as i8;
    if nr_property_blocks < 0 {
        return Err(CursorError::Malformed("negative property block count"));
    }
    for _ in 0..nr_property_blocks {
        record.blocks.push(read_property_block(c)?);
    }
    record.deleted_records = read_dynamic_record_list(c)?;
    Ok(record)
}

pub fn read_relationship_group_record(
    id: i64,
    c: &mut Cursor<'_>,
) -> Result<RelationshipGroupRecord, CursorError> {
    let flags = c.u8()?;
    let in_use = flags & FLAG_IN_USE != 0;
    let created = flags & FLAG_CREATED != 0;
    let has_secondary = flags & FLAG_HAS_SECONDARY_UNIT != 0;

    let type_id = c.i32()?;
    let next = c.i64()?;
    let first_out = c.i64()?;
    let first_in = c.i64()?;
    let first_loop = c.i64()?;
    let owning_node = c.i64()?;
    // hasExternalDegrees out/in/loop
    let _external = c.u8()?;
    if has_secondary {
        let _secondary_unit_id = c.i64()?;
    }
    Ok(RelationshipGroupRecord {
        id,
        in_use,
        created,
        type_id,
        next,
        first_out,
        first_in,
        first_loop,
        owning_node,
    })
}

/// Property-key tokens carry an extra `propertyCount`; label and relationship
/// type tokens do not.
pub fn read_token_record(
    id: i32,
    with_property_count: bool,
    c: &mut Cursor<'_>,
) -> Result<TokenRecord, CursorError> {
    let flags = c.u8()?;
    let mut record = TokenRecord {
        id,
        in_use: flags & FLAG_IN_USE != 0,
        created: flags & FLAG_CREATED != 0,
        internal: flags & FLAG_SECONDARY_UNIT_CREATED != 0,
        ..Default::default()
    };
    if with_property_count {
        record.property_count = c.i32()?;
    }
    record.name_id = c.i32()?;
    record.name_records = read_dynamic_record_list(c)?;
    Ok(record)
}

pub fn read_schema_record(id: i64, c: &mut Cursor<'_>) -> Result<SchemaRecord, CursorError> {
    let flags = c.u8()?;
    let in_use = flags & FLAG_IN_USE != 0;
    let created = flags & FLAG_CREATED != 0;
    let mut record = SchemaRecord { id, in_use, created, ..Default::default() };
    if in_use {
        let extra = c.u8()?;
        record.constraint = extra & 0x01 != 0;
        record.next_prop = c.i64()?;
    }
    Ok(record)
}
