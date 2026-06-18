import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const {
    E4_LOCAL_ONLY_PRIVACY_CLASS,
    computeE4PersonalEnergy,
    computeE4PersonalEnergyGradient,
    createE4PersonalInputs,
    selectNaraLoraRuntime
} = require('../m4-nara/lib/common/e4-personal-energy.js');

function validInputs(overrides = {}) {
    return createE4PersonalInputs({
        pasuSnapshot: {
            q_identity: [1, 0, 0, 0],
            q_personal: [0, 1, 0, 0],
            birth_date: '1990-06-15',
            birth_location: 'Berlin, Germany',
            c_0_natal_chart_path: 'Pratibimba/Self/natal-chart.json',
            c_2_jungian: 'INFJ',
            c_3_gene_keys: '13.7.1',
            c_4_human_design: 'Projector',
            c_5_quintessence_hash: 'qhash-test',
            c_5_quintessence_clock: '2026-06-17T10:00:00.000Z',
            c_4_last_wound: 'wound-handle'
        },
        kairos: {
            planet_degrees: [14.2, 25.1, 302.4, 112.7, 88.5, 177.3, 201.6, 44.8, 269.9, 11.1],
            oracle_charges: { pp: 21, mm: 8, mp: 5, pn: 3 },
            tarot_psyche_anchor_signature: 'tarot://anchor/major-9',
            kairos_window_id: 'kairos://window/2026-06-17T10'
        },
        lora_checkpoint: {
            path: '/Users/admin/.epi-logos/nara/lora/checkpoints/voice-v7',
            version: 'voice-v7',
            privacy_class: 'local-only'
        },
        corpus: {
            journal_hashes: ['sha256:journal-a'],
            dream_hashes: ['sha256:dream-a'],
            phone_writing_hashes: ['sha256:phone-a'],
            model_version_key: 'gemma4-12b-q4'
        },
        ...overrides
    });
}

function state(overrides = {}) {
    return {
        q_b: [1, 0, 0, 0],
        q_p: [0.25, 0.75, 0.25, 0.5],
        mathemeHarmonicProfile: {
            resonance72Mean: 0.42,
            profileSchemaVersion: 'test-profile'
        },
        ...overrides
    };
}

test('E4 personal inputs carry exact PASU, kairos, checkpoint and corpus fields under local-only privacy', () => {
    const inputs = validInputs();

    assert.equal(E4_LOCAL_ONLY_PRIVACY_CLASS, 'local-only');
    assert.deepEqual(inputs.pasuSnapshot.q_identity, [1, 0, 0, 0]);
    assert.deepEqual(inputs.pasuSnapshot.q_personal, [0, 1, 0, 0]);
    assert.equal(inputs.pasuSnapshot.c_0_natal_chart_path, 'Pratibimba/Self/natal-chart.json');
    assert.equal(inputs.pasuSnapshot.c_2_jungian, 'INFJ');
    assert.equal(inputs.pasuSnapshot.c_3_gene_keys, '13.7.1');
    assert.equal(inputs.pasuSnapshot.c_4_human_design, 'Projector');
    assert.equal(inputs.pasuSnapshot.c_5_quintessence_hash, 'qhash-test');
    assert.equal(inputs.pasuSnapshot.c_5_quintessence_clock, '2026-06-17T10:00:00.000Z');
    assert.equal(inputs.pasuSnapshot.c_4_last_wound, 'wound-handle');
    assert.equal(inputs.kairos.planet_degrees.length, 10);
    assert.deepEqual(inputs.kairos.oracle_charges, { pp: 21, mm: 8, mp: 5, pn: 3 });
    assert.equal(inputs.lora_checkpoint.privacy_class, 'local-only');
    assert.deepEqual(inputs.corpus.phone_writing_hashes, ['sha256:phone-a']);
});

test('E4 rejects cloud and malformed personal substrate before scalar evaluation', () => {
    assert.throws(
        () => validInputs({
            lora_checkpoint: {
                path: 'https://example.com/nara.ckpt',
                version: 'voice-v7',
                privacy_class: 'cloud-opt-in'
            }
        }),
        /local-only/
    );
    assert.throws(
        () => validInputs({
            kairos: {
                planet_degrees: [14.2, 25.1, 302.4],
                oracle_charges: { pp: 21, mm: 8, mp: 5, pn: 3 },
                tarot_psyche_anchor_signature: 'tarot://anchor/major-9',
                kairos_window_id: 'kairos://window/2026-06-17T10'
            }
        }),
        /planet_degrees\[10\]/
    );
});

test('E4 scalar rewards personal coherence and records runtime provenance without privacy drift', () => {
    const inputs = validInputs();
    const apple = computeE4PersonalEnergy(state(), inputs, {
        runtime: selectNaraLoraRuntime({ platform: 'darwin', arch: 'arm64' })
    });
    const generic = computeE4PersonalEnergy(state(), inputs, {
        runtime: selectNaraLoraRuntime({ platform: 'linux', arch: 'x64' })
    });

    assert.equal(apple.provenance.privacyClass, 'local-only');
    assert.equal(apple.provenance.runtime, 'mlx-lora');
    assert.equal(generic.provenance.runtime, 'rust-native');
    assert.equal(apple.provenance.weightingCoefficient, 4);
    assert.equal(apple.provenance.decision, 'E_4 = personal/Nara substrate. Final.');
    assert.equal(apple.scalar >= 0, true);
    assert.equal(Number.isFinite(apple.scalar), true);
    assert.equal(Number.isFinite(generic.scalar), true);

    const closerToPersonal = computeE4PersonalEnergy(state({ q_p: [0, 1, 0, 0] }), inputs).scalar;
    assert.equal(closerToPersonal < apple.scalar, true);
});

test('E4 gradient exposes the autograd-shaped q_p path and tangent projection for Stream D', () => {
    const inputs = validInputs();
    const gradient = computeE4PersonalEnergyGradient(state(), inputs);

    assert.equal(gradient.gradient.length, 4);
    assert.equal(gradient.channel, 'E_4');
    assert.equal(gradient.provenance.autogradPath, 'rust-native-nara-lora-forward');
    assert.equal(gradient.provenance.mentalPoleMechanicsRef, "[[M4'/mental-pole-mechanics]] §7.5 ∇E_4");
    assert.equal(Number.isFinite(gradient.norm), true);

    const dot = gradient.gradient.reduce((sum, component, index) => sum + component * state().q_p[index], 0);
    assert.equal(Math.abs(dot) < 1e-9, true);
});
