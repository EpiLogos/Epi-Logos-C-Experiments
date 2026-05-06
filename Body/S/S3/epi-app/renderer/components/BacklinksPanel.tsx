import { useState, useEffect } from 'react';
import { BacklinksData } from '../../shared/types';
import { formatIdeaDisplayPath } from '../../shared/repo-paths';

interface BacklinksPanelProps {
  filePath: string | null;
  onFileNavigate?: (filePath: string) => void;
}

/**
 * BacklinksPanel - Shows incoming references to a file
 * Displays a list of files that link to the current file via wiki-links
 */
export function BacklinksPanel({ filePath, onFileNavigate }: BacklinksPanelProps) {
  const [backlinks, setBacklinks] = useState<BacklinksData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Load backlinks when file path changes
  useEffect(() => {
    if (!filePath) {
      setBacklinks(null);
      return;
    }

    const currentPath = filePath; // Capture for use in async function

    async function loadBacklinks() {
      setLoading(true);
      try {
        const data = await window.sPrime.s1.backlinks.getBacklinks(currentPath);
        setBacklinks(data);
      } catch (err) {
        console.error('Failed to load backlinks:', err);
        setBacklinks(null);
      } finally {
        setLoading(false);
      }
    }

    void loadBacklinks();
  }, [filePath]);

  const handleBacklinkClick = (sourcePath: string) => {
    if (onFileNavigate) {
      onFileNavigate(sourcePath);
    }
  };

  // Get relative display path
  const getDisplayPath = (fullPath: string): string => {
    return formatIdeaDisplayPath(fullPath);
  };

  if (!filePath) {
    return null;
  }

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-400">🔗</span>
          <span className="font-medium text-gray-300">Backlinks</span>
          {backlinks && backlinks.backlinks.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-400">
              {backlinks.backlinks.length}
            </span>
          )}
        </div>
        <span className="text-gray-500 text-sm">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-gray-700/50">
          {loading ? (
            <div className="px-4 py-3 text-gray-500 text-sm">
              <div className="animate-pulse">Loading backlinks...</div>
            </div>
          ) : backlinks && backlinks.backlinks.length > 0 ? (
            <div className="max-h-64 overflow-auto">
              {backlinks.backlinks.map((ref, idx) => (
                <button
                  key={`${ref.sourcePath}-${ref.lineNumber}-${idx}`}
                  onClick={() => handleBacklinkClick(ref.sourcePath)}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-gray-700/30 last:border-b-0 transition-colors group"
                >
                  {/* Source title and path */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-400 font-medium text-sm group-hover:text-emerald-300">
                      {ref.sourceTitle}
                    </span>
                    <span className="text-gray-600 text-xs">
                      L{ref.lineNumber}
                    </span>
                  </div>

                  {/* Context preview */}
                  <p className="text-gray-500 text-xs truncate">
                    {ref.context}
                  </p>

                  {/* Full path on hover */}
                  <p className="text-gray-600 text-xs font-mono truncate mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {getDisplayPath(ref.sourcePath)}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-gray-500 text-sm">
              No incoming links found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact backlinks badge for inline display
 */
interface BacklinksBadgeProps {
  count: number;
  onClick?: () => void;
}

export function BacklinksBadge({ count, onClick }: BacklinksBadgeProps) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-gray-300 transition-colors"
      title={`${count} incoming link${count !== 1 ? 's' : ''}`}
    >
      <span>🔗</span>
      <span>{count}</span>
    </button>
  );
}
