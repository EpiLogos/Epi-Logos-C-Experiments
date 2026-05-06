import { z } from "zod";
import { HCNode } from "./node.js";
import { ContextFrame, DisclosureLevel } from "./enums.js";

/**
 * Discriminated union for the HC payload.
 * Maps to the union { meaning_bin, process_state, instance_id, vector_anchor } in ontology.h.
 */
export const HCPayload = z.discriminatedUnion("type", [
  z.object({ type: z.literal("meaning"), value: z.string() }),
  z.object({ type: z.literal("process"), value: z.record(z.unknown()) }),
  z.object({ type: z.literal("instance"), value: z.string() }),
  z.object({ type: z.literal("vector"), value: z.array(z.number()) }),
]);

export type HCPayload = z.infer<typeof HCPayload>;

/**
 * Ring 4: HCRuntime — the execution shape for Pi agent runtime.
 * Extends HCNode with context frame, disclosure level, session, and payload.
 * Maps to invoke_process + payload in ontology.h.
 */
export const HCRuntime = HCNode.extend({
  contextFrame: ContextFrame.nullable(),
  disclosureLevel: DisclosureLevel,
  mode: z.enum(["day", "night"]),
  sessionId: z.string().nullable(),
  payload: HCPayload.nullable(),
});

export type HCRuntime = z.infer<typeof HCRuntime>;
