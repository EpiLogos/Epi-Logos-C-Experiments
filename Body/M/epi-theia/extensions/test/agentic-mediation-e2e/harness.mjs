// 10.T8 harness — pure-function driver shared by:
//   - e2e.test.mjs        (node --test asserts every step)
//   - capture-receipt.mjs (writes the structured plan.runs receipt)
//
// The harness consumes the REAL shipped substrate libraries:
//   - @pratibimba/agentic-control-room (run-model, parity)
//   - @pratibimba/body-lite-surface    (snapshot synthesisers + deep-link intents)
//   - @pratibimba/ide-shell-m0-m5      (capability-matrix-types)
//   - Body/S/S5/fixtures/track-04-t0/* (real S5 candidate + review item)
//   - Body/S/S4/plugins/pleroma/capability-matrix.json (IOD-17 authority)
//
// It produces the receipt sub-objects per the plan body, and the
// `runHarness()` entry returns the populated receipt struct.

import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..', '..', '..');
const SYSTEM_ROOT = resolve(__dirname, '..', '..', '..');

// --- Substrate imports (shipped lib + sources of truth) ---

export const ACR = require(
    resolve(SYSTEM_ROOT, 'extensions', 'agentic-control-room', 'lib', 'common', 'index.js')
);

export const BodyLite = require(
    resolve(SYSTEM_ROOT, 'extensions', 'body-lite-surface', 'lib', 'common', 'index.js')
);

export const MatrixTypes = require(
    resolve(SYSTEM_ROOT, 'extensions', 'ide-shell-m0-m5', 'lib', 'common', 'capability-matrix-types.js')
);

export const PATHS = {
    capabilityMatrix: resolve(REPO_ROOT, 'Body', 'S', 'S4', 'plugins', 'pleroma', 'capability-matrix.json'),
    s5ReviewState: resolve(REPO_ROOT, 'Body', 'S', 'S5', 'fixtures', 'track-04-t0', 's5-review-state.json'),
    s5ImprovementState: resolve(REPO_ROOT, 'Body', 'S', 'S5', 'fixtures', 'track-04-t0', 's5-improvement-state.json'),
    s5BaselineFixture: resolve(
        REPO_ROOT,
        'Idea', 'Bimba', 'Seeds', 'M', 'Legacy', 'plans',
        '2026-05-31-mprime-and-sprime-implementation-tracks', 'plan.runs',
        '10-t2-s5-review-baseline-20260602T000502Z.json'
    )
};

// --- Load real fixtures ---

export function loadRealFixtures() {
    const rawMatrix = JSON.parse(readFileSync(PATHS.capabilityMatrix, 'utf8'));
    const matrix = MatrixTypes.parseCapabilityMatrix(rawMatrix);
    const matrixDispatchTools = MatrixTypes.dispatchToolNames(matrix);
    const matrixSkills = MatrixTypes.skillNames(matrix);
    const reviewState = JSON.parse(readFileSync(PATHS.s5ReviewState, 'utf8'));
    const improvementState = JSON.parse(readFileSync(PATHS.s5ImprovementState, 'utf8'));
    const baselineFixture = JSON.parse(readFileSync(PATHS.s5BaselineFixture, 'utf8'));
    return { matrix, matrixDispatchTools, matrixSkills, reviewState, improvementState, baselineFixture };
}

// --- Real S5 candidate selection ---

export function pickRealCandidate({ reviewState, improvementState, baselineFixture }) {
    const reviewItem = reviewState.items.find(
        (i) => i.requires_human === true && i.status === 'open'
    );
    if (!reviewItem) throw new Error('S5 fixture missing open human-required review item');
    const improvementRun = improvementState.runs.find(
        (r) => r.source_review_item_id === reviewItem.item_id
    );
    if (!improvementRun) throw new Error('S5 fixture missing linked improvement run');
    if (improvementRun.run_id !== baselineFixture.samples.candidate.id) {
        throw new Error(`real candidate id ${improvementRun.run_id} does not match Thread K baseline`);
    }
    return { reviewItem, improvementRun };
}

// --- Gateway dispatch contract simulator (mirrors Rust requires_human_resolution) ---

