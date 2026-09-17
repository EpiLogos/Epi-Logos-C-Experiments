import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require.extensions['.css'] = () => undefined;

const React = require('react');
const ReactDOMServer = require('react-dom/server');

const {
    ANUTTARA_SYMBOLIC_PARSE_SOURCE_SKILL_PATH,
    PI_AXIOM_TRANSLATION_HISTORY_METHOD,
    PiAxiomTranslationService,
    createPiAxiomTranslationViewModel
} = require('../lib/browser/services/pi-axiom-translation-service.js');

const {
    PiAxiomTranslationInspector
} = require('../lib/browser/acr/pi-axiom-translation-inspector.js');

const SOURCE_ROOT = resolve(__dirname, '..', 'src', 'browser');

function sampleStep(overrides = {}) {
    return {
        id: 'step-1',
        philosophicalEnglish: 'Every load-bearing canon claim must remain human-final.',
        formalNotation: 'LoadBearingCanon(x) -> HumanFinal(x)',
        owl: 'ClassAssertion(:LoadBearingCanon :candidateClaim)',
        shacl: 'sh:property [ sh:path :verifiedBy ; sh:hasValue :human ]',
        transitionReasoning: 'Pi preserves semantic scope before emitting machine-checkable constraints.',
        sourceSkillPath: ANUTTARA_SYMBOLIC_PARSE_SOURCE_SKILL_PATH,
        sourceAnchor: 'Axiom Translation Surface',
        ...overrides
    };
}

function sampleSession(overrides = {}) {
    return {
        id: 'axiom-session-1',
        initiatingDispatchNodeId: 'dispatch-node-26-14',
        verifiedBy: 'human',
        steps: [sampleStep()],
        ...overrides
    };
}

test('PiAxiomTranslationService fetches sessions from the S5 axiom translation history route', async () => {
    const calls = [];
    const service = new PiAxiomTranslationService();
    service.bridge = {
        cachedProfile: { generation: 26 },
        invokeCapability: async request => {
            calls.push(request);
            return {
                method: request.method,
                gatewayMethod: request.params.gatewayMethod,
                sessionKey: request.sessionKey,
                profileGeneration: request.profileGeneration,
                privacyClass: 'safe-public',
                provenanceHandles: [],
                vak: null,
                artifact: { sessions: [sampleSession()] }
            };
        }
    };

    const sessions = await service.fetchHistory({ dispatchNodeId: 'dispatch-node-26-14' });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, 'invokeGatewayRpc');
    assert.equal(calls[0].params.gatewayMethod, PI_AXIOM_TRANSLATION_HISTORY_METHOD);
    assert.equal(calls[0].profileGeneration, 26);
    assert.equal(calls[0].params.dispatchNodeId, 'dispatch-node-26-14');
    assert.equal(sessions[0].id, 'axiom-session-1');
    assert.equal(sessions[0].steps[0].sourceSkillPath, ANUTTARA_SYMBOLIC_PARSE_SOURCE_SKILL_PATH);
});

test('PiAxiomTranslationInspector renders four-column chain, reasoning trace, badges, and source click-through', () => {
    const model = createPiAxiomTranslationViewModel([sampleSession()]);
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(PiAxiomTranslationInspector, {
            model,
            expandedStepId: 'step-1'
        })
    );

    for (const heading of [
        'Philosophical English',
        'Formal Notation',
        'OWL',
        'SHACL'
    ]) {
        assert.match(markup, new RegExp(heading));
    }
    assert.equal((markup.match(/data-test="pi-axiom-transition-arrow"/g) ?? []).length, 3);
    assert.match(markup, /data-test="pi-axiom-reasoning-trace"/);
    assert.match(markup, /Pi axiom translation moves a candidate canonical articulation/);
    assert.match(markup, /data-verification="human"/);
    assert.match(markup, /data-command="backend-studio.openSource"/);
    assert.match(markup, /Body\/S\/S4\/pi-agent\/skills\/anuttara-symbolic-parse\/SKILL\.md/);
});

test('PiAxiomTranslationInspector surfaces green amber red verification badges', () => {
    const model = createPiAxiomTranslationViewModel([
        sampleSession({ id: 'human-session', verifiedBy: 'human' }),
        sampleSession({ id: 'pi-session', verifiedBy: 'pi' }),
        sampleSession({ id: 'pending-session', verifiedBy: 'pending' })
    ]);
    const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(PiAxiomTranslationInspector, { model })
    );

    assert.match(markup, /data-verification="human"/);
    assert.match(markup, /ide-shell-verification-human/);
    assert.match(markup, /data-verification="pi"/);
    assert.match(markup, /ide-shell-verification-pi/);
    assert.match(markup, /data-verification="pending"/);
    assert.match(markup, /ide-shell-verification-pending/);
});

test('Evidence, WisdomDelta, and ACR route strings point at PiAxiomTranslationInspector', () => {
    const evidenceSource = readFileSync(resolve(SOURCE_ROOT, 'evidence-pane-widget.tsx'), 'utf8');
    const reviewSource = readFileSync(resolve(SOURCE_ROOT, 'review-pane-widget.tsx'), 'utf8');
    const acrSource = readFileSync(resolve(SOURCE_ROOT, 'agentic-control-room-widget.tsx'), 'utf8');
    const frontendSource = readFileSync(resolve(SOURCE_ROOT, 'frontend-module.ts'), 'utf8');
    const contractSource = readFileSync(resolve(__dirname, '..', 'src', 'common', 'contract.ts'), 'utf8');
    const wisdomSource = readFileSync(
        resolve(__dirname, '..', '..', 'm5-epii', 'src', 'browser', 'services', 'wisdom-delta-components.tsx'),
        'utf8'
    );

    assert.match(evidenceSource, /axiomTranslationSessionId/);
    assert.match(reviewSource, /axiomTranslationQuestion/);
    assert.match(acrSource, /PiAxiomTranslationInspector/);
    assert.match(frontendSource, /PI_AXIOM_TRANSLATION/);
    assert.match(contractSource, /PI_AXIOM_TRANSLATION:\s*'pi-axiom-translation'/);
    assert.match(wisdomSource, /PiAxiomTranslationInspector/);
    assert.match(wisdomSource, /data-skill-route=\{question\.skillRoute\}/);
});
