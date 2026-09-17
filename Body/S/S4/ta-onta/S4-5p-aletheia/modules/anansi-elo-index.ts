// aletheia/modules/anansi-elo-index.ts
//
// Anansi — coordinate-conditional rating index for the Mercurius Elo layer.
// Pure data structure helpers: no I/O, no global state.

export type EloChannel = "R_verifier" | "R_lens" | "R_user";

export interface EloContextTuple {
  vak_cp_position: string;
  mef_lens: string;
  content_class: string;
  kairos_window: string;
  cfp_thread_type: string;
  r_factor_slot: string;
}

export interface EloRatingIdentity {
  agent: string;
  model: string;
  harness: string;
  skill: string;
}

export interface EloRatingRecord extends EloRatingIdentity {
  context_tuple: EloContextTuple;
  channel: EloChannel;
  rating: number;
  sigma: number;
  trial_count: number;
  updated_at?: string;
  source_trial_id?: string;
}

export interface AnansiRatingIndexEntry {
  context_key: string;
  identity_key: string;
  channel: EloChannel;
  rating_record: EloRatingRecord;
}

export interface AnansiRatingIndex {
  partitions: Map<string, AnansiRatingIndexEntry[]>;
}

export interface ContextQuery extends Partial<EloContextTuple>, Partial<EloRatingIdentity> {
  channel?: EloChannel;
}

export interface ContextResolution {
  context_key?: string;
  entries: AnansiRatingIndexEntry[];
}

const CONTEXT_FIELDS: ReadonlyArray<keyof EloContextTuple> = [
  "vak_cp_position",
  "mef_lens",
  "content_class",
  "kairos_window",
  "cfp_thread_type",
  "r_factor_slot",
];

const IDENTITY_FIELDS: ReadonlyArray<keyof EloRatingIdentity> = ["agent", "model", "harness", "skill"];

export function create_anansi_rating_index(): AnansiRatingIndex {
  return { partitions: new Map() };
}

export function anansi_context_key(context: EloContextTuple): string {
  return CONTEXT_FIELDS.map((field) => valueOrThrow(context[field], field)).join("|");
}

export function anansi_identity_key(identity: EloRatingIdentity): string {
  return IDENTITY_FIELDS.map((field) => valueOrThrow(identity[field], field)).join("|");
}

export function anansi_rating_record_key(record: EloRatingRecord): string {
  return [anansi_context_key(record.context_tuple), anansi_identity_key(record), record.channel].join("|");
}

export function anansi_index_rating(input: {
  rating_record: EloRatingRecord;
  index?: AnansiRatingIndex;
}): AnansiRatingIndexEntry {
  const index = input.index ?? create_anansi_rating_index();
  const context_key = anansi_context_key(input.rating_record.context_tuple);
  const identity_key = anansi_identity_key(input.rating_record);
  const entry: AnansiRatingIndexEntry = {
    context_key,
    identity_key,
    channel: input.rating_record.channel,
    rating_record: input.rating_record,
  };
  const partition = index.partitions.get(context_key) ?? [];
  const withoutDuplicate = partition.filter((candidate) => {
    return candidate.identity_key !== entry.identity_key || candidate.channel !== entry.channel;
  });
  withoutDuplicate.push(entry);
  withoutDuplicate.sort((a, b) => `${a.identity_key}|${a.channel}`.localeCompare(`${b.identity_key}|${b.channel}`));
  index.partitions.set(context_key, withoutDuplicate);
  return entry;
}

export function anansi_resolve_context(input: {
  context_query: ContextQuery;
  index: AnansiRatingIndex;
}): ContextResolution {
  const exactContext = hasEveryContextField(input.context_query)
    ? anansi_context_key(input.context_query as EloContextTuple)
    : undefined;
  const partitions = exactContext
    ? [[exactContext, input.index.partitions.get(exactContext) ?? []] as const]
    : [...input.index.partitions.entries()];
  const entries = partitions.flatMap(([context_key, partition]) => {
    return partition
      .filter((entry) => contextMatches(context_key, entry.rating_record.context_tuple, input.context_query))
      .filter((entry) => identityMatches(entry.rating_record, input.context_query))
      .filter((entry) => !input.context_query.channel || entry.channel === input.context_query.channel);
  });
  return { context_key: exactContext, entries };
}

function hasEveryContextField(value: ContextQuery): boolean {
  return CONTEXT_FIELDS.every((field) => Boolean(value[field]?.trim()));
}

function contextMatches(context_key: string, context: EloContextTuple, query: ContextQuery): boolean {
  if (query.vak_cp_position && query.vak_cp_position !== context.vak_cp_position) return false;
  if (query.mef_lens && query.mef_lens !== context.mef_lens) return false;
  if (query.content_class && query.content_class !== context.content_class) return false;
  if (query.kairos_window && query.kairos_window !== context.kairos_window) return false;
  if (query.cfp_thread_type && query.cfp_thread_type !== context.cfp_thread_type) return false;
  if (query.r_factor_slot && query.r_factor_slot !== context.r_factor_slot) return false;
  return context_key === anansi_context_key(context);
}

function identityMatches(record: EloRatingRecord, query: ContextQuery): boolean {
  if (query.agent && query.agent !== record.agent) return false;
  if (query.model && query.model !== record.model) return false;
  if (query.harness && query.harness !== record.harness) return false;
  if (query.skill && query.skill !== record.skill) return false;
  return true;
}

function valueOrThrow(value: string, field: string): string {
  const trimmed = value?.trim();
  if (!trimmed) throw new Error(`Anansi Elo index requires ${field}.`);
  return trimmed;
}
