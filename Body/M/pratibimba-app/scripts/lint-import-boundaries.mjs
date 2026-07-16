#!/usr/bin/env node
/**
 * Coordinate: M' shell (active-carrier import boundary - 11.T11.5)
 * Residency: Body/M/pratibimba-app/scripts
 * Position (#n): #4 - carrier context and module-boundary enforcement
 * Actualises: the frozen 07-t0 six-extension `forbiddenDirectImports` law
 *   against the real unified pratibimba-app source graph. Static imports,
 *   re-exports, import-equals, dynamic imports, CommonJS require calls, and
 *   relative paths resolving into forbidden S-stack trees fail closed.
 * Public surface: loadBoundaryAuthority, inspectSourceImports,
 *   scanCarrierImports; CLI `node scripts/lint-import-boundaries.mjs`.
 * Does NOT own: the forbidden list (07-t0 JSON), S-stack implementation, or
 *   fictional per-extension source trees; the active carrier consumes remote
 *   authority through its gateway/bridge boundary.
 * Contract: Body/M/epi-theia/extensions/contracts/
 *   07-t0-extension-contract-preflight.json (read-only authority) and
 *   [[M'-SYSTEM-SPEC]] carrier decision.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

export const DEFAULT_REPO_ROOT = resolve(SCRIPT_DIR, '..', '..', '..', '..');
export const DEFAULT_SRC_ROOT = join(DEFAULT_REPO_ROOT, 'Body', 'M', 'pratibimba-app', 'src');
export const DEFAULT_AUTHORITY_PATH = join(
    DEFAULT_REPO_ROOT,
    'Body',
    'M',
    'epi-theia',
    'extensions',
    'contracts',
    '07-t0-extension-contract-preflight.json'
);

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs']);

function asStringArray(value, label) {
    if (!Array.isArray(value) || value.some(entry => typeof entry !== 'string' || !entry)) {
        throw new Error(`${label} must be a non-empty string array`);
    }
    return value;
}

/** Load the authority without copying it into the carrier. The six extension
 * rows remain individually validated; the active unified carrier enforces the
 * union plus the shared bridge list over its single source graph. */
export function loadBoundaryAuthority(authorityPath = DEFAULT_AUTHORITY_PATH) {
    const authority = JSON.parse(readFileSync(authorityPath, 'utf8'));
    const extensions = authority.extensions;
    if (!Array.isArray(extensions) || extensions.length !== 6) {
        throw new Error('07-t0 authority must declare exactly six M extensions');
    }
    const extensionIds = extensions.map(extension => {
        if (!extension || typeof extension.id !== 'string') {
            throw new Error('07-t0 extension row is missing its id');
        }
        asStringArray(
            extension.bridge?.forbiddenDirectImports,
            `07-t0 extension ${extension.id}.bridge.forbiddenDirectImports`
        );
        return extension.id;
    });
    if (new Set(extensionIds).size !== extensionIds.length) {
        throw new Error('07-t0 extension ids must be unique');
    }

    const shared = asStringArray(
        authority.sharedBridgeAdapter?.forbiddenDirectImports,
        '07-t0 sharedBridgeAdapter.forbiddenDirectImports'
    );
    const perExtension = extensions.flatMap(extension => extension.bridge.forbiddenDirectImports);
    return {
        taskId: authority.taskId,
        extensionIds,
        forbiddenImports: [...new Set([...shared, ...perExtension])]
    };
}

function posixPath(value) {
    return value.split(sep).join('/');
}

function matchesPrefix(candidate, forbiddenImport) {
    return candidate === forbiddenImport || candidate.startsWith(`${forbiddenImport}/`);
}

function matchForbiddenImport({ specifier, filePath, repoRoot, forbiddenImports }) {
    const candidates = [specifier];
    if (specifier.startsWith('.') || isAbsolute(specifier)) {
        const resolved = isAbsolute(specifier)
            ? resolve(specifier)
            : resolve(dirname(filePath), specifier);
        candidates.push(posixPath(relative(repoRoot, resolved)));
    }
    return forbiddenImports.find(forbiddenImport =>
        candidates.some(candidate => matchesPrefix(candidate, forbiddenImport))
    ) ?? null;
}

