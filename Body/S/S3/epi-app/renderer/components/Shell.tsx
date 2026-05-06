import { useState, useEffect, useCallback } from 'react';
import { SideBar } from './SideBar';
import { OmniPanel } from './OmniPanel';
import { SlidePanel } from './SlidePanel';
import { CommandPalette } from './CommandPalette';
import { Header } from './Header';
import { DomainPlaceholder } from '../domains/DomainPlaceholder';
import { AnuttaraDomain } from '../domains/M0_Anuttara';
import { ParamasivaDomain } from '../domains/M1_Paramasiva';
import { ParashaktiDomain } from '../domains/M2_Parashakti';
import { MahamayaDomain } from '../domains/M3_Mahamaya';
import { NaraDomain } from '../domains/M4_Nara';
import { EpiiDomain } from '../domains/M5_Epii';
import { useDomainStore } from '../stores/domainStore';
import { MPRIME_DOMAINS } from '../../shared/types';
import { usePanelStore } from '../stores/panelStore';

// Subdomain view components - each domain exports its 6 inner stratum views
type SubdomainViewComponent = React.ComponentType | null;

const getSubdomainView = (domainId: string, stratum: string): SubdomainViewComponent => {
  // Dynamic import based on domain and stratum
  const domainViews: Record<string, Record<string, () => Promise<{ default: React.ComponentType }>>> = {
    m0: {
      "0'": () => import('../domains/M0_Anuttara/components/views/M0-0View.tsx').then(m => ({ default: m.M00View })),
      "1'": () => import('../domains/M0_Anuttara/components/views/M0-1View.tsx').then(m => ({ default: m.M01View })),
      "2'": () => import('../domains/M0_Anuttara/components/views/M0-2View.tsx').then(m => ({ default: m.M02View })),
      "3'": () => import('../domains/M0_Anuttara/components/views/M0-3View.tsx').then(m => ({ default: m.M03View })),
      "4'": () => import('../domains/M0_Anuttara/components/views/M0-4View.tsx').then(m => ({ default: m.M04View })),
      "5'": () => import('../domains/M0_Anuttara/components/views/M0-5View.tsx').then(m => ({ default: m.M05View })),
    },
    m1: {
      "0'": () => import('../domains/M1_Paramasiva/components/views/M1-0View.tsx').then(m => ({ default: m.M10View })),
      "1'": () => import('../domains/M1_Paramasiva/components/views/M1-1View.tsx').then(m => ({ default: m.M11View })),
      "2'": () => import('../domains/M1_Paramasiva/components/views/M1-2View.tsx').then(m => ({ default: m.M12View })),
      "3'": () => import('../domains/M1_Paramasiva/components/views/M1-3View.tsx').then(m => ({ default: m.M13View })),
      "4'": () => import('../domains/M1_Paramasiva/components/views/M1-4View.tsx').then(m => ({ default: m.M14View })),
      "5'": () => import('../domains/M1_Paramasiva/components/views/M1-5View.tsx').then(m => ({ default: m.M15View })),
    },
    m2: {
      "0'": () => import('../domains/M2_Parashakti/components/views/M2-0View.tsx').then(m => ({ default: m.M20View })),
      "1'": () => import('../domains/M2_Parashakti/components/views/M2-1View.tsx').then(m => ({ default: m.M21View })),
      "2'": () => import('../domains/M2_Parashakti/components/views/M2-2View.tsx').then(m => ({ default: m.M22View })),
      "3'": () => import('../domains/M2_Parashakti/components/views/M2-3View.tsx').then(m => ({ default: m.M23View })),
      "4'": () => import('../domains/M2_Parashakti/components/views/M2-4View.tsx').then(m => ({ default: m.M24View })),
      "5'": () => import('../domains/M2_Parashakti/components/views/M2-5View.tsx').then(m => ({ default: m.M25View })),
    },
    m3: {
      "0'": () => import('../domains/M3_Mahamaya/components/views/M3-0View.tsx').then(m => ({ default: m.M30View })),
      "1'": () => import('../domains/M3_Mahamaya/components/views/M3-1View.tsx').then(m => ({ default: m.M31View })),
      "2'": () => import('../domains/M3_Mahamaya/components/views/M3-2View.tsx').then(m => ({ default: m.M32View })),
      "3'": () => import('../domains/M3_Mahamaya/components/views/M3-3View.tsx').then(m => ({ default: m.M33View })),
      "4'": () => import('../domains/M3_Mahamaya/components/views/M3-4View.tsx').then(m => ({ default: m.M34View })),
      "5'": () => import('../domains/M3_Mahamaya/components/views/M3-5View.tsx').then(m => ({ default: m.M35View })),
    },
    m4: {
      "0'": () => import('../domains/M4_Nara/components/views/M4-0View.tsx').then(m => ({ default: m.M40View })),
      "1'": () => import('../domains/M4_Nara/components/views/M4-1View.tsx').then(m => ({ default: m.M41View })),
      "2'": () => import('../domains/M4_Nara/components/views/M4-2View.tsx').then(m => ({ default: m.M42View })),
      "3'": () => import('../domains/M4_Nara/components/views/M4-3View.tsx').then(m => ({ default: m.M43View })),
      "4'": () => import('../domains/M4_Nara/components/views/M4-4View.tsx').then(m => ({ default: m.M44View })),
      "5'": () => import('../domains/M4_Nara/components/views/M4-5View.tsx').then(m => ({ default: m.M45View })),
    },
    m5: {
      "0'": () => import('../domains/M5_Epii/components/views/M5-0View.tsx').then(m => ({ default: m.M50View })),
      "1'": () => import('../domains/M5_Epii/components/views/M5-1View.tsx').then(m => ({ default: m.M51View })),
      "2'": () => import('../domains/M5_Epii/components/views/M5-2View.tsx').then(m => ({ default: m.M52View })),
      "3'": () => import('../domains/M5_Epii/components/views/M5-3View.tsx').then(m => ({ default: m.M53View })),
      "4'": () => import('../domains/M5_Epii/components/views/M5-4View.tsx').then(m => ({ default: m.M54View })),
      "5'": () => import('../domains/M5_Epii/components/views/M5-5View.tsx').then(m => ({ default: m.M55View })),
    },
  };

  const viewGetter = domainViews[domainId]?.[stratum];
  if (!viewGetter) return null;

  // Return a lazy-loaded component wrapper
  const LazyViewWrapper = () => {
    const [ViewComponent, setViewComponent] = useState<React.ComponentType | null>(null);

    useEffect(() => {
      viewGetter().then(m => setViewComponent(() => m.default));
    }, [domainId, stratum]);

    if (!ViewComponent) return null;
    return <ViewComponent />;
  };

  return LazyViewWrapper;
};

