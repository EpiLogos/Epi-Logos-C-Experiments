import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { MPrimeSubsystemPage } from './MPrimeSubsystemPage';
import { canonicalRuntimeFixture } from '@/test/runtimeFixture';

let container: HTMLDivElement | null = null;
let root: Root | null = null;

const testGlobals = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
testGlobals.IS_REACT_ACT_ENVIRONMENT = true;

function renderPage(runtime = canonicalRuntimeFixture()) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root!.render(<MPrimeSubsystemPage runtime={runtime} />);
  });
  return container;
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

describe('MPrimeSubsystemPage', () => {
  it('renders all six 4+2 subsystem areas from the canonical runtime profile fixture', () => {
    const page = renderPage();
    const text = page.textContent ?? '';

    expect(text).toContain("M0'");
    expect(text).toContain('Anuttara');
    expect(text).toContain("M1'");
    expect(text).toContain('QL musical derivation');
    expect(text).toContain("M2'");
    expect(text).toContain('Vimarsha');
    expect(text).toContain("M3'");
    expect(text).toContain('Mahamaya');
    expect(text).toContain("M4'");
    expect(text).toContain('Nara');
    expect(text).toContain("M5'");
    expect(text).toContain('Epii');
    expect(text).toContain('MPrime');
    expect(text).toContain('Operational field');
    expect(text).toContain('Integrative poles');
  });

  it('highlights active tick, lens, and mode while reading M2 and M3 directly from the fixture', () => {
    const page = renderPage();
    const text = page.textContent ?? '';

    expect(text).toContain('Tick 10');
    expect(text).toContain("Lens L4'");
    expect(text).toContain('Mode Aeolian');
    expect(text).toContain('110 Hz');
    expect(text).toContain('220 Hz');
    expect(text).toContain('7:8');
    expect(text).toContain('5:6');
    expect(text).toContain('GCT');
    expect(text).toContain('surface 421');
    expect(text).toContain('225 deg');
  });

  it('shows only safe M4 resonance context and keeps M5 conversational-agentic', () => {
    const page = renderPage();
    const text = page.textContent ?? '';

    expect(text).toContain('0.84 resonance');
    expect(text).toContain('Major');
    expect(text).toContain('Ask Epii');
    expect(text).toContain('teach');
    expect(text).toContain('review');
    expect(text).not.toContain('qPersonal');
    expect(text).not.toContain('identityHash');
    expect(text).not.toContain('natalChartHandle');
    expect(text).not.toContain('rawBody');
    expect(text).not.toContain('journalBody');
  });

  it('shows an honest unavailable state when runtime data is missing', () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root!.render(<MPrimeSubsystemPage runtime={null} />);
    });

    const text = container.textContent ?? '';
    expect(text).toContain('Subsystem page unavailable');
    expect(text).toContain('shared temporal kernel projection');
  });
});
