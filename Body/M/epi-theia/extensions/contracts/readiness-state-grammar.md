# Readiness State Grammar Contract

Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] -> [[THEIA-UI-PATTERNS-ARCHITECTURE]]

This contract binds the [[M']] Theia readiness UX grammar to the nine-state taxonomy in `07-t0-extension-contract-preflight.json` and `m-extension-runtime/src/common/readiness.ts`.

[[DR-WC-OB-1]] is resolved here: contract authority remains the nine readiness states. UX flavours are render-time variants derived from snapshot context; they are not a second taxonomy and MUST NOT be serialized as contract states.

## Machine Authority

- JSON: `readiness-state-grammar.json`
- Runtime reducer: `../m-extension-runtime/src/common/readiness.ts` `flavourOf(state, snapshot)`
- Renderer: `../m-extension-runtime/src/browser/readiness-banner.tsx`
- Validator: `../test/validate-readiness-state-grammar.test.mjs`

## Canonical State Responses

| Contract state | UX response | Render flavour |
|---|---|---|
| `bridge_unavailable` | Overlay with reconnect affordance, retry button, and [[OmniPanel]] Gateway deep-link. | `pending_first_tick` when the bridge is reachable but no profile tick has arrived. |
| `profile_missing_field` | Inline pending badge: `awaiting profile.<field>` with readiness-ledger link. | None. |
| `s2_graph_blocked` | Overlay: `S2 graph unreachable` with diagnostic affordance and Neo4j-status link. | None. |
| `s3_subscription_blocked` | Overlay: `S3 gateway down` with retry and status link. | `s3_gateway_unreachable` render alias. |
| `s5_review_blocked` | Inline pending badge: `atelier review pending` with [[OmniPanel]] Review link. | `s5_atelier_blocked` render alias. |
| `authority_payload_missing` | Inline pending badge naming the payload owner. | `pending_dataset` when the snapshot carries a named missing dataset. |
| `privacy_blocked` | Inline shimmer: `protected_local - consent required` with opt-in deep-link. | None. |
| `degraded_but_readable` | Inline degraded badge with read-only chrome. | None. |
| `ready_public_current` | Normal render. | `ready_protected_local` when the snapshot carries `privacyClass: "protected_local"`. |

## Renderer Contract

- Every state CSS class is `mext-banner-state-<state>`.
- Every flavour CSS class is `mext-banner-flavour-<flavour>` and is layered on the same banner as its parent state.
- `ReadinessBanner` renders the state label for every snapshot and renders a flavour chip only when `flavourOf` returns a flavour.
- Flavour context fields (`missingDataset`, `payloadOwner`, `privacyClass`) enrich the render layer only; they do not alter the contract state.
