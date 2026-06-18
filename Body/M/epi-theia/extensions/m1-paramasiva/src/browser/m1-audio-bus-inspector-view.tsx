import * as React from 'react';
import {
    CoordinateContext,
    MathemeHarmonicProfileBoundary,
    MExtensionReadinessSnapshot
} from '@pratibimba/m-extension-runtime';
import { buildM1ProfileClockModel } from '../common/clock-instrument';

export type M1AudioBusSortKey = 'position' | 'hz' | 'ratioRole';

const VIMARSHA_AUTHORITY_LABEL = "Vimarśa M2-1' authority";
const VIMARSHA_AUTHORITY_CITATION = 'vimarsha_reading.rs:17-93';
const READS_ONLY_CONTRACT =
    "M1' is the consumer; M2-1' is the writer. To change a value, route through M2.";

interface AudioOctetRow {
    readonly position: number;
    readonly hz: number;
    readonly ratioRole: string;
}

interface NodalQuartetRow {
    readonly index: number;
    readonly ratio: string;
    readonly constraintKind: string;
    readonly boundaryRole: string;
}

export function M1AudioBusInspectorView(props: {
    readonly profile: MathemeHarmonicProfileBoundary | null;
    readonly readiness: MExtensionReadinessSnapshot;
    readonly context: CoordinateContext;
    readonly initialAudioSort?: M1AudioBusSortKey;
}): React.ReactNode {
    const [audioSort, setAudioSort] = React.useState<M1AudioBusSortKey>(
        props.initialAudioSort ?? 'position'
    );

    if (!props.profile) {
        return (
            <section className="mext-widget-detail" data-test="m1-audio-bus-inspector">
                <ReadsOnlyBanner />
                <h3>Audio bus inspector</h3>
                <p className="mext-widget-empty">
                    No MathemeHarmonicProfile available yet. M1 renders this inspector only after
                    the bridge supplies the M2-1' Vimarśa-window profile payload.
                </p>
            </section>
        );
    }

    const model = buildM1ProfileClockModel({
        profile: props.profile,
        readiness: props.readiness,
        context: props.context
    });
    const audioRows = sortAudioRows(audioOctetRows(props.profile, model.audioBus.audioOctetHz), audioSort);
    const nodalRows = nodalQuartetRows(model.audioBus.nodalQuartet);

    return (
        <section className="mext-widget-detail" data-test="m1-audio-bus-inspector">
            <ReadsOnlyBanner />
            <header style={headerStyle}>
                <div>
                    <h3>Audio bus inspector</h3>
                    <p style={subtleTextStyle}>
                        cymatic-source provenance: M1' consumes the profile bus; M2-1' writes the
                        Vimarśa-window values.
                    </p>
                </div>
                <span style={profileSourceStyle}>
                    generation {props.profile.generation} · exact profile source{' '}
                    {model.audioBus.exactProfileSource ? 'yes' : 'pending'}
                </span>
            </header>

            <section aria-label="audio_octet[8]" style={tableSectionStyle}>
                <div style={sectionHeaderStyle}>
                    <h4 style={sectionTitleStyle}>audio_octet[8]</h4>
                    <div style={sortControlStyle} aria-label="Sort audio_octet rows">
                        <SortButton active={audioSort === 'position'} onClick={() => setAudioSort('position')}>
                            position
                        </SortButton>
                        <SortButton active={audioSort === 'hz'} onClick={() => setAudioSort('hz')}>
                            Hz
                        </SortButton>
                        <SortButton
                            active={audioSort === 'ratioRole'}
                            onClick={() => setAudioSort('ratioRole')}
                        >
                            ratio role
                        </SortButton>
                    </div>
                </div>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>position</th>
                            <th style={thStyle}>Hz</th>
                            <th style={thStyle}>ratio role</th>
                            <th style={thStyle}>authority</th>
                        </tr>
                    </thead>
                    <tbody>
                        {audioRows.map(row => (
                            <tr
                                key={row.position}
                                data-test="m1-audio-octet-row"
                                data-position={row.position}
                            >
                                <td style={tdStyle}>{row.position}</td>
                                <td data-test="m1-audio-octet-hz" style={tdStyle}>
                                    {formatHz(row.hz)} Hz
                                </td>
                                <td style={tdStyle}>{row.ratioRole}</td>
                                <td style={tdStyle}>
                                    <VimarshaAuthorityBadge />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section aria-label="nodal_quartet[4]" style={tableSectionStyle}>
                <div style={sectionHeaderStyle}>
                    <h4 style={sectionTitleStyle}>nodal_quartet[4]</h4>
                    <span style={subtleTextStyle}>cymatic boundary-condition roles</span>
                </div>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>nodal index</th>
                            <th style={thStyle}>m/n</th>
                            <th style={thStyle}>constraint-kind</th>
                            <th style={thStyle}>boundary-condition role</th>
                            <th style={thStyle}>authority</th>
                        </tr>
                    </thead>
                    <tbody>
                        {nodalRows.map(row => (
                            <tr
                                key={row.index}
                                data-test="m1-nodal-quartet-row"
                                data-index={row.index}
                            >
                                <td style={tdStyle}>{row.index}</td>
                                <td data-test="m1-nodal-quartet-ratio" style={tdStyle}>
                                    {row.ratio}
                                </td>
                                <td style={tdStyle}>{row.constraintKind}</td>
                                <td style={tdStyle}>{row.boundaryRole}</td>
                                <td style={tdStyle}>
                                    <VimarshaAuthorityBadge />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </section>
    );
}

function ReadsOnlyBanner(): React.ReactElement {
    return (
        <div data-test="m1-audio-bus-readonly-banner" style={bannerStyle}>
            {READS_ONLY_CONTRACT}
        </div>
    );
}

function SortButton(props: {
    readonly active: boolean;
    readonly onClick: () => void;
    readonly children: React.ReactNode;
}): React.ReactElement {
    return (
        <button
            type="button"
            aria-pressed={props.active}
            onClick={props.onClick}
            style={props.active ? activeButtonStyle : buttonStyle}
        >
            {props.children}
        </button>
    );
}

function VimarshaAuthorityBadge(): React.ReactElement {
    return (
        <span
            data-test="m1-vimarsha-authority-badge"
            data-authority-citation={VIMARSHA_AUTHORITY_CITATION}
            title={VIMARSHA_AUTHORITY_CITATION}
            style={badgeStyle}
        >
            {VIMARSHA_AUTHORITY_LABEL} · {VIMARSHA_AUTHORITY_CITATION}
        </span>
    );
}

function audioOctetRows(
    profile: MathemeHarmonicProfileBoundary,
    audioOctetHz: readonly number[] | null
): readonly AudioOctetRow[] {
    if (!audioOctetHz) {
        return [];
    }
    return audioOctetHz.map((hz, position) =>
        Object.freeze({
            position,
            hz,
            ratioRole: ratioRoleForPosition(profile.payload, position)
        })
    );
}

function sortAudioRows(
    rows: readonly AudioOctetRow[],
    audioSort: M1AudioBusSortKey
): readonly AudioOctetRow[] {
    const sorted = [...rows];
    switch (audioSort) {
        case 'hz':
            sorted.sort((a, b) => a.hz - b.hz || a.position - b.position);
            break;
        case 'ratioRole':
            sorted.sort((a, b) => a.ratioRole.localeCompare(b.ratioRole) || a.position - b.position);
            break;
        case 'position':
            sorted.sort((a, b) => a.position - b.position);
            break;
    }
    return sorted;
}

function nodalQuartetRows(
    nodalQuartet: readonly Readonly<Record<string, unknown>>[] | null
): readonly NodalQuartetRow[] {
    if (!nodalQuartet) {
        return [];
    }
    return nodalQuartet.map((node, index) => {
        const helix = stringValue(node.helix) ?? 'unassigned-helix';
        const qlPosition = numberValue(node.qlPosition ?? node.ql_position);
        const m = numberValue(node.m);
        const n = numberValue(node.n);
        const constraintKind =
            stringValue(node.constraintKind ?? node.constraint_kind) ?? 'cymatic_boundary';
        return Object.freeze({
            index,
            ratio: m !== null && n !== null ? `${m}/${n}` : 'profile value pending',
            constraintKind,
            boundaryRole:
                qlPosition !== null
                    ? `${helix} QL position ${qlPosition} cymatic boundary condition`
                    : `${helix} cymatic boundary condition`
        });
    });
}

function ratioRoleForPosition(payload: Readonly<Record<string, unknown>>, position: number): string {
    const perPosition = arrayValue(payload.ratioRoles ?? payload.ratio_roles);
    const value = stringValue(perPosition[position]);
    return value ?? stringValue(payload.ratioRole ?? payload.ratio_role) ?? 'profile ratio role pending';
}

function formatHz(value: number): string {
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(5)));
}

function arrayValue(value: unknown): readonly unknown[] {
    return Array.isArray(value) ? value : [];
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

const bannerStyle: React.CSSProperties = {
    border: '1px solid rgba(180, 120, 42, 0.45)',
    background: 'rgba(180, 120, 42, 0.1)',
    color: '#7a4c13',
    padding: '10px 12px',
    borderRadius: 6,
    fontWeight: 600,
    marginBottom: 12
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
    marginBottom: 16
};

const subtleTextStyle: React.CSSProperties = {
    margin: 0,
    color: 'var(--theia-descriptionForeground)',
    fontSize: 12
};

const profileSourceStyle: React.CSSProperties = {
    border: '1px solid var(--theia-widget-border)',
    borderRadius: 6,
    padding: '5px 8px',
    fontSize: 12,
    whiteSpace: 'nowrap'
};

const tableSectionStyle: React.CSSProperties = {
    marginTop: 16
};

const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8
};

const sectionTitleStyle: React.CSSProperties = {
    margin: 0
};

const sortControlStyle: React.CSSProperties = {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap'
};

const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed'
};

const thStyle: React.CSSProperties = {
    textAlign: 'left',
    borderBottom: '1px solid var(--theia-widget-border)',
    padding: '6px 8px',
    fontSize: 12
};

const tdStyle: React.CSSProperties = {
    borderBottom: '1px solid var(--theia-widget-border)',
    padding: '7px 8px',
    verticalAlign: 'top',
    wordBreak: 'break-word'
};

const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid rgba(44, 132, 92, 0.5)',
    background: 'rgba(44, 132, 92, 0.1)',
    color: '#1f6b48',
    borderRadius: 6,
    padding: '2px 6px',
    fontSize: 11,
    lineHeight: 1.5
};

const buttonStyle: React.CSSProperties = {
    border: '1px solid var(--theia-widget-border)',
    borderRadius: 6,
    background: 'var(--theia-button-secondaryBackground)',
    color: 'var(--theia-button-secondaryForeground)',
    padding: '3px 7px',
    fontSize: 12
};

const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: 'var(--theia-button-background)',
    color: 'var(--theia-button-foreground)'
};
