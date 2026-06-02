import { useState, useCallback } from 'react';
import { Search, BookOpen, Database, Filter } from 'lucide-react';
import type { LibrarySearchResult, LibrarySearchQuery } from '@/services/types';
import { epiiClient } from '@/services/epiiClient';

export function LibraryFolio() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LibrarySearchResult[]>([]);
  const [namespace, setNamespace] = useState<'all' | 'bimba' | 'gnostic' | 'atelier'>('all');
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await epiiClient.library.search({
        query: query.trim(),
        namespace,
        limit: 20,
      });
      setResults(res);
    } catch (e) {
      console.error('Library search failed:', e);
    } finally {
      setSearching(false);
    }
  }, [query, namespace]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen size={16} className="text-blue-400" />
        <h3 className="text-sm font-medium text-neutral-300">Geometric Folio</h3>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-neutral-900 rounded-lg border border-neutral-800 px-3">
          <Search size={14} className="text-neutral-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search knowledge base..."
            className="flex-1 bg-transparent text-sm py-2 outline-none text-neutral-300"
          />
        </div>
        <select
          value={namespace}
          onChange={(e) => setNamespace(e.target.value as typeof namespace)}
          className="bg-neutral-900 border border-neutral-800 rounded-lg px-2 text-xs text-neutral-400"
        >
          <option value="all">All</option>
          <option value="bimba">Bimba</option>
          <option value="gnostic">Gnostic</option>
          <option value="atelier">Atelier</option>
        </select>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {searching && (
          <p className="text-xs text-neutral-600 text-center py-4">Searching...</p>
        )}
        {!searching && results.length === 0 && query && (
          <p className="text-xs text-neutral-600 text-center py-4">No results found</p>
        )}
        {results.map((result, i) => (
          <div
            key={i}
            className="rounded-lg border border-neutral-800 p-3 hover:border-neutral-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <Database size={12} className="text-neutral-600" />
              <span className="text-xs font-mono text-blue-400">
                {result.coordinate ?? result.id}
              </span>
              {result.score != null && (
                <span className="text-[10px] text-neutral-700 ml-auto">
                  {(result.score * 100).toFixed(0)}%
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 line-clamp-2">
              {result.excerpt ?? result.title ?? 'No preview'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
