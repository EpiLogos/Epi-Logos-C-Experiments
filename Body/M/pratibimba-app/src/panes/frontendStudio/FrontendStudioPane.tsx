/**
 * Coordinate: M5-3' Frontend Studio (rerun 51.T51.2)
 * Residency: Body/M/pratibimba-app/src/panes/frontendStudio/FrontendStudioPane.tsx
 * Position (#n): #3 — Process: the studio through which the app's own layout,
 *   extension set, and plugin composition are inspectable.
 * Actualises: [[M5'-SPEC]]'s "Sixfold IDE Surface" M5-3' entry — the one
 *   studio of the sixfold with no tranche until now. Canon says it "Shapes one
 *   Theia shell whose 0/1 daily layout, deep IDE layout, M-extensions, and
 *   integrated plugins are one thing"; the Theia framing is CONTRACT (what the
 *   surface must expose), the Theia plumbing is dead, so this is carrier-native.
 *   THE ACCEPTANCE IS THE SOURCE, not the render: every row comes from
 *   `paneRegistry.ts`, which reads the live flexlayout models, the factory's
 *   own render ledger, and the real declaration modules. Nothing here is a
 *   screenshot of the layout system — it is the layout system, read out.
 * Public surface: FrontendStudioPane, FRONTEND_STUDIO_SURFACE_ID.
 * Does NOT own: the registry readings (`paneRegistry.ts`), the models
 *   (`App.tsx`), the composition law (`composition/`), or any inspected pane.
 * Contract: rerun tranche [[51.T51.2]] · [[M5'-SPEC]] Sixfold IDE Surface ·
 *   [[CHROME-CONTRACT]] §2.
 */

import { useState } from 'react';
import {
    compositionSlotOccupancy,
    integratedPluginRecords,
    paneInventory,
    usePaneRegistry
} from './paneRegistry';
import './frontendStudio.css';

/** The flexlayout component key `App.tsx::factory` mounts this pane under. */
export const FRONTEND_STUDIO_SURFACE_ID = 'frontendStudio';

type StudioSection = 'panes' | 'slots' | 'plugins';

const SECTIONS: ReadonlyArray<{ readonly id: StudioSection; readonly label: string }> = [
    { id: 'panes', label: 'Registered panes' },
    { id: 'slots', label: 'Composition slots' },
    { id: 'plugins', label: 'Integrated plugins' }
];

function StateChip({ row }: { readonly row: ReturnType<typeof paneInventory>[number] }) {
    if (row.mountedNeverRendered) {
        return <span className="fs-chip fs-chip-mounted">mounted · not yet rendered</span>;
    }
    if (row.renderedUnmounted) {
        return <span className="fs-chip fs-chip-transient">rendered · no live model</span>;
    }
    if (row.declaredOnly) {
        return <span className="fs-chip fs-chip-declared">declared only</span>;
    }
    return <span className="fs-chip fs-chip-live">live</span>;
}

