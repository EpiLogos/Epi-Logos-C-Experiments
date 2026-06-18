// aletheia/modules/janus-threshold.ts
//
// Janus — threshold logic for Elo deltas. The threshold values are supplied by
// config; this module decides signal-vs-noise without pinning numeric constants.

export interface JanusEloThresholdConfig {
  drift_detection: {
    delta_elo: number;
    trial_class_thresholds?: Record<string, number>;
  };
}

export interface JanusThresholdDecision {
  guardian: "janus";
  accepted: boolean;
  trial_class: string;
  delta: number;
  threshold: number;
  magnitude: number;
  event: "aletheia.elo.threshold-applied" | "aletheia.elo.threshold-miss";
}

export function janus_threshold_elo_delta(input: {
  delta: number;
  trial_class: string;
  config: JanusEloThresholdConfig;
}): JanusThresholdDecision {
  const threshold = thresholdForTrialClass(input.trial_class, input.config);
  const magnitude = Math.abs(input.delta);
  const accepted = magnitude >= threshold;
  return {
    guardian: "janus",
    accepted,
    trial_class: input.trial_class,
    delta: input.delta,
    threshold,
    magnitude,
    event: accepted ? "aletheia.elo.threshold-applied" : "aletheia.elo.threshold-miss",
  };
}

export function thresholdForTrialClass(trial_class: string, config: JanusEloThresholdConfig): number {
  const configured = config.drift_detection.trial_class_thresholds?.[trial_class];
  if (configured !== undefined) return configured;
  return config.drift_detection.delta_elo;
}
