import { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { useDomainStore } from '../stores/domainStore';
import { resolveThemeForDomain } from '../theme/resolveTheme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode, accent } = useThemeStore();
  const { currentDomain } = useDomainStore();

  useEffect(() => {
    const root = window.document.documentElement;
    const resolvedMode = resolveThemeForDomain(mode, currentDomain.id);

    root.setAttribute('data-theme', resolvedMode);
    root.setAttribute('data-accent', accent);
    root.setAttribute('data-domain', currentDomain.id);
  }, [mode, accent, currentDomain.id]);

  return <>{children}</>;
}
