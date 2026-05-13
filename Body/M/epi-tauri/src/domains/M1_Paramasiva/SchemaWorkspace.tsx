import { useGraphStore } from '@/stores/graphStore';
import { Database, GitBranch, Tag } from 'lucide-react';

export function SchemaWorkspace() {
  const { data, connected } = useGraphStore();

  const labelCounts = new Map<string, number>();
  if (data) {
    for (const node of data.nodes) {
      for (const label of node.labels) {
        labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1);
      }
    }
  }

  const relTypeCounts = new Map<string, number>();
  if (data) {
    for (const edge of data.edges) {
      relTypeCounts.set(edge.rel_type, (relTypeCounts.get(edge.rel_type) ?? 0) + 1);
    }
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      <div className="px-4 py-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">M1</span>
          <span className="text-sm font-medium text-neutral-300">Paramasiva — Schema</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {!connected ? (
          <div className="flex items-center justify-center h-32 text-neutral-600 text-sm">
            <Database size={20} className="mr-2 opacity-30" />
            Graph not connected
          </div>
        ) : (
          <>
            {/* Node Labels */}
            <div className="rounded-lg border border-neutral-800 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={14} className="text-red-400" />
                <h3 className="text-sm font-medium text-neutral-300">Node Labels</h3>
                <span className="text-[10px] text-neutral-600">{labelCounts.size} types</span>
              </div>
              <div className="space-y-1">
                {Array.from(labelCounts.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([label, count]) => (
                    <div key={label} className="flex items-center justify-between py-1">
                      <span className="text-xs font-mono text-neutral-400">{label}</span>
                      <span className="text-[10px] text-neutral-600">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Relationship Types */}
            <div className="rounded-lg border border-neutral-800 p-4">
              <div className="flex items-center gap-2 mb-3">
                <GitBranch size={14} className="text-red-400" />
                <h3 className="text-sm font-medium text-neutral-300">Relationship Types</h3>
                <span className="text-[10px] text-neutral-600">{relTypeCounts.size} types</span>
              </div>
              <div className="space-y-1">
                {Array.from(relTypeCounts.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([relType, count]) => (
                    <div key={relType} className="flex items-center justify-between py-1">
                      <span className="text-xs font-mono text-neutral-400">{relType}</span>
                      <span className="text-[10px] text-neutral-600">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
