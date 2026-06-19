import URI from '@theia/core/lib/common/uri';
import {
    Breadcrumb,
    BreadcrumbsContribution
} from '@theia/core/lib/browser/breadcrumbs/breadcrumbs-constants';
import { CommandRegistry, Emitter, Event } from '@theia/core/lib/common';
import { Disposable } from '@theia/core/shared/vscode-languageserver-protocol';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import { SharedBridgeAdapter } from '../../common/shared-bridge';

export const OMNIPANEL_INTENT_DISPATCH = 'omnipanel.intent.dispatch';
export const EPI_LOGOS_COORDINATE_BREADCRUMB_ID = 'epi-logos.coordinate';
export const EPI_LOGOS_COORDINATE_BREADCRUMB_TYPE = Symbol(EPI_LOGOS_COORDINATE_BREADCRUMB_ID);

export type CoordinateBreadcrumbSegment = 'family' | 'archetype' | 'position';

export interface ParsedCoordinatePath {
    readonly family: string;
    readonly familyCoordinate: string;
    readonly archetype: string;
    readonly archetypeName: string;
    readonly archetypeCoordinate: string;
    readonly position: string;
    readonly positionName: string;
    readonly positionCoordinate: string;
}

interface EpiLogosCoordinateBreadcrumb extends Breadcrumb {
    readonly segment: CoordinateBreadcrumbSegment;
    readonly reducedCoordinate: string;
}

const M_ARCHETYPE_NAMES: Readonly<Record<string, string>> = Object.freeze({
    M0: 'Anuttara',
    M1: 'Paramasiva',
    M2: 'Parashakti',
    M3: 'Mahamaya',
    M4: 'Nara',
    M5: 'Epii'
});

const M_POSITION_NAMES: Readonly<Record<string, Readonly<Record<string, string>>>> = Object.freeze({
    M4: Object.freeze({
        '0': 'Identity',
        '1': 'SomaticReadout',
        '2': 'OracleService',
        '3': 'DayContainer',
        '4': 'GraphitiLens',
        '5': 'EpiiReviewGate'
    })
});

export function parseCoordinate(coordinate: string): ParsedCoordinatePath {
    const trimmed = coordinate.trim();
    const match = /^(M[0-5])(?:[-.](\d+))?/.exec(trimmed);
    const family = match?.[1] ?? trimmed.split(/[-.]/, 1)[0] ?? trimmed;
    const position = match?.[2] ?? 'root';
    const archetypeName = M_ARCHETYPE_NAMES[family] ?? family;
    const positionCoordinate = position === 'root' ? family : `${family}-${position}`;

    return Object.freeze({
        family,
        familyCoordinate: family,
        archetype: family,
        archetypeName,
        archetypeCoordinate: family,
        position,
        positionName: M_POSITION_NAMES[family]?.[position] ?? formatPositionName(position),
        positionCoordinate
    });
}

function formatPositionName(position: string): string {
    if (position === 'root') {
        return 'Root';
    }
    return `Position ${position}`;
}

@injectable()
export class EpiLogosCoordinateBreadcrumbsContribution implements BreadcrumbsContribution {
    readonly type = EPI_LOGOS_COORDINATE_BREADCRUMB_TYPE;
    readonly priority = 100;

    @inject(SharedBridgeAdapter) protected readonly bridge!: SharedBridgeAdapter;
    @inject(CommandRegistry) protected readonly commands!: CommandRegistry;

    protected readonly onDidChangeBreadcrumbsEmitter = new Emitter<URI>();
    readonly onDidChangeBreadcrumbs: Event<URI> = this.onDidChangeBreadcrumbsEmitter.event;

    protected lastUri: URI | undefined;

    @postConstruct()
    protected init(): void {
        this.bridge.onCoordinateContext(() => {
            if (this.lastUri) {
                this.onDidChangeBreadcrumbsEmitter.fire(this.lastUri);
            }
        });
    }

    async computeBreadcrumbs(uri: URI): Promise<Breadcrumb[]> {
        this.lastUri = uri;
        const context = this.bridge.currentSnapshot().context;
        if (!context.selectedCoordinate) {
            return [];
        }

        const parsed = parseCoordinate(context.selectedCoordinate);
        return [
            this.createBreadcrumb('family', parsed.family, parsed.family, parsed.familyCoordinate, 'codicon-symbol-namespace'),
            this.createBreadcrumb('archetype', parsed.family, parsed.archetypeName, parsed.archetypeCoordinate, 'codicon-symbol-class'),
            this.createBreadcrumb('position', parsed.family, parsed.positionName, parsed.positionCoordinate, 'codicon-symbol-property')
        ];
    }

    async attachPopupContent(
        breadcrumb: Breadcrumb,
        _parent: HTMLElement
    ): Promise<Disposable | undefined> {
        const coordinateBreadcrumb = breadcrumb as EpiLogosCoordinateBreadcrumb;
        if (!coordinateBreadcrumb.reducedCoordinate) {
            return undefined;
        }

        await Promise.resolve(this.commands.executeCommand(OMNIPANEL_INTENT_DISPATCH, {
            coordinate: coordinateBreadcrumb.reducedCoordinate,
            source: 'epi-logos.coordinate-breadcrumbs'
        })).catch(() => undefined);

        return undefined;
    }

    protected createBreadcrumb(
        segment: CoordinateBreadcrumbSegment,
        family: string,
        label: string,
        reducedCoordinate: string,
        iconClass: string
    ): EpiLogosCoordinateBreadcrumb {
        return Object.freeze({
            id: `epi.coord.${family}.${segment}`,
            type: this.type,
            label,
            longLabel: `${label} (${reducedCoordinate})`,
            iconClass,
            segment,
            reducedCoordinate
        });
    }
}
