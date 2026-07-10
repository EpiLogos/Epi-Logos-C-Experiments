/**
 * Coordinate: M' M2'+M4' (0/1 cymatic polarity boundary — Track 08.T8.6)
 * Residency: Body/M/pratibimba-app/src/engine
 * Actualises: DR-M4-2 clause 5 at the `audio_octet` rendering boundary —
 *   **0 = cosmic, 1 = personal. Always been the case.** The face index IS the
 *   cymatic register selector: the cosmic-face (0) K² cymatic skin renders the
 *   shared M2-1' bus openly; the personal-Pratibimba register (1) is BLOCKED
 *   outside protected M4' surfaces (M2'-SPEC §10 law — the personal cymatic
 *   field never renders on an unprotected pane). Track 11.1 inherits this
 *   same sweep (DR-TS-1 cross-link: same polarity all the way down).
 * Does NOT own: the χ-solver (engine/cymaticField.ts), the faces (App.tsx),
 *   M4' protected-surface designation (Track 10.M4 / DR-M4-3).
 */

export type CymaticRegister = 'cosmic' | 'personal';

/** The ratified polarity — 0 = cosmic, 1 = personal; never inverted. */
export function cymaticRegisterForFace(face: 0 | 1): CymaticRegister {
    return face === 0 ? 'cosmic' : 'personal';
}

export interface CymaticRenderRequest {
    readonly face: 0 | 1;
    /** True only for designated protected M4' surfaces (DR-M4-3). */
    readonly protectedM4Surface: boolean;
}

export type CymaticRenderGate =
    | { readonly allowed: true; readonly register: CymaticRegister }
    | { readonly allowed: false; readonly register: 'personal'; readonly reason: string };

/** Gate one audio_octet rendering request at the polarity boundary. */
export function gateCymaticRender(request: CymaticRenderRequest): CymaticRenderGate {
    const register = cymaticRegisterForFace(request.face);
    if (register === 'cosmic') {
        return { allowed: true, register };
    }
    if (request.protectedM4Surface) {
        return { allowed: true, register };
    }
    return {
        allowed: false,
        register,
        reason:
            'personal-Pratibimba cymatic register is blocked outside protected M4′ surfaces (DR-M4-2 clause 5 / M2′-SPEC §10)'
    };
}
