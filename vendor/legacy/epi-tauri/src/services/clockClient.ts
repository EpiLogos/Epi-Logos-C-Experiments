import { invoke } from './invoke';
import { listen } from '@tauri-apps/api/event';
import type { PortalClockState, KairosState, WalkMode } from './types';

export interface OracleCastInput {
  pp: number;
  nn: number;
  np: number;
  pn: number;
  degree: number;
  primary_hex: number;
  temporal_hex: number;
  changing_lines_mask: number;
  timestamp: number;
}

export const clockClient = {
  getState: () => invoke<PortalClockState>('clock_get_state'),
  oracleCast: (input: OracleCastInput) =>
    invoke<PortalClockState>('clock_oracle_cast', { input }),
  updateKairos: (kairos: KairosState) =>
    invoke<PortalClockState>('clock_update_kairos', { kairos }),
  updateQuintessence: (profiles: number[][]) =>
    invoke<PortalClockState>('clock_update_quintessence', { profiles }),
  getWalkMode: () => invoke<WalkMode>('clock_get_walk_mode'),
  getBifurcation: () => invoke<[number, number]>('clock_get_bifurcation'),
  onStateChange: (cb: (s: PortalClockState) => void) =>
    listen<PortalClockState>('clock:state', (e) => cb(e.payload)),
  onOracleCast: (cb: (s: PortalClockState) => void) =>
    listen<PortalClockState>('clock:oracle_cast', (e) => cb(e.payload)),
};
