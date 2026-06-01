/**
 * Pratibimba IDE summon/dismiss client — Track 05 T2.
 *
 * Calls the Tauri `pratibimba_summon_ide` / `pratibimba_dismiss_ide` /
 * `pratibimba_ide_status` commands which open a second WebviewWindow loaded
 * from the `pratibimba://` custom URI scheme (browser-mode Theia in Wry).
 *
 * This is the renderer-side seam for ADR-05-002 (multi-webview persistence).
 */
import { invoke } from './invoke';

export interface PratibimbaIdeStatus {
  readonly window_open: boolean;
  readonly window_label: string;
  readonly uri: string;
  readonly bridge_shared_with_body: boolean;
}

export const summonPratibimbaIde = (): Promise<PratibimbaIdeStatus> =>
  invoke<PratibimbaIdeStatus>('pratibimba_summon_ide');

export const dismissPratibimbaIde = (): Promise<PratibimbaIdeStatus> =>
  invoke<PratibimbaIdeStatus>('pratibimba_dismiss_ide');

export const getPratibimbaIdeStatus = (): Promise<PratibimbaIdeStatus> =>
  invoke<PratibimbaIdeStatus>('pratibimba_ide_status');
