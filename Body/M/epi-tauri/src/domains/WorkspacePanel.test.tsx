import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { WorkspacePanel } from './WorkspacePanel';
import { useUiStore } from '@/stores/uiStore';
import { useTemporalStore } from '@/stores/temporalStore';
import { canonicalRuntimeFixture } from '@/test/runtimeFixture';

let container: HTMLDivElement | null = null;
let root: Root | null = null;

const testGlobals = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
testGlobals.IS_REACT_ACT_ENVIRONMENT = true;

beforeEach(() => {
  useUiStore.setState({ activeWorkspace: 'MPrime' });
  useTemporalStore.setState({ runtime: canonicalRuntimeFixture() });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
  useUiStore.setState({ activeWorkspace: 'M4' });
  useTemporalStore.setState({ runtime: null });
});

describe('WorkspacePanel', () => {
  it('renders the dedicated M-prime subsystem workspace when selected', () => {
    act(() => {
      root!.render(<WorkspacePanel />);
    });

    const text = container?.textContent ?? '';
    expect(text).toContain('MPrime');
    expect(text).toContain("M' 4+2");
    expect(text).toContain('Subsystem map');
  });
});
