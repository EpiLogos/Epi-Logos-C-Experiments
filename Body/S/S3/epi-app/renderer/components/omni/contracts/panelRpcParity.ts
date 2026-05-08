export type GatewayPanelId =
  | 'chat'
  | 'workspace'
  | 'models'
  | 'overview'
  | 'channels'
  | 'instances'
  | 'sessions'
  | 'cron'
  | 'skills'
  | 'nodes'
  | 'config'
  | 'debug'
  | 'logs'
  | 'settings';

export type PanelParityContract = {
  required: string[];
  optional?: string[];
  events?: string[];
};

export const PANEL_RPC_PARITY: Record<GatewayPanelId, PanelParityContract> = {
  chat: {
    required: ['chat.history', 'chat.send', 'chat.abort'],
    events: ['chat', 'chat.delta', 'chat.final', 'chat.error', 'chat.aborted'],
  },
  workspace: {
    required: ['config.get', 'config.set', 'config.apply', 'skills.status', 'skills.update', 'cron.list', 'cron.add', 'cron.update'],
    optional: ['config.schema', 'skills.install', 'cron.status', 'cron.run', 'cron.remove', 'cron.runs', 'status.summary'],
  },
  models: {
    required: ['config.get', 'config.set', 'config.apply'],
    optional: ['config.schema'],
  },
  overview: {
    required: ['status.summary'],
    optional: ['health.snapshot'],
  },
  channels: {
    required: ['channels.status', 'web.login.start', 'web.login.wait', 'channels.logout'],
  },
  instances: {
    required: ['presence.list'],
  },
  sessions: {
    required: [
      'sessions.list',
      'sessions.resolve',
      'sessions.preview',
      'sessions.patch',
      'sessions.reset',
      'sessions.delete',
      'sessions.compact',
      'sessions.fork',
      'sessions.resume',
      'sessions.import',
      'sessions.tree',
    ],
  },
  cron: {
    required: ['cron.status', 'cron.list', 'cron.add', 'cron.update', 'cron.run', 'cron.remove', 'cron.runs'],
  },
  skills: {
    required: ['skills.status', 'skills.update', 'skills.install'],
  },
  nodes: {
    required: [
      'node.list',
      'device.pair.list',
      'device.pair.approve',
      'device.pair.reject',
      'device.token.rotate',
      'device.token.revoke',
    ],
  },
  config: {
    required: ['config.get', 'config.schema', 'config.set', 'config.apply', 'update.run'],
  },
  debug: {
    required: ['status.summary', 'health.snapshot'],
  },
  logs: {
    required: ['logs.tail'],
  },
  settings: {
    required: [],
    optional: ['status.summary'],
  },
};