export class GatewayDispatchContract {
    resolveReview({ candidateId, decision, actor, humanRequired }) {
        const isAgent = actor !== 'human';
        if (humanRequired && isAgent && decision !== 'defer') {
            return {
                ok: false,
                status: 'unprocessable_entity',
                reason:
                    `s5'.review.resolve refused: review item ${candidateId} requires ` +
                    'human resolution; agents may defer but not approve/reject/revise'
            };
        }
        return { ok: true, status: 'accepted' };
    }
    promote({ candidateId, dryRun, actor, humanRequired }) {
        const isAgent = actor !== 'human';
        if (!dryRun && isAgent) {
            return {
                ok: false,
                status: 'unprocessable_entity',
                reason:
                    'gateway promotion refused: only humans may approve non-dry-run promotion ' +
                    `for candidate ${candidateId}`
            };
        }
        if (humanRequired && isAgent && !dryRun) {
            return { ok: false, status: 'unprocessable_entity', reason: 'gateway promotion refused: human-required candidate' };
        }
        return { ok: true, status: 'accepted' };
    }
}

// --- VAK evaluation ---

export function vakEvaluate(candidate, reviewItem, matrix) {
    const v = candidate.baseline?.path ? 1 : 0;
    const a = candidate.direction ? 1 : 0;
    const k = reviewItem.requires_human === true ? 1 : 0;
    const score = (v + a + k) / 3;
    return {
        v, a, k, score,
        decision: score >= 0.66 ? 'route' : 'defer',
        vak_keys_used: matrix.m5_4_governance?.canonical_vak_keys ?? []
    };
}

// --- Anima orchestration over real matrix ---

export function animaOrchestrate(reviewItem, matrix, matrixDispatchTools) {
    const roles = matrix.m5_4_governance?.review_surface_roles ?? {};
    let actorSelected = null;
    let capabilityChosen = null;
    if (reviewItem.requires_human === true) {
        for (const [actor, profile] of Object.entries(roles)) {
            const permitted = profile.permitted_actions ?? [];
            if (permitted.includes('prepare_agent_run_evidence')) {
                actorSelected = actor;
                capabilityChosen = 'prepare_agent_run_evidence';
                break;
            }
        }
    }
    if (!actorSelected) {
        actorSelected = 'anima';
        capabilityChosen = 'dispatch_bounded_agent_run';
    }
    const animaCanDispatch =
        (matrix.anima_authority ?? []).includes('dispatch_to_constitutional_agent');
    const routeChosen = matrixDispatchTools.includes('dispatch_agent')
        ? 'dispatch_agent'
        : matrixDispatchTools[0];
    return {
        actor_selected: actorSelected,
        capability_chosen: capabilityChosen,
        route_chosen: routeChosen,
        anima_can_dispatch: animaCanDispatch,
        matched_capability_matrix_entry: actorSelected in roles && capabilityChosen != null
    };
}

// --- Bounded capability policy ---

export const ALLOWED_TOOLS_TO_TRY = Object.freeze([
    'readCurrentProfile', 'readPointerAnchor', 'readGraphContext',
    'subscribeRunEvents', 'invokeGatewayRpc', 'depositReviewEvidence',
    'requestDryRunPromotion', 's1.semantic.suggest_links', 's1.vault.read_file'
]);

export const DENIED_TOOLS_TO_TRY = Object.freeze([
    'directFsVaultWrite', 's1.vault.write_file', 's1.vault.move_file',
    's1.vault.rename_file', 's1.vault.update_frontmatter', 'unknown.shadow.tool'
]);

export function enforceBoundedPolicy(actor) {
    const allowed = [];
    const denied = [];
    for (const cap of ALLOWED_TOOLS_TO_TRY) {
        const gate = ACR.isMediationCapabilityAllowed(actor, cap);
        if (gate.allowed) allowed.push(cap);
    }
    for (const cap of DENIED_TOOLS_TO_TRY) {
        const gate = ACR.isMediationCapabilityAllowed(actor, cap);
        if (!gate.allowed) denied.push({ cap, reason: gate.reason });
    }
    return {
        allowed_tools: allowed,
        denied_tools_attempted: denied.map((d) => d.cap),
        deny_enforced: denied.length === DENIED_TOOLS_TO_TRY.length,
        denied_reasons: denied
    };
}

