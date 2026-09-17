import { inject, injectable } from '@theia/core/shared/inversify';
import {
  SHARED_BRIDGE_ADAPTER,
  SharedBridgeAdapter,
  type MObservabilityEvent
} from '@pratibimba/m-extension-runtime';
import {
  assertCapabilityParity,
  checkReviewGate,
  enforceHumanGate,
  isCommittalReviewDecision,
  normalizeIod17Parity,
  normalizeReviewItem,
  type GateCheckResult,
  type IOD17Parity,
  type ReviewDecision,
  type ReviewHistoryEntry,
  type ReviewInboxFilter,
  type ReviewItem,
  type ReviewItemDeep,
  type ReviewSubmitResult,
  type ReviewTransition
} from '../../common/omnipanel-runtime';

export const REVIEW_LANDING_SERVICE = Symbol('PratibimbaReviewLandingService');

/** Gateway methods the review landing surface mediates against. */
export const REVIEW_GATEWAY_METHODS = Object.freeze({
  inbox: "s5'.review.inbox",
  item: "s5'.review.item",
  history: "s5'.review.history",
  submit: "s5'.review.submit",
  annotate: "s5'.review.annotate"
});

const REVIEW_EXTENSION_ID = '@pratibimba/omnipanel-shell';
const SAFE_PRIVACY_CLASSES = new Set(['public', 'protected', 'protected-local']);

/**
 * Review landing service — Track 27 T27.6.
 *
 * Inversify singleton that bridges the OmniPanel `review` tab to the S5
 * `s5'.review.*` mediation surface through the cross-extension
 * `SharedBridgeAdapter` (which fans out to the kernel bridge / S-layer kernel).
 *
 * Two responsibilities:
 *   1. Data access — `getInbox` / `getItem` / `getHistory` read the mediation
 *      surface; `submit` / `annotate` transition it. Reads are privacy-guarded
 *      (private items never reach the UI) and items are cached so the gate can
 *      be checked synchronously.
 *   2. Gate enforcement — `checkGate` wraps `enforceHumanGate` (human-required
 *      routing) and `assertCapabilityParity` (IOD-17 three-way bijection) so
 *      the UI refuses an agent-driven applied verdict BEFORE any gateway
 *      round-trip; the gateway enforces the same rule (T8 parity).
 *
 * Cross-layout sync: every transition publishes a typed observability event on
 * the shared bus so the ide-shell `ReviewPaneWidget` (the other layout) sees
 * the same transition and can refresh.
 */
@injectable()
export class ReviewLandingService {
  @inject(SHARED_BRIDGE_ADAPTER)
  protected readonly bridge!: SharedBridgeAdapter;

  /**
   * Whether the acting principal of this OmniPanel surface is a human. The M5
   * review surface is human-operated by default; set false to model an agent
   * principal (e.g. a recursive self-review run) so committal verdicts on
   * `humanRequired` items are refused.
   */
  actingPrincipalIsHuman = true;

  protected readonly itemCache = new Map<string, ReviewItemDeep>();
  protected readonly shallowCache = new Map<string, ReviewItem>();

  async getInbox(filter: ReviewInboxFilter = {}): Promise<readonly ReviewItem[]> {
    const raw = await this.invoke(REVIEW_GATEWAY_METHODS.inbox, {
      sessionKey: filter.sessionKey ?? null,
      mediator: filter.mediator ?? null,
      status: filter.status ?? null,
      outstandingOnly: filter.outstandingOnly ?? false
    });
    const items: ReviewItem[] = [];
    for (const entry of asArray(raw, 'items')) {
      const item = normalizeReviewItem(entry);
      if (item && this.isPrivacySafe(item.privacyClass)) {
        items.push(item);
        this.shallowCache.set(item.id, item);
      }
    }
    return Object.freeze(items);
  }

  async getItem(reviewId: string): Promise<ReviewItemDeep | null> {
    const raw = await this.invoke(REVIEW_GATEWAY_METHODS.item, { reviewId });
    const record = recordOf(raw) ?? recordOf((raw as { item?: unknown } | null)?.item);
    if (!record) {
      return null;
    }
    const shallow = normalizeReviewItem(record);
    if (!shallow || !this.isPrivacySafe(shallow.privacyClass)) {
      return null;
    }
    const deep = this.toDeep(shallow, record);
    this.itemCache.set(deep.id, deep);
    this.shallowCache.set(deep.id, deep);
    return deep;
  }

