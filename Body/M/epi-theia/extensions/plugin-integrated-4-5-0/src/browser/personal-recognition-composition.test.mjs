import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

installBrowserImportShim();

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const {
    PersonalRecognitionComposition,
    buildPersonalCompositionModel,
    derivePersonalRecognitionModel
} = require('../../lib/browser/personal-recognition-composition.js');
const {
    CompositionProfileProvider
} = require('../../../integrated-composition/lib/browser/composition-profile-context.js');

const PACKAGE_ROOT = '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/plugin-integrated-4-5-0';

function installBrowserImportShim() {
    const requireForShim = createRequire(import.meta.url);
    requireForShim.extensions['.css'] = () => undefined;
    if (globalThis.document) {
        const {
            FrontendApplicationConfigProvider
        } = requireForShim('../../../../node_modules/@theia/core/lib/browser/frontend-application-config-provider.js');
        FrontendApplicationConfigProvider.set({
            applicationName: 'personal-recognition-composition-test',
            defaultTheme: 'light',
            defaultIconTheme: 'none'
        });
        return;
    }
    class ElementStub {}
    ElementStub.prototype.matches = () => false;
    ElementStub.prototype.msMatchesSelector = () => false;
    ElementStub.prototype.webkitMatchesSelector = () => false;
    ElementStub.prototype.contains = () => false;
    const element = () => Object.assign(new ElementStub(), {
        classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
        dataset: {},
        style: {},
        setAttribute() {},
        getAttribute() { return null; },
        removeAttribute() {},
        appendChild() {},
        removeChild() {},
        addEventListener() {},
        removeEventListener() {}
    });
    const navigator = { userAgent: 'node', platform: 'Linux x86_64' };
    globalThis.Element = ElementStub;
    globalThis.HTMLElement = ElementStub;
    globalThis.document = {
        createElement: element,
        documentElement: { style: {} },
        body: element(),
        addEventListener() {},
        removeEventListener() {},
        queryCommandSupported() { return false; }
    };
    globalThis.window = {
        document: globalThis.document,
        navigator,
        localStorage: {
            getItem() { return null; },
            setItem() {},
            removeItem() {}
        },
        getComputedStyle: () => ({})
    };
    Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: navigator
    });
    const {
        FrontendApplicationConfigProvider
    } = requireForShim('../../../../node_modules/@theia/core/lib/browser/frontend-application-config-provider.js');
    FrontendApplicationConfigProvider.set({
        applicationName: 'personal-recognition-composition-test',
        defaultTheme: 'light',
        defaultIconTheme: 'none'
    });
}

function projection(extra = {}) {
    return Object.freeze({
        entityId: 'user-being',
        entityKind: 'person',
        liveState: Object.freeze({
            spacetimeRowId: 'being_pattern_presence:user-being',
            generation: 42,
            redis: Object.freeze({ presence: 'handle:presence', state: 'handle:state' }),
            streamDelta: 'handle:stream-delta',
            graphitiEpisodeRefs: Object.freeze([
                Object.freeze({
                    episodeId: 'episode:user-being',
                    sourceRef: 'graphiti:episode:user-being',
                    publicSummary: 'public-safe summary only'
                })
            ])
        }),
        relationEdges: Object.freeze([]),
        elementalWeights: Object.freeze({ fire: 0.3 }),
        clockAddress: Object.freeze({ degree360: 137 }),
        monopolyOperator: 'MonoPoly',
        perspectiveRole: 'FirstPerson',
        naraFamilyRole: 'lineage-context',
        verifierRefs: Object.freeze([]),
        reviewRisk: 'canon-candidate',
        ...extra
    });
}

function profile(pasuProjection = projection()) {
    return Object.freeze({
        generation: 42,
        pointerAnchor: null,
        capabilities: Object.freeze([]),
        payload: Object.freeze({
            pasuBeingPatternProjection: pasuProjection,
            protectedPersonalFieldHandles: Object.freeze({
                qPersonalHandle: 'm4://protected/q/personal',
                qIdentityHandle: 'm4://protected/q/identity',
                qTransitHandle: 'm4://protected/q/transit',
                qActivityHandle: 'm4://protected/q/activity',
                qComposedHandle: 'm4://protected/q/composed'
            }),
            naraSurface: Object.freeze({
                daySummary: Object.freeze({
                    dayId: '02-06-2026',
                    nowPath: 'Idea/Empty/Present/02-06-2026/session/now.md',
                    summary: 'public-safe day summary'
                })
            }),
            M4_Temporal_Now: Object.freeze({
                natal: Object.freeze({
                    kind: 'NATAL',
                    planet_degrees: Object.freeze([0, 36, 72, 108, 144, 180, 216, 252, 288, 324])
                }),
                realtime: Object.freeze({
                    kind: 'REALTIME',
                    captured_at_ns: 1_780_000_000_000_000_000,
                    planet_degrees: Object.freeze([5, 41, 77, 113, 149, 185, 221, 257, 293, 329])
                }),
                kairotic_active: false
            }),
            audio_octet: Object.freeze([110, 123.47, 130.81, 146.83, 164.81, 174.61, 196, 220]),
            m3CodonRotationProjectionForLensRing: Object.freeze({
                cells: Object.freeze([]),
                activeRingIndex: 0,
                rotationPhase: 0
            }),
            virtueWitnessVector: 0b101010101
        })
    });
}

