#!/usr/bin/env node
// 10.T8 capture-receipt — drives the e2e harness (the SAME logic the
// .test.mjs asserts against) and writes the structured receipt + summary
// to Idea/Bimba/Seeds/M/Legacy/plans/.../plan.runs/.
//
// Receipt:  plan.runs/10-t8-agentic-mediation-e2e-<ts>.json
// Summary:  plan.runs/10-t8-agentic-mediation-e2e-summary.md
//
// Usage:
//   node Body/M/epi-theia/extensions/test/agentic-mediation-e2e/capture-receipt.mjs

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runHarness } from './harness.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..', '..', '..');
const PLAN_RUNS_DIR = resolve(
    REPO_ROOT,
    'docs',
    'plans',
    '2026-05-31-mprime-and-sprime-implementation-tracks',
    'plan.runs'
);

function isoStampForFilename(d = new Date()) {
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
}

function countAssertions(receipt) {
    // Match each assertion the .test.mjs makes — same surface, both must
    // agree the harness output passes every invariant.
    const checks = [];
    const c = receipt;

    // Candidate
    checks.push(['candidate_id_matches_baseline', c.candidate.id === 'track-04-t0-improvement-kept']);
    checks.push(['candidate_review_item_matches', c.candidate.review_item_id === 'track-04-t0-review-open']);
    checks.push(['candidate_requires_human', c.candidate.requires_human === true]);
    checks.push(['candidate_target_coordinate', c.candidate.target_coordinate === "S5/S5'"]);

    // VAK
    checks.push(['vak_v_set', c.vak_evaluation.v === 1]);
    checks.push(['vak_a_set', c.vak_evaluation.a === 1]);
    checks.push(['vak_k_set', c.vak_evaluation.k === 1]);
    checks.push(['vak_decision_route', c.vak_evaluation.decision === 'route']);
    checks.push(['vak_keys_six', c.vak_evaluation.vak_keys_used.length === 6]);

    // Orchestration
    checks.push(['orch_actor_chosen', !!c.anima_orchestration.actor_selected]);
    checks.push(['orch_capability_chosen', !!c.anima_orchestration.capability_chosen]);
    checks.push(['orch_matched_matrix', c.anima_orchestration.matched_capability_matrix_entry === true]);
    checks.push(['orch_anima_dispatch', c.anima_orchestration.anima_can_dispatch === true]);
    checks.push(['orch_route_in_matrix', c.anima_orchestration.matrix_dispatch_tools.includes(c.anima_orchestration.route_chosen)]);
    checks.push(['orch_three_way_parity', c.anima_orchestration.three_way_parity_check === true]);

    // Bounded policy
    checks.push(['policy_allowed_min_seven', c.bounded_capability_policy.allowed_tools.length >= 7]);
    checks.push(['policy_deny_enforced', c.bounded_capability_policy.deny_enforced === true]);

    // Stream
    checks.push(['stream_has_route_start', c.tool_run_stream.some((e) => e.kind === 'route.start')]);
    checks.push(['stream_has_route_end', c.tool_run_stream.some((e) => e.kind === 'route.end')]);
    checks.push(['stream_has_tool_ends', c.tool_run_stream.filter((e) => e.kind === 'tool.end').length >= 4]);

    // Payload completeness (9 anchors + 0 missing)
    const pc = c.payload_completeness;
    for (const key of [
        'source_anchor_present', 'spec_anchor_present', 'code_anchor_present',
        'test_anchor_present', 'profile_generation_present', 's2_handle_present',
        's3_handle_present', 'privacy_class_present', 'review_id_present'
    ]) {
        checks.push([`payload_${key}`, pc[key] === true]);
    }
    checks.push(['payload_no_missing', pc.missing_required_fields.length === 0]);

    // Human-gate parity (11 fields)
    const g = c.human_gate_parity;
    for (const key of [
        'agent_approve_blocked_at_ui', 'agent_reject_blocked_at_ui',
        'agent_revise_blocked_at_ui', 'agent_promote_blocked_at_ui',
        'agent_approve_blocked_at_gateway', 'agent_reject_blocked_at_gateway',
        'agent_revise_blocked_at_gateway', 'agent_promote_blocked_at_gateway',
        'ui_and_gateway_agree_on_block', 'agent_defer_allowed_at_ui',
        'agent_defer_allowed_at_gateway'
    ]) {
        checks.push([`gate_${key}`, g[key] === true]);
    }

    // Surfaces
    const acr = c.surfaces.agentic_control_room_observed;
    checks.push(['surf_acr_run_tree', acr.run_tree_populated === true]);
    checks.push(['surf_acr_tool_stream', acr.tool_stream_populated === true]);
    checks.push(['surf_acr_evidence', acr.evidence_visible === true]);
    checks.push(['surf_acr_review_controls', acr.review_controls_correct === true]);
    const lite = c.surfaces.body_lite_notification_observed;
    checks.push(['surf_lite_alert', lite.review_alert_present === true]);
    checks.push(['surf_lite_checkin', lite.agent_checkin_populated === true]);
    checks.push(['surf_lite_deep_link', lite.deep_link_to_control_room_armed === true]);
    checks.push(['surf_lite_context_preserved', lite.deep_link_context_fields_preserved === true]);
    const sf = c.surfaces.same_flow_parity;
    checks.push(['surf_same_flow_actor', sf.actor_matches === true]);
    checks.push(['surf_same_flow_capability', sf.capability_matches === true]);
    checks.push(['surf_same_flow_review_id', sf.review_id_matches === true]);
    checks.push(['surf_same_flow_profile_gen', sf.profile_generation_matches === true]);

    // Dry-run promotion
    checks.push(['promotion_produced', c.dry_run_promotion.produced === true]);
    checks.push(['promotion_dry_run', c.dry_run_promotion.shape.dry_run === true]);
    checks.push(['promotion_ok', c.dry_run_promotion.shape.ok === true]);
    checks.push(['promotion_rollback_executable', c.dry_run_promotion.shape.rollback_executable === true]);

    const passed = checks.filter(([, ok]) => ok).length;
    const failed = checks.filter(([, ok]) => !ok);
    return { total: checks.length, passed, failed };
}

