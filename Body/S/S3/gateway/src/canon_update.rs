//! 40.T40.1 — `s5'.canon_update.*` gateway route family (S3 native handler).
//!
//! The Track 40 bimba-canon-update ledger runtime is the S3-native authority
//! behind the five `s5'.canon_update.*` routes registered in
//! [`epi_s3_gateway_contract`]. It owns the in-process ledger of *additive*
//! canon-update proposals (identities, forms, entities, typed relations,
//! vocabulary, cross-references) and produces the contract receipts that
//! gateway clients and the `epi bimba` CLI consume.
//!
//! **ONE-substrate compliance (DR-S5-ONE-1).** Every route pairs with an
//! `epi bimba ...` CLI command driving THIS same runtime, so a row proposed
//! via CLI follows the identical lifecycle as one proposed via gateway.
//!
//! **SUBSTRATE, not nara personal access (05.T5.10).** The canon-update ledger
//! is a governed substrate surface, never one of the personal nara domains
//! (jiva/jagrat/flow). The bounded-access gate
//! ([`crate::dispatch::nara_bounded_access`]) therefore denies every
//! `s5'.canon_update.*` method — proven by
//! [`tests::canon_update_is_substrate_not_nara_bounded_access`].
//!
//! **Lifecycle (Track 40 §Lifecycle).** `surfaced → designed → reviewed →
//! validated → landed`, with `refused`/`deferred`/`superseded` as off-spine
//! closures. [`propose`](CanonUpdateRuntime::propose) drafts at `surfaced`;
//! [`advance`](CanonUpdateRuntime::advance) walks the forward spine (the
//! designed/reviewed/validated intake other tranches drive: Sophia disclosure,
//! co-review, user validation); [`land`](CanonUpdateRuntime::land) closes an
//! active row to `landed` and authors the `<!-- canon-update: CU-* -->` marker
//! the ledger hands to Hen (the ledger is the only legal source of markers,
//! §Cross-reference discipline).

use std::collections::BTreeMap;
use std::fmt;

use epi_s3_gateway_contract::{
    CanonUpdateCategory, CanonUpdateDraftReceipt, CanonUpdateFilter, CanonUpdateLandConfirmation,
    CanonUpdateLandedMarker, CanonUpdateRefusal, CanonUpdateRow, CanonUpdateState,
    CanonUpdateStatus,
};
use serde::{Deserialize, Serialize};

/// Fallback landing site when a row carries no `target_landing_hint`.
const DEFAULT_LEDGER_PATH: &str =
    "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/40-bimba-canon-update-ledger.md";

/// Errors raised by the canon-update route family.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum CanonUpdateError {
    /// A blank claim was supplied to `propose`.
    EmptyClaim,
    /// The named CU row does not exist.
    UnknownRow(String),
    /// `land`/`refuse`/`advance` was invoked on a row already closed
    /// (landed/refused/superseded).
    RowClosed { id: String, state: CanonUpdateState },
    /// `advance` was asked to move backwards or off the forward spine.
    NonForwardTransition {
        id: String,
        from: CanonUpdateState,
        to: CanonUpdateState,
    },
}

impl fmt::Display for CanonUpdateError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::EmptyClaim => {
                write!(f, "refused: a canon-update proposal requires a non-empty claim")
            }
            Self::UnknownRow(id) => write!(f, "unknown canon-update row `{id}`"),
            Self::RowClosed { id, state } => write!(
                f,
                "canon-update row `{id}` is closed (status: {}) and cannot transition",
                state.as_str()
            ),
            Self::NonForwardTransition { id, from, to } => write!(
                f,
                "refused: canon-update row `{id}` cannot move from {} to {} (lifecycle is forward-only along the surfaced→designed→reviewed→validated spine)",
                from.as_str(),
                to.as_str()
            ),
        }
    }
}

impl std::error::Error for CanonUpdateError {}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RowState {
    id: String,
    category: CanonUpdateCategory,
    status: CanonUpdateState,
    claim: String,
    target_landing_hint: Option<String>,
    landed_marker: Option<CanonUpdateLandedMarker>,
    refusal_reason: Option<String>,
    surfaced_at_ms: u64,
    updated_at_ms: u64,
}