export function Shell() {
  const { currentDomain, setDomain } = useDomainStore();
  const { activeStratum, slideMode, closeSlidePanel, nextStratum, prevStratum, directStratum } = usePanelStore();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [omniState, setOmniState] = useState<'hidden' | 'minimal' | 'fullscreen'>('hidden');

  // Get the current subdomain view component
  const SubdomainView = activeStratum && currentDomain
    ? getSubdomainView(currentDomain.id, activeStratum)
    : null;

  // Close OmniPanel
  const closeOmniPanel = useCallback(() => {
    setOmniState('hidden');
  }, []);

  // Global keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const cmdOrCtrl = e.metaKey || e.ctrlKey;
    const shift = e.shiftKey;

    // Cmd+K: Command Palette
    if (cmdOrCtrl && e.key === 'k') {
      e.preventDefault();
      setIsPaletteOpen(prev => !prev);
      return;
    }

    // Cmd+Shift+0-5: Domain switching
    if (cmdOrCtrl && shift && /^[0-5]$/.test(e.key)) {
      e.preventDefault();
      const domainIndex = parseInt(e.key);
      if (domainIndex >= 0 && domainIndex < MPRIME_DOMAINS.length) {
        setDomain(MPRIME_DOMAINS[domainIndex]);
      }
      return;
    }

    // Cmd+0-5: Direct stratum access (toggle behavior)
    if (cmdOrCtrl && !shift && /^[0-5]$/.test(e.key)) {
      e.preventDefault();
      const stratumNum = parseInt(e.key);
      directStratum(stratumNum);
      return;
    }

    // Cmd+>: Next inner stratum
    if (cmdOrCtrl && !shift && e.key === '>') {
      e.preventDefault();
      nextStratum();
      return;
    }

    // Cmd+<: Previous inner stratum
    if (cmdOrCtrl && !shift && e.key === '<') {
      e.preventDefault();
      prevStratum();
      return;
    }

    // OmniPanel Trigger: Shift + ESC (Fullscreen)
    if (e.key === 'Escape' && shift) {
      e.preventDefault();
      setOmniState(prev => prev === 'fullscreen' ? 'hidden' : 'fullscreen');
      return;
    }

    // OmniPanel Trigger: ESC (Step Down)
    if (e.key === 'Escape' && !cmdOrCtrl && !shift) {
      e.preventDefault();

      // If Palette is open, let Palette handle close
      if (isPaletteOpen) {
        setIsPaletteOpen(false);
        return;
      }

      // Logic: Fullscreen -> Minimal -> Hidden -> Minimal
      setOmniState(prev => {
        if (prev === 'fullscreen') return 'minimal';
        if (prev === 'minimal') return 'hidden';
        return 'minimal';
      });
    }
  }, [nextStratum, prevStratum, directStratum, setDomain, isPaletteOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderDomain = () => {
    switch (currentDomain.id) {
      case 'm0': return <AnuttaraDomain />;
      case 'm1': return <ParamasivaDomain />;
      case 'm2': return <ParashaktiDomain />;
      case 'm3': return <MahamayaDomain />;
      case 'm4': return <NaraDomain />;
      case 'm5': return <EpiiDomain />;
      default: return <DomainPlaceholder domain={currentDomain} />;
    }
  };

  return (
    <div
      className="h-screen w-screen bg-[var(--bg-app)] text-[var(--text-primary)] overflow-hidden font-sans relative"
      style={{
        display: 'grid',
        gridTemplateAreas: `
          "header"
          "main"
        `,
        gridTemplateColumns: '1fr',
        gridTemplateRows: '40px 1fr',
      }}
    >
      {/* Area: Header */}
      <div style={{ gridArea: 'header' }} className="relative z-40">
        <Header />
      </div>

      {/* Area: Sidebar (Fixed Strip) - DEPRECATED / REMOVED FOR NOW */}
      {/* <div style={{ gridArea: 'sidebar' }} className="relative z-30">
        <SideBar />
      </div> */}

      {/* Area: Main Viewport (Primary Space) */}
      <main
        style={{ gridArea: 'main' }}
        className="relative z-10 overflow-hidden flex flex-col"
      >
        <div
          className={`flex-1 w-full h-full relative ${currentDomain.id === 'm0'
            ? 'overflow-hidden'
            : 'overflow-auto custom-scrollbar p-0'
            }`}
        >
          {renderDomain()}
        </div>
      </main>

      {/* SlidePanel: Fixed overlay (not in grid) */}
      <SlidePanel
        isOpen={slideMode === 'open'}
        onClose={closeSlidePanel}
      >
        {SubdomainView && <SubdomainView />}
      </SlidePanel>

      {/* OmniPanel: Fixed overlay (not in grid) */}
      <OmniPanel
        state={omniState}
        onClose={closeOmniPanel}
      />

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
      />
    </div>
  );
}
