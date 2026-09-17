import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

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
    .set({ applicationName: 'm4-nara-lens-application-node-test' });

const {
    buildLensApplyRequest,
    buildLensApplicationReading,
    buildLensDescriptors,
    buildLensSynthesisReading,
    lensApplicationPayload,
    writeLensApplicationArtifact,
    writeLensSynthesisArtifact
} = require('../m4-nara/lib/browser/widgets/lens-application.js');
const {
    buildS2CanonicalProjection,
    readNaraDayContainer
} = require('../m4-nara/lib/common/nara-surface.js');

async function withVault(fn) {
    const vaultRoot = await mkdtemp(join(tmpdir(), 'm4-nara-lens-'));
    try {
        return await fn(vaultRoot);
    } finally {
        await rm(vaultRoot, { recursive: true, force: true });
    }
}

function syntheticLensList() {
    return [
        {
            index: 4,
            name: 'Phenomenological',
            mode: 'day',
            subpositions: ['Sein', 'Geworfenheit', 'Dasein', 'Zeit', 'Besorge', 'Gelassenheit']
        },
        {
            index: 5,
            name: 'Para Vak',
            mode: 'day',
            subpositions: ['Anuttara', 'Para Vak', 'Pasyanti', 'Madhyama', 'Vaikhari', 'Matrika']
        },
        {
            index: 7,
            name: 'Phenomenal',
            mode: 'night',
            subpositions: ['Introversion', 'Sensation', 'Feeling', 'Thinking', 'Intuition', 'Extroversion']
        }
    ];
}

test('lens-list RPC data normalizes into Jungian, Trika, and Phenomenal tabs', async () => {
    const bridge = {
        async invokeGatewayRpc(method) {
            assert.equal(method, 'nara.lens.list');
            return syntheticLensList();
        }
    };

    const descriptors = buildLensDescriptors(await bridge.invokeGatewayRpc('nara.lens.list', {}));

    assert.deepEqual(descriptors.map(item => item.tab.id), ['jungian', 'trika', 'phenomenal']);
    assert.equal(descriptors[0].tab.readingName, 'Jungian psychic-functions reading');
    assert.equal(descriptors[0].positions[2].label, 'Feeling');
    assert.deepEqual(
        descriptors[0].activeSquareSlots.map(slot => slot.label),
        ['Causal', 'Phenomenological', 'Phenomenal', 'Scientific']
    );
});

test('apply form builds deterministic position and active-square request from fixture subject', () => {
    const descriptors = buildLensDescriptors(syntheticLensList());
    const jungian = descriptors.find(item => item.tab.id === 'jungian');
    const position = jungian.positions[3];
    const activeSquare = jungian.activeSquareSlots[2];
    const subject = 'protected local fixture subject';

    const request = buildLensApplyRequest(jungian, subject, position, activeSquare);
    const reading = buildLensApplicationReading(
        jungian,
        position,
        activeSquare,
        { result: 'fixture backend reading' },
        0
    );

    assert.deepEqual(request, {
        lens: 'jungian',
        subject,
        position: 'L7:3',
        active_square: 'M4-3:square-1/slot-2/L7'
    });
    assert.equal(reading.readingName, 'Jungian psychic-functions reading');
    assert.equal(reading.c_3_lens_route, 'M4-3/jungian/L7/P3');
    assert.equal(reading.c_3_active_square, 'M4-3:square-1/slot-2/L7');
    assert.deepEqual(reading.vak_address.cp, ['M4-3/L7/P3', 'M4-3:square-1/slot-2/L7']);
});

