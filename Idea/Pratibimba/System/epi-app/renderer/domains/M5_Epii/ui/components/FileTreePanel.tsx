import { FileTreeNode } from '../../core/useEpii';

export function FileTreePanel({ tree }: { tree: FileTreeNode[] }) {
    if (!tree || tree.length === 0) return <div className="text-white/50 text-sm">Empty Vault</div>;

    const renderNode = (node: FileTreeNode, depth = 0) => (
        <div key={node.path} style={{ paddingLeft: `${depth * 12}px` }} className="py-1">
            <div className="flex items-center gap-2 text-sm hover:bg-white/5 rounded px-2 cursor-pointer text-[var(--text-secondary)] hover:text-white transition-colors">
                <span>{node.type === 'directory' ? '📁' : '📄'}</span>
                <span>{node.name}</span>
            </div>
            {node.children && node.children.map(child => renderNode(child, depth + 1))}
        </div>
    );

    return (
        <div className="bg-white/5 p-4 rounded border border-white/5 h-full overflow-auto">
            <h3 className="text-xs uppercase text-[var(--text-tertiary)] mb-4">Vault Structure</h3>
            {tree.map(node => renderNode(node))}
        </div>
    );
}
