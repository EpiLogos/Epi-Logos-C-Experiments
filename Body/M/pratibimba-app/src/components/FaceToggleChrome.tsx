/**
 * Coordinate: M' shell (0/1 face chrome)
 * Residency: Body/M/pratibimba-app/src/components
 * Position (#n): #5 - shared shell control
 * Actualises: the title-bar coin control and consumed DR-UI-4 transition law.
 * Public surface: FaceToggleChrome.
 * Does NOT own: face state or toggle semantics (App/commands registry).
 */

import type { CSSProperties, ReactNode } from 'react';
import { LEMNISCATE_MASK_LAW, TRANSITIONS } from '../ui/primitives';

interface FaceToggleChromeProps {
    readonly face: 0 | 1;
    readonly onToggle: () => void;
    readonly children: ReactNode;
}

const CUBIC_OUT = 'cubic-bezier(0.33, 1, 0.68, 1)';

export function FaceToggleChrome({ face, onToggle, children }: FaceToggleChromeProps) {
    const style = {
        '--face-transition-duration': `${TRANSITIONS.lemniscate01.ms}ms`,
        '--face-transition-easing': CUBIC_OUT
    } as CSSProperties;

    return (
        <main
            className="faces"
            data-lemniscate-law={LEMNISCATE_MASK_LAW}
            data-transition-easing={TRANSITIONS.lemniscate01.easing}
            style={style}
        >
            {children}
            <div className="face-toggle-chrome">
                <button
                    type="button"
                    className="face-toggle-button"
                    data-testid="face-toggle"
                    aria-label={`Switch to ${face === 1 ? 'cosmic face 0' : 'personal face 1'}`}
                    title="Invert 0/1 face (Cmd+.)"
                    onClick={onToggle}
                >
                    <span className="face-toggle-icon" aria-hidden="true" />
                </button>
            </div>
        </main>
    );
}
