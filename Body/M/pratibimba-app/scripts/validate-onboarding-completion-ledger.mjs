/**
 * Coordinate: M' onboarding contract validation (32.T32.13)
 * Actualises: executable structural and carrier-id collision validation for
 *   the canonical 20-step onboarding ledger.
 * Does NOT own: onboarding runtime state or widget registration.
 */

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const LEDGER_PATH = resolve(ROOT, 'contracts/onboarding-completion-ledger.json');
const APP_PATH = resolve(ROOT, 'src/App.tsx');
const INTENT_PATH = resolve(ROOT, 'src/commands/crossLayoutIntent.ts');

const EXPECTED_STEPS = new Set([
    'cold-start.bridge', 'cold-start.portal-core', 'cold-start.s2-s3',
    'cold-start.first-tick', 'cold-start.day-now', 'cold-start.kairos-optional',
    'walkthrough.0-1-toggle', 'walkthrough.omnipanel', 'walkthrough.activity-bar',
    'walkthrough.status-bar', 'walkthrough.day-now-anchor', 'walkthrough.cosmic-personal',
    'identity.pasu-birth-date', 'identity.pasu-birth-location', 'identity.pasu-natal-chart',
    'identity.pasu-jungian', 'identity.pasu-gene-keys', 'identity.pasu-human-design',
    'kairos.enable', 'first-session.start'
]);

function collectStringLiterals(sourceText, fileName, predicate) {
    const source = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const values = new Set();
    function visit(node) {
        if (predicate(node) && ts.isStringLiteralLike(node)) values.add(node.text);
        ts.forEachChild(node, visit);
    }
    visit(source);
    return values;
}

async function carrierViewIds() {
    const [app, intents] = await Promise.all([
        readFile(APP_PATH, 'utf8'),
        readFile(INTENT_PATH, 'utf8')
    ]);
    const appIds = collectStringLiterals(app, APP_PATH, node => {
        const parent = node.parent;
        return parent !== undefined
            && ts.isPropertyAssignment(parent)
            && ((ts.isIdentifier(parent.name) && parent.name.text === 'component')
                || (ts.isStringLiteralLike(parent.name) && parent.name.text === 'component'));
    });
    const intentSource = ts.createSourceFile(INTENT_PATH, intents, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const intentIds = new Set();
    function visit(node) {
        if (
            ts.isCallExpression(node)
            && ts.isIdentifier(node.expression)
            && node.expression.text === 'target'
            && node.arguments[4]
            && ts.isStringLiteralLike(node.arguments[4])
        ) {
            intentIds.add(node.arguments[4].text);
        }
        ts.forEachChild(node, visit);
    }
    visit(intentSource);
    return new Set([...appIds, ...intentIds]);
}

export async function validateOnboardingCompletionLedger(value) {
    const errors = [];
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return ['ledger root must be an object'];
    }
    if (value.version !== 1) errors.push('version must be 1');
    if (value.preferenceKey !== 'epi-logos.onboarding.completed-steps') {
        errors.push('preferenceKey must be the canonical completed-steps preference');
    }
    if (!Array.isArray(value.ledger)) return [...errors, 'ledger must be an array'];

    const ids = new Set();
    for (const [index, entry] of value.ledger.entries()) {
        const at = `ledger[${index}]`;
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
            errors.push(`${at} must be an object`);
            continue;
        }
        if (typeof entry.stepId !== 'string' || entry.stepId.length === 0) {
            errors.push(`${at}.stepId must be non-empty`);
        } else if (ids.has(entry.stepId)) {
            errors.push(`${at}.stepId duplicates ${entry.stepId}`);
        } else {
            ids.add(entry.stepId);
        }
        if (!['cold-start', 'walkthrough', 'identity', 'kairos', 'first-session'].includes(entry.domain)) {
            errors.push(`${at}.domain is invalid`);
        }
        if (typeof entry.owner !== 'string' || !/^32\.(?:[1-9]|1[0-4])$/.test(entry.owner)) {
            errors.push(`${at}.owner must be a Track 32 tranche id`);
        }
        if (!entry.completionCriterion || typeof entry.completionCriterion !== 'object'
            || Array.isArray(entry.completionCriterion)
            || typeof entry.completionCriterion.type !== 'string') {
            errors.push(`${at}.completionCriterion must name a type`);
        }
        if (entry.skipPath === null) {
            if (typeof entry.skipReason !== 'string' || entry.skipReason.trim().length === 0) {
                errors.push(`${at} needs skipReason when skipPath is null`);
            }
        } else if (!entry.skipPath || typeof entry.skipPath !== 'object'
            || typeof entry.skipPath.preferenceKey !== 'string'
            || typeof entry.skipPath.arrayEntry !== 'string') {
            errors.push(`${at}.skipPath must name preferenceKey and arrayEntry`);
        }
    }

    const missing = [...EXPECTED_STEPS].filter(id => !ids.has(id));
    const extra = [...ids].filter(id => !EXPECTED_STEPS.has(id));
    if (missing.length) errors.push(`missing steps: ${missing.join(', ')}`);
    if (extra.length) errors.push(`unexpected steps: ${extra.join(', ')}`);
    if (value.ledger.length !== EXPECTED_STEPS.size) {
        errors.push(`ledger must contain exactly ${EXPECTED_STEPS.size} entries`);
    }

    const views = await carrierViewIds();
    const collisions = [...ids].filter(id => views.has(id));
    if (collisions.length) errors.push(`step ids collide with carrier view ids: ${collisions.join(', ')}`);
    return errors;
}

async function main() {
    const ledger = JSON.parse(await readFile(LEDGER_PATH, 'utf8'));
    const errors = await validateOnboardingCompletionLedger(ledger);
    if (errors.length) {
        for (const error of errors) console.error(error);
        process.exitCode = 1;
        return;
    }
    console.log(`onboarding ledger valid: ${ledger.ledger.length} unique steps, no carrier view-id collisions`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    await main();
}
