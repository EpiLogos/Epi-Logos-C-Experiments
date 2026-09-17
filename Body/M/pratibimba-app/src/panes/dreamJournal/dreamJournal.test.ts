// @vitest-environment node
/**
 * Coordinate: M4' Dream Journal — document + privacy gate (rerun 51.T51.6)
 * Residency: Body/M/pratibimba-app/src/panes/dreamJournal/dreamJournal.test.ts
 * Actualises: the two things that make this the SAME substrate rather than a
 *   parallel one, and the privacy law as a structural guarantee.
 *   (a) the artifact role comes from the day container's own register, and a
 *       written dream round-trips through `artifactRowFrom` as kind `dream`;
 *   (b) the handle carries no body and no title text, and the guard that
 *       proves it is exercised against a handle rather than trusted.
 * Does NOT own: the day-container projection (`m4DayContainer.test.ts`), the
 *   vault seam, the surface.
 * Contract: [[M4'-SPEC]] · rerun tranche [[51.T51.6]].
 */

import { describe, expect, it } from 'vitest';
import {
    buildDreamDocument,
    containsDreamBody,
    DREAM_ARTIFACT_ROLE,
    DREAM_HANDLE_PRIVACY_CLASS,
    dreamFileName,
    dreamHandleFor,
    dreamPathFor,
    isDreamPathInWriteScope,
    parseDreamDocument,
    type DreamEntry
} from './dreamJournal';
import { artifactRowFrom, M4_DAY_CONTAINER_ARTIFACT_KINDS } from '../m4DayContainer';

const DAY = '08-01-2026';
const SESSION = '20260801-101500-e2edream';
const BODY = 'I was walking a spiral staircase made of hexagrams and the sarcophagus opened';
const TITLE = 'the spiral staircase';

function document(): string {
    return buildDreamDocument({
        dayId: DAY,
        sessionKey: SESSION,
        createdAt: '2026-08-01T10:15:00.000Z',
        title: TITLE,
        body: BODY
    });
}

function entry(): DreamEntry {
    const path = dreamPathFor(DAY, SESSION, 'dream-101500.md');
    const parsed = parseDreamDocument(path, document());
    if (!parsed) {
        throw new Error('the dream document did not parse as a dream');
    }
    return parsed;
}

describe('51.T51.6 — the same substrate, not a parallel one', () => {
    it('takes its artifact role FROM the day container register', () => {
        expect(M4_DAY_CONTAINER_ARTIFACT_KINDS).toContain(DREAM_ARTIFACT_ROLE);
        expect(DREAM_ARTIFACT_ROLE).toBe('dream');
    });

    it('writes a document the day container classifies as a dream', () => {
        const path = dreamPathFor(DAY, SESSION, 'dream-101500.md');
        const row = artifactRowFrom({ name: 'dream-101500.md', path, isDir: false }, document());
        expect(row.kind, 'the container must recognise the artifact it always declared').toBe(
            'dream'
        );
        expect(row.role).toBe('dream');
        expect(row.kairosContext).toBe('[[Kairos]]');
        expect(row.provenanceHandle).toBe('vault-path');
    });

    it('lands inside the S1 write scope, with or without a session', () => {
        expect(dreamPathFor(DAY, SESSION, 'dream-101500.md')).toBe(
            `Empty/Present/${DAY}/${SESSION}/dream-101500.md`
        );
        expect(dreamPathFor(DAY, null, 'dream-101500.md')).toBe(
            `Empty/Present/${DAY}/dream-101500.md`
        );
        expect(isDreamPathInWriteScope(dreamPathFor(DAY, null, 'dream-101500.md'))).toBe(true);
        expect(isDreamPathInWriteScope('Bimba/World/leak.md')).toBe(false);
        expect(isDreamPathInWriteScope('Empty/Present/../../escape.md')).toBe(false);
    });

    it('names the file datetime-first with no counter', () => {
        expect(dreamFileName(new Date(2026, 7, 1, 9, 5, 3))).toBe('dream-090503.md');
    });

    it('carries the c_n_* frontmatter law the siblings use', () => {
        const text = document();
        expect(text).toContain('c_4_artifact_role: dream');
        expect(text).toContain(`c_3_day_id: "${DAY}"`);
        expect(text).toContain(`c_2_session_id: "${SESSION}"`);
        expect(text).toContain('c_3_created_at: "2026-08-01T10:15:00.000Z"');
        expect(text).toContain('c_5_privacy_class: protected_local');
    });

    it('round-trips title and body, and refuses a non-dream document', () => {
        const parsed = entry();
        expect(parsed.title).toBe(TITLE);
        expect(parsed.body).toBe(BODY);
        expect(parsed.dayId).toBe(DAY);
        expect(parsed.sessionKey).toBe(SESSION);
        // the ROLE is the discriminator, never the filename
        expect(
            parseDreamDocument(
                'Empty/Present/08-01-2026/dream-101500.md',
                '---\nc_4_artifact_role: journal\n---\n\n# not a dream\n\nbody\n'
            )
        ).toBeNull();
        expect(parseDreamDocument('x.md', 'no frontmatter at all')).toBeNull();
    });
});

describe('51.T51.6 — the privacy law is structural: only a handle leaves', () => {
    it('builds a handle with no body and no title text', () => {
        const dream = entry();
        const handle = dreamHandleFor(dream);
        expect(handle.privacyClass).toBe(DREAM_HANDLE_PRIVACY_CLASS);
        expect(Object.keys(handle).sort()).toEqual([
            'bodyLength',
            'createdAt',
            'dayId',
            'kind',
            'path',
            'privacyClass',
            'sessionKey',
            'titleLength'
        ]);
        expect(handle.bodyLength).toBe(BODY.length);
        expect(handle.titleLength).toBe(TITLE.length);
    });

    it('THE GUARD: a serialised handle carries none of the dream’s words', () => {
        const dream = entry();
        const handle = dreamHandleFor(dream);
        expect(
            containsDreamBody(handle, dream),
            'the handle must not carry the dream — this is the whole privacy law'
        ).toBe(false);
        expect(containsDreamBody(JSON.stringify(handle), dream)).toBe(false);
    });

    it('the guard really fires — it is not vacuously true', () => {
        const dream = entry();
        expect(containsDreamBody(dream.body, dream)).toBe(true);
        expect(containsDreamBody({ payload: { text: dream.body } }, dream)).toBe(true);
        // a PARTIAL quotation of a dream is still the dream
        expect(containsDreamBody('…made of hexagrams and…', dream)).toBe(true);
        expect(containsDreamBody(dream.title, dream)).toBe(true);
    });

    it('does not cry wolf on ordinary protocol vocabulary', () => {
        const dream = entry();
        expect(
            containsDreamBody(
                JSON.stringify({ method: 's2.graph.node', params: { coordinate: 'M4-3' } }),
                dream
            )
        ).toBe(false);
        expect(containsDreamBody(null, dream)).toBe(false);
        expect(containsDreamBody('', dream)).toBe(false);
    });
});
