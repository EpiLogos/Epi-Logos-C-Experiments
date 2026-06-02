import { invoke } from './invoke';

export const gatewayClient = {
  isConnected: () => invoke<boolean>('gateway_is_connected'),
  connect: () => invoke<string>('gateway_connect'),
  disconnect: () => invoke<void>('gateway_disconnect'),
  rpc: (method: string, params?: unknown) =>
    invoke<void>('gateway_rpc', { method, params: params ?? {} }),
  sendRaw: (msg: string) => invoke<void>('gateway_send_raw', { msg }),
};
