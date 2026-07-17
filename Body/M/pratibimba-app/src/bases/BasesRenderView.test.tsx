/**
 * Coordinate: M' C5/CS Bases carrier interaction proof (48.T48.6).
 * Actualises: all four render modes and row selection through the shared
 * coordinate store used by sibling panels.
 * Does NOT own: gateway reads or graph mutation.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useCoordinateStore } from '../state/stores';
import { BasesRenderView } from './BasesRenderView';
import { BaseViewConfig, BasesViewMode, basesModelFromRecords } from './basesViewModel';

const RECORDS = [
    { coordinate: 'M2-1', title: 'MEF Root', c_4_artifact_role: 'map-index', image: 'https://example.invalid/m2.png' },
    { coordinate: 'M2-1-0', title: 'Lens Zero', c_4_artifact_role: 'map-index' }
];

function model(view: BasesViewMode) {
    const config: BaseViewConfig = {
        source: 'static',
        coordinateScope: '',
        filter: [],
        view,
        columns: ['coordinate', 'title', 'c_4_artifact_role'],
        image: 'image'
    };
    return basesModelFromRecords(RECORDS, config);
}

afterEach(() => {
    cleanup();
    useCoordinateStore.getState().setSelected(null);
});

describe('BasesRenderView', () => {
    for (const view of ['table', 'cards', 'list', 'image'] as const) {
        it(`renders ${view} mode`, () => {
            render(<BasesRenderView model={model(view)} selectedCoordinate={null} onSelect={() => undefined} />);
            expect(screen.getByTestId(`bases-view-${view}`)).toBeTruthy();
            expect(screen.getByText('MEF Root')).toBeTruthy();
        });
    }

    it('publishes row selection to the shared coordinate store and cross-filters a sibling model', () => {
        render(
            <BasesRenderView
                model={model('table')}
                selectedCoordinate={null}
                onSelect={coordinate => useCoordinateStore.getState().setSelected(coordinate)}
            />
        );

        fireEvent.click(screen.getByTestId('bases-row-M2-1'));
        const selected = useCoordinateStore.getState().selected;
        expect(selected).toBe('M2-1');
        expect(basesModelFromRecords(RECORDS, {
            source: 'static',
            coordinateScope: selected ?? '',
            filter: [],
            view: 'list',
            columns: ['coordinate']
        }).rowCount).toBe(2);
    });
});
