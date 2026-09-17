/**
 * Coordinate: S4-5' (Aletheia night-pass gateway adapter)
 * Residency: Body/S/S4/ta-onta/S4-5p-aletheia/modules
 * Position (#n): #5 - crystallisation return
 * Actualises: the Chronos-triggered Aletheia night pass into the S5-owned
 * Q-review queue without constructing or supplying corpus data.
 * Public surface: runQReviewNightPass and qReviewNightPassRequest.
 * Does NOT own: temporal scheduling, graph reads, detector policy, queue
 * persistence, review decisions, or promotion.
 * Contract: [[S4-5'-SPEC]] / [[S5-SPEC]] / [[S5-ARCHITECTURE]]
 */

// One gateway-call implementation for every S4 carrier: the socket dance, the
// handshake and the id-matched response live in shared/, not in three copies.
import { callGateway, type GatewayCallOptions } from "../../shared/gateway-call.ts";

export const Q_REVIEW_NIGHT_PASS_METHOD = "s5'.improve.q_review.night_pass";

export interface QReviewNightPassReceipt {
  dayId: string;
  graphRevision: number;
  entryCount: number;
}

export type QReviewNightPassOptions = GatewayCallOptions;

export function qReviewNightPassRequest(dayId: string, lastReviewEpoch = 0) {
  const normalizedDayId = dayId.trim();
  if (!normalizedDayId || /[\\/]/.test(normalizedDayId)) {
    throw new Error("Q-review night pass requires a safe non-empty day_id");
  }
  if (!Number.isSafeInteger(lastReviewEpoch) || lastReviewEpoch < 0) {
    throw new Error("Q-review night pass last_review_epoch must be a non-negative integer");
  }
  return {
    method: Q_REVIEW_NIGHT_PASS_METHOD,
    params: {
      day_id: normalizedDayId,
      last_review_epoch: lastReviewEpoch,
    },
  };
}

/**
 * Run the real S5 night-pass endpoint after Aletheia crystallisation.
 *
 * This adapter carries only temporal context. The endpoint opens the S2 graph
 * projection itself, which prevents Aletheia from smuggling a synthetic corpus
 * into S5 curation.
 */
export async function runQReviewNightPass(
  dayId: string,
  lastReviewEpoch = 0,
  options: QReviewNightPassOptions = {},
): Promise<QReviewNightPassReceipt> {
  const request = qReviewNightPassRequest(dayId, lastReviewEpoch);
  const queue = await callGateway(request, options);

  // The receipt validation is Aletheia's own and stays here: the endpoint opens
  // the S2 projection itself, so a malformed queue is a real finding rather
  // than a transport problem.
  const graphRevision = queue.graph_revision;
  const entries = queue.entries;
  if (
    queue.day_id !== request.params.day_id ||
    typeof graphRevision !== "number" ||
    !Number.isSafeInteger(graphRevision) ||
    !Array.isArray(entries)
  ) {
    throw new Error("Q-review night pass returned an invalid queue receipt");
  }
  return {
    dayId: request.params.day_id as string,
    graphRevision,
    entryCount: entries.length,
  };
}

