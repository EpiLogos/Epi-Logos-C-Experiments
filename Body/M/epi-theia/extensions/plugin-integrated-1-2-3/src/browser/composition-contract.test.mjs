import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    SOLAR_ANCHOR_COMPOSITION_CONTRACT,
    TRANCHE_09_5_CROSS_LINK,
    assertSolarAnchorCompositionContract,
    attachProfileTickPropagation
} = require('../../lib/common/composition-contract.js');

test('closing composition contract explicitly owns B-8, B-9, and B-12', () => {
    const contract = assertSolarAnchorCompositionContract(SOLAR_ANCHOR_COMPOSITION_CONTRACT);

    assert.deepEqual(contract.seams, ['B-8', 'B-9', 'B-12']);
    assert.equal(contract.solarAnchor.seam, 'B-8');
    assert.equal(contract.solarAnchor.register, 'design_principle');
    assert.match(contract.solarAnchor.label, /^Solar anchor/);
    assert.match(contract.solarAnchor.label, /immovable centre/);
    assert.equal(contract.planetaryPlacement.seam, 'B-9');
    assert.equal(contract.planetaryPlacement.register, 'profile_sourced');
    assert.equal(contract.planetaryPlacement.sourceField, 'planetaryChakral');
    assert.equal(contract.planetaryPlacement.orbitsSolarAnchor, true);
    assert.equal(contract.propagation.seam, 'B-12');
    assert.equal(contract.propagation.register, 'propagation_seam');
    assert.equal(contract.propagation.trigger, 'kernel-bridge:profile-tick');
    assert.match(TRANCHE_09_5_CROSS_LINK.note, /B-8 solar anchor/);
    assert.match(TRANCHE_09_5_CROSS_LINK.note, /B-9 planetary placement/);
    assert.match(TRANCHE_09_5_CROSS_LINK.note, /B-12 cross-surface edit propagation/);
});

test('B-12 propagation listener reports edits only when profile-tick generation advances', () => {
    const listeners = [];
    const events = [];
    const bridge = {
        onProfile(listener) {
            listeners.push(listener);
            return {
                dispose() {
                    listeners.splice(listeners.indexOf(listener), 1);
                }
            };
        }
    };

    const disposable = attachProfileTickPropagation(bridge, event => {
        events.push(event);
    });

    listeners[0](Object.freeze({ generation: 1 }));
    listeners[0](Object.freeze({ generation: 1 }));
    listeners[0](Object.freeze({ generation: 2 }));
    listeners[0](null);

    assert.deepEqual(events, [
        { fromGeneration: null, toGeneration: 1, edited: true },
        { fromGeneration: 1, toGeneration: 1, edited: false },
        { fromGeneration: 1, toGeneration: 2, edited: true },
        { fromGeneration: 2, toGeneration: null, edited: false }
    ]);

    disposable.dispose();
    assert.equal(listeners.length, 0);
});
