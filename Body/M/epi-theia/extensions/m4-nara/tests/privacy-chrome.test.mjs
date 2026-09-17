import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = new URL('..', import.meta.url);
const epiTheiaRoot = new URL('../../..', import.meta.url);

const tintRules = Object.freeze([
    Object.freeze({
        privacyClass: 'protected_local',
        className: 'mext-privacy-protected-local',
        hex: '#8a7355'
    }),
    Object.freeze({
        privacyClass: 'protected_local_handle_only',
        className: 'mext-privacy-protected-local-handle-only',
        hex: '#6b7588'
    }),
    Object.freeze({
        privacyClass: 'shared_archetype_opt_in',
        className: 'mext-privacy-shared-archetype-opt-in',
        hex: '#d4a574'
    })
]);

const mountedWidgets = Object.freeze([
    Object.freeze({
        label: 'M4NaraWidget',
        source: 'src/browser/m4-nara-widget.tsx',
        rootTest: 'm4-nara-root',
        privacyClass: 'protected_local'
    }),
    Object.freeze({
        label: 'CanvasEditorSurface',
        source: 'src/browser/canvas-editor.tsx',
        rootTest: 'm4-nara-canvas-editor',
        privacyClass: 'protected_local'
    }),
    Object.freeze({
        label: 'DayCalendar',
        source: 'src/browser/widgets/day-calendar.tsx',
        rootTest: 'm4-day-calendar',
        privacyClass: 'protected_local'
    }),
    Object.freeze({
        label: 'M4AmbientStateStrip',
        source: 'src/browser/widgets/ambient-state-strip.tsx',
        rootTest: 'm4-ambient-state-strip-root',
        privacyClass: 'protected_local'
    }),
    Object.freeze({
        label: 'M4TuningBar',
        source: 'src/browser/widgets/tuning-bar.tsx',
        rootTest: 'm4-tuning-bar-root',
        privacyClass: 'protected_local'
    }),
    Object.freeze({
        label: 'M4MedicineCard',
        source: 'src/browser/widgets/medicine-view.tsx',
        rootTest: 'm4-medicine-root',
        privacyClass: 'protected_local'
    }),
    Object.freeze({
        label: 'M4TransformContainersCard',
        source: 'src/browser/widgets/transform-containers.tsx',
        rootTest: 'm4-transform-containers-root',
        privacyClass: 'protected_local'
    }),
    Object.freeze({
        label: 'M4LogosStageRing',
        source: 'src/browser/widgets/logos-cycle.tsx',
        rootTest: 'm4-logos-cycle-root',
        privacyClass: 'protected_local'
    }),
    Object.freeze({
        label: 'M4TimeAxisSwitcherChip',
        source: 'src/browser/widgets/time-axis-switcher.tsx',
        rootTest: 'm4-time-axis-switcher-root',
        privacyClass: 'protected_local'
    }),
    Object.freeze({
        label: 'M4LensCard',
        source: 'src/browser/widgets/lens-application.tsx',
        rootTest: 'm4-lens-application-root',
        privacyClass: 'protected_local_handle_only'
    }),
    Object.freeze({
        label: 'M4PratibimbaCoordinateBadge',
        source: 'src/browser/widgets/pratibimba-coordinate.tsx',
        rootTest: 'm4-pratibimba-coordinate-root',
        privacyClass: 'protected_local_handle_only'
    }),
    Object.freeze({
        label: 'M4KairosWheel',
        source: 'src/browser/widgets/kairos-display.tsx',
        rootTest: 'm4-kairos-root',
        privacyClass: 'protected_local_handle_only'
    }),
    Object.freeze({
        label: 'M4MercuriusRelayChip',
        source: 'src/browser/widgets/mercurius-relay-indicator.tsx',
        rootTest: 'm4-mercurius-relay-root',
        privacyClass: 'protected_local_handle_only'
    })
]);

function packageFile(path) {
    return new URL(path, packageRoot);
}

function source(path) {
    return readFileSync(packageFile(path), 'utf8');
}

function privacyChromeClass(privacyClass) {
    const rule = tintRules.find(item => item.privacyClass === privacyClass);
    assert.ok(rule, `unknown privacy class ${privacyClass}`);
    return rule.className;
}

test('privacy chrome stylesheet defines all M4 tint classes with fixed hex colours', () => {
    const css = source('style/privacy-chrome.css');

    for (const rule of tintRules) {
        assert.match(
            css,
            new RegExp(`\\.${rule.className}\\s*\\{[^}]*border-left:\\s*3px\\s+solid\\s+${rule.hex}`, 's'),
            `${rule.className} must define ${rule.hex}`
        );
        assert.equal(
            privacyChromeClass(rule.privacyClass),
            rule.className,
            `${rule.privacyClass} must map to ${rule.className}`
        );
    }
});

test('frontend module imports the privacy chrome stylesheet directly', () => {
    assert.match(
        source('src/browser/frontend-module.ts'),
        /import '\.\.\/\.\.\/style\/privacy-chrome\.css';/
    );
});

test('Wave-C widgets declare privacy tint on React mount className and title tooltip', () => {
    const validClassNames = new Set(tintRules.map(rule => rule.className));

    for (const widget of mountedWidgets) {
        const text = source(widget.source);
        const expectedClass = privacyChromeClass(widget.privacyClass);

        assert.equal(validClassNames.has(expectedClass), true, `${widget.label} uses a known tint class`);
        assert.match(text, new RegExp(`data-test="${widget.rootTest}"`), `${widget.label} root is enumerated`);
        assert.match(text, /className=\{`/, `${widget.label} root tint must be declared through className`);
        assert.match(
            text,
            new RegExp(`privacyChromeClass\\('${widget.privacyClass}'\\)`),
            `${widget.label} root className must declare ${expectedClass}`
        );
        assert.match(
            text,
            /title\.caption = SURFACE_PRIVACY_TOOLTIP/,
            `${widget.label} title caption must carry PRIVACY_CLASS`
        );
    }

    assert.match(source('src/browser/privacy-chrome.ts'), /SURFACE_PRIVACY_TOOLTIP = PRIVACY_CLASS/);
});

test('privacy chrome stays out of the six-entry state-thread status bar', () => {
    const statusBarRoot = join(
        fileURLToPath(epiTheiaRoot),
        'extensions',
        'm-extension-runtime',
        'src',
        'browser',
        'status-bar'
    );
    const statusEntryFiles = readdirSync(statusBarRoot)
        .filter(file => file.endsWith('-status-entry.ts'))
        .sort();

    assert.deepEqual(statusEntryFiles, [
        'active-coordinate-status-entry.ts',
        'day-now-status-entry.ts',
        'gateway-readiness-status-entry.ts',
        'profile-generation-status-entry.ts',
        'profile-tick-status-entry.ts',
        'session-id-status-entry.ts'
    ]);

    for (const file of statusEntryFiles) {
        const filePath = join(statusBarRoot, file);
        assert.equal(existsSync(filePath), true, `${file} must exist`);
        const text = readFileSync(filePath, 'utf8');
        assert.doesNotMatch(text, /privacyChromeClass|mext-privacy-|PRIVACY_CLASS/);
    }
});
