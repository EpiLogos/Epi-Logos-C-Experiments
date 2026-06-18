import { resolveThemeForDomain, type ResolvedTheme } from '../omnipanel-shell/src/browser/theme/resolveTheme';
import {
    getUiColourToken,
    type UiColourTokenPath,
    type UiColourThemeMode
} from './ui-colour-tokens';

export type UiThemeTokenResolver = (theme: string, domainId: string) => string;

const THEME_MODE_FALLBACK: Readonly<Record<ResolvedTheme, UiColourThemeMode>> = Object.freeze({
    dark: 'dark',
    light: 'light',
    glass: 'light',
    discause: 'light',
    'nara-dark': 'dark',
    'nara-light': 'light',
    'nara-glass': 'light'
});

export function resolveToken(tokenId: UiColourTokenPath, theme: string, domainId: string): string {
    const resolvedTheme = resolveThemeForDomain(theme, domainId);
    const tokenValue = getUiColourToken(tokenId).$value;
    const themeValue = tokenValue[resolvedTheme];

    if (typeof themeValue === 'string') {
        return themeValue;
    }

    return tokenValue[THEME_MODE_FALLBACK[resolvedTheme]];
}

export function createUiColourTokenResolver(tokenId: UiColourTokenPath): UiThemeTokenResolver {
    return (theme, domainId) => resolveToken(tokenId, theme, domainId);
}
