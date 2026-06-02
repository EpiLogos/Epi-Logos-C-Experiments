/**
 * Pratibimba System layout-mode types — Track 05 T2.
 *
 * The Theia shell carries two named workspace layouts switched via Theia's
 * `ApplicationShell.setLayoutData` + `LayoutRestorer`. Per canon §2-§3 there
 * is one Theia process and one renderer; layouts are intra-process view
 * changes, not separate apps or webviews. Cross-layout state identity
 * (selected coordinate, session key, DAY/NOW context, profile generation,
 * bridge subscription) is preserved by the kernel-bridge DI singletons, not
 * by the layout system.
 */

export const PRATIBIMBA_LAYOUT_DAILY_0_1 = 'daily-0-1' as const;
export const PRATIBIMBA_LAYOUT_IDE_DEEP = 'ide-deep' as const;

/** Canonical layout identifier shape. */
export type PratibimbaLayoutId =
    | typeof PRATIBIMBA_LAYOUT_DAILY_0_1
    | typeof PRATIBIMBA_LAYOUT_IDE_DEEP;

/**
 * Human-readable metadata used by the omni-panel commands and the layout
 * switcher status indicator.
 */
export interface PratibimbaLayoutDescriptor {
    readonly id: PratibimbaLayoutId;
    readonly label: string;
    readonly description: string;
    /**
     * The Theia widget IDs this layout expects to surface. Concrete widget
     * contributions are owned by their own extensions; the layout descriptor
     * names them so the switcher can request reveal/focus when materialising
     * the layout.
     */
    readonly expectedWidgets: ReadonlyArray<string>;
    /**
     * Theia preference key written when this layout becomes active. Allows
     * other extensions to observe layout-mode changes via preference change
     * events without depending on this extension.
     */
    readonly preferenceKey: 'epi-logos.layout.active';
}

export const DAILY_0_1_DESCRIPTOR: PratibimbaLayoutDescriptor = {
    id: PRATIBIMBA_LAYOUT_DAILY_0_1,
    label: '0/1 Daily Layout',
    description:
        'First-mounted lean free-flow workspace: journal entry, agent check-in, ' +
        'lightweight cymatic placeholder (Track 12 cymatic substrate consumed at ' +
        'Track 05 T7), bridge-readiness status display. Compact OmniPanel summon.',
    expectedWidgets: [
        'pratibimba.daily.journal',
        'pratibimba.daily.agent-checkin',
        'pratibimba.daily.cymatic-placeholder',
        'pratibimba.daily.status-display',
        'pratibimba.omnipanel.shell'
    ],
    preferenceKey: 'epi-logos.layout.active'
};

export const IDE_DEEP_DESCRIPTOR: PratibimbaLayoutDescriptor = {
    id: PRATIBIMBA_LAYOUT_IDE_DEEP,
    label: 'Deep IDE Layout',
    description:
        'Summoned heavy IDE workbench: M0/M5 chrome (Bimba graph viewer, ' +
        'Canon Studio, Agentic Control Room, Bimba coordinate tree, Logos Atelier, ' +
        'evidence/review panes), six M-extension slots, two integrated-plugin slots, ' +
        'OmniPanel as canonical / command membrane. Track 05 T4+ populates the chrome.',
    expectedWidgets: [
        // M0/M5 chrome contributions — landed across T4+ tranches.
        'pratibimba.ide-shell.bimba-graph-viewer',
        'pratibimba.ide-shell.canon-studio',
        'pratibimba.ide-shell.agentic-control-room',
        'pratibimba.ide-shell.coordinate-tree',
        'pratibimba.ide-shell.logos-atelier',
        'pratibimba.ide-shell.evidence-pane',
        'pratibimba.ide-shell.review-pane',
        // Smart-connections sidebar — landed at T4.5 (gated on Track 03 T6.5).
        'pratibimba.smart-connections-sidebar',
        // OmniPanel — shared with the daily layout.
        'pratibimba.omnipanel.shell',
        // M-extension widgets — landed at T6.
        'pratibimba.m0-anuttara:graph',
        'pratibimba.m1-paramasiva:schema',
        'pratibimba.m2-parashakti:resonance',
        'pratibimba.m3-mahamaya:codon-rotation',
        'pratibimba.m4-nara:flow',
        'pratibimba.m5-epii:review'
    ],
    preferenceKey: 'epi-logos.layout.active'
};

export const ALL_LAYOUTS: ReadonlyArray<PratibimbaLayoutDescriptor> = [
    DAILY_0_1_DESCRIPTOR,
    IDE_DEEP_DESCRIPTOR
];

export function layoutById(id: PratibimbaLayoutId): PratibimbaLayoutDescriptor {
    const found = ALL_LAYOUTS.find(descriptor => descriptor.id === id);
    if (!found) {
        throw new Error(`Unknown Pratibimba layout id: ${id}`);
    }
    return found;
}
