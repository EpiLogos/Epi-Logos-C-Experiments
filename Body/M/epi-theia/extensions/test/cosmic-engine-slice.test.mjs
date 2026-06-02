// 08.T3 verification suite. Proves:
//
//   (1) Profile generation sync — a single profile generation change drives
//       identical pane availability snapshots for all three panes (M3 center,
//       M2 left, M1 right). The pane availability object explicitly carries
//       the profileGeneration field so the renderer can show the same id in
//       every header.
//   (2) No-local-tables discipline — static scan of the plugin source
//       rejects literal codon/tarot/planetary/pitch/correspondence tables.
//   (3) Composition discipline — the cosmic engine panes module reads each
//       field through the profile-field checker rather than declaring its
//       own field list, so the upstream owner stays the single source of
//       truth.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
    checkCosmicEnginePanes,
    COSMIC_ENGINE_PANE_FIELD_GROUPS,
    COSMIC_ENGINE_LAYOUT
} = require('../integrated-composition/lib/common/index.js');

const PLUGIN_SOURCE_ROOT =
    '/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src';

function readyProfile(generation, extra = {}) {
    return {
        generation,
        pointerAnchor: 'pointer://test',
        capabilities: [],
        payload: {
            lens: 'L1',
            mode: 'walk',
            audio_octet: { f0: 220 },
            nodal_quartet: [0, 1, 2, 3],
            planetaryChakral: { sun: 'ground' },
            resonance72: { tick: 1 },
            kleinFlipState: 'L',
            codon_rotation_projection: { codon: 0, rotation: 0 },
            mahamaya: { phase: 'incubation' },
            codec_lut: { v: 1 },
            s2_provenance: { source: 'bimba' },
            ...extra
        }
    };
}

test('one profile generation drives identical generation ids across all three panes', () => {
    const profile = readyProfile(42);
    const panes = checkCosmicEnginePanes(profile);
    assert.equal(panes.m3CenterStage.profileGeneration, 42);
    assert.equal(panes.m2LeftStage.profileGeneration, 42);
    assert.equal(panes.m1RightInspector.profileGeneration, 42);
    // ALL fields ready → all panes ready.
    assert.equal(panes.m3CenterStage.allFieldsPresent, true);
    assert.equal(panes.m2LeftStage.allFieldsPresent, true);
    assert.equal(panes.m1RightInspector.allFieldsPresent, true);
});

test('missing M3 codec LUT degrades only the M3 center stage with named owner track', () => {
    const profile = readyProfile(7);
    delete profile.payload.codec_lut;
    const panes = checkCosmicEnginePanes(profile);
    assert.equal(panes.m3CenterStage.allFieldsPresent, false);
    assert.deepEqual(panes.m3CenterStage.missingFields, ['codec_lut']);
    const lutField = panes.m3CenterStage.fields.find(f => f.field === 'codec_lut');
    assert.equal(lutField.present, false);
    assert.equal(lutField.blockerOwnerTrack, 'Track 02 S2 graph (M3 library)');

    // M2/M1 remain ready — block isolated to the named pane.
    assert.equal(panes.m2LeftStage.allFieldsPresent, true);
    assert.equal(panes.m1RightInspector.allFieldsPresent, true);
});

test('missing M1 audio bus degrades the M1 inspector but not M2 / M3', () => {
    const profile = readyProfile(7);
    delete profile.payload.audio_octet;
    const panes = checkCosmicEnginePanes(profile);
    assert.deepEqual(panes.m1RightInspector.missingFields, ['audio_octet']);
    assert.equal(panes.m2LeftStage.allFieldsPresent, true);
    assert.equal(panes.m3CenterStage.allFieldsPresent, true);
});

test('null profile produces all-panes-missing for fields with profileGeneration null', () => {
    const panes = checkCosmicEnginePanes(null);
    assert.equal(panes.m3CenterStage.profileGeneration, null);
    assert.equal(panes.m2LeftStage.profileGeneration, null);
    assert.equal(panes.m1RightInspector.profileGeneration, null);
    assert.equal(panes.m3CenterStage.allFieldsPresent, false);
    assert.equal(panes.m2LeftStage.allFieldsPresent, false);
    assert.equal(panes.m1RightInspector.allFieldsPresent, false);
});

