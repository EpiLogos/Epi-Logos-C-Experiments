/**
 * Coordinate: M' shell (error UX grammar gate — Track 32.T32.7)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the no-dangling-deep-link gate. The whole reason 32.7 exists as a
 *   named tranche is that a "Diagnostics deep-link" can be declared without ever
 *   landing anywhere; these assertions refuse that. Every command id the grammar
 *   points at must be a REAL row in `COMMAND_CATALOG` (which `catalog.test.ts`
 *   independently holds to the AST of the real register sites), and every path
 *   that is NOT wired must say why in its own row rather than in prose nobody
 *   reads.
 * Does NOT own: the taxonomy (bridgeReadiness), the catalog gate (catalog.test),
 *   or the rendering (InlineErrorSurface.test).
 */

import { describe, expect, it } from 'vitest';
import { COMMAND_CATALOG } from '../commands/catalog';
import { readinessRecovery } from './bridgeReadiness';
import {
    DIAGNOSTICS_DEEP_LINK,
    ERROR_UX_PATHS,
    ERROR_UX_PATH_IDS,
    PASU_ABSENT_KAIROS_WARNING,
    PASU_WIZARD_DEEP_LINK,
    errorUxPath
} from './errorUxGrammar';

const CATALOGUED = new Set(COMMAND_CATALOG.map(entry => entry.id));

describe('the four error UX paths (spec :226-230)', () => {
    it('declares exactly the four the spec names, once each', () => {
        expect(ERROR_UX_PATHS.map(path => path.id)).toEqual([...ERROR_UX_PATH_IDS]);
        expect(new Set(ERROR_UX_PATH_IDS).size).toBe(4);
    });

    it('resolves every id through errorUxPath', () => {
        for (const id of ERROR_UX_PATH_IDS) {
            expect(errorUxPath(id).id).toBe(id);
        }
    });

    it('never routes to a command the carrier does not register', () => {
        for (const path of ERROR_UX_PATHS) {
            if (path.deepLinkCommandId !== null) {
                expect(
                    CATALOGUED.has(path.deepLinkCommandId),
                    `${path.id} deep-links to an uncatalogued command ${path.deepLinkCommandId}`
                ).toBe(true);
            }
        }
    });

    it('holds a live path to a real site and an unwired path to a stated reason', () => {
        for (const path of ERROR_UX_PATHS) {
            if (path.status === 'live') {
                expect(path.unwiredReason, `${path.id} is live and yet excuses itself`).toBeNull();
                expect(path.sites.length, `${path.id} is live with no raising site`).toBeGreaterThan(0);
            } else {
                expect(path.sites, `${path.id} is unwired yet claims sites`).toEqual([]);
                expect(path.unwiredReason ?? '', `${path.id} is unwired with no reason`).not.toBe('');
                // A path that is not rendered must not pretend to route anywhere.
                expect(path.deepLinkCommandId).toBeNull();
            }
        }
    });

    it('records the ONE path this carrier cannot wire, and says what is missing', () => {
        const preflight = errorUxPath('contract-preflight');
        expect(preflight.status).toBe('unwired');
        expect(preflight.unwiredReason).toContain('validation-results.json');
    });

    it('is non-modal by declaration — every surface is inline or an inline banner', () => {
        for (const path of ERROR_UX_PATHS) {
            expect(['inline', 'banner']).toContain(path.surface);
        }
    });
});

describe('the Diagnostics deep-link is the taxonomy’s route, not a new one', () => {
    it('IS readinessRecovery(bridge_unavailable) — same label, same command', () => {
        expect(DIAGNOSTICS_DEEP_LINK).toEqual(readinessRecovery('bridge_unavailable'));
        expect(DIAGNOSTICS_DEEP_LINK.label).toBe('Open Diagnostics');
        expect(DIAGNOSTICS_DEEP_LINK.commandId).toBe('omnipanel.tab.activate.7');
    });

    it('is the Diagnostics fold command the carrier really registers (⌘8)', () => {
        const row = COMMAND_CATALOG.find(entry => entry.id === DIAGNOSTICS_DEEP_LINK.commandId);
        expect(row).toBeTruthy();
        expect(row!.title).toContain('Diagnostics');
    });

    it('matches the recovery of the integrated-blocked id path 3 renders against', () => {
        // CosmicEngine / PersonalRecognitionEngine render the deep-link when the
        // integrated readiness is `profile_missing_field`. If the taxonomy ever
        // routes that id somewhere else, the surface would show the wrong route.
        expect(readinessRecovery('profile_missing_field').commandId).toBe(
            DIAGNOSTICS_DEEP_LINK.commandId
        );
    });
});

describe('path 4 copy and route', () => {
    it('carries the spec’s exact warning string', () => {
        expect(PASU_ABSENT_KAIROS_WARNING).toBe('PASU not configured — kairos defaulting to neutral');
    });

    it('routes to the real 25.4 wizard command', () => {
        expect(PASU_WIZARD_DEEP_LINK.commandId).toBe('identity.openWizard');
        expect(CATALOGUED.has('identity.openWizard')).toBe(true);
    });
});
