#!/usr/bin/env node
/**
 * Coordinate: M' shell (no-modal discipline — 31.T31.8, CC-08 / CCT-8)
 * Residency: Body/M/pratibimba-app/scripts
 * Position (#n): #4 — Context/Type; mechanical enforcement of a chrome law
 * Actualises: CCT-8 — "MessageBox.show, OpenDialog, modal Dialog.show,
 *   ConfirmDialog.show are PROHIBITED" — enforced against the real carrier
 *   source. 15.2's principle is that the TAB IS THE LANDING SURFACE: a
 *   decision is taken in the surface that owns it, never in a floating layer
 *   that seizes the whole application until dismissed.
 *
 *   SCOPE — read this before changing it. The frozen validator
 *   (`Body/M/epi-theia/extensions/scripts/validate-no-modal-discipline.mjs`)
 *   governed only files whose PATH matched `review|evidence|gate-landing`,
 *   because the Theia tree was organised that way. This carrier is not: its
 *   panes are flat under `src/panes`, and that pattern matches exactly FIVE of
 *   the 503 files here (all of `panes/omni/evidence/`) — measured, not assumed.
 *   Neither of the two real blocking modals this tranche found was among them.
 *   A rule that governs 1% of the tree and misses every actual violation in it
 *   is not the law CCT-8 states; it is an artefact of a directory layout that
 *   no longer exists. The carrier rule is therefore stated structurally:
 *
 *     `SHELL_SLOT_POLICY` (src/ui/shellSlotPolicy.ts, 31.T31.7) enumerates the
 *     six slots this shell has — top, main, right, left, bottom, status-bar.
 *     NONE of them is a modal slot. A blocking modal has no slot to live in
 *     anywhere in this carrier, not merely in review paths.
 *
 *   So BLOCKING_CALLS are forbidden carrier-wide, and the narrower Theia-API
 *   names are kept in THEIA_MODAL_CALLS so a future port cannot reintroduce
 *   them. The `@epi-logos:context=` marker is still honoured for a file that
 *   declares itself governed. This widening is a deliberate carrier reading of
 *   CCT-8, flagged for the Architect rather than assumed: if the narrower
 *   path-scoped reading is preferred, set GOVERNED_PATH_PATTERN and drop the
 *   carrier-wide tier.
 *
 *   What is NOT a finding: a non-blocking overlay (the command palette, the
 *   PASU wizard card, a floating toolbar). Those keep the app interactive and
 *   dismiss on escape or click-away; the law is about BLOCKING, not about
 *   z-index.
 *
 *   HOW IT READS SOURCE — the TypeScript AST, never a regex over text. The
 *   first cut of this lint hand-rolled a comment stripper, and adversarial
 *   review proved it wrong in BOTH directions on landed files: a regex literal
 *   (`.replace(/'/g, '%27')`) or a lone apostrophe in JSX prose (`the M5' gate`)
 *   desynced its quote state for the rest of the file, after which real code
 *   was blanked (a modal there became invisible) and real comments survived (a
 *   comment mentioning the rule became a violation). A parser has no such
 *   failure mode: comments are not in the tree at all, and call sites are
 *   resolved structurally. This mirrors the discipline stated in
 *   `src/commands/catalog.test.ts` — "never a regex grep of prose".
 *
 *   Because the callee is resolved from the AST, the native calls are matched
 *   RECEIVER-AGNOSTICALLY: `window.confirm(x)`, `globalThis.confirm(x)`,
 *   `self.confirm(x)` and a bare `confirm(x)` are one finding kind.
 * Public surface: BLOCKING_CALLS, THEIA_MODAL_CALLS, CONTEXT_MARKER_RE,
 *   calleeName, scanSource, scanTree, main;
 *   CLI: node scripts/lint-no-modal-discipline.mjs [--src <dir>] [--json]
 * Does NOT own: the slot policy itself (src/ui/shellSlotPolicy.ts), the token
 *   lint (.codex/scripts/lint-carrier-tokens.mjs), or suite orchestration.
 * Contract: findings exit 1 with the exact file:line list — never a summary
 *   without the list. Test files inside the scanned root are scanned too: a
 *   test that asserts a modal is a test that expects one to exist.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_SRC_ROOT = resolve(SCRIPT_DIR, '..', 'src');

/** Native calls that BLOCK the whole page until dismissed, as bare callee
 *  names. Matched on ANY receiver (or none) — see the header. Forbidden
 *  anywhere in the carrier: the shell has no slot that admits them. */
export const BLOCKING_CALLS = Object.freeze(['alert', 'confirm', 'prompt', 'showModal']);

