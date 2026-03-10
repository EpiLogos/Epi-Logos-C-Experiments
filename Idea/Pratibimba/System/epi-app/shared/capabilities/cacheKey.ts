export interface TraceCacheKeyInput {
  domainTag: string;
  coordinate: string;
  temporalWindow: 'hour' | 'day' | 'week' | 'month';
  sessionId: string;
  userId: string;
}

function sanitizeToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\[|\]|'/g, '')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateTraceCacheKey(input: TraceCacheKeyInput): string {
  return [
    'trace',
    sanitizeToken(input.domainTag),
    sanitizeToken(input.coordinate),
    sanitizeToken(input.temporalWindow),
    sanitizeToken(input.sessionId),
    sanitizeToken(input.userId),
  ].join(':');
}