  async getHistory(reviewId: string): Promise<readonly ReviewHistoryEntry[]> {
    const raw = await this.invoke(REVIEW_GATEWAY_METHODS.history, { reviewId });
    const entries: ReviewHistoryEntry[] = [];
    for (const entry of asArray(raw, 'history')) {
      const normalized = normalizeHistoryEntry(entry, reviewId);
      if (normalized) {
        entries.push(normalized);
      }
    }
    entries.sort((left, right) => (left.transitionAtMs ?? 0) - (right.transitionAtMs ?? 0));
    return Object.freeze(entries);
  }

  /**
   * Submit a verdict transition. The human-gate is enforced locally first —
   * an agent-driven applied verdict on a `humanRequired` item is refused
   * without a network round-trip. The gateway enforces the same rule.
   */
  async submit(transition: ReviewTransition): Promise<ReviewSubmitResult> {
    const gate = enforceHumanGate({
      decision: transition.decision,
      humanRequired: transition.humanRequired,
      actorIsHuman: transition.actorIsHuman,
      recursiveSelfReview: transition.recursiveSelfReview,
      actor: transition.actor
    });
    if (!gate.ok) {
      const reason = 'reason' in gate ? gate.reason : 'human-gate enforced.';
      this.publish('review.transition.blocked', {
        reviewId: transition.reviewId,
        decision: transition.decision,
        actor: transition.actor,
        reason
      });
      return Object.freeze({
        ok: false,
        reviewId: transition.reviewId,
        blockedReason: reason
      });
    }

    const raw = await this.invoke(REVIEW_GATEWAY_METHODS.submit, {
      reviewId: transition.reviewId,
      decision: transition.decision,
      reason: transition.reason,
      actor: transition.actor,
      actorIsHuman: transition.actorIsHuman,
      humanRequired: transition.humanRequired,
      recursiveSelfReview: transition.recursiveSelfReview ?? false,
      transitionAtMs: transition.transitionAtMs
    });

    const record = recordOf(raw);
    const result: ReviewSubmitResult = Object.freeze({
      ok: record?.ok !== false,
      reviewId: stringOf(record?.reviewId) ?? transition.reviewId,
      status: stringOf(record?.status) ?? undefined,
      blockedReason: stringOf(record?.blockedReason)
    });

    this.itemCache.delete(transition.reviewId);
    this.shallowCache.delete(transition.reviewId);
    this.publish('review.transition.committed', {
      reviewId: result.reviewId,
      decision: transition.decision,
      actor: transition.actor,
      status: result.status ?? null,
      committal: isCommittalReviewDecision(transition.decision)
    });
    return result;
  }

  async annotate(reviewId: string, text: string): Promise<void> {
    await this.invoke(REVIEW_GATEWAY_METHODS.annotate, { reviewId, text });
    this.publish('review.annotated', { reviewId });
  }

  /**
   * Synchronous gate check used by the UI to enable/disable affordances.
   * Wraps `enforceHumanGate` and the IOD-17 parity assertion. Reads the cached
   * deep item; if the item is not cached, committal verdicts are refused
   * conservatively (the UI should `getItem` before offering a verdict).
   */
  checkGate(
    reviewId: string,
    decision: ReviewDecision,
    actorIsHuman: boolean = this.actingPrincipalIsHuman
  ): GateCheckResult {
    const item = this.itemCache.get(reviewId);
    if (!item) {
      if (!isCommittalReviewDecision(decision)) {
        return Object.freeze({ ok: true, humanRequired: false, parityInSync: true, reason: null });
      }
      return Object.freeze({
        ok: false,
        humanRequired: true,
        parityInSync: false,
        reason: `review item ${reviewId} not loaded; fetch it before requesting an applied verdict.`
      });
    }
    return checkReviewGate(item, decision, actorIsHuman);
  }

  /** Direct IOD-17 parity assertion for the matrix ↔ gateway tool surfaces. */
  assertParity(matrixToolNames: readonly string[], gatewayToolNames: readonly string[]) {
    return assertCapabilityParity(matrixToolNames, gatewayToolNames);
  }

  /** Test/runtime hook: seed the gate cache without a gateway round-trip. */
  cacheItem(item: ReviewItemDeep): void {
    this.itemCache.set(item.id, item);
    this.shallowCache.set(item.id, item);
  }

  protected async invoke(method: string, params: Record<string, unknown>): Promise<unknown> {
    return this.bridge.invokeGatewayRpc(method, params);
  }

  protected isPrivacySafe(privacyClass: string | null | undefined): boolean {
    if (!privacyClass) {
      return true;
    }
    return SAFE_PRIVACY_CLASSES.has(privacyClass);
  }

