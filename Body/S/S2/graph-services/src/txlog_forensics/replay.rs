//! Replay the decoded command stream forward into an in-memory store, and
//! materialise the property map every node carried at a chosen instant.
//!
//! What this recovers is **properties**, not structure. The base restore
//! already brought the nodes and relationships back (1,978 `:Bimba` nodes,
//! 996/996 Map coordinates). What it could not bring back is any property with
//! no repo-side source: the dataset replay only restores the generator's
//! `registeredTargets` allowlist, so a property that was only ever written into
//! the graph — a `q_*` register curated through MCP, say — has nowhere to come
//! from. The transaction log has all of them, because it records every write
//! regardless of whether anything downstream knew the property existed.
//!
//! Replay keeps only the latest after-image of each record, which is what makes
//! this cheap: one pass, no history retained.

use std::collections::BTreeMap;
use std::collections::HashMap;

use super::record::{NodeRecord, PropertyRecord, RelationshipRecord};
use super::value::{decode_block, decode_dynamic_array, ArrayValue, PropertyValue};
use super::{Command, DecodeError, DecodedTransaction, TokenNames, TxLogDecoder};

/// A node's state at the replay stop point.
#[derive(Debug, Clone, Default)]
pub struct NodeState {
    pub node_id: i64,
    pub labels: Vec<String>,
    /// Property name -> value, with the transaction that last wrote it.
    pub properties: BTreeMap<String, (PropertyValue, i64)>,
}

impl NodeState {
    pub fn coordinate(&self) -> Option<&str> {
        self.properties.get("coordinate").and_then(|(v, _)| v.as_text())
    }
}

/// In-memory store built by replaying the log.
#[derive(Default)]
pub struct ReplayStore {
    nodes: HashMap<i64, NodeRecord>,
    rels: HashMap<i64, RelationshipRecord>,
    props: HashMap<i64, PropertyRecord>,
    /// Property record id -> transaction that last wrote it.
    prop_tx: HashMap<i64, i64>,
}

/// A relationship's state at the replay stop point.
#[derive(Debug, Clone)]
pub struct RelState {
    pub rel_id: i64,
    pub type_name: String,
    pub start_node: i64,
    pub end_node: i64,
    pub properties: BTreeMap<String, (PropertyValue, i64)>,
}

#[derive(Debug, Clone, Default)]
pub struct ReplayStats {
    pub transactions_applied: u64,
    pub stopped_before_tx: Option<i64>,
    pub nodes_in_use: usize,
    pub property_records_in_use: usize,
    /// Per-transaction count of node deletions, for locating the mass delete.
    pub largest_delete_tx: Option<(i64, usize)>,
}

impl ReplayStore {
    fn apply(&mut self, tx: &DecodedTransaction) {
        for command in &tx.commands {
            match command {
                Command::Node { after, .. } => {
                    self.nodes.insert(after.id, after.clone());
                }
                Command::Property { after, .. } => {
                    self.prop_tx.insert(after.id, tx.tx_id);
                    self.props.insert(after.id, after.clone());
                }
                Command::Relationship { after, .. } => {
                    self.rels.insert(after.id, after.clone());
                }
                _ => {}
            }
        }
    }

    /// Walk a node's property chain and decode every block it carries.
    fn properties_of(&self, node: &NodeRecord) -> BTreeMap<u32, (PropertyValue, i64)> {
        let mut out = BTreeMap::new();
        let mut cursor = node.next_prop;
        let mut guard = 0;
        while cursor >= 0 && guard < 10_000 {
            guard += 1;
            let Some(record) = self.props.get(&cursor) else { break };
            if !record.in_use {
                break;
            }
            let tx = self.prop_tx.get(&cursor).copied().unwrap_or(-1);
            for block in &record.blocks {
                if let Ok(decoded) = decode_block(&block.blocks, &block.value_records) {
                    out.insert(decoded.key_id, (decoded.value, tx));
                }
            }
            cursor = record.next_prop;
        }
        out
    }

