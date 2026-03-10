import { ReactNode } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import clsx from 'clsx';

// -- Types --

export interface FunctionalGridProps {
    domainId: string;
    strata?: { title: string; content: ReactNode }[];
    metrics?: ReactNode;
    actions?: ReactNode;
    workspace?: ReactNode;
    onEnterWorkspace?: () => void;
}

// -- Components --

// 1. The Interactive Divider
function ResizeHandle({ vertical }: { vertical?: boolean }) {
    return (
        <Separator
            className={clsx(
                "relative flex items-center justify-center transition-all duration-300 outline-none z-50",
                vertical ? "h-px w-full cursor-row-resize" : "w-px h-full cursor-col-resize"
            )}
        >
            <div className={clsx(
                "bg-white/10 hover:bg-[var(--color-primary)] transition-colors duration-300",
                vertical ? "h-px w-full" : "w-px h-full"
            )} />
        </Separator>
    );
}

// 2. The Panel Content Wrapper (Visuals)
function PanelContent({ title, children, colorVar, onClick }: { title: string, children: ReactNode, colorVar: string, onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className="h-full w-full bg-white/[0.02] flex flex-col relative overflow-hidden group"
        >
            {/* Header */}
            <div className="flex-none h-8 px-3 flex items-center border-b border-white/5 bg-white/[0.02]">
                <div
                    className="w-1.5 h-1.5 rounded-full mr-2 opacity-50 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: `var(${colorVar})` }}
                />
                <h3 className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] select-none">
                    {title}
                </h3>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-hidden relative">
                {children}
            </div>
        </div>
    );
}

// 3. The Main Grid Logic
export function FunctionalGrid({ domainId, strata, metrics, actions, workspace, onEnterWorkspace }: FunctionalGridProps) {
    const colorVar = `--color-${domainId}`;

    return (
        <div className="h-full w-full bg-black/50">
            {/* 
               CRITICAL FIX: 
               The Group MUST have explicit style={{ height: '100%' }} to work within a flex container 
               if the container doesn't force it otherwise.
            */}
            <Group direction="vertical" style={{ height: '100%', width: '100%' }}>

                {/* --- TOP ROW (50%) --- */}
                <Panel defaultSize={50} minSize={20}>
                    <PanelContent title="Top Row Check" colorVar={colorVar}>
                        <div className="p-4 text-white">
                            If you see this and the bottom row, Vertical Split works.
                        </div>
                    </PanelContent>
                </Panel>

                <ResizeHandle vertical />

                {/* --- BOTTOM ROW (50%) --- */}
                <Panel defaultSize={50} minSize={20}>
                    <PanelContent title="Bottom Row Check" colorVar={colorVar}>
                        <div className="p-4 text-white">
                            Bottom Row Content
                        </div>
                    </PanelContent>
                </Panel>

            </Group>
        </div>
    );
}