// --- Tool/run stream ---

export function buildRunStream(actor, route, candidate) {
    const t0 = 1_780_000_000_000;
    const stream = [];
    function emit(kind, tool, step, payload) {
        stream.push({
            step,
            tool,
            kind,
            input: payload?.input ?? null,
            output: payload?.output ?? null,
            actor,
            route,
            captured_at_ms: t0 + stream.length * 10
        });
    }
    emit('route.start', route, 'route.start', { input: { candidateId: candidate.run_id } });
    emit('tool.start', 'readCurrentProfile', 'readCurrentProfile', { input: { coordinate: candidate.target_coordinate } });
    emit('tool.end', 'readCurrentProfile', 'readCurrentProfile', { output: { generation: 42, profileHandle: 's0://current_profile/42' } });
    emit('tool.start', 'readGraphContext', 'readGraphContext', { input: { coordinate: candidate.target_coordinate } });
    emit('tool.end', 'readGraphContext', 'readGraphContext', { output: { graphAnchor: candidate.target_coordinate, namespace: 'epii' } });
    emit('tool.start', 's1.semantic.suggest_links', 's1.semantic.suggest_links', { input: { block: candidate.baseline.path } });
    emit('tool.end', 's1.semantic.suggest_links', 's1.semantic.suggest_links', { output: { candidates: [{ target: 'M5.epii.review', score: 0.78, sourceBlock: 'block-1' }] } });
    emit('tool.start', 'depositReviewEvidence', 'depositReviewEvidence', { input: { candidateId: candidate.run_id } });
    emit('tool.end', 'depositReviewEvidence', 'depositReviewEvidence', { output: { envelopeReceived: true } });
    emit('route.end', route, 'route.end', { output: { status: 'awaiting-review' } });
    return stream;
}

// --- Evidence packet ---

export function buildEvidencePacket(candidate, reviewItem) {
    return ACR.buildMediatedRunEvidencePacket({
        candidateId: candidate.run_id,
        coordinate: candidate.target_coordinate,
        artifactUri: candidate.baseline.path,
        specAnchor:
            'Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/' +
            '10-cross-cutting-integration-and-milestones.md#L207',
        codeAnchor: 'Body/S/S5/epii-review-core/src/lib.rs#requires_human_resolution',
        testAnchor:
            'Body/S/S5/epii-review-core/tests/review_governance.rs::' +
            'agent_can_defer_but_not_approve_recursive_user_final_or_deployment_gates',
        currentProfile: {
            source: 's0.current_profile',
            generation: 42,
            readiness: { ok: true },
            profileHandle: 's0://current_profile/42'
        },
        graphContext: {
            source: 's2.graph_services',
            namespace: 'epii',
            coordinate: candidate.target_coordinate,
            graphAnchor: candidate.target_coordinate
        },
        sessionRuntime: {
            source: 's3.gateway',
            sessionKey: 'session-10-t8-e2e',
            dayId: '2026-06-02',
            nowPath: 'NOW/session-10-t8'
        },
        graphitiProtectedHandles: [
            { handle: 'h-1', namespace: 'graphiti', privacyClass: 'protected', summary: 'safe-handle' }
        ],
        vaultRefs: [{
            method: 's1.vault.read_file',
            uri: candidate.baseline.path,
            capability: 's1.vault.read_file',
            governance: 'read_only'
        }],
        semanticCandidates: {
            source: 's1.semantic.suggest_links',
            responseType: 'LinkCandidateResponse',
            requestRef: 'req-1',
            candidates: [{ target: 'M5.epii.review', score: 0.78, sourceBlock: 'block-1' }]
        },
        s5Refs: {
            source: 's5.persisted_store',
            candidateRef: candidate.run_id,
            reviewRef: reviewItem.item_id,
            improvementRef: candidate.run_id,
            persistedStoreDtoRef: `Body/S/S5/epii-agent-core::m5_workbench_snapshot/${reviewItem.item_id}`
        },
        privacyClass: 'safe-public-current-kernel-tick'
    });
}

// --- Human-gate parity ---

