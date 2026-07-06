/**
 * Coordinate: M' (command palette, plan T2.4)
 * Actualises: cmd-shift-P — the keyboard face of the command registry.
 *   An overlay, not a modal gate: escape closes, nothing blocks.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { commands, usePaletteStore } from '../commands/registry';

export function CommandPalette() {
    const open = usePaletteStore(s => s.open);
    const setOpen = usePaletteStore(s => s.setOpen);
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(0);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const matches = useMemo(() => {
        const q = query.toLowerCase();
        return commands.list().filter(c => c.title.toLowerCase().includes(q) || c.id.includes(q));
    }, [query, open]);

    useEffect(() => {
        if (open) {
            setQuery('');
            setSelected(0);
            inputRef.current?.focus();
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const run = (index: number) => {
        const command = matches[index];
        setOpen(false);
        if (command) {
            void commands.execute(command.id);
        }
    };

    return (
        <div className="palette-overlay" data-testid="command-palette" onClick={() => setOpen(false)}>
            <div className="palette" onClick={evt => evt.stopPropagation()}>
                <input
                    ref={inputRef}
                    data-testid="palette-input"
                    value={query}
                    placeholder="Type a command…"
                    onChange={evt => {
                        setQuery(evt.target.value);
                        setSelected(0);
                    }}
                    onKeyDown={evt => {
                        if (evt.key === 'Escape') {
                            setOpen(false);
                        } else if (evt.key === 'ArrowDown') {
                            evt.preventDefault();
                            setSelected(s => Math.min(s + 1, matches.length - 1));
                        } else if (evt.key === 'ArrowUp') {
                            evt.preventDefault();
                            setSelected(s => Math.max(s - 1, 0));
                        } else if (evt.key === 'Enter') {
                            evt.preventDefault();
                            run(selected);
                        }
                    }}
                />
                <ul className="palette-list">
                    {matches.map((command, index) => (
                        <li key={command.id}>
                            <button
                                type="button"
                                data-testid={`palette-item-${command.id}`}
                                className={`palette-item ${index === selected ? 'palette-item-selected' : ''} ${
                                    commands.isEnabled(command.id) ? '' : 'palette-item-disabled'
                                }`}
                                onClick={() => run(index)}
                            >
                                {command.title}
                            </button>
                        </li>
                    ))}
                    {matches.length === 0 ? <li className="palette-empty">no matching command</li> : null}
                </ul>
            </div>
        </div>
    );
}