impl RowState {
    fn to_row(&self) -> CanonUpdateRow {
        CanonUpdateRow {
            id: self.id.clone(),
            category: self.category,
            status: self.status,
            claim: self.claim.clone(),
            target_landing_hint: self.target_landing_hint.clone(),
            landed_marker: self.landed_marker.clone(),
            refusal_reason: self.refusal_reason.clone(),
            surfaced_at_ms: self.surfaced_at_ms,
            updated_at_ms: self.updated_at_ms,
        }
    }

    fn to_status(&self) -> CanonUpdateStatus {
        CanonUpdateStatus {
            id: self.id.clone(),
            category: self.category,
            status: self.status,
            claim: self.claim.clone(),
            target_landing_hint: self.target_landing_hint.clone(),
            landed_marker: self.landed_marker.clone(),
            refusal_reason: self.refusal_reason.clone(),
        }
    }
}

/// In-process canon-update ledger runtime. Serializable so the `epi bimba` CLI
/// can persist it between invocations (mirroring the arena runtime).
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CanonUpdateRuntime {
    #[serde(default)]
    rows: BTreeMap<String, RowState>,
    /// Per-category sequential counter feeding `CU-{CODE}-{N}` ids.
    #[serde(default)]
    counters: BTreeMap<String, u32>,
}

impl CanonUpdateRuntime {
    /// `s5'.canon_update.propose` — draft a new CU row at `status: surfaced`.
    pub fn propose(
        &mut self,
        category: CanonUpdateCategory,
        claim: impl Into<String>,
        target_landing_hint: Option<String>,
        now_ms: u64,
    ) -> Result<CanonUpdateDraftReceipt, CanonUpdateError> {
        let claim = claim.into();
        if claim.trim().is_empty() {
            return Err(CanonUpdateError::EmptyClaim);
        }
        let hint = target_landing_hint.filter(|h| !h.trim().is_empty());
        let code = category.code();
        let next = self.counters.entry(code.to_owned()).or_insert(0);
        *next += 1;
        let id = format!("CU-{code}-{next}");
        let row = RowState {
            id: id.clone(),
            category,
            status: CanonUpdateState::Surfaced,
            claim: claim.clone(),
            target_landing_hint: hint.clone(),
            landed_marker: None,
            refusal_reason: None,
            surfaced_at_ms: now_ms,
            updated_at_ms: now_ms,
        };
        self.rows.insert(id.clone(), row);
        Ok(CanonUpdateDraftReceipt {
            id,
            category,
            status: CanonUpdateState::Surfaced,
            claim,
            target_landing_hint: hint,
            ratification_path: category.ratification_path().to_owned(),
            escalates_to_dr: category.escalates_to_dr(),
            surfaced_at_ms: now_ms,
        })
    }

    /// `s5'.canon_update.status` — the lifecycle view of one CU row.
    pub fn status(&self, id: &str) -> Result<CanonUpdateStatus, CanonUpdateError> {
        self.rows
            .get(id)
            .map(RowState::to_status)
            .ok_or_else(|| CanonUpdateError::UnknownRow(id.to_owned()))
    }

    /// `s5'.canon_update.list` — CU rows filtered by status / category, sorted
    /// by id.
    pub fn list(&self, filter: &CanonUpdateFilter) -> Vec<CanonUpdateRow> {
        self.rows
            .values()
            .filter(|row| filter.status.map(|s| row.status == s).unwrap_or(true))
            .filter(|row| {
                filter
                    .category
                    .map(|c| row.category == c)
                    .unwrap_or(true)
            })
            .map(RowState::to_row)
            .collect()
    }

    /// Forward-only lifecycle advance along the `surfaced → designed →
    /// reviewed → validated` spine (the intake other tranches drive: Sophia
    /// disclosure sets `designed`; co-review sets `reviewed`; user validation
    /// sets `validated`). Refuses backward moves, off-spine targets, and closed
    /// rows.
    pub fn advance(
        &mut self,
        id: &str,
        target: CanonUpdateState,
        now_ms: u64,
    ) -> Result<CanonUpdateStatus, CanonUpdateError> {
        let row = self
            .rows
            .get_mut(id)
            .ok_or_else(|| CanonUpdateError::UnknownRow(id.to_owned()))?;
        if !row.status.is_active() {
            return Err(CanonUpdateError::RowClosed {
                id: id.to_owned(),
                state: row.status,
            });
        }
        let from_rank = row.status.spine_rank();
        // `land` owns the transition to `landed`; `advance` only walks the
        // pre-landing spine (designed/reviewed/validated).
        let to_rank = target.spine_rank();
        let valid_forward = matches!(
            (from_rank, to_rank),
            (Some(f), Some(t)) if t > f && t < 4
        );
        if !valid_forward {
            return Err(CanonUpdateError::NonForwardTransition {
                id: id.to_owned(),
                from: row.status,
                to: target,
            });
        }
        row.status = target;
        row.updated_at_ms = now_ms;
        Ok(row.to_status())
    }

