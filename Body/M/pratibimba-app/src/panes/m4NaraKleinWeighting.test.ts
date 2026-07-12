import { describe, expect, it } from 'vitest';
import {
    kleinWeightingFromNowContent,
    latestSessionNowPath,
    pendingKleinWeighting
} from './m4NaraKleinWeighting';

const NOW_WITH_WEIGHTING = `---
coordinate: "M4-20260712-000600-9b0057"
c_2_session_id: "20260712-000600-9b0057"
c_3_day_id: "12-07-2026"
c_3_klein_weighting:
  prospective: 0.4
  retrospective: 0.6
c_5_reflection_complete: false
---

# NOW
`;

/** The live session-init shape today: minimal frontmatter, no weighting key. */
const NOW_WITHOUT_WEIGHTING = `---
session_id: "20260712-000600-9b0057"
day_id: "12-07-2026"
---

# NOW
`;

describe('kleinWeightingFromNowContent (05.T5.15 frontmatter law)', () => {
    it('resolves a canonical block-mapping weighting', () => {
        const weighting = kleinWeightingFromNowContent(NOW_WITH_WEIGHTING, 'x/now.md');
        expect(weighting.state).toBe('resolved');
        expect(weighting.prospective).toBe(0.4);
        expect(weighting.retrospective).toBe(0.6);
        expect(weighting.sourcePath).toBe('x/now.md');
        expect(weighting.label).toBe('40% prospective · 60% retrospective');
    });

    it('is pending when the key is absent (the live session-init shape today)', () => {
        const weighting = kleinWeightingFromNowContent(NOW_WITHOUT_WEIGHTING, 'x/now.md');
        expect(weighting.state).toBe('pending-weighting');
        expect(weighting.prospective).toBeNull();
        expect(weighting.retrospective).toBeNull();
        expect(weighting.label).toBe('pending-weighting');
    });

    it('is pending when the key opens an empty block (template scaffold without values)', () => {
        const content = `---\nc_3_klein_weighting:\nc_5_reflection_complete: false\n---\n`;
        expect(kleinWeightingFromNowContent(content).state).toBe('pending-weighting');
    });

    it('never fabricates: non-complementary weights (sum != 1.0) are pending', () => {
        const content = `---\nc_3_klein_weighting:\n  prospective: 0.4\n  retrospective: 0.4\n---\n`;
        expect(kleinWeightingFromNowContent(content).state).toBe('pending-weighting');
    });

    it('never fabricates: out-of-range or non-numeric weights are pending', () => {
        const outOfRange = `---\nc_3_klein_weighting:\n  prospective: 1.4\n  retrospective: -0.4\n---\n`;
        expect(kleinWeightingFromNowContent(outOfRange).state).toBe('pending-weighting');
        const nonNumeric = `---\nc_3_klein_weighting:\n  prospective: high\n  retrospective: low\n---\n`;
        expect(kleinWeightingFromNowContent(nonNumeric).state).toBe('pending-weighting');
    });

    it('is pending for missing frontmatter, unterminated fences, and non-string content', () => {
        expect(kleinWeightingFromNowContent('# NOW\nno frontmatter').state).toBe('pending-weighting');
        expect(kleinWeightingFromNowContent('---\nc_3_klein_weighting:\n  prospective: 0.5').state).toBe(
            'pending-weighting'
        );
        expect(kleinWeightingFromNowContent(undefined).state).toBe('pending-weighting');
        expect(kleinWeightingFromNowContent(null).state).toBe('pending-weighting');
    });

    it('does not read a weighting key from the document body (frontmatter only)', () => {
        const content = `---\nsession_id: "x"\n---\n\nc_3_klein_weighting:\n  prospective: 0.4\n  retrospective: 0.6\n`;
        expect(kleinWeightingFromNowContent(content).state).toBe('pending-weighting');
    });

    it('accepts the balanced template default (0.5 / 0.5)', () => {
        const content = `---\nc_3_klein_weighting:\n  prospective: 0.5\n  retrospective: 0.5\n---\n`;
        const weighting = kleinWeightingFromNowContent(content);
        expect(weighting.state).toBe('resolved');
        expect(weighting.label).toBe('50% prospective · 50% retrospective');
    });
});

describe('latestSessionNowPath (day/NOW law: datetime-prefixed session folders)', () => {
    const day = 'Empty/Present/12-07-2026';
    const entry = (name: string, isDir: boolean) => ({ name, path: `${day}/${name}`, isDir });

    it('picks the latest session folder and appends now.md', () => {
        expect(
            latestSessionNowPath([
                entry('daily-note.md', false),
                entry('20260712-000600-9b0057', true),
                entry('20260712-113045-aa11bb', true),
                entry('oracle-120000-rws.md', false)
            ])
        ).toBe(`${day}/20260712-113045-aa11bb/now.md`);
    });

    it('ignores non-session directories and files', () => {
        expect(
            latestSessionNowPath([
                entry('daily-note.md', false),
                entry('artifacts', true),
                entry('20260712-000600-9b0057.md', false)
            ])
        ).toBeNull();
    });

    it('returns null for an empty day (honest no-session state)', () => {
        expect(latestSessionNowPath([])).toBeNull();
    });
});

describe('pendingKleinWeighting', () => {
    it('carries the attempted source path when one exists', () => {
        expect(pendingKleinWeighting('a/now.md').sourcePath).toBe('a/now.md');
        expect(pendingKleinWeighting().sourcePath).toBeNull();
    });
});
