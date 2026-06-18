import * as React from 'react';
import type { CommandRegistry } from '@theia/core/lib/common/command';
import {
    QlStructureProjection,
    readM0QlStructureProjection
} from '../../common/m0-inspector';

export { readM0QlStructureProjection };

/**
 * Deep-link intent fired when the reader opens the selected coordinate in the
 * shared M0-M5 Coordinate Tree. The QL-structure reader NEVER duplicates the tree
 * widget itself; it routes through the cross-layout-intent membrane so the
 * `ide-shell-m0-m5` owner reveals and focuses its own `coordinateTree`
 * contribution.
 */
export interface M0QlStructureTreeIntent {
    readonly requestedExtensionId: 'ide-shell-m0-m5';
    readonly requestedContributionId: 'coordinateTree';
    readonly coordinate: string;
    readonly source: 'm0-anuttara:ql-structure-layer-panel';
}

export interface QlStructureLayerPanelProps {
    readonly projection: QlStructureProjection;
    readonly coordinate: string | null;
    readonly commands?: Pick<CommandRegistry, 'executeCommand'>;
}

/** Build the cross-layout-intent payload for the Coordinate Tree deep-link. */
export function buildM0QlStructureTreeIntent(coordinate: string): M0QlStructureTreeIntent {
    return Object.freeze({
        requestedExtensionId: 'ide-shell-m0-m5',
        requestedContributionId: 'coordinateTree',
        coordinate,
        source: 'm0-anuttara:ql-structure-layer-panel'
    });
}

function positionLabel(position: QlStructureProjection['position']): string {
    return position === null ? 'Canonical-absent QL position' : `#${position}`;
}

function mirrorLabel(mirror: QlStructureProjection['mirror']): string {
    const child = mirror.child ?? '—';
    const inverse = mirror.inverse ?? '—';
    return `child ${child} / inverse ${inverse}`;
}

function anchoredLabel(anchoredTo: QlStructureProjection['anchoredTo']): string {
    return anchoredTo.length ? anchoredTo.join(' · ') : 'No structural ANCHORED_TO edges';
}

export function QlStructureLayerPanel(props: QlStructureLayerPanelProps): React.ReactElement {
    const { projection, coordinate, commands } = props;

    const openCoordinateTree = React.useCallback(() => {
        if (!coordinate) {
            return;
        }
        void commands?.executeCommand(
            'omnipanel.intent.dispatch',
            buildM0QlStructureTreeIntent(coordinate)
        );
    }, [commands, coordinate]);

    return (
        <section
            className="mext-widget-detail m0-ql-structure-layer-panel"
            data-widget-id="pratibimba.m0-anuttara:ql-structure-layer-panel"
            data-provenance-state={projection.state}
            aria-label="QL-structure layer reader"
        >
            <h3>QL structure (M0-1')</h3>
            <dl className="m0-ql-structure-layer-fields">
                <dt>QL position</dt>
                <dd
                    data-ql-field-key="c_1_ql_position"
                    data-ql-position={projection.position ?? ''}
                    data-provenance-state={projection.state}
                >
                    {positionLabel(projection.position)}
                </dd>
                <dt>QL variant</dt>
                <dd
                    data-ql-field-key="c_1_ql_variant"
                    data-provenance-state={projection.qlVariant ? projection.state : 'canonical_absent'}
                >
                    {projection.qlVariant ?? 'Canonical-absent QL variant'}
                </dd>
                <dt>Family contains (parent)</dt>
                <dd
                    data-ql-field-key="FAMILY_CONTAINS"
                    data-provenance-state={
                        projection.familyContainsParent ? 'canonical' : 'canonical_absent'
                    }
                >
                    {projection.familyContainsParent ?? 'No structural FAMILY_CONTAINS parent edge'}
                </dd>
                <dt>Mirror children</dt>
                <dd
                    data-ql-field-key="MIRROR_CHILDREN"
                    data-provenance-state={
                        projection.mirror.child || projection.mirror.inverse
                            ? 'canonical'
                            : 'canonical_absent'
                    }
                >
                    {mirrorLabel(projection.mirror)}
                </dd>
                <dt>Anchored to</dt>
                <dd
                    data-ql-field-key="ANCHORED_TO"
                    data-provenance-state={
                        projection.anchoredTo.length ? 'canonical' : 'canonical_absent'
                    }
                >
                    {anchoredLabel(projection.anchoredTo)}
                </dd>
            </dl>
            <div className="m0-ql-structure-layer-deep-link">
                <button
                    type="button"
                    data-contribution-id="coordinateTree"
                    disabled={!coordinate}
                    onClick={openCoordinateTree}
                >
                    Open in Coordinate Tree
                </button>
            </div>
        </section>
    );
}

export default QlStructureLayerPanel;
