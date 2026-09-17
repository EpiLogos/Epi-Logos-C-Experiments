import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

if (!globalThis.Element) {
    globalThis.Element = class Element {
        style = {};

        setAttribute() {
            return undefined;
        }

        removeAttribute() {
            return undefined;
        }

        matches() {
            return false;
        }
    };
}
if (!globalThis.document) {
    globalThis.document = {
        documentElement: new globalThis.Element(),
        createElement: () => new globalThis.Element(),
        querySelectorAll: () => [],
        queryCommandSupported: () => false,
        body: new globalThis.Element()
    };
}
if (!globalThis.window) {
    globalThis.window = {
        WebAssembly: globalThis.WebAssembly,
        navigator: { userAgent: 'node-test' },
        document: globalThis.document,
        innerWidth: 1200,
        innerHeight: 800,
        localStorage: {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined
        }
    };
}

const require = createRequire(import.meta.url);
require.extensions['.css'] = () => undefined;
require('@theia/core/lib/browser/frontend-application-config-provider')
    .FrontendApplicationConfigProvider
    .set({ applicationName: 'm4-nara-node-test' });

const React = require('react');
const ReactDOMServer = require('react-dom/server');

const {
    buildPublicProfilePayload,
    buildS2CanonicalProjection,
    createNaraArtifact,
    readNaraDayContainer
} = require('../m4-nara/lib/common/index.js');
const {
    CanvasEditorSurface,
    createCanvasEditorModel
} = require('../m4-nara/lib/browser/canvas-editor.js');
const {
    AGENT_HIGHLIGHT_CATEGORIES,
    USER_HIGHLIGHT_CATEGORIES,
    HighlightMark,
    buildHighlightAttributes,
    extractHighlights
} = require('../m4-nara/lib/browser/editor/extensions/highlight-mark.js');
const {
    FLOATING_MENU_USER_CATEGORIES,
    applyFloatingMenuHighlight
} = require('../m4-nara/lib/browser/editor/components/floating-menu.js');
const {
    HighlightService
} = require('../m4-nara/lib/browser/services/highlight-service.js');

async function withVault(fn) {
    const vaultRoot = await mkdtemp(join(tmpdir(), 'm4-nara-canvas-'));
    try {
        return await fn(vaultRoot);
    } finally {
        await rm(vaultRoot, { recursive: true, force: true });
    }
}

function makeTextDocWithHighlight(text, attrs) {
    return {
        descendants(visitor) {
            visitor({
                isText: true,
                text,
                marks: [
                    {
                        type: { name: 'highlight' },
                        attrs
                    }
                ]
            }, 1);
        }
    };
}

test('canvas editor surface mounts day NOW content and toggles daily-note highlight through floating menu action', async () => {
    await withVault(async vaultRoot => {
        await createNaraArtifact({
            vaultRoot,
            dayId: '2026-06-10',
            kind: 'journal',
            title: 'NOW canvas seed',
            body: 'Line one for the canvas.',
            nowPath: 'Idea/Empty/Present/10-06-2026/20260610-090000-test/now.md',
            sessionKey: 'session://m4-nara/canvas',
            privacyClass: 'protected_local',
            createdAt: '2026-06-10T09:00:00.000Z'
        });
        const day = await readNaraDayContainer({ vaultRoot, dayId: '2026-06-10' });
        const model = createCanvasEditorModel({
            dayContainer: day,
            context: {
                dayNowSessionHandle: '2026-06-10',
                profileGeneration: 77,
                pointerAnchor: 'pointer://m4/canvas'
            }
        });
        const service = new HighlightService();
        const selectedText = 'Line one';
        const attrs = applyFloatingMenuHighlight({
            category: 'daily-note',
            selectedText,
            service,
            editor: {
                toggleHighlight(attributes) {
                    return extractHighlights(makeTextDocWithHighlight(selectedText, attributes));
                }
            }
        });

        const markup = ReactDOMServer.renderToStaticMarkup(
            React.createElement(CanvasEditorSurface, {
                model,
                highlightService: service,
                bridge: { publish() {} }
            })
        );

        assert.match(markup, /data-test="m4-nara-canvas-editor"/);
        assert.match(markup, /Line one for the canvas\./);
        assert.equal(attrs.category, 'daily-note');
        assert.deepEqual(service.getHighlights().map(highlight => highlight.category), ['daily-note']);
        assert.equal(service.getHighlights()[0].text, selectedText);
        assert.ok(USER_HIGHLIGHT_CATEGORIES.includes('daily-note'));
        assert.ok(FLOATING_MENU_USER_CATEGORIES.includes('daily-note'));
    });
});