    /// `s5'.canon_update.land` — close an active CU row to `status: landed` and
    /// author the `<!-- canon-update: CU-* (landed YYYY-MM-DD) -->` marker for
    /// Hen to write into the target file (§Cross-reference discipline). Refuses
    /// an already-closed row.
    pub fn land(
        &mut self,
        id: &str,
        now_ms: u64,
    ) -> Result<CanonUpdateLandConfirmation, CanonUpdateError> {
        let date = date_from_millis(now_ms);
        let row = self
            .rows
            .get_mut(id)
            .ok_or_else(|| CanonUpdateError::UnknownRow(id.to_owned()))?;
        if !row.status.is_active() {
            return Err(CanonUpdateError::RowClosed {
                id: id.to_owned(),
                state: row.status,
            });
        }
        let (file, anchor) = split_landing_hint(row.target_landing_hint.as_deref(), &row.id);
        let marker = CanonUpdateLandedMarker {
            file,
            anchor,
            date: date.clone(),
        };
        row.status = CanonUpdateState::Landed;
        row.landed_marker = Some(marker.clone());
        row.updated_at_ms = now_ms;
        Ok(CanonUpdateLandConfirmation {
            id: id.to_owned(),
            status: CanonUpdateState::Landed,
            marker,
            frontmatter_index_entry: format!("{id}@{date}"),
        })
    }

    /// `s5'.canon_update.refuse` — close an active CU row as `status: refused`
    /// with a reason. Refuses an already-closed row.
    pub fn refuse(
        &mut self,
        id: &str,
        reason: impl Into<String>,
        now_ms: u64,
    ) -> Result<CanonUpdateRefusal, CanonUpdateError> {
        let reason = reason.into();
        let row = self
            .rows
            .get_mut(id)
            .ok_or_else(|| CanonUpdateError::UnknownRow(id.to_owned()))?;
        if !row.status.is_active() {
            return Err(CanonUpdateError::RowClosed {
                id: id.to_owned(),
                state: row.status,
            });
        }
        row.status = CanonUpdateState::Refused;
        row.refusal_reason = Some(reason.clone());
        row.updated_at_ms = now_ms;
        Ok(CanonUpdateRefusal {
            id: id.to_owned(),
            status: CanonUpdateState::Refused,
            reason,
        })
    }
}

/// Split a `target_landing_hint` into `(file, anchor)`. A hint of the shape
/// `path::anchor` splits on the first `::`; a bare path keeps a row-scoped
/// default anchor; an absent hint falls back to the ledger itself.
fn split_landing_hint(hint: Option<&str>, id: &str) -> (String, String) {
    match hint {
        Some(hint) => match hint.split_once("::") {
            Some((file, anchor)) => (file.trim().to_owned(), anchor.trim().to_owned()),
            None => (
                hint.trim().to_owned(),
                format!("§ target paragraph for {id}"),
            ),
        },
        None => (
            DEFAULT_LEDGER_PATH.to_owned(),
            format!("§ {id} row"),
        ),
    }
}

/// Render `YYYY-MM-DD` (UTC) from epoch milliseconds. Pure integer civil-date
/// arithmetic (Howard Hinnant's `civil_from_days`) so the marker date is
/// deterministic without pulling a datetime crate.
fn date_from_millis(now_ms: u64) -> String {
    let days = (now_ms / 86_400_000) as i64;
    // Shift epoch (1970-01-01) to the internal era origin (0000-03-01).
    let z = days + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = (z - era * 146_097) as i64; // [0, 146096]
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146_096) / 365; // [0, 399]
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100); // [0, 365]
    let mp = (5 * doy + 2) / 153; // [0, 11]
    let d = doy - (153 * mp + 2) / 5 + 1; // [1, 31]
    let m = if mp < 10 { mp + 3 } else { mp - 9 }; // [1, 12]
    let year = if m <= 2 { y + 1 } else { y };
    format!("{year:04}-{m:02}-{d:02}")
}

