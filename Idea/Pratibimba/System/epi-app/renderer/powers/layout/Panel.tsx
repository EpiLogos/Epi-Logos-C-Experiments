import { Panel as ReactPanel, PanelProps } from 'react-resizable-panels';
import clsx from 'clsx';

interface LayoutPanelProps extends PanelProps {
    className?: string;
    variant?: 'clean' | 'glass' | 'ghost' | 'flat';
}

export function Panel({ className, children, variant = 'clean', ...props }: LayoutPanelProps) {
    return (
        <ReactPanel
            className={clsx(
                "relative transition-all duration-300 overflow-hidden flex flex-col w-full h-full",
                variant === 'glass' && "bg-black/20 backdrop-blur-sm rounded-lg border border-white/5",
                variant === 'flat' && "bg-[var(--bg-app)]",
                className
            )}
            {...props}
        >
            <div className="h-full w-full overflow-hidden flex flex-col relative">
                {children}
            </div>
        </ReactPanel>
    );
}
