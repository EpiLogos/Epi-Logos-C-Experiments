// FIXTURE — DO NOT COMPILE INTO THE epi-cli CRATE
//
// This file is a STRING FIXTURE used by `s0_membrane_guardrails::
// negative_fixture_is_correctly_rejected_by_s0_scanner`. It is read at
// test-time from disk via `CARGO_MANIFEST_DIR` and never participates in
// the compile graph (lives under `tests/fixtures/`, which Cargo does not
// auto-discover as an integration test target).
//
// The simulation: this represents a hypothetical, freshly authored S0
// downstream-law module that:
//   (a) is NOT listed in `contract-inventory/s0-membrane-inventory.json`,
//   (b) does NOT carry the explicit `// S0 ADAPTER: <Body-native authority>`
//       doc-comment annotation the T9 guardrail requires,
//   (c) embeds substantive downstream service-law (here: a fake review
//       inbox runtime that should belong to Body/S/S5/epii-review-core).
//
// The guardrail's negative test loads this file by path, runs the scanner
// classification against it, and asserts the scanner returns
// `ModuleClassification::UnannotatedDownstreamLaw` — i.e. the scanner
// correctly REJECTS this as a violation. If the scanner ever returned
// `Allowed` for this fixture, the negative test fails — proving the
// guardrail is effective.

pub struct FakeReviewItem {
    pub id: String,
    pub status: String,
    pub evidence: Vec<String>,
}

pub struct FakeReviewInbox {
    pub items: Vec<FakeReviewItem>,
}

impl FakeReviewInbox {
    /// Hypothetically does what S5/epii-review-core::ReviewStore::submit does.
    /// THIS IS THE EXACT VIOLATION T9 GUARDS AGAINST:
    /// S0 inventing its own copy of S5 review law instead of going through
    /// an annotated adapter to `epi-s5-epii-review-core`.
    pub fn submit(&mut self, id: String, evidence: Vec<String>) {
        self.items.push(FakeReviewItem {
            id,
            status: "pending".into(),
            evidence,
        });
    }

    pub fn resolve(&mut self, id: &str, decision: &str) {
        for item in &mut self.items {
            if item.id == id {
                item.status = decision.to_string();
            }
        }
    }
}
