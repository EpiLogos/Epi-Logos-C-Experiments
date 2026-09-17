/**
 * M1 Paramasiva — Coordinate Tree contribution (Track 22.11).
 *
 * Declares the M1 sub-tree manifest consumed by the `ide-shell-m0-m5`
 * Coordinate Tree widget (see 15.3, left-sidebar activity-bar). The
 * Coordinate Tree widget itself lives in the `ide-shell-m0-m5` host package
 * (`coordinate-tree-widget.tsx`); this file lands only the M1 manifest entry.
 * The host consumes it through Theia DI and renders the M1 internal coordinate
 * structure as walkable child nodes.
 *
 * The node shape is a superset of the host's `CoordinateNode`
 * (`coordinate` + optional `label` + optional `children`), adding a
 * `deepLink` URI per node. Clicking a child node deep-links via
 * `epi-logos://ide/m1-paramasiva/walk?coordinate=...` into the matching
 * `m1-paramasiva` view body — or, for M1-5', into the
 * `m1-paramasiva-played-torus` widget which owns the K² + Hopf 3D surface —
 * with the appropriate query parameters (active matrix family, scrub-to-tick,
 * view selector).
 *
 * This module is intentionally free of Theia/React imports so it remains a
 * pure data manifest: requireable from compiled `lib/` by host integration
 * tests and consumable by DI without dragging in the browser runtime.
 */

/**
 * A single walkable node in a coordinate sub-tree. Mirrors the host
 * `CoordinateNode` (coordinate + label + children) and adds a `deepLink`
 * URI the Coordinate Tree widget routes on click.
 */
export interface CoordinateTreeNode {
    /** Canonical coordinate string, e.g. `M1-2'` or `M1-2'/Bimba`. */
    readonly coordinate: string;
    /** Human-readable label rendered next to the coordinate. */
    readonly label: string;
    /**
     * `epi-logos://` deep link routed when the node is clicked. Coordinate and
     * path separators are percent-encoded (`'` → `%27`, `/` → `%2F`) so the
     * URI is well-formed; the host decodes them back to the bare coordinate.
     */
    readonly deepLink: string;
    /** Optional child stratum nodes. */
    readonly children?: readonly CoordinateTreeNode[];
}

/**
 * A coordinate-tree manifest contributed by an M-extension and consumed by the
 * `ide-shell-m0-m5` Coordinate Tree host widget.
 */
export interface CoordinateTreeContribution {
    /** Root coordinate this contribution declares a sub-tree under. */
    readonly rootCoordinate: string;
    /** Top-level strata under the root. */
    readonly children: readonly CoordinateTreeNode[];
}

export const M1_COORDINATE_TREE_CONTRIBUTION: CoordinateTreeContribution = Object.freeze({
    rootCoordinate: 'M1',
    children: Object.freeze([
        {
            coordinate: 'M1-0\'',
            label: 'Canonical Source (M1-0\')',
            deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-0%27'
        },
        {
            coordinate: 'M1-1\'',
            label: 'Instance Manager (M1-1\')',
            deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-1%27'
        },
        {
            coordinate: 'M1-2\'',
            label: 'Harmonic Engine — Ananda Vortex (M1-2\')',
            deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-2%27&view=vortexMatricesBrowser',
            children: Object.freeze([
                {
                    coordinate: 'M1-2\'/Bimba',
                    label: 'Bimba matrix family (#X+0)',
                    deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-2%27%2FBimba&view=vortexMatricesBrowser&family=0'
                },
                {
                    coordinate: 'M1-2\'/Pratibimba',
                    label: 'Pratibimba matrix family (#X+1)',
                    deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-2%27%2FPratibimba&view=vortexMatricesBrowser&family=1'
                },
                {
                    coordinate: 'M1-2\'/Sum',
                    label: 'Sum matrix family',
                    deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-2%27%2FSum&view=vortexMatricesBrowser&family=2'
                },
                {
                    coordinate: 'M1-2\'/DiffA',
                    label: 'DiffA matrix family',
                    deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-2%27%2FDiffA&view=vortexMatricesBrowser&family=3'
                },
                {
                    coordinate: 'M1-2\'/DiffB',
                    label: 'DiffB matrix family',
                    deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-2%27%2FDiffB&view=vortexMatricesBrowser&family=4'
                },
                {
                    coordinate: 'M1-2\'/Quintessence',
                    label: 'Quintessence (rule/tuple)',
                    deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-2%27%2FQuintessence&view=vortexMatricesBrowser&family=5'
                }
            ])
        },
        {
            coordinate: 'M1-3\'',
            label: 'Spanda Core — 12-tick phase (M1-3\')',
            deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-3%27',
            children: Object.freeze(
                Array.from({ length: 12 }, (_, t) => ({
                    coordinate: `M1-3'/tick-${t}`,
                    label: `Tick ${t} (${t * 30}° SO(3))`,
                    deepLink: `epi-logos://ide/m1-paramasiva/walk?coordinate=M1-3%27%2Ftick-${t}&scrubTo=${t}`
                }))
            )
        },
        {
            coordinate: 'M1-4\'',
            label: 'QL Flowering — 84-state landscape (M1-4\')',
            deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-4%27'
        },
        {
            coordinate: 'M1-5\'',
            label: 'Topology Analyzer — K² + Hopf (M1-5\')',
            deepLink: 'epi-logos://ide/m1-paramasiva-played-torus/k2',
            children: Object.freeze([
                {
                    coordinate: 'M1-5\'/TORUS_GENUS',
                    label: 'TORUS_GENUS = 1',
                    deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-5%27%2FTORUS_GENUS'
                },
                {
                    coordinate: 'M1-5\'/DOUBLE_COVER_DEG',
                    label: 'DOUBLE_COVER_DEG = 720',
                    deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-5%27%2FDOUBLE_COVER_DEG'
                },
                {
                    coordinate: 'M1-5\'/RING_QUATERNION_LUT',
                    label: 'RING_QUATERNION_LUT[12]',
                    deepLink: 'epi-logos://ide/m1-paramasiva/walk?coordinate=M1-5%27%2FRING_QUATERNION_LUT'
                }
            ])
        }
    ])
});
