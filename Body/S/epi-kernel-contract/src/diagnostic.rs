//! Anuttara symbolic-coordinate diagnostic notation.
//!
//! The grammar follows mental-pole mechanics §6:
//!
//! ```text
//! diagnostic := expression (";" expression)*
//! expression := "○"                                  // void / coherence recognised
//!             | "?" inner                            // question marker
//!             | inner
//! inner      := coord "{" position-list "}"          // position emphasis
//!             | coord "→" coord                      // descent relation
//!             | coord "⟷" coord                     // mirror pair
//!             | coord "≠" "⟦vector⟧"                // resonance discrepancy
//!             | coord                                // bare coordinate
//! coord      := ("#" | "M") segment ("-" segment | "." segment)* ("'" )?
//! segment    := digit+
//! ```
//!
//! The parser is deterministic and operates on the raw string Anuttara
//! emitted — no LLM judgement intervenes. The output is consumed by the
//! Anuttara skill which translates each expression into natural-language
//! reflection.

use serde::{Deserialize, Serialize};

/// Parsed Anuttara diagnostic, carrying the raw symbolic string and the
/// expressions extracted from it.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct AnuttaraDiagnostic {
    pub raw_expression: String,
    pub coordinate_owner: String,
    pub questions: Vec<AnuttaraExpression>,
    pub coherence_recognised: bool,
    pub source_constraint: Option<String>,
}

impl AnuttaraDiagnostic {
    /// The canonical Anuttara coordinate owner. Set at parse-time.
    pub const COORDINATE_OWNER: &'static str = "M0/Anuttara";

    /// Construct an explicit silence diagnostic (the `○` response).
    pub fn silence() -> Self {
        Self {
            raw_expression: "○".to_owned(),
            coordinate_owner: Self::COORDINATE_OWNER.to_owned(),
            questions: Vec::new(),
            coherence_recognised: true,
            source_constraint: None,
        }
    }

    /// Parse an Anuttara symbolic string into a diagnostic. Multiple
    /// expressions separated by `;` are collected into `questions`.
    /// A standalone `○` token sets `coherence_recognised = true` and
    /// produces no questions.
    pub fn parse(raw: &str) -> Result<Self, AnuttaraParseError> {
        let trimmed = raw.trim();
        if trimmed.is_empty() {
            return Err(AnuttaraParseError::Empty);
        }

        if trimmed == "○" {
            return Ok(Self::silence());
        }

        let mut questions = Vec::new();
        let mut coherence = false;
        for segment in trimmed.split(';') {
            let segment = segment.trim();
            if segment.is_empty() {
                continue;
            }
            if segment == "○" {
                coherence = true;
                continue;
            }
            questions.push(parse_expression(segment)?);
        }

        if questions.is_empty() && !coherence {
            return Err(AnuttaraParseError::Empty);
        }

        Ok(Self {
            raw_expression: raw.to_owned(),
            coordinate_owner: Self::COORDINATE_OWNER.to_owned(),
            questions,
            coherence_recognised: coherence,
            source_constraint: None,
        })
    }

    /// Attach the constraint that produced this diagnostic (per
    /// mental-pole mechanics §8 constraint registry).
    pub fn with_source_constraint(mut self, constraint: impl Into<String>) -> Self {
        self.source_constraint = Some(constraint.into());
        self
    }

    /// Render the diagnostic back to canonical symbolic form. Used for
    /// round-trip checks and for re-emitting after typed manipulation.
    pub fn render(&self) -> String {
        if self.questions.is_empty() && self.coherence_recognised {
            return "○".to_owned();
        }
        let mut parts: Vec<String> = self.questions.iter().map(AnuttaraExpression::render).collect();
        if self.coherence_recognised {
            parts.push("○".to_owned());
        }
        parts.join("; ")
    }
}

/// One Anuttara symbolic expression. The variants follow the spec
/// notation precisely.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "kebab-case")]
pub enum AnuttaraExpression {
    Coordinate {
        coord: String,
    },
    HelixPrime {
        coord: String,
    },
    PositionEmphasis {
        coord: String,
        positions: Vec<u8>,
    },
    Relation {
        source: String,
        target: String,
    },
    MirrorPair {
        first: String,
        second: String,
    },
    ResonanceDiscrepancy {
        coord: String,
    },
    Question {
        inner: Box<AnuttaraExpression>,
    },
}

