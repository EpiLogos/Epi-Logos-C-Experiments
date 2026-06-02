// 10.T8 — M5-4 Agentic Mediation End-To-End acceptance test.
//
// Closes the cross-cutting verification in
// Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/10-cross-cutting-integration-and-milestones.md
// lines 207-226.
//
// All driving logic lives in ./harness.mjs (so both this test file AND
// the capture-receipt.mjs script can re-use the SAME real-substrate
// pipeline). This file asserts every receipt-level invariant against
// node --test.
//
// Real substrate consumed via the harness:
//   - @pratibimba/agentic-control-room (run-model, parity, enforceHumanGate)
//   - @pratibimba/body-lite-surface    (snapshot synthesisers + deep-link intents)
//   - @pratibimba/ide-shell-m0-m5      (parseCapabilityMatrix)
//   - Body/S/S5/fixtures/track-04-t0/* (real S5 candidate + review item)
//   - Body/S/S4/plugins/pleroma/capability-matrix.json (IOD-17 authority)
//
// Gateway-side enforcement is modelled by GatewayDispatchContract in
// harness.mjs which mirrors Body/S/S5/epii-review-core/src/lib.rs::
// requires_human_resolution (already verified in the real store via
// review_governance.rs Rust suite).

import test from 'node:test';
import assert from 'node:assert/strict';
import { runHarness, ACR, BodyLite } from './harness.mjs';

const r = runHarness();

test('real S5 candidate matches Thread K 10.T2 baseline + carries human-required gate', () => {
    assert.equal(r.candidate.id, 'track-04-t0-improvement-kept');
    assert.equal(r.candidate.review_item_id, 'track-04-t0-review-open');
    assert.equal(r.candidate.requires_human, true);
    assert.equal(r.candidate.target_coordinate, "S5/S5'");
});

test('VAK evaluation produces numeric V/A/K and surfaces canonical 6-key set', () => {
    const v = r.vak_evaluation;
    assert.equal(v.v, 1);
    assert.equal(v.a, 1);
    assert.equal(v.k, 1);
    assert.ok(v.score >= 0.66);
    assert.equal(v.decision, 'route');
    assert.equal(v.vak_keys_used.length, 6, 'canonical vak_keys must include CPF/CT/CP/CF/CFP/CS');
});

test('Anima orchestration picks a real matrix-listed actor + capability + route', () => {
    const o = r.anima_orchestration;
    assert.ok(o.actor_selected, 'must select an actor');
    assert.ok(o.capability_chosen, 'must choose a capability');
    assert.equal(o.matched_capability_matrix_entry, true);
    assert.equal(o.anima_can_dispatch, true, 'anima_authority must contain dispatch_to_constitutional_agent');
    assert.ok(o.matrix_dispatch_tools.includes(o.route_chosen), 'route must come from real matrix dispatch_tools');
    assert.equal(o.three_way_parity_check, true);
});

test('bounded capability policy: all base mediation tools allowed; non-allowlisted denied', () => {
    const p = r.bounded_capability_policy;
    assert.ok(p.allowed_tools.length >= 7, 'at least the 7 base mediation capabilities must be allowed');
    assert.equal(p.deny_enforced, true);
    for (const expected of ['directFsVaultWrite', 's1.vault.write_file', 'unknown.shadow.tool']) {
        assert.ok(p.denied_tools_attempted.includes(expected), `${expected} must be denied`);
    }
});

test('tool/run stream emits route + tool events that pass the mediation allowlist', () => {
    const stream = r.tool_run_stream;
    assert.ok(stream.find((s) => s.kind === 'route.start'));
    assert.ok(stream.find((s) => s.kind === 'route.end'));
    assert.ok(stream.filter((s) => s.kind === 'tool.end').length >= 4);
    const actor = r.anima_orchestration.actor_selected;
    for (const ev of stream) {
        if (ev.kind.startsWith('tool.')) {
            const gate = ACR.isMediationCapabilityAllowed(actor, ev.tool);
            assert.equal(gate.allowed, true, `tool ${ev.tool} must be in the allowlist`);
        }
    }
});