function bridgeWithProfile(currentProfile) {
    return {
        onProfile(listener) {
            listener(currentProfile);
            return { dispose() {} };
        }
    };
}

function renderComposition(currentProfile) {
    return renderToStaticMarkup(
        React.createElement(
            CompositionProfileProvider,
            { bridge: bridgeWithProfile(currentProfile) },
            React.createElement(PersonalRecognitionComposition)
        )
    );
}

test('personal recognition model passes current PASU projection to M4 and M5 surfaces', () => {
    const model = derivePersonalRecognitionModel(profile());

    assert.equal(model.entity?.entityRef.entityId, 'user-being');
    assert.equal(model.perspectiveCard.entityId, 'user-being');
    assert.equal(model.perspectiveCard.perspectiveRole, 'I');
    assert.equal(model.perspectiveCard.naraFamilyRole, 'lineage-context');
    assert.equal(model.reviewLayer.entityId, 'user-being');
    assert.equal(model.reviewLayer.reviewRisk, 'canon-candidate');
    assert.equal(model.reviewLayer.monopolyOperator, 'MonoPoly');
});

test('personal recognition component renders handles only and rejects raw bodies', () => {
    const html = renderComposition(profile());

    assert.match(html, /data-entity-id="user-being"/);
    assert.match(html, /data-perspective-role="I"/);
    assert.match(html, /lineage-context/);
    assert.match(html, /canon-candidate/);
    assert.doesNotMatch(html, /episodeBody|rawQuaternion|protected body/);

    assert.throws(
        () =>
            derivePersonalRecognitionModel(
                profile(
                    projection({
                        liveState: {
                            ...projection().liveState,
                            graphitiEpisodeRefs: [
                                {
                                    episodeId: 'ep-1',
                                    sourceRef: 'graphiti:episode:ep-1',
                                    publicSummary: 'summary',
                                    episodeBody: 'protected body'
                                }
                            ]
                        }
                    })
                )
            ),
        /episodeBody/
    );
});

test('personal recognition composition renders one editor surface with four owned geometric slots', () => {
    const html = renderComposition(profile());

    assert.equal((html.match(/data-editor-surface="personal-recognition-composition"/g) ?? []).length, 1);
    assert.equal((html.match(/data-test="personal-geometric-slot"/g) ?? []).length, 4);
    assert.match(html, /data-geometric-slot="left"/);
    assert.match(html, /data-geometric-slot="center"/);
    assert.match(html, /data-geometric-slot="right"/);
    assert.match(html, /data-geometric-slot="under"/);
    assert.match(html, /data-slot-owner="m4-nara"/);
    assert.match(html, /data-slot-owner="m5-epii"/);
    assert.match(html, /data-slot-owner="m0-anuttara"/);
    assert.doesNotMatch(html, /jiva-siva-layout/);
});

test('personal composition mounts the M4 personal cymatic field in the center slot', () => {
    const model = buildPersonalCompositionModel(profile());
    const html = renderComposition(profile());

    assert.equal(model.blockers.includes('pending-psychoid-cymatic-solver'), false);
    assert.ok(model.blockers.includes('pending-recognition-surface'));
    assert.match(html, /data-test="m4-personal-cymatic-field"/);
    assert.match(html, /data-view-id="m4\.nara\.personalField"/);
    assert.match(html, /data-q-composed-handle="m4:\/\/protected\/q\/composed"/);
    assert.doesNotMatch(html, /pending-psychoid-cymatic-solver/);
    assert.match(html, /pending-recognition-surface/);
    assert.doesNotMatch(html, /pending-virtue-witness/);
});

test('personal cymatic center consumes DR-M4-2 polarity without rendering raw audio octet values', () => {
    const html = renderComposition(profile());

    assert.match(html, /data-cymatic-polarity="1"/);
    assert.match(html, /data-psychoid-polarity="1"/);
    assert.match(html, /data-cymatic-polarity-canon="0=cosmic;1=personal"/);
    assert.match(html, /data-audio-octet-source="MathemeHarmonicProfile\.audio_octet"/);
    assert.match(html, /data-audio-octet-count="8"/);
    assert.doesNotMatch(html, /123\.47|130\.81|146\.83|164\.81|174\.61/);
});

test('plugin widget mounts PersonalRecognitionComposition as editor area instead of three-pane juxtaposition', () => {
    const widgetSource = readFileSync(
        join(PACKAGE_ROOT, 'src/browser/plugin-integrated-4-5-0-widget.tsx'),
        'utf8'
    );
    const renderBody = widgetSource.slice(widgetSource.indexOf('protected override render()'));

    assert.match(renderBody, /<PersonalRecognitionComposition/);
    assert.doesNotMatch(renderBody, /<JivaSivaPanes/);
});