impl AnuttaraExpression {
    pub fn render(&self) -> String {
        match self {
            Self::Coordinate { coord } => coord.clone(),
            Self::HelixPrime { coord } => format!("{coord}'"),
            Self::PositionEmphasis { coord, positions } => {
                let inner = positions
                    .iter()
                    .map(u8::to_string)
                    .collect::<Vec<_>>()
                    .join(",");
                format!("{coord}{{{inner}}}")
            }
            Self::Relation { source, target } => format!("{source} → {target}"),
            Self::MirrorPair { first, second } => format!("{first} ⟷ {second}"),
            Self::ResonanceDiscrepancy { coord } => format!("{coord} ≠ ⟦vector⟧"),
            Self::Question { inner } => format!("?{}", inner.render()),
        }
    }
}

/// Errors produced by the Anuttara symbolic parser.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "kebab-case")]
pub enum AnuttaraParseError {
    Empty,
    InvalidCoordinate { token: String },
    InvalidPositionList { token: String },
    UnknownOperator { token: String },
}

impl std::fmt::Display for AnuttaraParseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Empty => write!(f, "anuttara expression was empty"),
            Self::InvalidCoordinate { token } => {
                write!(f, "invalid anuttara coordinate token: {token}")
            }
            Self::InvalidPositionList { token } => {
                write!(f, "invalid position emphasis list: {token}")
            }
            Self::UnknownOperator { token } => {
                write!(f, "unknown anuttara operator in: {token}")
            }
        }
    }
}

impl std::error::Error for AnuttaraParseError {}

fn parse_expression(segment: &str) -> Result<AnuttaraExpression, AnuttaraParseError> {
    let segment = segment.trim();
    if let Some(rest) = segment.strip_prefix('?') {
        let inner = parse_inner(rest.trim_start())?;
        return Ok(AnuttaraExpression::Question {
            inner: Box::new(inner),
        });
    }
    parse_inner(segment)
}

fn parse_inner(segment: &str) -> Result<AnuttaraExpression, AnuttaraParseError> {
    let segment = segment.trim();

    if let Some((lhs, rhs)) = split_once_with_separator(segment, "≠") {
        let coord = parse_coordinate_token(lhs.trim())?;
        let marker = rhs.trim();
        if marker != "⟦vector⟧" {
            return Err(AnuttaraParseError::UnknownOperator {
                token: segment.to_owned(),
            });
        }
        return Ok(AnuttaraExpression::ResonanceDiscrepancy { coord });
    }

    if let Some((lhs, rhs)) = split_once_with_separator(segment, "⟷") {
        let first = parse_coordinate_token(lhs.trim())?;
        let second = parse_coordinate_token(rhs.trim())?;
        return Ok(AnuttaraExpression::MirrorPair { first, second });
    }

    if let Some((lhs, rhs)) = split_once_with_separator(segment, "→") {
        let source = parse_coordinate_token(lhs.trim())?;
        let target = parse_coordinate_token(rhs.trim())?;
        return Ok(AnuttaraExpression::Relation { source, target });
    }

    if let Some((coord_token, list_token)) = split_position_emphasis(segment) {
        let coord = parse_coordinate_token(coord_token)?;
        let positions = parse_position_list(list_token)?;
        return Ok(AnuttaraExpression::PositionEmphasis { coord, positions });
    }

    if let Some(stripped) = segment.strip_suffix('\'') {
        let coord = parse_coordinate_token(stripped)?;
        return Ok(AnuttaraExpression::HelixPrime { coord });
    }

    let coord = parse_coordinate_token(segment)?;
    Ok(AnuttaraExpression::Coordinate { coord })
}

fn parse_coordinate_token(token: &str) -> Result<String, AnuttaraParseError> {
    let trimmed = token.trim();
    if trimmed.is_empty() {
        return Err(AnuttaraParseError::InvalidCoordinate {
            token: token.to_owned(),
        });
    }
    let first = trimmed.chars().next().unwrap();
    if !(first == '#' || first == 'M') {
        return Err(AnuttaraParseError::InvalidCoordinate {
            token: token.to_owned(),
        });
    }
    let mut iter = trimmed.chars();
    iter.next();
    for ch in iter {
        if !(ch.is_ascii_digit() || ch == '-' || ch == '.' || ch == '\'') {
            return Err(AnuttaraParseError::InvalidCoordinate {
                token: token.to_owned(),
            });
        }
    }
    Ok(trimmed.to_owned())
}

fn parse_position_list(list: &str) -> Result<Vec<u8>, AnuttaraParseError> {
    let mut out = Vec::new();
    for chunk in list.split(',') {
        let chunk = chunk.trim();
        let n = chunk
            .parse::<u8>()
            .map_err(|_| AnuttaraParseError::InvalidPositionList {
                token: list.to_owned(),
            })?;
        if n >= 6 {
            return Err(AnuttaraParseError::InvalidPositionList {
                token: list.to_owned(),
            });
        }
        out.push(n);
    }
    if out.is_empty() {
        return Err(AnuttaraParseError::InvalidPositionList {
            token: list.to_owned(),
        });
    }
    Ok(out)
}

