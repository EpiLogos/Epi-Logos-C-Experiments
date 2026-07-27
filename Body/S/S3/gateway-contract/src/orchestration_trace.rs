//! The deterministic orchestration trace (50.T50.14).
//!
//! # Why this shape exists
//!
//! Track 50 makes a single generated TypeScript program the way an agent
//! composes tool calls. That is a token win, but it costs the learning
//! substrate its input: everything downstream that scores a run — `aeon_eval`
//! most directly — derives its behavioural metrics by counting
//! [`HarnessTurnEvent::ToolCallObserved`] entries in the session transcript.
//! One script emits one turn, so a code-mode run that did fifty reads and ten
//! edits reads as ZERO of each. The measurement goes blind exactly when the
//! orchestration works as designed.
//!
//! This is the replacement unit. It is the operation over a fixed vocabulary
//! rather than accreted stdout, which is what makes it both dense and
//! REPLAYABLE: the same score, re-run, yields the same ops in the same order,
//! so the metrics derived from it reproduce.
//!
//! # What it deliberately does not carry
//!
//! No transcripts, no tool results, no child output. An op records THAT an
//! operation of a class happened, under which coordinate, in which step — not
//! what it returned. The compounding-history problem is the thing being
//! escaped; carrying results here would re-create it one layer down.

use serde::{Deserialize, Serialize};

use crate::VakAddress;

/// One operation a code-mode script performed.
///
/// `operation` and `command` are the two fields the existing classifier reads
/// (`redis-context` `aeon_eval::classify_tool` looks at a tool NAME and, for a
/// shell exec, its `cmd`/`command` text). They are named to match so the
/// classification law stays in one place instead of being restated here.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrchestrationTraceOp {
    /// The orchestration step this op belongs to.
    pub step_id: String,
    /// The tool/function name invoked — `read`, `apply_patch`, `bash`, …
    pub operation: String,
    /// The command text, when the operation was a shell exec. Absent otherwise;
    /// never an empty string standing in for absence.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub command: Option<String>,
    /// The agent that held the step, when one did.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub agent: Option<String>,
    /// The step's coordinate. An op without one is still a valid op — the
    /// envelope belongs to the step, and not every op site carries it.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub vak_address: Option<VakAddress>,
}

/// What the run cost. Mirrors the field names `aeon_eval` already reads off
/// `turnComplete.usage`, so one reader serves both units.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrchestrationTraceUsage {
    /// Model round-trips the run actually took. For a code-mode run this is
    /// the number the staircase would have inflated.
    pub turns: u64,
    pub input_tokens: u64,
    pub output_tokens: u64,
    pub total_tokens: u64,
}

/// A completed orchestration, as the unit fed to learning.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrchestrationTrace {
    /// The score this run executed.
    pub score_id: String,
    /// The content hash the score carried when it ran.
    ///
    /// This is what makes a replay checkable rather than merely repeated: two
    /// runs of the same `score_hash` are runs of the same PROGRAM, so metrics
    /// that differ between them are a finding, not a coincidence.
    pub score_hash: String,
    pub run_id: String,
    pub ops: Vec<OrchestrationTraceOp>,
    pub usage: OrchestrationTraceUsage,
}

/// The transcript `kind` an orchestration trace is written under.
///
/// Readers match this string; it is part of the on-disk contract and changing
/// it silently orphans every trace already written.
pub const ORCHESTRATION_TRACE_KIND: &str = "orchestration_trace";