export function FrontendStudioPane() {
    const registry = usePaneRegistry();
    const [section, setSection] = useState<StudioSection>('panes');
    const inventory = paneInventory(registry);
    const slots = compositionSlotOccupancy();
    const plugins = integratedPluginRecords();
    const rendered = inventory.filter(row => row.renders > 0);

    return (
        <div
            className="frontend-studio"
            data-testid="frontend-studio"
            data-studio-section={section}
            data-pane-registry-revision={registry.revision}
            data-registered-pane-count={registry.mounts.length}
            data-rendered-pane-count={rendered.length}
            data-registered-components={[
                ...new Set(registry.mounts.map(mount => mount.component))
            ]
                .sort()
                .join(' ')}
            data-rendered-components={rendered.map(row => row.component).sort().join(' ')}
            data-filled-composition-slots={slots
                .filter(slot => slot.owner !== null)
                .map(slot => `${slot.slot}=${slot.owner}`)
                .sort()
                .join(' ')}
        >
            <header className="frontend-studio-header">
                <span className="frontend-studio-coordinate">M5-3′</span>
                <h2>Frontend Studio</h2>
                <p className="frontend-studio-essence">
                    The 0/1 daily layout, the deep IDE layout, the M-extension surfaces and the
                    integrated plugin compositions, read out of the registries the shell actually
                    booted from — never a restatement of them.
                </p>
            </header>
            <nav className="frontend-studio-sections" data-testid="frontend-studio-sections">
                {SECTIONS.map(entry => (
                    <button
                        key={entry.id}
                        type="button"
                        data-testid={`frontend-studio-section-${entry.id}`}
                        aria-pressed={entry.id === section}
                        onClick={() => setSection(entry.id)}
                    >
                        {entry.label}
                    </button>
                ))}
            </nav>

            {section === 'panes' ? (
                <section className="frontend-studio-panes" data-testid="frontend-studio-panes">
                    <table>
                        <thead>
                            <tr>
                                <th>Component</th>
                                <th>Mounted in</th>
                                <th>Renders</th>
                                <th>Declared by</th>
                                <th>State</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map(row => (
                                <tr
                                    key={row.component}
                                    data-testid={`frontend-studio-pane-${row.component}`}
                                    data-renders={row.renders}
                                    data-mount-count={row.mounts.length}
                                >
                                    <td>
                                        <code>{row.component}</code>
                                    </td>
                                    <td className="fs-mounts">
                                        {row.mounts.length === 0
                                            ? '—'
                                            : [
                                                ...new Set(
                                                    row.mounts.map(
                                                        mount =>
                                                            `face ${mount.face} · ${mount.layout} · ${mount.slot}`
                                                    )
                                                )
                                            ].join(' | ')}
                                    </td>
                                    <td>{row.renders}</td>
                                    <td className="fs-declared">
                                        {row.declarations.length === 0
                                            ? '—'
                                            : [
                                                ...new Set(
                                                    row.declarations.map(
                                                        declaration =>
                                                            `${declaration.declaredBy} (${declaration.kind})`
                                                    )
                                                )
                                            ].join(' | ')}
                                    </td>
                                    <td>
                                        <StateChip row={row} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            ) : null}

            {section === 'slots' ? (
                <section className="frontend-studio-slots" data-testid="frontend-studio-slots">
                    <ul>
                        {slots.map(slot => (
                            <li
                                key={slot.slot}
                                data-testid={`frontend-studio-slot-${slot.slot}`}
                                data-slot-owner={slot.owner ?? ''}
                                data-slot-composition={slot.compositionId ?? ''}
                            >
                                <code>{slot.slot}</code>{' '}
                                {slot.owner ? (
                                    <>
                                        <span className="fs-chip fs-chip-live">{slot.owner}</span>{' '}
                                        <span className="fs-note">
                                            {slot.compositionId} · handle {slot.handleClass}
                                        </span>
                                    </>
                                ) : (
                                    <span className="fs-chip fs-chip-declared">unfilled</span>
                                )}
                                {slot.blockedBy ? (
                                    <span className="fs-chip fs-chip-blocked">
                                        blocked: {slot.blockedBy}
                                    </span>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}

            {section === 'plugins' ? (
                <section className="frontend-studio-plugins" data-testid="frontend-studio-plugins">
                    <ul>
                        {plugins.map(plugin => (
                            <li
                                key={plugin.compositionId}
                                data-testid={`frontend-studio-plugin-${plugin.compositionId}`}
                                data-plugin-mounted={String(plugin.mounted)}
                            >
                                <code>{plugin.compositionId}</code>
                                <span
                                    className={`fs-chip ${plugin.mounted ? 'fs-chip-live' : 'fs-chip-blocked'}`}
                                >
                                    {plugin.mounted ? 'mounted' : 'refused'}
                                </span>
                                <span className="fs-note">{plugin.description}</span>
                                <span className="fs-note">
                                    contributors: {plugin.contributors.join(', ')}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </div>
    );
}
