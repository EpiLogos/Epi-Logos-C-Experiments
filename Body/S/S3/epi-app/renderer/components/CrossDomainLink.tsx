import { useCallback } from 'react';
import { parseLink, isCoordinateReference, extractCoordinatePosition, getDomainByPosition, isExternalUrl } from '../utils/linkRouter';
import { useDomainStore } from '../stores/domainStore';

interface CrossDomainLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onFileNavigate?: (filePath: string) => void;
}

/**
 * CrossDomainLink - A link component that handles all link types:
 * - Wiki-links ([[target]]) - Navigate to file within app
 * - Coordinate links (#M0-5, M0'-M5') - Switch domains
 * - External links (http/https) - Open in browser
 */
export function CrossDomainLink({ href, children, className, onFileNavigate }: CrossDomainLinkProps) {
  const { setCurrentDomain } = useDomainStore();

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();

    // Parse the link to determine type
    const parsed = parseLink(href);

    switch (parsed.type) {
      case 'external':
        // Open external URLs in default browser
        try {
          await window.sPrime.s0.shell.openExternal(parsed.target);
        } catch (err) {
          console.error('Failed to open external link:', err);
        }
        break;

      case 'coordinate':
        // Switch to the target domain
        if (parsed.domainId) {
          setCurrentDomain(parsed.domainId);
        }
        break;

      case 'wiki':
      case 'file':
        // Try to resolve and navigate to file
        if (onFileNavigate) {
          try {
            // Try to resolve wiki-link to actual file path
            const resolvedPath = await window.sPrime.s1.backlinks.resolveWikiLink(parsed.target);
            if (resolvedPath) {
              onFileNavigate(resolvedPath);
            } else {
              console.log('Could not resolve wiki-link:', parsed.target);
            }
          } catch (err) {
            console.error('Failed to resolve wiki-link:', err);
          }
        }
        break;
    }
  }, [href, setCurrentDomain, onFileNavigate]);

  // Determine link styling based on type
  const getLinkStyle = () => {
    if (isExternalUrl(href)) {
      return 'text-blue-400 hover:text-blue-300';
    }
    if (isCoordinateReference(href)) {
      const pos = extractCoordinatePosition(href);
      const domain = pos !== null ? getDomainByPosition(pos) : null;
      if (domain) {
        return `hover:underline cursor-pointer`;
      }
    }
    return 'text-emerald-400 hover:text-emerald-300';
  };

  // Get domain color for coordinate links
  const getCoordinateColor = () => {
    if (isCoordinateReference(href)) {
      const pos = extractCoordinatePosition(href);
      const domain = pos !== null ? getDomainByPosition(pos) : null;
      return domain?.color;
    }
    return undefined;
  };

  const coordColor = getCoordinateColor();

  return (
    <button
      onClick={handleClick}
      className={`hover:underline cursor-pointer ${getLinkStyle()} ${className || ''}`}
      style={coordColor ? { color: coordColor } : undefined}
    >
      {children}
    </button>
  );
}

/**
 * CoordinateTag - Inline coordinate reference that switches domains
 * Used for rendering #M0, #2, M3' style references
 */
interface CoordinateTagProps {
  coordinate: string;
  className?: string;
}

export function CoordinateTag({ coordinate, className }: CoordinateTagProps) {
  const { setCurrentDomain } = useDomainStore();

  const pos = extractCoordinatePosition(coordinate);
  const domain = pos !== null ? getDomainByPosition(pos) : null;

  const handleClick = useCallback(() => {
    if (domain) {
      setCurrentDomain(domain.id);
    }
  }, [domain, setCurrentDomain]);

  if (!domain) {
    return <span className={className}>{coordinate}</span>;
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono hover:opacity-80 transition-opacity ${className || ''}`}
      style={{
        backgroundColor: `${domain.color}20`,
        color: domain.color,
      }}
      title={`${domain.name} - ${domain.description}`}
    >
      <span>{domain.icon}</span>
      <span>{coordinate}</span>
    </button>
  );
}
