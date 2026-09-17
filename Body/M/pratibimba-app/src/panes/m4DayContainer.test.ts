/**
 * Coordinate: M' M4' (DayContainer projection law — 25.T25.2)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: the chip-presence law the brief states — each chip renders ONLY
 *   when its own key is declared — plus the two things the projection must
 *   never do: guess an artifact's role from its filename, or carry a body or a
 *   quaternion field into the surface.
 * Does NOT own: the Klein-weighting parse (m4NaraKleinWeighting.test.ts) or the
 *   vault read (DayCalendarPane.test.tsx drives that against a fake vault).
 */

import { describe, expect, it } from 'vitest';
import {
    artifactRowFrom,
    buildDayContainer,
    M4_DAY_CONTAINER_ARTIFACT_KINDS,
    sessionChipsFromNow
} from './m4DayContainer';

const FULL_NOW = `---
session_id: "20260727-093019-05da2e"
day_id: "27-07-2026"
c_3_tranche_mode: quiet:90m
c_3_response_orbit: next-morning
c_3_briefing_emitted: 2026-07-27T09:31:00Z
c_3_klein_weighting:
  prospective: 0.4
  retrospective: 0.6
---

# NOW
`;

const BARE_NOW = `---
session_id: "20260725-081642-0df085"
day_id: "25-07-2026"
---

# NOW
`;

describe('25.T25.2 — per-session chips', () => {
    it('reads every declared chip off the session NOW', () => {
        const chips = sessionChipsFromNow(FULL_NOW, 'Empty/Present/27-07-2026/s/now.md');
        expect(chips.trancheMode).toBe('quiet:90m');
        expect(chips.responseOrbit).toBe('next-morning');
        expect(chips.briefingEmitted).toBe('2026-07-27T09:31:00Z');
        expect(chips.kleinWeighting.state).toBe('resolved');
        expect(chips.kleinWeighting.prospective).toBe(0.4);
        expect(chips.kleinWeighting.retrospective).toBe(0.6);
    });

    it('leaves an undeclared chip ABSENT — never a default, never a zero', () => {
        const chips = sessionChipsFromNow(BARE_NOW);
        expect(chips.trancheMode).toBeNull();
        expect(chips.responseOrbit).toBeNull();
        expect(chips.briefingEmitted).toBeNull();
        expect(chips.kleinWeighting.state).toBe('pending-weighting');
        expect(chips.kleinWeighting.prospective).toBeNull();
    });

    it('treats an unreadable NOW as chipless rather than inventing a session', () => {
        const chips = sessionChipsFromNow(null);
        expect(chips.kleinWeighting.state).toBe('pending-weighting');
        expect(chips.briefingEmitted).toBeNull();
    });
});

describe('25.T25.2 — artifact rows', () => {
    const entry = (name: string) => ({ name, path: `Empty/Present/27-07-2026/s/${name}`, isDir: false });

    it('takes the kind from the artifact’s OWN declared role', () => {
        const row = artifactRowFrom(entry('a.md'), '---\nc_4_artifact_role: oracle\n---\n');
        expect(row.kind).toBe('oracle');
        expect(row.role).toBe('oracle');
    });

    it('does NOT guess a role from a filename — an undeclared file is unclassified', () => {
        expect(artifactRowFrom(entry('dream-of-the-sea.md')).kind).toBe('unclassified');
        expect(artifactRowFrom(entry('oracle-cast.md')).role).toBeNull();
    });

    it('keeps an out-of-vocabulary role visible but unclassified', () => {
        const row = artifactRowFrom(entry('x.md'), '---\nc_4_artifact_role: handoff\n---\n');
        expect(row.role).toBe('handoff');
        expect(row.kind).toBe('unclassified');
        expect([...M4_DAY_CONTAINER_ARTIFACT_KINDS]).not.toContain('handoff');
    });

    it('carries the kairos chip when declared, and the path as its provenance handle', () => {
        const row = artifactRowFrom(
            entry('journal.md'),
            '---\nc_4_artifact_role: journal\nt_4_kairos_context: "[[Kairos]]"\n---\n'
        );
        expect(row.kairosContext).toBe('[[Kairos]]');
        expect(row.provenanceHandle).toBe('vault-path');
        expect(row.path).toBe('Empty/Present/27-07-2026/s/journal.md');
    });

    it('marks the session NOW by its position in the tree, not by declaration', () => {
        expect(artifactRowFrom(entry('now.md')).kind).toBe('now');
    });
});

describe('25.T25.2 — the day container', () => {
    const session = (key: string, now: string) => ({
        sessionKey: key,
        nowPath: `Empty/Present/27-07-2026/${key}/now.md`,
        nowContent: now,
        entries: [
            { name: 'now.md', path: `Empty/Present/27-07-2026/${key}/now.md`, isDir: false },
            { name: 'journal.md', path: `Empty/Present/27-07-2026/${key}/journal.md`, isDir: false }
        ],
        contentByPath: {
            [`Empty/Present/27-07-2026/${key}/journal.md`]: '---\nc_4_artifact_role: journal\n---\n'
        }
    });

    it('folds a day into its sessions, chronologically, with their artifacts', () => {
        const container = buildDayContainer('27-07-2026', [
            session('20260727-140000-bbb', BARE_NOW),
            session('20260727-093019-aaa', FULL_NOW)
        ]);
        expect(container.sessions.map(s => s.sessionKey)).toEqual([
            '20260727-093019-aaa',
            '20260727-140000-bbb'
        ]);
        expect(container.sessions[0].chips.trancheMode).toBe('quiet:90m');
        expect(container.sessions[1].chips.trancheMode).toBeNull();
        expect(container.sessions[0].artifacts.map(a => a.kind)).toEqual(['now', 'journal']);
    });

    it('keeps day-root files as day artifacts, not as a phantom session', () => {
        const container = buildDayContainer(
            '23-07-2026',
            [],
            [
                { name: '20260723-030923-fa4e5a', path: 'Empty/Present/23-07-2026/20260723-030923-fa4e5a', isDir: true },
                { name: 'HANDOFF.md', path: 'Empty/Present/23-07-2026/HANDOFF.md', isDir: false }
            ]
        );
        expect(container.sessions).toHaveLength(0);
        expect(container.dayArtifacts.map(a => a.name)).toEqual(['HANDOFF.md']);
    });

    it('declares the privacy invariant the brief names', () => {
        const container = buildDayContainer('27-07-2026', [session('20260727-093019-aaa', FULL_NOW)]);
        expect(container.protectedBodiesRendered).toBe(false);
        // and the projection carries no body and no quaternion field (UX §6.5)
        const serialised = JSON.stringify(container);
        expect(serialised).not.toContain('# NOW');
        expect(serialised).not.toContain('q_composed_at_now');
    });
});
