import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    CoordinateContext,
    Disposable,
    EMPTY_COORDINATE_CONTEXT,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import {
    EXTENSION_ID,
    PRIVACY_CLASS,
    createNaraArtifact
} from '../../common';
import type { NaraArtifactEnvelope } from '../../common';
import type { OracleVakAddress } from '../../common/oracle-frame';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';

export const LENS_APPLICATION_VIEW_ID = 'm4.nara.lensApplication';
export const LENS_APPLICATION_LABEL = 'M4 Lens Application';
export const M4_LENS_CARD_EXPORT = 'M4LensCard' as const;

const LENS_LIST_METHOD = 'nara.lens.list';
const LENS_APPLY_METHOD = 'nara.lens.apply';
const LENS_SYNTHESIZE_METHOD = 'nara.lens.synthesize';

export type LensTabId = 'jungian' | 'trika' | 'phenomenal';
export type LensApplicationStatus = 'loading' | 'ready' | 'applying' | 'synthesizing' | 'error';

export interface LensTabDefinition {
    readonly id: LensTabId;
    readonly label: string;
    readonly readingName: string;
    readonly lensArgument: string;
    readonly preferredLensNames: readonly string[];
    readonly fallbackLensIndex: number;
}

export interface LensPosition {
    readonly key: string;
    readonly ordinal: number;
    readonly label: string;
    readonly cpPositionRef: string;
}

export interface ActiveSquareSlot {
    readonly key: string;
    readonly ordinal: number;
    readonly label: string;
    readonly lensIndex: number;
}

export interface LensDescriptor {
    readonly tab: LensTabDefinition;
    readonly lensIndex: number;
    readonly name: string;
    readonly mode: string;
    readonly positions: readonly LensPosition[];
    readonly activeSquareSlots: readonly ActiveSquareSlot[];
}

export interface LensApplyRequest {
    readonly [key: string]: unknown;
    readonly lens: LensTabId;
    readonly subject: string;
    readonly position: string;
    readonly active_square: string;
}

export interface LensApplicationReading {
    readonly handle: string;
    readonly lens: LensTabId;
    readonly readingName: string;
    readonly position: LensPosition;
    readonly activeSquare: ActiveSquareSlot;
    readonly c_3_lens_route: string;
    readonly c_3_active_square: string;
    readonly vak_address: OracleVakAddress;
    readonly artifact: NaraArtifactEnvelope | null;
    readonly backendResult: unknown;
}

export interface LensSynthesisReading {
    readonly handle: string;
    readonly selectedHandles: readonly string[];
    readonly c_3_lens_route: string;
    readonly c_3_active_square: string;
    readonly vak_address: OracleVakAddress;
    readonly artifact: NaraArtifactEnvelope | null;
    readonly backendResult: unknown;
}

export interface LensArtifactContext {
    readonly vaultRoot: string;
    readonly dayId: string;
    readonly nowPath: string;
    readonly sessionKey: string;
}

export interface M4LensCardProps {
    readonly descriptors: readonly LensDescriptor[];
    readonly activeTab: LensTabId;
    readonly selectedPositionKey: string;
    readonly selectedActiveSquareKey: string;
    readonly subject: string;
    readonly status: LensApplicationStatus;
    readonly applications: readonly LensApplicationReading[];
    readonly selectedSynthesisHandles: ReadonlySet<string>;
    readonly synthesis: LensSynthesisReading | null;
    readonly errorMessage: string | null;
    readonly onSelectTab: (tab: LensTabId) => void;
    readonly onSubjectChange: (value: string) => void;
    readonly onPositionChange: (key: string) => void;
    readonly onActiveSquareChange: (key: string) => void;
    readonly onApply: () => void;
    readonly onToggleSynthesisHandle: (handle: string) => void;
    readonly onSynthesize: () => void;
}