test('evidence packet has zero missing required fields (source/spec/code/test + profile/S2/S3 + privacy + reviewId)', () => {
    const pc = r.payload_completeness;
    assert.deepEqual(pc.missing_required_fields, []);
    for (const k of [
        'source_anchor_present', 'spec_anchor_present', 'code_anchor_present',
        'test_anchor_present', 'profile_generation_present', 's2_handle_present',
        's3_handle_present', 'privacy_class_present', 'review_id_present'
    ]) {
        assert.equal(pc[k], true, `${k} must be true`);
    }
    const e = r.evidence_deposition;
    assert.ok(e.envelope_id.startsWith('env::'));
    assert.ok(e.review_id);
    assert.equal(e.privacy_class, 'safe-public-current-kernel-tick');
});

test('human-gate parity: UI and gateway BOTH block agent approve/reject/revise/promote on human-required item', () => {
    const g = r.human_gate_parity;
    assert.equal(g.agent_approve_blocked_at_ui, true);
    assert.equal(g.agent_reject_blocked_at_ui, true);
    assert.equal(g.agent_revise_blocked_at_ui, true);
    assert.equal(g.agent_promote_blocked_at_ui, true);
    assert.equal(g.agent_approve_blocked_at_gateway, true);
    assert.equal(g.agent_reject_blocked_at_gateway, true);
    assert.equal(g.agent_revise_blocked_at_gateway, true);
    assert.equal(g.agent_promote_blocked_at_gateway, true);
    assert.equal(g.ui_and_gateway_agree_on_block, true);
    assert.equal(g.agent_defer_allowed_at_ui, true);
    assert.equal(g.agent_defer_allowed_at_gateway, true);
});

test('dry-run promotion: bounded agent path produces a valid plan shape', () => {
    const d = r.dry_run_promotion;
    assert.equal(d.produced, true);
    assert.equal(d.shape.ok, true);
    assert.equal(d.shape.dry_run, true);
    assert.ok(d.shape.rollback_executable);
});

test('Agentic Control Room widgets render the full flow (run-tree + tool-stream + evidence + review-controls)', () => {
    const acr = r.surfaces.agentic_control_room_observed;
    assert.equal(acr.run_tree_populated, true);
    assert.equal(acr.tool_stream_populated, true);
    assert.equal(acr.evidence_visible, true);
    assert.equal(acr.review_controls_correct, true);
    for (const id of Object.values(acr.widget_ids)) {
        assert.ok(id.startsWith('pratibimba.acr.'), `${id} must use pratibimba.acr.* namespace`);
    }
});

test('/body lite-surface renders the alert + check-in + armed deep-link to the control room', () => {
    const lite = r.surfaces.body_lite_notification_observed;
    assert.equal(lite.review_alert_present, true);
    assert.equal(lite.agent_checkin_populated, true);
    assert.equal(lite.deep_link_to_control_room_armed, true);
    assert.equal(lite.deep_link_context_fields_preserved, true);
    assert.equal(lite.deep_link_command_ids.OPEN_CONTROL_ROOM, 'pratibimba.body.openControlRoom');
});

test('cross-surface same-flow parity: actor + capability + reviewId + profileGeneration match across deep IDE and /body', () => {
    const sf = r.surfaces.same_flow_parity;
    assert.equal(sf.actor_matches, true);
    assert.equal(sf.capability_matches, true);
    assert.equal(sf.review_id_matches, true);
    assert.equal(sf.profile_generation_matches, true);
});

test('extension identities are exactly agentic-control-room + body-lite-surface', () => {
    assert.equal(ACR.EXTENSION_ID, 'agentic-control-room');
    assert.equal(BodyLite.EXTENSION_ID, 'body-lite-surface');
});
