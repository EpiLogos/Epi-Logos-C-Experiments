use std::collections::HashSet;

use crate::CoordinateArrayParser;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DisclosureLevel {
    UuidOnly = 0,
    Identity = 1,
    Summary = 2,
    Content = 3,
    Connected = 4,
    Complete = 5,
}

impl DisclosureLevel {
    pub fn from_u8(n: u8) -> Self {
        match n {
            0 => Self::UuidOnly,
            1 => Self::Identity,
            2 => Self::Summary,
            3 => Self::Content,
            4 => Self::Connected,
            _ => Self::Complete,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum QueryType {
    WhatIs,
    HowDoes,
    WhereIs,
    ListAll,
    RelatedTo,
    Navigate,
    General,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RetrievalMode {
    VectorOnly,
    GraphOnly,
    HybridRrf,
    HybridWeighted,
}

impl RetrievalMode {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::VectorOnly => "vector_only",
            Self::GraphOnly => "graph_only",
            Self::HybridRrf => "hybrid_rrf",
            Self::HybridWeighted => "hybrid_weighted",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct RetrievalResult {
    pub coordinate: String,
    pub score: f64,
    pub source: String,
    pub data: serde_json::Value,
}

impl QueryType {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::WhatIs => "what_is",
            Self::HowDoes => "how_does",
            Self::WhereIs => "where_is",
            Self::ListAll => "list_all",
            Self::RelatedTo => "related_to",
            Self::Navigate => "navigate",
            Self::General => "general",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GraphRetrievalQuery {
    pub text: String,
    pub query_type: QueryType,
    pub coordinate_mentions: Vec<String>,
    pub inferred_positions: Vec<u8>,
}

impl GraphRetrievalQuery {
    pub fn from_text(query_text: &str) -> Self {
        Self {
            text: query_text.to_string(),
            query_type: classify_query(query_text),
            coordinate_mentions: extract_coordinate_mentions(query_text),
            inferred_positions: infer_positions(query_text),
        }
    }
}

pub fn classify_query(query_text: &str) -> QueryType {
    let lower = query_text.trim().to_lowercase();
    if lower.starts_with("what is") || lower.starts_with("what's") || lower.starts_with("what are")
    {
        QueryType::WhatIs
    } else if lower.starts_with("how does")
        || lower.starts_with("how do")
        || lower.starts_with("how to")
    {
        QueryType::HowDoes
    } else if lower.starts_with("where is")
        || lower.starts_with("where are")
        || lower.starts_with("where can")
    {
        QueryType::WhereIs
    } else if lower.starts_with("list")
        || lower.starts_with("show all")
        || lower.starts_with("get all")
    {
        QueryType::ListAll
    } else if lower.contains("related to") || lower.contains("connected to") {
        QueryType::RelatedTo
    } else if lower.contains(" from ") && lower.contains(" to ") {
        QueryType::Navigate
    } else {
        QueryType::General
    }
}

pub fn extract_coordinate_mentions(query_text: &str) -> Vec<String> {
    let mut results = Vec::new();
    let mut seen = HashSet::new();

    for token in query_text.split_whitespace() {
        let cleaned =
            token.trim_matches(|c: char| !c.is_alphanumeric() && c != '#' && c != '_' && c != '\'');
        if cleaned.is_empty() {
            continue;
        }
        if CoordinateArrayParser::parse_one(cleaned).is_ok() && seen.insert(cleaned.to_string()) {
            results.push(cleaned.to_string());
        }
    }

    results
}

pub fn infer_positions(query_text: &str) -> Vec<u8> {
    let lower = query_text.to_lowercase();
    let semantics: &[(u8, &[&str])] = &[
        (0, &["ground", "foundation", "base", "core", "fundamental"]),
        (1, &["definition", "concept", "meaning", "form"]),
        (2, &["operation", "process", "method", "function"]),
        (3, &["pattern", "structure", "archetype", "template"]),
        (4, &["context", "situation", "environment"]),
        (
            5,
            &["integration", "integrate", "synthesis", "whole", "meta"],
        ),
    ];

    semantics
        .iter()
        .filter_map(|(position, words)| {
            words
                .iter()
                .any(|word| lower.contains(word))
                .then_some(*position)
        })
        .collect()
}

pub fn disclosure_for_query_type(query_type: QueryType, depth: u32) -> DisclosureLevel {
    if depth >= 3 {
        return DisclosureLevel::Complete;
    }

    match query_type {
        QueryType::WhatIs => DisclosureLevel::Summary,
        QueryType::WhereIs | QueryType::ListAll => DisclosureLevel::Identity,
        QueryType::HowDoes | QueryType::RelatedTo | QueryType::Navigate => {
            if depth > 1 {
                DisclosureLevel::Complete
            } else {
                DisclosureLevel::Connected
            }
        }
        QueryType::General => {
            if depth > 1 {
                DisclosureLevel::Connected
            } else {
                DisclosureLevel::Summary
            }
        }
    }
}
