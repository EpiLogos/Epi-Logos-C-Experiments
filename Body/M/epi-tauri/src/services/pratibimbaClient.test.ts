import { describe, it, expect, vi, beforeEach } from 'vitest';

const invokeMock = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({
  invoke: (...args: unknown[]) => invokeMock(...args),
}));

import {
  summonPratibimbaIde,
  dismissPratibimbaIde,
  getPratibimbaIdeStatus,
} from './pratibimbaClient';

describe('pratibimbaClient', () => {
  beforeEach(() => {
    invokeMock.mockReset();
  });

  it('summonPratibimbaIde invokes pratibimba_summon_ide and returns the typed status', async () => {
    invokeMock.mockResolvedValueOnce({
      window_open: true,
      window_label: 'pratibimba-ide',
      uri: 'pratibimba://localhost/index.html',
      bridge_shared_with_body: true,
    });
    const status = await summonPratibimbaIde();
    expect(invokeMock).toHaveBeenCalledWith('pratibimba_summon_ide', undefined);
    expect(status.window_open).toBe(true);
    expect(status.window_label).toBe('pratibimba-ide');
    expect(status.uri).toContain('pratibimba://');
    expect(status.bridge_shared_with_body).toBe(true);
  });

  it('dismissPratibimbaIde invokes pratibimba_dismiss_ide and returns closed status', async () => {
    invokeMock.mockResolvedValueOnce({
      window_open: false,
      window_label: 'pratibimba-ide',
      uri: '',
      bridge_shared_with_body: true,
    });
    const status = await dismissPratibimbaIde();
    expect(invokeMock).toHaveBeenCalledWith('pratibimba_dismiss_ide', undefined);
    expect(status.window_open).toBe(false);
    expect(status.uri).toBe('');
  });

  it('getPratibimbaIdeStatus invokes pratibimba_ide_status', async () => {
    invokeMock.mockResolvedValueOnce({
      window_open: false,
      window_label: 'pratibimba-ide',
      uri: '',
      bridge_shared_with_body: true,
    });
    const status = await getPratibimbaIdeStatus();
    expect(invokeMock).toHaveBeenCalledWith('pratibimba_ide_status', undefined);
    expect(status.window_label).toBe('pratibimba-ide');
  });

  it('summonPratibimbaIde surfaces AppError-shaped failures', async () => {
    invokeMock.mockRejectedValueOnce({ kind: 'io', message: 'webview build failed' });
    await expect(summonPratibimbaIde()).rejects.toMatchObject({
      kind: 'io',
      message: 'webview build failed',
    });
  });
});
