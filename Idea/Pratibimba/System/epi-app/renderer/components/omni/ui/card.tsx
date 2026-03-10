import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../../../shared/utils';

export const OmniCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function OmniCard(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('rounded border border-[var(--border-subtle)] bg-white/5', className)}
      {...props}
    />
  );
});