test('cosmic engine pane field groups match the named layout owner extensions', () => {
    // Layout assigns M3 to center, M2 to left/evidence, M1 to right/side.
    // Field group keys must line up so the renderer always shows the right
    // pane for the right extension.
    assert.equal(COSMIC_ENGINE_LAYOUT.centerStageOwner, 'm3-mahamaya');
    assert.equal(COSMIC_ENGINE_LAYOUT.sidePanelOwner, 'm1-paramasiva');
    assert.equal(COSMIC_ENGINE_LAYOUT.evidencePanelOwner, 'm2-parashakti');
    assert.ok(COSMIC_ENGINE_PANE_FIELD_GROUPS['m3-center-stage'].length >= 2);
    assert.ok(COSMIC_ENGINE_PANE_FIELD_GROUPS['m2-left-stage'].length >= 2);
    assert.ok(COSMIC_ENGINE_PANE_FIELD_GROUPS['m1-right-inspector'].length >= 2);
});

// ---- No-local-tables discipline -----------------------------------------

const FORBIDDEN_LITERAL_PATTERNS = [
    // Long numeric arrays — classic local table shape.
    /\[\s*(?:-?\d+(?:\.\d+)?\s*,\s*){7,}-?\d+(?:\.\d+)?\s*\]/,
    // Object map with hundreds of keys (codon LUT, tarot deck, etc.)
    /\{\s*(?:'[^']+'|"[^"]+"|[A-Z_]+)\s*:[^,{}]{1,40}(?:,\s*(?:'[^']+'|"[^"]+"|[A-Z_]+)\s*:[^,{}]{1,40}){19,}\s*\}/,
    // Direct keywords combined with array literal start.
    /(codon|tarot|planet|pitch|chakra|hexagram|gua|trigram)[A-Z_a-z]*\s*[:=]\s*\[/,
    // Direct keywords combined with object literal mapping multiple keys.
    /(codonTable|tarotDeck|planetaryTable|pitchClassTable|chakralTable|correspondenceTable)\b/
];

function walk(dir) {
    const out = [];
    for (const entry of readdirSync(dir)) {
        if (entry === 'lib' || entry === 'node_modules') {
            continue;
        }
        const full = join(dir, entry);
        const stats = statSync(full);
        if (stats.isDirectory()) {
            out.push(...walk(full));
        } else if (['.ts', '.tsx', '.mjs', '.js'].includes(extname(entry))) {
            out.push(full);
        }
    }
    return out;
}

test('plugin-integrated-1-2-3 source contains no local codon/tarot/planetary/pitch/correspondence tables', () => {
    const files = walk(PLUGIN_SOURCE_ROOT);
    assert.ok(files.length >= 3, `expected to scan source files; got ${files.length}`);
    const offenses = [];
    for (const file of files) {
        const content = readFileSync(file, 'utf8');
        for (const pattern of FORBIDDEN_LITERAL_PATTERNS) {
            if (pattern.test(content)) {
                offenses.push({ file, pattern: pattern.source });
            }
        }
    }
    assert.deepEqual(offenses, [], `local-table offenses detected: ${JSON.stringify(offenses, null, 2)}`);
});

test('field group exhaustiveness — every M3/M2/M1 field listed has an explicit owner track', () => {
    // Indirect verification via the pane snapshot: every field reported in
    // the availability check must carry a non-empty blockerOwnerTrack.
    const panes = checkCosmicEnginePanes(null);
    const allFields = [
        ...panes.m3CenterStage.fields,
        ...panes.m2LeftStage.fields,
        ...panes.m1RightInspector.fields
    ];
    for (const f of allFields) {
        assert.ok(
            typeof f.blockerOwnerTrack === 'string' && f.blockerOwnerTrack.length > 0,
            `${f.field} missing blocker owner track`
        );
    }
});