    /// Materialise every in-use node, whether or not it carries a coordinate.
    pub fn all_nodes(&self, tokens: &TokenNames) -> Vec<NodeState> {
        self.materialise(tokens, false)
    }

    /// Materialise every in-use node that carries a `coordinate` property.
    pub fn coordinate_nodes(&self, tokens: &TokenNames) -> Vec<NodeState> {
        self.materialise(tokens, true)
    }

    /// Group in-use property records by the node owner they declare.
    ///
    /// Walking `node.next_prop` is the textbook traversal, but it recovers only
    /// a fraction of the records here: measured on the real log it reaches 8,307
    /// of the 31,008 in-use property records that explicitly name a node owner.
    /// Neo4j writes the owning entity id onto the records themselves, so the
    /// owner field is both simpler and strictly more complete — and completeness
    /// is the whole point of this recovery.
    fn properties_by_owner(&self) -> HashMap<i64, BTreeMap<u32, (PropertyValue, i64)>> {
        let mut out: HashMap<i64, BTreeMap<u32, (PropertyValue, i64)>> = HashMap::new();
        for record in self.props.values() {
            if !record.in_use {
                continue;
            }
            let Some(node_id) = record.node_id else { continue };
            let tx = self.prop_tx.get(&record.id).copied().unwrap_or(-1);
            let entry = out.entry(node_id).or_default();
            for block in &record.blocks {
                if let Ok(decoded) = decode_block(&block.blocks, &block.value_records) {
                    // Later transactions win; ties keep the first seen.
                    match entry.get(&decoded.key_id) {
                        Some((_, seen_tx)) if *seen_tx >= tx => {}
                        _ => {
                            entry.insert(decoded.key_id, (decoded.value, tx));
                        }
                    }
                }
            }
        }
        out
    }

    fn materialise(&self, tokens: &TokenNames, require_coordinate: bool) -> Vec<NodeState> {
        let coordinate_key = tokens
            .property_keys
            .iter()
            .find(|(_, name)| name.as_str() == "coordinate")
            .map(|(id, _)| *id);

        let by_owner = self.properties_by_owner();
        let mut out = Vec::new();
        for node in self.nodes.values() {
            if !node.in_use {
                continue;
            }
            // Owner attribution ONLY. Walking `node.next_prop` looked like the
            // textbook traversal but proved both incomplete and wrong here: it
            // reached 8,307 of 31,008 owned records, produced no S3 node at all,
            // and cross-attributed foreign properties (relationship
            // source/target coordinates landing on S3). Owner attribution is
            // exact — every coordinate resolves to exactly one node id, and
            // M2-3 resolves to node 432, the same id Neo4j's own reader
            // independently reported for that node's q-register prose.
            let Some(raw) = by_owner.get(&node.id).cloned() else { continue };
            if raw.is_empty() {
                continue;
            }
            if require_coordinate {
                if let Some(key) = coordinate_key {
                    if !raw.contains_key(&(key as u32)) {
                        continue;
                    }
                }
            }
            let mut properties = BTreeMap::new();
            for (key_id, (value, tx)) in raw {
                let name = tokens
                    .property_keys
                    .get(&(key_id as i32))
                    .cloned()
                    .unwrap_or_else(|| format!("key#{key_id}"));
                properties.insert(name, (value, tx));
            }
            let labels = self.labels_of(node, tokens);
            out.push(NodeState { node_id: node.id, labels, properties });
        }
        out.sort_by_key(|n| n.node_id);
        out
    }
}