fn split_position_emphasis(segment: &str) -> Option<(&str, &str)> {
    let open = segment.find('{')?;
    let close = segment.rfind('}')?;
    if close <= open + 1 {
        return None;
    }
    let coord = &segment[..open];
    let list = &segment[open + 1..close];
    Some((coord, list))
}

fn split_once_with_separator<'a>(segment: &'a str, sep: &str) -> Option<(&'a str, &'a str)> {
    let idx = segment.find(sep)?;
    let after = idx + sep.len();
    Some((&segment[..idx], &segment[after..]))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn silence_round_trips() {
        let diag = AnuttaraDiagnostic::parse("○").expect("silence parses");
        assert!(diag.coherence_recognised);
        assert!(diag.questions.is_empty());
        assert_eq!(diag.render(), "○");
    }

    #[test]
    fn position_emphasis_question_round_trips() {
        let raw = "?#2-1-3-4{2,4}; ?#2-1-5-0 ⟷ #4.4.4.4";
        let diag = AnuttaraDiagnostic::parse(raw).expect("complex diag parses");
        assert_eq!(diag.questions.len(), 2);
        match &diag.questions[0] {
            AnuttaraExpression::Question { inner } => match inner.as_ref() {
                AnuttaraExpression::PositionEmphasis { coord, positions } => {
                    assert_eq!(coord, "#2-1-3-4");
                    assert_eq!(positions, &vec![2, 4]);
                }
                other => panic!("expected position emphasis, got {other:?}"),
            },
            other => panic!("expected question, got {other:?}"),
        }
        match &diag.questions[1] {
            AnuttaraExpression::Question { inner } => match inner.as_ref() {
                AnuttaraExpression::MirrorPair { first, second } => {
                    assert_eq!(first, "#2-1-5-0");
                    assert_eq!(second, "#4.4.4.4");
                }
                other => panic!("expected mirror pair, got {other:?}"),
            },
            other => panic!("expected question, got {other:?}"),
        }
        let rendered = diag.render();
        let reparsed = AnuttaraDiagnostic::parse(&rendered).expect("re-parses cleanly");
        assert_eq!(diag.questions, reparsed.questions);
    }

    #[test]
    fn resonance_discrepancy_and_helix_prime_parse() {
        let diag = AnuttaraDiagnostic::parse("#2-1-3-4 ≠ ⟦vector⟧; M0-2'").expect("parses");
        assert_eq!(diag.questions.len(), 2);
        assert!(matches!(
            diag.questions[0],
            AnuttaraExpression::ResonanceDiscrepancy { .. }
        ));
        assert!(matches!(
            diag.questions[1],
            AnuttaraExpression::HelixPrime { .. }
        ));
    }

    #[test]
    fn relation_arrow_parses() {
        let diag = AnuttaraDiagnostic::parse("#2-1-3-4 → #2-1-3-5").expect("parses");
        match &diag.questions[0] {
            AnuttaraExpression::Relation { source, target } => {
                assert_eq!(source, "#2-1-3-4");
                assert_eq!(target, "#2-1-3-5");
            }
            other => panic!("expected relation, got {other:?}"),
        }
    }

    #[test]
    fn invalid_coordinate_token_is_rejected() {
        assert!(matches!(
            AnuttaraDiagnostic::parse("XYZ-1"),
            Err(AnuttaraParseError::InvalidCoordinate { .. })
        ));
        assert!(matches!(
            AnuttaraDiagnostic::parse("#2-1-3-4{9}"),
            Err(AnuttaraParseError::InvalidPositionList { .. })
        ));
        assert!(matches!(
            AnuttaraDiagnostic::parse(""),
            Err(AnuttaraParseError::Empty)
        ));
    }

    #[test]
    fn source_constraint_is_attachable() {
        let diag = AnuttaraDiagnostic::parse("?#2-1-3-4")
            .unwrap()
            .with_source_constraint("mid_position_adjacency");
        assert_eq!(diag.source_constraint.as_deref(), Some("mid_position_adjacency"));
    }

    #[test]
    fn serde_round_trip_preserves_structure() {
        let diag = AnuttaraDiagnostic::parse("?#2-1-3-4{2,4}; ○").expect("parses");
        let json = serde_json::to_string(&diag).expect("serialises");
        let restored: AnuttaraDiagnostic = serde_json::from_str(&json).expect("deserialises");
        assert_eq!(diag, restored);
    }
}
