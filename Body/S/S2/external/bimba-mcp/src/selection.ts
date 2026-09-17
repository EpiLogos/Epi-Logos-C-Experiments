import { readFile } from 'node:fs/promises';
import { BimbaRequestError } from './application/contracts.js';

const SELECTION_SCHEMA = 'aikit.bimba-map-mcp/v1';

interface SelectionRecord {
  schema?: unknown;
  selected?: unknown;
}

/**
 * Enforce the machine's AIKit Bimba selection when a harness configured it.
 * Direct Bimba use remains possible when no selection-state path is supplied.
 */
export async function requireSelectedMap(): Promise<void> {
  const statePath = process.env['BIMBA_MCP_SELECTION_STATE'];
  if (!statePath) return;

  try {
    const state = JSON.parse(await readFile(statePath, 'utf8')) as SelectionRecord;
    if (state.schema === SELECTION_SCHEMA && state.selected === true) return;
  } catch {
    // An absent, malformed, or unreadable selection record never grants access.
  }

  throw new BimbaRequestError('Bimba map is not selected');
}