  protected toDeep(shallow: ReviewItem, record: Record<string, unknown>): ReviewItemDeep {
    const parity: IOD17Parity = normalizeIod17Parity(record.iod17Parity ?? shallow.iod17Parity) ?? {
      inParity: true,
      capabilityMatrixState: 'unknown',
      agentContractState: 'unknown',
      widgetState: 'unknown'
    };
    return Object.freeze({
      ...shallow,
      iod17Parity: parity,
      privacyClass: shallow.privacyClass ?? 'public',
      depositedAtMs: shallow.depositedAtMs ?? null,
      sessionKey: shallow.sessionKey ?? null,
      dayNowContext: stringOf(record.dayNowContext) ?? null,
      reason: stringOf(record.reason),
      evidence: normalizeEvidenceEmbed(record.evidence, shallow.evidencePacketRef ?? null),
      genealogy: normalizeGenealogyEmbed(record.genealogy, shallow.originatingDispatchNodeId ?? null),
      history: Array.isArray(record.history)
        ? record.history
            .map((entry) => normalizeHistoryEntry(entry, shallow.id))
            .filter((entry): entry is ReviewHistoryEntry => entry !== null)
        : undefined
    });
  }

  protected publish(type: string, payload: Record<string, unknown>): void {
    const event: MObservabilityEvent = {
      type: `omnipanel.review.${type}`,
      extensionId: REVIEW_EXTENSION_ID,
      emittedAt: typeof Date !== 'undefined' ? Date.now() : 0,
      payload: Object.freeze({ ...payload })
    };
    try {
      this.bridge.publish(event);
    } catch {
      // Observability noise; never surfaced to the UI.
    }
  }
}

function normalizeEvidenceEmbed(value: unknown, fallbackRef: string | null): ReviewItemDeep['evidence'] {
  const record = recordOf(value);
  if (!record) {
    return fallbackRef ? Object.freeze({ packetRef: fallbackRef }) : null;
  }
  const sourcePaths = Array.isArray(record.sourcePaths)
    ? record.sourcePaths.filter((entry): entry is string => typeof entry === 'string')
    : undefined;
  return Object.freeze({
    packetRef: stringOf(record.packetRef) ?? fallbackRef,
    verdict: stringOf(record.verdict),
    verificationState: stringOf(record.verificationState) ?? undefined,
    summary: stringOf(record.summary),
    privacyClass: stringOf(record.privacyClass) ?? undefined,
    ...(sourcePaths ? { sourcePaths: Object.freeze(sourcePaths) } : {})
  });
}

function normalizeGenealogyEmbed(value: unknown, fallbackNodeId: string | null): ReviewItemDeep['genealogy'] {
  const record = recordOf(value);
  if (!record) {
    return fallbackNodeId ? Object.freeze({ originatingNodeId: fallbackNodeId, chain: Object.freeze([]) }) : null;
  }
  const chain = Array.isArray(record.chain)
    ? record.chain
        .map((entry) => {
          const node = recordOf(entry);
          const id = stringOf(node?.id);
          if (!id) {
            return null;
          }
          return Object.freeze({
            id,
            label: stringOf(node?.label) ?? id,
            role: stringOf(node?.role),
            status: stringOf(node?.status)
          });
        })
        .filter((node): node is NonNullable<typeof node> => node !== null)
    : [];
  return Object.freeze({
    originatingNodeId: stringOf(record.originatingNodeId) ?? fallbackNodeId,
    chain: Object.freeze(chain)
  });
}

function normalizeHistoryEntry(value: unknown, reviewId: string): ReviewHistoryEntry | null {
  const record = recordOf(value);
  if (!record) {
    return null;
  }
  const toStatus = stringOf(record.toStatus) ?? stringOf(record.status);
  const id = stringOf(record.id);
  if (!id || !toStatus) {
    return null;
  }
  return Object.freeze({
    id,
    reviewId: stringOf(record.reviewId) ?? reviewId,
    fromStatus: stringOf(record.fromStatus),
    toStatus,
    decision: stringOf(record.decision) ?? 'transition',
    actor: stringOf(record.actor) ?? 'unknown',
    actorIsHuman: record.actorIsHuman === true,
    reason: stringOf(record.reason),
    transitionAtMs:
      typeof record.transitionAtMs === 'number' && Number.isFinite(record.transitionAtMs)
        ? record.transitionAtMs
        : null
  });
}

function asArray(raw: unknown, key: string): readonly unknown[] {
  if (Array.isArray(raw)) {
    return raw;
  }
  const record = recordOf(raw);
  const nested = record?.[key];
  return Array.isArray(nested) ? nested : [];
}

function recordOf(value: unknown): Record<string, unknown> | null {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringOf(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}
