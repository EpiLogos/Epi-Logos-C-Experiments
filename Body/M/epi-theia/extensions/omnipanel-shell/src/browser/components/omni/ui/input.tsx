import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '../../../../shared/utils';

const OMNI_TEXT_CONTROL_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif';

export function OmniInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const style = { ...(props.style ?? {}), fontFamily: OMNI_TEXT_CONTROL_FONT_STACK };
  return (
    <input
      className={cn(
        'w-full px-3 py-2 text-xs bg-black/30 border border-[var(--border-subtle)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
        className,
      )}
      {...props}
      style={style}
    />
  );
}

export function OmniTextarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const style = { ...(props.style ?? {}), fontFamily: OMNI_TEXT_CONTROL_FONT_STACK };
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 text-xs bg-black/30 border border-[var(--border-subtle)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
        className,
      )}
      {...props}
      style={style}
    />
  );
}
