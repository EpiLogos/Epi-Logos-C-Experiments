/**
 * capability-matrix.schema - TypeBox schema for the Pleroma capability matrix.
 *
 * @coordinate   S4.2' | Pleroma capability membrane
 * @residency    Body/S/S4/plugins/pleroma/capability-matrix.schema.ts
 * @position     #2 - Skill / tool operation law
 * @actualises   [[S4-ARCHITECTURE]] section 5.6 and [[S4-SPEC]] M' consumed contract closure
 *
 * Public surface:
 *   CapabilityMatrixSchema - co-located schema for capability-matrix.json consumers.
 *   CapabilityMatrix - static TypeScript type derived from CapabilityMatrixSchema.
 *   MediatedRunEvidenceBridgeSchema - reusable schema for the M5-4 evidence bridge.
 * Does NOT own:
 *   Capability values or governance policy; capability-matrix.json remains the Pleroma authority.
 *   Runtime validation policy for Anima, ACR, or e2e harness consumers.
 */

import { Type, type Static } from "typebox";

const StringArraySchema = Type.Array(Type.String());
const UnknownRecordSchema = Type.Record(Type.String(), Type.Unknown());

const VakProfileSchema = Type.Object({
  operates_at_cf: StringArraySchema,
  serves_ct: StringArraySchema,
  ranges_cp: StringArraySchema,
});

export const CapabilityDispatchToolSchema = Type.Object({
  name: Type.String(),
  kind: Type.String(),
  layer: Type.String(),
  vak_thread: Type.String(),
  upstream_required: Type.Optional(StringArraySchema),
});

export const CapabilitySkillSchema = Type.Object({
  name: Type.String(),
  layer: Type.String(),
  kind: Type.String(),
  vak_profile: Type.Optional(VakProfileSchema),
});

export const CapabilityCommandSchema = Type.Object({
  name: Type.String(),
  path: Type.String(),
  description: Type.Optional(Type.String()),
});

export const CapabilityLifecycleHookSchema = Type.Object({
  coordinate_owner: Type.String(),
  role: Type.String(),
  inputs: StringArraySchema,
  must_emit: StringArraySchema,
});

export const CapabilityHooksSchema = Type.Object({
  manifest: Type.String(),
  role: Type.String(),
  lifecycle_contract: Type.Object({
    pre_tool_call: CapabilityLifecycleHookSchema,
    post_tool_call: CapabilityLifecycleHookSchema,
    transform_tool_result: CapabilityLifecycleHookSchema,
  }),
});

const TypedDelegationMethodSchema = Type.Object({
  method: Type.String(),
  arguments: Type.Optional(StringArraySchema),
  returns: Type.Optional(StringArraySchema),
  return_policy: Type.Optional(Type.String()),
});

export const CapabilityTypedDelegationSchema = Type.Object({
  delegate_lens: TypedDelegationMethodSchema,
  delegate_square: TypedDelegationMethodSchema,
  gate_observability: TypedDelegationMethodSchema,
});

const ReviewSurfaceRoleSchema = Type.Object({
  permitted_actions: StringArraySchema,
  forbidden_actions: StringArraySchema,
  required_review_categories: StringArraySchema,
  recursive_self_review_requires_user_final_validation: Type.Boolean(),
});

const CapacityGovernanceEntrySchema = Type.Object({
  lead: Type.Optional(Type.String()),
  co_review: Type.Optional(StringArraySchema),
  gates: Type.Optional(StringArraySchema),
  review_categories: Type.Optional(StringArraySchema),
  recursive: Type.Optional(Type.Boolean()),
  user_final_validation_required_for: Type.Optional(StringArraySchema),
});

export const MediatedRunEvidenceBridgeSchema = Type.Object({
  packet_type: Type.String(),
  required_sources: StringArraySchema,
  packet_required_fields: StringArraySchema,
  capability_allowlists: Type.Record(Type.String(), StringArraySchema),
  user_final_validation_required: StringArraySchema,
  forbidden_capabilities: StringArraySchema,
  privacy_guards: StringArraySchema,
});

export const CapabilityM54GovernanceSchema = Type.Object({
  coordinate: Type.String(),
  canonical_vak_keys: StringArraySchema,
  review_surface_roles: Type.Record(Type.String(), ReviewSurfaceRoleSchema),
  capacity_governance: Type.Record(Type.String(), CapacityGovernanceEntrySchema),
  mediated_run_evidence_bridge: MediatedRunEvidenceBridgeSchema,
});

const CapabilityGateSchema = Type.Object({
  role_restrictions: StringArraySchema,
  tools: StringArraySchema,
  skills: StringArraySchema,
});

const TechneToolSchema = Type.Object({
  name: Type.String(),
  kind: Type.String(),
  layer: Type.String(),
  operator_role: Type.String(),
  psyche_template_authority: Type.Boolean(),
  system_tool_grant: Type.Boolean(),
  dialogue_only_output: Type.Boolean(),
  requires_vama_shakti_class: Type.Boolean(),
  refusal_law: StringArraySchema,
});

export const CapabilityMatrixSchema = Type.Object({
  coordinate: Type.String(),
  owner_agent: Type.String(),
  package_role: Type.String(),
  body_residency: Type.String(),
  plugin_manifest: Type.String(),
  constitutional_agents: StringArraySchema,
  _constitutional_agents_status: Type.Optional(Type.String()),
  _audit_12_3: Type.Optional(UnknownRecordSchema),
  constitutional_ct_mapping: Type.Optional(UnknownRecordSchema),
  cf_team_composition_gates: Type.Optional(UnknownRecordSchema),
  cf_aletheia_techne_mapping: Type.Optional(UnknownRecordSchema),
  shared_cf_scale_note: Type.Optional(Type.String()),
  anima_authorial_registers_deprecated: Type.Optional(StringArraySchema),
  dispatch_tools: Type.Array(CapabilityDispatchToolSchema),
  techne_tools: Type.Optional(Type.Array(TechneToolSchema)),
  entitlement_classes: Type.Optional(UnknownRecordSchema),
  aletheia_mode_internal: Type.Optional(UnknownRecordSchema),
  skills: Type.Array(CapabilitySkillSchema),
  commands: Type.Optional(Type.Array(CapabilityCommandSchema)),
  hooks: CapabilityHooksSchema,
  typed_delegation: CapabilityTypedDelegationSchema,
  provider_profile_contract: Type.Optional(UnknownRecordSchema),
  execution_backbone: Type.Optional(UnknownRecordSchema),
  agent_capability_gates: Type.Optional(Type.Record(Type.String(), CapabilityGateSchema)),
  anima_authority: Type.Optional(StringArraySchema),
  epii_relation: Type.Optional(UnknownRecordSchema),
  m5_4_governance: CapabilityM54GovernanceSchema,
  agent_run_contract: Type.Optional(UnknownRecordSchema),
  forbidden_authority: Type.Optional(UnknownRecordSchema),
});

export type CapabilityDispatchTool = Static<typeof CapabilityDispatchToolSchema>;
export type CapabilitySkill = Static<typeof CapabilitySkillSchema>;
export type CapabilityHooks = Static<typeof CapabilityHooksSchema>;
export type CapabilityTypedDelegation = Static<typeof CapabilityTypedDelegationSchema>;
export type MediatedRunEvidenceBridge = Static<typeof MediatedRunEvidenceBridgeSchema>;
export type CapabilityM54Governance = Static<typeof CapabilityM54GovernanceSchema>;
export type CapabilityMatrix = Static<typeof CapabilityMatrixSchema>;
