import { extractWikilinks } from './textMarkdown';

export interface NaraTraceInput {
  message: string;
  coordinate: string;
  sessionId: string;
  userId: string;
  wikilinks?: string[];
  timestamp?: string;
}

export interface ParsedNaraTrace {
  domainTag: string;
  timestamp: string;
  coordinate: string;
  sessionId: string;
  userId: string;
  message: string;
  wikilinks: string[];
}

const DOMAIN_TAG = "M4'/Nara";

export function formatNaraThoughtTrace(input: NaraTraceInput): string {
  const timestamp = input.timestamp ?? new Date().toISOString();
  const links = input.wikilinks && input.wikilinks.length > 0 ? input.wikilinks : extractWikilinks(input.message);
  const serializedLinks = links.map((link) => `[[${link}]]`).join(' ');
  const normalizedLinks = serializedLinks ? ` ${serializedLinks}` : '';

  return `[${DOMAIN_TAG}] [ts:${timestamp}] [coord:${input.coordinate}] [session:${input.sessionId}] [user:${input.userId}] ${input.message}${normalizedLinks}`;
}

export function parseNaraThoughtTrace(traceLine: string): ParsedNaraTrace {
  const match = traceLine.match(/^\[(M4'\/Nara)\]\s+\[ts:([^\]]+)\]\s+\[coord:([^\]]+)\]\s+\[session:([^\]]+)\]\s+\[user:([^\]]+)\]\s+([\s\S]*)$/);
  if (!match) {
    return {
      domainTag: DOMAIN_TAG,
      timestamp: '',
      coordinate: '',
      sessionId: '',
      userId: '',
      message: traceLine,
      wikilinks: extractWikilinks(traceLine),
    };
  }

  const messageWithLinks = match[6].trim();

  return {
    domainTag: match[1],
    timestamp: match[2],
    coordinate: match[3],
    sessionId: match[4],
    userId: match[5],
    message: messageWithLinks,
    wikilinks: extractWikilinks(messageWithLinks),
  };
}
