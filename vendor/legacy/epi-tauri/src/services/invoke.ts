import { invoke as tauriInvoke } from '@tauri-apps/api/core';

export interface AppError {
  kind: string;
  message: string;
}

export async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await tauriInvoke<T>(cmd, args);
  } catch (e) {
    throw normalizeError(e);
  }
}

function normalizeError(e: unknown): AppError {
  if (typeof e === 'object' && e !== null && 'kind' in e && 'message' in e) {
    return e as AppError;
  }
  if (typeof e === 'string') {
    return { kind: 'unknown', message: e };
  }
  return { kind: 'unknown', message: String(e) };
}