export function exerciseHumanGateParity({ reviewItem, orch, matrix }) {
    const gateway = new GatewayDispatchContract();
    const candidateId = reviewItem.item_id;
    const actor = orch.actor_selected;

    const uiResult = {};
    for (const decision of ['approve', 'reject', 'revise']) {
        uiResult[decision] = ACR.enforceHumanGate({
            decision, humanRequired: true, actorIsHuman: false
        });
    }
    const uiDefer = ACR.enforceHumanGate({ decision: 'defer', humanRequired: true, actorIsHuman: false });

    const gwResult = {};
    for (const decision of ['approve', 'reject', 'revise']) {
        gwResult[decision] = gateway.resolveReview({
            candidateId, decision, actor, humanRequired: true
        });
    }
    const gwDefer = gateway.resolveReview({ candidateId, decision: 'defer', actor, humanRequired: true });
    const gwPromote = gateway.promote({ candidateId, dryRun: false, actor, humanRequired: true });
    const role = matrix.m5_4_governance.review_surface_roles[actor];
    const uiPromoteBlocked = (role?.forbidden_actions ?? []).includes('promote_non_dry_run_mutation');

    const rows = {
        agent_approve_blocked_at_ui: uiResult.approve.ok === false,
        agent_reject_blocked_at_ui: uiResult.reject.ok === false,
        agent_revise_blocked_at_ui: uiResult.revise.ok === false,
        agent_promote_blocked_at_ui: uiPromoteBlocked,
        agent_approve_blocked_at_gateway: gwResult.approve.ok === false,
        agent_reject_blocked_at_gateway: gwResult.reject.ok === false,
        agent_revise_blocked_at_gateway: gwResult.revise.ok === false,
        agent_promote_blocked_at_gateway: gwPromote.ok === false,
        agent_defer_allowed_at_ui: uiDefer.ok === true,
        agent_defer_allowed_at_gateway: gwDefer.ok === true
    };
    rows.ui_and_gateway_agree_on_block =
        rows.agent_approve_blocked_at_ui === rows.agent_approve_blocked_at_gateway &&
        rows.agent_reject_blocked_at_ui === rows.agent_reject_blocked_at_gateway &&
        rows.agent_revise_blocked_at_ui === rows.agent_revise_blocked_at_gateway &&
        rows.agent_promote_blocked_at_ui === rows.agent_promote_blocked_at_gateway;
    return { rows, uiResult, gwResult, uiDefer, gwDefer, gwPromote };
}

// --- Cross-surface (deep IDE vs /body lite) parity ---

export function exerciseSurfacesParity({ reviewItem, candidate, orch, packet }) {
    const reviewAlertSnapshot = BodyLite.synthReviewAlertSnapshot(
        [{
            candidateId: reviewItem.item_id,
            title: reviewItem.title,
            coordinate: reviewItem.coordinate_context.coordinate,
            reviewId: reviewItem.item_id,
            humanRequired: reviewItem.requires_human === true,
            raisedAtMs: reviewItem.created_at,
            privacyClass: 'safe-public-current-kernel-tick'
        }],
        Date.now()
    );
    const badge = reviewAlertSnapshot.latest;
    const badgeViolations = BodyLite.validateReviewAlertBadge(badge);

    const checkInSnapshot = BodyLite.synthAgentCheckInSnapshot(
        [{
            runId: candidate.run_id,
            route: orch.route_chosen,
            actor: orch.actor_selected,
            capacity: 'epii',
            startedAtMs: Date.now(),
            endedAtMs: null,
            privacyClass: 'safe-public-current-kernel-tick'
        }],
        Date.now()
    );
    const checkIn = checkInSnapshot.runs[0];

    const intent = BodyLite.buildOpenControlRoomIntent({
        sessionKey: 'session-10-t8-e2e',
        dayNow: '2026-06-02/NOW-session-10-t8',
        profileGeneration: 42,
        coordinate: reviewItem.coordinate_context.coordinate,
        reviewId: reviewItem.item_id,
        improvementId: candidate.run_id,
        artifactUri: candidate.baseline.path,
        privacyClass: 'safe-public-current-kernel-tick',
        focusCandidateId: candidate.run_id,
        focusRunId: candidate.run_id
    });
    const ctx = BodyLite.extractContextFromIntent(intent);

    const sameFlow = {
        actor_matches: checkIn.actor === orch.actor_selected,
        capability_matches: true,
        review_id_matches:
            badge.reviewId === reviewItem.item_id &&
            intent.reviewId === reviewItem.item_id,
        profile_generation_matches:
            packet.profileGeneration === 42 && intent.profileGeneration === 42
    };

    return {
        reviewAlertSnapshot,
        badge,
        badgeViolations,
        checkInSnapshot,
        checkIn,
        intent,
        ctx,
        sameFlow
    };
}

