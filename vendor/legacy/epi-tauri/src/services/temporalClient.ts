import { invoke } from './invoke';
import { listen } from '@tauri-apps/api/event';
import type { PortalRuntimeState, KairosState } from './types';

export const temporalClient = {
  getRuntime: () => invoke<PortalRuntimeState>('temporal_get_runtime'),
  setDayId: (dayId: string) => invoke<void>('temporal_set_day_id', { dayId }),
  setNowPath: (nowPath: string) => invoke<void>('temporal_set_now_path', { nowPath }),
  onRuntime: (cb: (s: PortalRuntimeState) => void) =>
    listen<PortalRuntimeState>('temporal:runtime', (e) => cb(e.payload)),
  onKairos: (cb: (k: KairosState) => void) =>
    listen<KairosState>('temporal:kairos', (e) => cb(e.payload)),
};
