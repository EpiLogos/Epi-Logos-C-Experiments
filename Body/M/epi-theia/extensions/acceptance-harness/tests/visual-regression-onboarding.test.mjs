import test from 'node:test';
import assert from 'node:assert/strict';

import {
    readVisualFixture,
    readVisualText
} from './onboarding-harness.mjs';

test('onboarding visual-regression manifest commits every required baseline family', () => {
    const manifest = readVisualFixture('manifest.json');
    assert.equal(manifest.privacyClass, 'protected-local-synthetic-fixture');

    const suites = new Map(manifest.suites.map(suite => [suite.id, suite]));
    for (const required of [
        'cold-start-splash',
        'walkthrough-overlay',
        'per-mn-empty-states',
        'pasu-wizard',
        'xor-ceremony',
        'reduced-motion'
    ]) {
        assert.ok(suites.has(required), `${required} suite must be present`);
    }

    assert.equal(suites.get('cold-start-splash').frames.length, 3);
    assert.equal(suites.get('walkthrough-overlay').frames.length, 6);
    assert.equal(suites.get('per-mn-empty-states').frames.length, 6);
    assert.equal(suites.get('pasu-wizard').frames.length, 6);
    assert.equal(suites.get('xor-ceremony').frames.length, 1);
    assert.equal(suites.get('reduced-motion').frames.length, 1);
});

test('onboarding visual-regression DOM baselines match manifest frame contracts', () => {
    const manifest = readVisualFixture('manifest.json');

    for (const suite of manifest.suites) {
        for (const frame of suite.frames) {
            const html = readVisualText(frame.domSnapshot);
            assert.match(frame.screenshot, /\.png$/);
            assert.ok(html.includes(`data-suite="${suite.id}"`), `${frame.domSnapshot} must name suite ${suite.id}`);
            if (frame.anchor) {
                assert.ok(html.includes(`data-anchor="${frame.anchor}"`), `${frame.domSnapshot} must include anchor ${frame.anchor}`);
            }
            if (suite.id === 'per-mn-empty-states') {
                assert.ok(html.includes(`data-extension="${frame.id}"`));
            }
        }
    }
});

test('reduced-motion onboarding fixture suppresses shimmer, pulse, and fold surfaces', () => {
    const manifest = readVisualFixture('manifest.json');
    const suite = manifest.suites.find(candidate => candidate.id === 'reduced-motion');
    const html = readVisualText(suite.frames[0].domSnapshot);

    assert.equal(suite.preference, 'epi-logos.motion.reduced');
    for (const className of suite.expectedNoMotionClasses) {
        assert.ok(html.includes(className), `reduced-motion DOM includes ${className}`);
    }
    for (const surface of ['cold-start-splash', 'walkthrough-overlay', 'xor-ceremony']) {
        assert.ok(html.includes(`data-surface="${surface}"`));
    }
});

