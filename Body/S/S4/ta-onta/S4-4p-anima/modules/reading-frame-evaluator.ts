import { isValidVakAddress, type VakAddress } from "../../shared/vak_address.ts";

export type OracleArtifactKind = "tarot" | "iching" | "mahamaya" | string;

export type OracleFrameKind =
  | "single-card-cp-point"
  | "compressed-triad-cp-set"
  | "sixfold-ql-traverse"
  | "klein-night-inverse-pass"
  | "depth-4-5-pass"
  | "variable-cp-frame";

export type ReadingFrameTopology =
  | "position-pairs"
  | "klein-night"
  | "depth-4-5"
  | "none";

export interface ReadingFramePositionInput {
  readonly key: string;
  readonly ordinal: number;
  readonly cpPositionRef: string;
  readonly label?: string;
  readonly role?: string;
  readonly complementaryKey?: string;
  readonly vakAddress?: VakAddress;
}

export interface PsycheReadingHandles {
  readonly sessionKey?: string;
  readonly sessionId?: string;
  readonly dayId?: string;
  readonly nowPath?: string;
  readonly redisLiveContextHandle?: string;
  readonly kbaseSourcePoolHandles?: readonly string[];
  readonly graphProvenanceHandles?: readonly string[];
}

export interface OracleReadingFrameInput {
  readonly frameId: string;
  readonly artifactKind: OracleArtifactKind;
  readonly spreadScale: string;
  readonly vakAddress: VakAddress;
  readonly positions: readonly ReadingFramePositionInput[];
  readonly declaredTopology?: ReadingFrameTopology;
  readonly psycheHandles?: PsycheReadingHandles;
  readonly childFrames?: readonly Omit<OracleReadingFrameInput, "psycheHandles">[];
}

export interface GraphitiFlattenedVakAttrs {
  readonly cpf: string;
  readonly ct: readonly string[];
  readonly cp: readonly string[];
  readonly cf: string;
  readonly cfp: string;
  readonly cs_code: string;
  readonly cs_direction: string;
}

export interface ReadingSessionRuntimeAttrs {
  readonly session_key?: string;
  readonly session_id?: string;
  readonly day_id?: string;
  readonly now_path?: string;
  readonly redis_live_context_handle?: string;
  readonly kbase_source_pool_handles: readonly string[];
  readonly graph_provenance_handles: readonly string[];
  readonly vak_address: VakAddress;
}

export interface ReadingDispatchGate {
  readonly allowed: boolean;
  readonly reason: string;
}

export interface OracleReadingEvaluation {
  readonly ok: boolean;
  readonly error?: string;
  readonly frameId: string;
  readonly artifactKind: OracleArtifactKind;
  readonly frameKind: OracleFrameKind;
  readonly positionCount: number;
  readonly activeCpSet: readonly string[];
  readonly complementaryPairs: readonly (readonly [string, string])[];
  readonly graphitiEpisodeAttrs: GraphitiFlattenedVakAttrs;
  readonly sessionRuntime: ReadingSessionRuntimeAttrs;
  readonly dispatch: ReadingDispatchGate;
  readonly childFrames: readonly OracleReadingEvaluation[];
}

export function evaluateOracleReadingFrame(input: OracleReadingFrameInput): OracleReadingEvaluation {
  const invalid = validateReadingFrame(input);
  const activeCpSet = invalid.activeCpSet;
  const sessionRuntime = sessionRuntimeAttrs(input, input.vakAddress);
  const graphitiEpisodeAttrs = flattenVakAddressForGraphiti(input.vakAddress, activeCpSet);

  if (invalid.error) {
    return {
      ok: false,
      error: invalid.error,
      frameId: input.frameId,
      artifactKind: input.artifactKind,
      frameKind: classifyFrameKind(input, activeCpSet),
      positionCount: input.positions.length,
      activeCpSet,
      complementaryPairs: [],
      graphitiEpisodeAttrs,
      sessionRuntime,
      dispatch: { allowed: false, reason: invalid.error },
      childFrames: [],
    };
  }

  const pairs = complementaryPairsFor(input);
  if (pairs.error) {
    return {
      ok: false,
      error: pairs.error,
      frameId: input.frameId,
      artifactKind: input.artifactKind,
      frameKind: classifyFrameKind(input, activeCpSet),
      positionCount: input.positions.length,
      activeCpSet,
      complementaryPairs: [],
      graphitiEpisodeAttrs,
      sessionRuntime,
      dispatch: { allowed: false, reason: pairs.error },
      childFrames: [],
    };
  }

  const childFrames = (input.childFrames ?? []).map((child) =>
    evaluateOracleReadingFrame({
      ...child,
      psycheHandles: input.psycheHandles,
    })
  );

  const childError = childFrames.find((child) => !child.ok);
  if (childError) {
    const error = `child reading frame ${childError.frameId} refused: ${childError.error}`;
    return {
      ok: false,
      error,
      frameId: input.frameId,
      artifactKind: input.artifactKind,
      frameKind: classifyFrameKind(input, activeCpSet),
      positionCount: input.positions.length,
      activeCpSet,
      complementaryPairs: pairs.value,
      graphitiEpisodeAttrs,
      sessionRuntime,
      dispatch: { allowed: false, reason: error },
      childFrames,
    };
  }

  return {
    ok: true,
    frameId: input.frameId,
    artifactKind: input.artifactKind,
    frameKind: classifyFrameKind(input, activeCpSet),
    positionCount: input.positions.length,
    activeCpSet,
    complementaryPairs: pairs.value,
    graphitiEpisodeAttrs,
    sessionRuntime,
    dispatch: { allowed: true, reason: "CPF consent and CP position set present." },
    childFrames,
  };
}

