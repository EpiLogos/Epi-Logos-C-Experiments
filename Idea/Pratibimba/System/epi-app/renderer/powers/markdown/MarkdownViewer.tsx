export function MarkdownPower({ content }: { content: string }) {
    return (
        <div className="prose prose-invert max-w-none prose-sm">
            <pre className="whitespace-pre-wrap font-mono text-sm text-[var(--text-secondary)] bg-transparent p-0">
                {content}
            </pre>
        </div>
    );
}
