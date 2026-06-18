import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

installBrowserImportShim();

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const {
    PersonalRecognitionComposition,
    derivePersonalRecognitionModel
} = require('../../lib/browser/personal-recognition-composition.js');

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
            pasuBeingPatternProjection: pasuProjection
        })
    });
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
    const html = renderToStaticMarkup(
        React.createElement(PersonalRecognitionComposition, { profile: profile() })
    );

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