function moduleSpecifier(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
        return ts.isStringLiteralLike(node.moduleSpecifier) ? node.moduleSpecifier : null;
    }
    if (
        ts.isImportEqualsDeclaration(node) &&
        ts.isExternalModuleReference(node.moduleReference) &&
        node.moduleReference.expression &&
        ts.isStringLiteralLike(node.moduleReference.expression)
    ) {
        return node.moduleReference.expression;
    }
    if (ts.isCallExpression(node) && node.arguments.length > 0) {
        const isDynamicImport = node.expression.kind === ts.SyntaxKind.ImportKeyword;
        const isRequire = ts.isIdentifier(node.expression) && node.expression.text === 'require';
        if ((isDynamicImport || isRequire) && ts.isStringLiteralLike(node.arguments[0])) {
            return node.arguments[0];
        }
    }
    return null;
}

/** Parse one source unit and return only executable module edges. Ordinary
 * strings and comments are ignored by construction. */
export function inspectSourceImports({ source, filePath, repoRoot, forbiddenImports }) {
    const sourceFile = ts.createSourceFile(
        filePath,
        source,
        ts.ScriptTarget.Latest,
        true,
        filePath.endsWith('.tsx') || filePath.endsWith('.jsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );
    const findings = [];
    const visit = node => {
        const literal = moduleSpecifier(node);
        if (literal) {
            const specifier = literal.text;
            const forbiddenImport = matchForbiddenImport({
                specifier,
                filePath,
                repoRoot,
                forbiddenImports
            });
            if (forbiddenImport) {
                const { line, character } = sourceFile.getLineAndCharacterOfPosition(literal.getStart());
                findings.push({
                    file: posixPath(relative(repoRoot, filePath)),
                    line: line + 1,
                    column: character + 1,
                    specifier,
                    forbiddenImport
                });
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return findings;
}

function sourceFiles(srcRoot) {
    const files = [];
    const walk = directory => {
        for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
            a.name.localeCompare(b.name)
        )) {
            if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'test-results') {
                continue;
            }
            const path = join(directory, entry.name);
            if (entry.isDirectory()) {
                walk(path);
            } else if (SOURCE_EXTENSIONS.has(extname(entry.name))) {
                files.push(path);
            }
        }
    };
    walk(srcRoot);
    return files;
}

export function scanCarrierImports({
    repoRoot = DEFAULT_REPO_ROOT,
    srcRoot = DEFAULT_SRC_ROOT,
    authorityPath = DEFAULT_AUTHORITY_PATH
} = {}) {
    const authority = loadBoundaryAuthority(authorityPath);
    const files = sourceFiles(srcRoot);
    const findings = files.flatMap(filePath =>
        inspectSourceImports({
            source: readFileSync(filePath, 'utf8'),
            filePath,
            repoRoot,
            forbiddenImports: authority.forbiddenImports
        }).map(finding => ({
            ...finding,
            file: posixPath(relative(srcRoot, filePath))
        }))
    );
    return {
        authorityPath: posixPath(relative(repoRoot, authorityPath)),
        extensionIds: authority.extensionIds,
        forbiddenImports: authority.forbiddenImports,
        scannedFiles: files.length,
        findings
    };
}

function parseArgs(argv) {
    const options = {};
    let json = false;
    for (let index = 0; index < argv.length; index += 1) {
        if (argv[index] === '--src') {
            options.srcRoot = resolve(argv[++index]);
        } else if (argv[index] === '--authority') {
            options.authorityPath = resolve(argv[++index]);
        } else if (argv[index] === '--json') {
            json = true;
        } else {
            throw new Error(`unknown argument '${argv[index]}'`);
        }
    }
    return { options, json };
}

export function main(argv = process.argv.slice(2)) {
    const { options, json } = parseArgs(argv);
    const report = scanCarrierImports(options);
    if (json) {
        console.log(JSON.stringify(report, null, 2));
    } else {
        for (const finding of report.findings) {
            console.error(
                `[lint-import-boundaries] ${finding.file}:${finding.line}:${finding.column} ` +
                `'${finding.specifier}' matches forbidden '${finding.forbiddenImport}'`
            );
        }
    }
    if (report.findings.length > 0) {
        console.error(
            `[lint-import-boundaries] RED - ${report.findings.length} forbidden direct import(s) ` +
            `across ${report.scannedFiles} active-carrier source files`
        );
        return 1;
    }
    console.log(
        `[lint-import-boundaries] GREEN - ${report.scannedFiles} source files; ` +
        `${report.extensionIds.length} frozen authority rows; 0 forbidden direct imports`
    );
    return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    process.exitCode = main();
}
