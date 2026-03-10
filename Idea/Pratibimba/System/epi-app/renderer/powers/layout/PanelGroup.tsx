import { Group as ReactPanelGroup, GroupProps } from 'react-resizable-panels';
import clsx from 'clsx';

interface LayoutProp extends GroupProps {
    className?: string;
}

export function PanelGroup({ className, children, ...props }: LayoutProp) {
    return (
        <ReactPanelGroup
            className={clsx("h-full w-full", className)}
            {...props}
        >
            {children}
        </ReactPanelGroup>
    );
}