impl ReplayStore {
    /// Labels for a node, covering the dynamic-label case.
    ///
    /// Short label sets are packed into the 40-bit `labelField`; longer ones
    /// spill into dynamic records whose payload is a `long[]` whose FIRST
    /// element is the owning node id, not a label. Dropping that distinction
    /// would silently mislabel every node with more than a handful of labels.
    pub fn labels_of(&self, node: &NodeRecord, tokens: &TokenNames) -> Vec<String> {
        let ids: Vec<u32> = match node.inline_labels() {
            Some(ids) => ids,
            None => {
                let start = (node.label_field as u64 & 0x0F_FFFF_FFFF) as i64;
                match super::value::concat_chain(&node.dynamic_labels, start)
                    .ok()
                    .and_then(|bytes| decode_dynamic_array(&bytes).ok())
                {
                    Some(ArrayValue::Long(v)) | Some(ArrayValue::Int(v)) => {
                        v.into_iter().skip(1).map(|x| x as u32).collect()
                    }
                    _ => Vec::new(),
                }
            }
        };
        ids.into_iter()
            .map(|id| {
                tokens
                    .labels
                    .get(&(id as i32))
                    .cloned()
                    .unwrap_or_else(|| format!("label#{id}"))
            })
            .collect()
    }

    fn properties_by_rel_owner(&self) -> HashMap<i64, BTreeMap<u32, (PropertyValue, i64)>> {
        let mut out: HashMap<i64, BTreeMap<u32, (PropertyValue, i64)>> = HashMap::new();
        for record in self.props.values() {
            if !record.in_use {
                continue;
            }
            let Some(rel_id) = record.rel_id else { continue };
            let tx = self.prop_tx.get(&record.id).copied().unwrap_or(-1);
            let entry = out.entry(rel_id).or_default();
            for block in &record.blocks {
                if let Ok(decoded) = decode_block(&block.blocks, &block.value_records) {
                    match entry.get(&decoded.key_id) {
                        Some((_, seen)) if *seen >= tx => {}
                        _ => {
                            entry.insert(decoded.key_id, (decoded.value, tx));
                        }
                    }
                }
            }
        }
        out
    }

    /// Every in-use relationship at the stop point.
    pub fn relationships(&self, tokens: &TokenNames) -> Vec<RelState> {
        let by_owner = self.properties_by_rel_owner();
        let mut out = Vec::new();
        for rel in self.rels.values() {
            if !rel.in_use {
                continue;
            }
            let type_name = tokens
                .relationship_types
                .get(&rel.type_id)
                .cloned()
                .unwrap_or_else(|| format!("type#{}", rel.type_id));
            let mut properties = BTreeMap::new();
            if let Some(raw) = by_owner.get(&rel.id) {
                for (key_id, (value, tx)) in raw {
                    let name = tokens
                        .property_keys
                        .get(&(*key_id as i32))
                        .cloned()
                        .unwrap_or_else(|| format!("key#{key_id}"));
                    properties.insert(name, (value.clone(), *tx));
                }
            }
            out.push(RelState {
                rel_id: rel.id,
                type_name,
                start_node: rel.first_node,
                end_node: rel.second_node,
                properties,
            });
        }
        out.sort_by_key(|r| r.rel_id);
        out
    }

    /// node id -> coordinate, for resolving relationship endpoints.
    pub fn node_coordinates(&self, tokens: &TokenNames) -> HashMap<i64, String> {
        self.coordinate_nodes(tokens)
            .into_iter()
            .filter_map(|n| n.coordinate().map(|c| (n.node_id, c.to_string())))
            .collect()
    }
}

/// Count node deletions per transaction — the mass delete is an obvious outlier.
pub fn find_mass_delete(decoder: &TxLogDecoder) -> Result<Option<(i64, usize)>, DecodeError> {
    let mut best: Option<(i64, usize)> = None;
    decoder.decode(|tx, _| {
        let deletions = tx
            .commands
            .iter()
            .filter(|c| matches!(c, Command::Node { before, after } if before.in_use && !after.in_use))
            .count();
        if deletions > best.map(|(_, n)| n).unwrap_or(0) {
            best = Some((tx.tx_id, deletions));
        }
    })?;
    Ok(best)
}

