import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { M0LayerRail } from './M0LayerRail';
import { useCoordinateStore } from '../state/stores';

describe('M0LayerRail', () => {
    beforeEach(() => {
        useCoordinateStore.setState({ selected: null });
    });

    afterEach(() => {
        cleanup();
    });

    it('renders all six layers and discriminates local from bridged', () => {
        render(<M0LayerRail />);
        for (const key of [
            'language',
            'ql-structure',
            'relations',
            'time-community',
            'personal',
            'pedagogy'
        ]) {
            expect(screen.getByTestId(`m0-layer-${key}`)).toBeTruthy();
        }
        expect(screen.getByTestId('m0-layer-language').tagName).toBe('BUTTON');
        expect(screen.getByTestId('m0-layer-personal').tagName).toBe('A');
    });

    it('starts on the language layer and switches the active local layer on click', async () => {
        render(<M0LayerRail />);
        expect(screen.getByTestId('m0-layer-language').getAttribute('data-active')).toBe('true');
        await act(async () => {
            screen.getByTestId('m0-layer-relations').click();
        });
        expect(screen.getByTestId('m0-layer-relations').getAttribute('data-active')).toBe('true');
        expect(screen.getByTestId('m0-layer-language').getAttribute('data-active')).toBe('false');
    });

    it('bridged layers carry the deep-link for the selected coordinate and follow the store', async () => {
        useCoordinateStore.setState({ selected: 'M4-4-4' });
        render(<M0LayerRail />);
        expect(screen.getByTestId('m0-layer-personal').getAttribute('href')).toBe(
            'epi-logos://ide/m4-nara/artifact?coordinate=M4-4-4&source=m0-anuttara'
        );
        expect(screen.getByTestId('m0-layer-pedagogy').getAttribute('href')).toBe(
            'epi-logos://ide/m5-epii/review?coordinate=M4-4-4&source=m0-anuttara'
        );
        await act(async () => {
            useCoordinateStore.getState().setSelected("M0-1'");
        });
        expect(screen.getByTestId('m0-layer-personal').getAttribute('href')).toBe(
            "epi-logos://ide/m4-nara/artifact?coordinate=M0-1'&source=m0-anuttara"
        );
    });
});
