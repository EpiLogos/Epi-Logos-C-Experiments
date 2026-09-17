/**
 * Coordinate: M' shell (Settings UX section law proof — Track 32.T32.4)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the 32.4 verification line's checkable half — six sections, the
 *   WC-OB-21 scope split, a default and a home for every declared preference,
 *   and action ids that resolve against the real command catalog. The bijection
 *   assertions run in BOTH directions against `ui/preferences.ts`, so a key
 *   added there fails here until it is given a section.
 * Does NOT own: the preference register (preferences.test.ts proves that), the
 *   rendering (SettingsPane.test.tsx), or command behaviour.
 * Contract: rerun tranche [[32.T32.4]].
 */

import { describe, expect, it } from 'vitest';

import {
    SETTINGS_ACTION_IDS,
    SETTINGS_SECTIONS,
    disclosedEntries,
    liveEntries,
    settingsSection,
    type SettingsSectionId
} from './settingsSections';
import { EPI_LOGOS_PREFERENCES, SPECIFIED_PREFERENCES } from './preferences';
import { COMMAND_CATALOG } from '../commands/catalog';

describe('32.T32.4 — the six settings sections', () => {
    it('declares exactly the six the spec names, in order, each with the scope WC-OB-21 assigns', () => {
        expect(SETTINGS_SECTIONS.map(s => s.id)).toEqual([
            'layout',
            'privacy',
            'motion',
            'identity',
            'diagnostics',
            'theming'
        ] satisfies SettingsSectionId[]);

        // Diagnostics is the workspace-scoped one — it describes THIS workspace's
        // cold start, not a person's preference; everything else is per-user.
        const scopes = Object.fromEntries(SETTINGS_SECTIONS.map(s => [s.id, s.scope]));
        expect(scopes).toEqual({
            layout: 'user',
            privacy: 'user',
            motion: 'user',
            identity: 'user',
            diagnostics: 'workspace',
            theming: 'user'
        });

        for (const section of SETTINGS_SECTIONS) {
            expect(section.label.length).toBeGreaterThan(0);
            // a purpose that just repeats the label tells a reader nothing
            expect(section.purpose.toLowerCase()).not.toBe(section.label.toLowerCase());
            expect(section.purpose.length).toBeGreaterThan(40);
        }
    });

    it('gives every LIVE preference exactly one home, and invents none', () => {
        const assigned = SETTINGS_SECTIONS.flatMap(s => liveEntries(s).map(e => e.key));
        const declared = EPI_LOGOS_PREFERENCES.map(d => d.key);

        expect([...assigned].sort()).toEqual([...declared].sort());
        expect(new Set(assigned).size, 'a live preference is shown in two sections').toBe(
            assigned.length
        );
    });

    it('gives every SPECIFIED-but-not-live preference exactly one home, and invents none', () => {
        const assigned = SETTINGS_SECTIONS.flatMap(s => disclosedEntries(s).map(e => e.key));
        const declared = SPECIFIED_PREFERENCES.map(p => p.key);

        expect([...assigned].sort()).toEqual([...declared].sort());
        expect(new Set(assigned).size, 'a disclosure is shown in two sections').toBe(
            assigned.length
        );
    });

    it('reads each disclosure status THROUGH the register rather than restating it', () => {
        for (const section of SETTINGS_SECTIONS) {
            for (const entry of disclosedEntries(section)) {
                const specified = SPECIFIED_PREFERENCES.find(p => p.key === entry.key);
                expect(specified, `${entry.key} is not in the register`).toBeDefined();
                expect(entry.status).toBe(specified!.status);
            }
        }
        // and the three verdicts are all really in use — a settings surface that
        // only ever says "pending" would be hiding two real decisions
        const statuses = new Set(
            SETTINGS_SECTIONS.flatMap(s => disclosedEntries(s).map(e => e.status))
        );
        expect(statuses).toEqual(new Set(['pending', 'superseded', 'declined']));
    });

    it('every action fires a command the catalog actually declares', () => {
        const catalogIds = new Set(COMMAND_CATALOG.map(c => c.id));
        expect(SETTINGS_ACTION_IDS.length).toBeGreaterThan(0);
        for (const id of SETTINGS_ACTION_IDS) {
            expect(catalogIds.has(id), `settings action names an unregistered command: ${id}`).toBe(
                true
            );
        }
    });

    it('kairos is toggled through its probe-gated flow, never as a raw key write', () => {
        // The real defect this guards: writing `privacy.kairos-enabled = true`
        // directly would claim the temporal ingress is live while kerykeion is
        // absent. The enable path probes first and writes false when it fails.
        const kairos = liveEntries(settingsSection('privacy')).find(e =>
            e.key.endsWith('kairos-enabled')
        );
        expect(kairos).toBeDefined();
        expect(kairos!.control).toBe('toggle');
        expect(kairos!.writePath).toContain('runKairosEnable');
        expect(kairos!.writePath).toContain('probe-gated');
    });

    it('names the owner of every read-only value, so nothing looks merely broken', () => {
        for (const section of SETTINGS_SECTIONS) {
            for (const entry of liveEntries(section)) {
                if (entry.control !== 'read-only') continue;
                // a read-only row must say who DOES write it
                expect(entry.writePath.length, `${entry.key} is read-only with no named writer`)
                    .toBeGreaterThan(10);
                expect(entry.writePath).toMatch(/write/);
            }
        }
    });

    it('resolves a section by id and refuses an unknown one', () => {
        expect(settingsSection('theming').label).toBe('Theming');
        expect(() => settingsSection('nope' as SettingsSectionId)).toThrow(
            /unknown settings section/
        );
    });
});
