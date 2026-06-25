import * as React from 'react';

export const LEMNISCATE_TRANSITION_DURATION_MS = 600;
export const LEMNISCATE_TRANSITION_REDUCED_DURATION_MS = 100;
export const LEMNISCATE_TRANSITION_EASING = 'cubic-bezier(0.4, 0.0, 0.2, 1)';
export const LEMNISCATE_TRANSITION_PATH =
    'M 12 50 C 24 18 48 18 64 50 C 80 82 104 82 116 50 C 104 18 80 18 64 50 C 48 82 24 82 12 50';

export interface LemniscateTransitionProps {
    readonly from?: string;
    readonly to?: string;
    readonly phase?: number;
    readonly className?: string;
    readonly children?: React.ReactNode;
    readonly onFoldChange?: (phase: number) => void;
}

export function resolveLemniscateTransitionDurationMs(prefersReducedMotion: boolean): number {
    return prefersReducedMotion ? LEMNISCATE_TRANSITION_REDUCED_DURATION_MS : LEMNISCATE_TRANSITION_DURATION_MS;
}

export const LemniscateTransition: React.FC<LemniscateTransitionProps> = ({
    from = 'cosmic',
    to = 'personal',
    phase,
    className,
    children,
    onFoldChange
}) => {
    const prefersReducedMotion = usePrefersReducedMotion();
    const [uncontrolledPhase, setUncontrolledPhase] = React.useState(0);
    const activePhase = clampUnit(phase ?? uncontrolledPhase);
    const activePhaseRef = React.useRef(activePhase);
    const durationMs = resolveLemniscateTransitionDurationMs(prefersReducedMotion);
    const rootClassName = className
        ? `epilogos-lemniscate-transition ${className}`
        : 'epilogos-lemniscate-transition';

    React.useEffect(() => {
        activePhaseRef.current = activePhase;
    }, [activePhase]);

    React.useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === '.') {
                event.preventDefault();
                const next = activePhaseRef.current >= 1 ? 0 : 1;
                if (phase === undefined) {
                    setUncontrolledPhase(next);
                }
                onFoldChange?.(next);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onFoldChange, phase]);

    return (
        <div
            className={rootClassName}
            data-transition-from={from}
            data-transition-to={to}
            data-transition-phase={activePhase}
            data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
            aria-label={`${from} to ${to} lemniscate fold`}
            style={{
                position: 'relative',
                display: 'block',
                minWidth: 0
            }}
        >
            {children}
            <svg
                aria-hidden="true"
                viewBox="0 0 128 100"
                preserveAspectRatio="none"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    opacity: prefersReducedMotion ? (activePhase > 0 ? 0.68 : 0) : 0.16 + activePhase * 0.52,
                    transition: `opacity ${durationMs}ms ${LEMNISCATE_TRANSITION_EASING}`,
                    overflow: 'visible'
                }}
            >
                <path
                    d={LEMNISCATE_TRANSITION_PATH}
                    fill="none"
                    stroke="var(--theia-focusBorder, currentColor)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="8 6"
                    pathLength={1}
                    style={{
                        strokeDashoffset: prefersReducedMotion ? 0 : 1 - activePhase,
                        transition: `stroke-dashoffset ${durationMs}ms ${LEMNISCATE_TRANSITION_EASING}`
                    }}
                />
                <circle
                    cx="64"
                    cy="50"
                    r="4"
                    fill="var(--theia-focusBorder, currentColor)"
                    style={{
                        opacity: activePhase > 0 ? 1 : 0,
                        transition: `opacity ${durationMs}ms ${LEMNISCATE_TRANSITION_EASING}`
                    }}
                />
            </svg>
        </div>
    );
};

function usePrefersReducedMotion(): boolean {
    const query = '(prefers-reduced-motion: reduce)';
    const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return false;
        }
        return window.matchMedia(query).matches;
    });

    React.useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return undefined;
        }
        const mediaQuery = window.matchMedia(query);
        const onChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);

        setPrefersReducedMotion(mediaQuery.matches);
        mediaQuery.addEventListener('change', onChange);
        return () => mediaQuery.removeEventListener('change', onChange);
    }, []);

    return prefersReducedMotion;
}

function clampUnit(value: number): number {
    return Math.max(0, Math.min(1, value));
}
