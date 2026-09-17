#!/usr/bin/env node
/**
 * Coordinate: M' shell (empty-state registry completeness — 32.T32.6)
 * Residency: Body/M/pratibimba-app/scripts
 * Position (#n): #4 — Context/Type; mechanical enforcement of the 32.6
 *   registry-completeness CI lint
 * Actualises: the spec's "registry-completeness CI lint asserts every
 *   M-extension declares an empty state and registers it" — and the half the
 *   spec did not name but this plan set exists to stop: a registration that
 *   nothing renders. The rule is BIDIRECTIONAL.
 *
 *   Three sources, none of them this file:
 *   - the immutable target ledger `src/commands/crossLayoutIntent.ts`
 *     (`CROSS_LAYOUT_INTENT_TARGETS`) — the only place a contribution id is
 *     declared, so the M-family extension set and the legal `viewId`s are
 *     DERIVED, never restated here;
 *   - the copy blocks `src/ui/emptyStateGrammar.ts` — one entry per M-family
 *     extension, each declaring its `mount`;
 *   - the mount sites — every `<MExtensionEmptyState extensionId=… viewId=…>`
 *     in the carrier tree.
 *
 *   Findings:
 *   - unregistered-extension — an M-family extension the ledger declares with
 *     no copy block.
 *   - unknown-target       — a copy block naming a contribution the ledger does
 *     not declare (a registration nothing could route to).
 *   - duplicate-registration — two copy blocks for one extension.
 *   - unmounted-registration — a copy block whose `mount` file renders no
 *     matching site: registered, never fired.
 *   - unregistered-mount   — a site with no copy block behind it.
 *   - unverifiable-mount   — a production site whose props are not string
 *     literals, so no static check of it is possible.
 * Public surface: M_FAMILY_PATTERN, TEST_PATTERN, readTargets,
 *   readRegistrations, readMounts, scanCarrier, main;
 *   CLI: node scripts/lint-empty-state-registry.mjs [--src <dir>] [--json]
 * Does NOT own: the registry contract (src/ui/emptyStateRegistry.ts), the copy
 *   (src/ui/emptyStateGrammar.ts), the components
 *   (src/ui/mExtensionEmptyStates.tsx), or the target ledger.
 * Contract: findings exit 1 with the exact file:line list. Reads the TypeScript
 *   AST, never a regex — prose naming a contribution is not a declaration.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_SRC_ROOT = resolve(SCRIPT_DIR, '..', 'src');

/** Extension ids of the M-family surfaces (`m0-anuttara` … `m5-epii`). */
export const M_FAMILY_PATTERN = /^m[0-5]-[a-z]+$/;

export const TARGET_LEDGER = 'commands/crossLayoutIntent.ts';
export const GRAMMAR_MODULE = 'ui/emptyStateGrammar.ts';
export const MOUNT_ELEMENT = 'MExtensionEmptyState';

const SCAN_EXTENSIONS = new Set(['.ts', '.tsx']);

/**
 * Test files are excluded from the MOUNT scan, and only from it.
 *
 * The rule is about production surfaces: a registration has to be rendered by
 * the carrier, and a mount inside a spec proves nothing about that. Test files
 * also legitimately mount with computed props and with deliberate negatives
 * (an unregistered key, to prove the fallback speaks), neither of which is a
 * gap. The other direction is untouched — a registration still has to name a
 * real production surface, and `unverifiable-mount` still fires on production
 * code whose props the parser cannot read.
 */
export const TEST_PATTERN = /\.test\.tsx?$/;

function parse(text, relPath) {
    return ts.createSourceFile(
        relPath,
        text,
        ts.ScriptTarget.Latest,
        true,
        relPath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );
}

function lineOf(source, node) {
    return source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
}

function stringLiteral(node) {
    return node && ts.isStringLiteralLike(node) ? node.text : null;
}

/**
 * `{ key -> { extensionId, contributionId } }` for every `target(...)` call in
 * the ledger. The ledger builds each row through the local `target()` helper,
 * so the two leading string arguments ARE the declaration.
 */
