import { spawnSync } from 'node:child_process';

const suite = suiteArg(process.argv.slice(2));
const suites = Object.freeze({
    'm2-parashakti': Object.freeze(['tests/visual-regression-m2.test.mjs']),
    default: Object.freeze(['tests/visual-regression.test.mjs', 'tests/visual-regression-onboarding.test.mjs'])
});
const files = suites[suite ?? 'default'] ?? suites.default;
const result = spawnSync(process.execPath, ['--test', ...files], {
    cwd: new URL('..', import.meta.url),
    stdio: 'inherit'
});

process.exit(result.status ?? 1);

function suiteArg(args) {
    const index = args.indexOf('--suite');
    if (index >= 0) return args[index + 1] ?? null;
    const prefixed = args.find(arg => arg.startsWith('--suite='));
    return prefixed ? prefixed.slice('--suite='.length) : null;
}
