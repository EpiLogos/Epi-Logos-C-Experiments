import { NaraState } from '../core/useNara';
import { FrontmatterPower } from '../../../powers/markdown/FrontmatterPanel';
import { MarkdownPower } from '../../../powers/markdown/MarkdownViewer';

interface JournalWorkspaceProps {
    state: NaraState;
    onBack: () => void;
}

export function JournalWorkspace({ state, onBack }: JournalWorkspaceProps) {
    const { todayNote, loading, error } = state;

    if (loading) return <div className="flex items-center justify-center h-full text-white/50">Loading Journal...</div>;
    if (error) return <div className="flex items-center justify-center h-full text-red-400">{error}</div>;
    if (!todayNote) return <div className="flex items-center justify-center h-full text-white/50">No Daily Note Found</div>;

    const title = todayNote.frontmatter.title as string || 'Daily Note';
    const date = todayNote.frontmatter.date as string || new Date().toLocaleDateString();

    return (
        <div className="h-full flex flex-col relative w-full overflow-hidden">
            {/* Header / Nav */}
            <div className="flex-shrink-0 p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-app)]">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="text-xs text-[var(--text-tertiary)] hover:text-white px-2 py-1 rounded hover:bg-white/10"
                    >
                        ← Hub
                    </button>
                    <div>
                        <h1 className="text-lg font-medium text-white">{title}</h1>
                        <p className="text-xs text-[var(--text-tertiary)]">{date}</p>
                    </div>
                </div>
                <div className="text-xs font-mono text-[var(--color-m4)]">
                    {todayNote.path}
                </div>
            </div>

            {/* Content Scroll */}
            <div className="flex-1 overflow-auto p-8 max-w-4xl mx-auto w-full">
                <FrontmatterPower data={todayNote.frontmatter} />
                <div className="mt-8 border-t border-[var(--border-subtle)] pt-8">
                    <MarkdownPower content={todayNote.content} />
                </div>
            </div>
        </div>
    );
}