export function readTargets(text, relPath = TARGET_LEDGER) {
    const source = parse(text, relPath);
    const targets = new Map();
    const visit = node => {
        if (
            ts.isCallExpression(node) &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === 'target'
        ) {
            const extensionId = stringLiteral(node.arguments[0]);
            const contributionId = stringLiteral(node.arguments[1]);
            if (extensionId !== null && contributionId !== null) {
                targets.set(`${extensionId}\u0000${contributionId}`, {
                    extensionId,
                    contributionId,
                    line: lineOf(source, node)
                });
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return targets;
}

/** The copy blocks: `{ extensionId, viewId, mount, line }` per object literal. */
export function readRegistrations(text, relPath = GRAMMAR_MODULE) {
    const source = parse(text, relPath);
    const registrations = [];
    const visit = node => {
        if (ts.isObjectLiteralExpression(node)) {
            const read = name => {
                const property = node.properties.find(
                    entry =>
                        ts.isPropertyAssignment(entry) &&
                        ts.isIdentifier(entry.name) &&
                        entry.name.text === name
                );
                return property ? stringLiteral(property.initializer) : null;
            };
            const extensionId = read('extensionId');
            const viewId = read('viewId');
            const mount = read('mount');
            if (extensionId !== null && viewId !== null) {
                registrations.push({
                    extensionId,
                    viewId,
                    mount,
                    file: relPath,
                    line: lineOf(source, node)
                });
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return registrations;
}

/** Every `<MExtensionEmptyState extensionId="…" viewId="…">` site in a file. */
export function readMounts(text, relPath) {
    const source = parse(text, relPath);
    const mounts = [];
    const record = (node, tagName, attributes) => {
        if (tagName !== MOUNT_ELEMENT) {
            return;
        }
        const read = name => {
            const attribute = attributes.properties.find(
                entry =>
                    ts.isJsxAttribute(entry) && ts.isIdentifier(entry.name) && entry.name.text === name
            );
            return attribute && attribute.initializer ? stringLiteral(attribute.initializer) : null;
        };
        mounts.push({
            extensionId: read('extensionId'),
            viewId: read('viewId'),
            file: relPath,
            line: lineOf(source, node)
        });
    };
    const visit = node => {
        if (ts.isJsxSelfClosingElement(node)) {
            record(node, node.tagName.getText(source), node.attributes);
        } else if (ts.isJsxOpeningElement(node)) {
            record(node, node.tagName.getText(source), node.attributes);
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return mounts;
}

function walkSources(srcRoot) {
    const files = [];
    const walk = dir => {
        for (const entry of readdirSync(dir).sort()) {
            if (entry === 'node_modules' || entry === 'dist' || entry === '__fixtures__') continue;
            const full = join(dir, entry);
            if (statSync(full).isDirectory()) {
                walk(full);
                continue;
            }
            const dot = entry.lastIndexOf('.');
            if (dot < 0 || !SCAN_EXTENSIONS.has(entry.slice(dot))) continue;
            files.push(full);
        }
    };
    walk(srcRoot);
    return files;
}

/**
 * The whole rule, over an already-loaded corpus. Pure so the gate test can
 * drive it with fixtures AND with the real tree.
 *
 * @param {{ ledger: string, grammar: string, mounts: Map<string,string> }} corpus
 */
export function scanCarrier(corpus) {
    const findings = [];
    const targets = readTargets(corpus.ledger);
    const registrations = readRegistrations(corpus.grammar);

    const declaredExtensions = new Set(
        [...targets.values()]
            .map(entry => entry.extensionId)
            .filter(id => M_FAMILY_PATTERN.test(id))
    );

    const byExtension = new Map();
    for (const registration of registrations) {
        const prior = byExtension.get(registration.extensionId);
        if (prior) {
            findings.push({
                kind: 'duplicate-registration',
                file: registration.file,
                line: registration.line,
                detail: `${registration.extensionId} is already registered at line ${prior.line}`
            });
            continue;
        }
        byExtension.set(registration.extensionId, registration);
        if (!targets.has(`${registration.extensionId}\u0000${registration.viewId}`)) {
            findings.push({
                kind: 'unknown-target',
                file: registration.file,
                line: registration.line,
                detail: `${registration.extensionId}/${registration.viewId} is not declared in ${TARGET_LEDGER}`
            });
        }
    }

    for (const extensionId of [...declaredExtensions].sort()) {
        if (!byExtension.has(extensionId)) {
            findings.push({
                kind: 'unregistered-extension',
                file: GRAMMAR_MODULE,
                line: 0,
                detail: `${extensionId} declares cross-layout contributions but no empty state`
            });
        }
    }

    // Mount sites, both directions.
    const mountedKeys = new Map();
    for (const [file, text] of corpus.mounts) {
        for (const mount of readMounts(text, file)) {
            if (mount.extensionId === null || mount.viewId === null) {
                // Non-literal props cannot be statically checked, and silently
                // passing them is the loophole a registry lint dies of.
                findings.push({
                    kind: 'unverifiable-mount',
                    file: mount.file,
                    line: mount.line,
                    detail: `<${MOUNT_ELEMENT}> carries non-literal extensionId/viewId; the registry cannot be checked against it`
                });
                continue;
            }
            const key = `${mount.extensionId}\u0000${mount.viewId}`;
            if (!mountedKeys.has(key)) {
                mountedKeys.set(key, []);
            }
            mountedKeys.get(key).push(mount);
            const registration = byExtension.get(mount.extensionId);
            if (!registration || registration.viewId !== mount.viewId) {
                findings.push({
                    kind: 'unregistered-mount',
                    file: mount.file,
                    line: mount.line,
                    detail: `<${MOUNT_ELEMENT} extensionId="${mount.extensionId}" viewId="${mount.viewId}"> has no copy block in ${GRAMMAR_MODULE}`
                });
            }
        }
    }

    for (const registration of byExtension.values()) {
        const key = `${registration.extensionId}\u0000${registration.viewId}`;
        const sites = mountedKeys.get(key) ?? [];
        const declared = sites.filter(site => site.file === registration.mount);
        if (declared.length === 0) {
            findings.push({
                kind: 'unmounted-registration',
                file: registration.file,
                line: registration.line,
                detail:
                    `${registration.extensionId}/${registration.viewId} declares mount ` +
                    `'${registration.mount}' but that surface renders no <${MOUNT_ELEMENT}> for it`
            });
        }
    }

    return { findings, targets: targets.size, registrations: registrations.length, mounts: mountedKeys.size };
}

export function scanTree(srcRoot = DEFAULT_SRC_ROOT) {
    const ledgerPath = join(srcRoot, ...TARGET_LEDGER.split('/'));
    const grammarPath = join(srcRoot, ...GRAMMAR_MODULE.split('/'));
    for (const [label, path] of [['target ledger', ledgerPath], ['copy grammar', grammarPath]]) {
        if (!existsSync(path)) {
            throw new Error(`${label} missing at ${path}`);
        }
    }
    const mounts = new Map();
    let scannedFiles = 0;
    for (const full of walkSources(srcRoot)) {
        scannedFiles += 1;
        const relPath = relative(srcRoot, full).split(sep).join('/');
        const text = readFileSync(full, 'utf8');
        // Cheap prefilter: only files that mention the element can host a site.
        if (!TEST_PATTERN.test(relPath) && text.includes(MOUNT_ELEMENT)) {
            mounts.set(relPath, text);
        }
    }
    const report = scanCarrier({
        ledger: readFileSync(ledgerPath, 'utf8'),
        grammar: readFileSync(grammarPath, 'utf8'),
        mounts
    });
    return { srcRoot, scannedFiles, ...report };
}

function parseArgs(argv) {
    const options = { srcRoot: DEFAULT_SRC_ROOT, json: false };
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--src') options.srcRoot = resolve(argv[(i += 1)]);
        else if (argv[i] === '--json') options.json = true;
        else throw new Error(`unknown argument: ${argv[i]}`);
    }
    return options;
}

export function main(argv = process.argv.slice(2)) {
    let options;
    let report;
    try {
        options = parseArgs(argv);
        report = scanTree(options.srcRoot);
    } catch (cause) {
        console.error(`[lint-empty-state-registry] ${cause instanceof Error ? cause.message : cause}`);
        return 2;
    }
    if (options.json) {
        console.log(JSON.stringify(report, null, 2));
    } else {
        for (const finding of report.findings) {
            console.error(
                `[lint-empty-state-registry] ${finding.file}:${finding.line} ${finding.kind} — ${finding.detail}`
            );
        }
    }
    if (report.findings.length > 0) {
        console.error(
            `[lint-empty-state-registry] RED — ${report.findings.length} finding(s) across ` +
            `${report.scannedFiles} carrier source files (32.6)`
        );
        return 1;
    }
    console.log(
        `[lint-empty-state-registry] GREEN — ${report.registrations} registrations against ` +
        `${report.targets} declared targets; every M-family extension declares an empty state ` +
        `and every registration is mounted (32.6)`
    );
    return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    process.exitCode = main();
}
