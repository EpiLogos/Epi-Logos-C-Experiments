/**
 * entitlement.ts — thin re-export shim.
 *
 * The canonical pure entitlement core now lives in the ta-onta sync tree at
 * `../../ta-onta/shared/entitlement.ts` so that `agent-team.ts` (which may only
 * import within ta-onta) can consume it and it survives deploy-sync. This shim
 * keeps the historical `pi-agent/lib/entitlement.ts` import path resolving.
 */
export * from "../../ta-onta/shared/entitlement.ts";
