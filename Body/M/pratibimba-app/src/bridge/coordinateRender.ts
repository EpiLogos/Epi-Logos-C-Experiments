/**
 * Coordinate: M' M0'/M1' (carrier coordinate-render seam — Track 45.T45.3)
 * Residency: Body/M/pratibimba-app/src/bridge
 * Actualises: the single carrier chokepoint for displaying a Bimba coordinate.
 *   The canonical form (`#`→`M`, context-frames parenthesised with the
 *   position-N `.` rule, `/` rendered as the U+2215 division-slash for
 *   filenames) is produced by the GATEWAY-SIDE normaliser —
 *   graph-services `GraphMethodService::resolve_coordinate_string`
 *   → `CoordinateArrayParser::parse_one` (Body/S/S2/graph-services), one of the
 *   five synchronised cross-language impls (design-recon 45 §3.3). Every
 *   coordinate the carrier shows arrives from that seam via `s2.graph.*`
 *   (already canonical, stored canonical in Neo4j). This function renders that
 *   value VERBATIM. It deliberately performs NO transform: rewriting here — e.g.
 *   a local `#`→`M` — would (a) be the forbidden sixth normaliser and (b)
 *   CORRUPT the legitimate raw-archetype coordinates (`#`, `#0`..`#5` are real
 *   Bimba nodes that must display unchanged). The paired guard
 *   (`coordinateNormaliserGuard`) mechanically fails if any local normaliser is
 *   introduced under `Body/M/pratibimba-app/src`.
 * Does NOT own: coordinate normalisation (S2 graph-services / gateway), the
 *   graph schema, the pointer-web / relation semantics.
 */

/**
 * Render a Bimba coordinate that originated from the gateway (`s2.graph.node` /
 * `s2.graph.query` / `s2.graph.traverse`). Pure passthrough — the gateway is the
 * sole normaliser; the carrier is display-only. `null`/`undefined` render as an
 * empty string so callers can inline without a guard.
 */
export function renderGatewayCoordinate(value: string | null | undefined): string {
    return typeof value === 'string' ? value : '';
}
