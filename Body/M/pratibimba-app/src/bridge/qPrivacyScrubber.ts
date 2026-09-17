/**
 * Coordinate: M' M4' (q_ privacy scrubber — Track 08.T8.8 / DR-M4-4)
 * Residency: Body/M/pratibimba-app/src/bridge
 * Actualises: the DR-M4-4 three-namespace privacy partition at the CARRIER
 *   envelope boundary — the q_ wisdom-curation economy's PUBLIC properties
 *   (`q_{n}_{i?}_{semantic}` per Tranche 5.23, `qm_{n}_{i?}_{semantic}` meta
 *   vocabulary) flow to agent context / Graphiti / disclosure envelopes,
 *   while the four PRIVATE names and every derivative (`q_personal*`,
 *   `q_identity*`, `q_activity*`, `q_composed*` — portal-core in-memory +
 *   PASU.md vault-local ONLY) can NEVER bleed through, even via a wildcard
 *   `q_*` serialisation path. Unknown q-shaped keys are ERRORS, not
 *   pass-throughs (belt-and-braces with CCT-16(i) at the sync boundary and
 *   the kernel-bridge serializer's twin rejection, runtime.rs:1363-1406).
 * Does NOT own: the bridge-side enforcement (epi-cli), CCT-16 sync regexes,
 *   Sophia's disclosure composer (S4' ta-onta).
 */

/** DENY — the four reserved private names + any prefix derivative. */
const PRIVATE_Q = /^q_(personal|identity|activity|composed)(_|$)/;
/** ALLOW — canonical public vocabularies: q_{n}_{i?}_{semantic} / qm_{n}_… */
const PUBLIC_Q = /^qm?_[0-5]'?(_[0-5]')?_[a-z0-9_]+$/; // {family}_{n}_{i?}_{semantic} — DR-S1-6 inversion slot
/** Any q-shaped key at all (the wildcard the partition must survive). */
const Q_SHAPED = /^qm?_/;

export interface ScrubResult {
    /** The envelope with ONLY public q_ fields (non-q fields untouched). */
    readonly scrubbed: Record<string, unknown>;
    /** One refusal line per private field found (the release-gate log). */
    readonly refusals: readonly string[];
    /** Unknown q-shaped keys — errors, never silently passed or dropped. */
    readonly errors: readonly string[];
}

export function scrubQPartition(envelope: Readonly<Record<string, unknown>>): ScrubResult {
    const scrubbed: Record<string, unknown> = {};
    const refusals: string[] = [];
    const errors: string[] = [];
    for (const [key, value] of Object.entries(envelope)) {
        if (!Q_SHAPED.test(key)) {
            scrubbed[key] = value;
            continue;
        }
        if (PRIVATE_Q.test(key)) {
            refusals.push(
                `DR-M4-4 refusal: '${key}' is a private q_ field (portal-core in-memory + PASU.md only) — scrubbed from the public envelope`
            );
            continue;
        }
        if (PUBLIC_Q.test(key)) {
            scrubbed[key] = value;
            continue;
        }
        errors.push(`DR-M4-4 unknown q-shaped key '${key}' — not in the public canon, refused as error`);
    }
    return Object.freeze({ scrubbed, refusals, errors });
}
