/**
 * Coordinate: M' shell-0 (cosmic face, lean preview)
 * Actualises: the 0-face — tick pulse, harmonic orientation, and the
 *   instrument readout from the shared profile. Renders only what the
 *   profile carries; missing fields render as pending, never as
 *   locally-computed defaults (M'-SYSTEM-SPEC profile law). All Hz shown
 *   come from the kernel's audio_octet — this face never invents pitch.
 */

import { useInstrumentStore } from '../audio/instrument';
import { commands } from '../commands/registry';
import { useTickStore } from '../state/stores';
import { ClockWheel } from './ClockWheel';

function pick(profile: unknown, ...keys: string[]): unknown {
    let node: any = profile;
    for (const key of keys) {
        if (node == null || typeof node !== 'object') {
            return undefined;
        }
        node = node[key];
    }
    return node;
}

export function CosmicFace() {
    const cached = useTickStore(s => s.profile);
    const generation = useTickStore(s => s.generation);
    const muted = useInstrumentStore(s => s.muted);
    const running = useInstrumentStore(s => s.running);

    const profile = cached?.profile ?? null;
    const hp = (pick(profile, 'harmonicProfile') ?? profile) as Record<string, unknown> | null;
    const tick12 = pick(hp, 'tick12');
    const degree720 = pick(hp, 'degree720');
    const helix = pick(hp, 'helix');
    const note = pick(hp, 'chromatic', 'note');
    const mirror = pick(hp, 'chromatic', 'mirrorNote');
    const xPrime = pick(hp, 'chromatic', 'xPrimeNote');
    const ratioRole = pick(hp, 'ratioRole');
    const lens = pick(hp, 'lensMode', 'lens');
    const mode = pick(hp, 'lensMode', 'mode');
    const audioOctet = pick(hp, 'audioOctet');
    const octet = Array.isArray(audioOctet) ? (audioOctet as number[]) : null;

    return (
        <section className="face face-cosmic" data-testid="cosmic-face">
            <ClockWheel />
            <dl className="cosmic-readout">
                <dt>generation</dt>
                <dd data-testid="cosmic-generation">{generation ?? 'pending'}</dd>
                <dt>tick12</dt>
                <dd data-testid="cosmic-tick12">{tick12 !== undefined ? String(tick12) : 'pending'}</dd>
                <dt>degree720</dt>
                <dd data-testid="cosmic-degree720">{degree720 !== undefined ? String(degree720) : 'pending'}</dd>
                <dt>helix</dt>
                <dd data-testid="cosmic-helix">{helix !== undefined ? String(helix) : 'pending'}</dd>
                <dt>note · X′ · mirror</dt>
                <dd data-testid="cosmic-note">
                    {note !== undefined ? `${note} · ${xPrime} · ${mirror}` : 'pending'}
                </dd>
                <dt>ratio · (lens, mode)</dt>
                <dd data-testid="cosmic-ratio">
                    {ratioRole !== undefined ? `${ratioRole} · (${lens}, ${mode})` : 'pending'}
                </dd>
            </dl>
            <div className="instrument-strip" data-testid="instrument-strip">
                <button
                    type="button"
                    className="instrument-toggle"
                    data-testid="instrument-toggle"
                    onClick={() => void commands.execute('instrument.toggleMute')}
                >
                    {muted ? '𝄽 unmute instrument' : '♪ sounding'}
                </button>
                <span className="instrument-octet" data-testid="instrument-octet">
                    {octet ? octet.map(hz => Math.round(hz)).join(' · ') + ' Hz' : 'bus pending'}
                </span>
                {!running && !muted ? <span className="instrument-note">starting…</span> : null}
            </div>
        </section>
    );
}