/** The Theia modal APIs named verbatim by CCT-8, as `Receiver.method`. Dead
 *  under the retarget (no Theia runtime here), kept so a port cannot quietly
 *  bring them back. */
export const THEIA_MODAL_CALLS = Object.freeze([
    'MessageBox.show',
    'OpenDialog.show',
    'ConfirmDialog.show',
    'Dialog.show'
]);

/** A file may opt INTO governance explicitly, per CCT-8's marker convention. */
export const CONTEXT_MARKER_RE = /@epi-logos:context\s*=\s*(review|evidence|gate-landing|human-gate)\b/;

const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);

const BLOCKING = new Set(BLOCKING_CALLS);
const THEIA = new Set(THEIA_MODAL_CALLS);

/**
 * The name a call expression targets, as the lint reasons about it:
 * `{ bare, qualified }` — `confirm` and `window.confirm` for `window.confirm(x)`,
 * `confirm` and `confirm` for a bare `confirm(x)`. Returns null for anything
 * that is not a plain identifier or property access (a computed or deeply
 * chained callee is not a name this rule can speak about).
 */
export function calleeName(expression) {
    if (ts.isIdentifier(expression)) {
        return { bare: expression.text, qualified: expression.text };
    }
    if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.name)) {
        const receiver = ts.isIdentifier(expression.expression) ? expression.expression.text : null;
        return {
            bare: expression.name.text,
            qualified: receiver ? `${receiver}.${expression.name.text}` : expression.name.text
        };
    }
    return null;
}

/** Scan one source through the TypeScript parser. `governed` reports whether
 *  the file opted in via the context marker — it does not gate the blocking
 *  tier, which applies carrier-wide. */
export function scanSource(text, relPath) {
    const findings = [];
    const governed = CONTEXT_MARKER_RE.test(text);
    const source = ts.createSourceFile(
        relPath,
        text,
        ts.ScriptTarget.Latest,
        true,
        relPath.endsWith('.tsx') || relPath.endsWith('.jsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    const record = (node, kind, call) => {
        findings.push({
            file: relPath,
            line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
            kind,
            call,
            governed
        });
    };

    const visit = node => {
        if (ts.isCallExpression(node)) {
            const name = calleeName(node.expression);
            if (name) {
                if (BLOCKING.has(name.bare)) {
                    record(node, 'blocking-modal-call', name.qualified);
                } else if (THEIA.has(name.qualified)) {
                    record(node, 'theia-modal-call', name.qualified);
                }
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return findings;
}

export function scanTree(srcRoot = DEFAULT_SRC_ROOT) {
    const findings = [];
    let scannedFiles = 0;
    const walk = dir => {
        for (const entry of readdirSync(dir).sort()) {
            if (entry === 'node_modules' || entry === 'dist') continue;
            const full = join(dir, entry);
            if (statSync(full).isDirectory()) {
                walk(full);
                continue;
            }
            const dot = entry.lastIndexOf('.');
            if (dot < 0 || !SCAN_EXTENSIONS.has(entry.slice(dot))) continue;
            scannedFiles += 1;
            const relPath = relative(srcRoot, full).split(sep).join('/');
            findings.push(...scanSource(readFileSync(full, 'utf8'), relPath));
        }
    };
    walk(srcRoot);
    return { srcRoot, scannedFiles, findings };
}

function parseArgs(argv) {
    const options = { srcRoot: DEFAULT_SRC_ROOT, json: false };
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--src') {
            options.srcRoot = resolve(argv[(i += 1)]);
        } else if (argv[i] === '--json') {
            options.json = true;
        } else {
            throw new Error(`unknown argument: ${argv[i]}`);
        }
    }
    return options;
}

export function main(argv = process.argv.slice(2)) {
    let options;
    try {
        options = parseArgs(argv);
    } catch (cause) {
        console.error(`[lint-no-modal-discipline] ${cause instanceof Error ? cause.message : cause}`);
        return 2;
    }
    const report = scanTree(options.srcRoot);
    if (options.json) {
        console.log(JSON.stringify(report, null, 2));
    } else {
        for (const finding of report.findings) {
            console.error(
                `[lint-no-modal-discipline] ${finding.file}:${finding.line} ` +
                `${finding.kind} '${finding.call}(…)' — the tab IS the landing surface (CCT-8)`
            );
        }
    }
    if (report.findings.length > 0) {
        console.error(
            `[lint-no-modal-discipline] RED — ${report.findings.length} blocking modal call(s) ` +
            `across ${report.scannedFiles} carrier source files`
        );
        return 1;
    }
    console.log(
        `[lint-no-modal-discipline] GREEN — ${report.scannedFiles} source files; ` +
        'no blocking modal reaches the carrier (CCT-8)'
    );
    return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    process.exitCode = main();
}