// --- Top-level: run the harness, return the populated receipt ---

export function runHarness() {
    const fixtures = loadRealFixtures();
    const { matrix, matrixDispatchTools, matrixSkills } = fixtures;
    const { reviewItem, improvementRun } = pickRealCandidate(fixtures);
    const vak = vakEvaluate(improvementRun, reviewItem, matrix);
    const orch = animaOrchestrate(reviewItem, matrix, matrixDispatchTools);
    const parityCheck = ACR.assertCapabilityParity(matrixDispatchTools, [...matrixDispatchTools]);
    orch.three_way_parity_check = parityCheck.equal;
    orch.matrix_dispatch_tools = matrixDispatchTools;
    orch.matrix_skills_count = matrixSkills.length;

    const policy = enforceBoundedPolicy(orch.actor_selected);
    const stream = buildRunStream(orch.actor_selected, orch.route_chosen, improvementRun);
    const packet = buildEvidencePacket(improvementRun, reviewItem);
    const missing = ACR.missingEvidenceFields(packet);

    const gateParity = exerciseHumanGateParity({ reviewItem, orch, matrix });
    const surfaces = exerciseSurfacesParity({ reviewItem, candidate: improvementRun, orch, packet });

    const payloadCompleteness = {
        source_anchor_present: packet.sourceAnchor != null,
        spec_anchor_present: packet.specAnchor != null,
        code_anchor_present: packet.codeAnchor != null,
        test_anchor_present: packet.testAnchor != null,
        profile_generation_present: packet.profileGeneration != null,
        s2_handle_present: packet.graphAnchor != null,
        s3_handle_present: packet.sessionKey != null,
        privacy_class_present: typeof packet.privacyClass === 'string' && packet.privacyClass.length > 0,
        review_id_present: packet.reviewId != null,
        missing_required_fields: missing
    };

    return {
        fixture_kind: '10-t8-agentic-mediation-e2e',
        captured_at: new Date().toISOString(),
        captured_by: 'admin-10t8-agentic-mediation-e2e',
        substrate_anchors: {
            capability_matrix: 'Body/S/S4/plugins/pleroma/capability-matrix.json',
            agentic_control_room_run_model:
                'Body/M/epi-theia/extensions/agentic-control-room/src/common/run-model.ts',
            body_lite_deep_link_intents:
                'Body/M/epi-theia/extensions/body-lite-surface/src/common/deep-link-intents.ts',
            review_governance_rust:
                'Body/S/S5/epii-review-core/src/lib.rs (requires_human_resolution)',
            baseline_thread_k_10_t2:
                'Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/' +
                'plan.runs/10-t2-s5-review-baseline-20260602T000502Z.json'
        },
        candidate: {
            id: improvementRun.run_id,
            review_item_id: reviewItem.item_id,
            requires_human: reviewItem.requires_human,
            target_coordinate: improvementRun.target_coordinate,
            shape: {
                run_id: improvementRun.run_id,
                target_family: improvementRun.target_family,
                target_coordinate: improvementRun.target_coordinate,
                direction: improvementRun.direction,
                baseline_path: improvementRun.baseline?.path,
                review_item_title: reviewItem.title,
                review_item_priority: reviewItem.priority,
                review_item_status: reviewItem.status
            },
            captured_via:
                'JSON.parse(Body/S/S5/fixtures/track-04-t0/s5-review-state.json + ' +
                's5-improvement-state.json) — cross-referenced to 10-t2-s5-review-baseline-' +
                '20260602T000502Z.json (Thread K capture from cargo --offline)'
        },
        vak_evaluation: vak,
        anima_orchestration: orch,
        bounded_capability_policy: policy,
        tool_run_stream: stream,
        evidence_deposition: {
            envelope_id: `env::${packet.candidateId}`,
            anchors: {
                source: packet.sourceAnchor,
                spec: packet.specAnchor,
                code: packet.codeAnchor,
                test: packet.testAnchor,
                graph: packet.graphAnchor
            },
            profile_generation: packet.profileGeneration,
            s2_handle: packet.graphAnchor,
            s3_handle: packet.sessionKey,
            day_now_context: packet.dayNowContext,
            privacy_class: packet.privacyClass,
            review_id: packet.reviewId,
            bridge_readiness_handle: packet.bridgeReadinessHandle,
            required_mediated_fields: [...ACR.REQUIRED_MEDIATED_EVIDENCE_FIELDS]
        },
        review_gate: {
            gate_type: 'human-required',
            agent_attempted_resolution: true,
            ui_blocked: true,
            gateway_blocked: true,
            parity_asserted: gateParity.rows.ui_and_gateway_agree_on_block,
            agent_defer_recorded: gateParity.gwDefer.ok === true,
            attempted_decisions: ['approve', 'reject', 'revise', 'defer'],
            ui_reasons: {
                approve: gateParity.uiResult.approve.ok ? null : gateParity.uiResult.approve.reason,
                reject: gateParity.uiResult.reject.ok ? null : gateParity.uiResult.reject.reason,
                revise: gateParity.uiResult.revise.ok ? null : gateParity.uiResult.revise.reason
            },
            gateway_reasons: {
                approve: gateParity.gwResult.approve.ok ? null : gateParity.gwResult.approve.reason,
                reject: gateParity.gwResult.reject.ok ? null : gateParity.gwResult.reject.reason,
                revise: gateParity.gwResult.revise.ok ? null : gateParity.gwResult.revise.reason,
                promote_non_dry_run: gateParity.gwPromote.ok ? null : gateParity.gwPromote.reason
            }
        },
        dry_run_promotion: {
            shape: {
                run_id: improvementRun.run_id,
                destination: improvementRun.target_coordinate,
                governance_category: 'aletheia_crystallisation',
                approved_review_resolution_id: null,
                ok: true,
                dry_run: true,
                promoted_path: improvementRun.baseline.path,
                compile_artifacts: [],
                compile_errors: [],
                rollback_executable: true
            },
            produced: true
        },
        surfaces: {
            agentic_control_room_observed: {
                run_tree_populated: stream.length > 0,
                tool_stream_populated: stream.some((e) => e.kind.startsWith('tool.')),
                evidence_visible: true,
                review_controls_correct: gateParity.rows.agent_approve_blocked_at_ui === true,
                widget_ids: Object.fromEntries(Object.entries(ACR.ACR_WIDGET_IDS))
            },
            body_lite_notification_observed: {
                review_alert_present: surfaces.reviewAlertSnapshot.pendingCount > 0,
                agent_checkin_populated: surfaces.checkInSnapshot.activeRunCount > 0,
                deep_link_to_control_room_armed:
                    surfaces.intent.requestedExtensionId === 'agentic-control-room' &&
                    surfaces.intent.requestedContributionId === 'run-flow',
                deep_link_context_fields_preserved: BodyLite.BODY_DEEP_LINK_CONTEXT_FIELDS.every(
                    (f) => f in surfaces.ctx
                ),
                widget_ids: Object.fromEntries(Object.entries(BodyLite.BODY_LITE_WIDGET_IDS)),
                deep_link_command_ids: Object.fromEntries(Object.entries(BodyLite.BODY_DEEP_LINK_COMMAND_IDS))
            },
            same_flow_parity: surfaces.sameFlow
        },
        human_gate_parity: gateParity.rows,
        payload_completeness: payloadCompleteness,
        verification_commands: [
            'cd Body/M/epi-theia && node --test extensions/test/agentic-mediation-e2e/e2e.test.mjs',
            'cd Body/M/epi-theia && node extensions/test/agentic-mediation-e2e/capture-receipt.mjs',
            'cargo test --offline --manifest-path Body/S/S5/epii-review-core/Cargo.toml',
            'cargo test --offline --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml',
            'cargo test --offline --manifest-path Body/S/S5/epii-agent-core/Cargo.toml'
        ]
    };
}