test('extractHighlights output remains protected-local and absent from public/S2 projections', async () => {
    await withVault(async vaultRoot => {
        const attrs = buildHighlightAttributes({
            category: 'daily-note',
            originalText: 'protected highlight body'
        });
        const extracted = extractHighlights(makeTextDocWithHighlight('protected highlight body', attrs));

        await createNaraArtifact({
            vaultRoot,
            dayId: '2026-06-10',
            kind: 'journal',
            title: 'Highlighted protected note',
            body: 'protected highlight body',
            nowPath: 'Idea/Empty/Present/10-06-2026/20260610-091500-test/now.md',
            sessionKey: 'session://m4-nara/highlight-privacy',
            privacyClass: 'protected_local',
            payload: {
                highlights: extracted
            },
            createdAt: '2026-06-10T09:15:00.000Z'
        });

        const day = await readNaraDayContainer({ vaultRoot, dayId: '2026-06-10' });
        const publicPayload = buildPublicProfilePayload(day);
        const s2Projection = buildS2CanonicalProjection(day);
        const serializedPublic = JSON.stringify(publicPayload);
        const serializedS2 = JSON.stringify(s2Projection);

        assert.equal(day.artifactTree[0].privacyClass, 'protected_local');
        assert.equal(day.artifactTree[0].payload.highlights[0].text, 'protected highlight body');
        assert.doesNotMatch(serializedPublic, /protected highlight body/);
        assert.doesNotMatch(serializedPublic, /highlights/);
        assert.doesNotMatch(serializedS2, /protected highlight body/);
        assert.doesNotMatch(serializedS2, /highlights/);
    });
});

test('highlight CSS defines visual rules for all user and agent categories', () => {
    const css = readFileSync(
        new URL('../m4-nara/style/highlights.css', import.meta.url),
        'utf8'
    );
    const expectedAccents = new Map([
        ['daily-note', '#fbbf24'],
        ['oracle', '#a78bfa'],
        ['dream', '#60a5fa'],
        ['expand', '#34d399'],
        ['recognition', '#d4a574'],
        ['prospective-surfacing', '#e8a3a3'],
        ['retrospective-surfacing', '#8090a3'],
        ['kairos-touch', '#b8c0cc'],
        ['somatic-mark', '#8a7355'],
        ['live-spread', '#5b3a7e']
    ]);
    const allCategories = [
        ...USER_HIGHLIGHT_CATEGORIES,
        ...AGENT_HIGHLIGHT_CATEGORIES
    ];

    assert.equal(allCategories.length, 10);
    for (const category of allCategories) {
        assert.equal(
            expectedAccents.has(category),
            true,
            `${category} missing expected visual accent`
        );
        assert.match(
            css,
            new RegExp(`\\.m4-nara-highlight-${category}\\s*\\{[^}]*${expectedAccents.get(category)}`),
            `${category} missing CSS rule`
        );
    }
    assert.match(css, /\.m4-nara-highlight\s*\{[^}]*border-left:[^}]*var\(--highlight-accent/s);
    assert.match(css, /\.m4-nara-highlight\s*\{[^}]*background:[^}]*var\(--highlight-accent/s);
});

test('agent prospective inscription renders in its visual register without replacing user content', () => {
    const service = new HighlightService();
    const userHighlight = {
        ...buildHighlightAttributes({
            category: 'daily-note',
            originalText: 'User text'
        }),
        from: 0,
        to: 9,
        text: 'User text'
    };
    service.addHighlight(userHighlight);

    const inscription = service.inscribeAgentMark(
        { from: 10, to: 33 },
        'prospective-surfacing',
        'Agent text forming here',
        'janus-prospective'
    );
    const rendered = HighlightMark.config.renderHTML({
        HTMLAttributes: {},
        mark: { attrs: inscription }
    });
    const [, attrs] = rendered;

    assert.equal(inscription.category, 'prospective-surfacing');
    assert.equal(inscription.text, 'Agent text forming here');
    assert.equal(inscription.sourceFacet, 'janus-prospective');
    assert.equal(inscription.privacyClass, 'protected_local');
    assert.equal(inscription.artifactKind, 'agent-chat');
    assert.deepEqual(
        service.getHighlights().map(highlight => ({
            category: highlight.category,
            from: highlight.from,
            to: highlight.to,
            text: highlight.text
        })),
        [
            {
                category: 'daily-note',
                from: 0,
                to: 9,
                text: 'User text'
            },
            {
                category: 'prospective-surfacing',
                from: 10,
                to: 33,
                text: 'Agent text forming here'
            }
        ]
    );
    assert.match(attrs.class, /m4-nara-highlight-prospective-surfacing/);
    assert.equal(attrs['data-highlight-id'], inscription.id);
});
