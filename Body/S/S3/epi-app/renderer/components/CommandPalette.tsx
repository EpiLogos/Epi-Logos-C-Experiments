import { useState, useEffect, useCallback, useRef } from 'react';
import { MPRIME_DOMAINS, MPrimeDomain } from '../../shared/types';
import { useDomainStore } from '../stores/domainStore';

// Coordinate history persistence key
const HISTORY_STORAGE_KEY = 'epi-coordinate-history';
const MAX_HISTORY_SIZE = 10;

// Parse coordinate string and return matching domain
// Supports formats: M0', M1', m2, #M3, M4-2, etc.
function parseCoordinate(input: string): { domain: MPrimeDomain | null; subCoord?: string; error?: string } {
  // Normalize input: remove #, whitespace, and standardize case
  const cleaned = input.trim().replace(/^#/, '').toUpperCase();

  if (!cleaned) {
    return { domain: null, error: 'Enter a coordinate (e.g., M4, M0\', #M3-2)' };
  }

  // Match patterns like M0, M0', M4-2, M4'-3, etc.
  const match = cleaned.match(/^M(\d)'?(-[\w]+)?$/);

  if (!match) {
    return { domain: null, error: `Invalid coordinate format: "${input}"` };
  }

  const domainNum = parseInt(match[1], 10);
  const subCoord = match[2]; // e.g., "-2" or "-view"

  if (domainNum < 0 || domainNum > 5) {
    return { domain: null, error: `Domain must be M0-M5. Got: M${domainNum}` };
  }

  const domain = MPRIME_DOMAINS.find(d => d.id === `m${domainNum}`);

  if (!domain) {
    return { domain: null, error: `Unknown domain: M${domainNum}` };
  }

  return { domain, subCoord };
}

// Get coordinate history from localStorage
function getCoordinateHistory(): string[] {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save coordinate to history
function saveToHistory(coord: string): void {
  try {
    const history = getCoordinateHistory();
    // Remove duplicates and add to front
    const filtered = history.filter(h => h.toLowerCase() !== coord.toLowerCase());
    const updated = [coord, ...filtered].slice(0, MAX_HISTORY_SIZE);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setCurrentDomain } = useDomainStore();

  // Load history when opened
  useEffect(() => {
    if (isOpen) {
      setHistory(getCoordinateHistory());
      setInput('');
      setError(null);
      setSelectedIndex(-1);
      // Focus input after a brief delay (for animation)
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Navigate to coordinate
  const navigateToCoordinate = useCallback((coord: string) => {
    const result = parseCoordinate(coord);

    if (result.error || !result.domain) {
      setError(result.error || 'Invalid coordinate');
      return;
    }

    // Save to history and navigate
    saveToHistory(coord);
    setCurrentDomain(result.domain.id);
    onClose();
  }, [setCurrentDomain, onClose]);

  // Handle keyboard navigation in history
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, history.length - 1));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      // If a history item is selected, use that
      if (selectedIndex >= 0 && history[selectedIndex]) {
        navigateToCoordinate(history[selectedIndex]);
      } else {
        navigateToCoordinate(input);
      }
      return;
    }
  }, [history, selectedIndex, input, onClose, navigateToCoordinate]);

  // Filter history based on input
  const filteredHistory = input
    ? history.filter(h => h.toLowerCase().includes(input.toLowerCase()))
    : history;

  // Parse current input for preview
  const preview = input ? parseCoordinate(input) : null;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative w-full max-w-lg bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center border-b border-gray-700 px-4">
          <span className="text-gray-500 text-lg mr-2">⌘</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => {
              setInput(e.target.value);
              setError(null);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter coordinate (e.g., M4, M0', #M3-2)..."
            className="flex-1 bg-transparent text-white py-4 outline-none text-lg font-mono"
          />
          {input && (
            <button
              onClick={() => setInput('')}
              className="text-gray-500 hover:text-white p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Preview / Error */}
        {error && (
          <div className="px-4 py-3 bg-red-900/20 border-b border-red-800/50 text-red-400 text-sm">
            {error}
          </div>
        )}

        {preview && preview.domain && !error && (
          <div
            className="px-4 py-3 border-b border-gray-700 flex items-center gap-3"
            style={{ backgroundColor: `${preview.domain.color}10` }}
          >
            <span className="text-2xl">{preview.domain.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="font-mono text-xs px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: `${preview.domain.color}20`,
                    color: preview.domain.color,
                  }}
                >
                  {preview.domain.coordinate}
                </span>
                <span className="text-white font-medium">{preview.domain.name}</span>
              </div>
              <p className="text-gray-400 text-sm">{preview.domain.description}</p>
            </div>
          </div>
        )}

        {/* History */}
        {filteredHistory.length > 0 && (
          <div className="py-2 max-h-64 overflow-auto">
            <div className="px-4 py-1 text-xs text-gray-500 uppercase tracking-wider">
              Recent Coordinates
            </div>
            {filteredHistory.map((coord, idx) => {
              const parsed = parseCoordinate(coord);
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={coord}
                  onClick={() => navigateToCoordinate(coord)}
                  className={`w-full px-4 py-2 flex items-center gap-3 text-left transition-colors ${
                    isSelected ? 'bg-gray-700' : 'hover:bg-gray-800'
                  }`}
                >
                  {parsed.domain && (
                    <>
                      <span className="text-lg">{parsed.domain.icon}</span>
                      <span
                        className="font-mono text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${parsed.domain.color}20`,
                          color: parsed.domain.color,
                        }}
                      >
                        {coord}
                      </span>
                      <span className="text-gray-400">{parsed.domain.name}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Hint */}
        <div className="px-4 py-2 border-t border-gray-700 text-xs text-gray-500 flex items-center gap-4">
          <span><kbd className="bg-gray-800 px-1.5 py-0.5 rounded">↑↓</kbd> Navigate</span>
          <span><kbd className="bg-gray-800 px-1.5 py-0.5 rounded">↵</kbd> Select</span>
          <span><kbd className="bg-gray-800 px-1.5 py-0.5 rounded">esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
