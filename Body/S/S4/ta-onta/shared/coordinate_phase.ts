export type CoordinatePhase = "direct" | "prime" | "inverted_property";

export interface PhaseQualifiedCoordinate {
  raw: string;
  family: string;
  position: string;
  phase: CoordinatePhase;
  handle: string;
}

export interface PhasePreservationQuery {
  query: "preserve_coordinate_phase";
  surface: string;
  source_coordinate: string;
  emitted_coordinate: string;
  required_phase: CoordinatePhase;
}

export function resolvePhaseQualifiedCoordinate(coord: string): PhaseQualifiedCoordinate {
  const raw = coord.trim();
  if (!raw) throw new Error("coordinate is required");
  const property = parsePropertyCoordinate(raw);
  if (property) return property;

  const family = raw[0];
  if (!family || !["C", "P", "L", "S", "T", "M"].includes(family)) {
    throw new Error(`unsupported coordinate family ${family ?? ""}`);
  }
  const rest = raw.slice(1);
  const phase: CoordinatePhase = rest.startsWith("'") || rest.endsWith("'") ? "prime" : "direct";
  const position = rest.startsWith("'")
    ? rest.slice(1)
    : rest.endsWith("'")
      ? rest.slice(0, -1)
      : rest;
  return {
    raw,
    family,
    position,
    phase,
    handle: `vak://${phase}/${raw}`,
  };
}

export function phasePreservationQuery(
  sourceCoordinate: string,
  emittedCoordinate: string,
  surface = "full-7-laws",
): PhasePreservationQuery | null {
  const source = resolvePhaseQualifiedCoordinate(sourceCoordinate);
  const emitted = resolvePhaseQualifiedCoordinate(emittedCoordinate);
  if (
    source.family === emitted.family &&
    source.position === emitted.position &&
    source.phase !== "direct" &&
    emitted.phase === "direct"
  ) {
    return {
      query: "preserve_coordinate_phase",
      surface,
      source_coordinate: source.raw,
      emitted_coordinate: emitted.raw,
      required_phase: source.phase,
    };
  }
  return null;
}

export function phaseQualifiedVakToken(method: string, coord: string): string {
  const resolved = resolvePhaseQualifiedCoordinate(coord);
  return `<vak: method="${method}" coord="${resolved.raw}" phase="${resolved.phase}" handle="${method}(${resolved.raw})">`;
}

function parsePropertyCoordinate(raw: string): PhaseQualifiedCoordinate | null {
  const parts = raw.split("_");
  if (parts.length < 3) return null;
  const [family, position, marker] = parts;
  if (!family || family.length !== 1 || !/^[a-zA-Z]$/.test(family)) return null;
  if (!position || !/^\d+$/.test(position)) return null;
  const phase: CoordinatePhase = marker === "i" ? "inverted_property" : "direct";
  return {
    raw,
    family,
    position,
    phase,
    handle: `vak://${phase}/${raw}`,
  };
}
