import { formatDistanceToNow } from 'date-fns';

export function shortJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function formatTs(ts: number | null | undefined): string {
  if (!ts || !Number.isFinite(ts)) return 'n/a';
  return formatDistanceToNow(new Date(ts), { addSuffix: true });
}