const LENS_TABS: readonly LensTabDefinition[] = Object.freeze([
    Object.freeze({
        id: 'jungian',
        label: 'Jungian',
        readingName: 'Jungian psychic-functions reading',
        lensArgument: '7',
        preferredLensNames: Object.freeze(['Phenomenal', 'Jungian']),
        fallbackLensIndex: 7
    }),
    Object.freeze({
        id: 'trika',
        label: 'Trika',
        readingName: 'Trika Para Vak reading',
        lensArgument: '5',
        preferredLensNames: Object.freeze(['Para Vak', 'Trika']),
        fallbackLensIndex: 5
    }),
    Object.freeze({
        id: 'phenomenal',
        label: 'Phenomenal',
        readingName: 'Phenomenological basin reading',
        lensArgument: '4',
        preferredLensNames: Object.freeze(['Phenomenological', 'Phenomenal']),
        fallbackLensIndex: 4
    })
]);

const DEFAULT_SUBPOSITIONS: Readonly<Record<number, readonly string[]>> = Object.freeze({
    4: Object.freeze(['Sein (Being)', 'Geworfenheit', 'Dasein', 'Zeit (Time)', 'Besorge', 'Gelassenheit']),
    5: Object.freeze(['Anuttara/Asambhava', 'Para Vak', 'Pasyanti', 'Madhyama', 'Vaikhari', 'Matrika']),
    7: Object.freeze(['Introversion', 'Sensation', 'Feeling', 'Thinking', 'Intuition', 'Extroversion'])
});

const DEFAULT_LENS_NAMES: Readonly<Record<number, string>> = Object.freeze({
    4: 'Phenomenological',
    5: 'Para Vak',
    7: 'Phenomenal'
});

const KLEIN_SQUARES: readonly (readonly number[])[] = Object.freeze([
    Object.freeze([0, 5, 6, 11]),
    Object.freeze([1, 4, 7, 10]),
    Object.freeze([2, 3, 8, 9])
]);

const KLEIN_SQUARE_NAMES: readonly (readonly string[])[] = Object.freeze([
    Object.freeze(['Quaternal', 'Para Vak', 'Archetypal-Numerical', 'Divine Logos']),
    Object.freeze(['Causal', 'Phenomenological', 'Phenomenal', 'Scientific']),
    Object.freeze(['Logical', 'Processual', 'Alchemical-Elemental', 'Chronological'])
]);