test('apply output writes contemplative artifact without making subject authoritative payload', async () => {
    await withVault(async vaultRoot => {
        const descriptors = buildLensDescriptors(syntheticLensList());
        const trika = descriptors.find(item => item.tab.id === 'trika');
        const reading = buildLensApplicationReading(
            trika,
            trika.positions[1],
            trika.activeSquareSlots[0],
            { result: 'trika fixture reading' },
            0
        );
        const artifact = await writeLensApplicationArtifact(
            {
                vaultRoot,
                dayId: '2026-06-11',
                nowPath: 'Idea/Empty/Present/11-06-2026/20260611-170000-test/now.md',
                sessionKey: 'session://m4-nara/lens/test'
            },
            reading,
            'private subject body that must stay local'
        );
        const markdown = await readFile(artifact.artifactPath, 'utf8');

        assert.equal(artifact.kind, 'contemplative');
        assert.equal(artifact.payload.readingName, 'Trika Para Vak reading');
        assert.equal(artifact.payload.lensPositionRef, 'M4-3/L5/P1');
        assert.equal(artifact.payload.c_3_active_square, 'M4-3:square-0/slot-0/L0');
        assert.equal(artifact.payload.vak_address.cf, '(5/0)');
        assert.equal(lensApplicationPayload(reading).subject, undefined);
        assert.match(markdown, /private subject body that must stay local/);
    });
});

test('synthesize composition writes multi-lens artifact with active-square assertion', async () => {
    await withVault(async vaultRoot => {
        const descriptors = buildLensDescriptors(syntheticLensList());
        const first = buildLensApplicationReading(
            descriptors[0],
            descriptors[0].positions[0],
            descriptors[0].activeSquareSlots[0],
            { result: 'one' },
            0
        );
        const second = buildLensApplicationReading(
            descriptors[1],
            descriptors[1].positions[2],
            descriptors[1].activeSquareSlots[1],
            { result: 'two' },
            1
        );
        const synthesis = buildLensSynthesisReading([first, second], {
            result: 'synthesized fixture reading'
        });
        const artifact = await writeLensSynthesisArtifact(
            {
                vaultRoot,
                dayId: '2026-06-11',
                nowPath: 'Idea/Empty/Present/11-06-2026/20260611-170000-test/now.md',
                sessionKey: 'session://m4-nara/lens/synthesis-test'
            },
            synthesis
        );

        assert.equal(artifact.kind, 'contemplative');
        assert.equal(artifact.payload.applications.length, 2);
        assert.equal(artifact.payload.c_3_active_square, 'M4-3:square-1/slot-0/L1');
        assert.deepEqual(artifact.payload.lensPositionRefs, [
            'M4-3/L7/P0',
            'M4-3:square-1/slot-0/L1',
            'M4-3/L5/P2',
            'M4-3:square-0/slot-1/L5'
        ]);
    });
});

test('S2 canonical projection carries lens refs, active square, and vak address but not subject body', async () => {
    await withVault(async vaultRoot => {
        const descriptors = buildLensDescriptors(syntheticLensList());
        const descriptor = descriptors[2];
        const reading = buildLensApplicationReading(
            descriptor,
            descriptor.positions[4],
            descriptor.activeSquareSlots[2],
            { result: 'phenomenal fixture reading' },
            0
        );
        await writeLensApplicationArtifact(
            {
                vaultRoot,
                dayId: '2026-06-11',
                nowPath: 'Idea/Empty/Present/11-06-2026/20260611-170000-test/now.md',
                sessionKey: 'session://m4-nara/lens/privacy-test'
            },
            reading,
            'subject body must not cross into S2 projection'
        );
        const day = await readNaraDayContainer({ vaultRoot, dayId: '2026-06-11' });
        const projection = buildS2CanonicalProjection(day);
        const serialized = JSON.stringify(projection);

        assert.equal(projection.lensApplications.length, 1);
        assert.equal(projection.lensApplications[0].lensPositionRef, 'M4-3/L4/P4');
        assert.equal(projection.lensApplications[0].c_3_active_square, 'M4-3:square-1/slot-2/L7');
        assert.equal(projection.lensApplications[0].vak_address.cfp, 'phenomenal');
        assert.doesNotMatch(serialized, /subject body must not cross/);
        assert.doesNotMatch(serialized, /bodySha256/);
    });
});

test('source uses the three lens RPCs and handle-only privacy chrome', () => {
    const source = readFileSync(
        new URL('../m4-nara/src/browser/widgets/lens-application.tsx', import.meta.url),
        'utf8'
    );

    assert.match(source, /nara\.lens\.list/);
    assert.match(source, /nara\.lens\.apply/);
    assert.match(source, /nara\.lens\.synthesize/);
    assert.match(source, /mext-privacy-protected-local-handle-only/);
    assert.doesNotMatch(source, /authoritative claim/);
});
