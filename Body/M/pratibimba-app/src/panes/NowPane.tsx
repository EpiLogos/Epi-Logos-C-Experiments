/**
 * Coordinate: M' M4' (the day surface, plan T3.1)
 * Actualises: the personal home as the lived day — no day anchored shows
 *   "begin today"; an anchored day IS the daily-note open for writing
 *   (write-back through the vault service, S1 scope). Session-NOW folders
 *   remain Khora's law; this surface anchors and writes the day parent.
 */

import { useSessionStore } from '../state/stores';
import { commands } from '../commands/registry';
import { MarkdownEditorPane } from './MarkdownEditorPane';

export function NowPane() {
    const dayNow = useSessionStore(s => s.dayNow);

    if (!dayNow) {
        return (
            <section className="face face-personal" data-testid="personal-face">
                <div className="pending-panel">
                    <h2>No day anchored</h2>
                    <p>The day is the ground of the personal face — anchor it and write.</p>
                    <button
                        type="button"
                        className="instrument-toggle"
                        data-testid="now-begin-today"
                        onClick={() => void commands.execute('journal.beginToday')}
                    >
                        ☀ begin today
                    </button>
                </div>
            </section>
        );
    }
    return (
        <div className="now-pane" data-testid="now-pane" data-day={dayNow}>
            <MarkdownEditorPane path={`Empty/Present/${dayNow}/daily-note.md`} />
        </div>
    );
}