/// Replay every transaction with `tx_id < stop_before`, returning the store,
/// the harvested token names, and replay stats.
pub fn replay_until(
    decoder: &TxLogDecoder,
    stop_before: i64,
) -> Result<(ReplayStore, TokenNames, ReplayStats), DecodeError> {
    let mut store = ReplayStore::default();
    let mut stats = ReplayStats { stopped_before_tx: Some(stop_before), ..Default::default() };
    let mut largest: Option<(i64, usize)> = None;

    let (_, tokens) = decoder.decode(|tx, _| {
        if tx.tx_id >= stop_before {
            return;
        }
        let deletions = tx
            .commands
            .iter()
            .filter(|c| matches!(c, Command::Node { before, after } if before.in_use && !after.in_use))
            .count();
        if deletions > largest.map(|(_, n)| n).unwrap_or(0) {
            largest = Some((tx.tx_id, deletions));
        }
        store.apply(tx);
        stats.transactions_applied += 1;
    })?;

    stats.nodes_in_use = store.nodes.values().filter(|n| n.in_use).count();
    stats.property_records_in_use = store.props.values().filter(|p| p.in_use).count();
    stats.largest_delete_tx = largest;
    Ok((store, tokens, stats))
}

/// Render a property value as a Cypher literal.
pub fn cypher_literal(value: &PropertyValue) -> Option<String> {
    Some(match value {
        PropertyValue::Bool(b) => b.to_string(),
        PropertyValue::Int(i) => i.to_string(),
        PropertyValue::Float(f) => {
            if f.is_finite() {
                format!("{f:?}")
            } else {
                return None;
            }
        }
        PropertyValue::Char(c) => cypher_string(&c.to_string()),
        PropertyValue::Text(t) => cypher_string(t),
        PropertyValue::Array(a) => {
            use super::value::ArrayValue;
            let items: Vec<String> = match a {
                ArrayValue::Text(v) => v.iter().map(|s| cypher_string(s)).collect(),
                ArrayValue::Bool(v) => v.iter().map(|b| b.to_string()).collect(),
                ArrayValue::Byte(v)
                | ArrayValue::Short(v)
                | ArrayValue::Int(v)
                | ArrayValue::Long(v) => v.iter().map(|i| i.to_string()).collect(),
                ArrayValue::Float(v) | ArrayValue::Double(v) => {
                    if v.iter().any(|f| !f.is_finite()) {
                        return None;
                    }
                    v.iter().map(|f| format!("{f:?}")).collect()
                }
                ArrayValue::Char(v) => v.iter().map(|c| cypher_string(&c.to_string())).collect(),
            };
            format!("[{}]", items.join(", "))
        }
        // Not interpreted by this decoder — never emitted as a guess.
        PropertyValue::Unsupported { .. } => return None,
    })
}

fn cypher_string(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 2);
    out.push('\'');
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cypher_strings_escape_quotes_and_newlines() {
        let v = PropertyValue::Text("it's\nfine\\".to_string());
        assert_eq!(cypher_literal(&v).unwrap(), "'it\\'s\\nfine\\\\'");
    }

    #[test]
    fn undecoded_values_are_never_emitted_as_a_guess() {
        let v = PropertyValue::Unsupported { kind: "TEMPORAL", blocks: vec![1, 2] };
        assert!(cypher_literal(&v).is_none());
    }

    #[test]
    fn string_arrays_render_as_cypher_lists() {
        use super::super::value::ArrayValue;
        let v = PropertyValue::Array(ArrayValue::Text(vec!["a".into(), "b'c".into()]));
        assert_eq!(cypher_literal(&v).unwrap(), "['a', 'b\\'c']");
    }
}

/// Diagnostics for the replayed store — used to prove the chain walk is not
/// silently losing records.
#[derive(Debug, Default)]
pub struct ChainDiagnostics {
    pub nodes_in_use: usize,
    pub nodes_with_prop_chain: usize,
    pub prop_records_in_use: usize,
    pub prop_records_with_node_owner: usize,
    pub distinct_owner_nodes: usize,
    pub chain_head_missing: usize,
    pub chain_head_not_in_use: usize,
}

