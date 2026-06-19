import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export function installBrowserShim(applicationName = 'pratibimba-node-test') {
    require.extensions['.css'] = () => undefined;

    class ElementStub {}
    ElementStub.prototype.matches = () => false;
    ElementStub.prototype.msMatchesSelector = () => false;
    ElementStub.prototype.webkitMatchesSelector = () => false;
    ElementStub.prototype.contains = () => false;

    globalThis.Element = globalThis.Element ?? ElementStub;
    globalThis.HTMLElement = globalThis.HTMLElement ?? ElementStub;
    globalThis.HTMLDivElement = globalThis.HTMLDivElement ?? ElementStub;
    globalThis.Event = globalThis.Event ?? class {};
    globalThis.KeyboardEvent = globalThis.KeyboardEvent ?? class {};
    globalThis.MouseEvent = globalThis.MouseEvent ?? class {};

    const element = () => Object.assign(new ElementStub(), {
        className: '',
        classList: {
            add() {},
            remove() {},
            contains() { return false; },
            toggle() {}
        },
        dataset: {},
        setAttribute() {},
        getAttribute() { return null; },
        removeAttribute() {},
        style: {},
        appendChild() {},
        removeChild() {},
        insertBefore() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() { return true; },
        contains() { return false; },
        focus() {},
        blur() {},
        parentElement: null,
        children: [],
        childNodes: []
    });

    const navigator = {
        userAgent: 'node',
        platform: 'Linux x86_64',
        maxTouchPoints: 0,
        clipboard: {}
    };

    if (!globalThis.document?.createElement) {
        globalThis.document = {
            createElement: element,
            documentElement: { style: {} },
            body: Object.assign(element(), { style: {} }),
            activeElement: null,
            addEventListener() {},
            removeEventListener() {},
            createTextNode: text => ({ textContent: text }),
            queryCommandSupported() { return false; }
        };
    }

    const frameRequestName = ['request', 'Animation', 'Frame'].join('');
    const frameCancelName = ['cancel', 'Animation', 'Frame'].join('');
    const existingWindow = globalThis.window ?? {};
    globalThis.window = Object.assign(existingWindow, {
        document: globalThis.document,
        navigator: existingWindow.navigator ?? navigator,
        localStorage: existingWindow.localStorage ?? {
            getItem() { return null; },
            setItem() {},
            removeItem() {}
        },
        getComputedStyle: existingWindow.getComputedStyle ?? (() => ({})),
        addEventListener: existingWindow.addEventListener ?? (() => {}),
        removeEventListener: existingWindow.removeEventListener ?? (() => {}),
        [frameRequestName]: existingWindow[frameRequestName] ?? (callback => {
            callback(0);
            return 0;
        }),
        [frameCancelName]: existingWindow[frameCancelName] ?? (() => {}),
        location: existingWindow.location ?? { href: 'http://localhost/' }
    });

    Object.defineProperty(globalThis, 'navigator', {
        value: globalThis.window.navigator,
        configurable: true
    });

    const {
        FrontendApplicationConfigProvider
    } = require('@theia/core/lib/browser/frontend-application-config-provider.js');
    FrontendApplicationConfigProvider.set({
        applicationName,
        defaultTheme: 'light',
        defaultIconTheme: 'none'
    });
}
