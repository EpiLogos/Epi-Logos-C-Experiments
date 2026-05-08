use std::cmp::Ordering;
use std::collections::{HashMap, HashSet};

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

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct HybridFusionConfig {
    pub rrf_k: u32,
    pub coordinate_boost: f64,
}

impl Default for HybridFusionConfig {
    fn default() -> Self {
        Self {
            rrf_k: 60,
            coordinate_boost: 1.5,
        }
    }
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

pub fn tokenize_query(query_text: &str) -> Vec<String> {
    let mut tokens = Vec::new();
    let mut seen = HashSet::new();

    for token in query_text.split_whitespace() {
        let cleaned = token
            .trim_matches(|c: char| !c.is_alphanumeric() && c != '#' && c != '_' && c != '\'')
            .to_lowercase();
        if cleaned.len() < 2 {
            continue;
        }
        if matches!(
            cleaned.as_str(),
            "how"
                | "does"
                | "what"
                | "where"
                | "show"
                | "list"
                | "all"
                | "the"
                | "and"
                | "for"
                | "with"
                | "from"
                | "into"
                | "work"
                | "works"
        ) {
            continue;
        }
        if seen.insert(cleaned.clone()) {
            tokens.push(cleaned);
        }
    }

    if tokens.is_empty() {
        let fallback = query_text.trim().to_lowercase();
        if !fallback.is_empty() {
            tokens.push(fallback);
        }
    }

    tokens
}

pub fn fusion_rrf_results(
    vector_results: &[RetrievalResult],
    graph_results: &[RetrievalResult],
    config: HybridFusionConfig,
) -> Vec<RetrievalResult> {
    let mut scores: HashMap<String, f64> = HashMap::new();
    let mut data_map: HashMap<String, serde_json::Value> = HashMap::new();

    for (rank, result) in vector_results.iter().enumerate() {
        let rrf = 1.0 / (config.rrf_k as f64 + rank as f64 + 1.0);
        *scores.entry(result.coordinate.clone()).or_default() += rrf;
        data_map
            .entry(result.coordinate.clone())
            .or_insert_with(|| result.data.clone());
    }

    for (rank, result) in graph_results.iter().enumerate() {
        let rrf = 1.0 / (config.rrf_k as f64 + rank as f64 + 1.0);
        *scores.entry(result.coordinate.clone()).or_default() += rrf * config.coordinate_boost;
        data_map
            .entry(result.coordinate.clone())
            .or_insert_with(|| result.data.clone());
    }

    let mut results: Vec<RetrievalResult> = scores
        .into_iter()
        .map(|(coordinate, score)| RetrievalResult {
            data: data_map.remove(&coordinate).unwrap_or_default(),
            coordinate,
            score,
            source: "hybrid-rrf".into(),
        })
        .collect();
    results.sort_by(|left, right| {
        right
            .score
            .partial_cmp(&left.score)
            .unwrap_or(Ordering::Equal)
            .then_with(|| left.coordinate.cmp(&right.coordinate))
    });
    results
}

pub fn fusion_weighted_results(
    vector_results: &[RetrievalResult],
    graph_results: &[RetrievalResult],
    alpha: f64,
    config: HybridFusionConfig,
) -> Vec<RetrievalResult> {
    let mut scores: HashMap<String, (f64, serde_json::Value)> = HashMap::new();

    for result in vector_results {
        let entry = scores
            .entry(result.coordinate.clone())
            .or_insert((0.0, result.data.clone()));
        entry.0 += alpha * result.score;
    }
    for result in graph_results {
        let entry = scores
            .entry(result.coordinate.clone())
            .or_insert((0.0, result.data.clone()));
        entry.0 += (1.0 - alpha) * result.score * config.coordinate_boost;
    }

    let mut results: Vec<RetrievalResult> = scores
        .into_iter()
        .map(|(coordinate, (score, data))| RetrievalResult {
            coordinate,
            score,
            source: "hybrid-weighted".into(),
            data,
        })
        .collect();
    results.sort_by(|left, right| {
        right
            .score
            .partial_cmp(&left.score)
            .unwrap_or(Ordering::Equal)
            .then_with(|| left.coordinate.cmp(&right.coordinate))
    });
    results
}