function checkRow(label, ok) {
    return `- ${ok ? '[x]' : '[ ]'} ${label}`;
}

function renderSummary(receipt, receiptPath, counts) {
    const c = receipt.candidate ?? {};
    const v = receipt.vak_evaluation ?? {};
    const o = receipt.anima_orchestration ?? {};
    const p = receipt.bounded_capability_policy ?? {};
    const e = receipt.evidence_deposition ?? {};
    const g = receipt.human_gate_parity ?? {};
    const s = receipt.surfaces ?? {};
    const pc = receipt.payload_completeness ?? {};

    const relReceipt = receiptPath.replace(/^.*\/plan\.runs\//, 'plan.runs/');

    return [
        '# 10.T8 — M5-4 Agentic Mediation End-To-End',
        '',
        `Captured: ${receipt.captured_at}`,
        `Owner:    ${receipt.captured_by}`,
        `Receipt:  ${relReceipt}`,
        `Asserts:  ${counts.passed}/${counts.total} pass (${counts.failed.length} fail)`,
        '',
        '## Candidate (real S5)',
        '',
        `- id: \`${c.id}\` (matches 10.T2 Thread K baseline)`,
        `- review_item_id: \`${c.review_item_id}\``,
        `- requires_human: \`${c.requires_human}\``,
        `- target_coordinate: \`${c.target_coordinate}\``,
        `- captured_via: ${c.captured_via}`,
        '',
        '## VAK evaluation',
        '',
        `- V/A/K: ${v.v}/${v.a}/${v.k} score=${v.score?.toFixed?.(2)} decision=\`${v.decision}\``,
        `- canonical vak_keys (matrix m5_4_governance.canonical_vak_keys): ${(v.vak_keys_used ?? []).join(', ')}`,
        '',
        '## Anima orchestration (real capability-matrix.json)',
        '',
        `- actor: \`${o.actor_selected}\` (matrix-listed review_surface_role)`,
        `- capability: \`${o.capability_chosen}\` (in actor.permitted_actions)`,
        `- route: \`${o.route_chosen}\` (in matrix.dispatch_tools)`,
        `- anima_authority.dispatch_to_constitutional_agent: ${o.anima_can_dispatch}`,
        `- three-way parity (matrix ↔ UI ↔ simulated gateway): ${o.three_way_parity_check}`,
        `- matrix dispatch_tools: ${(o.matrix_dispatch_tools ?? []).length} tools, ${o.matrix_skills_count ?? 0} skills`,
        '',
        '## Bounded capability policy (real isMediationCapabilityAllowed)',
        '',
        `- allowed tools (count): ${(p.allowed_tools ?? []).length}`,
        `- denied tools attempted (count): ${(p.denied_tools_attempted ?? []).length}`,
        `- deny enforced: ${p.deny_enforced}`,
        '',
        '## Evidence packet (9-field completeness)',
        '',
        checkRow('source_anchor', pc.source_anchor_present),
        checkRow('spec_anchor', pc.spec_anchor_present),
        checkRow('code_anchor', pc.code_anchor_present),
        checkRow('test_anchor', pc.test_anchor_present),
        checkRow('profile_generation', pc.profile_generation_present),
        checkRow('s2_handle', pc.s2_handle_present),
        checkRow('s3_handle', pc.s3_handle_present),
        checkRow('privacy_class', pc.privacy_class_present),
        checkRow('review_id', pc.review_id_present),
        '',
        `- envelope: \`${e.envelope_id}\``,
        `- review_id: \`${e.review_id}\``,
        `- privacy_class: \`${e.privacy_class}\``,
        `- day_now: \`${e.day_now_context}\``,
        '',
        '## Review gate (human-required) parity',
        '',
        checkRow('agent approve blocked at UI', g.agent_approve_blocked_at_ui),
        checkRow('agent reject blocked at UI', g.agent_reject_blocked_at_ui),
        checkRow('agent revise blocked at UI', g.agent_revise_blocked_at_ui),
        checkRow('agent promote blocked at UI', g.agent_promote_blocked_at_ui),
        checkRow('agent approve blocked at gateway', g.agent_approve_blocked_at_gateway),
        checkRow('agent reject blocked at gateway', g.agent_reject_blocked_at_gateway),
        checkRow('agent revise blocked at gateway', g.agent_revise_blocked_at_gateway),
        checkRow('agent promote blocked at gateway', g.agent_promote_blocked_at_gateway),
        checkRow('UI and gateway agree on block', g.ui_and_gateway_agree_on_block),
        checkRow('agent defer allowed at UI', g.agent_defer_allowed_at_ui),
        checkRow('agent defer allowed at gateway', g.agent_defer_allowed_at_gateway),
        '',
        '## Surfaces parity',
        '',
        '### Agentic Control Room (deep IDE)',
        '',
        checkRow('run tree populated', s.agentic_control_room_observed?.run_tree_populated),
        checkRow('tool stream populated', s.agentic_control_room_observed?.tool_stream_populated),
        checkRow('evidence visible', s.agentic_control_room_observed?.evidence_visible),
        checkRow('review controls correct (UI blocks agent approve)', s.agentic_control_room_observed?.review_controls_correct),
        '',
        '### /body lite-surface',
        '',
        checkRow('review alert present', s.body_lite_notification_observed?.review_alert_present),
        checkRow('agent check-in populated', s.body_lite_notification_observed?.agent_checkin_populated),
        checkRow('deep-link to control room armed', s.body_lite_notification_observed?.deep_link_to_control_room_armed),
        checkRow('deep-link context fields preserved', s.body_lite_notification_observed?.deep_link_context_fields_preserved),
        '',
        '### Same-flow identity tuple (deep IDE ↔ /body)',
        '',
        checkRow('actor matches', s.same_flow_parity?.actor_matches),
        checkRow('capability matches', s.same_flow_parity?.capability_matches),
        checkRow('reviewId matches', s.same_flow_parity?.review_id_matches),
        checkRow('profileGeneration matches', s.same_flow_parity?.profile_generation_matches),
        '',
        '## Dry-run promotion (bounded agent path)',
        '',
        `- produced: ${receipt.dry_run_promotion?.produced}`,
        `- dry_run: ${receipt.dry_run_promotion?.shape?.dry_run}`,
        `- destination: \`${receipt.dry_run_promotion?.shape?.destination}\``,
        `- rollback_executable: ${receipt.dry_run_promotion?.shape?.rollback_executable}`,
        '',
        '## Verification commands',
        '',
        ...(receipt.verification_commands ?? []).map((cmd) => `    ${cmd}`),
        '',
        '## Notes',
        '',
        'Gateway-side enforcement is exercised by a `GatewayDispatchContract` simulator in `harness.mjs` that mirrors the Rust governance rules in `Body/S/S5/epii-review-core/src/lib.rs::requires_human_resolution`. The Rust rule is independently verified at runtime by `Body/S/S5/epii-review-core/tests/review_governance.rs::agent_can_defer_but_not_approve_recursive_user_final_or_deployment_gates` (already green in the 10.T2 Thread K baseline). A future enhancement (Thread A Finding #2 follow-up) is to expose `s4\'.mediation.capabilities.list` so the same parity assertion can be made against a LIVE gateway socket — see "deviation_from_ideal_capture_path" in the JSON receipt.',
        ''
    ].join('\n');
}

function main() {
    const receipt = runHarness();
    const counts = countAssertions(receipt);
    receipt.assertions = {
        total: counts.total,
        passed: counts.passed,
        failed: counts.failed.length,
        failures: counts.failed.map(([name]) => name)
    };
    receipt.deviation_from_ideal_capture_path = [
        'Gateway-side enforcement is exercised against an in-process simulator',
        '(GatewayDispatchContract in harness.mjs) that mirrors the Rust rules in',
        'Body/S/S5/epii-review-core/src/lib.rs::requires_human_resolution. The',
        'Rust rule itself is verified by review_governance.rs in cargo --offline,',
        'and the matrix authority is read live from',
        'Body/S/S4/plugins/pleroma/capability-matrix.json. The ideal capture',
        "would run against a live s4'.mediation.capabilities.list gateway",
        'capability (Thread A Finding #2 follow-up). This receipt is the spec-',
        'time three-way parity; runtime parity becomes available once that',
        'capability is exposed.'
    ].join(' ');

    if (!existsSync(PLAN_RUNS_DIR)) {
        mkdirSync(PLAN_RUNS_DIR, { recursive: true });
    }
    const stamp = isoStampForFilename();
    const receiptPath = resolve(PLAN_RUNS_DIR, `10-t8-agentic-mediation-e2e-${stamp}.json`);
    const summaryPath = resolve(PLAN_RUNS_DIR, `10-t8-agentic-mediation-e2e-summary.md`);

    writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n', 'utf8');
    writeFileSync(summaryPath, renderSummary(receipt, receiptPath, counts), 'utf8');

    process.stdout.write(`receipt: ${receiptPath}\n`);
    process.stdout.write(`summary: ${summaryPath}\n`);
    process.stdout.write(`asserts: ${counts.passed}/${counts.total} pass (${counts.failed.length} fail)\n`);
    if (counts.failed.length > 0) {
        for (const [name] of counts.failed) {
            process.stderr.write(`FAIL ${name}\n`);
        }
        process.exit(1);
    }
}

main();
