# Per-Readiness-State UX Grammar

**Owner:** rerun tranche 32.T32.5 · **Closes:** DR-WC-OB-1
**Machine form:** `readiness-state-grammar.json` · **Code:** `src/ui/readinessGrammar.ts`
**Gate:** `src/ui/readinessGrammar.test.tsx`

## The law

The contract taxonomy is **exactly nine ids** and this document does not add a
tenth. What it adds is a *render layer*: five **flavours**, each of which is a
variant of one parent contract state. That is what DR-WC-OB-1 resolved —
contract authority unchanged, UX expressivity layered over it.

A flavour with no parent is not a flavour; it is a second taxonomy, and the
validator refuses it.

## What this contract does and does not declare

Each row's `shell`, `tier`, `severity` and `recovery` are **computed** from the
laws already landed in `src/ui/bridgeReadiness.ts` (28.11) — not restated. They
appear in the JSON so a reader can see a whole row at once, and
`readinessGrammar.test.tsx` fails if the snapshot and the code ever disagree.

The grammar's own contribution is the **copy** and the **flavour layer**.

### One recorded divergence

The 32.5 design-recon table calls `s2_graph_blocked` and
`s3_subscription_blocked` "overlay". 28.11(a) — later, and landed carrier law —
keeps the wrapping shell for `bridge_unavailable` alone, and renders every
finer-grained state inline at the datum (15.6 provenance-at-the-datum). The
landed law wins here; the prose was describing the frozen Theia shape. Likewise
`bridge_unavailable` routes to Diagnostics rather than a "Reconnect" button,
because the carrier reconnects on its own — that decision and its reason already
live in `readinessRecovery`, and the grammar points at it instead of forking it.

## The nine states

| Contract state | Shell | Tier | Copy | Recovery | Flavour |
|---|---|---|---|---|---|
| `bridge_unavailable` | wrapping | red | Bridge unavailable — no derived state is rendered. | Open Diagnostics | `pending_first_tick` |
| `profile_missing_field` | inline | amber | Awaiting a profile field. | Open Diagnostics | — |
| `s2_graph_blocked` | inline | amber | S2 graph unreachable. | Open Diagnostics | — |
| `s3_subscription_blocked` | inline | amber | S3 gateway down. | Open Gateway | `s3_gateway_unreachable` |
| `s5_review_blocked` | inline | amber | Atelier review pending. | Open Review tab | `s5_atelier_blocked` |
| `authority_payload_missing` | inline | amber | Authoritative payload missing — its owner is named. | Open Evidence tab | `pending_dataset` |
| `privacy_blocked` | inline | red | protected_local — consent required. | *(none — consent is governed, never one-click)* | — |
| `degraded_but_readable` | inline | green | Readable, but degraded — writes stay blocked. | *(none — the datum renders)* | — |
| `ready_public_current` | inline | green | Ready. | *(none)* | `ready_protected_local` |

## The five flavours

| Flavour | Parent state | Render | Fires when |
|---|---|---|---|
| `pending_first_tick` | `bridge_unavailable` | shimmer | the bridge is **connected** and no profile tick has landed yet |
| `s3_gateway_unreachable` | `s3_subscription_blocked` | alias | always — a pure render alias |
| `s5_atelier_blocked` | `s5_review_blocked` | alias | always — a pure render alias |
| `pending_dataset` | `authority_payload_missing` | chip | a blocker actually **names** the missing payload owner |
| `ready_protected_local` | `ready_public_current` | tint | the surface's privacy class is protected (25.18 border-tint) |

### Why `flavourOf` takes a context

The design-recon signature is `flavourOf(state, snapshot)`. The snapshot alone
cannot answer two of the five: it cannot tell "bridge down" from "bridge up, no
tick yet" (both read as an absent binding at tick −1), and it carries no privacy
class. Rather than infer either — which would render a variant the substrate
never reported — the caller supplies them, and a flavour with no context to
stand on simply does not fire. `null` is a real answer.

## Rendering

`BridgeReadinessBadgeView` carries `bridge-readiness-state-{id}` on every render
and layers `bridge-readiness-flavour-{flavour}` on top when a flavour fires,
plus `data-flavour`. The tier border (28.11c) is unchanged.
