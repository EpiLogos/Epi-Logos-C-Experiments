// 07.T7.2 verification suite — 137 = 64 + 72 + 1 composition assertion
// (Third Spanda Equation, five canonical forms).
//
// Proves:
//   (1) Render-test — the Third Spanda overlay renders with
//       parentAttribution === 'M1-5' (NOT 'M0-Anuttara-witness').
//   (2) Symbolic-skeleton wiring — the five canonical forms, the translation
//       rule, the Mersenne grounding, and the 7-8-9 spine are present as
//       overlay strings, not local computation.
//   (3) Register discipline — every face carries only one of the three allowed
//       labels (symbolic_skeleton / measurement_face / physics_reference); the
//       source never claims the QL stratum derives alpha.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const {
    THIRD_SPANDA_COMPOSITION,
    COMPOSITION_REGISTER_LABELS,
    PARENT_ATTRIBUTION,
    PARENT_ATTRIBUTION_REJECTED,
    assertThirdSpandaComposition
} = require('../plugin-integrated-1-2-3/lib/common/third-spanda-composition.js');
const {
    ThirdSpandaCompositionOverlay
} = require('../plugin-integrated-1-2-3/lib/browser/third-spanda-overlay.js');

const PLUGIN_SOURCE_ROOT =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src';

// ---- (1) Render-test -----------------------------------------------------

test('Third Spanda overlay renders parentAttribution === M1-5', () => {
    const markup = renderToStaticMarkup(
        React.createElement(ThirdSpandaCompositionOverlay, {})
    );
    // The widget render binds the +1 parent to M1-5.
    assert.equal(THIRD_SPANDA_COMPOSITION.parentAttribution, 'M1-5');
    assert.equal(PARENT_ATTRIBUTION, 'M1-5');
    assert.match(markup, /data-parent-attribution="M1-5"/);
    assert.match(markup, /\+1 parent: M1-5/);
    // It must NOT collapse the +1 onto the Anuttara witness axis.
    assert.equal(PARENT_ATTRIBUTION_REJECTED, 'M0-Anuttara-witness');
    assert.doesNotMatch(markup, /M0-Anuttara-witness/);
});

test('overlay markup carries the five canonical forms and the spine', () => {
    const markup = renderToStaticMarkup(
        React.createElement(ThirdSpandaCompositionOverlay, {})
    );
    for (const form of [
        '137 = 64 + 72 + 1',
        '137 = 64 + 2(36) + 1',
        '137 = 128 + 8 + 1',
        '137 = 2^7 + 9',
        '137 = (2^7 - 1) + 1 + 9'
    ]) {
        assert.ok(markup.includes(form), `missing canonical form: ${form}`);
    }
    assert.ok(markup.includes('9_M2 = 8_M3 + 1_M1'), 'missing translation rule');
    assert.ok(markup.includes('127 = 2^7 - 1'), 'missing Mersenne grounding');
    assert.ok(markup.includes('archetype-7 generator'), 'missing archetype-7 annotation');
});

// ---- (2) Composition invariant ------------------------------------------

test('composition slots sum to 137 with M1-5 as the +1 parent', () => {
    const model = assertThirdSpandaComposition(); // throws on any violation
    assert.equal(model.total, 137);
    const sum = model.slots.reduce((acc, s) => acc + s.value, 0);
    assert.equal(sum, 137);
    const parentSlot = model.slots.find(s => s.side === 'parent-+1');
    assert.equal(parentSlot.value, 1);
    assert.equal(parentSlot.subsystem, 'M1-5');
});

test('assertThirdSpandaComposition rejects a witness-axis parent attribution', () => {
    const broken = { ...THIRD_SPANDA_COMPOSITION, parentAttribution: 'M0-Anuttara-witness' };
    assert.throws(() => assertThirdSpandaComposition(broken), /parentAttribution must be 'M1-5'/);
});

test('the five canonical forms are all symbolic_skeleton', () => {
    assert.equal(THIRD_SPANDA_COMPOSITION.canonicalForms.length, 5);
    for (const form of THIRD_SPANDA_COMPOSITION.canonicalForms) {
        assert.equal(form.register, 'symbolic_skeleton', `${form.form} must be symbolic_skeleton`);
    }
});

// ---- (3) Register discipline ---------------------------------------------

test('only the three register labels exist; physics lanes are reference faces', () => {
    assert.deepEqual(
        [...COMPOSITION_REGISTER_LABELS].sort(),
        ['measurement_face', 'physics_reference', 'symbolic_skeleton']
    );
    // Physics lanes are labelled measurement/reference faces — never a fourth pole.
    assert.ok(THIRD_SPANDA_COMPOSITION.physicsFaces.length >= 1);
    for (const face of THIRD_SPANDA_COMPOSITION.physicsFaces) {
        assert.notEqual(face.register, 'symbolic_skeleton', `${face.lane} must not be symbolic_skeleton`);
        assert.ok(
            COMPOSITION_REGISTER_LABELS.includes(face.register),
            `${face.lane} has an unknown register label`
        );
    }
});

function walk(dir) {
    const out = [];
    for (const entry of readdirSync(dir)) {
        if (entry === 'lib' || entry === 'node_modules') {
            continue;
        }
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            out.push(...walk(full));
        } else if (['.ts', '.tsx'].includes(extname(entry))) {
            out.push(full);
        }
    }
    return out;
}

test('plugin source never claims the QL stratum derives alpha, and uses only the three labels', () => {
    const files = walk(PLUGIN_SOURCE_ROOT);
    const allowed = new Set(['symbolic_skeleton', 'measurement_face', 'physics_reference']);
    let sawSymbolicSkeleton = false;
    let sawMeasurementFace = false;
    let sawPhysicsReference = false;
    for (const file of files) {
        const content = readFileSync(file, 'utf8');
        // Forbidden register claim: QL must not be said to derive alpha.
        assert.doesNotMatch(
            content,
            /QL\s+derives\s+alpha/i,
            `${file} claims the QL stratum derives alpha`
        );
        if (content.includes('symbolic_skeleton')) { sawSymbolicSkeleton = true; }
        if (content.includes('measurement_face')) { sawMeasurementFace = true; }
        if (content.includes('physics_reference')) { sawPhysicsReference = true; }
        // Any quoted register-ish token must be one of the three allowed labels.
        const tokens = content.match(/'[a-z_]+_(?:skeleton|face|reference)'/g) || [];
        for (const tok of tokens) {
            const bare = tok.slice(1, -1);
            assert.ok(allowed.has(bare), `${file} uses non-allowed register label ${tok}`);
        }
    }
    assert.ok(sawSymbolicSkeleton, 'symbolic_skeleton label missing from source');
    assert.ok(sawMeasurementFace, 'measurement_face label missing from source');
    assert.ok(sawPhysicsReference, 'physics_reference label missing from source');
});

test('source wires the canonical-form symbolic skeleton (grep parity)', () => {
    const files = walk(PLUGIN_SOURCE_ROOT);
    const joined = files.map(f => readFileSync(f, 'utf8')).join('\n');
    for (const needle of [
        '127 = 2^7 - 1',
        '9_M2 = 8_M3 + 1_M1',
        'Third Spanda Equation',
        'Mersenne'
    ]) {
        assert.ok(joined.includes(needle), `source missing canonical wiring: ${needle}`);
    }
});
