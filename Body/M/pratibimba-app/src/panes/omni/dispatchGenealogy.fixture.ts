/**
 * Coordinate: M' `/` membrane (dispatch genealogy — synthetic test fixture, 15.T15.11)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: the 15.11 acceptance fixture — a SYNTHETIC Pi → Anima → Moirai
 *   dispatch genealogy, imported ONLY by tests (both foldings must render it
 *   consistently with consistent ids). Never imported by app code: real
 *   genealogy arrives from the track-12 seams; panes render absence as
 *   pending, never this fixture.
 * Does NOT own: anything live. Moirai is one of the six Aletheia
 *   techne-guardians (DR-S4-TECHNE); `s4'.mediation.route` /
 *   `s4'.mediation.capabilities.list` are the registered gateway methods
 *   (gateway-contract protocol.rs); the subagent capability id here is a
 *   synthetic placeholder pending the 12.10 capability matrix.
 */

import { DispatchGenealogyRecord } from './dispatchGenealogy';

/** Fixed epoch so renders and orderings are deterministic. */
export const FIXTURE_T0 = 1_752_278_400_000; // 2025-07-12T00:00:00.000Z

/** Pi (root, chat entry) → Anima (mediated dispatch) → Moirai (techne-guardian). */
export function syntheticPiAnimaMoiraiDispatch(): readonly DispatchGenealogyRecord[] {
    return Object.freeze([
        {
            id: 'run-pi-001',
            parentId: null,
            actor: { actor: 'pi', role: 'pi' },
            route: { method: 's4.pi.chat.stream', capability: null },
            status: 'succeeded',
            startedAtMs: FIXTURE_T0,
            endedAtMs: FIXTURE_T0 + 5200,
            gate: { capability: null, allowed: true },
            evidenceRef: 'evidence:run-pi-001',
            sourceRef: null
        },
        {
            id: 'run-anima-001',
            parentId: 'run-pi-001',
            actor: { actor: 'anima', role: 'anima' },
            route: { method: "s4'.mediation.route", capability: "s4'.mediation.route" },
            status: 'succeeded',
            startedAtMs: FIXTURE_T0 + 300,
            endedAtMs: FIXTURE_T0 + 4800,
            gate: { capability: "s4'.mediation.route", allowed: true },
            evidenceRef: 'evidence:run-anima-001',
            sourceRef: null
        },
        {
            id: 'run-moirai-001',
            parentId: 'run-anima-001',
            actor: { actor: 'moirai', role: 'subagent' },
            route: { method: "s4'.mediation.route", capability: 's4.aletheia.moirai' },
            status: 'succeeded',
            startedAtMs: FIXTURE_T0 + 700,
            endedAtMs: FIXTURE_T0 + 4100,
            gate: { capability: 's4.aletheia.moirai', allowed: true },
            evidenceRef: 'evidence:run-moirai-001',
            sourceRef: 'ta-onta/aletheia/moirai'
        }
    ] satisfies readonly DispatchGenealogyRecord[]);
}
