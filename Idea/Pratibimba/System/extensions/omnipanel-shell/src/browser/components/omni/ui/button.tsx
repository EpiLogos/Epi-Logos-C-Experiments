import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../../../shared/utils';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'danger';

type OmniButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function OmniButton({ className, variant = 'outline', ...props }: OmniButtonProps) {
  const variantClass =
    variant === 'default'
      ? 'bg-[var(--color-m5)]/20 border-[var(--color-m5)]/50 text-[var(--text-primary)] hover:bg-[var(--color-m5)]/30'
      : variant === 'ghost'
        ? 'border-transparent text-[var(--text-secondary)] hover:bg-white/10'
        : variant === 'danger'
          ? 'border-red-500/40 text-red-300 hover:bg-red-500/10'
          : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-white/10';

  return (
    <button
      className={cn(
        'px-3 py-1.5 text-xs rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variantClass,
        className,
      )}
      {...props}
    />
  );
}
