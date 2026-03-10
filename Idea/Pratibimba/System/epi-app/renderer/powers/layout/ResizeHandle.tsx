import clsx from 'clsx';
import { Separator as ReactResizeHandle, SeparatorProps } from 'react-resizable-panels';

interface ResizeHandleProps extends SeparatorProps {
    className?: string;
    vertical?: boolean; // If true, handle is horizontal (dividers vertical stacked panels)
}

export function ResizeHandle({ className, vertical = false, ...props }: ResizeHandleProps) {
    return (
        <ReactResizeHandle
            className={clsx(
                // Base structure
                "relative flex items-center justify-center transition-all duration-300 outline-none group z-50",
                // Dimensions varies by orientation
                vertical ? "h-px w-full py-1 cursor-row-resize" : "w-px h-full px-1 cursor-col-resize",
                className
            )}
            {...props}
        >
            {/* The Visible Line */}
            <div
                className={clsx(
                    "bg-white/10 group-hover:bg-white/40 transition-colors duration-300",
                    vertical ? "h-px w-full" : "w-px h-full"
                )}
            />

            {/* Optional: Central Grip / Jewel (can be removed for pure clean lines) */}
            <div className={clsx(
                "absolute bg-white/0 group-hover:bg-[var(--color-accent)] transition-all duration-500 rounded-full",
                vertical ? "w-8 h-1" : "h-8 w-1",
                "opacity-0 group-hover:opacity-100 blur-[1px]"
            )} />
        </ReactResizeHandle>
    );
}