export function flattenVakAddressForGraphiti(
  vakAddress: VakAddress,
  activeCpSet: readonly string[],
): GraphitiFlattenedVakAttrs {
  return {
    cpf: vakAddress.cpf,
    ct: Object.freeze([...vakAddress.ct]),
    cp: Object.freeze([...activeCpSet]),
    cf: vakAddress.cf,
    cfp: vakAddress.cfp,
    cs_code: vakAddress.cs.code,
    cs_direction: vakAddress.cs.direction,
  };
}

function validateReadingFrame(input: OracleReadingFrameInput): {
  readonly activeCpSet: readonly string[];
  readonly error?: string;
} {
  const activeCpSet = uniqueCpSet(input.positions);
  if (!isNonEmptyString(input.vakAddress?.cpf)) {
    return { activeCpSet, error: "CPF consent state is required before OracleFrame dispatch." };
  }
  if (activeCpSet.length === 0) {
    return { activeCpSet, error: "CP position set is required from reading_frame.positions[] before dispatch." };
  }
  if (!isValidVakAddress(input.vakAddress)) {
    return { activeCpSet, error: "vak_address malformed (failed canonical validation)." };
  }

  const keys = new Set<string>();
  for (const position of input.positions) {
    if (!isNonEmptyString(position.key)) {
      return { activeCpSet, error: "reading_frame.positions[] entries must have non-empty keys." };
    }
    if (keys.has(position.key)) {
      return { activeCpSet, error: `reading_frame.positions[] keys must be unique; duplicate ${position.key}.` };
    }
    keys.add(position.key);
    if (!Number.isInteger(position.ordinal) || position.ordinal < 0) {
      return { activeCpSet, error: `reading_frame position ${position.key} must have a non-negative ordinal.` };
    }
    if (!isNonEmptyString(position.cpPositionRef)) {
      return { activeCpSet, error: `reading_frame position ${position.key} is missing cpPositionRef.` };
    }
  }

  return { activeCpSet };
}

function uniqueCpSet(positions: readonly ReadingFramePositionInput[]): readonly string[] {
  const cpSet: string[] = [];
  const seen = new Set<string>();
  for (const position of positions) {
    if (!isNonEmptyString(position.cpPositionRef) || seen.has(position.cpPositionRef)) {
      continue;
    }
    seen.add(position.cpPositionRef);
    cpSet.push(position.cpPositionRef);
  }
  return Object.freeze(cpSet);
}

function classifyFrameKind(
  input: Pick<OracleReadingFrameInput, "positions" | "spreadScale" | "declaredTopology" | "vakAddress">,
  activeCpSet: readonly string[],
): OracleFrameKind {
  if (
    input.declaredTopology === "depth-4-5" ||
    input.spreadScale === "depth-4-5-pass" ||
    (input.positions.length === 2 && activeCpSet.includes("CP4.4") && activeCpSet.includes("CP4.5"))
  ) {
    return "depth-4-5-pass";
  }
  if (
    input.declaredTopology === "klein-night" ||
    input.spreadScale === "night-inverse-pass" ||
    input.vakAddress.cs.direction === "Night'"
  ) {
    return "klein-night-inverse-pass";
  }
  if (input.positions.length === 1) {
    return "single-card-cp-point";
  }
  if (input.positions.length === 3) {
    return "compressed-triad-cp-set";
  }
  if (input.positions.length === 6) {
    return "sixfold-ql-traverse";
  }
  return "variable-cp-frame";
}

function complementaryPairsFor(input: OracleReadingFrameInput): {
  readonly value: readonly (readonly [string, string])[];
  readonly error?: string;
} {
  if (input.declaredTopology !== "position-pairs" && input.declaredTopology !== "klein-night") {
    return { value: [] };
  }

  const keys = new Set(input.positions.map((position) => position.key));
  const pairs: [string, string][] = [];
  const seenPairs = new Set<string>();
  for (const position of input.positions) {
    if (!position.complementaryKey) {
      continue;
    }
    if (!keys.has(position.complementaryKey)) {
      return {
        value: [],
        error: `complementary position ${position.key}/${position.complementaryKey} must reference declared positions.`,
      };
    }
    const pairKey = [position.key, position.complementaryKey].sort().join("\u0000");
    if (seenPairs.has(pairKey)) {
      continue;
    }
    seenPairs.add(pairKey);
    pairs.push([position.key, position.complementaryKey]);
  }
  return { value: Object.freeze(pairs.map((pair) => Object.freeze(pair))) };
}

function sessionRuntimeAttrs(
  input: Pick<OracleReadingFrameInput, "psycheHandles">,
  vakAddress: VakAddress,
): ReadingSessionRuntimeAttrs {
  return {
    session_key: input.psycheHandles?.sessionKey,
    session_id: input.psycheHandles?.sessionId,
    day_id: input.psycheHandles?.dayId,
    now_path: input.psycheHandles?.nowPath,
    redis_live_context_handle: input.psycheHandles?.redisLiveContextHandle,
    kbase_source_pool_handles: Object.freeze([...(input.psycheHandles?.kbaseSourcePoolHandles ?? [])]),
    graph_provenance_handles: Object.freeze([...(input.psycheHandles?.graphProvenanceHandles ?? [])]),
    vak_address: vakAddress,
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}