#[cfg(test)]
mod tests {
    use super::*;
    use epi_s3_gateway_contract::{
        s5_canon_update_methods, S5_CANON_UPDATE_METHODS, S5_CANON_UPDATE_ROUTE_CONTRACTS,
    };

    #[test]
    fn s5_canon_update_round_trip() {
        let mut rt = CanonUpdateRuntime::default();

        // propose — an IDENTITY row is drafted at `surfaced` with the correct
        // id, ratification path, and no-DR-escalation flag.
        let receipt = rt
            .propose(
                CanonUpdateCategory::Identity,
                "128 = 101 + 27 — α-rasa doubled shell as transcriptional full graph",
                Some(
                    "Idea/Bimba/Seeds/M/M3'/alpha_rasa_bridge_ql.md::§3 after the 128=64×2 paragraph"
                        .to_owned(),
                ),
                1_000,
            )
            .expect("propose an identity row");
        assert_eq!(receipt.id, "CU-IDENTITY-1");
        assert_eq!(receipt.status, CanonUpdateState::Surfaced);
        assert_eq!(receipt.ratification_path, "XREF paragraph (doc-ahead-landing)");
        assert!(!receipt.escalates_to_dr);

        // sequential ids are per-category
        let form = rt
            .propose(
                CanonUpdateCategory::Form,
                "137 = 64 + 73 — M3-native sixth canonical form",
                None,
                1_100,
            )
            .expect("propose a form row");
        assert_eq!(form.id, "CU-FORM-1");
        // FORM escalates to a DR row (§Boundary discipline)
        assert!(form.escalates_to_dr);
        assert_eq!(form.ratification_path, "DR escalation");

        // status — the identity row reads back at `surfaced`
        let status = rt.status(&receipt.id).expect("status of the identity row");
        assert_eq!(status.status, CanonUpdateState::Surfaced);
        assert_eq!(status.category, CanonUpdateCategory::Identity);
        assert!(status.landed_marker.is_none());

        // advance walks the forward spine surfaced → designed → reviewed →
        // validated; a backward move is refused.
        rt.advance(&receipt.id, CanonUpdateState::Designed, 1_200)
            .expect("advance to designed");
        rt.advance(&receipt.id, CanonUpdateState::Reviewed, 1_300)
            .expect("advance to reviewed");
        let backward = rt
            .advance(&receipt.id, CanonUpdateState::Designed, 1_350)
            .expect_err("backward advance must refuse");
        assert!(matches!(
            backward,
            CanonUpdateError::NonForwardTransition { .. }
        ));
        rt.advance(&receipt.id, CanonUpdateState::Validated, 1_400)
            .expect("advance to validated");
        assert_eq!(
            rt.status(&receipt.id).unwrap().status,
            CanonUpdateState::Validated
        );

        // land — the row closes to `landed` and authors the marker + the
        // frontmatter index entry parsed from the `path::anchor` hint.
        let landed = rt.land(&receipt.id, 1_500).expect("land the identity row");
        assert_eq!(landed.status, CanonUpdateState::Landed);
        assert_eq!(
            landed.marker.file,
            "Idea/Bimba/Seeds/M/M3'/alpha_rasa_bridge_ql.md"
        );
        assert_eq!(landed.marker.anchor, "§3 after the 128=64×2 paragraph");
        assert_eq!(landed.frontmatter_index_entry, "CU-IDENTITY-1@1970-01-01");
        // status now reflects landed + carries the recorded marker
        let after = rt.status(&receipt.id).unwrap();
        assert_eq!(after.status, CanonUpdateState::Landed);
        assert_eq!(after.landed_marker.as_ref().unwrap().file, landed.marker.file);

        // landing a closed row is refused
        let relanded = rt
            .land(&receipt.id, 1_600)
            .expect_err("re-landing a landed row must refuse");
        assert!(matches!(relanded, CanonUpdateError::RowClosed { .. }));

        // refuse — the FORM row is closed as `refused` with a reason
        let refusal = rt
            .refuse(&form.id, "superseded by a later synthesis", 1_700)
            .expect("refuse the form row");
        assert_eq!(refusal.status, CanonUpdateState::Refused);
        assert_eq!(refusal.reason, "superseded by a later synthesis");
        assert_eq!(
            rt.status(&form.id).unwrap().refusal_reason.as_deref(),
            Some("superseded by a later synthesis")
        );

        // list — filter by status isolates the landed row; filter by category
        // isolates by kind.
        let landed_rows = rt.list(&CanonUpdateFilter {
            status: Some(CanonUpdateState::Landed),
            category: None,
        });
        assert_eq!(landed_rows.len(), 1);
        assert_eq!(landed_rows[0].id, "CU-IDENTITY-1");

        let form_rows = rt.list(&CanonUpdateFilter {
            status: None,
            category: Some(CanonUpdateCategory::Form),
        });
        assert_eq!(form_rows.len(), 1);
        assert_eq!(form_rows[0].status, CanonUpdateState::Refused);

        // the full ledger holds exactly the two rows proposed
        assert_eq!(rt.list(&CanonUpdateFilter::default()).len(), 2);
    }

