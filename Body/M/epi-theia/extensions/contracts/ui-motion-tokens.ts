export type UiMotionTokenType = 'duration' | 'cubicBezier' | 'dimension' | 'string' | 'number' | 'object';

export interface UiMotionToken {
    readonly $value: string | number | readonly number[] | Readonly<Record<string, unknown>>;
    readonly $type: UiMotionTokenType;
    readonly $description: string;
    readonly $fallback?: string;
    readonly $reducedMotionValue?: string;
}

export type UiMotionTokenGroup = {
    readonly [key: string]: UiMotionToken | UiMotionTokenGroup;
};

export type UiMotionTokenPath =
    | 'epilogos.motion.profile-tick.duration'
    | 'epilogos.motion.profile-tick.easing'
    | 'epilogos.motion.transition.lemniscate.duration'
    | 'epilogos.motion.transition.lemniscate.easing'
    | 'epilogos.motion.transition.lemniscate.path'
    | 'epilogos.motion.tick.slerp.angularStep'
    | 'epilogos.motion.tick.slerp.choreography'
    | 'epilogos.motion.tick.slerp.kleinBoundaryTick'
    | 'epilogos.motion.flow.streamline.advance'
    | 'epilogos.motion.klein-flip.flagDuration'
    | 'epilogos.motion.klein-flip.crossfadeMs'
    | 'epilogos.motion.flow-watcher.debounceMs';

export const UI_MOTION_PROFILE_TICK_FALLBACK_MS = 500;
export const UI_MOTION_LEMNISCATE_DURATION_MS = 600;
export const UI_MOTION_LEMNISCATE_REDUCED_DURATION_MS = 100;
export const UI_MOTION_SLERP_ANGULAR_STEP_DEG = 30;
export const UI_MOTION_KLEIN_BOUNDARY_TICK = 5;
export const UI_MOTION_STREAMLINE_ADVANCE_MS = 200;
export const UI_MOTION_KLEIN_FLAG_DURATION_MS = 300;
export const UI_MOTION_KLEIN_CROSSFADE_MS = 500;
export const UI_MOTION_FLOW_WATCHER_DEBOUNCE_MS = 2000;
export const UI_MOTION_LEMNISCATE_PATH =
    'M 12 50 C 24 18 48 18 64 50 C 80 82 104 82 116 50 C 104 18 80 18 64 50 C 48 82 24 82 12 50';

export const UI_MOTION_TOKEN_PATHS = Object.freeze([
    'epilogos.motion.profile-tick.duration',
    'epilogos.motion.profile-tick.easing',
    'epilogos.motion.transition.lemniscate.duration',
    'epilogos.motion.transition.lemniscate.easing',
    'epilogos.motion.transition.lemniscate.path',
    'epilogos.motion.tick.slerp.angularStep',
    'epilogos.motion.tick.slerp.choreography',
    'epilogos.motion.tick.slerp.kleinBoundaryTick',
    'epilogos.motion.flow.streamline.advance',
    'epilogos.motion.klein-flip.flagDuration',
    'epilogos.motion.klein-flip.crossfadeMs',
    'epilogos.motion.flow-watcher.debounceMs'
] as const) as readonly UiMotionTokenPath[];

export const UI_MOTION_TOKENS = {
    epilogos: {
        motion: {
            'profile-tick': {
                duration: {
                    $value: 'kernel-bridge:subscribeToProfileTick.intervalMs',
                    $fallback: '500ms',
                    $type: 'duration',
                    $description:
                        'Profile-tick duration is derived from the kernel-bridge subscribeToProfileTick.intervalMs cadence for the active profile generation. It is not a free UI parameter; 500ms is used only while bridge_unavailable readiness is active. Derivation: Track 30.3 cross-link 15.6.'
                },
                easing: {
                    $value: 'linear',
                    $type: 'cubicBezier',
                    $description:
                        'The profile tick is the clock, so easing adds no independent meaning. Derivation: Track 30.3 cross-link 15.6.'
                }
            },
            transition: {
                lemniscate: {
                    duration: {
                        $value: '600ms',
                        $reducedMotionValue: '100ms',
                        $type: 'duration',
                        $description:
                            'Cosmic to personal fold duration for the lemniscate transition primitive; reduced motion collapses to a 100ms snap. Derivation: Track 30.3 cross-link 15.5 and DR-WC-DL-4.'
                    },
                    easing: {
                        $value: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
                        $type: 'cubicBezier',
                        $description:
                            'Canonical cosmic-personal fold easing for LemniscateTransition. Derivation: Track 30.3 cross-link 15.5.'
                    },
                    path: {
                        $value: UI_MOTION_LEMNISCATE_PATH,
                        $type: 'string',
                        $description:
                            'Figure-eight lemniscate path crossing at the #4 anchor inflection point. Derivation: Track 30.3 cross-link 15.5.'
                    }
                }
            },
            tick: {
                slerp: {
                    angularStep: {
                        $value: '30deg',
                        $type: 'dimension',
                        $description:
                            'SO(3) / 12 tick angular step for the single slerp choreography primitive. Derivation: Track 30.3 cross-link 15.9.'
                    },
                    choreography: {
                        $value: 'RING_QUATERNION_LUT[12]',
                        $type: 'string',
                        $description:
                            'Reference to the canonical twelve-quaternion ring; consumers must not fork the choreography table. Derivation: Track 30.3 cross-link 15.9.'
                    },
                    kleinBoundaryTick: {
                        $value: UI_MOTION_KLEIN_BOUNDARY_TICK,
                        $type: 'number',
                        $description:
                            'Hopf-fibre flag flips at the tick 5 to 6 boundary. Derivation: Track 30.3 cross-link 15.9.'
                    }
                }
            },
            flow: {
                streamline: {
                    advance: {
                        $value: {
                            positionsPerTick: 1,
                            ringSize: 6,
                            duration: '200ms',
                            easing: 'ease-out'
                        },
                        $type: 'object',
                        $description:
                            'DR streamline advances one position per profile tick along the six-element ring, reading MathemeHarmonicProfile.ananda_vortex.dr_ring_* from the bridge. Derivation: Track 30.3 cross-link 15.8 and 15.9.'
                    }
                }
            },
            'klein-flip': {
                flagDuration: {
                    $value: '300ms',
                    $type: 'duration',
                    $description:
                        'Hopf-fibre flag rotates 180 degrees across the tick 5 to 6 boundary. Derivation: Track 30.3 cross-link 15.9.'
                },
                crossfadeMs: {
                    $value: '500ms',
                    $type: 'duration',
                    $description:
                        'Active Ananda matrix cross-fades to its dual at the Klein boundary. Derivation: Track 30.3 cross-link 15.9.'
                }
            },
            'flow-watcher': {
                debounceMs: {
                    $value: '2000ms',
                    $type: 'duration',
                    $description:
                        'Khora flow-watcher debounce consumed by chronos.tranche.complete.quiet event scheduling. Derivation: Track 30.3 cross-link 19.11.'
                }
            }
        }
    }
} as const satisfies UiMotionTokenGroup;

export function profileTickDurationMs(intervalMs: number | null | undefined): number {
    return typeof intervalMs === 'number' && Number.isFinite(intervalMs) && intervalMs > 0
        ? intervalMs
        : UI_MOTION_PROFILE_TICK_FALLBACK_MS;
}
