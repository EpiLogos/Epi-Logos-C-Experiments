// Track 12 T12.07 — Pi runtime monitor terminal observability.
//
// Renders the production React panel against gateway-shaped session payloads
// and PortalTemporalSurface-shaped metadata. The monitor is read-only: it
// shows terminal observability fields and diagnostics commands without raw
// terminal scrollback or direct tmux/cmux process authority.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const {
    buildPiRuntimeMonitorProjection
} = require('../lib/common/run-model.js');
const {
    PiRuntimeMonitorPanel
} = require('../lib/browser/pi-runtime-monitor-view.js');

const portalTemporalSurface = Object.freeze({
    canonicalSessionKey: 'agent:main:main',
    activeAgentId: 'pi.main',
    dayId: '11-06-2026',
    nowPath: 'Idea/Empty/Present/11-06-2026/20260611-154015-12T1207/now.md',
    nowWikilink: '[[20260611-154015-12T1207/now]]',
    kernelGeneration: 44,
    kernelSubTick: 2,
    terminalBacked: true,
    terminalProvider: 'tmux',
    terminalStatus: 'attached',
    terminalLeaseExpiresAtMs: 1781199615608,
    terminalCapturePolicyMode: 'metadataOnly',
    terminalCaptureHandleRef: 's3:gateway:temporal:session/main:terminal:capture-handle',
    terminalMetadataKey: 'cache:hot:s3:gateway:temporal:session/main:terminal:metadata'
});

const terminalBackedSession = Object.freeze({
    canonicalKey: 'agent:main:main',
    activeAgentId: 'pi.main',
    teamId: 'team-alpha',
    teamRole: 'lead',
    orchestrationKind: 'anima-chain',
    parentSessionKey: 'agent:root',
    sourceSessionKey: 'agent:root',
    sourceSessionKind: 'team',
    subagentLineage: ['anima', 'psyche', 'pi.main'],
    dayId: '11-06-2026',
    vaultNowPath: 'Idea/Empty/Present/11-06-2026/20260611-154015-12T1207/now.md',
    cmuxWorkspace: 'epi-team-alpha',
    cmuxSurface: 'leader',
    cmuxPaneId: 'pane-main',
    terminalBinding: {
        terminalIdentifier: 'tmux:epi-team-alpha',
        tmuxPaneId: '%7',
        attachedSessionKey: 'agent:main:main',
        terminalStatus: 'attached',
        lease: {
            leaseOwner: 'pi.main',
            leasePurpose: 'operator-presence',
            leaseExpiresAtMs: 1781199615608
        },
        capturePolicy: {
            mode: 'metadataOnly',
            maxLines: null,
            redactionPolicy: 'metadata-only'
        },
        captureHandleRef: 's3:gateway:temporal:session/main:terminal:capture-handle',
        rawPaneBodyIncluded: false
    },
    runState: {
        lastRunId: 'run-20260611T154015Z-super-secret-terminal-handle'
    },
    updatedAtMs: 1781199000000
});

test('Pi monitor projection names terminal observability fields without scrollback', () => {
    const projection = buildPiRuntimeMonitorProjection({
        portalTemporalSurface,
        resolvedSession: terminalBackedSession
    });

    assert.equal(projection.sessionKey, 'agent:main:main');
    assert.equal(projection.activeAgent, 'pi.main');
    assert.equal(projection.role, 'lead');
    assert.equal(projection.cmuxProjection, 'epi-team-alpha/leader/pane-main');
    assert.equal(projection.terminalProvider, 'tmux');
    assert.equal(projection.terminalStatus, 'attached');
    assert.equal(projection.leaseExpires, '1781199615608');
    assert.equal(projection.lastObservedTick, 'kernel:44.2');
    assert.equal(projection.captureAvailability, 'metadata-only');
    assert.equal(projection.rawTerminalScrollbackRendered, false);
    assert.match(projection.redactedLastRunHandle, /^run-20\.\.\./);
    assert.deepEqual(projection.diagnosticsDeepLinks, [
        'epi agent tmux inspect --session-key agent:main:main',
        'techne_terminal_inspect session_key=agent:main:main'
    ]);
});

test('Pi monitor UI renders terminal-backed and captured non-terminal sessions distinctly', () => {
    const terminalHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(PiRuntimeMonitorPanel, {
            portalTemporalSurface,
            resolvedSession: terminalBackedSession
        })
    );
    assert.match(terminalHtml, /data-terminal-backed="true"/);
    assert.match(terminalHtml, /terminalStatus/);
    assert.match(terminalHtml, /attached/);
    assert.match(terminalHtml, /leaseExpires/);
    assert.match(terminalHtml, /epi agent tmux inspect --session-key agent:main:main/);
    assert.match(terminalHtml, /techne_terminal_inspect session_key=agent:main:main/);
    assert.doesNotMatch(terminalHtml, /super-secret-terminal-handle/);
    assert.doesNotMatch(terminalHtml, /RAW_SCROLLBACK_SECRET/);

    const capturedNonTerminalHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(PiRuntimeMonitorPanel, {
            portalTemporalSurface: {
                ...portalTemporalSurface,
                canonicalSessionKey: 'agent:captured:main',
                terminalBacked: false,
                terminalProvider: null,
                terminalStatus: null,
                terminalLeaseExpiresAtMs: null,
                terminalCapturePolicyMode: 'transcript'
            },
            resolvedSession: {
                canonicalKey: 'agent:captured:main',
                activeAgentId: 'logos.worker',
                teamRole: 'worker',
                dayId: '11-06-2026',
                vaultNowPath: 'Idea/Empty/Present/11-06-2026/20260611-154015-12T1207/now.md',
                cmuxWorkspace: null,
                cmuxSurface: null,
                cmuxPaneId: null,
                terminalBinding: null,
                capturePolicy: {
                    mode: 'transcript',
                    maxLines: 80,
                    redactionPolicy: 'configured'
                },
                captureHandleRef: 'capture://bounded/non-terminal/logos-worker',
                lastRunId: 'run-captured-20260611T154015Z-secret',
                updatedAtMs: 1781199001111
            }
        })
    );

    assert.match(capturedNonTerminalHtml, /data-terminal-backed="false"/);
    assert.match(capturedNonTerminalHtml, /captured-non-terminal/);
    assert.match(capturedNonTerminalHtml, /none\/none\/none/);
    assert.match(capturedNonTerminalHtml, /unbound/);
    assert.doesNotMatch(capturedNonTerminalHtml, /run-captured-20260611T154015Z-secret/);
    assert.doesNotMatch(capturedNonTerminalHtml, /RAW_SCROLLBACK_SECRET/);
});
