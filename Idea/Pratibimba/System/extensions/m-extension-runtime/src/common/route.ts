/**
 * Route convention from 07.T0:
 *   scheme: epi-logos://ide
 *   commandSuffixes: .readOnly, .depositOnly
 *
 * The per-extension route paths and route handlers in each M-extension
 * delegate to a shared parser so deep-link grammar stays consistent.
 */
export const M_EXTENSION_ROUTE_SCHEME = 'epi-logos://ide';

export interface MExtensionRoute {
    readonly extensionId: string;
    readonly routePath: string;
    readonly query: Readonly<Record<string, string>>;
}

export function parseExtensionRoute(raw: string): MExtensionRoute | null {
    if (!raw.startsWith(M_EXTENSION_ROUTE_SCHEME)) {
        return null;
    }
    const tail = raw.slice(M_EXTENSION_ROUTE_SCHEME.length);
    const [pathPart, queryPart] = tail.split('?', 2);
    if (!pathPart || !pathPart.startsWith('/')) {
        return null;
    }
    const segments = pathPart.slice(1).split('/');
    if (segments.length < 2) {
        return null;
    }
    const extensionId = segments[0];
    const routePath = '/' + segments.join('/');
    const query: Record<string, string> = {};
    if (queryPart) {
        for (const pair of queryPart.split('&')) {
            if (!pair) {
                continue;
            }
            const eqIdx = pair.indexOf('=');
            if (eqIdx === -1) {
                query[decodeURIComponent(pair)] = '';
            } else {
                query[decodeURIComponent(pair.slice(0, eqIdx))] = decodeURIComponent(
                    pair.slice(eqIdx + 1)
                );
            }
        }
    }
    return Object.freeze({ extensionId, routePath, query: Object.freeze(query) });
}

export function formatExtensionRoute(
    extensionId: string,
    routePath: string,
    query: Record<string, string> = {}
): string {
    const path = routePath.startsWith('/') ? routePath : '/' + routePath;
    const qs = Object.entries(query)
        .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
        .join('&');
    return qs.length > 0
        ? `${M_EXTENSION_ROUTE_SCHEME}/${extensionId}${path}?${qs}`
        : `${M_EXTENSION_ROUTE_SCHEME}/${extensionId}${path}`;
}
