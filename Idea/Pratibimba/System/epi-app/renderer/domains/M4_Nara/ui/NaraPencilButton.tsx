import { PenTool } from 'lucide-react';

interface NaraPencilButtonProps {
  onClick: () => void;
  isOpen?: boolean;
}

export function NaraPencilButton({ onClick, isOpen = false }: NaraPencilButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Close context manager' : 'Open context manager'}
      aria-expanded={isOpen}
      className="absolute top-10 left-12 z-20 flex h-8 w-8 items-center justify-center rounded-md bg-[var(--bg-panel)]/80 backdrop-blur-sm shadow-sm transition-all hover:scale-110 hover:opacity-100 opacity-60 border border-[var(--border-subtle)]"
      data-testid="nara-pencil-button"
    >
      <PenTool size={14} className="text-[var(--text-primary)]" />
    </button>
  );
}
