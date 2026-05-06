export type ResolvedTheme =
  | 'dark'
  | 'light'
  | 'glass'
  | 'discause'
  | 'nara-dark'
  | 'nara-light'
  | 'nara-glass';

const legacyToCanonical: Record<string, ResolvedTheme> = {
  dark: 'dark',
  light: 'light',
  glass: 'glass',
  discause: 'discause',
  'nara-dark': 'nara-dark',
  'nara-light': 'nara-light',
  'nara-glass': 'nara-glass',
  'nara-forest': 'nara-dark',
  'nara-mist': 'nara-light',
  'nara-grove': 'nara-glass',
};

const naraToBase: Record<'nara-dark' | 'nara-light' | 'nara-glass', 'dark' | 'light' | 'glass'> = {
  'nara-dark': 'dark',
  'nara-light': 'light',
  'nara-glass': 'glass',
};

export function resolveThemeForDomain(theme: string, domainId: string): ResolvedTheme {
  const canonical = legacyToCanonical[theme] ?? 'dark';
  const isNaraDomain = domainId === 'm4';

  if (!isNaraDomain && (canonical === 'nara-dark' || canonical === 'nara-light' || canonical === 'nara-glass')) {
    return naraToBase[canonical];
  }

  return canonical;
}

