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
     * Explicit non-factory layout claims. Use only for descriptor entries that
     * intentionally name a layout/intent slot rather than a Theia WidgetFactory
     * id; every other expected widget must resolve to a registered factory.
     */
    readonly layoutOnlyWidgets?: Readonly<Record<string, string>>;
    /**
     * Theia preference key written when this layout becomes active. Allows
     * other extensions to observe layout-mode changes via preference change
     * events without depending on this extension.
     */
    readonly preferenceKey: 'epi-logos.layout.active';
}

/**
 * Canonical daily-0-1 widget ids as a typed tuple. Single source of truth for
 * both `DAILY_0_1_DESCRIPTOR.expectedWidgets` and the (0/1) side partition
 * (`DAILY_0_1_FACE_OF` below). Keeping one tuple means the compile-time
 * exhaustiveness check on the face map cannot drift from the descriptor.
 */
export const DAILY_0_1_WIDGET_IDS = [
    'pratibimba.daily.journal',
    'pratibimba.daily.agent-checkin',
    'pratibimba.daily.cymatic-placeholder',
    'pratibimba.daily.status-display',
    'pratibimba.omnipanel.shell'
] as const;

export type Daily01WidgetId = typeof DAILY_0_1_WIDGET_IDS[number];

export const DAILY_0_1_DESCRIPTOR: PratibimbaLayoutDescriptor = {
    id: PRATIBIMBA_LAYOUT_DAILY_0_1,
    label: '0/1 Daily Layout',
    description:
        'First-mounted lean free-flow workspace: journal entry, agent check-in, ' +
        'lightweight cymatic placeholder (Track 12 cymatic substrate consumed at ' +
        'Track 05 T7), bridge-readiness status display. Compact OmniPanel summon.',
    expectedWidgets: [...DAILY_0_1_WIDGET_IDS],
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
        'pratibimba.ide-shell.autoresearch-pane',
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
    layoutOnlyWidgets: {
        'pratibimba.m0-anuttara:graph': 'layout-only intent slot; factory id is m0.anuttara.languageMap',
        'pratibimba.m1-paramasiva:schema': 'layout-only intent slot; factory id is m1.paramasiva.clockInstrument',
        'pratibimba.m2-parashakti:resonance': 'layout-only intent slot; factory id is m2.parashakti.meaningPacket',
        'pratibimba.m3-mahamaya:codon-rotation': 'layout-only intent slot; factory id is m3.mahamaya.cosmicWheel',
        'pratibimba.m4-nara:flow': 'layout-only intent slot; factory id is m4.nara.dayContainer',
        'pratibimba.m5-epii:review': 'layout-only intent slot; factory id is m5.epii.reviewQueue'
    },
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

// ============================================================================
// The (0/1) side partition — DR-TS-1 structural reading (clarification, not
// contradiction).
//
// Per `M'-SYSTEM-SPEC` §"Canonical 0/1/4+2 Layout Discipline", `daily-0-1` is
// ONE shell with two faces, not two layouts:
//
//   0-side (cosmic)   = lean parent preview of the M1'-M3' structural /
//                       cymatic-clock outputs (graph view + clock-wheel + cymatic).
//   1-side (personal) = lean parent preview of the M4'/M5'/M0' lived-return
//                       (journal entry + agent check-in).
//   /  (membrane)     = the OmniPanel command surface + bridge-readiness, the
//                       S0' operator membrane that cross-cuts BOTH faces. It is
//                       not a side — it is `#` itself, present over either pole.
//
// The 0/1 toggle is `#` (the inversion act) applied to the user's context: the
// SAME `daily-0-1` layout seen from opposite faces. There is no third layout and
// no separate toggle-widget extension. `ide-deep` is the distinct 4+2 depth
// surface; `daily-0-1` is the 0/1 shell. The toggle lives inside `daily-0-1`.
// Cross-links DR-M4-2 clause 5 (0 cosmic / 1 personal — same polarity all the
// way down).
//
// The `Record<Daily01WidgetId, DailyShellFace>` below makes the partition
// build-enforced: `tsc` fails if any daily widget is unassigned or an unknown
// id is assigned, so "partitions cleanly into 0-side / 1-side renderings" is a
// compile-time invariant, not a convention.
// ============================================================================

/** The face of the (0/1) daily shell a widget renders on. */
export type DailyShellFace = '0-cosmic' | '1-personal' | 'operator-membrane';

/**
 * Exhaustive, disjoint assignment of every `daily-0-1` widget to one face.
 * Keyed on the full `Daily01WidgetId` union, so the compiler rejects any
 * missing or extraneous id — this IS the clean-partition guarantee.
 */
export const DAILY_0_1_FACE_OF: Readonly<Record<Daily01WidgetId, DailyShellFace>> = {
    // 0-side: cosmic structural / cymatic-clock preview (M1'-M3').
    'pratibimba.daily.cymatic-placeholder': '0-cosmic',
    // 1-side: personal lived-return preview (M4'/M5'/M0').
    'pratibimba.daily.journal': '1-personal',
    'pratibimba.daily.agent-checkin': '1-personal',
    // / membrane: OmniPanel + bridge-readiness, cross-cutting both faces.
    'pratibimba.omnipanel.shell': 'operator-membrane',
    'pratibimba.daily.status-display': 'operator-membrane'
};

/** The widget ids of the `daily-0-1` shell grouped by face. */
export interface DailyShellPartition {
    /** 0-side — cosmic structural / cymatic-clock preview. */
    readonly cosmic: ReadonlyArray<Daily01WidgetId>;
    /** 1-side — personal lived-return preview. */
    readonly personal: ReadonlyArray<Daily01WidgetId>;
    /** `/` — OmniPanel + readiness operator membrane, present on both faces. */
    readonly membrane: ReadonlyArray<Daily01WidgetId>;
}

/**
 * Partition the `daily-0-1` widgets into their (0/1) faces + operator membrane.
 * `cosmic ∪ personal ∪ membrane` is exactly `DAILY_0_1_WIDGET_IDS`, disjoint.
 */
export function partitionDailyWidgets(): DailyShellPartition {
    const cosmic: Daily01WidgetId[] = [];
    const personal: Daily01WidgetId[] = [];
    const membrane: Daily01WidgetId[] = [];
    for (const id of DAILY_0_1_WIDGET_IDS) {
        switch (DAILY_0_1_FACE_OF[id]) {
            case '0-cosmic':
                cosmic.push(id);
                break;
            case '1-personal':
                personal.push(id);
                break;
            case 'operator-membrane':
                membrane.push(id);
                break;
        }
    }
    return { cosmic, personal, membrane };
}

/**
 * The widgets rendered for one side of the (0/1) toggle. The operator membrane
 * (`/`) is included on BOTH sides because the OmniPanel + readiness surface
 * cross-cut the toggle — they are `#` itself, not a pole of it.
 */
export function dailyWidgetsForSide(side: '0-cosmic' | '1-personal'): ReadonlyArray<Daily01WidgetId> {
    const { cosmic, personal, membrane } = partitionDailyWidgets();
    const sideWidgets = side === '0-cosmic' ? cosmic : personal;
    return [...sideWidgets, ...membrane];
}