    #[test]
    fn propose_refuses_empty_claim_and_status_refuses_unknown_row() {
        let mut rt = CanonUpdateRuntime::default();
        assert_eq!(
            rt.propose(CanonUpdateCategory::Xref, "   ", None, 1),
            Err(CanonUpdateError::EmptyClaim)
        );
        assert!(matches!(
            rt.status("CU-IDENTITY-9").unwrap_err(),
            CanonUpdateError::UnknownRow(_)
        ));
        assert!(matches!(
            rt.land("CU-IDENTITY-9", 1).unwrap_err(),
            CanonUpdateError::UnknownRow(_)
        ));
    }

    #[test]
    fn every_route_contract_pairs_a_method_with_an_epi_bimba_cli_command() {
        // Contract surface: five methods, five route contracts, each paired
        // with an `epi bimba ...` CLI command (DR-S5-ONE-1).
        assert_eq!(S5_CANON_UPDATE_METHODS.len(), 5);
        assert_eq!(S5_CANON_UPDATE_ROUTE_CONTRACTS.len(), 5);
        assert_eq!(s5_canon_update_methods(), S5_CANON_UPDATE_METHODS);
        for (contract, method) in S5_CANON_UPDATE_ROUTE_CONTRACTS
            .iter()
            .zip(S5_CANON_UPDATE_METHODS)
        {
            assert_eq!(contract.method, *method);
            assert!(
                contract.method.starts_with("s5'.canon_update."),
                "{} must live under the s5'.canon_update. namespace",
                contract.method
            );
            assert!(
                contract.cli_command.starts_with("epi bimba "),
                "DR-S5-ONE-1: {} must have an `epi bimba` CLI parity command",
                contract.method
            );
        }
    }

    /// 05.T5.10 decision, TESTED: canon_update.* is SUBSTRATE, never a personal
    /// nara bounded-access domain. The `nara_bounded_access` gate denies every
    /// canon-update method even with a maximal grant and full connectivity —
    /// and no method maps to any personal nara domain. This exercises the real
    /// gate (`crate::dispatch`) without perturbing the t5_10 contract.
    #[test]
    fn canon_update_is_substrate_not_nara_bounded_access() {
        use crate::dispatch::{
            nara_bounded_access, nara_personal_domain, BoundedAccessDecision, BoundedAccessGrant,
            ConnectivityReport, NaraPersonalDomain,
        };
        let grant = BoundedAccessGrant::covering(&[
            NaraPersonalDomain::Jiva,
            NaraPersonalDomain::Jagrat,
            NaraPersonalDomain::Flow,
        ]);
        let fully_connected = ConnectivityReport::all_reachable();
        for method in S5_CANON_UPDATE_METHODS {
            assert_eq!(
                nara_personal_domain(method),
                None,
                "{method} is substrate: it must not map onto any personal nara domain"
            );
            let decision = nara_bounded_access(method, &fully_connected, Some(&grant));
            assert!(
                matches!(decision, BoundedAccessDecision::Denied { .. }),
                "{method} is substrate: bounded-access must DENY it even with a full grant + full connectivity, got {decision:?}"
            );
        }
    }

    #[test]
    fn date_from_millis_renders_utc_civil_date() {
        assert_eq!(date_from_millis(0), "1970-01-01");
        // 2026-06-15T00:00:00Z = 20619 days * 86_400_000 ms
        assert_eq!(date_from_millis(1_781_481_600_000), "2026-06-15");
    }
}