export const M4LensCard: React.FC<M4LensCardProps> = props => {
    const {
        descriptors,
        activeTab,
        selectedPositionKey,
        selectedActiveSquareKey,
        subject,
        status,
        applications,
        selectedSynthesisHandles,
        synthesis,
        errorMessage,
        onSelectTab,
        onSubjectChange,
        onPositionChange,
        onActiveSquareChange,
        onApply,
        onToggleSynthesisHandle,
        onSynthesize
    } = props;
    const activeDescriptor = descriptorForTab(activeTab, descriptors);
    const canApply = subject.trim().length > 0 && status !== 'applying' && status !== 'synthesizing';
    const canSynthesize = selectedSynthesisHandles.size >= 2 && status !== 'synthesizing';

    return (
        <section
            className={`m4-lens-card ${privacyChromeClass('protected_local_handle_only')}`}
            data-test="m4-lens-card"
            data-track="TRACK_08"
            data-export={M4_LENS_CARD_EXPORT}
            data-status={status}
        >
            <header className="m4-lens-header">
                <div>
                    <h3>Lens Application</h3>
                    <p>Symbolic systems are dialects, not authorities.</p>
                </div>
                <span className="m4-lens-privacy mext-privacy-protected-local-handle-only">
                    protected-local handle only
                </span>
            </header>

            <div className="m4-lens-grid">
                <section className="m4-lens-panel" aria-label="Lens list">
                    <div className="m4-lens-tabs" role="tablist" aria-label="Lens dialects">
                        {descriptors.map(descriptor => (
                            <button
                                key={descriptor.tab.id}
                                type="button"
                                role="tab"
                                aria-selected={descriptor.tab.id === activeTab}
                                className={descriptor.tab.id === activeTab ? 'is-selected' : undefined}
                                data-test="m4-lens-tab"
                                data-lens={descriptor.tab.id}
                                onClick={() => onSelectTab(descriptor.tab.id)}
                            >
                                {descriptor.tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="m4-lens-list-body" data-test="m4-lens-list-body">
                        <h4>{activeDescriptor.tab.readingName}</h4>
                        <ol className="m4-lens-position-list">
                            {activeDescriptor.positions.map(position => (
                                <li
                                    key={position.key}
                                    className={position.key === selectedPositionKey ? 'is-active' : undefined}
                                    data-test="m4-lens-position"
                                    data-position={position.key}
                                >
                                    <span>{position.ordinal}</span>
                                    <strong>{position.label}</strong>
                                    <small>{position.cpPositionRef}</small>
                                </li>
                            ))}
                        </ol>
                        <div className="m4-lens-square-slots" data-test="m4-lens-square-slots">
                            {activeDescriptor.activeSquareSlots.map(slot => (
                                <span
                                    key={slot.key}
                                    className={slot.key === selectedActiveSquareKey ? 'is-active' : undefined}
                                    data-test="m4-lens-active-square-slot"
                                    data-active-square={slot.key}
                                >
                                    {slot.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="m4-lens-panel" aria-label="Apply form">
                    <label className="m4-lens-field">
                        <span>Subject</span>
                        <textarea
                            value={subject}
                            data-test="m4-lens-subject"
                            onChange={event => onSubjectChange(event.currentTarget.value)}
                        />
                    </label>
                    <label className="m4-lens-field">
                        <span>Position</span>
                        <select
                            value={selectedPositionKey}
                            data-test="m4-lens-position-picker"
                            onChange={event => onPositionChange(event.currentTarget.value)}
                        >
                            {activeDescriptor.positions.map(position => (
                                <option key={position.key} value={position.key}>
                                    {position.ordinal}. {position.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="m4-lens-field">
                        <span>Active square</span>
                        <select
                            value={selectedActiveSquareKey}
                            data-test="m4-lens-active-square-picker"
                            onChange={event => onActiveSquareChange(event.currentTarget.value)}
                        >
                            {activeDescriptor.activeSquareSlots.map(slot => (
                                <option key={slot.key} value={slot.key}>
                                    {slot.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button
                        type="button"
                        disabled={!canApply}
                        data-test="m4-lens-apply"
                        onClick={onApply}
                    >
                        Apply lens
                    </button>

                    {applications[0] ? (
                        <ReadingCard reading={applications[0]} />
                    ) : (
                        <p className="m4-lens-empty">No reading yet.</p>
                    )}
                </section>

                <section className="m4-lens-panel" aria-label="Synthesize">
                    <h4>Synthesize</h4>
                    <div className="m4-lens-application-list" data-test="m4-lens-application-list">
                        {applications.map(reading => (
                            <label key={reading.handle} className="m4-lens-application-option">
                                <input
                                    type="checkbox"
                                    checked={selectedSynthesisHandles.has(reading.handle)}
                                    onChange={() => onToggleSynthesisHandle(reading.handle)}
                                />
                                <span>{reading.readingName}</span>
                                <small>{reading.c_3_active_square}</small>
                            </label>
                        ))}
                    </div>
                    <button
                        type="button"
                        disabled={!canSynthesize}
                        data-test="m4-lens-synthesize"
                        onClick={onSynthesize}
                    >
                        Synthesize selected
                    </button>
                    {synthesis ? <SynthesisCard reading={synthesis} /> : null}
                </section>
            </div>

            {errorMessage ? (
                <aside className="m4-lens-error" data-test="m4-lens-error">
                    {errorMessage}
                </aside>
            ) : null}
        </section>
    );
};

function ReadingCard(props: { readonly reading: LensApplicationReading }): React.ReactElement {
    const reading = props.reading;
    return (
        <article className="m4-lens-reading-card" data-test="m4-lens-reading-card">
            <h4>{reading.readingName}</h4>
            <dl>
                <dt>c_3_lens_route</dt>
                <dd>{reading.c_3_lens_route}</dd>
                <dt>c_3_active_square</dt>
                <dd>{reading.c_3_active_square}</dd>
                <dt>vak_address</dt>
                <dd>{formatVakAddress(reading.vak_address)}</dd>
            </dl>
        </article>
    );
}

function SynthesisCard(props: { readonly reading: LensSynthesisReading }): React.ReactElement {
    const reading = props.reading;
    return (
        <article className="m4-lens-reading-card" data-test="m4-lens-synthesis-card">
            <h4>Synthesized reading</h4>
            <dl>
                <dt>c_3_lens_route</dt>
                <dd>{reading.c_3_lens_route}</dd>
                <dt>c_3_active_square</dt>
                <dd>{reading.c_3_active_square}</dd>
                <dt>vak_address</dt>
                <dd>{formatVakAddress(reading.vak_address)}</dd>
            </dl>
        </article>
    );
}

@injectable()
export class LensApplicationWidget extends ReactWidget {
    static readonly ID = LENS_APPLICATION_VIEW_ID;
    static readonly LABEL = LENS_APPLICATION_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected descriptors: readonly LensDescriptor[] = buildLensDescriptors([]);
    protected activeTab: LensTabId = 'jungian';
    protected selectedPositionKey = this.descriptors[0].positions[0].key;
    protected selectedActiveSquareKey = this.descriptors[0].activeSquareSlots[0].key;
    protected subject = '';
    protected status: LensApplicationStatus = 'loading';
    protected applications: readonly LensApplicationReading[] = Object.freeze([]);
    protected selectedSynthesisHandles: ReadonlySet<string> = new Set<string>();
    protected synthesis: LensSynthesisReading | null = null;
    protected errorMessage: string | null = null;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = LensApplicationWidget.ID;
        this.title.label = LensApplicationWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-nara-lens-application');
        this.addClass(privacyChromeClass('protected_local_handle_only'));

        this.subscriptions.push(
            this.bridge.onCoordinateContext(context => {
                this.context = context;
            })
        );
        void this.loadLensList();
    }

    override dispose(): void {
        for (const sub of this.subscriptions) {
            try {
                sub.dispose();
            } catch {
                // best-effort
            }
        }
        super.dispose();
    }

    protected override render(): React.ReactNode {
        return (
            <div
                className={`mext-widget-root ${privacyChromeClass('protected_local_handle_only')}`}
                data-test="m4-lens-application-root"
            >
                <M4LensCard
                    descriptors={this.descriptors}
                    activeTab={this.activeTab}
                    selectedPositionKey={this.selectedPositionKey}
                    selectedActiveSquareKey={this.selectedActiveSquareKey}
                    subject={this.subject}
                    status={this.status}
                    applications={this.applications}
                    selectedSynthesisHandles={this.selectedSynthesisHandles}
                    synthesis={this.synthesis}
                    errorMessage={this.errorMessage}
                    onSelectTab={tab => this.selectTab(tab)}
                    onSubjectChange={value => {
                        this.subject = value;
                        this.update();
                    }}
                    onPositionChange={key => {
                        this.selectedPositionKey = key;
                        this.update();
                    }}
                    onActiveSquareChange={key => {
                        this.selectedActiveSquareKey = key;
                        this.update();
                    }}
                    onApply={() => this.applySelectedLens()}
                    onToggleSynthesisHandle={handle => this.toggleSynthesisHandle(handle)}
                    onSynthesize={() => this.synthesizeSelected()}
                />
            </div>
        );
    }

    protected async loadLensList(): Promise<void> {
        this.status = 'loading';
        this.update();
        try {
            const response = await this.bridge.invokeGatewayRpc(LENS_LIST_METHOD, {
                privacyClass: 'protected_local_handle_only'
            });
            this.descriptors = buildLensDescriptors(response);
            this.syncSelectionWithActiveTab();
            this.status = 'ready';
            this.errorMessage = null;
        } catch (error) {
            this.status = 'error';
            this.errorMessage = error instanceof Error ? error.message : String(error);
        }
        this.update();
    }

    protected selectTab(tab: LensTabId): void {
        this.activeTab = tab;
        this.syncSelectionWithActiveTab();
        this.update();
    }

    protected async applySelectedLens(): Promise<void> {
        const descriptor = descriptorForTab(this.activeTab, this.descriptors);
        const position = positionForKey(this.selectedPositionKey, descriptor);
        const activeSquare = activeSquareForKey(this.selectedActiveSquareKey, descriptor);
        const request = buildLensApplyRequest(descriptor, this.subject, position, activeSquare);
        this.status = 'applying';
        this.update();
        try {
            const backendResult = await this.bridge.invokeGatewayRpc(LENS_APPLY_METHOD, request);
            const reading = buildLensApplicationReading(
                descriptor,
                position,
                activeSquare,
                backendResult,
                this.applications.length
            );
            const artifactContext = parseLensArtifactContext(this.context);
            const artifact = artifactContext
                ? await writeLensApplicationArtifact(artifactContext, reading, this.subject)
                : null;
            const withArtifact = { ...reading, artifact, handle: artifact?.artifactHandle ?? reading.handle };
            this.applications = Object.freeze([withArtifact, ...this.applications]);
            this.status = 'ready';
            this.errorMessage = null;
        } catch (error) {
            this.status = 'error';
            this.errorMessage = error instanceof Error ? error.message : String(error);
        }
        this.update();
    }

    protected toggleSynthesisHandle(handle: string): void {
        const next = new Set(this.selectedSynthesisHandles);
        if (next.has(handle)) {
            next.delete(handle);
        } else {
            next.add(handle);
        }
        this.selectedSynthesisHandles = next;
        this.update();
    }

    protected async synthesizeSelected(): Promise<void> {
        const handles = [...this.selectedSynthesisHandles];
        if (handles.length < 2) {
            return;
        }
        this.status = 'synthesizing';
        this.update();
        try {
            const backendResult = await this.bridge.invokeGatewayRpc(LENS_SYNTHESIZE_METHOD, {
                applications: handles
            });
            const selected = this.applications.filter(reading => handles.includes(reading.handle));
            const synthesis = buildLensSynthesisReading(selected, backendResult);
            const artifactContext = parseLensArtifactContext(this.context);
            const artifact = artifactContext
                ? await writeLensSynthesisArtifact(artifactContext, synthesis)
                : null;
            this.synthesis = { ...synthesis, artifact, handle: artifact?.artifactHandle ?? synthesis.handle };
            this.status = 'ready';
            this.errorMessage = null;
        } catch (error) {
            this.status = 'error';
            this.errorMessage = error instanceof Error ? error.message : String(error);
        }
        this.update();
    }

    protected syncSelectionWithActiveTab(): void {
        const descriptor = descriptorForTab(this.activeTab, this.descriptors);
        this.selectedPositionKey = descriptor.positions[0].key;
        this.selectedActiveSquareKey = descriptor.activeSquareSlots[0].key;
    }
}

export function buildLensDescriptors(raw: unknown): readonly LensDescriptor[] {
    const records = Array.isArray(raw)
        ? raw.map(objectRecord).filter(isRecord)
        : Array.isArray(objectRecord(raw)?.lenses)
            ? (objectRecord(raw)?.lenses as unknown[]).map(objectRecord).filter(isRecord)
            : [];

    return Object.freeze(
        LENS_TABS.map(tab => {
            const record = findLensRecord(tab, records);
            const lensIndex = numberValue(record?.index) ?? numberValue(record?.lens_index) ?? tab.fallbackLensIndex;
            const name = stringValue(record?.name) ?? stringValue(record?.lens) ?? DEFAULT_LENS_NAMES[lensIndex] ?? tab.label;
            const subpositions = stringArray(record?.subpositions) ?? DEFAULT_SUBPOSITIONS[lensIndex] ?? [];
            return Object.freeze({
                tab,
                lensIndex,
                name,
                mode: stringValue(record?.mode) ?? (lensIndex < 6 ? 'day' : 'night'),
                positions: Object.freeze(subpositions.map((label, index) => buildPosition(lensIndex, label, index))),
                activeSquareSlots: Object.freeze(buildActiveSquareSlots(lensIndex))
            });
        })
    );
}

export function buildLensApplicationReading(
    descriptor: LensDescriptor,
    position: LensPosition,
    activeSquare: ActiveSquareSlot,
    backendResult: unknown,
    sequence: number
): LensApplicationReading {
    const vak_address = resolveLensVakAddress(descriptor, position, activeSquare);
    return Object.freeze({
        handle: `pending://m4-nara/lens/${descriptor.tab.id}/${sequence}`,
        lens: descriptor.tab.id,
        readingName: descriptor.tab.readingName,
        position,
        activeSquare,
        c_3_lens_route: buildLensRoute(descriptor, position),
        c_3_active_square: activeSquare.key,
        vak_address,
        artifact: null,
        backendResult
    });
}

export function buildLensApplyRequest(
    descriptor: LensDescriptor,
    subject: string,
    position: LensPosition,
    activeSquare: ActiveSquareSlot
): LensApplyRequest {
    return Object.freeze({
        lens: descriptor.tab.id,
        subject,
        position: position.key,
        active_square: activeSquare.key
    });
}

export function buildLensSynthesisReading(
    applications: readonly LensApplicationReading[],
    backendResult: unknown
): LensSynthesisReading {
    const handles = applications.map(reading => reading.handle);
    const first = applications[0];
    const cp = applications.flatMap(reading => reading.vak_address.cp);
    const vak_address: OracleVakAddress = Object.freeze({
        cpf: 'M4-3',
        ct: 'CT3',
        cp: Object.freeze(cp.length > 0 ? cp : ['M4-3:synthesis']),
        cf: '(0/1/2/3)',
        cfp: 'lens-synthesis',
        cs: 'Day+Night'
    });
    return Object.freeze({
        handle: `pending://m4-nara/lens/synthesis/${handles.join('+')}`,
        selectedHandles: Object.freeze(handles),
        c_3_lens_route: applications.map(reading => reading.c_3_lens_route).join(' + '),
        c_3_active_square: first?.c_3_active_square ?? 'M4-3:square/pending',
        vak_address,
        artifact: null,
        backendResult
    });
}

export async function writeLensApplicationArtifact(
    context: LensArtifactContext,
    reading: LensApplicationReading,
    subjectBody: string
): Promise<NaraArtifactEnvelope> {
    return createNaraArtifact({
        vaultRoot: context.vaultRoot,
        dayId: context.dayId,
        kind: 'contemplative',
        title: `${reading.readingName}: ${reading.position.label}`,
        body: [
            `Reading name: ${reading.readingName}`,
            `Lens position: ${reading.position.cpPositionRef}`,
            `Active square: ${reading.c_3_active_square}`,
            '',
            subjectBody
        ].join('\n'),
        nowPath: context.nowPath,
        sessionKey: context.sessionKey,
        privacyClass: PRIVACY_CLASS,
        payload: lensApplicationPayload(reading)
    });
}

export async function writeLensSynthesisArtifact(
    context: LensArtifactContext,
    reading: LensSynthesisReading
): Promise<NaraArtifactEnvelope> {
    return createNaraArtifact({
        vaultRoot: context.vaultRoot,
        dayId: context.dayId,
        kind: 'contemplative',
        title: 'Lens synthesis',
        body: [
            'Reading name: Lens synthesis',
            `Lens route: ${reading.c_3_lens_route}`,
            `Active square: ${reading.c_3_active_square}`
        ].join('\n'),
        nowPath: context.nowPath,
        sessionKey: context.sessionKey,
        privacyClass: PRIVACY_CLASS,
        payload: Object.freeze({
            kind: 'contemplative',
            applications: reading.selectedHandles,
            c_3_lens_route: reading.c_3_lens_route,
            c_3_active_square: reading.c_3_active_square,
            vak_address: reading.vak_address,
            lensPositionRefs: Object.freeze(reading.vak_address.cp)
        })
    });
}

export function lensApplicationPayload(reading: LensApplicationReading): Readonly<Record<string, unknown>> {
    return Object.freeze({
        kind: 'contemplative',
        readingName: reading.readingName,
        lens: reading.lens,
        lensPositionRef: reading.position.cpPositionRef,
        active_square: reading.c_3_active_square,
        c_3_lens_route: reading.c_3_lens_route,
        c_3_active_square: reading.c_3_active_square,
        vak_address: reading.vak_address
    });
}

export function parseLensArtifactContext(context: CoordinateContext): LensArtifactContext | null {
    const handle = context.dayNowSessionHandle;
    const dayId = readDayId(handle);
    if (!dayId) {
        return null;
    }
    const vaultRoot = handle && handle.includes('/Pratibimba/Nara/')
        ? handle.slice(0, handle.indexOf('/Pratibimba/Nara/'))
        : process.cwd();
    return Object.freeze({
        vaultRoot,
        dayId,
        nowPath: readNowPath(handle, dayId),
        sessionKey: context.pointerAnchor ?? `session://m4-nara/lens-application/${dayId}`
    });
}

function findLensRecord(
    tab: LensTabDefinition,
    records: readonly Readonly<Record<string, unknown>>[]
): Readonly<Record<string, unknown>> | undefined {
    return records.find(record => {
        const index = numberValue(record.index) ?? numberValue(record.lens_index);
        const name = stringValue(record.name) ?? stringValue(record.lens) ?? '';
        return (
            index === tab.fallbackLensIndex ||
            tab.preferredLensNames.some(preferred => name.toLowerCase().includes(preferred.toLowerCase()))
        );
    });
}

function buildPosition(lensIndex: number, label: string, index: number): LensPosition {
    return Object.freeze({
        key: `L${lensIndex}:${index}`,
        ordinal: index,
        label,
        cpPositionRef: `M4-3/L${lensIndex}/P${index}`
    });
}

function buildActiveSquareSlots(lensIndex: number): readonly ActiveSquareSlot[] {
    const squareIndex = squareIndexForLens(lensIndex);
    const square = KLEIN_SQUARES[squareIndex];
    const names = KLEIN_SQUARE_NAMES[squareIndex];
    return Object.freeze(
        square.map((slotLensIndex, index) => Object.freeze({
            key: `M4-3:square-${squareIndex}/slot-${index}/L${slotLensIndex}`,
            ordinal: index,
            label: names[index],
            lensIndex: slotLensIndex
        }))
    );
}

function resolveLensVakAddress(
    descriptor: LensDescriptor,
    position: LensPosition,
    activeSquare: ActiveSquareSlot
): OracleVakAddress {
    return Object.freeze({
        cpf: 'M4-3',
        ct: descriptor.tab.id === 'trika' ? 'CT5' : 'CT3',
        cp: Object.freeze([position.cpPositionRef, activeSquare.key]),
        cf: descriptor.tab.id === 'trika' ? '(5/0)' : '(0/1/2/3)',
        cfp: descriptor.tab.id,
        cs: `${descriptor.name}:${position.label}`
    });
}

function buildLensRoute(descriptor: LensDescriptor, position: LensPosition): string {
    return `M4-3/${descriptor.tab.id}/L${descriptor.lensIndex}/P${position.ordinal}`;
}

function descriptorForTab(tab: LensTabId, descriptors: readonly LensDescriptor[]): LensDescriptor {
    return descriptors.find(descriptor => descriptor.tab.id === tab) ?? descriptors[0];
}

function positionForKey(key: string, descriptor: LensDescriptor): LensPosition {
    return descriptor.positions.find(position => position.key === key) ?? descriptor.positions[0];
}

function activeSquareForKey(key: string, descriptor: LensDescriptor): ActiveSquareSlot {
    return descriptor.activeSquareSlots.find(slot => slot.key === key) ?? descriptor.activeSquareSlots[0];
}

function squareIndexForLens(lensIndex: number): number {
    const base = lensIndex % 6;
    if (base === 0 || base === 5) {
        return 0;
    }
    if (base === 1 || base === 4) {
        return 1;
    }
    return 2;
}

function formatVakAddress(vakAddress: OracleVakAddress): string {
    return `${vakAddress.cpf} | ${vakAddress.ct} | ${vakAddress.cp.join(', ')} | ${vakAddress.cf} | ${vakAddress.cfp} | ${vakAddress.cs}`;
}

function objectRecord(value: unknown): Readonly<Record<string, unknown>> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : null;
}

function isRecord(value: Readonly<Record<string, unknown>> | null): value is Readonly<Record<string, unknown>> {
    return value !== null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function stringArray(value: unknown): readonly string[] | null {
    return Array.isArray(value) && value.every(item => typeof item === 'string')
        ? Object.freeze([...value])
        : null;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readDayId(handle: string | null): string | null {
    if (!handle) {
        return null;
    }
    const dayMatch = /(\d{4}-\d{2}-\d{2})/.exec(handle);
    return dayMatch ? dayMatch[1] : null;
}

function readNowPath(handle: string | null, dayId: string): string {
    if (handle && handle.includes('now.md')) {
        return handle;
    }
    const [year, month, day] = dayId.split('-');
    return `Idea/Empty/Present/${day}-${month}-${year}/now.md`;
}
