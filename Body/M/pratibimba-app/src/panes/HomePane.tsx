/**
 * Coordinate: M' M5-3' (the Home affordance — rerun 52.T5)
 * Residency: Body/M/pratibimba-app/src/panes/HomePane.tsx
 * Position (#n): 0/1 ground with the #0-#5 grid toggle.
 * Actualises: canon's Home affordance — "Home defaults to the 0/1 split view.
 *   A toggle (`0/1` ↔ `#0-#5`) switches to the subsystems grid entry. Both
 *   views coexist" ([[M'-TAURI-PORT-SPEC]] :52, [[M'-SYSTEM-SPEC]] :117).
 *   CARRIER READING (DR-SUBSYS-3): the ratified carrier composes ONE editor
 *   area with the 0/1 face coin — never side-by-side panes — so "the 0/1
 *   split view" IS the lived Now surface this pane already renders, and the
 *   Home affordance lands ON it. The TimeAxisSwitcher + `.personal-pole-body`
 *   subtree is carried unchanged; the pane root gains its data attributes and
 *   the view-toggle strip above it. The AMBIENT strip (TimeAxisSwitcher, and
 *   with it the ⌘⇧T chord listener it owns) mounts in BOTH views — "both
 *   views coexist; neither replaces the other" — and only the BODY swaps:
 *   the recognition engine by default, the six M0'-M5' entry tiles on the
 *   `#0-#5` toggle, each tile firing its `subsystem.open.*` command. Face 0
 *   reaches the same six through the command palette (the OmniPanel carries
 *   NO route to the pages today — a named gap, see DR-SUBSYS-3).
 * Public surface: HomePane.
 * Does NOT own: the recognition engine, the time axis, the open commands'
 *   effects, or the subsystem pages themselves.
 * Contract: [[M'-SYSTEM-SPEC]] :117-119 · [[M'-TAURI-PORT-SPEC]] :52 ·
 *   [[DR-SUBSYS-3]] · rerun tranche [[52.T5]].
 */

import { useState } from 'react';
import { CompositionProfileProvider } from '../composition/compositionProfileContext';
import { TimeAxisSwitcher } from '../components/TimeAxisSwitcher';
import { PersonalRecognitionEngine } from '../engine/PersonalRecognitionEngine';
import { commands } from '../commands/registry';
import { SUBSYSTEM_PAGES, subsystemOpenCommandId } from '../ui/subsystemPages';

type HomeView = 'zero-one' | 'subsystems-grid';

export function HomePane() {
    const [view, setView] = useState<HomeView>('zero-one');
    return (
        <CompositionProfileProvider>
            <div className="personal-pole" data-testid="home-pane" data-home-view={view}>
                <div className="home-view-toggle" data-testid="home-view-toggle" role="group">
                    <button
                        type="button"
                        data-testid="home-view-option-zero-one"
                        aria-pressed={view === 'zero-one'}
                        onClick={() => setView('zero-one')}
                    >
                        0/1
                    </button>
                    <button
                        type="button"
                        data-testid="home-view-option-subsystems"
                        aria-pressed={view === 'subsystems-grid'}
                        onClick={() => setView('subsystems-grid')}
                    >
                        #0–#5
                    </button>
                </div>
                <TimeAxisSwitcher />
                {view === 'zero-one' ? (
                    <div className="personal-pole-body">
                        <PersonalRecognitionEngine />
                    </div>
                ) : (
                    <div className="home-subsystems-grid" data-testid="home-subsystems-grid">
                        {SUBSYSTEM_PAGES.map(page => (
                            <button
                                key={page.id}
                                type="button"
                                className="home-subsystem-tile"
                                data-testid={`home-subsystem-tile-${page.id}`}
                                onClick={() => void commands.execute(subsystemOpenCommandId(page.id))}
                            >
                                <span className="home-subsystem-tile-coordinate">{page.coordinate}</span>
                                <span className="home-subsystem-tile-title">{page.title}</span>
                                <span className="home-subsystem-tile-essence">{page.essence}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </CompositionProfileProvider>
    );
}
