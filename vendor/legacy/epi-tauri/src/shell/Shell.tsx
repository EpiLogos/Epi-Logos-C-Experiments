import { useEffect, useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useUiStore } from '@/stores/uiStore';
import { HOTKEYS, matchesHotkey } from '@/utils/hotkeys';
import { ClockCosmos } from '@/domains/ClockCosmos';
import { WorkspacePanel } from '@/domains/WorkspacePanel';
import { OmniPanel } from '@/components/OmniPanel';
import { CommandPalette } from '@/components/CommandPalette';

export function Shell() {
  const {
    omniPanelOpen,
    commandPaletteOpen,
    toggleOmniPanel,
    setWorkspace,
    toggleDimension,
    setCommandPaletteOpen,
    setBranchLens,
  } = useUiStore();

  const handleHotkey = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        if (e.key !== 'Escape') return;
      }

      for (const binding of HOTKEYS) {
        if (!matchesHotkey(e, binding)) continue;
        e.preventDefault();
        switch (binding.action) {
          case 'toggle_omni_panel':
            toggleOmniPanel();
            break;
          case 'workspace_m0':
            setWorkspace('M0');
            break;
          case 'workspace_m4':
            setWorkspace('M4');
            break;
          case 'workspace_m5':
            setWorkspace('M5');
            break;
          case 'workspace_mprime':
            setWorkspace('MPrime');
            break;
          case 'open_command_palette':
            setCommandPaletteOpen(true);
            break;
          case 'toggle_dimension':
            toggleDimension();
            break;
          case 'branch_lens_0':
          case 'branch_lens_1':
          case 'branch_lens_2':
          case 'branch_lens_3':
          case 'branch_lens_4':
          case 'branch_lens_5':
            setBranchLens(Number(binding.action.slice(-1)));
            break;
        }
        return;
      }
    },
    [toggleOmniPanel, setWorkspace, toggleDimension, setCommandPaletteOpen, setBranchLens],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleHotkey);
    return () => window.removeEventListener('keydown', handleHotkey);
  }, [handleHotkey]);

  return (
    <div className="flex h-screen w-screen flex-col bg-black text-white overflow-hidden">
      <PanelGroup direction="horizontal" className="flex-1">
        <Panel defaultSize={25} minSize={15} maxSize={40}>
          <ClockCosmos />
        </Panel>
        <PanelResizeHandle className="w-1 bg-neutral-800 hover:bg-neutral-600 transition-colors" />
        <Panel defaultSize={75} minSize={40}>
          <WorkspacePanel />
        </Panel>
      </PanelGroup>

      {omniPanelOpen && <OmniPanel />}
      {commandPaletteOpen && <CommandPalette />}
    </div>
  );
}
