import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    ALETHEIA_TOOL_GUARDIANS,
    ALETHEIA_CRYSTALLISATION_MODE,
    ETYMOLOGY_GRAPH_NAMESPACE,
    SCENT_FOLLOWING_STAGES,
    buildAtelierGatewayParams,
    buildMobiusWriteBackProposal,
    etymologyUriFor,
    isAtelierPrivacySafe
} = require('../lib/common/atelier-surface.js');

test('scent-following stages preserve the root to Mobius write-back contract', () => {
    assert.deepEqual(
        SCENT_FOLLOWING_STAGES.map(stage => stage.id),
        ['root', 'cognate', 'drift', 'psychoid', 'pros-hen', 'mobius-write-back']
    );
    assert.equal(SCENT_FOLLOWING_STAGES[0].tool, 'aletheia_gnosis_query');
    assert.equal(SCENT_FOLLOWING_STAGES[2].tool, 'aletheia_thought_route');
    assert.equal(SCENT_FOLLOWING_STAGES[5].tool, 'aletheia_crystallise');
    assert.equal(SCENT_FOLLOWING_STAGES[5].gatewayMethod, "s5'.gnostic.ingest");
});

test('gateway params force etymology namespace and Anima dispatched Aletheia mode', () => {
    const params = buildAtelierGatewayParams(SCENT_FOLLOWING_STAGES[3], {
        term: ' Logos ',
        seedText: 'structural pressure',
        priorArtifacts: [
            {
                stageId: 'root',
                gatewayMethod: "s5'.gnostic.query",
                tool: 'aletheia_gnosis_query',
                artifact: { summary: 'root' },
                privacyClass: 'safe-public',
                provenanceHandles: ['etymology://logos/root']
            }
        ]
    });
    assert.equal(params.gatewayMethod, "s5'.gnostic.query");
    assert.equal(params.aletheiaTool, 'aletheia_thought_route');
    assert.equal(params.graphNamespace, ETYMOLOGY_GRAPH_NAMESPACE);
    assert.equal(params.etymologyUri, 'etymology://logos/psychoid');
    assert.equal(params.priorArtifactUris[0], 'etymology://logos/root');
    assert.equal(params.dispatch.dispatcher, 'Anima');
    assert.equal(params.dispatch.mode, ALETHEIA_CRYSTALLISATION_MODE);
    assert.deepEqual(params.dispatch.evidenceLineage, ALETHEIA_TOOL_GUARDIANS);
});

test('Mobius proposal requires write-back evidence and remains a governed gnostic ingest', () => {
    const evidence = SCENT_FOLLOWING_STAGES.map(stage => ({
        stageId: stage.id,
        gatewayMethod: stage.gatewayMethod,
        tool: stage.tool,
        artifact: { stage: stage.id },
        privacyClass: 'safe-public',
        provenanceHandles: [`etymology://logos/${stage.id}`]
    }));
    const proposal = buildMobiusWriteBackProposal('Logos', evidence);
    assert.equal(proposal.kind, 'logos-atelier.mobius-write-back-proposal');
    assert.equal(proposal.graphNamespace, 'etymology');
    assert.equal(proposal.etymologyUri, 'etymology://logos');
    assert.equal(proposal.proposedGatewayMethod, "s5'.gnostic.ingest");
    assert.equal(proposal.proposedTool, 'aletheia_crystallise');
    assert.equal(proposal.evidence.length, 6);
});

test('etymology URI and privacy gate reject invalid production inputs', () => {
    assert.equal(etymologyUriFor('Pros Hen', 'pros-hen'), 'etymology://pros%20hen/pros-hen');
    assert.throws(() => etymologyUriFor('   '), /non-empty term/);
    assert.equal(isAtelierPrivacySafe('safe-public'), true);
    assert.equal(isAtelierPrivacySafe('private-journal'), false);
});
