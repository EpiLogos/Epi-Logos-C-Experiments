/**
 * entitlement-loader.ts — thin re-export shim.
 *
 * The canonical parsers now live in the ta-onta sync tree at
 * `../../ta-onta/shared/entitlement-loader.ts`. This shim keeps the historical
 * `pi-agent/lib/entitlement-loader.ts` import path resolving.
 */
export * from "../../ta-onta/shared/entitlement-loader.ts";
