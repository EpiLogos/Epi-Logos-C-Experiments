/**
 * Coordinate: M' M4' (ambient state + tuning controls, rerun 11.T11.12)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): M4-0' day canvas chrome
 * Actualises: strict ambient reads and canonical session-NOW tuning writes.
 * Public surface: NaraAmbientStateStrip, NaraTuningBar, ambientModelFromProfile,
 *   updateTuningFrontmatter.
 * Does NOT own: Medicine balance, oracle-spread lifecycle, Janus defaults,
 *   session-NOW location, or vault persistence law.
 * Contract: [[M4'-SPEC]]; [[2026-06-04-prospective-retrospective-canvas-spec]] §2.4–2.5.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { parseDocument } from 'yaml';
import { invokeCommand } from '../bridge/tauri';
import { useTickStore } from '../state/stores';
import type { VaultEntry } from './FileTreePane';
import { latestSessionNowPath } from './m4NaraKleinWeighting';
import { splitFrontmatter } from './MarkdownEditorPane';

const ELEMENT_ORDER = ['Earth', 'Water', 'Air', 'Fire'] as const;
type ElementName = (typeof ELEMENT_ORDER)[number];
type TrancheMode = 'explicit' | 'quiet:90m' | 'rhythm';
type ResponseOrbit = 'immediate' | 'hours:3' | 'next-morning' | 'saturnine';

export interface AmbientModel {
    readonly elements: readonly { readonly name: ElementName; readonly intensity: number }[] | null;
    readonly dominant: ElementName | null;
    readonly chakra: string | null;
    readonly decanPlanet: string | null;
    readonly spreadSummary: string | null;
}

export interface TuningState {
    readonly trancheMode: TrancheMode;
    readonly responseOrbit: ResponseOrbit;
    readonly prospective: number;
    readonly retrospective: number;
}

const DEFAULT_TUNING: TuningState = Object.freeze({
    trancheMode: 'quiet:90m',
    responseOrbit: 'next-morning',
    prospective: 0.5,
    retrospective: 0.5
});

export function ambientModelFromProfile(profile: unknown): AmbientModel {
    const root = record(profile);
    const harmonic = record(root?.harmonicProfile);
    const personal = record(harmonic?.personalPole);
    const balance = record(personal?.elementalBalance);
    const values = balance && ELEMENT_ORDER.map(name => finiteUnit(balance[name.toLowerCase()]));
    const elements = values && values.every(value => value !== null)
        ? ELEMENT_ORDER.map((name, index) => Object.freeze({ name, intensity: values[index] as number }))
        : null;
    const dominantRaw = typeof balance?.dominant === 'string' ? titleCase(balance.dominant) : null;
    const dominant = ELEMENT_ORDER.includes(dominantRaw as ElementName) ? dominantRaw as ElementName : null;
    const spreads = record(harmonic?.oracleSpreadState);
    const active = nonNegativeInt(spreads?.active);
    const generating = nonNegativeInt(spreads?.generating);
    const muting = nonNegativeInt(spreads?.muting);
    return Object.freeze({
        elements,
        dominant,
        chakra: stringOrNull(balance?.activeChakra),
        decanPlanet: stringOrNull(balance?.decanRulingPlanet),
        spreadSummary: active === null || generating === null || muting === null
            ? null
            : `${active} spreads · ${generating} generating · ${muting} muting`
    });
}

export function NaraAmbientStateStrip() {
    const cached = useTickStore(state => state.profile);
    const model = useMemo(() => ambientModelFromProfile(cached?.profile ?? null), [cached]);
    return (
        <section className="nara-ambient-strip" data-testid="nara-ambient-strip" aria-label="Ambient Nara state">
            <div className="nara-ambient-elements" data-testid="nara-ambient-elements">
                {model.elements ? model.elements.map(element => (
                    <span
                        key={element.name}
                        data-element={element.name}
                        data-dominant={element.name === model.dominant ? 'true' : 'false'}
                        style={{ '--element-intensity': element.intensity } as React.CSSProperties}
                    >{element.name} {Math.round(element.intensity * 100)}</span>
                )) : <span data-state="pending-medicine-balance">somatic pending</span>}
            </div>
            <span data-testid="nara-ambient-chakra">
                {model.chakra ? `${model.chakra}${model.decanPlanet ? ` · ${model.decanPlanet}` : ''}` : 'chakra pending'}
            </span>
            <span data-testid="nara-ambient-spreads">{model.spreadSummary ?? 'spreads pending'}</span>
        </section>
    );
}

export function tuningFromNowContent(content: string): TuningState {
    const { frontmatter } = splitFrontmatter(content);
    if (!frontmatter) return DEFAULT_TUNING;
    const doc = parseDocument(frontmatter.slice(4, -5));
    const mode = doc.get('c_3_tranche_mode');
    const orbit = doc.get('c_3_response_orbit');
    const prospective = finiteUnit(doc.getIn(['c_3_klein_weighting', 'prospective'])) ?? DEFAULT_TUNING.prospective;
    const retrospective = finiteUnit(doc.getIn(['c_3_klein_weighting', 'retrospective'])) ?? DEFAULT_TUNING.retrospective;
    return Object.freeze({
        trancheMode: isTrancheMode(mode) ? mode : DEFAULT_TUNING.trancheMode,
        responseOrbit: isResponseOrbit(orbit) ? orbit : DEFAULT_TUNING.responseOrbit,
        prospective: Math.abs(prospective + retrospective - 1) <= 0.001 ? prospective : 0.5,
        retrospective: Math.abs(prospective + retrospective - 1) <= 0.001 ? retrospective : 0.5
    });
}

export function updateTuningFrontmatter(content: string, tuning: TuningState): string {
    const { frontmatter, body } = splitFrontmatter(content);
    if (!frontmatter) throw new Error('session NOW has no frontmatter');
    const doc = parseDocument(frontmatter.slice(4, -5));
    doc.set('c_3_tranche_mode', tuning.trancheMode);
    doc.set('c_3_response_orbit', tuning.responseOrbit);
    doc.set('c_3_klein_weighting', {
        prospective: Number(tuning.prospective.toFixed(3)),
        retrospective: Number(tuning.retrospective.toFixed(3))
    });
    return `---\n${doc.toString().trimEnd()}\n---\n${body}`;
}

export function NaraTuningBar({ dayNow }: { readonly dayNow: string }) {
    const [tuning, setTuning] = useState<TuningState>(DEFAULT_TUNING);
    const [nowPath, setNowPath] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'saving' | 'saved' | 'blocked'>('loading');
    const contentRef = useRef<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const dayPath = `Empty/Present/${dayNow}`;
        void invokeCommand<VaultEntry[]>('vault_list', { path: dayPath })
            .then(entries => {
                const path = latestSessionNowPath(entries);
                if (!path) throw new Error('no session NOW');
                return invokeCommand<{ content: string }>('vault_read', { path }).then(file => ({ path, content: file.content }));
            })
            .then(({ path, content }) => {
                if (cancelled) return;
                setNowPath(path);
                contentRef.current = content;
                setTuning(tuningFromNowContent(content));
                setStatus('ready');
            })
            .catch(() => { if (!cancelled) setStatus('blocked'); });
        return () => { cancelled = true; };
    }, [dayNow]);

    const persist = useCallback(async (next: TuningState) => {
        if (!nowPath || contentRef.current === null) return;
        setTuning(next);
        setStatus('saving');
        const content = updateTuningFrontmatter(contentRef.current, next);
        try {
            await invokeCommand<void>('vault_write', { path: nowPath, content });
            contentRef.current = content;
            setStatus('saved');
        } catch {
            setStatus('blocked');
        }
    }, [nowPath]);

    const disabled = status === 'loading' || status === 'saving' || status === 'blocked';
    const setProspective = (value: number) => void persist({ ...tuning, prospective: value, retrospective: 1 - value });

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (!event.altKey || !event.shiftKey || disabled) return;
            const mode = event.key === '1' ? 'explicit' : event.key === '2' ? 'quiet:90m' : event.key === '3' ? 'rhythm' : null;
            if (!mode) return;
            event.preventDefault();
            void persist({ ...tuning, trancheMode: mode });
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [disabled, persist, tuning]);

    return (
        <section className="nara-tuning-bar" data-testid="nara-tuning-bar" data-status={status}>
            <div className="nara-tuning-segmented" aria-label="Tranche mode">
                {(['explicit', 'quiet:90m', 'rhythm'] as const).map(mode => (
                    <button key={mode} type="button" disabled={disabled} aria-pressed={tuning.trancheMode === mode}
                        onClick={() => void persist({ ...tuning, trancheMode: mode })}>{mode}</button>
                ))}
            </div>
            <label>Orbit
                <select disabled={disabled} value={tuning.responseOrbit}
                    onChange={event => void persist({ ...tuning, responseOrbit: event.target.value as ResponseOrbit })}>
                    {(['immediate', 'hours:3', 'next-morning', 'saturnine'] as const).map(orbit => <option key={orbit}>{orbit}</option>)}
                </select>
            </label>
            <label>Prospective <input aria-label="Prospective sense" type="range" min="0" max="1" step="0.05"
                disabled={disabled} value={tuning.prospective} onChange={event => setProspective(Number(event.target.value))} /></label>
            <label>Retrospective <input aria-label="Retrospective sense" type="range" min="0" max="1" step="0.05"
                disabled={disabled} value={tuning.retrospective} onChange={event => setProspective(1 - Number(event.target.value))} /></label>
            <span className="nara-tuning-status">{status}</span>
        </section>
    );
}

function record(value: unknown): Record<string, unknown> | null { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null; }
function finiteUnit(value: unknown): number | null { return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1 ? value : null; }
function nonNegativeInt(value: unknown): number | null { return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null; }
function stringOrNull(value: unknown): string | null { return typeof value === 'string' && value.trim() ? value.trim() : null; }
function titleCase(value: string): string { return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(); }
function isTrancheMode(value: unknown): value is TrancheMode { return value === 'explicit' || value === 'quiet:90m' || value === 'rhythm'; }
function isResponseOrbit(value: unknown): value is ResponseOrbit { return value === 'immediate' || value === 'hours:3' || value === 'next-morning' || value === 'saturnine'; }