impl ReplayStore {
    /// Why chain walks stop: (missing, not_in_use, reached_end, hit_guard, total_records_visited)
    /// For one node id: (chain-walk record ids, owner-claimed record ids).
    pub fn probe_node(&self, node_id: i64) -> (Vec<i64>, Vec<i64>) {
        let mut chain = Vec::new();
        if let Some(node) = self.nodes.get(&node_id) {
            let mut cursor = node.next_prop;
            let mut guard = 0;
            while cursor >= 0 && guard < 10_000 {
                guard += 1;
                let Some(r) = self.props.get(&cursor) else { break };
                if !r.in_use { break; }
                chain.push(r.id);
                cursor = r.next_prop;
            }
        }
        let mut owned: Vec<i64> = self
            .props
            .values()
            .filter(|r| r.in_use && r.node_id == Some(node_id))
            .map(|r| r.id)
            .collect();
        owned.sort_unstable();
        (chain, owned)
    }

    /// Node ids whose latest in-use record set claims the given coordinate text.
    pub fn nodes_for_coordinate(&self, tokens: &TokenNames, coord: &str) -> Vec<i64> {
        let key = tokens.property_keys.iter().find(|(_, n)| n.as_str() == "coordinate").map(|(i, _)| *i);
        let Some(key) = key else { return Vec::new() };
        let mut out = Vec::new();
        for node in self.nodes.values() {
            if !node.in_use { continue; }
            let props = self.properties_of(node);
            if let Some((v, _)) = props.get(&(key as u32)) {
                if v.as_text() == Some(coord) { out.push(node.id); }
            }
        }
        out.sort_unstable();
        out
    }

    /// How many distinct node ids does owner-grouping give the same coordinate?
    pub fn owner_coordinate_spread(&self, tokens: &TokenNames, coord: &str) -> Vec<(i64, usize)> {
        let key = tokens.property_keys.iter().find(|(_, n)| n.as_str() == "coordinate").map(|(i, _)| *i);
        let Some(key) = key else { return Vec::new() };
        let by_owner = self.properties_by_owner();
        let mut out = Vec::new();
        for (node_id, props) in by_owner {
            if let Some((v, _)) = props.get(&(key as u32)) {
                if v.as_text() == Some(coord) {
                    out.push((node_id, props.len()));
                }
            }
        }
        out.sort_unstable();
        out
    }

    pub fn walk_reasons(&self) -> (usize, usize, usize, usize, usize) {
        let (mut missing, mut not_in_use, mut ended, mut guarded, mut visited) = (0, 0, 0, 0, 0);
        for node in self.nodes.values() {
            if !node.in_use {
                continue;
            }
            let mut cursor = node.next_prop;
            let mut guard = 0;
            loop {
                if cursor < 0 {
                    ended += 1;
                    break;
                }
                if guard >= 10_000 {
                    guarded += 1;
                    break;
                }
                guard += 1;
                match self.props.get(&cursor) {
                    None => {
                        missing += 1;
                        break;
                    }
                    Some(r) if !r.in_use => {
                        not_in_use += 1;
                        break;
                    }
                    Some(r) => {
                        visited += 1;
                        cursor = r.next_prop;
                    }
                }
            }
        }
        (missing, not_in_use, ended, guarded, visited)
    }

    pub fn diagnostics(&self) -> ChainDiagnostics {
        let mut d = ChainDiagnostics::default();
        let mut owners = std::collections::HashSet::new();
        for p in self.props.values() {
            if !p.in_use {
                continue;
            }
            d.prop_records_in_use += 1;
            if let Some(n) = p.node_id {
                d.prop_records_with_node_owner += 1;
                owners.insert(n);
            }
        }
        d.distinct_owner_nodes = owners.len();
        for n in self.nodes.values() {
            if !n.in_use {
                continue;
            }
            d.nodes_in_use += 1;
            if n.next_prop < 0 {
                continue;
            }
            d.nodes_with_prop_chain += 1;
            match self.props.get(&n.next_prop) {
                None => d.chain_head_missing += 1,
                Some(p) if !p.in_use => d.chain_head_not_in_use += 1,
                Some(_) => {}
            }
        }
        d
    }
}
