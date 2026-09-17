/**
 * Coordinate: M' M0'/M1' (carrier coordinate-normaliser guard — Track 45.T45.3)
 * Residency: Body/M/pratibimba-app/src/bridge
 * Actualises: the forward-guard that keeps coordinate normalisation OUT of the
 *   carrier. The `#`→`M` / context-frame-parenthesisation / division-slash
 *   algorithm lives in five synchronised impls (Rust importer, bimba-mcp TS,
 *   the deep-cypher JS, the map projector, the gnostic Python — design-recon 45
 *   §3.3). The pratibimba-app carrier must render coordinates as the gateway
 *   returns them (see `coordinateRender`) and must NEVER add a sixth local copy.
 *   This module scans carrier source text for the tell-tale signatures of a
 *   local normaliser; the paired vitest fails when any appears under
 *   `Body/M/pratibimba-app/src`. The banned tokens are assembled from fragments
 *   so this guard never flags itself, and it scans the real tree with no file
 *   exclusions except test fixtures (which legitimately name the patterns to
 *   prove the guard has teeth).
 * Does NOT own: the normalisation algorithm (S2 graph-services / gateway), the
 *   graph schema, coordinate display (`coordinateRender`).
 */

export interface NormaliserViolation {
    file: string;
    line: number;
    rule: string;
    excerpt: string;
}

export interface GuardSource {
    file: string;
    content: string;
}

const DIVISION_SLASH = String.fromCharCode(0x2215); // U+2215 — the coordinate filename slash

/**
 * Reused normaliser impl identifiers (bimba-mcp / graph-services). Assembled
 * from fragments so this guard's own source carries none of the whole literals.
 */
function bannedIdentifierPatterns(): { rule: string; pattern: RegExp }[] {
    const wrapCamel = 'wrap' + 'Context' + 'Frame';
    const wrapSnake = 'wrap' + '_context_' + 'frame';
    const convCamel = 'convert' + 'Hash' + 'ToMFamily';
    const convSnake = 'convert' + '_hash_to_m_' + 'family';
    return [
        // the context-frame wrapper (camel + snake, singular/plural)
        { rule: 'reused-normaliser-identifier', pattern: new RegExp('\\b' + wrapCamel + 's?\\b') },
        { rule: 'reused-normaliser-identifier', pattern: new RegExp('\\b' + wrapSnake + 's?\\b') },
        // the hash-to-M-family converter (camel + snake)
        { rule: 'reused-normaliser-identifier', pattern: new RegExp('\\b' + convCamel + '\\b') },
        { rule: 'reused-normaliser-identifier', pattern: new RegExp('\\b' + convSnake + '\\b') }
    ];
}

/**
 * A `.replace(...)` call whose arguments carry a `#` and a quoted `M` — the
 * hash→M-family family conversion that must only ever happen gateway-side.
 * Built from fragments so this guard never emits a literal such call.
 */
function hashToMReplacePattern(): RegExp {
    const dot = '\\.';
    const call = 're' + 'place' + '\\s*\\(';
    const args = "[^)]*#[^)]*['\"]M";
    return new RegExp(dot + call + args);
}

/**
 * Scan the given source files for local coordinate-normaliser signatures.
 * Returns one violation per matching line. An empty array proves the carrier
 * holds the "gateway is the sole normaliser" constraint.
 */
export function findLocalNormaliserViolations(sources: GuardSource[]): NormaliserViolation[] {
    const identifierRules = bannedIdentifierPatterns();
    const hashToM = hashToMReplacePattern();
    const violations: NormaliserViolation[] = [];

    for (const source of sources) {
        const lines = source.content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            for (const { rule, pattern } of identifierRules) {
                if (pattern.test(line)) {
                    violations.push({ file: source.file, line: i + 1, rule, excerpt: line.trim() });
                }
            }
            if (hashToM.test(line)) {
                violations.push({
                    file: source.file,
                    line: i + 1,
                    rule: 'local-hash-to-m-replace',
                    excerpt: line.trim()
                });
            }
            if (line.includes(DIVISION_SLASH)) {
                violations.push({
                    file: source.file,
                    line: i + 1,
                    rule: 'division-slash-substitution',
                    excerpt: line.trim()
                });
            }
        }
    }
    return violations;
}
