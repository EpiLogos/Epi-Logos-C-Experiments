/**
 * Coordinate: M' M4' (Medicine view model - 25.T25.10)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): strict gateway projection boundary
 * Actualises: validated Medicine snapshots and the Sun-degree profile seam.
 * Public surface: parseMedicineSnapshot, medicineSunDegree.
 * Does NOT own: correspondences, medical authority, persistence, or clocks.
 * Contract: [[M4'-SPEC]] / [[CHROME-CONTRACT]].
 */

import { harmonicSnapshot } from '../engine/modulation/modulators';

export const MEDICINE_SNAPSHOT_METHOD = 'nara.medicine.snapshot';
export const MEDICINE_PIN_METHOD = 'nara.medicine.pin';

export interface MedicineChakra {
    readonly id: number;
    readonly name: string;
    readonly dominantElementId: number | null;
    readonly bodyZones: readonly string[];
}

export interface MedicineHerb {
    readonly vernacular: string;
    readonly botanical: string;
}

export interface MedicineActiveDecan {
    readonly sunDegree: number;
    readonly signIdx: number;
    readonly decanInSign: number;
    readonly decanIdx: number;
    readonly bodyPart: string;
    readonly rulingPlanet: string;
    readonly rulingPlanetGlyph: string;
    readonly activeChakraId: number;
    readonly herbs: readonly MedicineHerb[];
}

export interface MedicineSnapshot {
    readonly chakras: readonly MedicineChakra[];
    readonly activeDecan: MedicineActiveDecan;
}

function record(value: unknown, label: string): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
    return value as Record<string, unknown>;
}

function string(value: unknown, label: string): string {
    if (typeof value !== 'string' || value.length === 0) throw new Error(`${label} must be a non-empty string`);
    return value;
}

function number(value: unknown, label: string): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${label} must be finite`);
    return value;
}

function integer(value: unknown, label: string, minimum: number, maximum: number): number {
    const parsed = number(value, label);
    if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
        throw new Error(`${label} must be an integer from ${minimum} to ${maximum}`);
    }
    return parsed;
}

export function parseMedicineSnapshot(value: unknown): MedicineSnapshot {
    const raw = record(value, 'Medicine snapshot');
    if (!Array.isArray(raw.chakras) || raw.chakras.length !== 8) {
        throw new Error('Medicine snapshot must carry exactly eight chakra rows');
    }
    const chakras = raw.chakras.map((entry, index): MedicineChakra => {
        const row = record(entry, `chakra ${index}`);
        if (!Array.isArray(row.bodyZones) || row.bodyZones.some(zone => typeof zone !== 'string')) {
            throw new Error(`chakra ${index} bodyZones must be strings`);
        }
        const dominant = row.dominantElementId;
        return Object.freeze({
            id: integer(row.id, `chakra ${index} id`, 0, 7),
            name: string(row.name, `chakra ${index} name`),
            dominantElementId:
                dominant === null ? null : integer(dominant, `chakra ${index} dominantElementId`, 1, 4),
            bodyZones: Object.freeze([...row.bodyZones] as string[])
        });
    });
    const active = record(raw.activeDecan, 'activeDecan');
    if (!Array.isArray(active.herbs) || active.herbs.length === 0) {
        throw new Error('activeDecan herbs must not be empty');
    }
    const herbs = active.herbs.map((entry, index) => {
        const herb = record(entry, `herb ${index}`);
        return Object.freeze({
            vernacular: string(herb.vernacular, `herb ${index} vernacular`),
            botanical: string(herb.botanical, `herb ${index} botanical`)
        });
    });
    return Object.freeze({
        chakras: Object.freeze(chakras),
        activeDecan: Object.freeze({
            sunDegree: number(active.sunDegree, 'activeDecan sunDegree'),
            signIdx: integer(active.signIdx, 'activeDecan signIdx', 0, 11),
            decanInSign: integer(active.decanInSign, 'activeDecan decanInSign', 0, 2),
            decanIdx: integer(active.decanIdx, 'activeDecan decanIdx', 0, 35),
            bodyPart: string(active.bodyPart, 'activeDecan bodyPart'),
            rulingPlanet: string(active.rulingPlanet, 'activeDecan rulingPlanet'),
            rulingPlanetGlyph: string(active.rulingPlanetGlyph, 'activeDecan rulingPlanetGlyph'),
            activeChakraId: integer(active.activeChakraId, 'activeDecan activeChakraId', 0, 7),
            herbs: Object.freeze(herbs)
        })
    });
}

export function medicineSunDegree(profile: unknown): number | null {
    const snapshot = harmonicSnapshot(profile);
    const sun = snapshot.planetDegrees?.[0];
    if (typeof sun === 'number' && Number.isFinite(sun)) return ((sun % 360) + 360) % 360;
    return snapshot.degree360;
}
